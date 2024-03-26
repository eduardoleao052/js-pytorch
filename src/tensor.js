if (typeof window === 'undefined'){
    const utils = require("./utils");
};

var torch = (function(exports){
        
    // <<< Tensor class, holds n-dimentional tensors, and multiple useful methods >>> // 

    class Tensor {
        /**
         * Creates new instance of the Tensor class.
         * @param {object} data - Iterable containing the data to be stored in the Tensor.
         * @param {boolean} requires_grad - Wether to keep track of this tensor's gradients.
         */
        constructor(data, requires_grad=false) {
            if (typeof data === 'object') {
                this._data = data;
            } else if (typeof data === 'number') {
                this._data = [data,];
            };
            this.shape = utils.getShape(data);
            this.requires_grad = requires_grad;
            if (this.requires_grad) {
                this._grad = zeros(this.shape);
            };
            // Graph connections:
            this.children = [];
            this.parents = [];
            this.operation = null;
            this.visited = false;
            
        };

        /**
         * Returns the data in the Tensor.
         */
        get data() {
            return this._data;
        };

        /**
         * Returns the data's length'.
         */
        get length() {
            return this._data.length;
        };

        /**
         * Returns the number of dimensions in the Tensor.
         */
        get ndims() {
            return this.shape.length;
        };

        /**
         * Returns the tensor's gradients.
         */
        get grad() {
            return this._grad.data;
        };

        /**
         * Performs backward pass from THIS tensor backwards.
         * It fills every tensor that originated this one and that has requires_grad=true's gradients to their gradients relative to THIS tensor.
         */
        backward(grad=null, child=null) {
            // Guarantee that this tensor requires grad:
            if (!this.requires_grad){
                throw new Error("this tensor has requires_grad set to False");
            };
                    
            // If this is the root tensor, grad is just ones,
            // and we remove all children from this point on from the Graph:
            if (grad === null) {
                grad = ones(this.shape);
                this.children = [];
            };

            // Add upstream gradient to this._grad:
            this._grad = new Tensor(_add(this._grad.data, grad.data));
            
            if (child != null) {
                const idx = this.children.indexOf(child);
                this.children.splice(idx, 1);
            };

            // If this Tensor is the product of an Operation:
            if (this.operation != null){

                // When all the children have been visited, propagate further back:
                if (this.children.length === 0){
                    this.operation.backward(this._grad, this)
                };
            };
        };

        /**
         * Reset this Tensor's gradients to zero.
         */
        zero_grad() {
            this._grad = zeros(this.shape);
            this.children = [];
            this.parents = [];
            this.operation = null;
            if (this.m) {
                this.m.zero_grad_graph();
                this.v.zero_grad_graph();
            };
        };

        /**
         * Reset the gradients of this Tensor, and of all of the Tensors that led to it.
         */
        zero_grad_graph() {
            this.zero_grad()
            if (this.operation != null) {
                for (let parent of this.parents) {
                    parent.zero_grad_graph();
                    parent.parents = [];
                };
                this.operation = null;
                this.parents = [];
                this.children = [];
            };
        };

        /**
         * Turns the data in the Tensor into a javascript list object.
         */
        tolist() {
            return this._data;
        };

        /**
         * Gets the sum of the Tensor over a specified dimention.
         * @param {number} dim - Dimention to sum over.
         * @param {boolean} keepdims - Wether to keep dimentions of original tensor.
         * @returns {Tensor} - Final tensor.
         */
        sum(dim=-1, keepdims=false) {
            const operation = new Sum();
            return operation.forward(this, dim, keepdims);
        };

        /**
         * Gets the mean of the Tensor over a specified dimention.
         * @param {number} dim - Dimention to get mean over.
         * @param {boolean} keepdims - Wether to keep dimentions of original tensor.
         * @returns {Tensor} - Final tensor.
         */
        mean(dim=-1, keepdims=false) {
            const operation = new Mean();
            return operation.forward(this, dim, keepdims);
        };

        /**
         * Gets the variance of the Tensor over a specified dimention.
         * @param {number} dim - Dimention to get variance over.
         * @param {boolean} keepdims - Wether to keep dimentions of original tensor.
         * @returns {Tensor} - Final tensor.
         */
        variance(dim=-1, keepdims=false) {
            const operation = new Variance();
            return operation.forward(this, dim, keepdims);
        };

        /**
         * Add integer or other Tensor to this Tensor.
         * @param {any} other - Tensor or integer to be added to this Tensor.
         * @returns {object} New tensor.
         */
        add(other) {
            const operation = new Add();
            return operation.forward(this, other);
        };

        /**
         * Subtract integer or other Tensor from this Tensor.
         * @param {any} other - Tensor or integer to be subtracted from this Tensor.
         * @returns {object} New tensor.
         */
        sub(other) {
            if (typeof other === 'number') {return this.add(-other)};
            return this.add(other.neg());
        };


        /**
         * Get element-wise opposite of given tensor ( every element * (-1) )
         * @returns {object} New tensor.
         */
        neg() {
            const operation = new Neg();
            return operation.forward(this);
        };

        /**
         * Multiply this Tensor by integer or other Tensor.
         * @param {any} other - Tensor or integer to multiply this Tensor by.
         * @returns {object} New tensor.
         */
        mul(other) {
            const operation = new Mul();
            return operation.forward(this, other);
        };

        /**
         * Divide this Tensor by integer or other Tensor.
         * @param {any} other - Tensor or integer to divide this Tensor by.
         * @returns {object} New tensor.
         */
        div(other) {
            const operation = new Div();
            return operation.forward(this, other);
        };

        /**
         * Multiply this Tensor by integer or other Tensor.
         * @param {any} other - Tensor or integer to multiply this Tensor by.
         * @returns {object} New tensor.
         */
        matMul(other) {
            const operation = new MatMul();
            return operation.forward(this, other);
        };
        
        /**
         * Get tensor to element-wise power of n.
         * @param {number} n - Exponent.
         * @returns {object} New tensor.
         */
        pow(n) {
            const operation = new Pow();
            return operation.forward(this, n);
        };

        /**
         * Get element-wise square root of given tensor.
         * @returns {object} New tensor.
         */
        sqrt() {
            const operation = new Sqrt();
            return operation.forward(this);   
        };
        
        /**
         * Get element-wise exponentiation of given tensor ( e^(every element) )
         * @returns {object} New tensor.
         */
        exp() {
            const operation = new Exp();
            return operation.forward(this);   
        };
        
        /**
         * Get element-wise natural log of given tensor ( ln(every element) )
         * @returns {object} New tensor.
         */
        log() {
            const operation = new Log();
            return operation.forward(this);
        };

        /**
         * Transpose the tensor along two consecutive dimensions:
         * @param {number} dim1 - First dimension.
         * @param {number} dim2 - Second dimension.
         * @returns {object} New tensor.
         */
        transpose(dim1, dim2) {
            let operation = new Transpose();
            return operation.forward(this, dim1, dim2);
        };

        /**
         * In a tensor, returns a list of elements in [index1], or [index1][index2];
         * @param {object} index1 - List containing indexes to extract data from in first dimension.
         * @param {object} index2 - List containing indexes to extract data from in second dimension [OPTIONAL].
         * @returns {object} New tensor.
         * @example 
         * let a = tensor([[1,1,2,3],
         *                 [6,7,8,9]])
         * 
         * // Returns tensor([2,6,9]):
         * a.at([0,1,1], [2,0,3])
         * 
         * // Returns tensor([[1,1,2,3],
         *                    [6,7,8,9],
         *                    [1,1,2,3]])
         * a.at([0,1,0])
         */
        at(index1, index2) {
            let operation = new At();
            return operation.forward(this, index1, index2);
        };

        /**
         * Where the "condition" function returns True in "mask" Tensor, the "value" will fill the "this" Tensor.
         * @param {Tensor} mask - "condition" will be applied in this tensor element-wise.
         * @param {function} condition - Function that returns True or False element-wise.
         * @param {number} value - Value to fill Tensor when condition is met.
         * @returns {object} New tensor.
         * @example 
         * let a = tensor([[1,5,2,3],
         *                 [6,7,2,9]])
         * 
         * // Returns tensor([[1,0,2,3],
         * //                 [0,0,2,0]])
         * a.masked_fill(mask, (el) => {return el > 3}, 0)
         */
        masked_fill(mask, condition, value) {
            let operation = new MaskedFill();
            return operation.forward(this, mask, condition, value);
        };

        /**
         * Reshape the tensor into the new shape:
         * @param {object} shape - New tensor's shape.
         * @returns {object} New tensor.
         */  
        reshape(shape) {
            let operation = new Reshape();
            return operation.forward(this, shape);
        };

    };




    // <<< Parameter class, tensor that always tracks gradients >>> // 

    /**
     * Creates new Parameter (an instance of the Tensor class that always tracks gradients).
     * @param {object} data - Iterable containing the data to be stored in the Tensor.
     */
    class Parameter extends Tensor {
        
        constructor(self, data) {
            super(data, requires_grad=true);
        };
    };



    // <<< Basic Operations >>> //

    class Add {

        /**
         * Add tensors or tensor and integers.
         * @param {any} a - First tensor or integer.
         * @param {any} b - Second tensor or integer.
         * @returns {object} New tensor.
         */
        forward(a, b) {
            // Build cache to use in backward step:
            this.cache = [a,b];

            let aData = utils.getData(a); 
            let bData = utils.getData(b);

            // Call recursive function:
            let z = new Tensor(
                _add(aData, bData), // data;
                (a.requires_grad || b.requires_grad) // requires_grad;
                ); 

            // Connect nodes in graph:
            if (a instanceof Tensor & a.requires_grad){
                z.parents.push(a);
                a.children.push(z);
            };
            if (b instanceof Tensor & b.requires_grad){
                z.parents.push(b);
                b.children.push(z);
            };
            z.operation = this;

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let [a, b] = this.cache;


            // Find gradients relative to "a", and pass it downstream:
            if (a.requires_grad) {
                let da = dz;
                // Rescale gradient to have the same shape as "a":
                da = broadcast(da, a);
                a.backward(da, z);
            };

            // Find gradients relative to "b", and pass it downstream:
            if (b.requires_grad) {
                let db = dz;
                // Rescale gradient to have the same shape as "b":
                db = broadcast(db, b);
                b.backward(db, z);
            };  
        };
    };

    class Neg {
        /**
         * Get element-wise opposite of given tensor ( every element * (-1) )
         * @param {object} a - Tensor to be multiplied by -1.
         * @returns {object} New tensor.
         */
        forward(a) {
            // Build cache to use in backward step:
            this.cache = a;

            // Call recursive function:
            let z = new Tensor(
                _neg(a._data), // data;
                (a.requires_grad), // requires_grad;
                );

            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let a = this.cache;

            if (a.requires_grad) {
                let da = neg(dz);
                a.backward(da, z);
            };
        };
    };

    class Mul {
        /**
         * Perform element-wise multiplication between Tensors and integers or other Tensors.
         * @param {any} a - First tensor or integer.
         * @param {any} b - Second tensor or integer.
         * @returns {object} New tensor.
         */
        forward(a, b) {
            // Build cache to use in backward step:
            this.cache = [a,b];

            let aData = utils.getData(a); 
            let bData = utils.getData(b);

            // Call recursive function:
            let z = new Tensor(
                _mul(aData, bData), // data;
                (a.requires_grad || b.requires_grad), // requires_grad;
                );

            // Connect nodes in graph:
            if (a instanceof Tensor & a.requires_grad){
                z.parents.push(a);
                a.children.push(z);
            };
            if (b instanceof Tensor & b.requires_grad){
                z.parents.push(b);
                b.children.push(z);
            };
            z.operation = this;

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let [a, b] = this.cache;


            // Find gradients relative to "a", and pass it downstream:
            if (a.requires_grad) {
                let da = new Tensor (_mul(dz.data, utils.getData(b)));
                // Rescale gradient to have the same shape as "a":
                da = broadcast(da, a);
                a.backward(da, z);
            };

            // Find gradients relative to "b", and pass it downstream:
            if (b.requires_grad) {
                let db = new Tensor (_mul(dz.data, utils.getData(a)));
                // Rescale gradient to have the same shape as "b":
                db = broadcast(db, b);
                b.backward(db, z);
            };  
        };
    };

    class Div {

        /**
         * Perform element-wise division between Tensors and integers or other Tensors.
         * @param {any} a - First tensor or integer.
         * @param {any} b - Second tensor or integer.
         * @returns {object} New tensor.
         */
        forward(a, b) {
            // Build cache to use in backward step:
            this.cache = [a,b];

            let aData = utils.getData(a); 
            let bData = utils.getData(b);

            // Call recursive function:
            let z = new Tensor(
                _div(aData, bData), // data;
                (a.requires_grad || b.requires_grad), // requires_grad;
                );

            // Connect nodes in graph:
            if (a instanceof Tensor & a.requires_grad){
                z.parents.push(a);
                a.children.push(z);
            };
            if (b instanceof Tensor & b.requires_grad){
                z.parents.push(b);
                b.children.push(z);
            };
            z.operation = this;

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let [a, b] = this.cache;

            // Find gradients relative to "a", and pass it downstream:
            if (a.requires_grad) {
                // d/da(a/b) = (1/b), apply chain rule:
                let da = new Tensor (_mul(dz.data, _div(1, utils.getData(b))));

                // Rescale gradient to have the same shape as "a":
                da = broadcast(da, a);

                a.backward(da, z);
            };

            // Find gradients relative to "b", and pass it downstream:
            if (b.requires_grad) {
                // d/db(a/b) = -(a/b^2), apply chain rule:
                let db = new Tensor(_mul(dz.data, _neg(_div(utils.getData(a), _pow(utils.getData(b), 2)))));
                // Rescale gradient to have the same shape as "b":
                db = broadcast(db, b);
                
                b.backward(db, z);
            };  
        };
    };

    class MatMul {
        forward(a, b) {
            // Build cache to use in backward step:
            this.cache = [a, b];

            let aData = a.data;
            let bData = b.data;
            // Broadcast smaller tensor to match size of larger:
            if (a.shape.length < b.shape.length) {
                aData = broadcastUp(aData, bData);
            } else {
                bData = broadcastUp(bData, aData);
            };

            // Call recursive function:
            let z = new Tensor(
                _matmul(aData, bData), // data;
                (a.requires_grad || b.requires_grad), // requires_grad;
                );

            // Connect nodes in graph to parents:
            z.parents.push(a);
            z.parents.push(b);
            z.operation = this;

            // Connect nodes in graph to children:
            a.children.push(z);
            b.children.push(z);

            return z;
        };

        backward(dz, z) {
            // Get data from cache: 
            let [a, b] = this.cache;
            // Find gradients relative to "a", and pass it downstream:
            if (a.requires_grad) {
                // Define Operands:
                let dzData = dz.data;
                let b_T = _transpose(b.data, b.ndims-2);
                // Broadcast smaller tensor to match size of larger:
                b_T = broadcastUp(b_T, dzData);
                // Backprop through the matmul:
                let da = new Tensor (_matmul(dzData, b_T));
                // Rescale gradient to have the same shape as "a":
                da = broadcast(da, a);

                a.backward(da, z);
            };
            // Find gradients relative to "a", and pass it downstream:
            if (b.requires_grad) {
                // Define Operands:
                let dzData = dz.data;
                let a_T = _transpose(a.data, a.ndims-2);
                // Broadcast smaller tensor to match size of larger:
                a_T = broadcastUp(a_T, dzData);
                // Backprop through the matmul:
                let db = new Tensor (_matmul(a_T, dzData));
                // Rescale gradient to have the same shape as "b":
                db = broadcast(db, b);
                b.backward(db, z);
            };
        };
    };

    class Pow {
        /**
         * Get tensor to element-wise power of n.
         * @param {object} a - Tensor to be elevated to the power of n.
         * @param {number} n - Exponent.
         * @returns {object} New tensor.
         */
        forward(a, n) {
            // Build cache to use in backward step:
            this.cache = a;

            // Call recursive function:
            let z = new Tensor(
                _pow(a._data, n), // data;
                a.requires_grad // requires_grad;
                );

            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };
            

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let a = this.cache;
            
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                // d/da(e^a) = e^a, apply the chain rule to the derivative of e^a:
                let da = new Tensor (_mul(2, _mul(a.data, dz.data)));
                a.backward(da, z);
            };
        };
    };

    class Sqrt {
        /**
         * Get element-wise square root of given tensor
         * @param {object} a - Tensor to be square rooted.
         * @returns {object} New tensor.
         */
        forward(a) {
            // Build cache to use in backward step:
            this.cache = a;

            // Call recursive function:
            let z = new Tensor(
                _sqrt(a._data), // data;
                a.requires_grad // requires_grad;
                );

            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };
            

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let a = this.cache;
            
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                // d/da(sqrt(a)) = (1/2) *  (1/sqrt(a)), apply the chain rule to the derivative of e^a:
                let da = new Tensor(_mul(_mul(_div(1,2), _div(1,_sqrt(a.data))), dz.data));
                a.backward(da, z);
            };
        };
    };

    class Exp {
        /**
         * Get element-wise exponentiation of given tensor ( e^(every element) )
         * @param {object} a - Tensor to be exponentiated.
         * @returns {object} New tensor.
         */
        forward(a) {
            // Build cache to use in backward step:
            this.cache = a;

            // Call recursive function:
            let z = new Tensor(
                _exp(a._data), // data;
                a.requires_grad // requires_grad;
                );

            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };
            

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let a = this.cache;
            
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                // d/da(e^a) = e^a, apply the chain rule to the derivative of e^a:
                let da = new Tensor(_mul(_exp(a.data), dz.data));
                a.backward(da, z);
            };
        };
    };

    class Log {
        /**
         * Get element-wise natural log of given tensor ( ln(every element) )
         * @param {object} a - Tensor we will take the log of.
         * @returns {object} New tensor.
         */
        forward(a) {
            // Build cache to use in backward step:
            this.cache = a;

            // Call recursive function:
            let z = new Tensor(
                _log(a._data), // data;
                a.requires_grad // requires_grad;
                );

            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };
            

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let a = this.cache;
            
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                // d/da(ln(a)) = (1/a), apply the chain rule to the derivative of the natural log:
                let da = new Tensor (_mul(_div(1, a.data), dz.data));

                a.backward(da, z);
            };
        };
    };

    // <<< Tensor Statistics >>> //


    class Sum {
        /**
         * Gets the sum of a Tensor over a specified dimention.
         * @param {Tensor} a - Tensor to sum.
         * @param {dim} dim - Dimention to sum over.
         * @param {keepdims} keepdims - Wether to keep dimentions of original tensor.
         * @returns {Tensor} - Final tensor.
         */
        forward(a, dim, keepdims=false) {
            // Build cache to use in backward step:
            this.cache = [a, dim, keepdims]

            // Account for negative dimension index:
            if (dim < 0) {
                dim = a.shape.length + dim;
            };
            // Return error if dimention is out of bounds:
            if (dim >= a.shape.length) {
                throw Error('Dimension larger than array.')
            };
            // Create output tensor:
            let z = new Tensor(
                _sum(a._data, dim, keepdims=keepdims), // New data.
                (a.requires_grad), // requires_grad.
                );
            
            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };
            
            return z;
        };
        
        backward(dz, z) {
            // Get data from cache:
            let [a, dim, keepdims] = this.cache;
            
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                
                if (keepdims){
                    dz = dz.sum(dim);
                };
                
                let da = broadcast(dz, a);
                
                a.backward(da, z);
            };
        };
    };

    class Mean {
        /**
         * Gets the mean of a Tensor over a specified dimention.
         * @param {Tensor} a - Tensor to get mean from.
         * @param {dim} dim - Dimention to get mean over.
         * @param {keepdims} keepdims - Wether to keep dimentions of original tensor.
         * @returns {Tensor} - Final tensor.
         */
        forward(a, dim, keepdims=false) {
            // Account for negative dimension index:
            if (dim < 0) {
                dim = a.shape.length + dim;
            };
            // Return error if dimention is out of bounds:
            if (dim >= a.shape.length) {
                throw Error('Dimension larger than array.')
            };

            // Build cache to use in backward step:
            this.cache = [a, dim]

            // Create output tensor:
            let z = new Tensor(
                _mean(a._data, dim, keepdims), // New data.
                (a.requires_grad), // keep_dims.
                );
            
            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };

            return z;
        };
        
        backward(dz, z) {
            // Get data from cache:
            let [a, dim] = this.cache;
            
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                // Backprop through mean:
                let da = new Tensor (_div(dz.data, a.shape[dim]));
                // Expand upstream gradients to the shape of "a":
                da = broadcast(da, a);
                a.backward(da, z);
            };
        };
    };

    class Variance {
        /**
         * Gets the variance of a Tensor over a specified dimention.
         * @param {Tensor} a - Tensor to get variance of.
         * @param {dim} dim - Dimention to get variance over.
         * @param {keepdims} keepdims - Wether to keep dimentions of original tensor.
         * @returns {Tensor} - Final tensor.
         */
        forward(a, dim, keepdims=false) {
            // Account for negative dimension index:
            if (dim < 0) {
                dim = a.shape.length + dim;
            };
            // Return error if dimention is out of bounds:
            if (dim >= a.shape.length) {
                throw Error('Dimension larger than array.');
            };

            // Build cache to use in backward step:
            this.cache = [a, dim];

            // Create output tensor:
            let z = new Tensor(
                _variance(a._data, dim, keepdims), // New data.
                (a.requires_grad), // keep_dims.
                );
            
            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };

            return z;
        };
        
        backward(dz, z) {
            // Get data from cache:
            let [a, dim] = this.cache;
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                // Expand upstream gradients to the shape of "a":
                let da = broadcast(dz, a);
                // Backprop through variance:
                let err = _add(a._data, _neg(_mean(a._data, dim, true)));
                let var_err = _mul(_mul(da._data, 2), err);
                da = _div(var_err, a.shape[dim]);
                // Create new "da" Tensor:
                da = new Tensor(da);
                a.backward(da, z);
            };
        };
    };

    // <<< Tensor Operations >>> //

    class Transpose {
        /**
         * Transpose the tensor along two consecutive dimensions:
         * @param {object} a - Tensor to transpose.
         * @param {number} dim1 - First dimension.
         * @param {number} dim2 - Second dimension.
         * @returns {object} New tensor.
         */
        forward(a, dimA, dimB) {
            // Build cache to use in backward step:
            this.cache = [a,dimA,dimB];

            // Account for negative dimension index:
            if (dimA < 0) {
                dimA = a.shape.length + dimA;
            };
            if (dimB < 0) {
                dimB = a.shape.length + dimB;
            };
            // Get first dimension to be transposed:
            let dim;
            if (dimB < dimA) {
                dim = dimB;
            } else if (dimB > dimA) {
                dim = dimA;
            } else {
                throw new Error('ValueError: dimensions are not consecutive.')
            };

            // Call recursive function:
            let z = new Tensor(
                _transpose(a._data, dim), // data;
                (a.requires_grad), // requires_grad;
                );
            
            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };
            
            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let [a, dimA, dimB] = this.cache;
            
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                let da = dz.transpose(dimA, dimB);
                a.backward(da, z);
            };
        };
    };

    class At {
        forward(a, idx1, idx2=null) {
            // Get shape of outgoing tensor:
            let B = utils.getShape(utils.assureArray(idx1))[0];

            // Make sure index lists are flat JavaScript arrays:
            if (idx1) {idx1 = _flatten(utils.assureArray(idx1))};
            if (idx2) {idx2 = _flatten(utils.assureArray(idx2))};

            // Build cache to use in backward step:
            this.cache = [a, idx1, idx2];
            
            // Call function:
            let z = new Tensor(
                _at(a._data, idx1, idx2), // data;
                a.requires_grad // requires_grad;
                );

            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };
            

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let [a, idx1, idx2] = this.cache;
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                let da = zeros(a.shape);

                // Add derivatives to the original places from a:
                for (let i=0 ; i < dz.length ; i++) {
                    // If there is a second index, add to each [i][j] coordinate (2D):
                    if (idx2 != null) {
                        da._data[idx1[i]][idx2[i]] = dz._data[i];
                    // If there is not a second index, add to each [i] coordinate (1D):
                    } else {
                        da._data[idx1[i]] = dz._data[i];
                    }
                    
                }
                a.backward(da, z);
            };
        };
    };

    class MaskedFill {
        forward(a, mask, condition, value) {
            // Build cache to use in backward step:
            this.cache = [a, mask, condition];

            // Call function:
            let z = new Tensor(
                _masked_fill(a._data, mask._data, condition, value), // data;
                a.requires_grad // requires_grad;
                );

            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };
            

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let [a, mask, condition] = this.cache;
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                // Set gradients of all reset values to zero: 
                let da = new Tensor (_masked_fill(dz._data, mask._data, condition, 0));
                
                a.backward(da, z);
            };
        };
    };

    class Reshape {
        forward(a, shape) {
            // Build cache to use in backward step:
            this.cache = a;

            // Call function:
            let z = new Tensor(
                _reshape(a._data, shape), // data;
                a.requires_grad // requires_grad;
                );

            // Connect nodes in graph:
            if (a.requires_grad) {
                z.parents.push(a);
                a.children.push(z);
                z.operation = this;
            };

            return z;
        };

        backward(dz, z) {
            // Get data from cache:
            let a = this.cache;
            
            // Find gradients relative to "a", and pass them downstream:
            if (a.requires_grad) {
                // Reshape dz back to a's shape:
                let da = new Tensor(_reshape(dz.data, a.shape));
                a.backward(da, z);
            };
        };
    };




    // <<< Tensor Operation Aliases >>> //

    /**
     * Gets the sum of the Tensor over a specified dimention.
     * @param {Tensor} a - Original Tensor.
     * @param {number} dim - Dimention to sum over.
     * @param {boolean} keepdims - Wether to keep dimentions of original tensor.
     * @returns {Tensor} - Final tensor.
     */
    function sum(a, dim=-1, keepdims=false) {
        return a.sum(dim, keepdims);
    };

    /**
     * Gets the mean of the Tensor over a specified dimention.
     * @param {Tensor} a - Original Tensor.
     * @param {number} dim - Dimention to get mean over.
     * @param {boolean} keepdims - Wether to keep dimentions of original tensor.
     * @returns {Tensor} - Final tensor.
     */
    function mean(a, dim=-1, keepdims=false) {
        return a.mean(dim, keepdims);
    };

    /**
     * Gets the variance of the Tensor over a specified dimention.
     * @param {Tensor} a - Original Tensor.
     * @param {number} dim - Dimention to get variance over.
     * @param {boolean} keepdims - Wether to keep dimentions of original tensor.
     * @returns {Tensor} - Final tensor.
     */
    function variance(a, dim=-1, keepdims=false) {
        return a.variance(dim, keepdims);
    };


    /**
     * Add integer or other Tensor to this Tensor.
     * @param {Tensor} a - Original Tensor.
     * @param {any} b - Tensor or integer to be added to this Tensor.
     * @returns {object} New tensor.
     */
    function add(a, b) {
        return a.add(b);
    };

    /**
     * Subtract integer or other Tensor from this Tensor.
     * @param {Tensor} a - Original Tensor.
     * @param {any} b - Tensor or integer to be subtracted from this Tensor.
     * @returns {object} New tensor.
     */
    function sub(a, b) {
        return a.sub(b);
    };

    /**
     * Get element-wise opposite of given tensor ( every element * (-1) )
     * @returns {object} New tensor.
     */
    function neg(a) {
        return a.neg();
    };

    /**
     * Multiply this Tensor by integer or other Tensor.
     * @param {any} other - Tensor or integer to multiply this Tensor by.
     * @returns {object} New tensor.
     */
    function mul(a, b) {
        return a.mul(b);
    };

    /**
     * Divide this Tensor by integer or other Tensor.
     * @param {any} other - Tensor or integer to divide this Tensor by.
     * @returns {object} New tensor.
     */
    function div(a, b) {
        const operation = new Div()
        return operation.forward(a, b);
    };

    /**
     * Get tensor to element-wise power of n.
     * @param {object} a - Tensor to be elevated to the power of n.
     * @param {number} n - Exponent.
     * @returns {object} New tensor.
     */
    function pow(a, n) {
        const operation = new Pow()
        return operation.forward(a, n);
    };

    /**
     * Get element-wise square root of given tensor.
     * @param {object} a - Tensor to be square rooted.
     * @returns {object} New tensor.
     */
    function sqrt(a) {
        return a.sqrt();
    };

    /**
     * Get element-wise exponentiation of given tensor ( e^(every element) )
     * @param {object} a - Tensor to be exponentiated.
     * @returns {object} New tensor.
     */
    function exp(a) {
        return a.exp();
    };

    /**
     * Get element-wise natural log of given tensor ( ln(every element) )
     * @param {object} a - Tensor we will take the log of.
     * @returns {object} New tensor.
     */
    function log(a) {
        return a.log();
    };

    /**
     * Multiply this Tensor by integer or other Tensor.
     * @param {any} other - Tensor or integer to multiply this Tensor by.
     * @returns {object} New tensor.
     */
    function matMul(a, b) {
        return a.matMul(b);
    };

    /**
     * Transpose the tensor along two consecutive dimensions:
     * @param {Tensor} a - Tensor to be transposed.
     * @param {number} dim1 - First dimension.
     * @param {number} dim2 - Second dimension.
     * @returns {object} New tensor.
     */
    function transpose(a, dim1, dim2) {
        return a.transpose(dim1, dim2);
    };

    /**
     * In a tensor, returns a list of elements in [index1], or [index1][index2];
     * @param {Tensor} a - Original Tensor.
     * @param {object} index1 - List containing indexes to extract data from in first dimension.
     * @param {object} index2 - List containing indexes to extract data from in second dimension [OPTIONAL].
     * @returns {object} New tensor.
     * @example 
     * let a = tensor([[1,1,2,3],
     *                 [6,7,8,9]])
     * 
     * // Returns tensor([2,6,9]):
     * a.at([0,1,1], [2,0,3])
     * 
     * // Returns tensor([[1,1,2,3],
     * //                 [6,7,8,9],
     * //                 [1,1,2,3]])
     * a.at([0,1,0])
     */
    function at(a, idx1, idx2) {
        return a.at(idx1, idx2);
    };

    /**
     * Where the "condition" function returns True in the "mask" Tensor, the "value" will fill the "a" Tensor.
     * @param {Tensor} a - Original Tensor.
     * @param {Tensor} mask - "condition" will be applied in this tensor element-wise.
     * @param {function} condition - Function that returns True or False element-wise.
     * @param {number} value - Value to fill Tensor when condition is met.
     * @returns {object} New tensor.
     * @example 
     * let a = tensor([[1,5,2,3],
     *                 [6,7,2,9]])
     * 
     * // Returns tensor([[1,0,2,3],
     * //                 [0,0,2,0]])
     * masked_fill(a, mask, (el) => {return el > 3}, 0)
     */
    function masked_fill(a, mask, condition, value) {
        return a.masked_fill(mask, condition, value);
    };

    /**
     * Reshape the tensor into the new shape:
     * @param {Tensor} a - Tensor to be reshaped.
     * @param {object} shape - New tensor's shape.
     * @returns {object} New tensor.
     */
    function reshape(a, shape) {
        return a.reshape(shape);
    };




    // <<< Recursive functions for lists >>> //

    function _sum(a, dim, keepdims) {
                
        // In recursive call, when depth increases, subtract one from dim. 
        // When we reach the dimention intended (dim === 0),
        // we add all elements in this dimension.
        if ( dim == 0 ) {
            let sum = a.reduce((a,b) => _add(a, b), 0);
            if (keepdims) {
                return Array(a.length).fill(sum);
            } else {
                return sum;
            };
        } else if (typeof a === 'object') {
            return a.map((element) => _sum(element, dim - 1, keepdims));
        } else {
            throw Error('Dimension invalid.');
        };
    };

    function _mean(a, dim, keepdims) {
                
        // In recursive call, when depth increases, subtract one from dim. 
        // When we reach the dimention intended (dim === 0),
        // we add all elements in this dimension.
        if ( dim == 0 ) {
            let reduced = _div(a.reduce((a,b) => _add(a, b), 0), a.length);
            if (keepdims) {
                return Array(a.length).fill(reduced);
            } else {
                return reduced;
            };
        } else if (typeof a === 'object') {
            return a.map((element) => _mean(element, dim - 1, /*, keepdims*/));
        } else {
            throw Error('Dimension invalid.');
        };
    };

    function _variance(a, dim, keepdims) {
                
        // In recursive call, when depth increases, subtract one from dim. 
        // When we reach the dimention intended (dim === 0),
        // we add all elements in this dimension.
        if ( dim == 0 ) {
            // Get mean over current dim:
            let mean = _div(a.reduce((a,b) => _add(a, b), 0), a.length);
            // Get square difference to mean over current dim:
            let squares = a.map((el) => (el-mean)**2);
            // Get mean of square differences over current dim:
            let variance = _div(squares.reduce((a,b) => _add(a, b), 0), a.length);
            if (keepdims) {
                return Array(a.length).fill(variance);
            } else {
                return variance;
            };
        } else if (typeof a === 'object') {
            return a.map((element) => _variance(element, dim - 1, /*keepdims*/));
        } else {
            throw Error('Dimension invalid.');
        };
    };

    function _add(a,b){
        // If both are numbers, return number. If one is a Tensor, add number to each element in tensor.
        if (typeof a === 'number' && typeof b === 'number' ) {
            return a + b;
        } else if (typeof a ==='number') {
            return b.map((element) => _add(element, a));
        } else if (typeof b ==='number') {
            return a.map((element) => _add(element, b));
        } else {

            // If both are tensors, we need to broadcast:
            let aShape = utils.getShape(a);
            let bShape = utils.getShape(b);
            // If both have same shape, move downwards in both:
            if (JSON.stringify(aShape) === JSON.stringify(bShape)) {
                return a.map((element, idx) => _add(element, b[idx]));
            // If a's shape is larger, we need to find b's shape inside a's shape:
            } else if (aShape.length > bShape.length) {
                let idx;
                // Look for b's shape:
                for (let i=0 ; i < aShape.length ; i++) {
                    if (JSON.stringify(aShape.slice(i, i+bShape.length)) === JSON.stringify(bShape)) {
                        idx = i;
                    };
                };
                // If it's right on top of the array, move down on both:
                if (idx === 0) {
                    return a.map((element, idx) => _add(element, b[idx]));
                // If not, move down only on 'a':
                } else {
                    return a.map((element) => _add(element, b));
                };
            // If b's shape is larger, we need to find a's shape inside b's shape:
            } else if (aShape.length < bShape.length)  {
                let idx;
                // Look for a's shape:
                for (let i=0 ; i < bShape.length ; i++) {
                    if (JSON.stringify(bShape.slice(i, i+aShape.length)) === JSON.stringify(aShape)) {
                        idx = i;
                    };
                };
                // If it's right on top of the array, move down on both:
                if (idx === 0) {
                    return b.map((element, idx) => _add(a[idx], element));
                // If not, move down only on 'b':
                } else {
                    return b.map((element) => _add(a, element));
                };
            };
        };
    };

    function _neg(a) {
        // If a is a number, make it negative. If not, make all of its elements negative:
        if (typeof a === 'number') {
            return -a;
        } else if (typeof a === 'object') {
            return a.map((element) => _neg(element));
        } else {
            throw new TypeError('the input data is not a number.');
        };
    };

    function _mul(a, b) {
        // If both are numbers, return number. If one is a Tensor, multiply each element in the tensor by the number.
        if (typeof a === 'number' && typeof b === 'number' ) {
            return a * b;
        } else if (typeof a ==='number') {
            return b.map((element) => _mul(element, a));
        } else if (typeof b ==='number') {
            return a.map((element) => _mul(element, b));
        } else {

            // If both are tensors, we need to broadcast:
            let aShape = utils.getShape(a);
            let bShape = utils.getShape(b);
            // If both have same shape, move downwards in both:
            if (JSON.stringify(aShape) === JSON.stringify(bShape)) {
                return a.map((element, idx) => _mul(element, b[idx]));
            // If a's shape is larger, we need to find b's shape inside a's shape:
            } else if (aShape.length > bShape.length) {
                let idx;
                // Look for b's shape:
                for (let i=0 ; i < aShape.length ; i++) {
                    if (JSON.stringify(aShape.slice(i, i+bShape.length)) === JSON.stringify(bShape)) {
                        idx = i;
                    };
                };
                // If it's right on top of the array, move down on both:
                if (idx === 0) {
                    return a.map((element, idx) => _mul(element, b[idx]));
                // If not, move down only on 'a':
                } else {
                    return a.map((element) => _mul(element, b));
                };
            // If b's shape is larger, we need to find a's shape inside b's shape:
            } else if (aShape.length < bShape.length)  {
                let idx;
                // Look for a's shape:
                for (let i=0 ; i < bShape.length ; i++) {
                    if (JSON.stringify(bShape.slice(i, i+aShape.length)) === JSON.stringify(aShape)) {
                        idx = i;
                    };
                };
                // If it's right on top of the array, move down on both:
                if (idx === 0) {
                    return b.map((element, idx) => _mul(a[idx], element));
                // If not, move down only on 'b':
                } else {
                    return b.map((element) => _mul(a, element));
                };
            };
        };
    };

    function _div(a, b) {

        // If both are numbers, return number. If one is a Tensor, divide each element in the tensor by the number.
        if (typeof a === 'number' && typeof b === 'number' ) {
            return a / b;
        } else if (typeof a ==='number') {
            return b.map((element) => _div(a, element));
        } else if (typeof b ==='number') {
            return a.map((element) => _div(element, b));
        } else {

            // If both are tensors, we need to broadcast:
            let aShape = utils.getShape(a);
            let bShape = utils.getShape(b);
            // If both have same shape, move downwards in both:
            if (JSON.stringify(aShape) === JSON.stringify(bShape)) {
                return a.map((element, idx) => _div(element, b[idx]));
            // If a's shape is larger, we need to find b's shape inside a's shape:
            } else if (aShape.length > bShape.length) {
                let idx;
                // Look for b's shape:
                for (let i=0 ; i < aShape.length ; i++) {
                    if (JSON.stringify(aShape.slice(i, i+bShape.length)) === JSON.stringify(bShape)) {
                        idx = i;
                    };
                };

                // If it's right on top of the array, move down on both:
                if (idx === 0) {
                    return a.map((element, idx) => _div(element, b[idx]));
                // If not, move down only on 'a':
                } else {
                    return a.map((element) => _div(element, b));
                };
            // If b's shape is larger, we need to find a's shape inside b's shape:
            } else if (aShape.length < bShape.length)  {
                let idx;
                // Look for a's shape:
                for (let i=0 ; i < bShape.length ; i++) {
                    if (JSON.stringify(bShape.slice(i, i+aShape.length)) === JSON.stringify(aShape)) {
                        idx = i;
                    };
                };
                // If it's right on top of the array, move down on both:
                if (idx === 0) {
                    return b.map((element, idx) => _div(a[idx], element));
                // If not, move down only on 'b':
                } else {
                    return b.map((element) => _div(a, element));
                };
            };
        };
    };

    function _matmul(a, b) {
        if (typeof a === 'number') {
            throw new Error('Cannot perform MatMul with given shapes.');
        }
        // If this dimension has equal lengths, keep searching:
        if (typeof a[0][0] === 'object') { // ==============================>>>>> typeof a[0][0] === 'object' [NOVO] ou a.length === b.length [ANTIGO]
            return a.map((element, idx) => _matmul(element, b[idx]));
        // If not, try to matmul:
        } else {
            // If dimensions align, perform matmul:
            if (a[0].length === b.length && typeof a[0][0] === 'number') {
                // Make a [a[0].length x b.length] array:
                let out = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
                for (let i=0 ; i < a.length ; i++) {
                    for (let j=0 ; j < b[0].length ; j++) {
                        let currentIndex = 0;
                        for (let k=0 ; k < b.length ; k++) {
                            currentIndex += a[i][k] * b[k][j];
                        };
                        out[i][j] = currentIndex;
                    };
                };
                return out;
            // If not, throw error:
            } else {
                throw Error(`Cannot perform Matrix Multiplication: cannot broadcast ${[a.length, a[0].length]} and ${[b.length, b[0].length]}`);
            };
        };
    };

    function _pow(a, n) {
        // If a is a number, exponentiate it. If not, exponentiate all of its elements:
        let z = a;
        for (let i=0; i < n-1 ; i++){
            z = _mul(z,a);
        };
        return z;
    };

    function _sqrt(a) {
        // If a is a number, take square root of it. If not, take root of all of its elements:
        if (typeof a === 'number') {
            return Math.sqrt(a);
        } else if (typeof a === 'object') {
            return a.map((element) => _sqrt(element));
        } else {
            throw new TypeError('the input data is not a number.');
        };
    };

    function _exp(a) {
        // If a is a number, exponentiate it. If not, exponentiate all of its elements:
        if (typeof a === 'number') {
            return 2.718281828459045 ** a;
        } else if (typeof a === 'object') {
            return a.map((element) => _exp(element));
        } else {
            throw new TypeError('the input data is not a number.');
        };
    };

    function _log(a) {
        // If a is a number, take it's log. If not, take log of all of it's elements:
        if (typeof a === 'number') {
            return Math.log(a);
        } else if (typeof a === 'object') {
            return a.map((element) => _log(element));
        } else {
            throw new TypeError('the input data is not a number.');
        };
    };

    function _transpose(a, dim){
        // Go down the dimensions recursively until we get to the dimension to be transposed:
        if ( dim == 0 ) {
            // Build array with the transposed shape (to be filled with transposed values):
            let newArray = Array(a[0].length).fill(0).map(() => Array(a.length).fill(0));

            for (i=0 ; i<a.length ; i++) {
                for (j=0 ; j<a[i].length ;  j++) {
                    newArray[j][i] = a[i][j];
                };
            };
            return newArray;
        } else if (typeof a === 'object') {
            return a.map((element) => _transpose(element, dim - 1));
        } else {
            throw Error('ValueError: dimensions are invalid.');
        };
    };

    function _at(a, idx1, idx2) {
        if (idx1 instanceof Tensor) {
            idx1 = idx1.data;
        };
        if (idx2 instanceof Tensor) {
            idx2 = idx2.data;
        };
        // If there is a second index, fill a new array in position "N" with a[idx1[N]][idx2[N]] (2 Dims):
        if (idx2 != null) {
            return Array(idx1.length).fill(0).map((_, i) => a[idx1[i]][idx2[i]]);
        // If there is no second index, fill a new array in position "N" with a[idx1[N]] (1 Dim):
        } else {
            return Array(idx1.length).fill(0).map((_, i) => a[idx1[i]]);
        };
    };

    function _masked_fill(a, mask, condition, value) {
        // If a is a number, test "condition" on it. If not, recursive step to all of its elements:
        if (typeof mask === 'number') {
            if (typeof a != 'number') { throw new Error('Tensor and Mask not broadcastable') };
            if (condition(mask)) {
                return value;
            } else {
                return a;
            };
        } else if (typeof a === 'object') {
            return a.map((element, idx) => _masked_fill(element, mask[idx], condition, value));
        } else { throw new Error('The input data is not a number.') };
    };

    function _reshape(a, shape) {
        // Flattens array "a":
        function _flatten(a) {
            if (typeof a[0] === 'number') {
                flat = flat.concat(a);
            } else {
                for (el of a) {
                    _flatten(el);
                };
            };
        };
        // Rebuilds flattened array "flat" with shape "shape":
        function _build(a, shape) {
            if (shape.length > 1) {
                let emptyArray = Array(shape[0]).fill(0);
                return emptyArray.map(() => _build(a, shape.slice(1)));
            } else {
                let emptyArray = Array(shape[0]).fill(0);
                return emptyArray.map(() => a.shift());
            };
        };

        // Flatten array with a's data:
        let flat = [];
        _flatten(a, flat);
        // Rebuild a with new shape:
        return _build(flat, shape);

    };

    // Flattens array "a":
    function _flatten(a, flat=[]) {
        if (typeof a[0] === 'number') {
            return flat.concat(a);
        } else {
            for (el of a) {
                flat = _flatten(el, flat);
            };
        };
        return flat;
    };



    // <<< Tensor Initialization Methods >>> //

    /**
     * Generic initializer, creates new instance of the Tensor class, filling up a shape with a value.
     * @param {object} shape - List containing the shape of the new tensor Tensor.
     * @param {function} valueFunc - Function that returns number to fill up the Tensor.
     * @returns {object} New tensor.
     */
    function _tensorInitializer(shape, valueFunc) {
        if (shape.length === 1) {
            let emptyArray = Array(shape[0]).fill(0);
            return emptyArray.map(() => valueFunc());
        } else {
            let currentSize = shape[0];
            let emptyArray = Array(currentSize).fill(0);
            return emptyArray.map(() => _tensorInitializer(shape.slice(1), valueFunc));
        };
    };

    /**
     * Creates new instance of the Tensor class.
     * @param {object} data - Iterable containing the data to be stored in the Tensor.
     * @param {boolean} requires_grad - Wether to keep track of this tensor's gradients.
     * @returns {object} New tensor.
     */
    function tensor(data, requires_grad=false) {
        return new Tensor(data, requires_grad);
    };

    /**
     * Creates new instance of the Tensor class filled with only zeros.
     * @param {object} shape - List containing the shape of the new tensor Tensor.
     * @param {boolean} requires_grad - Wether to keep track of this tensor's gradients.
     * @returns {object} New tensor.
     */
    function zeros(shape, requires_grad=false) {
        return new Tensor(_tensorInitializer(shape, () => 0), requires_grad);
    };

    /**
     * Creates new instance of the Tensor class filled with only ones.
     * @param {object} shape - List containing the shape of the new tensor Tensor.
     * @param {boolean} requires_grad - Wether to keep track of this tensor's gradients.
     * @returns {object} New tensor.
     */
    function ones(shape, requires_grad=false) {
        return new Tensor(_tensorInitializer(shape, () => 1), requires_grad);
    };

    /**
     * Creates new instance of a lower-triangular 2D Tensor.
     * @param {object} shape - List containing the shape of the new tensor Tensor.
     * @param {boolean} requires_grad - Wether to keep track of this tensor's gradients.
     * @returns {object} New tensor.
     */
    function tril(shape, requires_grad=false) {
        let z = ones(shape, requires_grad)
        for (let i=0 ; i < shape[0] ; i++){
            for (let j=0 ; j < shape[0] ; j++) {
                if (j>i) {
                    z._data[i][j] = 0;
                };
            };
        };

        return new Tensor(z._data, requires_grad);
    };

    /**
     * Creates new instance of the Tensor class filled with numbers in a uniform distribution in ]0,1[.
     * @param {object} shape - List containing the shape of the new tensor Tensor.
     * @param {boolean} requires_grad - Wether to keep track of this tensor's gradients.
     * @returns {object} New tensor.
     */
    function rand(shape, requires_grad=false) {
        return new Tensor(_tensorInitializer(shape, () => Math.random()), requires_grad);
    };

    /**
     * Creates new instance of the Tensor class filled with numbers in a normal distribution.
     * @param {object} shape - List containing the shape of the new tensor Tensor.
     * @param {boolean} requires_grad - Wether to keep track of this tensor's gradients.
     * @param {boolean} xavier - Wether to use xavier initialization (divide by square root of first input dimension).
     * @returns {object} New tensor.
     */
    function randn(shape, requires_grad=false, xavier=false,) {
        return new Tensor(_tensorInitializer(shape, () => {
            let mean = Math.random() + 0.00001;
            let variance = Math.random() + 0.00001;
            let num = Math.sqrt( -2.0 * Math.log( mean ) ) * Math.cos( 2.0 * Math.PI * variance );
            if (xavier) {
                // Apply Xavier initialization to control scalar sizes:
                return num / Math.sqrt(shape[0]);
                
            } else {
                return num;
            };
            }), requires_grad);
    };

    /**
     * Creates new instance of the Tensor class filled with random integers between low and high.
     * @param {number} low - Lowest number that can be sampled.
     * @param {number} high - One above highest number that can be sampled.
     * @param {object} shape - List containing the shape of the new tensor Tensor.
     * @param {boolean} requires_grad - Wether to keep track of this tensor's gradients.
     * @returns {object} New tensor.
     */
    function randint(low=0, high=1, shape=[1,], requires_grad=false) {
        return new Tensor(
            _tensorInitializer(shape, () => {return Math.floor(Math.random() * (high - low)) + low}),
            requires_grad=requires_grad);
    };




    // <<< Helper Functions >>> //

    /**
     * Broadcasts tensor "a" into shape of "b".
     * If the shape gets smaller, tensor will be summed. If it gets larger, tensor will be expanded.
     * @param {object} a - First tensor, will be broadcast into shape of second.
     * @param {object} b - Second tensor.
     * @returns {object} New tensor.
     * @example
     * // Returns tensor with shape [4,3,2]:
     * broadcast(randn([3,2]), randn([4,3,2]));
     * 
     * // Returns tensor with shape [4,5,3,1]:
     * broadcast(ones([5,3,2]), ones([4,5,3,1]));
     */
    function broadcast (a,b) {
        function _broadcast(out, b) {
            if (typeof out === 'number' && typeof b === 'number') {
                return out;
            } else if (typeof out === 'number') {
                newArray = Array(b.length).fill(out);
                return _broadcast(newArray, b);
            } else if (typeof b ==='number') {
                return _broadcast(_sum(out,0), b);
            } else if (JSON.stringify(utils.getShape(out)) === JSON.stringify(utils.getShape(b))) {
                return out;
            }

            // If both are tensors, we need to broadcast:
            let outShape = utils.getShape(out);
            let bShape = utils.getShape(b);
            // If out's shape is larger, we need to find b's shape inside out's shape:
            if (outShape.length > bShape.length) {
                let idx;
                // Look for b's shape:
                for (let i=0 ; i < outShape.length ; i++) {
                    if (JSON.stringify(outShape.slice(i, i+bShape.length)) === JSON.stringify(bShape)) {
                        idx = i;
                    };
                };
                // If it's right on top of the array, move down on both:
                if (idx === 0) {
                    return out.map((element, idx) => _broadcast(element, b[idx]));
                // If not, move down only on 'out':
                } else {
                    //return out.map((element) => _broadcast(element, b));
                    return _sum(out,0);
                };
            // If b's shape is larger, we need to find out's shape inside b's shape:
            } else if (outShape.length < bShape.length)  {
                let idx;
                // Look for out's shape:
                for (let i=0 ; i < bShape.length ; i++) {
                    if (JSON.stringify(bShape.slice(i, i+outShape.length)) === JSON.stringify(outShape)) {
                        idx = i;
                    };
                };
                // If it's right on top of the array, move down on both:
                if (idx === 0) {
                    return out.map((element) => _broadcast(element, b[0]));
                // If not, move down only on 'b':
                } else {
                    return Array(b.length).fill(0).map(() => _broadcast(out, b[0]))
                };
            } else {
                // Define recursive function to find dimension with length 1:
                function _broadcastSideways (out, b) {
                    if (b.length != out.length) {
                        if (b.length === 1){
                            // Base case, contract existing dimention:
                            return [_sum(out, 0),];
                        } else if (out.length === 1){
                            // Base case, expand existing dimention:
                            emptyArray = Array(b.length).fill(zeros);
                            return emptyArray.map(() => out[0]);
                        } else { Error(`Shapes ${utils.getShape(out)} and ${utils.getShape(b)} not broadcastable.`) };
                    } else {
                        // Recursive case:
                        if (typeof out === 'object'){
                            // Keep looking inside each element:
                            return out.map((element, idx) => _broadcastSideways(element, b[idx]));
                        } else if (typeof out === 'number') {
                            // In case the element is a number:
                            return [null].map((element, idx) => _broadcastSideways(element, b[idx]));
                        };
                    };
                };
                // Return final broadcast tensor:
                return _broadcastSideways(out, b);
            };
        };
        
        out = a.data;
        while (JSON.stringify(utils.getShape(out)) != JSON.stringify(b.shape)){
            out = _broadcast(out, b.data);
        };
        return new Tensor(out);
    };

    /**
     * Adds new dimensions to "a" until it's depth matches "b".
     * @param {object} a - First tensor, will be broadcast into dims of second.
     * @param {object} b - Second tensor.
     * @returns {object} New tensor.
     * @example
     * // Returns tensor with shape [4,2,3]:
     * broadcastUp(ones([2,3]), ones([4,3,2]));
     */
    function broadcastUp (inElement, outElement) {
        function _broadcastUp (inElement, outElement) {
            if (utils.getShape(inElement).length + 1 === utils.getShape(outElement).length) {
                // Base case, create new dimention:
                emptyArray = Array(outElement.length).fill(zeros);
                return emptyArray.map(() => inElement);
            } else {
                // Recursive case. Keep looking inside each element:
                emptyArray = Array(outElement.length).fill(zeros);
                return emptyArray.map((_, idx) => _broadcastUp(inElement, outElement[idx])); // >>>>>>> ANTES ERA ELEMENT EM VEZ DE INELEMENT
                
            };
        };
        while (utils.getShape(inElement).length < utils.getShape(outElement).length) {
            inElement = _broadcastUp(inElement, outElement);
        };
        return inElement;
    };

    // Initialize exports if it is empty:
    exports = exports || {};

    // Add all functions to exports:
    exports.Tensor = Tensor;
    exports.Parameter = Parameter;
    exports.add = add;
    exports.neg = neg;
    exports.mul = mul;
    exports.div = div;
    exports.matMul = matMul;
    exports.exp = exp;
    exports.log = log;
    exports.sqrt = sqrt;
    exports.pow = pow;
    exports.mean = mean;
    exports.masked_fill = masked_fill;
    exports.variance = variance;
    exports.at = at;
    exports.reshape = reshape;
    exports._reshape = _reshape;
    exports.variance = variance;
    exports.transpose = transpose;
    exports.tensor = tensor;
    exports.randint = randint;
    exports.randn = randn;
    exports.rand = rand;
    exports.tril = tril;
    exports.ones = ones;
    exports.zeros = zeros;
    exports.tensor = tensor;
    exports.broadcast = broadcast;

    return exports;

})(typeof module != 'undefined' && module.exports);


// if (typeof window === 'undefined'){
//     module.exports = { Tensor, Parameter, add, neg, mul, div, matMul, exp, log, sqrt, pow, mean, masked_fill, variance, at, transpose, at, reshape, _reshape, tensor, zeros, ones, tril, rand, randn, randint, broadcast  };
// };

