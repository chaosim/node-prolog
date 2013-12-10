/**
 * Holds a reference to a store
 **/
module.exports.StoreRef = function(store, index) {
	this.store = store;
	this.index = index;

	this.set = function(item) {
		this.store.set(this.index, item);
	};

	this.get = function() {
		return this.store.get(this.index);
	};

	this.deref = function() {
		console.debug("[DEREF IN]\t" + this.inspect());
		var test = this.get();

		// if this is a self-referencing item, its an unbound variable
		// we cannot derefence it any further
		// TODO: Convert the HeapCell to use an enumerated type instead of strings for the cell label
		if(test.constructor == StoreRef) {
			if(test.store == this.store && test.index == this.index) {
				return this;
			} else {
				return test.deref;
			}
		} else if(test.constructor == HeapCell) {
			if(test.label == "ref") {
				// TODO: Find a better way to compare there, using the constructor will mean we can only have one of each store type at a time.
				if(test.reference.store.constructor == this.store.constructor && test.reference.index == this.index) {
					return test;
				} else if(test.label == "str") {
					return this;
				} else {
					return test.reference.deref();
				}
			} else {
				return test;
			}
		} else if(test.constructor == StructureCell) {
			return test;
		} else {
			throw "Unable to dereference object: " + test.inspect();
		}
	};

	this.inspect = function(){
		return store.label() + "[" + this.index + "]";
	};
}