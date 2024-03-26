const torch = require('./tensor.js');


var jstorch = {
    // Add methods from tensor.js (these methods are accessed with "torch."):
    Tensor: torch.Tensor,
    Parameter: torch.Parameter,
    add: torch.add,
    neg: torch.neg,
    mul: torch.mul,
    div: torch.div,
    matMul: torch.matMul,
    exp: torch.exp,
    log: torch.log,
    sqrt: torch.sqrt,
    pow: torch.pow,
    mean: torch.mean,
    masked_fill: torch.masked_fill,
    variance: torch.variance,
    at: torch.at,
    reshape: torch.reshape,
    _reshape: torch._reshape,
    variance: torch.variance,
    transpose: torch.transpose,
    tensor: torch.tensor,
    randint: torch.randint,
    randn: torch.randn,
    rand: torch.rand,
    tril: torch.tril,
    ones: torch.ones,
    zeros: torch.zeros,
    tensor: torch.tensor,
    broadcast: torch.broadcast,
    // Add submodules:
	nn: require('./layers.js'),
	optim: require('./optim.js')

};

if (typeof window !== 'undefined') {
	window.jstorch = jstorch;
} else {
	module.exports = jstorch;
};