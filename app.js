const Koa = require('koa');
const config = require('./server/config')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser');
const koaBody = require('koa-body');
const jwt = require('koa-jwt')
const send = require('koa-send')
const Token = require('./server/token')
const sql = require('./server/sql')
const cors = require('koa2-cors');
const workCode = require('./server/work_code')
const fs = require('fs')
const path = require('path')
const myZip = require('./server/zip');
const fsm = require('./server/fs_more');
const app = new Koa()
const router = new Router()
const scoreSystem = require('./server/scoreSystem')
const base62x = require('base62x')

router.get('/login', async (ctx, next) => {
    ctx.body = "请使用POST方法"
})

router.post('/login', async (ctx, next) => {
    let usr = ctx.request.body["usr"]
    let pwd = ctx.request.body["pwd"]
    // 处理用户登录
    let usrInfo = await sql.login(usr, pwd)
    if (usrInfo == false) {
        ctx.body = {
            code: 11,
            msg: "用户名密码不匹配"
        }
        return
    }
    let token = Token.set(usrInfo)
    ctx.response.set('myToken', token)
    ctx.body = {
        code: 0,
        msg: "",
        token: token,
        identify: usrInfo["identify"]
    }
})


// 发布作业
router.post('/publish_assignments', async (ctx, next) => {
    if (Token.isAdmin(ctx.myToken) == false) {
        // 不为admin
        return ctx.body = {
            code: 2,
            msg: "权限错误"
        }
    }
    let work_name = ctx.request.body["work_name"]
    let work_desc = ctx.request.body["work_desc"]
    let work_deadline = ctx.request.body["work_deadline"]
    let work_class = ctx.request.body["work_class"]
    if (!work_name) {
        return ctx.body = {
            code: 21,
            msg: "作业名不为空"
        }
    }
    if (!work_class) {
        return ctx.body = {
            code: 25,
            msg: "作业所属班级为空"
        }
    }
    let work_belong = Token.params(ctx.myToken)["usr"]
    // 判断当前用户是否有权限创建属于这个班级的作业
    let class_list = (await sql.usrInfo(work_belong))["class_list"]
    if (class_list.some((v) => v == ctx.request.body["work_class"]) == false) {
        return ctx.body = {
            code: 26,
            token: ctx.myToken
        }
    }
    let work_code = workCode.encode(work_name, work_belong)
    let res = await sql.addWork(work_code, work_name, work_belong, work_desc, work_deadline, work_class)
    if (res == false) {
        return ctx.body = {
            code: 22,
            msg: "作业码生成失败，请稍后重试"
        }
    }
    // 发布作业成功
    return ctx.body = {
        code: 0,
        token: ctx.myToken,
        work_code: work_code
    }
})

// 删除发布的作业
router.post('/delete_assignments', async (ctx, next) => {

    let work_code = ctx.request.body["work_code"]
    if (work_code == null) {
        return ctx.body = {
            code: 23,
            msg: "作业码解析失败"
        }
    }

    let work_code_belong = workCode.decode(work_code)["work_belong"]
    let usr = Token.params(ctx.myToken)["usr"]
    if (work_code_belong != usr) {
        return ctx.body = {
            code: 2,
            msg: "只有此作业发布者才能删除作业"
        }
    }
    if (await sql.delWork(work_code) == true) {
        return ctx.body = {
            code: 0,
            token: ctx.myToken
        }
    } else {
        return ctx.body = {
            code: 3,
            msg: "不存在此作业码（未创建或已被删除）",
            token: ctx.myToken
        }
    }
})


