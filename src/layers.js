if (typeof window === 'undefined'){
    globalThis.utils = require('./utils.js');
    globalThis.torch = require('./tensor.js');
};

var nn = (function(exports){

    // Module class:
    class Module {
        /**
         * Returns all model parameters in a list.
         * @returns {object} List with parameters in the model.
         */
        parameters() {
            // Iterate over each item in this Module.
            let params = []
            for (let key in this) {
                // Add every Module, Parameter or Tensor with requires_grad set to True:
                if (this[key] instanceof Module){
                    params = params.concat(this[key].parameters());
                } else if (this[key] instanceof torch.Parameter) {
                    params.push(this[key]);
                } else if (this[key] instanceof torch.Tensor) {
                    if (this[key].requires_grad) {
                        params.push(this[key]);
                    };
                };
            };
            return params
        };
        
        /**
         * Sets module's mode to train, which influences layers like Dropout
         */
        train() {
            
            this.mode = 'train'
            for ([_, param] of this.entries()){
                if (param instanceof Module){
                    param.train();
                };
            };
        };

        /**
         * Sets module's mode to eval, which influences layers like Dropout
         */
        eval() {
            for ([_, param] of this.entries()){
                if (param instanceof Module){
                    param.eval();
                };
            };
        };
    };



    // Standard Layers:
    class Linear extends Module{
        /**
         * Simple linear layer, with weight matrix and optional bias. Does not contain nonlinearity.
         * 
         * @param {number} in_size - size of the last dimention of the input array.
         * @param {number} out_size - size of the last dimention of the output array.
         * @param {boolean} bias - wether to include a bias term.
         * @param {boolean} xavier - Wether to use xavier initialization (divide by square root of first input dimension).
         */   
        constructor (in_size, out_size, bias = true, xavier = true) {
            super();
            this.W = torch.randn([in_size, out_size], true, xavier);
            this.b = torch.zeros([out_size,], true);
            this.has_bias = bias;
        };

        /**
         * Performs forward pass through the Linear layer.
         * @param {torch.Tensor} z - input Tensor.
         * @returns {torch.Tensor} new Tensor. Out = (In @ W) + b.
         */
        forward(x) {
            let z = x.matMul(this.W )
            if (this.has_bias) {
                z = z.add(this.b);
            };
            return z;
        };
    };

    class MultiHeadSelfAttention extends Module {
        /**
         * Full transformer Layer implementation.
         * 
         * @param {number} in_size - size of the last dimention of the input array.
         * @param {number} out_size - size of the last dimention of the output array.
         * @param {number} n_heads - number of parallel heads to be computed (must equally divide in_size).
         * @param {number} n_timesteps - length of text sequence to be processed bt Transformer.
         * @param {number} dropout_prob - probability of zeroing each activation in dropout Layer.
         */  
        constructor(in_size, out_size, n_heads, n_timesteps, dropout_prob=0) {
            super()
            this.Wk = new Linear(in_size, in_size, false, true);
            this.Wq = new Linear(in_size, in_size, false, true);
            this.Wv = new Linear(in_size, in_size, false, true);
            this.residual_proj = new Linear(in_size, out_size, false, true)
            this.mask = torch.tril([n_timesteps,n_timesteps], false);
            this.att_dropout = new Dropout(dropout_prob);
            this.residual_dropout = new Dropout(dropout_prob);
            this.softmax = new Softmax();

            this.H = in_size / n_heads // head_size
            if (in_size % n_heads != 0){
                throw new Error("Embedding dimension not divisible in equal heads.");
            };
        };

        /**
         * Performs Multi Head Self-Attention on "x" tensor.
         * @param {torch.Tensor} x - input Tensor.
         * @returns {torch.Tensor} new Tensor.
         */
        forward(x) {

            let [B, T, D] = x.shape
            let H = this.H
            let nh = D / H // Num heads

            // Get key, queries and values from the input:
            let k = this.Wk.forward(x) // (B, T, D) @ (D, D) -> (B, T, D)
            let q = this.Wq.forward(x) // (B, T, D) @ (D, D) -> (B, T, D)
            let v = this.Wv.forward(x) // (B, T, D) @ (D, D) -> (B, T, D)
            
            // Reshape into different heads:
            k = k.reshape([B,T,nh,H]).transpose(1,2) // (B, T, D) -> (B, T, nh, H) -> (B, nh, T, H)
            q = q.reshape([B,T,nh,H]).transpose(1,2) // (B, T, D) -> (B, T, nh, H) -> (B, nh, T, H)
            v = v.reshape([B,T,nh,H]).transpose(1,2) // (B, T, D) -> (B, T, nh, H) -> (B, nh, T, H)

            // Compute attention activation:
            let kT = k.transpose(-2, -1);
            let att = q.matMul(kT); // (B, nh, T, H) @ (B, nh, H, T) -> (B, nh, T, T)

            // Reduce module before going into softmax:
            att = att.div(H**(.5))

            // Apply mask (to block out future characters), softmax, and dropout:
            let mask = torch.broadcast(this.mask,att);
            att = att.masked_fill(mask, (el) => el === 0, -Infinity);
            att = this.softmax.forward(att, -1);
            att = this.att_dropout.forward(att);

            // Compute weighted sum between values:
            let out = att.matMul(v) // (B, nh, T, T) @ (B, nh, T, H) -> (B, nh, T, H)

            // Restack heads in D dimension:
            out = out.transpose(1, 2).reshape([B, T, D]) // (B, nh, T, H) -> (B, T, D)

            // Apply final projection (Dense layer) and dropout:
            out = this.residual_proj.forward(out) // (B, T, D) @ (D, D) -> (B, T, D)
            out = this.residual_dropout.forward(out)

            return out
        };
    };

    class FullyConnected extends Module {
        /**
         * Small block composed of two Linear layers, a ReLU non-linearity and a Dropout layer.
         * 
         * @param {number} in_size - size of the last dimention of the input array.
         * @param {number} out_size - size of the last dimention of the output array.
         * @param {number} dropout_prob - probability of zeroing each activation in dropout Layer.
         */  
        constructor (in_size, out_size, dropout_prob=0) {
            super();
        
            this.l1 = new Linear(in_size, in_size * 2);
            this.relu = new ReLU();
            this.l2 = new Linear(in_size * 2, out_size);
            this.dropout = new Dropout(dropout_prob);
        };

        /**
         *  Passes "x" tensor through the Fully Connected layers.
         * @param {torch.Tensor} x - input Tensor.
         * @returns {torch.Tensor} new Tensor.
         */
        forward(x) {
            let z = this.l1.forward(x);
            z = this.relu.forward(z);
            z = this.l2.forward(z);
            z = this.dropout.forward(z);
            return z;
        };
    };

    class Block extends Module {
        /**
         * Full transformer decoder block. Composed of Multi Head Self Attention, Fully connected layers and Layer Norms.
         * 
         * @param {number} in_size - size of the last dimention of the input array.
         * @param {number} out_size - size of the last dimention of the output array.
         * @param {number} n_heads - number of parallel heads to be computed (must equally divide in_size).
         * @param {number} n_timesteps - length of text sequence to be processed bt Transformer.
         * @param {number} dropout_prob - probability of zeroing each activation in dropout Layer.
         */ 
        constructor(in_size, out_size, n_heads, n_timesteps, dropout_prob) {
            super()
            this.att = new MultiHeadSelfAttention(in_size, in_size, n_heads, n_timesteps, dropout_prob)
            this.ln1 = new LayerNorm(in_size)
            this.fcc = new FullyConnected(in_size, out_size, dropout_prob)
            this.ln2 = new LayerNorm(out_size)
        };

        /**
         * Passes "x" tensor through a full transformer Block.
         * @param {torch.Tensor} x - input Tensor.
         * @returns {torch.Tensor} new Tensor.
         */
        forward(x) {
            let z = x.add(this.att.forward(this.ln1.forward(x)));
            //z = this.ln1.forward(z)
            z = z.add(this.fcc.forward(this.ln2.forward(z)));
            //z = this.ln2.forward(z);
            return z
        };  
    };



    // Embedding Layers
    class Embedding extends Module {
        /**
         * Embedding class, turns indexes into vectors.
         * 
         * @param {number} in_size - number of different indexes (vocabulary size).
         * @param {number} out_size - size of the embedding vector generated.
         */  
        constructor(in_size, embed_size) {
            super()
            this.E = torch.randn([in_size, embed_size], true, true);
        };

        /**
         * Extracts embedding from rows in "idx":
         * @param {object} idx - rows to get embedding from.
         * @returns {torch.Tensor} new Tensor. Out = (In @ W) + b.
         */
        forward(idx) {
            // Get idx dimensions:
            let [B, T] = idx.shape;

            idx = utils.assureArray(idx);
            let x = this.E.at(idx);

            // Assure output tensor has desired shape:
            x = x.reshape([B,T,this.E.shape[1]]);

            return x;
        };
    };

    class PositionalEmbedding extends Module {
        /**
         * Embedding class, turns indexes into vectors.
         * 
         * @param {number} n_timesteps - number of different embeddings (number of timesteps in each instance in batch).
         * @param {number} embed_size - size of the embedding vector generated.
         */  
        constructor (n_timesteps, embed_size) {
            super()
            this.E = torch.randn([n_timesteps, embed_size], true, true);
        };

        /**
         * Gets embedding for timesteps in "idx" array.
         * @param {object} idx - Array [Batch x Timesteps]. Timesteps will be filled with positional embeddings.
         * @returns {torch.Tensor} new Tensor.
         */
        forward (idx) {
            // Get num_timesteps dimension:
            let [B, T] = idx.shape;
            // Creates positional embeddings: (Batch, Timesteps) => (Batch, Timesteps, Embed)
            let x = this.E.at([...Array(T).keys()]) 
            
            // Assure output tensor has desired shape:
            x = x.reshape([B,T]);
            

            return x
        };
    };



    // Non-linearity Layers:
    class ReLU extends Module {
        /**
         * Rectified Linear Unit nonlinearity. Returns z if z>0 else 0.
         */    
        constructor(){
            super();
        };

        /**
         * Performs forward pass through Rectified Linear Unit nonlinearity. Returns z if z>0 else 0.
         * @param {torch.Tensor} z - input Tensor.
         * @returns {torch.Tensor} new Tensor.
         */
        forward(z) {
            // Define recursive function:
            function _relu(z){
                // Base case, perform ReLU:
                if(typeof z[0] === 'number') {
                    return z.map((el) => {if (el > 0) {return 1.0} else {return 0.001}});
                // Recursive case, go deeper in array: 
                } else if (typeof z[0] === 'object') {
                    return z.map((el) => _relu(el));
                };
            };
            let mask = torch.tensor(_relu(z._data));

            z = z.mul(mask);
            return z;
        };
    };

    class Softmax extends Module {
        /**
         * Softmax nonlinearity class. Returns distribution of values (sum=1).
         */  
        constructor() {
            super();
        };

        /**
         * Performs forward pass through Softmax nonlinearity.
         * @param {torch.Tensor} z - input Tensor.
         * @param {number} dim - dimension across which to apply Softmax.
         * @returns {torch.Tensor} new Tensor.
         */
        forward(z, dim=-1) {
            z = torch.exp(z);
            let out = z.div(z.sum(dim, true));
            return out;
        };
    };



    // Regularization Layers:
    class Dropout extends Module {
        /**
         * Dropout class, added usually after other layers, to drop values to zero with given probability
         * 
         * @param {number} drop_prob - probability to drop each value in input.
         */  
        constructor(drop_prob) {
            super();
            this.p = drop_prob;
            this.mode = 'train';
        };
        /**
         * Performs forward pass through Dropout layer. Sets random values to zero (this.p % of the total).
         * @param {torch.Tensor} z - input Tensor.
         * @returns {torch.Tensor} new Tensor.
         */
        forward(z) {
            if (this.mode == 'eval') {return z};
            let mask = torch.rand(z.shape); 
            // Set to zero all values of uniform distribution lower than probability of dropout:
            let a = z.masked_fill(mask, (el) => {return el < this.p}, 0);
            // Scale modulus by probability during training time:
            a = a.div(1 - this.p);
            return a;
        };
    };

    class LayerNorm extends Module {
        /**
         * Layer Norm class, added usually after other layers to normalize across all of the output.
         * 
         * @param {number} n_embed - size of the last dimention of the input.
         */ 
        constructor(n_embed) {
            super()
            this.gamma = torch.ones([n_embed], true)
            this.beta = torch.zeros([n_embed], true)
        };

        forward(x) {
            let var_x = x.variance(-1, true); // (B, T)
            let norm_x = x.sub(x.mean(-1, true)).div(torch.sqrt(var_x)); // (B, T, D)
            let z = torch.mul(norm_x, this.gamma).add(this.beta); // (B, T, D)
            //console.log('im norman')
            return z;
        };
    };

    // Loss layers:
    class CrossEntropyLoss extends Module {
        /**
         * Cross Entropy Loss class, returns the loss given the output and the expected indexes.
         */ 
        constructor(){
            super();
        };

        /**
         * Performs forward pass through CrossEntropyLoss, returns loss.
         * @param {torch.Tensor} z - Output from the last layer of the network. Must have shape like (*Batch dimentions, Number of possible classes).
         * @param {object} y - Correct indexes expected from the model.
         * @returns {object} Negative-log-likelihood loss of the model output.
         */
        forward(z, y) {
            // Get data's shape:
            let zDims = z.shape;
            // Get last dimension:
            let D = zDims.slice(zDims.length-1, zDims.length)[0];
            // Get product of all batch dimensions:
            zDims = zDims.slice(0,zDims.length-1)
            let B = zDims.reduce((a,b) => a*b, 1);
            // Flatten out the batch dimensions:
            z = z.reshape([B,D]);

            // Perform softmax on output:
            let logitsExp = torch.exp(z);
            
            let logitsSum = logitsExp.sum(1, true);
            
            let logits = logitsExp.div(logitsSum);

            y = torch._reshape(y.data, [B]);
            
            // Get cross-entropy loss:
            let at_logits = logits.at([...Array(B).keys()], y) 
            let log_losses = torch.log(at_logits);
            let loss = log_losses.sum(-1).neg();
            loss = loss.div(B);
            return loss;
        };    
    };

    // Initialize exports if it is empty:
    exports = exports || {};

    // Add all functions to exports:
    exports.Module = Module;
    exports.MultiHeadSelfAttention = MultiHeadSelfAttention;
    exports.Linear = Linear;
    exports.FullyConnected = FullyConnected;
    exports.Block = Block;
    exports.Softmax = Softmax;
    exports.ReLU = ReLU;
    exports.Dropout = Dropout;
    exports.LayerNorm = LayerNorm;
    exports.CrossEntropyLoss = CrossEntropyLoss;
    exports.Embedding = Embedding;
    exports.PositionalEmbedding = PositionalEmbedding;


    return exports;
})(typeof module != 'undefined' && module.exports);

// if (typeof window === 'undefined'){
//     module.exports = { Module, Linear, Embedding, PositionalEmbedding, ReLU, Softmax, Dropout, LayerNorm, Block, FullyConnected, MultiHeadSelfAttention, CrossEntropyLoss };
// };