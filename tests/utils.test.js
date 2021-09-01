const {
  isNumber,
  sum,
  zip,
  range,
  random,
  randomIndex
} = require("../dist/utils.js");

it("isNumber", () => {
  expect(isNumber(1)).toBe(true);
  expect(isNumber("1")).toBe(false);
  expect(isNumber(NaN)).toBe(false);
});

it("sum", () => {
  expect(sum([1,2,3])).toBe(6);
});

it("zip", () => {
  expect(zip([1, 2, 3], ["a", "b", "c"])).toEqual([
    [1, "a"], [2, "b"], [3, "c"]
  ]);
});

it("range", () => {
  expect(range(3)).toEqual([0, 1, 2]);
  expect(range(1, 4)).toEqual([1, 2, 3]);
  expect(range(-4, 1)).toEqual([-4, -3, -2, -1, 0]);
});

it("random", () => {
  const prng = random('hello.')
  expect(prng()).toBe(0.9282578795792454);
});

it("randomIndex", () => {
  expect(randomIndex(5, {
    prng: random('hello.')
  })).toBe(4);

  expect(randomIndex([4, 3, 10, 5, 1, 2], {
    prng: random('hello.')
  })).toBe(5);
});