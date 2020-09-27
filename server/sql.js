const mysql = require('mysql')
const config = require('./config')
const fs = require('fs')
const path = require('path')
const workCode = require('./work_code')
const fsm = require('./fs_more')
const connection = mysql.createConnection(config.sql)
connection.connect()

async function query(sql, list) {
    return new Promise((resolve, reject) => {
        connection.query(sql, list, (err, res) => {
            if (err) return reject(err)
            return resolve(JSON.parse(JSON.stringify(res)))
        })
    })
}

async function login(usr, pwd) {
    let res = await query(
        "select * from login where usr=? and pwd=? limit 1;",
        [usr, pwd]
    )
    if (res.length == 0) {
        // have no match
        return false
    } else {
        return res[0]
    }

}

async function addWork(work_code, work_name, work_belong, work_desc) {
    let res = []
    try {
        res = await query(
            "insert into work(work_code,work_name,work_belong,work_desc) values(?,?,?,?);",
            [work_code, work_name, work_belong, work_desc]
        )
    } catch (err) { return false }
    if (res.length == 0) { // 已有此作业
        return false
    }
    // 生成对应文件夹
    fs.mkdirSync(path.resolve('./work', work_code))
    return true
}

async function haveWork(work_code) {
    let res = await query("select * from work where work_code=?;", [work_code])
    return res.length != 0
}

async function delWork(work_code) {
    if ((await haveWork(work_code)) == false) return false
    let res = await query("delete from work where work_code=?;", [work_code])
    res = fsm.rm_rf(path.resolve('work/', work_code))
    return res
}

async function canDownload(work_code, work_belong) {
    let res = await query("select * from work where work_code=? and work_belong=?;", [work_code, work_belong])
    return res.length != 0
}

async function getWorkListByWorkBelong(work_belong) {
    let res = await query("select work_code,work_name from work where work_belong=?", [work_belong])
    return res
}

async function getWorkDetailsByWorkCode(work_code) {
    let res = await query("select * from work where work_code=? limit 1;", [work_code])
    return res.length == 0 ? null : res[0]
}

exports.login = login
exports.addWork = addWork
exports.delWork = delWork
exports.haveWork = haveWork
exports.canDownload = canDownload
exports.getWorkListByWorkBelong = getWorkListByWorkBelong
exports.getWorkDetailsByWorkCode = getWorkDetailsByWorkCode

async function test() {

}
test()