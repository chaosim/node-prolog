
/**
 * CALL instruction.
 * The role of the call instruction is to move the code pointer in the environment to point
 * to the first instruction for the given label.
 **/
function control_call(predicate, arity) {
	this.predicate = predicate;
	this.arity = arity;

	this.inspect = function() {
		return "call " + this.predicate + "/" + this.arity;
	};

	this.eval = function(ENV) { 
		ENV.CODE().goToLabel(this.predicate + "/" + this.arity);
	};
}

/**
 * PROCEED instruction.
 * Currently proceed is used as a no-op (simply a code termination instruction for programs).
 **/
function proceed(predicate, arity) {
	this.predicate = predicate;
	this.arity = arity;

	this.inspect = function() {
		return "proceed";
	};

	this.eval = function(ENV) { };
}

/**
 * Exports
 **/
module.exports.control_call = control_call;
module.exports.proceed 		= proceed;