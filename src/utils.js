var utils = (function(exports){

/**
     * Recursively gets the shape (length of every dimension) of the Tensor.
     * @param {object} data - Iterable containing the data to be stored in the Tensor.
     * @param {object} shape - Length of every dimension of the Tensor.
     * @returns {object} Length of every dimension of the Tensor.
     */
    function getShape(data, shape = []) {
        // Base case:
        if (typeof data === 'number') {
            // Return [1] for integers:
            if (JSON.stringify(shape) === '[]') {
                return [1];
            }
            // Return shape for objects:
            return shape;
        };
        if (typeof data[0] === 'number') {
            for (element of data) {
                if (typeof element != 'number') {
                    throw new Error('The requested array has an inhomogeneous shape.');
                };
            };
            // Return shape for objects:
            shape.push(data.length)
            return shape;
        };

        elementLength = data[0].length;
        // Iterate over elements in dimention to check if all have the same length (homogenous shape):
        for (element of data) {
            // Throw error if the shape is inhomogenous:
            if (elementLength != element.length) {
                throw new Error('The requested array has an inhomogeneous shape.');
            }
            elementLength = element.length;
            // Throw error if the element is not a number or another iterable:
            if (typeof element != 'object' && typeof element != 'number') {
                throw new Error('TypeError: the input data is not a number.');
            }
        };
        shape.push(data.length)
        return getShape(data[0], shape)
    };

    /**
     * Assures that the returned iterable is a vanilla JavaScript Array object:
     * @param {object} a - Any iterable.
     * @returns {object} Original iterable in an Array format.
     */
    function assureArray(a) {
        if (Array.isArray(a)) {
            return a;
        } else if (typeof a === 'number') {
            return [a,]
        } else if (a === null) {
            return a;
        }
        return a._data;
    };

    /**
     * Assures that the returned iterable is of a vanilla JavaScript data type (num of Array object):
     * @param {object} a - Any.
     * @returns {object} Original data in a vanilla format.
     */
    function getData(a) {
        if (Array.isArray(a)) {
            return a;
        };
        if (typeof a === 'number') {
            return a;
        };
        return a._data;
    };

    // Initialize exports if it is empty:
    exports = exports || {};

    // Add all functions to exports:
    exports.getData = getData;
    exports.assureArray = assureArray;
    exports.getShape = getShape;

    return exports;

})(typeof module != 'undefined' && module.exports);

// if (typeof window === 'undefined'){
//     module.exports = { getShape, assureArray, getData };
// };