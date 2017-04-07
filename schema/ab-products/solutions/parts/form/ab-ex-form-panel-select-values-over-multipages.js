var abTestSelectValueCtrl = View.createController('abTestSelectValueCtrl', {
	rmFilterPanel_onSearch: function(){
		var restriction = "";
		var console = this.rmFilterPanel;
		restriction = console.getFieldRestriction();
		
		// apply restriction to the grid
		var grid = this.rmDetailPanel;
		grid.refresh(restriction);
		// show the grid
		grid.show(true);
	}
});

