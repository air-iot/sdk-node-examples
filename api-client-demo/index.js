let ApiClient = require("@airiot/sdk-nodejs/api")

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
    console.log('返回值', ret)
  })
  .catch(err => {
    console.error('错误', err)
  })