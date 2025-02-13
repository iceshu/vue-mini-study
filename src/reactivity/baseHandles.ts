import { extend, isObject } from "../shared";
import { track, trigger } from "./effect";
import { ReactiveFlags, isProxy, reactive, readonly } from "./reactive";

function createGetter(isReadonly: boolean = false, shallow: boolean = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);
    if (shallow) {
      return res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    //依赖收集
    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createSetter(isReadonly: boolean = false) {
  return function set(target, key, value) {
    if (isReadonly) {
      console.warn(`当前对象的  不可以赋值`);
      return true;
    }
    const res = Reflect.set(target, key, value);

    //触发依赖
    trigger(target, key);
    return res;
  };
}
export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set: (target, key, value) => {
    console.warn(`key:${key} set 失败 因为 target 是readonly`, target);

    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
