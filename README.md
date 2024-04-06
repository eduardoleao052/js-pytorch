<p align="center">
  <img src="./assets/logo.png" alt="js-torch" height="135">
</p>

<p align="center">
    <a href="https://github.com/eduardoleao052/js-torch/actions/workflows/test.yml/badge.svg" alt="Unit Tests">
        <img src="https://github.com/eduardoleao052/js-torch/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://github.com/eduardoleao052/js-torch/pulse" alt="Activity">
        <img src="https://img.shields.io/github/commit-activity/m/eduardoleao052/js-torch" /></a>
    <a href="https://github.com/eduardoleao052/js-torch/graphs/contributors" alt="Contributors">
        <img src="https://img.shields.io/github/contributors/eduardoleao052/js-torch" /></a>
    <a href="https://github.com/eduardoleao052/js-torch">
        <img src="https://img.shields.io/badge/language-JavaScript-yellow">
    </a>
    <a href="mailto:eduardoleao052@usp.br">
        <img src="https://img.shields.io/badge/-Email-red?style=flat-square&logo=gmail&logoColor=white">
    </a>
    <a href="https://www.linkedin.com/in/eduardoleao052/">
        <img src="https://img.shields.io/badge/-Linkedin-blue?style=flat-square&logo=linkedin">
    </a>
</p>

# PyTorch in JavaScript

- JS-Torch is a Deep Learning **JavaScript library** built from scratch, to closely follow PyTorch's syntax.
- It contains a fully functional [Tensor](src/tensor.ts) object, which can track gradients, Deep Learning [Layers](src/layers.ts) and functions, and an **Automatic Differentiation** engine.
- Feel free to try out the <a href="https://eduardoleao052.github.io/js-torch/assets/demo/demo.html" target="blank">Web Demo</a>!

> **Note:** You can install the package locally with: `npm install js-pytorch`

<br>

<details>
<summary> Implemented Tensor <b>Operations</b>: </summary>

<br/>

- [Add](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L346-L401)
- [Subtract](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L404-L438)
- [Multiply](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L441-L496)
- [Divide](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L498-L557)
- [Matrix Multiply](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L560-L621)
- [Power](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L625-L663)
- [Square Root](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L666-L704)
- [Exponentiate](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#706-L744)
- [Log](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L746-L785)
- [Sum](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L790-L842)
- [Mean](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L844-L894)
- [Variance](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L896-L949)
- [Transpose](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L953-L1008)
- [At](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L1010-L1060)
- [MaskedFill](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L1062-L1095)
- [Reshape](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L1097-L1129)

</details>

<details>
<summary> Implemented Deep Learning <b>Layers</b>: </summary>

<br/>

- [nn.Linear](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L60-L88)
- [nn.MultiHeadSelfAttention](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L90-L163)
- [nn.FullyConnected](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L165-L194)
- [nn.Block](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L196-L226)
- [nn.Embedding](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L231-L260)
- [nn.PositionalEmbedding](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L262-L291)
- [nn.ReLU](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L296-L325)
- [nn.Softmax](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L327-L346)
- [nn.Dropout](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L351-L376)
- [nn.LayerNorm](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L378-L397)
- [nn.CrossEntropyLoss](https://github.com/eduardoleao052/js-torch/blob/a158c91db9775a88fae6ed2d0f76d6d8ee6f9d23/src/layers.js#L400-L441)

</details>
<br/>

## 1. Project Structure

- `assets/` : Folder to store images and the Demo.
  - `assets/demo/` : JS-Torch's [Web Demo](https://eduardoleao052.github.io/js-torch/assets/demo/demo.html).
- `src/` : Framework with JavaScript files.
  - `src/tensor.ts`: File with the `Tensor` class and all of the tensor `Operations`.
  - `src/utils.ts`: File with operations and helper functions.
  - `src/layers.ts`: Submodule of the framework. Contains full layers.
  - `src/optim.ts`: Submodule of the framework. Contains Adam Optimizer.
- `tests/`: Folder with unit tests. Contains `test.ts`.

## 2. Running it Yourself

### Simple Autograd Example:

```typescript
const { torch } = require("js-pytorch");

// Instantiate Tensors:
let x = torch.randn([8, 4, 5]);
let w = torch.randn([8, 5, 4], (requires_grad = true));
let b = torch.tensor([0.2, 0.5, 0.1, 0.0], (requires_grad = true));

// Make calculations:
let out = torch.matmul(x, w);
out = torch.add(out, b);

// Compute gradients on whole graph:
out.backward();

// Get gradients from specific Tensors:
console.log(w.grad);
console.log(b.grad);
```

### Complex Autograd Example (Transformer):

```typescript
const { torch } = require("js-pytorch");
const nn = torch.nn;

class Transformer extends nn.Module {
  constructor(vocab_size, hidden_size, n_timesteps, n_heads, p) {
    super();
    // Instantiate Transformer's Layers:
    this.embed = new nn.Embedding(vocab_size, hidden_size);
    this.pos_embed = new nn.PositionalEmbedding(n_timesteps, hidden_size);
    this.b1 = new nn.Block(
      hidden_size,
      hidden_size,
      n_heads,
      n_timesteps,
      (dropout_p = p)
    );
    this.b2 = new nn.Block(
      hidden_size,
      hidden_size,
      n_heads,
      n_timesteps,
      (dropout_p = p)
    );
    this.ln = new nn.LayerNorm(hidden_size);
    this.linear = new nn.Linear(hidden_size, vocab_size);
  }

  forward(x) {
    let z;
    z = torch.add(this.embed.forward(x), this.pos_embed.forward(x));
    z = this.b1.forward(z);
    z = this.b2.forward(z);
    z = this.ln.forward(z);
    z = this.linear.forward(z);
    return z;
  }
}

// Instantiate your custom nn.Module:
const model = new Transformer(
  vocab_size,
  hidden_size,
  n_timesteps,
  n_heads,
  dropout_p
);

// Define loss function and optimizer:
const loss_func = new nn.CrossEntropyLoss();
const optimizer = new optim.Adam(model.parameters(), (lr = 5e-3), (reg = 0));

// Instantiate sample input and output:
let x = torch.randint(0, vocab_size, [batch_size, n_timesteps, 1]);
let y = torch.randint(0, vocab_size, [batch_size, n_timesteps]);
let loss;

// Training Loop:
for (let i = 0; i < 40; i++) {
  // Forward pass through the Transformer:
  let z = model.forward(x);

  // Get loss:
  loss = loss_func.forward(z, y);

  // Backpropagate the loss using torch.tensor's backward() method:
  loss.backward();

  // Update the weights:
  optimizer.step();

  // Reset the gradients to zero after each training step:
  optimizer.zero_grad();
}
```

<br/>

## 3. Distribution & Devtools

- To **Build for Distribution**, run `npm run build`. CJS and ESM modules and `index.d.ts` will be output in the `dist/` folder.
- To check the code with **ESLint** at any time, run `npm run lint`.
- To improve code formatting with **prettier**, run `npm run prettier`.

## 4. Results

- The models implemented in the [unit tests](tests/test.ts) all converged to **near-zero losses**.
- Run them with `npm test`!
- This package is not as optimized as PyTorch yet, but I tried making it more interpretable. Efficiency improvements are incoming!
- Hope you enjoy!

## 5. Benchmarks

- Performance benchmarks are also included and tracked in the `tests/benchmarks/` directory.
- Run all benchmarks with `npm run bench`
- Save new benchmarks with `npm run bench:update` and add the updated files to your commit.
