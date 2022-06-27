const mutableHandler = {};
const shallowReactiveHandlers = {};
const readonlyHandlers = {};
const shallowReadonlyHanlders = {};
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
function createReactiveObject(target, isReadonly, baseHandler) {
  if (!_isObject(target)) target;
  const proxy = new Proxy(target, baseHandler);
}

/**
 * 判断是否是对象类型
 * @param target
 * @returns
 */
function _isObject(target) {
  return typeof target === 'object' && target !== null;
}
