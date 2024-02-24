import { isObject } from "../shared";
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandles";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers);
}

export function isProxy(val) {
  return isReactive(val) || isReadonly(val);
}
export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers);
}

function createActiveObject(raw, baseHandlers) {
  if (!isObject(raw)) {
    console.warn("target 必须是对象");

    return raw;
  }
  return new Proxy(raw, baseHandlers);
}
