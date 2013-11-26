
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
	 * Should be called on two store addresses.
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
	};

	/**
	 * The Unify Function.
	 * Shoudl be called with 2 store addresses,
	 **/
	this.unify = function(a, b) {
		console.log("[UNIFY]\t\t" + a.inspect() + " and " + b.inspect());
		var PDL = [];

		PDL.push(a); PDL.push(b);

		while(PDL.length != 0) 
		{
			var deref_a = PDL.pop().deref();
			var deref_b = PDL.pop().deref();

			console.log("A: " + deref_a.inspect());
			console.log("B: " + deref_b.inspect());

			// Start by checking if theyre aqlready equals
			if(deref_a.label === deref_b.label && deref_a.reference == deref_b.reference) {
				console.log("[UNIFY] Total Match: " + deref_a.inspect() + " and " + deref_b.inspect());
				break ;
			}
			// If one of the two is a reference (it must be unbound since its the result of a deref call), simply bind them together.
			if(deref_a.label == "ref" || deref_b.label == "ref") {
				console.log("[UNIFY]\t\tBIND BRANCH");
				this.bind(deref_a.reference, deref_b.reference);
			}			
			else 
			{
				// If we reach into this branch, both derefs must be structures.
				// If they are to unify, the symbols and arity must be equal
				// We will then push each of their arguments into the PDL to ensure that
				// they also unify.
				console.log("[UNIFY]\t\tEXPLORE BRANCH");
				var str_a = (deref_a.reference.get());
				var str_b = (deref_b.reference.get());

				if(str_a.symbol === str_b.symbol && str_a.arity === str_b.arity) {
					console.log("[UNIFY]\t\tMATCH BRANCH");

					// The symbol and arity matched, now we need to push all of the arguments onto the PDL.
					for(var i = 1 ; i <= str_a.arity ; i++) {
						PDL.push(new StoreRef(deref_a.reference.store, deref_a.reference.index+i));
						PDL.push(new StoreRef(deref_b.reference.store, deref_b.reference.index+i));
					}

					console.log(PDL);

				} else {
					throw "Unification Failure, Functor mismatch: " + str_a.inspect() + " vs " + str_b.inspect();
				}
			}
		}
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



