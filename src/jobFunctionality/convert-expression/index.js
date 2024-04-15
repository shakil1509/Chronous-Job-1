'use strict';

const monthNamesConversion = require('./month-names-conversion');
const weekDayNamesConversion = require('./week-day-names-conversion');
const convertAsterisksToRanges = require('./asterisk-to-range-conversion');
const convertRanges = require('./range-conversion');
const convertSteps = require('./step-values-conversion');

module.exports = (() => {



// This appendSeccondExpression function is designed to adjust a Cron expression to ensure it has the correct format by possibly adding a second field. Cron expressions are used to schedule tasks in Unix-like systems, and they can vary in complexity. A full Cron expression should have six fields representing second, minute, hour, day of the month, month, and day of the week, in that order. However, sometimes, Cron expressions are provided with only five fields, omitting the seconds field.

// Here's what the function does, step by step:

// Check the length of the expressions array: The function first checks if the expressions array, which represents the parts of a Cron expression, has exactly five elements. This would indicate that the expression includes minute, hour, day of the month, month, and day of the week, but not seconds.

// Add a seconds field: If the expressions array has five elements, it prepends the array with the string '0', which represents the seconds field. The ['0'].concat(expressions) part creates a new array with '0' as the first element (indicating the task should run at the 0th second of the minute) and then appends the original five elements after it. This ensures the expression now correctly has six fields.

// Return the adjusted or original expression: If the original expressions array had five elements, the function returns the new array with six elements. If the expressions array did not have five elements (meaning it either already had six elements or an incorrect number of elements for a Cron expression), it returns the original expressions array without modification.

// The purpose of this function is to normalize Cron expressions to always include a seconds field, ensuring consistency, especially in systems or libraries that expect a six-field format for scheduling tasks.
    function appendSeccondExpression(expressions){
        if(expressions.length === 5){
            return ['0'].concat(expressions);
        }
        return expressions;
    }

//     The removeSpaces function is designed to clean up a string by reducing multiple consecutive spaces to a single space and trimming leading and trailing spaces from the string. Here's a breakdown of how it works:

// Parameter: The function takes a single parameter, str, which is the string to be processed.

// Regular Expression Replacement: Inside the function, the replace method is called on str. It uses a regular expression (/\s{2,}/g) to match occurrences of two or more consecutive spaces (\s{2,}) anywhere in the string (g is the global flag, meaning it searches the entire string).

// Replacement Operation: The matched sequences of two or more spaces are replaced with a single space (' '). This effectively collapses multiple spaces down to one, making the spacing in the string more uniform.

// Trimming: After replacing the multiple consecutive spaces, the trim method is applied to the resulting string. trim removes any leading or trailing whitespace from the string. "Whitespace" here includes spaces, tabs, newlines, and other Unicode whitespace characters.

// Return Value: Finally, the function returns this cleaned-up version of the string, with excess spaces removed and no leading or trailing whitespace.

// Here's a simple example to illustrate what the function does:

// Input: ' This is a test string. '
// Output: 'This is a test string.'
    function removeSpaces(str) {
        return str.replace(/\s{2,}/g, ' ').trim();
    }


//     The normalizeIntegers function is designed to take an array of strings, where each string represents a list of integers separated by commas, and convert each of these strings into an array of integers. Here's a step-by-step explanation:

// Parameter: The function receives expressions, an array of strings, as its parameter. Each string within this array is expected to contain a list of integers separated by commas (e.g., "1,2,3").

// Loop Over expressions Array: The outer for loop iterates over each string in the expressions array using the index i.

// Split String into Array: Inside the loop, the current string (expressions[i]) is split by commas using the split(',') method, resulting in an array of strings where each string represents a number. This array is stored in the numbers variable.

// Convert Strings to Integers: Another loop, nested inside the first, iterates over the numbers array. For each iteration, it converts the current string to an integer using parseInt(numbers[j]). This conversion replaces the original string in the numbers array with its integer representation.

// Update expressions Array: After converting all the strings in numbers to integers, the original string in expressions[i] is replaced with the numbers array. This effectively changes each comma-separated string in expressions into an array of integers.

// Return Updated expressions: After processing all strings in the expressions array, the function returns the modified expressions array, which now contains arrays of integers instead of comma-separated strings.

// Here's an example to illustrate how the function works:

// Input: ["1,2,3", "4,5,6", "7,8,9"]
// After normalizeIntegers function: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    // Function that takes care of normalization.
    function normalizeIntegers(expressions) {
        for (let i=0; i < expressions.length; i++){
            const numbers = expressions[i].split(',');
            for (let j=0; j<numbers.length; j++){
                numbers[j] = parseInt(numbers[j]);
            }
            expressions[i] = numbers;
        }
        return expressions;
    }

    /*
   * The node-cron core allows only numbers (including multiple numbers e.g 1,2).
   * This module is going to translate the month names, week day names and ranges
   * to integers relatives.
   *
   * Remove spaces
   * - Replaces occurrences of two or more consecutive spaces with single spaces
   * - Removes any leading(Starting) or trailing(Ending) whitespace from the string
   * 
   * appendSeccondExpression
   * - If the expressions array has five elements, it prepends the array with the string '0', which represents the seconds field.
   * - indicating the task should run at the 0th second of the minute
   * 
   * Month names example:
   *  - expression 0 1 1 January,Sep *
   *  - Will be translated to 0 1 1 1,9 *
   *
   * Week day names example:
   *  - expression 0 1 1 2 Monday,Sat
   *  - Will be translated to 0 1 1 1,5 *
   *
   * convertRanges
   * - If an asterisk is found, it replaces it with the replecement value
   * - For the minute and hour parts, * is replaced with 0-59 and 0-23 respectively
   * 
   * Ranges example:
   *  - expression 1-5 * * * *
   *  - Will be translated to 1,2,3,4,5 * * * *
   * 
   * convertSteps
   *  - if the expression contains a step value 
   *  -  It replaces the original expression with the comma-separated list of step values
   *  -eg '1-10/3 * * * *',  changes expression to=> '1,4,7,10 * * * *'
   * 
   * normalizeIntegers
   *  - The normalizeIntegers function ensures that all numbers in the expression are properly formatted and within the valid range
   * 

   * 
   */
    function interprete(expression){
        let expressions = removeSpaces(expression).split(' ');
        expressions = appendSeccondExpression(expressions);
        expressions[4] = monthNamesConversion(expressions[4]);
        expressions[5] = weekDayNamesConversion(expressions[5]);
        expressions = convertAsterisksToRanges(expressions);
        expressions = convertRanges(expressions);
        expressions = convertSteps(expressions);

        expressions = normalizeIntegers(expressions);

        return expressions.join(' ');
    }

    return interprete;
})();