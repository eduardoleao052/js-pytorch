import { getShape, getData, assureArray } from "./utils";

// <<< Tensor class, holds n-dimensional tensors, and multiple useful methods >>> //

export class Tensor {
  public requires_grad: boolean = false;
  public _data: Array<any>;
  public shape: Array<any>;
  public _grad!: Tensor;
  public children: Array<any>;
  public parents: Array<any>;
  public operation: any;
  public visited: boolean = false;
  public m!: Tensor;
  public v!: Tensor;
  public device: string;
  public forwardKernel: any;
  public backwardKernelA: any;
  public backwardKernelB: any;
  public batch_size: number | null;
  public gpu: any;
  public warned: boolean;

  /**
   * Creates new instance of the Tensor class.
   * @param {object} data - Iterable containing the data to be stored in the Tensor.
   * @param {boolean} requires_grad - Whether to keep track of this tensor's gradients.
   * @param {string} device - Device to store Tensor. Either "gpu" or "cpu".
   */
  constructor(data: Array<any> | number, requires_grad = false, device = 'cpu') {
    if (typeof data === "object") {
      this._data = data;
    } else if (typeof data === "number") {
      this._data = [data];
    } else {
      throw Error('Your argument "data" is not a number or an iterable.');
    }
    this.shape = getShape(data);
    this.device = device;
    this.requires_grad = requires_grad;
    this.forwardKernel = null;
    this.batch_size = null;
    this.gpu = null;
    this.warned = false;

    // Initialize momentum and velocity cumulatives for every parameter:
    if (this.requires_grad) {
      this._grad = zeros(this.shape);
    }

    // Graph connections:
    this.children = [];
    this.parents = [];
    this.operation = null;
    this.visited = false;
  }

  /**
   * Returns the data in the Tensor.
   */
  get data(): Array<any> {
    return this._data;
  }

  /**
   * Returns the data's length'.
   */
  get length() {
    return this._data.length;
  }

  /**
   * Returns the number of dimensions in the Tensor.
   */
  get ndims() {
    return this.shape.length;
  }

  /**
   * Returns the tensor's gradients.
   */
  get grad() {
    return this._grad?.data;
  }

  /**
   * Performs backward pass from THIS tensor backwards.
   * It fills every tensor that originated this one and that has requires_grad=true's gradients to their gradients relative to THIS tensor.
   */
  backward(grad: Tensor | null = null, child: Tensor | null = null) {
    // Guarantee that this tensor requires grad:
    if (!this.requires_grad) {
      throw new Error("this tensor has requires_grad set to False");
    }

    // If this is the root tensor, grad is just ones,
    // and we remove all children from this point on from the Graph:
    if (grad === null) {
      grad = ones(this.shape);
      this.children = [];
    }

    // Add upstream gradient to this._grad:
    this._grad = new Tensor(_add(this._grad?.data, grad.data));

    if (child != null) {
      const idx = this.children.indexOf(child);
      this.children.splice(idx, 1);
    }

    // If this Tensor is the product of an Operation:
    if (this.operation != null) {
      // When all the children have been visited, propagate further back:
      if (this.children.length === 0) {
        this.operation.backward(this._grad, this);
      }
    }
  }

  /**
   * Sends this Tensor to the provided device.
   * @param {string} device - Device to store Tensor. Either "gpu" or "cpu".
   * @param {boolean} requires_grad - Whether to keep track of this tensor's gradients.
   * @param {string} device - gpu or cpu: device to store Tensor.
   */
  to(device: string) {
    this.device = device;
  }

  /**
   * Reset this Tensor's gradients to zero.
   */
  zero_grad() {
    this._grad = zeros(this.shape);
    this.children = [];
    this.parents = [];
    this.operation = null;
    if (this.m instanceof Tensor && this.v instanceof Tensor) {
      this.m.zero_grad_graph();
      this.v.zero_grad_graph();
    }
  }

  /**
   * Reset the gradients of this Tensor, and of all of the Tensors that led to it.
   */
  zero_grad_graph() {
    this.zero_grad();
    if (this.operation != null) {
      for (const parent of this.parents) {
        parent.zero_grad_graph();
        parent.parents = [];
      }
      this.operation = null;
      this.parents = [];
      this.children = [];
    }
  }

  /**
   * Turns the data in the Tensor into a javascript list object.
   */
  tolist() {
    return this._data;
  }

  /**
   * Gets the sum of the Tensor over a specified dimension.
   * @param {number} dim - Dimension to sum over.
   * @param {boolean} keepdims - Whether to keep dimensions of original tensor.
   * @returns {Tensor} - Final tensor.
   */
  sum(dim = -1, keepdims = false) {
    const operation = new Sum();
    return operation.forward(this, dim, keepdims);
  }

  /**
   * Gets the mean of the Tensor over a specified dimension.
   * @param {number} dim - Dimension to get mean over.
   * @param {boolean} keepdims - Whether to keep dimensions of original tensor.
   * @returns {Tensor} - Final tensor.
   */
  mean(dim = -1, keepdims = false) {
    const operation = new Mean();
    return operation.forward(this, dim, keepdims);
  }

  /**
   * Gets the variance of the Tensor over a specified dimension.
   * @param {number} dim - Dimension to get variance over.
   * @param {boolean} keepdims - Whether to keep dimensions of original tensor.
   * @returns {Tensor} - Final tensor.
   */
  variance(dim = -1, keepdims = false) {
    const operation = new Variance();
    return operation.forward(this, dim, keepdims);
  }

  /**
   * Add integer or other Tensor to this Tensor.
   * @param {any} other - Tensor or integer to be added to this Tensor.
   * @returns {object} New tensor.
   */
  add(other: Tensor | number): Tensor {
    const operation = new Add();
    return operation.forward(this, other);
  }

  /**
   * Subtract integer or other Tensor from this Tensor.
   * @param {any} other - Tensor or integer to be subtracted from this Tensor.
   * @returns {object} New tensor.
   */
  sub(other: Tensor | number): Tensor {
    if (typeof other === "number") {
      return this.add(-other);
    } else if (other instanceof Tensor) {
      return this.add(other.neg());
    } else {
      throw Error('Argument "other" is not a Tensor or a number.');
    }
  }

  /**
   * Get element-wise opposite of given tensor ( every element * (-1) )
   * @returns {object} New tensor.
   */
  neg() {
    const operation = new Neg();
    return operation.forward(this);
  }

  /**
   * Multiply this Tensor by integer or other Tensor.
   * @param {any} other - Tensor or integer to multiply this Tensor by.
   * @returns {object} New tensor.
   */
  mul(other: Tensor | number): Tensor {
    const operation = new Mul();
    return operation.forward(this, other);
  }

  /**
   * Divide this Tensor by integer or other Tensor.
   * @param {Tensor | number} other - Tensor or integer to divide this Tensor by.
   * @returns {Tensor} New tensor.
   */
  div(other: Tensor | number): Tensor {
    const operation = new Div();
    return operation.forward(this, other);
  }

