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
var ENV = new Structures.Env();

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
var flattened = [ 3, 4, 1 ];

/**
 * Compile the argument registers into query instructions
 **/
var queryInstructions = Compiler.CompileLoadedQuery(ENV.X(), flattened);
console.log(ENV.X());
console.log("Query Instructions:");
console.log(queryInstructions);

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
flattened = [1,2,3,6,7];

/**
 * Compile the argument registers into program instructions
 **/
var programInstructions = Compiler.CompileLoadedProgram(ENV.X(), flattened);
console.log(ENV.X());
console.log("Program Instructions:");
console.log(programInstructions);


/**
 * Begin the evaluation by evaluating the QUERY.
 **/
console.log("Evaluate Query");
Instructions.evaluateInstructions(queryInstructions, ENV);
console.log(ENV.X());
console.log(ENV.HEAP());

console.log("Evaluate Program");
try {
	Instructions.evaluateInstructions(programInstructions, ENV);
} catch(e) { console.log("[ERROR] " + e); }
console.log(ENV.X());
console.log(ENV.HEAP());


/**
 * Try to rebuild the term.
 **/
var Utils = require("./lib/utils");
console.log(Utils.rebuildTermFromHeap(new StoreRef(ENV.HEAP(), 8)).inspect());


















