// 封装了更多文件操作
const fs = require('fs')
function rm_rf(path) {
    if(fs.existsSync(path)){
        fs.readdirSync(path).forEach((file)=>{
            let curPath=path+"/"+file
            if(fs.statSync(curPath).isDirectory()){
                rm_rf(curPath)
            }else{
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
        return true
    }else{
        return false
    }
}

exports.rm_rf=rm_rf