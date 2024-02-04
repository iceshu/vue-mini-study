import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  test("表层", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });
});