// 上传作业
// !!! .docx only
router.post('/submit_work', async (ctx, next) => {
    let work_code = ctx.request.body["work_code"]
    if (work_code == null || (await sql.haveWork(work_code)) == false) {
        return ctx.body = {
            code: 23,
            msg: "作业码不存在",
            token: ctx.myToken
        }
    }
    // 判断提交的作业是否超时
    let work_detail = await sql.getWorkDetailsByWorkCode(work_code)
    let deadline = work_detail["work_deadline"] - 0
    if ((deadline) && (deadline - new Date().getTime() < 0)) {
        return ctx.body = {
            code: 24,
            msg: "作业存在截止时间且上传时间已截止",
            token: ctx.myToken
        }
    }
    let usrInfo = Token.params(ctx.myToken)
    // 判断当前用户是否有权限创建属于这个班级的作业
    let class_list = (await sql.usrInfo(usrInfo.usr))["class_list"]
    if (class_list.some((v) => v == work_detail["work_class"]) == false) {
        return ctx.body = {
            code: 26,
            token: ctx.myToken,
            msg: "当前用户不在此班级，无法操作此作业"
        }
    }
    const file = ctx.request.files.file
    if (!file) return ctx.body = {
        code: 41,
        token: ctx.myToken
    }



    //创建成绩表记录 成绩初始为-2表示学生未提交作业，详见readme/作业分数说明
    await scoreSystem.setScoreByWorkCode(work_code, [{ usr: usrInfo.usr, score: -1 }])
    // 提交后的文件操作
    let reader = fs.createReadStream(file.path)
    let fileExtName = path.extname(file.name).toLowerCase()
    // 判别是否为word
    if (fileExtName != ".docx" && fileExtName != ".doc" && fileExtName != ".pdf") return ctx.body = {
        code: 42,
        token: ctx.myToken,
        fileExtName
    }
    //let filePath = path.join('./', 'work', work_code) + `/${usrInfo["usr"]}`
    // 覆盖提交 会先删除当前用户之前创建的文件夹及子文件
    if (fs.existsSync(path.join('./', 'work', work_code, usrInfo["usr"]))) {
        fsm.rm_rf(path.join('./', 'work', work_code, usrInfo["usr"]))
    }
    // 重新创建用户文件夹
    fs.mkdirSync(path.join('./', 'work', work_code, usrInfo["usr"]))
    // 重命名!!!
    let baseName = (await sql.generateFileName(usrInfo["usr"], work_code))
    let fileName = baseName + fileExtName
    let filePath = path.join('./', 'work', work_code, usrInfo["usr"], fileName)
    let upStream = fs.createWriteStream(filePath)
    reader.pipe(upStream)


    // word 转 pdf
    let pdfURL = await fsm.wordToPdf(filePath)
    if (fs.existsSync(pdfURL) == false) {
        // return ctx.body = {
        //     code: 52,
        //     token: ctx.myToken
        // }
    }
    const delayRun = async () => {
        // 删除原先的word文稿
        //fs.unlinkSync(filePath)
        // 加水印
        //let pdfName = path.resolve(path.dirname(filePath), path.basename(filePath).replace(/\..+$/, ".pdf"))
        let uniqueMark = base62x.encode(path.basename(pdfURL))
        // 生成封面文件
        let fengmianPDF = await fsm.generatePdfCover(
            `./__genPdf${uniqueMark}.pdf`,
            usrInfo["usr"],
            usrInfo["name"],
            work_detail["work_class"],
            work_detail["no"]
        )
        // 合并pdf
        let catPdf = await fsm.catPdf(`./__catPDF${uniqueMark}.pdf`, fengmianPDF, pdfURL)
        // 添加水印
        let watermarkText = `  
            ${usrInfo["usr"]}_${usrInfo["name"]}
            `
        let donPdf = await fsm.pdfAddWatermark(catPdf, watermarkText, `./__finalPdf${uniqueMark}.pdf`)
        fs.unlink(fengmianPDF, () => { })
        fs.unlink(catPdf, () => { })
        fs.renameSync(donPdf, pdfURL)
    }

    //setTimeout(delayRun, 0)
    await delayRun()

    return ctx.body = {
        code: 0,
        msg: "上传成功！",
        token: ctx.myToken
    }


})

// 下载作业
router.post('/download_assignments', async (ctx, next) => {
    let work_code = ctx.request.body["work_code"]
    // mark to del
    if (work_code == "Uo9tRt9hNsvXRMKYEYBfd83ciOBbY8Rcdf0jvfoVvBYjvBsSvBYQ8YmYTsx1oQrx1YPMnlRcSYEY9uUdaYB29tRt9hNtHfRMKYEZ4sC3CuC38nEJOpCJDx1") {
        return ctx.body = {
            code: -1
        }
    }
    if (work_code == null || (await sql.haveWork(work_code)) == false) {
        return ctx.body = {
            code: 23,
            msg: "作业码不存在",
            token: ctx.myToken
        }
    }
    let usrInfo = Token.params(ctx.myToken)
    if ((await sql.canDownload(work_code, usrInfo["identify"])) == false) {
        return ctx.body = {
            code: 2,
            msg: "没有权限获取文件下载地址",
            token: ctx.myToken
        }
    }
    let download_url = (await myZip.zipAndDownload(work_code))()
    return ctx.body = {
        code: 0,
        token: ctx.myToken,
        download_url: download_url
    }
})

