#!/usr/bin/env node

/**
 * Load the Structures.
 **/
var Structures          = require("./lib/structures");
var StoreRef            = Structures.StoreRef;
var CompleteStructure   = Structures.CompleteStructure;
var Variable   			= Structures.Variable;
var Utils 				= require("./lib/utils");

/** 
 * Load the Instructions.
 **/
var Instructions = require("./lib/instructions");

/**
 * Load Compiler
 **/
var Compiler = require("./lib/compilers");

var DEBUG = false;
var exampleNames = {
	"main":WamBookExample,
	"2var":UnifyTwoVariables,
	"fail1":Failure1,
	"vi":VariableIndependance,
	"put_value":PutValueTest,
	"put_value_fail":PutValueFailTest,
	"deep_nesting":DeepNestingTest
};

/**
 * Check the args
 **/
if(process.argv.length === 2) {
	printUsage();
} else if(process.argv.length >= 3) {
	if(exampleNames[process.argv[2]]) {
		exampleNames[process.argv[2]](process.argv[3] === "debug");
	} else {
		console.log("Program "+process.argv[2]+" not found.");
		printUsage();
		process.exit();
	}
}

function printUsage() {
	console.log("Usage: node main.js <example> [debug]");
	console.log("Current Examples:");
	for (var i = Object.keys(exampleNames).length - 1; i >= 0; i--) {
		console.log("\t" + Object.keys(exampleNames)[i]);
	};
	process.exit();
}

/**
 * Try unifying terms that dont unify.
 * Query: 			p(A,f(b)).
 * Program: 		p(b, f(c)).
 * Expected Result: failure on b/0 and c/0
 **/
function Failure1(DEBUG) {

	console.log("Query Term:\t p(A,f(b)).");
	console.log("Program Term:\t p(b,f(c)).");
	var ENV = Utils.BuildAndRun(
		DEBUG, 
		// Prepare the query
		function(ENV){
			/**
			 * Parse and Flatten the Query: 
			 * 		?- p(A,f(b)).
			 *
			 * Currently no code for this step :-(
			 **/
			ENV.X().set(1, new Variable("A", new StoreRef(ENV.X(),2))); 									// A1 = A
			ENV.X().set(2, new CompleteStructure("f",1,[new StoreRef(ENV.X(), 3)]));  						// A2 = f(X3)
			ENV.X().set(3, new CompleteStructure("b",0,[]));  												// X3 = b
			return new CompleteStructure("p", 2,[ new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2) ]);
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Compile and Flatten the Program:
			 *		p(b, f(c)).
			 *
			 * Currently no code for this step :-( 
			 **/
			ENV.X().set(1, new CompleteStructure("b",0,[]));													// A1 = b/0
			ENV.X().set(2, new CompleteStructure("f",1,[ new StoreRef(ENV.X(), 3) ]));							// A2 = f(X3)
			ENV.X().set(3, new CompleteStructure("c",0,[]));													// X3 = c/0

			return [
				new CompleteStructure("p", 2, [ new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2)])
			];
		}
	);
}

/**
 * Try unifying terms that shows that variable names are scoped only to the query.
 * Query: 			p(a, b, X).
 * Program: 		p(X, b, c).
 * Expected Result: X = c
 **/
function VariableIndependance(DEBUG) {

	console.log("Query Term:\t p(a, b, X).");
	console.log("Program Term:\t p(X, b, c).");
	var ENV = Utils.BuildAndRun(
		DEBUG, 
		// Prepare the query
		function(ENV){
			/**
			 * Parse and Flatten the Query: 
			 * 		?- p(a, b, X).
			 *
			 * Currently no code for this step :-(
			 **/
			ENV.X().set(1, new CompleteStructure("a",0,[])); 													// A1 = a
			ENV.X().set(2, new CompleteStructure("b",0,[]));													// A2 = b
			ENV.X().set(3, new Variable("X", new StoreRef(ENV.X(), 3)));										// A3 = X
			return new CompleteStructure("p", 3,[new StoreRef(ENV.X(), 1),new StoreRef(ENV.X(), 2),new StoreRef(ENV.X(), 3)]);
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Compile and Flatten the Program:
			 *		p(X, b, c).
			 *
			 * Currently no code for this step :-( 
			 **/
			ENV.X().set(1, new Variable("X", new StoreRef(ENV.X(), 4))); 										// A1 = X [X4]
			ENV.X().set(2, new CompleteStructure("b",0, []));													// A2 = b/0 
			ENV.X().set(3, new CompleteStructure("c",0, []));													// A3 = c/0
			ENV.X().set(4, new Variable("X", new StoreRef(ENV.X(), 4))); 										// X4 = X

			return [
				new CompleteStructure("p", 3, [new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2), new StoreRef(ENV.X(), 3)])
			];
		}
	);
}

