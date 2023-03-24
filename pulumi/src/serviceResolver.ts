import * as k8s from '@pulumi/kubernetes'
import { readFileSync } from 'fs'
import { Service, ServiceConfig } from '.'
import { PvcResolver } from './pvcResolver'

interface Port {
  port: number
  ingressRoute?: boolean
  pathPrefix?: string
  stripPathPrefix?: boolean
}

export interface ServiceArgs {
  serviceName: string
  asset: string
  config: ServiceConfig
  ports: Record<string, Port>
  command?: Array<string>
  args?: Array<string>
  env?: Record<string, string>
  dataDir?: string
  configMapData?: Record<string, string>
  volumeMounts?: Array<k8s.types.input.core.v1.VolumeMount>
  readinessProbe?: k8s.types.input.core.v1.Probe
  livenessProbe?: k8s.types.input.core.v1.Probe,
  pvcResolver: PvcResolver
}

export async function createService(args: ServiceArgs): Promise<Service> {
  const name = `${args.asset}-${args.config.name}`
  const ports = Object.entries(args.ports).map(([name, port]) => ({ name, ...port }))
  const env = Object.entries(args.env ?? []).map(([name, value]) => ({ name, value }))

  const init = (() => {
    try {
      return readFileSync(`../${args.config.name}/init.sh`).toString()
    } catch (err) {
      return ''
    }
  })()

  const liveness = (() => {
    try {
      return readFileSync(`../${args.config.name}/liveness.sh`).toString()
    } catch (err) {
      return ''
    }
  })()

  const readiness = (() => {
    try {
      return readFileSync(`../${args.config.name}/readiness.sh`).toString()
    } catch (err) {
      return ''
    }
  })()

  const configMapData = {
    ...(Boolean(init) && { [`${args.config.name}-init.sh`]: init }),
    ...(Boolean(liveness) && { [`${args.config.name}-liveness.sh`]: liveness }),
    ...(Boolean(readiness) && { [`${args.config.name}-readiness.sh`]: readiness }),
    ...(args.configMapData ?? {}),
  }

  const containers: Array<k8s.types.input.core.v1.Container> = []

  const serviceContainer: k8s.types.input.core.v1.Container = {
    name,
    image: args.config.image,
    command: init && !args.command ? ['/init.sh'] : args.command,
    args: args.args,
    env,
    resources: {
      limits: {
        ...(args.config.cpuLimit && { cpu: args.config.cpuLimit }),
        ...(args.config.memoryLimit && { memory: args.config.memoryLimit }),
      },
      requests: {
        ...(args.config.cpuRequest && { cpu: args.config.cpuRequest }),
        ...(args.config.memoryRequest && { memory: args.config.memoryRequest }),
      },
    },
    ports: ports.map(({ port: containerPort, name }) => ({ containerPort, name })),
    securityContext: { runAsUser: 0 },
    volumeMounts: [
      {
        name: `data-${args.config.name}`,
        mountPath: args.dataDir ?? '/data',
      },
      ...(init
        ? [
            {
              name: 'config-map',
              mountPath: '/init.sh',
              subPath: `${args.config.name}-init.sh`,
            },
          ]
        : []),
      ...(args.volumeMounts ?? []),
    ],
  }

  containers.push(serviceContainer)

  if (readiness || liveness) {
    const monitorContainer: k8s.types.input.core.v1.Container = {
      name: `${name}-monitor`,
      image: 'shapeshiftdao/unchained-probe:1.0.0',
      ...(readiness && {
        readinessProbe: {
          exec: {
            command: ['/readiness.sh'],
          },
          initialDelaySeconds: 30,
          periodSeconds: 10,
          ...args.readinessProbe,
        },
      }),
      ...(liveness && {
        livenessProbe: {
          exec: {
            command: ['/liveness.sh'],
          },
          initialDelaySeconds: 30,
          periodSeconds: 10,
          ...args.livenessProbe,
        },
      }),
      volumeMounts: [
        ...(readiness
          ? [
              {
                name: 'config-map',
                mountPath: '/readiness.sh',
                subPath: `${args.config.name}-readiness.sh`,
              },
            ]
          : []),
        ...(liveness
          ? [
              {
                name: 'config-map',
                mountPath: '/liveness.sh',
                subPath: `${args.config.name}-liveness.sh`,
              },
            ]
          : []),
      ],
    }

    containers.push(monitorContainer)
  }

  const volumeClaimTemplates = await args.pvcResolver.getVolumeClaimTemplates(args.config.name, args.config.storageSize)

  return {
    serviceName: args.serviceName,
    configMapData,
    containers,
    ports,
    volumeClaimTemplates,
  }
}