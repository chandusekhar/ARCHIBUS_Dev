var rplmOptionsController = View.createController('rplmOptions', {
    openerPanel: null,
    openerController: null,
    action: null,
    actionType: null,
    itemId: null,
    itemType: null,
    itemIsOwned: null,
    leaseId: null,
    leaseType: null,
    wizard: null,
    contentDisabled: null,
    afterInitialDataFetch: function(){
        if (View.getOpenerView().controllers.get('portfAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
        }
        if (View.getOpenerView().controllers.get('leaseAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
        }
        if (View.controllers.get('tabsLeaseAdminMngByLocation') != undefined) {
        	this.buttonsPanelOptions.show(false, true);
            this.openerController = View.controllers.get('tabsLeaseAdminMngByLocation');
            this.openerPanel = View.panels.get('tabsLeaseAdminMngByLocation');
        }
        if (this.openerPanel.wizard.getAction() == null) {
            // clean wizard object
            this.openerPanel.wizard.reset()
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
    },
    gridLeaseAdminOptions_onEdit: function(row){
        this.add_edit_item(row, getMessage('edit_option'));
    },
    gridLeaseAdminOptions_onDocument: function(row){
		/*
		 * 03/31/2009 IOAN kb 3026733
		 */
		View.showDocument({'op_id':row.getFieldValue('op.op_id'), 'ls_id':row.getFieldValue('op.ls_id')},'op','doc',row.getFieldValue('op.doc'));
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
        this.add_edit_item(null, getMessage('add_new_option'));
    },
    buttonsPanelOptions_onBack: function(){
        this.openerController.navigate('backward');
    },
    buttonsPanelOptions_onContinue: function(){
        this.openerController.navigate('forward');
    },
    buttonsPanelOptions_onFinish: function(){
		this.openerPanel.tabs[0].loadView();
        this.openerController.afterInitialDataFetch();
        this.openerController.navigateToTab(0);
    },
    initVariables: function(openerPanel, openerController){
        this.openerController = openerController;
        this.openerPanel = openerPanel;
        this.wizard = this.openerPanel.wizard;
        this.action = this.wizard.getAction();
        this.actionType = this.wizard.getActionType();
        this.itemId = this.wizard.getItemId();
        this.itemType = this.wizard.getItemType();
        this.itemIsOwned = this.wizard.getItemIsOwned();
        this.leaseId = this.wizard.getLeaseId();
        this.leaseType = this.wizard.getLeaseType();
        this.contentDisabled = this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
        
    },
    restoreSettings: function(){
        if (View.controllers.get('tabsLeaseAdminMngByLocation') != undefined) {
        	this.buttonsPanelOptions.show(false, true);
        }

    	if (this.leaseId == null) 
            this.gridLeaseAdminOptions.refresh('op.op_id = null');
        else 
            this.gridLeaseAdminOptions.refresh({
                'op.ls_id': this.leaseId
            });
    },
    add_edit_item: function(row, title){
        var selectedId = (row != null ? row.getFieldValue('op.op_id') : null);
        var dateRestriction = (row != null ? row.getFieldValue('op.dates_match_lease') : 0);
        var leaseId = this.leaseId;
        View.openDialog('ab-rplm-lsadmin-add-edit-option.axvw', null, true, {
            width: 800,
            height: 700,
            closeButton: true,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('rplmOption');
                dialogController.selectedId = selectedId;
                dialogController.leaseId = leaseId;
                dialogController.refreshControllers = new Array('rplmOptions');
                dialogController.formOption.setTitle(title);
                if (selectedId == null) {
					/*
					 * 03/29/2010 IOAN KB 3026736
					 */
					dialogController.formOption.refresh({'op.ls_id':leaseId}, true);
                    //dialogController.formClause.setFieldValue('cost_tran_recur.cost_cat_id', 'RENT - BASE RENT');
                    dialogController.formOption.setFieldValue('op.date_option_introduced', '');
                    dialogController.formOption.setFieldValue('op.date_start', '');
                    dialogController.formOption.setFieldValue('op.date_exercised', '');
                    dialogController.formOption.setFieldValue('op.date_review', '');
                    dialogController.formOption.setFieldValue('op.date_option', '');
                    dialogController.formOption.setFieldValue('op.date_exercising_applicable', '');
                }
                else {
                    dialogController.formOption.refresh({'op.op_id':selectedId, 'op.ls_id':leaseId}, false);
                    dialogController.formOption.enableField('op.op_id', false);
                }
                if (dateRestriction == 1) {
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
})
