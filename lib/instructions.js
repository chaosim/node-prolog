/**
 * Require the Structures.
 **/
var Structures          = require("./structures");
var StoreRef            = Structures.StoreRef;
var HeapCell			= Structures.HeapCell;
var StructureCell		= Structures.StructureCell;

var prompt = require('sync-prompt').prompt;

// ----------------------------------------------------------------------
// ------- QUERY INSTRUCTIONS -------------------------------------------
// ----------------------------------------------------------------------

/**
 * Given an array of instructions, evaluate them.
 **/
function evaluateInstructions(instructions, ENV, debug) {
	var instructionsCount = instructions.length;

	if(debug === true) {
		console.log('\033[2J');
		console.log("Initial State");
		console.log(ENV.X());
		console.log(ENV.HEAP());
		console.log("Next: " + (instructions.length > 0 ? instructions[0].inspect() : "None"));
		prompt('Enter to continue.');
	}

	for (var i = 0 ; i < instructionsCount ; i++) {
		instructions[i].eval(ENV);

		if(debug === true) {
			console.log('\033[2J');
			console.log("Evaluated: " + instructions[i].inspect());
			console.log(ENV.X());
			console.log(ENV.HEAP());
			console.log("Next: " + (instructions.length > i+1 ? instructions[i+1].inspect() : "None"));
			prompt('Enter to continue.');
		}
	};
}

/**
 * PUT_STRUCTURE instruction.
 * The put_structure instruction holds a symbol, arity and store reference (should be an argument register).
 * When evaluated, it should load the ref and str tags onto the heap
 * as well as load the heap reference into its store ref (should be in X).
 **/
function put_structure(symbol, arity, reference) {
	this.symbol = symbol;
	this.arity = arity;
	this.reference = reference;
	this.inspect = function(){
		return "put_structure " + symbol + "/" + arity + " " + reference.inspect();
	};

	this.eval = function(ENV) {
		console.log("[EVAL]\t\t" + this.inspect());
		var HEAP = ENV.HEAP();

		var startingH = HEAP.H();
		HEAP.place(new HeapCell("str", new StoreRef(HEAP, startingH + 1)));
		HEAP.increment();
		HEAP.place(new StructureCell(this.symbol, this.arity));
		HEAP.increment();
		this.reference.set(HEAP.get(startingH));
	};
}

/**
 * SET_VARIABLE instruction.
 * The set_variable instruction will load an unbound reference cell onto the heap.
 * It will also place a heap reference into the correct argument register.
 **/
function set_variable(reference) {
	this.reference = reference;
	this.inspect = function(){
		return "set_variable " + reference.inspect();
	};

	this.eval = function(ENV) {
		console.log("[EVAL]\t\t" + this.inspect());
		var HEAP = ENV.HEAP();

		HEAP.place(new HeapCell("ref", new StoreRef(HEAP, HEAP.H())));
		this.reference.set(new HeapCell("ref", new StoreRef(HEAP, HEAP.H())));
		HEAP.increment();
	};
}

/**
 * SET_VALUE instruction.
 * The set_value instruction will place a reference to another heap cell onto the heap.
 * It does not need to affect X in any way since that symbol is already accounted for in X.
 **/
function set_value(reference) {
	this.reference = reference;
	this.inspect = function(){
		return "set_value " + reference.inspect();
	};

	this.eval = function(ENV) {
		console.log("[EVAL]\t\t" + this.inspect());
		var HEAP = ENV.HEAP();

		HEAP.place(this.reference.get());
		HEAP.increment();
	};
}

// ----------------------------------------------------------------------
// ------- PROGRAM INSTRUCTIONS -----------------------------------------
// ----------------------------------------------------------------------

/**
 * GET_STRUCTURE instruction.
 * The get_structure instruction will dereference the reference it is holding.
 * If that reference is itself a reference (ergo an unbound variable), then it
 * loads its structure onto the heap and sets the mode to WRITE.
 * If the dereferenced pointer holds a structure, then the symbol and arity are compared.
 * if they do not match it is a failure. If they do match, the mode is set to READ and execution continues.
 **/