/**
 * Try a basic unification of two variables.
 * Query: 			p(A).
 * Program: 		p(Z).
 * Expected Result: P(_H1)
 **/
function UnifyTwoVariables(DEBUG) {
	
	console.log("Query Term:\t p(A).");
	console.log("Program Term:\t p(Z).");
	var ENV = Utils.BuildAndRun(
		DEBUG, 
		// Prepare the query
		function(ENV){
			/**
			 * Parse and Flatten the Query: 
			 * 		?- p(A)
			 *
			 * Currently no code for this step :-(
			 **/
			ENV.X().set(1, new Variable("A", new StoreRef(ENV.X(),1))); 										// A1 = A
			return new CompleteStructure("p", 1,[new StoreRef(ENV.X(), 1)]);
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Compile and Flatten the Program:
			 *		p(Z).
			 *
			 * Currently no code for this step :-( 
			 **/
			ENV.X().set(1, new Variable("Z", new StoreRef(ENV.X(),1)));											// A1 = Z
			return [ 
				new CompleteStructure("p", 1,[new StoreRef(ENV.X(), 1)])
			];
		}
	);
} 


/**
 * The wam book example uses:
 * Query: 			p(Z, h(Z,W), f(W)).
 * Program: 		p(f(X), h(Y, f(a)), Y).
 * Expected Result: p(f(f(a)),h(f(f(a)),f(a)),f(f(a))).
 **/
function WamBookExample(DEBUG) {

	console.log("Query Term:\t p(Z, h(Z,W), f(W)).");
	console.log("Program Term:\t p(f(X), h(Y, f(a)), Y).");
	var ENV = Utils.BuildAndRun(
		DEBUG, 
		// Prepare the query
		function(ENV){
			/**
			 * Parse and Flatten the Query: 
			 * 		?- p(Z, h(Z,W), f(W)).
			 *
			 * Currently no code for this step :-(
			 **/
			ENV.X().set(1, new Variable("Z", new StoreRef(ENV.X(),1)));											// A1 = Z
			ENV.X().set(2, new CompleteStructure("h",2,[new StoreRef(ENV.X(),1), new StoreRef(ENV.X(),4)]));	// A2 = h(A1, X4)
			ENV.X().set(3, new CompleteStructure("f",1,[new StoreRef(ENV.X(),4)]));								// A3 = f(X4)
			ENV.X().set(4, new Variable("W", new StoreRef(ENV.X(),4)));											// X4 = W
			return new CompleteStructure("p", 3, [new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2), new StoreRef(ENV.X(), 3)]);
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Compile and Flatten the Program:
			 *		p(f(X), h(Y, f(a)), Y).
			 *
			 * Currently no code for this step :-( 
			 **/
			ENV.X().set(1, new CompleteStructure("f",1,[new StoreRef(ENV.X(),4)]));								// A1 = f(X4)
			ENV.X().set(2, new CompleteStructure("h",2,[new StoreRef(ENV.X(),5), new StoreRef(ENV.X(),6)]));	// A2 = h(X5, X6)
			ENV.X().set(3, new Variable("Y", new StoreRef(ENV.X(),5)));											// A3 = Y [X5]
			ENV.X().set(4, new Variable("X", new StoreRef(ENV.X(),4)));											// X4 = X
			ENV.X().set(5, new Variable("Y", new StoreRef(ENV.X(),5)));											// X5 = Y
			ENV.X().set(6, new CompleteStructure("f",1,[new StoreRef(ENV.X(), 7)]));							// X6 = F(X7)
			ENV.X().set(7, new CompleteStructure("a",0,[]));													// X7 = a/0
			return [
				new CompleteStructure("p", 3, [new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2), new StoreRef(ENV.X(), 3)])
			];
		}
	);
}

/**
 * A test to make sure that put_value instruction is used correctly.
 * Query: 			p(A, b, A).
 * Program: 		p(c, B, c).
 * Expected Result: p(c, b, c).
 **/
