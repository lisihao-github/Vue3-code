var VueReactivity = (function (exports) {
  'use strict';

  /*
   * @Author: 李思豪
   * @Date: 2022-06-23 11:05:10
   * @LastEditTime: 2022-07-19 14:53:47
   * @Description: file content
   * @LastEditors: 李思豪
   */
  const _isObject = (value) => typeof value == 'object' && value !== null;
  const _extend = Object.assign;
  const _isArray = Array.isArray;
  const _isIntegerKey = (key) => parseInt(key) + '' === key;
  let hasOwnpRroperty = Object.prototype.hasOwnProperty;
  const _hasOwn = (target, key) => hasOwnpRroperty.call(target, key);
  const _hasChanged = (oldValue, value) => oldValue !== value;

  /*
  * @Author: 李思豪
  * @Date: 2022-07-13 16:07:17
   * @LastEditTime: 2022-07-19 15:03:22
  * @Description: file content
   * @LastEditors: 李思豪
  */
  function createGetter(isReadonly = false, shallow = false) {
      /**
       * @param target 是原来的对象
       * @param key 去取什么属性
       * @param receiver 代理对象
       */
      return function get(target, key, receiver) {
          // Reflect 就是后续慢慢替换掉 Object 对象, 一般是会用 proxy 会配合 Reflect
          // target[key] === Reflect.get(target, key, receiver)
          const res = Reflect.get(target, key, receiver);
          if (shallow)
              return res;
          if (!readonly) {
              console.log('收集当前属性, 如果属性变化了, 稍后可能要更新视图');
          }
          if (_isObject(res)) { // 懒递归, 当我们取值的时候才去做 递归代理, 如果不取默认值代理一层
              return isReadonly ? readonly(res) : reactive(res);
          }
          return res;
      };
      // vue3 针对的是对象来进行劫持, 不用改写原来的对象, 如果是嵌套, 当取值的时候才会代理
      // vue2 针对的是属性劫持, 改写了原来对象, 一上来就递归的。
      // vue3 可以对不存在的属性进行获取, 也会走 get 方法, proxy 支持数组。
  }
  // 设置属性, 可能是新增属性, 还有可能是修改属性值
  function createSetter(shallow = false) {
      // 针对数组而言, 如果调用 push 方法, 就会产生 2 次触发
      // 1. 给数组新增了一项，同时也更改了长度
      // 2. 因为更改了长度再次触发 set (第二次触发是无意义的)
      return function set(target, key, value, receiver) {
          const oldValue = target[key];
          console.log(target, key, value, receiver);
          // 判断数组是新增还是修改
          console.log(_isIntegerKey(key));
          let hadKey = _isArray(target) && _isIntegerKey(key) ? Number(key) < target.length : _hasOwn(target, key);
          // 先判断有没有，再去设置值
          const res = Reflect.set(target, key, value, receiver);
          if (!hadKey) {
              console.log('新增');
          }
          else if (_hasChanged(oldValue, value)) {
              console.log('修改');
          }
          return res;
      };
  }
  const get = createGetter();
  const shallowGet = createGetter(false, true);
  const readonlyGet = createGetter(true);
  const shallowReadonlyGet = createGetter(true, true);
  const set = createSetter();
  const shallowSet = createSetter(true);
  const mutableHandler = {
      get,
      set,
  };
  const shallowReactiveHandlers = {
      get: shallowGet,
      set: shallowSet
  };
  let readonlySet = {
      set(target, key) {
          console.warn(`cannot set ${JSON.stringify(target)} on key ${key} falied`);
      }
  };
  const readonlyHandlers = _extend({
      get: readonlyGet
  }, readonlySet);
  const shallowReadonlyHanlders = _extend({
      get: shallowReadonlyGet
  }, readonlySet);

  /*
   * @Author: 李思豪
   * @Date: 2022-06-24 14:58:48
   * @LastEditTime: 2022-07-19 14:28:56
   * @Description: file content
   * @LastEditors: 李思豪
   */
  /**
   * @param target
   */
  function reactive(target) {
      return createReactiveObject(target, false, mutableHandler);
  }
  function shallowReactive(target) {
      return createReactiveObject(target, false, shallowReactiveHandlers);
  }
  function readonly(target) {
      return createReactiveObject(target, true, readonlyHandlers);
  }
  function shallowReadonly(target) {
      return createReactiveObject(target, true, shallowReadonlyHanlders);
  }
  /**
   * @param target 创建代理的目标
   * @param isReadonly 当前是不是仅读的
   * @param baseHandler 针对不同的方式创建不同的代理对象
   */
  const reactiveMap = new WeakMap();
  const readonlyMap = new WeakMap();
  function createReactiveObject(target, isReadonly, baseHandler) {
      const proxyMap = isReadonly ? readonlyMap : reactiveMap;
      proxyMap.get(target);
      const proxy = new Proxy(target, baseHandler);
      proxyMap.set(target, proxy);
      return proxy;
  }

  exports.reactive = reactive;
  exports.readonly = readonly;
  exports.shallowReactive = shallowReactive;
  exports.shallowReadonly = shallowReadonly;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
