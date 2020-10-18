const axios=require('axios')

// axios.post("http://47.96.235.211:3000/login",{
//     usr:"teacher1",
//     pwd:"123"
// }).then((res)=>{
//     let token=res.data.token
//     axios.post("http://47.96.235.211:3000/get_class_list",{
//         token
//     }).then((res)=>{
//         console.log(res.data)
//         axios.post("http://47.96.235.211:3000/get_guy_info",{
//             token,
//             usr:"181090833"
//         }).then((res)=>{
//             console.log(res.data)
//         })
//     })
// })
axios.post("http://47.96.235.211:3000/login",{
    usr:"teacher1",
    pwd:"123"
}).then((res)=>{
    let token=res.data.token
    axios.post("http://47.96.235.211:3000/delete_assignments",{
        token,
        work_name: "第四次作业",
        work_desc: "使用版本控制(git/svn)",
        work_deadline: new Date().getTime()+60*60*24*60*1000*2,
        work_class: "sj001",
        work_code:"Uo9tRt9hNsvXRMKYEYBdhApbcvlchA7alPpak9eYB29tRt9hNs9bR6x1kPo8w8dHbOMDePN8n8YmYTsx1oQrx1qQMrb8ZenDZ0oEJWtE3WmEJarV1"
    }).then((res)=>{
        console.log(res.data)
    })
})