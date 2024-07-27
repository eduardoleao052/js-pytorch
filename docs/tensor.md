# Tensor

The Tensor is the main object of this library. In this section are listed all of the **Tensor** methods.

## torch.tensor

```
torch.tensor(data,
            requires_grad=false,
            device='cpu') → Tensor
```

Returns a tensor filled with the data in the argument `data`.

Parameters

   * **data (Array)** - Javascript Array containing the data to be stored in the Tensor. This array can have any number of dimensions, but must have a homogenous shape, and only numbers.
   * **requires_grad (boolean)** - Whether to keep track of this tensor's gradients. Set this to true if you want to **learn** this parameter in your model. Default: `false`.
   * **device (string)** - Device to store Tensor. Either "gpu" or "cpu". If your device has a gpu, large models will train faster on it.

Example

```javascript
>>> let a = torch.tensor([[1,2,3],[4,5,6]], false, 'gpu');
>>> console.log(a.data);
//[[1,2,3],
// [4,5,6]]
```

<br>

## torch.zeros

```
torch.zeros(*shape,
            requires_grad=false,
            device='cpu') → Tensor
```

Returns a tensor filled with zeros with dimensions like `shape`.

Parameters

   * **shape (Array)** - Javascript Array containing the shape of the Tensor.
   * **requires_grad (boolean)** - Whether to keep track of this tensor's gradients. Set this to true if you want to **learn** this parameter in your model. Default: `false`.
   * **device (string)** - Device to store Tensor. Either "gpu" or "cpu". If your device has a gpu, large models will train faster on it.

Example

```javascript
>>> let a = torch.zeros([3,2], false, 'gpu');
>>> console.log(a.data);
//[[0, 0],
// [0, 0]
// [0, 0]]
```

<br>

## torch.ones

```
torch.ones(*shape,
            requires_grad=false,
            device='cpu') → Tensor
```

Returns a tensor filled with ones with dimensions like `shape`.

Parameters

   * **shape (Array)** - Javascript Array containing the shape of the Tensor.
   * **requires_grad (boolean)** - Whether to keep track of this tensor's gradients. Set this to true if you want to **learn** this parameter in your model. Default: `false`.
   * **device (string)** - Device to store Tensor. Either "gpu" or "cpu". If your device has a gpu, large models will train faster on it.

Example

```javascript
>>> let a = torch.ones([3,2], false, 'gpu');
>>> console.log(a.data);
//[[1, 1],
// [1, 1]
// [1, 1]]
```

<br>

## torch.tril

```
torch.tril(*shape,
            requires_grad=false,
            device='cpu') → Tensor
```

Returns a 2D lower triangular tensor.

Parameters

   * **shape (Array)** - Javascript Array containing the shape of the Tensor.
   * **requires_grad (boolean)** - Whether to keep track of this tensor's gradients. Set this to true if you want to **learn** this parameter in your model. Default: `false`.
   * **device (string)** - Device to store Tensor. Either "gpu" or "cpu". If your device has a gpu, large models will train faster on it.

Example

```javascript
>>> let a = torch.tril([4,3], false, 'gpu');
>>> console.log(a.data);
//[[1, 0, 0],
// [1, 1, 0]
// [1, 1, 1]
// [1, 1, 1]]
>>> let b = torch.tril([3,4], false, 'gpu');
>>> console.log(b.data);
//[[1, 0, 0, 0],
// [1, 1, 0, 0]
// [1, 1, 1, 0]
```

<br>

## torch.randn

```
torch.randn(*shape,
            requires_grad=false,
            device='cpu') → Tensor
```

Returns a tensor filled with randomly sampled data with dimensions like `shape`. The sample is from a normal distribution.

Parameters

   * **shape (Array)** - Javascript Array containing the shape of the Tensor.
   * **requires_grad (boolean)** - Whether to keep track of this tensor's gradients. Set this to true if you want to **learn** this parameter in your model. Default: `false`.
   * **device (string)** - Device to store Tensor. Either "gpu" or "cpu". If your device has a gpu, large models will train faster on it.

Example

```javascript
>>> let a = torch.randn([3,2], false, 'gpu');
>>> console.log(a.data);
//[[1.001, 0.122],
// [-0.93, 0.125]
// [0.123,-0.001]]
```

<br>

## torch.rand

```
torch.rand(*shape,
            requires_grad=false,
            device='cpu') → Tensor
```

