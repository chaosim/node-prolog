/**
 * The Heap.
 **/
module.exports.Heap = function() {
	var store = [];
	var H = 0;
	
	this.H = function() {
		return H;
	};

	this.set = function(index, item) {
		store[index] = item;
	};

	this.place = function(item) {
		store[H] = item;
	};

	this.increment = function() {
		H++;
	};

	this.get = function(index) {
		return store[index];
	};

	this.inspect = function() {
		var s = "HDUMP["+H+"]:\n";
		for(var i = 0 ; i < H ; i++) {
			s += i + ":\t" + (store[i] ? store[i].inspect() : "undefined") + "\n";
		}
		return s
	};

	this.label = function() { 
		return "HEAP";
	};
}

/**
 * A Heap Cell contains a label and a StoreRef
 **/
// TODO: Change the label to use some kind of enumerated type instead of strings
module.exports.HeapCell = function(label, reference) {
	this.label = label;
	this.reference = reference;
	this.inspect = function() {
		return "<" + this.label + ", " + this.reference.inspect() + ">";
	};
}

/**
 * A Heap Cell which contains a predicate symbol and arity
 **/
module.exports.StructureCell = function(symbol, arity) {
	this.symbol = symbol;
	this.arity = arity;
	this.inspect = function() {
		return "<" + this.symbol + "/" + this.arity + ">";
	};
}