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

	var X = ENV.X();
	var CODE = ENV.CODE();

	// Keep track of the start position in the code array so we know what our impact was
	var startingCodeIndex = CODE.length();

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

		// push a put structure instruction on
		CODE.pushInstruction(new Instructions.put_structure(structure.symbol, structure.arity, reference));
		encounteredRefs.push(reference);

		// Loop over the argument registers
		for(var a = 0 ; a < structure.arity ; a++) {
			var argument = structure.args[a];
			var value = argument.get();
			
			// Check if this is a structure.
			if(value.constructor === Structures.CompleteStructure) {
				tokenizeQueryStructure(value,argument);
				continue;
			}

			// Check if we've encountered this reference before
			if(!hasEncounteredRef(argument)) {

				// Create a reference to the next available X register to place in this instruction
				var nextRef = new StoreRef(ENV.X(), nextAvailableX);

				// If we haven't encountered this instruction, push a set variable instruction
				CODE.pushInstruction(new Instructions.set_variable(nextRef));

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
				CODE.pushInstruction(new Instructions.set_value(insRef));
			}
		}
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
					CODE.pushInstruction(new Instructions.put_value(insRef, new StoreRef(ENV.X(), x)));
				} else {
					// Otherwise, put_variable
					CODE.pushInstruction(new Instructions.put_variable(new StoreRef(ENV.X(), nextAvailableX), new StoreRef(ENV.X(), x)));
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
				tokenizeQueryStructure(reg, new StoreRef(ENV.X(), x));
				break ;
			default:
				throw "Erorr: Unrecognized Register Value (Compile Loaded Query)";
		}
	}

	// Add the call instruction
	CODE.pushInstruction(new Instructions.control_call(queryPredicate.symbol, queryPredicate.arity));

	// return the results
	return [startingCodeIndex, CODE.length()];
}

/**
 * A function to compile program facts flattened and loaded into arguement registers.
 **/
function CompileLoadedFact(ENV, fact)  
{
	// Make sure a fact was provided
	if(typeof fact === "undefined") {
		throw "No Fact Specified";
	}

	var X = ENV.X();
	var CODE = ENV.CODE();

	// Keep track of the start position in the code array so we know what our impact was
	var startingCodeIndex = CODE.length();
	var nonArgumentCompilationStack = [];

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

	// // Build out the instructions for a given program structure
	// function tokenizeProgramStructure(structure, reference) {
	// 	if(structure.constructor !== Structures.CompleteStructure) {
	// 		throw "Non-Structure Passed to tokenizeProgramStructure";
	// 	}

	// 	// push a get structure instruction on
	// 	CODE.pushInstruction(new Instructions.get_structure(structure.symbol, structure.arity, reference));
	// 	encounteredRefs.push(reference);

	// 	// Now push things on for all of the arguments
	// 	for(var a = 0 ; a < structure.arity ; a++) {
	// 		var argument = structure.args[a];
				
	// 		// Check if this is a structure
	// 		if(argument.get().constructor === Structures.CompleteStructure) {
	// 			tokenizeProgramStructure(argument.get(), argument);
	// 		}

	// 		// Check if we've encountered this reference before
	// 		if(!hasEncounteredRef(argument)) {
	// 			// If we haven't encountered this instruction, push a set variable instruction
	// 			CODE.pushInstruction(new Instructions.unify_variable(argument));

	// 			// Update the reference maps
	// 			encounteredRefs.push(argument);
	// 			refMap[reference] = new StoreRef(ENV.X(), nextAvailableX);
				
	// 			// Increment the nextAvailableX
	// 			nextAvailableX++;
	// 		} else {
	// 			var insRef = refMap[reference];
	// 			if(!insRef) {
	// 				throw "Compiler Error: No Ref found in RefMap. [" + argument.inspect() + "]";
	// 			}

	// 			// If we have encountered it, push a set value instruction
	// 			CODE.pushInstruction(new Instructions.unify_value(insRef));
	// 		}
	// 	}
	// }

	function compileStructure(reference) {
		var structure = reference.get();

		// Make sure this is called with a complete structure.
		if(structure.constructor !== Structures.CompleteStructure) {
			throw "Non-Structure Passed to tokenizeProgramStructure";
		}

		// Push the get structure instruction
		CODE.pushInstruction(new Instructions.get_structure(structure.symbol, structure.arity, reference));

		// Loop over the args.
		for(var a = 0 ; a < structure.arity ; a++) {
			var arg = structure.args[a];

			// Check if we've encountered this reference before
			if(hasEncounteredRef(arg)) {
				// If we have encountered it, push a unify_value instruction
				CODE.pushInstruction(new Instructions.unify_value(arg));
			} else {
				// Otherwise, push a unify_variable instruction
				CODE.pushInstruction(new Instructions.unify_variable(arg));

				// Add it to the references
				encounteredRefs.push(arg);

				// Now check if it points to a complete structure
				if(arg.get().constructor === Structures.CompleteStructure) {
					// If the item referred to is a structure, push it onto the nonArgumentCompilationStack for later review.
					nonArgumentCompilationStack.push(arg);
				}
			}
		}
	};

	// Push the label into the code area
	CODE.labelInstruction(fact.symbol + "/" + fact.arity, startingCodeIndex);

	// Start compiling the argument registers
	var arguments_length = fact.args.length;
	for(var i = 1 ; i <= arguments_length ; i++) {
		var ref = fact.args[i-1];
		var item = ref.get();
		switch(item.constructor){
			case Structures.CompleteStructure:
				compileStructure(ref);
				break ;
			case Structures.Variable:
				// check if we've encountered this reference before
				if(hasEncounteredRef(item.reference)) {
					// If we have encountered it, push a get_value instruction
					CODE.pushInstruction(new Instructions.get_value(item.reference, ref));
				} else {
					// otherwise, push a get_variable
					CODE.pushInstruction(new Instructions.get_variable(item.reference, ref));

					// Add it to the encountered refs
					encounteredRefs.push(item.reference);
				}
				break ;
			default:
				throw "Compiler Error: Unknown Argument Type ("+item.inspect()+")";
		}
	}

	// Now work through the nonArgumentCompilationStack
	while(nonArgumentCompilationStack.length > 0) {
		compileStructure(nonArgumentCompilationStack.pop());
	}

	// Push a proceed instruction now that we're done
	CODE.pushInstruction(new Instructions.proceed());

	// Return the bounds where we've added instructions
	return [startingCodeIndex, CODE.length()];
}

/**
 * Exports.
 **/
module.exports.CompileLoadedQuery = CompileLoadedQuery;
module.exports.CompileLoadedFact = CompileLoadedFact;



