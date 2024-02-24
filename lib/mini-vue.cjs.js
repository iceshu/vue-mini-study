'use strict';

var extend = Object.assign;
var isObject = function (val) { return val !== null && typeof val === "object"; };
var hasOwn = function (val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
};

var targetMap = new Map();
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    var dep = depsMap.get(key);
    if (!dep) {
        return;
    }
    triggerEffects(dep);
}
var triggerEffects = function (dep) {
    for (var _i = 0, dep_1 = dep; _i < dep_1.length; _i++) {
        var effect_1 = dep_1[_i];
        if (effect_1.scheduler) {
            effect_1.scheduler();
        }
        else {
            effect_1.run();
        }
    }
};

function createGetter(isReadonly, shallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (shallow === void 0) { shallow = false; }
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
function createSetter(isReadonly) {
    if (isReadonly === void 0) { isReadonly = false; }
    return function set(target, key, value) {
        if (isReadonly) {
            console.warn("\u5F53\u524D\u5BF9\u8C61\u7684  \u4E0D\u53EF\u4EE5\u8D4B\u503C");
            return true;
        }
        var res = Reflect.set(target, key, value);
        //触发依赖
        trigger(target, key);
        return res;
    };
}
var mutableHandlers = {
    get: get,
    set: set,
};
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn("key:".concat(key, " set \u5931\u8D25 \u56E0\u4E3A target \u662Freadonly"), target);
        return true;
    },
};
var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn("target 必须是对象");
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

function emit(instance, event) {
    console.log("event");
    instance.props;
}

var initProps = function (instance, rawProps) {
    instance.props = rawProps || {};
};

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
};
var publicComponentInstanceHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: function () { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    //TODO
    initProps(instance, instance.vnode.props);
    //initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicComponentInstanceHandlers);
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

var render = function (vnode, container) {
    patch(vnode, container);
};
function patch(vnode, container) {
    //TODO 判断vnode是不是一个element
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    var instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVNode.el = subTree.el;
}
function mountElement(vnode, container) {
    var el = (vnode.el = document.createElement(vnode.type));
    var children = vnode.children, shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    var props = vnode.props;
    for (var key in props) {
        var val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(children, container) {
    children.forEach(function (child) {
        patch(child, container);
    });
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
