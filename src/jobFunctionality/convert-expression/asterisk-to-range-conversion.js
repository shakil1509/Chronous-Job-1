'use strict';
module.exports = (() => {
    function convertAsterisk(expression, replecement){
        if(expression.indexOf('*') !== -1){
            return expression.replace('*', replecement);
        }
        return expression;
    }

    function convertAsterisksToRanges(expressions){
        expressions[0] = convertAsterisk(expressions[0], '0-59');
        expressions[1] = convertAsterisk(expressions[1], '0-59');
        expressions[2] = convertAsterisk(expressions[2], '0-23');
        expressions[3] = convertAsterisk(expressions[3], '1-31');
        expressions[4] = convertAsterisk(expressions[4], '1-12');
        expressions[5] = convertAsterisk(expressions[5], '0-6');
        return expressions;
    }

    return convertAsterisksToRanges;
})();

// This code defines a module that provides a function for converting asterisk (*) symbols in cron job expressions into their equivalent full ranges. Here's a breakdown of its functionality:

// Use of 'use strict': It enables strict mode, which is a way to opt in to a restricted variant of JavaScript. Strict mode makes several changes to normal JavaScript semantics: it eliminates some JavaScript silent errors by changing them to throw errors, fixes mistakes that make it difficult for JavaScript engines to perform optimizations, and prohibits some syntax likely to be defined in future versions of ECMAScript.

// Module Definition: The module exports a single function using an Immediately Invoked Function Expression (IIFE). This pattern is used to create a scope around the module's contents, immediately executing the function at definition time and exporting the result, which in this case, is the convertAsterisksToRanges function.

// convertAsterisk Function: This helper function takes two arguments: expression, which is a part of a cron expression (e.g., the minute, hour, or day part), and replecement, which is the string that should replace any asterisk (*) found in the expression. If an asterisk is found, it replaces it with the replecement value; otherwise, it returns the original expression unchanged. This function encapsulates the logic for converting a single part of a cron expression.

// convertAsterisksToRanges Function: This is the main function exported by the module. It accepts an array of cron expression parts (e.g., [minutes, hours, dayOfMonth, month, dayOfWeek]) and converts any asterisk in these parts into their corresponding full range values:

// For the minute and hour parts, * is replaced with 0-59 and 0-23 respectively, indicating every minute of an hour and every hour of a day.
// For the day of month part, * is replaced with 1-31, covering all days in the longest possible month.
// For the month part, * is replaced with 1-12, covering all months of the year.
// For the day of week part, * is replaced with 0-6, indicating every day of the week starting from Sunday (0) to Saturday (6).
// The function applies these conversions to each part of the passed-in expressions array and then returns the modified array.

// Overall, this module simplifies cron expressions by expanding asterisks into explicit ranges, making the expressions clearer and explicitly defining their range of effect. This can be especially useful in scheduling systems where * might be used to indicate "every possible value," but a more explicit range is preferred for clarity or compatibility reasons.