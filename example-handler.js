import {createHandler} from './index'

module.exports = createHandler({
  task (ctx, message) {
    console.log(ctx, message)
    return 'booger'
  }
})
