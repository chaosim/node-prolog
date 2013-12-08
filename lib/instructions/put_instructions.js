var Structures          = require("../structures");
var StoreRef            = Structures.StoreRef;
var HeapCell			= Structures.HeapCell;
var StructureCell		= Structures.StructureCell;

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
		console.debug("[EVAL]\t\t" + this.inspect());
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
 * PUT_VARIABLE instruction.
 * Places an unbound REF cell onto the heap, also loads the reference into the 2 argument registers.
 **/
function put_variable(xn, ai) {
	this.xn = xn;
	this.ai = ai;

	this.inspect = function(){
		return "put_variable " + xn.inspect() + " " + ai.inspect();
	};

	this.eval = function(ENV) {
		throw "Unimplemented Path: PUT_VARIABLE instruction.";
	};
};

/**
 * PUT_VALUE instruction.
 * The put_value instruction simply copies the value from one register (xn) to another (ai).
 **/
function put_value(xn, ai) {
	this.xn = xn;
	this.ai = ai;

	this.inspect = function(){
		return "put_value " + xn.inspect() + " " + ai.inspect();
	};

	this.eval = function(ENV) {
		throw "Unimplemented Path: PUT_VALUE instruction.";
	};
};


/**
 * Exports.
 **/
module.exports.put_structure 	= put_structure;
module.exports.put_variable 	= put_variable;
module.exports.put_value 		= put_value;

