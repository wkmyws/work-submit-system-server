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
    axios.post("http://47.96.235.211:3000/preview_assignment",{
        token,
        usr:"181090808",
        work_code:"Uo9tRt9hNsvXRMKYEYBdhApak8dchA7alPpak9eYB29tRt9hNs9bR6x1kPo8w8dHbOMDePN8o8YmYTsx1oQrx1qQMrb8ZenDZ0oD38vD3SqC3OnV1"
    }).then((res)=>{
        console.log(res.data)
    }).catch(err=>console.log(err))
})