  /**
   * Multiply this Tensor by integer or other Tensor.
   * @param {Tensor | number} other - Tensor or integer to multiply this Tensor by.
   * @returns {Tensor} New tensor.
   */
  matmul(other: Tensor): Tensor {
    const operation = new MatMul();
    let device;
    if (this.device === "gpu" || other.device === "gpu") {
      device = "gpu";
    } else {
      device = "cpu";
    }
    // On first iteration, create CPU or GPU kernel for matmul:
    if (other.forwardKernel === null || other.batch_size != this.shape.at(-2)) {
      if (device === "gpu") {
        // Get GPU from GPU.js:
        const {GPU} = require('@eduardoleao052/gpu');
        // If the batch size changed, warn user and update the batch size:
        if (other.batch_size != null){
          other.batch_size = other.shape.at(-2);
          if (other.warned === false) {
            console.warn('Testing batch size different from training batch size. JS-PyTorch recreating GPU Kernel (Less efficient)')
            other.warned = true;
          }
        }
        other.gpu = new GPU();
        // Define Kernel function for matmul:
        const kernelFunc = function(this: any, a: number[][], b: number[][], len: number): number {
          let sum = 0;
          for (let i = 0; i < len; i++) {
            sum += a[this.thread.y][i] * b[i][this.thread.x];
          }
          return sum;
        }
        // Create and store the GPU kernels:
        other.forwardKernel = other.gpu.createKernel(kernelFunc, { loopMaxIterations: other.shape.at(-2) }).setOutput([other.shape.at(-1), this.shape.at(-2)]);
        other.backwardKernelA = other.gpu.createKernel(kernelFunc, { loopMaxIterations: other.shape.at(-1) }).setOutput([this.shape.at(-1), this.shape.at(-2)]);
        other.backwardKernelB = other.gpu.createKernel(kernelFunc, { loopMaxIterations: this.shape.at(-2) }).setOutput([other.shape.at(-1), other.shape.at(-2)]);
      } else {
        // Build the CPU kernel:
        const kernelFunc = function (a: number[][], b: number[][], len: number) {
          const out = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
          for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b[0].length; j++) {
              let currentIndex = 0;
              for (let k = 0; k < len; k++) {
                currentIndex += a[i][k] * b[k][j];
              }
              out[i][j] = currentIndex;
            }
          }
          return out;
        }
        // Store the CPU kernels:
        other.forwardKernel = kernelFunc;
        other.backwardKernelA = kernelFunc;
        other.backwardKernelB = kernelFunc;
      }
    }
    // Store the batch size. If the batch size changes, we will create a new GPU kernel:
    other.batch_size = this.shape.at(-2);
    return operation.forward(this, other);
  }

  /**
   * Get tensor to element-wise power of n.
   * @param {number} n - Exponent.
   * @returns {object} New tensor.
   */
  pow(n: number): Tensor {
    const operation = new Pow();
    return operation.forward(this, n);
  }

  /**
   * Get element-wise square root of given tensor.
   * @returns {object} New tensor.
   */
  sqrt() {
    const operation = new Sqrt();
    return operation.forward(this);
  }

  /**
   * Get element-wise exponentiation of given tensor ( e^(every element) )
   * @returns {object} New tensor.
   */
  exp() {
    const operation = new Exp();
    return operation.forward(this);
  }

  /**
   * Get element-wise natural log of given tensor ( ln(every element) )
   * @returns {object} New tensor.
   */
  log() {
    const operation = new Log();
    return operation.forward(this);
  }

  /**
   * Transpose the tensor along two consecutive dimensions:
   * @param {number} dim1 - First dimension.
   * @param {number} dim2 - Second dimension.
   * @returns {object} New tensor.
   */
  transpose(dim1: number, dim2: number): Tensor {
    const operation = new Transpose();
    return operation.forward(this, dim1, dim2);
  }

  /**
   * In a tensor, returns a list of elements in [index1], or [index1][index2];
   * @param {object} index1 - List containing indexes to extract data from in first dimension.
   * @param {object} index2 - List containing indexes to extract data from in second dimension [OPTIONAL].
   * @returns {object} New tensor.
   * @example
   * let a = tensor([[1,1,2,3],
   *                 [6,7,8,9]])
   *
   * // Returns tensor([2,6,9]):
   * a.at([0,1,1], [2,0,3])
   *
   * // Returns tensor([[1,1,2,3],
   *                    [6,7,8,9],
   *                    [1,1,2,3]])
   * a.at([0,1,0])
   */
  at(index1: Tensor | Array<any>, index2?: Tensor | Array<any>): Tensor {
    const operation = new At();
    return operation.forward(this, index1, index2);
  }

  /**
   * Where the "condition" function returns True in "mask" Tensor, the "value" will fill the "this" Tensor.
   * @param {Tensor} mask - "condition" will be applied in this tensor element-wise.
   * @param {function} condition - Function that returns True or False element-wise.
   * @param {number} value - Value to fill Tensor when condition is met.
   * @returns {object} New tensor.
   * @example
   * let a = tensor([[1,5,2,3],
   *                 [6,7,2,9]])
   *
   * // Returns tensor([[1,0,2,3],
   * //                 [0,0,2,0]])
   * a.masked_fill(mask, (el) => {return el > 3}, 0)
   */
  masked_fill(
    mask: Tensor,
    condition: (someArg: number) => boolean,
    value: number
  ) {
    const operation = new MaskedFill();
    return operation.forward(this, mask, condition, value);
  }

  /**
   * Reshape the tensor into the new shape:
   * @param {object} shape - New tensor's shape.
   * @returns {object} New tensor.
   */
  reshape(shape: Array<number>) {
    const operation = new Reshape();
    return operation.forward(this, shape);
  }
}

// <<< Parameter class, tensor that always tracks gradients >>> //

export class Parameter extends Tensor {
  /**
   * Creates new Parameter (an instance of the Tensor class that always tracks gradients).
   * @param {object} data - Iterable containing the data to be stored in the Tensor.
   */
  constructor(data: Array<any> | number) {
    super(data, true);
  }
}

// <<< Basic Operations >>> //

export class Add {
  cache: any;

  /**
   * Add tensors or tensor and integers.
   * @param {any} a - First tensor or integer.
   * @param {any} b - Second tensor or integer.
   * @returns {object} New tensor.
   */
  forward(a: Tensor | number | number, b: Tensor | number | number): Tensor {
    // Build cache to use in backward step:
    this.cache = [a, b];

    const aData = getData(a);
    const bData = getData(b);

    // Call recursive function:
    const z = new Tensor(
      _add(aData, bData), // data;
      requiresGrad(a) || requiresGrad(b) // requires_grad;
    );

    // Connect nodes in graph:
    if (a instanceof Tensor && requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
    }
    if (b instanceof Tensor && requiresGrad(b)) {
      z.parents.push(b);
      b.children.push(z);
    }
    z.operation = this;

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const [a, b] = this.cache;

    // Find gradients relative to "a", and pass it downstream:
    if (requiresGrad(a)) {
      let da = dz;
      // Rescale gradient to have the same shape as "a":
      da = broadcast(da, a);
      a.backward(da, z);
    }

    // Find gradients relative to "b", and pass it downstream:
    if (requiresGrad(b)) {
      let db = dz;
      // Rescale gradient to have the same shape as "b":
      db = broadcast(db, b);
      b.backward(db, z);
    }
  }
}

export class Neg {
  cache: any;

  /**
   * Get element-wise opposite of given tensor ( every element * (-1) )
   * @param {object} a - Tensor to be multiplied by -1.
   * @returns {object} New tensor.
   */
  forward(a: Tensor): Tensor {
    // Build cache to use in backward step:
    this.cache = a;

    // Call recursive function:
    const z = new Tensor(
      _neg(a._data), // data;
      requiresGrad(a) // requires_grad;
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const a = this.cache;

    if (requiresGrad(a)) {
      const da = neg(dz);
      a.backward(da, z);
    }
  }
}

export class Mul {
  cache: any;