Creates new instance of the Tensor class filled with numbers in a uniform distribution in ]0,1[.

Parameters

   * **shape (Array)** - Javascript Array containing the shape of the Tensor.
   * **requires_grad (boolean)** - Whether to keep track of this tensor's gradients. Set this to true if you want to **learn** this parameter in your model. Default: `false`.
   * **device (string)** - Device to store Tensor. Either "gpu" or "cpu". If your device has a gpu, large models will train faster on it.

Example

```javascript
>>> let a = torch.rand([3,2], false, 'gpu');
>>> console.log(a.data);
//[[0.011, 0.122],
// [-0.03, 0.105]
// [-0.90,-0.202]]
```

<br>

## torch.randint

```
torch.rand(low,
            high,
            *shape,
            requires_grad=false,
            device='cpu') → Tensor
```

Creates new instance of the Tensor class filled with random integers between `low` and `high`.

Parameters

   * **low** - Lowest integer that can be sampled.
   * **high** - One above highest integer that can be sampled.
   * **shape (Array)** - Javascript Array containing the shape of the Tensor.
   * **requires_grad (boolean)** - Whether to keep track of this tensor's gradients. Set this to true if you want to **learn** this parameter in your model. Default: `false`.
   * **device (string)** - Device to store Tensor. Either "gpu" or "cpu". If your device has a gpu, large models will train faster on it.

Example

```javascript
>>> let a = torch.rand([3,2], false, 'gpu');
>>> console.log(a.data);
//[[0.011, 0.122],
// [-0.03, 0.105]
// [-0.90,-0.202]]
```

<br>

## tensor.backward

Performs backpropagation from this tensor backwards. It fills the gradients of every tensor that led to this one with gradients relative to **this** tensor.
> **Note:** This only happens to tensors that have `requires_grad` set to true.

Example

```javascript
>>> let a = torch.randn([3,2], true, 'gpu');
>>> let b = torch.randn([2,4], false, 'gpu');
>>> let c = torch.matmul(a,b);
>>> c.backward();
>>> console.log(a.grad);
//[[0.001, -0.99],
// [-0.13, 0.333]
// [-0.91,-0.044]]
```

<br>

## tensor.zero_grad

Clears the gradients stored in this tensor. Sets the gadients to zero. This is used after the gradients have been used to update the parameters of a model, to set the model up for the next iteration.

Example

```javascript
>>> let a = torch.randn([3,2], true, 'gpu');
>>> let b = torch.randn([2,4], false, 'gpu');
>>> let c = torch.matmul(a,b);
>>> c.backward();
>>> console.log(a.grad);
//[[0.001, -0.99],
// [-0.13, 0.333]
// [-0.91,-0.044]]
>>> a.zero_grad();
>>> console.log(a.grad);
//[[0, 0],
// [0, 0]
// [0, 0]]
```

<br>

## tensor.zero_grad_graph

Clears the gradients stored in this tensor, setting the gadients to zero, and does the same for every tensor that led to this one. This is used after the gradients have been used to update the parameters of a model, to set the model up for the next iteration.

Example

```javascript
>>> let a = torch.randn([3,2], true, 'gpu');
>>> let b = torch.randn([2,4], true, 'gpu');
>>> let c = torch.matmul(a,b);
>>> c.backward();
>>> console.log(a.grad);
//[[0.001, -0.99],
// [-0.13, 0.333]
// [-0.91,-0.044]]
>>> c.zero_grad_graph(); // Clears gradients of c, b, and a.
>>> console.log(a.grad);
//[[0, 0],
// [0, 0]
// [0, 0]]
```

<br>

## tensor.tolist

Returns an Array with the tensor's data.

Example

```javascript
>>> let a = torch.randn([3,2], true, 'gpu');
>>> let aArray = a.tolist();
>>> console.log(aArray);
//[[0.001, -0.99],
// [-0.13, 0.333]
// [-0.91,-0.044]]
```

<br>

## tensor.data

Returns the tensor's data as a javascript Array.

Example

```javascript
>>> let a = torch.randn([3,2], true, 'gpu');
>>> console.log(a.data);
//[[0.001, -0.99],
// [-0.13, 0.333]
// [-0.91,-0.044]]
```

<br>

## tensor.length

Returns the tensor's length (size of first dimension).

Example

```javascript
>>> let a = torch.randn([3,2], true, 'gpu');
>>> console.log(a.length);
// 3
```

<br>

## tensor.ndims

Returns the number of dimensions in the Tensor.

Example

```javascript
>>> let a = torch.randn([3,2,1,4], true, 'gpu');
>>> console.log(a.ndims);
// 4
```

<br>

## tensor.grad

Returns the gradients currently stored in the Tensor.

Example

```javascript
>>> let a = torch.randn([3,2], true, 'gpu');
>>> let b = torch.randn([2,4], true, 'gpu');
>>> let c = torch.matmul(a,b);
>>> c.backward();
>>> console.log(a.grad);
//[[0.001, -0.99],
// [-0.13, 0.333]
// [-0.91,-0.044]]
```