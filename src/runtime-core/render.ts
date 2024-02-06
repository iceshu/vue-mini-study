import { createComponentInstance } from "./compinent";

export const render = (vnode, container) => {
  path(vnode, container);
};
function path(vnode: any, container: any) {
  //TODO 判断vnode是不是一个element
  processElement(vnode, container);

  processComponent(vnode, container);
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode);
}
function processElement(vnode: any, container: any) {
  throw new Error("Function not implemented.");
}