  /**
   * Perform element-wise multiplication between Tensors and integers or other Tensors.
   * @param {any} a - First tensor or integer.
   * @param {any} b - Second tensor or integer.
   * @returns {object} New tensor.
   */
  forward(a: Tensor | number, b: Tensor | number): Tensor {
    // Build cache to use in backward step:
    this.cache = [a, b];

    const aData = getData(a);
    const bData = getData(b);

    // Call recursive function:
    const z = new Tensor(
      _mul(aData, bData), // data;
      requiresGrad(a) || requiresGrad(b) // requires_grad;
    );

    // Connect nodes in graph:
    if (a instanceof Tensor && requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
    }
    if (b instanceof Tensor && requiresGrad(b)) {
      z.parents.push(b);
      b.children.push(z);
    }
    z.operation = this;

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const [a, b] = this.cache;

    // Find gradients relative to "a", and pass it downstream:
    if (requiresGrad(a)) {
      let da = new Tensor(_mul(dz.data, getData(b)));
      // Rescale gradient to have the same shape as "a":
      da = broadcast(da, a);
      a.backward(da, z);
    }

    // Find gradients relative to "b", and pass it downstream:
    if (requiresGrad(b)) {
      let db = new Tensor(_mul(dz.data, getData(a)));
      // Rescale gradient to have the same shape as "b":
      db = broadcast(db, b);
      b.backward(db, z);
    }
  }
}

export class Div {
  cache: any;

  /**
   * Perform element-wise division between Tensors and integers or other Tensors.
   * @param {any} a - First tensor or integer.
   * @param {any} b - Second tensor or integer.
   * @returns {object} New tensor.
   */
  forward(a: Tensor, b: Tensor | number): Tensor {
    // Build cache to use in backward step:
    this.cache = [a, b];

    const aData = getData(a);
    const bData = getData(b);

    // Call recursive function:
    const z = new Tensor(
      _div(aData, bData), // data;
      requiresGrad(a) || requiresGrad(b) // requires_grad;
    );

    // Connect nodes in graph:
    if (a instanceof Tensor && requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
    }
    if (b instanceof Tensor && requiresGrad(b)) {
      z.parents.push(b);
      b.children.push(z);
    }
    z.operation = this;

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const [a, b] = this.cache;

    // Find gradients relative to "a", and pass it downstream:
    if (requiresGrad(a)) {
      // d/da(a/b) = (1/b), apply chain rule:
      let da = new Tensor(_mul(dz.data, _div(1, getData(b))));

      // Rescale gradient to have the same shape as "a":
      da = broadcast(da, a);

      a.backward(da, z);
    }

    // Find gradients relative to "b", and pass it downstream:
    if (requiresGrad(b)) {
      // d/db(a/b) = -(a/b^2), apply chain rule:
      let db = new Tensor(
        _mul(dz.data, _neg(_div(getData(a), _pow(getData(b), 2))))
      );
      // Rescale gradient to have the same shape as "b":
      db = broadcast(db, b);

      b.backward(db, z);
    }
  }
}

class MatMul {
  cache: any;
  kernelFunc: any;
  thread: any;
  forward(a: Tensor, b: Tensor) {
    this.cache = [a, b];
    let aData = a.data;
    let bData = b.data;
    
    if (a.shape.length < b.shape.length) {
      aData = broadcastUp(aData, bData);
    } else {
      bData = broadcastUp(bData, aData);
    }
    const z = new Tensor(
      _matmul(aData, bData, b.forwardKernel),
      // data;
      requiresGrad(a) || requiresGrad(b)
      // requires_grad;
    );
    if (a instanceof Tensor && requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
    }
    if (b instanceof Tensor && requiresGrad(b)) {
      z.parents.push(b);
      b.children.push(z);
    }
    z.operation = this;
    return z;
  }
  backward(dz: Tensor, z: Tensor) {
    const [a, b] = this.cache;
    if (requiresGrad(a)) {
      const dzData = dz.data;
      let b_T = _transpose(b.data, b.ndims - 2);
      b_T = broadcastUp(b_T, dzData);
      let da = new Tensor(_matmul(dzData, b_T, b.backwardKernelA));
      da = broadcast(da, a);
      a.backward(da, z);
    }
    if (requiresGrad(b)) {
      const dzData = dz.data;
      let a_T = _transpose(a.data, a.ndims - 2);
      a_T = broadcastUp(a_T, dzData);
      let db = new Tensor(_matmul(a_T, dzData, b.backwardKernelB));
      db = broadcast(db, b);
      b.backward(db, z);
    }
  }
}

export class Pow {
  cache: any;

  /**
   * Get tensor to element-wise power of n.
   * @param {object} a - Tensor to be elevated to the power of n.
   * @param {number} n - Exponent.
   * @returns {object} New tensor.
   */
  forward(a: Tensor, n: number): Tensor {
    // Build cache to use in backward step:
    this.cache = a;

    // Call recursive function:
    const z = new Tensor(
      _pow(getData(a), n), // data;
      requiresGrad(a) // requires_grad;
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const a = this.cache;

    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      // d/da(e^a) = e^a, apply the chain rule to the derivative of e^a:
      const da = new Tensor(_mul(2, _mul(a.data, dz.data)));
      a.backward(da, z);
    }
  }
}

export class Sqrt {
  cache: any;

  /**
   * Get element-wise square root of given tensor
   * @param {object} a - Tensor to be square rooted.
   * @returns {object} New tensor.
   */
  forward(a: Tensor): Tensor {
    // Build cache to use in backward step:
    this.cache = a;

    // Call recursive function:
    const z = new Tensor(
      _sqrt(a._data), // data;
      requiresGrad(a) // requires_grad;
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const a = this.cache;

    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      // d/da(sqrt(a)) = (1/2) *  (1/sqrt(a)), apply the chain rule to the derivative of e^a:
      const da = new Tensor(
        _mul(_mul(_div(1, 2), _div(1, _sqrt(a.data))), dz.data)
      );
      a.backward(da, z);
    }
  }
}

export class Exp {
  cache: any;
  /**
   * Get element-wise exponentiation of given tensor ( e^(every element) )
   * @param {object} a - Tensor to be exponentiated.
   * @returns {object} New tensor.
   */
  forward(a: Tensor): Tensor {
    // Build cache to use in backward step:
    this.cache = a;

    // Call recursive function:
    const z = new Tensor(
      _exp(a._data), // data;
      requiresGrad(a) // requires_grad;
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const a = this.cache;

    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      // d/da(e^a) = e^a, apply the chain rule to the derivative of e^a:
      const da = new Tensor(_mul(_exp(a.data), dz.data));
      a.backward(da, z);
    }
  }
}

export class Log {
  cache: any;

  /**
   * Get element-wise natural log of given tensor ( ln(every element) )
   * @param {object} a - Tensor we will take the log of.
   * @returns {object} New tensor.
   */
  forward(a: Tensor): Tensor {
    // Build cache to use in backward step:
    this.cache = a;

    // Call recursive function:
    const z = new Tensor(
      _log(a._data), // data;
      requiresGrad(a) // requires_grad;
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const a = this.cache;

    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      // d/da(ln(a)) = (1/a), apply the chain rule to the derivative of the natural log:
      const da = new Tensor(_mul(_div(1, a.data), dz.data));

      a.backward(da, z);
    }
  }
}

// <<< Tensor Statistics >>> //

export class Sum {
  cache: any;

  /**
   * Gets the sum of a Tensor over a specified dimension.
   * @param {Tensor} a - Tensor to sum.
   * @param {dim} dim - Dimension to sum over.
   * @param {keepdims} keepdims - Whether to keep dimensions of original tensor.
   * @returns {Tensor} - Final tensor.
   */
  forward(a: Tensor, dim: number, keepdims = false): Tensor {
    // Build cache to use in backward step:
    this.cache = [a, dim, keepdims];

    // Account for negative dimension index:
    if (dim < 0) {
      dim = a.shape.length + dim;
    }
    // Return error if dimension is out of bounds:
    if (dim >= a.shape.length) {
      throw Error("Dimension larger than array.");
    }
    // Create output tensor:
    const z = new Tensor(
      _sum(a._data, dim, keepdims), // New data.
      requiresGrad(a) // requires_grad.
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const [a, dim, keepdims] = this.cache;

    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      if (keepdims) {
        dz = dz.sum(dim);
      }

      const da = broadcast(dz, a);

      a.backward(da, z);
    }
  }
}

export class Mean {
  cache: any;

