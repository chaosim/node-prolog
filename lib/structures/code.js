/**
 * The Code Area
 **/
module.exports.Code = function() {
	var store = [];
	var labels = {};
	var I = 0;

	this.pushInstruction = function(instruction, label) {
		if(typeof(label) !== "undefined") {
			labels[label] = store.length - 1;
		}

		store.push(instruction);
	};

	this.splice = function(start, end) {
		if(start instanceof Array) {
			return store.slice(start[0], start[1]);
		}
		return store.slice(start, end);
	};

	this.length = function() { 
		return store.length;
	};

	this.labelInstruction = function(label, index) {
		labels[label] = index;
	};

	this.indexOfLabel = function(label) {
		if(typeof labels[label] === "undefined" || labels[label] === null) {
			return -1;
		}
		return labels[label];
	};

	this.inspect = function() {
		var ret = "CODE AREA: \n";

		// reverse the labels array so we can print them in front of the instructions
		var labelsByIndex = { };
		for(var l in labels) {
			labelsByIndex[labels[l]] = l;
		}

		// Loop over the instructions
		var store_length = store.length;
		for(var i = 0 ; i < store_length ; i++) {
			var item = store[i];
			var label = labelsByIndex[i];
			if(label) {
				ret += label + "\t\t" + item.inspect() + "\n";
			} else {
				ret += "\t\t" + item.inspect() + "\n";
			}
		}
			

		return ret;
	};
}
