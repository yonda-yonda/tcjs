import { isNumber } from "./utils";
import { InvalidArgumentError } from "./errors";

export type DtwValue = { cost: number, path: [number, number] };

function minVal (values:DtwValue[]): DtwValue{
    const sorted = [...values].sort(function(a,b){
        if( a.cost < b.cost ) return -1;
        if( a.cost > b.cost ) return 1;
        return 0;
    });
    return sorted[0]
}

function euclideandistance(a: number | number[], b: number | number[]): number {
    const v1 = isNumber(a) ? [a as number] : a as number[];
    const v2 = isNumber(b) ? [b as number] : b as number[];

    if (v1.length !== v2.length) {
        throw new InvalidArgumentError("arguments must be same length.");
    }
    let distance = 0;
    for (let i = 0; i < v1.length; i++){
        distance += (v1[i] - v2[i]) ** 2;
    }

    return Math.sqrt(distance);
}

export function calcDtwMatrix(
  ts1: number[] | number[][],
  ts2: number[] | number[][],
): DtwValue[][] {
    /*
        References
        ----------
        A global averaging method for dynamic time warping, with applications to clustering
        March 2011Pattern Recognition 44(3):678--693
        Auhtors: François Petitjean, Alain Ketterlin, Pierre Gancarski
    */
    if (!Array.isArray(ts1) || ts1.length < 1) {
        throw new InvalidArgumentError("The first argument is not array.");
    }
    if (!Array.isArray(ts2) || ts2.length < 1) {
        throw new InvalidArgumentError("The second argument is not array.");
    }

    const ret: DtwValue[][] = [[{ cost: euclideandistance(ts1[0], ts2[0]), path: [-1, -1] }]];
    for (let i = 1; i < ts1.length; i++){
        ret.push(
            [{ cost: ret[i - 1][0].cost + euclideandistance(ts1[i], ts2[0]), path: [i - 1, 0]}]
        )
    }
    for (let j = 1; j < ts2.length; j++){
        ret[0][j] = { cost: ret[0][j - 1].cost + euclideandistance(ts1[0], ts2[j]), path: [0, j - 1] };
    }
    for (let i = 1; i < ts1.length; i++) {
        for (let j = 1; j < ts2.length; j++) {
            const min = minVal([
                {
                    cost: ret[i - 1][j].cost,
                    path: [i - 1, j]
                },
                {
                    cost: ret[i][j - 1].cost,
                    path: [i, j - 1]
                },
                {
                    cost: ret[i - 1][j - 1].cost,
                    path: [i - 1, j- 1]
                }]
            )
            ret[i][j] = {
                cost: min.cost + euclideandistance(ts1[i], ts2[j]),
                path: min.path
            }
        }
    }

    return ret;
}


export function dtw(
  ts1: number[] | number[][],
  ts2: number[] | number[][],
): number {
    return calcDtwMatrix(ts1, ts2)[ts1.length - 1][ts2.length - 1].cost
}
