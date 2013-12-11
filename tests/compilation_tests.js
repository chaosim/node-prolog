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
describe("L1 Compiler", function(){
	/**
	 * A Test Suite for The L0 WAM Query Compilation.
	 **/
	// TODO: Write more tests to involve the use of put_value (i.e. a query atom with the same variable twice in the arg registers)
	// TODO: add more tests with nesting in the arguemnts (i.e. p(a(b(c,d))))
	// TODO: Add some test for error tolerance (i.e. dont pass a query atom)
	describe("Query Compiler", function(){
		var ENV = null;

		beforeEach(function(){
			ENV = new Structures.Env();	
		});

		/** 
		 * The Failure1 Query is: 
		 * 		?- p(A,f(b)).
		 **/
		it("should compile the Failure1 query", function(){
			ENV.X().set(1, new Variable("A", new StoreRef(ENV.X(),1))); 									// A1 = A
			ENV.X().set(2, new CompleteStructure("f",1,[new StoreRef(ENV.X(), 3)]));  						// A2 = f(X3)
			ENV.X().set(3, new CompleteStructure("b",0,[]));  												// X3 = b

			var queryInstructions = Compiler.CompileLoadedQuery(
				ENV, 
				new CompleteStructure(
					"p", 2,
					[
						new StoreRef(ENV.X(), 1),
						new StoreRef(ENV.X(), 2)
					]
				)
			);

			queryInstructions = ENV.CODE().splice(queryInstructions[0], queryInstructions[1]);

			var expectedInstructions = [
				new Instructions.put_variable(new StoreRef(ENV.X(), 3), new StoreRef(ENV.X(), 1)),			// put_variable X3 A1
				new Instructions.put_structure("f", 1, new StoreRef(ENV.X(), 2)),							// put_structure f/1 A2
				new Instructions.put_structure("b", 0, new StoreRef(ENV.X(), 3)),							// put_structure b/0 X3
				new Instructions.control_call("p", 2) 														// call p/2
			];

			compareInstructionLists(expectedInstructions, queryInstructions);
		});

		/** 
		 * The VariableIndependance Query is: 
		 * 		?- p(a, b, X).
		 **/
		it("should compile the VariableIndependance query", function(){
			ENV.X().set(1, new CompleteStructure("a",0,[])); 													// A1 = a
			ENV.X().set(2, new CompleteStructure("b",0,[]));													// A2 = b
			ENV.X().set(3, new Variable("X"));																	// A3 = X

			var queryInstructions = Compiler.CompileLoadedQuery(
				ENV,
				new CompleteStructure(
					"p", 3,
					[
						new StoreRef(ENV.X(), 1),
						new StoreRef(ENV.X(), 2),
						new StoreRef(ENV.X(), 3)
					]
				)
			);

			queryInstructions = ENV.CODE().splice(queryInstructions[0], queryInstructions[1]);

			var expectedInstructions = [
				new Instructions.put_structure("a", 0, new StoreRef(ENV.X(), 1)), 								// put_structure a/0 A1
				new Instructions.put_structure("b", 0, new StoreRef(ENV.X(), 2)), 								// put_structure b/0 A2
				new Instructions.put_variable(new StoreRef(ENV.X(), 4), new StoreRef(ENV.X(), 3)),				// put_variable X4 A3
				new Instructions.control_call("p", 3) 															// call p/3
			];

			compareInstructionLists(expectedInstructions, queryInstructions);
		});

		/** 
		 * The UnifyTwoVariables Query is: 
		 * 		?- p(A).
		 **/
		it("should compile the UnifyTwoVariables query", function(){
			ENV.X().set(1, new Variable("A", new StoreRef(ENV.X(),1))); 										// A1 = A

			var queryInstructions = Compiler.CompileLoadedQuery(
				ENV, 
				new CompleteStructure(
					"p", 1,
					[
						new StoreRef(ENV.X(), 1)
					]
				)
			);

			queryInstructions = ENV.CODE().splice(queryInstructions[0], queryInstructions[1]);

			var expectedInstructions = [
				new Instructions.put_variable(new StoreRef(ENV.X(), 2), new StoreRef(ENV.X(), 1)), 				// put_variable X2 A1
				new Instructions.control_call("p", 1) 															// call p/1
			];

			compareInstructionLists(expectedInstructions, queryInstructions);
		});

		/**
		 * The example query from the wambook is: 
		 *		?- p(Z, h(Z,W), f(W)).
		 **/
		it("should compile the WAMBook example query", function(){
			ENV.X().set(1, new Variable("Z", new StoreRef(ENV.X(),1)));											// A1 = Z
			ENV.X().set(2, new CompleteStructure("h",2,[new StoreRef(ENV.X(),1), new StoreRef(ENV.X(),4)]));	// A2 = h(A1, X4)
			ENV.X().set(3, new CompleteStructure("f",1,[new StoreRef(ENV.X(),4)]));								// A3 = f(X4)
			ENV.X().set(4, new Variable("W", new StoreRef(ENV.X(),4)));											// X4 = W
			
			var queryInstructions = Compiler.CompileLoadedQuery(
				ENV, 
				new CompleteStructure(
					"p", 3, 
					[
						new StoreRef(ENV.X(), 1),
						new StoreRef(ENV.X(), 2),
						new StoreRef(ENV.X(), 3)
					]
				)
			);

			queryInstructions = ENV.CODE().splice(queryInstructions[0], queryInstructions[1]);

			var expectedInstructions = [
				new Instructions.put_variable(new StoreRef(ENV.X(), 4), new StoreRef(ENV.X(), 1)), 				// put_variable X4 A1
				new Instructions.put_structure("h", 2, new StoreRef(ENV.X(), 2)), 								// put_structure h/2 A2
				new Instructions.set_value(new StoreRef(ENV.X(), 4)), 											// set_value X4
				new Instructions.set_variable(new StoreRef(ENV.X(), 5)), 										// set_variable X5
				new Instructions.put_structure("f", 1, new StoreRef(ENV.X(), 3)), 								// put_structure f/1 A3
				new Instructions.set_value(new StoreRef(ENV.X(), 5)), 											// set_value X5
				new Instructions.control_call("p", 3)															// call p/3
			];

			compareInstructionLists(expectedInstructions, queryInstructions);
		});

	});

	/**
	 * A Test Suite for The L0 WAM Program Compilation.
	 **/
	// TODO: Add tests for compiling multiple facts
	describe("Program Compiler", function(){
		var ENV = null;

		beforeEach(function(){
			ENV = new Structures.Env();	
		});

		/** 
		 * The Failure1 Program is: 
		 * 		p(b,f(c)).
		 **/
		it("should compile the Failure1 program", function(){

			ENV.X().set(1, new CompleteStructure("b",0,[]));													// A1 = b/0
			ENV.X().set(2, new CompleteStructure("f",1,[ new StoreRef(ENV.X(), 3) ]));							// A2 = f(X3)
			ENV.X().set(3, new CompleteStructure("c",0,[]));													// X3 = c/0

			var programInstructionBounds = Compiler.CompileLoadedFact(
				ENV, 
				new CompleteStructure(
					"p", 2, 
					[
						new StoreRef(ENV.X(), 1),
						new StoreRef(ENV.X(), 2)
					]
				)
			);

			// Make sure something is returned
			programInstructionBounds.constructor.should.equal(Array);

			// Check that the label is correct
			ENV.CODE().indexOfLabel("p/2").should.equal(programInstructionBounds[0]);

			// check the actual instructions
			var programInstructions = ENV.CODE().splice(programInstructionBounds);

			var expectedInstructions = [
				new Instructions.get_structure("b", 0, new StoreRef(ENV.X(), 1)), 								// get_structure b/0 A1
				new Instructions.get_structure("f", 1, new StoreRef(ENV.X(), 2)), 								// get_structure f/1 A2
				new Instructions.unify_variable(new StoreRef(ENV.X(), 3)), 										// unify_variable X3
				new Instructions.get_structure("c", 0, new StoreRef(ENV.X(), 3)), 								// get_structure c/0 X3
				new Instructions.proceed()	 																	// proceed
			];

			compareInstructionLists(expectedInstructions, programInstructions);
		});

		/** 
		 * The VariableIndependance Program is: 
		 * 		p(X, b, c).
		 **/
		it("should compile the VariableIndependance program", function(){

			ENV.X().set(1, new Variable("X", new StoreRef(ENV.X(), 4))); 										// A1 = X [X4]
			ENV.X().set(2, new CompleteStructure("b",0, []));													// A2 = b/0 
			ENV.X().set(3, new CompleteStructure("c",0, []));													// A3 = c/0
			ENV.X().set(4, new Variable("X", new StoreRef(ENV.X(), 4))); 										// X4 = X

			var programInstructionBounds = Compiler.CompileLoadedFact(
				ENV, 
				new CompleteStructure(
					"p", 3, 
					[
						new StoreRef(ENV.X(), 1),
						new StoreRef(ENV.X(), 2),
						new StoreRef(ENV.X(), 3)
					]
				)
			);

			// Make sure something is returned
			programInstructionBounds.constructor.should.equal(Array);

			// Check that the label is correct
			ENV.CODE().indexOfLabel("p/3").should.equal(programInstructionBounds[0]);

			// check the actual instructions
			var programInstructions = ENV.CODE().splice(programInstructionBounds);

			var expectedInstructions = [
				new Instructions.get_variable(new StoreRef(ENV.X(), 4), new StoreRef(ENV.X(), 1)), 				// get_variable X4 A1
				new Instructions.get_structure("b", 0, new StoreRef(ENV.X(), 2)), 								// get_structure b/0 A2
				new Instructions.get_structure("c", 0, new StoreRef(ENV.X(), 3)), 								// get_structure c/0 A3
				new Instructions.proceed() 																		// proceed
			];

			compareInstructionLists(expectedInstructions, programInstructions);
		});

		/** 
		 * The UnifyTwoVariables Program is: 
		 * 		p(Z).
		 **/
		it("should compile the UnifyTwoVariables program", function(){
			ENV.X().set(1, new Variable("Z", new StoreRef(ENV.X(),1)));											// A1 = Z

			var programInstructionBounds = Compiler.CompileLoadedFact(
				ENV, 
				new CompleteStructure(
					"p", 1,
					[
						new StoreRef(ENV.X(), 1)
					]
				)
			);

			// Make sure something is returned
			programInstructionBounds.constructor.should.equal(Array);

			// Check that the label is correct
			ENV.CODE().indexOfLabel("p/1").should.equal(programInstructionBounds[0]);

			// check the actual instructions
			var programInstructions = ENV.CODE().splice(programInstructionBounds);

			var expectedInstructions = [
				new Instructions.get_variable(new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 1)), 				// get_variable A1 X1
				new Instructions.proceed() 																		// proceed
			];

			compareInstructionLists(expectedInstructions, programInstructions);
		});

		/**
		 * The example program from the wambook is: 
		 *		p(f(X), h(Y, f(a)), Y).
		 **/
		it("should compile the WAMBook example program", function(){
			ENV.X().set(1, new CompleteStructure("f",1,[new StoreRef(ENV.X(),4)]));								// A1 = f(X4)
			ENV.X().set(2, new CompleteStructure("h",2,[new StoreRef(ENV.X(),5), new StoreRef(ENV.X(),6)]));	// A2 = h(X5, X6)
			ENV.X().set(3, new Variable("Y", new StoreRef(ENV.X(),5)));											// A3 = Y [X5]
			ENV.X().set(4, new Variable("X", new StoreRef(ENV.X(),4)));											// X4 = X
			ENV.X().set(5, new Variable("Y", new StoreRef(ENV.X(),5)));											// X5 = Y
			ENV.X().set(6, new CompleteStructure("f",1,[new StoreRef(ENV.X(), 7)]));							// X6 = F(X7)
			ENV.X().set(7, new CompleteStructure("a",0,[]));													// X7 = a/0

			var programInstructionBounds = Compiler.CompileLoadedFact(
				ENV, 
				new CompleteStructure(
					"p", 3, 
					[
						new StoreRef(ENV.X(), 1),
						new StoreRef(ENV.X(), 2),
						new StoreRef(ENV.X(), 3)
					]
				)
			);

			// Make sure something is returned
			programInstructionBounds.constructor.should.equal(Array);

			// Check that the label is correct
			ENV.CODE().indexOfLabel("p/3").should.equal(programInstructionBounds[0]);

			// check the actual instructions
			var programInstructions = ENV.CODE().splice(programInstructionBounds);

			var expectedInstructions = [
				new Instructions.get_structure("f", 1, new StoreRef(ENV.X(), 1)), 								// get_structure f/1 A1
				new Instructions.unify_variable(new StoreRef(ENV.X(), 4)), 										// unify_variable X4
				new Instructions.get_structure("h", 2, new StoreRef(ENV.X(), 2)), 								// get_structure h/2 A2
				new Instructions.unify_variable(new StoreRef(ENV.X(), 5)), 										// unify_variable X5
				new Instructions.unify_variable(new StoreRef(ENV.X(), 6)), 										// unify_variable X6
				new Instructions.get_value(new StoreRef(ENV.X(), 5), new StoreRef(ENV.X(), 3)), 				// get_value X5 A3
				new Instructions.get_structure("f", 1, new StoreRef(ENV.X(), 6)), 								// get_structure f/1 X6
				new Instructions.unify_variable(new StoreRef(ENV.X(), 7)), 										// unify_variable X7
				new Instructions.get_structure("a", 0, new StoreRef(ENV.X(), 7)), 								// get_structure a/0 X7
				new Instructions.proceed()		 																// proceed
			];

			compareInstructionLists(expectedInstructions, programInstructions);
		});
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
			case Instructions.put_variable:
			case Instructions.put_value:
			case Instructions.get_variable:
			case Instructions.get_value:
				actualInstruction.xn.store.should.equal(expectedInstruction.xn.store);
				actualInstruction.xn.index.should.equal(expectedInstruction.xn.index);
				actualInstruction.ai.store.should.equal(expectedInstruction.ai.store);
				actualInstruction.ai.index.should.equal(expectedInstruction.ai.index);
				break ;
			case Instructions.control_call:
				actualInstruction.predicate.should.equal(expectedInstruction.predicate);
				actualInstruction.arity.should.equal(expectedInstruction.arity);
				break ;
			case Instructions.proceed:
				break ;
			default:
				// fail.
				true.should.equal(false);
		}
	};
}