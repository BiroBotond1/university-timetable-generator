import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

const EMPTY_RESULT = JSON.stringify({
  classCatalogs: {},
  teacherCatalogs: {},
  locationCatalogs: {},
  active: true,
})

// Stands in for the C++ engine on :50051. Calls park until the test releases
// them, so ordering can be asserted without sleeps.
export const startStubEngine = async (port = 50051) => {
  const definition = protoLoader.loadSync('./../../generator.proto', {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
  })
  const proto = grpc.loadPackageDefinition(definition).generator as any

  let served = 0
  let concurrent = 0
  let maxConcurrent = 0
  let parked: Array<() => void> = []
  let callOrder: string[] = []
  let waiters: Array<{ count: number, resolve: () => void }> = []

  const notifyWaiters = () => {
    waiters = waiters.filter((waiter) => {
      if (served >= waiter.count) {
        waiter.resolve()
        return false
      }
      return true
    })
  }

  const server = new grpc.Server()

  server.addService(proto.Generator.service, {
    Generate: (call, callback) => {
      try {
        callOrder.push(JSON.parse(call.request.input).teachers?.[0]?.name ?? '')
      } catch {
        callOrder.push('')
      }

      served += 1
      concurrent += 1
      maxConcurrent = Math.max(maxConcurrent, concurrent)

      parked.push(() => {
        concurrent -= 1
        callback(null, { output: EMPTY_RESULT })
      })

      notifyWaiters()
    },
  })

  await new Promise<void>((resolve, reject) => {
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
      (err) => err ? reject(err) : resolve())
  })

  return {
    get served() { return served },
    get maxConcurrent() { return maxConcurrent },
    get callOrder() { return [...callOrder] },

    waitForCalls: (count: number) => new Promise<void>((resolve) => {
      if (served >= count) return resolve()
      waiters.push({ count, resolve })
    }),

    releaseAll: () => {
      const toRelease = parked
      parked = []
      toRelease.forEach(release => release())
    },

    reset: () => {
      served = 0
      concurrent = 0
      maxConcurrent = 0
      parked = []
      waiters = []
      callOrder = []
    },

    stop: () => server.forceShutdown(),
  }
}
