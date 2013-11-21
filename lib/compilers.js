// Require the structures and instructions
var Structures          = require("./structures");
var Instructions 		= require("./instructions");

/**
 * A function to compile query terms flattened and loaded into arguement registers.
 *
 * @param flattenedStructureRegisters 	This should be an array of indicies in X where
 *										the structures we are going to compile are found.
 *										For queries, the flattened array should present the
 *										terms in a bottom up fashion (simplest terms first)
 *										so that when the compiler reaches the structure in that 
 *										index, all of its arguments are either variables or structures
 *										that have already been processed.
 **/
function CompileLoadedQuery(X, flattenedStructureRegisters) 
{
	var instructions = [];

	// For encountered reference checking.
	var encounteredRefs = [];
	function hasEncounteredRef(ref) {
		for (var i = encounteredRefs.length - 1; i >= 0; i--) {
			var testRef = encounteredRefs[i];
			if(testRef.constructor == ref.constructor && testRef.index === ref.index)
				return true;
		}
		return false;
	}

	// Loop over each structure and build the instructions for it.
	for(var i = 0 ; i < flattenedStructureRegisters.length; i++) {
		var registerValue = X.get(flattenedStructureRegisters[i]);
		instructions = instructions.concat(
			tokenizeQueryStructure(
				registerValue, 
				new Structures.StoreRef(X, flattenedStructureRegisters[i])
			)
		);
	}

	// Build out the instructions for a given query structure
	// TODO: Some more error tolerance here, if one of the args is a structure it could cause some mayhem
	function tokenizeQueryStructure(structure, reference) {
		if(structure.constructor !== Structures.CompleteStructure) {
			throw "Non-Structure Passed to tokenizeStructure";
		} 

		var instructions = [];

		// push a put structure instruction on
		instructions.push(new Instructions.put_structure(structure.symbol, structure.arity, reference));
		encounteredRefs.push(reference);

		// Loop over the argument registers
		for(var a = 0 ; a < structure.arity ; a++) {
			var argument = structure.args[a];

			// Check if we've encountered this reference before
			if(!hasEncounteredRef(argument)) {
				encounteredRefs.push(argument);
				// If we haven't encountered this instruction, push a set variable instruction
				instructions.push(new Instructions.set_variable(argument));
			} else {
				// If we have encountered it, push a set value instruction
				instructions.push(new Instructions.set_value(argument));
			}
		}

		return instructions;
	}


	return instructions;
}

/**
 * A function to compile program terms flattened and loaded into arguement registers.
 *
 * @param flattenedStructureRegisters 	This should be an array of indicies in X where
 *										the structures we are going to compile are found.
 *										For queries, the flattened array should present the
 *										terms in a bottom up fashion (simplest terms first)
 *										so that when the compiler reaches the structure in that 
 *										index, all of its arguments are either variables or structures
 *										that have already been processed.
 **/
function CompileLoadedProgram(X, flattenedStructureRegisters)  
{
	var instructions = [];

	// For encountered reference checking.
	var encounteredRefs = [];
	function hasEncounteredRef(ref) {
		for (var i = encounteredRefs.length - 1; i >= 0; i--) {
			var testRef = encounteredRefs[i];
			if(testRef.constructor == ref.constructor && testRef.index === ref.index)
				return true;
		}
		return false;
	}

	// Loop over each structure and build the instructions for it.
	for(var i = 0 ; i < flattenedStructureRegisters.length; i++) {
		var registerValue = X.get(flattenedStructureRegisters[i]);
		instructions = instructions.concat(tokenizeProgramStructure(registerValue, new Structures.StoreRef(X, flattenedStructureRegisters[i])));
	}

	// Build out the instructions for a given program structure
	// TODO: Some more error tolerance here, if one of the args is a structure it could cause some mayhem
	function tokenizeProgramStructure(structure, reference) {
		if(structure.constructor !== Structures.CompleteStructure) {
			throw "Non-Structure Passed to tokenizeProgramStructure";
		} 

		var instructions = [];

		// push a get structure instruction on
		instructions.push(new Instructions.get_structure(structure.symbol, structure.arity, reference));
		encounteredRefs.push(reference);

		// Now push things on for all of the arguments
		for(var a = 0 ; a < structure.arity ; a++) {
			var argument = structure.args[a];

			// Check if we've encountered this reference before
			if(!hasEncounteredRef(argument)) {
				encounteredRefs.push(argument);
				// If we haven't encountered this instruction, push a set variable instruction
				instructions.push(new Instructions.unify_variable(argument));
			} else {
				// If we have encountered it, push a set value instruction
				instructions.push(new Instructions.unify_value(argument));
			}
		}

		return instructions;
	}


	return instructions;
}

/**
 * Exports.
 **/
module.exports.CompileLoadedQuery = CompileLoadedQuery;
module.exports.CompileLoadedProgram = CompileLoadedProgram;



