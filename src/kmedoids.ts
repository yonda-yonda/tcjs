import { dtw } from "./dtw";
import { isNumber, randomIndex, range, zip, sum, random } from "./utils";
import { InvalidArgumentError, UnconvergencedError } from "./errors";

type cviOptions = {
    clusters: number[][];
    medoidIndexes: number[];
    distanceMatrix: number[][];
}

export type FitOptions = {
    maxIter?: number;
    initialize?: number;
    prng?: () => number;
}  

export type OptimizeOptions = FitOptions & {
    maxCluster?: number;
    cvi?: "xb" | "db" | "silhouette";
};


export type Optimized = {
    k: number;
    clusters: number[][];
    medoids: number[];
    scores: { k: number, score: number }[];
};


function initKpp(k: number, distanceMatrix: number[][], prng: ()=>number) {
    /*
        References
        ----------
        k-means++: The Advantages of Careful Seeding
        Conference: Proceedings of the Eighteenth Annual ACM-SIAM Symposium on Discrete Algorithms, 
        SODA 2007, New Orleans, Louisiana, USA, January 7-9, 2007
        Auhtors: David Arthur, Sergei Vassilvitskii
    */
    const size = distanceMatrix.length;
    const medoidIndexes: number[] = [randomIndex(size, { prng })];

    for (let i = 1; i < k; i++) {
        const candidateIndexes = range(size).filter((index) => {
            return !medoidIndexes.includes(index)
        });
        const dissimilarities = candidateIndexes.map((candidateIndex) => {
            return Math.min(...medoidIndexes.map((medoidIndex) => {
                return distanceMatrix[candidateIndex][medoidIndex] ** 2;
            }))
        });
        const totalSquareDissimilarity = sum(dissimilarities);
        const candidatePotentials = dissimilarities.map((dissimilarity) => {
            return dissimilarity / totalSquareDissimilarity;
        });
        medoidIndexes.push(candidateIndexes[randomIndex(candidatePotentials, { prng })]);
    }
    medoidIndexes.sort(function (a, b) {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });
    return medoidIndexes;
}

function sse(clusters: number[][], medoidIndexes: number[], distanceMatrix: number[][]):number {
    let ret = 0;
    zip(clusters, medoidIndexes).forEach(([clusterIndexes, medoidIndex]) => {
        clusterIndexes.forEach((clusterIndex) => {
            ret += distanceMatrix[medoidIndex][clusterIndex] ** 2
        })
    })
    return ret;
}

function silhouette(args: cviOptions) {
    /*
        References
        ----------
        Silhouettes: A graphical aid to the interpretation and validation of cluster analysis
        Published in: Journal of Computational and Applied Mathematics Volume 20, November 1987, Pages 53-65
        Auhtors: Peter J.Rousseeuw
    */
    const {clusters, distanceMatrix } = args;
    
    function ai(i: number, clusterIndexes: number[], distanceMatrix: number[][]): number {
        let ret = 0;
        clusterIndexes.forEach((clusterIndex) => {
            ret += distanceMatrix[i][clusterIndex];
        });
        ret /= (clusterIndexes.length - 1);
        return ret;
    }

    function bi(i: number, clusters: number[][], distanceMatrix: number[][]): number {
        let ret = Infinity;

        clusters.forEach((clusterIndexes) => {
            if (!clusterIndexes.includes(i)) {
                let value = 0;
                if (clusterIndexes.length > 0)  {
                    clusterIndexes.forEach((clusterIndex) => {
                        value += distanceMatrix[i][clusterIndex];
                    })
                    value /= clusterIndexes.length;
                }
                if (value < ret)
                    ret = value;
            }
        })
        return ret;
    }
    const values: number[] = [];
    clusters.forEach((clusterIndexes) => {
        let value = 0;
        if (clusterIndexes.length > 1) {
            clusterIndexes.forEach((clusterIndex) => {
                const a = ai(clusterIndex, clusterIndexes, distanceMatrix);
                const b = bi(clusterIndex, clusters, distanceMatrix);
                value += (b - a) / Math.max(a, b);
            })
            values.push(value / clusterIndexes.length);
        }
    })
    return sum(values) / clusters.length;
}

