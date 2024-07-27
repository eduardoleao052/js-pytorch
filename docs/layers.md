# Layers

In this section are listed all of the **Layers** and **Modules**.

## nn.Linear

```
new nn.Linear(in_size,
              out_size,
              device, 
              bias, 
              xavier)
```

Applies a linear transformation to the input tensor.
Input is matrix-multiplied by a `w` tensor and added to a `b` tensor.

Parameters

   * **in_size (number)** - Size of the last dimension of the input data.
   * **out_size (number)** - Size of the last dimension of the output data.
   * **device (string)** - Device on which the model's calculations will run. Either `'cpu'` or `'gpu'`.
   * **bias (boolean)** - Whether to use a bias term `b`.
   * **xavier (boolean)** - Whether to use Xavier initialization on the weights.

Learnable Variables

   * **w** - *[input_size, output_size]* Tensor.
   * **b** - *[output_size]* Tensor.

Example

```javascript
>>> const linear = new nn.Linear(10,15,'gpu');
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
                              device)
```

Applies a self-attention layer on the input tensor.

* Matrix-multiplies input by `Wk`, `Wq`, `Wv`, resulting in Key, Query and Value tensors.
* Computes attention multiplying Query and transpose Key.
* Applies Mask, Dropout and Softmax to attention activations.
* Multiplies result by Values.
* Multiplies result by `residual_proj`.
* Applies final Dropout.

Parameters

   * **in_size (number)** - Size of the last dimension of the input data.
   * **out_size (number)** - Size of the last dimension of the output data.
   * **n_heads (boolean)** - Number of parallel attention heads the data is divided into. In_size must be divided evenly by n_heads.
   * **n_timesteps (boolean)** - Number of timesteps computed in parallel by the transformer.
   * **dropout_prob (boolean)** - probability of randomly dropping an activation during training (to improve regularization).
   * **device (string)** - Device on which the model's calculations will run. Either `'cpu'` or `'gpu'`.

Learnable Variables

   * **Wk** - *[input_size, input_size]* Tensor.
   * **Wq** - *[input_size, input_size]* Tensor.
   * **Wv** - *[input_size, input_size]* Tensor.
   * **residual_proj** - *[input_size, output_size]* Tensor.

Example

```javascript
>>> const att = new nn.MultiHeadSelfAttention(10, 15, 2, 32, 0.2, 'gpu');
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
                      bias)
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

Parameters

   * **in_size (number)** - Size of the last dimension of the input data.
   * **out_size (number)** - Size of the last dimension of the output data.
   * **dropout_prob (boolean)** - probability of randomly dropping an activation during training (to improve regularization).
   * **device (string)** - Device on which the model's calculations will run. Either `'cpu'` or `'gpu'`.
   * **bias (boolean)** - Whether to use a bias term `b`.

Learnable Variables

   * **l1** - *[input_size, 4input_size]* Tensor.
   * **l2** - *[4input_size, input_size]* Tensor.

Example

```javascript
>>> const fc = new nn.FullyConnected(10, 15, 0.2, 'gpu');
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
             device)
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

Parameters

   * **in_size (number)** - Size of the last dimension of the input data.
   * **out_size (number)** - Size of the last dimension of the output data.
   * **n_heads (boolean)** - Number of parallel attention heads the data is divided into. In_size must be divided evenly by n_heads.
   * **n_timesteps (boolean)** - Number of timesteps computed in parallel by the transformer.
   * **dropout_prob (boolean)** - probability of randomly dropping an activation during training (to improve regularization).
   * **device (string)** - Device on which the model's calculations will run. Either `'cpu'` or `'gpu'`.

Learnable Modules

   * **nn.MultiHeadSelfAttention** - `Wk`, `Wq`, `Wv`, `residual_proj`.
   * **nn.LayerNorm** - `gamma`, `beta`.
   * **nn.FullyConnecyed** - `l1`, `l2`.
   * **nn.LayerNorm** - `gamma`, `beta`.

<br>

## nn.Embedding

```
new nn.Embedding(in_size,
                 embed_size)
```

Embedding table, with a number of embeddings equal to the vocabulary size of the model `in_size`, and size of each embedding equal to `embed_size`. For each element in the input tensor (integer), returns the embedding indexed by the integer.

```javascript
forward(idx: Tensor): Tensor {
   // Get embeddings indexed by input (idx):
   let x = this.E.at(idx);
   return x;
}
```

Parameters

   * **in_size (number)** - Number of different classes the model can predict (vocabulary size).
   * **embed_size (number)** - Dimension of each embedding generated.

