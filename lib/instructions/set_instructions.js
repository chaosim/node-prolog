var Structures          = require("../structures");
var StoreRef            = Structures.StoreRef;
var HeapCell			= Structures.HeapCell;
var StructureCell		= Structures.StructureCell;

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
		console.debug("[EVAL]\t\t" + this.inspect());
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
		console.debug("[EVAL]\t\t" + this.inspect());
		var HEAP = ENV.HEAP();

		HEAP.place(this.reference.get());
		HEAP.increment();
	};
}

/**
 * Exports.
 **/
module.exports.set_variable 	= set_variable;
module.exports.set_value 		= set_value;

