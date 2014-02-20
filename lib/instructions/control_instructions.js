var StackFrame = require("../structures").StackFrame;

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
		ENV.CODE().setCP(ENV.CODE().P() + 1);
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

	this.eval = function(ENV) { 
		ENV.CODE().jumpToCP();
	};
}

/**
 * ALLOCATE instruction
 * TODO...
 **/
function allocate(permCount) {
	this.permCount = permCount;
	this.inspect = function() {
		return "allocate " + this.permCount;
	};

	this.eval = function(ENV) { 
		// Store the current values of E, CP, and N
		var STACK = ENV.STACK();
		STACK.pushFrame(
			new StackFrame(
				STACK.getE(),
				ENV.CODE().P(),
				this.permCount,
				// TODO. Not really sure if we need to pass the actual values, 
				// i would guess we do, but haven't seen them used anywhere yet
				[] 
			)
		);
	};
}

/**
 * DEALLOCATE instruction
 * TODO...
 **/
function deallocate() {
	this.inspect = function() {
		return "deallocate";
	};

	this.eval = function(ENV) { 
		// Pop off the top frame
		var topFrame = ENV.STACK.pop();
		console.log(topFrame);
		// ENV.CODE().setCP();

		throw "not implemented";
	};
}

/**
 * Exports
 **/
module.exports.control_call = control_call;
module.exports.proceed 		= proceed;
module.exports.allocate 	= allocate;
module.exports.deallocate	= deallocate;