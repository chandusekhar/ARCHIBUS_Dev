var controller = View.createController('serviceDeskWorkflowSubstitutesController',{
	
	detailsPanel_onSave: function(){
		//first check if em + substitute_em or cf + substitute_cf are entered
		if(valueExistsNotEmpty(this.detailsPanel.getFieldValue("workflow_substitutes.em_id")) && valueExistsNotEmpty(this.detailsPanel.getFieldValue("workflow_substitutes.substitute_em_id"))){
			this.detailsPanel.setFieldValue("workflow_substitutes.cf_id",'');
			this.detailsPanel.setFieldValue("workflow_substitutes.substitute_cf_id",'');			
		} else if(valueExistsNotEmpty(this.detailsPanel.getFieldValue("workflow_substitutes.cf_id")) && valueExistsNotEmpty(this.detailsPanel.getFieldValue("workflow_substitutes.substitute_cf_id"))){
			this.detailsPanel.setFieldValue("workflow_substitutes.em_id",'');
			this.detailsPanel.setFieldValue("workflow_substitutes.substitute_em_id",'');
		} else {
			alert(getMessage("invalidInput"));
			return;
		}
		//then save
		this.detailsPanel.save();
		this.treePanel.refresh();
	}
});