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
    this.__worker.addEventListener('error', error => {
      this.__errorHandlers.forEach(handler => handler.fn(error))
    })
  }

  work ({command, message, transferrable}) {
    return new Promise((resolve, reject) => {
      const id = uuid.v4()
      const clear = () => {
        this.__messageHandlers = this.__messageHandlers.filter(h => h.id !== id)
        this.__errorHandlers = this.__errorHandlers.filter(h => h.id !== id)
      }

      this.__messageHandlers.push({
        fn: event => {
          if (event.id === id) {
            clear()
            resolve(event.message)
          }
        },
        id
      })

      this.__errorHandlers.push({
        fn: error => {
          if (error.id === id) {
            clear()
            reject(error)
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

    self.addEventListener('message', function (event) {
      const {command, id, message} = event.data
      Promise
        .resolve(functions[command].call(null, cache, message))
        .then(results => {
          self.postMessage({
            command,
            id,
            message: results
          })
        })
        .catch(e => {
          e.id = id
          throw e
        })
    })
  }
}
