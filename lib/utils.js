var Structures 			= require("./structures");
var HeapCell            = Structures.HeapCell;
var StructureCell       = Structures.StructureCell;
var StoreRef            = Structures.StoreRef;
var CompleteStructure   = Structures.CompleteStructure;
var Variable            = Structures.Variable;
var Compiler 			= require("./compilers");
var Instructions 		= require("./instructions");

/**
 * A utility function for rebuilding a term from the heap.
 * It accepts a store ref which provides the first structure (should be a StructureCell).
 * If a heap cell is encountered, it is dereferenced. This swill rturn null for unbound 
 * references, otherwise it will return a string
 **/
function rebuildTermFromHeap(reference) {
	console.debug("[REBUILD]\t" + reference.inspect());

	var nextVariableId = 1;

	// ensure the referenced cell is a structure cell
	var cell = reference.get();
	if(cell.constructor == HeapCell) {
		// dereference the heap cell and proceed based on its type
		var dereffed = cell.reference.deref();
		if(dereffed.label === "ref") {
			return reference;
		} else if(dereffed.label =="str") {
			cell = dereffed.reference.get();
			reference = dereffed.reference;
		} else {
			throw "REBUILD ERROR: Unexpected Reference Type.";
		}
	}

	// Now load all of the args.
	var args = [];

	for(var i = 0; i < cell.arity; i++) {
		var argRef = new StoreRef(reference.store, reference.index+i+1);
		var argCell = argRef.get();
		var dArgCell = argCell.reference.deref();

		// If the derefed cell is a StructureCell, recurse...
		if(dArgCell.constructor === StructureCell) {
			args[i] = (rebuildTermFromHeap(argCell.reference))
		} else if(dArgCell.constructor === HeapCell) {

			// if its a heap cell, its either a str cell or an unbound variable
			if(dArgCell.label === "ref") {
				// Unbound variable, add a variable here.
				args[i] = (new Variable("_H"+(nextVariableId++))); 
			} else {
				// Str cell, recurse on the reference
				args[i] = (rebuildTermFromHeap(dArgCell.reference));
			}

		} else {
			throw "REBUILD ERROR: Unexpected Cell Type, " + dArgCell.inspect();
		}
	}

	// Build and retrun the complete structure
	var completeStr = new CompleteStructure(cell.symbol,cell.arity,args);
	return completeStr;
};

/**
 * This function will set up and run a program and query given two callbacks to prepare the environment for each piece.
 **/
function BuildAndRun(DEBUG, prepareQueryCallback, prepareProgramCallback) {
	/**
	 * Create the X store and HEAP.
	 **/
	var ENV = new Structures.Env();
	ENV.setDebug(DEBUG);

	/**
	 * Load the query and faltten (provided by callback).
	 **/
	var startingPredicate = prepareQueryCallback(ENV);

	/**
	 * Compile the argument registers into query instructions
	 **/
	var queryInstructionsRange = Compiler.CompileLoadedQuery(ENV, startingPredicate);

	/**
	 * Load the program and faltten (provided by callback).
	 **/
	var programTerms = prepareProgramCallback(ENV);

	/**
	 * Compile the argument registers into program instructions
	 **/
	for(var i in programTerms) {
		Compiler.CompileLoadedFact(ENV, programTerms[i]);
	}

	console.log("Compiled Code:");
	console.log(ENV.CODE());

	/**
	 * Begin the evaluation by evaluating the QUERY.
	 **/
	try {
		Instructions.evaluateInstructions(ENV);
	} catch(e) { console.log("[ERROR] " + e); process.exit(); }
	
	console.log("END STATE");
	console.log(ENV.X());
	console.log(ENV.HEAP());
	console.log(ENV.CODE());

	/**
	 * Rebuild the result term.
	 **/
	var result = this.rebuildTermFromHeap(new StoreRef(ENV.X(), 1).get().reference);

	console.log("\n\nResults: ");

	// The correct answer should be: p( _H1 )
	console.log("MGU:\t\t " + result.inspect() + ".");

	// Get the variable bindings
	console.log("BINDINGS: ");
	var queryVariables = ENV.getQueryVariableBindings();
	for(var symbol in queryVariables) {
		console.log("\t" + symbol + ": " + this.rebuildTermFromHeap(queryVariables[symbol]).inspect());
	}

	return ENV;
}

/**
 * Exports.
 **/
module.exports.rebuildTermFromHeap = rebuildTermFromHeap;
module.exports.BuildAndRun = BuildAndRun;
