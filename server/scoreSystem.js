const query = require('./sql').query

async function getScoreByWorkCode(work_code) {
    let ans = await query("select json from score where work_code=? limit 1;", work_code)
    if (ans.length == 0) return null;
    return JSON.parse(ans[0]["json"])
}
async function getScoreDetail(work_code, usr) {
    let ans = await getScoreByWorkCode(work_code)
    if (!(usr in ans)) return { score: -3 }
    if (!("score" in ans[usr])) ans[usr]["score"] = -2 // score 不存在说明学生未提交作业
    return ans[usr]
}
async function setScoreByWorkCode(work_code, updateTarget) {
    // updateTarget=[{usr,score,remark},{},...]
    let json = await getScoreByWorkCode(work_code)
    updateTarget.forEach(e => {
        json[e["usr"]] = {
            score: e["score"],
            remark: e["remark"] || ""
        }
    })
    json = JSON.stringify(json)
    await query("update score set json=? where work_code=?", [json, work_code])
}

exports.getScoreByWorkCode = getScoreByWorkCode
exports.setScoreByWorkCode = setScoreByWorkCode
exports.getScoreDetail = getScoreDetail


// setScoreByWorkCode("Uo9tRt9hNsvXRMKYEYBdhApak8dchA7alPpak9eYB29tRt9hNs9bR6x1kPo8w8dHbOMDePN8o8YmYTsx1oQrx1qQMrb8ZenDZ0oD38vD3SqC3OnV1",
//     [{ usr: "181090808", score: 100,remark:"nice！！！" }, { usr: "181090809", score: 95 }])
//     .then(res => {
//         getScoreByWorkCode("Uo9tRt9hNsvXRMKYEYBdhApak8dchA7alPpak9eYB29tRt9hNs9bR6x1kPo8w8dHbOMDePN8o8YmYTsx1oQrx1qQMrb8ZenDZ0oD38vD3SqC3OnV1").then(res => {
//             console.log(res)
//         })
//     })

