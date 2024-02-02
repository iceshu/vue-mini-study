import { isReadonly, readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const warped = readonly(original);
    expect(warped).not.toBe(original);
    expect(warped.foo).toBe(1);
    expect(isReadonly(warped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
  });
  it("warn when set", () => {
    console.warn = jest.fn();
    const original = { foo: 1 };

    const warped = readonly(original);
    warped.foo = 2;
    expect(console.warn).toHaveBeenCalled();
  });
});
