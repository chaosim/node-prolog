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
 * Exports.
 **/
module.exports.put_structure = put_structure;

