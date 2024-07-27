import {
  Parameter,
  Tensor,
  randn,
  zeros,
  tril,
  broadcast,
  tensor,
  exp,
  rand,
  ones,
  sqrt,
  mul,
  log,
  _reshape
} from "./tensor";
import fs from 'fs';


// Interface that contains all the types of Module's attributes:
interface ModuleInterface {
  // Array of [key: values] of the properties of the Module:
  [key: string]: Module | Parameter | Tensor | any;
  parameters(): (Parameter | Tensor)[];
  train(): void;
  eval(): void;
  entries(): [string, Module | Parameter | Tensor | any][];
  mode: "train" | "eval";
}

// Module class:
export class Module implements ModuleInterface {
  // Instantiate Module's learnable parameters:
  [key: string]: Module | Parameter | Tensor | any;
  // Instantiate Module's mode initially as "train":
  mode: "train" | "eval" = "train";

  /**
   * Returns all model parameters in a list.
   * @returns {object} List with parameters in the model.
   */
  parameters(): (Parameter | Tensor)[] {
    // Iterate over each item in this Module.
    let params: (Parameter | Tensor)[] = [];
    for (const [_, value] of this.entries()) {
      // Add every Module, Parameter or Tensor with requires_grad set to True:
      if (value instanceof Module) {
        params = params.concat(value.parameters());
      } else if (value instanceof Parameter) {
        params.push(value);
      } else if (value instanceof Tensor) {
        if (value.requires_grad) {
          params.push(value);
        }
      }
    }
    return params;
  }

  /**
   * Sets module's mode to train, which influences layers like Dropout
   */
  train() {
    this.mode = "train";
    for (const [_, param] of this.entries()) {
      if (param instanceof Module) {
        param.train();
      }
    }
  }

  /**
   * Sets module's mode to eval, which influences layers like Dropout
   */
  eval() {
    this.mode = "eval";
    for (const [_, param] of this.entries()) {
      if (param instanceof Module) {
        param.eval();
      }
    }
  }

  /**
   * Returns an array of key/values of the enumerable properties of the Module
   * @returns {object} List with parameters in the model.
   */
  entries(): [string, Module | Parameter | Tensor | any][] {
    return Object.entries(this);
  }
}

// Standard Layers:

export class Linear extends Module {
  public W: Tensor;
  public b: Tensor;
  public has_bias: boolean;
  /**
   * Simple linear layer, with weight matrix and optional bias. Does not contain nonlinearity.
   *
   * @param {number} in_size - size of the last dimention of the input array.
   * @param {number} out_size - size of the last dimention of the output array.
   * @param {string} device - Device to perform Tensor operations. Either "gpu" or "cpu".
   * @param {boolean} bias - wether to include a bias term.
   * @param {boolean} xavier - Wether to use xavier initialization (divide by square root of first input dimension).
   */
  constructor(in_size: number, out_size: number, device = 'cpu', bias = true, xavier = true) {
    super();
    this.W = randn([in_size, out_size], true, device, xavier);
    this.b = zeros([out_size], true);
    this.has_bias = bias;
  }

  /**
   * Performs forward pass through the Linear layer.
   * @param {Tensor} x - input Tensor.
   * @returns {Tensor} new Tensor. Out = (In @ W) + b.
   */
  forward(x: Tensor): Tensor {
    let z = x.matmul(this.W);
    if (this.has_bias) {
      z = z.add(this.b);
    }
    return z;
  }
}

export class MultiHeadSelfAttention extends Module {
  public Wk: Linear;
  public Wq: Linear;
  public Wv: Linear;
  public residual_proj: Linear;
  public mask: Tensor;
  public att_dropout: Dropout;
  public residual_dropout: Dropout;
  public softmax: Softmax;
  public H: number;

  /**
   * Full transformer Layer implementation.
   *
   * @param {number} in_size - size of the last dimention of the input array.
   * @param {number} out_size - size of the last dimention of the output array.
   * @param {number} n_heads - number of parallel heads to be computed (must equally divide in_size).
   * @param {number} n_timesteps - length of text sequence to be processed bt Transformer.
   * @param {number} dropout_prob - probability of zeroing each activation in dropout Layer.
   * @param {string} device - Device to perform Tensor operations. Either "gpu" or "cpu".
   */
  constructor(
    in_size: number,
    out_size: number,
    n_heads: number,
    n_timesteps: number,
    dropout_prob = 0,
    device = 'cpu'
  ) {
    super();
    this.Wk = new Linear(in_size, in_size, device, true, false);
    this.Wq = new Linear(in_size, in_size, device, true, false);
    this.Wv = new Linear(in_size, in_size, device, true, false);
    this.residual_proj = new Linear(in_size, out_size, device, true, false);
    this.mask = tril([n_timesteps, n_timesteps], false);
    this.att_dropout = new Dropout(dropout_prob);
    this.residual_dropout = new Dropout(dropout_prob);
    this.softmax = new Softmax();

    // Store head_size and verify that it's an integer:
    this.H = in_size / n_heads;
    if (in_size % n_heads != 0) {
      throw new Error("Embedding dimension not divisible in equal heads.");
    }
  }

