<a href="https://www.github.com/eduardoleao052/js-pytorch">
    <img src="https://img.shields.io/badge/GitHub-%23121011.svg?style=flat-square&logo=github&logoColor=white">
</a>
<a href="https://www.linkedin.com/in/eduardoleao052/">
    <img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=linkedin">
</a>


# Tutorials

This section contains ready-to-use examples of JS-PyTorch in action, with increasing complexity and explainations along the way.

## Gradients

To use the autograd functionality (get Tensor's gradients), first create your input tensor, and your parameter tensors. We want to see the gradients of the parameter tensors relative to the output, so we set `requires_grad=true` on them.

```typescript
const { torch } = require("js-pytorch");

// Instantiate Input Tensor:
let x = torch.randn([8, 4, 5], false);

// Instantiate Parameter Tensors:
let w = torch.randn([8, 5, 4], true);
let b = torch.tensor([0.2, 0.5, 0.1, 0.0], true);
```

* The parameter tensor `w` will be multiplied by the input tensor `x`.
* The parameter tensor `b` will be added to the input tensor `x`.

```javascript
// Make calculations:
let y = torch.matmul(x, w);
y = torch.add(out, b);
```

Now, compute the gradients of `w` and `b` using `tensor.backward` on the output tensor `y`.


```javascript
// Compute gradients on whole graph:
y.backward();

// Get gradients from specific Tensors:
console.log(w.grad);
console.log(b.grad);
```

To access the gradients of a tensor after calling `tensor.backward` on the output, use the syntax `tensor.grad`.

## Neural Network

To train a neural network from scratch, first import the `torch`, `torch.nn` and `torch.optim` modules.

```javascript
const torch = require("js-pytorch");
const nn = torch.nn;
const optim = torch.optim;
```

Now, create the Neural Network class. This class extends the `nn.Module` object.
In the constructor, add the **layers** that make up your model, adding them as attributes of your Neural Network class.
In this case, there is:

* A **Linear** layer, stored in `this.w1`.
* A **ReLU** activation function, stored in `this.relu1`.
* A **Linear** layer, stored in `this.w2`.
* A **ReLU** activation function, stored in  `this.relu2`.
* A **Linear** layer, stored in `this.w3`.

The size of these layers depends on three parameters, passed into the constructor: 

* **input_size**, defines the size of the last dimension of the input tensor.
* **hidden_size**, defines the size of each **hidden layer** in the model.
* **out_size** defines the size of the last dimension of the output tensor. This is the same as the number of classes of the output.

> **Note:** The **input_size** must be the input size of the first layer, and **out_size** must be the output size of the last layer.

After the constructor, create a forward method, where an input is passed through each layer in the model.
To pass the input through a layer, use:
```javascript
this.layer.forward(input);
```

The final class is as follows:
```javascript

// Implement Module class:
class NeuralNet extends nn.Module {
  constructor(in_size, hidden_size, out_size) {
    super();
    // Instantiate Neural Network's Layers:
    this.w1 = new nn.Linear(in_size, hidden_size);
    this.relu1 = new nn.ReLU();
    this.w2 = new nn.Linear(hidden_size, hidden_size);
    this.relu2 = new nn.ReLU();
    this.w3 = new nn.Linear(hidden_size, out_size);
  };

  forward(x) {
    let z;
    z = this.w1.forward(x);
    z = this.relu1.forward(z);
    z = this.w2.forward(z);
    z = this.relu2.forward(z);
    z = this.w3.forward(z);
    return z;
  };
};
```

> **Note:** To add the module to the **gpu** for faster computation, pass the argument `'gpu'` to the **Linear** layers.

Now, create an instance of your NeuralNetwork class. Declare the **in_size**, **hidden_size** and **out_size** according to your data, and  fine a batch size:

```javascript
// Instantiate Model:
let in_size = 16;
let hidden_size = 32;
let out_size = 10;
let batch_size = 16;

let model = new NeuralNet(in_size,hidden_size,out_size);
```

Instantiate the loss function and optimizer, passing the parameters of the models using the `model.parameters()` method and the learning rate.

```javascript
// Define loss function and optimizer:
let loss_func = new nn.CrossEntropyLoss();
let optimizer = new optim.Adam(model.parameters(), 3e-3);
```

Import the data, and add it to **x (input)** and **y (target)** variables.

> **Note:** Here, we are generating a dummy dataset (random input and target).

```javascript
// Instantiate input and output:
let x = torch.randn([batch_size, in_size]);
let y = torch.randint(0, out_size, [batch_size]);
let loss;
```

Create a **train loop** to train your model:

```javascript
// Training Loop:
for (let i = 0; i < 256; i++) {
  let z = model.forward(x);

  // Get loss:
  loss = loss_func.forward(z, y);

  // Backpropagate the loss using torch.tensor's backward() method:
  loss.backward();

  // Update the weights:
  optimizer.step();

  // Reset the gradients to zero after each training step:
  optimizer.zero_grad();

  // Print current loss:
  console.log(`Iter: ${i} - Loss: ${loss.data}`);
}
```

<details>
<summary> <b>Detailing</b> </summary>

</br>

On each pass through the training loop, the following happens:

</br>

</br>


- The input is passed through the model:

```javascript
let z = model.forward(x);
```

- The loss is calculated:

```javascript
loss = loss_func.forward(z, y);
```

- The gradients are computed: 

```javascript
loss.backward();
```

- The parameters are optimized:

```javascript
optimizer.step();
```

- The gradients are reset:

```javascript
optimizer.zero_grad();
```

- The current loss is printed to the console:

```javascript
console.log(`Iter: ${i} - Loss: ${loss.data}`);
```

</details>
</br>
Now, the entire Neural Network, with:

* Class declaration.
* Hyperparameter Definition.
* Train Loop.
</br>
<details>
<summary><b>Full Implementation</b></summary>

```javascript
const torch = require("js-pytorch");
const nn = torch.nn;
const optim = torch.optim;

// Implement Module class:
class NeuralNet extends nn.Module {
  constructor(in_size, hidden_size, out_size) {
    super();
    // Instantiate Neural Network's Layers:
    this.w1 = new nn.Linear(in_size, hidden_size);
    this.relu1 = new nn.ReLU();
    this.w2 = new nn.Linear(hidden_size, hidden_size);
    this.relu2 = new nn.ReLU();
    this.w3 = new nn.Linear(hidden_size, out_size);
  };

  forward(x) {
    let z;
    z = this.w1.forward(x);
    z = this.relu1.forward(z);
    z = this.w2.forward(z);
    z = this.relu2.forward(z);
    z = this.w3.forward(z);
    return z;
  };
};

// Instantiate Model:
let in_size = 16;
let hidden_size = 32;
let out_size = 10;
let batch_size = 16;

let model = new NeuralNet(in_size,hidden_size,out_size);

// Define loss function and optimizer:
let loss_func = new nn.CrossEntropyLoss();
let optimizer = new optim.Adam(model.parameters(), 3e-3);

// Instantiate input and output:
let x = torch.randn([batch_size, in_size]);
let y = torch.randint(0, out_size, [batch_size]);
let loss;

// Training Loop:
for (let i = 0; i < 256; i++) {
  let z = model.forward(x);

  // Get loss:
  loss = loss_func.forward(z, y);

  // Backpropagate the loss using torch.tensor's backward() method:
  loss.backward();

  // Update the weights:
  optimizer.step();

  // Reset the gradients to zero after each training step:
  optimizer.zero_grad();

  // Print current loss:
  console.log(`Iter: ${i} - Loss: ${loss.data}`);
}
```

</details>

</br>

## Transformer

Following the exact same steps as the last tutorial, we can create a **Transformer Model**.

The inputs of the constructor are:

* **vocab_size**, defines the size of the last dimension of the input and output tensor. It is the number of characters or words that compose your vocabulary.
* **hidden_size**, defines the size of each **hidden layer** in the model.
* **n_timesteps** number of timesteps computed in parallel by the transformer.
* **dropout_p** probability of randomly dropping an activation during training (to improve regularization).
* **device** is the device on which the model's calculations will run. Either `'cpu'` or `'gpu'`.
<details>
<summary><b>Full Implementation</b></summary>

```typescript
const { torch } = require("js-pytorch");
const nn = torch.nn;
const optim = torch.optim;
const device = 'gpu';

// Create Transformer decoder Module:
class Transformer extends nn.Module {
  constructor(vocab_size, hidden_size, n_timesteps, n_heads, dropout_p, device) {
    super();
    // Instantiate Transformer's Layers:
    this.embed = new nn.Embedding(vocab_size, hidden_size);
    this.pos_embed = new nn.PositionalEmbedding(n_timesteps, hidden_size);
    this.b1 = new nn.Block(hidden_size, hidden_size, n_heads, n_timesteps, dropout_p, device);
    this.b2 = new nn.Block(hidden_size, hidden_size, n_heads, n_timesteps, dropout_p, device);
    this.ln = new nn.LayerNorm(hidden_size);
    this.linear = new nn.Linear(hidden_size, vocab_size, device);
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

// Define training hyperparameters:
const vocab_size = 52;
const hidden_size = 32;
const n_timesteps = 16;
const n_heads = 4;
const dropout_p = 0;
const batch_size = 8;

// Instantiate your custom nn.Module:
const model = new Transformer(vocab_size, hidden_size, n_timesteps, n_heads, dropout_p, device);

// Define loss function and optimizer:
const loss_func = new nn.CrossEntropyLoss();
const optimizer = new optim.Adam(model.parameters(), (lr = 5e-3), (reg = 0));

// Instantiate sample input and output:
let x = torch.randint(0, vocab_size, [batch_size, n_timesteps, 1]);
let y = torch.randint(0, vocab_size, [batch_size, n_timesteps]);
let loss;

// Training Loop:
for (let i = 0; i < 256; i++) {
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

  // Print loss at every iteration:
  console.log(`Iter ${i} - Loss ${loss.data[0].toFixed(4)}`)
}
```

</details>

</br>

## Saving and Loading Models

To **save** a model, first **instantiate a class** extending `nn.Module` for your model, as explained in the previous tutorials.

```typescript
// Instantiate your model:
const model = new Transformer(vocab_size, hidden_size, n_timesteps, n_heads, dropout_p);
```

Then, **train** your model.
When you are finished, or during training (to generate snapshots), save the model to a JSON file using `torch.save()`:

```javascript
// Save model to JSON file:
torch.save(model, 'model.json')
```

To **load** the model, instantiate a placeholder as an empty instance of the same model:

```javascript
// To load, instantiate placeHolder using the original model's architecture:
const placeHolder = new Transformer(vocab_size, hidden_size, n_timesteps, n_heads, dropout_p);
```

Then, load the weights of the trained model into the placeholder using `torch.load()`:

```javascript
// Load weights into placeHolder:
const newModel = torch.load(placeHolder, 'model.json')
```

## Testing

To test a model, just run your test data through the trained model using `model.forward()`:

```javascript
// Load weights into placeHolder:
let z = model.forward(x);
```

Then, use a **loss function** or a custom function to calculate your loss or accuracy in comparaison with the **target**:

```javascript
let loss = nn.CrossEntropyLoss(z,y);
```