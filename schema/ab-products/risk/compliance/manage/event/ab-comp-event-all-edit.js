/**
* Added for 20.2 Compliance: used as second tab 'Define Event' in Manage Event Views. 
*
* Author: Zhang Yi
*/
var abCompEventAllDefController = View.createController('abCompEventAllDefController', {

	//parent tabs object
	tabs:null,
	
	//array of date field pairs that need to vlidate
	validateDatePairs: new Array(
		['activity_log.date_scheduled','activity_log.date_scheduled_end'],
		['activity_log.date_scheduled','activity_log.date_required'],
		['activity_log.date_scheduled_end','activity_log.date_required'],
		['activity_log.date_started','activity_log.date_completed'],
		['activity_log.date_started','activity_log.date_verified'],
		['activity_log.date_started','activity_log.date_closed'],
		['activity_log.date_completed','activity_log.date_closed'],
		['activity_log.date_completed','activity_log.date_verified'],
		['activity_log.date_verified','activity_log.date_closed']),

	/**
	* @inherit
	*/
	afterInitialDataFetch: function(){
		//get parent tabs
		 if(View.parentTab){
			 this.tabs=View.parentTab.parentPanel;
		 }

		 //configure current view when loading in tab or pop-up 
		 if(this.tabs){
			 this.initialDataFetchInTabView();
		 }else{
			 this.initialDataFetchInPopUpView();
		 }
	},
	
	/**
	* Private function: disable fields of form according to current event type of view and report.
	*/
	disableFieldsForEventType : function(){
		//if current view is loaded in tab, then disable its fields according to event type of current Manage Event view.
		if(this.tabs){
			var eventType=this.tabs.eventType;

			if("Non-Recurring"==eventType){
				disableFieldsOfForm(this.abCompEventAllForm, "activity_log", 
					new Array("status", "date_started","date_completed","date_verified","date_closed","hcm_labeled"));
			} 
			else if ("Schedule"==eventType){
				disableFieldsOfForm(this.abCompEventAllForm, "activity_log", 
					new Array("status", "date_started","date_completed","date_verified","date_closed", 
					"hcm_labeled", "regulation","reg_program","reg_requirement","location_id"));
				enableAllFieldsOfPanel(this.abCompEventAllForm2,false);
				hideActionsOfPanel(this.abCompEventAllForm, new Array("sadd", "copy", "delete") ,false);
				hideActionsOfPanel(this.abCompEventAllForm2, new Array("clearLocation") ,false);
			} 
			else if ("Status-Close"==eventType){
				disableFieldsOfForm(this.abCompEventAllForm, "activity_log", 
					new Array("action_title", "date_scheduled","date_scheduled_end","hcm_labeled", 
					"regulation","reg_program","reg_requirement","location_id", "description"));
				enableAllFieldsOfPanel(this.abCompEventAllForm2,false);
				hideActionsOfPanel(this.abCompEventAllForm, new Array("sadd", "copy", "delete") ,false);
				hideActionsOfPanel(this.abCompEventAllForm2, new Array("clearLocation") ,false);
			 } 
			 else if ("Missed-Overdue"==eventType){
				disableFieldsOfForm(this.abCompEventAllForm, "activity_log", 
					new Array("action_title", "hcm_labeled", "regulation","reg_program",
					"reg_requirement","location_id", "description"));
				enableAllFieldsOfPanel(this.abCompEventAllForm2,false);
				hideActionsOfPanel(this.abCompEventAllForm, new Array("sadd", "copy", "delete") ,false);
				hideActionsOfPanel(this.abCompEventAllForm2, new Array("clearLocation") ,false);
			 } 

			//Show form in report mode, with DOC as the only panel action
			var eventAllController = View.getOpenerView().controllers.get(0);
			if("report"==eventAllController.mode){
				hideActionsOfPanel(this.abCompEventAllForm, new Array("sadd", "save", "copy", "delete", "cancel") ,false);
			}  else{
				hideActionsOfPanel(this.abCompEventAllForm, new Array("doc") ,false);
			}

		}
	},


	/**
	* Private function: configure form's title, action, fields and its record when it's loaded in tab.
	*/
	initialDataFetchInTabView : function(){

		 if(!this.tabs.define){

			 var restriction = new Ab.view.Restriction();
			 restriction.addClause('activity_log.activity_log_id', this.tabs.eventId);
			 this.abCompEventAllForm.refresh(restriction);
			 
			var eventAllController = View.getOpenerView().controllers.get(0);
			 if("report"==eventAllController.mode){

				 this.abCompEventAllForm.setTitle(getMessage("viewEvent"));
				 this.setReportMode();

			 }  

			 if("notificationTabs"==this.tabs.id){
				showAllActionsOfPanel(this.abCompEventAllForm,false);
				var form = this.abCompEventAllForm;
				form.fields.each(function(field) {
					form.enableField(field.fieldDef.id, false);
				});
				 form.setTitle(getMessage("viewEvent"));
			 }

		 }else{
			 var form = this.abCompEventAllForm;
			 form.show(true);
			 form.newRecord = true;
			 form.refresh();
			 form.clear();
		 }
	},
	
	/**
	* Event Handler of afterRefresh event of Event form.
	*/
	abCompEventAllForm_afterRefresh:function(){

		//if new record in form
		if(this.abCompEventAllForm.newRecord){
			setLocationForm(this.abCompEventAllForm2, "");

			//fill default field values
			this.setDefaultFieldValues();
		} 
		//Check activity parameter (Events_DaysAllowEdit_AfterClose) to decide if event can be edited.  
		else if( this.validateActivityParameter()){

			//enable or disable location according to whether location_id is empty
			var locId = this.abCompEventAllForm.getFieldValue("activity_log.location_id");
			setLocationForm(this.abCompEventAllForm2, locId);
			//for 'Update Status and Close Events' view, set instruction text and proper value to field 'Status'
			this.setInstructionAndStatus();
		}

		if(this.tabs && this.tabs.id=="notificationTabs"){
			enableAllFieldsOfPanel(this.abCompEventAllForm2,false);
		}
		
		//disable location_id field but enable its select-valut button
		this.abCompEventAllForm.enableField("activity_log.location_id", false);
		this.abCompEventAllForm.enableFieldActions("activity_log.location_id", true);

		//disable form fields by event type
		this.disableFieldsForEventType();

		//Requirement Type should be blank if Requirement Code is blank
		if(this.abCompEventAllForm.newRecord || !this.abCompEventAllForm.getFieldValue("activity_log.reg_requirement")){
			this.abCompEventAllForm.showField("regrequirement.regreq_type", false);
		} else {
			this.abCompEventAllForm.showField("regrequirement.regreq_type", true);
			this.abCompEventAllForm.enableField("regrequirement.regreq_type", false);
		}
	},
	
	/**
	* Private function: configure form's title, action, fields and its record when it's loaded in pop-up.
	*/
	initialDataFetchInPopUpView : function(){
		 var openerView = View.getOpenerView();
		 var restriction = new Ab.view.Restriction();
		 restriction.addClause('activity_log.activity_log_id', openerView.activityLogId);
		 this.abCompEventAllForm.refresh(restriction);
		 this.abCompEventAllForm2.show(true);
		 this.abCompEventAllForm2.setRecord(this.abCompEventAllForm.record);
		 this.abCompEventAllForm.setTitle(openerView.popUpTitle);
		 
		 //hide doc and cancel button for pop up view
		 hideActionsOfPanel(this.abCompEventAllForm, new Array("doc", "cancel") ,false);
		 
		 var mode = openerView.mode;
		 if("report"==mode){
			 this.setReportMode();
		 } 
	},

	/**
	* Private function: configure form action and fields for 'report' mode.
	*/
	setReportMode:function(){
		hideActionsOfPanel(this.abCompEventAllForm, new Array("sadd", "copy", "delete","save", "cancel") ,false);
		enableAllFieldsOfPanel(this.abCompEventAllForm,false);
	},


	/**
	* Event Handler for action 'Save and Add New' of Event form.
	*/
	abCompEventAllForm_onSadd : function(){

		// validate the form field values
		if(!this.validate()){
			return;
		}

		//save location informations and new location id
		this.abCompEventAllForm_onSave();
		this.abCompEventAllForm.refresh(null, true);
		//save location informations and new location id
		setLocationForm(this.abCompEventAllForm2, "");
		
		//set proper view title and run callback of main controller
		var mainControl=View.getOpenerView().controllers.get(0);
		View.getOpenerView().setTitle(getMessage("viewTitleAdd"));
		if(mainControl && mainControl.onSaveChange){
			mainControl.onSaveChange();
		    mainControl.enableRestTabs(false);
			mainControl.compTabs.enableTab('defineEvent',true);
		  mainControl.initialTabRefreshed();
		}
		 
		//refresh parent view when pop up
		this.refreshParentViewWhenPopUp();
	},

	/**
	* Event Handler for action 'Save' of Event form.
	*/
	abCompEventAllForm_onSave : function(){

		var eventForm = this.abCompEventAllForm;
		if(eventForm.canSave()){
		
			// validate the form field values
			if(!this.validate()){
				return false;
			}
			//call common JS function to save location informations
			createOrUpdateLocation(eventForm, this.abCompEventAllForm2, "activity_log");

			//set possible existed location field values to activity_log record
			this.setLocationValuesToEvent();
			
			//store old values and current values of form record
			var record = eventForm.getOutboundRecord();
			var values = record.values;
			var oldValues = record.oldValues;
	
			var result = eventForm.save();
			
			//refresh parent view when pop up
			this.refreshParentViewWhenPopUp();
			
            // If this was a new record and still marked new, then save failed, nothing more to do
            if (eventForm.newRecord || !result) {
              return;
            }

			//update req PK and LocID in associated docs and logs
			this.resetReqAndLocOfDocAndLog(values, oldValues);

			//set changed sign in parent controller
			var mainControl=View.getOpenerView().controllers.get(0);
			if(mainControl && mainControl.onSaveChange){
				mainControl.onSaveChange();
				mainControl.event = eventForm.getFieldValue("activity_log.activity_log_id") ;
				// kb 3036648 - For event docs and logs, set requirement
				mainControl.regulation = eventForm.getFieldValue("activity_log.regulation");
				mainControl.regprogram = eventForm.getFieldValue("activity_log.reg_program");
				mainControl.regrequirement = eventForm.getFieldValue("activity_log.reg_requirement");
				mainControl.project_id = eventForm.getFieldValue("activity_log.project_id");		
				mainControl.event_location_id = eventForm.getFieldValue("activity_log.location_id");		
			}
            
		    if (this.tabs) {
                this.tabs.eventId = eventForm.getFieldValue("activity_log.activity_log_id");
            }
			
			//Create Notifications? is a dropdown with Yes, No entries.  
			//When saving record, if set to Yes, call createNotifications(activity_log_id) WFR.  
			//If set to No, call deleteNotifications(activity_log_id) WFR.
			var createNotifications = $('create_notifications').value;
			if(createNotifications==0){
				this.processNotifications('AbRiskCompliance-ComplianceCommon-createNotifications',
					this.abCompEventAllForm.getFieldValue("activity_log.activity_log_id") );
			} 
			else if(createNotifications==1){
				this.processNotifications('AbRiskCompliance-ComplianceCommon-deleteNotifications',
					this.abCompEventAllForm.getFieldValue("activity_log.activity_log_id") );			
			}

			//set view title
			if(this.tabs){
				View.getOpenerView().setTitle( this.getProperViewTitle()+": "+
						this.abCompEventAllForm.getFieldValue("activity_log.action_title"));
			}

			//for 'Update Status and Close Events' view, set instruction text and proper value to field 'Status'
			this.setInstructionAndStatus();
		}
	},

	/**
	* Private function: validate field values of edit form, if not match them return false.
	*/
	validate : function(){
		if(  validateDateFields(this.abCompEventAllForm, this.validateDatePairs, "invalidDate") ){
			return true;
		}
		else {
			return false;
		}

	},

	/**
	* Private function: check activity parameter (Events_DaysAllowEdit_AfterClose) to decide if event can be edited.
	*/
	validateActivityParameter : function(){
		var canEdit = true;
		//get parameter value, controls # of days after date_closed after which it cannot be edited.
		var daysAllowEditAfterClose = View.activityParameters["AbRiskCompliance-Events_DaysAllowEdit_AfterClose"];

		//If missing or 0, closed events can always be edited
		if(daysAllowEditAfterClose){
			var status = this.abCompEventAllForm.getFieldValue("activity_log.status");
			var days =parseInt(daysAllowEditAfterClose);
			var today = new Date();
			today = DateMath.subtract(today,DateMath.DAY, days);
			var closeDate =  this.abCompEventAllForm.getRecord().getValue("activity_log.date_closed");
			if(days>0 && 'CLOSED'==status && closeDate &&today>closeDate){
				canEdit = false;
			} 
		}

		enableAllFieldsOfPanel(this.abCompEventAllForm,canEdit);
		enableAllFieldsOfPanel(this.abCompEventAllForm2,canEdit);
		hideActionsOfPanel(this.abCompEventAllForm, new Array("sadd", "copy", "save") ,canEdit);
		hideActionsOfPanel(this.abCompEventAllForm2, new Array("clearLocation") ,canEdit);

		return canEdit;
	},

	/**
	* Private function: check conditions related to date fields.
	*/
	validateDateField : function(){

		var requireDate = $('activity_log.date_required').value;
		var scheduleEndDate = $('activity_log.date_scheduled_end').value;
		var scheduleStartDate = $('activity_log.date_scheduled').value;
		var startDate = $('activity_log.date_started').value;
		var completeDate = $('activity_log.date_completed').value;

		if (	compareLocalizedDates(requireDate,scheduleEndDate) 
			|| compareLocalizedDates(scheduleEndDate,scheduleStartDate)  
			|| compareLocalizedDates(requireDate,scheduleStartDate)  
			|| compareLocalizedDates(completeDate,startDate) 
		) {
			View.showMessage(getMessage('invalidDate'));
			return false;
		}
		return true;
	},

	/**
	* Private function: call workflow rule by passing event id.
	*
	* @param ruleId workflow rule id
	* @eventId event id
	*/
	processNotifications : function(ruleId,eventId){
		try{
			var result  = Workflow.callMethod(ruleId, eventId);
		}catch(e){
			
			Workflow.handleError(e);
			return false;
		}
	},

	/**
	* Event Handler for action 'Cancel' of Event form.
	*/
	abCompEventAllForm_onCancel : function(){
		var mainControl=View.getOpenerView().controllers.get('0');
		mainControl.compTabs.selectTab("selectEvent");
		View.getOpenerView().setTitle(getMessage("viewTitleSelect"));
		mainControl.enableRestTabs(false);
	},

	/**
	* Event Handler for action 'Delete' of Event form.
	*/
	abCompEventAllForm_onDelete : function(){
    var confirmMessage = getMessage("messageConfirmDelete");
    var innerThis = this;

    //add confirm when on delete.
    View.confirm(confirmMessage, function(button){

		if (button == 'yes') {
			//call deleteNotifications (activity_log_id) WFR to Delete notification records.
			innerThis.processNotifications('AbRiskCompliance-ComplianceCommon-deleteNotifications',
				innerThis.abCompEventAllForm.getFieldValue("activity_log.activity_log_id"));

			var mainControl=View.getOpenerView().controllers.get('0');
			innerThis.abCompEventAllForm.deleteRecord();

			//call deleteLocation WFR to Delete compliance_location record.
			if(innerThis.abCompEventAllForm.getFieldValue("activity_log.location_id")){
				deleteLocation(innerThis.abCompEventAllForm.getFieldValue("activity_log.location_id"),0);
			}
			
			//refresh parent view when pop up
			innerThis.refreshParentViewWhenPopUp(true);

			mainControl.needRefreshSelectList = true;
			mainControl.compTabs.selectTab("selectEvent");
			View.getOpenerView().setTitle(getMessage("viewTitleSelect"));
			mainControl.enableRestTabs(false);
		}
	});
	},

	/**
	* Event Handler for action 'Copy as New' of Event form.
	*/
	abCompEventAllForm_onCopy : function(){

		var mainControl=View.getOpenerView().controllers.get('0');
		if(mainControl && mainControl.compTabs){
		    mainControl.enableRestTabs(false);
			mainControl.compTabs.enableTab('defineEvent',true);
			mainControl.initialTabRefreshed();
			View.getOpenerView().setTitle(getMessage("viewTitleAdd"));
		}
		
		this.abCompEventAllForm.newRecord = true;
		this.abCompEventAllForm.setFieldValue("activity_log.activity_log_id","");
	},

	/**
	* Private Function: for New Records: Set Do Not Reschedule?=1, and hidden field activity_type = ¡®COMPLIANCE - EVENT¡¯;
	* Also fill in activity_log.satisfaction_notes using regrequirement fields, as specified in WFR ¡°Generate Scheduled Events¡±. 
	* Set Status=SCHEDULED.
	*/
	setDefaultFieldValues : function(){
		this.abCompEventAllForm.setFieldValue("activity_log.status",'SCHEDULED');
	},

	/**
	* Private Function: If the event record is being created for a location, copy these additional settings from compliance_locations: 
	* site_id, pr_id, bl_id, fl_id, rm_id, eq_id. 
	*/
	setLocationValuesToEvent : function(){
		var eventForm = this.abCompEventAllForm;
		var locForm = this.abCompEventAllForm2;

		eventForm.setFieldValue("activity_log.site_id",locForm.getFieldValue("compliance_locations.site_id"));
		eventForm.setFieldValue("activity_log.pr_id",locForm.getFieldValue("compliance_locations.pr_id"));
		eventForm.setFieldValue("activity_log.bl_id",locForm.getFieldValue("compliance_locations.bl_id"));
		eventForm.setFieldValue("activity_log.fl_id",locForm.getFieldValue("compliance_locations.fl_id"));
		eventForm.setFieldValue("activity_log.rm_id",locForm.getFieldValue("compliance_locations.rm_id"));
		eventForm.setFieldValue("activity_log.eq_id",locForm.getFieldValue("compliance_locations.eq_id"));
	},

	//Get proper view title according to current Manage Event Type
	 getProperViewTitle:function() {
		var messageId="";
		if("Missed-Overdue"==this.tabs.eventType){
			messageId = "missedTitle";
		}  
		else if("Non-Recurring"==this.tabs.eventType){
			messageId = "nonRecurringTitle";
		}  
		else if("Status-Close"==this.tabs.eventType){
			messageId = "closeTitle";
		} 
		else if("Schedule"==this.tabs.eventType){
			messageId = "scheduleTitle";
		}  
		else {
			messageId = "manageTitle";
		}
		return getMessage(messageId);
	},

	/**
	*	Private function: 1. Add instruction text to form:  "Current Event Status is [xxx].  A NEW Event Status appears in the form.  Clicking Save will automatically update the event to this New status."
	* 	2. Change value of  field 'Event Status' to new calculated status
	* 	3. Change Event Status field title:  ¡°NEW Event Status¡±
	*/
	 setInstructionAndStatus:function() {
		if(this.tabs && "Status-Close"==this.tabs.eventType){
			//Set propr instruction text
			var currentStatus = this.abCompEventAllForm.getFieldValue("activity_log.status");
			var statusSelect = $("abCompEventAllForm_activity_log.status");
			var currentStatusText = statusSelect.options[statusSelect.selectedIndex].text;
			var instructions = "<span>" + getMessage('statusIns1') + " [</span>";
			instructions += "<span style='color:red'>" + currentStatusText + "</span>";
			instructions += "<span>]. " + getMessage('statusIns2') + "</span>";
			this.abCompEventAllForm.setInstructions(instructions);

			//set current new status properly: 
			var newStatus = "COMPLETED";
			//If Event Status is COMPLETED-V, change it to CLOSED
			if( currentStatus=='COMPLETED-V' ){
				newStatus = "CLOSED";
			} 
			//Else If Event Status is COMPLETED, change it to COMPLETED-V
			else if( currentStatus=='COMPLETED' ) {
				newStatus = "COMPLETED-V";			
			}
			setOptionValue("abCompEventAllForm_activity_log.status", newStatus);

			//Change Event Status field title:  ¡°NEW Event Status¡±
			this.abCompEventAllForm.setFieldLabel("activity_log.status", getMessage("statusLabel")+":");
		} 
	},

	/**
	*	Private function:  update req PK and LocID in associated docs and logs when save an event record and its Req PK changed (reg/prog/req) 
	*/
	 resetReqAndLocOfDocAndLog:function(values, oldValues){
		 if( values['activity_log.regulation']!=oldValues['activity_log.regulation'] 
				|| values['activity_log.reg_program']!=oldValues['activity_log.reg_program'] 
				|| values['activity_log.reg_requirement']!=oldValues['activity_log.reg_requirement'] 
				|| values['activity_log.location_id']!=oldValues['activity_log.location_id'] ){

			try{
				var eventId = this.abCompEventAllForm.getFieldValue("activity_log.activity_log_id");
				var result  = Workflow.callMethod("AbRiskCompliance-ComplianceCommon-updateDocAndLogByEvent", eventId,
					 values['activity_log.regulation'], values['activity_log.reg_program'], values['activity_log.reg_requirement'],
					 values['activity_log.location_id']);
			}catch(e){
				
				Workflow.handleError(e);
				return false;
			}
		 }			
	 },
	 
	/**
	 *	Refresh the parent view when pop up
	 */
	 refreshParentViewWhenPopUp:function(isClosePupUp){
		 var openerView = View.getOpenerView();
		 if(openerView.callBackController){
			 openerView.callBackController.refreshFromConsole();
			 if(isClosePupUp){
				 openerView.closeDialog();
			 }
		 }
	 }
});

