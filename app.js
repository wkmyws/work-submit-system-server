const Koa = require('koa');
const config = require('./server/config')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser');
const jwt = require('koa-jwt')
const Token = require('./server/token')
const sql = require('./server/sql')
const cors = require('koa2-cors');
const base62x = require('base62x')
const fs=require('fs')
const path=require('path')

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
    let token = Token.get(ctx.request.body["token"])
    if (token == null) {
        ctx.body = {
            code: 1,
            msg: "token验证错误"
        }
        return
    }
    if (Token.isAdmin(token)==false) {
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
    let work_belong = Token.params(token)["usr"]
    // work_code 由 JSON格式的 work_name + work_belong + work_time 生成
    let work_code = { work_name, work_belong, work_time: new Date().getTime() }
    work_code = JSON.stringify(work_code)
    work_code = base62x.encode(work_code)

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
        token: token,
        work_code: work_code
    }

})

// 删除发布的作业
router.post('/delete_assignments', async (ctx, next) => {
    let token=Token.get(ctx.request.body["token"])
    if(token==null){
        return ctx.body={
            code: 1,
            msg: "token验证错误"
        }
    }
    if(Token.isAdmin(token)==false){
        return ctx.body={
            code:2,
            msg:"权限错误"
        }
    }
    ctx.body={
        code:-1
    }
})

app.use(cors({
    credentials: true,//默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器许可Cookie可以包含在请求中
    origin: ctx => ctx.header.origin, // web前端服务器地址，注意这里不能用*
}))
app.use(jwt({ secret: config.jwt_pwd, passthrough: true }).unless({ path: ["/login"] }));
app.use(bodyparser());
app.use(router.routes()).use(router.allowedMethods());
app.listen(config.port);