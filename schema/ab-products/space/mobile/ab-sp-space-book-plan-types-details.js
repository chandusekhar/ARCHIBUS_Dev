var abSpSpaceBookPlanTypesCtrl = View.createController('abSpSpaceBookPlanTypesController', {
	abSpSpaceBookPlanTypes_mobileApps_afterRefresh: function(){
		var rowCount = this.abSpSpaceBookPlanTypes_mobileApps.gridRows.getCount();
		for (var i = 0; i < rowCount; i++) {
		   var row = this.abSpSpaceBookPlanTypes_mobileApps.gridRows.get(i);
		   var action = row.actions.get('activateBtn');
		   var record = row.getRecord();

		   if(record.getValue('plantype_groups.active') == '1'){
			   action.setTitle(getMessage("deactivate"));
		   }else{
			   action.setTitle(getMessage("activate"));
		   }
		}
	}
	
});

function activate(row) {	
	var record = row.row.getRecord();
	var active = record.getValue('plantype_groups.active');
	var action = row.row.actions.get('activateBtn');
	
	if(active == '1'){
		record.setValue('plantype_groups.active', '0');
	}else{
		record.setValue('plantype_groups.active', '1');
	}
	View.dataSources.get('abSpSpaceBookPlanTypes_ds_2').saveRecord(record);
	View.panels.get('abSpSpaceBookPlanTypes_mobileApps').refresh();
}