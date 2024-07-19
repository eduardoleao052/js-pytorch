require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FunctionBuilderBase = require('../function-builder-base');
var CPUFunctionNode = require('./function-node');

/**
 * @class CPUFunctionBuilder
 *
 * @extends FunctionBuilderBase
 *
 * @desc Builds functions to execute on CPU from JavaScript function Strings
 *
 */
module.exports = function (_FunctionBuilderBase) {
  _inherits(CPUFunctionBuilder, _FunctionBuilderBase);

  function CPUFunctionBuilder() {
    _classCallCheck(this, CPUFunctionBuilder);

    var _this = _possibleConstructorReturn(this, (CPUFunctionBuilder.__proto__ || Object.getPrototypeOf(CPUFunctionBuilder)).call(this));

    _this.Node = CPUFunctionNode;
    return _this;
  }

  return CPUFunctionBuilder;
}(FunctionBuilderBase);
},{"../function-builder-base":6,"./function-node":2}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseFunctionNode = require('../function-node-base');
var utils = require('../../core/utils');

/**
 * @class CPUFunctionNode
 *
 * @extends BaseFunctionNode#
 *
 * @desc [INTERNAL] Represents a single function, inside JS
 *
 * <p>This handles all the raw state, converted state, etc. Of a single function.</p>
 *
 * @prop functionName         - {String}        Name of the function
 * @prop jsFunction           - {Function}   The JS Function the node represents
 * @prop jsFunctionString     - {String}        jsFunction.toString()
 * @prop paramNames           - {String[]}  Parameter names of the function
 * @prop paramTypes           - {String[]}  Shader land parameters type assumption
 * @prop isRootKernel         - {Boolean}       Special indicator, for kernel function
 * @prop webglFunctionString  - {String}        webgl converted function string
 * @prop openglFunctionString - {String}        opengl converted function string
 * @prop calledFunctions      - {String[]}  List of all the functions called
 * @prop initVariables        - {String[]}  List of variables initialized in the function
 * @prop readVariables        - {String[]}  List of variables read operations occur
 * @prop writeVariables       - {String[]}  List of variables write operations occur
 *
 */
module.exports = function (_BaseFunctionNode) {
	_inherits(CPUFunctionNode, _BaseFunctionNode);

	function CPUFunctionNode(functionName, jsFunction, options) {
		_classCallCheck(this, CPUFunctionNode);

		var _this = _possibleConstructorReturn(this, (CPUFunctionNode.__proto__ || Object.getPrototypeOf(CPUFunctionNode)).call(this, functionName, jsFunction, options));

		_this.paramSizes = options ? options.paramSizes : [];
		_this.memberStates = [];
		return _this;
	}

	_createClass(CPUFunctionNode, [{
		key: 'pushMemberState',
		value: function pushMemberState(name) {
			this.memberStates.push(name);
		}
	}, {
		key: 'popMemberState',
		value: function popMemberState(name) {
			if (this.memberState === name) {
				this.memberStates.pop();
			} else {
				throw new Error('Cannot popMemberState ' + name + ' when in ' + this.memberState);
			}
		}
	}, {
		key: 'generate',
		value: function generate() {
			if (this.debug) {
				console.log(this);
			}
			this.functionStringArray = this.astGeneric(this.getJsAST(), []);
			this.functionString = this.functionStringArray.join('').trim();
			return this.functionString;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name getFunctionPrototypeString
   *
   * @desc Returns the converted JS function
   *
   * @returns {String} function string, result is cached under this.getFunctionPrototypeString
   *
   */

	}, {
		key: 'getFunctionPrototypeString',
		value: function getFunctionPrototypeString() {
			if (this.webGlFunctionPrototypeString) {
				return this.webGlFunctionPrototypeString;
			}
			return this.webGlFunctionPrototypeString = this.generate();
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astFunctionDeclaration
   *
   * @desc Parses the abstract syntax tree for to its *named function declaration*
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astFunctionDeclaration',
		value: function astFunctionDeclaration(ast, retArr) {
			this.builder.addFunction(null, utils.getAstString(this.jsFunctionString, ast));
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astFunctionPrototype
   *
   * @desc Parses the abstract syntax tree for to its *named function prototype*
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astFunctionPrototype',
		value: function astFunctionPrototype(ast, retArr) {
			// Setup function return type and name
			if (this.isRootKernel || this.isSubKernel) {
				return retArr;
			}

			retArr.push(this.returnType);
			retArr.push(' ');
			retArr.push(this.functionName);
			retArr.push('(');

			// Arguments handling
			for (var i = 0; i < this.paramNames.length; ++i) {
				if (i > 0) {
					retArr.push(', ');
				}
				retArr.push('user_');
				retArr.push(this.paramNames[i]);
			}

			retArr.push(');\n');

			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astFunctionExpression
   *
   * @desc Parses the abstract syntax tree for to its *named function*
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astFunctionExpression',
		value: function astFunctionExpression(ast, retArr) {

			// Setup function return type and name
			if (!this.isRootKernel) {
				retArr.push('function');
				retArr.push(' ');
				retArr.push(this.functionName);
				retArr.push('(');

				// Arguments handling
				for (var i = 0; i < this.paramNames.length; ++i) {
					var paramName = this.paramNames[i];

					if (i > 0) {
						retArr.push(', ');
					}
					retArr.push('user_');
					retArr.push(paramName);
				}

				// Function opening
				retArr.push(') {\n');
			}

			// Body statement iteration
			for (var _i = 0; _i < ast.body.body.length; ++_i) {
				this.astGeneric(ast.body.body[_i], retArr);
				retArr.push('\n');
			}

			if (!this.isRootKernel) {
				// Function closing
				retArr.push('}\n');
			}
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astReturnStatement
   *
   * @desc Parses the abstract syntax tree for to *return* statement
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astReturnStatement',
		value: function astReturnStatement(ast, retArr) {
			if (this.isRootKernel) {
				retArr.push('kernelResult = ');
				this.astGeneric(ast.argument, retArr);
				retArr.push(';');
			} else if (this.isSubKernel) {
				retArr.push(this.functionName + 'Result = ');
				this.astGeneric(ast.argument, retArr);
				retArr.push(';');
				retArr.push('return ' + this.functionName + 'Result;');
			} else {
				retArr.push('return ');
				this.astGeneric(ast.argument, retArr);
				retArr.push(';');
			}

			//throw this.astErrorOutput(
			//	'Non main function return, is not supported : '+this.currentFunctionNamespace,
			//	ast
			//);

			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astLiteral
   *
   * @desc Parses the abstract syntax tree for *literal value*
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astLiteral',
		value: function astLiteral(ast, retArr) {

			// Reject non numeric literals
			if (isNaN(ast.value)) {
				throw this.astErrorOutput('Non-numeric literal not supported : ' + ast.value, ast);
			}

			retArr.push(ast.value);

			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astBinaryExpression
   *
   * @desc Parses the abstract syntax tree for *binary* expression
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astBinaryExpression',
		value: function astBinaryExpression(ast, retArr) {
			retArr.push('(');
			this.astGeneric(ast.left, retArr);
			retArr.push(ast.operator);
			this.astGeneric(ast.right, retArr);
			retArr.push(')');
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astIdentifierExpression
   *
   * @desc Parses the abstract syntax tree for *identifier* expression
   *
   * @param {Object} idtNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astIdentifierExpression',
		value: function astIdentifierExpression(idtNode, retArr) {
			if (idtNode.type !== 'Identifier') {
				throw this.astErrorOutput('IdentifierExpression - not an Identifier', idtNode);
			}

			switch (this.state) {
				case 'input-index-y':
				case 'input-index-z':
					retArr.push('(');
			}

			switch (idtNode.name) {
				case 'gpu_threadX':
					retArr.push('threadId.x');
					break;
				case 'gpu_threadY':
					retArr.push('threadId.y');
					break;
				case 'gpu_threadZ':
					retArr.push('threadId.z');
					break;
				case 'gpu_outputX':
					retArr.push('uOutputDim.x');
					break;
				case 'gpu_outputY':
					retArr.push('uOutputDim.y');
					break;
				case 'gpu_outputZ':
					retArr.push('uOutputDim.z');
					break;
				case 'Infinity':
					retArr.push('Infinity');
					break;
				default:
					if (this.constants && this.constants.hasOwnProperty(idtNode.name)) {
						retArr.push('constants_' + idtNode.name);
					} else {
						var userParamName = this.getUserParamName(idtNode.name);
						if (userParamName !== null) {
							retArr.push('user_' + userParamName);
						} else {
							retArr.push('user_' + idtNode.name);
						}
					}
			}

			switch (this.state) {
				case 'input-index-y':
					{
						var size = this.paramSizes[this.paramNames.indexOf(this.memberState)];
						retArr.push(' * ' + size[0] + ')');
						break;
					}
				case 'input-index-z':
					{
						var _size = this.paramSizes[this.paramNames.indexOf(this.memberState)];
						retArr.push(' * ' + _size[0] * _size[1] + ')');
						break;
					}
			}

			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astForStatement
   *
   * @desc Parses the abstract syntax tree forfor *for-loop* expression
   *
   * @param {Object} forNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the parsed cpu string
   */

	}, {
		key: 'astForStatement',
		value: function astForStatement(forNode, retArr) {
			if (forNode.type !== 'ForStatement') {
				throw this.astErrorOutput('Invalid for statement', forNode);
			}

			if (forNode.test && forNode.test.type === 'BinaryExpression') {
				if ((forNode.test.right.type === 'Identifier' || forNode.test.right.type === 'Literal') && forNode.test.operator === '<' && this.isIdentifierConstant(forNode.test.right.name) === false) {

					if (!this.loopMaxIterations) {
						console.warn('Warning: loopMaxIterations is not set! Using default of 1000 which may result in unintended behavior.');
						console.warn('Set loopMaxIterations or use a for loop of fixed length to silence this message.');
					}

					retArr.push('for (');
					this.astGeneric(forNode.init, retArr);
					if (retArr[retArr.length - 1] !== ';') {
						retArr.push(';');
					}
					this.astGeneric(forNode.test.left, retArr);
					retArr.push(forNode.test.operator);
					retArr.push('LOOP_MAX');
					retArr.push(';');
					this.astGeneric(forNode.update, retArr);
					retArr.push(')');

					retArr.push('{\n');
					retArr.push('if (');
					this.astGeneric(forNode.test.left, retArr);
					retArr.push(forNode.test.operator);
					this.astGeneric(forNode.test.right, retArr);
					retArr.push(') {\n');
					if (forNode.body.type === 'BlockStatement') {
						for (var i = 0; i < forNode.body.body.length; i++) {
							this.astGeneric(forNode.body.body[i], retArr);
						}
					} else {
						this.astGeneric(forNode.body, retArr);
					}
					retArr.push('} else {\n');
					retArr.push('break;\n');
					retArr.push('}\n');
					retArr.push('}\n');

					return retArr;
				} else if (forNode.init.declarations) {
					var declarations = JSON.parse(JSON.stringify(forNode.init.declarations));
					var updateArgument = forNode.update.argument;
					if (!Array.isArray(declarations) || declarations.length < 1) {
						console.log(this.jsFunctionString);
						throw new Error('Error: Incompatible for loop declaration');
					}

					if (declarations.length > 1) {
						var initArgument = null;
						for (var _i2 = 0; _i2 < declarations.length; _i2++) {
							var declaration = declarations[_i2];
							if (declaration.id.name === updateArgument.name) {
								initArgument = declaration;
								declarations.splice(_i2, 1);
							} else {
								retArr.push('var ');
								this.astGeneric(declaration, retArr);
								retArr.push(';');
							}
						}

						retArr.push('for (let ');
						this.astGeneric(initArgument, retArr);
						retArr.push(';');
					} else {
						retArr.push('for (');
						this.astGeneric(forNode.init, retArr);
					}

					this.astGeneric(forNode.test, retArr);
					retArr.push(';');
					this.astGeneric(forNode.update, retArr);
					retArr.push(')');
					this.astGeneric(forNode.body, retArr);
					return retArr;
				}
			}

			throw this.astErrorOutput('Invalid for statement', forNode);
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astWhileStatement
   *
   * @desc Parses the abstract syntax tree for *while* loop
   *
   *
   * @param {Object} whileNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the parsed openclgl string
   */

	}, {
		key: 'astWhileStatement',
		value: function astWhileStatement(whileNode, retArr) {
			if (whileNode.type !== 'WhileStatement') {
				throw this.astErrorOutput('Invalid while statement', whileNode);
			}

			retArr.push('for (let i = 0; i < LOOP_MAX; i++) {');
			retArr.push('if (');
			this.astGeneric(whileNode.test, retArr);
			retArr.push(') {\n');
			this.astGeneric(whileNode.body, retArr);
			retArr.push('} else {\n');
			retArr.push('break;\n');
			retArr.push('}\n');
			retArr.push('}\n');

			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astWhileStatement
   *
   * @desc Parses the abstract syntax tree for *do while* loop
   *
   *
   * @param {Object} doWhileNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the parsed webgl string
   */

	}, {
		key: 'astDoWhileStatement',
		value: function astDoWhileStatement(doWhileNode, retArr) {
			if (doWhileNode.type !== 'DoWhileStatement') {
				throw this.astErrorOutput('Invalid while statement', doWhileNode);
			}

			retArr.push('for (let i = 0; i < LOOP_MAX; i++) {');
			this.astGeneric(doWhileNode.body, retArr);
			retArr.push('if (!');
			this.astGeneric(doWhileNode.test, retArr);
			retArr.push(') {\n');
			retArr.push('break;\n');
			retArr.push('}\n');
			retArr.push('}\n');

			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astAssignmentExpression
   *
   * @desc Parses the abstract syntax tree for *Assignment* Expression
   *
   * @param {Object} assNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astAssignmentExpression',
		value: function astAssignmentExpression(assNode, retArr) {
			this.astGeneric(assNode.left, retArr);
			retArr.push(assNode.operator);
			this.astGeneric(assNode.right, retArr);
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astEmptyStatement
   *
   * @desc Parses the abstract syntax tree for an *Empty* Statement
   *
   * @param {Object} eNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astEmptyStatement',
		value: function astEmptyStatement(eNode, retArr) {
			//retArr.push(';\n');
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astBlockStatement
   *
   * @desc Parses the abstract syntax tree for *Block* statement
   *
   * @param {Object} bNode - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astBlockStatement',
		value: function astBlockStatement(bNode, retArr) {
			retArr.push('{\n');
			for (var i = 0; i < bNode.body.length; i++) {
				this.astGeneric(bNode.body[i], retArr);
			}
			retArr.push('}\n');
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astExpressionStatement
   *
   * @desc Parses the abstract syntax tree for *generic expression* statement
   *
   * @param {Object} esNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astExpressionStatement',
		value: function astExpressionStatement(esNode, retArr) {
			this.astGeneric(esNode.expression, retArr);
			retArr.push(';');
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astVariableDeclaration
   *
   * @desc Parses the abstract syntax tree for *Variable Declaration*
   *
   * @param {Object} vardecNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astVariableDeclaration',
		value: function astVariableDeclaration(vardecNode, retArr) {
			retArr.push('var ');
			for (var i = 0; i < vardecNode.declarations.length; i++) {
				this.declarations[vardecNode.declarations[i].id.name] = 'var';
				if (i > 0) {
					retArr.push(',');
				}
				this.astGeneric(vardecNode.declarations[i], retArr);
			}
			retArr.push(';');
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astVariableDeclarator
   *
   * @desc Parses the abstract syntax tree for *Variable Declarator*
   *
   * @param {Object} ivardecNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astVariableDeclarator',
		value: function astVariableDeclarator(ivardecNode, retArr) {
			this.astGeneric(ivardecNode.id, retArr);
			if (ivardecNode.init !== null) {
				retArr.push('=');
				this.astGeneric(ivardecNode.init, retArr);
			}
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astIfStatement
   *
   * @desc Parses the abstract syntax tree for *If* Statement
   *
   * @param {Object} ifNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astIfStatement',
		value: function astIfStatement(ifNode, retArr) {
			retArr.push('if (');
			this.astGeneric(ifNode.test, retArr);
			retArr.push(')');
			if (ifNode.consequent.type === 'BlockStatement') {
				this.astGeneric(ifNode.consequent, retArr);
			} else {
				retArr.push(' {\n');
				this.astGeneric(ifNode.consequent, retArr);
				retArr.push('\n}\n');
			}

			if (ifNode.alternate) {
				retArr.push('else ');
				if (ifNode.alternate.type === 'BlockStatement') {
					this.astGeneric(ifNode.alternate, retArr);
				} else {
					retArr.push(' {\n');
					this.astGeneric(ifNode.alternate, retArr);
					retArr.push('\n}\n');
				}
			}
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astBreakStatement
   *
   * @desc Parses the abstract syntax tree for *Break* Statement
   *
   * @param {Object} brNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astBreakStatement',
		value: function astBreakStatement(brNode, retArr) {
			retArr.push('break;\n');
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astContinueStatement
   *
   * @desc Parses the abstract syntax tree for *Continue* Statement
   *
   * @param {Object} crNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astContinueStatement',
		value: function astContinueStatement(crNode, retArr) {
			retArr.push('continue;\n');
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astLogicalExpression
   *
   * @desc Parses the abstract syntax tree for *Logical* Expression
   *
   * @param {Object} logNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astLogicalExpression',
		value: function astLogicalExpression(logNode, retArr) {
			retArr.push('(');
			this.astGeneric(logNode.left, retArr);
			retArr.push(logNode.operator);
			this.astGeneric(logNode.right, retArr);
			retArr.push(')');
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astUpdateExpression
   *
   * @desc Parses the abstract syntax tree for *Update* Expression
   *
   * @param {Object} uNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astUpdateExpression',
		value: function astUpdateExpression(uNode, retArr) {
			if (uNode.prefix) {
				retArr.push(uNode.operator);
				this.astGeneric(uNode.argument, retArr);
			} else {
				this.astGeneric(uNode.argument, retArr);
				retArr.push(uNode.operator);
			}

			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astUnaryExpression
   *
   * @desc Parses the abstract syntax tree for *Unary* Expression
   *
   * @param {Object} uNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astUnaryExpression',
		value: function astUnaryExpression(uNode, retArr) {
			if (uNode.prefix) {
				retArr.push(uNode.operator);
				this.astGeneric(uNode.argument, retArr);
			} else {
				this.astGeneric(uNode.argument, retArr);
				retArr.push(uNode.operator);
			}

			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astThisExpression
   *
   * @desc Parses the abstract syntax tree for *This* expression
   *
   * @param {Object} tNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astThisExpression',
		value: function astThisExpression(tNode, retArr) {
			retArr.push('_this');
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astMemberExpression
   *
   * @desc Parses the abstract syntax tree for *Member* Expression
   *
   * @param {Object} mNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astMemberExpression',
		value: function astMemberExpression(mNode, retArr) {
			if (mNode.computed) {
				if (mNode.object.type === 'Identifier' || mNode.object.type === 'MemberExpression' && mNode.object.object.object && mNode.object.object.object.type === 'ThisExpression' && mNode.object.object.property.name === 'constants') {
					this.pushState('identifier');
					this.astGeneric(mNode.object, retArr);
					this.popState('identifier');
					retArr.push('[');
					if (this.isInput(mNode.object.name)) {
						this.astGeneric(mNode.property, retArr);
					} else {
						this.astGeneric(mNode.property, retArr);
					}
					retArr.push(']');
				} else {
					if (mNode.object.object) {
						if (mNode.object.object.object && this.isInput(mNode.object.object.object.name)) {
							this.pushMemberState(mNode.object.object.object.name);
							this.pushState('input-index-z');
							this.astGeneric(mNode.object, retArr);
							var last = retArr.pop();
							retArr.push(' + ');
							this.popState('input-index-z');
							this.pushState('input-index');
							this.astGeneric(mNode.property, retArr);
							this.popState('input-index');
							retArr.push(last);
							this.popMemberState(mNode.object.object.object.name);
						} else if (this.isInput(mNode.object.object.name)) {
							this.pushMemberState(mNode.object.object.name);
							if (!this.isState('input-index-z')) {
								this.pushState('input-index-y');
							}
							this.astGeneric(mNode.object, retArr);
							var _last = retArr.pop();
							retArr.push(' + ');
							if (!this.isState('input-index-z')) {
								this.popState('input-index-y');
							}

							var isInputIndexZ = this.isState('input-index-z');
							if (isInputIndexZ) {
								this.pushState('input-index-y');
							} else {
								this.pushState('input-index');
							}
							this.astGeneric(mNode.property, retArr);
							if (isInputIndexZ) {
								this.popState('input-index-y');
							} else {
								this.popState('input-index');
							}
							retArr.push(_last);
							this.popMemberState(mNode.object.object.name);
						} else {
							this.astGeneric(mNode.object, retArr);
							var _last2 = retArr.pop();
							retArr.push('][');
							this.astGeneric(mNode.property, retArr);
							retArr.push(_last2);
						}
					} else {
						this.astGeneric(mNode.object, retArr);
						var _last3 = retArr.pop();
						retArr.push('][');
						this.astGeneric(mNode.property, retArr);
						retArr.push(_last3);
					}
				}
			} else {
				var unrolled = this.astMemberExpressionUnroll(mNode);
				if (mNode.property.type === 'Identifier' && mNode.computed) {
					unrolled = 'user_' + unrolled;
				}

				if (unrolled.indexOf('this.constants') === 0) {
					// remove 'this.constants' from beginning
					unrolled = 'constants_' + unrolled.substring(15);
				} else if (unrolled.indexOf('this') === 0) {
					// Its a reference to `this`, add '_' before
					unrolled = '_' + unrolled;
				}

				switch (this.state) {
					case 'input-index-y':
					case 'input-index-z':
						retArr.push('(');
				}

				switch (unrolled) {
					case '_this.output.x':
						retArr.push(this.output[0]);
						break;
					case '_this.output.y':
						retArr.push(this.output[1]);
						break;
					case '_this.output.z':
						retArr.push(this.output[2]);
						break;
					default:
						if (mNode.object && mNode.object.name && this.declarations[mNode.object.name]) {
							retArr.push('user_');
						}
						retArr.push(unrolled);
				}

				switch (this.state) {
					case 'input-index-y':
						{
							var size = this.paramSizes[this.paramNames.indexOf(this.memberState)];
							retArr.push(' * ' + size[0] + ')');
							break;
						}
					case 'input-index-z':
						{
							var _size2 = this.paramSizes[this.paramNames.indexOf(this.memberState)];
							retArr.push(' * ' + _size2[0] * _size2[1] + ')');
							break;
						}
				}
			}
			return retArr;
		}
	}, {
		key: 'astSequenceExpression',
		value: function astSequenceExpression(sNode, retArr) {
			for (var i = 0; i < sNode.expressions.length; i++) {
				if (i > 0) {
					retArr.push(',');
				}
				this.astGeneric(sNode.expressions, retArr);
			}
			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astCallExpression
   *
   * @desc Parses the abstract syntax tree for *call* expression
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns  {Array} the append retArr
   */

	}, {
		key: 'astCallExpression',
		value: function astCallExpression(ast, retArr) {
			if (ast.callee) {
				// Get the full function call, unrolled
				var funcName = this.astMemberExpressionUnroll(ast.callee);

				// Register the function into the called registry
				if (this.calledFunctions.indexOf(funcName) < 0) {
					this.calledFunctions.push(funcName);
				}
				if (!this.hasOwnProperty('funcName')) {
					this.calledFunctionsArguments[funcName] = [];
				}

				var functionArguments = [];
				this.calledFunctionsArguments[funcName].push(functionArguments);

				// Call the function
				retArr.push(funcName);

				// Open arguments space
				retArr.push('(');

				// Add the vars
				for (var i = 0; i < ast.arguments.length; ++i) {
					var argument = ast.arguments[i];
					if (i > 0) {
						retArr.push(', ');
					}
					this.astGeneric(argument, retArr);
					if (argument.type === 'Identifier') {
						var paramIndex = this.paramNames.indexOf(argument.name);
						if (paramIndex === -1) {
							functionArguments.push(null);
						} else {
							functionArguments.push({
								name: argument.name,
								type: this.paramTypes[paramIndex]
							});
						}
					} else {
						functionArguments.push(null);
					}
				}

				// Close arguments space
				retArr.push(')');

				return retArr;
			}

			// Failure, unknown expression
			throw this.astErrorOutput('Unknown CallExpression', ast);

			return retArr;
		}

		/**
   * @memberOf CPUFunctionNode#
   * @function
   * @name astArrayExpression
   *
   * @desc Parses the abstract syntax tree for *Array* Expression
   *
   * @param {Object} arrNode - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astArrayExpression',
		value: function astArrayExpression(arrNode, retArr) {
			var arrLen = arrNode.elements.length;

			retArr.push('[');
			for (var i = 0; i < arrLen; ++i) {
				if (i > 0) {
					retArr.push(', ');
				}
				var subNode = arrNode.elements[i];
				this.astGeneric(subNode, retArr);
			}
			retArr.push(']');

			return retArr;

			// // Failure, unknown expression
			// throw this.astErrorOutput(
			// 	'Unknown  ArrayExpression',
			// 	arrNode
			//);
		}
	}, {
		key: 'astDebuggerStatement',
		value: function astDebuggerStatement(arrNode, retArr) {
			retArr.push('debugger;');
			return retArr;
		}
	}, {
		key: 'memberState',
		get: function get() {
			return this.memberStates[this.memberStates.length - 1];
		}
	}]);

	return CPUFunctionNode;
}(BaseFunctionNode);
},{"../../core/utils":32,"../function-node-base":7}],3:[function(require,module,exports){
'use strict';

var utils = require('../../core/utils');
var kernelRunShortcut = require('../kernel-run-shortcut');

function removeFnNoise(fn) {
  if (/^function /.test(fn)) {
    fn = fn.substring(9);
  }
  return fn.replace(/[_]typeof/g, 'typeof');
}

function removeNoise(str) {
  return str.replace(/[_]typeof/g, 'typeof');
}

module.exports = function (cpuKernel, name) {
  return '() => {\n    ' + kernelRunShortcut.toString() + ';\n    const utils = {\n      allPropertiesOf: ' + removeNoise(utils.allPropertiesOf.toString()) + ',\n      clone: ' + removeNoise(utils.clone.toString()) + ',\n      checkOutput: ' + removeNoise(utils.checkOutput.toString()) + '\n    };\n    const Utils = utils;\n    let Input = function() {};\n    class ' + (name || 'Kernel') + ' {\n      constructor() {        \n        this.argumentsLength = 0;\n        this._canvas = null;\n        this._webGl = null;\n        this.built = false;\n        this.program = null;\n        this.paramNames = ' + JSON.stringify(cpuKernel.paramNames) + ';\n        this.paramTypes = ' + JSON.stringify(cpuKernel.paramTypes) + ';\n        this.texSize = ' + JSON.stringify(cpuKernel.texSize) + ';\n        this.output = ' + JSON.stringify(cpuKernel.output) + ';\n        this._kernelString = `' + cpuKernel._kernelString + '`;\n        this.output = ' + JSON.stringify(cpuKernel.output) + ';\n\t\t    this.run = function() {\n          this.run = null;\n          this.build();\n          return this.run.apply(this, arguments);\n        }.bind(this);\n        this.thread = {\n          x: 0,\n          y: 0,\n          z: 0\n        };\n      }\n      setCanvas(canvas) { this._canvas = canvas; return this; }\n      setWebGl(webGl) { this._webGl = webGl; return this; }\n      setInput(Type) { Input = Type; }\n      ' + removeFnNoise(cpuKernel.build.toString()) + '\n      ' + removeFnNoise(cpuKernel.setupParams.toString()) + '\n      ' + removeFnNoise(cpuKernel.setupConstants.toString()) + '\n      run () { ' + cpuKernel.kernelString + ' }\n      getKernelString() { return this._kernelString; }\n      ' + removeFnNoise(cpuKernel.validateOptions.toString()) + '\n    };\n    return kernelRunShortcut(new Kernel());\n  };';
};
},{"../../core/utils":32,"../kernel-run-shortcut":9}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var KernelBase = require('../kernel-base');
var utils = require('../../core/utils');
var kernelString = require('./kernel-string');

module.exports = function (_KernelBase) {
	_inherits(CPUKernel, _KernelBase);

	/**
  * @constructor CPUKernel
  *
  * @desc Kernel Implementation for CPU.
  *
  * <p>Instantiates properties to the CPU Kernel.</p>
  *
  * @extends KernelBase
  *
  * @prop {Object} thread - The thread dimensions, x, y and z
  * @prop {Object} output - The canvas dimensions
  * @prop {Object} functionBuilder - Function Builder instance bound to this Kernel
  * @prop {Function} run - Method to run the kernel
  *
  */
	function CPUKernel(fnString, settings) {
		_classCallCheck(this, CPUKernel);

		var _this = _possibleConstructorReturn(this, (CPUKernel.__proto__ || Object.getPrototypeOf(CPUKernel)).call(this, fnString, settings));

		_this._fn = null;
		_this.run = null;
		_this._canvasCtx = null;
		_this._imageData = null;
		_this._colorData = null;
		_this._kernelString = null;
		_this.thread = {
			x: 0,
			y: 0,
			z: 0
		};

		_this.run = function () {
			this.run = null;
			this.build.apply(this, arguments);
			return this.run.apply(this, arguments);
		}.bind(_this);
		return _this;
	}

	/**
  * @memberOf CPUKernel#
  * @function
  * @name validateOptions
  *
  * @desc Validate options related to CPU Kernel, such as
  * dimensions size, and auto dimension support.
  *
  */


	_createClass(CPUKernel, [{
		key: 'validateOptions',
		value: function validateOptions() {
			if (!this.output || this.output.length === 0) {
				if (arguments.length !== 1) {
					throw 'Auto dimensions only supported for kernels with only one input';
				}

				var argType = utils.getArgumentType(arguments[0]);
				if (argType === 'Array') {
					this.output = utils.getDimensions(argType);
				} else if (argType === 'NumberTexture' || argType === 'ArrayTexture(4)') {
					this.output = arguments[0].output;
				} else {
					throw 'Auto dimensions not supported for input type: ' + argType;
				}
			}

			utils.checkOutput(this.output);
		}

		/**
   * @memberOf CPUKernel#
   * @function
   * @name build
   *
   * @desc Builds the Kernel, by generating the kernel
   * string using thread dimensions, and arguments
   * supplied to the kernel.
   *
   * <p>If the graphical flag is enabled, canvas is used.</p>
   *
   */

	}, {
		key: 'build',
		value: function build() {
			this.setupConstants();
			this.setupParams(arguments);
			this.validateOptions();
			var canvas = this._canvas;
			if (canvas) {
				// if node or canvas is not found, don't die
				this._canvasCtx = canvas.getContext('2d');
			}
			var threadDim = this.threadDim = utils.clone(this.output);

			while (threadDim.length < 3) {
				threadDim.push(1);
			}

			if (this.graphical) {
				var _canvas = this._canvas;
				if (!_canvas) {
					throw new Error('no canvas available for using graphical output');
				}
				_canvas.width = threadDim[0];
				_canvas.height = threadDim[1];
				this._imageData = this._canvasCtx.createImageData(threadDim[0], threadDim[1]);
				this._colorData = new Uint8ClampedArray(threadDim[0] * threadDim[1] * 4);
			}

			var kernelString = this.getKernelString();

			if (this.debug) {
				console.log('Options:');
				console.dir(this);
				console.log('Function output:');
				console.log(kernelString);
			}

			this.kernelString = kernelString;
			this.run = new Function([], kernelString).bind(this)();
		}
	}, {
		key: 'color',
		value: function color(r, g, b, a) {
			if (typeof a === 'undefined') {
				a = 1;
			}

			r = Math.floor(r * 255);
			g = Math.floor(g * 255);
			b = Math.floor(b * 255);
			a = Math.floor(a * 255);

			var width = this.output[0];
			var height = this.output[1];

			var x = this.thread.x;
			var y = height - this.thread.y - 1;

			var index = x + y * width;

			this._colorData[index * 4 + 0] = r;
			this._colorData[index * 4 + 1] = g;
			this._colorData[index * 4 + 2] = b;
			this._colorData[index * 4 + 3] = a;
		}

		/**
   * @memberOf CPUKernel#
   * @function
   * @name getKernelString
   *
   * @desc Generates kernel string for this kernel program.
   *
   * <p>If sub-kernels are supplied, they are also factored in.
   * This string can be saved by calling the `toString` method
   * and then can be reused later.</p>
   *
   * @returns {String} result
   *
   */

	}, {
		key: 'getKernelString',
		value: function getKernelString() {
			if (this._kernelString !== null) return this._kernelString;

			var builder = this.functionBuilder;

			// Thread dim fix (to make compilable)
			var threadDim = this.threadDim || (this.threadDim = utils.clone(this.output));
			while (threadDim.length < 3) {
				threadDim.push(1);
			}

			builder.addKernel(this.fnString, {
				prototypeOnly: false,
				constants: this.constants,
				output: threadDim,
				debug: this.debug,
				loopMaxIterations: this.loopMaxIterations,
				paramNames: this.paramNames,
				paramTypes: this.paramTypes,
				paramSizes: this.paramSizes,
				constantTypes: this.constantTypes
			});

			builder.addFunctions(this.functions, {
				constants: this.constants,
				output: threadDim
			});

			builder.addNativeFunctions(this.nativeFunctions);

			if (this.subKernels !== null) {
				this.subKernelOutputTextures = [];
				this.subKernelOutputVariableNames = [];
				for (var i = 0; i < this.subKernels.length; i++) {
					var subKernel = this.subKernels[i];
					builder.addSubKernel(subKernel, {
						prototypeOnly: false,
						constants: this.constants,
						output: this.output,
						debug: this.debug,
						loopMaxIterations: this.loopMaxIterations
					});
					this.subKernelOutputVariableNames.push(subKernel.name + 'Result');
				}
			} else if (this.subKernelProperties !== null) {
				this.subKernelOutputVariableNames = [];
				var _i = 0;
				for (var p in this.subKernelProperties) {
					if (!this.subKernelProperties.hasOwnProperty(p)) continue;
					var _subKernel = this.subKernelProperties[p];
					builder.addSubKernel(_subKernel);
					this.subKernelOutputVariableNames.push(_subKernel.name + 'Result');
					_i++;
				}
			}

			var prototypes = builder.getPrototypes('kernel');
			var kernel = null;
			if (prototypes.length > 1) {
				prototypes = prototypes.filter(function (fn) {
					if (/^function/.test(fn)) return fn;
					kernel = fn;
					return false;
				});
			} else {
				kernel = prototypes.shift();
			}
			var kernelString = this._kernelString = '\n\t\tvar LOOP_MAX = ' + this._getLoopMaxString() + '\n\t\tvar constants = this.constants;\n\t\tvar _this = this;\n    return function (' + this.paramNames.map(function (paramName) {
				return 'user_' + paramName;
			}).join(', ') + ') {\n      ' + this._processConstants() + '\n      ' + this._processParams() + '\n      ' + this._kernelLoop(kernel) + '\n      if (this.graphical) {\n        this._imageData.data.set(this._colorData);\n        this._canvasCtx.putImageData(this._imageData, 0, 0);\n        return;\n      }\n      ' + this._kernelOutput() + '\n      ' + (prototypes.length > 0 ? prototypes.join('\n') : '') + '\n    }.bind(this);';
			return kernelString;
		}

		/**
   * @memberOf CPUKernel#
   * @function
   * @name toString
   *
   * @desc Returns the *pre-compiled* Kernel as a JS Object String, that can be reused.
   *
   */

	}, {
		key: 'toString',
		value: function toString() {
			return kernelString(this);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getLoopMaxString
   *
   * @desc Get the maximum loop size String.
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getLoopMaxString',
		value: function _getLoopMaxString() {
			return this.loopMaxIterations ? ' ' + parseInt(this.loopMaxIterations) + ';\n' : ' 1000;\n';
		}
	}, {
		key: '_processConstants',
		value: function _processConstants() {
			if (!this.constants) return '';

			var result = [];
			for (var p in this.constants) {
				var type = this.constantTypes[p];
				switch (type) {
					case 'HTMLImage':
						result.push('  var constants_' + p + ' = this._imageTo2DArray(this.constants.' + p + ')');
						break;
					case 'HTMLImageArray':
						result.push('  var constants_' + p + ' = this._imageTo3DArray(this.constants.' + p + ')');
						break;
					case 'Input':
						result.push('  var constants_' + p + ' = this.constants.' + p + '.value');
						break;
					default:
						result.push('  var constants_' + p + ' = this.constants.' + p);
				}
			}
			return result.join('\n');
		}
	}, {
		key: '_processParams',
		value: function _processParams() {
			var result = [];
			for (var i = 0; i < this.paramTypes.length; i++) {
				switch (this.paramTypes[i]) {
					case 'HTMLImage':
						result.push('  user_' + this.paramNames[i] + ' = this._imageTo2DArray(user_' + this.paramNames[i] + ')');
						break;
					case 'HTMLImageArray':
						result.push('  user_' + this.paramNames[i] + ' = this._imageTo3DArray(user_' + this.paramNames[i] + ')');
						break;
					case 'Input':
						result.push('  user_' + this.paramNames[i] + ' = user_' + this.paramNames[i] + '.value');
						break;
				}
			}
			return result.join(';\n');
		}
	}, {
		key: '_imageTo2DArray',
		value: function _imageTo2DArray(image) {
			var canvas = this._canvas;
			if (canvas.width < image.width) {
				canvas.width = image.width;
			}
			if (canvas.height < image.height) {
				canvas.height = image.height;
			}
			var ctx = this._canvasCtx;
			ctx.drawImage(image, 0, 0, image.width, image.height);
			var pixelsData = ctx.getImageData(0, 0, image.width, image.height).data;
			var imageArray = new Array(image.height);
			var index = 0;
			for (var y = image.height - 1; y >= 0; y--) {
				imageArray[y] = new Array(image.width);
				for (var x = 0; x < image.width; x++) {
					var r = pixelsData[index++] / 255;
					var g = pixelsData[index++] / 255;
					var b = pixelsData[index++] / 255;
					var a = pixelsData[index++] / 255;
					var result = [r, g, b, a];
					result.r = r;
					result.g = g;
					result.b = b;
					result.a = a;
					imageArray[y][x] = result;
				}
			}
			return imageArray;
		}
	}, {
		key: '_imageTo3DArray',
		value: function _imageTo3DArray(images) {
			var imagesArray = new Array(images.length);
			for (var i = 0; i < images.length; i++) {
				imagesArray[i] = this._imageTo2DArray(images[i]);
			}
			return imagesArray;
		}
	}, {
		key: '_kernelLoop',
		value: function _kernelLoop(kernelString) {
			switch (this.output.length) {
				case 1:
					return this._kernel1DLoop(kernelString);
				case 2:
					return this._kernel2DLoop(kernelString);
				case 3:
					return this._kernel3DLoop(kernelString);
				default:
					throw new Error('unsupported size kernel');
			}
		}
	}, {
		key: '_kernel1DLoop',
		value: function _kernel1DLoop(kernelString) {
			var threadDim = this.threadDim;
			return '\n    var result = new Float32Array(' + threadDim[0] + ');\n    ' + this._mapSubKernels(function (name) {
				return 'var result_' + name + ' = new Float32Array(' + threadDim[0] + ');\n';
			}).join('') + '\n    for (var x = 0; x < ' + threadDim[0] + '; x++) {\n      this.thread.x = x;\n      this.thread.y = 0;\n      this.thread.z = 0;\n      var kernelResult;\n      ' + kernelString + '\n      result[x] = kernelResult;\n      ' + this._mapSubKernels(function (name) {
				return 'result_' + name + '[x] = ' + name + ';\n';
			}).join('') + '\n    }';
		}
	}, {
		key: '_kernel2DLoop',
		value: function _kernel2DLoop(kernelString) {
			var threadDim = this.threadDim;
			return '\n    var result = new Array(' + threadDim[1] + ');\n    ' + this._mapSubKernels(function (name) {
				return 'var result_' + name + ' = new Array(' + threadDim[1] + ');\n';
			}).join('') + '\n    for (var y = 0; y < ' + threadDim[1] + '; y++) {\n      this.thread.z = 0;\n      this.thread.y = y;\n      var resultX = result[y] = new Float32Array(' + threadDim[0] + ');\n      ' + this._mapSubKernels(function (name) {
				return 'var result_' + name + 'X = result_' + name + '[y] = new Float32Array(' + threadDim[0] + ');\n';
			}).join('') + '\n      for (var x = 0; x < ' + threadDim[0] + '; x++) {\n      \tthis.thread.x = x;\n        var kernelResult;\n        ' + kernelString + '\n        resultX[x] = kernelResult;\n        ' + this._mapSubKernels(function (name) {
				return 'result_' + name + 'X[x] = ' + name + ';\n';
			}).join('') + '\n      }\n    }';
		}
	}, {
		key: '_kernel3DLoop',
		value: function _kernel3DLoop(kernelString) {
			var threadDim = this.threadDim;
			return '\n    var result = new Array(' + threadDim[2] + ');\n    ' + this._mapSubKernels(function (name) {
				return 'var result_' + name + ' = new Array(' + threadDim[2] + ');\n';
			}).join('') + '\n    for (var z = 0; z < ' + threadDim[2] + '; z++) {\n      this.thread.z = z;\n      var resultY = result[z] = new Array(' + threadDim[1] + ');\n      ' + this._mapSubKernels(function (name) {
				return 'var result_' + name + 'Y = result_' + name + '[z] = new Array(' + threadDim[1] + ');\n';
			}).join('') + '\n      for (var y = 0; y < ' + threadDim[1] + '; y++) {\n        this.thread.y = y;\n        var resultX = resultY[y] = new Float32Array(' + threadDim[0] + ');\n        ' + this._mapSubKernels(function (name) {
				return 'var result_' + name + 'X = result_' + name + 'Y[y] = new Float32Array(' + threadDim[0] + ');\n';
			}).join('') + '\n        for (var x = 0; x < ' + threadDim[0] + '; x++) {\n        \tthis.thread.x = x;\n          var kernelResult;\n          ' + kernelString + '\n          resultX[x] = kernelResult;\n          ' + this._mapSubKernels(function (name) {
				return 'result_' + name + 'X[x] = ' + name + ';\n';
			}).join('') + '\n        }\n      }\n    }';
		}
	}, {
		key: '_kernelOutput',
		value: function _kernelOutput() {
			var _this2 = this;

			if (!this.subKernelOutputVariableNames) {
				return 'return result;';
			}
			return 'return {\n      result: result,\n      ' + Object.keys(this.subKernelProperties || this.subKernelOutputVariableNames).map(function (name, i) {
				return name + ': result_' + _this2.subKernelOutputVariableNames[i];
			}).join(',\n') + '\n    };';
		}
	}, {
		key: '_mapSubKernels',
		value: function _mapSubKernels(fn) {
			return this.subKernelOutputVariableNames === null ? [''] : this.subKernelOutputVariableNames.map(fn);
		}
	}]);

	return CPUKernel;
}(KernelBase);
},{"../../core/utils":32,"../kernel-base":8,"./kernel-string":3}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var utils = require('../../core/utils');
var RunnerBase = require('../runner-base');
var CPUKernel = require('./kernel');
var CPUFunctionBuilder = require('./function-builder');

module.exports = function (_RunnerBase) {
	_inherits(CPURunner, _RunnerBase);

	/**
  * @constructor CPURunner
  *
  * @desc Instantiates a Runner instance for the kernel.
  * 
  * @extends RunnerBase
  *
  * @param {Object} settings - Settings to instantiate properties in RunnerBase, with given values
  *
  */

	function CPURunner(settings) {
		_classCallCheck(this, CPURunner);

		var _this = _possibleConstructorReturn(this, (CPURunner.__proto__ || Object.getPrototypeOf(CPURunner)).call(this, new CPUFunctionBuilder(), settings));

		_this.Kernel = CPUKernel;
		_this.kernel = null;
		return _this;
	}

	/**
  * @memberOf CPURunner#
  * @function
  * @name getMode()
  *
  * Return the current mode in which gpu.js is executing.
  * 
  * @returns {String} The current mode; "cpu".
  *
  */


	_createClass(CPURunner, [{
		key: 'getMode',
		value: function getMode() {
			return 'cpu';
		}
	}]);

	return CPURunner;
}(RunnerBase);
},{"../../core/utils":32,"../runner-base":10,"./function-builder":1,"./kernel":4}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {

	/**
  * @constructor FunctionBuilderBase
  *
  * @desc This handles all the raw state, converted state, etc. of a single function.
  * [INTERNAL] A collection of functionNodes.
  * 
  * @prop {Object} nodeMap - Object map, where nodeMap[function] = new FunctionNode;
  * @prop {Object} gpu - The current gpu instance bound to this builder
  * @prop {Object} rootKernel - The root kernel object, contains the paramNames, dimensions etc.
  * 
  */
	function FunctionBuilderBase(gpu) {
		_classCallCheck(this, FunctionBuilderBase);

		this.nodeMap = {};
		this.nativeFunctions = {};
		this.gpu = gpu;
		this.rootKernel = null;
		this.Node = null;
	}

	_createClass(FunctionBuilderBase, [{
		key: 'addNativeFunction',
		value: function addNativeFunction(functionName, glslFunctionString) {
			this.nativeFunctions[functionName] = glslFunctionString;
		}

		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name addFunction
   *
   * @desc Instantiates a FunctionNode, and add it to the nodeMap
   *
   * @param {String} functionName - Function name to assume, if its null, it attempts to extract from the function
   * @param {Function} jsFunction - JS Function to do conversion
   * @param {Object} [options]
   *
   */

	}, {
		key: 'addFunction',
		value: function addFunction(functionName, jsFunction, options) {
			this.addFunctionNode(new this.Node(functionName, jsFunction, options).setBuilder(this));
		}
	}, {
		key: 'addFunctions',
		value: function addFunctions(functions, options) {
			if (functions) {
				if (Array.isArray(functions)) {
					for (var i = 0; i < functions.length; i++) {
						this.addFunction(null, functions[i], options);
					}
				} else {
					for (var p in functions) {
						this.addFunction(p, functions[p], options);
					}
				}
			}
		}
	}, {
		key: 'addNativeFunctions',
		value: function addNativeFunctions(nativeFunctions) {
			for (var functionName in nativeFunctions) {
				if (!nativeFunctions.hasOwnProperty(functionName)) continue;
				this.addNativeFunction(functionName, nativeFunctions[functionName]);
			}
		}

		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name addFunctionNode
   *
   * @desc Add the function node directly
   *
   * @param {functionNode} inNode - functionNode to add
   *
   */

	}, {
		key: 'addFunctionNode',
		value: function addFunctionNode(inNode) {
			this.nodeMap[inNode.functionName] = inNode;
			if (inNode.isRootKernel) {
				this.rootKernel = inNode;
			}
		}

		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name traceFunctionCalls
   *
   * @desc Trace all the depending functions being called, from a single function
   *
   * This allow for 'unneeded' functions to be automatically optimized out.
   * Note that the 0-index, is the starting function trace.
   *
   * @param {String} functionName - Function name to trace from, default to 'kernel'
   * @param {String[]} retList - Returning list of function names that is traced. Including itself.
   * @param {Object} [parent] - Parent node
   *
   * @returns {String[]}  Returning list of function names that is traced. Including itself.
   */

	}, {
		key: 'traceFunctionCalls',
		value: function traceFunctionCalls(functionName, retList, parent) {
			functionName = functionName || 'kernel';
			retList = retList || [];

			var fNode = this.nodeMap[functionName];
			if (fNode) {
				// Check if function already exists
				var functionIndex = retList.indexOf(functionName);
				if (functionIndex === -1) {
					retList.push(functionName);
					if (parent) {
						fNode.parent = parent;
					}
					fNode.getFunctionString(); //ensure JS trace is done
					for (var i = 0; i < fNode.calledFunctions.length; ++i) {
						this.traceFunctionCalls(fNode.calledFunctions[i], retList, fNode);
					}
				} else {
					/**
      * https://github.com/gpujs/gpu.js/issues/207
      * if dependent function is already in the list, because a function depends on it, and because it has
      * already been traced, we know that we must move the dependent function to the end of the the retList.
      * */
					var dependantFunctionName = retList.splice(functionIndex, 1)[0];
					retList.push(dependantFunctionName);
				}
			}

			if (this.nativeFunctions[functionName]) {
				if (retList.indexOf(functionName) >= 0) {
					// Does nothing if already traced
				} else {
					retList.push(functionName);
				}
			}

			return retList;
		}

		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name addKernel
   *
   * @desc Add a new kernel to this instance
   *
   * @param {String} fnString - Kernel function as a String
   * @param {Object} options - Settings object to set constants, debug mode, etc.
   *
   *
   * @returns {Object} The inserted kernel as a Kernel Node
   *
   */

	}, {
		key: 'addKernel',
		value: function addKernel(fnString, options) {
			var kernelNode = new this.Node('kernel', fnString, options);
			kernelNode.setBuilder(this);
			kernelNode.isRootKernel = true;
			this.addFunctionNode(kernelNode);
			return kernelNode;
		}

		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name addSubKernel
   *
   * @desc Add a new sub-kernel to the current kernel instance
   *
   * @param {Function} jsFunction - Sub-kernel function (JavaScript)
   * @param {Object} options - Settings object to set constants, debug mode, etc.
   *
   * @returns {Object} The inserted sub-kernel as a Kernel Node
   *
   */

	}, {
		key: 'addSubKernel',
		value: function addSubKernel(jsFunction, options) {
			var kernelNode = new this.Node(null, jsFunction, options);
			kernelNode.setBuilder(this);
			kernelNode.isSubKernel = true;
			this.addFunctionNode(kernelNode);
			return kernelNode;
		}

		/**
   * @memberOf CPUFunctionBuilder#
   * @name getPrototypeString
   * @function
   *
   * @desc Return the string for a function
   *
   * @param {String} functionName - Function name to trace from. If null, it returns the WHOLE builder stack
   *
   * @returns {String} The full string, of all the various functions. Trace optimized if functionName given
   *
   */

	}, {
		key: 'getPrototypeString',
		value: function getPrototypeString(functionName) {
			return this.getPrototypes(functionName).join('\n');
		}

		/**
   * @memberOf CPUFunctionBuilder#
   * @name getPrototypeString
   * @function
   *
   * @desc Return the string for a function
   *
   * @param {String} [functionName] - Function name to trace from. If null, it returns the WHOLE builder stack
   *
   * @returns {Array} The full string, of all the various functions. Trace optimized if functionName given
   *
   */

	}, {
		key: 'getPrototypes',
		value: function getPrototypes(functionName) {
			this.rootKernel.generate();
			if (functionName) {
				return this.getPrototypesFromFunctionNames(this.traceFunctionCalls(functionName, []).reverse());
			}
			return this.getPrototypesFromFunctionNames(Object.keys(this.nodeMap));
		}

		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name getStringFromFunctionNames
   *
   * @desc Get string from function names
   *
   * @param {String[]} functionList - List of function to build string
   *
   * @returns {String} The string, of all the various functions. Trace optimized if functionName given
   *
   */

	}, {
		key: 'getStringFromFunctionNames',
		value: function getStringFromFunctionNames(functionList) {
			var ret = [];
			for (var i = 0; i < functionList.length; ++i) {
				var node = this.nodeMap[functionList[i]];
				if (node) {
					ret.push(this.nodeMap[functionList[i]].getFunctionString());
				}
			}
			return ret.join('\n');
		}

		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name getPrototypeStringFromFunctionNames
   *
   * @desc Return string of all functions converted
   *
   * @param {String[]} functionList - List of function names to build the string.
   * @param {Object} [opt - Settings object passed to functionNode. See functionNode for more details.
   *
   * @returns {Array} Prototypes of all functions converted
   *
   */

	}, {
		key: 'getPrototypesFromFunctionNames',
		value: function getPrototypesFromFunctionNames(functionList, opt) {
			var ret = [];
			for (var i = 0; i < functionList.length; ++i) {
				var functionName = functionList[i];
				var node = this.nodeMap[functionName];
				if (node) {
					ret.push(node.getFunctionPrototypeString(opt));
				} else if (this.nativeFunctions[functionName]) {
					ret.push(this.nativeFunctions[functionName]);
				}
			}
			return ret;
		}

		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name getPrototypeStringFromFunctionNames
   *
   * @desc Return string of all functions converted
   *
   * @param {String[]} functionList - List of function names to build the string.
   * @param {Object} opt - Settings object passed to functionNode. See functionNode for more details.
   *
   * @returns {String} Prototype string of all functions converted
   *
   */

	}, {
		key: 'getPrototypeStringFromFunctionNames',
		value: function getPrototypeStringFromFunctionNames(functionList, opt) {
			return this.getPrototypesFromFunctionNames(functionList, opt).toString();
		}

		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name getString
   *
   * Get string for a particular function name
   *
   * @param {String} functionName - Function name to trace from. If null, it returns the WHOLE builder stack
   *
   * @returns {String} The string, of all the various functions. Trace optimized if functionName given
   *
   */

	}, {
		key: 'getString',
		value: function getString(functionName, opt) {
			if (opt === undefined) {
				opt = {};
			}

			if (functionName) {
				return this.getStringFromFunctionNames(this.traceFunctionCalls(functionName, [], opt).reverse(), opt);
			}
			return this.getStringFromFunctionNames(Object.keys(this.nodeMap), opt);
		}
	}]);

	return FunctionBuilderBase;
}();
},{}],7:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('../core/utils');
var acorn = require('acorn');

module.exports = function () {

	/**
  * @constructor FunctionNodeBase
  * 
  * @desc Represents a single function, inside JS, webGL, or openGL.
  * 
  * <p>This handles all the raw state, converted state, etc. Of a single function.</p>
  * 
  * @prop {String} functionName - Name of the function
  * @prop {Function} jsFunction - The JS Function the node represents
  * @prop {String} jsFunctionString - jsFunction.toString()
  * @prop {String[]} paramNames - Parameter names of the function
  * @prop {String[]} paramTypes - Shader land parameters type assumption
  * @prop {Boolean} isRootKernel - Special indicator, for kernel function
  * @prop {String} webglFunctionString - webgl converted function string
  * @prop {String} openglFunctionString - opengl converted function string
  * @prop {String[]} calledFunctions - List of all the functions called
  * @param {String} functionName - Function name to assume, if its null, it attempts to extract from the function
  * @param {Function|String} jsFunction - JS Function to do conversion
  * @param {Object} options
  *
  */
	function BaseFunctionNode(functionName, jsFunction, options) {
		_classCallCheck(this, BaseFunctionNode);

		this.calledFunctions = [];
		this.calledFunctionsArguments = {};
		this.builder = null;
		this.isRootKernel = false;
		this.isSubKernel = false;
		this.parent = null;
		this.debug = null;
		this.prototypeOnly = null;
		this.constants = null;
		this.output = null;
		this.declarations = {};
		this.states = [];
		this.fixIntegerDivisionAccuracy = null;

		var paramTypes = void 0;
		var returnType = void 0;
		if (options) {
			if (options.hasOwnProperty('debug')) {
				this.debug = options.debug;
			}
			if (options.hasOwnProperty('prototypeOnly')) {
				this.prototypeOnly = options.prototypeOnly;
			}
			if (options.hasOwnProperty('constants')) {
				this.constants = options.constants;
			}
			if (options.hasOwnProperty('output')) {
				this.output = options.output;
			}
			if (options.hasOwnProperty('loopMaxIterations')) {
				this.loopMaxIterations = options.loopMaxIterations;
			}
			if (options.hasOwnProperty('paramTypes')) {
				this.paramTypes = paramTypes = options.paramTypes;
			}
			if (options.hasOwnProperty('constantTypes')) {
				this.constantTypes = options.constantTypes;
			} else {
				this.constantTypes = {};
			}
			if (options.hasOwnProperty('returnType')) {
				returnType = options.returnType;
			}
			if (options.hasOwnProperty('fixIntegerDivisionAccuracy')) {
				this.fixIntegerDivisionAccuracy = options.fixIntegerDivisionAccuracy;
			}
		}

		//
		// Missing jsFunction object exception
		//
		if (!jsFunction) {
			throw 'jsFunction, parameter is missing';
		}

		//
		// Setup jsFunction and its string property + validate them
		//
		this.jsFunctionString = jsFunction.toString();
		if (!utils.isFunctionString(this.jsFunctionString)) {
			console.error('jsFunction, to string conversion check failed: not a function?', this.jsFunctionString);
			throw 'jsFunction, to string conversion check failed: not a function?';
		}

		if (!utils.isFunction(jsFunction)) {
			//throw 'jsFunction, is not a valid JS Function';
			this.jsFunction = null;
		} else {
			this.jsFunction = jsFunction;
		}

		//
		// Setup the function name property
		//
		this.functionName = functionName || jsFunction && jsFunction.name || utils.getFunctionNameFromString(this.jsFunctionString);

		if (!this.functionName) {
			throw 'jsFunction, missing name argument or value';
		}

		//
		// Extract parameter name, and its argument types
		//
		this.paramNames = utils.getParamNamesFromString(this.jsFunctionString);
		if (paramTypes) {
			if (Array.isArray(paramTypes)) {
				if (paramTypes.length !== this.paramNames.length) {
					throw 'Invalid argument type array length, against function length -> (' + paramTypes.length + ',' + this.paramNames.length + ')';
				}
				this.paramTypes = paramTypes;
			} else if ((typeof paramTypes === 'undefined' ? 'undefined' : _typeof(paramTypes)) === 'object') {
				var paramVariableNames = Object.keys(paramTypes);
				if (paramTypes.hasOwnProperty('returns')) {
					this.returnType = paramTypes.returns;
					paramVariableNames.splice(paramVariableNames.indexOf('returns'), 1);
				}
				if (paramVariableNames.length > 0 && paramVariableNames.length !== this.paramNames.length) {
					throw 'Invalid argument type array length, against function length -> (' + paramVariableNames.length + ',' + this.paramNames.length + ')';
				} else {
					this.paramTypes = this.paramNames.map(function (key) {
						if (paramTypes.hasOwnProperty(key)) {
							return paramTypes[key];
						} else {
							return 'Number';
						}
					});
				}
			}
		} else {
			this.paramTypes = [];
		}

		//
		// Return type handling
		//
		if (!this.returnType) {
			this.returnType = returnType || 'Number';
		}
	}

	_createClass(BaseFunctionNode, [{
		key: 'isIdentifierConstant',
		value: function isIdentifierConstant(paramName) {
			if (!this.constants) return false;
			return this.constants.hasOwnProperty(paramName);
		}
	}, {
		key: 'isInput',
		value: function isInput(paramName) {
			return this.paramTypes[this.paramNames.indexOf(paramName)] === 'Input';
		}
	}, {
		key: 'setBuilder',
		value: function setBuilder(builder) {
			this.builder = builder;
			return this;
		}
	}, {
		key: 'pushState',
		value: function pushState(state) {
			this.states.push(state);
		}
	}, {
		key: 'popState',
		value: function popState(state) {
			if (this.state !== state) {
				throw new Error('Cannot popState ' + state + ' when in ' + this.state);
			}
			this.states.pop();
		}
	}, {
		key: 'isState',
		value: function isState(state) {
			return this.state === state;
		}
	}, {
		key: 'getJsFunction',

		/**
   * 
   * Core Functions
   * 
   */

		/**
   * @memberOf FunctionNodeBase#
   * @function
   * @name getJSFunction
   *
   * @desc Gets and return the stored JS Function.
   * Note: that this internally eval the function, if only the string was provided on construction
   *
   * @returns {Function} The function object
   *
   */
		value: function getJsFunction() {
			if (this.jsFunction) {
				return this.jsFunction;
			}

			if (this.jsFunctionString) {
				this.jsFunction = eval(this.jsFunctionString);
				return this.jsFunction;
			}

			throw 'Missing jsFunction, and jsFunctionString parameter';
		}

		/**
   * @memberOf FunctionNodeBase#
   * @function
   * @name astMemberExpressionUnroll
   * @desc Parses the abstract syntax tree for binary expression.
   *
   * <p>Utility function for astCallExpression.</p>
   *
   * @param {Object} ast - the AST object to parse
   *
   * @returns {String} the function namespace call, unrolled
   */

	}, {
		key: 'astMemberExpressionUnroll',
		value: function astMemberExpressionUnroll(ast) {
			if (ast.type === 'Identifier') {
				return ast.name;
			} else if (ast.type === 'ThisExpression') {
				return 'this';
			}

			if (ast.type === 'MemberExpression') {
				if (ast.object && ast.property) {
					//babel sniffing
					if (ast.object.hasOwnProperty('name') && ast.object.name[0] === '_') {
						return this.astMemberExpressionUnroll(ast.property);
					}

					return this.astMemberExpressionUnroll(ast.object) + '.' + this.astMemberExpressionUnroll(ast.property);
				}
			}

			//babel sniffing
			if (ast.hasOwnProperty('expressions')) {
				var firstExpression = ast.expressions[0];
				if (firstExpression.type === 'Literal' && firstExpression.value === 0 && ast.expressions.length === 2) {
					return this.astMemberExpressionUnroll(ast.expressions[1]);
				}
			}

			// Failure, unknown expression
			throw this.astErrorOutput('Unknown CallExpression_unroll', ast);
		}

		/**
   * @memberOf FunctionNodeBase#
   * @function
   * @name getJsAST
   *
   * @desc Parses the class function JS, and returns its Abstract Syntax Tree object.
   *
   * This is used internally to convert to shader code
   *
   * @param {Object} [inParser] - Parser to use, assumes in scope 'parser' if null or undefined
   *
   * @returns {Object} The function AST Object, note that result is cached under this.jsFunctionAST;
   *
   */

	}, {
		key: 'getJsAST',
		value: function getJsAST(inParser) {
			if (this.jsFunctionAST) {
				return this.jsFunctionAST;
			}

			inParser = inParser || acorn;
			if (inParser === null) {
				throw 'Missing JS to AST parser';
			}

			var ast = inParser.parse('var ' + this.functionName + ' = ' + this.jsFunctionString + ';', {
				locations: true
			});
			if (ast === null) {
				throw 'Failed to parse JS code';
			}

			// take out the function object, outside the var declarations
			var funcAST = ast.body[0].declarations[0].init;
			this.jsFunctionAST = funcAST;

			return funcAST;
		}

		/**
   * @memberOf FunctionNodeBase#
   * @function
   * @name getFunctionString
   *
   * @desc Returns the converted webgl shader function equivalent of the JS function
   *
   * @returns {String} webgl function string, result is cached under this.webGlFunctionString
   *
   */

	}, {
		key: 'getFunctionString',
		value: function getFunctionString() {
			this.generate();
			return this.functionString;
		}

		/**
   * @memberOf FunctionNodeBase#
   * @function
   * @name setFunctionString
   *
   * @desc Set the functionString value, overwriting it
   *
   * @param {String} functionString - Shader code string, representing the function
   *
   */

	}, {
		key: 'setFunctionString',
		value: function setFunctionString(functionString) {
			this.functionString = functionString;
		}

		/**
   * @memberOf FunctionNodeBase#
   * @function
   * @name getParamType
   *
   * @desc Return the type of parameter sent to subKernel/Kernel.
   *
   * @param {String} paramName - Name of the parameter
   *
   * @returns {String} Type of the parameter
   *
   */

	}, {
		key: 'getParamType',
		value: function getParamType(paramName) {
			var paramIndex = this.paramNames.indexOf(paramName);
			if (paramIndex === -1) {
				if (this.declarations.hasOwnProperty(paramName)) {
					return this.declarations[paramName];
				} else {
					return 'Number';
				}
			} else {
				if (!this.parent) {
					if (this.paramTypes[paramIndex]) return this.paramTypes[paramIndex];
				} else {
					if (this.paramTypes[paramIndex]) return this.paramTypes[paramIndex];
					var calledFunctionArguments = this.parent.calledFunctionsArguments[this.functionName];
					for (var i = 0; i < calledFunctionArguments.length; i++) {
						var calledFunctionArgument = calledFunctionArguments[i];
						if (calledFunctionArgument[paramIndex] !== null) {
							return this.paramTypes[paramIndex] = calledFunctionArgument[paramIndex].type;
						}
					}
				}
			}
			return 'Number';
		}
	}, {
		key: 'getConstantType',
		value: function getConstantType(constantName) {
			if (this.constantTypes[constantName]) {
				return this.constantTypes[constantName];
			}
			return null;
		}

		/**
   * @memberOf FunctionNodeBase#
   * @function
   * @name getUserParamName
   *
   * @desc Return the name of the *user parameter*(subKernel parameter) corresponding 
   * to the parameter supplied to the kernel
   *
   * @param {String} paramName - Name of the parameter
   *
   * @returns {String} Name of the parameter
   *
   */

	}, {
		key: 'getUserParamName',
		value: function getUserParamName(paramName) {
			var paramIndex = this.paramNames.indexOf(paramName);
			if (paramIndex === -1) return null;
			if (!this.parent || !this.isSubKernel) return null;
			var calledFunctionArguments = this.parent.calledFunctionsArguments[this.functionName];
			for (var i = 0; i < calledFunctionArguments.length; i++) {
				var calledFunctionArgument = calledFunctionArguments[i];
				var param = calledFunctionArgument[paramIndex];
				if (param !== null && param.type !== 'Integer') {
					return param.name;
				}
			}
			return null;
		}
	}, {
		key: 'generate',
		value: function generate(options) {
			throw new Error('generate not defined on BaseFunctionNode');
		}

		/**
   * @memberOf FunctionNodeBase#
   * @function
   * @name astGeneric
   *
   * @desc Parses the abstract syntax tree for generically to its respective function
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the parsed string array
   */

	}, {
		key: 'astGeneric',
		value: function astGeneric(ast, retArr) {
			if (ast === null) {
				throw this.astErrorOutput('NULL ast', ast);
			} else {
				if (Array.isArray(ast)) {
					for (var i = 0; i < ast.length; i++) {
						this.astGeneric(ast[i], retArr);
					}
					return retArr;
				}

				switch (ast.type) {
					case 'FunctionDeclaration':
						return this.astFunctionDeclaration(ast, retArr);
					case 'FunctionExpression':
						return this.astFunctionExpression(ast, retArr);
					case 'ReturnStatement':
						return this.astReturnStatement(ast, retArr);
					case 'Literal':
						return this.astLiteral(ast, retArr);
					case 'BinaryExpression':
						return this.astBinaryExpression(ast, retArr);
					case 'Identifier':
						return this.astIdentifierExpression(ast, retArr);
					case 'AssignmentExpression':
						return this.astAssignmentExpression(ast, retArr);
					case 'ExpressionStatement':
						return this.astExpressionStatement(ast, retArr);
					case 'EmptyStatement':
						return this.astEmptyStatement(ast, retArr);
					case 'BlockStatement':
						return this.astBlockStatement(ast, retArr);
					case 'IfStatement':
						return this.astIfStatement(ast, retArr);
					case 'BreakStatement':
						return this.astBreakStatement(ast, retArr);
					case 'ContinueStatement':
						return this.astContinueStatement(ast, retArr);
					case 'ForStatement':
						return this.astForStatement(ast, retArr);
					case 'WhileStatement':
						return this.astWhileStatement(ast, retArr);
					case 'DoWhileStatement':
						return this.astDoWhileStatement(ast, retArr);
					case 'VariableDeclaration':
						return this.astVariableDeclaration(ast, retArr);
					case 'VariableDeclarator':
						return this.astVariableDeclarator(ast, retArr);
					case 'ThisExpression':
						return this.astThisExpression(ast, retArr);
					case 'SequenceExpression':
						return this.astSequenceExpression(ast, retArr);
					case 'UnaryExpression':
						return this.astUnaryExpression(ast, retArr);
					case 'UpdateExpression':
						return this.astUpdateExpression(ast, retArr);
					case 'LogicalExpression':
						return this.astLogicalExpression(ast, retArr);
					case 'MemberExpression':
						return this.astMemberExpression(ast, retArr);
					case 'CallExpression':
						return this.astCallExpression(ast, retArr);
					case 'ArrayExpression':
						return this.astArrayExpression(ast, retArr);
					case 'DebuggerStatement':
						return this.astDebuggerStatement(ast, retArr);
				}

				throw this.astErrorOutput('Unknown ast type : ' + ast.type, ast);
			}
		}
		/**
   * @function
   * @name astErrorOutput
   * @ignore
   * @desc To throw the AST error, with its location.
   *
   * @todo add location support fpr the AST error
   *
   * @param {Object} error - the error message output
   * @param {Object} ast - the AST object where the error is
   */

	}, {
		key: 'astErrorOutput',
		value: function astErrorOutput(error, ast) {
			console.error(utils.getAstString(this.jsFunctionString, ast));
			console.error(error, ast, this);
			return error;
		}
	}, {
		key: 'astDebuggerStatement',
		value: function astDebuggerStatement(arrNode, retArr) {
			return retArr;
		}
	}, {
		key: 'astFunctionDeclaration',
		value: function astFunctionDeclaration(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astFunctionExpression',
		value: function astFunctionExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astReturnStatement',
		value: function astReturnStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astLiteral',
		value: function astLiteral(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astBinaryExpression',
		value: function astBinaryExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astIdentifierExpression',
		value: function astIdentifierExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astAssignmentExpression',
		value: function astAssignmentExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astExpressionStatement',
		value: function astExpressionStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astEmptyStatement',
		value: function astEmptyStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astBlockStatement',
		value: function astBlockStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astIfStatement',
		value: function astIfStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astBreakStatement',
		value: function astBreakStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astContinueStatement',
		value: function astContinueStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astForStatement',
		value: function astForStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astWhileStatement',
		value: function astWhileStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astDoWhileStatement',
		value: function astDoWhileStatement(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astVariableDeclaration',
		value: function astVariableDeclaration(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astVariableDeclarator',
		value: function astVariableDeclarator(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astThisExpression',
		value: function astThisExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astSequenceExpression',
		value: function astSequenceExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astUnaryExpression',
		value: function astUnaryExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astUpdateExpression',
		value: function astUpdateExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astLogicalExpression',
		value: function astLogicalExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astMemberExpression',
		value: function astMemberExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astCallExpression',
		value: function astCallExpression(ast, retArr) {
			return retArr;
		}
	}, {
		key: 'astArrayExpression',
		value: function astArrayExpression(ast, retArr) {
			return retArr;
		}

		/**
   * @ignore
   * @function
   * @name pushParameter
   *
   * @desc [INTERNAL] pushes a fn parameter onto retArr and 'casts' to int if necessary
   *  i.e. deal with force-int-parameter state
   * 			
   * @param {Array} retArr - return array string
   * @param {String} parameter - the parameter name  
   *
   */

	}, {
		key: 'pushParameter',
		value: function pushParameter(retArr, parameter) {
			if (this.isState('in-get-call-parameters')) {
				retArr.push('int(' + parameter + ')');
			} else {
				retArr.push(parameter);
			}
		}
	}, {
		key: 'state',
		get: function get() {
			return this.states[this.states.length - 1];
		}
	}]);

	return BaseFunctionNode;
}();
},{"../core/utils":32,"acorn":33}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('../core/utils');
var Input = require('../core/input');

module.exports = function () {

	/**
  * @constructor KernelBase
  * 
  * @desc Implements the base class for Kernels, and is used as a 
  * parent class for all Kernel implementations.
  *
  * This contains the basic methods needed by all Kernel implementations, 
  * like setDimensions, addSubKernel, etc.
  * 
  * @prop {Array} paramNames - Name of the parameters of the kernel function
  * @prop {String} fnString - Kernel function as a String
  * @prop {Array} dimensions - Dimensions of the kernel function, this.thread.x, etc.
  * @prop {Boolean} debug - Toggle debug mode
  * @prop {String} graphical - Toggle graphical mode
  * @prop {number} loopMaxIterations - Maximum number of loop iterations
  * @prop {Object} constants - Global constants
  * @prop {Array} subKernels - Sub kernels bound to this kernel instance
  * @prop {Object} subKernelProperties - Sub kernels bound to this kernel instance as key/value pairs
  * @prop {Array} subKernelOutputVariableNames - Names of the variables outputted by the subkerls
  * @prop {Boolean} fixIntegerDivisionAccuracy - fix issues with some graphics cards not returning whole numbers when dividing by factors of 3
  *
  */
	function KernelBase(fnString, settings) {
		_classCallCheck(this, KernelBase);

		this.paramNames = utils.getParamNamesFromString(fnString);
		this.fnString = fnString;
		this.output = null;
		this.debug = false;
		this.graphical = false;
		this.loopMaxIterations = 0;
		this.constants = null;
		this.wraparound = null;
		this.hardcodeConstants = null;
		this.outputToTexture = null;
		this.outputImmutable = null;
		this.texSize = null;
		this._canvas = null;
		this._webGl = null;
		this.threadDim = null;
		this.floatTextures = null;
		this.floatOutput = null;
		this.floatOutputForce = null;
		this.addFunction = null;
		this.functions = null;
		this.nativeFunctions = null;
		this.subKernels = null;
		this.subKernelProperties = null;
		this.subKernelNames = null;
		this.subKernelOutputVariableNames = null;
		this.functionBuilder = null;
		this.paramTypes = null;
		this.paramSizes = null;
		this.constantTypes = null;
		this.fixIntegerDivisionAccuracy = null;

		for (var p in settings) {
			if (!settings.hasOwnProperty(p) || !this.hasOwnProperty(p)) continue;
			this[p] = settings[p];
		}
		if (settings.hasOwnProperty('canvas')) {
			this._canvas = settings.canvas;
		}
		if (settings.hasOwnProperty('webGl')) {
			this._webGl = settings.webGl;
		}
		if (settings.hasOwnProperty('output')) {
			this.setOutput(settings.output); // Flatten output object
		}

		if (!this._canvas) this._canvas = utils.initCanvas();
	}

	_createClass(KernelBase, [{
		key: 'build',
		value: function build() {
			throw new Error('"build" not defined on Base');
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setupParams
   *
   * @desc Setup the parameter types for the parameters
   * supplied to the Kernel function
   *
   * @param {IArguments} args - The actual parameters sent to the Kernel
   *
   */

	}, {
		key: 'setupParams',
		value: function setupParams(args) {
			this.paramTypes = [];
			this.paramSizes = [];
			for (var i = 0; i < args.length; i++) {
				var arg = args[i];

				this.paramTypes.push(utils.getArgumentType(arg));
				this.paramSizes.push(arg.constructor === Input ? arg.size : null);
			}
		}
	}, {
		key: 'setupConstants',
		value: function setupConstants() {
			this.constantTypes = {};
			if (this.constants) {
				for (var p in this.constants) {
					this.constantTypes[p] = utils.getArgumentType(this.constants[p]);
				}
			}
		}
	}, {
		key: 'setFunctions',
		value: function setFunctions(functions) {
			this.functions = functions;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setOutput
   *
   * @desc Set dimensions of the kernel function
   *
   * @param {Array|Object} output - The output array to set the kernel output size to
   *
   */

	}, {
		key: 'setOutput',
		value: function setOutput(output) {
			if (output.hasOwnProperty('x')) {
				if (output.hasOwnProperty('y')) {
					if (output.hasOwnProperty('z')) {
						this.output = [output.x, output.y, output.z];
					} else {
						this.output = [output.x, output.y];
					}
				} else {
					this.output = [output.x];
				}
			} else {
				this.output = output;
			}
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setDebug
   *
   * @desc Toggle debug mode
   *
   * @param {Boolean} flag - true to enable debug
   *
   */

	}, {
		key: 'setDebug',
		value: function setDebug(flag) {
			this.debug = flag;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setGraphical
   *
   * @desc Toggle graphical output mode
   *
   * @param {Boolean} flag - true to enable graphical output
   *
   */

	}, {
		key: 'setGraphical',
		value: function setGraphical(flag) {
			this.graphical = flag;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setLoopMaxIterations
   *
   * @desc Set the maximum number of loop iterations
   *
   * @param {number} max - iterations count
   *
   */

	}, {
		key: 'setLoopMaxIterations',
		value: function setLoopMaxIterations(max) {
			this.loopMaxIterations = max;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setFixIntegerDivisionAccuracy
   *
   * @desc Fix division by factor of 3 FP accuracy bug
   *
   * @param {Boolean} fix - should fix 
   *
   */

	}, {
		key: 'setFixIntegerDivisionAccuracy',
		value: function setFixIntegerDivisionAccuracy(fix) {
			this.fixIntegerDivisionAccuracy = fix;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setConstants
   * @desc Set Constants
   */

	}, {
		key: 'setConstants',
		value: function setConstants(constants) {
			this.constants = constants;
			return this;
		}
	}, {
		key: 'setWraparound',
		value: function setWraparound(flag) {
			console.warn('Wraparound mode is not supported and undocumented.');
			this.wraparound = flag;
			return this;
		}
	}, {
		key: 'setHardcodeConstants',
		value: function setHardcodeConstants(flag) {
			this.hardcodeConstants = flag;
			return this;
		}
	}, {
		key: 'setOutputToTexture',
		value: function setOutputToTexture(flag) {
			this.outputToTexture = flag;
			return this;
		}
	}, {
		key: 'setOutputImmutable',
		value: function setOutputImmutable(flag) {
			this.outputImmutable = flag;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setFloatTextures
   *
   * @desc Toggle texture output mode
   *
   * @param {Boolean} flag - true to enable floatTextures
   *
   */

	}, {
		key: 'setFloatTextures',
		value: function setFloatTextures(flag) {
			this.floatTextures = flag;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setFloatOutput
   *
   * @desc Toggle output mode
   *
   * @param {Boolean} flag - true to enable float
   *
   */

	}, {
		key: 'setFloatOutput',
		value: function setFloatOutput(flag) {
			this.floatOutput = flag;
			return this;
		}
	}, {
		key: 'setFloatOutputForce',
		value: function setFloatOutputForce(flag) {
			this.floatOutputForce = flag;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setCanvas
   *
   * @desc Bind the canvas to kernel
   * 
   * @param {Canvas} canvas - Canvas to bind
   *
   */

	}, {
		key: 'setCanvas',
		value: function setCanvas(canvas) {
			this._canvas = canvas;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name setCanvas
   *
   * @desc Bind the webGL instance to kernel
   * 
   * @param {Canvas} webGL - webGL instance to bind
   *
   */

	}, {
		key: 'setWebGl',
		value: function setWebGl(webGl) {
			this._webGl = webGl;
			return this;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name getCanvas()
   *
   * @desc Returns the current canvas instance bound to the kernel
   *
   */

	}, {
		key: 'getCanvas',
		value: function getCanvas() {
			return this._canvas;
		}

		/**
   * @memberOf KernelBase#
   * @function
   * @name getWebGl()
   *
   * @desc Returns the current webGl instance bound to the kernel
   *
   */

	}, {
		key: 'getWebGl',
		value: function getWebGl() {
			return this._webGl;
		}
	}, {
		key: 'validateOptions',
		value: function validateOptions() {
			throw new Error('validateOptions not defined');
		}
	}, {
		key: 'exec',
		value: function exec() {
			return this.execute.apply(this, arguments);
		}
	}, {
		key: 'execute',
		value: function execute() {
			var _this = this;

			//
			// Prepare the required objects
			//
			var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);

			//
			// Setup and return the promise, and execute the function, in synchronous mode
			//
			return utils.newPromise(function (accept, reject) {
				try {
					accept(_this.run.apply(_this, args));
				} catch (e) {
					//
					// Error : throw rejection
					//
					reject(e);
				}
			});
		}

		/** 
   * @memberOf KernelBase#
   * @function
   * @name addSubKernel
   *
   * @desc Add a sub kernel to the root kernel instance.
   * This is what `createKernelMap` uses.
   *
   * @param {String} fnString - function (as a String) of the subKernel to add
   *
   */

	}, {
		key: 'addSubKernel',
		value: function addSubKernel(fnString) {
			if (this.subKernels === null) {
				this.subKernels = [];
				this.subKernelNames = [];
			}
			this.subKernels.push(fnString);
			this.subKernelNames.push(utils.getFunctionNameFromString(fnString));
			return this;
		}

		/** 
   * @memberOf KernelBase#
   * @function
   * @name addSubKernelProperty
   *
   * @desc Add a sub kernel to the root kernel instance, indexed by a property name
   * This is what `createKernelMap` uses.
   *
   * @param {String} property - property key for the subKernel
   * @param {String} fnString - function (as a String) of the subKernel to add
   *
   */

	}, {
		key: 'addSubKernelProperty',
		value: function addSubKernelProperty(property, fnString) {
			if (this.subKernelProperties === null) {
				this.subKernelProperties = {};
				this.subKernelNames = [];
			}
			if (this.subKernelProperties.hasOwnProperty(property)) {
				throw new Error('cannot add sub kernel ' + property + ', already defined');
			}
			this.subKernelProperties[property] = fnString;
			this.subKernelNames.push(utils.getFunctionNameFromString(fnString));
			return this;
		}
	}, {
		key: 'addNativeFunction',
		value: function addNativeFunction(name, source) {
			this.functionBuilder.addNativeFunction(name, source);
		}

		/**
   *
   * Destroys all memory associated with this kernel
   *
   * @name destroy
   * @function
   * @memberOf KernelBase#
   *
   * * @param {Boolean} removeCanvasReferences remve any associated canvas references?
   *
   */

	}, {
		key: 'destroy',
		value: function destroy() {}
	}]);

	return KernelBase;
}();
},{"../core/input":29,"../core/utils":32}],9:[function(require,module,exports){
'use strict';

var utils = require('../core/utils');

module.exports = function kernelRunShortcut(kernel) {
	var shortcut = function shortcut() {
		return kernel.run.apply(kernel, arguments);
	};

	utils.allPropertiesOf(kernel).forEach(function (key) {
		if (key[0] === '_' && key[1] === '_') return;
		if (typeof kernel[key] === 'function') {
			if (key.substring(0, 3) === 'add' || key.substring(0, 3) === 'set') {
				shortcut[key] = function () {
					kernel[key].apply(kernel, arguments);
					return shortcut;
				};
			} else {
				shortcut[key] = kernel[key].bind(kernel);
			}
		} else {
			shortcut.__defineGetter__(key, function () {
				return kernel[key];
			});
			shortcut.__defineSetter__(key, function (value) {
				kernel[key] = value;
			});
		}
	});

	shortcut.kernel = kernel;

	return shortcut;
};
},{"../core/utils":32}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('../core/utils');
var kernelRunShortcut = require('./kernel-run-shortcut');

module.exports = function () {

	/**
  * @constructor BaseRunner
  *
  * @desc Represents the 'private/protected' namespace of the GPU class
  *
  * <p>I know @private makes more sense, but since the documentation engine state is undetirmined.
  * (See https://github.com/gpujs/gpu.js/issues/19 regarding documentation engine issue)
  * File isolation is currently the best way to go. </p>
  *
  * *base.js* internal functions namespace <br>
  * *gpu.js* PUBLIC function namespace <br>
  *
  * @prop {Object} settings - Settings object used to set Dimensions, etc.
  * @prop {String} kernel - Current kernel instance
  * @prop {Object} canvas - Canvas instance attached to the kernel
  * @prop {Object} webGl - WebGl instance attached to the kernel
  * @prop {Function} fn - Kernel function to run
  * @prop {Object} functionBuilder - FunctionBuilder instance
  * @prop {String} fnString - Kernel function (as a String)
  * @prop {String} endianness - endian information like Little-endian, Big-endian.
  *
  */

	function BaseRunner(functionBuilder, settings) {
		_classCallCheck(this, BaseRunner);

		settings = settings || {};
		this.kernel = settings.kernel;
		this.canvas = settings.canvas;
		this.webGl = settings.webGl;
		this.fn = null;
		this.functionBuilder = functionBuilder;
		this.fnString = null;
		this.endianness = utils.systemEndianness();
	}

	/**
  * @memberOf BaseRunner#
  * @function
  * @name textureToArray
  *
  * @desc Converts the provided Texture instance to a JavaScript Array
  *
  * @param {Object} texture - Texture Object
  *
  */


	_createClass(BaseRunner, [{
		key: 'textureToArray',
		value: function textureToArray(texture) {
			var copy = this.createKernel(function (x) {
				return x[this.thread.z][this.thread.y][this.thread.x];
			});

			return copy(texture);
		}

		/**
   * @memberOf BaseRunner#
   * @function
   *
   * @name deleteTexture
   *
   * @desc Deletes the provided Texture instance
   *
   * @param {Object} texture - Texture Object
   */

	}, {
		key: 'deleteTexture',
		value: function deleteTexture(texture) {
			this.webGl.deleteTexture(texture.texture);
		}

		/**
   * @memberOf BaseRunner#
   * @function
   * @name buildPromiseKernel
   *
   * @desc Get and returns the ASYNCHRONOUS executor, of a class and kernel
   * This returns a Promise object from an argument set.
   *
   * Note that there is no current implementation.
   *
   */

	}, {
		key: 'buildPromiseKernel',
		value: function buildPromiseKernel() {
			throw new Error('not yet implemented');
		}
	}, {
		key: 'getMode',
		value: function getMode() {
			throw new Error('"mode" not implemented on BaseRunner');
		}

		/**
   * @memberOf BaseRunner#
   * @function
   *
   * @name buildKernel
   *
   * @desc Get and returns the Synchronous executor, of a class and kernel
   * Which returns the result directly after passing the arguments.
   *
   */

	}, {
		key: 'buildKernel',
		value: function buildKernel(fn, settings) {
			settings = Object.assign({}, settings || {});
			var fnString = fn.toString();
			if (!settings.functionBuilder) {
				settings.functionBuilder = this.functionBuilder;
			}

			if (!settings.canvas) {
				settings.canvas = this.canvas;
			}

			if (!settings.webGl) {
				settings.webGl = this.webgl;
			}

			return kernelRunShortcut(new this.Kernel(fnString, settings));
		}
	}]);

	return BaseRunner;
}();
},{"../core/utils":32,"./kernel-run-shortcut":9}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FunctionBuilderBase = require('../function-builder-base');
var WebGLFunctionNode = require('./function-node');

/**
 * @class WebGLFunctionBuilder
 *
 * @extends FunctionBuilderBase
 *
 * @desc Builds webGl functions (shaders) from JavaScript function Strings
 *
 */
module.exports = function (_FunctionBuilderBase) {
	_inherits(WebGLFunctionBuilder, _FunctionBuilderBase);

	function WebGLFunctionBuilder() {
		_classCallCheck(this, WebGLFunctionBuilder);

		var _this = _possibleConstructorReturn(this, (WebGLFunctionBuilder.__proto__ || Object.getPrototypeOf(WebGLFunctionBuilder)).call(this));

		_this.Node = WebGLFunctionNode;
		return _this;
	}

	//---------------------------------------------------------
	//
	//  Polyfill stuff
	//
	//---------------------------------------------------------

	// Round function used in polyfill


	_createClass(WebGLFunctionBuilder, [{
		key: 'polyfillStandardFunctions',


		/**
   * @memberOf FunctionBuilderBase#
   * @function
   * @name polyfillStandardFunctions
   *
   * @desc Polyfill in the missing Math functions (round)
   *
   */
		value: function polyfillStandardFunctions() {
			this.addFunction('round', _round);
		}
	}], [{
		key: 'round',
		value: function round(a) {
			return _round(a);
		}
	}]);

	return WebGLFunctionBuilder;
}(FunctionBuilderBase);

function _round(a) {
	return Math.floor(a + 0.5);
}
},{"../function-builder-base":6,"./function-node":12}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FunctionNodeBase = require('../function-node-base');
var utils = require('../../core/utils');
// Closure capture for the ast function, prevent collision with existing AST functions
// The prefixes to use
var jsMathPrefix = 'Math.';
var localPrefix = 'this.';
var constantsPrefix = 'this.constants.';

var DECODE32_ENCODE32 = /decode32\(\s+encode32\(/g;
var ENCODE32_DECODE32 = /encode32\(\s+decode32\(/g;

// these debugs were hugely usefull...
// TODO: optimise out - webpack/babel options? maybe some generic logging support in core/utils?
// const debugLog = console.log
var debugLog = function debugLog() {};
/**
 * @class WebGLFunctionNode
 *
 * @desc [INTERNAL] Takes in a function node, and does all the AST voodoo required to generate its respective webGL code.
 *
 * @extends FunctionNodeBase
 *
 * @param {functionNode} inNode - The function node object
 *
 * @returns the converted webGL function string
 *
 */
module.exports = function (_FunctionNodeBase) {
	_inherits(WebGLFunctionNode, _FunctionNodeBase);

	function WebGLFunctionNode() {
		_classCallCheck(this, WebGLFunctionNode);

		return _possibleConstructorReturn(this, (WebGLFunctionNode.__proto__ || Object.getPrototypeOf(WebGLFunctionNode)).apply(this, arguments));
	}

	_createClass(WebGLFunctionNode, [{
		key: 'generate',
		value: function generate() {
			if (this.debug) {
				debugLog(this);
			}
			if (this.prototypeOnly) {
				return this.astFunctionPrototype(this.getJsAST(), []).join('').trim();
			} else {
				this.functionStringArray = this.astGeneric(this.getJsAST(), []);
			}
			this.functionString = webGlRegexOptimize(this.functionStringArray.join('').trim());
			return this.functionString;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astFunctionDeclaration
   *
   * @desc Parses the abstract syntax tree for to its *named function declaration*
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astFunctionDeclaration',
		value: function astFunctionDeclaration(ast, retArr) {
			this.builder.addFunction(null, utils.getAstString(this.jsFunctionString, ast));
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astFunctionPrototype
   * @static
   *
   * @desc Parses the abstract syntax tree for to its *named function prototype*
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astFunctionPrototype',
		value: function astFunctionPrototype(ast, retArr) {
			// Setup function return type and name
			if (this.isRootKernel || this.isSubKernel) {
				return retArr;
			}

			var returnType = this.returnType;
			var type = typeMap[returnType];
			if (!type) {
				throw new Error('unknown type ' + returnType);
			}
			retArr.push(type);
			retArr.push(' ');
			retArr.push(this.functionName);
			retArr.push('(');

			// Arguments handling
			for (var i = 0; i < this.paramNames.length; ++i) {
				if (i > 0) {
					retArr.push(', ');
				}

				retArr.push(this.paramTypes[i]);
				retArr.push(' ');
				retArr.push('user_');
				retArr.push(this.paramNames[i]);
			}

			retArr.push(');\n');

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astFunctionExpression
   *
   * @desc Parses the abstract syntax tree for to its *named function*
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astFunctionExpression',
		value: function astFunctionExpression(ast, retArr) {

			// Setup function return type and name
			if (this.isRootKernel) {
				retArr.push('void');
			} else {
				var returnType = this.returnType;
				var type = typeMap[returnType];
				if (!type) {
					throw new Error('unknown type ' + returnType);
				}
				retArr.push(type);
			}
			retArr.push(' ');
			retArr.push(this.functionName);
			retArr.push('(');

			if (!this.isRootKernel) {
				// Arguments handling
				for (var i = 0; i < this.paramNames.length; ++i) {
					var paramName = this.paramNames[i];

					if (i > 0) {
						retArr.push(', ');
					}
					var paramType = this.getParamType(paramName);
					var _type = typeMap[paramType];
					if (!_type) {
						throw new Error('unknown type ' + paramType);
					}
					retArr.push(_type);
					retArr.push(' ');
					retArr.push('user_');
					retArr.push(paramName);
				}
			}

			// Function opening
			retArr.push(') {\n');

			// Body statement iteration
			for (var _i = 0; _i < ast.body.body.length; ++_i) {
				this.astGeneric(ast.body.body[_i], retArr);
				retArr.push('\n');
			}

			// Function closing
			retArr.push('}\n');
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astReturnStatement
   *
   * @desc Parses the abstract syntax tree for to *return* statement
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astReturnStatement',
		value: function astReturnStatement(ast, retArr) {
			if (this.isRootKernel) {
				retArr.push('kernelResult = ');
				this.astGeneric(ast.argument, retArr);
				retArr.push(';');
				retArr.push('return;');
			} else if (this.isSubKernel) {
				retArr.push(this.functionName + 'Result = ');
				this.astGeneric(ast.argument, retArr);
				retArr.push(';');
				retArr.push('return ' + this.functionName + 'Result;');
			} else {
				retArr.push('return ');
				this.astGeneric(ast.argument, retArr);
				retArr.push(';');
			}

			//throw this.astErrorOutput(
			//	'Non main function return, is not supported : '+this.currentFunctionNamespace,
			//	ast
			//);

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astLiteral
   *
   * @desc Parses the abstract syntax tree for *literal value*
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astLiteral',
		value: function astLiteral(ast, retArr) {

			// Reject non numeric literals
			if (isNaN(ast.value)) {
				throw this.astErrorOutput('Non-numeric literal not supported : ' + ast.value, ast);
			}

			// Push the literal value as a float/int
			retArr.push(ast.value);

			var inGetParams = this.isState('in-get-call-parameters');
			// If it was an int, node made a float if necessary
			if (Number.isInteger(ast.value)) {
				if (!inGetParams) {
					retArr.push('.0');
				}
			} else if (inGetParams) {
				// or cast to an int as we are addressing an input array
				retArr.pop();
				retArr.push('int(');
				retArr.push(ast.value);
				retArr.push(')');
			}

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astBinaryExpression
   *
   * @desc Parses the abstract syntax tree for *binary* expression
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astBinaryExpression',
		value: function astBinaryExpression(ast, retArr) {
			var inGetParams = this.isState('in-get-call-parameters');
			if (inGetParams) {
				this.pushState('not-in-get-call-parameters');
				retArr.push('int');
			}
			retArr.push('(');

			if (ast.operator === '%') {
				retArr.push('mod(');
				this.astGeneric(ast.left, retArr);
				retArr.push(',');
				this.astGeneric(ast.right, retArr);
				retArr.push(')');
			} else if (ast.operator === '===') {
				this.astGeneric(ast.left, retArr);
				retArr.push('==');
				this.astGeneric(ast.right, retArr);
			} else if (ast.operator === '!==') {
				this.astGeneric(ast.left, retArr);
				retArr.push('!=');
				this.astGeneric(ast.right, retArr);
			} else if (this.fixIntegerDivisionAccuracy && ast.operator === '/') {
				retArr.push('div_with_int_check(');
				this.astGeneric(ast.left, retArr);
				retArr.push(', ');
				this.astGeneric(ast.right, retArr);
				retArr.push(')');
			} else {
				this.astGeneric(ast.left, retArr);
				retArr.push(ast.operator);
				this.astGeneric(ast.right, retArr);
			}

			retArr.push(')');

			if (inGetParams) {
				this.popState('not-in-get-call-parameters');
			}

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astIdentifierExpression
   *
   * @desc Parses the abstract syntax tree for *identifier* expression
   *
   * @param {Object} idtNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astIdentifierExpression',
		value: function astIdentifierExpression(idtNode, retArr) {
			if (idtNode.type !== 'Identifier') {
				throw this.astErrorOutput('IdentifierExpression - not an Identifier', idtNode);
			}
			// do we need to cast addressing vales to float?
			var castFloat = !this.isState('in-get-call-parameters');

			switch (idtNode.name) {
				case 'gpu_threadX':
					castFloat && retArr.push('float(');
					retArr.push('threadId.x');
					castFloat && retArr.push(')');
					break;
				case 'gpu_threadY':
					castFloat && retArr.push('float(');
					retArr.push('threadId.y');
					castFloat && retArr.push(')');
					break;
				case 'gpu_threadZ':
					castFloat && retArr.push('float(');
					retArr.push('threadId.z');
					castFloat && retArr.push(')');
					break;
				case 'gpu_outputX':
					retArr.push('uOutputDim.x');
					break;
				case 'gpu_outputY':
					retArr.push('uOutputDim.y');
					break;
				case 'gpu_outputZ':
					retArr.push('uOutputDim.z');
					break;
				case 'Infinity':
					// https://stackoverflow.com/a/47543127/1324039
					retArr.push('3.402823466e+38');
					break;
				default:
					var userParamName = this.getUserParamName(idtNode.name);
					if (userParamName !== null) {
						this.pushParameter(retArr, 'user_' + userParamName);
					} else {
						this.pushParameter(retArr, 'user_' + idtNode.name);
					}
			}

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astForStatement
   *
   * @desc Parses the abstract syntax tree forfor *for-loop* expression
   *
   * @param {Object} forNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the parsed webgl string
   */

	}, {
		key: 'astForStatement',
		value: function astForStatement(forNode, retArr) {
			if (forNode.type !== 'ForStatement') {
				throw this.astErrorOutput('Invalid for statment', forNode);
			}

			if (forNode.test && forNode.test.type === 'BinaryExpression') {
				if (forNode.test.right.type === 'Identifier' && forNode.test.operator === '<' && this.isIdentifierConstant(forNode.test.right.name) === false) {

					if (!this.loopMaxIterations) {
						console.warn('Warning: loopMaxIterations is not set! Using default of 1000 which may result in unintended behavior.');
						console.warn('Set loopMaxIterations or use a for loop of fixed length to silence this message.');
					}

					retArr.push('for (');
					this.astGeneric(forNode.init, retArr);
					this.astGeneric(forNode.test.left, retArr);
					retArr.push(forNode.test.operator);
					retArr.push('LOOP_MAX');
					retArr.push(';');
					this.astGeneric(forNode.update, retArr);
					retArr.push(')');

					retArr.push('{\n');
					retArr.push('if (');
					this.astGeneric(forNode.test.left, retArr);
					retArr.push(forNode.test.operator);
					this.astGeneric(forNode.test.right, retArr);
					retArr.push(') {\n');
					if (forNode.body.type === 'BlockStatement') {
						for (var i = 0; i < forNode.body.body.length; i++) {
							this.astGeneric(forNode.body.body[i], retArr);
						}
					} else {
						this.astGeneric(forNode.body, retArr);
					}
					retArr.push('\n} else {\n');
					retArr.push('break;\n');
					retArr.push('}\n');
					retArr.push('}\n');

					return retArr;
				} else {
					var declarations = JSON.parse(JSON.stringify(forNode.init.declarations));
					var updateArgument = forNode.update.argument;
					if (!Array.isArray(declarations) || declarations.length < 1) {
						debugLog(this.jsFunctionString);
						throw new Error('Error: Incompatible for loop declaration');
					}

					if (declarations.length > 1) {
						var initArgument = null;
						for (var _i2 = 0; _i2 < declarations.length; _i2++) {
							var declaration = declarations[_i2];
							if (declaration.id.name === updateArgument.name) {
								initArgument = declaration;
								declarations.splice(_i2, 1);
							} else {
								retArr.push('float ');
								this.astGeneric(declaration, retArr);
								retArr.push(';');
							}
						}

						retArr.push('for (float ');
						this.astGeneric(initArgument, retArr);
						retArr.push(';');
					} else {
						retArr.push('for (');
						this.astGeneric(forNode.init, retArr);
					}

					this.astGeneric(forNode.test, retArr);
					retArr.push(';');
					this.astGeneric(forNode.update, retArr);
					retArr.push(')');
					this.astGeneric(forNode.body, retArr);
					return retArr;
				}
			}

			throw this.astErrorOutput('Invalid for statement', forNode);
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astWhileStatement
   *
   * @desc Parses the abstract syntax tree for *while* loop
   *
   *
   * @param {Object} whileNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the parsed webgl string
   */

	}, {
		key: 'astWhileStatement',
		value: function astWhileStatement(whileNode, retArr) {
			if (whileNode.type !== 'WhileStatement') {
				throw this.astErrorOutput('Invalid while statment', whileNode);
			}

			retArr.push('for (float i = 0.0; i < LOOP_MAX; i++) {');
			retArr.push('if (');
			this.astGeneric(whileNode.test, retArr);
			retArr.push(') {\n');
			this.astGeneric(whileNode.body, retArr);
			retArr.push('} else {\n');
			retArr.push('break;\n');
			retArr.push('}\n');
			retArr.push('}\n');

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astWhileStatement
   *
   * @desc Parses the abstract syntax tree for *do while* loop
   *
   *
   * @param {Object} doWhileNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the parsed webgl string
   */

	}, {
		key: 'astDoWhileStatement',
		value: function astDoWhileStatement(doWhileNode, retArr) {
			if (doWhileNode.type !== 'DoWhileStatement') {
				throw this.astErrorOutput('Invalid while statment', doWhileNode);
			}

			retArr.push('for (float i = 0.0; i < LOOP_MAX; i++) {');
			this.astGeneric(doWhileNode.body, retArr);
			retArr.push('if (!');
			this.astGeneric(doWhileNode.test, retArr);
			retArr.push(') {\n');
			retArr.push('break;\n');
			retArr.push('}\n');
			retArr.push('}\n');

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astAssignmentExpression
   *
   * @desc Parses the abstract syntax tree for *Assignment* Expression
   *
   * @param {Object} assNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astAssignmentExpression',
		value: function astAssignmentExpression(assNode, retArr) {
			if (assNode.operator === '%=') {
				this.astGeneric(assNode.left, retArr);
				retArr.push('=');
				retArr.push('mod(');
				this.astGeneric(assNode.left, retArr);
				retArr.push(',');
				this.astGeneric(assNode.right, retArr);
				retArr.push(')');
			} else {
				this.astGeneric(assNode.left, retArr);
				retArr.push(assNode.operator);
				this.astGeneric(assNode.right, retArr);
				return retArr;
			}
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astEmptyStatement
   *
   * @desc Parses the abstract syntax tree for an *Empty* Statement
   *
   * @param {Object} eNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astEmptyStatement',
		value: function astEmptyStatement(eNode, retArr) {
			//retArr.push(';\n');
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astBlockStatement
   *
   * @desc Parses the abstract syntax tree for *Block* statement
   *
   * @param {Object} bNode - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astBlockStatement',
		value: function astBlockStatement(bNode, retArr) {
			retArr.push('{\n');
			for (var i = 0; i < bNode.body.length; i++) {
				this.astGeneric(bNode.body[i], retArr);
			}
			retArr.push('}\n');
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astExpressionStatement
   *
   * @desc Parses the abstract syntax tree for *generic expression* statement
   *
   * @param {Object} esNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astExpressionStatement',
		value: function astExpressionStatement(esNode, retArr) {
			this.astGeneric(esNode.expression, retArr);
			retArr.push(';');
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astVariableDeclaration
   *
   * @desc Parses the abstract syntax tree for *Variable Declaration*
   *
   * @param {Object} vardecNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astVariableDeclaration',
		value: function astVariableDeclaration(vardecNode, retArr) {
			for (var i = 0; i < vardecNode.declarations.length; i++) {
				var declaration = vardecNode.declarations[i];
				if (i > 0) {
					retArr.push(',');
				}
				var retDeclaration = [];
				this.astGeneric(declaration, retDeclaration);
				var declarationType = 'Number';
				if (i === 0) {
					var init = declaration.init;
					if (init) {
						if (init.object) {
							if (init.object.type === 'MemberExpression' && init.object.object) {
								// this.thread.x, this.thread.y, this.thread.z
								if (init.object.object.type === 'ThisExpression' && init.object.property && (init.object.property.name === 'thread' || init.object.property.name === 'output')) {
									declarationType = 'Integer';
								}
								// param[]
								else if (init.object.object.type === 'Identifier') {
										var _type2 = this.getParamType(init.object.object.name);
										declarationType = typeLookupMap[_type2];
									}
									// param[][]
									else if (init.object.object.object && init.object.object.object.type === 'Identifier') {
											var _type3 = this.getParamType(init.object.object.object.name);
											declarationType = typeLookupMap[_type3];
										}
										// this.constants.param[]
										else if (init.object.object.object && init.object.object.object.object && init.object.object.object.object.type === 'ThisExpression' && init.object.object.object.property.name === 'constants') {
												var _type4 = this.getConstantType(init.object.object.property.name);
												declarationType = typeLookupMap[_type4];
											}
											// this.constants.param[][]
											else if (init.object.object.object && init.object.object.object.object && init.object.object.object.object.object && init.object.object.object.object.object.type === 'ThisExpression' && init.object.object.object.object.property.name === 'constants') {
													var _type5 = this.getConstantType(init.object.object.object.property.name);
													declarationType = typeLookupMap[_type5];
												}
							}
							if (!declarationType) {
								throw new Error('unknown lookup type ' + typeLookupMap);
							}
						} else {
							if (init.name && this.declarations[init.name]) {
								declarationType = this.declarations[init.name];
							} else if (init.type === 'ArrayExpression') {
								declarationType = 'Array(' + init.elements.length + ')';
							} else if (init.type === 'CallExpression') {
								var node = this.builder.nodeMap[init.callee.name];
								if (node && node.returnType) {
									declarationType = node.returnType;
								}
							}
						}
					}
					var type = typeMap[declarationType];
					if (!type) {
						throw new Error('type ' + declarationType + ' not handled');
					}
					retArr.push(type + ' ');
				}
				this.declarations[declaration.id.name] = declarationType;
				retArr.push.apply(retArr, retDeclaration);
			}
			retArr.push(';');
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astVariableDeclarator
   *
   * @desc Parses the abstract syntax tree for *Variable Declarator*
   *
   * @param {Object} ivardecNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astVariableDeclarator',
		value: function astVariableDeclarator(ivardecNode, retArr) {
			this.astGeneric(ivardecNode.id, retArr);
			if (ivardecNode.init !== null) {
				retArr.push('=');
				this.astGeneric(ivardecNode.init, retArr);
			}
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astIfStatement
   *
   * @desc Parses the abstract syntax tree for *If* Statement
   *
   * @param {Object} ifNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astIfStatement',
		value: function astIfStatement(ifNode, retArr) {
			retArr.push('if (');
			this.astGeneric(ifNode.test, retArr);
			retArr.push(')');
			if (ifNode.consequent.type === 'BlockStatement') {
				this.astGeneric(ifNode.consequent, retArr);
			} else {
				retArr.push(' {\n');
				this.astGeneric(ifNode.consequent, retArr);
				retArr.push('\n}\n');
			}

			if (ifNode.alternate) {
				retArr.push('else ');
				if (ifNode.alternate.type === 'BlockStatement') {
					this.astGeneric(ifNode.alternate, retArr);
				} else {
					retArr.push(' {\n');
					this.astGeneric(ifNode.alternate, retArr);
					retArr.push('\n}\n');
				}
			}
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astBreakStatement
   *
   * @desc Parses the abstract syntax tree for *Break* Statement
   *
   * @param {Object} brNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astBreakStatement',
		value: function astBreakStatement(brNode, retArr) {
			retArr.push('break;\n');
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astContinueStatement
   *
   * @desc Parses the abstract syntax tree for *Continue* Statement
   *
   * @param {Object} crNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astContinueStatement',
		value: function astContinueStatement(crNode, retArr) {
			retArr.push('continue;\n');
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astLogicalExpression
   *
   * @desc Parses the abstract syntax tree for *Logical* Expression
   *
   * @param {Object} logNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astLogicalExpression',
		value: function astLogicalExpression(logNode, retArr) {
			retArr.push('(');
			this.astGeneric(logNode.left, retArr);
			retArr.push(logNode.operator);
			this.astGeneric(logNode.right, retArr);
			retArr.push(')');
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astUpdateExpression
   *
   * @desc Parses the abstract syntax tree for *Update* Expression
   *
   * @param {Object} uNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astUpdateExpression',
		value: function astUpdateExpression(uNode, retArr) {
			if (uNode.prefix) {
				retArr.push(uNode.operator);
				this.astGeneric(uNode.argument, retArr);
			} else {
				this.astGeneric(uNode.argument, retArr);
				retArr.push(uNode.operator);
			}

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astUnaryExpression
   *
   * @desc Parses the abstract syntax tree for *Unary* Expression
   *
   * @param {Object} uNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astUnaryExpression',
		value: function astUnaryExpression(uNode, retArr) {
			if (uNode.prefix) {
				retArr.push(uNode.operator);
				this.astGeneric(uNode.argument, retArr);
			} else {
				this.astGeneric(uNode.argument, retArr);
				retArr.push(uNode.operator);
			}

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astThisExpression
   *
   * @desc Parses the abstract syntax tree for *This* expression
   *
   * @param {Object} tNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astThisExpression',
		value: function astThisExpression(tNode, retArr) {
			retArr.push('this');
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astMemberExpression
   *
   * @desc Parses the abstract syntax tree for *Member* Expression
   *
   * @param {Object} mNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astMemberExpression',
		value: function astMemberExpression(mNode, retArr) {
			debugLog("[in] astMemberExpression " + mNode.object.type);
			if (mNode.computed) {
				if (mNode.object.type === 'Identifier' || mNode.object.type === 'MemberExpression' &&
				// mNode.object.object &&
				mNode.object.object.object && mNode.object.object.object.type === 'ThisExpression' && mNode.object.object.property.name === 'constants') {
					// Working logger
					var reqName = mNode.object.name;
					var funcName = this.functionName || 'kernel';
					var assumeNotTexture = false;

					// Possibly an array request - handle it as such
					if (this.paramNames) {
						var idx = this.paramNames.indexOf(reqName);
						if (idx >= 0 && this.paramTypes[idx] === 'Number') {
							assumeNotTexture = true;
						}
					}
					debugLog("- astMemberExpression " + reqName + " " + funcName);
					if (assumeNotTexture) {
						// Get from array
						this.astGeneric(mNode.object, retArr);
						retArr.push('[int(');
						this.astGeneric(mNode.property, retArr);
						retArr.push(')]');
					} else {
						var isInGetParams = this.isState('in-get-call-parameters');
						var multiMemberExpression = this.isState('multi-member-expression');
						if (multiMemberExpression) {
							this.popState('multi-member-expression');
						}
						this.pushState('not-in-get-call-parameters');

						// This normally refers to the global read only input vars
						var variableType = null;
						if (mNode.object.name) {
							if (this.declarations[mNode.object.name]) {
								variableType = this.declarations[mNode.object.name];
							} else {
								variableType = this.getParamType(mNode.object.name);
							}
						} else if (mNode.object && mNode.object.object && mNode.object.object.object && mNode.object.object.object.type === 'ThisExpression') {
							variableType = this.getConstantType(mNode.object.property.name);
						}
						switch (variableType) {
							case 'Array(2)':
							case 'Array(3)':
							case 'Array(4)':
								// Get from local vec4
								this.astGeneric(mNode.object, retArr);
								retArr.push('[');
								retArr.push(mNode.property.raw);
								retArr.push(']');
								if (multiMemberExpression) {
									this.popState('not-in-get-call-parameters');
								}
								break;
							case 'HTMLImageArray':
								// Get from image
								retArr.push('getImage3D(');
								this.astGeneric(mNode.object, retArr);
								retArr.push(', ivec2(');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Size[0],');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Size[1]), ivec3(');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Dim[0],');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Dim[1],');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Dim[2]');
								retArr.push('), ');
								this.popState('not-in-get-call-parameters');
								this.pushState('in-get-call-parameters');
								this.astGeneric(mNode.property, retArr);
								if (!multiMemberExpression) {
									this.popState('in-get-call-parameters');
								}
								retArr.push(')');
								break;
							case 'ArrayTexture(4)':
							case 'HTMLImage':
								// Get from image
								retArr.push('getImage2D(');
								this.astGeneric(mNode.object, retArr);
								retArr.push(', ivec2(');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Size[0],');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Size[1]), ivec3(');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Dim[0],');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Dim[1],');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Dim[2]');
								retArr.push('), ');
								this.popState('not-in-get-call-parameters');
								this.pushState('in-get-call-parameters');
								this.astGeneric(mNode.property, retArr);
								if (!multiMemberExpression) {
									this.popState('in-get-call-parameters');
								}
								retArr.push(')');
								break;
							default:
								// Get from texture
								if (isInGetParams) {
									retArr.push('int(');
								}
								retArr.push('get(');
								this.astGeneric(mNode.object, retArr);
								retArr.push(', ivec2(');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Size[0],');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Size[1]), ivec3(');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Dim[0],');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Dim[1],');
								this.astGeneric(mNode.object, retArr);
								retArr.push('Dim[2]');
								retArr.push('), ');
								this.astGeneric(mNode.object, retArr);
								retArr.push('BitRatio');
								retArr.push(', ');
								this.popState('not-in-get-call-parameters');
								this.pushState('in-get-call-parameters');
								this.astGeneric(mNode.property, retArr);
								if (!multiMemberExpression) {
									this.popState('in-get-call-parameters');
								}
								retArr.push(')');
								if (isInGetParams) {
									retArr.push(')');
								}
								break;
						}
					}
				} else {

					debugLog("- astMemberExpression obj:", mNode.object);
					var stateStackDepth = this.states.length;
					var startedInGetParamsState = this.isState('in-get-call-parameters');
					if (!startedInGetParamsState) {
						this.pushState('multi-member-expression');
					}
					this.astGeneric(mNode.object, retArr);
					if (this.isState('multi-member-expression')) {
						this.popState('multi-member-expression');
					}
					var changedGetParamsState = !startedInGetParamsState && this.isState('in-get-call-parameters');
					var last = retArr.pop();
					retArr.push(',');
					debugLog("- astMemberExpression prop:", mNode.property);
					var shouldPopParamState = this.isState('should-pop-in-get-call-parameters');
					if (shouldPopParamState) {
						// go back to in-get-call-parameters state
						this.popState('should-pop-in-get-call-parameters');
					}
					this.astGeneric(mNode.property, retArr);
					retArr.push(last);

					if (changedGetParamsState) {
						// calling memberExpression should pop...
						this.pushState('should-pop-in-get-call-parameters');
					} else if (shouldPopParamState) {
						// do the popping!
						this.popState('in-get-call-parameters');
					}
				}
			} else {

				// Unroll the member expression
				var unrolled = this.astMemberExpressionUnroll(mNode);
				var unrolled_lc = unrolled.toLowerCase();
				debugLog("- astMemberExpression unrolled:", unrolled);
				// Its a constant, remove this.constants.
				if (unrolled.indexOf(constantsPrefix) === 0) {
					unrolled = 'constants_' + unrolled.slice(constantsPrefix.length);
				}

				// do we need to cast addressing vales to float?
				var castFloat = !this.isState('in-get-call-parameters');

				switch (unrolled_lc) {
					case 'this.thread.x':
						castFloat && retArr.push('float(');
						retArr.push('threadId.x');
						castFloat && retArr.push(')');
						break;
					case 'this.thread.y':
						castFloat && retArr.push('float(');
						retArr.push('threadId.y');
						castFloat && retArr.push(')');
						break;
					case 'this.thread.z':
						castFloat && retArr.push('float(');
						retArr.push('threadId.z');
						castFloat && retArr.push(')');
						break;
					case 'this.output.x':
						retArr.push(this.output[0] + '.0');
						break;
					case 'this.output.y':
						retArr.push(this.output[1] + '.0');
						break;
					case 'this.output.z':
						retArr.push(this.output[2] + '.0');
						break;
					default:
						if (mNode.object && mNode.object.name && this.declarations[mNode.object.name]) {
							retArr.push('user_');
						}
						retArr.push(unrolled);
				}
			}
			debugLog("[out] astMemberExpression " + mNode.object.type);
			return retArr;
		}
	}, {
		key: 'astSequenceExpression',
		value: function astSequenceExpression(sNode, retArr) {
			for (var i = 0; i < sNode.expressions.length; i++) {
				if (i > 0) {
					retArr.push(',');
				}
				this.astGeneric(sNode.expressions, retArr);
			}
			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astCallExpression
   *
   * @desc Parses the abstract syntax tree for *call* expression
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns  {Array} the append retArr
   */

	}, {
		key: 'astCallExpression',
		value: function astCallExpression(ast, retArr) {
			if (ast.callee) {
				// Get the full function call, unrolled
				var funcName = this.astMemberExpressionUnroll(ast.callee);

				// Its a math operator, remove the prefix
				if (funcName.indexOf(jsMathPrefix) === 0) {
					funcName = funcName.slice(jsMathPrefix.length);
				}

				// Its a local function, remove this
				if (funcName.indexOf(localPrefix) === 0) {
					funcName = funcName.slice(localPrefix.length);
				}

				// if this if grows to more than one, lets use a switch
				if (funcName === 'atan2') {
					funcName = 'atan';
				}

				// Register the function into the called registry
				if (this.calledFunctions.indexOf(funcName) < 0) {
					this.calledFunctions.push(funcName);
				}
				if (!this.hasOwnProperty('funcName')) {
					this.calledFunctionsArguments[funcName] = [];
				}

				var functionArguments = [];
				this.calledFunctionsArguments[funcName].push(functionArguments);

				// Call the function
				retArr.push(funcName);

				// Open arguments space
				retArr.push('(');

				// Add the vars
				for (var i = 0; i < ast.arguments.length; ++i) {
					var argument = ast.arguments[i];
					if (i > 0) {
						retArr.push(', ');
					}
					this.astGeneric(argument, retArr);
					if (argument.type === 'Identifier') {
						var paramIndex = this.paramNames.indexOf(argument.name);
						if (paramIndex === -1) {
							functionArguments.push(null);
						} else {
							functionArguments.push({
								name: argument.name,
								type: this.paramTypes[paramIndex] || 'Number'
							});
						}
					} else {
						functionArguments.push(null);
					}
				}

				// Close arguments space
				retArr.push(')');

				return retArr;
			}

			// Failure, unknown expression
			throw this.astErrorOutput('Unknown CallExpression', ast);

			return retArr;
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name astArrayExpression
   *
   * @desc Parses the abstract syntax tree for *Array* Expression
   *
   * @param {Object} ast - the AST object to parse
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astArrayExpression',
		value: function astArrayExpression(arrNode, retArr) {
			var arrLen = arrNode.elements.length;

			retArr.push('vec' + arrLen + '(');
			for (var i = 0; i < arrLen; ++i) {
				if (i > 0) {
					retArr.push(', ');
				}
				var subNode = arrNode.elements[i];
				this.astGeneric(subNode, retArr);
			}
			retArr.push(')');

			return retArr;

			// // Failure, unknown expression
			// throw this.astErrorOutput(
			// 	'Unknown  ArrayExpression',
			// 	arrNode
			//);
		}

		/**
   * @memberOf WebGLFunctionNode#
   * @function
   * @name getFunctionPrototypeString
   *
   * @desc Returns the converted webgl shader function equivalent of the JS function
   *
   * @returns {String} webgl function string, result is cached under this.getFunctionPrototypeString
   *
   */

	}, {
		key: 'getFunctionPrototypeString',
		value: function getFunctionPrototypeString() {
			if (this.webGlFunctionPrototypeString) {
				return this.webGlFunctionPrototypeString;
			}
			return this.webGlFunctionPrototypeString = this.generate();
		}
	}, {
		key: 'build',
		value: function build() {
			return this.getFunctionPrototypeString().length > 0;
		}
	}]);

	return WebGLFunctionNode;
}(FunctionNodeBase);

var typeMap = {
	'Array': 'sampler2D',
	'Array(2)': 'vec2',
	'Array(3)': 'vec3',
	'Array(4)': 'vec4',
	'Array2D': 'sampler2D',
	'Array3D': 'sampler2D',
	'Float': 'float',
	'Input': 'sampler2D',
	'Integer': 'float',
	'Number': 'float',
	'NumberTexture': 'sampler2D',
	'ArrayTexture(4)': 'sampler2D'
};

var typeLookupMap = {
	'Array': 'Number',
	'Array2D': 'Number',
	'Array3D': 'Number',
	'HTMLImage': 'Array(4)',
	'HTMLImageArray': 'Array(4)',
	'NumberTexture': 'Number',
	'ArrayTexture(4)': 'Array(4)'
};

/**
 * @ignore
 * @function
 * @name webgl_regex_optimize
 *
 * @desc [INTERNAL] Takes the near final webgl function string, and do regex search and replacments.
 * For voodoo optimize out the following:
 *
 * - decode32(encode32( <br>
 * - encode32(decode32( <br>
 *
 * @param {String} inStr - The webGl function String
 *
 */
function webGlRegexOptimize(inStr) {
	return inStr.replace(DECODE32_ENCODE32, '((').replace(ENCODE32_DECODE32, '((');
}
},{"../../core/utils":32,"../function-node-base":7}],13:[function(require,module,exports){
'use strict';

var utils = require('../../core/utils');
var kernelRunShortcut = require('../kernel-run-shortcut');
var Input = require('../../core/input');
var Texture = require('../../core/texture');

function removeFnNoise(fn) {
  if (/^function /.test(fn)) {
    fn = fn.substring(9);
  }
  return fn.replace(/[_]typeof/g, 'typeof');
}

function removeNoise(str) {
  return str.replace(/[_]typeof/g, 'typeof');
}

module.exports = function (gpuKernel, name) {
  return '() => {\n    ' + kernelRunShortcut.toString() + ';\n    const utils = {\n      allPropertiesOf: ' + removeNoise(utils.allPropertiesOf.toString()) + ',\n      clone: ' + removeNoise(utils.clone.toString()) + ',\n      splitArray: ' + removeNoise(utils.splitArray.toString()) + ',\n      getArgumentType: ' + removeNoise(utils.getArgumentType.toString()) + ',\n      getDimensions: ' + removeNoise(utils.getDimensions.toString()) + ',\n      dimToTexSize: ' + removeNoise(utils.dimToTexSize.toString()) + ',\n      flattenTo: ' + removeNoise(utils.flattenTo.toString()) + ',\n      flatten2dArrayTo: ' + removeNoise(utils.flatten2dArrayTo.toString()) + ',\n      flatten3dArrayTo: ' + removeNoise(utils.flatten3dArrayTo.toString()) + ',\n      systemEndianness: \'' + removeNoise(utils.systemEndianness()) + '\',\n      initWebGl: ' + removeNoise(utils.initWebGl.toString()) + ',\n      isArray: ' + removeNoise(utils.isArray.toString()) + ',\n      checkOutput: ' + removeNoise(utils.checkOutput.toString()) + '\n    };\n    const Utils = utils;\n    const canvases = [];\n    const maxTexSizes = {};\n    let Texture = function() {};\n    let Input = function() {}; \n    class ' + (name || 'Kernel') + ' {\n      constructor() {\n        this.maxTexSize = null;\n        this.argumentsLength = 0;\n        this.constantsLength = 0;\n        this._canvas = null;\n        this._webGl = null;\n        this.program = null;\n        this.outputToTexture = ' + (gpuKernel.outputToTexture ? 'true' : 'false') + ';\n        this.paramNames = ' + JSON.stringify(gpuKernel.paramNames) + ';\n        this.paramTypes = ' + JSON.stringify(gpuKernel.paramTypes) + ';\n        this.texSize = ' + JSON.stringify(gpuKernel.texSize) + ';\n        this.output = ' + JSON.stringify(gpuKernel.output) + ';\n        this.compiledFragShaderString = `' + gpuKernel.compiledFragShaderString + '`;\n\t\t    this.compiledVertShaderString = `' + gpuKernel.compiledVertShaderString + '`;\n\t\t    this.programUniformLocationCache = {};\n\t\t    this.textureCache = {};\n\t\t    this.subKernelOutputTextures = null;\n\t\t    this.subKernelOutputVariableNames = null;\n\t\t    this.uniform1fCache = {};\n\t\t    this.uniform1iCache = {};\n\t\t    this.uniform2fCache = {};\n\t\t    this.uniform2fvCache = {};\n\t\t    this.uniform2ivCache = {};\n\t\t    this.uniform3fvCache = {};\n\t\t    this.uniform3ivCache = {};\n      }\n      _getFragShaderString() { return this.compiledFragShaderString; }\n      _getVertShaderString() { return this.compiledVertShaderString; }\n      validateOptions() {}\n      setupParams() {}\n      setupConstants() {}\n      setCanvas(canvas) { this._canvas = canvas; return this; }\n      setWebGl(webGl) { this._webGl = webGl; return this; }\n      setTexture(Type) { Texture = Type; }\n      setInput(Type) { Input = Type; }\n      ' + removeFnNoise(gpuKernel.getUniformLocation.toString()) + '\n      ' + removeFnNoise(gpuKernel.build.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.run.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel._addArgument.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel._formatArrayTransfer.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.getArgumentTexture.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.getTextureCache.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.getOutputTexture.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.renderOutput.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.updateMaxTexSize.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel._setupOutputTexture.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.detachTextureCache.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.setUniform1f.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.setUniform1i.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.setUniform2f.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.setUniform2fv.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.setUniform2iv.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.setUniform3fv.toString()) + '\n\t\t  ' + removeFnNoise(gpuKernel.setUniform3iv.toString()) + '\n    };\n    return kernelRunShortcut(new Kernel());\n  };';
};
},{"../../core/input":29,"../../core/texture":30,"../../core/utils":32,"../kernel-run-shortcut":9}],14:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var KernelBase = require('../kernel-base');
var utils = require('../../core/utils');
var Texture = require('../../core/texture');
var fragShaderString = require('./shader-frag');
var vertShaderString = require('./shader-vert');
var kernelString = require('./kernel-string');
var canvases = [];
var maxTexSizes = {};

module.exports = function (_KernelBase) {
	_inherits(WebGLKernel, _KernelBase);

	_createClass(WebGLKernel, null, [{
		key: 'fragShaderString',
		get: function get() {
			return fragShaderString;
		}
	}, {
		key: 'vertShaderString',
		get: function get() {
			return vertShaderString;
		}
		/**
   * @constructor WebGLKernel
   *
   * @desc Kernel Implementation for WebGL.
   * <p>This builds the shaders and runs them on the GPU,
   * the outputs the result back as float(enabled by default) and Texture.</p>
   *
   * @extends KernelBase
   *
   * @prop {Object} textureCache - webGl Texture cache
   * @prop {Object} threadDim - The thread dimensions, x, y and z
   * @prop {Object} programUniformLocationCache - Location of program variables in memory
   * @prop {Object} framebuffer - Webgl frameBuffer
   * @prop {Object} buffer - WebGL buffer
   * @prop {Object} program - The webGl Program
   * @prop {Object} functionBuilder - Function Builder instance bound to this Kernel
   * @prop {Boolean} outputToTexture - Set output type to Texture, instead of float
   * @prop {String} endianness - Endian information like Little-endian, Big-endian.
   * @prop {Array} paramTypes - Types of parameters sent to the Kernel
   * @prop {number} argumentsLength - Number of parameters sent to the Kernel
   * @prop {String} compiledFragShaderString - Compiled fragment shader string
   * @prop {String} compiledVertShaderString - Compiled Vertical shader string
   */

	}]);

	function WebGLKernel(fnString, settings) {
		_classCallCheck(this, WebGLKernel);

		var _this = _possibleConstructorReturn(this, (WebGLKernel.__proto__ || Object.getPrototypeOf(WebGLKernel)).call(this, fnString, settings));

		_this.textureCache = {};
		_this.threadDim = {};
		_this.programUniformLocationCache = {};
		_this.framebuffer = null;

		_this.buffer = null;
		_this.program = null;
		_this.outputToTexture = settings.outputToTexture;
		_this.endianness = utils.systemEndianness();
		_this.subKernelOutputTextures = null;
		_this.subKernelOutputVariableNames = null;
		_this.argumentsLength = 0;
		_this.constantsLength = 0;
		_this.compiledFragShaderString = null;
		_this.compiledVertShaderString = null;
		_this.fragShader = null;
		_this.vertShader = null;
		_this.drawBuffersMap = null;
		_this.outputTexture = null;
		_this.maxTexSize = null;
		_this.uniform1fCache = {};
		_this.uniform1iCache = {};
		_this.uniform2fCache = {};
		_this.uniform2fvCache = {};
		_this.uniform2ivCache = {};
		_this.uniform3fvCache = {};
		_this.uniform3ivCache = {};
		if (!_this._webGl) _this._webGl = _this.initWebGl();
		return _this;
	}

	_createClass(WebGLKernel, [{
		key: 'initWebGl',
		value: function initWebGl() {
			return utils.initWebGl(this.getCanvas());
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name validateOptions
   *
   * @desc Validate options related to Kernel, such as
   * floatOutputs and Textures, texSize, output,
   * graphical output.
   *
   */

	}, {
		key: 'validateOptions',
		value: function validateOptions() {
			var isFloatReadPixel = utils.isFloatReadPixelsSupported();
			if (this.floatTextures === true && !utils.OES_texture_float) {
				throw new Error('Float textures are not supported on this browser');
			} else if (this.floatOutput === true && this.floatOutputForce !== true && !isFloatReadPixel) {
				throw new Error('Float texture outputs are not supported on this browser');
			} else if (this.floatTextures === undefined && utils.OES_texture_float) {
				this.floatTextures = true;
				this.floatOutput = isFloatReadPixel;
			}

			var hasIntegerDivisionBug = utils.hasIntegerDivisionAccuracyBug();
			if (this.fixIntegerDivisionAccuracy === null) {
				this.fixIntegerDivisionAccuracy = hasIntegerDivisionBug;
			} else if (this.fixIntegerDivisionAccuracy && !hasIntegerDivisionBug) {
				this.fixIntegerDivisionAccuracy = false;
			}

			utils.checkOutput(this.output);

			if (!this.output || this.output.length === 0) {
				if (arguments.length !== 1) {
					throw new Error('Auto output only supported for kernels with only one input');
				}

				var argType = utils.getArgumentType(arguments[0]);
				if (argType === 'Array') {
					this.output = utils.getDimensions(argType);
				} else if (argType === 'NumberTexture' || argType === 'ArrayTexture(4)') {
					this.output = arguments[0].output;
				} else {
					throw new Error('Auto output not supported for input type: ' + argType);
				}
			}

			this.texSize = utils.dimToTexSize({
				floatTextures: this.floatTextures,
				floatOutput: this.floatOutput
			}, this.output, true);

			if (this.graphical) {
				if (this.output.length !== 2) {
					throw new Error('Output must have 2 dimensions on graphical mode');
				}

				if (this.floatOutput) {
					this.floatOutput = false;
					console.warn('Cannot use graphical mode and float output at the same time');
				}

				this.texSize = utils.clone(this.output);
			} else if (this.floatOutput === undefined && utils.OES_texture_float) {
				this.floatOutput = true;
			}
		}
	}, {
		key: 'updateMaxTexSize',
		value: function updateMaxTexSize() {
			var texSize = this.texSize;
			var canvas = this._canvas;
			if (this.maxTexSize === null) {
				var canvasIndex = canvases.indexOf(canvas);
				if (canvasIndex === -1) {
					canvasIndex = canvases.length;
					canvases.push(canvas);
					maxTexSizes[canvasIndex] = [texSize[0], texSize[1]];
				}
				this.maxTexSize = maxTexSizes[canvasIndex];
			}
			if (this.maxTexSize[0] < texSize[0]) {
				this.maxTexSize[0] = texSize[0];
			}
			if (this.maxTexSize[1] < texSize[1]) {
				this.maxTexSize[1] = texSize[1];
			}
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name build
   *
   * @desc Builds the Kernel, by compiling Fragment and Vertical Shaders,
   * and instantiates the program.
   *
   */

	}, {
		key: 'build',
		value: function build() {
			this.validateOptions();
			this.setupConstants();
			this.setupParams(arguments);
			this.updateMaxTexSize();
			var texSize = this.texSize;
			var gl = this._webGl;
			var canvas = this._canvas;
			gl.enable(gl.SCISSOR_TEST);
			gl.viewport(0, 0, this.maxTexSize[0], this.maxTexSize[1]);
			canvas.width = this.maxTexSize[0];
			canvas.height = this.maxTexSize[1];
			var threadDim = this.threadDim = utils.clone(this.output);
			while (threadDim.length < 3) {
				threadDim.push(1);
			}

			if (this.functionBuilder) this._addKernels();

			var compiledVertShaderString = this._getVertShaderString(arguments);
			var vertShader = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vertShader, compiledVertShaderString);
			gl.compileShader(vertShader);
			this.vertShader = vertShader;

			var compiledFragShaderString = this._getFragShaderString(arguments);
			var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fragShader, compiledFragShaderString);
			gl.compileShader(fragShader);
			this.fragShader = fragShader;

			if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
				console.log(compiledVertShaderString);
				console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(vertShader));
				throw new Error('Error compiling vertex shader');
			}
			if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
				console.log(compiledFragShaderString);
				console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(fragShader));
				throw new Error('Error compiling fragment shader');
			}

			if (this.debug) {
				console.log('Options:');
				console.dir(this);
				console.log('GLSL Shader Output:');
				console.log(compiledFragShaderString);
			}

			var program = this.program = gl.createProgram();
			gl.attachShader(program, vertShader);
			gl.attachShader(program, fragShader);
			gl.linkProgram(program);
			this.framebuffer = gl.createFramebuffer();
			this.framebuffer.width = texSize[0];
			this.framebuffer.height = texSize[1];

			var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
			var texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

			var texCoordOffset = vertices.byteLength;

			var buffer = this.buffer;
			if (!buffer) {
				buffer = this.buffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				gl.bufferData(gl.ARRAY_BUFFER, vertices.byteLength + texCoords.byteLength, gl.STATIC_DRAW);
			} else {
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			}

			gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
			gl.bufferSubData(gl.ARRAY_BUFFER, texCoordOffset, texCoords);

			var aPosLoc = gl.getAttribLocation(this.program, 'aPos');
			gl.enableVertexAttribArray(aPosLoc);
			gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, gl.FALSE, 0, 0);
			var aTexCoordLoc = gl.getAttribLocation(this.program, 'aTexCoord');
			gl.enableVertexAttribArray(aTexCoordLoc);
			gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, gl.FALSE, 0, texCoordOffset);
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

			for (var p in this.constants) {
				var value = this.constants[p];
				var type = utils.getArgumentType(value);
				if (type === 'Float' || type === 'Integer') {
					continue;
				}
				gl.useProgram(this.program);
				this._addConstant(this.constants[p], type, p);
				this.constantsLength++;
			}

			if (!this.outputImmutable) {
				this._setupOutputTexture();
				if (this.subKernelOutputVariableNames !== null && this.subKernelOutputVariableNames.length > 0) {
					this._setupSubOutputTextures(this.subKernelOutputVariableNames.length);
				}
			}
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name run
   *
   * @desc Run the kernel program, and send the output to renderOutput
   *
   * <p> This method calls a helper method *renderOutput* to return the result. </p>
   *
   * @returns {Object|Undefined} Result The final output of the program, as float, and as Textures for reuse.
   *
   *
   */

	}, {
		key: 'run',
		value: function run() {
			if (this.program === null) {
				this.build.apply(this, arguments);
			}
			var paramNames = this.paramNames;
			var paramTypes = this.paramTypes;
			var texSize = this.texSize;
			var gl = this._webGl;

			gl.useProgram(this.program);
			gl.scissor(0, 0, texSize[0], texSize[1]);

			if (!this.hardcodeConstants) {
				this.setUniform3iv('uOutputDim', this.threadDim);
				this.setUniform2iv('uTexSize', texSize);
			}

			this.setUniform2f('ratio', texSize[0] / this.maxTexSize[0], texSize[1] / this.maxTexSize[1]);

			this.argumentsLength = 0;
			for (var texIndex = 0; texIndex < paramNames.length; texIndex++) {
				this._addArgument(arguments[texIndex], paramTypes[texIndex], paramNames[texIndex]);
			}

			if (this.graphical) {
				if (this.outputToTexture) {
					gl.bindRenderbuffer(gl.RENDERBUFFER, null);
					gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
					if (!this.outputTexture || this.outputImmutable) {
						this._setupOutputTexture();
					}
					gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
					return new Texture(this.outputTexture, texSize, this.threadDim, this.output, this._webGl, 'ArrayTexture(4)');
				}
				gl.bindRenderbuffer(gl.RENDERBUFFER, null);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
				return;
			}

			gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
			if (this.outputImmutable) {
				this._setupOutputTexture();
			}
			var outputTexture = this.outputTexture;

			if (this.subKernelOutputVariableNames !== null) {
				if (this.outputImmutable) {
					this.subKernelOutputTextures = [];
					this._setupSubOutputTextures(this.subKernelOutputVariableNames.length);
				}
				this.drawBuffers.drawBuffersWEBGL(this.drawBuffersMap);
			}

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			if (this.subKernelOutputTextures !== null) {
				if (this.subKernels !== null) {
					var output = [];
					output.result = this.renderOutput(outputTexture);
					for (var i = 0; i < this.subKernels.length; i++) {
						output.push(new Texture(this.subKernelOutputTextures[i], texSize, this.threadDim, this.output, this._webGl));
					}
					return output;
				} else if (this.subKernelProperties !== null) {
					var _output = {
						result: this.renderOutput(outputTexture)
					};
					var _i = 0;
					for (var p in this.subKernelProperties) {
						if (!this.subKernelProperties.hasOwnProperty(p)) continue;
						_output[p] = new Texture(this.subKernelOutputTextures[_i], texSize, this.threadDim, this.output, this._webGl);
						_i++;
					}
					return _output;
				}
			}

			return this.renderOutput(outputTexture);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name renderOutput
   *
   *
   * @desc Helper function to return webGl function's output.
   * Since the program runs on GPU, we need to get the
   * output of the program back to CPU and then return them.
   *
   * *Note*: This should not be called directly.
   *
   * @param {Object} outputTexture - Output Texture returned by webGl program
   *
   * @returns {Object|Array} result
   *
   *
   */

	}, {
		key: 'renderOutput',
		value: function renderOutput(outputTexture) {
			var texSize = this.texSize;
			var gl = this._webGl;
			var threadDim = this.threadDim;
			var output = this.output;
			if (this.outputToTexture) {
				return new Texture(outputTexture, texSize, this.threadDim, output, this._webGl);
			} else {
				var result = void 0;
				if (this.floatOutput) {
					var w = texSize[0];
					var h = Math.ceil(texSize[1] / 4);
					result = new Float32Array(w * h * 4);
					gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, result);
				} else {
					var bytes = new Uint8Array(texSize[0] * texSize[1] * 4);
					gl.readPixels(0, 0, texSize[0], texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
					result = new Float32Array(bytes.buffer);
				}

				result = result.subarray(0, threadDim[0] * threadDim[1] * threadDim[2]);

				if (output.length === 1) {
					return result;
				} else if (output.length === 2) {
					return utils.splitArray(result, output[0]);
				} else if (output.length === 3) {
					var cube = utils.splitArray(result, output[0] * output[1]);
					return cube.map(function (x) {
						return utils.splitArray(x, output[0]);
					});
				}
			}
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name getOutputTexture
   *
   * @desc This return defined outputTexture, which is setup in .build(), or if immutable, is defined in .run()
   *
   * @returns {Object} Output Texture Cache
   *
   */

	}, {
		key: 'getOutputTexture',
		value: function getOutputTexture() {
			return this.outputTexture;
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _setupOutputTexture
   * @private
   *
   * @desc Setup and replace output texture
   */

	}, {
		key: '_setupOutputTexture',
		value: function _setupOutputTexture() {
			var gl = this._webGl;
			var texSize = this.texSize;
			var texture = this.outputTexture = this._webGl.createTexture();
			gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.paramNames.length);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			if (this.floatOutput) {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize[0], texSize[1], 0, gl.RGBA, gl.FLOAT, null);
			} else {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize[0], texSize[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			}
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		}

		/**
   * @memberOf WebGLKernel#
   * @param length
   * @private
   *
   * @desc Setup and replace sub-output textures
   */

	}, {
		key: '_setupSubOutputTextures',
		value: function _setupSubOutputTextures(length) {
			var gl = this._webGl;
			var texSize = this.texSize;
			var drawBuffersMap = this.drawBuffersMap = [gl.COLOR_ATTACHMENT0];
			var textures = this.subKernelOutputTextures = [];
			for (var i = 0; i < length; i++) {
				var texture = this._webGl.createTexture();
				textures.push(texture);
				drawBuffersMap.push(gl.COLOR_ATTACHMENT0 + i + 1);
				gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.paramNames.length + i);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				if (this.floatOutput) {
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize[0], texSize[1], 0, gl.RGBA, gl.FLOAT, null);
				} else {
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize[0], texSize[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
				}
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i + 1, gl.TEXTURE_2D, texture, 0);
			}
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name getArgumentTexture
   *
   * @desc This uses *getTextureCache** to get the Texture Cache of the argument supplied
   *
   * @param {String} name - Name of the argument
   *
   * 	Texture cache for the supplied argument
   *
   */

	}, {
		key: 'getArgumentTexture',
		value: function getArgumentTexture(name) {
			return this.getTextureCache('ARGUMENT_' + name);
		}

		/**
   * @memberOf WebGLKernel#
   * @name getTextureCache
   * @function
   *
   * @desc Returns the Texture Cache of the supplied parameter (can be kernel, sub-kernel or argument)
   *
   * @param {String} name - Name of the subkernel, argument, or kernel.
   *
   * @returns {Object} Texture cache
   *
   */

	}, {
		key: 'getTextureCache',
		value: function getTextureCache(name) {
			if (this.textureCache.hasOwnProperty(name)) {
				return this.textureCache[name];
			}
			return this.textureCache[name] = this._webGl.createTexture();
		}

		/**
   * @memberOf WebGLKernel#
   * @name detachTextureCache
   * @function
   * @desc removes a texture from the kernel's cache
   * @param {String} name - Name of texture
   */

	}, {
		key: 'detachTextureCache',
		value: function detachTextureCache(name) {
			delete this.textureCache[name];
		}
	}, {
		key: 'setUniform1f',
		value: function setUniform1f(name, value) {
			if (this.uniform1fCache.hasOwnProperty(name)) {
				var cache = this.uniform1fCache[name];
				if (value === cache) {
					return;
				}
			}
			this.uniform1fCache[name] = value;
			var loc = this.getUniformLocation(name);
			this._webGl.uniform1f(loc, value);
		}
	}, {
		key: 'setUniform1i',
		value: function setUniform1i(name, value) {
			if (this.uniform1iCache.hasOwnProperty(name)) {
				var cache = this.uniform1iCache[name];
				if (value === cache) {
					return;
				}
			}
			this.uniform1iCache[name] = value;
			var loc = this.getUniformLocation(name);
			this._webGl.uniform1i(loc, value);
		}
	}, {
		key: 'setUniform2f',
		value: function setUniform2f(name, value1, value2) {
			if (this.uniform2fCache.hasOwnProperty(name)) {
				var cache = this.uniform2fCache[name];
				if (value1 === cache[0] && value2 === cache[1]) {
					return;
				}
			}
			this.uniform2fCache[name] = [value1, value2];
			var loc = this.getUniformLocation(name);
			this._webGl.uniform2f(loc, value1, value2);
		}
	}, {
		key: 'setUniform2fv',
		value: function setUniform2fv(name, value) {
			if (this.uniform2fvCache.hasOwnProperty(name)) {
				var cache = this.uniform2fvCache[name];
				if (value[0] === cache[0] && value[1] === cache[1]) {
					return;
				}
			}
			this.uniform2fvCache[name] = value;
			var loc = this.getUniformLocation(name);
			this._webGl.uniform2fv(loc, value);
		}
	}, {
		key: 'setUniform2iv',
		value: function setUniform2iv(name, value) {
			if (this.uniform2ivCache.hasOwnProperty(name)) {
				var cache = this.uniform2ivCache[name];
				if (value[0] === cache[0] && value[1] === cache[1]) {
					return;
				}
			}
			this.uniform2ivCache[name] = value;
			var loc = this.getUniformLocation(name);
			this._webGl.uniform2iv(loc, value);
		}
	}, {
		key: 'setUniform3fv',
		value: function setUniform3fv(name, value) {
			if (this.uniform3fvCache.hasOwnProperty(name)) {
				var cache = this.uniform3fvCache[name];
				if (value[0] === cache[0] && value[1] === cache[1] && value[2] === cache[2]) {
					return;
				}
			}
			this.uniform3fvCache[name] = value;
			var loc = this.getUniformLocation(name);
			this._webGl.uniform3fv(loc, value);
		}
	}, {
		key: 'setUniform3iv',
		value: function setUniform3iv(name, value) {
			if (this.uniform3ivCache.hasOwnProperty(name)) {
				var cache = this.uniform3ivCache[name];
				if (value[0] === cache[0] && value[1] === cache[1] && value[2] === cache[2]) {
					return;
				}
			}
			this.uniform3ivCache[name] = value;
			var loc = this.getUniformLocation(name);
			this._webGl.uniform3iv(loc, value);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name getUniformLocation
   *
   * @desc Return WebGlUniformLocation for various variables
   * related to webGl program, such as user-defiend variables,
   * as well as, dimension sizes, etc.
   *
   */

	}, {
		key: 'getUniformLocation',
		value: function getUniformLocation(name) {
			if (this.programUniformLocationCache.hasOwnProperty(name)) {
				return this.programUniformLocationCache[name];
			}
			return this.programUniformLocationCache[name] = this._webGl.getUniformLocation(this.program, name);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getFragShaderArtifactMap
   *
   * @desc Generate Shader artifacts for the kernel program.
   * The final object contains HEADER, KERNEL, MAIN_RESULT, and others.
   *
   * @param {Array} args - The actual parameters sent to the Kernel
   *
   * @returns {Object} An object containing the Shader Artifacts(CONSTANTS, HEADER, KERNEL, etc.)
   *
   */

	}, {
		key: '_getFragShaderArtifactMap',
		value: function _getFragShaderArtifactMap(args) {
			return {
				HEADER: this._getHeaderString(),
				LOOP_MAX: this._getLoopMaxString(),
				CONSTANTS: this._getConstantsString(),
				DECODE32_ENDIANNESS: this._getDecode32EndiannessString(),
				ENCODE32_ENDIANNESS: this._getEncode32EndiannessString(),
				DIVIDE_WITH_INTEGER_CHECK: this._getDivideWithIntegerCheckString(),
				GET_WRAPAROUND: this._getGetWraparoundString(),
				GET_TEXTURE_CHANNEL: this._getGetTextureChannelString(),
				GET_TEXTURE_INDEX: this._getGetTextureIndexString(),
				GET_RESULT: this._getGetResultString(),
				MAIN_PARAMS: this._getMainParamsString(args),
				MAIN_CONSTANTS: this._getMainConstantsString(),
				KERNEL: this._getKernelString(),
				MAIN_RESULT: this._getMainResultString()
			};
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _addArgument
   *
   * @desc Adds kernel parameters to the Argument Texture,
   * binding it to the webGl instance, etc.
   *
   * @param {Array|Texture|Number} value - The actual argument supplied to the kernel
   * @param {String} type - Type of the argument
   * @param {String} name - Name of the argument
   *
   */

	}, {
		key: '_addArgument',
		value: function _addArgument(value, type, name) {
			var gl = this._webGl;
			var argumentTexture = this.getArgumentTexture(name);
			if (value instanceof Texture) {
				type = value.type;
			}
			switch (type) {
				case 'Array':
				case 'Array(2)':
				case 'Array(3)':
				case 'Array(4)':
				case 'Array2D':
				case 'Array3D':
					{
						var dim = utils.getDimensions(value, true);
						var size = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, dim);
						gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.argumentsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

						var length = size[0] * size[1];

						var _formatArrayTransfer2 = this._formatArrayTransfer(value, length),
						    valuesFlat = _formatArrayTransfer2.valuesFlat,
						    bitRatio = _formatArrayTransfer2.bitRatio;

						var buffer = void 0;
						if (this.floatTextures) {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0], size[1], 0, gl.RGBA, gl.FLOAT, valuesFlat);
						} else {
							buffer = new Uint8Array(valuesFlat.buffer);
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0] / bitRatio, size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
						}

						if (!this.hardcodeConstants) {
							this.setUniform3iv('user_' + name + 'Dim', dim);
							this.setUniform2iv('user_' + name + 'Size', size);
						}
						this.setUniform1i('user_' + name + 'BitRatio', bitRatio);
						this.setUniform1i('user_' + name, this.argumentsLength);
						break;
					}
				case 'Integer':
				case 'Float':
				case 'Number':
					{
						this.setUniform1f('user_' + name, value);
						break;
					}
				case 'Input':
					{
						var input = value;
						var _dim = input.size;
						var _size = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, _dim);
						gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.argumentsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

						var _length = _size[0] * _size[1];

						var _formatArrayTransfer3 = this._formatArrayTransfer(value.value, _length),
						    _valuesFlat = _formatArrayTransfer3.valuesFlat,
						    _bitRatio = _formatArrayTransfer3.bitRatio;

						if (this.floatTextures) {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _size[0], _size[1], 0, gl.RGBA, gl.FLOAT, inputArray);
						} else {
							var _buffer = new Uint8Array(_valuesFlat.buffer);
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _size[0] / _bitRatio, _size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, _buffer);
						}

						if (!this.hardcodeConstants) {
							this.setUniform3iv('user_' + name + 'Dim', _dim);
							this.setUniform2iv('user_' + name + 'Size', _size);
						}
						this.setUniform1i('user_' + name + 'BitRatio', _bitRatio);
						this.setUniform1i('user_' + name, this.argumentsLength);
						break;
					}
				case 'HTMLImage':
					{
						var inputImage = value;
						var _dim2 = [inputImage.width, inputImage.height, 1];
						var _size2 = [inputImage.width, inputImage.height];

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.argumentsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
						gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
						// Upload the image into the texture.
						var mipLevel = 0; // the largest mip
						var internalFormat = gl.RGBA; // format we want in the texture
						var srcFormat = gl.RGBA; // format of data we are supplying
						var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
						gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, inputImage);
						this.setUniform3iv('user_' + name + 'Dim', _dim2);
						this.setUniform2iv('user_' + name + 'Size', _size2);
						this.setUniform1i('user_' + name, this.argumentsLength);
						break;
					}
				case 'ArrayTexture(4)':
				case 'NumberTexture':
					{
						var inputTexture = value;
						var _dim3 = inputTexture.dimensions;
						var _size3 = inputTexture.size;

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.argumentsLength);
						gl.bindTexture(gl.TEXTURE_2D, inputTexture.texture);

						this.setUniform3iv('user_' + name + 'Dim', _dim3);
						this.setUniform2iv('user_' + name + 'Size', _size3);
						this.setUniform1i('user_' + name + 'BitRatio', 1); // aways float32
						this.setUniform1i('user_' + name, this.argumentsLength);
						break;
					}
				default:
					throw new Error('Input type not supported (WebGL): ' + value);
			}
			this.argumentsLength++;
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _addConstant
   *
   * @desc Adds kernel parameters to the Argument Texture,
   * binding it to the webGl instance, etc.
   *
   * @param {Array|Texture|Number} value - The actual argument supplied to the kernel
   * @param {String} type - Type of the argument
   * @param {String} name - Name of the argument
   *
   */

	}, {
		key: '_addConstant',
		value: function _addConstant(value, type, name) {
			var gl = this._webGl;
			var argumentTexture = this.getArgumentTexture(name);
			if (value instanceof Texture) {
				type = value.type;
			}
			switch (type) {
				case 'Array':
					{
						var dim = utils.getDimensions(value, true);
						var size = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, dim);
						gl.activeTexture(gl.TEXTURE0 + this.constantsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

						var length = size[0] * size[1];

						var _formatArrayTransfer4 = this._formatArrayTransfer(value, length),
						    valuesFlat = _formatArrayTransfer4.valuesFlat,
						    bitRatio = _formatArrayTransfer4.bitRatio;

						var buffer = void 0;
						if (this.floatTextures) {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0], size[1], 0, gl.RGBA, gl.FLOAT, valuesFlat);
						} else {
							buffer = new Uint8Array(valuesFlat.buffer);
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0] / bitRatio, size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
						}

						if (!this.hardcodeConstants) {
							this.setUniform3iv('constants_' + name + 'Dim', dim);
							this.setUniform2iv('constants_' + name + 'Size', size);
						}
						this.setUniform1i('constants_' + name + 'BitRatio', bitRatio);
						this.setUniform1i('constants_' + name, this.constantsLength);
						break;
					}
				case 'Input':
					{
						var input = value;
						var _dim4 = input.size;
						var _size4 = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, _dim4);
						gl.activeTexture(gl.TEXTURE0 + this.constantsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

						var _length2 = _size4[0] * _size4[1];

						var _formatArrayTransfer5 = this._formatArrayTransfer(value.value, _length2),
						    _valuesFlat2 = _formatArrayTransfer5.valuesFlat,
						    _bitRatio2 = _formatArrayTransfer5.bitRatio;

						if (this.floatTextures) {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _size4[0], _size4[1], 0, gl.RGBA, gl.FLOAT, inputArray);
						} else {
							var _buffer2 = new Uint8Array(_valuesFlat2.buffer);
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _size4[0] / _bitRatio2, _size4[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, _buffer2);
						}

						if (!this.hardcodeConstants) {
							this.setUniform3iv('constants_' + name + 'Dim', _dim4);
							this.setUniform2iv('constants_' + name + 'Size', _size4);
						}
						this.setUniform1i('constants_' + name + 'BitRatio', _bitRatio2);
						this.setUniform1i('constants_' + name, this.constantsLength);
						break;
					}
				case 'HTMLImage':
					{
						var inputImage = value;
						var _dim5 = [inputImage.width, inputImage.height, 1];
						var _size5 = [inputImage.width, inputImage.height];

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
						gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
						// Upload the image into the texture.
						var mipLevel = 0; // the largest mip
						var internalFormat = gl.RGBA; // format we want in the texture
						var srcFormat = gl.RGBA; // format of data we are supplying
						var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
						gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, inputImage);
						this.setUniform3iv('constants_' + name + 'Dim', _dim5);
						this.setUniform2iv('constants_' + name + 'Size', _size5);
						this.setUniform1i('constants_' + name, this.constantsLength);
						break;
					}
				case 'ArrayTexture(4)':
				case 'NumberTexture':
					{
						var inputTexture = value;
						var _dim6 = inputTexture.dimensions;
						var _size6 = inputTexture.size;

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength);
						gl.bindTexture(gl.TEXTURE_2D, inputTexture.texture);

						this.setUniform3iv('constants_' + name + 'Dim', _dim6);
						this.setUniform2iv('constants_' + name + 'Size', _size6);
						this.setUniform1i('constants_' + name + 'BitRatio', 1); // aways float32
						this.setUniform1i('constants_' + name, this.constantsLength);
						break;
					}
				case 'Integer':
				case 'Float':
				default:
					throw new Error('Input type not supported (WebGL): ' + value);
			}
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _formatArrayTransfer
   *
   * @desc Adds kernel parameters to the Argument Texture,
   * binding it to the webGl instance, etc.
   *
   * @param {Array} value - The actual argument supplied to the kernel
   * @param {String} length - the expected total length of the output array
   *
   * @returns {Object} bitRatio - bit storage ratio of source to target 'buffer', i.e. if 8bit array -> 32bit tex = 4
   * 				     valuesFlat - flattened array to transfer
   */

	}, {
		key: '_formatArrayTransfer',
		value: function _formatArrayTransfer(value, length) {
			var bitRatio = 1; // bit storage ratio of source to target 'buffer', i.e. if 8bit array -> 32bit tex = 4
			var valuesFlat = value;
			if (utils.isArray(value[0]) || this.floatTextures) {
				// not already flat
				valuesFlat = new Float32Array(length);
				utils.flattenTo(value, valuesFlat);
			} else {

				switch (value.constructor) {
					case Uint8Array:
					case Int8Array:
						bitRatio = 4;
						break;
					case Uint16Array:
					case Int16Array:
						bitRatio = 2;
					case Float32Array:
					case Int32Array:
						break;

					default:
						valuesFlat = new Float32Array(length);
						utils.flattenTo(value, valuesFlat);
				}
			}
			return {
				bitRatio: bitRatio,
				valuesFlat: valuesFlat
			};
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getHeaderString
   *
   * @desc Get the header string for the program.
   * This returns an empty string if no sub-kernels are defined.
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getHeaderString',
		value: function _getHeaderString() {
			return this.subKernels !== null || this.subKernelProperties !== null ?
			//webgl2 '#version 300 es\n' :
			'#extension GL_EXT_draw_buffers : require\n' : '';
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getLoopMaxString
   *
   * @desc Get the maximum loop size String.
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getLoopMaxString',
		value: function _getLoopMaxString() {
			return this.loopMaxIterations ? ' ' + parseInt(this.loopMaxIterations) + '.0;\n' : ' 1000.0;\n';
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getConstantsString
   *
   * @desc Generate transpiled glsl Strings for constant parameters sent to a kernel
   *
   * They can be defined by *hardcodeConstants*
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getConstantsString',
		value: function _getConstantsString() {
			var result = [];
			var threadDim = this.threadDim;
			var texSize = this.texSize;
			if (this.hardcodeConstants) {
				result.push('ivec3 uOutputDim = ivec3(' + threadDim[0] + ',' + threadDim[1] + ', ' + threadDim[2] + ')', 'ivec2 uTexSize = ivec2(' + texSize[0] + ', ' + texSize[1] + ')');
			} else {
				result.push('uniform ivec3 uOutputDim', 'uniform ivec2 uTexSize');
			}

			return this._linesToString(result);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getTextureCoordinate
   *
   * @desc Get texture coordinate string for the program
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getTextureCoordinate',
		value: function _getTextureCoordinate() {
			var names = this.subKernelOutputVariableNames;
			if (names === null || names.length < 1) {
				return 'varying vec2 vTexCoord;\n';
			} else {
				return 'out vec2 vTexCoord;\n';
			}
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getDecode32EndiannessString
   *
   * @desc Get Decode32 endianness string for little-endian and big-endian
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getDecode32EndiannessString',
		value: function _getDecode32EndiannessString() {
			return this.endianness === 'LE' ? '' : '  rgba.rgba = rgba.abgr;\n';
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getEncode32EndiannessString
   *
   * @desc Get Encode32 endianness string for little-endian and big-endian
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getEncode32EndiannessString',
		value: function _getEncode32EndiannessString() {
			return this.endianness === 'LE' ? '' : '  rgba.rgba = rgba.abgr;\n';
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getDivideWithIntegerCheckString
   *
   * @desc if fixIntegerDivisionAccuracy provide method to replace /
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getDivideWithIntegerCheckString',
		value: function _getDivideWithIntegerCheckString() {
			return this.fixIntegerDivisionAccuracy ? '\n\t\t\t  float div_with_int_check(float x, float y) {\n\t\t\t  if (floor(x) == x && floor(y) == y && integerMod(x, y) == 0.0) {\n\t\t\t    return float(int(x)/int(y));\n\t\t\t  }\n\t\t\t  return x / y;\n\t\t\t}\n\t\t\t' : '';
		}

		/**
   * @function
   * @memberOf WebGLKernel#
   * @name _getGetWraparoundString
   *
   * @returns {String} wraparound string
   */

	}, {
		key: '_getGetWraparoundString',
		value: function _getGetWraparoundString() {
			return this.wraparound ? '  xyz = mod(xyz, texDim);\n' : '';
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getGetTextureChannelString
   *
   */

	}, {
		key: '_getGetTextureChannelString',
		value: function _getGetTextureChannelString() {
			if (!this.floatTextures) return '';

			return this._linesToString(['  int channel = integerMod(index, 4)', '  index = index / 4']);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getGetTextureIndexString
   *
   * @desc Get generic texture index string, if floatTextures flag is true.
   *
   * @example
   * '  index = float(int(index)/4);\n'
   *
   */

	}, {
		key: '_getGetTextureIndexString',
		value: function _getGetTextureIndexString() {
			return this.floatTextures ? '  index = index / 4;\n' : '';
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getGetResultString
   *
   */

	}, {
		key: '_getGetResultString',
		value: function _getGetResultString() {
			if (!this.floatTextures) {
				return '  return decode(texel, x, bitRatio);';
			}
			return this._linesToString(['  if (channel == 0) return texel.r', '  if (channel == 1) return texel.g', '  if (channel == 2) return texel.b', '  if (channel == 3) return texel.a']);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getMainParamsString
   *
   * @desc Generate transpiled glsl Strings for user-defined parameters sent to a kernel
   *
   * @param {Array} args - The actual parameters sent to the Kernel
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getMainParamsString',
		value: function _getMainParamsString(args) {
			var result = [];
			var paramTypes = this.paramTypes;
			var paramNames = this.paramNames;
			for (var i = 0; i < paramNames.length; i++) {
				var param = args[i];
				var paramName = paramNames[i];
				var paramType = paramTypes[i];
				if (this.hardcodeConstants) {
					if (paramType === 'Array' || paramType === 'NumberTexture' || paramType === 'ArrayTexture(4)') {
						var paramDim = utils.getDimensions(param, true);
						var paramSize = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, paramDim);

						result.push('uniform sampler2D user_' + paramName, 'ivec2 user_' + paramName + 'Size = ivec2(' + paramSize[0] + ', ' + paramSize[1] + ')', 'ivec3 user_' + paramName + 'Dim = ivec3(' + paramDim[0] + ', ' + paramDim[1] + ', ' + paramDim[2] + ')', 'uniform int user_' + paramName + 'BitRatio');
					} else if (paramType === 'Integer') {
						result.push('float user_' + paramName + ' = ' + param + '.0');
					} else if (paramType === 'Float') {
						result.push('float user_' + paramName + ' = ' + param);
					}
				} else {
					if (paramType === 'Array' || paramType === 'NumberTexture' || paramType === 'ArrayTexture(4)' || paramType === 'Input' || paramType === 'HTMLImage') {
						result.push('uniform sampler2D user_' + paramName, 'uniform ivec2 user_' + paramName + 'Size', 'uniform ivec3 user_' + paramName + 'Dim');
						if (paramType !== 'HTMLImage') {
							result.push('uniform int user_' + paramName + 'BitRatio');
						}
					} else if (paramType === 'Integer' || paramType === 'Float') {
						result.push('uniform float user_' + paramName);
					} else {
						throw new Error('Param type ' + paramType + ' not supported in WebGL, only WebGL2');
					}
				}
			}
			return this._linesToString(result);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getMainConstantsString
   *
   */

	}, {
		key: '_getMainConstantsString',
		value: function _getMainConstantsString() {
			var result = [];
			if (this.constants) {
				for (var name in this.constants) {
					if (!this.constants.hasOwnProperty(name)) continue;
					var value = this.constants[name];
					var type = utils.getArgumentType(value);
					switch (type) {
						case 'Integer':
							result.push('const float constants_' + name + ' = ' + parseInt(value) + '.0');
							break;
						case 'Float':
							result.push('const float constants_' + name + ' = ' + parseFloat(value));
							break;
						case 'Array':
						case 'Input':
						case 'HTMLImage':
						case 'NumberTexture':
						case 'ArrayTexture(4)':
							result.push('uniform sampler2D constants_' + name, 'uniform ivec2 constants_' + name + 'Size', 'uniform ivec3 constants_' + name + 'Dim', 'uniform int constants_' + name + 'BitRatio');
							break;
						default:
							throw new Error('Unsupported constant ' + name + ' type ' + type);
					}
				}
			}
			return this._linesToString(result);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getKernelString
   *
   * @desc Get Kernel program string (in *glsl*) for a kernel.
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getKernelString',
		value: function _getKernelString() {
			var result = [];
			var names = this.subKernelOutputVariableNames;
			if (names !== null) {
				result.push('float kernelResult = 0.0');
				for (var i = 0; i < names.length; i++) {
					result.push('float ' + names[i] + ' = 0.0');
				}
			} else {
				result.push('float kernelResult = 0.0');
			}

			return this._linesToString(result) + this.functionBuilder.getPrototypeString('kernel');
		}

		/**
   *
   * @memberOf WebGLKernel#
   * @function
   * @name _getMainResultString
   *
   * @desc Get main result string with checks for floatOutput, graphical, subKernelsOutputs, etc.
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getMainResultString',
		value: function _getMainResultString() {
			var names = this.subKernelOutputVariableNames;
			var result = [];

			if (this.floatOutput) {
				result.push('  index *= 4');
			}

			if (this.graphical) {
				result.push('  threadId = indexTo3D(index, uOutputDim)', '  kernel()', '  gl_FragColor = actualColor');
			} else if (this.floatOutput) {
				var channels = ['r', 'g', 'b', 'a'];

				for (var i = 0; i < channels.length; ++i) {
					result.push('  threadId = indexTo3D(index, uOutputDim)');
					result.push('  kernel()');

					if (names) {
						result.push('  gl_FragData[0].' + channels[i] + ' = kernelResult');

						for (var j = 0; j < names.length; ++j) {
							result.push('  gl_FragData[' + (j + 1) + '].' + channels[i] + ' = ' + names[j]);
						}
					} else {
						result.push('  gl_FragColor.' + channels[i] + ' = kernelResult');
					}

					if (i < channels.length - 1) {
						result.push('  index += 1');
					}
				}
			} else if (names !== null) {
				result.push('  threadId = indexTo3D(index, uOutputDim)');
				result.push('  kernel()');
				result.push('  gl_FragData[0] = encode32(kernelResult)');
				for (var _i2 = 0; _i2 < names.length; _i2++) {
					result.push('  gl_FragData[' + (_i2 + 1) + '] = encode32(' + names[_i2] + ')');
				}
			} else {
				result.push('  threadId = indexTo3D(index, uOutputDim)', '  kernel()', '  gl_FragColor = encode32(kernelResult)');
			}

			return this._linesToString(result);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _linesToString
   *
   * @param {Array} lines - An Array of strings
   *
   * @returns {String} Single combined String, seperated by *\n*
   *
   */

	}, {
		key: '_linesToString',
		value: function _linesToString(lines) {
			if (lines.length > 0) {
				return lines.join(';\n') + ';\n';
			} else {
				return '\n';
			}
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _replaceArtifacts
   *
   * @param {String} src - Shader string
   * @param {Array} map - Variables/Constants associated with shader
   *
   */

	}, {
		key: '_replaceArtifacts',
		value: function _replaceArtifacts(src, map) {
			return src.replace(/[ ]*__([A-Z]+[0-9]*([_]?[A-Z])*)__;\n/g, function (match, artifact) {
				if (map.hasOwnProperty(artifact)) {
					return map[artifact];
				}
				throw 'unhandled artifact ' + artifact;
			});
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _addKernels
   *
   * @desc Adds all the sub-kernels supplied with this Kernel instance.
   *
   */

	}, {
		key: '_addKernels',
		value: function _addKernels() {
			var _this2 = this;

			var builder = this.functionBuilder;
			var gl = this._webGl;

			builder.addFunctions(this.functions, {
				constants: this.constants,
				output: this.output
			});
			builder.addNativeFunctions(this.nativeFunctions);

			builder.addKernel(this.fnString, {
				prototypeOnly: false,
				constants: this.constants,
				output: this.output,
				debug: this.debug,
				loopMaxIterations: this.loopMaxIterations,
				paramNames: this.paramNames,
				paramTypes: this.paramTypes,
				constantTypes: this.constantTypes,
				fixIntegerDivisionAccuracy: this.fixIntegerDivisionAccuracy
			});

			if (this.subKernels !== null) {
				var drawBuffers = this.drawBuffers = gl.getExtension('WEBGL_draw_buffers');
				if (!drawBuffers) throw new Error('could not instantiate draw buffers extension');
				this.subKernelOutputVariableNames = [];
				this.subKernels.forEach(function (subKernel) {
					return _this2._addSubKernel(subKernel);
				});
			} else if (this.subKernelProperties !== null) {
				var _drawBuffers = this.drawBuffers = gl.getExtension('WEBGL_draw_buffers');
				if (!_drawBuffers) throw new Error('could not instantiate draw buffers extension');
				this.subKernelOutputVariableNames = [];
				Object.keys(this.subKernelProperties).forEach(function (property) {
					return _this2._addSubKernel(_this2.subKernelProperties[property]);
				});
			}
		}
	}, {
		key: '_addSubKernel',
		value: function _addSubKernel(subKernel) {
			this.functionBuilder.addSubKernel(subKernel, {
				prototypeOnly: false,
				constants: this.constants,
				output: this.output,
				debug: this.debug,
				loopMaxIterations: this.loopMaxIterations,
				fixIntegerDivisionAccuracy: this.fixIntegerDivisionAccuracy
			});
			this.subKernelOutputVariableNames.push(subKernel.name + 'Result');
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getFragShaderString
   *
   * @desc Get the fragment shader String.
   * If the String hasn't been compiled yet,
   * then this method compiles it as well
   *
   * @param {Array} args - The actual parameters sent to the Kernel
   *
   * @returns {string} Fragment Shader string
   *
   */

	}, {
		key: '_getFragShaderString',
		value: function _getFragShaderString(args) {
			if (this.compiledFragShaderString !== null) {
				return this.compiledFragShaderString;
			}
			return this.compiledFragShaderString = this._replaceArtifacts(this.constructor.fragShaderString, this._getFragShaderArtifactMap(args));
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getVertShaderString
   *
   * @desc Get the vertical shader String
   *
   * @param {Array} args - The actual parameters sent to the Kernel
   *
   * @returns {string} Vertical Shader string
   *
   */

	}, {
		key: '_getVertShaderString',
		value: function _getVertShaderString(args) {
			if (this.compiledVertShaderString !== null) {
				return this.compiledVertShaderString;
			}
			return this.compiledVertShaderString = this.constructor.vertShaderString;
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name toString
   *
   * @desc Returns the *pre-compiled* Kernel as a JS Object String, that can be reused.
   *
   */

	}, {
		key: 'toString',
		value: function toString() {
			return kernelString(this);
		}
	}, {
		key: 'addFunction',
		value: function addFunction(fn) {
			this.functionBuilder.addFunction(null, fn);
		}
	}, {
		key: 'destroy',
		value: function destroy(removeCanvasReferences) {
			_get(WebGLKernel.prototype.__proto__ || Object.getPrototypeOf(WebGLKernel.prototype), 'destroy', this).call(this);
			if (this.outputTexture) {
				this._webGl.deleteTexture(this.outputTexture);
			}
			if (this.buffer) {
				this._webGl.deleteBuffer(this.buffer);
			}
			if (this.framebuffer) {
				this._webGl.deleteFramebuffer(this.framebuffer);
			}

			if (this.vertShader) {
				this._webGl.deleteShader(this.vertShader);
			}

			if (this.fragShader) {
				this._webGl.deleteShader(this.fragShader);
			}

			if (this.program) {
				this._webGl.deleteProgram(this.program);
			}

			var keys = Object.keys(this.textureCache);

			for (var i = 0; i < keys.length; i++) {
				var name = keys[i];
				this._webGl.deleteTexture(this.textureCache[name]);
			}

			if (this.subKernelOutputTextures) {
				for (var _i3 = 0; _i3 < this.subKernelOutputTextures.length; _i3++) {
					this._webGl.deleteTexture(this.subKernelOutputTextures[_i3]);
				}
			}
			if (removeCanvasReferences) {
				var idx = canvases.indexOf(this._canvas);
				if (idx >= 0) {
					canvases[idx] = null;
					maxTexSizes[idx] = null;
				}
			}
			delete this._webGl;
		}
	}]);

	return WebGLKernel;
}(KernelBase);
},{"../../core/texture":30,"../../core/utils":32,"../kernel-base":8,"./kernel-string":13,"./shader-frag":16,"./shader-vert":17}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RunnerBase = require('../runner-base');
var WebGLKernel = require('./kernel');
var WebGLFunctionBuilder = require('./function-builder');

module.exports = function (_RunnerBase) {
	_inherits(WebGLRunner, _RunnerBase);

	/**
  * @constructor WebGLRunner
  *
 	 * @extends RunnerBase
  	 * @desc Instantiates a Runner instance for the kernel.
  * 
  * @param {Object} settings - Settings to instantiate properties in RunnerBase, with given values
  *
  */
	function WebGLRunner(settings) {
		_classCallCheck(this, WebGLRunner);

		var _this = _possibleConstructorReturn(this, (WebGLRunner.__proto__ || Object.getPrototypeOf(WebGLRunner)).call(this, new WebGLFunctionBuilder(), settings));

		_this.Kernel = WebGLKernel;
		_this.kernel = null;
		return _this;
	}

	/**
  * @memberOf WebGLRunner#
  * @function
  * @name getMode
  *
  * @desc Return the current mode in which gpu.js is executing.
  * 
  * @returns {String} The current mode; "cpu".
  *
  */


	_createClass(WebGLRunner, [{
		key: 'getMode',
		value: function getMode() {
			return 'gpu';
		}
	}]);

	return WebGLRunner;
}(RunnerBase);
},{"../runner-base":10,"./function-builder":11,"./kernel":14}],16:[function(require,module,exports){
"use strict";

module.exports = "__HEADER__;\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\nconst float LOOP_MAX = __LOOP_MAX__;\n\n__CONSTANTS__;\n\nvarying vec2 vTexCoord;\n\nvec4 round(vec4 x) {\n  return floor(x + 0.5);\n}\n\nfloat round(float x) {\n  return floor(x + 0.5);\n}\n\nvec2 integerMod(vec2 x, float y) {\n  vec2 res = floor(mod(x, y));\n  return res * step(1.0 - floor(y), -res);\n}\n\nvec3 integerMod(vec3 x, float y) {\n  vec3 res = floor(mod(x, y));\n  return res * step(1.0 - floor(y), -res);\n}\n\nvec4 integerMod(vec4 x, vec4 y) {\n  vec4 res = floor(mod(x, y));\n  return res * step(1.0 - floor(y), -res);\n}\n\nfloat integerMod(float x, float y) {\n  float res = floor(mod(x, y));\n  return res * (res > floor(y) - 1.0 ? 0.0 : 1.0);\n}\n\nint integerMod(int x, int y) {\n  return x - (y * int(x / y));\n}\n\n__DIVIDE_WITH_INTEGER_CHECK__;\n\n// Here be dragons!\n// DO NOT OPTIMIZE THIS CODE\n// YOU WILL BREAK SOMETHING ON SOMEBODY'S MACHINE\n// LEAVE IT AS IT IS, LEST YOU WASTE YOUR OWN TIME\nconst vec2 MAGIC_VEC = vec2(1.0, -256.0);\nconst vec4 SCALE_FACTOR = vec4(1.0, 256.0, 65536.0, 0.0);\nconst vec4 SCALE_FACTOR_INV = vec4(1.0, 0.00390625, 0.0000152587890625, 0.0); // 1, 1/256, 1/65536\nfloat decode32(vec4 rgba) {\n  __DECODE32_ENDIANNESS__;\n  rgba *= 255.0;\n  vec2 gte128;\n  gte128.x = rgba.b >= 128.0 ? 1.0 : 0.0;\n  gte128.y = rgba.a >= 128.0 ? 1.0 : 0.0;\n  float exponent = 2.0 * rgba.a - 127.0 + dot(gte128, MAGIC_VEC);\n  float res = exp2(round(exponent));\n  rgba.b = rgba.b - 128.0 * gte128.x;\n  res = dot(rgba, SCALE_FACTOR) * exp2(round(exponent-23.0)) + res;\n  res *= gte128.y * -2.0 + 1.0;\n  return res;\n}\n\nvec4 encode32(float f) {\n  float F = abs(f);\n  float sign = f < 0.0 ? 1.0 : 0.0;\n  float exponent = floor(log2(F));\n  float mantissa = (exp2(-exponent) * F);\n  // exponent += floor(log2(mantissa));\n  vec4 rgba = vec4(F * exp2(23.0-exponent)) * SCALE_FACTOR_INV;\n  rgba.rg = integerMod(rgba.rg, 256.0);\n  rgba.b = integerMod(rgba.b, 128.0);\n  rgba.a = exponent*0.5 + 63.5;\n  rgba.ba += vec2(integerMod(exponent+127.0, 2.0), sign) * 128.0;\n  rgba = floor(rgba);\n  rgba *= 0.003921569; // 1/255\n  __ENCODE32_ENDIANNESS__;\n  return rgba;\n}\n// Dragons end here\n\nfloat decode(vec4 rgba, int x, int bitRatio) {\n  if (bitRatio == 1) {\n    return decode32(rgba);\n  }\n  __DECODE32_ENDIANNESS__;\n  int channel = integerMod(x, bitRatio);\n  if (bitRatio == 4) {\n    if (channel == 0) return rgba.r * 255.0;\n    if (channel == 1) return rgba.g * 255.0;\n    if (channel == 2) return rgba.b * 255.0;\n    if (channel == 3) return rgba.a * 255.0;\n  }\n  else {\n    if (channel == 0) return rgba.r * 255.0 + rgba.g * 65280.0;\n    if (channel == 1) return rgba.b * 255.0 + rgba.a * 65280.0;\n  }\n}\n\nint index;\nivec3 threadId;\n\nivec3 indexTo3D(int idx, ivec3 texDim) {\n  int z = int(idx / (texDim.x * texDim.y));\n  idx -= z * int(texDim.x * texDim.y);\n  int y = int(idx / texDim.x);\n  int x = int(integerMod(idx, texDim.x));\n  return ivec3(x, y, z);\n}\n\nfloat get(sampler2D tex, ivec2 texSize, ivec3 texDim, int bitRatio,  int z, int y, int x) {\n  ivec3 xyz = ivec3(x, y, z);\n  __GET_WRAPAROUND__;\n  int index = xyz.x + texDim.x * (xyz.y + texDim.y * xyz.z);\n  __GET_TEXTURE_CHANNEL__;\n  int w = texSize.x;\n  vec2 st = vec2(float(integerMod(index, w)), float(index / w)) + 0.5;\n  __GET_TEXTURE_INDEX__;\n  vec4 texel = texture2D(tex, st / vec2(texSize));\n  __GET_RESULT__;\n  \n}\n\nvec4 getImage2D(sampler2D tex, ivec2 texSize, ivec3 texDim, int z, int y, int x) {\n  ivec3 xyz = ivec3(x, y, z);\n  __GET_WRAPAROUND__;\n  int index = xyz.x + texDim.x * (xyz.y + texDim.y * xyz.z);\n  __GET_TEXTURE_CHANNEL__;\n  int w = texSize.x;\n  vec2 st = vec2(float(integerMod(index, w)), float(index / w)) + 0.5;\n  __GET_TEXTURE_INDEX__;\n  return texture2D(tex, st / vec2(texSize));\n}\n\nfloat get(sampler2D tex, ivec2 texSize, ivec3 texDim, int bitRatio, int y, int x) {\n  return get(tex, texSize, texDim, bitRatio, int(0), y, x);\n}\n\nvec4 getImage2D(sampler2D tex, ivec2 texSize, ivec3 texDim, int y, int x) {\n  return getImage2D(tex, texSize, texDim, int(0), y, x);\n}\n\nfloat get(sampler2D tex, ivec2 texSize, ivec3 texDim, int bitRatio, int x) {\n  return get(tex, texSize, texDim, bitRatio, int(0), int(0), x);\n}\n\nvec4 getImage2D(sampler2D tex, ivec2 texSize, ivec3 texDim, int x) {\n  return getImage2D(tex, texSize, texDim, int(0), int(0), x);\n}\n\n\nvec4 actualColor;\nvoid color(float r, float g, float b, float a) {\n  actualColor = vec4(r,g,b,a);\n}\n\nvoid color(float r, float g, float b) {\n  color(r,g,b,1.0);\n}\n\nvoid color(sampler2D image) {\n  actualColor = texture2D(image, vTexCoord);\n}\n\n__MAIN_PARAMS__;\n__MAIN_CONSTANTS__;\n__KERNEL__;\n\nvoid main(void) {\n  index = int(vTexCoord.s * float(uTexSize.x)) + int(vTexCoord.t * float(uTexSize.y)) * uTexSize.x;\n  __MAIN_RESULT__;\n}";
},{}],17:[function(require,module,exports){
"use strict";

module.exports = "precision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\nattribute vec2 aPos;\nattribute vec2 aTexCoord;\n\nvarying vec2 vTexCoord;\nuniform vec2 ratio;\n\nvoid main(void) {\n  gl_Position = vec4((aPos + vec2(1)) * ratio + vec2(-1), 0, 1);\n  vTexCoord = aTexCoord;\n}";
},{}],18:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebGLKernel = require('./kernel');
var utils = require('../../core/utils');

/**
 * @class WebGLValidatorKernel
 *
 * @desc Helper class for WebGLKernel to validate texture size and dimensions.
 *
 */
module.exports = function (_WebGLKernel) {
	_inherits(WebGLValidatorKernel, _WebGLKernel);

	function WebGLValidatorKernel() {
		_classCallCheck(this, WebGLValidatorKernel);

		return _possibleConstructorReturn(this, (WebGLValidatorKernel.__proto__ || Object.getPrototypeOf(WebGLValidatorKernel)).apply(this, arguments));
	}

	_createClass(WebGLValidatorKernel, [{
		key: 'validateOptions',


		/** 
   * @memberOf WebGLValidatorKernel#
   * @function
   * @name validateOptions
   *
   */
		value: function validateOptions() {
			this.texSize = utils.dimToTexSize({
				floatTextures: this.floatTextures,
				floatOutput: this.floatOutput
			}, this.output, true);
		}
	}]);

	return WebGLValidatorKernel;
}(WebGLKernel);
},{"../../core/utils":32,"./kernel":14}],19:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FunctionBuilderBase = require('../function-builder-base');
var WebGL2FunctionNode = require('./function-node');

/**
 * @class WebGLFunctionBuilder
 *
 * @extends FunctionBuilderBase
 *
 * @desc Builds webGl functions (shaders) from JavaScript function Strings
 *
 */
module.exports = function (_FunctionBuilderBase) {
  _inherits(WebGL2FunctionBuilder, _FunctionBuilderBase);

  function WebGL2FunctionBuilder() {
    _classCallCheck(this, WebGL2FunctionBuilder);

    var _this = _possibleConstructorReturn(this, (WebGL2FunctionBuilder.__proto__ || Object.getPrototypeOf(WebGL2FunctionBuilder)).call(this));

    _this.Node = WebGL2FunctionNode;
    return _this;
  }

  return WebGL2FunctionBuilder;
}(FunctionBuilderBase);
},{"../function-builder-base":6,"./function-node":20}],20:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebGLFunctionNode = require('../web-gl/function-node');
var DECODE32_ENCODE32 = /decode32\(\s+encode32\(/g;
var ENCODE32_DECODE32 = /encode32\(\s+decode32\(/g;

/** 
 * @class WebGL2FunctionNode
 *
 * @desc [INTERNAL] Takes in a function node, and does all the AST voodoo required to generate its respective webGL code.
 *
 * @extends WebGLFunctionNode
 *
 * @returns the converted webGL function string
 *
 */
module.exports = function (_WebGLFunctionNode) {
	_inherits(WebGL2FunctionNode, _WebGLFunctionNode);

	function WebGL2FunctionNode() {
		_classCallCheck(this, WebGL2FunctionNode);

		return _possibleConstructorReturn(this, (WebGL2FunctionNode.__proto__ || Object.getPrototypeOf(WebGL2FunctionNode)).apply(this, arguments));
	}

	_createClass(WebGL2FunctionNode, [{
		key: 'generate',
		value: function generate() {
			if (this.debug) {
				console.log(this);
			}
			if (this.prototypeOnly) {
				return this.astFunctionPrototype(this.getJsAST(), []).join('').trim();
			} else {
				this.functionStringArray = this.astGeneric(this.getJsAST(), []);
			}
			this.functionString = webGlRegexOptimize(this.functionStringArray.join('').trim());
			return this.functionString;
		}

		/**
   * @memberOf WebGL2FunctionNode#
   * @function
   * @name astIdentifierExpression
   *
   * @desc Parses the abstract syntax tree for *identifier* expression
   *
   * @param {Object} idtNode - An ast Node
   * @param {Array} retArr - return array string
   *
   * @returns {Array} the append retArr
   */

	}, {
		key: 'astIdentifierExpression',
		value: function astIdentifierExpression(idtNode, retArr) {
			if (idtNode.type !== 'Identifier') {
				throw this.astErrorOutput('IdentifierExpression - not an Identifier', idtNode);
			}

			// do we need to cast addressing vales to float?
			var castFloat = !this.isState('in-get-call-parameters');

			switch (idtNode.name) {
				case 'gpu_threadX':
					castFloat && retArr.push('float(');
					retArr.push('threadId.x');
					castFloat && retArr.push(')');
					break;
				case 'gpu_threadY':
					castFloat && retArr.push('float(');
					retArr.push('threadId.y');
					castFloat && retArr.push(')');
					break;
				case 'gpu_threadZ':
					castFloat && retArr.push('float(');
					retArr.push('threadId.z');
					castFloat && retArr.push(')');
					break;
				case 'gpu_outputX':
					retArr.push('uOutputDim.x');
					break;
				case 'gpu_outputY':
					retArr.push('uOutputDim.y');
					break;
				case 'gpu_outputZ':
					retArr.push('uOutputDim.z');
					break;
				case 'Infinity':
					retArr.push('intBitsToFloat(2139095039)');
					break;
				default:
					var userParamName = this.getUserParamName(idtNode.name);
					if (userParamName !== null) {
						this.pushParameter(retArr, 'user_' + userParamName);
					} else {
						this.pushParameter(retArr, 'user_' + idtNode.name);
					}
			}

			return retArr;
		}
	}]);

	return WebGL2FunctionNode;
}(WebGLFunctionNode);

/**
 * @ignore
 * @function
 * @name webgl_regex_optimize
 *
 * @desc [INTERNAL] Takes the near final webgl function string, and do regex search and replacments.
 * For voodoo optimize out the following: 
 *
 * - decode32(encode32( <br>
 * - encode32(decode32( <br>
 *
 * @param {String} inStr - The webGl function String
 *
 */
function webGlRegexOptimize(inStr) {
	return inStr.replace(DECODE32_ENCODE32, '((').replace(ENCODE32_DECODE32, '((');
}
},{"../web-gl/function-node":12}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebGLKernel = require('../web-gl/kernel');
var utils = require('../../core/utils');
var Texture = require('../../core/texture');
var fragShaderString = require('./shader-frag');
var vertShaderString = require('./shader-vert');

module.exports = function (_WebGLKernel) {
	_inherits(WebGL2Kernel, _WebGLKernel);

	function WebGL2Kernel() {
		_classCallCheck(this, WebGL2Kernel);

		return _possibleConstructorReturn(this, (WebGL2Kernel.__proto__ || Object.getPrototypeOf(WebGL2Kernel)).apply(this, arguments));
	}

	_createClass(WebGL2Kernel, [{
		key: 'initWebGl',
		value: function initWebGl() {
			return utils.initWebGl2(this.getCanvas());
		}
		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name validateOptions
   *
   * @desc Validate options related to Kernel, such as
   * floatOutputs and Textures, texSize, output,
   * graphical output.
   *
   */

	}, {
		key: 'validateOptions',
		value: function validateOptions() {
			var isFloatReadPixel = utils.isFloatReadPixelsSupportedWebGL2();
			if (this.floatOutput === true && this.floatOutputForce !== true && !isFloatReadPixel) {
				throw new Error('Float texture outputs are not supported on this browser');
			} else if (this.floatTextures === undefined) {
				this.floatTextures = true;
				this.floatOutput = isFloatReadPixel;
			}

			var hasIntegerDivisionBug = utils.hasIntegerDivisionAccuracyBug();
			if (this.fixIntegerDivisionAccuracy === null) {
				this.fixIntegerDivisionAccuracy = hasIntegerDivisionBug;
			} else if (this.fixIntegerDivisionAccuracy && !hasIntegerDivisionBug) {
				this.fixIntegerDivisionAccuracy = false;
			}

			utils.checkOutput(this.output);

			if (!this.output || this.output.length === 0) {
				if (arguments.length !== 1) {
					throw new Error('Auto output only supported for kernels with only one input');
				}

				var argType = utils.getArgumentType(arguments[0]);
				if (argType === 'Array') {
					this.output = utils.getDimensions(argType);
				} else if (argType === 'NumberTexture' || argType === 'ArrayTexture(4)') {
					this.output = arguments[0].output;
				} else {
					throw new Error('Auto output not supported for input type: ' + argType);
				}
			}

			this.texSize = utils.dimToTexSize({
				floatTextures: this.floatTextures,
				floatOutput: this.floatOutput
			}, this.output, true);

			if (this.graphical) {
				if (this.output.length !== 2) {
					throw new Error('Output must have 2 dimensions on graphical mode');
				}

				if (this.floatOutput) {
					this.floatOutput = false;
					console.warn('Cannot use graphical mode and float output at the same time');
				}

				this.texSize = utils.clone(this.output);
			} else if (this.floatOutput === undefined) {
				this.floatOutput = true;
			}

			if (this.floatOutput || this.floatOutputForce) {
				this._webGl.getExtension('EXT_color_buffer_float');
			}
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name run
   *
   * @desc Run the kernel program, and send the output to renderOutput
   *
   * <p> This method calls a helper method *renderOutput* to return the result. </p>
   *
   * @returns {Object|Undefined} Result The final output of the program, as float, and as Textures for reuse.
   *
   *
   */

	}, {
		key: 'run',
		value: function run() {
			if (this.program === null) {
				this.build.apply(this, arguments);
			}
			var paramNames = this.paramNames;
			var paramTypes = this.paramTypes;
			var texSize = this.texSize;
			var gl = this._webGl;

			gl.useProgram(this.program);
			gl.scissor(0, 0, texSize[0], texSize[1]);

			if (!this.hardcodeConstants) {
				this.setUniform3iv('uOutputDim', new Int32Array(this.threadDim));
				this.setUniform2iv('uTexSize', texSize);
			}

			this.setUniform2f('ratio', texSize[0] / this.maxTexSize[0], texSize[1] / this.maxTexSize[1]);

			this.argumentsLength = 0;
			for (var texIndex = 0; texIndex < paramNames.length; texIndex++) {
				this._addArgument(arguments[texIndex], paramTypes[texIndex], paramNames[texIndex]);
			}

			if (this.graphical) {
				if (this.outputToTexture) {
					gl.bindRenderbuffer(gl.RENDERBUFFER, null);
					gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
					if (!this.outputTexture || this.outputImmutable) {
						this._setupOutputTexture();
					}
					gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
					return new Texture(this.outputTexture, texSize, this.threadDim, this.output, this._webGl, 'ArrayTexture(4)');
				}
				gl.bindRenderbuffer(gl.RENDERBUFFER, null);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
				return;
			}

			gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
			if (this.outputImmutable) {
				this._setupOutputTexture();
			}
			var outputTexture = this.outputTexture;

			if (this.subKernelOutputVariableNames !== null) {
				if (this.outputImmutable) {
					this.subKernelOutputTextures = [];
					this._setupSubOutputTextures(this.subKernelOutputVariableNames.length);
				}
				gl.drawBuffers(this.drawBuffersMap);
			}

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			if (this.subKernelOutputTextures !== null) {
				if (this.subKernels !== null) {
					var output = [];
					output.result = this.renderOutput(outputTexture);
					for (var i = 0; i < this.subKernels.length; i++) {
						output.push(new Texture(this.subKernelOutputTextures[i], texSize, this.threadDim, this.output, this._webGl));
					}
					return output;
				} else if (this.subKernelProperties !== null) {
					var _output = {
						result: this.renderOutput(outputTexture)
					};
					var _i = 0;
					for (var p in this.subKernelProperties) {
						if (!this.subKernelProperties.hasOwnProperty(p)) continue;
						_output[p] = new Texture(this.subKernelOutputTextures[_i], texSize, this.threadDim, this.output, this._webGl);
						_i++;
					}
					return _output;
				}
			}

			return this.renderOutput(outputTexture);
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name getOutputTexture
   *
   * @desc This return defined outputTexture, which is setup in .build(), or if immutable, is defined in .run()
   *
   * @returns {Object} Output Texture Cache
   *
   */

	}, {
		key: 'getOutputTexture',
		value: function getOutputTexture() {
			return this.outputTexture;
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _setupOutputTexture
   * @private
   *
   * @desc Setup and replace output texture
   */

	}, {
		key: '_setupOutputTexture',
		value: function _setupOutputTexture() {
			var gl = this._webGl;
			var texSize = this.texSize;
			var texture = this.outputTexture = this._webGl.createTexture();
			gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.paramNames.length);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			if (this.floatOutput) {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, texSize[0], texSize[1], 0, gl.RGBA, gl.FLOAT, null);
			} else {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize[0], texSize[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			}
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		}

		/**
   * @memberOf WebGL2Kernel#
   * @param length
   * @private
   *
   * @desc Setup and replace sub-output textures
   */

	}, {
		key: '_setupSubOutputTextures',
		value: function _setupSubOutputTextures(length) {
			var gl = this._webGl;
			var texSize = this.texSize;
			var drawBuffersMap = this.drawBuffersMap = [gl.COLOR_ATTACHMENT0];
			var textures = this.subKernelOutputTextures = [];
			for (var i = 0; i < length; i++) {
				var texture = this._webGl.createTexture();
				textures.push(texture);
				drawBuffersMap.push(gl.COLOR_ATTACHMENT0 + i + 1);
				gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.paramNames.length + i);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				if (this.floatOutput) {
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, texSize[0], texSize[1], 0, gl.RGBA, gl.FLOAT, null);
				} else {
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize[0], texSize[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
				}
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i + 1, gl.TEXTURE_2D, texture, 0);
			}
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _addArgument
   *
   * @desc Adds kernel parameters to the Argument Texture,
   * binding it to the webGl instance, etc.
   *
   * @param {Array|Texture|Number} value - The actual argument supplied to the kernel
   * @param {String} type - Type of the argument
   * @param {String} name - Name of the argument
   *
   */

	}, {
		key: '_addArgument',
		value: function _addArgument(value, type, name) {
			var gl = this._webGl;
			var argumentTexture = this.getArgumentTexture(name);
			if (value instanceof Texture) {
				type = value.type;
			}
			switch (type) {
				case 'Array':
					{
						var dim = utils.getDimensions(value, true);
						var size = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, dim);
						gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.argumentsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

						var length = size[0] * size[1];

						var _formatArrayTransfer = this._formatArrayTransfer(value, length),
						    valuesFlat = _formatArrayTransfer.valuesFlat,
						    bitRatio = _formatArrayTransfer.bitRatio;

						var buffer = void 0;
						if (this.floatTextures) {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size[0], size[1], 0, gl.RGBA, gl.FLOAT, valuesFlat);
						} else {
							buffer = new Uint8Array(valuesFlat.buffer);
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0] / bitRatio, size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
						}

						if (!this.hardcodeConstants) {
							this.setUniform3iv('user_' + name + 'Dim', dim);
							this.setUniform2iv('user_' + name + 'Size', size);
						}
						this.setUniform1i('user_' + name + 'BitRatio', bitRatio);
						this.setUniform1i('user_' + name, this.argumentsLength);
						break;
					}
				case 'Integer':
				case 'Float':
				case 'Number':
					{
						this.setUniform1f('user_' + name, value);
						break;
					}
				case 'Input':
					{
						var input = value;
						var _dim = input.size;
						var _size = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, _dim);
						gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.argumentsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

						var _length = _size[0] * _size[1];

						var _formatArrayTransfer2 = this._formatArrayTransfer(value.value, _length),
						    _valuesFlat = _formatArrayTransfer2.valuesFlat,
						    _bitRatio = _formatArrayTransfer2.bitRatio;

						if (this.floatTextures) {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, _size[0], _size[1], 0, gl.RGBA, gl.FLOAT, inputArray);
						} else {
							var _buffer = new Uint8Array(_valuesFlat.buffer);
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _size[0] / _bitRatio, _size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, _buffer);
						}

						if (!this.hardcodeConstants) {
							this.setUniform3iv('user_' + name + 'Dim', _dim);
							this.setUniform2iv('user_' + name + 'Size', _size);
						}
						this.setUniform1i('user_' + name + 'BitRatio', _bitRatio);
						this.setUniform1i('user_' + name, this.argumentsLength);
						break;
					}
				case 'HTMLImage':
					{
						var inputImage = value;
						var _dim2 = [inputImage.width, inputImage.height, 1];
						var _size2 = [inputImage.width, inputImage.height];

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.argumentsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
						gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
						// Upload the image into the texture.
						var mipLevel = 0; // the largest mip
						var internalFormat = gl.RGBA; // format we want in the texture
						var srcFormat = gl.RGBA; // format of data we are supplying
						var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
						gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, inputImage);
						this.setUniform3iv('user_' + name + 'Dim', _dim2);
						this.setUniform2iv('user_' + name + 'Size', _size2);
						this.setUniform1i('user_' + name, this.argumentsLength);
						break;
					}
				case 'HTMLImageArray':
					{
						var inputImages = value;
						var _dim3 = [inputImages[0].width, inputImages[0].height, inputImages.length];
						var _size3 = [inputImages[0].width, inputImages[0].height];

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.argumentsLength);
						gl.bindTexture(gl.TEXTURE_2D_ARRAY, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
						// Upload the images into the texture.
						var _mipLevel = 0; // the largest mip
						var _internalFormat = gl.RGBA; // format we want in the texture
						var width = inputImages[0].width;
						var height = inputImages[0].height;
						var textureDepth = inputImages.length;
						var border = 0;
						var _srcFormat = gl.RGBA; // format of data we are supplying
						var _srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
						gl.texImage3D(gl.TEXTURE_2D_ARRAY, _mipLevel, _internalFormat, width, height, textureDepth, border, _srcFormat, _srcType, null);
						for (var i = 0; i < inputImages.length; i++) {
							var xOffset = 0;
							var yOffset = 0;
							var imageDepth = 1;
							gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, _mipLevel, xOffset, yOffset, i, inputImages[i].width, inputImages[i].height, imageDepth, _srcFormat, _srcType, inputImages[i]);
						}
						this.setUniform3iv('user_' + name + 'Dim', _dim3);
						this.setUniform2iv('user_' + name + 'Size', _size3);
						this.setUniform1i('user_' + name, this.argumentsLength);
						break;
					}
				case 'ArrayTexture(4)':
				case 'NumberTexture':
					{
						var inputTexture = value;
						var _dim4 = inputTexture.dimensions;
						var _size4 = inputTexture.size;

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength + this.argumentsLength);
						gl.bindTexture(gl.TEXTURE_2D, inputTexture.texture);

						this.setUniform3iv('user_' + name + 'Dim', _dim4);
						this.setUniform2iv('user_' + name + 'Size', _size4);
						this.setUniform1i('user_' + name + 'BitRatio', 1); // always float32
						this.setUniform1i('user_' + name, this.argumentsLength);
						break;
					}
				default:
					throw new Error('Input type not supported (WebGL): ' + value);
			}
			this.argumentsLength++;
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _getMainConstantsString
   *
   */

	}, {
		key: '_getMainConstantsString',
		value: function _getMainConstantsString() {
			var result = [];
			if (this.constants) {
				for (var name in this.constants) {
					if (!this.constants.hasOwnProperty(name)) continue;
					var value = this.constants[name];
					var type = utils.getArgumentType(value);
					switch (type) {
						case 'Integer':
							result.push('const float constants_' + name + ' = ' + parseInt(value) + '.0');
							break;
						case 'Float':
							result.push('const float constants_' + name + ' = ' + parseFloat(value));
							break;
						case 'Array':
						case 'Input':
						case 'HTMLImage':
						case 'ArrayTexture(4)':
						case 'NumberTexture':
							result.push('uniform highp sampler2D constants_' + name, 'uniform highp ivec2 constants_' + name + 'Size', 'uniform highp ivec3 constants_' + name + 'Dim', 'uniform highp int constants_' + name + 'BitRatio');
							break;
						case 'HTMLImageArray':
							result.push('uniform highp sampler2DArray constants_' + name, 'uniform highp ivec2 constants_' + name + 'Size', 'uniform highp ivec3 constants_' + name + 'Dim', 'uniform highp int constants_' + name + 'BitRatio');
							break;

						default:
							throw new Error('Unsupported constant ' + name + ' type ' + type);
					}
				}
			}
			return this._linesToString(result);
		}

		/**
   * @memberOf WebGLKernel#
   * @function
   * @name _addConstant
   *
   * @desc Adds kernel parameters to the Argument Texture,
   * binding it to the webGl instance, etc.
   *
   * @param {Array|Texture|Number} value - The actual argument supplied to the kernel
   * @param {String} type - Type of the argument
   * @param {String} name - Name of the argument
   *
   */

	}, {
		key: '_addConstant',
		value: function _addConstant(value, type, name) {
			var gl = this._webGl;
			var argumentTexture = this.getArgumentTexture(name);
			if (value instanceof Texture) {
				type = value.type;
			}
			switch (type) {
				case 'Array':
					{
						var dim = utils.getDimensions(value, true);
						var size = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, dim);
						gl.activeTexture(gl.TEXTURE0 + this.constantsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

						var length = size[0] * size[1];

						var _formatArrayTransfer3 = this._formatArrayTransfer(value, length),
						    valuesFlat = _formatArrayTransfer3.valuesFlat,
						    bitRatio = _formatArrayTransfer3.bitRatio;

						var buffer = void 0;
						if (this.floatTextures) {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0], size[1], 0, gl.RGBA, gl.FLOAT, valuesFlat);
						} else {
							buffer = new Uint8Array(valuesFlat.buffer);
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0] / bitRatio, size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
						}

						if (!this.hardcodeConstants) {
							this.setUniform3iv('constants_' + name + 'Dim', dim);
							this.setUniform2iv('constants_' + name + 'Size', size);
						}
						this.setUniform1i('constants_' + name + 'BitRatio', bitRatio);
						this.setUniform1i('constants_' + name, this.constantsLength);
						break;
					}
				case 'Input':
					{
						var input = value;
						var _dim5 = input.size;
						var _size5 = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, _dim5);
						gl.activeTexture(gl.TEXTURE0 + this.constantsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

						var _length2 = _size5[0] * _size5[1];

						var _formatArrayTransfer4 = this._formatArrayTransfer(value.value, _length2),
						    _valuesFlat2 = _formatArrayTransfer4.valuesFlat,
						    _bitRatio2 = _formatArrayTransfer4.bitRatio;

						if (this.floatTextures) {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, _size5[0], _size5[1], 0, gl.RGBA, gl.FLOAT, inputArray);
						} else {
							var _buffer2 = new Uint8Array(_valuesFlat2.buffer);
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _size5[0] / _bitRatio2, _size5[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, _buffer2);
						}

						if (!this.hardcodeConstants) {
							this.setUniform3iv('constants_' + name + 'Dim', _dim5);
							this.setUniform2iv('constants_' + name + 'Size', _size5);
						}
						this.setUniform1i('constants_' + name + 'BitRatio', _bitRatio2);
						this.setUniform1i('constants_' + name, this.constantsLength);
						break;
					}
				case 'HTMLImage':
					{
						var inputImage = value;
						var _dim6 = [inputImage.width, inputImage.height, 1];
						var _size6 = [inputImage.width, inputImage.height];

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength);
						gl.bindTexture(gl.TEXTURE_2D, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
						gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
						// Upload the image into the texture.
						var mipLevel = 0; // the largest mip
						var internalFormat = gl.RGBA; // format we want in the texture
						var srcFormat = gl.RGBA; // format of data we are supplying
						var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
						gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, inputImage);
						this.setUniform3iv('constants_' + name + 'Dim', _dim6);
						this.setUniform2iv('constants_' + name + 'Size', _size6);
						this.setUniform1i('constants_' + name, this.constantsLength);
						break;
					}
				case 'HTMLImageArray':
					{
						var inputImages = value;
						var _dim7 = [inputImages[0].width, inputImages[0].height, inputImages.length];
						var _size7 = [inputImages[0].width, inputImages[0].height];

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength);
						gl.bindTexture(gl.TEXTURE_2D_ARRAY, argumentTexture);
						gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
						gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
						// Upload the images into the texture.
						var _mipLevel2 = 0; // the largest mip
						var _internalFormat2 = gl.RGBA; // format we want in the texture
						var width = inputImages[0].width;
						var height = inputImages[0].height;
						var textureDepth = inputImages.length;
						var border = 0;
						var _srcFormat2 = gl.RGBA; // format of data we are supplying
						var _srcType2 = gl.UNSIGNED_BYTE; // type of data we are supplying
						gl.texImage3D(gl.TEXTURE_2D_ARRAY, _mipLevel2, _internalFormat2, width, height, textureDepth, border, _srcFormat2, _srcType2, null);
						for (var i = 0; i < inputImages.length; i++) {
							var xOffset = 0;
							var yOffset = 0;
							var imageDepth = 1;
							gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, _mipLevel2, xOffset, yOffset, i, inputImages[i].width, inputImages[i].height, imageDepth, _srcFormat2, _srcType2, inputImages[i]);
						}
						this.setUniform3iv('constants_' + name + 'Dim', _dim7);
						this.setUniform2iv('constants_' + name + 'Size', _size7);
						this.setUniform1i('constants_' + name, this.constantsLength);
						break;
					}
				case 'ArrayTexture(4)':
				case 'NumberTexture':
					{
						var inputTexture = value;
						var _dim8 = inputTexture.dimensions;
						var _size8 = inputTexture.size;

						gl.activeTexture(gl.TEXTURE0 + this.constantsLength);
						gl.bindTexture(gl.TEXTURE_2D, inputTexture.texture);

						this.setUniform3iv('constants_' + name + 'Dim', _dim8);
						this.setUniform2iv('constants_' + name + 'Size', _size8);
						this.setUniform1i('constants_' + name + 'BitRatio', 1); // aways float32
						this.setUniform1i('constants_' + name, this.constantsLength);
						break;
					}
				case 'Integer':
				case 'Float':
				default:
					throw new Error('Input type not supported (WebGL): ' + value);
			}
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _getGetResultString
   *
   */

	}, {
		key: '_getGetResultString',
		value: function _getGetResultString() {
			if (!this.floatTextures) {
				return '  return decode(texel, x, bitRatio);';
			}
			return '  return texel[channel];';
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _getHeaderString
   *
   * @desc Get the header string for the program.
   * This returns an empty string if no sub-kernels are defined.
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getHeaderString',
		value: function _getHeaderString() {
			return '';
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _getTextureCoordinate
   *
   * @desc Get texture coordinate string for the program
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getTextureCoordinate',
		value: function _getTextureCoordinate() {
			var names = this.subKernelOutputVariableNames;
			if (names === null || names.length < 1) {
				return 'in highp vec2 vTexCoord;\n';
			} else {
				return 'out highp vec2 vTexCoord;\n';
			}
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _getMainParamsString
   *
   * @desc Generate transpiled glsl Strings for user-defined parameters sent to a kernel
   *
   * @param {Array} args - The actual parameters sent to the Kernel
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getMainParamsString',
		value: function _getMainParamsString(args) {
			var result = [];
			var paramTypes = this.paramTypes;
			var paramNames = this.paramNames;
			for (var i = 0; i < paramNames.length; i++) {
				var param = args[i];
				var paramName = paramNames[i];
				var paramType = paramTypes[i];
				if (this.hardcodeConstants) {
					if (paramType === 'Array' || paramType === 'NumberTexture' || paramType === 'ArrayTexture(4)') {
						var paramDim = utils.getDimensions(param, true);
						var paramSize = utils.dimToTexSize({
							floatTextures: this.floatTextures,
							floatOutput: this.floatOutput
						}, paramDim);

						result.push('uniform highp sampler2D user_' + paramName, 'highp ivec2 user_' + paramName + 'Size = ivec2(' + paramSize[0] + ', ' + paramSize[1] + ')', 'highp ivec3 user_' + paramName + 'Dim = ivec3(' + paramDim[0] + ', ' + paramDim[1] + ', ' + paramDim[2] + ')', 'uniform highp int user_' + paramName + 'BitRatio');
					} else if (paramType === 'Integer') {
						result.push('highp float user_' + paramName + ' = ' + param + '.0');
					} else if (paramType === 'Float') {
						result.push('highp float user_' + paramName + ' = ' + param);
					}
				} else {
					if (paramType === 'Array' || paramType === 'NumberTexture' || paramType === 'ArrayTexture(4)' || paramType === 'Input' || paramType === 'HTMLImage') {
						result.push('uniform highp sampler2D user_' + paramName, 'uniform highp ivec2 user_' + paramName + 'Size', 'uniform highp ivec3 user_' + paramName + 'Dim');
						if (paramType !== 'HTMLImage') {
							result.push('uniform highp int user_' + paramName + 'BitRatio');
						}
					} else if (paramType === 'HTMLImageArray') {
						result.push('uniform highp sampler2DArray user_' + paramName, 'uniform highp ivec2 user_' + paramName + 'Size', 'uniform highp ivec3 user_' + paramName + 'Dim');
					} else if (paramType === 'Integer' || paramType === 'Float') {
						result.push('uniform float user_' + paramName);
					}
				}
			}
			return this._linesToString(result);
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _getKernelString
   *
   * @desc Get Kernel program string (in *glsl*) for a kernel.
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getKernelString',
		value: function _getKernelString() {
			var result = [];
			var names = this.subKernelOutputVariableNames;
			if (names !== null) {
				result.push('float kernelResult = 0.0');
				result.push('layout(location = 0) out vec4 data0');
				for (var i = 0; i < names.length; i++) {
					result.push('float ' + names[i] + ' = 0.0', 'layout(location = ' + (i + 1) + ') out vec4 data' + (i + 1));
				}
			} else {
				result.push('out vec4 data0');
				result.push('float kernelResult = 0.0');
			}

			return this._linesToString(result) + this.functionBuilder.getPrototypeString('kernel');
		}

		/**
   *
   * @memberOf WebGL2Kernel#
   * @function
   * @name _getMainResultString
   *
   * @desc Get main result string with checks for floatOutput, graphical, subKernelsOutputs, etc.
   *
   * @returns {String} result
   *
   */

	}, {
		key: '_getMainResultString',
		value: function _getMainResultString() {
			var names = this.subKernelOutputVariableNames;
			var result = [];

			if (this.floatOutput) {
				result.push('  index *= 4');
			}

			if (this.graphical) {
				result.push('  threadId = indexTo3D(index, uOutputDim)', '  kernel()', '  data0 = actualColor');
			} else if (this.floatOutput) {
				var channels = ['r', 'g', 'b', 'a'];

				for (var i = 0; i < channels.length; ++i) {
					result.push('  threadId = indexTo3D(index, uOutputDim)');
					result.push('  kernel()');

					if (names) {
						result.push('  data0.' + channels[i] + ' = kernelResult');

						for (var j = 0; j < names.length; ++j) {
							result.push('  data' + (j + 1) + '.' + channels[i] + ' = ' + names[j]);
						}
					} else {
						result.push('  data0.' + channels[i] + ' = kernelResult');
					}

					if (i < channels.length - 1) {
						result.push('  index += 1');
					}
				}
			} else if (names !== null) {
				result.push('  threadId = indexTo3D(index, uOutputDim)');
				result.push('  kernel()');
				result.push('  data0 = encode32(kernelResult)');
				for (var _i2 = 0; _i2 < names.length; _i2++) {
					result.push('  data' + (_i2 + 1) + ' = encode32(' + names[_i2] + ')');
				}
			} else {
				result.push('  threadId = indexTo3D(index, uOutputDim)', '  kernel()', '  data0 = encode32(kernelResult)');
			}

			return this._linesToString(result);
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _addKernels
   *
   * @desc Adds all the sub-kernels supplied with this Kernel instance.
   *
   */

	}, {
		key: '_addKernels',
		value: function _addKernels() {
			var _this2 = this;

			var builder = this.functionBuilder;
			var gl = this._webGl;

			builder.addFunctions(this.functions, {
				constants: this.constants,
				output: this.output
			});
			builder.addNativeFunctions(this.nativeFunctions);

			builder.addKernel(this.fnString, {
				prototypeOnly: false,
				constants: this.constants,
				output: this.output,
				debug: this.debug,
				loopMaxIterations: this.loopMaxIterations,
				paramNames: this.paramNames,
				paramTypes: this.paramTypes,
				constantTypes: this.constantTypes,
				fixIntegerDivisionAccuracy: this.fixIntegerDivisionAccuracy
			});

			if (this.subKernels !== null) {
				this.subKernelOutputTextures = [];
				this.subKernelOutputVariableNames = [];
				this.subKernels.forEach(function (subKernel) {
					return _this2._addSubKernel(subKernel);
				});
			} else if (this.subKernelProperties !== null) {
				this.subKernelOutputTextures = [];
				this.subKernelOutputVariableNames = [];
				Object.keys(this.subKernelProperties).forEach(function (property) {
					return _this2._addSubKernel(_this2.subKernelProperties[property]);
				});
			}
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _getFragShaderString
   *
   * @desc Get the fragment shader String.
   * If the String hasn't been compiled yet,
   * then this method compiles it as well
   *
   * @param {Array} args - The actual parameters sent to the Kernel
   *
   * @returns {string} Fragment Shader string
   *
   */

	}, {
		key: '_getFragShaderString',
		value: function _getFragShaderString(args) {
			if (this.compiledFragShaderString !== null) {
				return this.compiledFragShaderString;
			}
			return this.compiledFragShaderString = this._replaceArtifacts(this.constructor.fragShaderString, this._getFragShaderArtifactMap(args));
		}

		/**
   * @memberOf WebGL2Kernel#
   * @function
   * @name _getVertShaderString
   *
   * @desc Get the vertical shader String
   *
   * @param {Array} args - The actual parameters sent to the Kernel
   *
   * @returns {string} Vertical Shader string
   *
   */

	}, {
		key: '_getVertShaderString',
		value: function _getVertShaderString(args) {
			if (this.compiledVertShaderString !== null) {
				return this.compiledVertShaderString;
			}
			return this.compiledVertShaderString = this.constructor.vertShaderString;
		}
	}], [{
		key: 'fragShaderString',
		get: function get() {
			return fragShaderString;
		}
	}, {
		key: 'vertShaderString',
		get: function get() {
			return vertShaderString;
		}
	}]);

	return WebGL2Kernel;
}(WebGLKernel);
},{"../../core/texture":30,"../../core/utils":32,"../web-gl/kernel":14,"./shader-frag":23,"./shader-vert":24}],22:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RunnerBase = require('../runner-base');
var WebGL2FunctionBuilder = require('./function-builder');
var WebGL2Kernel = require('./kernel');

module.exports = function (_RunnerBase) {
	_inherits(WebGL2Runner, _RunnerBase);

	/**
  * @constructor WebGL2Runner
  *
  * @extends RunnerBase
 	 * @desc Instantiates a Runner instance for the kernel.
  *
  * @param {Object} settings - Settings to instantiate properties in RunnerBase, with given values
  *
  */
	function WebGL2Runner(settings) {
		_classCallCheck(this, WebGL2Runner);

		var _this = _possibleConstructorReturn(this, (WebGL2Runner.__proto__ || Object.getPrototypeOf(WebGL2Runner)).call(this, new WebGL2FunctionBuilder(), settings));

		_this.Kernel = WebGL2Kernel;
		_this.kernel = null;
		return _this;
	}

	/**
  * @memberOf WebGL2Runner#
  * @function
  * @name getMode
  *
  * @desc Return the current mode in which gpu.js is executing.
  *
  * @returns {String} The current mode; "gpu".
  *
  */


	_createClass(WebGL2Runner, [{
		key: 'getMode',
		value: function getMode() {
			return 'gpu';
		}
	}]);

	return WebGL2Runner;
}(RunnerBase);
},{"../runner-base":10,"./function-builder":19,"./kernel":21}],23:[function(require,module,exports){
"use strict";

module.exports = "#version 300 es\n__HEADER__;\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\nconst float LOOP_MAX = __LOOP_MAX__;\n\n__CONSTANTS__;\n\nin vec2 vTexCoord;\n\nvec2 integerMod(vec2 x, float y) {\n  vec2 res = floor(mod(x, y));\n  return res * step(1.0 - floor(y), -res);\n}\n\nvec3 integerMod(vec3 x, float y) {\n  vec3 res = floor(mod(x, y));\n  return res * step(1.0 - floor(y), -res);\n}\n\nvec4 integerMod(vec4 x, vec4 y) {\n  vec4 res = floor(mod(x, y));\n  return res * step(1.0 - floor(y), -res);\n}\n\nfloat integerMod(float x, float y) {\n  float res = floor(mod(x, y));\n  return res * (res > floor(y) - 1.0 ? 0.0 : 1.0);\n}\n\nint integerMod(int x, int y) {\n  return x - (y * int(x/y));\n}\n\n__DIVIDE_WITH_INTEGER_CHECK__;\n\n// Here be dragons!\n// DO NOT OPTIMIZE THIS CODE\n// YOU WILL BREAK SOMETHING ON SOMEBODY'S MACHINE\n// LEAVE IT AS IT IS, LEST YOU WASTE YOUR OWN TIME\nconst vec2 MAGIC_VEC = vec2(1.0, -256.0);\nconst vec4 SCALE_FACTOR = vec4(1.0, 256.0, 65536.0, 0.0);\nconst vec4 SCALE_FACTOR_INV = vec4(1.0, 0.00390625, 0.0000152587890625, 0.0); // 1, 1/256, 1/65536\nfloat decode32(vec4 rgba) {\n  __DECODE32_ENDIANNESS__;\n  rgba *= 255.0;\n  vec2 gte128;\n  gte128.x = rgba.b >= 128.0 ? 1.0 : 0.0;\n  gte128.y = rgba.a >= 128.0 ? 1.0 : 0.0;\n  float exponent = 2.0 * rgba.a - 127.0 + dot(gte128, MAGIC_VEC);\n  float res = exp2(round(exponent));\n  rgba.b = rgba.b - 128.0 * gte128.x;\n  res = dot(rgba, SCALE_FACTOR) * exp2(round(exponent-23.0)) + res;\n  res *= gte128.y * -2.0 + 1.0;\n  return res;\n}\n\nvec4 encode32(float f) {\n  float F = abs(f);\n  float sign = f < 0.0 ? 1.0 : 0.0;\n  float exponent = floor(log2(F));\n  float mantissa = (exp2(-exponent) * F);\n  // exponent += floor(log2(mantissa));\n  vec4 rgba = vec4(F * exp2(23.0-exponent)) * SCALE_FACTOR_INV;\n  rgba.rg = integerMod(rgba.rg, 256.0);\n  rgba.b = integerMod(rgba.b, 128.0);\n  rgba.a = exponent*0.5 + 63.5;\n  rgba.ba += vec2(integerMod(exponent+127.0, 2.0), sign) * 128.0;\n  rgba = floor(rgba);\n  rgba *= 0.003921569; // 1/255\n  __ENCODE32_ENDIANNESS__;\n  return rgba;\n}\n// Dragons end here\n\nfloat decode(vec4 rgba, int x, int bitRatio) {\n  if (bitRatio == 1) {\n    return decode32(rgba);\n  }\n  __DECODE32_ENDIANNESS__;\n  int channel = integerMod(x, bitRatio);\n  if (bitRatio == 4) {\n    return rgba[channel] * 255.0;\n  }\n  else {\n    return rgba[channel*2] * 255.0 + rgba[channel*2 + 1] * 65280.0;\n  }\n}\n\nint index;\nivec3 threadId;\n\nivec3 indexTo3D(int idx, ivec3 texDim) {\n  int z = int(idx / (texDim.x * texDim.y));\n  idx -= z * int(texDim.x * texDim.y);\n  int y = int(idx / texDim.x);\n  int x = int(integerMod(idx, texDim.x));\n  return ivec3(x, y, z);\n}\n\nfloat get(sampler2D tex, ivec2 texSize, ivec3 texDim, int bitRatio,  int z, int y, int x) {\n  ivec3 xyz = ivec3(x, y, z);\n  __GET_WRAPAROUND__;\n  int index = xyz.x + texDim.x * (xyz.y + texDim.y * xyz.z);\n  __GET_TEXTURE_CHANNEL__;\n  int w = texSize.x;\n  vec2 st = vec2(float(integerMod(index, w)), float(index / w)) + 0.5;\n  __GET_TEXTURE_INDEX__;\n  vec4 texel = texture(tex, st / vec2(texSize));\n  __GET_RESULT__;\n  \n}\n\nvec4 getImage2D(sampler2D tex, ivec2 texSize, ivec3 texDim, int z, int y, int x) {\n  ivec3 xyz = ivec3(x, y, z);\n  __GET_WRAPAROUND__;\n  int index = xyz.x + texDim.x * (xyz.y + texDim.y * xyz.z);\n  __GET_TEXTURE_CHANNEL__;\n  int w = texSize.x;\n  vec2 st = vec2(float(integerMod(index, w)), float(index / w)) + 0.5;\n  __GET_TEXTURE_INDEX__;\n  return texture(tex, st / vec2(texSize));\n}\n\nvec4 getImage3D(sampler2DArray tex, ivec2 texSize, ivec3 texDim, int z, int y, int x) {\n  ivec3 xyz = ivec3(x, y, z);\n  __GET_WRAPAROUND__;\n  int index = xyz.x + texDim.x * (xyz.y + texDim.y * xyz.z);\n  __GET_TEXTURE_CHANNEL__;\n  int w = texSize.x;\n  vec2 st = vec2(float(integerMod(index, w)), float(index / w)) + 0.5;\n  __GET_TEXTURE_INDEX__;\n  return texture(tex, vec3(st / vec2(texSize), z));\n}\n\nfloat get(sampler2D tex, ivec2 texSize, ivec3 texDim, int bitRatio, int y, int x) {\n  return get(tex, texSize, texDim, bitRatio, 0, y, x);\n}\n\nfloat get(sampler2D tex, ivec2 texSize, ivec3 texDim, int bitRatio, int x) {\n  return get(tex, texSize, texDim, bitRatio, 0, 0, x);\n}\n\nvec4 getImage2D(sampler2D tex, ivec2 texSize, ivec3 texDim, int y, int x) {\n  return getImage2D(tex, texSize, texDim, 0, y, x);\n}\n\nvec4 getImage2D(sampler2D tex, ivec2 texSize, ivec3 texDim, int x) {\n  return getImage2D(tex, texSize, texDim, 0, 0, x);\n}\n\nvec4 actualColor;\nvoid color(float r, float g, float b, float a) {\n  actualColor = vec4(r,g,b,a);\n}\n\nvoid color(float r, float g, float b) {\n  color(r,g,b,1.0);\n}\n\n__MAIN_PARAMS__;\n__MAIN_CONSTANTS__;\n__KERNEL__;\n\nvoid main(void) {\n  index = int(vTexCoord.s * float(uTexSize.x)) + int(vTexCoord.t * float(uTexSize.y)) * uTexSize.x;\n  __MAIN_RESULT__;\n}";
},{}],24:[function(require,module,exports){
"use strict";

module.exports = "#version 300 es\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\n\nin vec2 aPos;\nin vec2 aTexCoord;\n\nout vec2 vTexCoord;\nuniform vec2 ratio;\n\nvoid main(void) {\n  gl_Position = vec4((aPos + vec2(1)) * ratio + vec2(-1), 0, 1);\n  vTexCoord = aTexCoord;\n}";
},{}],25:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebGLKernel = require('./kernel');
var utils = require('../../core/utils');

/**
 * @class WebGLValidatorKernel
 *
 * @desc Helper class for WebGLKernel to validate texture size and dimensions.
 *
 */
module.exports = function (_WebGLKernel) {
	_inherits(WebGL2ValidatorKernel, _WebGLKernel);

	function WebGL2ValidatorKernel() {
		_classCallCheck(this, WebGL2ValidatorKernel);

		return _possibleConstructorReturn(this, (WebGL2ValidatorKernel.__proto__ || Object.getPrototypeOf(WebGL2ValidatorKernel)).apply(this, arguments));
	}

	_createClass(WebGL2ValidatorKernel, [{
		key: 'validateOptions',


		/** 
   * @memberOf WebGLValidatorKernel#
   * @function
   * @name validateOptions
   *
   */
		value: function validateOptions() {
			this._webGl.getExtension('EXT_color_buffer_float');
			this.texSize = utils.dimToTexSize({
				floatTextures: this.floatTextures,
				floatOutput: this.floatOutput
			}, this.output, true);
		}
	}]);

	return WebGL2ValidatorKernel;
}(WebGLKernel);
},{"../../core/utils":32,"./kernel":21}],26:[function(require,module,exports){
'use strict';

var utils = require('./utils');
module.exports = function alias(name, fn) {
	var fnString = fn.toString();
	return new Function('return function ' + name + ' (' + utils.getParamNamesFromString(fnString).join(', ') + ') {' + utils.getFunctionBodyFromString(fnString) + '}')();
};
},{"./utils":32}],27:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UtilsCore = require("./utils-core");

/**
 * This is a minimalistic version of GPU.js used 
 * to run precompiled GPU.JS code.
 *
 * This intentionally excludes the JS AST compiller : which is 400kb alone/
 *
 * @class GPUCore
 */
module.exports = function () {
	function GPUCore() {
		_classCallCheck(this, GPUCore);
	}

	_createClass(GPUCore, null, [{
		key: "validateKernelObj",


		/**
   * @name validateKernelObj
   * @function
   * @static
   * @memberOf GPUCore
   *
   * @description Validates the KernelObj to comply with the defined format
   * Note that this does only a limited sanity check, and does not  
   * guarantee a full working validation.
   *
   * For the kernel object format see : <kernelObj-format>
   *
   * @param {Object|String} kernelObj - KernelObj used to validate
   *
   * @returns {Object} The validated kernel object, converted from JSON if needed
   *
   */
		value: function validateKernelObj(kernelObj) {

			// NULL validation
			if (kernelObj === null) {
				throw "KernelObj being validated is NULL";
			}

			// String JSON conversion
			if (typeof kernelObj === "string") {
				try {
					kernelObj = JSON.parse(kernelObj);
				} catch (e) {
					console.error(e);
					throw "Failed to convert KernelObj from JSON string";
				}

				// NULL validation
				if (kernelObj === null) {
					throw "Invalid (NULL) KernelObj JSON string representation";
				}
			}

			// Check for kernel obj flag
			if (kernelObj.isKernelObj !== true) {
				throw "Failed missing isKernelObj flag check";
			}

			// Return the validated kernelObj
			return kernelObj;
		}

		/**
   * @name loadKernelObj
   * @function
   * @static
   * @memberOf GPUCore
   *
   * @description Loads the precompiled kernel object. For GPUCore this is the ONLY way to create the kernel.
   * To generate the kernelObj use <Kernel.exportKernelObj>
   *
   * Note that this function calls <validateKernelObj> internally, and throws an exception if it fails.
   *
   * @see GPUCore.validateKernelObj
   * @see	Kernel.exportKernelObj
   *
   * @param {Object} kernelObj - The precompiled kernel object
   * @param {Object} inOpt - [Optional] the option overrides to use
   *
   * @returns {Function} The kernel function
   * 
   */

	}, {
		key: "loadKernelObj",
		value: function loadKernelObj(kernelObj, inOpt) {

			// Validates the kernelObj, throws an exception if it fails
			kernelObj = validateKernelObj(kernelObj);
		}
	}]);

	return GPUCore;
}();
},{"./utils-core":31}],28:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var utils = require('./utils');
var WebGLRunner = require('../backend/web-gl/runner');
var WebGL2Runner = require('../backend/web-gl2/runner');
var CPURunner = require('../backend/cpu/runner');
var WebGLValidatorKernel = require('../backend/web-gl/validator-kernel');
var WebGL2ValidatorKernel = require('../backend/web-gl2/validator-kernel');
var GPUCore = require("./gpu-core");

/**
 * Initialises the GPU.js library class which manages the webGlContext for the created functions.
 * @class
 * @extends GPUCore
 */

var GPU = function (_GPUCore) {
	_inherits(GPU, _GPUCore);

	/**
  * Creates an instance of GPU.
  * @param {any} settings - Settings to set mode, andother properties. See #GPUCore
  * @memberOf GPU#
  */
	function GPU(settings) {
		_classCallCheck(this, GPU);

		var _this = _possibleConstructorReturn(this, (GPU.__proto__ || Object.getPrototypeOf(GPU)).call(this, settings));

		settings = settings || {};
		_this._canvas = settings.canvas || null;
		_this._webGl = settings.webGl || null;
		var mode = settings.mode;
		var detectedMode = void 0;
		if (!utils.isWebGlSupported()) {
			if (mode && mode !== 'cpu') {
				throw new Error('A requested mode of "' + mode + '" and is not supported');
			} else {
				console.warn('Warning: gpu not supported, falling back to cpu support');
				detectedMode = 'cpu';
			}
		} else {
			if (_this._webGl) {
				if (typeof WebGL2RenderingContext !== 'undefined' && _this._webGl.constructor === WebGL2RenderingContext) {
					detectedMode = 'webgl2';
				} else if (typeof WebGLRenderingContext !== 'undefined' && _this._webGl.constructor === WebGLRenderingContext) {
					detectedMode = 'webgl';
				} else {
					throw new Error('unknown WebGL Context');
				}
			} else {
				detectedMode = mode || 'gpu';
			}
		}
		_this.kernels = [];

		var runnerSettings = {
			canvas: _this._canvas,
			webGl: _this._webGl
		};

		switch (detectedMode) {
			// public options
			case 'cpu':
				_this._runner = new CPURunner(runnerSettings);
				break;
			case 'gpu':
				var Runner = _this.getGPURunner();
				_this._runner = new Runner(runnerSettings);
				break;

			// private explicit options for testing
			case 'webgl2':
				_this._runner = new WebGL2Runner(runnerSettings);
				break;
			case 'webgl':
				_this._runner = new WebGLRunner(runnerSettings);
				break;

			// private explicit options for internal
			case 'webgl2-validator':
				_this._runner = new WebGL2Runner(runnerSettings);
				_this._runner.Kernel = WebGL2ValidatorKernel;
				break;
			case 'webgl-validator':
				_this._runner = new WebGLRunner(runnerSettings);
				_this._runner.Kernel = WebGLValidatorKernel;
				break;
			default:
				throw new Error('"' + mode + '" mode is not defined');
		}
		return _this;
	}
	/**
  *
  * This creates a callable function object to call the kernel function with the argument parameter set
  *
  * @name createKernel
  * @function
  * @memberOf GPU##
  *
  * @param {Function} fn - The calling to perform the conversion
  * @param {Object} [settings] - The parameter configuration object
  * @property {String} settings.dimensions - Thread dimension array (Defaults to [1024])
  * @property {String} settings.mode - CPU / GPU configuration mode (Defaults to null)
  *
  * The following modes are supported
  * *'falsey'* : Attempts to build GPU mode, else fallbacks
  * *'gpu'* : Attempts to build GPU mode, else fallbacks
  * *'cpu'* : Forces JS fallback mode only
  *
  *
  * @returns {Function} callable function to run
  *
  */


	_createClass(GPU, [{
		key: 'createKernel',
		value: function createKernel(fn, settings) {
			//
			// basic parameters safety checks
			//
			if (typeof fn === 'undefined') {
				throw 'Missing fn parameter';
			}
			if (!utils.isFunction(fn) && typeof fn !== 'string') {
				throw 'fn parameter not a function';
			}

			var mergedSettings = Object.assign({
				webGl: this._webGl,
				canvas: this._canvas
			}, settings || {});

			var kernel = this._runner.buildKernel(fn, mergedSettings);

			//if canvas didn't come from this, propagate from kernel
			if (!this._canvas) {
				this._canvas = kernel.getCanvas();
			}
			if (!this._runner.canvas) {
				this._runner.canvas = kernel.getCanvas();
			}

			this.kernels.push(kernel);

			return kernel;
		}

		/**
   *
   * Create a super kernel which executes sub kernels
   * and saves their output to be used with the next sub kernel.
   * This can be useful if we want to save the output on one kernel,
   * and then use it as an input to another kernel. *Machine Learning*
   *
   * @name createKernelMap
   * @function
   * @memberOf GPU#
   *
   * @param {Object|Array} subKernels - Sub kernels for this kernel
   * @param {Function} rootKernel - Root kernel
   *
   * @returns {Function} callable kernel function
   *
   * @example
   * const megaKernel = gpu.createKernelMap({
   *   addResult: function add(a, b) {
   *     return a[this.thread.x] + b[this.thread.x];
   *   },
   *   multiplyResult: function multiply(a, b) {
   *     return a[this.thread.x] * b[this.thread.x];
   *   },
   *  }, function(a, b, c) {
   *       return multiply(add(a, b), c);
   * });
   *
   * megaKernel(a, b, c);
   *
   * Note: You can also define subKernels as an array of functions.
   * > [add, multiply]
   *
   */

	}, {
		key: 'createKernelMap',
		value: function createKernelMap() {
			var fn = void 0;
			var settings = void 0;
			if (typeof arguments[arguments.length - 2] === 'function') {
				fn = arguments[arguments.length - 2];
				settings = arguments[arguments.length - 1];
			} else {
				fn = arguments[arguments.length - 1];
			}

			if (!utils.isWebGlDrawBuffersSupported()) {
				this._runner = new CPURunner(settings);
			}

			var kernel = this.createKernel(fn, settings);
			if (Array.isArray(arguments[0])) {
				var functions = arguments[0];
				for (var i = 0; i < functions.length; i++) {
					kernel.addSubKernel(functions[i]);
				}
			} else {
				var _functions = arguments[0];
				for (var p in _functions) {
					if (!_functions.hasOwnProperty(p)) continue;
					kernel.addSubKernelProperty(p, _functions[p]);
				}
			}

			return kernel;
		}

		/**
   *
   * Combine different kernels into one super Kernel,
   * useful to perform multiple operations inside one
   * kernel without the penalty of data transfer between
   * cpu and gpu.
   *
   * The number of kernel functions sent to this method can be variable.
   * You can send in one, two, etc.
   *
   * @name combineKernels
   * @function
   * @memberOf GPU#
   *
   * @param {Function} subKernels - Kernel function(s) to combine.
   * @param {Function} rootKernel - Root kernel to combine kernels into
   *
   * @example
   * 	combineKernels(add, multiply, function(a,b,c){
   *	 	return add(multiply(a,b), c)
   *	})
   *
   * @returns {Function} Callable kernel function
   *
   */

	}, {
		key: 'combineKernels',
		value: function combineKernels() {
			var lastKernel = arguments[arguments.length - 2];
			var combinedKernel = arguments[arguments.length - 1];
			if (this.getMode() === 'cpu') return combinedKernel;

			var canvas = arguments[0].getCanvas();
			var webGl = arguments[0].getWebGl();

			for (var i = 0; i < arguments.length - 1; i++) {
				arguments[i].setCanvas(canvas).setWebGl(webGl).setOutputToTexture(true);
			}

			return function () {
				combinedKernel.apply(null, arguments);
				var texSize = lastKernel.texSize;
				var gl = lastKernel.getWebGl();
				var threadDim = lastKernel.threadDim;
				var result = void 0;
				if (lastKernel.floatOutput) {
					var w = texSize[0];
					var h = Math.ceil(texSize[1] / 4);
					result = new Float32Array(w * h * 4);
					gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, result);
				} else {
					var bytes = new Uint8Array(texSize[0] * texSize[1] * 4);
					gl.readPixels(0, 0, texSize[0], texSize[1], gl.RGBA, gl.UNSIGNED_BYTE, bytes);
					result = new Float32Array(bytes.buffer);
				}

				result = result.subarray(0, threadDim[0] * threadDim[1] * threadDim[2]);

				if (lastKernel.output.length === 1) {
					return result;
				} else if (lastKernel.output.length === 2) {
					return utils.splitArray(result, lastKernel.output[0]);
				} else if (lastKernel.output.length === 3) {
					var cube = utils.splitArray(result, lastKernel.output[0] * lastKernel.output[1]);
					return cube.map(function (x) {
						return utils.splitArray(x, lastKernel.output[0]);
					});
				}
			};
		}
	}, {
		key: 'getGPURunner',
		value: function getGPURunner() {
			if (typeof WebGL2RenderingContext !== 'undefined' && utils.isWebGl2Supported()) return WebGL2Runner;
			if (typeof WebGLRenderingContext !== 'undefined') return WebGLRunner;
		}

		/**
   *
   * Adds additional functions, that the kernel may call.
   *
   * @name addFunction
   * @function
   * @memberOf GPU#
   *
   * @param {Function|String} fn - JS Function to do conversion
   * @param {Object} options
   *
   * @returns {GPU} returns itself
   *
   */

	}, {
		key: 'addFunction',
		value: function addFunction(fn, options) {
			this._runner.functionBuilder.addFunction(null, fn, options);
			return this;
		}

		/**
   *
   * Adds additional native functions, that the kernel may call.
   *
   * @name addNativeFunction
   * @function
   * @memberOf GPU#
   *
   * @param {String} name - native function name, used for reverse lookup
   * @param {String} nativeFunction - the native function implementation, as it would be defined in it's entirety
   *
   * @returns {GPU} returns itself
   *
   */

	}, {
		key: 'addNativeFunction',
		value: function addNativeFunction(name, nativeFunction) {
			this._runner.functionBuilder.addNativeFunction(name, nativeFunction);
			return this;
		}

		/**
   *
   * Return the current mode in which gpu.js is executing.
   * @name getMode
   * @function
   * @memberOf GPU#
   *
   * @returns {String} The current mode, "cpu", "webgl", etc.
   *
   */

	}, {
		key: 'getMode',
		value: function getMode() {
			return this._runner.getMode();
		}

		/**
   *
   * Return TRUE, if browser supports WebGl AND Canvas
   *
   * @name get isWebGlSupported
   * @function
   * @memberOf GPU#
   *
   * Note: This function can also be called directly `GPU.isWebGlSupported()`
   *
   * @returns {Boolean} TRUE if browser supports webGl
   *
   */

	}, {
		key: 'isWebGlSupported',
		value: function isWebGlSupported() {
			return utils.isWebGlSupported();
		}

		/**
   *
   * Return TRUE, if system has integer division accuracy issue
   *
   * @name get hasIntegerDivisionAccuracyBug
   * @function
   * @memberOf GPU#
   *
   * Note: This function can also be called directly `GPU.hasIntegerDivisionAccuracyBug()`
   *
   * @returns {Boolean} TRUE if system has integer division accuracy issue
   *
   *
   */

	}, {
		key: 'hasIntegerDivisionAccuracyBug',
		value: function hasIntegerDivisionAccuracyBug() {
			return utils.hasIntegerDivisionAccuracyBug();
		}

		/**
   *
   * Return the canvas object bound to this gpu instance.
   *
   * @name getCanvas
   * @function
   * @memberOf GPU#
   *
   * @returns {Object} Canvas object if present
   *
   */

	}, {
		key: 'getCanvas',
		value: function getCanvas() {
			return this._canvas;
		}

		/**
   *
   * Return the webGl object bound to this gpu instance.
   *
   * @name getWebGl
   * @function
   * @memberOf GPU#
   *
   * @returns {Object} WebGl object if present
   *
   */

	}, {
		key: 'getWebGl',
		value: function getWebGl() {
			return this._webGl;
		}

		/**
   *
   * Destroys all memory associated with gpu.js & the webGl if we created it
   *
   * @name destroy
   * @function
   * @memberOf GPU#
   *
   *
   */

	}, {
		key: 'destroy',
		value: function destroy() {
			var _this2 = this;

			// perform on next runloop - for some reason we dont get lose context events 
			// if webGl is created and destroyed in the same run loop.
			setTimeout(function () {
				var kernels = _this2.kernels;

				var destroyWebGl = !_this2._webGl && kernels.length && kernels[0]._webGl;
				for (var i = 0; i < _this2.kernels.length; i++) {
					_this2.kernels[i].destroy(true); // remove canvas if exists
				}

				if (destroyWebGl) {
					destroyWebGl.OES_texture_float = null;
					destroyWebGl.OES_texture_float_linear = null;
					destroyWebGl.OES_element_index_uint = null;
					var loseContextExt = destroyWebGl.getExtension('WEBGL_lose_context');
					if (loseContextExt) {
						loseContextExt.loseContext();
					}
				}
			}, 0);
		}
	}]);

	return GPU;
}(GPUCore);

;

// This ensure static methods are "inherited"
// See: https://stackoverflow.com/questions/5441508/how-to-inherit-static-methods-from-base-class-in-javascript
Object.assign(GPU, GPUCore);

module.exports = GPU;
},{"../backend/cpu/runner":5,"../backend/web-gl/runner":15,"../backend/web-gl/validator-kernel":18,"../backend/web-gl2/runner":22,"../backend/web-gl2/validator-kernel":25,"./gpu-core":27,"./utils":32}],29:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function Input(value, size) {
	_classCallCheck(this, Input);

	this.value = value;
	if (Array.isArray(size)) {
		this.size = [];
		for (var i = 0; i < size.length; i++) {
			this.size[i] = size[i];
		}
		while (this.size.length < 3) {
			this.size.push(1);
		}
	} else {
		if (size.z) {
			this.size = [size.x, size.y, size.z];
		} else if (size.y) {
			this.size = [size.x, size.y, 1];
		} else {
			this.size = [size.x, 1, 1];
		}
	}
};
},{}],30:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {

	/**
  * @desc WebGl Texture implementation in JS
  * @constructor Texture
  * @param {Object} texture
  * @param {Array} size
  * @param dimensions
  * @param {Array} output
  * @param {Object} webGl
  * @param {String} [type]
  */
	function Texture(texture, size, dimensions, output, webGl) {
		var type = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'NumberTexture';

		_classCallCheck(this, Texture);

		this.texture = texture;
		this.size = size;
		this.dimensions = dimensions;
		this.output = output;
		this.webGl = webGl;
		this.kernel = null;
		this.type = type;
	}

	/**
  * @name toArray
  * @function
  * @memberOf Texture#
  *
  * @desc Converts the Texture into a JavaScript Array.
  * 
  * @param {Object} The `gpu` Object
  *
  */


	_createClass(Texture, [{
		key: 'toArray',
		value: function toArray(gpu) {
			if (!gpu) throw new Error('You need to pass the GPU object for toArray to work.');
			if (this.kernel) return this.kernel(this);

			this.kernel = gpu.createKernel(function (x) {
				return x[this.thread.z][this.thread.y][this.thread.x];
			}).setOutput(this.output);

			return this.kernel(this);
		}

		/**
   * @name delete
   * @desc Deletes the Texture.
   * @function
   * @memberOf Texture#
   *
   *
   */

	}, {
		key: 'delete',
		value: function _delete() {
			return this.webGl.deleteTexture(this.texture);
		}
	}]);

	return Texture;
}();
},{}],31:[function(require,module,exports){
'use strict';

/**
 *
 * @desc Reduced subset of Utils, used exclusively in gpu-core.js
 * Various utility functions / snippets of code that GPU.JS uses internally.\
 * This covers various snippets of code that is not entirely gpu.js specific (ie. may find uses elsewhere)
 *
 * Note that all methods in this class is 'static' by nature `UtilsCore.functionName()`
 *
 * @class UtilsCore
 *
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UtilsCore = function () {
	function UtilsCore() {
		_classCallCheck(this, UtilsCore);
	}

	_createClass(UtilsCore, null, [{
		key: 'isCanvas',


		/**
   * @typedef {Object} webGlContext
   */

		/**
   * @typedef {Object} CanvasDOMObject
   */

		//-----------------------------------------------------------------------------
		//
		//  Canvas validation and support
		//
		//-----------------------------------------------------------------------------

		/**
   * @name isCanvas
   * @static
   * @function
   * @memberOf UtilsCore
   *
   *
   * @desc Return TRUE, on a valid DOM canvas or OffscreenCanvas object
   *
   * Note: This does just a VERY simply sanity check. And may give false positives.
   *
   * @param {CanvasDOMObject} canvasObj - Object to validate
   *
   * @returns {Boolean} TRUE if the object is a DOM canvas or OffscreenCanvas
   *
   */
		value: function isCanvas(canvasObj) {
			return canvasObj !== null && (canvasObj.nodeName && canvasObj.getContext && canvasObj.nodeName.toUpperCase() === 'CANVAS' || typeof OffscreenCanvas !== 'undefined' && canvasObj instanceof OffscreenCanvas);
		}

		/**
   * @name isCanvasSupported
   * @function
   * @static
   * @memberOf UtilsCore
   *
   * @desc Return TRUE, if browser supports canvas
   *
   * @returns {Boolean} TRUE if browser supports canvas
   *
   */

	}, {
		key: 'isCanvasSupported',
		value: function isCanvasSupported() {
			return _isCanvasSupported;
		}

		/**
   * @name initCanvas
   * @function
   * @static
   * @memberOf UtilsCore
   *
   * @desc Initiate and returns a canvas, for usage in init_webgl.
   * Returns only if canvas is supported by browser.
   *
   * @returns {CanvasDOMObject} CanvasDOMObject if supported by browser, else null
   *
   */

	}, {
		key: 'initCanvas',
		value: function initCanvas() {
			// Fail fast if browser previously detected no support
			if (!_isCanvasSupported) {
				return null;
			}

			// Create a new canvas DOM
			var canvas = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(0, 0);

			// Default width and height, to fix webgl issue in safari
			canvas.width = 2;
			canvas.height = 2;

			// Returns the canvas
			return canvas;
		}

		//-----------------------------------------------------------------------------
		//
		//  Webgl validation and support
		//
		//-----------------------------------------------------------------------------


		/**
   *
   * @name isWebGl
   * @function
   * @static
   * @memberOf UtilsCore
   *
   * @desc Return TRUE, on a valid webGlContext object
   *
   * Note: This does just a VERY simply sanity check. And may give false positives.
   *
   * @param {webGlContext} webGlObj - Object to validate
   *
   * @returns {Boolean} TRUE if the object is a webGlContext object
   *
   */

	}, {
		key: 'isWebGl',
		value: function isWebGl(webGlObj) {
			return webGlObj && typeof webGlObj.getExtension === 'function';
		}

		/**
   *
   * @name isWebGl2
   * @function
   * @static
   * @memberOf UtilsCore
   *
   * @desc Return TRUE, on a valid webGl2Context object
   *
   * Note: This does just a VERY simply sanity check. And may give false positives.
   *
   * @param {webGlContext} webGl2Obj - Object to validate
   *
   * @returns {Boolean} TRUE if the object is a webGl2Context object
   *
   */

	}, {
		key: 'isWebGl2',
		value: function isWebGl2(webGl2Obj) {
			return webGl2Obj && typeof WebGL2RenderingContext !== 'undefined' && webGl2Obj instanceof WebGL2RenderingContext;
		}

		/**
   * @name isWebGlSupported
   * @function
   * @static
   * @memberOf UtilsCore
   *
   * @desc Return TRUE, if browser supports webgl
   *
   * @returns {Boolean} TRUE if browser supports webgl
   *
   */

	}, {
		key: 'isWebGlSupported',
		value: function isWebGlSupported() {
			return _isWebGlSupported;
		}

		/**
   * @name isWebGlSupported2
   * @function
   * @static
   * @memberOf UtilsCore
   *
   * @desc Return TRUE, if browser supports webgl2
   *
   * @returns {Boolean} TRUE if browser supports webgl2
   *
   */

	}, {
		key: 'isWebGl2Supported',
		value: function isWebGl2Supported() {
			return _isWebGl2Supported;
		}
	}, {
		key: 'isWebGlDrawBuffersSupported',
		value: function isWebGlDrawBuffersSupported() {
			return _isWebGlDrawBuffersSupported;
		}

		// Default webgl options to use

	}, {
		key: 'initWebGlDefaultOptions',
		value: function initWebGlDefaultOptions() {
			return {
				alpha: false,
				depth: false,
				antialias: false
			};
		}

		/**
   * @name initWebGl
   * @function
   * @static
   * @memberOf UtilsCore
   *
   * @desc Initiate and returns a webGl, from a canvas object
   * Returns only if webGl is supported by browser.
   *
   * @param {CanvasDOMObject} canvasObj - Object to validate
   *
   * @returns {CanvasDOMObject} CanvasDOMObject if supported by browser, else null
   *
   */

	}, {
		key: 'initWebGl',
		value: function initWebGl(canvasObj) {

			// First time setup, does the browser support check memorizer
			if (typeof _isCanvasSupported !== 'undefined' || canvasObj === null) {
				if (!_isCanvasSupported) {
					return null;
				}
			}

			// Fail fast for invalid canvas object
			if (!UtilsCore.isCanvas(canvasObj)) {
				throw new Error('Invalid canvas object - ' + canvasObj);
			}

			// Create a new canvas DOM
			var webGl = null;
			var defaultOptions = UtilsCore.initWebGlDefaultOptions();
			try {
				webGl = canvasObj.getContext('experimental-webgl', defaultOptions);
			} catch (e) {
				// 'experimental-webgl' is not a supported context type
				// fallback to 'webgl2' or 'webgl' below
			}

			if (webGl === null) {
				webGl = canvasObj.getContext('webgl2', defaultOptions) || canvasObj.getContext('webgl', defaultOptions);
			}

			if (webGl) {
				// Get the extension that is needed
				webGl.OES_texture_float = webGl.getExtension('OES_texture_float');
				webGl.OES_texture_float_linear = webGl.getExtension('OES_texture_float_linear');
				webGl.OES_element_index_uint = webGl.getExtension('OES_element_index_uint');
			}

			// Returns the canvas
			return webGl;
		}

		/**
   * @name initWebGl2
   * @function
   * @static
   * @memberOf UtilsCore
   *
   * @desc Initiate and returns a webGl, from a canvas object
   * Returns only if webGl is supported by browser.
   *
   * @param {CanvasDOMObject} canvasObj - Object to validate
   *
   * @returns {CanvasDOMObject} CanvasDOMObject if supported by browser, else null
   *
   */

	}, {
		key: 'initWebGl2',
		value: function initWebGl2(canvasObj) {

			// First time setup, does the browser support check memorizer
			if (typeof _isCanvasSupported !== 'undefined' || canvasObj === null) {
				if (!_isCanvasSupported) {
					return null;
				}
			}

			// Fail fast for invalid canvas object
			if (!UtilsCore.isCanvas(canvasObj)) {
				throw new Error('Invalid canvas object - ' + canvasObj);
			}

			// Create a new canvas DOM
			return canvasObj.getContext('webgl2', UtilsCore.initWebGlDefaultOptions());
		}

		/**
   * @function
   * @static
   * @memberOf UtilsCore
   * @param {number[]} output
   * @throws if not correctly defined
   */

	}, {
		key: 'checkOutput',
		value: function checkOutput(output) {
			if (!output || !Array.isArray(output)) throw new Error('kernel.output not an array');
			for (var i = 0; i < output.length; i++) {
				if (isNaN(output[i]) || output[i] < 1) {
					throw new Error('kernel.output[' + i + '] incorrectly defined as `' + output[i] + '`, needs to be numeric, and greater than 0');
				}
			}
		}
	}]);

	return UtilsCore;
}();

//-----------------------------------------------------------------------------
//
//  Canvas & Webgl validation and support constants
//
//-----------------------------------------------------------------------------

var _isCanvasSupported = typeof document !== 'undefined' ? UtilsCore.isCanvas(document.createElement('canvas')) : typeof OffscreenCanvas !== 'undefined';
var _testingWebGl = UtilsCore.initWebGl(UtilsCore.initCanvas());
var _testingWebGl2 = UtilsCore.initWebGl2(UtilsCore.initCanvas());
var _isWebGlSupported = UtilsCore.isWebGl(_testingWebGl);
var _isWebGl2Supported = UtilsCore.isWebGl2(_testingWebGl2);
var _isWebGlDrawBuffersSupported = _isWebGlSupported && Boolean(_testingWebGl.getExtension('WEBGL_draw_buffers'));

if (_isWebGlSupported) {
	UtilsCore.OES_texture_float = _testingWebGl.OES_texture_float;
	UtilsCore.OES_texture_float_linear = _testingWebGl.OES_texture_float_linear;
	UtilsCore.OES_element_index_uint = _testingWebGl.OES_element_index_uint;
} else {
	UtilsCore.OES_texture_float = false;
	UtilsCore.OES_texture_float_linear = false;
	UtilsCore.OES_element_index_uint = false;
}

module.exports = UtilsCore;
},{}],32:[function(require,module,exports){
'use strict';

/**
 * 
 * @classdesc Various utility functions / snippets of code that GPU.JS uses internally.\
 * This covers various snippets of code that is not entirely gpu.js specific (ie. may find uses elsewhere)
 *
 * Note that all methods in this class are *static* by nature `Utils.functionName()`
 * 
 * @class Utils
 * @extends UtilsCore
 *
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UtilsCore = require("./utils-core");
var Input = require('./input');
var Texture = require('./texture');
// FUNCTION_NAME regex
var FUNCTION_NAME = /function ([^(]*)/;

// STRIP COMMENTS regex
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

// ARGUMENT NAMES regex
var ARGUMENT_NAMES = /([^\s,]+)/g;

var _systemEndianness = function () {
	var b = new ArrayBuffer(4);
	var a = new Uint32Array(b);
	var c = new Uint8Array(b);
	a[0] = 0xdeadbeef;
	if (c[0] === 0xef) return 'LE';
	if (c[0] === 0xde) return 'BE';
	throw new Error('unknown endianness');
}();

var _isFloatReadPixelsSupported = null;
var _isFloatReadPixelsSupportedWebGL2 = null;

var _isMixedIdentifiersSupported = function () {
	try {
		new Function('let i = 1; const j = 1;')();
		return true;
	} catch (e) {
		return false;
	}
}();

var _hasIntegerDivisionAccuracyBug = null;

/**
 * @class
 * @extends UtilsCore
 */

var Utils = function (_UtilsCore) {
	_inherits(Utils, _UtilsCore);

	function Utils() {
		_classCallCheck(this, Utils);

		return _possibleConstructorReturn(this, (Utils.__proto__ || Object.getPrototypeOf(Utils)).apply(this, arguments));
	}

	_createClass(Utils, null, [{
		key: 'systemEndianness',


		//-----------------------------------------------------------------------------
		//
		//  System values support (currently only endianness)
		//
		//-----------------------------------------------------------------------------

		/**
   * @memberOf Utils
   * @name systemEndianness
   * @function
   * @static
   *
   * Gets the system endianness, and cache it
   *
   * @returns {String} 'LE' or 'BE' depending on system architecture
   *
   * Credit: https://gist.github.com/TooTallNate/4750953
   */
		value: function systemEndianness() {
			return _systemEndianness;
		}

		//-----------------------------------------------------------------------------
		//
		//  Function and function string validations
		//
		//-----------------------------------------------------------------------------

		/**
   * @memberOf Utils
   * @name isFunction
   * @function
   * @static
   *
   * Return TRUE, on a JS function
   *
   * @param {Function} funcObj - Object to validate if its a function
   *
   * @returns	{Boolean} TRUE if the object is a JS function
   *
   */

	}, {
		key: 'isFunction',
		value: function isFunction(funcObj) {
			return typeof funcObj === 'function';
		}

		/**
   * @memberOf Utils
   * @name isFunctionString
   * @function
   * @static
   *
   * Return TRUE, on a valid JS function string
   *
   * Note: This does just a VERY simply sanity check. And may give false positives.
   *
   * @param {String} funcStr - String of JS function to validate
   *
   * @returns {Boolean} TRUE if the string passes basic validation
   *
   */

	}, {
		key: 'isFunctionString',
		value: function isFunctionString(funcStr) {
			if (funcStr !== null) {
				return funcStr.toString().slice(0, 'function'.length).toLowerCase() === 'function';
			}
			return false;
		}

		/**
   * @memberOf Utils
   * @name getFunctionName_fromString
   * @function
   * @static
   *
   * Return the function name from a JS function string
   *
   * @param {String} funcStr - String of JS function to validate
   *
   * @returns {String} Function name string (if found)
   *
   */

	}, {
		key: 'getFunctionNameFromString',
		value: function getFunctionNameFromString(funcStr) {
			return FUNCTION_NAME.exec(funcStr)[1];
		}
	}, {
		key: 'getFunctionBodyFromString',
		value: function getFunctionBodyFromString(funcStr) {
			return funcStr.substring(funcStr.indexOf('{') + 1, funcStr.lastIndexOf('}'));
		}

		/**
   * @memberOf Utils
   * @name getParamNames_fromString
   * @function
   * @static
   *
   * Return list of parameter names extracted from the JS function string
   *
   * @param {String} funcStr - String of JS function to validate
   *
   * @returns {String[]}  Array representing all the parameter names
   *
   */

	}, {
		key: 'getParamNamesFromString',
		value: function getParamNamesFromString(func) {
			var fnStr = func.toString().replace(STRIP_COMMENTS, '');
			var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
			if (result === null) result = [];
			return result;
		}

		//-----------------------------------------------------------------------------
		//
		//  Object / function cloning and manipulation
		//
		//-----------------------------------------------------------------------------

		/**
   * @memberOf Utils
   * @name clone
   * @function
   * @static
   *
   * Returns a clone
   *
   * @param {Object} obj - Object to clone
   *
   * @returns {Object}  Cloned object
   *
   */

	}, {
		key: 'clone',
		value: function clone(obj) {
			if (obj === null || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj.hasOwnProperty('isActiveClone')) return obj;

			var temp = obj.constructor(); // changed

			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					obj.isActiveClone = null;
					temp[key] = Utils.clone(obj[key]);
					delete obj.isActiveClone;
				}
			}

			return temp;
		}

		/**
   * @memberOf Utils
   * @name newPromise
   * @function
   * @static
   *
   * Returns a `new Promise` object based on the underlying implmentation
   *
   * @param {Function} executor - Promise builder function
   *
   * @returns {Promise}  Promise object
   *
   */

	}, {
		key: 'newPromise',
		value: function newPromise(executor) {
			var simple = Promise || small_promise;
			if (simple === null) {
				throw TypeError('Browser is missing Promise implementation. Consider adding small_promise.js polyfill');
			}
			return new simple(executor);
		}

		/**
   * @memberOf Utils
   * @name functionBinder
   * @function
   * @static
   *
   * Limited implementation of Function.bind, with fallback
   *
   * @param {Function} inFunc - to setup bind on
   * @param {Object} thisObj - The this parameter to assume inside the binded function
   *
   * @returns {Function}  The binded function
   *
   */

	}, {
		key: 'functionBinder',
		value: function functionBinder(inFunc, thisObj) {
			if (inFunc.bind) {
				return inFunc.bind(thisObj);
			}

			return function () {
				var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
				return inFunc.apply(thisObj, args);
			};
		}

		/**
   * @memberOf Utils
   * @name isArray
   * @function
   * @static
   *
   * * Checks if is an array or Array-like object
   *
   * @param {Object} arg - The argument object to check if is array
   *
   * @returns {Boolean}  true if is array or Array-like object
   *
   */

	}, {
		key: 'isArray',
		value: function isArray(array) {
			if (isNaN(array.length)) {
				return false;
			}

			return true;
		}

		/**
   * @memberOf Utils
   * @name getArgumentType
   * @function
   * @static
   *
   * Evaluate the argument type, to apply respective logic for it
   *
   * @param {Object} arg - The argument object to evaluate type
   *
   * @returns {String}  Argument type Array/Number/Float/Texture/Unknown
   *
   */

	}, {
		key: 'getArgumentType',
		value: function getArgumentType(arg) {
			if (Utils.isArray(arg)) {
				if (arg[0].nodeName === 'IMG') {
					return 'HTMLImageArray';
				}
				return 'Array';
			} else if (typeof arg === 'number') {
				if (Number.isInteger(arg)) {
					return 'Integer';
				}
				return 'Float';
			} else if (arg instanceof Texture) {
				return arg.type;
			} else if (arg instanceof Input) {
				return 'Input';
			} else if (arg.nodeName === 'IMG') {
				return 'HTMLImage';
			} else {
				return 'Unknown';
			}
		}
		/**
   * @typedef {Object} gpuJSObject
   */

		/**
   * @memberOf Utils
   * @name isFloatReadPixelsSupported
   * @function
   * @static
   *
   * Checks if the browser supports readPixels with float type
   *
   * @returns {Boolean} true if browser supports
   *
   */

	}, {
		key: 'isFloatReadPixelsSupported',
		value: function isFloatReadPixelsSupported() {
			if (_isFloatReadPixelsSupported !== null) {
				return _isFloatReadPixelsSupported;
			}

			var GPU = require('../index');
			var gpu = new GPU({
				mode: 'webgl-validator'
			});
			var x = gpu.createKernel(function () {
				return 1;
			}, {
				output: [2],
				floatTextures: true,
				floatOutput: true,
				floatOutputForce: true
			})();

			_isFloatReadPixelsSupported = x[0] === 1;
			gpu.destroy();
			return _isFloatReadPixelsSupported;
		}

		/**
   * @memberOf Utils
   * @name isFloatReadPixelsSupportedWebGL2
   * @function
   * @static
   *
   * Checks if the browser supports readPixels with float type
   *
   * @returns {Boolean} true if browser supports
   *
   */

	}, {
		key: 'isFloatReadPixelsSupportedWebGL2',
		value: function isFloatReadPixelsSupportedWebGL2() {
			if (_isFloatReadPixelsSupportedWebGL2 !== null) {
				return _isFloatReadPixelsSupportedWebGL2;
			}

			var GPU = require('../index');
			var gpu = new GPU({
				mode: 'webgl2-validator'
			});
			var x = gpu.createKernel(function () {
				return 1;
			}, {
				output: [2],
				floatTextures: true,
				floatOutput: true,
				floatOutputForce: true
			})();

			_isFloatReadPixelsSupportedWebGL2 = x[0] === 1;
			gpu.destroy();
			return _isFloatReadPixelsSupportedWebGL2;
		}

		/**
   * @memberOf Utils
   * @name hasIntegerDivisionAccuracyBug
   * @function
   * @static
   *
   * Checks if the system has inaccuracies when dividing integers
   *
   * @returns {Boolean} true if bug is exhibited on this system
   *
   */

	}, {
		key: 'hasIntegerDivisionAccuracyBug',
		value: function hasIntegerDivisionAccuracyBug() {
			if (_hasIntegerDivisionAccuracyBug !== null) {
				return _hasIntegerDivisionAccuracyBug;
			}

			var GPU = require('../index');
			var gpu = new GPU({
				mode: 'webgl-validator'
			});
			var x = gpu.createKernel(function (v1, v2) {
				return v1[this.thread.x] / v2[this.thread.x];
			}, {
				output: [1]
			})([6, 6030401], [3, 3991]);

			// have we not got whole numbers for 6/3 or 6030401/3991
			// add more here if others see this problem
			_hasIntegerDivisionAccuracyBug = x[0] !== 2 || x[1] !== 1511;
			gpu.destroy();
			return _hasIntegerDivisionAccuracyBug;
		}
	}, {
		key: 'isMixedIdentifiersSupported',
		value: function isMixedIdentifiersSupported() {
			return _isMixedIdentifiersSupported;
		}
	}, {
		key: 'dimToTexSize',
		value: function dimToTexSize(opt, dimensions, output) {
			var numTexels = dimensions[0];
			var w = dimensions[0];
			var h = dimensions[1];
			for (var i = 1; i < dimensions.length; i++) {
				numTexels *= dimensions[i];
			}

			if (opt.floatTextures && (!output || opt.floatOutput)) {
				w = numTexels = Math.ceil(numTexels / 4);
			}
			// if given dimensions == a 2d image
			if (h > 1 && w * h === numTexels) {
				return [w, h];
			}
			// find as close to square width, height sizes as possible
			var sqrt = Math.sqrt(numTexels);
			var high = Math.ceil(sqrt);
			var low = Math.floor(sqrt);
			while (high * low > numTexels) {
				high--;
				low = Math.ceil(numTexels / high);
			}
			w = low;
			h = Math.ceil(numTexels / w);
			return [w, h];
		}

		/**
   * @memberOf Utils
   * @name getDimensions
   * @function
   * @static
   *
   * Return the dimension of an array.
   * 
   * @param {Array|String} x - The array
   * @param {number} [pad] - To include padding in the dimension calculation [Optional]
   *
   *
   *
   */

	}, {
		key: 'getDimensions',
		value: function getDimensions(x, pad) {
			var ret = void 0;
			if (Utils.isArray(x)) {
				var dim = [];
				var temp = x;
				while (Utils.isArray(temp)) {
					dim.push(temp.length);
					temp = temp[0];
				}
				ret = dim.reverse();
			} else if (x instanceof Texture) {
				ret = x.output;
			} else if (x instanceof Input) {
				ret = x.size;
			} else {
				throw 'Unknown dimensions of ' + x;
			}

			if (pad) {
				ret = Utils.clone(ret);
				while (ret.length < 3) {
					ret.push(1);
				}
			}
			// return ret;
			return new Int32Array(ret);
		}

		/**
   * @memberOf Utils
   * @name pad
   * @function
   * @static
   *
   * Pad an array AND its elements with leading and ending zeros
   *
   * @param {Array} arr - the array to pad zeros to
   * @param {number} padding - amount of padding
   *
   * @returns {Array} Array with leading and ending zeros, and all the elements padded by zeros.
   *
   */

	}, {
		key: 'pad',
		value: function pad(arr, padding) {
			function zeros(n) {
				return Array.apply(null, new Array(n)).map(Number.prototype.valueOf, 0);
			}

			var len = arr.length + padding * 2;

			var ret = arr.map(function (x) {
				return [].concat(zeros(padding), x, zeros(padding));
			});

			for (var i = 0; i < padding; i++) {
				ret = [].concat([zeros(len)], ret, [zeros(len)]);
			}

			return ret;
		}

		/**
   * @memberOf Utils
   * @name flatten2dArrayTo
   * @function
   * @static
   *
   * Puts a nested 2d array into a one-dimensional target array
   * @param {Array|*} array
   * @param {Float32Array|Float64Array} target
   */

	}, {
		key: 'flatten2dArrayTo',
		value: function flatten2dArrayTo(array, target) {
			var offset = 0;
			for (var y = 0; y < array.length; y++) {
				target.set(array[y], offset);
				offset += array[y].length;
			}
		}

		/**
   * @memberOf Utils
   * @name flatten3dArrayTo
   * @function
   * @static
   *
   * Puts a nested 3d array into a one-dimensional target array
   * @param {Array|*} array
   * @param {Float32Array|Float64Array} target
   */

	}, {
		key: 'flatten3dArrayTo',
		value: function flatten3dArrayTo(array, target) {
			var offset = 0;
			for (var z = 0; z < array.length; z++) {
				for (var y = 0; y < array[z].length; y++) {
					target.set(array[z][y], offset);
					offset += array[z][y].length;
				}
			}
		}

		/**
   * @memberOf Utils
   * @name flatten3dArrayTo
   * @function
   * @static
   *
   * Puts a nested 1d, 2d, or 3d array into a one-dimensional target array
   * @param {Array|*} array
   * @param {Float32Array|Float64Array} target
   */

	}, {
		key: 'flattenTo',
		value: function flattenTo(array, target) {
			if (Utils.isArray(array[0])) {
				if (Utils.isArray(array[0][0])) {
					Utils.flatten3dArrayTo(array, target);
				} else {
					Utils.flatten2dArrayTo(array, target);
				}
			} else {
				target.set(array);
			}
		}

		/**
   * @memberOf Utils
   * @name splitArray
   * @function
   * @static
   *
   * Splits an array into smaller arrays.
   * Number of elements in one small chunk is given by `part`
   *
   * @param {Array} array - The array to split into chunks
   * @param {Array} part - elements in one chunk
   *
  	 * @returns {Array} An array of smaller chunks
   *
   */

	}, {
		key: 'splitArray',
		value: function splitArray(array, part) {
			var result = [];
			for (var i = 0; i < array.length; i += part) {
				result.push(new array.constructor(array.buffer, i * 4 + array.byteOffset, part));
			}
			return result;
		}
	}, {
		key: 'getAstString',
		value: function getAstString(source, ast) {
			var lines = Array.isArray(source) ? source : source.split(/\r?\n/g);
			var start = ast.loc.start;
			var end = ast.loc.end;
			var result = [];
			result.push(lines[start.line - 1].slice(start.column));
			for (var i = start.line; i < end.line - 1; i++) {
				result.push(lines[i]);
			}
			result.push(lines[end.line - 1].slice(0, end.column));
			return result.join('\n');
		}
	}, {
		key: 'allPropertiesOf',
		value: function allPropertiesOf(obj) {
			var props = [];

			do {
				props.push.apply(props, Object.getOwnPropertyNames(obj));
			} while (obj = Object.getPrototypeOf(obj));

			return props;
		}
	}]);

	return Utils;
}(UtilsCore);

// This ensure static methods are "inherited"
// See: https://stackoverflow.com/questions/5441508/how-to-inherit-static-methods-from-base-class-in-javascript


Object.assign(Utils, UtilsCore);

module.exports = Utils;
},{"../index":"gpu.js","./input":29,"./texture":30,"./utils-core":31}],33:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.acorn = {})));
}(this, (function (exports) { 'use strict';

// Reserved word lists for various dialects of the language

var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};

// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

var keywords = {
  5: ecma5AndLessKeywords,
  6: ecma5AndLessKeywords + " const class extends export import super"
};

var keywordRelationalOperator = /^in(stanceof)?$/;

// ## Character categories

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `bin/generate-identifier-regex.js`.

var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fef\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7b9\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d3-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf7-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by bin/generate-identifier-regex.js

// eslint-disable-next-line comma-spacing
var astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,14,29,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,28,43,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,14,35,477,28,11,0,9,21,190,52,76,44,33,24,27,35,30,0,12,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,54,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,86,26,230,43,117,63,32,0,257,0,11,39,8,0,22,0,12,39,3,3,20,0,35,56,264,8,2,36,18,0,50,29,113,6,2,1,2,37,22,0,26,5,2,1,2,31,15,0,328,18,270,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,689,63,129,68,12,0,67,12,65,1,31,6129,15,754,9486,286,82,395,2309,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,60,67,1213,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,3,5761,15,7472,3104,541];

// eslint-disable-next-line comma-spacing
var astralIdentifierCodes = [509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,574,3,9,9,525,10,176,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,6,1,45,0,13,2,49,13,9,3,4,9,83,11,7,0,161,11,6,9,7,3,56,1,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,5,0,82,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,243,14,166,9,280,9,41,6,2,3,9,0,10,10,47,15,406,7,2,7,17,9,57,21,2,13,123,5,4,0,2,1,2,6,2,0,9,9,49,4,2,1,2,4,9,9,330,3,19306,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,2214,6,110,6,6,9,792487,239];

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) { return false }
    pos += set[i + 1];
    if (pos >= code) { return true }
  }
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) { return code === 36 }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes)
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) { return code === 36 }
  if (code < 58) { return true }
  if (code < 65) { return false }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
}

// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

var TokenType = function TokenType(label, conf) {
  if ( conf === void 0 ) conf = {};

  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};

function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}
var beforeExpr = {beforeExpr: true};
var startsExpr = {startsExpr: true};

// Map keyword names to token types.

var keywords$1 = {};

// Succinct definitions of keyword token types
function kw(name, options) {
  if ( options === void 0 ) options = {};

  options.keyword = name;
  return keywords$1[name] = new TokenType(name, options)
}

var types = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {beforeExpr: true}),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import"),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
};

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");

function isNewLine(code, ecma2019String) {
  return code === 10 || code === 13 || (!ecma2019String && (code === 0x2028 || code === 0x2029))
}

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;

// Checks if an object has a property.

function has(obj, propName) {
  return hasOwnProperty.call(obj, propName)
}

var isArray = Array.isArray || (function (obj) { return (
  toString.call(obj) === "[object Array]"
); });

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = function Position(line, col) {
  this.line = line;
  this.column = col;
};

Position.prototype.offset = function offset (n) {
  return new Position(this.line, this.column + n)
};

var SourceLocation = function SourceLocation(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) { this.source = p.sourceFile; }
};

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    lineBreakG.lastIndex = cur;
    var match = lineBreakG.exec(input);
    if (match && match.index < offset) {
      ++line;
      cur = match.index + match[0].length;
    } else {
      return new Position(line, offset - cur)
    }
  }
}

// A second optional argument can be given to further configure
// the parser process. These options are recognized:

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must
  // be either 3, 5, 6 (2015), 7 (2016), or 8 (2017). This influences support
  // for strict mode, the set of reserved words, and support for
  // new syntax features. The default is 7.
  ecmaVersion: 7,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"` or `"module"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called
  // when a semicolon is automatically inserted. It will be passed
  // th position of the comma as an offset, and if `locations` is
  // enabled, it is given the location as a `{line, column}` object
  // as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program.
  allowImportExportEverywhere: false,
  // When enabled, await identifiers are allowed to appear at the top-level scope,
  // but they are still not allowed in non-async functions.
  allowAwaitOutsideFunction: false,
  // When enabled, hashbang directive in the beginning of file
  // is allowed and treated as a line comment.
  allowHashBang: false,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false,
  plugins: {}
};

// Interpret and default an options object

function getOptions(opts) {
  var options = {};

  for (var opt in defaultOptions)
    { options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt]; }

  if (options.ecmaVersion >= 2015)
    { options.ecmaVersion -= 2009; }

  if (options.allowReserved == null)
    { options.allowReserved = options.ecmaVersion < 5; }

  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function (token) { return tokens.push(token); };
  }
  if (isArray(options.onComment))
    { options.onComment = pushComment(options, options.onComment); }

  return options
}

function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start: start,
      end: end
    };
    if (options.locations)
      { comment.loc = new SourceLocation(this, startLoc, endLoc); }
    if (options.ranges)
      { comment.range = [start, end]; }
    array.push(comment);
  }
}

// Registered plugins
var plugins = {};

function keywordRegexp(words) {
  return new RegExp("^(?:" + words.replace(/ /g, "|") + ")$")
}

var Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = keywordRegexp(keywords[options.ecmaVersion >= 6 ? 6 : 5]);
  var reserved = "";
  if (!options.allowReserved) {
    for (var v = options.ecmaVersion;; v--)
      { if (reserved = reservedWords[v]) { break } }
    if (options.sourceType === "module") { reserved += " await"; }
  }
  this.reservedWords = keywordRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = keywordRegexp(reservedStrict);
  this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.
  this.containsEsc = false;

  // Load plugins
  this.loadPlugins(options.plugins);

  // Set up token state

  // The current position of the tokenizer in the input.
  if (startPos) {
    this.pos = startPos;
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  } else {
    this.pos = this.lineStart = 0;
    this.curLine = 1;
  }

  // Properties of the current token:
  // Its type
  this.type = types.eof;
  // For tokens that include more information than their type, the value
  this.value = null;
  // Its start and end offset
  this.start = this.end = this.pos;
  // And, if locations are used, the {line, column} object
  // corresponding to those offsets
  this.startLoc = this.endLoc = this.curPosition();

  // Position information for the previous token
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;

  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.
  this.context = this.initialContext();
  this.exprAllowed = true;

  // Figure out if it's a module code.
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || this.strictDirective(this.pos);

  // Used to signify the start of a potential arrow function
  this.potentialArrowAt = -1;

  // Flags to track whether we are in a function, a generator, an async function.
  this.inFunction = this.inGenerator = this.inAsync = false;
  // Positions to delayed-check that yield/await does not exist in default parameters.
  this.yieldPos = this.awaitPos = 0;
  // Labels in scope.
  this.labels = [];

  // If enabled, skip leading hashbang line.
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
    { this.skipLineComment(2); }

  // Scope tracking for duplicate variable names (see scope.js)
  this.scopeStack = [];
  this.enterFunctionScope();

  // For RegExp validation
  this.regexpState = null;
};

// DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them
Parser.prototype.isKeyword = function isKeyword (word) { return this.keywords.test(word) };
Parser.prototype.isReservedWord = function isReservedWord (word) { return this.reservedWords.test(word) };

Parser.prototype.extend = function extend (name, f) {
  this[name] = f(this[name]);
};

Parser.prototype.loadPlugins = function loadPlugins (pluginConfigs) {
    var this$1 = this;

  for (var name in pluginConfigs) {
    var plugin = plugins[name];
    if (!plugin) { throw new Error("Plugin '" + name + "' not found") }
    plugin(this$1, pluginConfigs[name]);
  }
};

Parser.prototype.parse = function parse () {
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.parseTopLevel(node)
};

var pp = Parser.prototype;

// ## Parser utilities

var literal = /^(?:'((?:\\.|[^'])*?)'|"((?:\\.|[^"])*?)"|;)/;
pp.strictDirective = function(start) {
  var this$1 = this;

  for (;;) {
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this$1.input)[0].length;
    var match = literal.exec(this$1.input.slice(start));
    if (!match) { return false }
    if ((match[1] || match[2]) === "use strict") { return true }
    start += match[0].length;
  }
};

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true
  } else {
    return false
  }
};

// Tests whether parsed token is a contextual keyword.

pp.isContextual = function(name) {
  return this.type === types.name && this.value === name && !this.containsEsc
};

// Consumes contextual keyword if possible.

pp.eatContextual = function(name) {
  if (!this.isContextual(name)) { return false }
  this.next();
  return true
};

// Asserts that following token is given contextual keyword.

pp.expectContextual = function(name) {
  if (!this.eatContextual(name)) { this.unexpected(); }
};

// Test whether a semicolon can be inserted at the current position.

pp.canInsertSemicolon = function() {
  return this.type === types.eof ||
    this.type === types.braceR ||
    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

pp.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon)
      { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
    return true
  }
};

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp.semicolon = function() {
  if (!this.eat(types.semi) && !this.insertSemicolon()) { this.unexpected(); }
};

pp.afterTrailingComma = function(tokType, notNext) {
  if (this.type === tokType) {
    if (this.options.onTrailingComma)
      { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
    if (!notNext)
      { this.next(); }
    return true
  }
};

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp.expect = function(type) {
  this.eat(type) || this.unexpected();
};

// Raise an unexpected token error.

pp.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

function DestructuringErrors() {
  this.shorthandAssign =
  this.trailingComma =
  this.parenthesizedAssign =
  this.parenthesizedBind =
  this.doubleProto =
    -1;
}

pp.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) { return }
  if (refDestructuringErrors.trailingComma > -1)
    { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) { this.raiseRecoverable(parens, "Parenthesized pattern"); }
};

pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) { return false }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
  if (shorthandAssign >= 0)
    { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
  if (doubleProto >= 0)
    { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
};

pp.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
    { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
  if (this.awaitPos)
    { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
};

pp.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression")
    { return this.isSimpleAssignTarget(expr.expression) }
  return expr.type === "Identifier" || expr.type === "MemberExpression"
};

var pp$1 = Parser.prototype;

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp$1.parseTopLevel = function(node) {
  var this$1 = this;

  var exports = {};
  if (!node.body) { node.body = []; }
  while (this.type !== types.eof) {
    var stmt = this$1.parseStatement(true, true, exports);
    node.body.push(stmt);
  }
  this.adaptDirectivePrologue(node.body);
  this.next();
  if (this.options.ecmaVersion >= 6) {
    node.sourceType = this.options.sourceType;
  }
  return this.finishNode(node, "Program")
};

var loopLabel = {kind: "loop"};
var switchLabel = {kind: "switch"};

pp$1.isLet = function() {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
  if (nextCh === 91 || nextCh === 123) { return true } // '{' and '['
  if (isIdentifierStart(nextCh, true)) {
    var pos = next + 1;
    while (isIdentifierChar(this.input.charCodeAt(pos), true)) { ++pos; }
    var ident = this.input.slice(next, pos);
    if (!keywordRelationalOperator.test(ident)) { return true }
  }
  return false
};

// check 'async [no LineTerminator here] function'
// - 'async /*foo*/ function' is OK.
// - 'async /*\n*/ function' is invalid.
pp$1.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
    { return false }

  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length;
  return !lineBreak.test(this.input.slice(this.pos, next)) &&
    this.input.slice(next, next + 8) === "function" &&
    (next + 8 === this.input.length || !isIdentifierChar(this.input.charAt(next + 8)))
};

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp$1.parseStatement = function(declaration, topLevel, exports) {
  var starttype = this.type, node = this.startNode(), kind;

  if (this.isLet()) {
    starttype = types._var;
    kind = "let";
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
  case types._break: case types._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  case types._debugger: return this.parseDebuggerStatement(node)
  case types._do: return this.parseDoStatement(node)
  case types._for: return this.parseForStatement(node)
  case types._function:
    if (!declaration && this.options.ecmaVersion >= 6) { this.unexpected(); }
    return this.parseFunctionStatement(node, false)
  case types._class:
    if (!declaration) { this.unexpected(); }
    return this.parseClass(node, true)
  case types._if: return this.parseIfStatement(node)
  case types._return: return this.parseReturnStatement(node)
  case types._switch: return this.parseSwitchStatement(node)
  case types._throw: return this.parseThrowStatement(node)
  case types._try: return this.parseTryStatement(node)
  case types._const: case types._var:
    kind = kind || this.value;
    if (!declaration && kind !== "var") { this.unexpected(); }
    return this.parseVarStatement(node, kind)
  case types._while: return this.parseWhileStatement(node)
  case types._with: return this.parseWithStatement(node)
  case types.braceL: return this.parseBlock()
  case types.semi: return this.parseEmptyStatement(node)
  case types._export:
  case types._import:
    if (!this.options.allowImportExportEverywhere) {
      if (!topLevel)
        { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
      if (!this.inModule)
        { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
    }
    return starttype === types._import ? this.parseImport(node) : this.parseExport(node, exports)

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
  default:
    if (this.isAsyncFunction()) {
      if (!declaration) { this.unexpected(); }
      this.next();
      return this.parseFunctionStatement(node, true)
    }

    var maybeName = this.value, expr = this.parseExpression();
    if (starttype === types.name && expr.type === "Identifier" && this.eat(types.colon))
      { return this.parseLabeledStatement(node, maybeName, expr) }
    else { return this.parseExpressionStatement(node, expr) }
  }
};

pp$1.parseBreakContinueStatement = function(node, keyword) {
  var this$1 = this;

  var isBreak = keyword === "break";
  this.next();
  if (this.eat(types.semi) || this.insertSemicolon()) { node.label = null; }
  else if (this.type !== types.name) { this.unexpected(); }
  else {
    node.label = this.parseIdent();
    this.semicolon();
  }

  // Verify that there is an actual destination to break or
  // continue to.
  var i = 0;
  for (; i < this.labels.length; ++i) {
    var lab = this$1.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
      if (node.label && isBreak) { break }
    }
  }
  if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
};

pp$1.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement")
};

pp$1.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  this.expect(types._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6)
    { this.eat(types.semi); }
  else
    { this.semicolon(); }
  return this.finishNode(node, "DoWhileStatement")
};

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp$1.parseForStatement = function(node) {
  this.next();
  var awaitAt = (this.options.ecmaVersion >= 9 && (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction)) && this.eatContextual("await")) ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterLexicalScope();
  this.expect(types.parenL);
  if (this.type === types.semi) {
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, null)
  }
  var isLet = this.isLet();
  if (this.type === types._var || this.type === types._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    if ((this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1 &&
        !(kind !== "var" && init$1.declarations[0].init)) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === types._in) {
          if (awaitAt > -1) { this.unexpected(awaitAt); }
        } else { node.await = awaitAt > -1; }
      }
      return this.parseForIn(node, init$1)
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init$1)
  }
  var refDestructuringErrors = new DestructuringErrors;
  var init = this.parseExpression(true, refDestructuringErrors);
  if (this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (this.options.ecmaVersion >= 9) {
      if (this.type === types._in) {
        if (awaitAt > -1) { this.unexpected(awaitAt); }
      } else { node.await = awaitAt > -1; }
    }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLVal(init);
    return this.parseForIn(node, init)
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) { this.unexpected(awaitAt); }
  return this.parseFor(node, init)
};

pp$1.parseFunctionStatement = function(node, isAsync) {
  this.next();
  return this.parseFunction(node, true, false, isAsync)
};

pp$1.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  // allow function declarations in branches, but only in non-strict mode
  node.consequent = this.parseStatement(!this.strict && this.type === types._function);
  node.alternate = this.eat(types._else) ? this.parseStatement(!this.strict && this.type === types._function) : null;
  return this.finishNode(node, "IfStatement")
};

pp$1.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
    { this.raise(this.start, "'return' outside of function"); }
  this.next();

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(types.semi) || this.insertSemicolon()) { node.argument = null; }
  else { node.argument = this.parseExpression(); this.semicolon(); }
  return this.finishNode(node, "ReturnStatement")
};

pp$1.parseSwitchStatement = function(node) {
  var this$1 = this;

  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types.braceL);
  this.labels.push(switchLabel);
  this.enterLexicalScope();

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  var cur;
  for (var sawDefault = false; this.type !== types.braceR;) {
    if (this$1.type === types._case || this$1.type === types._default) {
      var isCase = this$1.type === types._case;
      if (cur) { this$1.finishNode(cur, "SwitchCase"); }
      node.cases.push(cur = this$1.startNode());
      cur.consequent = [];
      this$1.next();
      if (isCase) {
        cur.test = this$1.parseExpression();
      } else {
        if (sawDefault) { this$1.raiseRecoverable(this$1.lastTokStart, "Multiple default clauses"); }
        sawDefault = true;
        cur.test = null;
      }
      this$1.expect(types.colon);
    } else {
      if (!cur) { this$1.unexpected(); }
      cur.consequent.push(this$1.parseStatement(true));
    }
  }
  this.exitLexicalScope();
  if (cur) { this.finishNode(cur, "SwitchCase"); }
  this.next(); // Closing brace
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement")
};

pp$1.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
    { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement")
};

// Reused empty array added for node fields that are always empty.

var empty = [];

pp$1.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types._catch) {
    var clause = this.startNode();
    this.next();
    if (this.eat(types.parenL)) {
      clause.param = this.parseBindingAtom();
      this.enterLexicalScope();
      this.checkLVal(clause.param, "let");
      this.expect(types.parenR);
    } else {
      if (this.options.ecmaVersion < 10) { this.unexpected(); }
      clause.param = null;
      this.enterLexicalScope();
    }
    clause.body = this.parseBlock(false);
    this.exitLexicalScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer)
    { this.raise(node.start, "Missing catch or finally clause"); }
  return this.finishNode(node, "TryStatement")
};

pp$1.parseVarStatement = function(node, kind) {
  this.next();
  this.parseVar(node, false, kind);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration")
};

pp$1.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "WhileStatement")
};

pp$1.parseWithStatement = function(node) {
  if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement(false);
  return this.finishNode(node, "WithStatement")
};

pp$1.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement")
};

pp$1.parseLabeledStatement = function(node, maybeName, expr) {
  var this$1 = this;

  for (var i$1 = 0, list = this$1.labels; i$1 < list.length; i$1 += 1)
    {
    var label = list[i$1];

    if (label.name === maybeName)
      { this$1.raise(expr.start, "Label '" + maybeName + "' is already declared");
  } }
  var kind = this.type.isLoop ? "loop" : this.type === types._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label$1 = this$1.labels[i];
    if (label$1.statementStart === node.start) {
      // Update information about previous labels on this node
      label$1.statementStart = this$1.start;
      label$1.kind = kind;
    } else { break }
  }
  this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
  node.body = this.parseStatement(true);
  if (node.body.type === "ClassDeclaration" ||
      node.body.type === "VariableDeclaration" && node.body.kind !== "var" ||
      node.body.type === "FunctionDeclaration" && (this.strict || node.body.generator || node.body.async))
    { this.raiseRecoverable(node.body.start, "Invalid labeled declaration"); }
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement")
};

pp$1.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement")
};

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp$1.parseBlock = function(createNewLexicalScope) {
  var this$1 = this;
  if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;

  var node = this.startNode();
  node.body = [];
  this.expect(types.braceL);
  if (createNewLexicalScope) {
    this.enterLexicalScope();
  }
  while (!this.eat(types.braceR)) {
    var stmt = this$1.parseStatement(true);
    node.body.push(stmt);
  }
  if (createNewLexicalScope) {
    this.exitLexicalScope();
  }
  return this.finishNode(node, "BlockStatement")
};

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp$1.parseFor = function(node, init) {
  node.init = init;
  this.expect(types.semi);
  node.test = this.type === types.semi ? null : this.parseExpression();
  this.expect(types.semi);
  node.update = this.type === types.parenR ? null : this.parseExpression();
  this.expect(types.parenR);
  this.exitLexicalScope();
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "ForStatement")
};

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp$1.parseForIn = function(node, init) {
  var type = this.type === types._in ? "ForInStatement" : "ForOfStatement";
  this.next();
  if (type === "ForInStatement") {
    if (init.type === "AssignmentPattern" ||
      (init.type === "VariableDeclaration" && init.declarations[0].init != null &&
       (this.strict || init.declarations[0].id.type !== "Identifier")))
      { this.raise(init.start, "Invalid assignment in for-in loop head"); }
  }
  node.left = init;
  node.right = type === "ForInStatement" ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types.parenR);
  this.exitLexicalScope();
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, type)
};

// Parse a list of variable declarations.

pp$1.parseVar = function(node, isFor, kind) {
  var this$1 = this;

  node.declarations = [];
  node.kind = kind;
  for (;;) {
    var decl = this$1.startNode();
    this$1.parseVarId(decl, kind);
    if (this$1.eat(types.eq)) {
      decl.init = this$1.parseMaybeAssign(isFor);
    } else if (kind === "const" && !(this$1.type === types._in || (this$1.options.ecmaVersion >= 6 && this$1.isContextual("of")))) {
      this$1.unexpected();
    } else if (decl.id.type !== "Identifier" && !(isFor && (this$1.type === types._in || this$1.isContextual("of")))) {
      this$1.raise(this$1.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this$1.finishNode(decl, "VariableDeclarator"));
    if (!this$1.eat(types.comma)) { break }
  }
  return node
};

pp$1.parseVarId = function(decl, kind) {
  decl.id = this.parseBindingAtom(kind);
  this.checkLVal(decl.id, kind, false);
};

// Parse a function declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseFunction = function(node, isStatement, allowExpressionBody, isAsync) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync)
    { node.generator = this.eat(types.star); }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  if (isStatement) {
    node.id = isStatement === "nullableID" && this.type !== types.name ? null : this.parseIdent();
    if (node.id) {
      this.checkLVal(node.id, this.inModule && !this.inFunction ? "let" : "var");
    }
  }

  var oldInGen = this.inGenerator, oldInAsync = this.inAsync,
      oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;
  this.inGenerator = node.generator;
  this.inAsync = node.async;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.inFunction = true;
  this.enterFunctionScope();

  if (!isStatement)
    { node.id = this.type === types.name ? this.parseIdent() : null; }

  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody);

  this.inGenerator = oldInGen;
  this.inAsync = oldInAsync;
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.inFunction = oldInFunc;
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression")
};

pp$1.parseFunctionParams = function(node) {
  this.expect(types.parenL);
  node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseClass = function(node, isStatement) {
  var this$1 = this;

  this.next();

  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types.braceL);
  while (!this.eat(types.braceR)) {
    var member = this$1.parseClassMember(classBody);
    if (member && member.type === "MethodDefinition" && member.kind === "constructor") {
      if (hadConstructor) { this$1.raise(member.start, "Duplicate constructor in the same class"); }
      hadConstructor = true;
    }
  }
  node.body = this.finishNode(classBody, "ClassBody");
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
};

pp$1.parseClassMember = function(classBody) {
  var this$1 = this;

  if (this.eat(types.semi)) { return null }

  var method = this.startNode();
  var tryContextual = function (k, noLineBreak) {
    if ( noLineBreak === void 0 ) noLineBreak = false;

    var start = this$1.start, startLoc = this$1.startLoc;
    if (!this$1.eatContextual(k)) { return false }
    if (this$1.type !== types.parenL && (!noLineBreak || !this$1.canInsertSemicolon())) { return true }
    if (method.key) { this$1.unexpected(); }
    method.computed = false;
    method.key = this$1.startNodeAt(start, startLoc);
    method.key.name = k;
    this$1.finishNode(method.key, "Identifier");
    return false
  };

  method.kind = "method";
  method.static = tryContextual("static");
  var isGenerator = this.eat(types.star);
  var isAsync = false;
  if (!isGenerator) {
    if (this.options.ecmaVersion >= 8 && tryContextual("async", true)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
    } else if (tryContextual("get")) {
      method.kind = "get";
    } else if (tryContextual("set")) {
      method.kind = "set";
    }
  }
  if (!method.key) { this.parsePropertyName(method); }
  var key = method.key;
  if (!method.computed && !method.static && (key.type === "Identifier" && key.name === "constructor" ||
      key.type === "Literal" && key.value === "constructor")) {
    if (method.kind !== "method") { this.raise(key.start, "Constructor can't have get/set modifier"); }
    if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
    if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
    method.kind = "constructor";
  } else if (method.static && key.type === "Identifier" && key.name === "prototype") {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }
  this.parseClassMethod(classBody, method, isGenerator, isAsync);
  if (method.kind === "get" && method.value.params.length !== 0)
    { this.raiseRecoverable(method.value.start, "getter should have no params"); }
  if (method.kind === "set" && method.value.params.length !== 1)
    { this.raiseRecoverable(method.value.start, "setter should have exactly one param"); }
  if (method.kind === "set" && method.value.params[0].type === "RestElement")
    { this.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params"); }
  return method
};

pp$1.parseClassMethod = function(classBody, method, isGenerator, isAsync) {
  method.value = this.parseMethod(isGenerator, isAsync);
  classBody.body.push(this.finishNode(method, "MethodDefinition"));
};

pp$1.parseClassId = function(node, isStatement) {
  node.id = this.type === types.name ? this.parseIdent() : isStatement === true ? this.unexpected() : null;
};

pp$1.parseClassSuper = function(node) {
  node.superClass = this.eat(types._extends) ? this.parseExprSubscripts() : null;
};

// Parses module export declaration.

pp$1.parseExport = function(node, exports) {
  var this$1 = this;

  this.next();
  // export * from '...'
  if (this.eat(types.star)) {
    this.expectContextual("from");
    if (this.type !== types.string) { this.unexpected(); }
    node.source = this.parseExprAtom();
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration")
  }
  if (this.eat(types._default)) { // export default ...
    this.checkExport(exports, "default", this.lastTokStart);
    var isAsync;
    if (this.type === types._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) { this.next(); }
      node.declaration = this.parseFunction(fNode, "nullableID", false, isAsync);
    } else if (this.type === types._class) {
      var cNode = this.startNode();
      node.declaration = this.parseClass(cNode, "nullableID");
    } else {
      node.declaration = this.parseMaybeAssign();
      this.semicolon();
    }
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(true);
    if (node.declaration.type === "VariableDeclaration")
      { this.checkVariableExport(exports, node.declaration.declarations); }
    else
      { this.checkExport(exports, node.declaration.id.name, node.declaration.id.start); }
    node.specifiers = [];
    node.source = null;
  } else { // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports);
    if (this.eatContextual("from")) {
      if (this.type !== types.string) { this.unexpected(); }
      node.source = this.parseExprAtom();
    } else {
      // check for keywords used as local names
      for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
        var spec = list[i];

        this$1.checkUnreserved(spec.local);
      }

      node.source = null;
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration")
};

pp$1.checkExport = function(exports, name, pos) {
  if (!exports) { return }
  if (has(exports, name))
    { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
  exports[name] = true;
};

pp$1.checkPatternExport = function(exports, pat) {
  var this$1 = this;

  var type = pat.type;
  if (type === "Identifier")
    { this.checkExport(exports, pat.name, pat.start); }
  else if (type === "ObjectPattern")
    { for (var i = 0, list = pat.properties; i < list.length; i += 1)
      {
        var prop = list[i];

        this$1.checkPatternExport(exports, prop);
      } }
  else if (type === "ArrayPattern")
    { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];

        if (elt) { this$1.checkPatternExport(exports, elt); }
    } }
  else if (type === "Property")
    { this.checkPatternExport(exports, pat.value); }
  else if (type === "AssignmentPattern")
    { this.checkPatternExport(exports, pat.left); }
  else if (type === "RestElement")
    { this.checkPatternExport(exports, pat.argument); }
  else if (type === "ParenthesizedExpression")
    { this.checkPatternExport(exports, pat.expression); }
};

pp$1.checkVariableExport = function(exports, decls) {
  var this$1 = this;

  if (!exports) { return }
  for (var i = 0, list = decls; i < list.length; i += 1)
    {
    var decl = list[i];

    this$1.checkPatternExport(exports, decl.id);
  }
};

pp$1.shouldParseExportStatement = function() {
  return this.type.keyword === "var" ||
    this.type.keyword === "const" ||
    this.type.keyword === "class" ||
    this.type.keyword === "function" ||
    this.isLet() ||
    this.isAsyncFunction()
};

// Parses a comma-separated list of module exports.

pp$1.parseExportSpecifiers = function(exports) {
  var this$1 = this;

  var nodes = [], first = true;
  // export { x, y as z } [from '...']
  this.expect(types.braceL);
  while (!this.eat(types.braceR)) {
    if (!first) {
      this$1.expect(types.comma);
      if (this$1.afterTrailingComma(types.braceR)) { break }
    } else { first = false; }

    var node = this$1.startNode();
    node.local = this$1.parseIdent(true);
    node.exported = this$1.eatContextual("as") ? this$1.parseIdent(true) : node.local;
    this$1.checkExport(exports, node.exported.name, node.exported.start);
    nodes.push(this$1.finishNode(node, "ExportSpecifier"));
  }
  return nodes
};

// Parses import declaration.

pp$1.parseImport = function(node) {
  this.next();
  // import '...'
  if (this.type === types.string) {
    node.specifiers = empty;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types.string ? this.parseExprAtom() : this.unexpected();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration")
};

// Parses a comma-separated list of module imports.

pp$1.parseImportSpecifiers = function() {
  var this$1 = this;

  var nodes = [], first = true;
  if (this.type === types.name) {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLVal(node.local, "let");
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
    if (!this.eat(types.comma)) { return nodes }
  }
  if (this.type === types.star) {
    var node$1 = this.startNode();
    this.next();
    this.expectContextual("as");
    node$1.local = this.parseIdent();
    this.checkLVal(node$1.local, "let");
    nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"));
    return nodes
  }
  this.expect(types.braceL);
  while (!this.eat(types.braceR)) {
    if (!first) {
      this$1.expect(types.comma);
      if (this$1.afterTrailingComma(types.braceR)) { break }
    } else { first = false; }

    var node$2 = this$1.startNode();
    node$2.imported = this$1.parseIdent(true);
    if (this$1.eatContextual("as")) {
      node$2.local = this$1.parseIdent();
    } else {
      this$1.checkUnreserved(node$2.imported);
      node$2.local = node$2.imported;
    }
    this$1.checkLVal(node$2.local, "let");
    nodes.push(this$1.finishNode(node$2, "ImportSpecifier"));
  }
  return nodes
};

// Set `ExpressionStatement#directive` property for directive prologues.
pp$1.adaptDirectivePrologue = function(statements) {
  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};
pp$1.isDirectiveCandidate = function(statement) {
  return (
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "Literal" &&
    typeof statement.expression.value === "string" &&
    // Reject parenthesized strings.
    (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
  )
};

var pp$2 = Parser.prototype;

// Convert existing expression atom to assignable pattern
// if possible.

pp$2.toAssignable = function(node, isBinding, refDestructuringErrors) {
  var this$1 = this;

  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
    case "Identifier":
      if (this.inAsync && node.name === "await")
        { this.raise(node.start, "Can not use 'await' as identifier inside an async function"); }
      break

    case "ObjectPattern":
    case "ArrayPattern":
    case "RestElement":
      break

    case "ObjectExpression":
      node.type = "ObjectPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      for (var i = 0, list = node.properties; i < list.length; i += 1) {
        var prop = list[i];

      this$1.toAssignable(prop, isBinding);
        // Early error:
        //   AssignmentRestProperty[Yield, Await] :
        //     `...` DestructuringAssignmentTarget[Yield, Await]
        //
        //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
        if (
          prop.type === "RestElement" &&
          (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
        ) {
          this$1.raise(prop.argument.start, "Unexpected token");
        }
      }
      break

    case "Property":
      // AssignmentProperty has type === "Property"
      if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
      this.toAssignable(node.value, isBinding);
      break

    case "ArrayExpression":
      node.type = "ArrayPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      this.toAssignableList(node.elements, isBinding);
      break

    case "SpreadElement":
      node.type = "RestElement";
      this.toAssignable(node.argument, isBinding);
      if (node.argument.type === "AssignmentPattern")
        { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
      break

    case "AssignmentExpression":
      if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
      node.type = "AssignmentPattern";
      delete node.operator;
      this.toAssignable(node.left, isBinding);
      // falls through to AssignmentPattern

    case "AssignmentPattern":
      break

    case "ParenthesizedExpression":
      this.toAssignable(node.expression, isBinding);
      break

    case "MemberExpression":
      if (!isBinding) { break }

    default:
      this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
  return node
};

// Convert list of expression atoms to binding list.

pp$2.toAssignableList = function(exprList, isBinding) {
  var this$1 = this;

  var end = exprList.length;
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) { this$1.toAssignable(elt, isBinding); }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
      { this.unexpected(last.argument.start); }
  }
  return exprList
};

// Parses spread element.

pp$2.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement")
};

pp$2.parseRestBinding = function() {
  var node = this.startNode();
  this.next();

  // RestElement inside of a function parameter must be an identifier
  if (this.options.ecmaVersion === 6 && this.type !== types.name)
    { this.unexpected(); }

  node.argument = this.parseBindingAtom();

  return this.finishNode(node, "RestElement")
};

// Parses lvalue (assignable) atom.

pp$2.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
    case types.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(types.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern")

    case types.braceL:
      return this.parseObj(true)
    }
  }
  return this.parseIdent()
};

pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma) {
  var this$1 = this;

  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) { first = false; }
    else { this$1.expect(types.comma); }
    if (allowEmpty && this$1.type === types.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this$1.afterTrailingComma(close)) {
      break
    } else if (this$1.type === types.ellipsis) {
      var rest = this$1.parseRestBinding();
      this$1.parseBindingListItem(rest);
      elts.push(rest);
      if (this$1.type === types.comma) { this$1.raise(this$1.start, "Comma is not permitted after the rest element"); }
      this$1.expect(close);
      break
    } else {
      var elem = this$1.parseMaybeDefault(this$1.start, this$1.startLoc);
      this$1.parseBindingListItem(elem);
      elts.push(elem);
    }
  }
  return elts
};

pp$2.parseBindingListItem = function(param) {
  return param
};

// Parses assignment pattern around given atom if possible.

pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types.eq)) { return left }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern")
};

// Verify that a node is an lval — something that can be assigned
// to.
// bindingType can be either:
// 'var' indicating that the lval creates a 'var' binding
// 'let' indicating that the lval creates a lexical ('let' or 'const') binding
// 'none' indicating that the binding should be checked for illegal identifiers, but not for duplicate references

pp$2.checkLVal = function(expr, bindingType, checkClashes) {
  var this$1 = this;

  switch (expr.type) {
  case "Identifier":
    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
      { this.raiseRecoverable(expr.start, (bindingType ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
    if (checkClashes) {
      if (has(checkClashes, expr.name))
        { this.raiseRecoverable(expr.start, "Argument name clash"); }
      checkClashes[expr.name] = true;
    }
    if (bindingType && bindingType !== "none") {
      if (
        bindingType === "var" && !this.canDeclareVarName(expr.name) ||
        bindingType !== "var" && !this.canDeclareLexicalName(expr.name)
      ) {
        this.raiseRecoverable(expr.start, ("Identifier '" + (expr.name) + "' has already been declared"));
      }
      if (bindingType === "var") {
        this.declareVarName(expr.name);
      } else {
        this.declareLexicalName(expr.name);
      }
    }
    break

  case "MemberExpression":
    if (bindingType) { this.raiseRecoverable(expr.start, "Binding member expression"); }
    break

  case "ObjectPattern":
    for (var i = 0, list = expr.properties; i < list.length; i += 1)
      {
    var prop = list[i];

    this$1.checkLVal(prop, bindingType, checkClashes);
  }
    break

  case "Property":
    // AssignmentProperty has type === "Property"
    this.checkLVal(expr.value, bindingType, checkClashes);
    break

  case "ArrayPattern":
    for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
      var elem = list$1[i$1];

    if (elem) { this$1.checkLVal(elem, bindingType, checkClashes); }
    }
    break

  case "AssignmentPattern":
    this.checkLVal(expr.left, bindingType, checkClashes);
    break

  case "RestElement":
    this.checkLVal(expr.argument, bindingType, checkClashes);
    break

  case "ParenthesizedExpression":
    this.checkLVal(expr.expression, bindingType, checkClashes);
    break

  default:
    this.raise(expr.start, (bindingType ? "Binding" : "Assigning to") + " rvalue");
  }
};

// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

var pp$3 = Parser.prototype;

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp$3.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
    { return }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
    { return }
  var key = prop.key;
  var name;
  switch (key.type) {
  case "Identifier": name = key.name; break
  case "Literal": name = String(key.value); break
  default: return
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors && refDestructuringErrors.doubleProto < 0) { refDestructuringErrors.doubleProto = key.start; }
        // Backwards-compat kludge. Can be removed in version 6.0
        else { this.raiseRecoverable(key.start, "Redefinition of __proto__ property"); }
      }
      propHash.proto = true;
    }
    return
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition)
      { this.raiseRecoverable(key.start, "Redefinition of property"); }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp$3.parseExpression = function(noIn, refDestructuringErrors) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
  if (this.type === types.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(types.comma)) { node.expressions.push(this$1.parseMaybeAssign(noIn, refDestructuringErrors)); }
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
};

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
  if (this.inGenerator && this.isContextual("yield")) { return this.parseYield() }

  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors;
    ownDestructuringErrors = true;
  }

  var startPos = this.start, startLoc = this.startLoc;
  if (this.type === types.parenL || this.type === types.name)
    { this.potentialArrowAt = this.start; }
  var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
  if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    node.left = this.type === types.eq ? this.toAssignable(left, false, refDestructuringErrors) : left;
    if (!ownDestructuringErrors) { DestructuringErrors.call(refDestructuringErrors); }
    refDestructuringErrors.shorthandAssign = -1; // reset because shorthand default was used correctly
    this.checkLVal(left);
    this.next();
    node.right = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "AssignmentExpression")
  } else {
    if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
  }
  if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
  if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
  return left
};

// Parse a ternary conditional (`?:`) operator.

pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(noIn, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  if (this.eat(types.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types.colon);
    node.alternate = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
};

// Start the precedence parser.

pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, noIn)
};

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
  var prec = this.type.binop;
  if (prec != null && (!noIn || this.type !== types._in)) {
    if (prec > minPrec) {
      var logical = this.type === types.logicalOR || this.type === types.logicalAND;
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
    }
  }
  return left
};

pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
};

// Parse unary operators, both prefix and postfix.

pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.isContextual("await") && (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction))) {
    expr = this.parseAwait();
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) { this.checkLVal(node.argument); }
    else if (this.strict && node.operator === "delete" &&
             node.argument.type === "Identifier")
      { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
    else { sawUnary = true; }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this$1.startNodeAt(startPos, startLoc);
      node$1.operator = this$1.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this$1.checkLVal(expr);
      this$1.next();
      expr = this$1.finishNode(node$1, "UpdateExpression");
    }
  }

  if (!sawUnary && this.eat(types.starstar))
    { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false) }
  else
    { return expr }
};

// Parse call, dot, and `[]`-subscript expressions.

pp$3.parseExprSubscripts = function(refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors);
  var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
  if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) { return expr }
  var result = this.parseSubscripts(expr, startPos, startLoc);
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
    if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
  }
  return result
};

pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
  var this$1 = this;

  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
      this.lastTokEnd === base.end && !this.canInsertSemicolon() && this.input.slice(base.start, base.end) === "async";
  for (var computed = (void 0);;) {
    if ((computed = this$1.eat(types.bracketL)) || this$1.eat(types.dot)) {
      var node = this$1.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = computed ? this$1.parseExpression() : this$1.parseIdent(true);
      node.computed = !!computed;
      if (computed) { this$1.expect(types.bracketR); }
      base = this$1.finishNode(node, "MemberExpression");
    } else if (!noCalls && this$1.eat(types.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this$1.yieldPos, oldAwaitPos = this$1.awaitPos;
      this$1.yieldPos = 0;
      this$1.awaitPos = 0;
      var exprList = this$1.parseExprList(types.parenR, this$1.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !this$1.canInsertSemicolon() && this$1.eat(types.arrow)) {
        this$1.checkPatternErrors(refDestructuringErrors, false);
        this$1.checkYieldAwaitInDefaultParams();
        this$1.yieldPos = oldYieldPos;
        this$1.awaitPos = oldAwaitPos;
        return this$1.parseArrowExpression(this$1.startNodeAt(startPos, startLoc), exprList, true)
      }
      this$1.checkExpressionErrors(refDestructuringErrors, true);
      this$1.yieldPos = oldYieldPos || this$1.yieldPos;
      this$1.awaitPos = oldAwaitPos || this$1.awaitPos;
      var node$1 = this$1.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      base = this$1.finishNode(node$1, "CallExpression");
    } else if (this$1.type === types.backQuote) {
      var node$2 = this$1.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this$1.parseTemplate({isTagged: true});
      base = this$1.finishNode(node$2, "TaggedTemplateExpression");
    } else {
      return base
    }
  }
};

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp$3.parseExprAtom = function(refDestructuringErrors) {
  var node, canBeArrow = this.potentialArrowAt === this.start;
  switch (this.type) {
  case types._super:
    if (!this.inFunction)
      { this.raise(this.start, "'super' outside of function or class"); }
    node = this.startNode();
    this.next();
    // The `super` keyword can appear at below:
    // SuperProperty:
    //     super [ Expression ]
    //     super . IdentifierName
    // SuperCall:
    //     super Arguments
    if (this.type !== types.dot && this.type !== types.bracketL && this.type !== types.parenL)
      { this.unexpected(); }
    return this.finishNode(node, "Super")

  case types._this:
    node = this.startNode();
    this.next();
    return this.finishNode(node, "ThisExpression")

  case types.name:
    var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
    var id = this.parseIdent(this.type !== types.name);
    if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types._function))
      { return this.parseFunction(this.startNodeAt(startPos, startLoc), false, false, true) }
    if (canBeArrow && !this.canInsertSemicolon()) {
      if (this.eat(types.arrow))
        { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false) }
      if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types.name && !containsEsc) {
        id = this.parseIdent();
        if (this.canInsertSemicolon() || !this.eat(types.arrow))
          { this.unexpected(); }
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true)
      }
    }
    return id

  case types.regexp:
    var value = this.value;
    node = this.parseLiteral(value.value);
    node.regex = {pattern: value.pattern, flags: value.flags};
    return node

  case types.num: case types.string:
    return this.parseLiteral(this.value)

  case types._null: case types._true: case types._false:
    node = this.startNode();
    node.value = this.type === types._null ? null : this.type === types._true;
    node.raw = this.type.keyword;
    this.next();
    return this.finishNode(node, "Literal")

  case types.parenL:
    var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow);
    if (refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
        { refDestructuringErrors.parenthesizedAssign = start; }
      if (refDestructuringErrors.parenthesizedBind < 0)
        { refDestructuringErrors.parenthesizedBind = start; }
    }
    return expr

  case types.bracketL:
    node = this.startNode();
    this.next();
    node.elements = this.parseExprList(types.bracketR, true, true, refDestructuringErrors);
    return this.finishNode(node, "ArrayExpression")

  case types.braceL:
    return this.parseObj(false, refDestructuringErrors)

  case types._function:
    node = this.startNode();
    this.next();
    return this.parseFunction(node, false)

  case types._class:
    return this.parseClass(this.startNode(), false)

  case types._new:
    return this.parseNew()

  case types.backQuote:
    return this.parseTemplate()

  default:
    this.unexpected();
  }
};

pp$3.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  this.next();
  return this.finishNode(node, "Literal")
};

pp$3.parseParenExpression = function() {
  this.expect(types.parenL);
  var val = this.parseExpression();
  this.expect(types.parenR);
  return val
};

pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();

    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    while (this.type !== types.parenR) {
      first ? first = false : this$1.expect(types.comma);
      if (allowTrailingComma && this$1.afterTrailingComma(types.parenR, true)) {
        lastIsComma = true;
        break
      } else if (this$1.type === types.ellipsis) {
        spreadStart = this$1.start;
        exprList.push(this$1.parseParenItem(this$1.parseRestBinding()));
        if (this$1.type === types.comma) { this$1.raise(this$1.start, "Comma is not permitted after the rest element"); }
        break
      } else {
        exprList.push(this$1.parseMaybeAssign(false, refDestructuringErrors, this$1.parseParenItem));
      }
    }
    var innerEndPos = this.start, innerEndLoc = this.startLoc;
    this.expect(types.parenR);

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(types.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList)
    }

    if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
    if (spreadStart) { this.unexpected(spreadStart); }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression")
  } else {
    return val
  }
};

pp$3.parseParenItem = function(item) {
  return item
};

pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList)
};

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty$1 = [];

pp$3.parseNew = function() {
  var node = this.startNode();
  var meta = this.parseIdent(true);
  if (this.options.ecmaVersion >= 6 && this.eat(types.dot)) {
    node.meta = meta;
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target" || containsEsc)
      { this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target"); }
    if (!this.inFunction)
      { this.raiseRecoverable(node.start, "new.target can only be used in functions"); }
    return this.finishNode(node, "MetaProperty")
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
  if (this.eat(types.parenL)) { node.arguments = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false); }
  else { node.arguments = empty$1; }
  return this.finishNode(node, "NewExpression")
};

// Parse template expression.

pp$3.parseTemplateElement = function(ref) {
  var isTagged = ref.isTagged;

  var elem = this.startNode();
  if (this.type === types.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value,
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types.backQuote;
  return this.finishNode(elem, "TemplateElement")
};

pp$3.parseTemplate = function(ref) {
  var this$1 = this;
  if ( ref === void 0 ) ref = {};
  var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({isTagged: isTagged});
  node.quasis = [curElt];
  while (!curElt.tail) {
    if (this$1.type === types.eof) { this$1.raise(this$1.pos, "Unterminated template literal"); }
    this$1.expect(types.dollarBraceL);
    node.expressions.push(this$1.parseExpression());
    this$1.expect(types.braceR);
    node.quasis.push(curElt = this$1.parseTemplateElement({isTagged: isTagged}));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral")
};

pp$3.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
    (this.type === types.name || this.type === types.num || this.type === types.string || this.type === types.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types.star)) &&
    !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

// Parse an object literal or binding pattern.

pp$3.parseObj = function(isPattern, refDestructuringErrors) {
  var this$1 = this;

  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types.braceR)) {
    if (!first) {
      this$1.expect(types.comma);
      if (this$1.afterTrailingComma(types.braceR)) { break }
    } else { first = false; }

    var prop = this$1.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) { this$1.checkPropClash(prop, propHash, refDestructuringErrors); }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
};

pp$3.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types.comma) {
        this.raise(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement")
    }
    // To disallow parenthesized identifier via `this.toAssignable()`.
    if (this.type === types.parenL && refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0) {
        refDestructuringErrors.parenthesizedAssign = this.start;
      }
      if (refDestructuringErrors.parenthesizedBind < 0) {
        refDestructuringErrors.parenthesizedBind = this.start;
      }
    }
    // Parse argument.
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    // To disallow trailing comma via `this.toAssignable()`.
    if (this.type === types.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    // Finish
    return this.finishNode(prop, "SpreadElement")
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern)
      { isGenerator = this.eat(types.star); }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
    this.parsePropertyName(prop, refDestructuringErrors);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property")
};

pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types.colon)
    { this.unexpected(); }

  if (this.eat(types.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types.parenL) {
    if (isPattern) { this.unexpected(); }
    prop.kind = "init";
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
  } else if (!isPattern && !containsEsc &&
             this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
             (prop.key.name === "get" || prop.key.name === "set") &&
             (this.type !== types.comma && this.type !== types.braceR)) {
    if (isGenerator || isAsync) { this.unexpected(); }
    prop.kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get")
        { this.raiseRecoverable(start, "getter should have no params"); }
      else
        { this.raiseRecoverable(start, "setter should have exactly one param"); }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
        { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
    }
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    this.checkUnreserved(prop.key);
    prop.kind = "init";
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else if (this.type === types.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0)
        { refDestructuringErrors.shorthandAssign = this.start; }
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else {
      prop.value = prop.key;
    }
    prop.shorthand = true;
  } else { this.unexpected(); }
};

pp$3.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types.bracketR);
      return prop.key
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types.num || this.type === types.string ? this.parseExprAtom() : this.parseIdent(true)
};

// Initialize empty function node.

pp$3.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = false;
    node.expression = false;
  }
  if (this.options.ecmaVersion >= 8)
    { node.async = false; }
};

// Parse object or class method.

pp$3.parseMethod = function(isGenerator, isAsync) {
  var node = this.startNode(), oldInGen = this.inGenerator, oldInAsync = this.inAsync,
      oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;

  this.initFunction(node);
  if (this.options.ecmaVersion >= 6)
    { node.generator = isGenerator; }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  this.inGenerator = node.generator;
  this.inAsync = node.async;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.inFunction = true;
  this.enterFunctionScope();

  this.expect(types.parenL);
  node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false);

  this.inGenerator = oldInGen;
  this.inAsync = oldInAsync;
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.inFunction = oldInFunc;
  return this.finishNode(node, "FunctionExpression")
};

// Parse arrow function expression with given parameters.

pp$3.parseArrowExpression = function(node, params, isAsync) {
  var oldInGen = this.inGenerator, oldInAsync = this.inAsync,
      oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;

  this.enterFunctionScope();
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  this.inGenerator = false;
  this.inAsync = node.async;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.inFunction = true;

  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true);

  this.inGenerator = oldInGen;
  this.inAsync = oldInAsync;
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.inFunction = oldInFunc;
  return this.finishNode(node, "ArrowFunctionExpression")
};

// Parse function body and check parameters.

pp$3.parseFunctionBody = function(node, isArrowFunction) {
  var isExpression = isArrowFunction && this.type !== types.braceL;
  var oldStrict = this.strict, useStrict = false;

  if (isExpression) {
    node.body = this.parseMaybeAssign();
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      // If this is a strict mode function, verify that argument names
      // are not repeated, and it does not try to bind the words `eval`
      // or `arguments`.
      if (useStrict && nonSimple)
        { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
    }
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) { this.strict = true; }

    // Add the params to varDeclaredNames to ensure that an error is thrown
    // if a let/const declaration in the function clashes with one of the params.
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && this.isSimpleParamList(node.params));
    node.body = this.parseBlock(false);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitFunctionScope();

  if (this.strict && node.id) {
    // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
    this.checkLVal(node.id, "none");
  }
  this.strict = oldStrict;
};

pp$3.isSimpleParamList = function(params) {
  for (var i = 0, list = params; i < list.length; i += 1)
    {
    var param = list[i];

    if (param.type !== "Identifier") { return false
  } }
  return true
};

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp$3.checkParams = function(node, allowDuplicates) {
  var this$1 = this;

  var nameHash = {};
  for (var i = 0, list = node.params; i < list.length; i += 1)
    {
    var param = list[i];

    this$1.checkLVal(param, "var", allowDuplicates ? null : nameHash);
  }
};

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var this$1 = this;

  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this$1.expect(types.comma);
      if (allowTrailingComma && this$1.afterTrailingComma(close)) { break }
    } else { first = false; }

    var elt = (void 0);
    if (allowEmpty && this$1.type === types.comma)
      { elt = null; }
    else if (this$1.type === types.ellipsis) {
      elt = this$1.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this$1.type === types.comma && refDestructuringErrors.trailingComma < 0)
        { refDestructuringErrors.trailingComma = this$1.start; }
    } else {
      elt = this$1.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts
};

pp$3.checkUnreserved = function(ref) {
  var start = ref.start;
  var end = ref.end;
  var name = ref.name;

  if (this.inGenerator && name === "yield")
    { this.raiseRecoverable(start, "Can not use 'yield' as identifier inside a generator"); }
  if (this.inAsync && name === "await")
    { this.raiseRecoverable(start, "Can not use 'await' as identifier inside an async function"); }
  if (this.isKeyword(name))
    { this.raise(start, ("Unexpected keyword '" + name + "'")); }
  if (this.options.ecmaVersion < 6 &&
    this.input.slice(start, end).indexOf("\\") !== -1) { return }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Can not use keyword 'await' outside an async function"); }
    this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
  }
};

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp$3.parseIdent = function(liberal, isBinding) {
  var node = this.startNode();
  if (liberal && this.options.allowReserved === "never") { liberal = false; }
  if (this.type === types.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;

    // To fix https://github.com/acornjs/acorn/issues/575
    // `class` and `function` keywords push new context into this.context.
    // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
    // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
    if ((node.name === "class" || node.name === "function") &&
        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "Identifier");
  if (!liberal) { this.checkUnreserved(node); }
  return node
};

// Parses yield expression inside generator.

pp$3.parseYield = function() {
  if (!this.yieldPos) { this.yieldPos = this.start; }

  var node = this.startNode();
  this.next();
  if (this.type === types.semi || this.canInsertSemicolon() || (this.type !== types.star && !this.type.startsExpr)) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types.star);
    node.argument = this.parseMaybeAssign();
  }
  return this.finishNode(node, "YieldExpression")
};

pp$3.parseAwait = function() {
  if (!this.awaitPos) { this.awaitPos = this.start; }

  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true);
  return this.finishNode(node, "AwaitExpression")
};

var pp$4 = Parser.prototype;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
  throw err
};

pp$4.raiseRecoverable = pp$4.raise;

pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
};

var pp$5 = Parser.prototype;

// Object.assign polyfill
var assign = Object.assign || function(target) {
  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  for (var i = 0, list = sources; i < list.length; i += 1) {
    var source = list[i];

    for (var key in source) {
      if (has(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target
};

// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

pp$5.enterFunctionScope = function() {
  // var: a hash of var-declared names in the current lexical scope
  // lexical: a hash of lexically-declared names in the current lexical scope
  // childVar: a hash of var-declared names in all child lexical scopes of the current lexical scope (within the current function scope)
  // parentLexical: a hash of lexically-declared names in all parent lexical scopes of the current lexical scope (within the current function scope)
  this.scopeStack.push({var: {}, lexical: {}, childVar: {}, parentLexical: {}});
};

pp$5.exitFunctionScope = function() {
  this.scopeStack.pop();
};

pp$5.enterLexicalScope = function() {
  var parentScope = this.scopeStack[this.scopeStack.length - 1];
  var childScope = {var: {}, lexical: {}, childVar: {}, parentLexical: {}};

  this.scopeStack.push(childScope);
  assign(childScope.parentLexical, parentScope.lexical, parentScope.parentLexical);
};

pp$5.exitLexicalScope = function() {
  var childScope = this.scopeStack.pop();
  var parentScope = this.scopeStack[this.scopeStack.length - 1];

  assign(parentScope.childVar, childScope.var, childScope.childVar);
};

/**
 * A name can be declared with `var` if there are no variables with the same name declared with `let`/`const`
 * in the current lexical scope or any of the parent lexical scopes in this function.
 */
pp$5.canDeclareVarName = function(name) {
  var currentScope = this.scopeStack[this.scopeStack.length - 1];

  return !has(currentScope.lexical, name) && !has(currentScope.parentLexical, name)
};

/**
 * A name can be declared with `let`/`const` if there are no variables with the same name declared with `let`/`const`
 * in the current scope, and there are no variables with the same name declared with `var` in the current scope or in
 * any child lexical scopes in this function.
 */
pp$5.canDeclareLexicalName = function(name) {
  var currentScope = this.scopeStack[this.scopeStack.length - 1];

  return !has(currentScope.lexical, name) && !has(currentScope.var, name) && !has(currentScope.childVar, name)
};

pp$5.declareVarName = function(name) {
  this.scopeStack[this.scopeStack.length - 1].var[name] = true;
};

pp$5.declareLexicalName = function(name) {
  this.scopeStack[this.scopeStack.length - 1].lexical[name] = true;
};

var Node = function Node(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations)
    { this.loc = new SourceLocation(parser, loc); }
  if (parser.options.directSourceFile)
    { this.sourceFile = parser.options.directSourceFile; }
  if (parser.options.ranges)
    { this.range = [pos, 0]; }
};

// Start an AST node, attaching a start offset.

var pp$6 = Parser.prototype;

pp$6.startNode = function() {
  return new Node(this, this.start, this.startLoc)
};

pp$6.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
};

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations)
    { node.loc.end = loc; }
  if (this.options.ranges)
    { node.range[1] = pos; }
  return node
}

pp$6.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
};

// Finish node at given position

pp$6.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
};

// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design

var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
};

var types$1 = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};

var pp$7 = Parser.prototype;

pp$7.initialContext = function() {
  return [types$1.b_stat]
};

pp$7.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types$1.f_expr || parent === types$1.f_stat)
    { return true }
  if (prevType === types.colon && (parent === types$1.b_stat || parent === types$1.b_expr))
    { return !parent.isExpr }

  // The check for `tt.name && exprAllowed` detects whether we are
  // after a `yield` or `of` construct. See the `updateContext` for
  // `tt.name`.
  if (prevType === types._return || prevType === types.name && this.exprAllowed)
    { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
  if (prevType === types._else || prevType === types.semi || prevType === types.eof || prevType === types.parenR || prevType === types.arrow)
    { return true }
  if (prevType === types.braceL)
    { return parent === types$1.b_stat }
  if (prevType === types._var || prevType === types.name)
    { return false }
  return !this.exprAllowed
};

pp$7.inGeneratorContext = function() {
  var this$1 = this;

  for (var i = this.context.length - 1; i >= 1; i--) {
    var context = this$1.context[i];
    if (context.token === "function")
      { return context.generator }
  }
  return false
};

pp$7.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType === types.dot)
    { this.exprAllowed = false; }
  else if (update = type.updateContext)
    { update.call(this, prevType); }
  else
    { this.exprAllowed = type.beforeExpr; }
};

// Token-specific context update code

types.parenR.updateContext = types.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true;
    return
  }
  var out = this.context.pop();
  if (out === types$1.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};

types.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types$1.b_stat : types$1.b_expr);
  this.exprAllowed = true;
};

types.dollarBraceL.updateContext = function() {
  this.context.push(types$1.b_tmpl);
  this.exprAllowed = true;
};

types.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types._if || prevType === types._for || prevType === types._with || prevType === types._while;
  this.context.push(statementParens ? types$1.p_stat : types$1.p_expr);
  this.exprAllowed = true;
};

types.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
};

types._function.updateContext = types._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types.semi && prevType !== types._else &&
      !((prevType === types.colon || prevType === types.braceL) && this.curContext() === types$1.b_stat))
    { this.context.push(types$1.f_expr); }
  else
    { this.context.push(types$1.f_stat); }
  this.exprAllowed = false;
};

types.backQuote.updateContext = function() {
  if (this.curContext() === types$1.q_tmpl)
    { this.context.pop(); }
  else
    { this.context.push(types$1.q_tmpl); }
  this.exprAllowed = false;
};

types.star.updateContext = function(prevType) {
  if (prevType === types._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types$1.f_expr)
      { this.context[index] = types$1.f_expr_gen; }
    else
      { this.context[index] = types$1.f_gen; }
  }
  this.exprAllowed = true;
};

types.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6 && prevType !== types.dot) {
    if (this.value === "of" && !this.exprAllowed ||
        this.value === "yield" && this.inGeneratorContext())
      { allowed = true; }
  }
  this.exprAllowed = allowed;
};

var data = {
  "$LONE": [
    "ASCII",
    "ASCII_Hex_Digit",
    "AHex",
    "Alphabetic",
    "Alpha",
    "Any",
    "Assigned",
    "Bidi_Control",
    "Bidi_C",
    "Bidi_Mirrored",
    "Bidi_M",
    "Case_Ignorable",
    "CI",
    "Cased",
    "Changes_When_Casefolded",
    "CWCF",
    "Changes_When_Casemapped",
    "CWCM",
    "Changes_When_Lowercased",
    "CWL",
    "Changes_When_NFKC_Casefolded",
    "CWKCF",
    "Changes_When_Titlecased",
    "CWT",
    "Changes_When_Uppercased",
    "CWU",
    "Dash",
    "Default_Ignorable_Code_Point",
    "DI",
    "Deprecated",
    "Dep",
    "Diacritic",
    "Dia",
    "Emoji",
    "Emoji_Component",
    "Emoji_Modifier",
    "Emoji_Modifier_Base",
    "Emoji_Presentation",
    "Extender",
    "Ext",
    "Grapheme_Base",
    "Gr_Base",
    "Grapheme_Extend",
    "Gr_Ext",
    "Hex_Digit",
    "Hex",
    "IDS_Binary_Operator",
    "IDSB",
    "IDS_Trinary_Operator",
    "IDST",
    "ID_Continue",
    "IDC",
    "ID_Start",
    "IDS",
    "Ideographic",
    "Ideo",
    "Join_Control",
    "Join_C",
    "Logical_Order_Exception",
    "LOE",
    "Lowercase",
    "Lower",
    "Math",
    "Noncharacter_Code_Point",
    "NChar",
    "Pattern_Syntax",
    "Pat_Syn",
    "Pattern_White_Space",
    "Pat_WS",
    "Quotation_Mark",
    "QMark",
    "Radical",
    "Regional_Indicator",
    "RI",
    "Sentence_Terminal",
    "STerm",
    "Soft_Dotted",
    "SD",
    "Terminal_Punctuation",
    "Term",
    "Unified_Ideograph",
    "UIdeo",
    "Uppercase",
    "Upper",
    "Variation_Selector",
    "VS",
    "White_Space",
    "space",
    "XID_Continue",
    "XIDC",
    "XID_Start",
    "XIDS"
  ],
  "General_Category": [
    "Cased_Letter",
    "LC",
    "Close_Punctuation",
    "Pe",
    "Connector_Punctuation",
    "Pc",
    "Control",
    "Cc",
    "cntrl",
    "Currency_Symbol",
    "Sc",
    "Dash_Punctuation",
    "Pd",
    "Decimal_Number",
    "Nd",
    "digit",
    "Enclosing_Mark",
    "Me",
    "Final_Punctuation",
    "Pf",
    "Format",
    "Cf",
    "Initial_Punctuation",
    "Pi",
    "Letter",
    "L",
    "Letter_Number",
    "Nl",
    "Line_Separator",
    "Zl",
    "Lowercase_Letter",
    "Ll",
    "Mark",
    "M",
    "Combining_Mark",
    "Math_Symbol",
    "Sm",
    "Modifier_Letter",
    "Lm",
    "Modifier_Symbol",
    "Sk",
    "Nonspacing_Mark",
    "Mn",
    "Number",
    "N",
    "Open_Punctuation",
    "Ps",
    "Other",
    "C",
    "Other_Letter",
    "Lo",
    "Other_Number",
    "No",
    "Other_Punctuation",
    "Po",
    "Other_Symbol",
    "So",
    "Paragraph_Separator",
    "Zp",
    "Private_Use",
    "Co",
    "Punctuation",
    "P",
    "punct",
    "Separator",
    "Z",
    "Space_Separator",
    "Zs",
    "Spacing_Mark",
    "Mc",
    "Surrogate",
    "Cs",
    "Symbol",
    "S",
    "Titlecase_Letter",
    "Lt",
    "Unassigned",
    "Cn",
    "Uppercase_Letter",
    "Lu"
  ],
  "Script": [
    "Adlam",
    "Adlm",
    "Ahom",
    "Anatolian_Hieroglyphs",
    "Hluw",
    "Arabic",
    "Arab",
    "Armenian",
    "Armn",
    "Avestan",
    "Avst",
    "Balinese",
    "Bali",
    "Bamum",
    "Bamu",
    "Bassa_Vah",
    "Bass",
    "Batak",
    "Batk",
    "Bengali",
    "Beng",
    "Bhaiksuki",
    "Bhks",
    "Bopomofo",
    "Bopo",
    "Brahmi",
    "Brah",
    "Braille",
    "Brai",
    "Buginese",
    "Bugi",
    "Buhid",
    "Buhd",
    "Canadian_Aboriginal",
    "Cans",
    "Carian",
    "Cari",
    "Caucasian_Albanian",
    "Aghb",
    "Chakma",
    "Cakm",
    "Cham",
    "Cherokee",
    "Cher",
    "Common",
    "Zyyy",
    "Coptic",
    "Copt",
    "Qaac",
    "Cuneiform",
    "Xsux",
    "Cypriot",
    "Cprt",
    "Cyrillic",
    "Cyrl",
    "Deseret",
    "Dsrt",
    "Devanagari",
    "Deva",
    "Duployan",
    "Dupl",
    "Egyptian_Hieroglyphs",
    "Egyp",
    "Elbasan",
    "Elba",
    "Ethiopic",
    "Ethi",
    "Georgian",
    "Geor",
    "Glagolitic",
    "Glag",
    "Gothic",
    "Goth",
    "Grantha",
    "Gran",
    "Greek",
    "Grek",
    "Gujarati",
    "Gujr",
    "Gurmukhi",
    "Guru",
    "Han",
    "Hani",
    "Hangul",
    "Hang",
    "Hanunoo",
    "Hano",
    "Hatran",
    "Hatr",
    "Hebrew",
    "Hebr",
    "Hiragana",
    "Hira",
    "Imperial_Aramaic",
    "Armi",
    "Inherited",
    "Zinh",
    "Qaai",
    "Inscriptional_Pahlavi",
    "Phli",
    "Inscriptional_Parthian",
    "Prti",
    "Javanese",
    "Java",
    "Kaithi",
    "Kthi",
    "Kannada",
    "Knda",
    "Katakana",
    "Kana",
    "Kayah_Li",
    "Kali",
    "Kharoshthi",
    "Khar",
    "Khmer",
    "Khmr",
    "Khojki",
    "Khoj",
    "Khudawadi",
    "Sind",
    "Lao",
    "Laoo",
    "Latin",
    "Latn",
    "Lepcha",
    "Lepc",
    "Limbu",
    "Limb",
    "Linear_A",
    "Lina",
    "Linear_B",
    "Linb",
    "Lisu",
    "Lycian",
    "Lyci",
    "Lydian",
    "Lydi",
    "Mahajani",
    "Mahj",
    "Malayalam",
    "Mlym",
    "Mandaic",
    "Mand",
    "Manichaean",
    "Mani",
    "Marchen",
    "Marc",
    "Masaram_Gondi",
    "Gonm",
    "Meetei_Mayek",
    "Mtei",
    "Mende_Kikakui",
    "Mend",
    "Meroitic_Cursive",
    "Merc",
    "Meroitic_Hieroglyphs",
    "Mero",
    "Miao",
    "Plrd",
    "Modi",
    "Mongolian",
    "Mong",
    "Mro",
    "Mroo",
    "Multani",
    "Mult",
    "Myanmar",
    "Mymr",
    "Nabataean",
    "Nbat",
    "New_Tai_Lue",
    "Talu",
    "Newa",
    "Nko",
    "Nkoo",
    "Nushu",
    "Nshu",
    "Ogham",
    "Ogam",
    "Ol_Chiki",
    "Olck",
    "Old_Hungarian",
    "Hung",
    "Old_Italic",
    "Ital",
    "Old_North_Arabian",
    "Narb",
    "Old_Permic",
    "Perm",
    "Old_Persian",
    "Xpeo",
    "Old_South_Arabian",
    "Sarb",
    "Old_Turkic",
    "Orkh",
    "Oriya",
    "Orya",
    "Osage",
    "Osge",
    "Osmanya",
    "Osma",
    "Pahawh_Hmong",
    "Hmng",
    "Palmyrene",
    "Palm",
    "Pau_Cin_Hau",
    "Pauc",
    "Phags_Pa",
    "Phag",
    "Phoenician",
    "Phnx",
    "Psalter_Pahlavi",
    "Phlp",
    "Rejang",
    "Rjng",
    "Runic",
    "Runr",
    "Samaritan",
    "Samr",
    "Saurashtra",
    "Saur",
    "Sharada",
    "Shrd",
    "Shavian",
    "Shaw",
    "Siddham",
    "Sidd",
    "SignWriting",
    "Sgnw",
    "Sinhala",
    "Sinh",
    "Sora_Sompeng",
    "Sora",
    "Soyombo",
    "Soyo",
    "Sundanese",
    "Sund",
    "Syloti_Nagri",
    "Sylo",
    "Syriac",
    "Syrc",
    "Tagalog",
    "Tglg",
    "Tagbanwa",
    "Tagb",
    "Tai_Le",
    "Tale",
    "Tai_Tham",
    "Lana",
    "Tai_Viet",
    "Tavt",
    "Takri",
    "Takr",
    "Tamil",
    "Taml",
    "Tangut",
    "Tang",
    "Telugu",
    "Telu",
    "Thaana",
    "Thaa",
    "Thai",
    "Tibetan",
    "Tibt",
    "Tifinagh",
    "Tfng",
    "Tirhuta",
    "Tirh",
    "Ugaritic",
    "Ugar",
    "Vai",
    "Vaii",
    "Warang_Citi",
    "Wara",
    "Yi",
    "Yiii",
    "Zanabazar_Square",
    "Zanb"
  ]
};
Array.prototype.push.apply(data.$LONE, data.General_Category);
data.gc = data.General_Category;
data.sc = data.Script_Extensions = data.scx = data.Script;

var pp$9 = Parser.prototype;

var RegExpValidationState = function RegExpValidationState(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "");
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = [];
  this.backReferenceNames = [];
};

RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
  var unicode = flags.indexOf("u") !== -1;
  this.start = start | 0;
  this.source = pattern + "";
  this.flags = flags;
  this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
  this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
};

RegExpValidationState.prototype.raise = function raise (message) {
  this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
};

// If u flag is given, this returns the code point at the index (it combines a surrogate pair).
// Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
RegExpValidationState.prototype.at = function at (i) {
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return -1
  }
  var c = s.charCodeAt(i);
  if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
    return c
  }
  var next = s.charCodeAt(i + 1);
  return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
};

RegExpValidationState.prototype.nextIndex = function nextIndex (i) {
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return l
  }
  var c = s.charCodeAt(i), next;
  if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
      (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
    return i + 1
  }
  return i + 2
};

RegExpValidationState.prototype.current = function current () {
  return this.at(this.pos)
};

RegExpValidationState.prototype.lookahead = function lookahead () {
  return this.at(this.nextIndex(this.pos))
};

RegExpValidationState.prototype.advance = function advance () {
  this.pos = this.nextIndex(this.pos);
};

RegExpValidationState.prototype.eat = function eat (ch) {
  if (this.current() === ch) {
    this.advance();
    return true
  }
  return false
};

function codePointToString$1(ch) {
  if (ch <= 0xFFFF) { return String.fromCharCode(ch) }
  ch -= 0x10000;
  return String.fromCharCode((ch >> 10) + 0xD800, (ch & 0x03FF) + 0xDC00)
}

/**
 * Validate the flags part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$9.validateRegExpFlags = function(state) {
  var this$1 = this;

  var validFlags = state.validFlags;
  var flags = state.flags;

  for (var i = 0; i < flags.length; i++) {
    var flag = flags.charAt(i);
    if (validFlags.indexOf(flag) === -1) {
      this$1.raise(state.start, "Invalid regular expression flag");
    }
    if (flags.indexOf(flag, i + 1) > -1) {
      this$1.raise(state.start, "Duplicate regular expression flag");
    }
  }
};

/**
 * Validate the pattern part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$9.validateRegExpPattern = function(state) {
  this.regexp_pattern(state);

  // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
  // parsing contains a |GroupName|, reparse with the goal symbol
  // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
  // exception if _P_ did not conform to the grammar, if any elements of _P_
  // were not matched by the parse, or if any Early Error conditions exist.
  if (!state.switchN && this.options.ecmaVersion >= 9 && state.groupNames.length > 0) {
    state.switchN = true;
    this.regexp_pattern(state);
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
pp$9.regexp_pattern = function(state) {
  state.pos = 0;
  state.lastIntValue = 0;
  state.lastStringValue = "";
  state.lastAssertionIsQuantifiable = false;
  state.numCapturingParens = 0;
  state.maxBackReference = 0;
  state.groupNames.length = 0;
  state.backReferenceNames.length = 0;

  this.regexp_disjunction(state);

  if (state.pos !== state.source.length) {
    // Make the same messages as V8.
    if (state.eat(0x29 /* ) */)) {
      state.raise("Unmatched ')'");
    }
    if (state.eat(0x5D /* [ */) || state.eat(0x7D /* } */)) {
      state.raise("Lone quantifier brackets");
    }
  }
  if (state.maxBackReference > state.numCapturingParens) {
    state.raise("Invalid escape");
  }
  for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
    var name = list[i];

    if (state.groupNames.indexOf(name) === -1) {
      state.raise("Invalid named capture referenced");
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
pp$9.regexp_disjunction = function(state) {
  var this$1 = this;

  this.regexp_alternative(state);
  while (state.eat(0x7C /* | */)) {
    this$1.regexp_alternative(state);
  }

  // Make the same message as V8.
  if (this.regexp_eatQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  if (state.eat(0x7B /* { */)) {
    state.raise("Lone quantifier brackets");
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
pp$9.regexp_alternative = function(state) {
  while (state.pos < state.source.length && this.regexp_eatTerm(state))
    {  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
pp$9.regexp_eatTerm = function(state) {
  if (this.regexp_eatAssertion(state)) {
    // Handle `QuantifiableAssertion Quantifier` alternative.
    // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
    // is a QuantifiableAssertion.
    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
      // Make the same message as V8.
      if (state.switchU) {
        state.raise("Invalid quantifier");
      }
    }
    return true
  }

  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
    this.regexp_eatQuantifier(state);
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
pp$9.regexp_eatAssertion = function(state) {
  var start = state.pos;
  state.lastAssertionIsQuantifiable = false;

  // ^, $
  if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
    return true
  }

  // \b \B
  if (state.eat(0x5C /* \ */)) {
    if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
      return true
    }
    state.pos = start;
  }

  // Lookahead / Lookbehind
  if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
    var lookbehind = false;
    if (this.options.ecmaVersion >= 9) {
      lookbehind = state.eat(0x3C /* < */);
    }
    if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
      this.regexp_disjunction(state);
      if (!state.eat(0x29 /* ) */)) {
        state.raise("Unterminated group");
      }
      state.lastAssertionIsQuantifiable = !lookbehind;
      return true
    }
  }

  state.pos = start;
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
pp$9.regexp_eatQuantifier = function(state, noError) {
  if ( noError === void 0 ) noError = false;

  if (this.regexp_eatQuantifierPrefix(state, noError)) {
    state.eat(0x3F /* ? */);
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
pp$9.regexp_eatQuantifierPrefix = function(state, noError) {
  return (
    state.eat(0x2A /* * */) ||
    state.eat(0x2B /* + */) ||
    state.eat(0x3F /* ? */) ||
    this.regexp_eatBracedQuantifier(state, noError)
  )
};
pp$9.regexp_eatBracedQuantifier = function(state, noError) {
  var start = state.pos;
  if (state.eat(0x7B /* { */)) {
    var min = 0, max = -1;
    if (this.regexp_eatDecimalDigits(state)) {
      min = state.lastIntValue;
      if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
        max = state.lastIntValue;
      }
      if (state.eat(0x7D /* } */)) {
        // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
        if (max !== -1 && max < min && !noError) {
          state.raise("numbers out of order in {} quantifier");
        }
        return true
      }
    }
    if (state.switchU && !noError) {
      state.raise("Incomplete quantifier");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
pp$9.regexp_eatAtom = function(state) {
  return (
    this.regexp_eatPatternCharacters(state) ||
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state)
  )
};
pp$9.regexp_eatReverseSolidusAtomEscape = function(state) {
  var start = state.pos;
  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatAtomEscape(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$9.regexp_eatUncapturingGroup = function(state) {
  var start = state.pos;
  if (state.eat(0x28 /* ( */)) {
    if (state.eat(0x3F /* ? */) && state.eat(0x3A /* : */)) {
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        return true
      }
      state.raise("Unterminated group");
    }
    state.pos = start;
  }
  return false
};
pp$9.regexp_eatCapturingGroup = function(state) {
  if (state.eat(0x28 /* ( */)) {
    if (this.options.ecmaVersion >= 9) {
      this.regexp_groupSpecifier(state);
    } else if (state.current() === 0x3F /* ? */) {
      state.raise("Invalid group");
    }
    this.regexp_disjunction(state);
    if (state.eat(0x29 /* ) */)) {
      state.numCapturingParens += 1;
      return true
    }
    state.raise("Unterminated group");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
pp$9.regexp_eatExtendedAtom = function(state) {
  return (
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state) ||
    this.regexp_eatInvalidBracedQuantifier(state) ||
    this.regexp_eatExtendedPatternCharacter(state)
  )
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
pp$9.regexp_eatInvalidBracedQuantifier = function(state) {
  if (this.regexp_eatBracedQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
pp$9.regexp_eatSyntaxCharacter = function(state) {
  var ch = state.current();
  if (isSyntaxCharacter(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }
  return false
};
function isSyntaxCharacter(ch) {
  return (
    ch === 0x24 /* $ */ ||
    ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
    ch === 0x2E /* . */ ||
    ch === 0x3F /* ? */ ||
    ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
    ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
// But eat eager.
pp$9.regexp_eatPatternCharacters = function(state) {
  var start = state.pos;
  var ch = 0;
  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
    state.advance();
  }
  return state.pos !== start
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
pp$9.regexp_eatExtendedPatternCharacter = function(state) {
  var ch = state.current();
  if (
    ch !== -1 &&
    ch !== 0x24 /* $ */ &&
    !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
    ch !== 0x2E /* . */ &&
    ch !== 0x3F /* ? */ &&
    ch !== 0x5B /* [ */ &&
    ch !== 0x5E /* ^ */ &&
    ch !== 0x7C /* | */
  ) {
    state.advance();
    return true
  }
  return false
};

// GroupSpecifier[U] ::
//   [empty]
//   `?` GroupName[?U]
pp$9.regexp_groupSpecifier = function(state) {
  if (state.eat(0x3F /* ? */)) {
    if (this.regexp_eatGroupName(state)) {
      if (state.groupNames.indexOf(state.lastStringValue) !== -1) {
        state.raise("Duplicate capture group name");
      }
      state.groupNames.push(state.lastStringValue);
      return
    }
    state.raise("Invalid group");
  }
};

// GroupName[U] ::
//   `<` RegExpIdentifierName[?U] `>`
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$9.regexp_eatGroupName = function(state) {
  state.lastStringValue = "";
  if (state.eat(0x3C /* < */)) {
    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
      return true
    }
    state.raise("Invalid capture group name");
  }
  return false
};

// RegExpIdentifierName[U] ::
//   RegExpIdentifierStart[?U]
//   RegExpIdentifierName[?U] RegExpIdentifierPart[?U]
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$9.regexp_eatRegExpIdentifierName = function(state) {
  state.lastStringValue = "";
  if (this.regexp_eatRegExpIdentifierStart(state)) {
    state.lastStringValue += codePointToString$1(state.lastIntValue);
    while (this.regexp_eatRegExpIdentifierPart(state)) {
      state.lastStringValue += codePointToString$1(state.lastIntValue);
    }
    return true
  }
  return false
};

// RegExpIdentifierStart[U] ::
//   UnicodeIDStart
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[?U]
pp$9.regexp_eatRegExpIdentifierStart = function(state) {
  var start = state.pos;
  var ch = state.current();
  state.advance();

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierStart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
}

// RegExpIdentifierPart[U] ::
//   UnicodeIDContinue
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[?U]
//   <ZWNJ>
//   <ZWJ>
pp$9.regexp_eatRegExpIdentifierPart = function(state) {
  var start = state.pos;
  var ch = state.current();
  state.advance();

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierPart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
pp$9.regexp_eatAtomEscape = function(state) {
  if (
    this.regexp_eatBackReference(state) ||
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state) ||
    (state.switchN && this.regexp_eatKGroupName(state))
  ) {
    return true
  }
  if (state.switchU) {
    // Make the same message as V8.
    if (state.current() === 0x63 /* c */) {
      state.raise("Invalid unicode escape");
    }
    state.raise("Invalid escape");
  }
  return false
};
pp$9.regexp_eatBackReference = function(state) {
  var start = state.pos;
  if (this.regexp_eatDecimalEscape(state)) {
    var n = state.lastIntValue;
    if (state.switchU) {
      // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
      if (n > state.maxBackReference) {
        state.maxBackReference = n;
      }
      return true
    }
    if (n <= state.numCapturingParens) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$9.regexp_eatKGroupName = function(state) {
  if (state.eat(0x6B /* k */)) {
    if (this.regexp_eatGroupName(state)) {
      state.backReferenceNames.push(state.lastStringValue);
      return true
    }
    state.raise("Invalid named reference");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
pp$9.regexp_eatCharacterEscape = function(state) {
  return (
    this.regexp_eatControlEscape(state) ||
    this.regexp_eatCControlLetter(state) ||
    this.regexp_eatZero(state) ||
    this.regexp_eatHexEscapeSequence(state) ||
    this.regexp_eatRegExpUnicodeEscapeSequence(state) ||
    (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
    this.regexp_eatIdentityEscape(state)
  )
};
pp$9.regexp_eatCControlLetter = function(state) {
  var start = state.pos;
  if (state.eat(0x63 /* c */)) {
    if (this.regexp_eatControlLetter(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$9.regexp_eatZero = function(state) {
  if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
    state.lastIntValue = 0;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
pp$9.regexp_eatControlEscape = function(state) {
  var ch = state.current();
  if (ch === 0x74 /* t */) {
    state.lastIntValue = 0x09; /* \t */
    state.advance();
    return true
  }
  if (ch === 0x6E /* n */) {
    state.lastIntValue = 0x0A; /* \n */
    state.advance();
    return true
  }
  if (ch === 0x76 /* v */) {
    state.lastIntValue = 0x0B; /* \v */
    state.advance();
    return true
  }
  if (ch === 0x66 /* f */) {
    state.lastIntValue = 0x0C; /* \f */
    state.advance();
    return true
  }
  if (ch === 0x72 /* r */) {
    state.lastIntValue = 0x0D; /* \r */
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
pp$9.regexp_eatControlLetter = function(state) {
  var ch = state.current();
  if (isControlLetter(ch)) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};
function isControlLetter(ch) {
  return (
    (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
    (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
pp$9.regexp_eatRegExpUnicodeEscapeSequence = function(state) {
  var start = state.pos;

  if (state.eat(0x75 /* u */)) {
    if (this.regexp_eatFixedHexDigits(state, 4)) {
      var lead = state.lastIntValue;
      if (state.switchU && lead >= 0xD800 && lead <= 0xDBFF) {
        var leadSurrogateEnd = state.pos;
        if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
          var trail = state.lastIntValue;
          if (trail >= 0xDC00 && trail <= 0xDFFF) {
            state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
            return true
          }
        }
        state.pos = leadSurrogateEnd;
        state.lastIntValue = lead;
      }
      return true
    }
    if (
      state.switchU &&
      state.eat(0x7B /* { */) &&
      this.regexp_eatHexDigits(state) &&
      state.eat(0x7D /* } */) &&
      isValidUnicode(state.lastIntValue)
    ) {
      return true
    }
    if (state.switchU) {
      state.raise("Invalid unicode escape");
    }
    state.pos = start;
  }

  return false
};
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 0x10FFFF
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
pp$9.regexp_eatIdentityEscape = function(state) {
  if (state.switchU) {
    if (this.regexp_eatSyntaxCharacter(state)) {
      return true
    }
    if (state.eat(0x2F /* / */)) {
      state.lastIntValue = 0x2F; /* / */
      return true
    }
    return false
  }

  var ch = state.current();
  if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
pp$9.regexp_eatDecimalEscape = function(state) {
  state.lastIntValue = 0;
  var ch = state.current();
  if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
    do {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
pp$9.regexp_eatCharacterClassEscape = function(state) {
  var ch = state.current();

  if (isCharacterClassEscape(ch)) {
    state.lastIntValue = -1;
    state.advance();
    return true
  }

  if (
    state.switchU &&
    this.options.ecmaVersion >= 9 &&
    (ch === 0x50 /* P */ || ch === 0x70 /* p */)
  ) {
    state.lastIntValue = -1;
    state.advance();
    if (
      state.eat(0x7B /* { */) &&
      this.regexp_eatUnicodePropertyValueExpression(state) &&
      state.eat(0x7D /* } */)
    ) {
      return true
    }
    state.raise("Invalid property name");
  }

  return false
};
function isCharacterClassEscape(ch) {
  return (
    ch === 0x64 /* d */ ||
    ch === 0x44 /* D */ ||
    ch === 0x73 /* s */ ||
    ch === 0x53 /* S */ ||
    ch === 0x77 /* w */ ||
    ch === 0x57 /* W */
  )
}

// UnicodePropertyValueExpression ::
//   UnicodePropertyName `=` UnicodePropertyValue
//   LoneUnicodePropertyNameOrValue
pp$9.regexp_eatUnicodePropertyValueExpression = function(state) {
  var start = state.pos;

  // UnicodePropertyName `=` UnicodePropertyValue
  if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
    var name = state.lastStringValue;
    if (this.regexp_eatUnicodePropertyValue(state)) {
      var value = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
      return true
    }
  }
  state.pos = start;

  // LoneUnicodePropertyNameOrValue
  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
    var nameOrValue = state.lastStringValue;
    this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
    return true
  }
  return false
};
pp$9.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  if (!data.hasOwnProperty(name) || data[name].indexOf(value) === -1) {
    state.raise("Invalid property name");
  }
};
pp$9.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  if (data.$LONE.indexOf(nameOrValue) === -1) {
    state.raise("Invalid property name");
  }
};

// UnicodePropertyName ::
//   UnicodePropertyNameCharacters
pp$9.regexp_eatUnicodePropertyName = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyNameCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString$1(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};
function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 0x5F /* _ */
}

// UnicodePropertyValue ::
//   UnicodePropertyValueCharacters
pp$9.regexp_eatUnicodePropertyValue = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyValueCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString$1(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
}

// LoneUnicodePropertyNameOrValue ::
//   UnicodePropertyValueCharacters
pp$9.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  return this.regexp_eatUnicodePropertyValue(state)
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
pp$9.regexp_eatCharacterClass = function(state) {
  if (state.eat(0x5B /* [ */)) {
    state.eat(0x5E /* ^ */);
    this.regexp_classRanges(state);
    if (state.eat(0x5D /* [ */)) {
      return true
    }
    // Unreachable since it threw "unterminated regular expression" error before.
    state.raise("Unterminated character class");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
pp$9.regexp_classRanges = function(state) {
  var this$1 = this;

  while (this.regexp_eatClassAtom(state)) {
    var left = state.lastIntValue;
    if (state.eat(0x2D /* - */) && this$1.regexp_eatClassAtom(state)) {
      var right = state.lastIntValue;
      if (state.switchU && (left === -1 || right === -1)) {
        state.raise("Invalid character class");
      }
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
pp$9.regexp_eatClassAtom = function(state) {
  var start = state.pos;

  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatClassEscape(state)) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      var ch$1 = state.current();
      if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
        state.raise("Invalid class escape");
      }
      state.raise("Invalid escape");
    }
    state.pos = start;
  }

  var ch = state.current();
  if (ch !== 0x5D /* [ */) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
pp$9.regexp_eatClassEscape = function(state) {
  var start = state.pos;

  if (state.eat(0x62 /* b */)) {
    state.lastIntValue = 0x08; /* <BS> */
    return true
  }

  if (state.switchU && state.eat(0x2D /* - */)) {
    state.lastIntValue = 0x2D; /* - */
    return true
  }

  if (!state.switchU && state.eat(0x63 /* c */)) {
    if (this.regexp_eatClassControlLetter(state)) {
      return true
    }
    state.pos = start;
  }

  return (
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state)
  )
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
pp$9.regexp_eatClassControlLetter = function(state) {
  var ch = state.current();
  if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$9.regexp_eatHexEscapeSequence = function(state) {
  var start = state.pos;
  if (state.eat(0x78 /* x */)) {
    if (this.regexp_eatFixedHexDigits(state, 2)) {
      return true
    }
    if (state.switchU) {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
pp$9.regexp_eatDecimalDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isDecimalDigit(ch = state.current())) {
    state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
    state.advance();
  }
  return state.pos !== start
};
function isDecimalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
pp$9.regexp_eatHexDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isHexDigit(ch = state.current())) {
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return state.pos !== start
};
function isHexDigit(ch) {
  return (
    (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
    (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
    (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
  )
}
function hexToInt(ch) {
  if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
    return 10 + (ch - 0x41 /* A */)
  }
  if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
    return 10 + (ch - 0x61 /* a */)
  }
  return ch - 0x30 /* 0 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
// Allows only 0-377(octal) i.e. 0-255(decimal).
pp$9.regexp_eatLegacyOctalEscapeSequence = function(state) {
  if (this.regexp_eatOctalDigit(state)) {
    var n1 = state.lastIntValue;
    if (this.regexp_eatOctalDigit(state)) {
      var n2 = state.lastIntValue;
      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
      } else {
        state.lastIntValue = n1 * 8 + n2;
      }
    } else {
      state.lastIntValue = n1;
    }
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
pp$9.regexp_eatOctalDigit = function(state) {
  var ch = state.current();
  if (isOctalDigit(ch)) {
    state.lastIntValue = ch - 0x30; /* 0 */
    state.advance();
    return true
  }
  state.lastIntValue = 0;
  return false
};
function isOctalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
// And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$9.regexp_eatFixedHexDigits = function(state, length) {
  var start = state.pos;
  state.lastIntValue = 0;
  for (var i = 0; i < length; ++i) {
    var ch = state.current();
    if (!isHexDigit(ch)) {
      state.pos = start;
      return false
    }
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return true
};

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations)
    { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
  if (p.options.ranges)
    { this.range = [p.start, p.end]; }
};

// ## Tokenizer

var pp$8 = Parser.prototype;

// Move to the next token

pp$8.next = function() {
  if (this.options.onToken)
    { this.options.onToken(new Token(this)); }

  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

pp$8.getToken = function() {
  this.next();
  return new Token(this)
};

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined")
  { pp$8[Symbol.iterator] = function() {
    var this$1 = this;

    return {
      next: function () {
        var token = this$1.getToken();
        return {
          done: token.type === types.eof,
          value: token
        }
      }
    }
  }; }

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

pp$8.curContext = function() {
  return this.context[this.context.length - 1]
};

// Read a single token, updating the parser object's token-related
// properties.

pp$8.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

  this.start = this.pos;
  if (this.options.locations) { this.startLoc = this.curPosition(); }
  if (this.pos >= this.input.length) { return this.finishToken(types.eof) }

  if (curContext.override) { return curContext.override(this) }
  else { this.readToken(this.fullCharCodeAtPos()); }
};

pp$8.readToken = function(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
    { return this.readWord() }

  return this.getTokenFromCode(code)
};

pp$8.fullCharCodeAtPos = function() {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 0xd7ff || code >= 0xe000) { return code }
  var next = this.input.charCodeAt(this.pos + 1);
  return (code << 10) + next - 0x35fdc00
};

pp$8.skipBlockComment = function() {
  var this$1 = this;

  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
  this.pos = end + 2;
  if (this.options.locations) {
    lineBreakG.lastIndex = start;
    var match;
    while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
      ++this$1.curLine;
      this$1.lineStart = match.index + match[0].length;
    }
  }
  if (this.options.onComment)
    { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                           startLoc, this.curPosition()); }
};

pp$8.skipLineComment = function(startSkip) {
  var this$1 = this;

  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this$1.input.charCodeAt(++this$1.pos);
  }
  if (this.options.onComment)
    { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                           startLoc, this.curPosition()); }
};

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp$8.skipSpace = function() {
  var this$1 = this;

  loop: while (this.pos < this.input.length) {
    var ch = this$1.input.charCodeAt(this$1.pos);
    switch (ch) {
    case 32: case 160: // ' '
      ++this$1.pos;
      break
    case 13:
      if (this$1.input.charCodeAt(this$1.pos + 1) === 10) {
        ++this$1.pos;
      }
    case 10: case 8232: case 8233:
      ++this$1.pos;
      if (this$1.options.locations) {
        ++this$1.curLine;
        this$1.lineStart = this$1.pos;
      }
      break
    case 47: // '/'
      switch (this$1.input.charCodeAt(this$1.pos + 1)) {
      case 42: // '*'
        this$1.skipBlockComment();
        break
      case 47:
        this$1.skipLineComment(2);
        break
      default:
        break loop
      }
      break
    default:
      if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++this$1.pos;
      } else {
        break loop
      }
    }
  }
};

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp$8.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) { this.endLoc = this.curPosition(); }
  var prevType = this.type;
  this.type = type;
  this.value = val;

  this.updateContext(prevType);
};

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp$8.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) { return this.readNumber(true) }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(types.ellipsis)
  } else {
    ++this.pos;
    return this.finishToken(types.dot)
  }
};

pp$8.readToken_slash = function() { // '/'
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(types.slash, 1)
};

pp$8.readToken_mult_modulo_exp = function(code) { // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types.star : types.modulo;

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size;
    tokentype = types.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }

  if (next === 61) { return this.finishOp(types.assign, size + 1) }
  return this.finishOp(tokentype, size)
};

pp$8.readToken_pipe_amp = function(code) { // '|&'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) { return this.finishOp(code === 124 ? types.logicalOR : types.logicalAND, 2) }
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(code === 124 ? types.bitwiseOR : types.bitwiseAND, 1)
};

pp$8.readToken_caret = function() { // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(types.bitwiseXOR, 1)
};

pp$8.readToken_plus_min = function(code) { // '+-'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
        (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken()
    }
    return this.finishOp(types.incDec, 2)
  }
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(types.plusMin, 1)
};

pp$8.readToken_lt_gt = function(code) { // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types.assign, size + 1) }
    return this.finishOp(types.bitShift, size)
  }
  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
      this.input.charCodeAt(this.pos + 3) === 45) {
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken()
  }
  if (next === 61) { size = 2; }
  return this.finishOp(types.relational, size)
};

pp$8.readToken_eq_excl = function(code) { // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
    this.pos += 2;
    return this.finishToken(types.arrow)
  }
  return this.finishOp(code === 61 ? types.eq : types.prefix, 1)
};

pp$8.getTokenFromCode = function(code) {
  switch (code) {
  // The interpretation of a dot depends on whether it is followed
  // by a digit or another two dots.
  case 46: // '.'
    return this.readToken_dot()

  // Punctuation tokens.
  case 40: ++this.pos; return this.finishToken(types.parenL)
  case 41: ++this.pos; return this.finishToken(types.parenR)
  case 59: ++this.pos; return this.finishToken(types.semi)
  case 44: ++this.pos; return this.finishToken(types.comma)
  case 91: ++this.pos; return this.finishToken(types.bracketL)
  case 93: ++this.pos; return this.finishToken(types.bracketR)
  case 123: ++this.pos; return this.finishToken(types.braceL)
  case 125: ++this.pos; return this.finishToken(types.braceR)
  case 58: ++this.pos; return this.finishToken(types.colon)
  case 63: ++this.pos; return this.finishToken(types.question)

  case 96: // '`'
    if (this.options.ecmaVersion < 6) { break }
    ++this.pos;
    return this.finishToken(types.backQuote)

  case 48: // '0'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
    if (this.options.ecmaVersion >= 6) {
      if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
      if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
    }

  // Anything else beginning with a digit is an integer, octal
  // number, or float.
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return this.readNumber(false)

  // Quotes produce strings.
  case 34: case 39: // '"', "'"
    return this.readString(code)

  // Operators are parsed inline in tiny state machines. '=' (61) is
  // often referred to. `finishOp` simply skips the amount of
  // characters it is given as second argument, and returns a token
  // of the type given by its first argument.

  case 47: // '/'
    return this.readToken_slash()

  case 37: case 42: // '%*'
    return this.readToken_mult_modulo_exp(code)

  case 124: case 38: // '|&'
    return this.readToken_pipe_amp(code)

  case 94: // '^'
    return this.readToken_caret()

  case 43: case 45: // '+-'
    return this.readToken_plus_min(code)

  case 60: case 62: // '<>'
    return this.readToken_lt_gt(code)

  case 61: case 33: // '=!'
    return this.readToken_eq_excl(code)

  case 126: // '~'
    return this.finishOp(types.prefix, 1)
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp$8.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str)
};

pp$8.readRegexp = function() {
  var this$1 = this;

  var escaped, inClass, start = this.pos;
  for (;;) {
    if (this$1.pos >= this$1.input.length) { this$1.raise(start, "Unterminated regular expression"); }
    var ch = this$1.input.charAt(this$1.pos);
    if (lineBreak.test(ch)) { this$1.raise(start, "Unterminated regular expression"); }
    if (!escaped) {
      if (ch === "[") { inClass = true; }
      else if (ch === "]" && inClass) { inClass = false; }
      else if (ch === "/" && !inClass) { break }
      escaped = ch === "\\";
    } else { escaped = false; }
    ++this$1.pos;
  }
  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) { this.unexpected(flagsStart); }

  // Validate pattern
  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state);

  // Create Literal#value property value.
  var value = null;
  try {
    value = new RegExp(pattern, flags);
  } catch (e) {
    // ESTree requires null if it failed to instantiate RegExp object.
    // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
  }

  return this.finishToken(types.regexp, {pattern: pattern, flags: flags, value: value})
};

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp$8.readInt = function(radix, len) {
  var this$1 = this;

  var start = this.pos, total = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    var code = this$1.input.charCodeAt(this$1.pos), val = (void 0);
    if (code >= 97) { val = code - 97 + 10; } // a
    else if (code >= 65) { val = code - 65 + 10; } // A
    else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
    else { val = Infinity; }
    if (val >= radix) { break }
    ++this$1.pos;
    total = total * radix + val;
  }
  if (this.pos === start || len != null && this.pos - start !== len) { return null }

  return total
};

pp$8.readRadixNumber = function(radix) {
  this.pos += 2; // 0x
  var val = this.readInt(radix);
  if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
  return this.finishToken(types.num, val)
};

// Read an integer, octal integer, or floating-point number.

pp$8.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) { this.raise(start, "Invalid number"); }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
  var next = this.input.charCodeAt(this.pos);
  if (next === 46 && !octal) { // '.'
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) { // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) { ++this.pos; } // '+-'
    if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

  var str = this.input.slice(start, this.pos);
  var val = octal ? parseInt(str, 8) : parseFloat(str);
  return this.finishToken(types.num, val)
};

// Read a string value, interpreting backslash-escapes.

pp$8.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;

  if (ch === 123) { // '{'
    if (this.options.ecmaVersion < 6) { this.unexpected(); }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
  } else {
    code = this.readHexChar(4);
  }
  return code
};

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) { return String.fromCharCode(code) }
  code -= 0x10000;
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
}

pp$8.readString = function(quote) {
  var this$1 = this;

  var out = "", chunkStart = ++this.pos;
  for (;;) {
    if (this$1.pos >= this$1.input.length) { this$1.raise(this$1.start, "Unterminated string constant"); }
    var ch = this$1.input.charCodeAt(this$1.pos);
    if (ch === quote) { break }
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos);
      out += this$1.readEscapedChar(false);
      chunkStart = this$1.pos;
    } else {
      if (isNewLine(ch, this$1.options.ecmaVersion >= 10)) { this$1.raise(this$1.start, "Unterminated string constant"); }
      ++this$1.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types.string, out)
};

// Reads template string tokens.

var INVALID_TEMPLATE_ESCAPE_ERROR = {};

pp$8.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err
    }
  }

  this.inTemplateElement = false;
};

pp$8.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR
  } else {
    this.raise(position, message);
  }
};

pp$8.readTmplToken = function() {
  var this$1 = this;

  var out = "", chunkStart = this.pos;
  for (;;) {
    if (this$1.pos >= this$1.input.length) { this$1.raise(this$1.start, "Unterminated template"); }
    var ch = this$1.input.charCodeAt(this$1.pos);
    if (ch === 96 || ch === 36 && this$1.input.charCodeAt(this$1.pos + 1) === 123) { // '`', '${'
      if (this$1.pos === this$1.start && (this$1.type === types.template || this$1.type === types.invalidTemplate)) {
        if (ch === 36) {
          this$1.pos += 2;
          return this$1.finishToken(types.dollarBraceL)
        } else {
          ++this$1.pos;
          return this$1.finishToken(types.backQuote)
        }
      }
      out += this$1.input.slice(chunkStart, this$1.pos);
      return this$1.finishToken(types.template, out)
    }
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos);
      out += this$1.readEscapedChar(true);
      chunkStart = this$1.pos;
    } else if (isNewLine(ch)) {
      out += this$1.input.slice(chunkStart, this$1.pos);
      ++this$1.pos;
      switch (ch) {
      case 13:
        if (this$1.input.charCodeAt(this$1.pos) === 10) { ++this$1.pos; }
      case 10:
        out += "\n";
        break
      default:
        out += String.fromCharCode(ch);
        break
      }
      if (this$1.options.locations) {
        ++this$1.curLine;
        this$1.lineStart = this$1.pos;
      }
      chunkStart = this$1.pos;
    } else {
      ++this$1.pos;
    }
  }
};

// Reads a template token to search for the end, without validating any escape sequences
pp$8.readInvalidTemplateToken = function() {
  var this$1 = this;

  for (; this.pos < this.input.length; this.pos++) {
    switch (this$1.input[this$1.pos]) {
    case "\\":
      ++this$1.pos;
      break

    case "$":
      if (this$1.input[this$1.pos + 1] !== "{") {
        break
      }
    // falls through

    case "`":
      return this$1.finishToken(types.invalidTemplate, this$1.input.slice(this$1.start, this$1.pos))

    // no default
    }
  }
  this.raise(this.start, "Unterminated template");
};

// Used to read escaped characters

pp$8.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
  case 110: return "\n" // 'n' -> '\n'
  case 114: return "\r" // 'r' -> '\r'
  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  case 117: return codePointToString(this.readCodePoint()) // 'u'
  case 116: return "\t" // 't' -> '\t'
  case 98: return "\b" // 'b' -> '\b'
  case 118: return "\u000b" // 'v' -> '\u000b'
  case 102: return "\f" // 'f' -> '\f'
  case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
  case 10: // ' \n'
    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
    return ""
  default:
    if (ch >= 48 && ch <= 55) {
      var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
      var octal = parseInt(octalStr, 8);
      if (octal > 255) {
        octalStr = octalStr.slice(0, -1);
        octal = parseInt(octalStr, 8);
      }
      this.pos += octalStr.length - 1;
      ch = this.input.charCodeAt(this.pos);
      if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
        this.invalidStringToken(
          this.pos - 1 - octalStr.length,
          inTemplate
            ? "Octal literal in template string"
            : "Octal literal in strict mode"
        );
      }
      return String.fromCharCode(octal)
    }
    return String.fromCharCode(ch)
  }
};

// Used to read character escape sequences ('\x', '\u', '\U').

pp$8.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
  return n
};

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp$8.readWord1 = function() {
  var this$1 = this;

  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this$1.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this$1.pos += ch <= 0xffff ? 1 : 2;
    } else if (ch === 92) { // "\"
      this$1.containsEsc = true;
      word += this$1.input.slice(chunkStart, this$1.pos);
      var escStart = this$1.pos;
      if (this$1.input.charCodeAt(++this$1.pos) !== 117) // "u"
        { this$1.invalidStringToken(this$1.pos, "Expecting Unicode escape sequence \\uXXXX"); }
      ++this$1.pos;
      var esc = this$1.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
        { this$1.invalidStringToken(escStart, "Invalid Unicode escape"); }
      word += codePointToString(esc);
      chunkStart = this$1.pos;
    } else {
      break
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos)
};

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp$8.readWord = function() {
  var word = this.readWord1();
  var type = types.name;
  if (this.keywords.test(word)) {
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword " + word); }
    type = keywords$1[word];
  }
  return this.finishToken(type, word)
};

// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/acornjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/acornjs/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

var version = "5.7.3";

// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

function parse(input, options) {
  return new Parser(options, input).parse()
}

// This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.

function parseExpressionAt(input, pos, options) {
  var p = new Parser(options, input, pos);
  p.nextToken();
  return p.parseExpression()
}

// Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenizer` export provides an interface to the tokenizer.

function tokenizer(input, options) {
  return new Parser(options, input)
}

// This is a terrible kludge to support the existing, pre-ES6
// interface where the loose parser module retroactively adds exports
// to this module.
 // eslint-disable-line camelcase
function addLooseExports(parse, Parser$$1, plugins$$1) {
  exports.parse_dammit = parse; // eslint-disable-line camelcase
  exports.LooseParser = Parser$$1;
  exports.pluginsLoose = plugins$$1;
}

exports.version = version;
exports.parse = parse;
exports.parseExpressionAt = parseExpressionAt;
exports.tokenizer = tokenizer;
exports.addLooseExports = addLooseExports;
exports.Parser = Parser;
exports.plugins = plugins;
exports.defaultOptions = defaultOptions;
exports.Position = Position;
exports.SourceLocation = SourceLocation;
exports.getLineInfo = getLineInfo;
exports.Node = Node;
exports.TokenType = TokenType;
exports.tokTypes = types;
exports.keywordTypes = keywords$1;
exports.TokContext = TokContext;
exports.tokContexts = types$1;
exports.isIdentifierChar = isIdentifierChar;
exports.isIdentifierStart = isIdentifierStart;
exports.Token = Token;
exports.isNewLine = isNewLine;
exports.lineBreak = lineBreak;
exports.lineBreakG = lineBreakG;
exports.nonASCIIwhitespace = nonASCIIwhitespace;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],"fs":[function(require,module,exports){

},{}],"gpu.js":[function(require,module,exports){
'use strict';

var GPU = require('./core/gpu');
var alias = require('./core/alias');
var utils = require('./core/utils');
var Input = require('./core/input');
var Texture = require('./core/texture');

var CPUFunctionBuilder = require('./backend/cpu/function-builder');
var CPUFunctionNode = require('./backend/cpu/function-node');
var CPUKernel = require('./backend/cpu/kernel');
var CPURunner = require('./backend/cpu/runner');

var WebGLFunctionBuilder = require('./backend/web-gl/function-builder');
var WebGLFunctionNode = require('./backend/web-gl/function-node');
var WebGLKernel = require('./backend/web-gl/kernel');
var WebGLRunner = require('./backend/web-gl/runner');

var WebGL2FunctionBuilder = require('./backend/web-gl2/function-builder');
var WebGL2FunctionNode = require('./backend/web-gl2/function-node');
var WebGL2Kernel = require('./backend/web-gl2/kernel');
var WebGL2Runner = require('./backend/web-gl2/runner');

GPU.alias = alias;
GPU.utils = utils;
GPU.Texture = Texture;
GPU.Input = Input;
GPU.input = function (value, size) {
	return new Input(value, size);
};

GPU.CPUFunctionBuilder = CPUFunctionBuilder;
GPU.CPUFunctionNode = CPUFunctionNode;
GPU.CPUKernel = CPUKernel;
GPU.CPURunner = CPURunner;

GPU.WebGLFunctionBuilder = WebGLFunctionBuilder;
GPU.WebGLFunctionNode = WebGLFunctionNode;
GPU.WebGLKernel = WebGLKernel;
GPU.WebGLRunner = WebGLRunner;

GPU.WebGL2FunctionBuilder = WebGL2FunctionBuilder;
GPU.WebGL2FunctionNode = WebGL2FunctionNode;
GPU.WebGL2Kernel = WebGL2Kernel;
GPU.WebGL2Runner = WebGL2Runner;

if (typeof module !== 'undefined') {
	module.exports = GPU;
}
if (typeof window !== 'undefined') {
	window.GPU = GPU;
}
if (typeof self !== 'undefined') {
	self.GPU = GPU;
}
},{"./backend/cpu/function-builder":1,"./backend/cpu/function-node":2,"./backend/cpu/kernel":4,"./backend/cpu/runner":5,"./backend/web-gl/function-builder":11,"./backend/web-gl/function-node":12,"./backend/web-gl/kernel":14,"./backend/web-gl/runner":15,"./backend/web-gl2/function-builder":19,"./backend/web-gl2/function-node":20,"./backend/web-gl2/kernel":21,"./backend/web-gl2/runner":22,"./core/alias":26,"./core/gpu":28,"./core/input":29,"./core/texture":30,"./core/utils":32}]},{},[]);
