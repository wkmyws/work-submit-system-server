const mysql = require('mysql')
const config = require('./config')
const fs = require('fs')
const path = require('path')
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
    } catch (err) {
        return false
    }
    if (res.length == 0) {
        // 已有此作业
        return false
    }

    // 生成对应文件夹
    fs.mkdirSync(path.resolve('./work', work_code))

    return true
}

async function delWork(){
    return true
}


exports.login = login
exports.addWork = addWork

async function test() {

}
test()