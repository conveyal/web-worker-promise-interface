import WebWorkerPromiseInterface from './index'
import exampleHandler from './example-handler'

const wwpi = new WebWorkerPromiseInterface(exampleHandler)

wwpi.work({
  command: 'task',
  message: 'disgusting'
}).then(result => {
  console.log('result', result)
})
