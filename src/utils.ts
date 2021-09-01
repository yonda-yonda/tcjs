import seedrandom from 'seedrandom';
import { InvalidArgumentError } from "./errors";

export const isNumber = (n: any): boolean => { // eslint-disable-line
  return typeof n === "number" && isFinite(n);
};

export const range = (a: number, b?: number): number[] => {
  let start = Number.isInteger(b) ? a : 0;
  let end = (Number.isInteger(b) ? b : a) as number;

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    throw new InvalidArgumentError("arguments must be integer.");
  }
  if (start > end) [start, end] = [end, start];
  return Array.from({ length : end - start }, (_, i) => i + start);
}

export const sum = (values: number[]): number => {
  return values.reduce((sum, weight) => {
    return sum + weight;
  }, 0);
}

export const zip = <S, T>(arr1: S[], arr2: T[]): [S, T][] => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) {
      throw new InvalidArgumentError("arguments must be same length array.");
    }

    const length = arr1.length;
    const ret: [S, T][] = [];
    for (let i = 0; i < length; i++){
        ret.push([arr1[i], arr2[i]])
    }
    return ret;
}

export const random = (seed?: string):()=> number => { 
  const rng = seedrandom(seed);

  return ():number => {
    return rng();
  };
}

export type RandomIndexOptions = {
  prng?: ()=>number
}

export const randomIndex = (v: number | number[], options?:RandomIndexOptions ): number => {
  // v is length or array of weight.
  const prng = options?.prng ? options.prng : random();

  if (isNumber(v)) {
    const length = v as number;
    if (length < 1 || !Number.isInteger(length)) {
        throw new InvalidArgumentError("length must be positive integer.");
    }
    return Math.floor(prng() * length);
  }

  const weights = v as number[];
  const totalWeight = weights.reduce((sum, weight) => {
    if (weight < 0) {
        throw new InvalidArgumentError("weight must be positive value.");
    }
    return sum + weight;
  }, 0);
  const rand = prng() * totalWeight;
  let threshold = 0;
  for (let i = 0; i < weights.length - 1; i++){
    threshold += weights[i];
    if (rand < threshold) return i;
  }
  return weights.length - 1;
};
