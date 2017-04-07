var abEhsTrackDocumentationCtrl = View.createController('abEhsTrackDocumentationCtrl',{
 	
	/*
	abEhsTrackDocumentation_form_beforeSave: function(){ 
		// check required fields	
		if (this.abEhsTrackDocumentation_form.getFieldValue("docs_assigned.training_id") == '' && this.abEhsTrackDocumentation_form.getFieldValue("docs_assigned.ppe_type_id") == ''
			&& this.abEhsTrackDocumentation_form.getFieldValue("docs_assigned.medical_monitoring_id") == '' && this.abEhsTrackDocumentation_form.getFieldValue("docs_assigned.incident_id") == ''
			&& this.abEhsTrackDocumentation_form.getFieldValue("docs_assigned.restriction_id") == '') {
			
			View.showMessage(getMessage("relatedFieldRequired"));
			return false;
		}
				
		return true;		
	},*/
	
	abEhsTrackDocumentation_form_onCancel: function(){ 
		// get top controller
		if (!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		} 
		// after save
		this.topCtrl.needRefreshSelectList = true;
		
		//Call function of top controller to select first tab
		this.topCtrl.selectFirstTab();
	},
	
	abEhsTrackDocumentation_form_afterRefresh: function() {
		if (this.abEhsTrackDocumentation_form.newRecord) {
			this.abEhsTrackDocumentation_form.setFieldValue('docs_assigned.doc_author', View.user.employee.id);
			var today = Date();
			var uiToday = this.abEhsTrackDocumentation_ds.parseValue('docs_assigned.date_doc', today, true);
			this.abEhsTrackDocumentation_form.setFieldValue('docs_assigned.date_doc', uiToday);
		}
	}
	
});	 

