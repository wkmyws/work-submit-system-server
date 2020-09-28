const Koa = require('koa');
const config = require('./server/config')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser');
const koaBody = require('koa-body');
const jwt = require('koa-jwt')
const Token = require('./server/token')
const sql = require('./server/sql')
const cors = require('koa2-cors');
const workCode = require('./server/work_code')
const fs = require('fs')
const path = require('path')
const myZip = require('./server/zip');

const app = new Koa()
const router = new Router()

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
    if (!work_name) {
        return ctx.body = {
            code: 21,
            msg: "作业名不为空"
        }
    }
    let work_belong = Token.params(ctx.myToken)["usr"]
    let work_code = workCode.encode(work_name, work_belong)
    let res = await sql.addWork(work_code, work_name, work_belong, work_desc)
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
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let work_code = ctx.request.body["work_code"]
    if (work_code == null) {
        return ctx.body = {
            code: 23,
            msg: "作业码解析失败"
        }
    }
    if (Token.isAdmin(ctx.myToken) == false) {
        return ctx.body = {
            code: 2,
            msg: "你所在权限组无法执行此操作"
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
router.post('/submit_work', async (ctx, next) => {
    let work_code = ctx.request.body["work_code"]
    if (work_code == null || (await sql.haveWork(work_code)) == false) {
        return ctx.body = {
            code: 23,
            msg: "作业码不存在",
            token: ctx.myToken
        }
    }
    let usrInfo = Token.params(ctx.myToken)
    const file = ctx.request.files.file
    let reader = fs.createReadStream(file.path)
    let filePath = path.join('./', 'work', work_code) + `/${usrInfo["usr"]}`
    let upStream = fs.createWriteStream(filePath)
    reader.pipe(upStream)
    return ctx.body = {
        code: 0,
        msg: "上传成功！",
        token: ctx.myToken
    }
})

// 下载作业
router.post('/download_assignments', async (ctx, next) => {
    let work_code = ctx.request.body["work_code"]
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
    let download_url = myZip.zipAndDownload(work_code)()
    return ctx.body = {
        code: 0,
        token: ctx.myToken,
        download_url: download_url
    }
})

// 获取已发布的作业列表
router.post('/get_published_assignments_list', async (ctx, next) => {
    if(Token.isAdmin(ctx.myToken)==false){
        return ctx.body={
            code: 2,
            msg: "权限不足",
            token: ctx.myToken,
            work_list: []
        }
    }
    let work_belong=Token.params(ctx.myToken)["usr"]
    let res=await sql.getWorkListByWorkBelong(work_belong)
    ctx.body={
        code:0,
        token: ctx.myToken,
        work_list: res
    }
})

// 获取详细作业
router.post('/get_assignments_detail', async (ctx, next) => {
    let work_code = ctx.request.body["work_code"]
    let res=await sql.getWorkDetailsByWorkCode(work_code)
    ctx.body={
        code:0,
        token:ctx.myToken,
        work_name: res["work_name"],
        work_belong: res["work_belong"],
        work_desc: res["work_desc"]
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
app.use(Token.checkTokenInHttp([{url:"/login",method:"POST"}]))
app.use(require('koa-static')(path.join('./public')))
app.use(router.routes()).use(router.allowedMethods());
app.listen(config.port);