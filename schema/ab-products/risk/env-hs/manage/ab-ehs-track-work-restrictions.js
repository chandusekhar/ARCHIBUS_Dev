var abEhsTrackWorkRestrictionsCtrl = View.createController('abEhsTrackWorkRestrictionsCtrl', {
	
	/**
	 * On filter event handler.
	 */
	abEhsTrackWorkRestrictions_filter_onFilter: function(){
		var emId = this.abEhsTrackWorkRestrictions_filter.getFieldValue('ehs_restrictions.em_id');
		if(!validateFilter("abEhsTrackWorkRestrictions_filter") || !validateEmId(emId)){
			return;
		}
		
		var restriction = new Ab.view.Restriction({"ehs_restrictions.em_id": emId});
		
		this.abEhsTrackWorkRestrictions_grid.refresh(restriction);
		this.abEhsTrackWorkRestrictions_edit.show(false);
	},
	
	abEhsTrackWorkRestrictions_edit_afterRefresh: function(){
		enableDisableRestrictionDateEnd('abEhsTrackWorkRestrictions_edit');
		this.abEhsTrackWorkRestrictions_edit.enableField("ehs_restrictions.date_actual", false);
		this.clearDefaultFormFieldValue('abEhsTrackWorkRestrictions_edit','ehs_restrictions.lost_work_days');
	},
	
	/**
	 * Clears Date Related Monitoring field if the user cleared the Related Medical Mon. Code field
	 */
	clearDateActual: function(){
		if(!valueExistsNotEmpty(this.abEhsTrackWorkRestrictions_edit.getFieldValue("ehs_restrictions.medical_monitoring_id"))){
			this.abEhsTrackWorkRestrictions_edit.fields.get("ehs_restrictions.date_actual").clear();
		}
	},
	
	/**
	 * Removes value from specified form's field if value matches the default specified in afm_flds
	 */
	clearDefaultFormFieldValue: function(panelName, fieldName){
		var panel = View.panels.get(panelName);
		var defaultRecord = panel.getDataSource().getDefaultRecord();		
		var testValue = defaultRecord.getValue(fieldName);
		if (panel.getFieldValue(fieldName)==testValue){
			panel.fields.get(fieldName).clear();
		}
	}
});

function onDelete(){
	var controller = abEhsTrackWorkRestrictionsCtrl;
	View.confirm(getMessage('confirmDelete'), function(button){
        if (button == 'yes') {
            var dataSource = controller.abEhsTrackWorkRestrictions_edit.getDataSource();
        	var restrictionId = controller.abEhsTrackWorkRestrictions_edit.getFieldValue("ehs_restrictions.restriction_id");
        	var record = new Ab.data.Record({"ehs_restrictions.restriction_id": restrictionId}, false);
        	try{
        		dataSource.deleteRecord(record);
                controller.abEhsTrackWorkRestrictions_grid.refresh();
                controller.abEhsTrackWorkRestrictions_edit.show(false);
        	} catch (e){
        		Workflow.handleError(e);
        	}
        }
    });
}
