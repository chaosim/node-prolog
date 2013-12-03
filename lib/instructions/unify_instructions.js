var Structures          = require("../structures");
var StoreRef            = Structures.StoreRef;
var HeapCell			= Structures.HeapCell;
var StructureCell		= Structures.StructureCell;

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
		console.debug("[EVAL]\t\t" + this.inspect() + " (" + ENV.MODE() + " mode)");
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
		console.debug("[EVAL]\t\t" + this.inspect() + " (" + ENV.MODE() + " mode)");
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
 * Exports.
 **/
module.exports.unify_variable 	= unify_variable;
module.exports.unify_value 		= unify_value;