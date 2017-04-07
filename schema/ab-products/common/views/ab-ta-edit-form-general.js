var abFurnitureForm_tabGeneralController = View.createController('abFurnitureForm_tabGeneralController', {
	
	callbackMethod: null,
	
	isSelectedFromReq: false,
	
	selectedReqRecord: null,
	
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
			var openerConsole = View.getOpenerView();
			var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
			
			if(tabs){
				var newRecord = tabs.parameters.newRecord;
				if(!newRecord){
					newRecord = View.newRecord;
				}
				var tabsRestriction = tabs.parameters.restriction;
				
				if (valueExists(newRecord) && newRecord == true) {
					this.abTaEditForm_General.newRecord = newRecord;
					this.abTaEditForm_General.refresh();
					
					this.abDisposalInfo.newRecord = newRecord;
					this.abDisposalInfo.refresh();
				} else if(newRecord == false) {
					this.abTaEditForm_General.newRecord = newRecord;
					this.abTaEditForm_General.refresh(tabsRestriction);
					
					var record = this.ds_abTaEditFormGeneral.getRecord(tabsRestriction);
					if(valueExistsNotEmpty(record)){
						this.abDisposalInfo.setFieldValue("ta.date_disposal", record.getValue('ta.date_disposal'));
						this.abDisposalInfo.setFieldValue("ta.disposal_type", record.getValue('ta.disposal_type'));
						this.abDisposalInfo.setFieldValue("ta.comment_disposal", record.getValue('ta.comment_disposal'));
						
						this.abDisposalInfo.refresh(tabsRestriction, newRecord);
					}
					
				}
		}
		
		if(valueExists(View.getOpenerView().parameters) && valueExists(View.getOpenerView().parameters.eamReceiptParameters)){
			this.abTaEditForm_General.actions.get('customActionCommand').setTitle(View.getOpenerView().parameters.eamReceiptParameters.actionTitle);
			if ("single" === View.getOpenerView().parameters.eamReceiptParameters.createMode) {
				this.abTaEditForm_General.setFieldValue("ta.ta_id", View.getOpenerView().parameters.eamReceiptParameters.nextId);
				this.abTaEditForm_General.actions.get('customActionCommand').show(true);
				this.abTaEditForm_General.actions.get('clear').show(true);
				this.abTaEditForm_General.actions.get('cancel').show(false);
			} else {
				var selectedRecords = View.getOpenerView().parameters.eamReceiptParameters.selectedRecords;
				this.abTaEditForm_General.actions.get('customActionCommand').show(selectedRecords.length > 1);
			} 
			this.abTaEditForm_General.actions.get('delete').show(false);
		}
		
	  }
	},
	
	abTaEditForm_General_onCancel: function(){
		var furnitureForm = this.abTaEditForm_General;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', furnitureForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abFurnitureForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	abTaEditForm_General_beforeRefresh: function(){
		
		var restriction = new Ab.view.Restriction();
		var newRecord = null;
		var tabsRestriction = null;

		var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
		if(tabs){
			newRecord = tabs.parameters.newRecord;
			tabsRestriction = tabs.parameters.restriction;
			
			if(!valueExists(newRecord)){
				newRecord = View.parameters.newRecord;
				tabsRestriction = View.parameters.restriction;
			}
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abTaEditForm_General.newRecord = newRecord;
				this.abDisposalInfo.newRecord = newRecord;
				this.abDisposalInfo.refresh();
			}else {
				if(tabsRestriction){
					if(tabsRestriction["ta.ta_id"]) {
						restriction.addClause('ta.ta_id', tabsRestriction["ta.ta_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('ta.ta_id', tabsRestriction.clauses[0].value);
					}
				this.abTaEditForm_General.restriction = restriction;
				this.abDisposalInfo.refresh(restriction, newRecord);
			}
				
			}
		}
		
		
	},
	
	abTaEditForm_General_onSave: function(afterSaveCallback){
		var controller = View.controllers.get('abFurnitureForm_tabGeneralController');
		var furnitureForm = controller.abTaEditForm_General;
		var furnitureDataSource = this.ds_abTaEditFormGeneral;
		var reqDataSource = this.abTaEditForm_selectTaFromReq_ds;
		var disposalForm = this.abDisposalInfo;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
		var primaryFieldValue = furnitureForm.getFieldValue("ta.ta_id");
		var record = disposalForm.getRecord();
		
		var message = getMessage('formSaved');
		
		try{
			  
			  furnitureForm.setFieldValue('ta.date_disposal', record.getValue('ta.date_disposal'));
			  furnitureForm.setFieldValue('ta.comment_disposal', record.getValue('ta.comment_disposal'));
			  furnitureForm.setFieldValue('ta.disposal_type', record.getValue('ta.disposal_type'));
			  
			  var isSaved = furnitureForm.save();
				if(isSaved){
					furnitureForm.setFieldValue('ta.ta_id', primaryFieldValue);
					restriction.addClause("ta.ta_id", primaryFieldValue);
					furnitureForm.restriction = restriction;
					furnitureForm.newRecord = false;
					
					afterSaveFurniture(abFurnitureForm_tabGeneralController, furnitureForm);
					furnitureForm.refresh();
					
					var record = furnitureDataSource.getRecord(restriction);
					disposalForm.setFieldValue('ta.date_disposal', record.getValue('ta.date_disposal'));
					disposalForm.setFieldValue('ta.comment_disposal', record.getValue('ta.comment_disposal'));
					disposalForm.setFieldValue('ta.disposal_type', record.getValue('ta.disposal_type'));
					
					if(controller.isSelectedFromReq){
						 if(selectedReqRecord){
							 if(valueExistsNotEmpty(primaryFieldValue)){
								 selectedReqRecord.setValue('eq_req_items.ta_id', primaryFieldValue);
								 reqDataSource.saveRecord(selectedReqRecord);
							 }
						  }
							
					}
					furnitureForm.displayTemporaryMessage(message);
				}
				
			if(tabs && valueExists(tabs.parameters) && valueExists(tabs.parameters.callback)){
				this.callbackMethod = tabs.parameters.callback;
			}
			callCallbackMethod();
			
			if(typeof(afterSaveCallback) == 'function'){
				afterSaveCallback(isSaved);
			}	
			
		}
		catch(e){
			var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
		}
		
	 },
	 
	 abTaEditForm_General_onDelete: function(){
			var dataSource = this.ds_abTaEditFormGeneral;
			var furnitureForm = this.abTaEditForm_General;
			var primaryFieldValue = furnitureForm.getFieldValue('ta.ta_id');
			
			var record = new Ab.data.Record({'ta.ta_id': primaryFieldValue}, false);
			
			var controller = this;
	        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
	        View.confirm(confirmMessage, function(button){
	            if (button == 'yes') {
	                try {
	                    dataSource.deleteRecord(record);
	    				controller.restriction = null; 
	    				controller.isNew = true; 
	    				furnitureForm.restriction = null;
	    				furnitureForm.refresh();
	    				
	    				refreshFurnitureList();
	    				
	    				var detailsPanel = View.getOpenerView().parentViewPanel;
	    				
	    				if(detailsPanel){
	    					detailsPanel.loadView('ab-blank.axvw', furnitureForm.restriction, null);
	    				}else{
	    					if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abFurnitureForm_tabs')){
	    						View.getOpenerView().getParentDialog().close();
	    					}
	    				}
	                } 
	                catch (e) {
	                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
	                    View.showMessage('error', errMessage, e.message, e.data);
	                    return false;
	                }
	            }
	        })
		},
	 
		
		abTaEditForm_General_onClose: function(){
			saveAndClose();
		},
		
	abTaEditForm_General_afterRefresh: function() {
			if (valueExistsNotEmpty(this.abTaEditForm_General.getFieldValue('fnstd.doc_graphic'))) {
				this.abTaEditForm_General.showImageDoc('doc_graphic_image', 'fnstd.fn_std', 'fnstd.doc_graphic');
			}
			this.abDisposalInfo.show(true);
	},
	
	processDisposalInformation: function(){
		var furnitureForm = this.abTaEditForm_General;
		var disposalForm = this.abDisposalInfo;
		var furnitureRecord = furnitureForm.getRecord();
		
		var disposalForm = this.abDisposalInfo;
		var furnitureDisposalRecord = disposalForm.getRecord();
		
		var dateDisposal = furnitureForm.getDataSource().parseValue('ta.date_disposal', furnitureDisposalRecord.getValue('ta.date_disposal'), false);
		var localizedDateDisposal = furnitureForm.getDataSource().formatValue('ta.date_disposal', dateDisposal, true);
		disposalForm.setFieldValue('ta.date_disposal', localizedDateDisposal);
		
		disposalForm.setFieldValue('ta.comment_disposal', furnitureDisposalRecord.getValue('ta.comment_disposal'));
		disposalForm.setFieldValue('ta.disposal_type', furnitureDisposalRecord.getValue('ta.disposal_type'));
		
	},
	
	onSelectRow: function (row) {
		var controller = View.controllers.get('abFurnitureForm_tabGeneralController');
		
		 selectedReqRecord = row.row.getRecord();
		 var furnitureForm = controller.abTaEditForm_General;
		 var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
		 
	     var planningId = selectedReqRecord.getValue("eq_req_items.planning_id");
	     var blId = selectedReqRecord.getValue("eq_req_items.bl_id");
	     var dpId = selectedReqRecord.getValue("eq_req_items.dp_id");
	     var dvId = selectedReqRecord.getValue("eq_req_items.dv_id");
	     var flId = selectedReqRecord.getValue("eq_req_items.fl_id");
	     var rmId = selectedReqRecord.getValue("eq_req_items.rm_id");
	     
	     var taId = furnitureForm.getFieldValue('ta.ta_id');
	     
		 if(valueExistsNotEmpty(planningId) && !taId){
			 furnitureForm.setFieldValue("ta.ta_id", planningId);
		 }
		 
		 furnitureForm.setFieldValue("ta.bl_id", blId);
		 furnitureForm.setFieldValue("ta.dp_id", dpId);
		 furnitureForm.setFieldValue("ta.dv_id", dvId);
		 furnitureForm.setFieldValue("ta.fl_id", flId);
		 furnitureForm.setFieldValue("ta.rm_id", rmId);
		 
		 controller.isSelectedFromReq = true;
		 View.panels.get("abTaEditForm_selectTaFromReq").closeWindow();
	},
	
	customCommand: function (form) {
		if(valueExists(this.customActionCommand)){
			this.customActionCommand(form);
		}
	}
	
});

