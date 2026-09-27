import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

const EMPTY_RESULT = JSON.stringify({
  classCatalogs: {},
  teacherCatalogs: {},
  locationCatalogs: {},
  active: true,
})

/**
 * A stand-in for the C++ engine, on the fixed port GenerationService dials.
 *
 * Calls do not complete on their own: each one parks until the test releases
 * it. That makes "A is running while B waits" an exact observation rather than
 * a race against a sleep, which is what made the first version of these tests
 * flaky.
 */
export const startStubEngine = async (port = 50051) => {
  const definition = protoLoader.loadSync('./../../generator.proto', {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
  })
  const proto = grpc.loadPackageDefinition(definition).generator as any

  let served = 0
  let concurrent = 0
  let maxConcurrent = 0
  let parked: Array<() => void> = []
  // Identifies whose payload arrived, so queue order can be asserted exactly.
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
    /** Total calls that have reached the engine since the last reset. */
    get served() { return served },
    /** The highest number of calls the engine ever had open at once. */
    get maxConcurrent() { return maxConcurrent },
    /** The first teacher name in each payload, in arrival order. */
    get callOrder() { return [...callOrder] },

    /** Resolves once `count` calls have arrived. */
    waitForCalls: (count: number) => new Promise<void>((resolve) => {
      if (served >= count) return resolve()
      waiters.push({ count, resolve })
    }),

    /** Lets every parked call finish. */
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
