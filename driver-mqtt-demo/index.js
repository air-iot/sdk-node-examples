let schedule = require('node-schedule')
const fs = require('fs');
const mqtt = require('mqtt')
const vm = require('vm')
const cfg = require('./config')
const {App, Driver} = require('@airiot/sdk-nodejs/driver')
let ApiClient = require("@airiot/sdk-nodejs/api")

class MQTTDriverDemo extends Driver {
  init() {
    console.log('init')
    this.apiClient = new ApiClient(cfg.api)
  }

  schema(app, cb) {
    let loc = __dirname + '/schema.js'
    console.log('schema', loc)
    fs.readFile(loc, 'utf8', function (err, data) {
      cb(err, data)
    })
  }

  start = (app, config, cb) => {
    console.log('启动', config)
    this.app = app
    this.clear()
    let err = this.parseData(config)
    if (err) {
      return cb(err)
    }
    cb()
  }

  run(app, command, cb) {
    console.log('运行指令', command)
    this.apiClient.getTableData(cfg.project, command.table, command.id)
      .then(res => {
        console.log('查询资产数据', res)
      }).catch(err => {
      console.error('查询资产数据错误', err)
    })

    let {topic, payload} = this.cmdHandler(command.table, command.id, command.command)
    this.client.publish(topic, payload, (err, packet) => {
      if (err) {
        console.error('发送指令错误', err)
        return cb(err)
      }
      return cb(null, packet)
    })
  }

  batchRun(app, command, cb) {
    console.log('批量运行指令', command)
    cb(null)
  }

  writeTag(app, command, cb) {
    console.log('写数据点', command)
    cb(null)
  }

  debug(app, debugConfig, cb) {
    app.log.debug('运行测试', debugConfig)
    cb(null, debugConfig)
  }

  httpProxy(app, type, header, data, cb) {
    let req = JSON.parse(Buffer.from(data).toString())
    console.log('httpProxy', type, header, req)
    if (cb) {
      cb(null, req)
    }
  }

  stop(app, cb) {
    app.log.debug('驱动停止处理')
    this.clear()
    cb(null)
  }

  parseData(config) {
    if (!config.tables || config.tables.length === 0) {
      return new Error('表为空')
    }
    let ops = {}
    let device = config.device
    if (!device || !device.settings || !device.settings.server) {
      return new Error('服务器地址为空')
    }
    if (!device.settings.topic) {
      return new Error('订阅主题为空')
    }
    if (!device.settings.parseScript) {
      return new Error('解析脚本为空')
    }
    if (device.settings.username && device.settings.password) {
      ops["username"] = device.settings.username.trim()
      ops["password"] = device.settings.password.trim()
    }
    if (device.settings.clientId) {
      ops["clientId"] = device.settings.clientId.trim()
    }
    this.client = mqtt.connect(device.settings.server, ops)
    const parseScript = {handler: undefined}
    new vm.Script(device.settings.parseScript).runInNewContext(parseScript)
    if (device.settings.parseScript) {
      const commandScript = {handler: undefined}
      new vm.Script(device.settings.commandScript).runInNewContext(commandScript)
      this.cmdHandler = commandScript.handler
    }
    config.tables.forEach(ts => {
      this.tables[ts.id] = {}
      let tagMap = {}
      if (ts.device && ts.device.tags) {
        ts.device.tags.forEach(tag => {
          tagMap[tag.id] = tag
        })
      }
      if (ts.devices) {
        ts.devices.forEach(dev => {
          let devTagMap = {...tagMap}
          if (dev.device && dev.device.tags) {
            dev.device.tags.forEach(tag => {
              devTagMap[tag.id] = tag
            })
          }
          this.tables[ts.id][dev.id] = devTagMap
        })
      }
    })
    this.client.on('connect', () => {
      console.log('MQTT Server 已经连接', JSON.stringify(device.settings))
      this.client.subscribe(device.settings.topic)
    })
    this.client.on('message', (topic, message) => {
      console.log('onmessage topic', topic)
      console.log('onmessage message', message)
      let arr = parseScript.handler(topic, message)
      if (arr) {
        arr.forEach(ele => {
          let tableObj = this.tables[ele.table]
          if (!tableObj) {
            console.log(`未找到表 ${ele.table} 配置`)
            return
          }
          let devObj = tableObj[ele.id]
          if (!devObj) {
            console.log(`未找到表 ${ele.table} 资产 ${ele.id} 配置`)
            return
          }
          if (!ele.fields) {
            console.log(`表 ${ele.table} 资产 ${ele.id} 数据为空`)
            return
          }
          let tags = []
          for (const key in ele.fields) {
            let kt = devObj[key]
            if (!kt) {
              console.log(`表 ${ele.table} 资产 ${ele.id} 数据 ${key} 未找到`)
              continue
            }
            tags.push({tag: kt, value: ele.fields[key]})
          }
          if (tags.length === 0) {
            console.log(`表 ${ele.table} 资产 ${ele.id} 数据为空`)
            return
          }
          const p = {table: ele.table, id: ele.id, fields: tags, time: ele.time}
          console.log('测试数据', p)
          this.app.writePoints(p)
            .catch(err => {
              console.error(`保存数据错误,`, err)
            })
        })
      }
    })
    this.client.on('error', err => {
      console.error(`MQTT Server 错误:`, err)
    })
    this.client.on('log', msg => {
      console.log('MQTT Server log', msg)
    })
    this.client.on('close', (reason) => {
      console.warn(`MQTT Server 已断开`)
      if (reason) {
        console.warn(reason.message)
      }
    })
    return null
  }

  clear() {
    this.tables = {}
    if (this.client) {
      this.client.end(true)
    }
  }
}

// 实例化并开始运行
new App(cfg).start(new MQTTDriverDemo())


