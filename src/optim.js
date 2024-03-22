if (typeof window === 'undefined'){
    globalThis.torch = require('./tensor.js')
};

var optim = (function(exports){

    class Adam {
        /**
         * Class of the Adam optimizer.
         * @param {object} params - List of all Parameter or Tensor (with requires_grad = True) to be optimized by Adam. "params" is usually set to nn.Module.parameters(), which automatically returns all parameters in a list form.
         * @param {number } lr - Scalar multiplying each learning step, controls speed of learning.
         * @param {number} reg - Scalar controling strength l2 regularization.
         * @param {object} betas - Two scalar floats controling how slowly the optimizer changes the "m" and "v" attributes.
         * @param {number} eps - Scalar added to denominator to stop it from ever going to zero.
        */
        constructor(params, lr=1e-3, reg=0, betas=[0.9, 0.99], eps=1e-9) {
            this.params = params;
            this.lr = lr;
            this.reg = reg;
            this.b1 = betas[0];
            this.b2 = betas[1];
            this.eps = eps;
            this.reg = reg;
            // Initialize momentum and velocity cumulatives for every parameter:
            for (let i=0 ; i < this.params.length ; i++) {
                this.params[i].m = torch.zeros(this.params[i].shape)
                this.params[i].v = torch.zeros(this.params[i].shape)
            };
        };

        /**
         * Updates all parameters in this.params with their gradients.
        */
        step() {
            for (let i=0 ; i < this.params.length ; i++) {
            
                this.params[i].m = this.params[i].m.mul(this.b1).add(this.params[i]._grad.mul(1 - this.b1))
                this.params[i].v = this.params[i].v.mul(this.b2).add(this.params[i]._grad.pow(2).mul(1 - this.b2))

                let update_tensor = (this.params[i].m.mul(this.lr)).div(this.params[i].v.sqrt().add(this.eps)).neg()
                let regularization_tensor = this.params[i].mul(this.reg * this.lr).neg()
                //console.log(this.params[i]._data[0])
                this.params[i]._data = this.params[i].add(update_tensor.add(regularization_tensor))._data

            };
        };

        /**
         * Sets all the gradients of self.params to zero.
        */
        zero_grad() {
            for (let i=0 ; i < this.params.length ; i++) {
                this.params[i].zero_grad();
            };
        };
    };

    // Initialize exports if it is empty:
    exports = exports || {};

    // Add all functions to exports:
    exports.Adam = Adam;

    return exports;
    

})(typeof module != 'undefined' && module.exports);

// if (typeof window === 'undefined'){
//     module.exports = { Adam };
// };