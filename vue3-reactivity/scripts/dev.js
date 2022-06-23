/*
 * @Author: 李思豪
 * @Date: 2022-06-23 16:14:07
 * @LastEditTime: 2022-06-23 16:14:15
 * @Description: file content
 * @LastEditors: 李思豪
 */

const execa = require('execa');

async function build(target){
  await execa('rollup',['-c','--environment',`TARGET:${target}`],{stdio:'inherit'}); // 子进程的输出 需要在父进程中打印 await execa('rollup',['-c','--environment',`TARGET:${target}`],{stdio:'inherit'}); // 子进程的输出 需要在父进程中打印
}

build('reactivity');