const {
  calcDtwMatrix,
  dtw,
} = require("../dist/dtw.js");

const { InvalidArgumentError } = require("../dist/errors.js");

it("calcDtwMatrix", () => {
  expect(
    calcDtwMatrix([1, 2, 5, 8, 7, 1], [10, 5, 0, -5, -10])).toEqual(
      [
        [
          { "cost": 9, "path": [-1, -1] },
          { "cost": 13, "path": [0, 0] },
          { "cost": 14, "path": [0, 1] },
          { "cost": 20, "path": [0, 2] },
          { "cost": 31, "path": [0, 3] }
        ],
        [
          { "cost": 17, "path": [0, 0] },
          { "cost": 12, "path": [0, 0] },
          { "cost": 14, "path": [1, 1] },
          { "cost": 21, "path": [1, 2] },
          { "cost": 32, "path": [0, 3] }
        ],
        [
          { "cost": 22, "path": [1, 0] },
          { "cost": 12, "path": [1, 1] },
          { "cost": 17, "path": [2, 1] },
          { "cost": 24, "path": [1, 2] },
          { "cost": 36, "path": [1, 3] }
        ],
        [
          { "cost": 24, "path": [2, 0] },
          { "cost": 15, "path": [2, 1] },
          { "cost": 20, "path": [2, 1] },
          { "cost": 30, "path": [2, 2] },
          { "cost": 42, "path": [2, 3] }
        ],
        [
          { "cost": 27, "path": [3, 0] },
          { "cost": 17, "path": [3, 1] },
          { "cost": 22, "path": [3, 1] },
          { "cost": 32, "path": [3, 2] },
          { "cost": 47, "path": [3, 3] }
        ],
        [
          { "cost": 36, "path": [4, 0] },
          { "cost": 21, "path": [4, 1] },
          { "cost": 18, "path": [4, 1] },
          { "cost": 24, "path": [5, 2] },
          { "cost": 35, "path": [5, 3] }
        ]
      ]
  )
  
  expect(calcDtwMatrix([[1, 1], [2, 2], [3, 2]], [[-1, 1], [2, 2], [3, -2]])).toEqual(
    [
      [
        { "cost": 2, "path": [-1, -1] },
        { "cost": 3.414213562373095, "path": [0, 0] },
        { "cost": 7.019764837837084, "path": [0, 1] }
      ],
      [
        { "cost": 5.16227766016838, "path": [0, 0] },
        { "cost": 2, "path": [0, 0] },
        { "cost": 6.123105625617661, "path": [1, 1] }
      ],
      [
        { "cost": 9.28538328578604, "path": [1, 0] },
        { "cost": 3, "path": [1, 1] },
        { "cost": 6, "path": [1, 1] }
      ]
    ]
  );
});

it("calc", () => {
  expect(dtw([1, 2, 5, 8, 7, 1], [10, 5, 0, -5, -10])).toEqual(35);  
  expect(dtw([[1, 1], [2, 2], [3, 2]], [[-1, 1], [2, 2], [3, -2]])).toEqual(6);
  expect(dtw([0, 1, 2, 3, 4, 5], [0, -1, -2, -3, -4]) > dtw([0, 1, 2, 3, 4, 5], [1, 2, 3, 4, 5])).toBe(true);
});

it("invalid", () => {
  expect(() => {
    calcDtwMatrix([], [0]);
  }).toThrowError(InvalidArgumentError);

  expect(() => {
    calcDtwMatrix([0], [[0,0]]);
  }).toThrowError(InvalidArgumentError);
});
