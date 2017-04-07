var rplmAmendmentsController = View.createController('rplmAmendments',{
	openerPanel:null,
	openerController:null,
	action:null,
	actionType:null,
	itemId:null,
	itemType:null,
	itemIsOwned:null,
	leaseId:null,
	leaseType:null,
	wizard:null,
	contentDisabled:null,
	afterInitialDataFetch: function(){
		if(View.getOpenerView().controllers.get('portfAdminWizard') != undefined){
			this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
			this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
		}
		if(View.getOpenerView().controllers.get('leaseAdminWizard') != undefined){
			this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
			this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
		}
		if(View.controllers.get('tabsLeaseAdminMngByLocation') != undefined){
			this.buttonsPanelAmendments.show(false, true);
			this.openerController = View.controllers.get('tabsLeaseAdminMngByLocation');
			this.openerPanel = View.panels.get('tabsLeaseAdminMngByLocation');
		}
		if(this.openerPanel.wizard.getAction() == null){
			// clean wizard object
			this.openerPanel.wizard.reset()
		}
		this.initVariables(this.openerPanel, this.openerController);
		this.restoreSettings();
	},
	gridLeaseAdminAmendments_onEdit: function(row){
		this.add_edit_item(row ,getMessage('edit_amendment'));
	},
	gridLeaseAdminAmendments_onDocument: function(row){
		/*
		 * 03/31/2009 IOAN kb 3026733
		 */
		View.showDocument({'ls_amend_id':row.getFieldValue('ls_amendment.ls_amend_id')},'ls_amendment','doc',row.getFieldValue('ls_amendment.doc'));
	},
	gridLeaseAdminAmendments_onDelete: function(row){
		var dataSource = this.dsLeaseAdminAmendments;
		var record = row.getRecord();
		var reportPanel = this.gridLeaseAdminAmendments;
		View.confirm(getMessage('message_amendment_confirmdelete'), function(button){
			if(button == 'yes'){
                try {
					dataSource.deleteRecord(record);
					reportPanel.refresh(reportPanel.restriction);
                } catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
				
			}
		})
	},
	gridLeaseAdminAmendments_onNew: function(){
		this.add_edit_item(null ,getMessage('add_new_amendment'));
	},
	buttonsPanelAmendments_onBack: function(){
		this.openerController.navigate('backward');
	},
	buttonsPanelAmendments_onFinish: function(){
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
		if(View.controllers.get('tabsLeaseAdminMngByLocation') != undefined){
			this.buttonsPanelAmendments.show(false, true);
		}
		if (this.leaseId != null) {
			this.gridLeaseAdminAmendments.refresh({
				'ls_amendment.ls_id': this.leaseId
			});
		}else{
			this.gridLeaseAdminAmendments.refresh('ls_amendment.ls_amend_id IS NULL');
		}
	},
	add_edit_item: function(row, title){
		var selectedId = (row != null?row.getFieldValue('ls_amendment.ls_amend_id'):null);
		var leaseId = this.leaseId;
		View.openDialog('ab-rplm-lsadmin-add-edit-amendment.axvw',null, true, {
			width:800,
			height:700, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('rplmAmendment');
					dialogController.selectedId = selectedId;
					dialogController.leaseId = leaseId;
					dialogController.refreshControllers = new Array('rplmAmendments');
					dialogController.formAmendment.setTitle(title);
					if(selectedId == null){
						dialogController.formAmendment.refresh(null, true);
						//dialogController.formClause.setFieldValue('cost_tran_recur.cost_cat_id', 'RENT - BASE RENT');
					}
					else{
						dialogController.formAmendment.refresh({'ls_amendment.ls_amend_id':selectedId}, false);
					}
				}
		});
	}
})