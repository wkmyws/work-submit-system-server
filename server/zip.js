// 压缩打包文件
//const zipper = require("zip-local")
const path = require('path')
const base62x = require('base62x')
const fs = require('fs')
const archiver = require('archiver')
const listFile = require('./fs_more').listFile
const sql = require('./sql')

async function zipAndDownload(work_code, expire = 10 * 60 * 1000) {
    // expire default=10min
    // 返回一个闭包，执行后返回下载链接，并启动定时删除功能
    let tmpFile = base62x.encode(JSON.stringify({
        time: new Date().getTime(),
    }))
    const work_detail = await sql.getWorkDetailsByWorkCode(work_code)
    tmpFile = [work_detail["work_class"], work_detail["work_name"], work_detail["no"]].join("_")
    tmpFile += ".zip"
    let url = path.resolve(__dirname, '../public', 'tmp', tmpFile)
    let list = listFile(path.resolve(__dirname, '../work', work_code))
    // 只下载pdf
    list = list.filter((v) => path.extname(v).toLowerCase() == ".pdf")
    await pkg(list, url)
    // zipper.sync
    //     .zip(path.resolve('work', work_code))
    //     .compress()
    //     .save(url)

    return () => {
        relateUrl = url.replace(/^.+public/, "")
        // 定时删除文件
        // setTimeout(() => {
        //     fs.unlinkSync(url)
        // }, expire)
        return relateUrl
    }
}

async function pkg(fileList, outputURL) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputURL)
        const archive = archiver('zip')
        archive.on('error', (err) => {
            throw err
        })
        archive.on('end', () => {
            return resolve()
        })
        archive.pipe(output)
        fileList.forEach((v) => {
            archive.file(v, { name: path.basename(v) })
        })
        archive.finalize()
    })
}


exports.zipAndDownload = zipAndDownload
