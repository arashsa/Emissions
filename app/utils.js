function cleanRootPath(path) {
    // convert '/science/step1' => 'science'
    return path.replace(/\/?(\w+).*/, "$1");
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

/**
 * Standardize number parsing.
 * @param {string} str is a non-empty string
 * @returns {Number} - possibly NaN
 *
 * The standardization step of converting '1,23' -> '1.23' is strictly not needed when handling inputs from
 * input fields that have type='number', where this happens automatically.
 * The rest of the error handling is useful, none the less.
 */
function parseNumber(str) {
    if (!typeof str === 'string') {
        throw TypeError('This function expects strings. Got something else: ' + str);
    }

    // standardize the number format - removing Norwegian currency format
    let cleanedString = str.trim().replace(',', '.');

    if (!cleanedString.length) {
        throw TypeError('Got a blank string');
    }

    if (cleanedString.indexOf('.') !== -1) {
        return parseFloat(cleanedString, 10);
    } else {
        return parseInt(cleanedString, 10);
    }
}

// generates a UUID
// worlds smallest uuid lib. crazy shit :)
// @see https://gist.github.com/jed/982883
function b(a) {
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
}

function lazyRequire(path) {
    let tmp = null;
    return ()=> {
        if (!tmp) tmp = require(path);
        return tmp;
    }
}

module.exports = {
    cleanRootPath, randomInt, parseNumber, uuid: b, lazyRequire
};
