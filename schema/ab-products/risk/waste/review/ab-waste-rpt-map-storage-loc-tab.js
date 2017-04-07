var storageLocationTabController = View.createController('storageLocationTabController', {
	items : new Array(),
	consoleRestriction : '1=1',

	afterInitialDataFetch : function() {
		this.storageLocationGrid.refresh('1=0');
	},

	initializeView : function() {
		var restriction = '1=0';
		if(this.items.length>0){
			restriction = 'waste_areas.storage_location in (' + this.items + ') ';
		}
		this.storageLocationGrid.refresh(restriction);
	},
	storageLocationGrid_detail_onClick : function(row) {
		var row = row;
		View.openDialog('ab-waste-rpt-map-storage-loc-tab-details.axvw', null, true, {
			width : 1280,
			height : 600,
			closeButton : true,
			afterInitialDataFetch : function(dialogView) {
				var dialogController = dialogView.controllers.get('storageLocationDetails');
				dialogController.pkeyValue = row.getFieldValue('waste_areas.storage_location');
				dialogController.initializeView();
			}
		});
	}
})
