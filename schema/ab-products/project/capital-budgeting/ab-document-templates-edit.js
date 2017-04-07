var documentTemplatesEditController = View.createController('documentTemplatesEdit', {
    
	documentTemplatesEdit_detailsForm_onSave: function() {
    	if (!this.documentTemplatesEdit_detailsForm.save()) return;
        var restriction = this.documentTemplatesEdit_detailsForm.getFieldRestriction();
        this.documentTemplatesEdit_tabs.selectTab('documentTemplatesEdit_docPage', restriction);
    }
});