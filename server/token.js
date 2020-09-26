const jwt=require('jsonwebtoken')
const config=require('./config')

function addToken(json_data){
    return jwt.sign(json_data,config.jwt_pwd,{expiresIn:config.jwt_passTime})
}


function getToken(token){
    // 验证token后刷新token
    let res=null
    try{
        res=jwt.verify(token,config.jwt_pwd)
        if(res["iat"]-0 > res["exp"]-0)return null // 过期
    }catch(err){
        return null // 伪造的token
    }
    newRes={}
    for(let e in res){
        if(e!="iat" && e!="exp")
            newRes[e]=res[e]
    }
    return addToken(newRes)
}

function params(token){
    return jwt.verify(token,config.jwt_pwd)
}

function isAdmin(token){
    return params(token)["identify"]==0
}

function isStu(token){
    return params(token)["identify"]==1
}

exports.set=addToken
exports.get=getToken
exports.params=params
exports.isAdmin=isAdmin
exports.isStu=isStu