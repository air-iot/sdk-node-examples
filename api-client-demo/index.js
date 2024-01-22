let ApiClient = require("@airiot/sdk-nodejs/api")
const log = require('@airiot/sdk-nodejs/log')

const cfg = {
  endpoint: "http://localhost:31000",
  type: 'tenant', // tenant,project
  // projectId: '625f6dbf5433487131f09ff8',
  ak: "ak",         //您的AccessKey
  sk: "sk"     //您的SecretAccessKey
}

let cli = new ApiClient(cfg)
cli.queryTableSchema(cfg.projectId, {filter:{id:{'$in':['设备表','nodedriverdemo']}}})
  .then(ret => {
    log.getLogger().debug('返回值: %j', ret)
  })
  .catch(err => {
    log.getLogger().detail(err).error('请求错误')
  })