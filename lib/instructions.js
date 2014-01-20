/**
 * Require the Structures.
 **/
var Structures          = require("./structures");
var StoreRef            = Structures.StoreRef;
var HeapCell			= Structures.HeapCell;
var StructureCell		= Structures.StructureCell;

/** 
 * Require other instructions
 **/
var SetInstructions = require("./instructions/set_instructions");
var GetInstructions = require("./instructions/get_instructions");
var PutInstructions = require("./instructions/put_instructions");
var UnifyInstructions = require("./instructions/unify_instructions");
var ControlInstructions = require("./instructions/control_instructions");

// For DEBUG mode
var prompt = require('sync-prompt').prompt;

/**
 * Given an array of instructions, evaluate them.
 **/
function evaluateInstructions(ENV) {
	ENV.CODE().resetHead();
	var instruction = ENV.CODE().currentInstruction();

	if(ENV.DEBUG === true) {
		console.debug('\033[2J');
		console.debug("Initial State");
		console.debug(ENV.X());
		console.debug(ENV.HEAP());
		console.debug("Next: " + (instruction !== null ? instruction.inspect() : "None"));
		var opt = prompt('Press Enter to continue (n to stop debug, q to quit):');
		if(opt === "q") {
			process.exit();
		} else if(opt === "n") {
			console.debug('\033[2J');
			ENV.setDebug(false);
		}
	}

	while(instruction !== null) {
		console.debug('\033[2J');

		instruction.eval(ENV);
		if(!isControlInstruction(instruction)) {
			ENV.CODE().advanceInstruction();
		}

		// Break out if the instruction is a proceed
		if(instruction.constructor == ControlInstructions.proceed) {
			break ;
		}

		if(ENV.DEBUG === true) {
			console.debug("\nEvaluated: " + instruction.inspect() + "\n");
			console.debug(ENV.X());
			console.debug(ENV.HEAP());
			var nextPeek = ENV.CODE().currentInstruction();
			console.debug("Next: " + nextPeek === null ? "None" : nextPeek.inspect());
			var opt = prompt('Press Enter to continue (n to stop debug, q to quit):');
			if(opt === "q") {
				process.exit();
			} else if(opt === "n") {
				console.debug('\033[2J');
				ENV.setDebug(false);
			}
		}

		instruction = ENV.CODE().currentInstruction();
	};
}

/**
 * Given an instruction, return true if it is a control instruction
 */
function isControlInstruction(instruction) {
	switch(instruction.constructor) {
		case ControlInstructions.control_call:
		case ControlInstructions.proceed:
			return true;
		default: 
			return false;
	}
};

/**
 * Exports
 **/
module.exports.evaluateInstructions = evaluateInstructions;
module.exports.isControlInstruction = isControlInstruction;

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
module.exports.allocate			= ControlInstructions.allocate;
module.exports.deallocate		= ControlInstructions.deallocate;

// L1 Query Instructions
module.exports.put_variable 	= PutInstructions.put_variable;
module.exports.put_value 		= PutInstructions.put_value;

// L1 Program Instructions
module.exports.get_variable 	= GetInstructions.get_variable;
module.exports.get_value 		= GetInstructions.get_value;

