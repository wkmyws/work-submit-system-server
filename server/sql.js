const mysql=require('mysql')
const config=require('./config')
const connection=mysql.createConnection(config.sql)
connection.connect()

async function query(sql,list){
    return new Promise((resolve,reject)=>{
        connection.query(sql,list,(err,res)=>{
            if(err)return reject(err)
            return resolve(JSON.parse(JSON.stringify(res)))
        })
    })
}

async function login(usr,pwd){
    let res=await query(
        "select * from login where usr=? and pwd=? limit 1;",
        [usr,pwd]
    )
    if(res.length==0){
        // have no match
        return false
    }else{
        return res[0]
    }

}


exports.login=login

async function test(){
    
}
test()