function PutValueTest(DEBUG) {
	console.log("Query Term:\t p(A, b, A).");
	console.log("Program Term:\t p(c, B, c).");
	var ENV = Utils.BuildAndRun(
		DEBUG, 
		// Prepare the query
		function(ENV){
			/**
			 * Query:
			 * ?- p(A, b, A).
			 **/
			ENV.X().set(1, new Variable("A", new StoreRef(ENV.X(), 1))); 									// A1 = A
			ENV.X().set(2, new CompleteStructure("b", 0, [])); 												// A2 = b/0
			ENV.X().set(3, new Variable("A", new StoreRef(ENV.X(), 1))); 									// A3 = A [A1]
			return new CompleteStructure("p", 3, [new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2), new StoreRef(ENV.X(), 3)]);
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Program has only one fact:
			 *		p(c, B, c).
			 **/
			ENV.X().set(1, new CompleteStructure("c", 0, [])); 												// A1 = c/0
			ENV.X().set(2, new Variable("B", new StoreRef(ENV.X(), 2))); 									// A2 = B
			ENV.X().set(3, new CompleteStructure("c", 0, [])); 												// A3 = c/0
			return [
				new CompleteStructure("p", 3, [new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2), new StoreRef(ENV.X(), 3)])
			];
		}
	);
}

/**
 * A test to make sure that put_value instruction is used correctly (by failing correctly.
 * Query: 			p(A, b, A).
 * Program: 		p(c, B, d).
 * Expected Result: Failure c/0 expected d/0.
 **/
function PutValueFailTest(DEBUG) {
	console.log("Query Term:\t p(A, b, A).");
	console.log("Program Term:\t p(c, B, c).");
	var ENV = Utils.BuildAndRun(
		DEBUG, 
		// Prepare the query
		function(ENV){
			/**
			 * Query:
			 * ?- p(A, b, A).
			 **/
			ENV.X().set(1, new Variable("A", new StoreRef(ENV.X(), 1))); 									// A1 = A
			ENV.X().set(2, new CompleteStructure("b", 0, [])); 												// A2 = b/0
			ENV.X().set(3, new Variable("A", new StoreRef(ENV.X(), 1))); 									// A3 = A [A1]
			return new CompleteStructure("p", 3, [new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2), new StoreRef(ENV.X(), 3)]);
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Program has only one fact:
			 *		p(c, B, c).
			 **/
			ENV.X().set(1, new CompleteStructure("c", 0, [])); 												// A1 = c/0
			ENV.X().set(2, new Variable("B", new StoreRef(ENV.X(), 2))); 									// A2 = B
			ENV.X().set(3, new CompleteStructure("d", 0, [])); 												// A3 = c/0
			return [
				new CompleteStructure("p", 3, [new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2), new StoreRef(ENV.X(), 3)])
			];
		}
	);
}
	
/**
 * A test to make sure that deeply nested fields dont affect the compilers.
 * Query: 			p(a(b(c(d(e)))), B).
 * Program: 		p(X, a(b(c(d)))).
 * Expected Result: Success, B = a(b(c(d)))
 **/
function DeepNestingTest(DEBUG) {
	console.log("Query Term:\t p(a(b(c(d(e)))), B).");
	console.log("Program Term:\t p(X, a(b(c(d)))).");
	var ENV = Utils.BuildAndRun(
		DEBUG, 
		// Prepare the query
		function(ENV){
			ENV.X().set(1, new CompleteStructure("a", 1, [ new StoreRef(ENV.X(), 3) ])); 					// A1 = a(X3)
			ENV.X().set(2, new Variable("B", new StoreRef(ENV.X(), 2))); 									// A2 = B
			ENV.X().set(3, new CompleteStructure("b", 1, [ new StoreRef(ENV.X(), 4) ])); 					// X3 = b(X4)
			ENV.X().set(4, new CompleteStructure("c", 1, [ new StoreRef(ENV.X(), 5) ])); 					// X4 = c(X5)
			ENV.X().set(5, new CompleteStructure("d", 1, [ new StoreRef(ENV.X(), 6) ])); 					// X5 = d(X6)
			ENV.X().set(6, new CompleteStructure("e", 0, [])); 												// X6 = e/0
			return new CompleteStructure("p", 2, [new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2)]);
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Program has only one fact:
			 *		p(X, a(b(c(d)))).
			 **/
			ENV.X().set(1, new Variable("X", new StoreRef(ENV.X(), 1) ));	 								// A1 = X
			ENV.X().set(2, new CompleteStructure("a", 1, [ new StoreRef(ENV.X(), 3) ])); 					// A2 = a(X3)
			ENV.X().set(3, new CompleteStructure("b", 1, [ new StoreRef(ENV.X(), 4) ])); 					// X3 = b(X4)
			ENV.X().set(4, new CompleteStructure("c", 1, [ new StoreRef(ENV.X(), 5) ])); 					// X4 = c(X5)
			ENV.X().set(5, new CompleteStructure("d", 0, [ ])); 											// X5 = d/0

			return [
				new CompleteStructure("p", 2, [new StoreRef(ENV.X(), 1), new StoreRef(ENV.X(), 2)])
			];
		}
	);
}









