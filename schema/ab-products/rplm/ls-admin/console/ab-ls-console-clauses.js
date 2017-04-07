var abRepmLeaseDetails_tabClausesController = View.createController('abRepmLeaseDetails_tabClausesController', {
    
	lsId: null,

	refreshView: function(lsId){
		this.lsId = lsId;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_resp.ls_id', this.lsId, '=');
		this.gridLeaseAdminClauses.refresh(restriction);
		
	},
    
	gridLeaseAdminClauses_onCostProfile: function(){
		var leaseId = this.lsId;
		
		View.openDialog('ab-repm-cost-ls-profile.axvw', null, false, {
			width: 1024,
			height: 800,
			lsId: leaseId
		});
	},
	
    gridLeaseAdminClauses_onDelete: function(row){
        var dataSource = this.dsLeaseAdminClauses;
        var record = row.getRecord();
        var reportPanel = this.gridLeaseAdminClauses;
        View.confirm(getMessage('message_clause_confirmdelete'), function(button){
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
    gridLeaseAdminClauses_onNew: function(){
        this.add_edit_item(this.lsId,  null, 0,  getMessage('add_new_clause'));
    },
    
    add_edit_item: function(lsId, respId, matchLeaseDates,  title){
    	var itemId = null;
    	var itemType = null;
    	var leaseRecord = getLeaseRecord(lsId);
    	if (valueExistsNotEmpty(leaseRecord.getValue('ls.bl_id'))) {
    		itemId = leaseRecord.getValue('ls.bl_id');
    		itemType = 'BUILDING';
    	}else if (valueExistsNotEmpty(leaseRecord.getValue('ls.pr_id'))) {
    		itemId = leaseRecord.getValue('ls.pr_id');
    		itemType = 'PROPERTY';
    	}
    	
    	
    	
        View.openDialog('ab-rplm-lsadmin-add-edit-clause.axvw', null, true, {
            width: 800,
            height: 700,
            closeButton: true,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('rplmClause');
                dialogController.selectedId = respId;
                dialogController.leaseId = lsId;
                dialogController.itemId = itemId;
                dialogController.itemType = itemType;
                dialogController.refreshPanels = new Array('gridLeaseAdminClauses');
                dialogController.formClause.setTitle(title);
                if (respId == null) {
                    dialogController.formClause.refresh(null, true);
                    //dialogController.formClause.setFieldValue('cost_tran_recur.cost_cat_id', 'RENT - BASE RENT');
                    dialogController.formClause.setFieldValue('ls_resp.date_start', '');
                    dialogController.formClause.setFieldValue('ls_resp.date_end', '');
                }
                else {
                    dialogController.formClause.refresh({
                        'ls_resp.resp_id': respId,
                        'ls_resp.ls_id': lsId
                    }, false);
                    dialogController.formClause.enableField('ls_resp.resp_id', false);
                }
                if (matchLeaseDates == 1) {
                    dialogController.formClause.enableField('ls_resp.date_start', false);
                    dialogController.formClause.enableField('ls_resp.date_end', false);
                }
                
                var clauseType = dialogController.formClause.getFieldValue('ls_resp.clause_type_id');
                
                if (clauseType == 'Amenity') {
                    dialogController.formClause.fields.get('ls_resp.description').actions.items[0].enable(true);
                }
                else {
                    dialogController.formClause.fields.get('ls_resp.description').actions.items[0].enable(false);
                }
            }
        });
    }
});

function onOpenClauseDoc(ctx){
	var record = ctx.row.record;
    View.showDocument({
        'ls_id': record['ls_resp.ls_id'],
        'resp_id': record['ls_resp.resp_id']
    }, 'ls_resp', 'doc', record['ls_resp.doc']);
	
}

function onEditClause(ctx){
	if (valueExists(ctx.row)) {
		var lsId = ctx.row.getFieldValue('ls_resp.ls_id');
		var respId = ctx.row.getFieldValue('ls_resp.resp_id');
		var matchLeaseDates = ctx.row.getFieldValue('ls_resp.dates_match_lease');
		var controller = View.controllers.get('abRepmLeaseDetails_tabClausesController');
		controller.add_edit_item(lsId, respId, matchLeaseDates, getMessage('edit_clause'));
		
	}
}

/**
 * get lease start / end dates
 * @param leaseId lease code
 * @returns record
 */
function getLeaseRecord(leaseId){
	var record = null;
	var params = {
			tableName: 'ls',
			fieldNames: toJSON(['ls.ls_id', 'ls.bl_id', 'ls.pr_id']),
			restriction: toJSON({
				'ls.ls_id': leaseId
			})
	};
	try{
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if(result.code == 'executed'){
			record = result.dataSet;
		}
		return record;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}

