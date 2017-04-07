var abRepmLeaseDetails_tabOptionsController = View.createController('abRepmLeaseDetails_tabOptionsController', {
    lsId: null,

	refreshView: function(lsId){
		this.lsId = lsId;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('op.ls_id', this.lsId, '=');
		this.gridLeaseAdminOptions.refresh(restriction);
		
	},

    gridLeaseAdminOptions_onEdit: function(row){
        this.add_edit_item(row, getMessage('edit_option'));
    },
    
    gridLeaseAdminOptions_onDelete: function(row){
        var dataSource = this.dsLeaseAdminOptions;
        var record = row.getRecord();
        var reportPanel = this.gridLeaseAdminOptions;
        View.confirm(getMessage('message_option_confirmdelete'), function(button){
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
    
    gridLeaseAdminOptions_onNew: function(){
        this.add_edit_item(this.lsId, null, 0, getMessage('add_new_option'));
    },

    add_edit_item: function(lsId, opId, matchLeaseDates, title){

        View.openDialog('ab-rplm-lsadmin-add-edit-option.axvw', null, true, {
            width: 800,
            height: 700,
            closeButton: true,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('rplmOption');
                dialogController.selectedId = opId;
                dialogController.leaseId = lsId;
                dialogController.refreshPanels = new Array('gridLeaseAdminOptions');
                dialogController.formOption.setTitle(title);
                if (opId == null) {
					/*
					 * 03/29/2010 IOAN KB 3026736
					 */
					dialogController.formOption.refresh({'op.ls_id':lsId}, true);
                    //dialogController.formClause.setFieldValue('cost_tran_recur.cost_cat_id', 'RENT - BASE RENT');
                    dialogController.formOption.setFieldValue('op.date_option_introduced', '');
                    dialogController.formOption.setFieldValue('op.date_start', '');
                    dialogController.formOption.setFieldValue('op.date_exercised', '');
                    dialogController.formOption.setFieldValue('op.date_review', '');
                    dialogController.formOption.setFieldValue('op.date_option', '');
                    dialogController.formOption.setFieldValue('op.date_exercising_applicable', '');
                }
                else {
                    dialogController.formOption.refresh({'op.op_id':opId, 'op.ls_id':lsId}, false);
                    dialogController.formOption.enableField('op.op_id', false);
                }
                if (matchLeaseDates == 1) {
                    dialogController.formOption.enableField('op.date_start', false);
                    dialogController.formOption.enableField('op.date_option', false);
                }
				if (dialogController.formOption.getFieldValue('op.date_option_introduced')==''){
					var date = new Date();
					dialogController.formOption.setFieldValue('op.date_option_introduced', date.getDate+'/'+date.getMonth+'/'+date.getYear);
				}
            }
        });
    }
});

function onOpenOptionDoc(ctx){
	var record = ctx.row.record;
	View.showDocument({'op_id':record['op.op_id'], 'ls_id':record['op.ls_id']},'op','doc',record['op.doc']);
}

function onEditOption(ctx){
	if (valueExists(ctx.row)) {
		var lsId = ctx.row.getFieldValue('op.ls_id');
		var opId = ctx.row.getFieldValue('op.op_id');
		var matchLeaseDates = ctx.row.getFieldValue('op.dates_match_lease');
		var controller = View.controllers.get('abRepmLeaseDetails_tabOptionsController');
		controller.add_edit_item(lsId, opId, matchLeaseDates, getMessage('edit_option'));
		
	}
}

