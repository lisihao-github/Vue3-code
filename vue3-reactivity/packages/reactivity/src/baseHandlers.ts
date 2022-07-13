/*
* @Author: 李思豪
* @Date: 2022-07-13 16:07:17
 * @LastEditTime: 2022-07-13 16:47:33
* @Description: file content
 * @LastEditors: 李思豪
*/
import { _extend } from "@vue/shared"

function createGetter(isReadonly=false,shallow= false){
  /**
   * @param target 是原来的对象
   * @param key 去取什么属性
   * @param receiver 代理对象
   */
  return function get(target, key, receiver){
    // Reflect 就是后续慢慢替换掉 Object 对象, 一般是会用 proxy 会配合 Reflect
    // target[key] === Reflect.get(target, key, receiver)
    const res = Reflect.get(target, key, receiver)
    console.log('用户取值了')
    return res
  }
} 

function createSetter(shallow = false){
  return function set(target, key, value, receiver){
    const res = Reflect.set(target, key, value, receiver)
    console.log('用户设置值了, 可以更新视图')
    return res;
  }
}

const get = createGetter()
const shallowGet = createGetter(false,true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true,true)

const set = createSetter(false)
const shallowSet = createSetter(true)

export const mutableHandler = {
  get,
  set,
}
export const shallowReactiveHandlers = {
  get:shallowGet,
  set:shallowSet
}

let readonlySet = {
  set(target, key){
    console.warn(`cannot set ${JSON.stringify(target)} on key ${key} falied`)
  }
}

export const readonlyHandlers = _extend({
    get:readonlyGet
},readonlySet)

export const shallowReadonlyHanlders = _extend({
  get:shallowReadonlyGet
},readonlySet)

