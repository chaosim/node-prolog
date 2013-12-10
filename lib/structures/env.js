
var Heap = require("./heap").Heap;
var X = require("./x").X;
var Code = require("./code").Code;

/**
 * The Program ENVIRONMENT
 *
 * The ENV holds lots of things:
 * 	- the HEAP
 *  - the X registers
 * 	- the CODE area
 * 	- DEBUG information
 * 	- VARIABLE BINDINGS from the query (for result output)
 * 	- the S register (used during program execution)
 * 	- the Compilation MODE (used during program execution)
 * 	- the BIND and UNIFY functions
 **/
module.exports.Env = function() {

	/**
	 * Debug Flag
	 **/
	console.debug = console.log;
	var _consolelog = console.log;
	this.DEBUG = false;
	this.setDebug = function(debug) {
		if(debug === true) {
			console.debug = _consolelog;
			this.DEBUG = debug;
		} else if(debug === false) {
			console.debug = function() { };
			this.DEBUG = debug;
		} else {
			throw "Debug must be true or false.";
		}
	}

	/** 
	 * Store Query Variable Bindings for later recall.
	 **/
	var _QueryVariableBindings = {};
	this.setQueryVariableBinding = function(label, reference) {
		_QueryVariableBindings[label] = reference;
	};

	this.getQueryVariableBinding = function(label) {
		return _QueryVariableBindings[label];
	};

	this.getQueryVariableBindings = function() { return _QueryVariableBindings; };

	/**
	 * Hold onto the HEAP and X Objects for this environment
	 **/
	var _HEAP = new Heap();
	this.HEAP = function() { return _HEAP; };

	var _X = new X();
	this.X = function() { return _X; };

	var _Code = new Code();
	this.CODE = function() { return _Code; };

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
		console.debug("[BIND]\t\t" + a_ref.inspect() + " and " + b_ref.inspect());

		if(a.label == "ref" && (b.label != "ref" || a.index < b.index)) {
			a_ref.set(b);
		} else {
			b_ref.set(a);
		}
	};

	/**
	 * The Unify Function.
	 * Shoudl be called with 2 store addresses,
	 **/
	this.unify = function(a, b) {
		console.debug("[UNIFY]\t\t" + a.inspect() + " and " + b.inspect());
		var PDL = [];

		PDL.push(a); PDL.push(b);

		while(PDL.length != 0) 
		{
			var deref_a = PDL.pop().deref();
			var deref_b = PDL.pop().deref();

			// Start by checking if theyre aqlready equals
			if(deref_a.label === deref_b.label && deref_a.reference == deref_b.reference) {
				console.debug("[UNIFY] Total Match: " + deref_a.inspect() + " and " + deref_b.inspect());
				break ;
			}
			// If one of the two is a reference (it must be unbound since its the result of a deref call), simply bind them together.
			if(deref_a.label == "ref" || deref_b.label == "ref") {
				console.debug("[UNIFY]\t\tBIND BRANCH");
				this.bind(deref_a.reference, deref_b.reference);
			}			
			else 
			{
				// If we reach into this branch, both derefs must be structures.
				// If they are to unify, the symbols and arity must be equal
				// We will then push each of their arguments into the PDL to ensure that
				// they also unify.
				console.debug("[UNIFY]\t\tEXPLORE BRANCH");
				var str_a = (deref_a.reference.get());
				var str_b = (deref_b.reference.get());

				if(str_a.symbol === str_b.symbol && str_a.arity === str_b.arity) {
					console.debug("[UNIFY]\t\tMATCH BRANCH");

					// The symbol and arity matched, now we need to push all of the arguments onto the PDL.
					for(var i = 1 ; i <= str_a.arity ; i++) {
						PDL.push(new StoreRef(deref_a.reference.store, deref_a.reference.index+i));
						PDL.push(new StoreRef(deref_b.reference.store, deref_b.reference.index+i));
					}

					console.debug(PDL);

				} else {
					throw "Unification Failure, Functor mismatch: " + str_a.inspect() + " vs " + str_b.inspect();
				}
			}
		}
	};
}