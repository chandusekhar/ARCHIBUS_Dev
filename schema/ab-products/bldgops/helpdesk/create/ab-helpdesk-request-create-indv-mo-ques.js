/**
 * @author: Song
 */
var helpDeskGroupMoveController = View.createController('helpDeskGroupMoveController', {
    quest: null,
    
    isApproveOrIssue: false,
    
    tabs: null,
    /*
     * the record of rmpct search by activity_log_id
     */
    currentRmpct: null,
	/**
	 * assignments after view InitialDataFetch
	 */
	originalAssignments: null,
	
    afterInitialDataFetch: function(){
        this.inherit();
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		
		this.currentRmpct = this.getMoveRecord(this.tabs);
//		alert(this.getMoveRecord(this.tabs));
//		alert(this.currentRmpct.getValue('rmpct.status'));
		this.questPanel.actions.get('previous').setTitle(getMessage('previous'));
		//reset the button name to support localization.
		$('changeFromLocation').value = getMessage('buttonChangeFromLocation');
		$('changeToLocation').value = getMessage('buttonChangeToLocation');
		
	    this.emPanel.setFieldValue("rmpct.em_id",View.user.employee.id);
	    //default read only
		this.emPanel.enableField('rmpct.from_bl_id', false);
		this.emPanel.enableField('rmpct.from_fl_id', false);
		this.emPanel.enableField('rmpct.from_rm_id', false);
//		this.emPanel.enableField('rmpct.bl_id', false);
//		this.emPanel.enableField('rmpct.fl_id', false);
//		this.emPanel.enableField('rmpct.rm_id', false);
		

		//set default value for "from and to location";
		var em_id = this.emPanel.getFieldValue("rmpct.em_id");
		this.setDefaultLocation(em_id);
		if(this.currentRmpct){
			this.questPanel.actions.get("questNext").show(false);
			/*
			 * for approve
			 */
			if(this.currentRmpct.getValue('rmpct.status')==0){
				this.isApproveOrIssue = true;
				this.initializeFieldValue();
				/*
				 * control button.
				 */
				this.questPanel.actions.get("approve").show(true);
				this.questPanel.actions.get("reject").show(true);
				/*
				 * for issue.
				 */
			}else if(this.currentRmpct.getValue('rmpct.status')==1){
				this.isApproveOrIssue = true;
				this.initializeFieldValue();
	        	var recordDs = this.getActivityLog();
	        	var status = recordDs.getValue('activity_log.status');
	    		//change button name from 'Submit' to 'Approve' and add 'Reject' button.
	        	this.questPanel.actions.get("save").show(status == 'APPROVED');//kb 3033489
	    		this.questPanel.actions.get("issue").show(status == 'APPROVED');
	    		this.questPanel.actions.get("cancel").show(status == 'APPROVED');
	    		this.questPanel.actions.get("complete").show(status == 'IN PROGRESS');
	    		this.questPanel.actions.get("stop").show(status == 'IN PROGRESS');
			}
			
	  	    this.originalAssignments = this.getAssignments();
	  	    //show commments panel.
	    	var restriction = new Ab.view.Restriction();
	    	restriction.addClause("activity_log.activity_log_id", this.tabs.activityLogIdValue);
	    	this.updatePanel.refresh(restriction);
		}else{
			//for request process , to location was empty by default. (sometimes those value filled causes by cache.)
			 this.emPanel.setFieldValue("rmpct.bl_id", "");
			 this.emPanel.setFieldValue("rmpct.fl_id", "");
			 this.emPanel.setFieldValue("rmpct.rm_id", "");
			 this.emPanel.setFieldValue("rmpct.parent_pct_id", "");
		}
		this.emPanel.actions.get("showPopUp").show(true);
    },
    /**
     * private method
     * set default value for "from and to location";
     */
    setDefaultLocation: function(em_id){
		 var emRecord = this.getFromLocationByEm(em_id);
		 if(emRecord!=null){
			 this.emPanel.setFieldValue("rmpct.from_bl_id", emRecord.getValue("rmpct.bl_id"));
			 this.emPanel.setFieldValue("rmpct.from_fl_id", emRecord.getValue("rmpct.fl_id"));
			 this.emPanel.setFieldValue("rmpct.from_rm_id", emRecord.getValue("rmpct.rm_id"));
			 this.emPanel.setFieldValue("rmpct.primary_em", emRecord.getValue("rmpct.primary_em"));
		 }else{
			 //set 'to location' from rm table. 
		    	var dataSource = this.ds_ab_assign_em_rm_js;
		    	var restriction = new Ab.view.Restriction();
		    	restriction.addClause("em.em_id", em_id);
		        var dsRecords =  dataSource.getRecords(restriction);
		        if(dsRecords!=null&&dsRecords.length>0){
		        	this.emPanel.setFieldValue("rmpct.from_bl_id", dsRecords[0].getValue("em.bl_id"));
		        	this.emPanel.setFieldValue("rmpct.from_fl_id", dsRecords[0].getValue("em.fl_id"));
		        	this.emPanel.setFieldValue("rmpct.from_rm_id", dsRecords[0].getValue("em.rm_id"));
		        	this.emPanel.setFieldValue("rmpct.primary_em", "1");
		        }	
		 }
		 this.emPanel.setFieldValue("rmpct.bl_id", "");
		 this.emPanel.setFieldValue("rmpct.fl_id", "");
		 this.emPanel.setFieldValue("rmpct.rm_id", "");
    },
    /**
     * private method
     * get em record by em_id
     */
    getFromLocationByEm: function(em_id){
    	var dataSource = this.ds_ab_assign_em_to_rm_js;
    	var date_end = getQuestionnaireFieldValue("date_start");
        var resDateStart = (date_end==null||date_end=='')?"":" OR date_start <= ${sql.date('"+ dateFormat(date_end) +"')}";
        var resDateEnd = (date_end==null||date_end=='')?"":" OR date_end >= ${sql.date('"+ dateFormat(date_end) +"')}";
        //KB3036965 - support em_id with single quotes
        em_id = em_id.replace(/\'/g, "''");
        var dateRestriction ="rmpct.em_id ='"+em_id+"' AND rmpct.primary_em =1 AND status=1 AND (date_start IS NULL "+resDateStart+") AND (date_end IS NULL "+resDateEnd+")";
        
        var dsRecords =  dataSource.getRecords(dateRestriction);
        if(dsRecords!=null&&dsRecords.length>0){
        	return dsRecords[0];
        }else{
        	return null;
        }
    },
    /**
     * private method
     * initialize fields value.
     */
    initializeFieldValue: function(){
		//show assign list by default
		var emAssign = this.currentRmpct;
		this.emPanel.setFieldValue("rmpct.pct_id", emAssign.getValue('rmpct.pct_id'));
		this.emPanel.setFieldValue("rmpct.parent_pct_id", emAssign.getValue('rmpct.parent_pct_id'));
		this.emPanel.setFieldValue("rmpct.activity_log_id", emAssign.getValue('rmpct.activity_log_id'));
		this.emPanel.setFieldValue("rmpct.em_id", emAssign.getValue('rmpct.em_id'));
		this.emPanel.setFieldValue("rmpct.from_bl_id", emAssign.getValue('rmpct.from_bl_id'));
		this.emPanel.setFieldValue("rmpct.from_fl_id", emAssign.getValue('rmpct.from_fl_id'));
		this.emPanel.setFieldValue("rmpct.from_rm_id", emAssign.getValue('rmpct.from_rm_id'));
		this.emPanel.setFieldValue("rmpct.bl_id", emAssign.getValue('rmpct.bl_id'));
		this.emPanel.setFieldValue("rmpct.fl_id", emAssign.getValue('rmpct.fl_id'));
		this.emPanel.setFieldValue("rmpct.rm_id", emAssign.getValue('rmpct.rm_id'));
		this.emPanel.setFieldValue("rmpct.dv_id", emAssign.getValue('rmpct.dv_id'));
		this.emPanel.setFieldValue("rmpct.dp_id", emAssign.getValue('rmpct.dp_id'));
		this.emPanel.setFieldValue("rmpct.rm_cat", emAssign.getValue('rmpct.rm_cat'));
		this.emPanel.setFieldValue("rmpct.rm_type", emAssign.getValue('rmpct.rm_type'));
		var primary_rm = emAssign.getValue('rmpct.primary_rm');
		if(!valueExistsNotEmpty(primary_rm)){
			this.emPanel.setFieldValue("rmpct.primary_rm", parseInt(primary_rm));
		}
		this.emPanel.setFieldValue("rmpct.primary_em", emAssign.getValue('rmpct.primary_em'));
    },
    /**
     * private method
     * get one record of current 'artivity_log' .
     */
    getActivityLog: function(){
     	var tabs = this.tabs;
     	var docsDS = View.dataSources.get("docsDS");
		var restriction = new Ab.view.Restriction();
	    var activityLogIdValue = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_log_id");
		if(tabs.activityLogIdValue){
			activityLogIdValue = tabs.activityLogIdValue;
		}
		restriction.addClause("activity_log.activity_log_id", activityLogIdValue);
 	    return docsDS.getRecords(restriction)[0];
     },

    questPanel_afterRefresh: function(){
	    var activityTypeValue = this.questPanel.getFieldValue("activity_log.activity_type");
	    var activityLogIdValue = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_log_id");
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("activity_log.activity_log_id", activityLogIdValue);
    	this.documentsPanel.refresh(restriction);
    	
		if(this.currentRmpct){
	      this.quest = new Ab.questionnaire.Quest(activityTypeValue, "questPanel",true);
		}
		else{
	      this.quest = new Ab.questionnaire.Quest(activityTypeValue, "questPanel");
		}
	  this.quest.showQuestions();
    },
    /**
     * click previous
     */
    questPanel_onPrevious: function(){
		if(this.currentRmpct){
			var restriction = new Ab.view.Restriction();
			var activityLogIdValue = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_log_id");
			if(helpDeskGroupMoveController.tabs.activityLogIdValue){
				activityLogIdValue = helpDeskGroupMoveController.tabs.activityLogIdValue;
			}
			restriction.addClause("activity_log.activity_log_id", activityLogIdValue);
			var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
			if(dynamicAssemblyTabsController){
				dynamicAssemblyTabsController.selectPreviousTab(restriction);
			}else{
				helpDeskGroupMoveController.tabs.selectTab("basic", restriction, false, false, false);
			}
		}else{
			var mainTabs = View.parentTab.parentPanel;
			var parentCtrl = View.getOpenerView().controllers.get(0);
			parentCtrl.basicRestriction["activity_log.activity_log_id"] = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_log_id");
			//fix KB3031741 - add activity_log.description to the basic tab restriction before go back to basic tab(Guo 2011/06/20)
			parentCtrl.basicRestriction["activity_log.description"] = this.questPanel.getFieldValue("activity_log.description");
			mainTabs.selectTab("basic", parentCtrl.basicRestriction, false, true, false); 
		}
    },
    /**
     * private method,only use for approve
     * get assigned employee list.
     */
    getMoveRecord: function(tabs){
    	var dsRmpct = View.dataSources.get("ds_for_get_date_use_by_js");
    	if(!tabs.activityLogIdValue){
    		return null;
    	}
        dsRmpct.addParameter('activity_log_id',tabs.activityLogIdValue);
        var records = dsRmpct.getRecords();
        if(records&&records.length>0){
        	return records[0];
        }
        return null;
    },
    /**
     * event handler is called when Approve button click.
     */
    questPanel_onApprove: function(){
    	var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
 		if(!valueExistsNotEmpty(em_id)){
 			View.showMessage(getMessage('emptyEmId'));
 			return;
 		}
    	//kb 3034834 because to location can be change be input, parent_pct_id should changed accordingly, so original checking if
   	 // input field value was empty was not accurate. 
		if(popUpSelectDvDpEtc()==false){
		   return;	
		}

		//kb#3043425: check if exists move requests and department clam/release requests on same day
		if (  !this.parpareForSubmit() ) {
			return;
		}

    	if(validateToLocation("ds_ab-sp-asgn-select-to-location-for-approve")){
    		this.onApprove();
		}
    },

    /**
     * private method
     */
    parpareForSubmit: function(){
    	var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
    	var originalAssignments = helpDeskGroupMoveController.originalAssignments;
    	var changedAssignments = helpDeskGroupMoveController.getAssignments();
    	var resultAssignments = compareAssignmentsChangeReturnNew(originalAssignments,changedAssignments);
    	
 		var tabs = helpDeskGroupMoveController.tabs;
    	tabs.dateEnd = dateFormat(tabs.move_date);
    	tabs.originalAssignments = originalAssignments;
    	tabs.changedAssignments = changedAssignments;
    	tabs.assignments = resultAssignments;
		return true;
    },

	/**
     * private method, get rmpct one record 'date_start' value
     * get assigned employee list.
     */
    getMoveRecordDateStart: function(tabs){
    	var dsRmpct = View.dataSources.get("ds_for_get_date_use_by_js");
    	dsRmpct.addParameter('activity_log_id',tabs.activityLogIdValue);
    	var records = dsRmpct.getRecords();
        if(records!= null&&records.length>0){
            var record = records[0];
            return record.getValue('rmpct.date_start');
        }
        return null;
    },

	/**
	 * event handler when 'Approve' button click
	 * call WFR 'approveMoveServiceRequest'
	 * if no exception throw, call sub-method  changeTab complete invoke.
	 */
	onApprove: function(){
 		var tabs = helpDeskGroupMoveController.tabs;
 		var groupMoveDetailTab = tabs.findTab('groupMoveDetailTab');
 		var orginalController = groupMoveDetailTab.getContentFrame().View.controllers.get('helpdeskRequestApproveEditController');
 		var objRecordAndComments = orginalController.getRecordAndComments();
 		objRecordAndComments.comments = this.updatePanel.getFieldValue("activity_log.comments");

    	//kb 3034042
    	if(detectIfExistsMoveFuture(tabs.assignments, tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 0)){
    		return;
    	}

		//kb#3043425:  add logics to check the same day department/move requests.
		var checkResult =  existsDepartmentAndMoveOnSameDay(tabs.assignments, tabs.dateEnd, 1);
		if ( checkResult ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
				if (button == 'no') 
					return;
				else 
					helpDeskGroupMoveController.continueApprove(objRecordAndComments);	  
			});
		} else 
			helpDeskGroupMoveController.continueApprove(objRecordAndComments);
	},

	continueApprove: function(objRecordAndComments){
 		var tabs = helpDeskGroupMoveController.tabs;
    	var activityLogIdValue = tabs.activityLogIdValue;
		var result;
		try {
				//kb 3034293 Need change date_start to current date if approve a request which has a requested moved date is in the past
				var testDate = helpDeskGroupMoveController.getMoveRecordDateStart(tabs);
				if(testDate!=null&&testDate<new Date()){
					tabs.dateEnd = dateFormat(getCurrentDateISOFormat());
					result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-approveMoveForPastDate"
							,activityLogIdValue*1,objRecordAndComments,tabs.dateEnd,tabs.assignments);
				}else{
					result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-approveMove"
							,activityLogIdValue*1,objRecordAndComments,tabs.dateEnd,tabs.assignments);
				}
	   		}catch(e){
	   			Workflow.handleError(e); 
	   			return false;
	   		}
     	 if(result)
     		 this.changeTab("select");
	},

    /**
     * event handler when 'Reject' button click
     * 1.find the previous tab 'groupMoveDetailTab' and call original method 'requestPanel_onReject''
     * 2.call method 'rejectRmpct' remove original assigned employee.
     * 3.if no exception throw, call sub-method  changeTab complete invoke.
     */
	questPanel_onReject: function(){
 		var tabs = this.tabs;
 		var groupMoveDetailTab = tabs.findTab('groupMoveDetailTab');
		var orginalController = groupMoveDetailTab.getContentFrame().View.controllers.get('helpdeskRequestApproveEditController');
		var objRecordAndComments = orginalController.getRecordAndComments();
 		objRecordAndComments.comments = this.updatePanel.getFieldValue("activity_log.comments");
		var activityLogIdValue = tabs.activityLogIdValue;
		var result;
		this.parpareForSubmit();
    	//kb 3034042
		if(detectIfExistsMoveFuture({I:[],D:tabs.originalAssignments}, tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 1)){
    		return;
    	}
    	
		try {
	   		    result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-rejectAll"
	   		    	,objRecordAndComments.record,objRecordAndComments.comments,activityLogIdValue*1,this.originalAssignments,tabs.dateEnd);
	   		}catch(e){
	   			Workflow.handleError(e); 
	   			return false;
	   		}
     	 if(result)
     		 this.changeTab("select");
	},
	/**
	 * if not changed anything, do not get parent_pct_id.
	 */
	checkIfChanged: function(){
    	var originalAssignments = helpDeskGroupMoveController.originalAssignments;
    	var changedAssignments = helpDeskGroupMoveController.getAssignments();
    	var resultAssignments = compareAssignmentsChangeReturnNew(originalAssignments,changedAssignments);
    	if(resultAssignments["U"].length==1){
    		return false;
    	}
    	return true;
	},
	/**
	 * Issue request
	 * Called by 'Issue' button
	 * @param {String} formName form submitted
	 */
	questPanel_onSave: function(){
		var tabs = this.tabs;
		//var record = gettingRecordsData(document.forms[formName]);                     
		var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
		if(!valueExistsNotEmpty(em_id)){
			View.showMessage(getMessage('emptyEmId'));
			return;
		}
		
		if(this.checkIfChanged()){
			//kb 3034834 because to location can be change be input, parent_pct_id should changed accordingly, so original checking if
			// input field value was empty was not accurate. 
			if(popUpSelectDvDpEtc()==false){
				return;	
			}
		}
		
		if (  !this.parpareForSubmit() ) {
			return;
		}

    	//kb 3034042
    	if(detectIfExistsMoveFuture({I:tabs.assignments["I"],U:[],D:tabs.assignments["D"]},
    			tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 5)){
    		return;
    	}
		
		//kb#3043425:  add logics to check the same day department/move requests.
		var checkResult =  existsDepartmentAndMoveOnSameDay(tabs.assignments, tabs.dateEnd, 1);
		if ( checkResult ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
				if (button == 'no') 
					return;
				else 
					helpDeskGroupMoveController.continueSave();	  
			});
		} else 
			helpDeskGroupMoveController.continueSave();
	},

	continueSave: function(){
		var tabs = this.tabs;
		var panel = this.updatePanel;
	    var record = ABHDC_getDataRecord2(panel);
		var assignmentObject = tabs.assignments;
		var activityLogIdValue = tabs.activityLogIdValue;
		var requestDate = tabs.dateEnd;
		
		try {
			var result = null;
			if(requestDate!=null&&new Date(requestDate)<new Date()){
				assignmentObject = {I:tabs.changedAssignments,U:[],D:tabs.originalAssignments};
			    result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAllForPastDate',
						parseInt(activityLogIdValue), record, requestDate,assignmentObject,true);
			    this.tabs.move_date = getCurrentDateISOFormat();
			}else{
				result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAll', 
						parseInt(activityLogIdValue), record, requestDate,assignmentObject,true);
			}
			helpDeskGroupMoveController.originalAssignments = helpDeskGroupMoveController.getAssignments();
		}catch(e){
			Workflow.handleError(e);
		}
	},

	/**
	* Issue request
	* Called by 'Issue' button
	* @param {String} formName form submitted
	*/
	questPanel_onIssue: function(){
		var tabs = this.tabs;
		//3035487 Without To location, we should not allow this request to be issued	
		if(this.ifExistsFromToAllEmpty()){
			var message =getMessage("withEmptyFromAndToLocation");
			View.alert(message);
			return;
		}
    	var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
 		if(!valueExistsNotEmpty(em_id)){
 			View.showMessage(getMessage('emptyEmId'));
 			return;
 		}

		if(this.checkIfChanged()){
			//kb 3034834 because to location can be change be input, parent_pct_id should changed accordingly, so original checking if
			// input field value was empty was not accurate. 
			if(popUpSelectDvDpEtc()==false){
				return;	
			}
		}
		
		if (  !this.parpareForSubmit() ) {
			return;
		}

    	//kb 3034042
    	if(detectIfExistsMoveFuture({I:tabs.assignments["I"],U:[],D:tabs.assignments["D"]},
    			tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 5)){
    		return;
    	}

		//kb#3043425:  add logics to check the same day department/move requests.
		var checkResult =  existsDepartmentAndMoveOnSameDay(tabs.assignments, tabs.dateEnd, 1);
		if ( checkResult ) {
			View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", checkResult), function(button){
				if (button == 'no') 
					return;
				else 
					helpDeskGroupMoveController.continueIssue();	  
			});
		} else 
			helpDeskGroupMoveController.continueIssue();
	},

	continueIssue: function(){
		var tabs = this.tabs;
	    var panel = this.updatePanel;
	    //var activityLogId = panel.getFieldValue("activity_log.activity_log_id");
	    var record = ABHDC_getDataRecord2(panel);
		var assignmentObject = tabs.assignments;
		var activityLogIdValue = tabs.activityLogIdValue;
		var requestDate = tabs.dateEnd;
	    
		try {
			var result = null;
			if(requestDate!=null&&new Date(requestDate)<new Date()){
				assignmentObject = {I:tabs.changedAssignments,U:[],D:tabs.originalAssignments};
			    result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAllForPastDate',
						parseInt(activityLogIdValue), record, requestDate,assignmentObject,false);
			}else{
				result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAll', 
						parseInt(activityLogIdValue), record, requestDate,assignmentObject,false);
			}
			this.goToNextStep();
		}catch(e){
			Workflow.handleError(e);
		}
	},	

	/**
	 * check if exists from location and to location all empty assignments.
	 */
	ifExistsFromToAllEmpty: function(){
		 var fromBl = this.emPanel.getFieldValue("rmpct.from_bl_id");
		 var fromFl = this.emPanel.getFieldValue("rmpct.from_fl_id");
		 var fromRm = this.emPanel.getFieldValue("rmpct.from_rm_id");
		 var bl = this.emPanel.getFieldValue("rmpct.bl_id");
		 var fl = this.emPanel.getFieldValue("rmpct.fl_id");
		 var rm = this.emPanel.getFieldValue("rmpct.rm_id");
		 if(fromBl==""&&fromFl==""&&fromRm==""&&bl==""&&fl==""&&rm==""){
			 return true;
		 }
		 return false;
	},
	goToNextStep: function(){
 		var openerViewRestriction = View.getOpenerView().restriction;
		if(openerViewRestriction){
			View.getOpenerView().getOpenerView().closeDialog();	
		}else{
			helpDeskGroupMoveController.changeTab("select");
		}
	},
	/**
	* Cancel request
	* Called by 'Cancel' button
	* @param {String} formName form submitted
	*/
	questPanel_onCancel: function(){
		var tabs = this.tabs;

	    var activityLogIdValue =  tabs.activityLogIdValue;

	    this.parpareForSubmit();
    	//kb 3034042
    	if(detectIfExistsMoveFuture({I:[],D:tabs.originalAssignments}, tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 1)){
    		helpDeskGroupMoveController.initializeFieldValue();
    		return;
    	}
		var panel = View.panels.get("updatePanel");
	    var record = ABHDC_getDataRecord2(panel);
		try {
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-cancelAll',
					parseInt(activityLogIdValue), record, this.originalAssignments ,tabs.dateEnd);
			this.goToNextStep();
		}catch(e){
			Workflow.handleError(e);
		}
	},
	/**
	* Complete request<br />
	* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#completeRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-completeRequest</a><br />
	* Reloads select tab<br />
	* Called by 'Complete' button
	* @param {String} formName form submitted
	*/
	questPanel_onComplete: function(){
		var tabs = this.tabs;
		var panel = View.panels.get("updatePanel");
	    var record = ABHDC_getDataRecord2(panel);
	    
	    try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-completeRequest', record);
			if(result.code == 'executed'){
				
				helpDeskGroupMoveController.selectFirstTab(View.getOpenerView().tabs);
			} else {
				Workflow.handleError(result);
			}
		}catch(e){
			Workflow.handleError(e);
		}
	},
	selectFirstTab:function(mainTabs){
		this.questPanel.show(false);
		this.emPanel.show(false);
		mainTabs.findTab("indvMoveEditApprove").isContentLoaded=false;
		mainTabs.selectTab("select");
	},
	/**
	* Stop request<br />
	* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#stopRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-stopRequest</a><br />
	* Reloads select tab<br />
	* Called by 'Stop' button
	* @param {String} formName form submitted
	*/
	questPanel_onStop: function(){
		var tabs = this.tabs;
		var panel = View.panels.get("updatePanel");
	    var record = ABHDC_getDataRecord2(panel);
		
	    try {
	    	helpDeskGroupMoveController.selectFirstTab(View.getOpenerView().tabs);
            if(result.code == 'executed'){
				View.getOpenerView().tabs.selectTab("select");
			} else {
				Workflow.handleError(result);
			}
		}catch(e){
			Workflow.handleError(e);
		}
	},
	/**
	 * private method
	 */
	 changeTab: function(tabName){
	    	var restriction = new Ab.view.Restriction();
		    restriction.addClause("activity_log.activity_log_id", this.tabs.activityLogIdValue);
		    this.questPanel.show(false);
			this.emPanel.show(false);
			this.tabs.findTab("indvMoveEditApprove").isContentLoaded=false;
		    this.tabs.selectTab(tabName, restriction, false, false, false);
	    },
 	/**
 	 * get date for 'group move' and date_start for 'individual move' by activity_log_id.
 	 */
	checkRmstdEmstd: function(em_id,bl_id,fl_id,rm_id){
		//should be remove this restriction in the process of Approve and Issue
		if(this.currentRmpct){
			return true;
		}

		try {
 			result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransaction-checkRmstdEmstd",em_id,bl_id,fl_id,rm_id);
 			if(result.jsonExpression != ""){
 				res = eval('('+result.jsonExpression+')');
 				if(res.isMatahed&&res.isMatahed=="true"){
 					return true;
 				}
 			}
 		}catch(e){
 			Workflow.handleError(e); 
 		}
 		return null;
 	},
    /**
     * private method
     */
    getAssignments: function(){
    	var assignments = [];
        var record = new Object();
        record['from_bl_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.from_bl_id");
        record['from_fl_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.from_fl_id");
        record['from_rm_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.from_rm_id");
        record['primary_em'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.primary_em")*1;
        
        var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
		
        record['em_id'] = em_id;
        record['bl_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.bl_id");
        record['fl_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.fl_id");
        record['rm_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.rm_id");
        record['activity_log_id'] = this.tabs.activityLogIdValue;

        record['pct_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.pct_id");
		record['parent_pct_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.parent_pct_id");
		record['dv_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.dv_id");
		record['dp_id'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.dp_id");
		record['rm_cat'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.rm_cat");
		record['rm_type'] = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.rm_type");
		var primary_rm = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.primary_rm");
		record['primary_rm'] = primary_rm==null||primary_rm==""?0:primary_rm;
		
		assignments.push(record);
        return assignments;
    }
});
/**
 * event handler is called when Next button click.
 * 1.check if it is individual move or group move, add field input value to Object tabs for further use.
 * 2.check to make sure fields not contain incorrect values.
 * 3.go to next assignments tab.
 */
function onNext(){
	var tabs = helpDeskGroupMoveController.tabs;
    var activityLogIdValue = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_log_id");
	var result = false;
	var tabBasic = tabs.findTab("basic");
	var serviceProvider = getServiceProvider(activityLogIdValue);
	var move_end = getQuestionnaireFieldValue("date_start");
	
	result = checkMoveDate();
	
	var dp_contact = getQuestionnaireFieldValue("dp_contact");
	if(!valueExistsNotEmpty(dp_contact)){
		View.showMessage(getMessage('dpContact'));
		return;
	}
	var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
	if(!valueExistsNotEmpty(em_id)){
		View.showMessage(getMessage('emptyEmId'));
		return;
	}
	var validateDS = "ds_ab-sp-asgn-select-to-location";
	if(existsUserRoleProcess()){
		validateDS = "ds_ab-sp-asgn-select-to-location-for-approve"; 
	}
    if(result&&validateToLocation(validateDS)){
    	if (!valueExistsNotEmpty(helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.description"))) {
    		helpDeskGroupMoveController.questPanel.clearValidationResult();
    		helpDeskGroupMoveController.questPanel.addInvalidField("activity_log.description", getMessage("noDescription"));
    		helpDeskGroupMoveController.questPanel.displayValidationResult();
    		return;
    	}
    	//kb 3034834 because to location can be change be input, parent_pct_id should changed accordingly, so original checking if
   	 // input field value was empty was not accurate. 
		if(popUpSelectDvDpEtc()==false){
			   return;	
			}
//		alert('pass');return;
    	//below are encapsulate parameter for WFR.
    	tabs.dateEnd = dateFormat(move_end);
    	tabs.activityLogIdValue = activityLogIdValue;
		var insertAssignments = helpDeskGroupMoveController.getAssignments();
		var unchangeAssignments = [];
		var deleteAssignments = [];
		var result = {I:insertAssignments,U:unchangeAssignments,D:deleteAssignments};
		
        tabs.assignments = result;
    	//kb 3034042
    	if(detectIfExistsMoveFuture(tabs.assignments, tabs.dateEnd, getMessage("pendingFutureTransMoveOut"), 0)){
    		return;
    	}
    	//save questionnaire
    	helpDeskGroupMoveController.quest.beforeSaveQuestionnaire();
    	if (!helpDeskGroupMoveController.questPanel.save()) {
    		return;
    	}
    	//submit and go to next tab
    	onCreateGroupMoveSubmit(tabs);
    }
}

/**
 * event handler when 'click to location' button click
 * show a pop-up panel for use select other location.
 */
function clickChangeToLocation(){
	if(checkMoveDate()){
		popUpToLocation();
	}
}
/**
 * if a selected room has multiple portions that the user can actually move into,
 * then the system must also pop-up the same window to allow the user to select the portion of the room
 */
function popUpSelectDvDpEtc(){
	var bl_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.bl_id");
	var fl_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.fl_id");
	var rm_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.rm_id");
	var move_end = getQuestionnaireFieldValue("date_start");
	var dsClickRoom = View.dataSources.get("ds_ab-sp-asgn-em-to-click_rm_pop_up");
	dsClickRoom = addParmeter(dsClickRoom,bl_id,fl_id,rm_id,move_end);
	var dsRecords = dsClickRoom.getRecords();
	if(dsRecords.length>1){
		//check if parment_pct_id has selected.
		var parent_pct_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.parent_pct_id");
		if(valueExistsNotEmpty(parent_pct_id)){
			for(i=0;i<dsRecords.length;i++){
				if(parent_pct_id ==dsRecords[i].getValue("rmpct.pct_id")){
					return true;
				}
			}
		}
		var showPanel=View.panels.get("abSpAsgnEmToClickRm_popup");
		showPanel = addParmeter(showPanel,bl_id,fl_id,rm_id,move_end);
		showPanel.refresh();
		showPanel.showInWindow({
			width: 800,
			height: 500
		});
		return false;
	}else{
        if (dsRecords.length==1){
        	var pct_id = dsRecords[0].getValue("rmpct.pct_id");
        	var dv_id = dsRecords[0].getValue("rmpct.dv_id");
        	var dp_id = dsRecords[0].getValue("rmpct.dp_id");
        	var rm_cat = dsRecords[0].getValue("rmpct.rm_cat");
        	var rm_type = dsRecords[0].getValue("rmpct.rm_type");
        	var primary_rm = dsRecords[0].getValue("rmpct.primary_rm");
            helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.parent_pct_id", pct_id);
            helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.dv_id", dv_id);
            helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.dp_id", dp_id);
            helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.rm_cat", rm_cat);
            helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.rm_type", rm_type);
            helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.primary_rm", primary_rm);
        }else{
       	 //if this record not exists, then get fields value form rm table.
    	    var dataSource = helpDeskGroupMoveController['ds_ab-sp-asgn-rm'];
    	   	var restriction = new Ab.view.Restriction();
    	   	restriction.addClause("em.bl_id", bl_id);
    	   	restriction.addClause("em.fl_id", fl_id);
    	   	restriction.addClause("em.rm_id", rm_id);
            var dsRecords =  dataSource.getRecords(restriction);
            if(dsRecords!=null&&dsRecords.length>0){
    	       	var record = dsRecords[0];
    	       	helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.dv_id", record.getValue("rm.dv_id"));
    	       	helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.dp_id", record.getValue("rm.dp_id"));
    	       	helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.rm_cat", record.getValue("rm.rm_cat"));
    	       	helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.rm_type", record.getValue("rm.rm_type"));
            }
            helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.parent_pct_id", "");
        }
        return true;
	}
}
function popUpToLocation(){
	var date_end = getQuestionnaireFieldValue("date_start");
	var popupPanel = View.panels.get('abSpAsgnEmToRm_popup');
	// for approve or issue or process_id = 'Space Manager RmTrans', allow use select room for at-capacity or over capacity.  
	if(helpDeskGroupMoveController.isApproveOrIssue||existsUserRoleProcess()){
		popupPanel = View.panels.get('abSpAsgnEmToRm_popup_approve');
	}
	popupPanel.addParameter('p_date_start', dateFormat(date_end));
	popupPanel.addParameter('p_date_end', dateFormat(date_end));
	popupPanel.showInWindow({
		width: 800,
		height: 500
	});
	popupPanel.refresh();
}
/**
 * get Resturction
 */
function getResturction(move_end,str){
	//bl.bl_id = rm.bl_id
	return " exists (select 1 from rm where  "+str+" and " +
	" rm.cap_em > 0  AND  rm.cap_em > (  " +
	"SELECT COUNT(DISTINCT(rmpct.em_id))  FROM rmpct " +
	"  WHERE   rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id  AND rmpct.em_id IS NOT NULL " +
	" AND ((   (rmpct.date_start IS NULL OR rmpct.date_start &lt;= '"+move_end+"')" +
	"  AND (rmpct.date_end IS NULL OR rmpct.date_end &gt;='"+move_end+"'))" +
	"  OR rmpct.date_start &gt;= '"+move_end+"')" +
	"  AND rmpct.status IN (0, 1)) " +
	")";
}
/**
 * Select selectEm
 */
function selectEm(){
	var fieldNames=["rmpct.em_id"]; 
	var selectFieldNames=["em.em_id"]; 
	var visibleFieldNames=["em.em_id","em.dv_id","em.dp_id"]; 
	var restriction = new Ab.view.Restriction();
	View.selectValue("emPanel", getMessage("dialogSelectEm"), fieldNames, "em", 
			selectFieldNames, visibleFieldNames, restriction, 'afterSelectValue',false,null,null,null,null,null,null,toJSON([{
		        fieldName: 'em.em_id',
		        sortOrder: 1
		    }]));
}
function afterSelectValue(fieldName, newValue, oldValue) {
	helpDeskGroupMoveController.setDefaultLocation(newValue);
    return true;
}
function checkMoveDate(){
	var move_end = getQuestionnaireFieldValue("date_start");
	var iso_move_end = dateFormatToISO(move_end);
	
	if (!valueExistsNotEmpty(move_end)) {
        View.showMessage(getMessage('moveDateIsNotNull'));
      //if date1 is earlier than date2, it returns true, otherwise false.
	}else if(!helpDeskGroupMoveController.isApproveOrIssue && compareISODates(iso_move_end, getCurrentDateISOFormat())){
		View.showMessage(getMessage('errorMoveDateInThePast'));
	}else{
		return true;
	}
	return false;
}
/**
 * private method
 * return a record like call original method 'ABHDC_getDataRecord2' 
 */
function getRecord(tabs){
	var activityLogIdValue = tabs.activityLogIdValue; 
	var recordDs = helpDeskGroupMoveController.getActivityLog();
		var record = {"activity_log.activity_log_id" : activityLogIdValue,
				"activity_log.created_by" : recordDs.getValue('activity_log.created_by'), 
				"activity_log.requestor" : recordDs.getValue('activity_log.requestor'), 
				"activity_log.phone_requestor" : recordDs.getValue('activity_log.phone_requestor'), 
				"activity_log.assessment_id" : recordDs.getValue('activity_log.assessment_id')};
		return record;
}

/**
 * event handle when 'Submit' button  click
 * 1.call WFR submitDocMoveServiceRequest
 * 2.if true, go to 'select' tab.
 */
function onCreateGroupMoveSubmit(tabs){
	var activityLogIdValue = tabs.activityLogIdValue;   
	var record = getRecord(tabs);
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
}

/**
 * private method
 * for 'create group move' submit
 */
function doSubmit(record, tabs, activityLogIdValue){
	//kb#3043425:  add logics to check the same day department/move requests.
	var result =  existsDepartmentAndMoveOnSameDay(tabs.assignments, tabs.dateEnd, 1);
	if ( result ) {
		View.confirm(getMessage("existsSameDayMoveAndDepartmentRequests").replace("{0}", result), function(button){
			if (button == 'no') {
				return;
			} else { 
				runWorkflowRule(record, tabs, activityLogIdValue);
			}
		});
	} 
	else 
		runWorkflowRule(record, tabs, activityLogIdValue);
}

/**
 * private method
 * for 'create group move' submit
 */
function runWorkflowRule(record, tabs, activityLogIdValue){
    var result;
	try {
		 result =  Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-submitMove', 
				 activityLogIdValue*1,record,tabs.dateEnd,tabs.assignments);
	}catch(e){
		Workflow.handleError(e);
		return;
	}
	if (result){
//		var tabs = View.getOpenerView().panels.get('helpDeskRequestTabs');
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
}

/**
 * to submit a move request for a person that is already included in another pending move request.
 */
function ifExistDuplicateRecords(date,em_id){
	var dsRmpct = View.dataSources.get("duplicates_rmpct_for_js");
    dsRmpct.addParameter('current_date',date);
    dsRmpct.addParameter('em_id',em_id);
    var dsRecords = dsRmpct.getRecords();
    if(dsRecords.length>0){
	  return true;
    }
    return false;
}
/**
 * private method
 */
function addParmeter(showPanel,blId,flId,rmId,date_end){
    var resDateStart = (date_end==null||date_end=='')?"":" OR date_start <= ${sql.date('"+ dateFormat(date_end) +"')}";
    var resDateEnd = (date_end==null||date_end=='')?"":" OR date_end >= ${sql.date('"+ dateFormat(date_end) +"')}";
    var dateRestriction = " AND  (date_start IS NULL "+resDateStart+") AND (date_end IS NULL "+resDateEnd+")";
    
//	var dateRestriction = " AND rmpct.date_start &lt;= ${sql.date('"+dateFormat(date_end)+"')} AND" +
//			" rmpct.date_end &gt;= ${sql.date('"+dateFormat(date_end)+"')}";
	showPanel.addParameter('p_bl_id', blId);
	showPanel.addParameter('p_fl_id', flId);
	showPanel.addParameter('p_rm_id', rmId);
	showPanel.addParameter('dateRestriction', dateRestriction);
	return showPanel;
}
/**
 * event handler when select one row of existed record dv_id dp_id, rm_cat, rm_type.
 * Get the dv_id dp_id, rm_cat, rm_type from those rmpct records
 */
function chooseOneRecordToRoom(){
    var popUpPanel = View.panels.get('abSpAsgnEmToClickRm_popup');
    var rowIndex = popUpPanel.rows[popUpPanel.selectedRowIndex];
    var pct_id = rowIndex["rmpct.pct_id"];
    var dv_id = rowIndex["rmpct.dv_id"];
    var dp_id = rowIndex["rmpct.dp_id"];
    var rm_cat = rowIndex["rmpct.rm_cat"];
    var rm_type = rowIndex["rmpct.rm_type"];
    var primary_rm = rowIndex["rmpct.primary_rm.raw"];
    
    helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.parent_pct_id", pct_id);
    helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.dv_id", dv_id);
    helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.dp_id", dp_id);
    helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.rm_cat", rm_cat);
    helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.rm_type", rm_type);
    helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.primary_rm", primary_rm);
    
    popUpPanel.show(false);
    popUpPanel.closeWindow();
}
/**
 * private method, return date format mm/dd/yyyy 
 * @param dateStr
 * @returns
 */
function dateFormat(dateStr){
	if(dateStr!=null&&dateStr!='')	{
		//kb#3043781: don't parse the date string when it uses normal format like 'yyyy--mm-dd'
		if ( dateStr.split("/")[2] )		
			return dateStr.split("/")[2]+"-"+dateStr.split("/")[0]+"-"+dateStr.split("/")[1];
		else 
			return dateStr;
	}
	else 
	  return "";
}

/**
 * get current date in ISO format(like '2013-12-26')
 */
function getCurrentDateISOFormat() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return  year+ "-" +((month < 10) ? "0" : "") + month + "-"  + ((day < 10) ? "0" : "") + day;
}
/**
 * private method, return date format yyyy-mm-dd. 
 * @param dateStr
 * @returns
 */
function dateFormatToISO(dateStr){
	if(dateStr!=null&&dateStr!='')
	return dateStr.split("/")[2]+"-"+dateStr.split("/")[0]+"-"+dateStr.split("/")[1];
	else 
	  return "";
}

/**
 * check if questionnaire can save
 * @returns {Boolean}
 */
function auestionnaireCanSave(){
    var canSave = true;
    for (var i = 0; i < 5; i++) {
        if(!$('questPanel_question' + i + '.answer_field').value){
			canSave = false;
			break;
		}
    }
    return canSave
}
function getServiceProvider(activityLogId){
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getServiceProvider', parseInt(activityLogId));
		if(result.jsonExpression != ""){
			res = eval('('+result.jsonExpression+')');
			if(res.serviceProvider=='AbMoveManagement'){
				return 0;
			}
		}
	}catch(e){
		Workflow.handleError(e); 
		return 1;
	}
	return 2;
}
/**
***************************below was the logic after redesign individual move*************************************
*/
function showPopupSelectRoom(){
	var restriction = new Ab.view.Restriction();
	var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
	var move_end = getQuestionnaireFieldValue("date_start");
	if(!valueExistsNotEmpty(em_id)){
		View.showMessage(getMessage('emptyEmId'));
		return;
	}
	var validateDS = "ds_ab-sp-asgn-select-to-location";
	if(helpDeskGroupMoveController.isApproveOrIssue||existsUserRoleProcess()){
		validateDS = "ds_ab-sp-asgn-select-to-location-for-approve"; 
	}
	if(checkMoveDate()&&validateToLocation(validateDS)){
		View.openDialog("ab-helpdesk-request-create-indv-mo-popup.axvw",restriction, false,null,null,1300,700);
	}
}
/**
 * common method , check if exists process 'Space Manager RmTrans'.
 * @returns
 */
function existsUserRoleProcess(){
	var dataSource = View.dataSources.get('ds_ab-sp-asgn-current-user-role');
	var records = dataSource.getRecords();
	if(records.length>0){
    	return true;
	}
	return false;
}
/**
 * kb 3033829 validate to location you inputed are correct.
 * @returns {Boolean}
 */
function validateToLocation(dataSource){
//	var dataSource = View.dataSources.get("ds_ab-sp-asgn-select-to-location");
	var dataSource = View.dataSources.get(dataSource);
	var date_end = getQuestionnaireFieldValue("date_start");
	dataSource.addParameter('p_date_start', dateFormat(date_end));
	dataSource.addParameter('p_date_end', dateFormat(date_end));
	
	var bl_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.bl_id");
	var fl_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.fl_id");
	var rm_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.rm_id");
	if(!valueExistsNotEmpty(bl_id)&&!valueExistsNotEmpty(fl_id)&&!valueExistsNotEmpty(rm_id)){
		return true;
	}
	var restriction = "bl_id='"+bl_id+"'";
	var records = dataSource.getRecords(restriction);
	if(records.length>0){
		if(!valueExistsNotEmpty(fl_id)&&!valueExistsNotEmpty(rm_id)){
			return true;
		}else{
			restriction = "bl_id='"+bl_id+"' and fl_id='"+fl_id+"'";
			records = dataSource.getRecords(restriction);
			if(records.length>0){
				if(!valueExistsNotEmpty(rm_id)){
					return true;
				}else{
					restriction = "bl_id='"+bl_id+"' and fl_id='"+fl_id+"' and rm_id='"+rm_id+"'";
					records = dataSource.getRecords(restriction);
					if(records.length>0){
						return true;
					}else{
						View.showMessage(getMessage('invalidRoom'));
						return false;
					}
				}
			}else{
				View.showMessage(getMessage('invalidFloor'));
				return false;
			}
		}
	}else{
		View.showMessage(getMessage('invalidBuilding'));
		return false;
	}
}
/**
***************************below was the logic related to 'change from location' *************************************
*/
/**
 * event handler when 'click from location' button click
 * show a pop-up panel for use select other location.
 */
function clickChangeFromLocation(){
	if(checkMoveDate()){
		var date_end = getQuestionnaireFieldValue("date_start");
		var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
		
		if(!valueExistsNotEmpty(em_id)){
			View.showMessage(getMessage('emptyEmId'));
			return;
		}
		
		var popupPanel = View.panels.get('abSpAsgnEmFromRm_popup');
		if(checkIfExistEmMove(em_id,date_end)){
			View.confirm(getMessage('existEmPendingMove'), function(button){
				if (button == 'yes') {
					//popupPanel.refresh(restriction);
					popupPanel.showInWindow({
						width: 800,
						height: 500
					});
					addRadioEleToTitle();
					radioClick();
				}
			});
		}else{
			//popupPanel.refresh(restriction);
			popupPanel.showInWindow({
				width: 800,
				height: 500
			});
			addRadioEleToTitle();
			radioClick();
		}
	}
}
/**
 * private method
 * check if exist em pending move
 */
function checkIfExistEmMove(em_id,date_end){
	//KB3036965 - support em_id with single quotes
	em_id = em_id.replace(/\'/g, "''");
	var dataSource = View.dataSources.get("ds_ab-sp-asgn-select-location");
	var restriction = " EXISTS (SELECT (1) FROM rmpct WHERE em_id = '"+em_id+"' AND status IN (0, 1) " +
	 "AND (date_start IS NULL or date_start &lt;=${sql.date('"+ dateFormat(getCurrentDateISOFormat()) +"')}) AND (date_end is null or date_end &gt;=${sql.date('"+ dateFormat(getCurrentDateISOFormat()) +"')})" +
	 		" AND activity_log_id IS NOT NULL) AND rm.hotelable = 0";
	 var records = dataSource.getRecords(restriction);
	 if(records.length>0)
		 return true;
	 return false;
}
/**
 * private method
 * when select panel pop-up add radio button and title
 */
function addRadioEleToTitle(){
	var scenarioList_title_td = Ext.get('scenarioList_title_td');
	if (scenarioList_title_td != null) {
		scenarioList_title_td.remove();
	}
	 var titleNode = document.getElementById('abSpAsgnEmFromRm_popup_title');
     if (titleNode == null) 
         return;
     var prompt = "Scenario Id Lists";
     var prompt ='<input type="radio" name="selectLocation" checked onclick="radioClick()" value="0"><span translatable="true">'+getMessage('popRadio1')+' </span></input><input type="radio" name="selectLocation" onclick="radioClick()"  value="1"><span translatable="true">'+getMessage('popRadio2')+'</span></input>';
     var pn = titleNode.parentNode.parentNode;
     var cell = Ext.DomHelper.append(pn, {
         tag: 'td',
         id: 'scenarioList_title_td'
     });
     var tn = Ext.DomHelper.append(cell, '<p>' + prompt + '</p>', true);
}
/**
 * event handler when radio 'Select from an existing location' or 'Select another location' click
 * show differnet records according you selected radio
 */
function radioClick(){
	var date_end = getQuestionnaireFieldValue("date_start");
	var selectLocation = document.getElementsByName("selectLocation");
	var popupPanel = View.panels.get('abSpAsgnEmFromRm_popup');
//	var restriction = new Ab.view.Restriction();
	var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
	//KB3036965 - support em_id with single quotes
	em_id = em_id.replace(/\'/g, "''");
	var restriction = " em_id = '"+em_id+"' AND status = 1 " +
	"AND (date_start IS NULL or date_start &lt;= ${sql.date('"+ dateFormat(date_end) +"')})" +
	" AND (date_end is null or date_end &gt;=${sql.date('"+ dateFormat(date_end) +"')}) ";
	if (selectLocation[0].checked) {
	    popupPanel.refresh(restriction+ "AND rm.hotelable = 0");
	}else{//another Location
		var restrictionOthers ="rmpct.pct_id not in (SELECT rmpct.pct_id FROM rmpct,(select bl_id,fl_id,rm_id from rmpct " +
				"where"+restriction+") ${sql.as} rmpctExist " +
				"WHERE  rmpct.bl_id= rmpctExist.bl_id and rmpct.fl_id= rmpctExist.fl_id and rmpct.rm_id= rmpctExist.rm_id) " +
				" AND rm.hotelable = 0";
		popupPanel.refresh(restrictionOthers);
	}
}
/**
 * event handler when click one record of from bl fl rm.
 * 1.change assign list according you selected row
 * 2.change 'primary_em' to 0 if you selected different room.
 */
function chooseOneRecordFromRoom(){
	var popUpPanel = View.panels.get('abSpAsgnEmFromRm_popup');
	var rowIndex = popUpPanel.rows[popUpPanel.selectedRowIndex];
    var bl_id="",fl_id="",rm_id="";
    if(rowIndex){
    	bl_id = rowIndex["rmpct.bl_id"];
    	fl_id = rowIndex["rmpct.fl_id"];
    	rm_id = rowIndex["rmpct.rm_id"];
    }
    var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
	helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.from_bl_id",bl_id);
	helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.from_fl_id",fl_id);
	helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.from_rm_id",rm_id);
	if(isEqualBlFlRm(em_id,bl_id,fl_id,rm_id)){
		helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.primary_em","1");
	}else{
		helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.primary_em","0");
	}
    popUpPanel.closeWindow();
}
/**
 * event handler when click one record of from bl fl rm.
 * 1.change assign list according you selected row
 * 2.change 'primary_em' to 0 if you selected different room.
 */
function chooseOneRecordMoveToRoom(){
	var popUpPanel = View.panels.get('abSpAsgnEmToRm_popup');
	var rowIndex = popUpPanel.rows[popUpPanel.selectedRowIndex];
	if(!rowIndex){
		popUpPanel = View.panels.get('abSpAsgnEmToRm_popup_approve');
		rowIndex = popUpPanel.rows[popUpPanel.selectedRowIndex];
	}
	var bl_id="",fl_id="",rm_id="";
	if(rowIndex){
		bl_id = rowIndex["rm.bl_id"];
		fl_id = rowIndex["rm.fl_id"];
		rm_id = rowIndex["rm.rm_id"];
		
	    var em_id = helpDeskGroupMoveController.emPanel.getFieldValue("rmpct.em_id");
	    if(!helpDeskGroupMoveController.checkRmstdEmstd(em_id,bl_id,fl_id,rm_id)){
			var message =getMessage("cannotOccupy").replace("<{0}>", " "+em_id);
			View.alert(message);
			return;
	    }
	    
		helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.bl_id",bl_id);
		helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.fl_id",fl_id);
		helpDeskGroupMoveController.emPanel.setFieldValue("rmpct.rm_id",rm_id);
		if(bl_id){
			helpDeskGroupMoveController.emPanel.actions.get("showPopUp").show(true);
		}
	}
	popUpPanel.closeWindow();
	
	popUpSelectDvDpEtc();
}
/**
 * private method
 * check if exist primary_em=1 record.
 */
function isEqualBlFlRm(em_id,bl_id,fl_id,rm_id){
 	var dataSource = helpDeskGroupMoveController.ds_ab_assign_em_to_rm_js;
 	var date_end = getQuestionnaireFieldValue("date_start");
     var resDateStart = (date_end==null||date_end=='')?"":" OR date_start <= ${sql.date('"+ dateFormat(date_end) +"')}";
     var resDateEnd = (date_end==null||date_end=='')?"":" OR date_end >= ${sql.date('"+ dateFormat(date_end) +"')}";
     //KB3036965 - support em_id with single quotes
     em_id = em_id.replace(/\'/g, "''");
     var dateRestriction ="rmpct.em_id ='"+em_id+"' AND rmpct.primary_em =1 AND status=1 AND (date_start IS NULL "+resDateStart+") AND (date_end IS NULL "+resDateEnd+")";
     dateRestriction ="rmpct.bl_id='"+bl_id+"' AND rmpct.fl_id='"+fl_id+"' AND rmpct.rm_id='"+rm_id+"' AND "+dateRestriction;
     var dsRecords =  dataSource.getRecords(dateRestriction);
     if(dsRecords!=null&&dsRecords.length>0){
     	return true;
     }else {
         if(ifExistsInEm(em_id,bl_id,fl_id,rm_id)){
         	return true;
         }	
      }
      return false;
 }
 /**
  * private method
  * check if exist record in em table.
  */
 function ifExistsInEm(em_id,bl_id,fl_id,rm_id){
 	if(bl_id==""||fl_id==""||rm_id==""){
 		return false;
 	}
     var dataSource = helpDeskGroupMoveController['ds_ab_assign_em_rm_js'];
 	var restriction = new Ab.view.Restriction();
 	restriction.addClause("em.em_id", em_id);
 	restriction.addClause("em.bl_id", bl_id);
 	restriction.addClause("em.fl_id", fl_id);
 	restriction.addClause("em.rm_id", rm_id);
     var dsRecords =  dataSource.getRecords(restriction);
     if(dsRecords!=null&&dsRecords.length>0){
     	return true;
     }	
     return false;
 }
 /**
  * get Questionnaire field obj
  * @param fieldName
  * @returns
  */
 function getQuestionnaireFieldValue(fieldName){
 	var activityTypeValue = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_type");
     var tabs = View.getControlsByType(parent, 'tabs')[0];
// 	activityTypeValue="SERVICE DESK - GROUP MOVE";
 	var restriction = new Ab.view.Restriction();
 	restriction.addClause('questionnaire.questionnaire_id', activityTypeValue);
 		restriction.addClause('questions.is_active', 1);
 	var ds = View.dataSources.get('exPrgQuestionnaire_questionsDs');
 	var questionRecords = ds.getRecords(restriction);
 	for(var i=0;i<questionRecords.length;i++){
 		var quest_name = questionRecords[i].getValue("questions.quest_name");
 		if(fieldName==quest_name){
 			var questionRecord = questionRecords[i];
 			var recordType = questionRecord.getValue('questions.format_type');
 			var obj = $('questPanel_question' + i + '.answer_field');
 			if(obj){
 				var value = obj.value;
 				if (recordType == 'Date') {
 					return dateFormatQues(getDateWithISOFormat(value));
 				}else{
 					return value;
 				}
 			}
 		}
 	}
 	return null;
 }
 /**
  * private method, return date format mm/dd/yyyy 
  * @param dateStr
  * @returns
  */
 function dateFormatQues(dateStr){
 	if(dateStr!=null&&dateStr!='')
 	return dateStr.split("-")[1]+"/"+dateStr.split("-")[2]+"/"+dateStr.split("-")[0];
 	else 
 	  return "";
 }