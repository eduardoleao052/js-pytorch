import { Tensor } from "./tensor";
import NestedArray from "./types/utils.types";

/**
 * Recursively gets the shape (length of every dimension) of the Tensor.
 * @param {object} data - Iterable containing the data to be stored in the Tensor.
 * @param {object} shape - Length of every dimension of the Tensor.
 * @returns {object} Length of every dimension of the Tensor.
 */

export function getShape(
  data: NestedArray<number> | number,
  shape: Array<number> = []
): Array<number> {
  // Edge case empty array:
  if (data instanceof Array && data.length === 0) {
    return [0];
  }

  // Base case:
  if (typeof data === "number") {
    // Return [1] for integers:
    if (JSON.stringify(shape) === "[]") {
      return [1];
    }
    // Return shape for objects:
    return shape;
  }
  
  if (typeof data[0] === "number" && Array.isArray(data)) {
    for (const element of data) {
      if (typeof element != "number") {
        throw new Error("The requested array has an inhomogeneous shape.");
      }
    }
    // Return shape for objects:
    shape.push(data.length);
    return shape;
  }

  if (Array.isArray(data[0])) {
    let elementLength = data[0].length;
    // Iterate over elements in dimention to check if all have the same length (homogenous shape):
    for (const element of data) {
       // Throw error if the element is not a number or another iterable:
      if (typeof element != "object" && typeof element != "number") {
        throw new Error("TypeError: the input data is not a number.");
      } else if (Array.isArray(element) && elementLength != element.length) {
      // Throw error if the shape is inhomogenous:
        throw new Error("The requested array has an inhomogeneous shape.");
      } else if (Array.isArray(element)) {
        elementLength = element.length;
      }
    }
    shape.push(data.length);
  }
  return getShape(data[0], shape);
}

/**
 * Assures that the returned iterable is a vanilla JavaScript Array object:
 * @param {object} a - Any numeric iterable or number.
 * @returns {object} Original iterable in an Array format.
 */
export function assureArray(a: Tensor | Array<number> | number): Array<number> {
  if (Array.isArray(a)) {
    return a;
  } else if (typeof a === "number") {
    return [a];
  } else if (a === null) {
    return a;
  }
  return a._data;
}

/**
 * Assures that the returned iterable is of a vanilla JavaScript data type (num of Array object):
 * @param {object} a - Any numeric iterable or number.
 * @returns {object} Original data in a vanilla format.
 */
export function getData(
  a: Tensor | Array<number> | number
): Array<number> | number {
  if (Array.isArray(a)) {
    return a;
  }
  if (typeof a === "number") {
    return a;
  }
  return a._data;
}