  /**
   * Performs Multi Head Self-Attention on "x" tensor.
   * @param {Tensor} x - input Tensor.
   * @returns {Tensor} new Tensor.
   */
  forward(x: Tensor): Tensor {
    const [B, T, D] = x.shape;
    const H = this.H;
    const nh = D / H; // Num heads

    // Get key, queries and values from the input:
    let k = this.Wk.forward(x); // (B, T, D) @ (D, D) -> (B, T, D)
    let q = this.Wq.forward(x); // (B, T, D) @ (D, D) -> (B, T, D)
    let v = this.Wv.forward(x); // (B, T, D) @ (D, D) -> (B, T, D)

    // Reshape into different heads:
    k = k.reshape([B, T, nh, H]).transpose(1, 2); // (B, T, D) -> (B, T, nh, H) -> (B, nh, T, H)
    q = q.reshape([B, T, nh, H]).transpose(1, 2); // (B, T, D) -> (B, T, nh, H) -> (B, nh, T, H)
    v = v.reshape([B, T, nh, H]).transpose(1, 2); // (B, T, D) -> (B, T, nh, H) -> (B, nh, T, H)

    // Compute attention activation:
    const kT = k.transpose(-2, -1);
    let att = q.matmul(kT); // (B, nh, T, H) @ (B, nh, H, T) -> (B, nh, T, T)

    // Reduce module before going into softmax:
    att = att.div(H ** 2);

    // Apply mask (to block out future characters), softmax, and dropout:
    const mask = broadcast(this.mask, att);
    att = att.masked_fill(mask, (el: number): boolean => el === 0, -Infinity);
    att = this.softmax.forward(att, -1);
    att = this.att_dropout.forward(att);

    // Compute weighted sum between values:
    let out = att.matmul(v); // (B, nh, T, T) @ (B, nh, T, H) -> (B, nh, T, H)

    // Restack heads in D dimension:
    out = out.transpose(1, 2).reshape([B, T, D]); // (B, nh, T, H) -> (B, T, D)

    // Apply final projection (Dense layer) and dropout:
    out = this.residual_proj.forward(out); // (B, T, D) @ (D, D) -> (B, T, D)
    out = this.residual_dropout.forward(out);

    return out;
  }
}

export class FullyConnected extends Module {
  public l1: Linear;
  public relu: ReLU;
  public l2: Linear;
  public dropout: Dropout;
  /**
   * Small block composed of two Linear layers, a ReLU non-linearity and a Dropout layer.
   *
   * @param {number} in_size - size of the last dimention of the input array.
   * @param {number} out_size - size of the last dimention of the output array.
   * @param {number} dropout_prob - probability of zeroing each activation in dropout Layer.
   * @param {string} device - Device to perform Tensor operations. Either "gpu" or "cpu".
   * @param {boolean} bias - wether to include a bias term.
   */
  constructor(in_size: number, out_size: number, dropout_prob = 0, device: string = 'cpu', bias: boolean = true) {
    super();

    this.l1 = new Linear(in_size, in_size * 2, device, true, bias);
    this.relu = new ReLU();
    this.l2 = new Linear(in_size * 2, out_size);
    this.dropout = new Dropout(dropout_prob);
  }

  /**
   *  Passes "x" tensor through the Fully Connected layers.
   * @param {Tensor} x - input Tensor.
   * @returns {Tensor} new Tensor.
   */
  forward(x: Tensor): Tensor {
    let z = this.l1.forward(x);
    z = this.relu.forward(z);
    z = this.l2.forward(z);
    z = this.dropout.forward(z);
    return z;
  }
}

export class Block extends Module {
  public att: MultiHeadSelfAttention;
  public ln1: LayerNorm;
  public fcc: FullyConnected;
  public ln2: LayerNorm;

