import { getShape } from '../src/utils';

describe('getShape with different data inputs', () => {
    test('Given data is scalar should return an array of single number',() =>{
        const data = 1;

        const result = getShape(data);

        expect(result).toEqual([1]);
    })

    test('Given data is an 1 dimensional Tensor should return an array of single number', () => {
        const data = [1];

        const result = getShape(data);

        expect(result).toEqual([1]);
    })

    test('Given a data is a 2 dimensional Tensor should return an array of array of the shape of the data', () => {
        const data = [[1,2],[3,4]];

        const result = getShape(data);

        expect(result).toEqual([2,2]);
    })

    test('Given the data is a 3 dimensional Tensor should return an array of the shape of the data',() => {
        const data = [[[3,4]],[[7,8]]];

        const result = getShape(data);
    
        expect(result).toEqual([2,1,2]);
    })

    test('Given data is inhomogeneous shape it should throw an error', () => {
        const data = [[1],[2,3]];

        expect(() => getShape(data)).toThrow('The requested array has an inhomogeneous shape.')
    })

    test('Given data is an empty array should return an empty shape', () => {
        const data:number[] = [];

        const result = getShape(data);

        expect(result).toEqual([1]); 
      });

    test('Given a nested array with varying lengths at the same level should throw an error', () => {
        const data = [[1, 2], [3, 4, 5], [6]];

        expect(() => getShape(data)).toThrow('The requested array has an inhomogeneous shape.');
      });
    
    test('Given data is a very large array should return the correct shape quickly', () => {
        const data = new Array(10000).fill(0); 

        const result = getShape(data);

        expect(result).toEqual([10000]);
      });
      
    test('Given data is a deeply nested array should return the correct shape', () => {
        const data = [[[[1]]]]; 

        const result = getShape(data);
        
        expect(result).toEqual([1, 1, 1, 1]);
      });   
})