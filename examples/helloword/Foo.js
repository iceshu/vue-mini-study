import { h } from "../../lib/mini-vue.esm.js";
export const Foo = {
  setup(props) {
    props.count++;
    console.log("1111", props);
  },
  render() {
    return h("div", {}, "foo+" + this.count);
  },
};
