<p align="center">
  <img src="./assets/icon.png" alt="js-torch" height="135">
</p>

<p align="center">
    <a href="https://github.com/eduardoleao052/js-torch/actions/workflows/test.yml/badge.svg" alt="Unit Tests">
        <img src="https://github.com/eduardoleao052/js-torch/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://github.com/eduardoleao052/js-torch/pulse" alt="Activity">
        <img src="https://img.shields.io/github/commit-activity/m/eduardoleao052/js-torch" /></a>
    <a href="https://github.com/eduardoleao052/js-torch/graphs/contributors" alt="Contributors">
        <img src="https://img.shields.io/github/contributors/eduardoleao052/js-torch" /></a>
    <a href="https://github.com/eduardoleao052/js-torch">
        <img src="https://img.shields.io/badge/language-JavaScript-yellow">
    </a>
    <a href="mailto:eduardoleao052@usp.br">
        <img src="https://img.shields.io/badge/-Email-red?style=flat-square&logo=gmail&logoColor=white">
    </a>
    <a href="https://www.linkedin.com/in/eduardoleao052/">
        <img src="https://img.shields.io/badge/-Linkedin-blue?style=flat-square&logo=linkedin">
    </a>
</p>

# PyTorch in JavaScript
JS-Torch is a Deep Learning __JavaScript library__ built from scratch, to closely follow PyTorch's syntax. It contains a fully functional [Tensor](src/tensor.py) object, which can track gradients, Deep Learning [Layers](src/layers.py) and functions, and an __Automatic Differentiation__ engine. Feel free to try the [demo](https://eduardoleao052.github.io/js-torch/assets/demo/demo.html) out!

### Operations

<details>
<summary> <b>Basic operations</b>: </summary>


<br/>


- [Addition](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L346-L401)
- [Subtraction](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L404-L438)
- [Multiplication](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L441-L496)
- [Division](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L498-L557)
- [Matrix multiplication](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L560-L621)
- [Power](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L625-L663)
- [Square Root](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L666-L704)
- [Exponentiation](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#706-L744)
- [Log](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L746-L785)

<br/>
  
</details>


<details>
<summary> The <b>statistics</b>: </summary>


<br/>


- [Sum](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L790-L842)
- [Mean](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L844-L894)
- [Variance](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L896-L949)

<br/>

</details>


<details>
<summary> And the <b>tensor operations</b>: </summary>


<br/>

- [Transpose](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L953-L1008)
- [At](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L1010-L1060)
- [MaskedFill](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L1062-L1095)
- [Reshape](https://github.com/eduardoleao052/js-torch/blob/07c1286867b952f32c0e904033214253e8812090/src/tensor.js#L1097-L1129)

<br/>


</details>
<br/>
