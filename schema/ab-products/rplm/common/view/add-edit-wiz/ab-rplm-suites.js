var rplmSuiteController = View.createController('rplmSuite',{
	openerPanel:null,
	openerController:null,
	type:null,
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
			this.htmlSuiteAction.show(false, true);
			this.openerController = View.controllers.get('tabsLeaseAdminMngByLocation');
			this.openerPanel = View.panels.get('tabsLeaseAdminMngByLocation');
		}
		this.initVariables(this.openerPanel, this.openerController);
		this.restoreSettings();
	},
	
	htmlSuiteAction_onCancel: function(){
		var tabsController = this.openerController;
		View.confirm(getMessage('message_cancelconfirm'), function(button){
			if(button == 'yes'){
				tabsController.afterInitialDataFetch();
				tabsController.navigateToTab(0);
			}
		})
	},
	
	htmlSuiteAction_onBack: function(){
		this.openerController.navigate('backward');
	},
	
	htmlSuiteAction_onContinue: function(){
		this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
		this.openerController.navigate('forward');
	},
	
	htmlSuiteAction_onFinish: function(){
		this.openerPanel.tabs[0].loadView();
		this.openerController.afterInitialDataFetch();
		this.openerController.navigate('backward');
		
	},
	
	gridSuiteLeaseNotAssigned_deleteUnassigned_onClick: function(row){
		if(this.gridSuiteLeaseNotAssigned.gridRows.getCount()== 1 && this.gridSuiteLease.gridRows.getCount()== 0 && this.gridSuiteLeaseOther.gridRows.getCount()== 0){
			View.showMessage(getMessage('error_delete_one_bl_suite'));
			return;
		}
		var dataSource = this.dsSuiteLeaseNotAssigned;
		var record = row.getRecord();
		var reportPanel = this.gridSuiteLeaseNotAssigned;
		View.confirm(getMessage('message_suite_confirmdelete'), function(button){
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
	
	gridSuiteLease_splitAssigned_onClick: function(row){
		if (row.getFieldValue('su.area_rentable') > 0 || row.getFieldValue('su.area_comn') > 0 || row.getFieldValue('su.area_usable') > 0) {
			View.showMessage(getMessage('error_split'));
		}
		else {
			this.split(row, this.dsSuiteLease, this.gridSuiteLease);
		}
	},
	
	gridSuiteLeaseNotAssigned_splitUnassigned_onClick: function(row){
		if (row.getFieldValue('su.area_rentable') > 0 || row.getFieldValue('su.area_comn') > 0 || row.getFieldValue('su.area_usable') > 0) {
			View.showMessage(getMessage('error_split'));
		}
		else {
			this.split(row, this.dsSuiteLeaseNotAssigned, this.gridSuiteLeaseNotAssigned);
		}
	},
	
	gridSuiteLease_unassign_onClick: function(row){
		
		var controller = this;
        View.confirm(getMessage('message_confirm_unassign'), function(button){
            if (button == 'yes') {
                try {
                   var record = row.getRecord();
					record.setValue('su.ls_id', '');
					controller.dsSuiteLease.saveRecord(record);
					controller.gridSuiteLease.refresh(controller.gridSuiteLease.restriction);
					controller.gridSuiteLeaseNotAssigned.refresh(controller.gridSuiteLeaseNotAssigned.restriction);
		
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        });
		
	},
	
	gridSuiteLeaseNotAssigned_assign_onClick: function(row){
		var record = row.getRecord();
		record.setValue('su.ls_id', this.leaseId);
		this.dsSuiteLeaseNotAssigned.saveRecord(record);
		this.gridSuiteLease.refresh(this.gridSuiteLease.restriction);
		this.gridSuiteLeaseNotAssigned.refresh(this.gridSuiteLeaseNotAssigned.restriction);
	},
	
	htmlSuiteLeaseAction_onNew: function(){
		this.add_edit(null, new Array('gridSuiteLeaseNotAssigned','gridSuiteLease','gridSuiteLeaseOther'), null, false,getMessage('add_new'));
	},
	
	gridSuiteLeaseNotAssigned_editUnassigned_onClick: function(row){
		this.add_edit(row, new Array('gridSuiteLeaseNotAssigned','gridSuiteLease','gridSuiteLeaseOther'), {'su.su_id':row.getFieldValue('su.su_id'), 'su.bl_id':row.getFieldValue('su.bl_id'), 'su.fl_id':row.getFieldValue('su.fl_id')}, false,getMessage('edit'));
	},
	
	gridSuiteLease_editAssigned_onClick: function(row){
		this.add_edit(row, new Array('gridSuiteLeaseNotAssigned','gridSuiteLease','gridSuiteLeaseOther'), {'su.su_id':row.getFieldValue('su.su_id'), 'su.bl_id':row.getFieldValue('su.bl_id'), 'su.fl_id':row.getFieldValue('su.fl_id'),'su.ls_id':row.getFieldValue('su.ls_id')}, false,getMessage('edit'));
	},
	
	gridSuiteBuilding_onNew: function(){
		this.add_edit(null, new Array('gridSuiteBuilding'), null, true,getMessage('add_new'));
	},
	
	gridSuiteBuilding_delete_onClick: function(row){
		if(this.gridSuiteBuilding.gridRows.getCount()== 1){
			View.showMessage(getMessage('error_delete_one_bl_suite'));
			return;
		}
		var dataSource = this.dsSuiteBuilding;
		var record = row.getRecord();
		var reportPanel = this.gridSuiteBuilding;
		View.confirm(getMessage('message_suite_confirmdelete'), function(button){
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
	
	gridSuiteBuilding_split_onClick: function(row){
		if (row.getFieldValue('su.area_rentable') > 0 || row.getFieldValue('su.area_comn') > 0 || row.getFieldValue('su.area_usable') > 0) {
			View.showMessage(getMessage('error_split'));
		}
		else {
			this.split(row, this.dsSuiteBuilding, this.gridSuiteBuilding);
		}
	},
	
	gridSuiteBuilding_edit_onClick: function(row){
		this.add_edit(row, new Array('gridSuiteBuilding'), {'su.su_id':row.getFieldValue('su.su_id'), 'su.bl_id':row.getFieldValue('su.bl_id'), 'su.fl_id':row.getFieldValue('su.fl_id')}, false,getMessage('edit'));
	},
	
	initVariables: function(openerPanel, openerController){
		this.openerController = openerController;
		this.openerPanel = openerPanel;
		this.wizard = this.openerPanel.wizard;
		this.type = this.wizard.getType();
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
			this.htmlSuiteAction.show(false, true);
			this.gridSuiteBuilding.show(false, true);
		}
		if (this.leaseId != null){
			this.gridSuiteBuilding.show(false, true);
			this.gridSuiteLeaseNotAssigned.refresh('su.bl_id = \''+this.itemId+'\' AND su.ls_id IS NULL');
			this.gridSuiteLease.refresh('su.bl_id = \''+this.itemId+'\' AND su.ls_id = \''+this.leaseId+'\'');
			this.gridSuiteLeaseOther.refresh('su.bl_id = \''+this.itemId+'\' AND su.ls_id IS NOT NULL AND su.ls_id <> \''+this.leaseId+'\'');
		}
		else if(this.leaseId == null && this.itemId != null && this.itemType == 'BUILDING' ){
			this.htmlSuiteLeaseAction.show(false, true);
			this.gridSuiteLeaseNotAssigned.show(false, true);
			this.gridSuiteLease.show(false, true);
			this.gridSuiteLeaseOther.show(false, true);
			this.gridSuiteBuilding.refresh('su.bl_id = \''+this.itemId+'\'');
			this.gridSuiteBuilding.setTitle(getMessage('title_bldg_grid'));
	
		}else{
			this.gridSuiteLeaseNotAssigned.refresh('su.su_id IS NULL');
			this.gridSuiteLease.refresh('su.su_id IS NULL');
			this.gridSuiteLeaseOther.refresh('su.su_id IS NULL');
		}
	},
	
	split: function(row, dataSource, panel){
		try {
			var suId = row.getFieldValue('su.su_id');
			var flId = row.getFieldValue('su.fl_id');
			var blId = row.getFieldValue('su.bl_id');
			var result = Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-splitSuite", suId, flId, blId);
			if (result.code == "executed") {
				panel.refresh(panel.restriction);
			}
			
		} catch (e){
			Workflow.handleError(e);
		}
	},
	
	add_edit: function(row, panels, restriction, withLease,title){
		var itemId = this.itemId;
		var itemType = this.itemType;
		var leaseId = '';
		if(row!=null && panels[0]=='gridSuiteBuilding' && row.getFieldValue('su.ls_id').length>0){
			leaseId = row.getFieldValue('su.ls_id');
		} else
		{
			leaseId = this.leaseId;
		}
		var leaseType = this.leaseType;
		
		View.openDialog('ab-rplm-add-edit-suite.axvw',null, true, {
			width:800,
			height:700, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('addEditSuite');
					dialogController.itemId = itemId;
					dialogController.itemType = itemType;
					dialogController.leaseId = leaseId;
					dialogController.leaseType = leaseType;
					dialogController.addEditSuiteForm.setTitle(title);
					if(row != null){
						dialogController.suiteId = row.getFieldValue('su.su_id');
						dialogController.addEditSuiteForm.refresh(restriction, false);
						/* KB 3027906 Allow modification of the Suite Code
						 * dialogController.addEditSuiteForm.enableField('su.su_id', false);
						 */
					}else{
						dialogController.addEditSuiteForm.refresh(null, true);
					}
					if(leaseId != null){
						if (withLease){
							dialogController.addEditSuiteForm.setFieldValue('su.ls_id', leaseId);							
						}
						if (panels != 'gridSuiteLeaseNotAssigned') {
							dialogController.addEditSuiteForm.enableField('su.ls_id', false);
						}
					}else{
						dialogController.addEditSuiteForm.enableField('su.ls_id', true);
					}
					dialogController.addEditSuiteForm.newRecord = (row == null);
					dialogController.refreshPanels = panels;
				}
		});
	}
})