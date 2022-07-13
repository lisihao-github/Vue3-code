/*
 * @Author: 李思豪
 * @Date: 2022-06-23 11:05:10
 * @LastEditTime: 2022-07-13 16:27:14
 * @Description: file content
 * @LastEditors: 李思豪
 */

export function _isObject(target) {
  return typeof target === 'object' && target !== null
}

export function _extend(...args){
  return Object.assign(args)
}