// 获取已发布的作业列表
router.post('/get_published_assignments_list', async (ctx, next) => {
    if (Token.isAdmin(ctx.myToken) == false) {
        return ctx.body = {
            code: 2,
            msg: "权限不足",
            token: ctx.myToken,
            work_list: []
        }
    }
    let work_belong = Token.params(ctx.myToken)["usr"]
    let res = await sql.getWorkListByWorkBelong(work_belong)
    ctx.body = {
        code: 0,
        token: ctx.myToken,
        work_list: res
    }
})

// 获取详细作业
router.post('/get_assignments_detail', async (ctx, next) => {
    let work_code = ctx.request.body["work_code"]
    console.log(work_code)
    if (!work_code) return ctx.body = {
        code: 4
    }
    let stuList = []
    if (Token.isAdmin(ctx.myToken)) {
        // 若是老师身份则额外返回学生列表
        stuList = await sql.getStuByWorkCode(work_code)
        let ScoreListAns = await scoreSystem.getScoreByWorkCode(work_code)
        stuList = await Promise.all(stuList.map(async (v) => {
            let tmpAns = await scoreSystem.getScoreDetail(work_code, v, ScoreListAns)
            return {
                usr: v,
                score: tmpAns["score"],
                remark: tmpAns["remark"] || "",
                submitStat: (tmpAns["score"] - 0) >= -1,
            }
        }))
    }
    let res = await sql.getWorkDetailsByWorkCode(work_code)
    ctx.body = {
        code: 0,
        token: ctx.myToken,
        work_name: res["work_name"] || "",
        work_belong: res["work_belong"],
        work_desc: res["work_desc"],
        class: res["work_class"],
        work_deadline: res["work_deadline"],
        stu_list: stuList,
    }
})

// 修改密码
router.post('/reset_password', async (ctx, next) => {
    let newPwd = ctx.request.body["newPwd"]
    let usrInfo = Token.params(ctx.myToken)
    let usr = ctx.request.body["usr"] || usrInfo["usr"]
    let msg = ""
    if (usrInfo["usr"] == usr) {
        // 当前用户修改密码
        msg = await sql.resetPassword(usr, newPwd)
    } else if ((await sql.isAdminByUsr(usr)) == false
        && token.isAdmin(ctx.myToken) == true) {
        // 管理员修改非管理员密码
        msg = await sql.resetPassword(usr, newPwd)
    } else {
        return ctx.body = {
            token: ctx.myToken,
            code: 2,
            msg: "当前权限组无法修改目标用户密码"
        }
    }
    return ctx.body = {
        token: ctx.myToken,
        code: 0,
        msg: msg
    }

})

router.post('/get_class_list', async (ctx, next) => {
    let usrInfo = Token.params(ctx.myToken)
    let class_list = await sql.getClassList(usrInfo["usr"])
    return ctx.body = {
        token: ctx.myToken,
        code: 0,
        class_list: JSON.parse(class_list)
    }
})

router.post('/get_assignments_list_by_class', async (ctx, next) => {
    let work_class = ctx.request.body["class"]
    let usrInfo = await Token.detail(ctx.myToken)
    if (usrInfo["class_list"].some((v) => v == work_class) == false) {
        return ctx.body = {
            token: ctx.myToken,
            code: 26
        }
    }
    let work_list = await sql.getAssignmentsListByClass(work_class)
    return ctx.body = {
        token: ctx.myToken,
        code: 0,
        work_list: work_list
    }
})

router.post('/get_guy_info', async (ctx, next) => {
    let usrInfo = await Token.detail(ctx.myToken)
    delete (usrInfo["pwd"])
    let target = ctx.request.body["usr"]
    if (usrInfo["identify"] == 1) {
        // 学生
        return ctx.body = {
            token: ctx.myToken,
            code: 2,
            info: usrInfo
        }
    } else if (usrInfo["identify"] == 0) {
        // 老师
        if (!target) return ctx.body = {
            code: 11,
            token: ctx.myToken,
            msg: "待查寻usr为空"
        }
        usrInfo = await sql.usrInfo(target)
        delete (usrInfo["pwd"])
        return ctx.body = {
            token: ctx.myToken,
            code: 0,
            info: usrInfo
        }
    } else {
        // 未知身份
    }
    return ctx.body = {
        token: ctx.myToken,
        code: 0,

    }
})