  /**
   * Gets the mean of a Tensor over a specified dimension.
   * @param {Tensor} a - Tensor to get mean from.
   * @param {dim} dim - Dimension to get mean over.
   * @param {keepdims} keepdims - Whether to keep dimensions of original tensor.
   * @returns {Tensor} - Final tensor.
   */
  forward(a: Tensor, dim: number, keepdims = false): Tensor {
    // Account for negative dimension index:
    if (dim < 0) {
      dim = a.shape.length + dim;
    }
    // Return error if dimension is out of bounds:
    if (dim >= a.shape.length) {
      throw Error("Dimension larger than array.");
    }

    // Build cache to use in backward step:
    this.cache = [a, dim];

    // Create output tensor:
    const z = new Tensor(
      _mean(a._data, dim, keepdims), // New data.
      requiresGrad(a) // keep_dims.
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const [a, dim] = this.cache;

    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      // Backprop through mean:
      let da = new Tensor(_div(dz.data, a.shape[dim]));
      // Expand upstream gradients to the shape of "a":
      da = broadcast(da, a);
      a.backward(da, z);
    }
  }
}

export class Variance {
  cache: any;
  /**
   * Gets the variance of a Tensor over a specified dimension.
   * @param {Tensor} a - Tensor to get variance of.
   * @param {dim} dim - Dimension to get variance over.
   * @param {keepdims} keepdims - Whether to keep dimensions of original tensor.
   * @returns {Tensor} - Final tensor.
   */
  forward(a: Tensor, dim: number, keepdims = false): Tensor {
    // Account for negative dimension index:
    if (dim < 0) {
      dim = a.shape.length + dim;
    }
    // Return error if dimension is out of bounds:
    if (dim >= a.shape.length) {
      throw Error("Dimension larger than array.");
    }

    // Build cache to use in backward step:
    this.cache = [a, dim];

    // Create output tensor:
    const z = new Tensor(
      _variance(a._data, dim, keepdims), // New data.
      requiresGrad(a) // keep_dims.
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const [a, dim] = this.cache;
    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      // Expand upstream gradients to the shape of "a":
      dz = broadcast(dz, a);
      // Backprop through variance:
      const err = _add(a._data, _neg(_mean(a._data, dim, true)));
      const var_err = _mul(_mul(dz._data, 2), err);
      let da = _div(var_err, a.shape[dim]);
      // Create new "da" Tensor:
      da = new Tensor(da);
      a.backward(da, z);
    }
  }
}

// <<< Tensor Operations >>> //

export class Transpose {
  cache: any;

  /**
   * Transpose the tensor along two consecutive dimensions:
   * @param {object} a - Tensor to transpose.
   * @param {number} dim1 - First dimension.
   * @param {number} dim2 - Second dimension.
   * @returns {object} New tensor.
   */
  forward(a: Tensor, dimA: number, dimB: number): Tensor {
    // Build cache to use in backward step:
    this.cache = [a, dimA, dimB];

    // Account for negative dimension index:
    if (dimA < 0) {
      dimA = a.shape.length + dimA;
    }
    if (dimB < 0) {
      dimB = a.shape.length + dimB;
    }
    // Get first dimension to be transposed:
    let dim: number;
    if (dimB < dimA) {
      dim = dimB;
    } else if (dimB > dimA) {
      dim = dimA;
    } else {
      throw new Error("ValueError: dimensions are not consecutive.");
    }

    // Call recursive function:
    const z = new Tensor(
      _transpose(a._data, dim), // data;
      requiresGrad(a) // requires_grad;
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const [a, dimA, dimB] = this.cache;

    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      const da = dz.transpose(dimA, dimB);
      a.backward(da, z);
    }
  }
}

export class At {
  cache: any;

  forward(
    a: Tensor,
    idx1: Tensor | Array<any>,
    idx2: Tensor | Array<any> | null = null
  ): Tensor {
    // Make sure index lists are flat JavaScript arrays:
    if (idx1) {
      idx1 = assureArray(idx1).flat(Infinity);
    }
    if (idx2) {
      idx2 = assureArray(idx2).flat(Infinity);
    }

    // Build cache to use in backward step:
    this.cache = [a, idx1, idx2];

    // Call function:
    const z = new Tensor(
      _at(a._data, idx1, idx2), // data;
      requiresGrad(a) // requires_grad;
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const [a, idx1, idx2] = this.cache;
    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      const da = zeros(a.shape);
      // Add derivatives to the original places from a:
      for (let i = 0; i < dz.length; i++) {
        // If there is a second index, add to each [i][j] coordinate (2D):
        if (idx2 != null) {
          da._data[idx1[i]][idx2[i]] = _add(
            da._data[idx1[i]][idx2[i]],
            dz._data[i]
          );
          // If there is not a second index, add to each [i] coordinate (1D):
        } else {
          da._data[idx1[i]] = _add(da._data[idx1[i]], dz._data[i]);
        }
      }
      a.backward(da, z);
    }
  }
}

export class MaskedFill {
  cache: any;

  forward(
    a: Tensor,
    mask: Tensor,
    condition: (someArg: number) => boolean,
    value: number
  ): Tensor {
    // Build cache to use in backward step:
    this.cache = [a, mask, condition];

    // Call function:
    const z = new Tensor(
      _masked_fill(a._data, mask._data, condition, value), // data;
      requiresGrad(a) // requires_grad;
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const [a, mask, condition] = this.cache;
    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      // Set gradients of all reset values to zero:
      const da = new Tensor(_masked_fill(dz._data, mask._data, condition, 0));

      a.backward(da, z);
    }
  }
}

export class Reshape {
  cache: any;

  forward(a: Tensor, shape: Array<number>): Tensor {
    // Build cache to use in backward step:
    this.cache = a;

    // Call function:
    const z = new Tensor(
      _reshape(a._data, shape), // data;
      requiresGrad(a) // requires_grad;
    );

    // Connect nodes in graph:
    if (requiresGrad(a)) {
      z.parents.push(a);
      a.children.push(z);
      z.operation = this;
    }

    return z;
  }