function xb(args: cviOptions) {
    /*
        References
        ----------
        New indices for cluster validity assessment
        Published in: Pattern Recognition Letters Volume 26, Issue 15, November 2005, Pages 2353-2363
        Auhtors: MinhoKim, R.S.Ramakrishna
    */
    const { clusters, medoidIndexes, distanceMatrix } = args;
    let separation = Infinity;
    for (let i = 0; i < medoidIndexes.length; i++) {
        for (let j = i + 1; j < medoidIndexes.length; j++) {
            const candidate = distanceMatrix[medoidIndexes[i]][medoidIndexes[j]] ** 2;
            if (candidate < separation)
                separation = candidate;
        }
    }
    let compactness = 0;
    zip(clusters, medoidIndexes).forEach(([clusterIndexes, medoidIndex]) => {
        let candidate = 0;
        clusterIndexes.forEach((clusterIndex) => {
            candidate += distanceMatrix[medoidIndex][clusterIndex] ** 2
        });
        candidate /= clusterIndexes.length;
        if (candidate > compactness)
            compactness = candidate;
    });
    return compactness / separation;
}

function db(args: cviOptions) {
    /*
        References
        ----------
        New indices for cluster validity assessment
        Published in: Pattern Recognition Letters Volume 26, Issue 15, November 2005, Pages 2353-2363
        Auhtors: MinhoKim, R.S.Ramakrishna
    */
    const { clusters, medoidIndexes, distanceMatrix } = args;
    const averageIntraDistances = zip(clusters, medoidIndexes).map(([clusterIndexes, medoidIndex]) => {
        let distance = 0;
        clusterIndexes.forEach((clusterIndex) => {
            distance += distanceMatrix[medoidIndex][clusterIndex]
        });
        return distance / clusterIndexes.length;
    });
    const k = averageIntraDistances.length;
    let ret = 0;
    for (let i = 0; i < k; i++){
        let otherAverageIntraDistance = 0, minInterClusterDistance = Infinity;
        for (let j = 0; j < k; j++) {
            if (i !== j) {
                if(averageIntraDistances[j] > otherAverageIntraDistance)
                    otherAverageIntraDistance = averageIntraDistances[j];
                if (distanceMatrix[medoidIndexes[i]][medoidIndexes[j]] < minInterClusterDistance)
                    minInterClusterDistance = distanceMatrix[medoidIndexes[i]][medoidIndexes[j]];
            }
        }
        ret += (averageIntraDistances[i] + otherAverageIntraDistance) / minInterClusterDistance;
    }
    return ret / k;
}

function classificate(medoidIndexes: number[], distanceMatrix: number[][]) {
    const clusters: number[][] = medoidIndexes.map(() => []);
    distanceMatrix.forEach((distances, index) => {
        let minDistance = Infinity;
        let minIndex = -1;
        medoidIndexes.forEach((medoidIndex) => {
            const d = distances[medoidIndex];
            if (d < minDistance) {
                minDistance = d;
                minIndex = medoidIndex;
            }
        })
        clusters[medoidIndexes.indexOf(minIndex)].push(index)
    });
    return clusters;
}

export class Kmedoids {
    size: number;
    distances: number[][];

