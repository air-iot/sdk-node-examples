const cfg = require('./config')
const {App, Flow} = require('@airiot/sdk-nodejs/flow')

class TestFlow extends Flow {

  init() {
    console.log('init')
  }

  handler(app, req, cb) {
    console.log('执行请求', req)
    cb(null, {"ret": 1})
  }
  stop(app, cb) {
    app.log.debug('流程停止处理')
    cb(null)
  }
}

// 实例化并开始运行
new App(cfg).start(new TestFlow())