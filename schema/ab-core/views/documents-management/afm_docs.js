/**
 * Yong Shao 
 * Used by afm_docs.axvw to collect data from UI and call WFRs to archive or un-archive document records
 */
var controller = View.createController('afm_docs_controller', {
	//ARCHIVE
	afm_docs_panel_onArchive: function(){
		this.afm_docs_panel_archive.refresh();
		this.afm_docs_panel_archive.showInWindow({
            width: 400, 
            height: 200,
            closeButton:false
        });
	},
	afm_docs_panel_archive_onCancel: function(){
		this.afm_docs_panel_archive.closeWindow();
	},
	afm_docs_panel_archive_onOk: function(){
		this.afm_docs_panel_archive.clearValidationResult();
		var tableName = this.afm_docs_panel_archive.getFieldValue("afm_docs.table_name");
		var lock_date = this.afm_docs_panel_archive.getFieldValue("afm_docs.lock_date");
		if(!valueExistsNotEmpty(lock_date)){
			return this.requiredFieldValidation(this.afm_docs_panel_archive, "afm_docs.lock_date", "");
		}
	
		 try {
			 Workflow.startJob("AbSystemAdministration-archiveDocument-archive", tableName, lock_date);
		 } catch (e) {
	            Workflow.handleError(e);
	     }
		
		this.afm_docs_panel_archive.closeWindow();
	},
	
	//UNARCHIVE
	afm_docs_panel_onUnArchive: function(){
		this.afm_docs_panel_unarchive.refresh();
		this.afm_docs_panel_unarchive.showInWindow({
            width: 400, 
            height: 200,
            closeButton:false
        });
	},
	afm_docs_panel_unarchive_onCancel: function(){
		this.afm_docs_panel_unarchive.closeWindow();
	},
	afm_docs_panel_unarchive_onOk: function(){
		this.afm_docs_panel_unarchive.clearValidationResult();
		var tableName = this.afm_docs_panel_unarchive.getFieldValue("afm_docversarch.table_name");
		if(!valueExistsNotEmpty(tableName)){
			return this.requiredFieldValidation(this.afm_docs_panel_unarchive, "afm_docversarch.table_name", "");
		}
		var field_name = this.afm_docs_panel_unarchive.getFieldValue("afm_docversarch.field_name");
		if(!valueExistsNotEmpty(field_name)){
			return this.requiredFieldValidation(this.afm_docs_panel_unarchive, "afm_docversarch.field_name", "");
		}
		var pkey_value = this.afm_docs_panel_unarchive.getFieldValue("afm_docversarch.pkey_value");
		if(!valueExistsNotEmpty(pkey_value)){
			return this.requiredFieldValidation(this.afm_docs_panel_unarchive, "afm_docversarch.pkey_value", "");
		}
		
		 try {
			 Workflow.startJob("AbSystemAdministration-archiveDocument-unArchive", tableName, field_name, pkey_value);
		 } catch (e) {
	            Workflow.handleError(e);
	     }
		
		this.afm_docs_panel_unarchive.closeWindow();
	},
	
	requiredFieldValidation:function(form, fieldName, message){
		form.clearValidationResult();
		form.addInvalidField(fieldName, message);
		form.displayValidationResult();
		return false;
	}
});

