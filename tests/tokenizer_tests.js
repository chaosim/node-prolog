
var Tokenizer = require('../lib/tokenizer.js');

var example = {};
example.facts = [
	"edge(1,2).\n",
	"edge(2,3).\n",
	"edge(2,4).\n",
	"edge(4,1)."
];

example.lists = [
	"[ H | T ],",
	"[ a | List],",
	"[]",
	".(Head, Tail),"
];

example.unification = [
	"S = T,",
	"S = T."
];

example.append = [
	"append([],L,L).\n",
	"append([X|L], M, [X|N]) :- append(L, M, N)."
];

example.variables = [
	'X',
	'Socrates',
	'_result',
	' Y '
];

describe('Tokenizer', function() {

	describe('isVariable', function() {

		it('should be a variable', function(done) {
			example.variables.forEach(function(item) {
				Tokenizer.isVariable(item).should.be.true;
			});
			done();
		});

		it('should not be a variable', function(done) {

			example.facts.forEach(function(item) {
				Tokenizer.isVariable(item).should.be.false;
			});

			example.lists.forEach(function(item) {
				Tokenizer.isVariable(item).should.be.false;
			});

			example.unification.forEach(function(item) {
				Tokenizer.isVariable(item).should.be.false;
			});

			example.append.forEach(function(item) {
				Tokenizer.isVariable(item).should.be.false;
			});

			done();
		});
	});
});