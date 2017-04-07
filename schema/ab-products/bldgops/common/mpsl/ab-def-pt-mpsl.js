var defPtController=View.createController('defPtController',{
	/**
	 * event handler when click the Save button of detialPanel form 
	 */
	savePtDetailInfo: function(){
		//Save information to part table
		var partCode=this.detailsPanel.getFieldValue('pt.part_id');
		var costUnitStd=this.detailsPanel.getFieldValue('pt.cost_unit_std');
		var qtyMinHand=this.detailsPanel.getFieldValue('pt.qty_min_hand');
		//Save information to Part storage location table.
		
		var ptStoreLocPtDS=View.dataSources.get('abPtStoreLocPtDs');
		
		
		if(this.detailsPanel.newRecord){
			//Save record to part table and part storage location table
			var partSaved=this.detailsPanel.save();
			if(partSaved){
				View.panels.get('ptPanel').refresh();
			}
		}else{
			var partSaved=this.detailsPanel.save();
			if(partSaved){
				var res=new Ab.view.Restriction();
				res.addClause('pt_store_loc_pt.part_id',partCode,'=');
				
				var ptStorageLocationRecords=ptStoreLocPtDS.getRecords(res);
				for(var i=0;i<ptStorageLocationRecords.length;i++){
					var ptStoreLocRecord=ptStorageLocationRecords[i];
					ptStoreLocRecord.isNew=false;
					ptStoreLocRecord.setValue('pt_store_loc_pt.cost_unit_std',costUnitStd);
					ptStoreLocRecord.setValue('pt_store_loc_pt.qty_min_hand',qtyMinHand);
					ptStoreLocPtDS.saveRecord(ptStoreLocRecord);
				}
				View.panels.get('ptPanel').refresh();
			}
		}
		
	}
});
/**
 * Call workflow CalculateInventoryUsage for calculate part inventory
 */
function calculateInventoryUsage(){
	// kb 3042748 add Status bars and confirmation messages 
    var grid = View.panels.get('ptPanel');
    View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
		try {
			Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-CalculateInventoryUsageForMPSL');
			View.closeProgressBar();
    		View.alert(getMessage('calculateAlertMessage'));
			grid.refresh();
		}catch(e){
			Workflow.handleError(e);
			View.closeProgressBar();
			return;
		}
}