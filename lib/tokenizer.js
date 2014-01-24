/* global console */

var syntax = ['[', ']', ':=', '(', ')', '.', ','];

var Tokenizer = {};

function isVariable(str) {
	var i;
	str = str.trim();
	if(str[0] !== '_' && !isUppercase(str[0])) {
		return false;
	}

	for(i=1; i < str.length; i++) {
		if(!isAlphaNumeric(str[i])){
			return false;
		}
	}

	return true;
};

module.exports.isVariable = isVariable;


function isUppercase(c) {
    var code = c.charCodeAt(0);
    return 65 <= code && code <= 90;
};

function isAlphaNumeric(c) {
    var code = c.charCodeAt(0);
    return ( 48 <= code && code <= 57 ) || // number
           ( 65 <= code && code <= 90 ) || // uppercase
           ( 97 <= code && code <= 122 );  // lowercase
};