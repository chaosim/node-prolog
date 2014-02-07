
/**
 * The Program STACK and STACKFRAME objects.
 * The STACK and STACKFRAME are used during evaluation of Rules on WAML2+
 */
module.exports.Stack = function() {
	var store = [];
	var E = 0;

	/**
	 * Return the STORE
	 **/
	this.getStore = function() { return store; };

	/**
	 * Return the current value of E
	 **/
	this.getE = function() { return E; };

	/**
	 * Set the value of E 
	 **/
	this.setE = function(e) { E = e; };

	/**
	 * Return the current size of the stack
	 **/
	this.size = function() { return store.length; };
};

/**
 * Return the Stack Frame at the given index
 **/
module.exports.Stack.prototype.getFrameAt = function(index) { return this.getStore()[index]; };

/**
 * Return the current Stack Frame
 **/
module.exports.Stack.prototype.getCurrentFrame = function(index) { return this.getStore()[this.getE()]; };

/**
 * Push a frame onto the stack and return the new size of the stack
 **/
module.exports.Stack.prototype.pushFrame = function(frame) { 
	if(frame.constructor !== module.exports.StackFrame) {
		throw "Cannot push a non-StackFrame.";
	}

	return this.getStore().push(frame);
}

/**
 * Inspect a STACK
 **/
module.exports.Stack.prototype.inspect = function() {
	return "STACK\t\t size: " + this.size() + "\t\t E: " + this.getE();
}

/**
 * A basic STACKFRAME contains the following:
 * 	- The index in the STACK to return to upon completion (CE)
 *	- The index in the CODE area to return to upon completion (CP)
 *	- The number of permanent variables in this stack frame.
 *	- Each permanent variable in an array
 **/
module.exports.StackFrame = function(CE, CP, n, PVs) {
	var PV = PVs.slice(0);

	/**
	 * Return the CE Value
	 **/
	this.CE = function() { return CE; };

	/**
	 * Return the CP Value
	 **/
	this.CP = function() { return CP; };

	/**
	 * Return the n Value
	 **/
	this.n = function() { return n; };

	/**
	 * Return the permanent variables
	 **/
	this.permanentVariables = function() { return PV; };
};

/**
 * Inspect a stack frame
 **/
module.exports.StackFrame.inspect = function() {
	return "STACKFRAME[CE: " + this.CE() + "\t CP: " + this.CP() + "\t n: " + this.n() + "]";
};


