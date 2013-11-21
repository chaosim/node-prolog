/**
 * Require the Structures.
 **/
var Structures          = require("./structures");
var StoreRef            = Structures.StoreRef;
var HeapCell			= Structures.HeapCell;
var StructureCell		= Structures.StructureCell;

// ----------------------------------------------------------------------
// ------- QUERY INSTRUCTIONS -------------------------------------------
// ----------------------------------------------------------------------

/**
 * Given an array of instructions, evaluate them.
 **/
function evaluateInstructions(instructions, HEAP, X) {
	var instructionsCount = instructions.length;
	for (var i = 0 ; i < instructionsCount ; i++) {
		instructions[i].eval(HEAP, X);
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

	this.eval = function(HEAP, X) {
		console.log("[EVAL] " + this.inspect());

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

	this.eval = function(HEAP, X) {
		console.log("[EVAL] " + this.inspect());

		HEAP.place(new HeapCell("ref", new StoreRef(HEAP, HEAP.H())));
		this.reference.set(HEAP.get(HEAP.H()));
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

	this.eval = function(HEAP, X) {
		console.log("[EVAL] " + this.inspect());

		HEAP.place(this.reference.get());
		HEAP.increment();
	};
}

// ----------------------------------------------------------------------
// ------- PROGRAM INSTRUCTIONS -----------------------------------------
// ----------------------------------------------------------------------

// TODO: Detailed comments on the program instructions.
function get_structure(symbol, arity, reference) {
	this.symbol = symbol;
	this.arity = arity;
	this.reference = reference;
	this.inspect = function(){
		return "get_structure " + symbol + "/" + arity + " " + reference.inspect();
	};

	this.eval = function() {
		console.log("[EVAL] " + this.inspect());
	};
}

function unify_variable(reference) {
	this.reference = reference;
	this.inspect = function(){
		return "unify_variable " + reference.inspect();
	};

	this.eval = function() {
		console.log("[EVAL] " + this.inspect());
	};
}

function unify_value(reference) {
	this.reference = reference;
	this.inspect = function(){
		return "unify_value " + reference.inspect();
	};

	this.eval = function() {
		console.log("[EVAL] " + this.inspect());
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
