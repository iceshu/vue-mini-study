import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value;
    //value 对象就是reactive 否则就是普通值
    this._value = covert(value);
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    // newValue==this._value => 无需重新渲染
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = covert(newValue);
      triggerEffects(this.dep);
    }
  }
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
export const isRef = (ref) => {
  return !!ref.__v_isRef;
};
export const unRef = (ref) => {
  return isRef(ref) ? ref.value : ref;
};
function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}
function covert(newValue) {
  return isObject(newValue) ? reactive(newValue) : newValue;
}
export const ref = (value) => {
  return new RefImpl(value);
};
