/*
* @Author: 李思豪
* @Date: 2022-07-13 16:07:17
 * @LastEditTime: 2022-07-22 16:32:09
* @Description: file content
 * @LastEditors: 李思豪
*/
import { _extend, _hasChanged, _hasOwn, _isArray, _isIntegerKey, _isObject } from "@vue/shared"
import { track, trigger } from "./effect";
import { reactive, readonly } from "./reactive";

/**
 * 
 * @param isReadonly 
 * @param shallow 
 * @returns 
 */
function createGetter(isReadonly = false, shallow = false){
  /**
   * @param target 是原来的对象
   * @param key 去取什么属性
   * @param receiver 代理对象
   */
  return function get(target, key, receiver){
    // Reflect 就是后续慢慢替换掉 Object 对象, 一般是会用 proxy 会配合 Reflect
    // target[key] === Reflect.get(target, key, receiver)
    const res = Reflect.get(target, key, receiver)
    if(shallow) return res;
    if(!isReadonly){
      // console.log('收集当前属性, 如果属性变化了, 稍后可能要更新视图')
      track(target, 'get', key)
    }
    if(_isObject(res)){ // 懒递归, 当我们取值的时候才去做 递归代理, 如果不取默认值代理一层
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
  // vue3 针对的是对象来进行劫持, 不用改写原来的对象, 如果是嵌套, 当取值的时候才会代理
  // vue2 针对的是属性劫持, 改写了原来对象, 一上来就递归的。
  // vue3 可以对不存在的属性进行获取, 也会走 get 方法, proxy 支持数组。
} 

/**
 * 设置属性, 可能是新增属性, 还有可能是修改属性值
 * @param shallow 
 * @returns 
 */
function createSetter(shallow = false){
  // 针对数组而言, 如果调用 push 方法, 就会产生 2 次触发
  // 1. 给数组新增了一项，同时也更改了长度
  // 2. 因为更改了长度再次触发 set (第二次触发是无意义的)
  return function set(target, key, value, receiver){
    const oldValue = target[key]
    // 判断数组是新增还是修改
    let hadKey = _isArray(target) && _isIntegerKey(key) ? Number(key) < target.length : _hasOwn(target, key)
    // 先判断有没有，再去设置值
    const res = Reflect.set(target, key, value, receiver)
    if(!hadKey){
      console.log('新增')
      trigger(target, 'add', key,value);
    }else if(_hasChanged(oldValue, value)){
      console.log('修改')
      trigger(target, 'set', key, value, oldValue)
    }
    return res
  }
}

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

const set = createSetter()
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

