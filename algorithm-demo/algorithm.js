const cfg = require('./config')
const {App, Algorithm} = require('@airiot/sdk-nodejs/algorithm')
const fs = require("fs");

class TestAlgorithm extends Algorithm {

  init() {
    console.log('init')
  }

  schema(app, cb) {
    fs.readFile(__dirname + '/schema.js', 'utf8', function (err, data) {
      cb(err, data)
    })
  }

  run(app, req, cb) {
    console.log('执行请求', req)
    let input = req['input']
    switch (req['function']) {
      case 'add':
        return cb(null, {num1: input['num1'] + input['num2']})
      case 'abs':
        return cb(null, {res: Math.abs(input['num1'])})
      default:
        return cb('未知函数')
    }
  }

  stop(app, cb) {
    app.log.debug('算法停止处理')
    cb(null)
  }
}

// 实例化并开始运行
new App(cfg).start(new TestAlgorithm())