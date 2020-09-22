const Koa = require('koa');
const config = require('./server/config')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser');
const jwt = require('koa-jwt')
const jsonwebtoken = require('jsonwebtoken');
const sql = require('./server/sql')


const app = new Koa()
const router = new Router()

router.get('/login', async (ctx, next) => {
    ctx.body = "hello"
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
    let token = jsonwebtoken.sign(usrInfo, config.jwt_pwd)
    ctx.response.set('my-token', token)
    ctx.body = {
        code: 0,
        msg: "",
        token: token,
        identify: usrInfo["identify"]
    }
})


app.use(jwt({ secret: config.jwt_pwd, passthrough: true }).unless({ path: ["/login"] }));
app.use(bodyparser());
app.use(router.routes()).use(router.allowedMethods());
app.listen(config.port);