// secp256k1 알고리즘 암호화
// elliptic -> npm install elliptic
const fs = require('fs')
const ecdsa = require('elliptic')
const ec = ecdsa.ec("secp256k1")

const privateKeyLocation = "wallet/" + (process.env.PRIVATE_KEY || "default")
const privateFile = `${privateKeyLocation}/private_key`


function generatorPrivateKey(){
    const keyPair = ec.genKeyPair()
    const privateKey = keyPair.getPrivate()
    return privateKey.toString(16).toUpperCase()
}

// node server.js

// 특정폴더 = wallet/
// 특정폴더가있는지.
// 있다. pass
// 없다.폴더생성을 진행
// mkdir

// http://localhost:3000/address
// generatorPrivateKey()
// node server.js 가 실행되면 특정 폴더에 특정 파일에 
// 결과물이 나올 수 있도록 할겁니다.


function initWallet(){
    if(!fs.existsSync("wallet/")){
        fs.mkdirSync("wallet/")
    }

    if(!fs.existsSync(privateKeyLocation)){
        fs.mkdirSync(privateKeyLocation)
    }
    if(!fs.existsSync(privateFile)){
        console.log(`주소값 키값을 생성중입니다...`)
        const newPrivateKey = generatorPrivateKey()
        fs.writeFileSync(privateFile, newPrivateKey)
        console.log(`개인키 생성이 완료되었습니다.`)
    }
}

initWallet()

function getPrivateFromWallet(){
    const buffer = fs.readFileSync(privateFile)
    return buffer.toString()
}



function getPublicFromWallet(){
    const privateKey = getPrivateFromWallet()
    const key = ec.keyFromPrivate(privateKey, "hex")
    return key.getPublic().encode("hex")
}

module.exports = {
    initWallet,
    getPublicFromWallet,
}
// 공개키 비밀키
//계좌번호 공인인증서