  /**
   * Full transformer decoder block. Composed of Multi Head Self Attention, Fully connected layers and Layer Norms.
   *
   * @param {number} in_size - size of the last dimention of the input array.
   * @param {number} out_size - size of the last dimention of the output array.
   * @param {number} n_heads - number of parallel heads to be computed (must equally divide in_size).
   * @param {number} n_timesteps - length of text sequence to be processed bt Transformer.
   * @param {number} dropout_prob - probability of zeroing each activation in dropout Layer.
   * @param {string} device - Device to perform Tensor operations. Either "gpu" or "cpu".
   */
  constructor(
    in_size: number,
    out_size: number,
    n_heads: number,
    n_timesteps: number,
    dropout_prob = 0,
    device = 'cpu'
  ) {
    super();
    this.att = new MultiHeadSelfAttention(
      in_size,
      in_size,
      n_heads,
      n_timesteps,
      dropout_prob,
      device
    );
    this.ln1 = new LayerNorm(in_size);
    this.fcc = new FullyConnected(in_size, out_size, dropout_prob, device, true);
    this.ln2 = new LayerNorm(out_size);
  }

  /**
   * Passes "x" tensor through a full transformer Block.
   * @param {Tensor} x - input Tensor.
   * @returns {Tensor} new Tensor.
   */
  forward(x: Tensor): Tensor {
    let z = x.add(this.att.forward(this.ln1.forward(x)));
    //z = this.ln1.forward(z)
    z = z.add(this.fcc.forward(this.ln2.forward(z)));
    //z = this.ln2.forward(z);
    return z;
  }
}

// Embedding Layers

export class Embedding extends Module {
  public E: Tensor;

  /**
   * Embedding class, turns indexes into vectors.
   *
   * @param {number} vocab_size - number of different indexes (vocabulary size).
   * @param {number} embed_size - size of the embedding vector generated.
   */
  constructor(vocab_size: number, embed_size: number) {
    super();
    this.E = randn([vocab_size, embed_size], true, 'cpu', false);
  }

  /**
   * Extracts embedding from rows in "idx":
   * @param {Tensor} idx - rows to get embedding from.
   * @returns {Tensor} new Tensor. Out = (In @ W) + b.
   */
  forward(idx: Tensor): Tensor {
    // Get idx dimensions:
    const [B, T] = idx.shape;

    let x = this.E.at(idx);

    // Assure output tensor has desired shape:
    x = x.reshape([B, T, this.E.shape[1]]);

    return x;
  }
}

export class PositionalEmbedding extends Module {
  public E: Tensor;

  /**
   * Embedding class, turns indexes into vectors based on it's position through an optimized lookup table.
   *
   * @param {number} input_size - number of different embeddings (size of the input).
   * @param {number} embed_size - size of the embedding vector generated.
   */
  constructor(input_size: number, embed_size: number) {
    super();
    this.E = randn([input_size, embed_size], true, 'cpu', false);
  }

  /**
   * Gets embedding for timesteps in "idx" array.
   * @param {object} idx - Array [Batch x Timesteps]. Timesteps will be filled with positional embeddings.
   * @returns {Tensor} new Tensor.
   */
  forward(idx: Tensor): Tensor {
    // Get num_timesteps dimension:
    const [_, T] = idx.shape;
    // Creates positional embeddings: (Batch, Timesteps) => (Batch, Timesteps, Embed)
    const x = this.E.at([...Array(T).keys()]);

    return x;
  }
}

// Non-linearity Layers:

export class ReLU extends Module {
  /**
   * Rectified Linear Unit nonlinearity. Returns z if z>0 else 0.
   */
  constructor() {
    super();
  }

  /**
   * Performs forward pass through Rectified Linear Unit nonlinearity. Returns z if z>0 else 0.
   * @param {Tensor} z - input Tensor.
   * @returns {Tensor} new Tensor.
   */
  forward(z: Tensor): Tensor {
    // Define recursive function:
    function _relu(z: Array<any>): Array<any> {
      // Base case, perform ReLU:
      if (typeof z[0] === "number") {
        return z.map((el: number): number => {
          if (el > 0) {
            return 1.0;
          } else {
            return 0.001;
          }
        });
        // Recursive case, go deeper in array:
      } else if (typeof z[0] === "object") {
        return z.map((el: Array<any>): Array<any> => _relu(el));
      } else throw Error("In ReLU, provided Tensor is not homogenous.");
    }
    const mask = tensor(_relu(z._data));

    z = z.mul(mask);
    return z;
  }
}

export class Softmax extends Module {
  /**
   * Softmax nonlinearity class. Returns distribution of values (sum=1).
   */
  constructor() {
    super();
  }

