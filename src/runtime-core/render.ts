import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export const render = (vnode, container) => {
  patch(vnode, container);
};
function patch(vnode: any, container: any) {
  //TODO 判断vnode是不是一个element
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
  console.log(vnode.type);
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
  const { children } = vnode;
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
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
