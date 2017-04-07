var rplmClausesController = View.createController('rplmClauses', {
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
        	this.buttonsPanelClauses.show(false, true);
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
    gridLeaseAdminClauses_onEdit: function(row){
        this.add_edit_item(row, getMessage('edit_clause'));
    },
    gridLeaseAdminClauses_onDocument: function(row){
        /*
         * 03/30/2009 IOAN kb 3026733
         */
        View.showDocument({
            'ls_id': row.getFieldValue('ls_resp.ls_id'),
            'resp_id': row.getFieldValue('ls_resp.resp_id')
        }, 'ls_resp', 'doc', row.getFieldValue('ls_resp.doc'));
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
        this.add_edit_item(null, getMessage('add_new_clause'));
    },
    buttonsPanelClauses_onBack: function(){
        this.openerController.navigate('backward');
    },
    buttonsPanelClauses_onContinue: function(){
        this.openerController.navigate('forward');
    },
    buttonsPanelClauses_onFinish: function(){
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
        	this.buttonsPanelClauses.show(false, true);
        }
        if (this.leaseId != null) {
            this.gridLeaseAdminClauses.refresh({
                'ls_resp.ls_id': this.leaseId
            });
        }
        else {
            this.gridLeaseAdminClauses.refresh('ls_resp.resp_id IS NULL');
        }
    },
    add_edit_item: function(row, title){
        var selectedId = (row != null ? row.getFieldValue('ls_resp.resp_id') : null);
        var dateRestriction = (row != null ? row.getFieldValue('ls_resp.dates_match_lease') : 0);
        var leaseId = this.leaseId;
        var itemId = this.itemId;
        var itemType = this.itemType;
        View.openDialog('ab-rplm-lsadmin-add-edit-clause.axvw', null, true, {
            width: 800,
            height: 700,
            closeButton: true,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('rplmClause');
                dialogController.selectedId = selectedId;
                dialogController.leaseId = leaseId;
                dialogController.itemId = itemId;
                dialogController.itemType = itemType;
                dialogController.refreshControllers = new Array('rplmClauses');
                dialogController.formClause.setTitle(title);
                if (selectedId == null) {
                    dialogController.formClause.refresh(null, true);
                    //dialogController.formClause.setFieldValue('cost_tran_recur.cost_cat_id', 'RENT - BASE RENT');
                    dialogController.formClause.setFieldValue('ls_resp.date_start', '');
                    dialogController.formClause.setFieldValue('ls_resp.date_end', '');
                }
                else {
                    dialogController.formClause.refresh({
                        'ls_resp.resp_id': selectedId,
                        'ls_resp.ls_id': leaseId
                    }, false);
                    dialogController.formClause.enableField('ls_resp.resp_id', false);
                }
                if (dateRestriction == 1) {
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
})
