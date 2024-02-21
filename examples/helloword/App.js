import { h } from "../../lib/mini-vue.esm.js";
window.self;
export const App = {
  render() {
    window.self = this;
    return h("div", { id: "home", class: ["red", "bg"] }, [
      h("p", { class: "red" }, "11"),
      h("p", { class: "white" }, this.msg),
    ]);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
