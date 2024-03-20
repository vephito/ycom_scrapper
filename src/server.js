const http = require('http')

PORT = 8080
localhost = '127.0.0.1'
const server = http.createServer((req,res)=>{
    res.statusCode = 200;
    res.setHeader('Content','text')
    res.end("Hello Sserver")
})

server.listen(PORT, () =>{
    console.log("login")
})