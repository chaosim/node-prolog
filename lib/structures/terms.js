var StoreRef = require("./store_ref").StoreRef;

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

	// Pull out any variables referenced in here.
	this.variables = [];
	var num_args = args.length;
	for(var x = 0 ; x < num_args ; x++) {
		var arg = args[x];
		if(arg.constructor === StoreRef) {
			arg = arg.get();
		}
		if(arg.constructor === module.exports.Variable) {
			this.variables.push(arg);
		}
	}
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
};

/** 
 * A class to store a procedure
 * Head should be a CompleteStructure and Body should be a list of non-procedure terms
 **/
module.exports.Procedure = function(head, body) {
	this.head = head;
	this.body = body;

	this.symbol = head.symbol;
	this.arity = head.arity;

	// Compute the number of permanent variables
	// TODO: Move this into a function or something...
	this.permanentVariables = [];
	var body_length = body.length;
	var headVars = head.variables;
	var foundVars = {};
	for(var x = 0 ; x < body_length ; x++) {
		var containedVars = body[x].variables;
		if(x === 0) {
			// push the head vars and the first rule vars, dont check anything
			var headVars_length = headVars.length;
			for(var hv = 0 ; hv < headVars_length ; hv++) {
				foundVars[headVars[hv].symbol] = 0;
			}

			var bodyVar_length = body[x].variables.length;
			for(var bv = 0 ; bv < bodyVar_length ; bv++) {
				foundVars[body[x].variables[bv].symbol] = 0;
			}
		} else {
			// Otherwise, loop over the body vars and push a permantent variable 
			// if the foundVars value is 0
			var bodyVar_length = body[x].variables.length;
			for(var bv = 0 ; bv < bodyVar_length ; bv++) {
				var foundVal = foundVars[body[x].variables[bv].symbol];
				if(typeof foundVal === "undefined") {
					foundVars[body[x].variables[bv].symbol] = 0;
				} else {
					if(foundVal === 0) {
						this.permanentVariables.push(body[x].variables[bv].symbol);
						foundVars[body[x].variables[bv].symbol] = 1;
					}
				}
			}
		}
	}
};