//
//

var controller = View.createController('areaRangesController', {
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.colorOverridesDrawing_floors.addEventListener('onMultipleSelectionChange', function(row) {
			View.getControl('', 'colorOverridesDrawing_cadPanel').addDrawing(row, null);
	    });
	    

		// Use the following ruleset to manage the applied highlights
		var ruleset = new DwgHighlightRuleSet();
		ruleset.appendRule("rm.count_em", "1", "00CCFF", "==");
		ruleset.appendRule("rm.count_em", "2", "0099CC", "==");
		ruleset.appendRule("rm.count_em", "3", "009966", "==");
		ruleset.appendRule("rm.count_em", "4 or more", "00CC33", "==", "", false, true);
		
		this.colorOverridesDrawing_cadPanel.appendRuleSet("colorOverridesDrawing_highlightHeadCountDs", ruleset);
	}
});