  backward(dz: Tensor, z: Tensor) {
    // Get data from cache:
    const a = this.cache;

    // Find gradients relative to "a", and pass them downstream:
    if (requiresGrad(a)) {
      // Reshape dz back to a's shape:
      const da = new Tensor(_reshape(dz.data, a.shape));
      a.backward(da, z);
    }
  }
}

// <<< Tensor Operation Aliases >>> //

/**
 * Gets the sum of the Tensor over a specified dimension.
 * @param {Tensor} a - Original Tensor.
 * @param {number} dim - Dimension to sum over.
 * @param {boolean} keepdims - Whether to keep dimensions of original tensor.
 * @returns {Tensor} - Final tensor.
 */
export function sum(a: Tensor, dim = -1, keepdims = false): Tensor {
  return a.sum(dim, keepdims);
}

/**
 * Gets the mean of the Tensor over a specified dimension.
 * @param {Tensor} a - Original Tensor.
 * @param {number} dim - Dimension to get mean over.
 * @param {boolean} keepdims - Whether to keep dimensions of original tensor.
 * @returns {Tensor} - Final tensor.
 */
export function mean(a: Tensor, dim = -1, keepdims = false): Tensor {
  return a.mean(dim, keepdims);
}

/**
 * Gets the variance of the Tensor over a specified dimension.
 * @param {Tensor} a - Original Tensor.
 * @param {number} dim - Dimension to get variance over.
 * @param {boolean} keepdims - Whether to keep dimensions of original tensor.
 * @returns {Tensor} - Final tensor.
 */
export function variance(a: Tensor, dim = -1, keepdims = false): Tensor {
  return a.variance(dim, keepdims);
}

/**
 * Add integer or other Tensor to this Tensor.
 * @param {Tensor} a - Original Tensor.
 * @param {any} b - Tensor or integer to be added to this Tensor.
 * @returns {object} New tensor.
 */
export function add(a: Tensor, b: Tensor | number) {
  return a.add(b);
}

/**
 * Subtract integer or other Tensor from this Tensor.
 * @param {Tensor} a - Original Tensor.
 * @param {any} b - Tensor or integer to be subtracted from this Tensor.
 * @returns {object} New tensor.
 */
export function sub(a: Tensor, b: Tensor | number) {
  return a.sub(b);
}

/**
 * Get element-wise opposite of given tensor ( every element * (-1) )
 * @returns {object} New tensor.
 */
export function neg(a: Tensor) {
  return a.neg();
}

/**
 * Multiply this Tensor by integer or other Tensor.
 * @param {any} other - Tensor or integer to multiply this Tensor by.
 * @returns {object} New tensor.
 */
export function mul(a: Tensor, b: Tensor | number) {
  return a.mul(b);
}

/**
 * Divide this Tensor by integer or other Tensor.
 * @param {any} other - Tensor or integer to divide this Tensor by.
 * @returns {object} New tensor.
 */
export function div(a: Tensor, b: Tensor | number) {
  const operation = new Div();
  return operation.forward(a, b);
}

/**
 * Get tensor to element-wise power of n.
 * @param {object} a - Tensor to be elevated to the power of n.
 * @param {number} n - Exponent.
 * @returns {object} New tensor.
 */
export function pow(a: Tensor, n: number): Tensor {
  const operation = new Pow();
  return operation.forward(a, n);
}

/**
 * Get element-wise square root of given tensor.
 * @param {object} a - Tensor to be square rooted.
 * @returns {object} New tensor.
 */
export function sqrt(a: Tensor): Tensor {
  return a.sqrt();
}

/**
 * Get element-wise exponentiation of given tensor ( e^(every element) )
 * @param {object} a - Tensor to be exponentiated.
 * @returns {object} New tensor.
 */
export function exp(a: Tensor): Tensor {
  return a.exp();
}

/**
 * Get element-wise natural log of given tensor ( ln(every element) )
 * @param {object} a - Tensor we will take the log of.
 * @returns {object} New tensor.
 */
export function log(a: Tensor): Tensor {
  return a.log();
}

/**
 * Multiply this Tensor by integer or other Tensor.
 * @param {any} other - Tensor or integer to multiply this Tensor by.
 * @returns {object} New tensor.
 */
export function matmul(a: Tensor, b: Tensor): Tensor {
  return a.matmul(b);
}

/**
 * Transpose the tensor along two consecutive dimensions:
 * @param {Tensor} a - Tensor to be transposed.
 * @param {number} dim1 - First dimension.
 * @param {number} dim2 - Second dimension.
 * @returns {object} New tensor.
 */
export function transpose(a: Tensor, dim1: number, dim2: number): Tensor {
  return a.transpose(dim1, dim2);
}

/**
 * In a tensor, returns a list of elements in [index1], or [index1][index2];
 * @param {Tensor} a - Original Tensor.
 * @param {object} idx1 - List containing indexes to extract data from in first dimension.
 * @param {object} idx2 - List containing indexes to extract data from in second dimension [OPTIONAL].
 * @returns {object} New tensor.
 * @example
 * let a = tensor([[1,4,2],
 *                 [6,7,8]])
 *
 * // Returns tensor([[1,4,2],
 * //                 [6,7,8],
 * //                 [1,4,2]])
 * a.at([0,1,0])
 *
 * // Returns tensor([2,6,8]):
 * a.at([0,1,1], [2,0,2])
 */
export function at(
  a: Tensor,
  idx1: Tensor | Array<any>,
  idx2: Tensor | Array<any>
): Tensor {
  return a.at(idx1, idx2);
}

/**
 * Where the "condition" function returns True in the "mask" Tensor, the "value" will fill the "a" Tensor.
 * @param {Tensor} a - Original Tensor.
 * @param {Tensor} mask - "condition" will be applied in this tensor element-wise.
 * @param {function} condition - Function that returns True or False element-wise.
 * @param {number} value - Value to fill Tensor when condition is met.
 * @returns {object} New tensor.
 * @example
 * let a = tensor([[1,5,2,3],
 *                 [6,7,2,9]])
 *
 * // Returns tensor([[1,0,2,3],
 * //                 [0,0,2,0]])
 * masked_fill(a, mask, (el) => {return el > 3}, 0)
 */
export function masked_fill(
  a: Tensor,
  mask: Tensor,
  condition: (someArg: number) => boolean,
  value: number
): Tensor {
  return a.masked_fill(mask, condition, value);
}

/**
 * Reshape the tensor into the new shape:
 * @param {Tensor} a - Tensor to be reshaped.
 * @param {object} shape - New tensor's shape.
 * @returns {object} New tensor.
 */
export function reshape(a: Tensor, shape: Array<any>): Tensor {
  return a.reshape(shape);
}

// <<< Recursive functions for lists >>> //

function _sum(a: Array<any>, dim: number, keepdims?: boolean): Array<any> {
  // In recursive call, when depth increases, subtract one from dim.
  // When we reach the dimension intended (dim === 0),
  // we add all elements in this dimension.
  if (dim == 0) {
    const sum = a.reduce((a, b) => _add(a, b), 0);
    if (keepdims) {
      return Array(a.length).fill(sum);
    } else {
      return sum;
    }
  } else if (typeof a === "object") {
    return a.map((element) => _sum(element, dim - 1, keepdims));
  } else {
    throw Error("Dimension invalid.");
  }
}

function _mean(a: Array<any>, dim: number, keepdims?: boolean): Array<any> {
  // In recursive call, when depth increases, subtract one from dim.
  // When we reach the dimension intended (dim === 0),
  // we add all elements in this dimension.
  if (dim == 0) {
    const reduced = _div(
      a.reduce((a, b) => _add(a, b), 0),
      a.length
    );
    if (keepdims) {
      return Array(a.length).fill(reduced);
    } else {
      return reduced;
    }
  } else if (typeof a === "object") {
    return a.map((element) => _mean(element, dim - 1 /*, keepdims*/));
  } else {
    throw Error("Dimension invalid.");
  }
}

function _variance(a: Array<any>, dim: number, keepdims?: boolean): Array<any> {
  // In recursive call, when depth increases, subtract one from dim.
  // When we reach the dimension intended (dim === 0),
  // we add all elements in this dimension.
  if (dim == 0) {
    // Get mean over current dim:
    const mean = _div(
      a.reduce((a, b) => _add(a, b), 0),
      a.length
    );
    // Get square difference to mean over current dim:
    const squares = a.map((el) => (el - mean) ** 2);
    // Get mean of square differences over current dim:
    const variance = _div(
      squares.reduce((a, b) => _add(a, b), 0),
      a.length
    );
    if (keepdims) {
      return Array(a.length).fill(variance);
    } else {
      return variance;
    }
  } else if (typeof a === "object") {
    return a.map((element) => _variance(element, dim - 1 /*keepdims*/));
  } else {
    throw Error("Dimension invalid.");
  }
}

function _add(a: Array<any> | number, b: Array<any> | number): any {
  // If both are numbers, return number. If one is a Tensor, add number to each element in tensor.
  if (typeof a === "number" && typeof b === "number") {
    return a + b;
  } else if (typeof a === "number" && b instanceof Array) {
    return b.map((element) => _add(element, a));
  } else if (a instanceof Array && typeof b === "number") {
    return a.map((element) => _add(element, b));
  } else if (a instanceof Array && b instanceof Array) {
    // If both are tensors, we need to broadcast:
    const aShape = getShape(a);
    const bShape = getShape(b);
    // If both have same shape, move downwards in both:
    if (JSON.stringify(aShape) === JSON.stringify(bShape)) {
      return a.map((element, idx) => _add(element, b[idx]));
      // If a's shape is larger, we need to find b's shape inside a's shape:
    } else if (aShape.length > bShape.length) {
      let idx!: number;
      // Look for b's shape:
      for (let i = 0; i < aShape.length; i++) {
        if (
          JSON.stringify(aShape.slice(i, i + bShape.length)) ===
          JSON.stringify(bShape)
        ) {
          idx = i;
        }
      }
      // If it's right on top of the array, move down on both:
      if (idx === 0) {
        return a.map((element, idx) => _add(element, b[idx]));
        // If not, move down only on 'a':
      } else {
        return a.map((element) => _add(element, b));
      }
      // If b's shape is larger, we need to find a's shape inside b's shape:
    } else if (aShape.length < bShape.length) {
      let idx!: number;
      // Look for a's shape:
      for (let i = 0; i < bShape.length; i++) {
        if (
          JSON.stringify(bShape.slice(i, i + aShape.length)) ===
          JSON.stringify(aShape)
        ) {
          idx = i;
        }
      }
      // If it's right on top of the array, move down on both:
      if (idx === 0) {
        return b.map((element, idx) => _add(a[idx], element));
        // If not, move down only on 'b':
      } else {
        return b.map((element) => _add(a, element));
      }
    } else {
      throw Error("Given arguments cannot be added.");
    }
  } else {
    throw Error("Given arguments cannot be added.");
  }
}

function _neg(a: Array<any> | number): Array<any> | number {
  // If a is a number, make it negative. If not, make all of its elements negative:
  if (typeof a === "number") {
    return -a;
  } else if (typeof a === "object") {
    return a.map((element) => _neg(element));
  } else {
    throw new TypeError("the input data is not a number.");
  }
}

function _mul(a: Array<any> | number, b: Array<any> | number): any {
  // If both are numbers, return number. If one is a Tensor, multiply each element in the tensor by the number.
  if (typeof a === "number" && typeof b === "number") {
    return a * b;
  } else if (typeof a === "number" && b instanceof Array) {
    return b.map((element) => _mul(element, a));
  } else if (a instanceof Array && typeof b === "number") {
    return a.map((element) => _mul(element, b));
  } else if (a instanceof Array && b instanceof Array) {
    // If both are tensors, we need to broadcast:
    const aShape = getShape(a);
    const bShape = getShape(b);
    // If both have same shape, move downwards in both:
    if (JSON.stringify(aShape) === JSON.stringify(bShape)) {
      return a.map((element, idx) => _mul(element, b[idx]));
      // If a's shape is larger, we need to find b's shape inside a's shape:
    } else if (aShape.length > bShape.length) {
      let idx;
      // Look for b's shape:
      for (let i = 0; i < aShape.length; i++) {
        if (
          JSON.stringify(aShape.slice(i, i + bShape.length)) ===
          JSON.stringify(bShape)
        ) {
          idx = i;
        }
      }
      // If it's right on top of the array, move down on both:
      if (idx === 0) {
        return a.map((element, idx) => _mul(element, b[idx]));
        // If not, move down only on 'a':
      } else {
        return a.map((element) => _mul(element, b));
      }
      // If b's shape is larger, we need to find a's shape inside b's shape:
    } else if (aShape.length < bShape.length) {
      let idx;
      // Look for a's shape:
      for (let i = 0; i < bShape.length; i++) {
        if (
          JSON.stringify(bShape.slice(i, i + aShape.length)) ===
          JSON.stringify(aShape)
        ) {
          idx = i;
        }
      }
      // If it's right on top of the array, move down on both:
      if (idx === 0) {
        return b.map((element, idx) => _mul(a[idx], element));
        // If not, move down only on 'b':
      } else {
        return b.map((element) => _mul(a, element));
      }
    }
  }
}

function _div(a: Array<any> | number, b: Array<any> | number): any {
  // If both are numbers, return number. If one is a Tensor, divide each element in the tensor by the number.
  if (typeof a === "number" && typeof b === "number") {
    return a / b;
  } else if (typeof a === "number" && b instanceof Array) {
    return b.map((element) => _div(a, element));
  } else if (a instanceof Array && typeof b === "number") {
    return a.map((element) => _div(element, b));
  } else if (a instanceof Array && b instanceof Array) {
    // If both are tensors, we need to broadcast:
    const aShape = getShape(a);
    const bShape = getShape(b);
    // If both have same shape, move downwards in both:
    if (JSON.stringify(aShape) === JSON.stringify(bShape)) {
      return a.map((element, idx) => _div(element, b[idx]));
      // If a's shape is larger, we need to find b's shape inside a's shape:
    } else if (aShape.length > bShape.length) {
      let idx;
      // Look for b's shape:
      for (let i = 0; i < aShape.length; i++) {
        if (
          JSON.stringify(aShape.slice(i, i + bShape.length)) ===
          JSON.stringify(bShape)
        ) {
          idx = i;
        }
      }

      // If it's right on top of the array, move down on both:
      if (idx === 0) {
        return a.map((element, idx) => _div(element, b[idx]));
        // If not, move down only on 'a':
      } else {
        return a.map((element) => _div(element, b));
      }
      // If b's shape is larger, we need to find a's shape inside b's shape:
    } else if (aShape.length < bShape.length) {
      let idx;
      // Look for a's shape:
      for (let i = 0; i < bShape.length; i++) {
        if (
          JSON.stringify(bShape.slice(i, i + aShape.length)) ===
          JSON.stringify(aShape)
        ) {
          idx = i;
        }
      }
      // If it's right on top of the array, move down on both:
      if (idx === 0) {
        return b.map((element, idx) => _div(a[idx], element));
        // If not, move down only on 'b':
      } else {
        return b.map((element) => _div(a, element));
      }
    }
  }
}


function _matmul(a: Array<any>, b: Array<any>, kernel: any): Array<any> {
  if (typeof a === "number") {
    throw new Error("Cannot perform MatMul with given shapes.");
  }
  // If this dimension has equal lengths, keep searching:
  if (typeof a[0][0] === "object") {
    return a.map((element: Array<any>, idx: number) =>
      _matmul(element, b[idx], kernel)
    );
  // If not, try to matmul:
  } else {
    // If dimensions align, perform matmul:
    if (a[0].length === b.length && typeof a[0][0] === "number") {
      let out = kernel(a, b, b.length);
      out = out.map((el:number[]) => Array.from(el));
      return out;
    } else {
      throw Error(
        `Cannot perform Matrix Multiplication: cannot broadcast ${[
          a.length,
          a[0].length
        ]} and ${[b.length, b[0].length]}`
      );
    }
  }
}
// =================== NUEVO ========================= //

function _pow(a: Array<any> | number, n: number): Array<any> | number {
  // If a is a number, exponentiate it. If not, exponentiate all of its elements:
  let z = a;
  for (let i = 0; i < n - 1; i++) {
    z = _mul(z, a);
  }
  return z;
}

function _sqrt(a: Array<any> | number): Array<any> | number {
  // If a is a number, take square root of it. If not, take root of all of its elements:
  if (typeof a === "number") {
    return Math.sqrt(a);
  } else if (a instanceof Array) {
    return a.map((element: Array<any>) => _sqrt(element));
  } else {
    throw new TypeError("the input data is not a number.");
  }
}

function _exp(a: Array<any> | number): Array<any> | number {
  // If a is a number, exponentiate it. If not, exponentiate all of its elements:
  if (typeof a === "number") {
    return 2.718281828459045 ** a;
  } else if (a instanceof Array) {
    return a.map((element: Array<any>) => _exp(element));
  } else {
    throw new TypeError("the input data is not a number.");
  }
}

function _log(a: Array<any> | number): Array<any> | number {
  // If a is a number, take it's log. If not, take log of all of it's elements:
  if (typeof a === "number") {
    return Math.log(a);
  } else if (a instanceof Array) {
    return a.map((element: Array<any>) => _log(element));
  } else {
    throw new TypeError("the input data is not a number.");
  }
}

function _transpose(a: Array<any>, dim: number): Array<any> {
  // Go down the dimensions recursively until we get to the dimension to be transposed:
  if (dim == 0) {
    // Build array with the transposed shape (to be filled with transposed values):
    const newArray = Array(a[0].length)
      .fill(0)
      .map(() => Array(a.length).fill(0));

    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[i].length; j++) {
        newArray[j][i] = a[i][j];
      }
    }
    return newArray;
  } else if (a instanceof Array) {
    return a.map((element: Array<any>) => _transpose(element, dim - 1));
  } else {
    throw Error("ValueError: dimensions are invalid.");
  }
}