  /**
   * Performs forward pass through Softmax nonlinearity.
   * @param {Tensor} z - input Tensor.
   * @param {number} dim - dimension across which to apply Softmax.
   * @returns {Tensor} new Tensor.
   */
  forward(z: Tensor, dim = -1): Tensor {
    z = exp(z);
    const out = z.div(z.sum(dim, true));
    return out;
  }
}

// Regularization Layers:

export class Dropout extends Module {
  public p: number;

  /**
   * Dropout class, added usually after other layers, to drop values to zero with given probability
   *
   * @param {number} drop_prob - probability to drop each value in input.
   */
  constructor(drop_prob: number) {
    super();
    this.p = drop_prob;
    this.mode = "train";
  }
  /**
   * Performs forward pass through Dropout layer. Sets random values to zero (this.p % of the total).
   * @param {Tensor} z - input Tensor.
   * @returns {Tensor} new Tensor.
   */
  forward(z: Tensor): Tensor {
    if (this.mode == "eval") {
      return z;
    }
    const mask = rand(z.shape);
    // Set to zero all values of uniform distribution lower than probability of dropout:
    let a = z.masked_fill(
      mask,
      (el: number): boolean => {
        return el < this.p;
      },
      0
    );
    // Scale modulus by probability during training time:
    a = a.div(1 - this.p);
    return a;
  }
}

export class LayerNorm extends Module {
  public gamma: Tensor;
  public beta: Tensor;

  /**
   * Layer Norm class, added usually after other layers to normalize across all of the output.
   *
   * @param {number} n_embed - size of the last dimention of the input.
   */
  constructor(n_embed: number) {
    super();
    this.gamma = ones([n_embed], true);
    this.beta = zeros([n_embed], true);
  }

  forward(x: Tensor): Tensor {
    const var_x = x.variance(-1, true); // (B, T)
    const norm_x = x.sub(x.mean(-1, true)).div(sqrt(var_x)); // (B, T, D)
    const z = mul(norm_x, this.gamma).add(this.beta); // (B, T, D)
    return z;
  }
}

// Loss layers:

export class CrossEntropyLoss extends Module {
  /**
   * Cross Entropy Loss class, returns the loss given the output and the expected indexes.
   */
  constructor() {
    super();
  }

  /**
   * Performs forward pass through CrossEntropyLoss, returns loss.
   * @param {Tensor} z - Output from the last layer of the network. Must have shape like (*Batch dimentions, Number of possible classes).
   * @param {object} y - Correct indexes expected from the model.
   * @returns {object} Negative-log-likelihood loss of the model output.
   */
  forward(z: Tensor, y: Tensor): Tensor {
    // Get data's shape:
    let zDims = z.shape;
    // Get last dimension:
    const D = zDims.slice(zDims.length - 1, zDims.length)[0];
    // Get product of all batch dimensions:
    zDims = zDims.slice(0, zDims.length - 1);
    const B = zDims.reduce((a, b) => a * b, 1);
    // Flatten out the batch dimensions:
    z = z.reshape([B, D]);

    // Perform softmax on output:
    const logitsExp = exp(z);

    const logitsSum = logitsExp.sum(1, true);

    const logits = logitsExp.div(logitsSum);

    const y_array = _reshape(y.data, [B]);

    // Get cross-entropy loss:
    const at_logits = logits.at([...Array(B).keys()], y_array);
    const log_losses = log(at_logits);
    let loss = log_losses.sum(-1).neg();
    loss = loss.div(B);
    return loss;
  }
}

/**
 * Saves the model to a JSON file.
 * @param {Module} model - Model to be saved in JSON file.
 * @param {string} file - JSON file.
 */
export function save(model: Module, file: string) {
  const data = JSON.stringify(model);
  fs.writeFileSync(file, data);
}

/**
 * Loads a model from a JSON file.
 * @param {Module} model - Blank model to load weights into (placeholder). Needs to be identical to model.
 * @param {string} file - JSON file.
 * @returns {Module} loadedModel - Model to be loaded from JSON file.
 */
export function load(model: Module, file: string): Module {
  const loadedData = fs.readFileSync(file);
  let loadedModel = JSON.parse(loadedData.toString());
  loadParameters(loadedModel, model)
  return model;  
}

function loadParameters(source: Module, target: Module) {
  for (const [key, value] of target.entries()) {
    // Add every Module, Parameter or Tensor with requires_grad set to True:
    if (value instanceof Module) {
      loadParameters(source[key], target[key]);
    } else if (value instanceof Parameter || value instanceof Tensor) {
      target[key]._data = source[key]._data;
      target[key].m = source[key].m;
      target[key].v = source[key].v;

    }
  }
}