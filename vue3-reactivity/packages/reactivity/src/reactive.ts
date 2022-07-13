/*
 * @Author: 李思豪
 * @Date: 2022-06-24 14:58:48
 * @LastEditTime: 2022-07-13 16:27:20
 * @Description: file content
 * @LastEditors: 李思豪
 */

import { _isObject } from '@vue/shared';
import { mutableHandler, readonlyHandlers, shallowReactiveHandlers, shallowReadonlyHanlders} from './baseHandlers'

/**
 * @param target
 */
export function reactive(target) {
  createReactiveObject(target, true, mutableHandler);
}
export function shallowReactive(target) {
  createReactiveObject(target, true, shallowReactiveHandlers);
}
export function readonly(target) {
  createReactiveObject(target, false, readonlyHandlers);
}
export function shallowReadonly(target) {
  createReactiveObject(target, false, shallowReadonlyHanlders);
}

/**
 * @param target 创建代理的目标
 * @param isReadonly 当前是不是仅读的
 * @param baseHandler 针对不同的方式创建不同的代理对象
 */
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
function createReactiveObject(target, isReadonly, baseHandler) {
  if (!_isObject(target)) target;
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const exisProxy = proxyMap.get(target)
  if(exisProxy) exisProxy
  const proxy = new Proxy(target, baseHandler);
  proxyMap.set(target, proxy)
  return proxy;
}

