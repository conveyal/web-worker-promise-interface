import {createHandler} from './index'

module.exports = createHandler({
  task (ctx, message, log) {
    log('logging from inside the handler', {message: message})
    return 'booger'
  }
})
