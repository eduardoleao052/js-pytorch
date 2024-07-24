<a href="https://www.github.com/eduardoleao052/">
    <img src="https://img.shields.io/badge/GitHub-%23121011.svg?style=flat-square&logo=github&logoColor=white">
</a>
<a href="https://www.linkedin.com/in/eduardoleao052/">
    <img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=linkedin">
</a>

# Tensor Operations

In this section are listed all of the **Tensor Operation** methods.

## torch.add

```
torch.add(a,
          b) → Tensor
```

* If both tensors are scalars, the simple sum is returned.
* If one tensor is a scalar, the element-wise sum of the scalar and the tensor is returned.
* If tensors both are n-dimensional tensors, JS-PyTorch will attempt to broadcast their shapes, and add them element-wise.

#### Parameters
   * **a (Tensor | number)** - Input Tensor or number.
   * **b (Tensor | number)** - Other Tensor or number.

#### Example
```javascript
>>> let a = torch.tensor([[1,1,2,3],
                          [6,7,8,9]]);
>>> let b = torch.tensor([1]);
>>> let c = torch.add(a,b);
>>> c.data;
//[[2,2,3,4],
// [7,8,9,10]]
>>> b = torch.tensor([[0],
                      [2]]);
>>> c = torch.add(a,b);
>>> c.data;
//[[1,1,2,3],
// [8,9,10,11]]
>>> b = torch.tensor([[0,0,0,0],
                      [0,0,100,0]]);
>>> c = torch.add(a,b);
>>> c.data;
//[[1,1,2,3],
// [6,7,108,9]]
```

> **Note:** `torch.add(a, b)` is the same as `a.add(b)`.
</br>

## torch.sub

```
torch.sub(a,
          b) → Tensor
```

* If both tensors are scalars, the simple subtraction is returned.
* If one tensor is a scalar, the element-wise subtraction of the scalar and the tensor is returned.
* If tensors both are n-dimensional tensors, JS-PyTorch will attempt to broadcast their shapes, and subtract them element-wise.

#### Parameters
   * **a (Tensor | number)** - Input Tensor or number.
   * **b (Tensor | number)** - Other Tensor or number.

#### Example
```javascript
>>> let a = torch.tensor([[1,1,2,3],
                          [6,7,8,9]]);
>>> let b = torch.tensor([1]);
>>> let c = torch.sub(a,b);
>>> c.data;
//[[0,0,1,2],
// [5,6,7,8]]
>>> b = torch.tensor([[0],
                      [2]]);
>>> c = torch.sub(a,b);
>>> c.data;
//[[1,1,2,3],
// [4,5,6,7]]
>>> b = torch.tensor([[0,0,0,0],
                      [0,0,8,0]]);
>>> c = torch.sub(a,b);
>>> c.data;
//[[1,1,2,3],
// [6,7,0,9]]
```

> **Note:** `torch.sub(a, b)` is the same as `a.sub(b)`.
</br>

## torch.neg

```
torch.neg(a) → Tensor
```

Returns the element-wise opposite of the given Tensor.

#### Parameters
   * **a (Tensor | number)** - Input Tensor or number.

#### Example
```javascript
>>> let a = torch.tensor([1]);
>>> let b = torch.neg(a);
>>> c.data;
// [-1]
>>> a = torch.tensor([-3]);
>>> b = torch.neg(a);
>>> c.data;
// [3]
>>> a = torch.tensor([[0,1,0,-1],
                      [-3,2,1,0]]);
>>> b = torch.neg(a);
>>> c.data;
//[[0,-1,0,1],
// [3,-2,-1,0]]
```

> **Note:** `torch.neg(a)` is the same as `a.neg()`.
</br>

## torch.mul

```
torch.mul(a,
          b) → Tensor
```

* If both tensors are scalars, the simple dot product is returned.
* If one tensor is a scalar, the element-wise product of the scalar and the tensor is returned.
* If tensors both are n-dimensional tensors, JS-PyTorch will attempt to broadcast their shapes, and multiply them element-wise.

#### Parameters
   * **a (Tensor | number)** - Input Tensor or number.
   * **b (Tensor | number)** - Other Tensor or number.

#### Example
```javascript
>>> let a = torch.tensor([[1,1,2,3],
                          [6,7,8,9]]);
>>> let b = torch.tensor([2]);
>>> let c = torch.mul(a,b);
>>> c.data;
//[[0,0,1,2],
// [5,6,7,8]]
>>> b = torch.tensor([[0],
                      [-1]]);
>>> c = torch.mul(a,b);
>>> c.data;
//[[0, 0, 0, 0],
// [-6,-7,-8,-9]]
>>> b = torch.tensor([[0,0,0,0],
                      [0,0,8,0]]);
>>> c = torch.mul(a,b);
>>> c.data;
//[[1,1,2,3],
// [6,7,0,9]]
```

> **Note:** `torch.mul(a, b)` is the same as `a.mul(b)`.
</br>

## torch.div

```
torch.div(a,
          b) → Tensor
```

