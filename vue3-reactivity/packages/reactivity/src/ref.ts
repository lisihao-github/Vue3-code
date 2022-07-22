import { _hasChanged, _isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive } from "./reactive";

/*
 * @Author: 李思豪
 * @Date: 2022-07-22 16:53:51
 * @LastEditTime: 2022-07-22 17:20:16
 * @Description: file content
 * @LastEditors: 李思豪
 */
export function ref (value){ // 可以传入对象
  // 把普通值变成一个引用类型，让一个普通值也具备响应式的能力
  return createRef(value)
}

export function shallowRef(value){
  return createRef(value, true)
}

const conver = (v) => _isObject(v) ? reactive(v) : v

// ts 中实现类  -- 私有属性必须先声明才能使用
class RefIml {
  public _value;
  public _v_isRef = true; // 表示他是一个 ref
  constructor(public rawValue, public shallow){
    // public rawVal ===   (this.rawValue = rawValue)
    this._value = shallow ? rawValue : conver(rawValue)
  }
  get value(){
    // 收集依赖
    track(this, 'get', 'value')
    return this._value
  }
  set value(newValue){
    if(_hasChanged(newValue, this.rawValue)){
      // 触发依赖
      this.rawValue = newValue;
      this._value = this.shallow  ? newValue :conver(newValue)
      trigger(this, 'set', 'value', newValue, this.rawValue)
    }
  }
}

function createRef(value, shallow = false){
  return new RefIml(value, shallow) // 借助类的属性访问器
}