const jstorch = require('./tensor_grad.js')

class Module {
    /**
     * Returns all model parameters in a list.
     * @returns {object} List with parameters in the model.
     */
    parameters() {
        // Iterate over each item in this Module.
        params = []
        for ([_, param] of this.entries()){
            // Add every Module, Parameter or Tensor with requires_grad set to True:
            if (param instanceof Module){
                params += param.parameters();
            } else if (param instanceof Parameter) {
                params.append(param);
            } else if (param instanceof Tensor) {
                if (param.requires_grad) {
                    params.append(param);
                };
            };
        }
        return params
    };
    
    /**
     * Sets module's mode to train, which influences layers like Dropout
     */
    train() {
         
        self.mode = 'train'
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

class CrossEntropyLoss extends Module {
    /**
     * Cross Entropy Loss class, returns the loss given the output and the expected indexes.
     */ 
    constructor(){
        super();
    };

    /**
     * Performs forward pass throughCrossEntropyLoss, returns loss.
     * @param {jstorch.Tensor} z - Output from the last layer of the network. Must have shape like (*Batch dimentions, Number of possible classes).
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
        let logitsExp = jstorch.exp(z);
        let logitsSum = logitsExp.sum(1, true);

        let logits = logitsExp.div(logitsSum);

        y = jstorch._reshape(y.data, [B]);

        // Get cross-entropy loss:
        let at_logits = logits.at([...Array(B).keys()], y) 
        let log_losses = jstorch.log(at_logits);
        let loss = log_losses.sum(-1).neg();
        loss = loss.div(B);
        return loss;
    };    
};


// Non-Linearity Rectified Linear Unit (ReLU):
class ReLU extends Module {
    constructor(){
        super();
    };

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
        let mask = jstorch.tensor(_relu(z._data));

        z = z.mul(mask);
        return z;
    };
};

module.exports = { Module, ReLU, CrossEntropyLoss };
