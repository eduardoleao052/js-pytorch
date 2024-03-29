import { randn, randint, matMul, add } from "../src/tensor.js";
import {
  ReLU,
  CrossEntropyLoss,
  Module,
  Linear,
  Embedding,
  PositionalEmbedding,
  Block,
  LayerNorm,
} from "../src/layers.js";
import { Adam } from "../src/optim.js";

// <<< Tests >>> //

/**
 * This function tests if the loss converges to zero in with a training loop on a dummy random dataset. The update steps are manual, employing standard SGD.
 * This function does not use the "".nn" package. No optimizers or layers are employed.
 */
function test_autograd() {
  // Get start time (to calculate elapsed time):
  let start_time = new Date().getTime();

  // Define loss function as Cross Entropy Loss and learning rate:
  let loss_func = new CrossEntropyLoss();
  let learning_rate = 3e-3;

  //  Instantiate input and output:
  let x = randn([8, 4, 16]);
  let y = randint(0, 10, [8, 4]);
  let loss;

  // Instantiate Neural Network's Layers:
  let w1 = randn([16, 64], true, true);
  let relu1 = new ReLU();
  let w2 = randn([64, 64], true, true);
  let relu2 = new ReLU();
  let w3 = randn([64, 50], true, true);

  // Training Loop:
  for (let i = 0; i < 128; i++) {
    let z = matMul(x, w1);
    z = relu1.forward(z);
    z = add(z, matMul(z, w2));
    z = relu2.forward(z);
    z = matMul(z, w3);

    // Get loss:
    loss = loss_func.forward(z, y);
    // Backpropagate the loss using neuralforge.tensor:
    loss.backward();

    // Update the weights:
    w1._data = w1.add(w1._grad?.mul(learning_rate).neg()).data;
    w2._data = w2.add(w2._grad?.mul(learning_rate).neg()).data;
    w3._data = w3.add(w3._grad?.mul(learning_rate).neg()).data;

    // Reset the gradients to zero after each training step:
    loss.zero_grad_graph();
  }

  // Assert that the model converged:
  if (loss.data > 0.1) {
    throw new Error("Autograd engine did not converge in Unit Test #1.");
  }

  // Return elapsed time:
  return new Date().getTime() - start_time;
}

/**
 * This function tests if the loss converges to zero in a simple Neural Network
 * (Fully-Connected, three layers, with ReLU non-linearities), which uses the custom Module superclass.
 */
function test_module() {
  // Get start time (to calculate elapsed time):
  let start_time = new Date().getTime();

  // Implement dummy Module class:
  class NeuralNet extends Module {
    constructor(hidden_size) {
      super();
      // Instantiate Neural Network's Layers:
      this.w1 = new Linear(16, hidden_size);
      this.relu1 = new ReLU();
      this.w2 = new Linear(hidden_size, hidden_size);
      this.relu2 = new ReLU();
      this.w3 = new Linear(hidden_size, 50);
    }

    forward(x) {
      let z;
      z = this.w1.forward(x);
      z = this.relu1.forward(z);
      z = this.w2.forward(z);
      z = this.relu2.forward(z);
      z = this.w3.forward(z);
      return z;
    }
  }

  let model = new NeuralNet(32);

  // Define loss function and optimizer:
  let loss_func = new CrossEntropyLoss();
  let optimizer = new Adam(model.parameters(), 3e-3, 0);

  // Instantiate input and output:
  let x = randn([8, 4, 16]);
  let y = randint(0, 10, [8, 4]);
  let loss;

  // Training Loop:
  for (let i = 0; i < 100; i++) {
    let z = model.forward(x);

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
  if (loss.data > 0.1) {
    throw new Error("Module did not converge in Unit Test #2.");
  }

  // Return elapsed time:
  return new Date().getTime() - start_time;
}

/**
 * This function tests if the loss converges to zero in a mock Transformer
 */
function test_transformer() {
  // Get start time (to calculate elapsed time):
  let start_time = new Date().getTime();

  // Implement dummy Module class:
  class Transformer extends Module {
    constructor(vocab_size, hidden_size, n_timesteps, n_heads, p) {
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

    forward(x) {
      let z;
      z = add(this.embed.forward(x), this.pos_embed.forward(x));
      z = this.b1.forward(z);
      z = this.b2.forward(z);
      z = this.ln.forward(z);
      z = this.linear.forward(z);
      return z;
    }
  }

  let vocab_size = 52;
  let hidden_size = 32;
  let n_timesteps = 16;
  let n_heads = 8;
  let batch_size = 4;
  let dropout_p = 0;

  let model = new Transformer(
    vocab_size,
    hidden_size,
    n_timesteps,
    n_heads,
    dropout_p
  );

  // Define loss function and optimizer:
  let loss_func = new CrossEntropyLoss();
  let optimizer = new Adam(model.parameters(), 5e-3, 0);
  // Instantiate input and output:
  let x = randint(0, vocab_size, [batch_size, n_timesteps, 1]);
  let y = randint(0, vocab_size, [batch_size, n_timesteps]);
  let loss;

  // Training Loop:
  for (let i = 0; i < 50; i++) {
    let z = model.forward(x);

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
  if (loss.data > 0.1) {
    throw new Error("Transformer did not converge in Unit Test #3.");
  }

  // Return elapsed time:
  return new Date().getTime() - start_time;
}

/**
 * This function runs the three different tests, throwing an error if any of the module's features is not working.
 */
function unit_test() {
  // Create variable to store elapsed time:
  let dt;
  dt = test_autograd();
  console.log(`\n---> Passed Autograd Convergence Test (${dt}ms)`);
  dt = test_module();
  console.log(`\n---> Passed Module Convergence Test (${dt}ms)`);
  dt = test_transformer();
  console.log(`\n---> Passed Transformer Convergence Test (${dt}ms)\n`);
}

unit_test();
