var rplmDocumentsController = View.createController('rplmDocuments', {
    
    documentsGrid_onDelete: function(row){
        var dataSource = this.dsDocuments;
        var record = row.getRecord();
        var reportPanel = this.documentsGrid;
        View.confirm(getMessage('message_document_confirmdelete'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    reportPanel.refresh(reportPanel.restriction);
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        })
    },
	addEditDoc_onSave:function(){
		var isNewRecord = this.addEditDoc.newRecord;
		if(isNewRecord){
			this.addEditDoc.setFieldValue('docs_assigned.ls_id' , View.controllers.get('abRplmLsAdminAddEditLeaseTemplate_ctrl').ls_id);
		}
		this.addEditDoc.save();
		this.documentsGrid.refresh();
		if(!isNewRecord){
			this.addEditDoc.closeWindow();
		}
	},
	
    documentsGrid_onView: function(row){
		View.showDocument({'doc_id':row.getFieldValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getFieldValue('docs_assigned.doc'));
     }
})