Learnable Parameters

   * **E** - *[vocab_size, embed_size]* Tensor.

Example

```javascript
>>> const batch_size = 32;
>>> const number_of_timesteps = 256;
>>> const embed = new nn.Embedding(10, 64);
>>> let x = torch.randint(0, 10, [batch_size, number_of_timesteps]);
>>> let y = embed.forward(x);
>>> y.shape
// [32, 256, 64]
```

<br>

## nn.PositionalEmbedding

```
new nn.PositionalEmbedding(input_size,
                           embed_size)
```

Embedding table, with a number of embeddings equal to the input size of the model `input_size`, and size of each embedding equal to `embed_size`. For each element in the input tensor, returns the embedding indexed by it's position.

```javascript
forward(idx: Tensor): Tensor {
   // Get dimension of the input:
   const [B, T] = idx.shape;
   // Gets positional embeddings for each element along "T": (Batch, Timesteps) => (Batch, Timesteps, Embed)
   const x = this.E.at([...Array(T).keys()]);
   return x
}
```

Parameters

   * **input_size (number)** - Number of different embeddings in the lookup table (size of the input).
   * **embed_size (number)** - Dimension of each embedding generated.

Learnable Parameters

   * **E** - *[input_size, embed_size]* Tensor.

Example

```javascript
>>> const batch_size = 32;
>>> const number_of_timesteps = 256;
>>> const embed = new nn.PositionalEmbedding(number_of_timesteps, 64);
>>> let x = torch.randint(0, 10, [batch_size, number_of_timesteps]);
>>> let y = embed.forward(x);
>>> y.shape
// [32, 256, 64]
```

<br>

## nn.ReLU

```
new nn.ReLU()
```

Rectified Linear Unit activation function. This implementation is **leaky** for stability.
For each element in the incoming tensor:

* If element is positive, no change.
* If element is negative, multiply by 0.001.

Parameters

   * **None**

Learnable Parameters

   * **None**

<br>

## nn.Softmax

```
new nn.Softmax()
```

Softmax activation function. Rescales the data in the input tensor, along the `dim` dimension. The sum of every element along this dimension is one, and every element is between zero and one.

```javascript
forward(x: Tensor, dim = -1): Tensor {
   z = exp(z);
   const out = z.div(z.sum(dim, true));
   return out;
   return x
}
```

Parameters

   * **None**

Learnable Parameters

   * **None**

Example

```javascript
>>> const softmax = new nn.Softmax();
>>> let x = torch.randn([2,4]);
>>> let y = softmax.forward(x, -1);
>>> y.data
// [[0.1, 0.2, 0.8, 0.0],
//  [0.6, 0.1, 0.2, 0.1]]
```

<br>

## nn.Dropout

```
new nn.Dropout(drop_prob: number)
```

Dropout class. For each element in input tensor, has a `drop_prob` chance of setting it to zero.

Parameters

   * **drop_prob (number)** - Probability to drop each value in input, from 0 to 1.

Learnable Parameters

   * **None**

Example

```javascript
>>> const dropout = new nn.Dropout(0.5);
>>> let x = torch.ones([2,4]);
>>> let y = dropout.forward(x);
>>> y.data
// [[1, 0, 0, 1],
//  [0, 1, 0, 1]]
```

<br>

## nn.LayerNorm

```
new nn.LayerNorm(n_embed: number)
```

LayerNorm class. Normalizes the data, with a **mean of 0** and **standard deviation of 1**, across the last dimension. This is done as described in the <a target="_blank" href="https://arxiv.org/abs/1607.06450">LayerNorm paper</a>.

Parameters

   * **n_embed (number)** - Size of the last dimension of the input.

Learnable Parameters

   * **gamma (number)** - Constant to multiply output by (initialized as 1).
   * **beta (number)** - Constant to add to output (initialized as 0).

<br>

## nn.CrossEntropyLoss

```
new nn.CrossEntropyLoss()
```

Cross Entropy Loss function. Computes the cross entropy loss between the target and the input tensor.

* First, calculates softmax of input tensor.
* Then, selects the elements of the input corresponding to the correct class in the target.
* Gets the negative log of these elements.
* Adds all of them, and divides by the number of elemets.

Parameters

   * **None**

Learnable Parameters

   * **None**

Example

```javascript
>>> const number_of_classes = 10;
>>> const input_size = 64;
>>> const loss_func = new nn.CrossEntropyLoss();
>>> let x = torch.randn([input_size, number_of_classes]);
>>> let y = torch.randint(0, number_of_classes, [input_size]);
>>> let loss = loss_func.forward(x, y);
>>> loss.data
// 2.3091357
```