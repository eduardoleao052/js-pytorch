const torch = require("./tensor_grad.js");
const nn = require("./layers.js")
const optim = require('./optim.js')

// <<< Tests >>> //

function test_manual_autograd_01() {
    // Instantiate Tensors:
    let x = torch.tensor([[[1,3],[4,5],[5,0],[0,2]],[[4,4],[4,0],[1,2],[4,1]],[[1,4],[5,6],[0,0],[9,0]]]);

    let w1 = torch.tensor([[1,4,5,7,3],[0,0,1,6,4]], requires_grad = true);
    let w2 = torch.tensor([[6,5],[1,2],[3,3],[1,0],[0,6]], requires_grad = true);

    let b1 = torch.tensor([1,4,6,0,0], requires_grad = true);
    let b2 = torch.tensor([1,0], requires_grad = true);
    let m1 = torch.tensor([[1,2],[3,4],[0,2],[5,0]], requires_grad = true)

    console.log('x.shape')
    console.log(x.shape)
    console.log('w1.shape')
    console.log(w1.shape)
    console.log('b1.shape')
    console.log(b1.shape)
    console.log('w2.shape')
    console.log(w2.shape)
    console.log('b2.shape')
    console.log(b2.shape)
    console.log('')


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
    console.log('m1 - GRAD:');
    console.log(m1.grad);
    console.log('')
    console.log('w2 - GRAD:');
    console.log(w2.grad);
    console.log('')
    console.log('b2 - GRAD:');
    console.log(b2.grad);
    console.log('')
    console.log('w1 - GRAD:');
    console.log(w1.grad);
    console.log('')
    console.log('b1 - GRAD:');
    console.log(b1.grad);
};

