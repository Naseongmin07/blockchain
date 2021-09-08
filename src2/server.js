const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const bodyParser = require('body-parser')
const bc = require('./block.js')
const ws = require('./network.js')

app.use(bodyParser.json())

app.get("/blocks",(req,res)=>{
    res.send(bc.getBlocks())
})

app.get("/version",(req,res)=>{
    res.send(bc.getVersion())
})

// Blocks 배열에  { } 
// curl http://localhost:3000/mineBlock -X POST -H "Content-Type:application/json" -d "{'data':[\"Hello world!\"]}" 
app.post("/mineBlock",(req,res)=>{
    const data = req.body.data 
    const result = bc.mineBlock(data) // {} or false 
    if(result === null ) {
        //res.send(`mineBlock failed`)
        res.status(400).send(`블럭추가에 오류가 발생되었습니다.`)
    } else {
        res.send(result)
    }
})

// peers -> 현재 가지고있는 소켓리스트 getSockets GET
// curl http://localhost:3000/peers
app.get('/peers',(req,res)=>{
    res.send( ws.getSockets().map( socket => {
        return `${socket._socket.remoteAddress}:${socket._socket.remotePort}`;
    }) )
})
// addPeers -> 내가보낼 주소값에 소켓을 생성하는 작업 connectToPeers POST
// [] 
// curl -X POST -H "Content-Type:application/json" -d "{\"peers\":[\"ws://localhost:6006\"]}" http://localhost:3000/addPeers
app.post('/addPeers',(req,res)=>{
    const peers = req.body.peers
    ws.connectionToPeers(peers)
    res.send('success')
})

// curl http://localhost:3000/stop
app.get("/stop",(req,res)=>{
    res.send("Server Stop")
    process.exit(0)
})


ws.wsInit()
app.listen(port,()=>{
    console.log(`server start port ${port}`)
})

/*

블록 가져오기
간단한기록들 버전
중단
peer 

// window
" "
set 변수명=값
set 변수명

// mac or linux 
export 변수명=값
env | grep 변수명

*/