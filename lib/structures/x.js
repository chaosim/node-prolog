/**
 * The Argument Registers
 **/
module.exports.X = function() {
	var store = [];

	this.set = function(register, value) {
		store[register] = value;
	};

	this.get = function(register) {
		return store[register];
	};

	this.length = function() {
		return store.length();
	};

	this.inspect = function(){
		var s = "XDUMP:\n";
		for(var i in store) {
			s += i + ":\t" + (store[i] ? store[i].inspect() : "undefined") + "\n";
		}
		return s
	};

	this.label = function() { 
		return "X";
	};
}