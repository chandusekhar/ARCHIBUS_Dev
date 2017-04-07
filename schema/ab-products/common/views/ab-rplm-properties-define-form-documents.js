var abPropertiesDefineForm_tabDocumentsController = View.createController('abPropertiesDefineForm_tabDocumentsController', {
	prId: null,
	
	afterInitialDataFetch: function () {
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		var newRecord = tabs.parameters.newRecord;
		var tabsRestriction = tabs.parameters.restriction;
		
		if(newRecord){
			this.abPropertiesDefineForm_documents.newRecord = newRecord;
			this.abPropertiesDefineForm_documents.show();
			this.abPropertiesDefineForm_documentsGrid.show(false);
		}else{
			if(tabsRestriction){
				if(tabsRestriction["property.pr_id"]) {
					restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
					this.prId = tabsRestriction["property.pr_id"];
				} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
					restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
					this.prId = tabsRestriction.clauses[0].value;
				}
			}
			this.abPropertiesDefineForm_documents.refresh(restriction);
			this.abPropertiesDefineForm_documentsGrid.refresh(restriction);
		}
	},
	
	abPropertiesDefineForm_documents_beforeRefresh: function() {
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		
		if(tabs) {
			var newRecord = tabs.parameters.newRecord;
			var tabsRestriction = tabs.parameters.restriction;
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abPropertiesDefineForm_documents.newRecord = newRecord;
				this.abPropertiesDefineForm_documentsGrid.show(false);
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["property.pr_id"]) {
						restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
						this.prId = tabsRestriction["property.pr_id"];
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
						this.prId = tabsRestriction.clauses[0].value;
					}
				}
				this.abPropertiesDefineForm_documents.restriction = restriction;
				this.abPropertiesDefineForm_documentsGrid.refresh(restriction);
			}
		}
	},
	
	abPropertiesDefineForm_documents_onSave: function() {
		var propertyForm = this.abPropertiesDefineForm_documents;
		if (valueExistsNotEmpty(propertyForm.record.getValue("property.pr_id"))) {
			beforeSaveProperty(this);
			var isSaved = propertyForm.save();
			setTimeout(function(){
				if (isSaved){
					afterSaveProperty(abPropertiesDefineForm_tabDocumentsController, propertyForm);
					propertyForm.refresh();
				}
			}, 1000);
		} else {
			View.alert(getMessage("missingPrId"));
		}
	},
	
	abPropertiesDefineForm_documentsGrid_onNew: function(){
        if (this.prId != null) {
            addEditDoc(null, this.prId, 'LAND', getMessage('add_new'));
        }
    },
    abPropertiesDefineForm_documentsGrid_onEdit: function(row){
        if (this.prId != null) {
            addEditDoc(row, this.prId, 'LAND', getMessage('edit'));
        }
    },
    abPropertiesDefineForm_documentsGrid_onDelete: function(row){
        var dataSource = this.ds_abPropertiesDefineFormDocuments;
        var record = row.getRecord();
        var gridPanel = this.abPropertiesDefineForm_documentsGrid;
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
    abPropertiesDefineForm_documentsGrid_onView: function(row){
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
            dialogController.refreshPanels = new Array('abPropertiesDefineForm_documentsGrid');
        }
    });
}