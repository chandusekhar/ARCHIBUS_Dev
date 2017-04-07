var abRepmLeaseDetails_tabDocumentsController = View.createController('abRepmLeaseDetails_tabDocumentsController', {
	
	lsId: null,
	
	refreshView: function(lsId){
		this.lsId = lsId;
		this.abLsConsoleDocs_list.addParameter('typeLabelClause', getMessage('paramLabel_clause'));
		this.abLsConsoleDocs_list.addParameter('typeLabelOption', getMessage('paramLabel_option'));
		this.abLsConsoleDocs_list.addParameter('typeLabelAmendment', getMessage('paramLabel_amendment'));
		this.abLsConsoleDocs_list.addParameter('typeLabelCommLog', getMessage('paramLabel_comm_log'));
		this.abLsConsoleDocs_list.addParameter('typeLabelDocument', getMessage('paramLabel_document'));
		this.abLsConsoleDocs_list.addParameter('lsCode', this.lsId);
		this.abLsConsoleDocs_list.refresh();
	},
	
	abLsConsoleDocs_list_onNew: function(){
		var controller = this;
		addEditDoc(null, this.lsId, 'LEASE', getMessage('add_new_doc'), new Array('abLsConsoleDocs_list'), function(){
			controller.refreshView(controller.lsId);
		});
	},
	
	editRow: function(record) {
		var detailForm = this.getDetailsForm(record['docs_assigned.type']);
		var restriction = this.getDetailsFormRestriction(record);
		
		var dialogConfig = {
				width: 600,
				height: 200,
				closeButton: false
		};
		
		detailForm.refresh(restriction, false);
		detailForm.showInWindow(dialogConfig);
		
	},
	
	getDetailsForm: function(recordType) {
		var objForm = null;
		if (recordType == 'clause') {
			objForm = View.panels.get('abLsConsoleClause_form');
		} else if (recordType == 'option') {
			objForm = View.panels.get('abLsConsoleOption_form');
		} else if (recordType == 'amendment') {
			objForm = View.panels.get('abLsConsoleAmendment_form');
		} else if (recordType == 'comm_log') {
			objForm = View.panels.get('abLsConsoleCommLog_form');
		}else if (recordType == 'document') {
			objForm = View.panels.get('abLsConsoleDocAssigned_form');
		}
		return objForm;
	},
	
	getDetailsFormRestriction: function(record){
		var recordType = record['docs_assigned.type'];
		var leaseId = record['docs_assigned.ls_id'];
		var pKey = record['docs_assigned.doc_pk'];
		var restriction = new Ab.view.Restriction();
		
		if (recordType == 'clause') {
			restriction.addClause('ls_resp.ls_id', leaseId, '=');
			restriction.addClause('ls_resp.resp_id', pKey, '=');
		} else if (recordType == 'option') {
			restriction.addClause('op.ls_id', leaseId, '=');
			restriction.addClause('op.op_id', pKey, '=');
		} else if (recordType == 'amendment') {
			restriction.addClause('ls_amendment.ls_id', leaseId, '=');
			restriction.addClause('ls_amendment.ls_amend_id', parseInt(pKey), '=');
		} else if (recordType == 'comm_log') {
			restriction.addClause('ls_comm.ls_id', leaseId, '=');
			restriction.addClause('ls_comm.auto_number', parseInt(pKey), '=');
		}else if (recordType == 'document') {
			restriction.addClause('docs_assigned.ls_id', leaseId, '=');
			restriction.addClause('docs_assigned.doc_id', parseInt(pKey), '=');
		}
		
		return restriction;
	}
});

function refreshDocTabs(){
	var mainController = View.controllers.get('abRepmAddeditSelectLeaseController');
	if (mainController && mainController.displayMode == 'standard') {
		// refresh clause
		var clauseController = View.controllers.get('abRepmLeaseDetails_tabClausesController');
		if (clauseController) {
			clauseController.gridLeaseAdminClauses.refresh(clauseController.gridLeaseAdminClauses.restriction);
		}
		// refresh option
		var optionController = View.controllers.get('abRepmLeaseDetails_tabOptionsController');
		if (optionController) {
			optionController.gridLeaseAdminOptions.refresh(clauseController.gridLeaseAdminOptions.restriction);
		}
		// refresh amendment
		var amendmentController = View.controllers.get('abRepmLeaseDetails_tabAmendmentsController');
		if (amendmentController) {
			amendmentController.gridLeaseAdminAmendments.refresh(clauseController.gridLeaseAdminAmendments.restriction);
		}
		// refresh comm_log
		var commLogController = View.controllers.get('abRepmLeaseDetails_tabComLogsController');
		if (commLogController) {
			commLogController.abRepmLsadminCommLogGrid.refresh(clauseController.abRepmLsadminCommLogGrid.restriction);
		}
		
	}
}

function onClosePopup(ctx){
	var parentPanel = View.panels.get(ctx.command.parentPanelId);
	var controller = View.controllers.get('abRepmLeaseDetails_tabDocumentsController');
	controller.refreshView(controller.lsId);
	refreshDocTabs();
	parentPanel.closeWindow();
}

function onEditDocument(ctx){
	var record = ctx.row.record;
	var controller = View. controllers.get('abRepmLeaseDetails_tabDocumentsController');
	controller.editRow(record);
}

function addEditDoc(row, itemId, itemType, title, refreshPanels, callbackMethod){
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
            dialogController.refreshPanels = refreshPanels;
        }, 
        callback: function(res){
        	if (valueExists(callbackMethod)) {
        		callbackMethod.call();
        	}
        }
    });
}


function onOpenDocument(ctx) {
	var restriction = null;
	var tableName = null;
	var docFieldName = null;
	var docFieldValue = null;

	var record = ctx.row.record; 
	var recordType = record['docs_assigned.type'];
	var docPkValue = record['docs_assigned.doc_pk'];
	var docFieldValue = record['docs_assigned.doc'];
	var lsId = View.controllers.get('abRepmLeaseDetails_tabDocumentsController').lsId;

	if (recordType == 'clause') {
		tableName = 'ls_resp';
		docFieldName = 'doc';
		restriction = {'resp_id': record['docs_assigned.doc_pk'], 'ls_id': lsId};
	} else if (recordType == 'option') {
		tableName = 'op';
		docFieldName = 'doc';
		restriction = {'op_id': record['docs_assigned.doc_pk'], 'ls_id': lsId};
	} else if (recordType == 'amendment') {
		tableName = 'ls_amendment';
		docFieldName = 'doc';
		restriction = {'ls_amend_id': record['docs_assigned.doc_pk']};
	} else if (recordType == 'comm_log') {
		tableName = 'ls_comm';
		docFieldName = 'doc';
		restriction = {'auto_number': record['docs_assigned.doc_pk']};
	}else if (recordType == 'document') {
		tableName = 'docs_assigned';
		docFieldName = 'doc';
		restriction = {'doc_id': record['docs_assigned.doc_pk']};
	}
	

	View.showDocument(restriction,tableName,docFieldName,docFieldValue);
}