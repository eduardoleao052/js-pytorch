const torch = require("./tensor_grad.js");
const nn = require("./layers.js")
// <<< Tests >>> //

// Progresso: Autograd functionando, OK.
// Falta: Testar Modules, <<criar método ZERO GRAD!>>

function test_autograd_without_module() {
    // Instantiate Tensors:
    let x = torch.tensor([[[1,3],[4,5],[5,0],[0,2]],[[4,4],[4,0],[1,2],[4,1]],[[1,4],[5,6],[0,0],[9,0]]]);

    let w1 = torch.tensor([[1,4,5,7,3],[0,0,1,6,4]], requires_grad = true);
    let w2 = torch.tensor([[6,5],[1,2],[3,3],[1,0],[0,6]], requires_grad = true);

    let b1 = torch.tensor([1,4,6,0,0], requires_grad = true);
    let b2 = torch.tensor([1,0], requires_grad = true);
    let m1 = torch.tensor([[1,2],[3,4],[0,2],[5,0]], requires_grad = true)

    console.log(x.shape)
    console.log(w1.shape)
    console.log(b1.shape)
    console.log(w2.shape)
    console.log(b2.shape)


    // Make calculations:
    out = x.matMul(w1);
    out = out.add(b1);
    out = out.matMul(w2)
    out = out.add(b2)
    out = out.mul(m1)

    out = out.sum(0).sum(0).sum(0)

    // Compute gradients on whole graph:
    out.backward();

    // Get gradients from specific Tensors:
    console.log('out');
    console.log(out.grad);
    console.log('m1');
    console.log(m1.grad);
    console.log('w2');
    console.log(w2.grad);
    console.log('b2');
    console.log(b2.grad);
    console.log('w1');
    console.log(w1.grad);
    console.log('b1');
    console.log(b1.grad);
};

function test_new_operations() {
    // Instantiate Tensors:
    let x = torch.tensor([[[1,3],[4,5],[5,0],[0,2]],[[4,4],[4,0],[1,2],[4,1]],[[1,4],[5,6],[0,0],[9,0]]]);

    let w1 = torch.tensor([[1,4,5,7,3],[0,0,1,6,4]], requires_grad = true);
    let w2 = torch.tensor([[6,5],[1,2],[3,3]], requires_grad = true);
    
    let out1 = torch.matMul(x, w1);

    console.log(out1.shape)
    
    let out2 = out1.transpose(-1,-2);

    console.log(out2.shape)

    let out3 = out2.reshape([2,5,2,3]);

    console.log(out3.shape)

    let out4 = torch.matMul(out3, w2)

    console.log(out4.shape)

    out4 = out4.reshape([8,5]);

    console.log(out4.shape)

    out4 = out4.at([0,1,2,3,4,5,6,7], [4,3,0,1,3,3,1,2])

    out4 = out4.sum(0);

    console.log(out4.shape)

    out4.backward();

    console.log('w2')
    console.log(w2.grad)
    console.log('out3')
    console.log(out2.grad)
    console.log('out2')
    console.log(out2.grad)
    console.log('out1')
    console.log(out1.grad)
    console.log('w1')
    console.log(w1.grad)
    
};

function test_autograd() {
    // Define loss function as Cross Entropy Loss and learning rate:
    let loss_func = new nn.CrossEntropyLoss()
    let learning_rate = 1e-3;

    //  Instantiate input and output:
    let x = torch.tensor([[[0.1, -0.04, 0.4, 0.0, 0.2],
                           [-0.03, -0.2, 0.3, -0.1, 0.3]],
                          [[0.02, 0.03, -0.01, -0.02, 0.0],
                           [0.3, 0.01, -0.2, 0.02, 0.001]],
                          [[0.0001, -0.04, 0.0, 0.0, 0.01],
                           [0.02, -0.03, -0.02, -0.1, 0.0]]])
    let y = torch.tensor([[0,2],[3,1],[0,1]])

    // Instantiate Neural Network's Layers:
    let w1 = torch.tensor([[0.0001, -0.04, 0.0, 0.0, 0.01, 0.02],
                          [-0.2, 0.3, 0.01, -0.2, 0.02, 0.001],
                          [-0.2, 0.3, -0.1, -0.01, 0.1, 0.02],
                          [-0.04, 0.4, 0.0, -0.04, 0.4, 0.0],
                          [0.01, -0.02, -0.1, 0.0, 0.02, 0.04]], requires_grad=true) 
    let relu1 = new nn.ReLU()
    let w2 = torch.tensor([[-0.2, 0.02, 0.01, -0.015],
                           [0.03, -0.02, 0.01, 0.0],
                           [0.02, 0.0001, -0.04, 0.0],
                           [0.01, 0.1, -0.2, 0.02],
                           [0.03, -0.01, -0.02, 0.01],
                           [0.0232, 0.032, -0.123, 0.01]], requires_grad=true)

    // Training Loop:
    for (let i=0; i < 10000000 ; i++) {
        console.log(i)
        let z = torch.matMul(x, w1)

        z = relu1.forward(z)

        z = torch.matMul(z, w2)

        // Get loss:
        let loss = loss_func.forward(z, y)

        // Backpropagate the loss using neuralforge.tensor:
        loss.backward()

        // console.log(`<<<<<<<<<<<<<< iter ${i}>>>>>>>>>>>>>>`)
        // console.log(y)
        // console.log('loss')
        // console.log(loss.data)
        // console.log('z')
        // console.log(z.grad[0])
        // console.log('w1')
        // console.log(w1.data[0])
        // console.log('w2')
        // console.log(w2.data[0])
        // console.log('LOSS')
        console.log(loss.data)
        // console.log('w2grad')
        // console.log(w2.grad[0])
        // console.log('w1grad')
        // console.log(w1.grad[0])



        // Update the weights:
        w1._data = w1.add(w1._grad.mul(learning_rate).neg()).data;
        w2._data = w2.add(w2._grad.mul(learning_rate).neg()).data;

        // Reset the gradients to zero after each training step:
        loss.zero_grad_graph()
    };
};

