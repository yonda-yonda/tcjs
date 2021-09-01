# tcjs

JavaScript Timeseries Classification Library

* algorithms: K-Medoids
* dissimilarity measure: Dynamic Time Warping
* cluster validity index: Silhouette index, Xie-Beni index, Davies–Bouldin index


Depends: seedrandom


```Javascript
new Kmedoids([
    [0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0],
    [1, 2, 3, 4, 3, 2, 1],
    [4, 3, 2, 1, 2, 3],
]).fit(2);
// [[[0, 1, 2], [3, 4]], [2, 3]]
```

## sample
* [sample1](https://yonda-yonda.github.io/tcjs/docs/sample1.html)
* [sample2](https://yonda-yonda.github.io/tcjs/docs/sample2.html)