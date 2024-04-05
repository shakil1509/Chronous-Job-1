'use strict';
module.exports = ( () => {
    function replaceWithRange(expression, text, init, end) {

        const numbers = [];
        let last = parseInt(end);
        let first = parseInt(init);

        if(first > last){
            last = parseInt(init);
            first = parseInt(end);
        }

        for(let i = first; i <= last; i++) {
            numbers.push(i);
        }

        return expression.replace(new RegExp(text, 'i'), numbers.join());
    }

    function convertRange(expression){
        const rangeRegEx = /(\d+)-(\d+)/;
        let match = rangeRegEx.exec(expression);
        while(match !== null && match.length > 0){
            expression = replaceWithRange(expression, match[0], match[1], match[2]);
            match = rangeRegEx.exec(expression);
        }
        return expression;
    }

    function convertAllRanges(expressions){
        for(let i = 0; i < expressions.length; i++){
            expressions[i] = convertRange(expressions[i]);
        }
        return expressions;
    }

    return convertAllRanges;
})();


// This code defines a module that exports a function designed to convert numerical range expressions within cron expression parts into explicit lists of numbers. Here's how it works:

// Strict Mode: The 'use strict'; directive at the beginning of the file enforces a stricter parsing and error handling on your JavaScript code. This can help catch common coding mistakes and "unsafe" actions such as defining global variables unintentionally.

// Module Structure: The module exports a function using an Immediately Invoked Function Expression (IIFE). This pattern is utilized to execute the function immediately at load time, returning its result—in this case, the convertAllRanges function—as the module's export. This approach encapsulates the module's logic, making it self-contained and immediately operational.

// replaceWithRange Function: This helper function takes an expression (a part of a cron expression), a text pattern representing a range (e.g., "5-9"), and init and end values defining the start and end of the numerical range. It generates an array of numbers spanning from init to end, inclusive, and replaces the original text pattern in the expression with this comma-separated list of numbers. The function also ensures that init is less than end, swapping their values if necessary, to correctly handle ranges specified in reverse order.

// convertRange Function: This function identifies and processes all range patterns (denoted by "start-end", e.g., "1-5") within a given cron expression part. It uses a regular expression to find these patterns and repeatedly calls replaceWithRange to convert them into explicit lists of numbers until no more range patterns are found in the expression.

// convertAllRanges Function: This is the main function exported by the module. It iterates over an array of cron expression parts, applying the convertRange function to each part to expand all numerical range expressions into explicit lists of numbers. This conversion process is applied to each part of the cron expression individually, allowing the function to handle complex expressions that include ranges in multiple components (e.g., hours, days).

// By doing so, the module effectively expands shorthand notations within cron expressions, making them more explicit and potentially easier to understand. For example, a cron expression part specifying "1-5" would be expanded to "1,2,3,4,5", clarifying that the task should run at each of these specified times or dates.

// Sure, let's take an example of a cron expression and see how the provided module would convert any range expressions within it into explicit lists of numbers.

// Suppose we have the following cron expression parts:

// javascript
// Copy code
// const expressions = [
//     '0-5 * * * *',   // Minutes: 0,1,2,3,4,5; Hours: every hour; Day of month: every day; Month: every month; Day of week: every day of the week
//     '* 1-3 * * *',   // Minutes: every minute; Hours: 1,2,3; Day of month: every day; Month: every month; Day of week: every day of the week
//     '5-9 2-4 * * *'  // Minutes: 5,6,7,8,9; Hours: 2,3,4; Day of month: every day; Month: every month; Day of week: every day of the week
// ];
// Let's see how the convertAllRanges function would process these expressions:

// javascript
// Copy code
// const convertAllRanges = require('./path_to_module');

// const convertedExpressions = convertAllRanges(expressions);

// console.log(convertedExpressions);
// After processing, the convertedExpressions array would contain the following values:

// javascript
// Copy code
// [
//     '0,1,2,3,4,5 * * * *',
//     '* 1,2,3 * * *',
//     '5,6,7,8,9 2,3,4 * * *'
// ]
// As you can see, the module has expanded all range expressions into explicit lists of numbers, providing a clearer representation of the intended schedule. Now, each cron expression part contains explicit numbers instead of range expressions, making it easier to understand when the task should run.






