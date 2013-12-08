/**
 * Require the Structures.
 **/
var Structures          = require("./structures");
var StoreRef            = Structures.StoreRef;
var HeapCell			= Structures.HeapCell;
var StructureCell		= Structures.StructureCell;

var prompt = require('sync-prompt').prompt;

// ----------------------------------------------------------------------
// ------- QUERY INSTRUCTIONS -------------------------------------------
// ----------------------------------------------------------------------

/**
 * Given an array of instructions, evaluate them.
 **/
function evaluateInstructions(instructions, ENV) {
	var instructionsCount = instructions.length;

	if(ENV.DEBUG === true) {
		console.debug('\033[2J');
		console.debug("Initial State");
		console.debug(ENV.X());
		console.debug(ENV.HEAP());
		console.debug("Next: " + (instructions.length > 0 ? instructions[0].inspect() : "None"));
		var opt = prompt('Press Enter to continue (n to stop debug, q to quit):');
		if(opt === "q") {
			process.exit();
		} else if(opt === "n") {
			console.debug('\033[2J');
			ENV.setDebug(false);
		}
	}

	for (var i = 0 ; i < instructionsCount ; i++) {
		console.debug('\033[2J');

		instructions[i].eval(ENV);

		if(ENV.DEBUG === true) {
			console.debug("\nEvaluated: " + instructions[i].inspect() + "\n");
			console.debug(ENV.X());
			console.debug(ENV.HEAP());
			console.debug("Next: " + (instructions.length > i+1 ? instructions[i+1].inspect() : "None"));
			var opt = prompt('Press Enter to continue (n to stop debug, q to quit):');
			if(opt === "q") {
				process.exit();
			} else if(opt === "n") {
				console.debug('\033[2J');
				ENV.setDebug(false);
			}
		}
	};
}

/**
 * Exports
 **/
module.exports.evaluateInstructions = evaluateInstructions;

var SetInstructions = require("./instructions/set_instructions");
var GetInstructions = require("./instructions/get_instructions");
var PutInstructions = require("./instructions/put_instructions");
var UnifyInstructions = require("./instructions/unify_instructions");
var ControlInstructions = require("./instructions/control_instructions");

// L0 Query Instructions
module.exports.put_structure    = PutInstructions.put_structure;
module.exports.set_variable     = SetInstructions.set_variable;
module.exports.set_value        = SetInstructions.set_value;

// L0 Program Instructions
module.exports.get_structure    = GetInstructions.get_structure;
module.exports.unify_variable   = UnifyInstructions.unify_variable;
module.exports.unify_value      = UnifyInstructions.unify_value;

// L1 Control Instructions
module.exports.control_call		= ControlInstructions.control_call;
module.exports.proceed			= ControlInstructions.proceed;

// L1 Query Instructions
module.exports.put_variable 	= PutInstructions.put_variable;
module.exports.put_value 		= PutInstructions.put_value;

// L1 Program Instructions
module.exports.get_variable 	= GetInstructions.get_variable;
module.exports.get_value 		= GetInstructions.get_value;

