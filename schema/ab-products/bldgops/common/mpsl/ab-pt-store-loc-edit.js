var defPtStorageLocController= View.createController('defPtStorageLocController',{
	
	recordBeforeEdit : null,
	
	abWhForm_afterRefresh: function(){
		this.recordBeforeEdit = this.abWhForm.getFieldValues(true);
	},
	/**
	 * The user will not be allowed to delete a storage location that still contains some part quantities, or is included in an active work request, supply requisition, purchase order, or PM schedule.
	 */
	deleteStorageLocation: function(){
		var contoller = View.controllers.get('defPtStorageLocController');
		View.confirm(getMessage('confirmDeleteMsg'),function(button){
			if(button=='yes'){
				var canDelete=true;
				try{
        			var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-checkIsStoreLocCanBeDeleted', contoller.recordBeforeEdit['pt_store_loc.pt_store_loc_id']);
        			if(result.code=="executed"){
        				if(result.value){
        					
        					var deleteResult=View.panels.get('abWhForm').deleteRecord();
        					if(deleteResult){
        						View.panels.get('abWhForm').show(false);
        						View.panels.get('abWhGrid').refresh();
        					}
        					
        				}else{
        					View.alert(getMessage('storageLocCannotDeleteMsg'));
        				}
        			}
				
				} catch(e) {
        			Workflow.handleError(e);
        		}
			}
		});
	}
	
});

function savePartStorageLocation(){
	var form = View.panels.get('abWhForm');
	var contoller = View.controllers.get('defPtStorageLocController');
	if(!form.newRecord){
		var newValues = form.getFieldValues(true);
		if(contoller.recordBeforeEdit['pt_store_loc.bl_id']+contoller.recordBeforeEdit['pt_store_loc.fl_id']+contoller.recordBeforeEdit['pt_store_loc.rm_id']
		     != newValues['pt_store_loc.bl_id']+newValues['pt_store_loc.fl_id']+newValues['pt_store_loc.rm_id']){

			View.confirm(getMessage('confirmChangeLocation'), function (button) {
                if (button === 'yes') {
                    var isSaved = form.save();
                    contoller.recordBeforeEdit = newValues;
                    if(isSaved){
                    	try{
                			Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-removePartLocations', contoller.recordBeforeEdit['pt_store_loc.pt_store_loc_id']);
                		} catch(e) {
                			Workflow.handleError(e);
                			return false;
                		}
                    }else{
                    	return false;
                    }
                    
                }
            });
			
		}else{
			form.save();
		}
	}else{
		form.save();
	}
	
	return true;
}

function checkIfSiteIdChange(fieldName,selectValue,previousValue){
	if(fieldName=="pt_store_loc.site_id"){
		if(selectValue!=previousValue){
			View.panels.get('abWhForm').setFieldValue('pt_store_loc.bl_id',"");
			View.panels.get('abWhForm').setFieldValue('pt_store_loc.fl_id',"");
			View.panels.get('abWhForm').setFieldValue('pt_store_loc.rm_id',"");
		}
		
		View.panels.get('abWhForm').setFieldValue('pt_store_loc.site_id',selectValue);
	}
}