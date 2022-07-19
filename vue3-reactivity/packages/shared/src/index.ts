/*
 * @Author: 李思豪
 * @Date: 2022-06-23 11:05:10
 * @LastEditTime: 2022-07-19 14:53:47
 * @Description: file content
 * @LastEditors: 李思豪
 */

export const _isObject = (value) => typeof value == 'object' && value !== null;

export const _extend = Object.assign

export const _isArray = Array.isArray

export const _isIntegerKey = (key) => parseInt(key) + '' === key

let hasOwnpRroperty = Object.prototype.hasOwnProperty;
export const _hasOwn = (target, key) => hasOwnpRroperty.call(target, key);

export const _hasChanged =(oldValue,value) => oldValue !== value