import { isObject } from "../shared";
import { ShapeFlags } from "../shared/shapeFlage";
import { createComponentInstance, setupComponent } from "./component";

export const render = (vnode, container) => {
  patch(vnode, container);
};
function patch(vnode: any, container: any) {
  //TODO 判断vnode是不是一个element
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initialVNode: any, container: any) {
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function setupRenderEffect(instance: any, initialVNode: any, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  initialVNode.el = subTree.el;
}
function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  }

  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.append(el);
}
function mountChildren(children: any[], container: any) {
  children.forEach((child) => {
    patch(child, container);
  });
}
