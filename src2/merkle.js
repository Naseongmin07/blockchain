// npm install merkletreejs
// npm install crypto-js
// npm install merkle

const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')


const testSet = ['a','b','c'].map( v => SHA256(v))
const tree = new MerkleTree(testSet,SHA256)

const root = tree.getRoot().toString('hex')

const testRoot = 'a'
const leaf = SHA256(testRoot)
const proof = tree.getProof(leaf)
console.log( tree.verify(proof,leaf,root) ) 

console.log( tree.toString() )
