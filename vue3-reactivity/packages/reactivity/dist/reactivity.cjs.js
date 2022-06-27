'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const mutableHandler = {};
const shallowReactiveHandlers = {};
const readonlyHandlers = {};
const shallowReadonlyHanlders = {};
/**
 * @param target
 */
function reactive(target) {
    createReactiveObject(target, true, mutableHandler);
}
function shallowReactive(target) {
    createReactiveObject(target, true, shallowReactiveHandlers);
}
function readonly(target) {
    createReactiveObject(target, false, readonlyHandlers);
}
function shallowReadonly(target) {
    createReactiveObject(target, false, shallowReadonlyHanlders);
}
/**
 * @param target 创建代理的目标
 * @param isReadonly 当前是不是仅读的
 * @param baseHandler 针对不同的方式创建不同的代理对象
 */
function createReactiveObject(target, isReadonly, baseHandler) {
    new Proxy(target, baseHandler);
}

exports.reactive = reactive;
exports.readonly = readonly;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
//# sourceMappingURL=reactivity.cjs.js.map
