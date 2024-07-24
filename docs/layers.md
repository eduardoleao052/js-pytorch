<a href="https://www.github.com/eduardoleao052/js-pytorch">
    <img src="https://img.shields.io/badge/GitHub-%23121011.svg?style=flat-square&logo=github&logoColor=white">
</a>
<a href="https://www.linkedin.com/in/eduardoleao052/">
    <img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=linkedin">
</a>

# Layers

In this section are listed all of the **Layers** and **Modules**.

## nn.Linear

```
new nn.Linear(in_size,
              out_size,
              device, 
              bias, 
              xavier) → Tensor
```

Applies a linear transformation to the input tensor.
Input is matrix-multiplied by a `w` tensor and added to a `b` tensor.

#### Parameters
   * **in_size (number)** - Size of the last dimension of the input data.
   * **out_size (number)** - Size of the last dimension of the output data.
   * **device (string)** - Device on which the model's calculations will run. Either `'cpu'` or `'gpu'`.
   * **bias (boolean)** - Whether to use a bias term `b`.
   * **xavier (boolean)** - Whether to use Xavier initialization on the weights.

#### Learnable Variables
   * **w** - *[input_size, output_size]* Tensor.
   * **b** - *[output_size]* Tensor.

#### Example

```javascript
>>> let linear = new nn.Linear(10,15,'gpu');
>>> let x = torch.randn([100,50,10], true, 'gpu');
>>> let y = linear.forward(x);
>>> y.shape
// [100, 50, 15]
```
</br>

## nn.MultiHeadSelfAttention

```
new nn.MultiHeadSelfAttention(in_size,
                              out_size,
                              n_heads,
                              n_timesteps,
                              dropout_prob,
                              device) → Tensor
```

Applies a self-attention layer on the input tensor.

* Matrix-multiplies input by `Wk`, `Wq`, `Wv`, resulting in Key, Query and Value tensors.
* Computes attention multiplying Query and transpose Key.
* Applies Mask, Dropout and Softmax to attention activations.
* Multiplies result by Values.
* Multiplies result by `residual_proj`.
* Applies final Dropout.

#### Parameters
   * **in_size (number)** - Size of the last dimension of the input data.
   * **out_size (number)** - Size of the last dimension of the output data.
   * **n_heads (boolean)** - Number of parallel attention heads the data is divided into. In_size must be divided evenly by n_heads.
   * **n_timesteps (boolean)** - Number of timesteps computed in parallel by the transformer.
   * **dropout_prob (boolean)** - probability of randomly dropping an activation during training (to improve regularization).
   * **device (string)** - Device on which the model's calculations will run. Either `'cpu'` or `'gpu'`.

#### Learnable Variables
   * **Wk** - *[input_size, input_size]* Tensor.
   * **Wq** - *[input_size, input_size]* Tensor.
   * **Wv** - *[input_size, input_size]* Tensor.
   * **residual_proj** - *[input_size, output_size]* Tensor.

#### Example

```javascript
>>> let att = new nn.MultiHeadSelfAttention(10, 15, 2, 32, 0.2, 'gpu');
>>> let x = torch.randn([100,50,10], true, 'gpu');
>>> let y = att.forward(x);
>>> y.shape
// [100, 50, 15]
```
</br>
## nn.FullyConnected

```
new nn.FullyConnected(in_size,
                      out_size,
                      dropout_prob,
                      device,
                      bias) → Tensor
```

Applies a fully-connected layer on the input tensor.

* Matrix-multiplies input by Linear layer `l1`, upscaling the input.
* Passes tensor through ReLU.
* Matrix-multiplies tensor by Linear layer `l2`, downscaling the input.
* Passes tensor through Dropout.

```javascript
forward(x: Tensor): Tensor {
    let z = this.l1.forward(x);
    z = this.relu.forward(z);
    z = this.l2.forward(z);
    z = this.dropout.forward(z);
    return z;
}
```

#### Parameters
   * **in_size (number)** - Size of the last dimension of the input data.
   * **out_size (number)** - Size of the last dimension of the output data.
   * **dropout_prob (boolean)** - probability of randomly dropping an activation during training (to improve regularization).
   * **device (string)** - Device on which the model's calculations will run. Either `'cpu'` or `'gpu'`.
   * **bias (boolean)** - Whether to use a bias term `b`.

#### Learnable Variables
   * **l1** - *[input_size, 4*input_size]* Tensor.
   * **l2** - *[4*input_size, input_size]* Tensor.

#### Example

```javascript
>>> let fc = new nn.FullyConnected(10, 15, 0.2, 'gpu');
>>> let x = torch.randn([100,50,10], true, 'gpu');
>>> let y = fc.forward(x);
>>> y.shape
// [100, 50, 15]
```
</br>

## nn.Block

```
new nn.Block(in_size,
             out_size,
             n_heads,
             n_timesteps,
             dropout_prob,
             device) → Tensor
```

Applies a transformer Block layer on the input tensor.

```javascript
forward(x: Tensor): Tensor {
    // Pass through Layer Norm and Self Attention:
    let z = x.add(this.att.forward(this.ln1.forward(x)));
    // Pass through Layer Norm and Fully Connected:
    z = z.add(this.fcc.forward(this.ln2.forward(z)));
    return z;
}
```

#### Parameters
   * **in_size (number)** - Size of the last dimension of the input data.
   * **out_size (number)** - Size of the last dimension of the output data.
   * **n_heads (boolean)** - Number of parallel attention heads the data is divided into. In_size must be divided evenly by n_heads.
   * **n_timesteps (boolean)** - Number of timesteps computed in parallel by the transformer.
   * **dropout_prob (boolean)** - probability of randomly dropping an activation during training (to improve regularization).
   * **device (string)** - Device on which the model's calculations will run. Either `'cpu'` or `'gpu'`.

#### Learnable Modules
   * **nn.MultiHeadSelfAttention** - `Wk`, `Wq`, `Wv`, `residual_proj`.
   * **nn.LayerNorm** - `gamma`, `beta`.
   * **nn.FullyConnecyed** - `l1`, `l2`.
   * **nn.LayerNorm** - `gamma`, `beta`.