function _at(
  a: Array<any>,
  idx1: Array<any>,
  idx2: Array<any> | null
): Array<any> {
  // If there is a second index, fill a new array in position "N" with a[idx1[N]][idx2[N]] (2 Dims):
  if (idx2) {
    return Array(idx1.length)
      .fill(0)
      .map((_, i) => a[idx1[i]][idx2[i]]);
    // If there is no second index, fill a new array in position "N" with a[idx1[N]] (1 Dim):
  } else {
    return Array(idx1.length)
      .fill(0)
      .map((_, i) => a[idx1[i]]);
  }
}

function _masked_fill(
  a: Array<any> | number,
  mask: Array<any> | number,
  condition: (someArg: number) => boolean,
  value: number
): Array<any> | number {
  // If a is a number, test "condition" on it. If not, recursive step to all of its elements:
  if (typeof mask === "number") {
    if (typeof a != "number") {
      throw new Error("Tensor and Mask not broadcastable");
    }
    if (condition(mask)) {
      return value;
    } else {
      return a;
    }
  } else if (typeof a === "object") {
    return a.map((element, idx) =>
      _masked_fill(element, mask[idx], condition, value)
    );
  } else {
    throw new Error("The input data is not a number.");
  }
}

// export function _reshape(a: Array<any>, shape: Array<number>): Array<any> {
//   // Rebuilds flattened array "flat" with shape "shape":
//   function _build(a: any[], shape: any[]): Array<any> {
//     if (shape.length > 1) {
//       const emptyArray = Array(shape[0]).fill(0);
//       return emptyArray.map(() => _build(a, shape.slice(1)));
//     } else {
//       const emptyArray = Array(shape[0]).fill(0);
//       return emptyArray.map(() => a.shift());
//     }
//   }

