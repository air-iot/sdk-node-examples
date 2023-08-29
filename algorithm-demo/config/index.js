let rc = require('rc')

// 因为 rc 是从 process.cwd() 向上查找 .appnamerc 文件的，我们在根目录 config 文件夹里面的是找不到的，要改变工作路径到当前，再改回去
var originCwd = process.cwd()
process.chdir(__dirname)
var conf = rc('dev', {
  flow: {
    id: "test",
    name: "测试算法"
  }
})

process.chdir(originCwd)

module.exports = conf
