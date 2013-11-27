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
	"fail1":Failure1
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
	/**
	 * Create the X store and HEAP.
	 **/
	var ENV = new Structures.Env();

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
	var flattened = [ 4, 3, 1 ];

	/**
	 * Compile the argument registers into query instructions
	 **/
	var queryInstructions = Compiler.CompileLoadedQuery(ENV, flattened);
	console.log(ENV.X());
	console.log("Query Instructions:");
	console.log(queryInstructions);

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
	var flattened = [ 1,2,3,4 ];

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
	Instructions.evaluateInstructions(queryInstructions, ENV, DEBUG);
	console.log(ENV.X());
	console.log(ENV.HEAP());

	console.log("Evaluate Program");
	try {
		Instructions.evaluateInstructions(programInstructions, ENV, DEBUG);
	} catch(e) { console.log("[ERROR] " + e); process.exit(); }
	console.log(ENV.X());
	console.log(ENV.HEAP());


	/**
	 * Try to rebuild the term.
	 **/
	// Need to hardcode the heap address where the entry point ends up :-(
	var result = Utils.rebuildTermFromHeap(new StoreRef(ENV.HEAP(), 1));

	console.log("\n\nResults: ");
	console.log("Query Term:\t p(Z, h(Z,W), f(W)).");
	console.log("Query Term:\t p(f(X), h(Y, f(a)), Y).");

	// The correct answer should be: p( _H1 )
	console.log("MGU:\t\t " + result.inspect() + ".");

	// Get the variable bindings
	console.log("BINDINGS: ");
	var queryVariables = ENV.getQueryVariableBindings();
	for(var symbol in queryVariables) {
		console.log(symbol + ": " + Utils.rebuildTermFromHeap(queryVariables[symbol]).inspect());
	}
}

/**
 * Try a basic unification of two variables.
 * Query: 			p(A).
 * Program: 		p(Z).
 * Expected Result: P(_H1)
 **/
function UnifyTwoVariables(DEBUG) {
	/**
	 * Create the X store and HEAP.
	 **/
	var ENV = new Structures.Env();

	/**
	 * Parse and Flatten the Query: 
	 * 		?- p(A)
	 *
	 * Currently no code for this step :-(
	 **/
	ENV.X().set(1, new CompleteStructure("p",1,[new StoreRef(ENV.X(),2)]));
	ENV.X().set(2, new Variable("A", new StoreRef(ENV.X(),2)));
	var flattened = [ 1 ];

	/**
	 * Compile the argument registers into query instructions
	 **/
	var queryInstructions = Compiler.CompileLoadedQuery(ENV, flattened);
	console.log(ENV.X());
	console.log("Query Instructions:");
	console.log(queryInstructions);

	/**
	 * Compile and Flatten the Program:
	 *		p(Z).
	 *
	 * Currently no code for this step :-( 
	 **/
	ENV.X().set(1, new CompleteStructure("p",1,[new StoreRef(ENV.X(),2)]));
	ENV.X().set(2, new Variable("Z", new StoreRef(ENV.X(),2)));
	flattened = [1];

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
	Instructions.evaluateInstructions(queryInstructions, ENV, DEBUG);
	console.log(ENV.X());
	console.log(ENV.HEAP());

	console.log("Evaluate Program");
	try {
		Instructions.evaluateInstructions(programInstructions, ENV, DEBUG);
	} catch(e) { console.log("[ERROR] " + e); }
	console.log(ENV.X());
	console.log(ENV.HEAP());


	/**
	 * Try to rebuild the term.
	 **/
	// Need to hardcode the heap address where the entry point ends up :-(
	var result = Utils.rebuildTermFromHeap(new StoreRef(ENV.HEAP(), 1));

	console.log("\n\nResults: ");
	console.log("Query Term:\t p(Z, h(Z,W), f(W)).");
	console.log("Query Term:\t p(f(X), h(Y, f(a)), Y).");

	// The correct answer should be: p( _H1 )
	console.log("MGU:\t\t " + result.inspect() + ".");

	// Get the variable bindings
	console.log("BINDINGS: ");
	var queryVariables = ENV.getQueryVariableBindings();
	for(var symbol in queryVariables) {
		console.log(symbol + ": " + Utils.rebuildTermFromHeap(queryVariables[symbol]).inspect());
	}
} 


/**
 * The wam book example uses:
 * Query: 			p(Z, h(Z,W), f(W)).
 * Program: 		p(f(X), h(Y, f(a)), Y).
 * Expected Result: p(f(f(a)),h(f(f(a)),f(a)),f(f(a))).
 **/
function WamBookExample(DEBUG) {
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
	var queryInstructions = Compiler.CompileLoadedQuery(ENV, flattened);
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
	Instructions.evaluateInstructions(queryInstructions, ENV, DEBUG);
	console.log(ENV.X());
	console.log(ENV.HEAP());

	console.log("Evaluate Program");
	try {
		Instructions.evaluateInstructions(programInstructions, ENV, DEBUG);
	} catch(e) { console.log("[ERROR] " + e); }
	console.log(ENV.X());
	console.log(ENV.HEAP());


	/**
	 * Try to rebuild the term.
	 **/
	// Need to hardcode the heap address where the entry point ends up :-(
	var result = Utils.rebuildTermFromHeap(new StoreRef(ENV.HEAP(), 8));

	console.log("\n\nResults: ");
	console.log("Query Term:\t p(Z, h(Z,W), f(W)).");
	console.log("Query Term:\t p(f(X), h(Y, f(a)), Y).");

	// The correct answer should be: p( f(f(a)), h( f(f(a)),f(a) ), f(f(a)) )
	console.log("MGU:\t\t " + result.inspect() + ".");

	// Get the variable bindings
	console.log("BINDINGS: ");
	var queryVariables = ENV.getQueryVariableBindings();
	for(var symbol in queryVariables) {
		console.log(symbol + ": " + Utils.rebuildTermFromHeap(queryVariables[symbol]).inspect());
	}
}



















