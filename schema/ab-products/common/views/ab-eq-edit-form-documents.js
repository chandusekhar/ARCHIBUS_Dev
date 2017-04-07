var abEquipmentForm_tabDocumentsController = View.createController('abEquipmentForm_tabDocumentsController', {
    eqId: null,
    afterInitialDataFetch: function () {
        if (valueExists(View.getOpenerView())) {
            var openerConsole = View.getOpenerView();
            var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
            if (tabs) {
                var newRecord = tabs.parameters.newRecord;
                if (!newRecord) {
                    newRecord = View.newRecord;
                }
                var tabsRestriction = tabs.parameters.restriction;
                if (valueExists(newRecord) && newRecord == true) {
                    this.abEqEditForm_Documents.newRecord = newRecord;
                    this.abEqEditForm_Documents.refresh();
                    this.abEqEditForm_documentsGrid.newRecord = newRecord;
                    this.abEqEditForm_documentsGrid.show(false);
                } else if (newRecord == false) {
                    this.abEqEditForm_Documents.newRecord = newRecord;
                    this.abEqEditForm_Documents.refresh(tabsRestriction);
                    this.abEqEditForm_documentsGrid.refresh(tabsRestriction);
                }
            }
        }
    },
    abEqEditForm_Documents_onCancel: function () {
        var docForm = this.abEqEditForm_Documents;
        var detailsPanel = View.getOpenerView().parentViewPanel;
        if (detailsPanel) {
            detailsPanel.loadView('ab-blank.axvw', docForm.restriction, null);
        } else {
            if (View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')) {
                View.getOpenerView().getParentDialog().close();
            }
        }
    },
    abEqEditForm_Documents_beforeRefresh: function () {
        var restriction = new Ab.view.Restriction();
        var newRecord = null;
        var tabsRestriction = null;
        var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
        if (tabs) {
            newRecord = tabs.parameters.newRecord;
            tabsRestriction = tabs.parameters.restriction;
            if (!valueExists(newRecord)) {
                newRecord = View.parameters.newRecord;
                tabsRestriction = View.parameters.restriction;
            }
            if (valueExists(newRecord) && newRecord == true) {
                this.abEqEditForm_Documents.newRecord = newRecord;
                this.abEqEditForm_documentsGrid.newRecord = newRecord;
                this.abEqEditForm_documentsGrid.show(false);
            } else {
                if (tabsRestriction) {
                    if (tabsRestriction["eq.eq_id"]) {
                        restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
                    } else if (tabsRestriction.clauses && tabsRestriction.clauses[0]) {
                        restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
                    }
                    var eqClause = restriction.findClause("eq.eq_id");
                    if (eqClause) {
                        this.eqId = eqClause.value;
                    }
                    this.abEqEditForm_Documents.restriction = restriction;
                    this.abEqEditForm_Documents.newRecord = newRecord;
                    this.abEqEditForm_documentsGrid.refresh(restriction);
                }
            }
        }
    },
    abEqEditForm_Documents_onSave: function () {
        var documentsForm = this.abEqEditForm_Documents;
        var documentsDataSource = this.ds_abEqEditFormDocuments;
        var restriction = new Ab.view.Restriction();
        var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
        var primaryFieldValue = documentsForm.getFieldValue("eq.eq_id");
        var record = documentsForm.getRecord();
        var message = getMessage('formSaved');
        try {
            var isSaved = documentsForm.save();
            if (isSaved) {
                documentsForm.setFieldValue('eq.eq_id', primaryFieldValue);
                restriction.addClause("eq.eq_id", primaryFieldValue);
                this.abEqEditForm_Documents.restriction = restriction;
                afterSaveEquipment(abEquipmentForm_tabDocumentsController, documentsForm);
                documentsForm.refresh(restriction);
                documentsForm.displayTemporaryMessage(message);
            }
        }
        catch (e) {
            var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue) + '<br>' + e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
        }
    },
    abEqEditForm_documentsGrid_onNew: function () {
        if (this.eqId != null) {
            addEditDoc(null, this.eqId, getMessage('add_new'));
        }
    },
    abEqEditForm_documentsGrid_onEdit: function (row) {
        if (this.eqId != null) {
            addEditDoc(row, this.eqId, getMessage('edit'));
        }
    },
    abEqEditForm_documentsGrid_onDelete: function (row) {
        var dataSource = this.ds_abEqEditFormAccociatedDocuments;
        var record = row.getRecord();
        var gridPanel = this.abEqEditForm_documentsGrid;
        View.confirm(getMessage('message_document_confirmdelete'), function (button) {
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
    abEqEditForm_documentsGrid_onView: function (row) {
        View.showDocument({'doc_id': row.getFieldValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getFieldValue('docs_assigned.doc'));
    },
    customCommand: function (form) {
        if (valueExists(this.customActionCommand)) {
            this.customActionCommand(form);
        }
    }
});
function addEditDoc(row, itemId, title) {
    View.openDialog('ab-eq-edit-form-add-edit-documents.axvw', null, true, {
        width: 800,
        height: 400,
        closeButton: true,
        afterInitialDataFetch: function (dialogView) {
            var dialogController = dialogView.controllers.get('addEditDocController');
            dialogController.itemId = itemId;
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
            dialogController.refreshPanels = new Array('abEqEditForm_documentsGrid');
        }
    });
}

