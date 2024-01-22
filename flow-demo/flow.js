const cfg = require('./config')
const {App, Flow} = require('@airiot/sdk-nodejs/flow')
const log = require('@airiot/sdk-nodejs/log')

class TestFlow extends Flow {
  handler(app, meta, req, cb) {
    log.getLogger(meta).debug('执行请求: 参数=%j', req)
    cb(null, {"ret": 1})
  }

  stop(app, meta, cb) {
    log.getLogger(meta).debug('停止处理')
    cb(null)
  }
}

// 实例化并开始运行
new App(cfg).start(new TestFlow())