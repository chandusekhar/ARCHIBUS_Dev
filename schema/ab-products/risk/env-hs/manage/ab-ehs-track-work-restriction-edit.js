var abEhsTrackWorkRestrictionEditCtrl = View.createController('abEhsTrackWorkRestrictionEditCtrl', {
	afterInitialDataFetch: function(){
		// get the view parameter date actual
		if(View.parameters.dateActual){
			this.abEhsTrackWorkRestrictionEdit_editWorkRestr.setFieldValue("ehs_restrictions.date_actual", View.parameters.dateActual);
		}
		
		if(valueExistsNotEmpty(this.abEhsTrackWorkRestrictionEdit_editWorkRestr.record.getValue("ehs_restrictions.incident_id"))){
			this.abEhsTrackWorkRestrictionEdit_editWorkRestr.enableField("ehs_restrictions.incident_id", false);
		}
	},
	
	abEhsTrackWorkRestrictionEdit_editWorkRestr_afterRefresh: function(){
		enableDisableRestrictionDateEnd('abEhsTrackWorkRestrictionEdit_editWorkRestr');
		this.abEhsTrackWorkRestrictionEdit_editWorkRestr.enableField("ehs_restrictions.date_actual", false);
	},
	
	afterSave: function(){
		if(this.view.parameters.callback){
			this.view.parameters.callback();
		}
	}
});
