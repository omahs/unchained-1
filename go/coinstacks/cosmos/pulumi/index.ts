import { readFileSync } from 'fs'
import { deployCoinstack } from '../../../../pulumi/src/coinstack'
import { Outputs, ServiceArgs, getConfig } from '../../../../pulumi/src'

//https://www.pulumi.com/docs/intro/languages/javascript/#entrypoint
export = async (): Promise<Outputs> => {
  const appName = 'unchained'
  const coinstack = 'cosmos'
  const sampleEnv = readFileSync('../../../cmd/cosmos/sample.env')
  const { kubeconfig, config, namespace } = await getConfig()
  const coinServiceInput: ServiceArgs[] = [
    {
      coinServiceName: 'daemon',
      dataDir: '/root',
      ports: {
        'daemon-api': { port: 1317, pathPrefix: '/lcd', stripPathPrefix: true },
        'daemon-rpc': { port: 26657, pathPrefix: '/rpc', stripPathPrefix: true },
      },
    },
  ]

  return await deployCoinstack(kubeconfig, config, namespace, appName, coinstack, coinServiceInput, sampleEnv, 'go')
}