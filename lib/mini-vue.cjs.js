'use strict';

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
};
var publicComponentInstanceHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
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
    };
    return component;
}
function setupComponent(instance) {
    //TODO
    //initProps()
    //initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicComponentInstanceHandlers);
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
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
    if (shapeFlag & shapeFlag.ELEMENT) {
        processElement(vnode, container);
    }
    else if (shapeFlag & shapeFlag.STATEFUL_COMPONENT) {
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
    debugger;
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVNode.el = subTree.el;
}
function mountElement(vnode, container) {
    var el = (vnode.el = document.createElement(vnode.type));
    var children = vnode.children, shapeFlag = vnode.shapeFlag;
    if (shapeFlag & shapeFlag.TEXT_CHILDREN) {
        el.textContent = children;
    }
    else if (shapeFlag & shapeFlag.ARRAY_CHILDREN) {
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
