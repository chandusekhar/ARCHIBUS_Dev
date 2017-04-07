var buildingLocaitonTabController = View.createController('buildingLocaitonTabController', {
	items : new Array(),
	consoleRestriction : '1=1',

	afterInitialDataFetch : function() {
		this.buildingsGrid.refresh('site.site_id is null');
	},

	initializeView : function() {
		var restriction = 'site.site_id is null';
		if(this.items.length>0){
			restriction = 'site_id in (' + this.items + ')' ;
		}
		this.buildingsGrid.refresh(restriction);
	},
	buildingsGrid_detail_onClick : function(row) {
		var row = row;
		View.openDialog('ab-waste-rpt-map-bl-loc-details.axvw', null, true, {
			width : 1280,
			height : 600,
			closeButton : true,
			bl_id:"",
			site_id:"",
			afterInitialDataFetch : function(dialogView) {
				var dialogController = dialogView.controllers.get('blDetail');
				dialogController.site_id = row.getFieldValue('site.site_id');
			}
		});
	}
})
