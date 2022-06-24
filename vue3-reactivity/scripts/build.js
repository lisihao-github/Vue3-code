/*
 * @Author: 李思豪
 * @Date: 2022-06-23 11:15:06
 * @LastEditTime: 2022-06-24 09:35:36
 * @Description: file content
 * @LastEditors: 李思豪
 */

// node 来解析 packages 目录
const fs = require("fs")
const execa = require('execa');// 可以理解成打开一个进程去做打包操作


// 读取目录中要打包的文件夹
const dirs = fs.readdirSync("packages").filter(f=>(fs.statSync(`packages/${f}`).isDirectory()))

// 并发去打包，每次打包都调用build方法
async function build(target){
 await execa('rollup',['-c','--environment',`TARGET:${target}`],{stdio:'inherit'}); // 子进程的输出 需要在父进程中打印 await execa('rollup',['-c','--environment',`TARGET:${target}`],{stdio:'inherit'}); // 子进程的输出 需要在父进程中打印
}
async function runParallel(dirs,iterFn){
  let result = []
  for(let item of dirs){
    result.push(iterFn(item))
  }
  return Promise.all(result); // 存储打包时的promise，等待所有全部打包完毕后，调用成功
}

runParallel(dirs,build).then(()=>{
    console.log('成功')
})