/**
 * A class to hold a whole structure.
 * It has a symbol, arity and an array of 
 * args (either more structures or REFS)
 * 
 * Note: This class should only be used during compilation.
 **/
module.exports.CompleteStructure = function(symbol, arity, args) {
	this.symbol = symbol;
	this.arity = arity;
	this.args = args;
	this.inspect = function(){
		var s = this.symbol + (this.arity == 0 ? "" : "(");
		for(var x = 0 ; x < this.arity ; x++) {
			s += this.args[x].inspect();
			if(x != this.arity - 1) {
				s += ",";
			}
		}
		s += (this.arity == 0 ? "" : ")");
		return s;
	};
};

/**
 * A class to store a variable. 
 *
 * Note: This class should only be used during compilation.
 **/
module.exports.Variable = function(symbol, reference) {
	this.symbol = symbol;
	this.reference = reference;
	this.inspect = function(){
		return this.symbol;
	};
}