/**
* Action Listener of custom select-value for field 'location_id', execute after select-value.
*/
function afterSelectLocationID(fieldName, selectedValue, previousValue){
	if(fieldName=="activity_log.location_id"){
		var ctrl = abCompEventAllDefController;
		if (!ctrl.isRegloc) {
			ctrl.oldLocId = ctrl.abCompEventAllForm2.getFieldValue("compliance_locations.location_id");
		} 
		ctrl.isRegloc = true;
		ctrl.abCompEventAllForm2.newRecord = false;
		//set location form properly
		setLocationForm(ctrl.abCompEventAllForm2, selectedValue);
	}
}

/**
* Action Lisenter of custom select value command for field "Requirement"
*/
function afterSelectRequirement(fieldName, selectedValue, previousValue){
	//when select a requirement show its requirement type in form
	if (fieldName == "activity_log.reg_requirement"){
		if(selectedValue){
			onChangeRequirement("activity_log", "abCompEventAllForm",selectedValue);
			//fill some field values from selected requirement
			setEventRecordByRequirement(selectedValue);
		}
	}
}

/**
* Private Function: call WFR setEventRecordByRequirement to get and construct some field values of current Event record from requirement,
* and fill them back to form.
*/
function setEventRecordByRequirement(requirement){

	var form = abCompEventAllDefController.abCompEventAllForm;
	var regulation = form.getFieldValue("activity_log.regulation");
	var program = form.getFieldValue("activity_log.reg_program");
	
	var event = form.getOutboundRecord();
	
	try{
		var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-setEventRecordByRequirement',regulation,program,requirement,event);
		
		var fieldArrays = new Array("action_title", "description","vn_id","contact_id","comments","project_id","project_id","satisfaction_notes", "manager");
		var values = result.dataSet;
		for(var i=0; i<fieldArrays.length; i++){
			//only copy to Event if the field is blank in the form.
			if( !form.getFieldValue("activity_log."+fieldArrays[i]) ){
				form.setFieldValue("activity_log."+fieldArrays[i], values.getValue("activity_log."+fieldArrays[i]));
			}
		}		
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}