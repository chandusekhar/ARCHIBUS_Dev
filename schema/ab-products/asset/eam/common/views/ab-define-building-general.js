var abDefineBuilding_tabGeneralController = View.createController('abDefineBuilding_tabGeneralController', {
	
	callbackMethod: null,
	
	customActionCommand: null,
	
	restriction: null,
	
	newRecord: null,
	
	afterInitialDataFetch: function () {
		this.refreshRestriction();
		
		var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
		if (tabs && valueExists(tabs.parameters)) {
			if (valueExists(tabs.parameters.callback)) {
				this.callbackMethod = tabs.parameters.callback;
			}
			if (valueExists(tabs.parameters.eamReceiptParameters)) {
				this.customActionCommand = tabs.parameters.eamReceiptParameters.onClickActionEventHandler;
			}
		}
		
		if(valueExists(tabs.parameters) && valueExists(tabs.parameters.eamReceiptParameters)) {
			this.view.parameters = tabs.parameters;
			this.abDefineBuilding_general.actions.get('customActionCommand').setTitle(tabs.parameters.eamReceiptParameters.actionTitle);
			if ("single" === tabs.parameters.eamReceiptParameters.createMode) {
				this.abDefineBuilding_general.setFieldValue("bl.bl_id", tabs.parameters.eamReceiptParameters.nextId);
				this.abDefineBuilding_general.actions.get('customActionCommand').show(true);
				this.abDefineBuilding_general.actions.get('clear').show(true);
			} else {
				var selectedRecords = tabs.parameters.eamReceiptParameters.selectedRecords;
				this.abDefineBuilding_general.actions.get('customActionCommand').show(selectedRecords.length > 1);
			} 
			this.abDefineBuilding_general.actions.get('delete').show(false);
		}
	},
	
	refreshRestriction: function() {
		var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
		if (tabs && valueExists(tabs.restriction)) {
			this.restriction = tabs.restriction;
		}
		if (tabs && valueExists(tabs.newRecord)) {
			this.newRecord = tabs.newRecord;
		}
		
		if (this.newRecord) {
			this.abDefineBuilding_general.refresh(null, this.newRecord);
			this.abDefineBuilding_generalDisposal.refresh(null, this.newRecord);
		} else {
			this.abDefineBuilding_general.refresh(this.restriction);
			this.abDefineBuilding_generalDisposal.refresh(this.restriction);
		}
	},
	
	copyDisposalInformation: function(field){
		var buildingForm = this.abDefineBuilding_general;
		var disposalForm = this.abDefineBuilding_generalDisposal;
		var buildingDisposalRecord = disposalForm.getRecord();
		
		if (field && field.id == 'abDefineBuilding_generalDisposal_bl.disposal_type') {
			buildingForm.setFieldValue('bl.disposal_type', buildingDisposalRecord.getValue('bl.disposal_type'));
			return;
		}
		
		if (field && field.id == 'abDefineBuilding_generalDisposal_bl.comment_disposal') {
			buildingForm.setFieldValue('bl.comment_disposal', buildingDisposalRecord.getValue('bl.comment_disposal'));
			return;
		}
		
		if (field && field.id == 'abDefineBuilding_generalDisposal_bl.date_disposal') {
			var dateDisposal = buildingForm.getDataSource().parseValue('bl.date_disposal', buildingDisposalRecord.getValue('bl.date_disposal'), false);
			var localizedDate = buildingForm.getDataSource().formatValue('bl.date_disposal', dateDisposal, true);
			buildingForm.setFieldValue('bl.date_disposal', localizedDate);
			return;
		}
	},
	
	abDefineBuilding_general_afterRefresh: function() {
		if (valueExistsNotEmpty(this.abDefineBuilding_general.getFieldValue('bl.bldg_photo'))) {
			this.abDefineBuilding_general.showImageDoc('bldg_photo_image', 'bl.bl_id', 'bl.bldg_photo');
		}
	},
	
	abDefineBuilding_general_onDelete: function() {
		var dataSource = this.abDefineBuilding_general.getDataSource();
		var record = this.abDefineBuilding_general.record;
		
		View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    callCallbackMethod();
                    closeDialog();
                } 
                catch (e) {
                    var message = String.format(getMessage('errorDelete'));
                    View.showMessage('error', message, e.message, e.data);
                }
            }
        });
	},
	
	afterSaveBuilding: function() {
		setNewRestrictionForTabs();
		abDefineBuilding_tabGeneralController.refreshRestriction();
		refreshTitle();
		callCallbackMethod();
	},
	
	changedStatus: function(field) {
		var blStatus = field.value;
		var statusEquivalence = new Ext.util.MixedCollection();
		// ot status
		//Owned/OWNED AND LEASED/DONATED/Disposed/SOLD
		statusEquivalence.addAll(
				{id: 'OWNED', otStatus: 'Owned'},
				{id: 'OWNED AND LEASED', otStatus: 'OWNED AND LEASED'},
				{id: 'Donated', otStatus: 'DONATED'},
				{id: 'Disposed', otStatus: 'Disposed'},
				{id: 'SOLD', otStatus: 'SOLD'});
		
		// bl status
		if (blStatus == 'OWNED' || blStatus == 'OWNED AND LEASED' || blStatus == 'Donated' || blStatus == 'Disposed' || blStatus == 'SOLD') {
			var blId = this.abDefineBuilding_general.getFieldValue('bl.bl_id');
			
			View.openDialog('ab-define-building-ownership-transaction.axvw', null, true,{
				afterViewLoad: function(dialogView) {
					// initialize Ownership Transaction form values
					var dialogController = dialogView.controllers.get('abDefineBuilding_ownershipTransactionController');
				    dialogController.abDefineBuilding_ownershipTransaction.setFieldValue('ot.bl_id', blId);
				    var currentDate = dialogController.abDefineBuilding_ownershipTransaction.getDataSource().formatValue('ot.date_purchase', new Date(), true);
				    dialogController.abDefineBuilding_ownershipTransaction.setFieldValue('ot.date_purchase', currentDate);
				    dialogController.abDefineBuilding_ownershipTransaction.setFieldValue('ot.status', statusEquivalence.get(blStatus).otStatus);
				}
			});
		}
		
	},
	
	customCommand: function (form) {
		if(valueExists(this.customActionCommand)){
			this.customActionCommand(form);
		}
	}
	
});

function callCallbackMethod() {
	var controller = View.controllers.get('abDefineBuilding_tabGeneralController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}

function customCommand(ctx) {
	var controller = View.controllers.get('abDefineBuilding_tabGeneralController');
	var form = ctx.command.getParentPanel();
	controller.customCommand(form);
}

function setNewRestrictionForTabs() {
	var form = abDefineBuilding_tabGeneralController.abDefineBuilding_general;
	setRestrictionForTabs(abDefineBuilding_tabGeneralController, form);
}
