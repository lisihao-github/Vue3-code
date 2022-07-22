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
   * @Date: 2022-07-19 15:05:49
   * @LastEditTime: 2022-07-22 16:44:00
   * @Description: file content
   * @LastEditors: 李思豪
   */
  function effect(fn, options = {}) {
      // 将 effect 变为响应式, 当数据变化时重新执行
      const effect = createReactiveEffect(fn);
      if (!options.lazy) { // 默认的effect会先执行
          effect(); // 响应式的effect默认会先执行一次
      }
      return effect;
  }
  let uid = 0;
  let activeEffect; // 存储当前的 effect
  const effectStack = [];
  // 当用户取值的时候需要将 activeEffect 和属性做关联
  // 当用户更改的时候需要通过属性找到 effect 重新执行
  function createReactiveEffect(fn, options) {
      const effect = function reactiveEffect() {
          // if(!effectStack.includes(effect)){
          try {
              effectStack.push(effect);
              activeEffect = effect;
              return fn();
          }
          finally {
              effectStack.pop();
              activeEffect = effectStack[effectStack.length - 1];
          }
          // }
      };
      effect.id = uid++; // 制作一个effect标识 用于区分effect
      effect._isEffect = true; // 用于标识这个是响应式effect
      effect.deps = []; // effect 用来收集依赖了哪些属性
      // effect.raw = fn; // 保留effect对应的原函数
      // effect.options = options; // 在effect上保存用户的属性
      return effect;
  }
  // 收集属性对应的 effect
  const targetMap = new WeakMap();
  function track(target, type, key) {
      //  activeEffect; // 当前正在运行的effect
      if (activeEffect === undefined) { // 此属性不用收集依赖，因为没在effect中使用
          return;
      }
      let depsMap = targetMap.get(target);
      if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()));
      }
      let dep = depsMap.get(key);
      if (!dep) {
          depsMap.set(key, (dep = new Set()));
      }
      if (!dep.has(activeEffect)) {
          dep.add(activeEffect);
      }
  }
  // 找到属性对应的 effect 让其执行 (数组、对象)
  function trigger(target, type, key, newValue, oldValue) {
      // 如果这个属性没有 收集过 effect, 那不需要做任何操作
      const depsMap = targetMap.get(target);
      if (!depsMap)
          return;
      const effects = new Set(); //这里对 effect 去重
      const add = (effectsToAdd) => {
          if (effectsToAdd) {
              effectsToAdd.forEach(effect => effects.add(effect));
          }
      };
      // 我要将所有的 要执行的effect 全部存到一个新的集合中，最终一起执行
      // 1.如果更改的数组长度 小于依赖收集的长度 要触发重新渲染
      // 2.如果调用了 push 方法 或者其他新增数组方法 (必须能改变长度的方法) 也要触发更新
      if (key === 'length' && _isArray(target)) { // 如果是数组, 你改了 length
          // 如果对应的长度 有依赖收集需要更新
          depsMap.forEach((dep, key) => {
              if (key === 'length' || key > newValue) {
                  add(dep); // 更改的数组长度 比收集到的属性的值小
              }
          });
      }
      else {
          // 可能是对象
          if (key !== undefined) {
              add(depsMap.get(key));
          }
          switch (type) {
              case 'add':
                  if (_isArray(target) && _isIntegerKey(key)) {
                      add(depsMap.get('length')); // 新增属性 需要触发 length 的依赖收集
                  }
          }
      }
      effects.forEach((effect) => effect());
  }

  /*
  * @Author: 李思豪
  * @Date: 2022-07-13 16:07:17
   * @LastEditTime: 2022-07-22 16:32:09
  * @Description: file content
   * @LastEditors: 李思豪
  */
  /**
   *
   * @param isReadonly
   * @param shallow
   * @returns
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
          if (!isReadonly) {
              // console.log('收集当前属性, 如果属性变化了, 稍后可能要更新视图')
              track(target, 'get', key);
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
  /**
   * 设置属性, 可能是新增属性, 还有可能是修改属性值
   * @param shallow
   * @returns
   */
  function createSetter(shallow = false) {
      // 针对数组而言, 如果调用 push 方法, 就会产生 2 次触发
      // 1. 给数组新增了一项，同时也更改了长度
      // 2. 因为更改了长度再次触发 set (第二次触发是无意义的)
      return function set(target, key, value, receiver) {
          const oldValue = target[key];
          // 判断数组是新增还是修改
          let hadKey = _isArray(target) && _isIntegerKey(key) ? Number(key) < target.length : _hasOwn(target, key);
          // 先判断有没有，再去设置值
          const res = Reflect.set(target, key, value, receiver);
          if (!hadKey) {
              console.log('新增');
              trigger(target, 'add', key, value);
          }
          else if (_hasChanged(oldValue, value)) {
              console.log('修改');
              trigger(target, 'set', key, value);
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

  /*
   * @Author: 李思豪
   * @Date: 2022-07-22 16:53:51
   * @LastEditTime: 2022-07-22 17:20:16
   * @Description: file content
   * @LastEditors: 李思豪
   */
  function ref(value) {
      // 把普通值变成一个引用类型，让一个普通值也具备响应式的能力
      return createRef(value);
  }
  const conver = (v) => _isObject(v) ? reactive(v) : v;
  // ts 中实现类  -- 私有属性必须先声明才能使用
  class RefIml {
      constructor(rawValue, shallow) {
          this.rawValue = rawValue;
          this.shallow = shallow;
          this._v_isRef = true; // 表示他是一个 ref
          // public rawVal ===   (this.rawValue = rawValue)
          this._value = shallow ? rawValue : conver(rawValue);
      }
      get value() {
          // 收集依赖
          track(this, 'get', 'value');
          return this._value;
      }
      set value(newValue) {
          if (_hasChanged(newValue, this.rawValue)) {
              // 触发依赖
              this.rawValue = newValue;
              this._value = this.shallow ? newValue : conver(newValue);
              trigger(this, 'set', 'value', newValue, this.rawValue);
          }
      }
  }
  function createRef(value, shallow = false) {
      return new RefIml(value, shallow); // 借助类的属性访问器
  }

  exports.effect = effect;
  exports.reactive = reactive;
  exports.readonly = readonly;
  exports.ref = ref;
  exports.shallowReactive = shallowReactive;
  exports.shallowReadonly = shallowReadonly;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
