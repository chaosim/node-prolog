var Structures          = require("../lib/structures");
var StoreRef            = Structures.StoreRef;
var CompleteStructure   = Structures.CompleteStructure;
var Variable   			= Structures.Variable;
var Utils 				= require("../lib/utils");
var Instructions 		= require("../lib/instructions");
var Compiler 			= require("../lib/compilers");

/**
 * A Test Suite for The L0 WAM Compilation.
 **/
describe("Query Compilation", function(){
	var ENV = null;

	beforeEach(function(){
		ENV = new Structures.Env();	
	});

	/**
	 * The example query from the wambook is: 
	 *		?- p(Z, h(Z,W), f(W)).
	 *
	 * This test hard codes the parsed, flattened version and pipes it into compile.
	 * It then checks the resulting instructions against the known L0 WAM Instructions.
	 **/
	it("should compile the WAMBook example query", function(){
		ENV.X().set(1, new CompleteStructure("p",3,[new StoreRef(ENV.X(),2), new StoreRef(ENV.X(),3), new StoreRef(ENV.X(),4)]));
		ENV.X().set(2, new Variable("Z", new StoreRef(ENV.X(),2)));
		ENV.X().set(3, new CompleteStructure("h", 2, [new StoreRef(ENV.X(),2), new StoreRef(ENV.X(),5)]));
		ENV.X().set(4, new CompleteStructure("f", 1, [new StoreRef(ENV.X(),5)]));
		ENV.X().set(5, new Variable("W", new StoreRef(ENV.X(),5)));
		var flattened = [ 3, 4, 1 ];
		var queryInstructions = Compiler.CompileLoadedQuery(ENV, flattened);

		var expectedInstructions = [
			new Instructions.put_structure("h", 2, new StoreRef(ENV.X(), 3)), 	// put_structure h/2 X[3],
			new Instructions.set_variable(new StoreRef(ENV.X(), 2)), 			// set_variable X[2],
			new Instructions.set_variable(new StoreRef(ENV.X(), 5)), 			// set_variable X[5],
			new Instructions.put_structure("f", 1, new StoreRef(ENV.X(), 4)), 	// put_structure f/1 X[4],
			new Instructions.set_value(new StoreRef(ENV.X(), 5)), 				// set_value X[5],
			new Instructions.put_structure("p", 3, new StoreRef(ENV.X(), 1)), 	// put_structure p/3 X[1],
			new Instructions.set_value(new StoreRef(ENV.X(), 2)), 				// set_value X[2],
			new Instructions.set_value(new StoreRef(ENV.X(), 3)), 				// set_value X[3],
			new Instructions.set_value(new StoreRef(ENV.X(), 4)) 				// set_value X[4]
		];

		compareInstructionLists(expectedInstructions, queryInstructions);
	});

});

describe("Program Compilation", function(){
	var ENV = null;

	beforeEach(function(){
		ENV = new Structures.Env();	
	});

	/**
	 * The example program from the wambook is: 
	 *		p(f(X), h(Y, f(a)), Y).
	 *
	 * This test hard codes the parsed, flattened version and pipes it into compile.
	 * It then checks the resulting instructions against the known L0 WAM Instructions.
	 **/
	it("should compile the WAMBook example program", function(){
		ENV.X().set(1, new CompleteStructure("p",3,[new StoreRef(ENV.X(),2), new StoreRef(ENV.X(),3), new StoreRef(ENV.X(),4)]));
		ENV.X().set(2, new CompleteStructure("f",1,[new StoreRef(ENV.X(),5)]));
		ENV.X().set(3, new CompleteStructure("h",2,[new StoreRef(ENV.X(),4), new StoreRef(ENV.X(),6)]));
		ENV.X().set(4, new Variable("Y", new StoreRef(ENV.X(),4)));
		ENV.X().set(5, new Variable("X", new StoreRef(ENV.X(),5)));
		ENV.X().set(6, new CompleteStructure("f",1,[new StoreRef(ENV.X(),7)]));
		ENV.X().set(7, new CompleteStructure("a",0,[]));
		flattened = [1,2,3,6,7];
		var programInstructions = Compiler.CompileLoadedProgram(ENV.X(), flattened);

		var expectedInstructions = [
			new Instructions.get_structure("p", 3, new StoreRef(ENV.X(), 1)), 	// get_structure p/3 X[1]
			new Instructions.unify_variable(new StoreRef(ENV.X(), 2)), 			// unify_variable X[2]
			new Instructions.unify_variable(new StoreRef(ENV.X(), 3)), 			// unify_variable X[3]
			new Instructions.unify_variable(new StoreRef(ENV.X(), 4)), 			// unify_variable X[4]
			new Instructions.get_structure("f", 1, new StoreRef(ENV.X(), 2)), 	// get_structure f/1 X[2]
			new Instructions.unify_variable(new StoreRef(ENV.X(), 5)), 			// unify_variable X[5]
			new Instructions.get_structure("h", 2, new StoreRef(ENV.X(), 3)), 	// get_structure h/2 X[3]
			new Instructions.unify_value(new StoreRef(ENV.X(), 4)), 			// unify_value X[4]
			new Instructions.unify_variable(new StoreRef(ENV.X(), 6)), 			// unify_variable X[6]
			new Instructions.get_structure("f", 1, new StoreRef(ENV.X(), 6)), 	// get_structure f/1 X[6]
			new Instructions.unify_variable(new StoreRef(ENV.X(), 7)), 			// unify_variable X[7]
			new Instructions.get_structure("a", 0, new StoreRef(ENV.X(), 7)) 	// get_structure f/1 X[7]
		];

		compareInstructionLists(expectedInstructions, programInstructions);
	});
});

/**
 * Compare two lists of instructions.
 **/
function compareInstructionLists(list_a, list_b) {
	// Ensure the length is the same
	list_a.length.should.equal(list_b.length);

	// Ensure that each instruction is correct.
	for (var i = list_a.length - 1; i >= 0; i--) {
		var expectedInstruction = list_b[i];
		var actualInstruction = list_a[i];
		
		// Make sure they're the same instruction
		actualInstruction.constructor.should.equal(expectedInstruction.constructor);

		// Make sure their params match
		switch(actualInstruction.constructor) {
			case Instructions.put_structure:
			case Instructions.get_structure:
				actualInstruction.symbol.should.equal(expectedInstruction.symbol);
				actualInstruction.arity.should.equal(expectedInstruction.arity);
			case Instructions.set_variable:
			case Instructions.set_value:
			case Instructions.unify_variable:
			case Instructions.unify_value:
				actualInstruction.reference.store.should.equal(expectedInstruction.reference.store);
				actualInstruction.reference.index.should.equal(expectedInstruction.reference.index);
				break ;
			default:
				// fail.
				true.should.equal(false);
		}
	};
}