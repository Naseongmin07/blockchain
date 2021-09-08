const fs = require('fs')
const merkle = require('merkle')
const CryptoJs = require('crypto-js')
const random = require('random')

/* 사용법 */
// const tree = merkle("sha256").sync([]) // tree 구조 
// tree.root()

class BlockHeader {  // 블록의 헤더를 만드는 부분
    constructor(version ,index ,previousHash, time, merkleRoot){
        this.version = version 
        this.index = index  // 마지막 블럭의 index + 1 
        this.previousHash = previousHash // 마지막 블럭 -> header -> string 연결  -> SHA256
        this.time = time  //
        this.merkleRoot = merkleRoot 
    }
}
 
class Block { // 데이터를 받아서 블록을 만드는 부분
    constructor(header,body){
        this.header = header
        this.body = body
    }
}

let Blocks = [createGenesisBlock()]  // 블록 리스트에 제네시스 블록을 추가한다

function getBlocks(){ // 블록을 가져오는 함수
    return Blocks 
}

function getLastBlock() {  // 마지막 블록을 가져오는 함수
   return Blocks[Blocks.length - 1]
}

function createGenesisBlock(){ // 제네시스 블록을 만들어주는 함수
    // 1. header 만들기 
    // 5개의 인자값을 만들어야되여.
    const version = "1.0.0" // 1.0.0
    const index = 0
    const time = 1630907567 //하드코딩
    const previousHash = '0'.repeat(64)
    const body = ['hello block']

    const tree = merkle('sha256').sync(body)
    const root = tree.root() || '0'.repeat(64)

    const header = new BlockHeader(version,index,previousHash,time,root)
    return new Block(header,body)
}

// 다음블럭의 Header와 Body를 만들어주는 함수 2번
function nextBlock(data){
    // header 
    const prevBlock = getLastBlock()
    const version = getVersion()
    const index = prevBlock.header.index + 1
    const previousHash = createHash(prevBlock)
    const time = getCurrentTime()

    const merkleTree = merkle("sha256").sync(data) // []
    const merkleRoot = merkleTree.root() || '0'.repeat(64)

    const header = new BlockHeader(version,index,previousHash,time,merkleRoot);
    return new Block(header,data)
}
// 3번
function createHash(block){ // 이전 블록 (마지막 블록)을 가져와서 헤더값을 hash해주는 함수
    const {
        version,
        index,
        previousHash,
        time,
        merkleRoot
    } = block.header
    const blockString = version+index+previousHash+time+merkleRoot;
    const Hash = CryptoJs.SHA256(blockString).toString()
    return Hash
}

// Blocks push 1번
function addBlock(newBlock){ // 새로운 블록을 가져와서 검증하고 Blocks에 집어넣는 함수
    // new header -> new block ( header , body)

    if(isVaildNewBlock(newBlock, getLastBlock())) {
        Blocks.push(newBlock);
        return true;
    } 
    return false;
}

function mineBlock(blockData){ // body 데이터로 새로운 블록을 만들어주는 함수
    console.log('mine Block')
    const newBlock = nextBlock(blockData) // Object Block {header, body}
    if(addBlock(newBlock)){
        const nw = require('./network')
        nw.broadcast(nw.responseLastMsg())
        return newBlock
    } else {
        return null
    }
}

/* etc 
1: 타입검사
*/
function isVaildNewBlock(currentBlock,previousBlock){
    // currentBlock 에대한 header , body DataType을 확인
    if(!isVaildType(currentBlock)){
        console.log(`invaild block structrue ${JSON.stringify(currentBlock)}`)
        return false
    }
    // index값이 유효한지
    if(previousBlock.header.index + 1 !== currentBlock.header.index) {
        console.log(`invaild index`)
        return false
    }
    // previousHash 체크
    /*
        어떻게 만들었는가? 
        해당블럭의 header의 내용을 글자로 합쳐서 SHA256 활용하여 암호화한 결과물 
        previousHash         previousHash
        제네시스 블럭 기준 -> 2번째 블럭 
     */
    if(createHash(previousBlock) !== currentBlock.header.previousHash){
        console.log(`invaild previousBlock`)
        return false
    }
    // Body check
    /*
        current.header.merkleRoot -> body [배열]
        current.body -> merkleTree root -> result !== current.header.merkleRoot
        굳이왜 ?..
        네트워크 
        body... 내용이 없으면안됩니다.
        current.body.lenght !== 0 ||  (  currnetBlock.body가지고 만든 merkleRoot !== currentBlock.header.merkleRoot )
        current.body.lenght !== 0 ||  (  merkle("sha256").sync(currentBlock.body).root() !== currentBlock.header.merkleRoot )
    */
    if (currentBlock.body.length === 0) {
        console.log(`invaild body`)
        return false
    }

    if (merkle("sha256").sync(currentBlock.body).root() !== currentBlock.header.merkleRoot) {
        console.log(`invalid merkleRoot`)
        return false
    }

    return true
}

function isVaildType(block){
    return (
        typeof(block.header.version) === "string" &&  // stirng
        typeof(block.header.index) === "number" && // number
        typeof(block.header.previousHash) === "string" && // stirng
        typeof(block.header.time) === "number" && // number
        typeof(block.header.merkleRoot) === "string" && // string
        typeof(block.body) === "object" // object
    )
    
}

function replaceBlock(newBlocks){
    // newBlocks : 내가 받은 전체 배열 => 내가 받은 전체 블록들
    //Blocks = newBlocks
    // 1. newBlocks 내용을 검증해야합니다.
    // 2. 검증을 한번만 하지않습니다. 랜덤하게 한번만할수있고, 두번할수있고, 세번할수도있게합니다. -> 조건문에 random을 사용한다.
    // 3. Blocks = newBlocks
    // 4. broadcast 날립니다.

    if (isVaildBlock(newBlocks) && newBlocks.length > Blocks.length && random.boolean()) {
        console.log(`Blocks 배열을 newBlocks 으로 교체합니다.`)
        const nw = require('./network')
        Blocks = newBlocks
        nw.broadcast(nw.responseLastMsg())

    } else {
        console.log(`메시지로 부터 받은 블록배열이 맞지 않습니다.`)
    }
}


function getVersion(){
    const {version} = JSON.parse(fs.readFileSync("../package.json"))
    return version
}

function getCurrentTime(){
    return Math.ceil(new Date().getTime()/1000) 
}

/*
    일단 제네시스 블럭이 유효한지 데이터가 바뀐적이 없는지.
    2번째는 
    blocks 모든 배열을 검사를 할겁니다.
*/

function isVaildBlock(Blocks){
    if (JSON.stringify(Blocks[0]) !== JSON.stringify(createGenesisBlock())) {
        console.log(`genesis error`)
        return false 
    }

    //Blocks 3개 
    // 1 < 3 
    let tempBlocks = [Blocks[0]] 
    for ( let i = 1; i < Blocks.length; i++) {
        if (isVaildNewBlock(Blocks[i],tempBlocks[i-1])) {
            tempBlocks.push(Blocks[i])
        } else {
            return false 
        }
    }

    return true
}

// class 
// { header body } 1차 목표는 제네시스 블럭을 만드는것 
//console.log(Blocks)

module.exports = {
    getBlocks,
    getLastBlock,
    addBlock,
    getVersion,
    mineBlock,
    createHash,
    replaceBlock,
}
