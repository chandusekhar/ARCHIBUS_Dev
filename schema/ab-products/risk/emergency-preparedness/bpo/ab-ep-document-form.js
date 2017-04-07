var abEhsTrackDocumentationCtrl = View.createController('abEhsTrackDocumentationCtrl',{
 	
	abEhsTrackDocumentation_form_beforeSave: function(){ 
		// check required field for ep 
		return true;		
	},
	
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
	
	abEhsTrackDocumentation_form_onDelete: function() {
		this.abEhsTrackDocumentation_form.deleteRecord();
		this.abEhsTrackDocumentation_form_onCancel();
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


function onChangeLease(fieldName,selectedValue,previousValue){
	var panel = View.panels.get("abEhsTrackDocumentation_form")
	if (fieldName == "docs_assigned.bl_id" && selectedValue != '') {
		// get the location from the building
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.bl_id", selectedValue);
		var record = View.dataSources.get("buildingDs").getRecord(restriction);
		
		panel.setFieldValue("docs_assigned.state_id", record.getValue("bl.state_id"));
		panel.setFieldValue("docs_assigned.city_id", record.getValue("bl.city_id"));
		panel.setFieldValue("docs_assigned.site_id", record.getValue("bl.site_id"));
		
		
	} else if (fieldName == "docs_assigned.pr_id" && selectedValue != '') {
		// get the location from the property 
		var restriction = new Ab.view.Restriction();
		restriction.addClause("property.pr_id", selectedValue);
		var record = View.dataSources.get("propertyDs").getRecord(restriction);
		
		panel.setFieldValue("docs_assigned.state_id", record.getValue("property.state_id"));
		panel.setFieldValue("docs_assigned.city_id", record.getValue("property.city_id"));
		panel.setFieldValue("docs_assigned.site_id", record.getValue("property.site_id"));
	}	
}