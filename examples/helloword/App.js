import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  name: "App",
  render() {
    return h("div", { id: "home", class: ["red", "bg"] }, [
      h("p", { class: "red" }, "11"),
      h("p", { class: "white" }, this.msg),
      h(Foo, { count: 10 }),
    ]);
  },
  setup() {
    return {
      msg: "mini-vue",
    };
  },
};
