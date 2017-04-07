//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//


var controller = View.createController('singleSelectController', {
	
	selectedRooms: [],
	
	afterInitialDataFetch: function() {
		//hide selection all action
        this.singleSelect_floors.enableSelectAll(false);
    },

	afterViewLoad: function() {	
	
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.singleSelect_cadPanel.addEventListener('onclick', onDwgPanelClicked);
    	this.singleSelect_cadPanel.addEventListener('onMultipleSelectionChange', onDwgPanelMultipleSelectionChange);

    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.singleSelect_floors.addEventListener('onMultipleSelectionChange', function(row) {
    		var opts = null;
    		$("nestedLayout_1_center_div").innerHTML = "";
			View.panels.get('singleSelect_cadPanel').addDrawing(row, opts);
	    });
	}
});

function onDwgPanelClicked(pk, selected)
{
	var rmListElem = $("nestedLayout_1_center_div");
	if(selected){
		rmListElem.innerHTML = 'Room [' + pk[0] + '-' + pk[1] + '-' + pk[2] + '] is selected.';
	} else {
		rmListElem.innerHTML = 'Room [' + pk[0] + '-' + pk[1] + '-' + pk[2] + '] is unselected.';
	}
}


function onDwgPanelMultipleSelectionChange()
{
	var cp = View.getControl('', 'singleSelect_cadPanel')
	var selectedAssetsMap = cp.getMultipleSelectedAssets();
	var rmListElem = $("nestedLayout_1_center_div");
	if(selectedAssetsMap.length >0){
		var selectedRooms = '';
		for(var i = 0; i < selectedAssetsMap.length; i++){
			selectedRooms += '[' + selectedAssetsMap[i].pks[0] + "-" + selectedAssetsMap[i].pks[1] + "-" + selectedAssetsMap[i].pks[2] + ']';
		}
		rmListElem.innerHTML = '<h4>' +  selectedAssetsMap.length + ' Room(s) Selected</h4> ' + selectedRooms;
	} else{
		rmListElem.innerHTML = '<h4>No Room(s) Selected</h4> ';
	}
}