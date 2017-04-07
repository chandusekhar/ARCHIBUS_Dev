/**
 * Used by Common.security.Security class to generate hashed string values. This code was ported from the ARCHIBUS
 * ab-secure.js code.
 * 
 * @author Jeff Martin
 */
Ext.define('Common.security.Password', {

	config : {
		password : null
	},

	constructor : function(config) {
		this.initConfig(config);
	},

	getHashValue : function() {
		var m = 907633409,
			a = 65599,
			hashValue = 0, i;

		for (i = 0; i < this.getPassword().length; i++) {
			hashValue = (hashValue % m) * a + this.getPassword().charCodeAt(i);
		}

		return hashValue;
	},

	getPermutation : function() {
		var numberOfElements = 4, cycleLength = 9, permutationGenerator, cycle = [], hash = this.getHashValue(), i;

		permutationGenerator = Ext.create('Common.security.PermutationGenerator', {
			numberOfElements : numberOfElements
		});

		for (i = 0; i < cycleLength; i++) {
			hash = 11 * hash + 11;
			cycle[i] = hash % permutationGenerator.getNumberOfTranspositions();
		}

		return permutationGenerator.getPermutationFromCycle(cycle);
	}
});
