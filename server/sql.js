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

async function isAdminByUsr(usr) {
    let res = await query(
        "select identify from login where usr=?;",
        [usr]
    )
    return res.length == 0 ? false : res[0]["identify"] == 0
}
async function addWork(work_code, work_name, work_belong, work_desc, work_deadline, work_class) {
    let no = (await query("select count(*) as num from work where work_class=?", [work_class]))[0]["num"] - 0 + 1;
    let res = []
    try {
        res = await query(
            "insert into work(work_code,work_name,work_belong,work_desc,work_deadline,work_class,no) values(?,?,?,?,?,?,?);",
            [work_code, work_name, work_belong, work_desc, work_deadline, work_class, no]
        )
        await query("insert into score(work_code) values(?)", [work_code])
    } catch (err) { console.log(err); return false }
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
    await query("delete from score where work_code=?", [work_code])
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
    return res.length == 0 ? null : Array.from(res)[0]
}

async function resetPassword(usr, newPwd) {
    let res = await query(
        "update login set pwd=? where usr=?;",
        [newPwd, usr]
    )
    return res["message"]
}

async function getClassList(usr) {
    let res = await query(
        "select class_list from login where usr=?;",
        [usr]
    )
    res = Array.from(res)[0]["class_list"]
    return res
}

async function getAssignmentsListByClass(work_class) {
    let res = await query(
        "select work_code,work_name from work where work_class=?;",
        [work_class]
    )
    res = Array.from(res)
    return res
}


async function usrInfo(usr) {
    let res = await query(
        "select * from login where usr=?",
        [usr]
    )
    res = Array.from(res)[0]
    // 处理 class_list 列表
    if (res["class_list"]) {
        res["class_list"] = (JSON.parse(res["class_list"]))
    }
    return res
}

async function generateFileName(usr, work_code) {
    let format = []
    let info = await usrInfo(usr);
    format.push(info["usr"])
    format.push(info["name"])
    info = await getWorkDetailsByWorkCode(work_code)
    format.push(info["work_class"])
    format.push(info["no"])
    return (format.join("_"))
}

exports.query = query
exports.login = login
exports.addWork = addWork
exports.delWork = delWork
exports.haveWork = haveWork
exports.canDownload = canDownload
exports.getWorkListByWorkBelong = getWorkListByWorkBelong
exports.getWorkDetailsByWorkCode = getWorkDetailsByWorkCode
exports.isAdminByUsr = isAdminByUsr
exports.resetPassword = resetPassword
exports.getClassList = getClassList
exports.getAssignmentsListByClass = getAssignmentsListByClass
exports.usrInfo = usrInfo
exports.generateFileName = generateFileName