var abEquipmentForm_tabGeneralController = View.createController('abEquipmentForm_tabGeneralController', {
	
	callbackMethod: null,
	
	isSelectedFromReq: false,
	
	selectedReqRecord: null,
	
	customActionCommand: null,
	
	afterViewLoad: function(){
		var controller = this;
		if(valueExists(View.getOpenerView().parameters) && valueExists(View.getOpenerView().parameters.callback)){
			this.callbackMethod = View.getOpenerView().parameters.callback;
		}
		if(valueExists(View.getOpenerView().parameters) && valueExists(View.getOpenerView().parameters.eamReceiptParameters)){
			this.customActionCommand = View.getOpenerView().parameters.eamReceiptParameters.onClickActionEventHandler;
			controller.view.parameters = View.getOpenerView().parameters;
		}
	},
	
	afterInitialDataFetch: function () {
		if(valueExists(View.getOpenerView())){
			var openerConsole = View.getOpenerView();
			var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
			
			if(tabs){
				var newRecord = tabs.parameters.newRecord;
				if(!newRecord){
					newRecord = View.newRecord;
				}
				var tabsRestriction = tabs.parameters.restriction;
				
				if (valueExists(newRecord) && newRecord == true) {
					this.abEqEditForm_General.newRecord = newRecord;
					this.abEqEditForm_General.refresh();
					
					this.abDisposalInfo.newRecord = newRecord;
					this.abDisposalInfo.refresh();
				} else if(newRecord == false) {
					this.abEqEditForm_General.newRecord = newRecord;
					this.abEqEditForm_General.refresh(tabsRestriction, newRecord);
					
					var record = this.ds_abEqEditFormGeneral.getRecord(tabsRestriction);
					if(valueExistsNotEmpty(record)){
						this.abDisposalInfo.setFieldValue("eq.date_salvaged", record.getValue('eq.date_salvaged'));
						this.abDisposalInfo.setFieldValue("eq.date_disposal", record.getValue('eq.date_disposal'));
						this.abDisposalInfo.setFieldValue("eq.date_sold", record.getValue('eq.date_sold'));
						this.abDisposalInfo.setFieldValue("eq.disposal_type", record.getValue('eq.disposal_type'));
						this.abDisposalInfo.setFieldValue("eq.comment_disposal", record.getValue('eq.comment_disposal'));
						
						this.abDisposalInfo.refresh(tabsRestriction, newRecord);
					}
					
				}
		  }
		
			if(valueExists(View.getOpenerView().parameters) && valueExists(View.getOpenerView().parameters.eamReceiptParameters)){
				this.abEqEditForm_General.actions.get('customActionCommand').setTitle(View.getOpenerView().parameters.eamReceiptParameters.actionTitle);
				if ("single" === View.getOpenerView().parameters.eamReceiptParameters.createMode) {
					this.abEqEditForm_General.setFieldValue("eq.eq_id", View.getOpenerView().parameters.eamReceiptParameters.nextId);
					this.abEqEditForm_General.actions.get('customActionCommand').show(true);
					this.abEqEditForm_General.actions.get('clear').show(true);
					this.abEqEditForm_General.actions.get('cancel').show(false);
				} else {
					var selectedRecords = View.getOpenerView().parameters.eamReceiptParameters.selectedRecords;
					this.abEqEditForm_General.actions.get('customActionCommand').show(selectedRecords.length > 1);
				} 
				this.abEqEditForm_General.actions.get('delete').show(false);
			}
		}
	},
	
	abEqEditForm_General_onSave: function(afterSaveCallback){
		    var controller = View.controllers.get('abEquipmentForm_tabGeneralController');
			var equipmentForm = controller.abEqEditForm_General;
			var equipDataSource = controller.ds_abEqEditFormGeneral;
			var disposalForm = controller.abDisposalInfo;
			var restriction = new Ab.view.Restriction();
			var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
			var primaryFieldValue = equipmentForm.getFieldValue("eq.eq_id");
			var reqDataSource = controller.abEqEditForm_selectEqFromReq_ds;
			var record = disposalForm.getRecord();
			
			var message = getMessage('formSaved');
			
			try{
				  equipmentForm.setFieldValue('eq.date_salvaged', record.getValue('eq.date_salvaged'));
				  equipmentForm.setFieldValue('eq.date_disposal', record.getValue('eq.date_disposal'));
				  equipmentForm.setFieldValue('eq.date_sold', record.getValue('eq.date_sold'));
				  equipmentForm.setFieldValue('eq.comment_disposal', record.getValue('eq.comment_disposal'));
				  equipmentForm.setFieldValue('eq.disposal_type', record.getValue('eq.disposal_type'));
				  
				  var isSaved = equipmentForm.save();
					if(isSaved){
						equipmentForm.setFieldValue('eq.eq_id', primaryFieldValue);
						restriction.addClause("eq.eq_id", primaryFieldValue);
						equipmentForm.restriction = restriction;
						equipmentForm.newRecord = false;
						
						afterSaveEquipment(abEquipmentForm_tabGeneralController, equipmentForm);
						equipmentForm.refresh();
						
						var record = equipDataSource.getRecord(restriction);
						disposalForm.setFieldValue('eq.date_salvaged', record.getValue('eq.date_salvaged'));
						disposalForm.setFieldValue('eq.date_disposal', record.getValue('eq.date_disposal'));
						disposalForm.setFieldValue('eq.date_sold', record.getValue('eq.date_sold'));
						disposalForm.setFieldValue('eq.comment_disposal', record.getValue('eq.comment_disposal'));
						disposalForm.setFieldValue('eq.disposal_type', record.getValue('eq.disposal_type'));
						
						
						if(controller.isSelectedFromReq){
							 if(selectedReqRecord){
								 if(valueExistsNotEmpty(primaryFieldValue)){
									 selectedReqRecord.setValue('eq_req_items.eq_id', primaryFieldValue);
									 reqDataSource.saveRecord(selectedReqRecord);
								 }
							  }
								
						}
						equipmentForm.displayTemporaryMessage(message);
					
						
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
 
	
	abEqEditForm_General_afterRefresh: function() {
			if (valueExistsNotEmpty(this.abEqEditForm_General.getFieldValue('eqstd.doc_graphic'))) {
				this.abEqEditForm_General.showImageDoc('doc_graphic_image', 'eqstd.eq_std', 'eqstd.doc_graphic');
			}
			this.abDisposalInfo.show(true);
	},
	
	abEqEditForm_General_onCancel: function(){
		var equipmentForm = this.abEqEditForm_General;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', equipmentForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	
	abEqEditForm_General_onDelete: function(){
		var dataSource = this.ds_abEqEditFormGeneral;
		var equipmentForm = this.abEqEditForm_General;
		var primaryFieldValue = equipmentForm.getFieldValue('eq.eq_id');
		
		var record = new Ab.data.Record({'eq.eq_id': primaryFieldValue}, false);
		
		var controller = this;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
    				controller.restriction = null; 
    				controller.isNew = true; 
    				equipmentForm.restriction = null;
    				equipmentForm.refresh();

					afterDeleteEquipment();
					
    				var detailsPanel = View.getOpenerView().parentViewPanel;
   				
    				if(detailsPanel){
    					detailsPanel.loadView('ab-blank.axvw', equipmentForm.restriction, null);
    				}else{
    					if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
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
	
	
	abEqEditForm_General_onClose: function(){
		saveAndClose();
	},
	
	
	abEqEditForm_General_beforeRefresh: function(){
		
		var restriction = new Ab.view.Restriction();
		var newRecord = null;
		var tabsRestriction = null;

		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		if(tabs){
			newRecord = tabs.parameters.newRecord;
			tabsRestriction = tabs.parameters.restriction;
			
			if(!valueExists(newRecord)){
				newRecord = View.parameters.newRecord;
				tabsRestriction = View.parameters.restriction;
			}
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abEqEditForm_General.newRecord = newRecord;
				this.abDisposalInfo.newRecord = newRecord;
				this.abDisposalInfo.refresh();
			}else {
				if(tabsRestriction){
					if(tabsRestriction["eq.eq_id"]) {
						restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
					}
				this.abEqEditForm_General.restriction = restriction;
				this.abDisposalInfo.refresh(restriction, newRecord);
			}
				
			}
		}
	},
	
	processDisposalInformation: function(){
		var equipmentForm = this.abEqEditForm_General;
		var disposalForm = this.abDisposalInfo;
		var equipmentRecord = equipmentForm.getRecord();
		
		var equipmentDisposalRecord = disposalForm.getRecord();
		
		
		var dateSalvaged = equipmentForm.getDataSource().parseValue('eq.date_salvaged', equipmentDisposalRecord.getValue('eq.date_salvaged'), false);
		var localizedDateSalvaged = equipmentForm.getDataSource().formatValue('eq.date_salvaged', dateSalvaged, true);
		disposalForm.setFieldValue('eq.date_salvaged', localizedDateSalvaged);
		
		var dateDisposal = equipmentForm.getDataSource().parseValue('eq.date_disposal', equipmentDisposalRecord.getValue('eq.date_disposal'), false);
		var localizedDateDisposal = equipmentForm.getDataSource().formatValue('eq.date_disposal', dateDisposal, true);
		disposalForm.setFieldValue('eq.date_disposal', localizedDateDisposal);
		
		var dateSold = equipmentForm.getDataSource().parseValue('eq.date_sold', equipmentDisposalRecord.getValue('eq.date_sold'), false);
		var localizedDateSold = equipmentForm.getDataSource().formatValue('eq.date_sold', dateSold, true);
		disposalForm.setFieldValue('eq.date_sold', localizedDateSold);
		
		disposalForm.setFieldValue('eq.comment_disposal', equipmentDisposalRecord.getValue('eq.comment_disposal'));
		disposalForm.setFieldValue('eq.disposal_type', equipmentDisposalRecord.getValue('eq.disposal_type'));
		
	},
	
	onSelectRow: function (row) {
		var controller = View.controllers.get('abEquipmentForm_tabGeneralController');
		
		 selectedReqRecord = row.row.getRecord();
		 var equipmentForm = controller.abEqEditForm_General;
		 var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		 
	     var planningId = selectedReqRecord.getValue("eq_req_items.planning_id");
	     var blId = selectedReqRecord.getValue("eq_req_items.bl_id");
	     var description = selectedReqRecord.getValue("eq_req_items.description");
	     var dpId = selectedReqRecord.getValue("eq_req_items.dp_id");
	     var dvId = selectedReqRecord.getValue("eq_req_items.dv_id");
	     var flId = selectedReqRecord.getValue("eq_req_items.fl_id");
	     var mfr = selectedReqRecord.getValue("eq_req_items.mfr");//general
	     var modelno = selectedReqRecord.getValue("eq_req_items.modelno");//general
	     var rmId = selectedReqRecord.getValue("eq_req_items.rm_id");
	     var siteId = selectedReqRecord.getValue("eq_req_items.site_id");
	     
	     var eqId = equipmentForm.getFieldValue('eq.eq_id');
	     
		 if(valueExistsNotEmpty(planningId) && !eqId){
		 	equipmentForm.setFieldValue("eq.eq_id", planningId);
		 }
		 equipmentForm.setFieldValue("eq.description", description);
		 equipmentForm.setFieldValue("eq.mfr", mfr);
		 equipmentForm.setFieldValue("eq.modelno", modelno);
		 
		 
		 equipmentForm.setFieldValue("eq.bl_id", blId);
		 equipmentForm.setFieldValue("eq.dp_id", dpId);
		 equipmentForm.setFieldValue("eq.dv_id", dvId);
		 equipmentForm.setFieldValue("eq.fl_id", flId);
		 equipmentForm.setFieldValue("eq.rm_id", rmId);
		 equipmentForm.setFieldValue("eq.site_id", siteId);
		 
		 controller.isSelectedFromReq = true;
		 
		 if(controller.isSelectedFromReq){
			 var currentComment = equipmentForm.getFieldValue('eq.comments'); 
			 currentComment += " Added to inventory on  " + getCurrentDate() + " at " + getCurrentTime();
			 equipmentForm.setFieldValue("eq.comments", currentComment);
		}
		 
		 View.panels.get("abEqEditForm_selectEqFromReq").closeWindow();
	},
	
	customCommand: function (form) {
		if(valueExists(this.customActionCommand)){
			this.customActionCommand(form);
		}
	}
	
});

function selectEquipmentRequirements(){
	var controller = View.controllers.get('abEquipmentForm_tabGeneralController');
	var restriction = new Ab.view.Restriction();
	
	restriction.addClause('eq_req_items.asset_type', 'eq', '=');
	restriction.addClause('eq_req_items.eq_id', '', 'IS NULL');
	
	var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
	controller.abEqEditForm_selectEqFromReq.refresh(restriction);
}

function getCurrentDate() {
	var today = new Date();
	var day = today.getDate();
	var month = today.getMonth() + 1;
	var year = today.getFullYear();
	return FormattingDate(day, month, year, strDateShortPattern);
}

function saveAndClose(){
	 var controller = View.controllers.get('abEquipmentForm_tabGeneralController');
		var equipmentForm = controller.abEqEditForm_General;
		var equipDataSource = controller.ds_abEqEditFormGeneral;
		var disposalForm = controller.abDisposalInfo;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		var primaryFieldValue = equipmentForm.getFieldValue("eq.eq_id");
		var reqDataSource = controller.abEqEditForm_selectEqFromReq_ds;
		var record = disposalForm.getRecord();
		
		var message = getMessage('formSaved');
		
		try{
			  equipmentForm.setFieldValue('eq.date_salvaged', record.getValue('eq.date_salvaged'));
			  equipmentForm.setFieldValue('eq.date_disposal', record.getValue('eq.date_disposal'));
			  equipmentForm.setFieldValue('eq.date_sold', record.getValue('eq.date_sold'));
			  equipmentForm.setFieldValue('eq.comment_disposal', record.getValue('eq.comment_disposal'));
			  equipmentForm.setFieldValue('eq.disposal_type', record.getValue('eq.disposal_type'));
			  
			  var isSaved = equipmentForm.save();
				if(isSaved){
					equipmentForm.setFieldValue('eq.eq_id', primaryFieldValue);
					restriction.addClause("eq.eq_id", primaryFieldValue);
					equipmentForm.restriction = restriction;
					equipmentForm.newRecord = false;
					
					afterSaveEquipment(abEquipmentForm_tabGeneralController, equipmentForm);
					equipmentForm.refresh();
					
					var record = equipDataSource.getRecord(restriction);
					disposalForm.setFieldValue('eq.date_salvaged', record.getValue('eq.date_salvaged'));
					disposalForm.setFieldValue('eq.date_disposal', record.getValue('eq.date_disposal'));
					disposalForm.setFieldValue('eq.date_sold', record.getValue('eq.date_sold'));
					disposalForm.setFieldValue('eq.comment_disposal', record.getValue('eq.comment_disposal'));
					disposalForm.setFieldValue('eq.disposal_type', record.getValue('eq.disposal_type'));
					
					
					if(controller.isSelectedFromReq){
						 if(selectedReqRecord){
							 if(valueExistsNotEmpty(primaryFieldValue)){
								 selectedReqRecord.setValue('eq_req_items.eq_id', primaryFieldValue);
								 reqDataSource.saveRecord(selectedReqRecord);
							 }
						  }
							
					}
					equipmentForm.displayTemporaryMessage(message);
				}
				
				var detailsPanel = View.getOpenerView().parentViewPanel;
				
				if(detailsPanel){
					detailsPanel.loadView('ab-blank.axvw', equipmentForm.restriction, null);
				}else{
					if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
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

function callCallbackMethod(){
	var controller = View.controllers.get('abEquipmentForm_tabGeneralController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}

function customCommand(ctx){
	var controller = View.controllers.get('abEquipmentForm_tabGeneralController');
	var form = ctx.command.getParentPanel();
	controller.customCommand(form);
}


