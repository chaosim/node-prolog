var Structures 			= require("./structures");
var HeapCell            = Structures.HeapCell;
var StructureCell       = Structures.StructureCell;
var StoreRef            = Structures.StoreRef;
var CompleteStructure   = Structures.CompleteStructure;
var Variable            = Structures.Variable;

/**
 * A utility function for rebuilding a term from the heap.
 * It accepts a store ref which provides the first structure (should be a StructureCell).
 **/
function rebuildTermFromHeap(reference) {
	console.log("[REBUILD]\t" + reference.inspect());

	var nextVariableId = 1;

	// ensure the referenced cell is a structure cell
	var cell = reference.get();
	if(cell.constructor !== StructureCell) {
		throw "REBUILD ERROR: Unexpected Reference Type.";
	}

	// Now load all of the args.
	var args = [];

	for(var i = 1; i <= cell.arity; i++) {
		var argRef = new StoreRef(reference.store, reference.index+i);
		var argCell = argRef.get();
		var dArgCell = argCell.reference.deref();

		// If the derefed cell is a StructureCell, recurse...
		if(dArgCell.constructor === StructureCell) {
			args.push(rebuildTermFromHeap(argCell.reference))
		} else if(dArgCell.constructor === HeapCell) {

			// if its a heap cell, its either a str cell or an unbound variable
			if(dArgCell.label === "ref") {
				// Unbound variable, add a variable here.
				args.push(new Variable("_H"+(nextVariableId++))); 
			} else {
				// Str cell, recurse on the reference
				args.push(rebuildTermFromHeap(dArgCell.reference));
			}

		} else {
			throw "REBUILD ERROR: Unexpected Cell Type, " + argCell.inspect();
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