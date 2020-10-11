const axios=require('axios')

axios.post("http://47.96.235.211:3000/login",{
    usr:"teacher1",
    pwd:"123"
}).then((res)=>{
    let token=res.data.token
    axios.post("http://47.96.235.211:3000/get_class_list",{
        token
    }).then((res)=>{
        console.log(res.data)
        axios.post("http://47.96.235.211:3000/get_guy_info",{
            token,
            usr:"181090833"
        }).then((res)=>{
            console.log(res.data)
        })
    })
})
// axios.post("http://47.96.235.211:3000/login",{
//     usr:"teacher2",
//     pwd:"123"
// }).then((res)=>{
//     let token=res.data.token
//     axios.post("http://47.96.235.211:3000/publish_assignments",{
//         token,
//         work_name: "第四次作业",
//         work_desc: "使用redux管理状态",
//         work_deadline: new Date().getTime()+60*60*24*60*1000*2,
//         work_class: "sj005"
//     }).then((res)=>{
//         console.log(res.data)
//     })
// })