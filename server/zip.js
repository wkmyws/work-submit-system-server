// 压缩打包文件
const zipper = require("zip-local")
const path = require('path')
const base62x = require('base62x')
const fs = require('fs')

function zipAndDownload(work_code, expire = 10 * 60 * 1000) {
    // expire default=10min
    // 返回一个闭包，执行后返回下载链接，并启动定时删除功能
    let tmpFile = base62x.encode(JSON.stringify({
        work_code: work_code,
        time: new Date().getTime(),
    }))
    tmpFile += ".zip"
    let url = path.resolve('public', 'tmp', tmpFile)
    zipper.sync
        .zip(path.resolve('work', work_code))
        .compress()
        .save(url)
    return () => {
        relateUrl = url.replace(/^.+public/, "")
        setTimeout(() => {
            fs.unlinkSync(url)
        }, expire)
        return relateUrl
    }
}

exports.zipAndDownload = zipAndDownload
