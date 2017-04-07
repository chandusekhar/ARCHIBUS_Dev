var abDefineBuilding_tabDocumentsController = View.createController('abDefineBuilding_tabDocumentsController', {
	blId: null,
	
	restriction: null,
	
	newRecord: null,
	
	afterInitialDataFetch: function () {
		this.refreshRestriction();
	},
	
	refreshRestriction: function() {
		var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
		if (tabs && valueExists(tabs.restriction)) {
			this.restriction = tabs.restriction;
			this.blId = this.restriction.clauses[0].value;
		}
		if (tabs && valueExists(tabs.newRecord)) {
			this.newRecord = tabs.newRecord;
		}
		
		if (this.newRecord) {
			this.abDefineBuilding_documents.refresh(null, this.newRecord);
			this.abDefineBuilding_documentsGrid.newRcord = this.newRecord;
			this.abDefineBuilding_documentsGrid.show(false);
		} else {
			this.abDefineBuilding_documents.refresh(this.restriction);
			this.abDefineBuilding_documentsGrid.refresh(this.restriction);
		}
	},
	
	abDefineBuilding_documentsGrid_onNew: function(){
        if (this.blId != null) {
            addEditDoc(null, this.blId, 'BUILDING', getMessage('add_new'));
        }
    },
    abDefineBuilding_documentsGrid_onEdit: function(row){
        if (this.blId != null) {
            addEditDoc(row, this.blId, 'BUILDING', getMessage('edit'));
        }
    },
    abDefineBuilding_documentsGrid_onDelete: function(row){
        var dataSource = this.ds_abDefineBuildingDocuments_docs;
        var record = row.getRecord();
        var gridPanel = this.abDefineBuilding_documentsGrid;
        View.confirm(getMessage('message_document_confirmdelete'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    gridPanel.refresh(gridPanel.restriction);
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        })
    },
    abDefineBuilding_documentsGrid_onView: function(row){
		View.showDocument({'doc_id':row.getFieldValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getFieldValue('docs_assigned.doc'));
    }
});

function addEditDoc(row, itemId, itemType, title){
    View.openDialog('ab-rplm-add-edit-document.axvw', null, true, {
        width: 800,
        height: 400,
        closeButton: true,
        afterInitialDataFetch: function(dialogView){
            var dialogController = dialogView.controllers.get('addEditDoc');
            dialogController.itemId = itemId;
            dialogController.itemType = itemType;
            dialogController.addEditDoc.setTitle(title)
            if (row != null) {
                dialogController.docId = row.getFieldValue('docs_assigned.doc_id');
                dialogController.addEditDoc.refresh({
                    'docs_assigned.doc_id': row.getFieldValue('docs_assigned.doc_id')
                }, false);
            }
            else {
                dialogController.docId = null;
                dialogController.addEditDoc.newRecord = true;
            }
            dialogController.refreshPanels = new Array('abDefineBuilding_documentsGrid');
        }
    });
}

function setNewRestrictionForTabs() {
	var form = abDefineBuilding_tabDocumentsController.abDefineBuilding_documents;
	setRestrictionForTabs(abDefineBuilding_tabDocumentsController, form);
}