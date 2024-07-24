<a href="https://www.github.com/eduardoleao052/js-pytorch">
    <img src="https://img.shields.io/badge/GitHub-%23121011.svg?style=flat-square&logo=github&logoColor=white">
</a>
<a href="https://www.linkedin.com/in/eduardoleao052/">
    <img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=linkedin">
</a>

# Welcome to Js-Pytorch's documentation

For access to the source code, visit <a href="https://github.com/eduardoleao052", target="_blank">The GitHub repo</a>.

## About

- JS-PyTorch is a Deep Learning **JavaScript library** built from scratch, to closely follow PyTorch's syntax.
- This means that you can use this library to train, test and deploy Neural Networks, with node.js or on a web browser.

## Installation

This is a **node** package, and can be installed with  **npm** (Node Package Manager). It has full sopport of node 20.15.1, which is the latest LTS (Long-Term Support) node version. 

In most operating systems, it should also work for **more recent** versions.

### MacOS

* First, install **node** with the command line, as described on the <a href="https://nodejs.org/en/download/package-manager" target="_blank">node website</a>:

```
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# download and install Node.js (you may need to restart the terminal)
nvm install 20
# verifies the right Node.js version is in the environment
node -v # should print `v20.15.1`
# verifies the right npm version is in the environment
npm -v # should print `10.7.0`
```

* Now, use **npm** to install Js-PyTorch locally:

```
# installs js-pytorch
npm install js-pytorch
# if needed, install older version of js-pytorch
nvm install js-pytorch@0.1.0
```

* Finally, **require** the package in your javascript file:

``` javascript
const { torch } = require("js-pytorch");
const nn = torch.nn;
const optim = torch.optim;
```


### Linux

* First, install **node** with the command line, as described on the <a href="https://nodejs.org/en/download/package-manager" target="_blank">node website</a>:

```
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# download and install Node.js (you may need to restart the terminal)
nvm install 20
# verifies the right Node.js version is in the environment
node -v # should print `v20.15.1`
# verifies the right npm version is in the environment
npm -v # should print `10.7.0`
```

* Now, use **npm** to install Js-PyTorch locally:

```
# installs js-pytorch
npm install js-pytorch
# if needed, install older version of js-pytorch
nvm install js-pytorch@0.1.0
```

* Finally, **require** the package in your javascript file:

``` javascript
const { torch } = require("js-pytorch");
const nn = torch.nn;
const optim = torch.optim;
```


### Windows

* First, download **node** from the prebuilt installer on the <a href="https://nodejs.org/en/download/prebuilt-installer" target="_blank">node website</a>:

* Now, use **npm** to install Js-PyTorch locally:

```
# installs js-pytorch
npm install js-pytorch
# if needed, install older version of js-pytorch
nvm install js-pytorch@0.1.0
```

> **Note:**If this throws an error, you might need to install the latest version of [Visual Studio](https://visualstudio.microsoft.com/downloads/?cid=learn-navbar-download-cta), including the "Desktop development with C++" workload.

* Finally, **require** the package in your javascript file:

``` javascript
const { torch } = require("js-pytorch");
const nn = torch.nn;
const optim = torch.optim;
```

## Contributing
- If you have **detected a bug** on the library, please file a <a href="https://github.com/eduardoleao052/js-pytorch/issues/new?assignees=&labels=02+Bug+Report&projects=&template=bug-report.yml", target="_blank">Bug Report</a> using a GitHub issue, and feel free to reach out to me on my LinkedIn or email.
- If you would like to see a **new feature** in Js-PyTorch, file a <a href="https://github.com/eduardoleao052/js-pytorch/issues/new?assignees=&labels=enhancement&projects=&template=feature-request.yml", target="_blank">New Feature</a> issue.
- Finally, if you would like to contribute, create a merge request to the `develop` branch. I will try to answer as soon as possible. All help is really appreciated! Here is a list of the **developer tools**:
    * **Build for Distribution** by running `npm run build`. CJS and ESM modules and `index.d.ts` will be output in the `dist/` folder.
    * **Check the Code** with ESLint at any time, running `npm run lint`.
    * **Run tests** run `npm test`.
    * **Improve Code Formatting** with prettier, running `npm run prettier`.
    * **Performance Benchmarks** are also included in the `tests/benchmarks/` directory. Run all benchmarks with `npm run bench` and save new benchmarks with `npm run bench:update`.