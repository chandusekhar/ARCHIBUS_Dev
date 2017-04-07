//Cross-table example with custom drill-down action
var exCrosstableCustomDrillDown = View.createController('exCrosstableCustomDrillDown', {	

	afterInitialDataFetch: function(){
		 // register the custom listener for the onClickItem event defined in AXVW
	     this.propViewAnalysis2d_table.onClickItem = this.show;
	 },

	 /**
	  * This function is called by the cross-table when the user clicks on a cell.
	  * "this" in the code refers to the cross-table panel object - not to the controller.
	  */
	 show: function(id) {
		// get clicked item's field name
		var calculatedFieldName = this.getClickedFieldName(id);
		 
		//pass id to get clicked item's restriction
		var restriction = this.getRestrictionFromId(id);
		
		// show the details in a pop-up
		var grid = View.panels.get("propViewAnalysis2d_grid");
		grid.refresh(restriction);
		grid.showInWindow({width: 600, height: 400});
	 }
});