function selectFurnitureRequirements(){
	var controller = View.controllers.get('abFurnitureForm_tabGeneralController');
	var restriction = new Ab.view.Restriction();
	
	
	restriction.addClause('eq_req_items.asset_type', 'ta', '=');
	restriction.addClause('eq_req_items.ta_id', '', 'IS NULL');
	
	var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
	controller.abTaEditForm_selectTaFromReq.refresh(restriction);
	
}

function getCurrentDate() {
	var today = new Date();
	var day = today.getDate();
	var month = today.getMonth() + 1;
	var year = today.getFullYear();
	return FormattingDate(day, month, year, strDateShortPattern);
}

/**
 * Get current time.
 */
function getCurrentTime() {
	var returnedTime = "";
	var curDate = new Date();
	var hoursNow = curDate.getHours();
	var minsNow = curDate.getMinutes();
	returnedTime = FormattingTime(hoursNow, minsNow, "", "HH:MM");
	return returnedTime;
}

function saveAndClose(){
	var controller = View.controllers.get('abFurnitureForm_tabGeneralController');
	var furnitureForm = controller.abTaEditForm_General;
	var furnitureDataSource = controller.ds_abTaEditFormGeneral;
	var reqDataSource = controller.abTaEditForm_selectTaFromReq_ds;
	var disposalForm = controller.abDisposalInfo;
	var restriction = new Ab.view.Restriction();
	var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
	var primaryFieldValue = furnitureForm.getFieldValue("ta.ta_id");
	var record = disposalForm.getRecord();
	
	var message = getMessage('formSaved');
	
	try{
		  
		  furnitureForm.setFieldValue('ta.date_disposal', record.getValue('ta.date_disposal'));
		  furnitureForm.setFieldValue('ta.comment_disposal', record.getValue('ta.comment_disposal'));
		  furnitureForm.setFieldValue('ta.disposal_type', record.getValue('ta.disposal_type'));
		  
		  var isSaved = furnitureForm.save();
			if(isSaved){
				furnitureForm.setFieldValue('ta.ta_id', primaryFieldValue);
				restriction.addClause("ta.ta_id", primaryFieldValue);
				furnitureForm.restriction = restriction;
				furnitureForm.newRecord = false;
				
				afterSaveFurniture(abFurnitureForm_tabGeneralController, furnitureForm);
				furnitureForm.refresh();
				
				var record = furnitureDataSource.getRecord(restriction);
				disposalForm.setFieldValue('ta.date_disposal', record.getValue('ta.date_disposal'));
				disposalForm.setFieldValue('ta.comment_disposal', record.getValue('ta.comment_disposal'));
				disposalForm.setFieldValue('ta.disposal_type', record.getValue('ta.disposal_type'));
				
				if(controller.isSelectedFromReq){
					 if(selectedReqRecord){
						 if(valueExistsNotEmpty(primaryFieldValue)){
							 selectedReqRecord.setValue('eq_req_items.ta_id', primaryFieldValue);
							 reqDataSource.saveRecord(selectedReqRecord);
						 }
					  }
				}
				furnitureForm.displayTemporaryMessage(message);
			}
			var detailsPanel = View.getOpenerView().parentViewPanel;
			
			if(detailsPanel){
				detailsPanel.loadView('ab-blank.axvw', furnitureForm.restriction, null);
			}else{
				if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abFurnitureForm_tabs')){
					View.getOpenerView().getParentDialog().close();
				}
			}
	}
	catch(e){
		var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
        View.showMessage('error', errMessage, e.message, e.data);
        return;
	}
}


function callCallbackMethod(){
	var controller = View.controllers.get('abFurnitureForm_tabGeneralController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}

function customCommand(ctx){
	var controller = View.controllers.get('abFurnitureForm_tabGeneralController');
	var form = ctx.command.getParentPanel();
	controller.customCommand(form);
}


