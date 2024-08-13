import { describe, test, expect } from "@jest/globals";
import { randn, randint, matmul, add, Tensor } from "../src/tensor";
import {
  ReLU,
  CrossEntropyLoss,
  Module,
  Linear,
  Embedding,
  PositionalEmbedding,
  Block,
  LayerNorm
} from "../src/layers";
import { Adam } from "../src/optim";

// <<< Tests >>> //

/**
 * This function tests if the loss converges to zero in with a training loop on a dummy random dataset. The update steps are manual, employing standard SGD.
 * This function does not use the "".nn" package. No optimizers or layers are employed.
 */
function test_autograd(): number {
  // Define loss function as Cross Entropy Loss and learning rate:
  const loss_func = new CrossEntropyLoss();
  const learning_rate = 3e-3;

  //  Instantiate input and output:
  const x = randn([8, 4, 16]);
  const y = randint(0, 10, [8, 4]);
  let loss!: Tensor;

  // Instantiate Neural Network's Layers:
  const w1 = randn([16, 32], true, 'cpu', true);
  const relu1 = new ReLU();
  const w2 = randn([32, 32], true, 'cpu', true);
  const relu2 = new ReLU();
  const w3 = randn([32, 50], true, 'cpu', true);

  // Training Loop:
  for (let i = 0; i < 128; i++) {
    let z = matmul(x, w1);
    z = relu1.forward(z);
    z = add(z, matmul(z, w2));
    z = relu2.forward(z);
    z = matmul(z, w3);

    // Get loss:
    loss = loss_func.forward(z, y);
    // Backpropagate the loss using neuralforge.tensor:
    loss.backward();

    // Update the weights:
    w1._data = w1.add(w1._grad.mul(learning_rate).neg()).data;
    w2._data = w2.add(w2._grad?.mul(learning_rate).neg()).data;
    w3._data = w3.add(w3._grad?.mul(learning_rate).neg()).data;

    // Reset the gradients to zero after each training step:
    loss.zero_grad_graph();
  }

  // Return loss:
  return loss.data[0];
}

/**
 * This function tests if the loss converges to zero in a simple Neural Network
 * (Fully-Connected, three layers, with ReLU non-linearities), which uses the custom Module superclass.
 */
function test_module(): number {
  // Implement dummy Module class:
  class NeuralNet extends Module {
    constructor(hidden_size: number) {
      super();
      // Instantiate Neural Network's Layers:
      this.w1 = new Linear(16, hidden_size);
      this.relu1 = new ReLU();
      this.w2 = new Linear(hidden_size, hidden_size);
      this.relu2 = new ReLU();
      this.w3 = new Linear(hidden_size, 50);
    }

    forward(x: Tensor): Tensor {
      let z: Tensor;
      z = this.w1.forward(x);
      z = this.relu1.forward(z);
      z = this.w2.forward(z);
      z = this.relu2.forward(z);
      z = this.w3.forward(z);
      return z;
    }
  }

  const model = new NeuralNet(24);

  // Define loss function and optimizer:
  const loss_func = new CrossEntropyLoss();
  const optimizer = new Adam(model.parameters(), 3e-3, 0);

  // Instantiate input and output:
  const x = randn([8, 4, 16]);
  const y = randint(0, 10, [8, 4]);
  let loss!: Tensor;

  // Training Loop:
  for (let i = 0; i < 100; i++) {
    const z = model.forward(x);

    // Get loss:
    loss = loss_func.forward(z, y);

    // Backpropagate the loss using neuralforge.tensor's backward() method:
    loss.backward();

    // Update the weights:
    optimizer.step();

    // Reset the gradients to zero after each training step:
    optimizer.zero_grad();
  }

  // Assert that the model converged:
  if (loss.data[0] > 0.1) {
    throw new Error("Module did not converge in Unit Test #2.");
  }

  // Return elapsed time:
  return loss.data[0];
}

/**
 * This function tests if the loss converges to zero in a mock Transformer
 */
function test_transformer(): number {
  // Implement dummy Module class:
  class Transformer extends Module {
    constructor(
      vocab_size: number,
      hidden_size: number,
      n_timesteps: number,
      n_heads: number,
      p = 0
    ) {
      super();
      // Instantiate Transformer's Layers:
      this.embed = new Embedding(vocab_size, hidden_size);
      this.pos_embed = new PositionalEmbedding(n_timesteps, hidden_size);
      this.b1 = new Block(
        hidden_size,
        hidden_size,
        n_heads,
        n_timesteps,
        (dropout_p = p)
      );
      this.b2 = new Block(
        hidden_size,
        hidden_size,
        n_heads,
        n_timesteps,
        (dropout_p = p)
      );
      this.ln = new LayerNorm(hidden_size);
      this.linear = new Linear(hidden_size, vocab_size);
    }

    forward(x: Tensor): Tensor {
      let z: Tensor;
      z = add(this.embed.forward(x), this.pos_embed.forward(x));
      z = this.b1.forward(z);
      z = this.b2.forward(z);
      z = this.ln.forward(z);
      z = this.linear.forward(z);
      return z;
    }
  }

  const vocab_size = 52;
  const hidden_size = 24;
  const n_timesteps = 6;
  const n_heads = 8;
  const batch_size = 4;
  let dropout_p = 0;

  const model = new Transformer(
    vocab_size,
    hidden_size,
    n_timesteps,
    n_heads,
    dropout_p
  );

  // Define loss function and optimizer:
  const loss_func = new CrossEntropyLoss();
  const optimizer = new Adam(model.parameters(), 5e-3, 0);
  // Instantiate input and output:
  const x = randint(0, vocab_size, [batch_size, n_timesteps, 1]);
  const y = randint(0, vocab_size, [batch_size, n_timesteps]);
  let loss!: Tensor;

  // Training Loop:
  for (let i = 0; i < 75; i++) {
    const z = model.forward(x);

    // Get loss:
    loss = loss_func.forward(z, y);

    // Backpropagate the loss using neuralforge.tensor's backward() method:
    loss.backward();

    // Update the weights:
    optimizer.step();

    // Reset the gradients to zero after each training step:
    optimizer.zero_grad();
  }

  // Return loss:
  return loss.data[0];
}

const AUTOGRAD_TIMEOUT = 10000;
const MODULE_TIMEOUT = 10000;
const TRANSFORMER_TIMEOUT = 20000;

/**
 * This function runs the three different tests, throwing an error if any of the module's features is not working.
 */
describe("Integration Tests", () => {
  // Create variable to store elapsed time:
  test(
    "Simple Autograd Convergence Test",
    () => {
      expect(test_autograd()).toBeLessThan(0.25);
    },
    AUTOGRAD_TIMEOUT
  );

  test(
    "Module Covergence Test",
    () => {
      expect(test_module()).toBeLessThan(0.25);
    },
    MODULE_TIMEOUT
  );

  test(
    "Full Transformer Covergence Test",
    () => {
      expect(test_transformer()).toBeLessThan(0.25);
    },
    TRANSFORMER_TIMEOUT
  );
});