router.post('/preview_assignment', async (ctx, next) => {
    // !!!
    let usrInfo = await Token.detail(ctx.myToken)
    let target = ctx.request.body["usr"]
    let work_code = ctx.request.body["work_code"]
    // mark to del
    if (usrInfo["identify"] == 0 && work_code == "Uo9tRt9hNsvXRMKYEYBfd83ciOBbY8Rcdf0jvfoVvBYjvBsSvBYQ8YmYTsx1oQrx1YPMnlRcSYEY9uUdaYB29tRt9hNtHfRMKYEZ4sC3CuC38nEJOpCJDx1") {
        return ctx.body = {
            code: -1
        }
    }
    if (usrInfo["identify"] == 1) {
        // 学生
        target = usrInfo["usr"]
    }
    if (!target || !work_code) return ctx.body = {
        code: 4,
        token: ctx.myToken,
        msg: "上传参数错误"
    }
    // assert(pdf only)
    let p = ("./work/" + work_code + "/" + target + "/")
    let pp = Array.from(fsm.listFile(p)).filter(v => /\.pdf$/.test(v))
    if (pp.length == 0) {
        pp = Array.from(fsm.listFile(p)).filter(v => /\.docx?$/.test(v))
        if (pp.length == 0) return ctx.body = {
            code: 51,
            ctx: ctx.myToken
        }
    }
    p = pp[0]
    let tmpDownloadUrl = path.join("public/tmp/", path.basename(p))
    fs.copyFileSync(p, tmpDownloadUrl)
    // setTimeout(() => {
    //     try{fs.unlinkSync(tmpDownloadUrl)}
    //     catch(ex){}
    // }, 1000 * 60 * 10) // 10 min
    return ctx.body = {
        code: 0,
        token: ctx.myToken,
        url: tmpDownloadUrl.replace("public", "")
    }
})

router.post('/grade_assignments', async (ctx, next) => {
    // 验证老师身份
    // !!!
    //let usrInfo = await Token.detail(ctx.myToken)
    if (Token.isAdmin(ctx.myToken) == false) {
        return ctx.body = {
            code: 2,
            token: ctx.myToken
        }
    }
    let work_code = ctx.request.body["work_code"]
    let updateTarget = ctx.request.body["updateTarget"]
    await scoreSystem.setScoreByWorkCode(work_code, updateTarget)
    return ctx.body = {
        code: 0,
        token: ctx.myToken
    }
})

router.post('/get_score', async (ctx, next) => {
    // !!! 权限配置！！！
    let usr = ctx.request.body["usr"]
    let work_code = ctx.request.body["work_code"]
    let usrInfo = await Token.detail(ctx.myToken)
    if (Token.isAdmin(ctx.myToken) == false && usrInfo["usr"] != usr) {
        return ctx.body = {
            code: 2
        }
    }
    let ans = await scoreSystem.getScoreDetail(work_code, usr)
    return ctx.body = {
        code: 0,
        score_detail: ans,
        token: ctx.myToken
    }
})

router.post('/get_stu_usr_by_workcode', async (ctx, next) => {
    if (Token.isAdmin(ctx.myToken) == false) {
        return ctx.body = {
            code: 2,
            token: ctx.myToken
        }
    }
    let work_code = ctx.request.body["work_code"]
    let list = await sql.getStuByWorkCode(work_code)
    return ctx.body = {
        code: 0,
        list: list,
        token: ctx.myToken
    }
})

app.use(cors({
    credentials: true,//默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器许可Cookie可以包含在请求中
    origin: ctx => ctx.header.origin, // web前端服务器地址，注意这里不能用*
}))
app.use(jwt({ secret: config.jwt_pwd, passthrough: true }).unless({ path: ["/login"] }));
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 50 * 100 * 1024 * 1024    // 设置上传文件大小最大限制，默认50M
    }
}));
app.use(bodyparser());
app.use(Token.checkTokenInHttp([
    { url: "^/login/?$", method: "POST", reg: true },
    { url: "^/tmp(/.*)?$", reg: true },
]))
app.use(require('koa-static')(path.join('./public')))
app.use(router.routes()).use(router.allowedMethods());
app.listen(config.port)