var Structures 			= require("./structures");
var HeapCell            = Structures.HeapCell;
var StructureCell       = Structures.StructureCell;
var StoreRef            = Structures.StoreRef;
var CompleteStructure   = Structures.CompleteStructure;
var Variable            = Structures.Variable;

/**
 * A utility function for rebuilding a term from the heap.
 * It accepts a store ref which provides the first structure (should be a StructureCell).
 * If a heap cell is encountered, it is dereferenced. This swill rturn null for unbound 
 * references, otherwise it will return a string
 **/
function rebuildTermFromHeap(reference) {
	console.log("[REBUILD]\t" + reference.inspect());

	var nextVariableId = 1;

	// ensure the referenced cell is a structure cell
	var cell = reference.get();
	if(cell.constructor == HeapCell) {
		// dereference the heap cell and proceed based on its type
		var dereffed = cell.reference.deref();
		if(dereffed.label === "ref") {
			return reference.inspect();
		} else if(dereffed.label =="str") {
			// cell = ;
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
 * Exports.
 **/
module.exports.rebuildTermFromHeap = rebuildTermFromHeap;