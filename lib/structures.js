
/**
 * Hold Evaluation Environment Settings.
 **/
function Env() {
	/**
	 * Read/Write Mode. Used during PROGRAM EVALUATION.
	 **/
	// TODO: Use an enumerated type here instead of a string.
	var mode = null;
	this.MODE = function(newMode) { 
		if(newMode != undefined) {
			mode = newMode; 
		} else {
			return mode;
		} 
	};

	/**
	 * Heap Pointer S, which holds the HEAP address of the next term to be matched.
	 **/
	var S = 0;
	this.S = function(newS) { 
		if(newS) { 
			S = newS; 
		} else {
			return S;
		} 
	};

	/**
	 * The BIND Function.
	 **/
	this.bind = function(a_ref, b_ref) {
		var a = a_ref.get();
		var b = b_ref.get();
		console.log("[BIND]\t\t" + a_ref.inspect() + " and " + b_ref.inspect());

		if(a.label == "ref" && b.label != "ref" || b.index < a.index) {
			a_ref.store = b_ref.store;
			a_ref.index = b_ref.index;
		} else {
			b_ref.store = a_ref.store;
			b_ref.index = a_ref.index;
		}

		throw "DIE";
	};

	/**
	 * The Unify Function.
	 **/
	this.unify = function(a, b) {
		console.log("[UNIFY]\t\t" + a.inspect() + " and " + b.inspect());
	};
}

/**
 * The Heap.
 **/
function Heap() {
	var store = [];
	var H = 0;
	
	this.H = function() {
		return H;
	};

	this.set = function(index, item) {
		store[index] = item;
	};

	this.place = function(item) {
		store[H] = item;
	};

	this.increment = function() {
		H++;
	};

	this.get = function(index) {
		return store[index];
	};

	this.inspect = function() {
		var s = "HDUMP["+H+"]:\n";
		for(var i = 0 ; i < H ; i++) {
			s += i + ":\t" + (store[i] ? store[i].inspect() : "undefined") + "\n";
		}
		return s
	};

	this.label = function() { 
		return "HEAP";
	};
}

/**
 * The Argument Registers
 **/
function X() {
	var store = [];

	this.set = function(register, value) {
		store[register] = value;
	};

	this.get = function(register) {
		return store[register];
	};

	this.inspect = function(){
		var s = "XDUMP:\n";
		for(var i in store) {
			s += i + ":\t" + (store[i] ? store[i].inspect() : "undefined") + "\n";
		}
		return s
	};

	this.label = function() { 
		return "X";
	};
}

/**
 * A Heap Cell contains a label and a StoreRef
 **/
// TODO: Change the label to use some kind of enumerated type instead of strings
function HeapCell(label, reference) {
	this.label = label;
	this.reference = reference;
	this.inspect = function() {
		return "<" + this.label + ", " + this.reference.inspect() + ">";
	};
}

/**
 * A Heap Cell which contains a predicate symbol and arity
 **/
function StructureCell(symbol, arity) {
	this.symbol = symbol;
	this.arity = arity;
	this.inspect = function() {
		return "<" + this.symbol + "/" + this.arity + ">";
	};
}

/**
 * Holds a reference to a store
 **/
function StoreRef(store, index) {
	this.store = store;
	this.index = index;

	this.set = function(item) {
		this.store.set(this.index, item);
	};

	this.get = function() {
		return this.store.get(this.index);
	};

	this.deref = function() {
		console.log("[DEREF IN]\t" + this.inspect());
		var test = this.get();

		// if this is a self-referencing item, its an unbound variable
		// we cannot derefence it any further
		// TODO: Convert the HeapCell to use an enumerated type instead of strings for the cell label
		if(test.constructor == StoreRef) {
			if(test.store == this.store && test.index == this.index) {
				return this;
			} else {
				return test.deref;
			}
		} else if(test.constructor == HeapCell) {
			if(test.label == "ref") {
				// TODO: Find a better way to compare there, using the constructor will mean we can only have one of each store type at a time.
				if(test.reference.store.constructor == this.store.constructor && test.reference.index == this.index) {
					return test;
				} else if(test.label == "str") {
					return this;
				} else {
					return test.reference.deref();
				}
			} else {
				return test;
			}
		} else if(test.constructor == StructureCell) {
			return test;
		} else {
			throw "Unable to dereference object: " + test.inspect();
		}
	};

	this.inspect = function(){
		return store.label() + "[" + this.index + "]";
	};
}

/**
 * A class to hold a whole structure.
 * It has a symbol, arity and an array of 
 * args (either more structures or REFS)
 * 
 * Note: This class should only be used during compilation.
 **/
function CompleteStructure(symbol, arity, args) {
	this.symbol = symbol;
	this.arity = arity;
	this.args = args;
	this.inspect = function(){
		var s = this.symbol + "(";
		for(var x = 0 ; x < this.arity ; x++) {
			s += this.args[x].inspect();
			if(x != this.arity - 1) {
				s += ",";
			}
		}
		s += ")";
		return s;
	};
};

/**
 * A class to store a variable. 
 *
 * Note: This class should only be used during compilation.
 **/
function Variable(symbol, reference) {
	this.symbol = symbol;
	this.reference = reference;
	this.inspect = function(){
		return "var("+this.symbol+")";
	};
}


/**
 * Exports.
 **/
module.exports.Env = Env;
module.exports.X = X;
module.exports.Heap = Heap;
module.exports.HeapCell = HeapCell;
module.exports.StructureCell = StructureCell;
module.exports.StoreRef = StoreRef;
module.exports.CompleteStructure = CompleteStructure;
module.exports.Variable = Variable;



