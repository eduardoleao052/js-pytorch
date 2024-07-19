import {
  Tensor,
  Parameter,
  add,
  neg,
  mul,
  div,
  matmul,
  exp,
  log,
  sqrt,
  pow,
  mean,
  masked_fill,
  variance,
  at,
  reshape,
  _reshape,
  transpose,
  tensor,
  randint,
  randn,
  rand,
  tril,
  ones,
  zeros,
  broadcast
} from "./tensor.js";
import {
  Module,
  Linear,
  MultiHeadSelfAttention,
  FullyConnected,
  Block,
  Embedding,
  PositionalEmbedding,
  ReLU,
  Softmax,
  Dropout,
  LayerNorm,
  CrossEntropyLoss,
  save,
  load
} from "./layers.js";
import { Adam } from "./optim.js";
import { getShape } from "./utils.js";

const nn = {
  Module,
  Linear,
  MultiHeadSelfAttention,
  FullyConnected,
  Block,
  Embedding,
  PositionalEmbedding,
  ReLU,
  Softmax,
  Dropout,
  LayerNorm,
  CrossEntropyLoss
};

const optim = { Adam };

export const torch = {
  // Add methods from tensor.js (these methods are accessed with "torch."):
  Tensor,
  Parameter,
  add,
  neg,
  mul,
  div,
  matmul,
  exp,
  log,
  sqrt,
  pow,
  mean,
  masked_fill,
  variance,
  at,
  reshape,
  _reshape,
  transpose,
  tensor,
  randint,
  randn,
  rand,
  tril,
  ones,
  zeros,
  broadcast,
  save,
  load,
  // Add submodules:
  nn,
  optim,
  getShape
};