* If both tensors are scalars, the simple division is returned.
* If one tensor is a scalar, the element-wise division of the scalar and the tensor is returned.
* If tensors both are n-dimensional tensors, JS-PyTorch will attempt to broadcast their shapes, and divide them element-wise.

#### Parameters
   * **a (Tensor | number)** - Input Tensor or number.
   * **b (Tensor | number)** - Other Tensor or number.

#### Example
```javascript
>>> let a = torch.tensor([[2,-2,4,6],
                          [6,-6,8,8]]);
>>> let b = torch.tensor([2]);
>>> let c = torch.div(a,b);
>>> c.data;
//[[1,-1,2,3],
// [3,-3,4,4]]
>>> b = torch.tensor([[1],
                      [-1]]);
>>> c = torch.div(a,b);
>>> c.data;
//[[2,-2, 4, 6],
// [-6,6,-8,-8]]
>>> b = torch.tensor([[1,1,1,1],
                      [1,1,16,1]]);
>>> c = torch.div(a,b);
>>> c.data;
//[[2,-2, 4, 6],
// [6,-6,0.5,8]]
```

> **Note:** `torch.div(a, b)` is the same as `a.div(b)`.
</br>

## torch.matmul

```
torch.matlul(a,
             b) → Tensor
```

Performs matrix multiplication between the last two dimensions of each Tensor.
If inputs are of shape `[H,W]` and `[W,C]`, the output will have shape `[H,C]`.
If the two Tensors have more than two dimensions, they can be **broadcast**:

* `[B,N,H,W], [B,N,W,C] => [B,N,H,C]`
* `[B,N,H,W], [W,C] => [B,N,H,C]`
* `[H,W], [B,N,W,C] => [B,N,H,C]`
* `[B,N,H,W], [1,1,W,C] => [B,N,H,C]`

#### Parameters
   * **a (Tensor | number)** - Input Tensor.
   * **b (Tensor | number)** - Other Tensor.

#### Example
```javascript
>>> let a = torch.tensor([[1,1,1,2], 
                          [3,1,0,0]]); // Shape [2,4]
>>> let b = torch.tensor([[1],
                          [0],
                          [0],
                          [0]]); // Shape [4,1]
>>> let c = torch.matmul(a,b); // Shape [2,1]
>>> c.data;
//[[1],
// [3]]
```

> **Note:** `torch.matmul(a, b)` is the same as `a.matmul(b)`.
</br>

## torch.sum

```
torch.sum(a,
          dim,
          keepdims=false) → Tensor
```

Gets the sum of the Tensor over a specified dimension.

#### Parameters
   * **a (Tensor)** - Input Tensor.
   * **dim (integer)** - Dimension to perform the sum over.
   * **keepdims (boolean)** - Whether to keep dimensions of original tensor.

#### Example
```javascript
>>> let a = torch.ones([4,3], false, 'gpu');
>>> a.data;
//[[1, 1, 1],
// [1, 1, 1]
// [1, 1, 1]
// [1, 1, 1]]
>>> let b = torch.sum(a, 0);
>>> b.data;
// [[4, 4, 4]]
>>> b = torch.sum(a, 1);
>>> b.data;
// [[3],
//  [3],
//  [3],
//  [3]]
>>> b = torch.sum(a, 0, true);
>>> b.data;
//[[4, 4, 4],
// [4, 4, 4]
// [4, 4, 4]
// [4, 4, 4]]
```

> **Note:** `torch.sum(a)` is the same as `a.sum()`.
</br>

## torch.mean

```
torch.mean(a,
          dim,
          keepdims=false) → Tensor
```

Gets the mean of the Tensor over a specified dimension.

#### Parameters
   * **a (Tensor)** - Input Tensor.
   * **dim (integer)** - Dimension to get the mean of.
   * **keepdims (boolean)** - Whether to keep dimensions of original tensor.

#### Example
```javascript
>>> let a = torch.randint(0, 2, [2,3], false, 'gpu');
>>> a.data;
//[[0, 1, 0],
// [1, 1, 1]]
>>> let b = torch.mean(a, 0);
>>> b.data;
// [[0.5, 1, 0.5]]
>>> b = torch.mean(a, 1);
>>> b.data;
// [[0.333333],
//  [1]]
>>> b = torch.mean(a, 0, true);
>>> b.data;
//[[0.5, 1, 0.5],
// [0.5, 1, 0.5]]
```

> **Note:** `torch.mean(a)` is the same as `a.mean()`.
</br>

## torch.variance

```
torch.variance(a,
          dim,
          keepdims=false) → Tensor
```

Gets the variance of the Tensor over a specified dimension.

#### Parameters
   * **a (Tensor)** - Input Tensor.
   * **dim (integer)** - Dimension to get the variance of.
   * **keepdims (boolean)** - Whether to keep dimensions of original tensor.

