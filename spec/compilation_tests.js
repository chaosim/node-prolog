/**
 * Load the Structures.
 **/
var Structures          = require("../lib/structures");
var StoreRef            = Structures.StoreRef;
var CompleteStructure   = Structures.CompleteStructure;
var Variable   			= Structures.Variable;
var Utils 				= require("../lib/utils");

/** 
 * Load the Instructions.
 **/
var Instructions = require("../lib/instructions");

/**
 * Load Compiler
 **/
var Compiler = require("../lib/compilers");

/**
 * For Testing
 **/
var should = require("should");

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
		var queryInstructions = Compiler.CompileLoadedQuery(ENV.X(), flattened);

		var expectedInstructions = [
			new Instructions.put_structure("h", 2, new StoreRef(ENV.X(), 3)), // put_structure h/2 X[3],
			new Instructions.set_variable(new StoreRef(ENV.X(), 2)), // set_variable X[2],
			new Instructions.set_variable(new StoreRef(ENV.X(), 5)), // set_variable X[5],
			new Instructions.put_structure("f", 1, new StoreRef(ENV.X(), 4)), // put_structure f/1 X[4],
			new Instructions.set_value(new StoreRef(ENV.X(), 5)), // set_value X[5],
			new Instructions.put_structure("p", 3, new StoreRef(ENV.X(), 1)), // put_structure p/3 X[1],
			new Instructions.set_value(new StoreRef(ENV.X(), 2)), // set_value X[2],
			new Instructions.set_value(new StoreRef(ENV.X(), 3)), // set_value X[3],
			new Instructions.set_value(new StoreRef(ENV.X(), 4)) // set_value X[4]
		];

		// Ensure the length is the same
		queryInstructions.length.should.equal(expectedInstructions.length);

		// Ensure that each instruction is correct.
		for (var i = queryInstructions.length - 1; i >= 0; i--) {
			var expectedInstruction = expectedInstructions[i];
			var actualInstruction = queryInstructions[i];
			
			// Make sure they're the same instruction
			actualInstruction.constructor.should.equal(expectedInstruction.constructor);

			// Make sure their params match
			switch(actualInstruction.constructor) {
				case Instructions.put_structure:
					actualInstruction.symbol.should.equal(expectedInstruction.symbol);
					actualInstruction.arity.should.equal(expectedInstruction.arity);
				case Instructions.set_variable:
				case Instructions.set_value:
					actualInstruction.reference.store.should.equal(expectedInstruction.reference.store);
					actualInstruction.reference.index.should.equal(expectedInstruction.reference.index);
					break ;
				default:
					// fail.
					true.should.equal(false);
			}
		};
	});

});