import { randn, randint, matmul, add, Tensor } from "../src/tensor";
import {
  ReLU,
  CrossEntropyLoss,
  Module,
  Linear,
  Embedding,
  PositionalEmbedding,
  Block,
  LayerNorm,
} from "../src/layers";
import { Adam } from "../src/optim";

// <<< Tests >>> //


let a = randn([1,5,1,3])

let b = randn([1,1,3])

console.log(add(a,b).data)