//   // Flatten array with a's data:
//   const flat = a.flat(Infinity);
//   // Rebuild a with new shape:
//   return _build(flat, shape);
// }

export function _reshape(a: Array<any>, shape: number[]) {
  if (getShape(a).reduce((a,b)=>a*b,1) != shape.reduce((a,b)=>a*b,1)) {throw new Error('Attempting to reshape into invalid shape.')}
  function _build(a2: any[], shape2: number[], idx: number, numberOfEls: number): any[] {
    if (shape2.length > 1) {
      const emptyArray = Array(shape2[0]).fill(0);
      let offSet = idx;
      numberOfEls = (numberOfEls / shape2[0]);
      const myArray = emptyArray.map((_, idx) => _build(a2, shape2.slice(1), offSet + idx*numberOfEls, numberOfEls));
      return myArray;
    } else {
      const myArray =  a2.slice(idx,idx+numberOfEls);
      return myArray;
    }
  }
  const flat = a.flat(Infinity);
  const built = _build(flat, shape, 0, flat.length);
  return built;
}

// <<< Tensor Initialization Methods >>> //

/**
 * Generic initializer, creates new instance of the Tensor class, filling up a shape with a value.
 * @param {object} shape - List containing the shape of the new tensor Tensor.
 * @param {function} valueFunc - Function that returns number to fill up the Tensor.
 * @returns {object} New tensor.
 */
function _tensorInitializer(
  shape: Array<number>,
  valueFunc: () => number
): Array<any> {
  if (shape.length === 1) {
    const emptyArray = Array(shape[0]).fill(0);
    return emptyArray.map(() => valueFunc());
  } else {
    const currentSize = shape[0];
    const emptyArray = Array(currentSize).fill(0);
    return emptyArray.map(() => _tensorInitializer(shape.slice(1), valueFunc));
  }
}

/**
 * Creates new instance of the Tensor class.
 * @param {object} data - Iterable containing the data to be stored in the Tensor.
 * @param {boolean} requires_grad - Whether to keep track of this tensor's gradients.
 * @param {string} device - Device to store Tensor. Either "gpu" or "cpu".
 * @returns {object} New tensor.
 */
export function tensor(data: Array<any>, requires_grad = false, device = 'cpu'): Tensor {
  return new Tensor(data, requires_grad, device);
}

/**
 * Creates new instance of the Tensor class filled with only zeros.
 * @param {object} shape - List containing the shape of the new tensor Tensor.
 * @param {boolean} requires_grad - Whether to keep track of this tensor's gradients.
 * @param {string} device - Device to store Tensor. Either "gpu" or "cpu".
 * @returns {object} New tensor.
 */
export function zeros(shape: Array<number>, requires_grad = false, device = 'cpu'): Tensor {
  return new Tensor(
    _tensorInitializer(shape, () => 0),
    requires_grad,
    device
  );
}

/**
 * Creates new instance of the Tensor class filled with only ones.
 * @param {object} shape - List containing the shape of the new tensor Tensor.
 * @param {boolean} requires_grad - Whether to keep track of this tensor's gradients.
 * @param {string} device - Device to store Tensor. Either "gpu" or "cpu".
 * @returns {object} New tensor.
 */
export function ones(shape: Array<number>, requires_grad = false, device = 'cpu'): Tensor {
  return new Tensor(
    _tensorInitializer(shape, () => 1),
    requires_grad,
    device
  );
}

/**
 * Creates new instance of a lower-triangular 2D Tensor.
 * @param {object} shape - List containing the shape of the new tensor Tensor.
 * @param {boolean} requires_grad - Whether to keep track of this tensor's gradients.
 * @param {string} device - Device to store Tensor. Either "gpu" or "cpu".
 * @returns {object} New tensor.
 */
export function tril(shape: Array<number>, requires_grad = false, device = 'cpu'): Tensor {
  const z = ones(shape, requires_grad);
  for (let i = 0; i < shape[0]; i++) {
    for (let j = 0; j < shape[0]; j++) {
      if (j > i) {
        z._data[i][j] = 0;
      }
    }
  }

  return new Tensor(z._data, requires_grad, device);
}

/**
 * Creates new instance of the Tensor class filled with numbers in a uniform distribution in ]0,1[.
 * @param {object} shape - List containing the shape of the new tensor Tensor.
 * @param {boolean} requires_grad - Whether to keep track of this tensor's gradients.
 * @param {string} device - Device to store Tensor. Either "gpu" or "cpu".
 * @returns {object} New tensor.
 */
