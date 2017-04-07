/**
 * Controller implementation.
 */
var abCbAssessPlacesEditCtrl = View.createController('abCbAssessPlacesEditCtrl', {
	/*
	 * Edit place afterRefresh event. 
	 */
	abCbAssessAddEditPlaceForm_afterRefresh: function(){
		if(!this.abCbAssessAddEditPlaceForm.newRecord)
			return;
		
		// initialise bl_id from the assessment item
	    var parameters = {
	            tableName: 'activity_log',
	            fieldNames: toJSON(['activity_log.bl_id']),
	            restriction: toJSON(this.abCbAssessAddEditPlacesList.restriction)
	        };
	    
		try{
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.code == "executed" && result.data.records.length > 0){
				var blId = result.data.records[0]['activity_log.bl_id'];
				
				this.abCbAssessAddEditPlaceForm.setFieldValue("cb_hcm_places.bl_id", blId);
			}
		}catch (e){
			Workflow.handleError(e);
			return;
		}		
	},
	
	/**
	 * copy as new record
	 */
	abCbAssessAddEditPlaceForm_onCopyAsNew: function(){
		var record = this.abCbAssessAddEditPlaceForm.getRecord();
		// refresh to new record
		this.abCbAssessAddEditPlaceForm.refresh(this.abCbAssessAddEditPlacesList.restriction, true);
		
		this.abCbAssessAddEditPlaceForm.fields.each(function(field){
			var fieldName = field.fieldDef.fullName;
			if(!field.fieldDef.primaryKey){
				var fieldValue = record.getValue(fieldName);
				if(field.fieldDef.isDate){
					fieldValue = record.getLocalizedValue(fieldName);
				}
				field.panel.setFieldValue(fieldName, fieldValue);
			}
		});
	}
});


/**
 * refresh the form to new record
 */
function showFormForNewRecord(context){
	var panel = context.command.getParentPanel();
	panel.refresh(abCbAssessPlacesEditCtrl.abCbAssessAddEditPlacesList.restriction, true);
}
