
var controller = View.createController('floorSelectorController', {
	 
	floorselector_buildingsTree_onCancel: function() {
		View.closeThisDialog(); 
	},
	
	setRestriction: function(res) {
		// Find the 'drawing' panel
		var bFound = false;
		var panels = View.getOpenerView().panels;
		for (var i = 0; i < panels.length && !bFound; i++) {
			var panel = panels.items[i];
			if (panel.type == 'drawing')
				bFound = true;
		}
	
		View.closeThisDialog(); 
			
		if (bFound)
			panel.onFloorSelected(res);
	}
	
});


function onFloorsTreeClick(ob) {
	View.controllers.get('floorSelectorController').setRestriction(ob.restriction);
}





