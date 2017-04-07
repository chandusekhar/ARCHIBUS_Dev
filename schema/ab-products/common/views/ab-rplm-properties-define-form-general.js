var abPropertiesDefineForm_tabGeneralController = View.createController('abPropertiesDefineForm_tabGeneralController', {
	
	callbackMethod: null,
	
	customActionCommand: null,
	
	afterViewLoad: function(){
		if(valueExists(View.getOpenerView().parameters) && valueExists(View.getOpenerView().parameters.callback)){
			this.callbackMethod = View.getOpenerView().parameters.callback;
		}
		if(valueExists(View.getOpenerView().parameters) && valueExists(View.getOpenerView().parameters.eamReceiptParameters)){
			this.customActionCommand = View.getOpenerView().parameters.eamReceiptParameters.onClickActionEventHandler;
			this.view.parameters = View.getOpenerView().parameters;
		}
	},
	
	afterInitialDataFetch: function () {
		if(valueExists(View.getOpenerView())){
			// opened as a pop-up from EAM
			var openerConsole = View.getOpenerView();
			var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
			if(tabs){
				var newRecord = tabs.parameters.newRecord;
				var tabsRestriction = tabs.parameters.restriction;
				
				if (valueExists(newRecord) && newRecord == true) {
					this.abPropertiesDefineForm_general.newRecord = newRecord;
					this.abPropertiesDefineForm_general.refresh();
					
					this.abPropertiesDefineForm_generalDisposal.newRecord = newRecord;
					this.abPropertiesDefineForm_generalDisposal.refresh();
				} else if(newRecord == false) {
					this.abPropertiesDefineForm_general.refresh(tabsRestriction);
					
					this.abPropertiesDefineForm_generalDisposal.refresh(tabsRestriction);
				}
			}
		}
		
		if(valueExists(View.getOpenerView().parameters) && valueExists(View.getOpenerView().parameters.eamReceiptParameters)){
			this.abPropertiesDefineForm_general.actions.get('customActionCommand').setTitle(View.getOpenerView().parameters.eamReceiptParameters.actionTitle);
			if ("single" === View.getOpenerView().parameters.eamReceiptParameters.createMode) {
				this.abPropertiesDefineForm_general.setFieldValue("property.pr_id", View.getOpenerView().parameters.eamReceiptParameters.nextId);
				this.abPropertiesDefineForm_general.actions.get('customActionCommand').show(true);
				this.abPropertiesDefineForm_general.actions.get('clear').show(true);
				this.abPropertiesDefineForm_general.actions.get('cancel').show(false);
			} else {
				var selectedRecords = View.getOpenerView().parameters.eamReceiptParameters.selectedRecords;
				this.abPropertiesDefineForm_general.actions.get('customActionCommand').show(selectedRecords.length > 1);
			} 
			this.abPropertiesDefineForm_general.actions.get('delete').show(false);
		}
	},
	
	abPropertiesDefineForm_general_onSave: function(afterSaveCallback) {
		var propertyForm = this.abPropertiesDefineForm_general;
		
		beforeSaveProperty(this);
		
		var isSaved = propertyForm.save();
		
		setTimeout(function(){
			if (isSaved){
				afterSaveProperty(abPropertiesDefineForm_tabGeneralController, propertyForm);
				propertyForm.refresh();
			}
			
			var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
			if(tabs && valueExists(tabs.parameters) && valueExists(tabs.parameters.callback)){
				this.callbackMethod = tabs.parameters.callback;
			}
			callCallbackMethod();
			
			if(typeof(afterSaveCallback) == 'function'){
				afterSaveCallback(isSaved);
			}
		}, 1000);
	},
	
	copyDisposalInformation: function(){
		var propertyForm = this.abPropertiesDefineForm_general;
		var propertyRecord = propertyForm.getRecord();
		var disposalForm = this.abPropertiesDefineForm_generalDisposal;
		var propertyDisposalRecord = disposalForm.getRecord();
		var disposalFields = disposalForm.fields.keys;
		
		var dateDisposal = propertyForm.getDataSource().parseValue('property.date_disposal', propertyDisposalRecord.getValue('property.date_disposal'), false);
		var localizedDate = propertyForm.getDataSource().formatValue('property.date_disposal', dateDisposal, true);
		propertyForm.setFieldValue('property.date_disposal', localizedDate);
		
		propertyForm.setFieldValue('property.comment_disposal', propertyDisposalRecord.getValue('property.comment_disposal'));
		propertyForm.setFieldValue('property.disposal_type', propertyDisposalRecord.getValue('property.disposal_type'));
	},
	
	abPropertiesDefineForm_general_beforeRefresh:function(){
		var restriction = new Ab.view.Restriction();

		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		if(tabs){
			var newRecord = tabs.parameters.newRecord;
			var tabsRestriction = tabs.parameters.restriction;
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abPropertiesDefineForm_general.newRecord = newRecord;
				this.abPropertiesDefineForm_generalDisposal.newRecord = newRecord;
				this.abPropertiesDefineForm_generalDisposal.refresh();
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["property.pr_id"]) {
						restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abPropertiesDefineForm_general.restriction = restriction;
				this.abPropertiesDefineForm_generalDisposal.refresh(restriction, newRecord);
			}
		}
	},
	
	abPropertiesDefineForm_general_afterRefresh: function() {
			if (valueExistsNotEmpty(this.abPropertiesDefineForm_general.getFieldValue('property.prop_photo'))) {
				this.abPropertiesDefineForm_general.showImageDoc('prop_photo_image', 'property.pr_id', 'property.prop_photo');
			}
	},
	
	changedStatus: function(field) {
		var prStatus = field.value;
		var statusEquivalence = new Ext.util.MixedCollection();
		// ot status
		//Owned/OWNED AND LEASED/DONATED/Disposed/SOLD
		statusEquivalence.addAll(
				{id: 'OWNED', otStatus: 'Owned'},
				{id: 'OWNED AND LEASED', otStatus: 'OWNED AND LEASED'},
				{id: 'DONATED', otStatus: 'DONATED'},
				{id: 'DISPOSED', otStatus: 'Disposed'},
				{id: 'SOLD', otStatus: 'SOLD'});
		
		// pr status
		if (prStatus == 'OWNED' || prStatus == 'OWNED AND LEASED' || prStatus == 'DONATED' || prStatus == 'DISPOSED' || prStatus == 'SOLD') {
			var prId = this.abPropertiesDefineForm_general.getFieldValue('property.pr_id');
			
			View.openDialog('ab-rplm-properties-define-form-ownership-transaction.axvw', null, true,{
				afterViewLoad: function(dialogView) {
					// initialize Ownership Transaction form values
					var dialogController = dialogView.controllers.get('abPropertiesDefineForm_ownershipTransactionController');
					var form = dialogController.abPropertiesDefineForm_ownershipTransaction;
				    form.setFieldValue('ot.pr_id', prId);
				    var currentDate = form.getDataSource().formatValue('ot.date_purchase', new Date(), true);
				    form.setFieldValue('ot.date_purchase', currentDate);
				    form.setFieldValue('ot.status', statusEquivalence.get(prStatus).otStatus);
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


function callCallbackMethod(){
	var controller = View.controllers.get('abPropertiesDefineForm_tabGeneralController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}

function customCommand(ctx){
	var controller = View.controllers.get('abPropertiesDefineForm_tabGeneralController');
	var form = ctx.command.getParentPanel();
	controller.customCommand(form);
}
