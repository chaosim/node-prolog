var Structures          = require("../structures");
var StoreRef            = Structures.StoreRef;
var HeapCell			= Structures.HeapCell;
var StructureCell		= Structures.StructureCell;

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
		console.debug("[EVAL]\t\t" + this.inspect());

		var HEAP = ENV.HEAP();

		// Dereference our pointer.
		var addr = this.reference.deref();
		console.debug("[DEREF OUT]\t" + addr.inspect());

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
 * GET_VARIABLE instruction.
 * The get_variable instruction simply copies the value from 
 * one argument register (ai) to another (xn), Note that this is the 
 * opposite direction of the put_value instruction.
 **/
function get_variable(xn, ai) {
	this.xn = xn;
	this.ai = ai;

	this.inspect = function(){
		return "get_variable " + xn.inspect() + " " + ai.inspect();
	};

	this.eval = function(ENV) {
		throw "Unimplemented Path: GET_VARIABLE instruction.";
	};
}

/**
 * GET_VALUE instruction.
 * The get_value instruction unifies the references in 2 argument registers.
 **/
function get_value(xn, ai) {
	this.xn = xn;
	this.ai = ai;

	this.inspect = function(){
		return "get_value " + xn.inspect() + " " + ai.inspect();
	};

	this.eval = function(ENV) {
		throw "Unimplemented Path: GET_VALUE instruction.";
	};	
}

/**
 * Exports.
 **/
module.exports.get_structure 	= get_structure;
module.exports.get_variable 	= get_variable;
module.exports.get_value 		= get_value;


