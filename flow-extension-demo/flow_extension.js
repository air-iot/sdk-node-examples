const cfg = require('./config')
const {App, Extension} = require('@airiot/sdk-nodejs/flow_extension')
const fs = require("fs");

class TestFlow extends Extension {

  init() {
    console.log('init')
  }

  schema(app, cb) {
    let loc = __dirname + '/schema.js'
    console.log('schema', loc)
    fs.readFile(loc, 'utf8', function (err, data) {
      cb(err, data)
    })
  }

  run(app, req, cb) {
    console.log('执行请求', req)
    let {num1, num2} = req
    cb(null, {"num1": num1 + num2})
  }

  stop(app, cb) {
    app.log.debug('流程停止处理')
    cb(null)
  }
}

// 实例化并开始运行
new App(cfg).start(new TestFlow())