export function rand(shape: Array<number>, requires_grad = false, device = 'cpu'): Tensor {
  return new Tensor(
    _tensorInitializer(shape, () => Math.random()),
    requires_grad,
    device
  );
}

/**
 * Creates new instance of the Tensor class filled with numbers in a normal distribution.
 * @param {object} shape - List containing the shape of the new tensor Tensor.
 * @param {boolean} requires_grad - Whether to keep track of this tensor's gradients.
 * @param {string} device - Device to store Tensor. Either "gpu" or "cpu".
 * @param {boolean} xavier - Whether to use xavier initialization (divide by square root of first input dimension).
 * @returns {object} New tensor.
 */
export function randn(
  shape: Array<number>,
  requires_grad = false,
  device = 'cpu',
  xavier = false
): Tensor {
  return new Tensor(
    _tensorInitializer(shape, () => {
      const mean = Math.random() * 0.98 + 1e-3;
      const variance = Math.random() * 0.98 + 1e-3;;
      const num =
        Math.sqrt(-2.0 * Math.log(mean)) * Math.cos(2.0 * Math.PI * variance);
      if (xavier) {
        // Apply Xavier initialization to control scalar sizes:
        return num / Math.sqrt(shape[0]);
      } else {
        return num;
      }
    }),
    requires_grad,
    device
  );
}

/**
 * Creates new instance of the Tensor class filled with random integers between low and high.
 * @param {number} low - Lowest number that can be sampled.
 * @param {number} high - One above highest number that can be sampled.
 * @param {object} shape - List containing the shape of the new tensor Tensor.
 * @param {boolean} requires_grad - Whether to keep track of this tensor's gradients.
 * @returns {object} New tensor.
 */
export function randint(
  low = 0,
  high = 1,
  shape = [1],
  requires_grad = false
): Tensor {
  return new Tensor(
    _tensorInitializer(shape, () => {
      return Math.floor(Math.random() * (high - low)) + low;
    }),
    requires_grad
  );
}

// <<< Helper Functions >>> //

/**
 * Returns if a variable requires gradient tracking.
 * @param {any} - Variable to check if requires_grad.
 * @returns {boolean} Whether to track gradients.
 */
export function requiresGrad(a: Tensor | number | Array<any>): boolean {
  if (a instanceof Tensor) {
    return a.requires_grad;
  } else {
    return false;
  }
}

/**
 * Broadcasts tensor "a" into shape of "b".
 * If the shape gets smaller, tensor will be summed. If it gets larger, tensor will be expanded.
 * @param {object} a - First tensor, will be broadcast into shape of second.
 * @param {object} b - Second tensor.
 * @returns {object} New tensor.
 * @example
 * // Returns tensor with shape [4,3,2]:
 * broadcast(randn([3,2]), randn([4,3,2]));
 *
 * // Returns tensor with shape [4,5,3,1]:
 * broadcast(ones([5,3,2]), ones([4,5,3,1]));
 */
export function broadcast(a: Tensor, b: Tensor): Tensor {
  function _broadcast(
    out: Array<any> | number,
    b: Array<any> | number
  ): Array<any> | number {
    if (typeof out === "number" && typeof b === "number") {
      return out;
    } else if (typeof out === "number" && b instanceof Array) {
      const newArray = Array(b.length).fill(out);
      return _broadcast(newArray, b);
    } else if (out instanceof Array && typeof b === "number") {
      return _broadcast(_sum(out, 0), b);
    } else if (JSON.stringify(getShape(out)) === JSON.stringify(getShape(b))) {
      return out;
    } else if (out instanceof Array && b instanceof Array) {
      // If both are tensors, we need to broadcast:
      const outShape = getShape(out);
      const bShape = getShape(b);
      // If out's shape is larger, we need to find b's shape inside out's shape:
      if (outShape.length > bShape.length) {
        let idx!: number;
        // Look for b's shape:
        for (let i = 0; i < outShape.length; i++) {
          if (
            JSON.stringify(outShape.slice(i, i + bShape.length)) ===
            JSON.stringify(bShape)
          ) {
            idx = i;
          }
        }
        // If it's right on top of the array, move down on both:
        if (idx === 0) {
          return out.map((element, idx) => _broadcast(element, b[idx]));
          // If not, move down only on 'out':
        } else {
          //return out.map((element) => _broadcast(element, b));
          return _sum(out, 0);
        }
        // If b's shape is larger, we need to find out's shape inside b's shape:
      } else if (outShape.length < bShape.length) {
        let idx!: number;
        // Look for out's shape:
        for (let i = 0; i < bShape.length; i++) {
          if (
            JSON.stringify(bShape.slice(i, i + outShape.length)) ===
            JSON.stringify(outShape)
          ) {
            idx = i;
          }
        }
        // If it's right on top of the array, move down on both:
        if (idx === 0) {
          return out.map((element) => _broadcast(element, b[0]));
          // If not, move down only on 'b':
        } else {
          return Array(b.length)
            .fill(0)
            .map(() => _broadcast(out, b[0]));
        }
      } else {
        // Define recursive function to find dimension with length 1:
        const _broadcastSideways = (
          out: Array<any> | number | null,
          b: Array<any>
        ): Array<any> => {
          if (out instanceof Array && b.length != out.length) {
            if (b.length === 1) {
              // Base case, contract existing dimension:
              return [_sum(out, 0)];
            } else if (out.length === 1) {
              // Base case, expand existing dimension:
              const emptyArray = Array(b.length).fill(zeros);
              return emptyArray.map(() => out[0]);
            } else {
              throw Error(
                `Shapes ${getShape(out)} and ${getShape(b)} not broadcastable.`
              );
            }
          } else {
            // Recursive case:
            if (out instanceof Array) {
              // Keep looking inside each element:
              return out.map((element: Array<any>, idx: number) =>
                _broadcastSideways(element, b[idx])
              );
            } else if (typeof out === "number") {
              // In case the element is a number:
              return [null].map((element, idx) =>
                _broadcastSideways(element, b[idx])
              );
            } else {
              throw Error("Shapes not broadcastable.");
            }
          }
        };
        // Return final broadcast tensor:
        return _broadcastSideways(out, b);
      }
    } else {
      throw Error("Shapes not broadcastable.");
    }
  }

  let out = a.data;
  while (JSON.stringify(getShape(out)) != JSON.stringify(b.shape)) {
    out = assureArray(_broadcast(out, b.data));
  }
  return new Tensor(out);
}

/**
 * Adds new dimensions to "a" until it's depth matches "b".
 * @param {object} inElement - First tensor, will be broadcast into dims of second.
 * @param {object} outElement - Second tensor.
 * @returns {object} New tensor.
 * @example
 * // Returns tensor with shape [4,2,3]:
 * broadcastUp(ones([2,3]), ones([4,3,2]));
 */
export function broadcastUp(
  inElement: Array<any>,
  outElement: Array<any>
): Array<any> {
  function _broadcastUp(
    inElement: Array<any>,
    outElement: Array<any>
  ): Array<any> {
    if (getShape(inElement).length + 1 === getShape(outElement).length) {
      // Base case, create new dimension:
      const emptyArray = Array(outElement.length).fill(zeros);
      return emptyArray.map(() => inElement);
    } else {
      // Recursive case. Keep looking inside each element:
      const emptyArray = Array(outElement.length).fill(zeros);
      return emptyArray.map((_, idx) =>
        _broadcastUp(inElement, outElement[idx])
      );
    }
  }
  while (getShape(inElement).length < getShape(outElement).length) {
    inElement = _broadcastUp(inElement, outElement);
  }
  return inElement;
}
