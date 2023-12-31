const cfg = require('./config')
const {App, Extension} = require('@airiot/sdk-nodejs/flow_extension')
const log = require('@airiot/sdk-nodejs/log')
// const fs = require("fs");
const schema = require('./schema')
class TestFlow extends Extension {

  init() {
    console.log('init')
  }

  schema(app, cb) {
    // let loc = __dirname + '/schema.js'
    // console.log('schema', loc)
    // fs.readFile(loc, 'utf8', function (err, data) {
    //   cb(err, data)
    // })
    cb(null,JSON.stringify(schema))
  }

  run(app, req, cb) {
    log.debug('执行请求,%o', req)
    let {num1, num2} = req
    cb(null, {"num1": num1 + num2})
  }

  stop(app, cb) {
    log.debug('流程停止处理')
    cb(null)
  }
}

// 实例化并开始运行
new App(cfg).start(new TestFlow())