    constructor(values: number[][] | number[][][]) {
        const size = values.length;
        const distances: number[][] = values.map(() => {
            return Array.from({ length: size }, () => 0)
        });
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                const d = dtw(values[i], values[j]);
                distances[i][j] = d;
                distances[j][i] = d;
            }
        }

        this.size = size;
        this.distances = distances;
    }

    fit(
        k: number,
        options: FitOptions,
    ): Promise<[number[][], number[]]> {
        /*
            References
            ----------
            Improved k-medoids clustering based on cluster validity index and object density
            Published in: 2010 IEEE 2nd International Advance Computing Conference (IACC)
            Auhtors: Bharat Pardeshi, Durga Toshniwal
        */
        return new Promise((resolve, reject) => {
            if (this.size < k) {
                reject(new InvalidArgumentError("k is too large."));
            }

            const maxIter = isNumber(options?.maxIter) ? options.maxIter as number : 100;
            const initialize = isNumber(options?.initialize) ? options.initialize as number : 5;
            const prng = options?.prng ? options.prng : random();
        
            let medoidIndexes = initKpp(k, this.distances, prng);
            let clusters: number[][] = classificate(medoidIndexes, this.distances);
            let initScore = sse(clusters, medoidIndexes, this.distances);
            let inited = 1;
            while (inited < initialize) {
                const candidateMedoidIndexes = initKpp(k, this.distances, prng);
                const candidateClusters: number[][] = classificate(candidateMedoidIndexes, this.distances);
                const candidateInitScore = sse(candidateClusters, candidateMedoidIndexes, this.distances);

                if (candidateInitScore < initScore) {
                    medoidIndexes = candidateMedoidIndexes;
                    clusters = candidateClusters;
                    initScore = candidateInitScore;
                }
                inited++;
            }

            let cnt = 0;
            while (cnt++ < maxIter) {
                const newMedoidIndexes: number[] = [];
                clusters.forEach((clusterIndexes) => {
                    let newMedoid = -1;
                    let minVariance = Infinity;
                    clusterIndexes.forEach((index) => {
                        const intraDistances = clusterIndexes.map((otherIndex) => {
                            return this.distances[index][otherIndex]
                        })
                        const variance = sum(intraDistances);
                        if (variance < minVariance) {
                            minVariance = variance;
                            newMedoid = index;
                        }
                    })
                    newMedoidIndexes.push(newMedoid);
                })
                newMedoidIndexes.sort(function (a, b) {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
                if (medoidIndexes.toString() === newMedoidIndexes.toString()) break;
                medoidIndexes = newMedoidIndexes;
                clusters = classificate(newMedoidIndexes, this.distances);
            }
            if (cnt++ === maxIter) reject(new UnconvergencedError());

            resolve([clusters, medoidIndexes])
        });
    }
}

export async function optimize(
    kmedoids: Kmedoids,
    options: OptimizeOptions,
): Promise<Optimized>{
    const max = (typeof options?.maxCluster !== "undefined" && isNumber(options.maxCluster) && options.maxCluster > 2) ?
        (options.maxCluster < kmedoids.size ? options.maxCluster : kmedoids.size) : Math.floor(kmedoids.size / 2);
    const ks = range(2, max + 1);

    let cvi: (args: cviOptions) => number, minimize: boolean;
    switch (options.cvi) {
        case ("xb"):{
            cvi = xb;
            minimize = true;
            break;
        }
        case ("db"):{
            cvi = db;
            minimize = true;
            break;
        }
        default: {
            cvi = silhouette;
            minimize = false;
        }
    }

    let bestScore = minimize ? Infinity : -Infinity, bestMedoids: number[] = [], bestClusters: number[][] = [], bestK = -1;
        
    const scores: { k: number, score: number }[] = [];
    for (let i = 0; i < ks.length; i++) {
        const [clusters, medoidIndexes] = await kmedoids.fit(ks[i], options);
        const score = cvi({
            clusters,
            medoidIndexes,
            distanceMatrix: kmedoids.distances
        });
        scores.push({
            k: ks[i],
            score
        });
        if (minimize ? score < bestScore : score > bestScore) {
            bestScore = score;
            bestMedoids = medoidIndexes;
            bestClusters = clusters;
            bestK = ks[i];
        }
    }
    return {
        scores,
        k: bestK,
        medoids: bestMedoids,
        clusters: bestClusters
    }
}