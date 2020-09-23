const mysql = require('mysql')
const config = require('./config')
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

async function addWork(work_name, work_desc) {
    let res = []
    try {
        res = await query(
            "insert into work(work_name,work_desc) values(?,?);",
            [work_name, work_desc]
        )
    } catch (err) {
        return false
    }
    if (res.length == 0) {
        // 已有此作业
        return false
    }
    return true
}

exports.login = login
exports.addWork = addWork

async function test() {

}
test()