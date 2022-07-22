/*
 * @Author: 李思豪
 * @Date: 2022-07-19 15:05:49
 * @LastEditTime: 2022-07-22 16:44:00
 * @Description: file content
 * @LastEditors: 李思豪
 */

import { _isArray, _isIntegerKey } from "@vue/shared";

export function effect(fn, options: any = {}){
  // 将 effect 变为响应式, 当数据变化时重新执行
  const effect = createReactiveEffect(fn,options)
  if (!options.lazy) { // 默认的effect会先执行
    effect(); // 响应式的effect默认会先执行一次
  }
  return effect;
}

let uid = 0;
let activeEffect; // 存储当前的 effect
const effectStack = []

// 当用户取值的时候需要将 activeEffect 和属性做关联
// 当用户更改的时候需要通过属性找到 effect 重新执行
function createReactiveEffect(fn, options){
  const effect = function reactiveEffect(){
    // if(!effectStack.includes(effect)){
      try{
        effectStack.push(effect);
        activeEffect = effect
        return fn()
      }finally{
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    // }
  }
  effect.id = uid++; // 制作一个effect标识 用于区分effect
  effect._isEffect = true; // 用于标识这个是响应式effect
  effect.deps = []; // effect 用来收集依赖了哪些属性
  // effect.raw = fn; // 保留effect对应的原函数
  // effect.options = options; // 在effect上保存用户的属性
  return effect;
}

// 收集属性对应的 effect
const targetMap = new WeakMap();
export function track(target, type, key){ // 可以拿到当前的effect
  //  activeEffect; // 当前正在运行的effect
  if(activeEffect === undefined){ // 此属性不用收集依赖，因为没在effect中使用
    return 
  }
  let depsMap = targetMap.get(target)
  if(!depsMap){
    targetMap.set(target,(depsMap = new Map()))
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
}

// 找到属性对应的 effect 让其执行 (数组、对象)
export function trigger(target, type, key?, newValue?, oldValue?){
  // 如果这个属性没有 收集过 effect, 那不需要做任何操作
  const depsMap = targetMap.get(target)
  if(!depsMap) return

  const effects = new Set() //这里对 effect 去重
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => effects.add(effect));
    }
  }
  // 我要将所有的 要执行的effect 全部存到一个新的集合中，最终一起执行

  // 1.如果更改的数组长度 小于依赖收集的长度 要触发重新渲染
  // 2.如果调用了 push 方法 或者其他新增数组方法 (必须能改变长度的方法) 也要触发更新
  if(key === 'length' && _isArray(target)){ // 如果是数组, 你改了 length
    // 如果对应的长度 有依赖收集需要更新
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key > newValue) {
          add(dep) // 更改的数组长度 比收集到的属性的值小
      }
    })
  }else{
    // 可能是对象
    if(key !== undefined){
      add(depsMap.get(key))
    }
    switch(type){
      case 'add':
        if(_isArray(target) && _isIntegerKey(key)){
          add(depsMap.get('length')) // 新增属性 需要触发 length 的依赖收集
        }
    }
  }
  effects.forEach((effect:any) => effect())
}