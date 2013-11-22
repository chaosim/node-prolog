/**
 * Load the Structures.
 **/
var Structures          = require("./lib/structures");
var StoreRef            = Structures.StoreRef;
var CompleteStructure   = Structures.CompleteStructure;
var Variable   			= Structures.Variable;

/** 
 * Load the Instructions.
 **/
var Instructions = require("./lib/instructions");

/**
 * Load Compiler
 **/
var Compiler = require("./lib/compilers");

/**
 * Create the X store and HEAP.
 **/
var X = new Structures.X();
var HEAP = new Structures.Heap();

/**
 * Parse and Flatten the Query: 
 * 		?- p(Z, h(Z,W), f(W)).
 *
 * Currently no code for this step :-(
 **/
X.set(1, new CompleteStructure("p",3,[new StoreRef(X,2), new StoreRef(X,3), new StoreRef(X,4)]));
X.set(2, new Variable("Z", new StoreRef(X,2)));
X.set(3, new CompleteStructure("h", 2, [new StoreRef(X,2), new StoreRef(X,5)]));
X.set(4, new CompleteStructure("f", 1, [new StoreRef(X,5)]));
X.set(5, new Variable("W", new StoreRef(X,5)));
var flattened = [ 3, 4, 1 ];

/**
 * Compile the argument registers into query instructions
 **/
var queryInstructions = Compiler.CompileLoadedQuery(X, flattened);
console.log(X);
console.log("Query Instructions:");
console.log(queryInstructions);

/**
 * Compile and Flatten the Program:
 *		p(f(X), h(Y, f(a)), Y).
 *
 * Currently no code for this step :-( 
 **/
X.set(1, new CompleteStructure("p",3,[new StoreRef(X,2), new StoreRef(X,3), new StoreRef(X,4)]));
X.set(2, new CompleteStructure("f",1,[new StoreRef(X,5)]));
X.set(3, new CompleteStructure("h",2,[new StoreRef(X,4), new StoreRef(X,6)]));
X.set(4, new Variable("Y", new StoreRef(X,4)));
X.set(5, new Variable("X", new StoreRef(X,5)));
X.set(6, new CompleteStructure("f",1,[new StoreRef(X,7)]));
X.set(7, new CompleteStructure("a",0,[]));
flattened = [1,2,3,6,7];

/**
 * Compile the argument registers into program instructions
 **/
var programInstructions = Compiler.CompileLoadedProgram(X, flattened);
console.log(X);
console.log("Program Instructions:");
console.log(programInstructions);


/**
 * Begin the evaluation by evaluating the QUERY.
 **/
console.log("Evaluate Query");
Instructions.evaluateInstructions(queryInstructions, HEAP, X);
console.log(X);
console.log(HEAP);

console.log("Evaluate Program");
try {
	Instructions.evaluateInstructions(programInstructions, HEAP, X);
} catch(e) { console.log("[ERROR] " + e); }
console.log(X);
console.log(HEAP);



















