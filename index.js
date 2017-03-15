import uuid from 'uuid'
import workify from 'webworkify'

export default class WebWorkerPromiseInterface {
  constructor (handler) {
    this.__errorHandlers = []
    this.__messageHandlers = []
    this.__worker = workify(handler)
    this.__worker.addEventListener('message', event => {
      this.__messageHandlers.forEach(handler => handler.fn(event.data))
    })
  }

  work ({command, message, transferrable}) {
    return new Promise((resolve, reject) => {
      const id = uuid.v4()
      const clear = () => {
        this.__messageHandlers = this.__messageHandlers.filter(h => h.id !== id)
      }

      this.__messageHandlers.push({
        fn: event => {
          if (event.id === id) {
            clear()
            if (event.error) reject(event.error)
            else resolve(event.message)
          }
        },
        id
      })

      this.__worker.postMessage({command, id, message}, transferrable)
    })
  }
}

export function createHandler (functions) {
  return function handler (self) {
    const cache = {}

    self.addEventListener('message', async function (event) {
      const {command, id, message} = event.data

      try {
        const results = await functions[command].call(null, cache, message)
        self.postMessage({
          command,
          id,
          message: results
        })
      } catch (error) {
        // nonstandard but will just be undefined on browsers that don't support
        const { fileName, lineNumber } = error
        self.postMessage({
          command,
          id,
          error: {
            filename: fileName,
            lineno: lineNumber,
            message: error.message
          }
        })
      }
    })
  }
}