function get_structure(symbol, arity, reference) {
	this.symbol = symbol;
	this.arity = arity;
	this.reference = reference;
	this.inspect = function(){
		return "get_structure " + symbol + "/" + arity + " " + reference.inspect();
	};

	this.eval = function(ENV) {
		console.log("[EVAL]\t\t" + this.inspect());

		var HEAP = ENV.HEAP();

		// Dereference our pointer.
		var addr = this.reference.deref();
		console.log("[DEREF OUT]\t" + addr.inspect());

		// Addr should be a heap cell.
		if(addr.constructor != HeapCell) {
			throw "Deref did not return a HeapCell (EVAL get_structure).";
		}

		// Now proceed based on what type of heap cell we got back.
		switch(addr.label) {
			case "ref":
				HEAP.place(new HeapCell("str", new StoreRef(HEAP, HEAP.H() + 1)));
				HEAP.set(HEAP.H() + 1, new StructureCell(this.symbol, this.arity));
				ENV.bind(addr.reference, new StoreRef(HEAP, HEAP.H()));
				HEAP.increment();
				HEAP.increment();
				ENV.MODE("WRITE");

				break ;
			case "str":
				// Get the value pointed to by this heap cell.
				var value = addr.reference.get();
				if(value.constructor != StructureCell) {
					throw "Unbound HeapCell to GET_STRUCTURE (deref failure?)";
				} 

				// Now check that the symbol and arity match whats stored in the instruction
				if(this.symbol != value.symbol || this.arity != value.arity) {
					throw "Unification Failure, get_structure, symbol or arity mismatch. (Expected: " + this.symbol + "/" + this.arity + " got " + value.symbol + "/" + value.arity + ").";
				}

				// If they were a match, set the mode to read and intialize S
				ENV.S(addr.reference.index + 1);
				ENV.MODE("READ");
				
				break ;
			default:
				throw "Unification Failure, NON-REF or NON-STR returned from deref (get_structure)."
		}		
	};
}

/**
 * UNIFY_VARIABLE instruction
 * The unify_variable instruction functions in two ways depending on the current mode:
 * READ MODE: Simply load the value in HEAP[S] (the next argument waiting to be matched) into the argument 
 * register in this instructions.
 * WRITE MODE: Write an unbounded variable onto the heap and load its reference into the argument register
 * held in this instruction.
 **/
function unify_variable(reference) {
	this.reference = reference;
	this.inspect = function(){
		return "unify_variable " + reference.inspect();
	};

	this.eval = function(ENV) {
		console.log("[EVAL]\t\t" + this.inspect() + " (" + ENV.MODE() + " mode)");
		var HEAP = ENV.HEAP();

		switch(ENV.MODE()) {
			case "READ":
				this.reference.set(HEAP.get(ENV.S()));
				break ;
			case "WRITE":
				HEAP.place(new HeapCell("ref", new StoreRef(HEAP, HEAP.H())));
				this.reference.set(HEAP.get(HEAP.H()));
				HEAP.increment();
				break ;
			default:
				throw "WAM Error, unknown operating mode: " + ENV.MODE();
		}

		ENV.S(ENV.S() + 1);
	};
}

/**
 * Unify Value is where all the unification magic happens.
 * In READ Mode, this instruction will facilitate the environment UNIFY function
 * to ensure terms already on the heap match the terms we are expecting.
 *
 * In WRITE Mode, this instruction functions exactly as SET_VALUE.
 **/
function unify_value(reference) {
	this.reference = reference;
	this.inspect = function(){
		return "unify_value " + reference.inspect();
	};

	this.eval = function(ENV) {
		console.log("[EVAL]\t\t" + this.inspect() + " (" + ENV.MODE() + " mode)");
		var HEAP = ENV.HEAP();

		switch(ENV.MODE()) {
			case "READ":
				ENV.unify(this.reference, new StoreRef(HEAP, ENV.S()));
				break ;
			case "WRITE":
				HEAP.place(this.reference.get());
				HEAP.increment();
				break ;
			default:
				throw "WAM Error, unknown operating mode: " + ENV.MODE();
		}

		ENV.S(ENV.S() + 1);
	};
}

/**
 * Exports
 **/
module.exports.evaluateInstructions = evaluateInstructions;

// L0 Query Instructions
module.exports.put_structure    = put_structure;
module.exports.set_variable     = set_variable;
module.exports.set_value        = set_value;

// L0 Program Instructions
module.exports.get_structure    = get_structure;
module.exports.unify_variable   = unify_variable;
module.exports.unify_value      = unify_value;
