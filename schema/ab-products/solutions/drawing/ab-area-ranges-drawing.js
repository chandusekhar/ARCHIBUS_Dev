//
//

var controller = View.createController('areaRangesController', {
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.areaRangesDrawing_floors.addEventListener('onMultipleSelectionChange', function(row) {
			View.getControl('', 'areaRangesDrawing_cadPanel').addDrawing(row, null);
	    });
	    

		// Use the following ruleset to mange the applied highlights
		var ruleset = new DwgHighlightRuleSet();
		ruleset.appendRule("rm.area", "80", "CC6633", "<=", "Small");
		ruleset.appendRule("rm.area", "150", "CC9933", "<=", "Medium");
		ruleset.appendRule("rm.area", "250", "CCCC33", "<=", "Large");
		ruleset.appendRule("rm.area", "250", "CCFF33", ">", "", false, true);
		
		this.areaRangesDrawing_cadPanel.appendRuleSet("areaRangesDrawing_highlightVacantRoomsDs", ruleset);
	}
});