function test_manual_autograd_02() {
    // Define loss function as Cross Entropy Loss and learning rate:
    let loss_func = new nn.CrossEntropyLoss()
    let learning_rate = 1e-3;

    //  Instantiate input and output:
    let x = torch.randn([8,6,5])
    let y = torch.randint(0,10,[8,6])

    // Instantiate Neural Network's Layers:
    let w1 = torch.randn([5,16], requires_grad=true, xavier=true) 
    let relu1 = new nn.ReLU()
    let w2 = torch.randn([16,10], requires_grad=true, xavier=true)

    // Training Loop:
    for (let i=0; i < 1000 ; i++) {
        console.log(`Iter ${i}`)
        
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
        // console.log('w2')
        // console.log(w2.grad)
        // console.log('w1')
        // console.log(w1.data[0])
        console.log('LOSS')
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

/**
 * This function tests if the loss converges to zero in with a training loop on a dummy random dataset. The update steps are manual, employing standard SGD.
 * This function does not use the "".nn" package. No optimizers or layers are employed.
 */
function test_autograd() {
    // Define loss function as Cross Entropy Loss and learning rate:
    let loss_func = new nn.CrossEntropyLoss()
    let learning_rate = 5e-3;

    //  Instantiate input and output:
    let x = torch.randn([8,4,5])
    let y = torch.randint(0,50,[8,4])

    // Instantiate Neural Network's Layers:
    let w1 = torch.randn([5,128], requires_grad=true, xavier=true) 
    let relu1 = new nn.ReLU()
    let w2 = torch.randn([128,128], requires_grad=true, xavier=true) 
    let relu2 = new nn.ReLU()
    let w3 = torch.randn([128,50], requires_grad=true, xavier=true)



    // Training Loop:
    for (let i=0; i < 1000000 ; i++) {
        //console.log(x.shape)
        //console.log(w1.data)
        let z = torch.matMul(x, w1);
        z = relu1.forward(z);
        z = torch.add(z,torch.matMul(z, w2));
        z = relu2.forward(z);
        z = torch.matMul(z, w3);

        // Get loss:
        let loss = loss_func.forward(z, y);
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
        w3._data = w3.add(w3._grad.mul(learning_rate).neg()).data;

        // Reset the gradients to zero after each training step:
        loss.zero_grad_graph()
    };
};

/**
 * This function tests if the loss converges to zero in a simple Neural Network 
 * (Fully-Connected, three layers, with ReLU non-linearities), which uses the custom nn.Module superclass.
 */
function test_module() {
    // Implement dummy nn.Module class:
    class NeuralNet extends nn.Module {
        constructor(hidden_size) {
            super();
            // Instantiate Neural Network's Layers:
            this.w1 = new nn.Linear(5,hidden_size);
            this.relu1 = new nn.ReLU();
            this.w2 = new nn.Linear(hidden_size,hidden_size);
            this.relu2 = new nn.ReLU();
            this.w3 = new nn.Linear(hidden_size,50);
        };

        forward(x) {
            let z;
            z = this.w1.forward(x);
            z = this.relu1.forward(z);
            z = this.w2.forward(z);
            z = this.relu2.forward(z);
            z = this.w3.forward(z);
            return z;
        };
    };

    let model = new NeuralNet(32);

    // Define loss function and optimizer:
    let loss_func = new nn.CrossEntropyLoss()
    let optimizer = new optim.Adam(model.parameters(), lr=1e-3, reg=0)
    // Instantiate input and output:
    let x = torch.randn([8,4,5])
    let y = torch.randint(0,50,[8,4])

    // Training Loop:
    for(let i=0 ; i < 10000 ; i++) {
        let z = model.forward(x)
        //console.log(z)
        // Get loss:
        let loss = loss_func.forward(z, y)

        // Backpropagate the loss using neuralforge.tensor's backward() method:
        loss.backward()

        // Update the weights:
        optimizer.step()
        
        // Reset the gradients to zero after each training step:
        optimizer.zero_grad()
        
        console.log('LOSS')
        console.log(loss.data)
    };
    //assert loss._data < 1e-2, "Error: Loss is not converging to zero in nn.Module test."
};

/**
 * This function tests if the loss converges to zero in a mock Transformer
 */
function test_transformer() {
    // Implement dummy nn.Module class:
    class Transformer extends nn.Module {
        constructor(hidden_size, p) {
            super();
            // Instantiate Neural Network's Layers:
            this.l1 = new nn.Linear(15,hidden_size);
            this.relu1 = new nn.ReLU();
            this.m1 = new nn.MultiHeadSelfAttention(hidden_size,hidden_size, 4, 4, p);
            this.ln1 = new nn.LayerNorm(hidden_size)
            this.l2 = new nn.Linear(hidden_size,hidden_size);
            this.relu2 = new nn.ReLU();
            this.l3 = new nn.Linear(hidden_size,hidden_size);
            this.m2 = new nn.MultiHeadSelfAttention(hidden_size,hidden_size, 4, 4, p);
            this.ln2 = new nn.LayerNorm(hidden_size)
            this.l4 = new nn.Linear(hidden_size,hidden_size);
            this.relu3 = new nn.ReLU();
            this.l5 = new nn.Linear(hidden_size,100);
        };

        forward(x) {
            let z;
            z = this.l1.forward(x);
            z = this.relu1.forward(z);
            z = z.add(this.m1.forward(z));
            z = this.ln1.forward(z)
            z = this.l2.forward(z);
            z = this.relu2.forward(z);
            z = this.l3.forward(z);
            z = z.add(this.m2.forward(z));
            z = this.ln2.forward(z)
            z = this.l4.forward(z);
            z = this.relu3.forward(z);
            z = this.l5.forward(z);
            return z;
        };
    };

    let dropout_p = 0;
    let model = new Transformer(64, dropout_p);

    // Define loss function and optimizer:
    let loss_func = new nn.CrossEntropyLoss()
    let optimizer = new optim.Adam(model.parameters(), lr=5e-4, reg=1e-5)
    // Instantiate input and output:
    let x = torch.randn([8,4,15])
    let y = torch.randint(0,100,[8,4])

    // Training Loop:
    for(let i=0 ; i < 10000 ; i++) {
        let z = model.forward(x)

        // Get loss:
        let loss = loss_func.forward(z, y)

        console.log(`ITER ${i}`)
        console.log(loss.data)

        // Backpropagate the loss using neuralforge.tensor's backward() method:
        loss.backward()

        // Update the weights:
        optimizer.step()
        
        // Reset the gradients to zero after each training step:
        optimizer.zero_grad()
    };
    //assert loss._data < 1e-2, "Error: Loss is not converging to zero in nn.Module test."
};

function test_mhse(){
        let in_size = 4
        let out_size = 5
        let n_timesteps = 3
        let n_heads = 2
        let dropout_prob = 0;

        let x =  torch.randn([2,3,4], true, true)

        let Wk = new nn.Linear(in_size, in_size, false, true);
        let Wq = new nn.Linear(in_size, in_size, false, true);
        let Wv = new nn.Linear(in_size, in_size, false, true);
        let residual_proj = new nn.Linear(in_size, out_size, false, true);
        let mask_small = torch.tril([n_timesteps,n_timesteps], false);
        let att_dropout = new nn.Dropout(dropout_prob);
        let residual_dropout = new nn.Dropout(dropout_prob);
        let softmax = new nn.Softmax();

        let H = in_size / n_heads // head_size
        if (in_size % n_heads != 0){
            throw new Error("Embedding dimension not divisible in equal heads.");
        };

        let [B, T, D] = x.shape
        let nh = D / H // Num heads

        // Get key, queries and values from the input:
        let k = Wk.forward(x) // (B, T, D) @ (D, D) -> (B, T, D)
        let q = Wq.forward(x) // (B, T, D) @ (D, D) -> (B, T, D)
        let v = Wv.forward(x) // (B, T, D) @ (D, D) -> (B, T, D)
        
        // Reshape into different heads:
        k = k.reshape([B,T,nh,H]).transpose(1,2) // (B, T, D) -> (B, T, nh, H) -> (B, nh, T, H)
        q = q.reshape([B,T,nh,H]).transpose(1,2) // (B, T, D) -> (B, T, nh, H) -> (B, nh, T, H)
        v = v.reshape([B,T,nh,H]).transpose(1,2) // (B, T, D) -> (B, T, nh, H) -> (B, nh, T, H)

        // Compute attention activation:
        let att1 = q.matMul(k.transpose(-2, -1)) // (B, nh, T, H) @ (B, nh, H, T) -> (B, nh, T, T)

        // Reduce module before going into softmax:
        att2 = att1.div(H**(.5))

        // Apply mask (to block out future characters), softmax, and dropout:
        let mask = torch.broadcast(mask_small, att2);
        att3 = att2.masked_fill(mask, (el) => el === 0, -Infinity);
        att4 = softmax.forward(att3, -1);
        console.log(att4.data[0])
        att5 = att_dropout.forward(att4);

        // Compute weighted sum between values:
        let out1 = att5.matMul(v) // (B, nh, T, T) @ (B, nh, T, H) -> (B, nh, T, H)

        // Restack heads in D dimension:
        out2 = out1.transpose(1, 2).reshape([B, T, D]) // (B, nh, T, H) -> (B, T, D)

        // Apply final projection (Dense layer) and dropout:
        out3 = residual_proj.forward(out2) // (B, T, D) @ (D, D) -> (B, T, D)
        out4 = residual_dropout.forward(out3)
        
        out5 = out4.sum(0).sum(0).sum(0)

        out5.backward()

        console.log('OOOOUUUTTTT')
        console.log(out1.grad[0])
        console.log('44444444')
        console.log(att4.grad[0])
        console.log('333333')
        console.log(att3.grad[0])
        console.log('XXXXXXX')
        //console.log(x.grad)
};



/* PROBLEMAS:
    - Gradientes estao ficando gigantes no jstorch... Testar Multihead sozinha. Comparar com o neuralforge.
    - So learning rate mais alta ta funcionando (5e-3).
    - Output do MHSE deve tar grande, pq sem LayerNorm vira NAN na hora.
    - Residuals helping network, because we're learning to skip around MHSE (couse its bad.).
*/

test_transformer()
