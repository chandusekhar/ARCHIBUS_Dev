
var docsController = View.createController("helpDeskDocsController",{
	
	mainTabs: null,
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.requestPanel.actions.get('cancel').setTitle(getMessage('previous'));
		this.mainTabs = View.getControlsByType(parent, 'tabs')[0];
	
	},
	
	requestPanel_afterRefresh: function(){
		var record = this.requestPanel.getRecord();
		this.problemPanel.clear();
		this.documentsPanel.clear();
		
		this.problemPanel.setRecord(record);
		this.documentsPanel.refresh(this.requestPanel.restriction,false);
		
		this.problemPanel.show(true);
		
		ABHDC_showPriorityLevel("activity_log","activity_log_id","priority",this.problemPanel,"activity_log.priority");
	},
	/**
	 * event handle when 'Cancel' button is click
	 * go back to the previous tab
	 */
	requestPanel_onCancel: function(){
		
		var activityLogId = this.requestPanel.getFieldValue("activity_log.activity_log_id");
		var parentCtrl = View.getOpenerView().controllers.get(0);
		//fix KB3031741 - add activity_log.activity_log_id to the basic tab restriction before go back to basic tab(Guo 2011/06/20)
		parentCtrl.basicRestriction["activity_log.activity_log_id"] = activityLogId;
		
		//add for support dynamic tabs in 20.1 and also keep compatible with other applications that not dynamic tabs like On Demand - Create Maintenance Service Request(Guo 2011/06/23)
		var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
		if(dynamicAssemblyTabsController){
			dynamicAssemblyTabsController.selectPreviousTab(parentCtrl.basicRestriction);
		}else{
			var groupMoveDetailTab = this.mainTabs.findTab("groupMoveDetailTab");
			if (valueExists(groupMoveDetailTab)) {
				if (groupMoveDetailTab.forcedHidden == false) {
					this.mainTabs.selectTab("groupMoveDetailTab", parentCtrl.basicRestriction, false, false, false);
				} else {
					this.mainTabs.selectTab("basic", parentCtrl.basicRestriction, false, false, false);
				}
			} else {
				this.mainTabs.selectTab("basic", parentCtrl.basicRestriction, false, false, false);
			}
		}
	},
	/**
	 * event handle when 'Submit' button in tab doc is click
	 * 1.call WFR submitDocMoveServiceRequest
	 * 2.if true, go to 'select' tab.
	 */
	requestPanel_onSubmit: function(){
		var record = ABHDC_getDataRecord2(this.requestPanel);
		return;
		var activityLogIdValue = this.requestPanel.getFieldValue("activity_log.activity_log_id");   
		var tabs = View.getControlsByType(parent, 'tabs')[0];
		//check is exist duplicate records
		var employees = "";
		for(var i = 0; i<tabs.assignments.I.length; i++){
			var assignment = tabs.assignments.I[i];
			if(this.ifExistDuplicateRecords(tabs.dateEnd,assignment['em_id'])){
				employees+=assignment['em_id']+"   ";
			}
		}
		if(employees!=""){
			var thisObj = this;
			var message =getMessage("existDuplicate").replace("<{0}>", employees);
			View.confirm(message, function(button){
				if (button == 'yes') {
					thisObj.doSubmit(record, tabs, activityLogIdValue);
				}
			});
		}else{
			this.doSubmit(record, tabs, activityLogIdValue);
		}
	},
	/**
	 * private method
	 * for 'create group move' submit
	 */
	doSubmit: function(record, tabs, activityLogIdValue){
//		return;
		//first update activity_log_id status
	    var result;
		try {
			 result =  Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-submitMove', 
					 activityLogIdValue*1,record,tabs.dateEnd,tabs.assignments);
		}catch(e){
			Workflow.handleError(e);
			return;
		}
		if (result){
//			var tabs = View.getOpenerView().panels.get('helpDeskRequestTabs');
			var rest = new Ab.view.Restriction();
			rest.addClause("activity_log.activity_log_id",activityLogIdValue,"=");
			//add for support dynamic tabs in 20.1 and also keep compatible with other applications that not dynamic tabs like On Demand - Create Maintenance Service Request(Guo 2011/06/23)
			var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
			if(dynamicAssemblyTabsController){
				dynamicAssemblyTabsController.selectNextTab(rest);
			}else{
				tabs.selectTab("groupMoveResult",rest,false,false,false);	
				//function(tabName, restriction, newRecord, clearRestriction, noRefresh)
			}
		}
	
	},
	/**
	 * to submit a move request for a person that is already included in another pending move request.
	 */
	ifExistDuplicateRecords: function(date,em_id){
    	var dsRmpct = View.dataSources.get("duplicates_rmpct_for_js");
        dsRmpct.addParameter('current_date',date);
        dsRmpct.addParameter('em_id',em_id);
        var dsRecords = dsRmpct.getRecords();
        if(dsRecords.length>0){
    	  return true;
        }
        return false;
	}
});
