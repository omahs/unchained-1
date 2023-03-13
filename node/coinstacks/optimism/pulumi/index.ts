import { parse } from 'dotenv'
import { readFileSync } from 'fs'
import * as k8s from '@pulumi/kubernetes'
import { createService, deployApi, deployStatefulService, getConfig, Service } from '../../../../pulumi'
import { api } from '../../../pulumi'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Outputs = Record<string, any>

//https://www.pulumi.com/docs/intro/languages/javascript/#entrypoint
export = async (): Promise<Outputs> => {
  const name = 'unchained'
  const coinstack = 'optimism'

  const { kubeconfig, config, namespace } = await getConfig(coinstack)

  //const asset = config.network !== 'mainnet' ? `${coinstack}-${config.network}` : coinstack
  const asset = `${coinstack}-bedrock`
  const outputs: Outputs = {}
  const provider = new k8s.Provider('kube-provider', { kubeconfig })

  const missingKeys: Array<string> = []
  const stringData = Object.keys(parse(readFileSync('../sample.env'))).reduce((prev, key) => {
    const value = process.env[key]

    if (!value) {
      missingKeys.push(key)
      return prev
    }

    return { ...prev, [key]: value }
  }, {})

  if (missingKeys.length) {
    throw new Error(`Missing the following required environment variables: ${missingKeys.join(', ')}`)
  }

  new k8s.core.v1.Secret(asset, { metadata: { name: asset, namespace }, stringData }, { provider })

  const baseImageName = 'shapeshiftdao/unchained-base:latest'

  await deployApi({
    app: name,
    asset,
    baseImageName,
    buildAndPushImageArgs: { context: '../api' },
    config,
    container: { command: ['node', `dist/${coinstack}/api/src/app.js`] },
    getHash: api.getHash,
    namespace,
    provider,
    secretEnvs: api.secretEnvs,
  })

  if (config.statefulService) {
    const services = config.statefulService.services.reduce<Record<string, Service>>((prev, service) => {
      if (service.name === 'daemon') {
        prev[service.name] = createService({
          asset,
          config: service,
          env: {
            NETWORK: config.network,
            SNAPSHOT: 'https://storage.googleapis.com/oplabs-goerli-data/goerli-bedrock.tar',
          },
          ports: {
            'daemon-rpc': { port: 8545 },
            'daemon-ws': { port: 8546, pathPrefix: '/websocket', stripPathPrefix: true },
            'daemon-auth': { port: 8551, ingressRoute: false },
          },
          configMapData: { 'jwt.hex': readFileSync('../daemon/jwt.hex').toString() },
          volumeMounts: [{ name: 'config-map', mountPath: '/jwt.hex', subPath: 'jwt.hex' }],
        })
      }

      if (service.name === 'op-node') {
        prev[service.name] = createService({
          asset,
          config: service,
          env: {
            NETWORK: config.network,
            L1_RPC_ENDPOINT: 'https://eth-goerli.g.alchemy.com/v2/AIYxhjifvuCKmIgcmpr4oTZybTtUNiv4',
          },
          ports: { 'op-node-rpc': { port: 9545 } },
          volumeMounts: [{ name: 'config-map', mountPath: '/jwt.hex', subPath: 'jwt.hex' }],
        })
      }

      if (service.name === 'l2geth') {
        prev[service.name] = createService({
          asset,
          config: service,
          env: {
            NETWORK: config.network,
            SNAPSHOT: 'https://storage.googleapis.com/oplabs-goerli-data/goerli-legacy-archival.tar',
          },
          ports: {
            'l2geth-rpc': { port: 7545 },
            'l2geth-ws': { port: 7546, pathPrefix: '/websocket', stripPathPrefix: true },
          },
        })
      }

      if (service.name === 'indexer') {
        prev[service.name] = createService({
          asset,
          config: service,
          command: [
            '/bin/blockbook',
            '-blockchaincfg=/config.json',
            '-datadir=/data',
            '-sync',
            '-public=:8001',
            '-enablesubnewtx',
            '-logtostderr',
            '-debug',
          ],
          ports: { public: { port: 8001 } },
          configMapData: { 'indexer-config.json': readFileSync('../indexer/config.json').toString() },
          volumeMounts: [{ name: 'config-map', mountPath: '/config.json', subPath: 'indexer-config.json' }],
          readinessProbe: { initialDelaySeconds: 20, periodSeconds: 5, failureThreshold: 12 },
          livenessProbe: { timeoutSeconds: 10, initialDelaySeconds: 60, periodSeconds: 15, failureThreshold: 4 },
        })
      }

      return prev
    }, {})

    await deployStatefulService(name, asset, provider, namespace, config, services)
  }

  return outputs
}