function test_parts(){
    let z0 = torch.tensor([[[1,3,0],[4,5,1],[5,0,10],[0,2,1]],[[4,4,0],[4,0,0],[1,2,9],[4,1,3]],[[1,4,2],[5,6,0],[0,0,9],[9,0,1]]], requires_grad=true);
    let y = torch.tensor([[1,2,0,1],[1,0,1,2],[1,2,1,0]], requires_grad=true)

    let zDims = z0.shape;
    // Get last dimension:
    let D = zDims.slice(zDims.length-1, zDims.length)[0];
    // Get product of all batch dimensions:
    zDims = zDims.slice(0,zDims.length-1)
    let B = zDims.reduce((a,b) => a*b, 1);
    z = z0.reshape([B,D]);

    // Perform softmax on output:
    let logitsExp = torch.exp(z);
    console.log('logitsexp.data')
    console.log(logitsExp.data)
    let logitsSum = logitsExp.sum(1, true);
    console.log('logitssum.data')
    console.log(logitsSum.data)

    let logits = logitsExp.div(logitsSum);

    y = y.reshape([B]);

    console.log('YYY')
    console.log(y.data)
    // Get cross-entropy loss: 
    let at_logits = logits.at([...Array(B).keys()], y)
    let log_losses = torch.log(at_logits);
    let loss = log_losses.sum(-1).neg();
    loss = loss.div(B);
    console.log('logits.data')
    console.log(logits.data)

    console.log('at_logits.data')
    console.log(at_logits.data)

    console.log('log_losses.data')
    console.log(log_losses.data)

    console.log('loss.data')
    console.log(loss.data)

    loss.backward()

    console.log('GRAD - loss');
    console.log(loss.grad);
    console.log('GRAD - log_losses');
    console.log(log_losses.grad);
    console.log('GRAD - at_logits');
    console.log(at_logits.grad);
    console.log('GRAD - logits');
    console.log(logits.grad);
    console.log('GRAD - logitsSum');
    console.log(logitsSum.grad);
    console.log('GRAD - logitsExp');
    console.log(logitsExp.grad);
    console.log('GRAD - z');
    console.log(z.grad);
    console.log('GRAD - z0');
    console.log(z0.grad);

    //console.log('UPGRADED - z');
    z._data = torch.add(z, torch.mul(z._grad, 0.1).neg()).data
    //console.log(z.data)
};

function test_broadcast() {
    let a = torch.ones([12,4,4,3,2,1])
    let b = torch.ones([12,4])

    let c = torch.broadcast(a,b)
    console.log(c.data)
}

function test() {
    // Define loss function as Cross Entropy Loss and learning rate:
    let loss_func = new nn.CrossEntropyLoss()
    let learning_rate = 5e-3;

    //  Instantiate input and output:
    let x = torch.randn([8,4,5])
    let y = torch.randint(0,50,[8,4])

    // Instantiate Neural Network's Layers:
    let w1 = torch.randn([5,128], requires_grad=true, xavier=true) 
    let relu1 = new nn.ReLU()
    let w2 = torch.randn([128,50], requires_grad=true, xavier=true)



    // Training Loop:
    for (let i=0; i < 1000000 ; i++) {
        //console.log(x.shape)
        //console.log(w1.data)
        let z = torch.matMul(x, w1)

        z = relu1.forward(z)

        z = torch.matMul(z, w2)

        // Get loss:
        let loss = loss_func.forward(z, y)
        // Backpropagate the loss using neuralforge.tensor:
        loss.backward()

        console.log(`<<<<<<< iter ${i} >>>>>>>`)
        // console.log(y)
        // console.log('loss')
        // console.log(loss.data)
        // console.log('z')
        // console.log(z.grad[0])
        // console.log('w1')
        // console.log(w1.data[0])
        // console.log('w2')
        // console.log(w2.data[0])
        // console.log('LOSS')
        console.log(loss.data)
        // console.log('w2grad')
        // console.log(w2.grad[0])
        // console.log('w1grad')
        // console.log(w1.grad[0])



        // Update the weights:
        w1._data = w1.add(w1._grad.mul(learning_rate).neg()).data;
        w2._data = w2.add(w2._grad.mul(learning_rate).neg()).data;

        // Reset the gradients to zero after each training step:
        loss.zero_grad_graph()
    };
};

test()