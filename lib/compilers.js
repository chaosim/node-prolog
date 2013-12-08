// Require the structures and instructions
var Structures          = require("./structures");
var Instructions 		= require("./instructions");

var StoreRef = Structures.StoreRef;

/**
 * A function to compile query terms flattened and loaded into arguement registers.
 **/
function CompileLoadedQuery(ENV, queryPredicate) {
	// If no starting point was specified, set it to 1
	if(typeof queryPredicate === "undefined") {
		throw "No Query Predicate Specified";
	}

	var instructions = [];
	var X = ENV.X();

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

	// Map refs that have been set or put to their registers
	// This way when we need to compile a construct that refers to the source register we can refer to the correct 
	// Eventual register
	var refMap = {};

	// Build out the instructions for a given query structure (not the query atom)
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
			var value = argument.get();
			
			// Check if this is a structure.
			if(value.constructor === Structures.CompleteStructure) {
				instructions = instructions.concat(tokenizeQueryStructure(value,argument));
				continue;
			}

			// Check if we've encountered this reference before
			if(!hasEncounteredRef(argument)) {

				// Create a reference to the next available X register to place in this instruction
				var nextRef = new StoreRef(ENV.X(), nextAvailableX);

				// If we haven't encountered this instruction, push a set variable instruction
				instructions.push(new Instructions.set_variable(nextRef));

				// push to the encountered refs and refmap
				encounteredRefs.push(argument);
				refMap[argument] = nextRef;

				// Increment the next X
				nextAvailableX++;

				// Add a binding to the environment
				ENV.setQueryVariableBinding(argument.get().symbol, argument);
			} else {
				// Check the ref map so we know what reference to put in the instruction
				var insRef = refMap[argument];
				if(!insRef) {
					throw "Compiler Error: No Ref found in RefMap. [" + argument.inspect() + "]";
				}

				// If we have encountered it, push a set value instruction
				instructions.push(new Instructions.set_value(insRef));
			}
		}
		
		return instructions;
	}

	// Keep track of the next available X register.
	var nextAvailableX = queryPredicate.arity + 1;

	// Compile the query.
	for(var x = 1 ; x <= queryPredicate.arity ; x++) {
		var reg = X.get(x);
		var ref = new StoreRef(ENV.X(), x);

		// Process this register
		switch(reg.constructor) {
			// If its a variable, push either put_variable or put_value
			case Structures.Variable:
				// Check whether or not we've encountered this variable already
				if(hasEncounteredRef(ref)) {
					// If we've already encountered this variable (not a reference but the actual variable from an A register)
					// push a put_value instruction.
					// Check the ref map so we know what reference to put in the instruction
					var insRef = refMap[ref];
					if(!insRef) {
						throw "Compiler Error: No Ref found in RefMap. [" + argument.inspect() + "]";
					}

					// If we have encountered it, push a set value instruction
					instructions.push(new Instructions.put_value(insRef, new StoreRef(ENV.X(), x)));
				} else {
					// Otherwise, put_variable
					instructions.push(new Instructions.put_variable(new StoreRef(ENV.X(), nextAvailableX), new StoreRef(ENV.X(), x)));
					ENV.setQueryVariableBinding(reg.symbol, new StoreRef(ENV.X(), nextAvailableX));

					// push a reference onto the enoucered refs stack and the refMap
					encounteredRefs.push(ref);
					refMap[ref] = new StoreRef(ENV.X(), nextAvailableX);
					
					// Increment the nextAvailableX
					nextAvailableX++;
				}
				break ;
			// If its a structure, we'll need to compile it a little.
			case Structures.CompleteStructure:
				instructions = instructions.concat(tokenizeQueryStructure(
					reg,
					new StoreRef(ENV.X(), x)
				));
				break ;
			default:
				throw "Erorr: Unrecognized Register Value (Compile Loaded Query)";
		}
	}

	// Add the call instruction
	instructions.push(new Instructions.control_call(queryPredicate.symbol, queryPredicate.arity));

	// return the results
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



