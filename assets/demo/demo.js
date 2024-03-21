function train() {

    class MyDemoNN extends Module {
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
         * @param {jstorch.Tensor} x - input Tensor.
         * @returns {jstorch.Tensor} new Tensor.
         */
        forward(x) {
            let z = this.l1.forward(x);
            z = this.relu.forward(z);
            z = this.l2.forward(z);
            z = this.dropout.forward(z);
            return z;
        };
    };
};