#### Example
```javascript
>>> let a = torch.randint(0, 3, [3,2], false, 'gpu');
>>> a.data;
//[[0, 2],
// [2, 1],
// [0, 1]]
>>> let b = torch.variance(a, 0);
>>> b.data;
// [[0.9428, 0.471404]]
>>> b = torch.variance(a, 0, true);
>>> b.data;
//[[0.9428, 0.471404]
// [0.9428, 0.471404]
// [0.9428, 0.471404]]
```

> **Note:** `torch.variance(a)` is the same as `a.variance()`.
</br>

## torch.transpose

```
torch.transpose(a,
          dim1,
          dim2) → Tensor
```

Transposes the tensor along two consecutive dimensions.

#### Parameters
   * **a (Tensor)** - Input Tensor.
   * **dim1 (integer)** - First dimension.
   * **dim2 (boolean)** - Second dimension.

#### Example
```javascript
>>> let a = torch.randint(0, 3, [3,2], false, 'gpu');
>>> a.data;
//[[0, 2],
// [2, 1],
// [0, 1]]
>>> let b = torch.transpose(a, -1, -2);
>>> b.data;
//[[0, 2, 0],
// [2, 1, 1]]
```

> **Note:** `torch.transpose(a)` is the same as `a.transpose()`.
</br>

## torch.at

```
torch.at(a,
          dim1,
          dim2) → Tensor
```

If a single Array `index1` is passed, returns the elements in the tensor indexed by this Array: `tensor[index1]`.
If a two Arrays `index1` and `index2` are passed, returns the elements in the tensor indexed by `tensor[index1][index2]`.

#### Parameters
   * **a (Tensor)** - Input Tensor.
   * **index1 (Array)** - Array containing indexes to extract data from in first dimension.
   * **index2 (Array)** - Array containing indexes to extract data from in second dimension.

#### Example
```javascript
>>> let a = torch.tensor([[1,1,2,3],
                [6,7,8,9]]);
>> let b = torch.at(a,[0,1,1], [2,0,3]);
>>> b.data;
// [2,6,9]
>>> b = torch.at(a,[0,1,0]);
>>> b.data;
// [[1,1,2,3],
//  [6,7,8,9],
//  [1,1,2,3]])
```

> **Note:** `torch.at(a)` is the same as `a.at()`.
</br>

## torch.masked_fill

```
torch.masked_fill(a,
                  condition,
                  value) → Tensor
```

A condition function scans the `a` tensor element-wise, returning `true` or `false`.
In places within the `a` tensor where the "condition" function returns True, we set the value to `value`.

#### Parameters
   * **a (Tensor)** - Input Tensor.
   * **condition (function)** - Function that returns True or False element-wise.
   * **value (number)** - Value to fill Tensor when condition is met.

#### Example
```javascript
>>> let a = torch.tensor([[1,5,2,3],
                   [6,7,2,9]]);
>>> let b = torch.masked_fill(a, mask, (el) => {return el > 3}, 0);
>>> b.data;
// [[1,0,2,3],
//  [0,0,2,0]]
```

> **Note:** `torch.masked_fill(a)` is the same as `a.masked_fill()`.
</br>

## torch.pow

```
torch.pow(a,
          n) → Tensor
```

Returns tensor to element-wise power of n.

#### Parameters
   * **a (Tensor)** - Input Tensor.
   * **n (function)** - Exponent.

#### Example
```javascript
>>> let a = torch.tensor([[1,-5],
                          [6,7]]);
>>> let b = torch.pow(a, 2);
>>> b.data;
// [[1,25],
//  [36,49]]
```

> **Note:** `torch.pow(a)` is the same as `a.pow()`.
</br>

## torch.sqrt

```
torch.sqrt(a) → Tensor
```

Returns element-wise square root of the tensor.

#### Parameters
   * **a (Tensor)** - Input Tensor.

#### Example
```javascript
>>> let a = torch.tensor([[1,9],
                          [4,16]]);
>>> let b = torch.sqrt(a);
>>> b.data;
// [[1,3],
//  [2,4]]
```

> **Note:** `torch.sqrt(a)` is the same as `a.sqrt()`.
</br>

## torch.exp

```
torch.exp(a) → Tensor
```

Returns element-wise exponentiation of the tensor.

#### Parameters
   * **a (Tensor)** - Input Tensor.

#### Example
```javascript
>>> let a = torch.tensor([[1,2],
                          [0,-1]]);
>>> let b = torch.exp(a);
>>> b.data;
// [[2.71828,7.389056],
//  [1.00000,0.36788]]
```

> **Note:** `torch.exp(a)` is the same as `a.exp()`.
</br>

## torch.log

```
torch.log(a) → Tensor
```

Returns element-wise natural log of the tensor.

#### Parameters
   * **a (Tensor)** - Input Tensor.

#### Example
```javascript
>>> let a = torch.tensor([[1,2],
                          [0.01,3]]);
>>> let b = torch.log(a);
>>> b.data;
// [[0.00000,0.693147],
//  [-4.6051,1.098612]]
```

> **Note:** `torch.log(a)` is the same as `a.log()`.