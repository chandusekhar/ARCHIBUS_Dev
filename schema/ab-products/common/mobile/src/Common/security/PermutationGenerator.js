/**
 * Used by Common.security.Security class to generate a permutation of the signature key.
 * <p>
 * This code was ported from the ARCHIBUS ab-secure.js code.
 * <p>
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.security.PermutationGenerator', {

	config : {
		numberOfElements : null,
		transpositions : [],
		numberOfTranspositions : 0
	},

    /* jshint -W016 */
	constructor : function(config) {
		var numberOfElements,
			k = 0,
			i,j;

		this.initConfig(config);

		numberOfElements = this.getNumberOfElements();

		for (i = 0; i < numberOfElements - 1; i++) {
			for (j = i + 1; j < numberOfElements; j++) {
				this.getTranspositions()[k++] = (i << 8) | j;
			}
		}

		this.setNumberOfTranspositions(k);
	},

	getPermutationFromCycle : function(cycle) {

		var permutation = [], i, T, column1, column2;

		for (i = 0; i < this.getNumberOfElements(); i++) {
			permutation[i] = i;
		}

		for (i = 0; i < cycle.length; i++) {
			T = this.getTranspositions()[cycle[i]];
			column1 = T & 255;
			column2 = (T >> 8) & 255;
			T = permutation[column1];
			permutation[column1] = permutation[column2];
			permutation[column2] = T;
		}

		return permutation;
	}
});