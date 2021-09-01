const {
  Kmedoids,
  optimize
} = require("../dist/kmedoids.js");
const {
  random,
} = require("../dist/utils.js");

it("fit", async () => {
  expect(await new Kmedoids([
    [0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0],
    [1, 2, 3, 4, 3, 2, 1],
    [4, 3, 2, 1, 2, 3],
  ]).fit(2, {
    prng: random('fit')
  })).toEqual(
    [[[0, 1, 2], [3, 4]], [2, 3]]
  );
});


it("optimize", async () => {
  expect(await optimize(new Kmedoids([
    [0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0],
    [1, 2, 3, 4, 3, 2, 1],
    [4, 3, 2, 1, 2, 3],
  ]), {
    maxCluster: 4,
    prng: random('optimize')
  })).toEqual(
    {
      "clusters": [[0, 1, 2], [3, 4]],
      "k": 2,
      "medoids": [2, 3],
      "scores": [
        { "k": 2, "score": 0.4831484710516969 },
        { "k": 3, "score": 0.20679012345679013 },
        { "k": 4, "score": 0.07142857142857142 }]
    }
  );
});
