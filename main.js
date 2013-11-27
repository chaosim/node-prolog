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
	"vi":VariableIndependance
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
			ENV.X().set(1, new CompleteStructure("p",2,[new StoreRef(ENV.X(),2), new StoreRef(ENV.X(), 3)]));
			ENV.X().set(2, new Variable("A", new StoreRef(ENV.X(),2)));
			ENV.X().set(3, new CompleteStructure("f",1,[new StoreRef(ENV.X(), 4)]));
			ENV.X().set(4, new CompleteStructure("b",0,[]));
			return [ 4, 3, 1 ]; // return the flattened register order.
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Compile and Flatten the Program:
			 *		p(b, f(c)).
			 *
			 * Currently no code for this step :-( 
			 **/
			ENV.X().set(1, new CompleteStructure("p",2,[new StoreRef(ENV.X(),2), new StoreRef(ENV.X(), 3)]));
			ENV.X().set(2, new CompleteStructure("b",0,[]));
			ENV.X().set(3, new CompleteStructure("f",1,[new StoreRef(ENV.X(), 4)]));
			ENV.X().set(4, new CompleteStructure("c",0,[]));
			return [ 1,2,3,4 ];
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
			ENV.X().set(1, new CompleteStructure("p",3,[new StoreRef(ENV.X(),2), new StoreRef(ENV.X(), 3), new StoreRef(ENV.X(), 4)]));
			ENV.X().set(2, new CompleteStructure("a",0,[]));
			ENV.X().set(3, new CompleteStructure("b",0,[]));
			ENV.X().set(4, new Variable("X"));
			return [ 3, 2, 1 ]; // return the flattened register order.
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Compile and Flatten the Program:
			 *		p(X, b, c).
			 *
			 * Currently no code for this step :-( 
			 **/
			ENV.X().set(1, new CompleteStructure("p",3, [new StoreRef(ENV.X(),2), new StoreRef(ENV.X(),3), new StoreRef(ENV.X(),4)]));
			ENV.X().set(2, new Variable("X"));
			ENV.X().set(3, new CompleteStructure("b",0,[]));
			ENV.X().set(4, new CompleteStructure("c",0,[]));
			return [ 1,3,4 ];
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
			ENV.X().set(1, new CompleteStructure("p",1,[new StoreRef(ENV.X(),2)]));
			ENV.X().set(2, new Variable("A", new StoreRef(ENV.X(),2)));
			return [ 1 ];
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Compile and Flatten the Program:
			 *		p(Z).
			 *
			 * Currently no code for this step :-( 
			 **/
			ENV.X().set(1, new CompleteStructure("p",1,[new StoreRef(ENV.X(),2)]));
			ENV.X().set(2, new Variable("Z", new StoreRef(ENV.X(),2)));
			return [1];
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
			ENV.X().set(1, new CompleteStructure("p",3,[new StoreRef(ENV.X(),2), new StoreRef(ENV.X(),3), new StoreRef(ENV.X(),4)]));
			ENV.X().set(2, new Variable("Z", new StoreRef(ENV.X(),2)));
			ENV.X().set(3, new CompleteStructure("h", 2, [new StoreRef(ENV.X(),2), new StoreRef(ENV.X(),5)]));
			ENV.X().set(4, new CompleteStructure("f", 1, [new StoreRef(ENV.X(),5)]));
			ENV.X().set(5, new Variable("W", new StoreRef(ENV.X(),5)));
			return [ 3, 4, 1 ];
		},
		// Prepare the program.
		function(ENV){
			/**
			 * Compile and Flatten the Program:
			 *		p(f(X), h(Y, f(a)), Y).
			 *
			 * Currently no code for this step :-( 
			 **/
			ENV.X().set(1, new CompleteStructure("p",3,[new StoreRef(ENV.X(),2), new StoreRef(ENV.X(),3), new StoreRef(ENV.X(),4)]));
			ENV.X().set(2, new CompleteStructure("f",1,[new StoreRef(ENV.X(),5)]));
			ENV.X().set(3, new CompleteStructure("h",2,[new StoreRef(ENV.X(),4), new StoreRef(ENV.X(),6)]));
			ENV.X().set(4, new Variable("Y", new StoreRef(ENV.X(),4)));
			ENV.X().set(5, new Variable("X", new StoreRef(ENV.X(),5)));
			ENV.X().set(6, new CompleteStructure("f",1,[new StoreRef(ENV.X(),7)]));
			ENV.X().set(7, new CompleteStructure("a",0,[]));
			return [1,2,3,6,7];
		}
	);
}



















