/**

* @author lei

*/
var eventController = View.createController('eventController',
{
	location_id:'',
	reg_requirement:'',
	mainController:'',
	parentRes:' 1=1 ',
	consoleRes:' 1=1 ',
	consoleResArr: new Array(['activity_log.status'],['activity_log.manager'],['activity_log.contact_id'],['activity_log.hcm_labeled']),	
	
	//array of date field pairs that need to validate
	validateDatePairs: new Array(
		['activity_log.date_scheduled','activity_log.date_scheduled_end'],
		['activity_log.date_scheduled','activity_log.date_required'],
		['activity_log.date_scheduled_end','activity_log.date_required']),

	/**
     * This function is called when the page is loaded into the browser.
     */
	afterInitialDataFetch: function(){
		this.mainController=View.getOpenerView().controllers.get(0);
		this.mainController.eventController=eventController;
    	//for 'ab-comp-regprogram.axvw'
		var res=' 1=1 ';
    	if(this.mainController.location_id){
    		res=res+" AND activity_log.location_id="+this.mainController.location_id;
    	}
    	if(this.mainController.regulation){
    		res=res+" AND activity_log.regulation='"+this.mainController.regulation+"'";
    	}
    	if(this.mainController.regprogram){
    		res=res+" AND activity_log.reg_program='"+this.mainController.regprogram+"'";
    	}
    	if(this.mainController.regrequirement){
    		res=res+" AND activity_log.reg_requirement='"+this.mainController.regrequirement+"'";
    		
    	}
    	
    	this.parentRes=res;
    	this.eventGrid.addParameter("resFromTab2",res);
    	this.eventGrid.refresh();    	
    },
    
  // Hide the forms after tab change (IE will crash if panels are hidden beforeTabChange).
    afterTabChange: function(){    	
    	this.eventForm.show(false);
	},
    
	/**
	 * Hide location_id for manage by location
	 */
    eventGrid_afterRefresh:function(){
    	if(this.mainController.instructionStr){
    		var labels="<span>" + this.mainController.instructionStr + "</span>"; 
    		View.panels.get('eventGrid').setInstructions(labels);
    	}
    	
    	//reset grid title if it's 'requirement' View.
    	if(this.mainController.regrequirement&&!this.mainController.location_id){
    		this.eventGrid.setTitle(getMessage('gridEventTitle'));
    	}
    	
		  //check if it's report model. 
		  //check if it's coordinator model. use for 'Manage My Permits and Licenses'  and  'Manage My Compliance Requirements'
		  if((this.mainController.isReport&&this.mainController.isReport==true) ||
		     (this.mainController.isCoordinator&&this.mainController.isCoordinator==true)){
		     	
	   	  this.eventGrid.actions.get("addNew").show(false);
	    }
     	
    },
    
    /**
     * change form title if it's 'requirement' View.
     */
    eventForm_afterRefresh:function(){
    	
    	if(this.mainController.regrequirement&&!this.mainController.location_id){
    		this.eventForm.setTitle(getMessage('formEventTitle'));
    	}
    	    	
		  //check if it's report model. 
		  //check if it's coordinator model. use for 'Manage My Permits and Licenses'  and  'Manage My Compliance Requirements'
		  if((this.mainController.isReport&&this.mainController.isReport==true) ||
		     (this.mainController.isCoordinator&&this.mainController.isCoordinator==true)){
		     	
		    //Disable fields ,Disable all fields except Event Status, Responsible Person, and Discussion.
		    this.eventForm.fields.each(function(field) {
		    	eventController.eventForm.enableField(field.getId(), false) ;
				});
				$("create_notifications").disabled = true;
				
		    //Disable all fields except Event Status, Responsible Person, and Discussion.
		    var enableFields = ["activity_log.status","activity_log.manager","activity_log.hcm_loc_notes"];
				for(var i=0;i<enableFields.length;i++){
					this.eventForm.enableField(enableFields[i], true) ;
				}
				
			  // Hide all actions except: Save, Cancel.
				this.eventForm.actions.each(function(action) {
					action.show(false);
				});
			  this.eventForm.actions.get("save").show(true);
			  this.eventForm.actions.get("cancel").show(true);

	    }
    	else {
		    this.eventForm.enableField("activity_log.location_id", false);
		    this.eventForm.enableFieldActions("activity_log.location_id", true);
		  }
    },
    
    
    /**
     * grid addNew button click.
     */
	eventGrid_onAddNew: function(){
		
		var eventForm = this.eventForm;
		eventForm.show(true);
		eventForm.newRecord = true;
		eventForm.refresh();
		
		if(this.mainController.regulation){
			eventForm.setFieldValue("activity_log.regulation",this.mainController.regulation);
		}
		
		if(this.mainController.regprogram){
			eventForm.setFieldValue("activity_log.reg_program",this.mainController.regprogram);
		}
		
		if(this.mainController.regrequirement){
			eventForm.setFieldValue("activity_log.reg_requirement",this.mainController.regrequirement);
			setEventRecordByRequirement(this.mainController.regrequirement);
		}
		
    	if(this.mainController.location_id){
    		eventForm.setFieldValue("activity_log.location_id",this.mainController.location_id);
    	}
		eventForm.setFieldValue("activity_log.activity_type",'COMPLIANCE - EVENT');
		eventForm.setFieldValue("activity_log.status",'SCHEDULED');
		$('eventForm_activity_log.hcm_labeled').value=1;
		
	},
	
	/**
	 * grid edit button click.
	 */
	eventGrid_onEdit: function(){
		
		var grid = this.eventGrid;
    	var row = grid.rows[grid.selectedRowIndex];
		var activity_log_id = row["activity_log.activity_log_id"];
		this.eventForm.newRecord = false;
		this.eventForm.refresh("activity_log.activity_log_id="+activity_log_id);
		//if activity_log.status is in (COMPLETED, COMPLETED-V, CLOSED), disable all fields, and disable all actions except Cancel.
		var status = row["activity_log.status"];
		if(status=="COMPLETED"||status=="COMPLETED-V"||status=="CLOSED"){
			this.eventForm.enableButton('saveAndAddNew', false);
			this.eventForm.enableButton('save', false);
			this.eventForm.enableButton('delete', false);
			this.eventForm.enableButton('copyAsNew', false);
		}else{
			this.eventForm.enableButton('saveAndAddNew', true);
			this.eventForm.enableButton('save', true);
			this.eventForm.enableButton('delete', true);
			this.eventForm.enableButton('copyAsNew', true);
		}
		
	},
	/**
	 * Save current record.
	 */
	eventForm_onSave: function(){
		
		if(!checkRequiredFields()){
			return;
		}

		//set possible existed location field values to activity_log record
		this.setLocationValuesToEvent();

		this.eventForm.save();

		//Create Notifications? is a dropdown with Yes, No entries .
		//When saving record, if set to Yes, call createNotifications(activity_log_id) WFR.  
		//If set to No, call deleteNotifications(activity_log_id) WFR.
		var createNotifications = $('create_notifications').value;
		if(createNotifications==0){
			this.processNotifications('AbRiskCompliance-ComplianceCommon-createNotifications',
			this.eventForm.getFieldValue("activity_log.activity_log_id") );
		} 
		else if(createNotifications==1){
			this.processNotifications('AbRiskCompliance-ComplianceCommon-deleteNotifications',
			this.eventForm.getFieldValue("activity_log.activity_log_id") );			
		}
		
		//refresh grid.
		this.eventGrid.refresh();
	},
	
	/**
	* Private Function: If the event record is being created for a location, copy these additional settings from compliance_locations: 
	* site_id, pr_id, bl_id, fl_id, rm_id, eq_id. 
	*/
	setLocationValuesToEvent : function(){
		var eventForm = this.eventForm;
		var locationId = this.eventForm.getFieldValue("activity_log.location_id");
		if(valueExistsNotEmpty(locationId)){
			var locationRecord = this.complianceLocationsDSforJS.getRecord("compliance_locations.location_id="+locationId);
			if(locationRecord){
				eventForm.setFieldValue("activity_log.site_id",locationRecord.getValue("compliance_locations.site_id"));
				eventForm.setFieldValue("activity_log.pr_id",locationRecord.getValue("compliance_locations.pr_id"));
				eventForm.setFieldValue("activity_log.bl_id",locationRecord.getValue("compliance_locations.bl_id"));
				eventForm.setFieldValue("activity_log.fl_id",locationRecord.getValue("compliance_locations.fl_id"));
				eventForm.setFieldValue("activity_log.rm_id",locationRecord.getValue("compliance_locations.rm_id"));
				eventForm.setFieldValue("activity_log.eq_id",locationRecord.getValue("compliance_locations.eq_id"));
			}
		}
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
	 * Save current record and add new record.
	 */
	eventForm_onSaveAndAddNew:function(){
		
		this.eventForm_onSave();
		
		this.eventGrid_onAddNew();
		
		this.eventForm.displayTemporaryMessage(getMessage('saveSuccess'));
	},
	
	northConsole_onClear: function(){
		this.northConsole.clear();
	},
	northConsole_onFilter:function(){
		
		var date_started=this.northConsole.getFieldValue("activity_log.date_started");
		var date_completed=this.northConsole.getFieldValue("activity_log.date_completed");
		if(date_started==''){
			date_started='1900-01-01';
		}
		
		if(date_completed==''){
			date_completed='2200-01-01';
		}
		
		var	str=" (activity_log.date_scheduled >= ${sql.date('"+date_started+"')} " +"and activity_log.date_scheduled <= ${sql.date('"+date_completed+"')}) " +
		"or (activity_log.date_scheduled_end >= ${sql.date('"+date_started+"')} " +"and activity_log.date_scheduled_end <= ${sql.date('"+date_completed+"')} ) " +
		" or ( activity_log.date_scheduled is null and activity_log.date_scheduled_end is null) ";
		
		var consoleRes = getRestrictionStrFromConsole(this.northConsole, this.consoleResArr);
		
		this.consoleRes=consoleRes+" and ("+str+")";
		this.eventGrid.refresh(this.consoleRes);
		
	},
	eventForm_onCopyAsNew:function(){
		var activity_log_id=this.eventForm.getFieldValue("activity_log.activity_log_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id' ,activity_log_id);
		var records=this.dsEventForm.getRecords(restriction);
		var record=records[0];
		this.eventForm.newRecord = true;
		this.eventForm.setRecord(record);
		this.eventForm.setFieldValue('activity_log.activity_log_id','');
	},

	/*
	* Called js function of action "Delete".
	*/
	deleteEvent:function(){
			
    var confirmMessage = getMessage("messageConfirmDelete");
    var innerThis = this;
    //add confirm when on delete.
    View.confirm(confirmMessage, function(button){
      if (button == 'yes') {
			//call WFR deleteNotifications when user delete an event. 
			try{
				var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-deleteNotifications',
					innerThis.eventForm.getFieldValue('activity_log.activity_log_id') );
	
				if(result.code == 'executed'){
					innerThis.eventForm.deleteRecord();
		            innerThis.eventForm.show(false);
		            innerThis.eventGrid.refresh();
					return true;
				}
			}catch(e){
				
				Workflow.handleError(e);
				return false;
			}
		}
	});
  },
  
	/**
	* Event Handler of action "Doc": Open paginate report
	*/
	eventGrid_onDoc: function(){		
		//	'consoleRestriction':  " regloc.location_id = "+this.mainController.location_id+" AND "+this.consoleRes
		var	parameters = {};
		parameters.selectRes = this.parentRes + " AND "+this.consoleRes;

		var location_id = this.mainController.location_id;
		if(location_id){
			View.openPaginatedReportDialog("ab-comp-loc-event-tab-paginate-rpt.axvw" ,null, parameters);
		}
		else if(this.mainController.regrequirement){
				View.openPaginatedReportDialog("ab-comp-req-event-paginate-rpt.axvw" ,null, parameters);
		}

	}

});
/**
 *  Event Title ,Date Scheduled Start, Date Scheduled End, Date Completion Required .  For New Records:
 */
function checkRequiredFields(){
		var action_title = eventController.eventForm.getFieldValue("activity_log.action_title");
		var date_scheduled = eventController.eventForm.getFieldValue("activity_log.date_scheduled");
		var date_scheduled_end = eventController.eventForm.getFieldValue("activity_log.date_scheduled_end");
		var date_required = eventController.eventForm.getFieldValue("activity_log.date_required");
		if(!valueExistsNotEmpty(action_title)){
			alert(getMessage('messageEventTitle'));
			return false;
		}
		if(!valueExistsNotEmpty(date_scheduled)){
			alert(getMessage('messageScheduledStart'));
			return false;
		}
		if(!validateDateFields(eventController.eventForm, eventController.validateDatePairs, "invalidDate") ){
			return false;
		}

	return true;
	
}

/**
* Private Function: call WFR setEventRecordByRequirement to get and construct some field values of current Event record from requirement,
* and fill them back to form.
*/
function setEventRecordByRequirement(requirement){

	var form = eventController.eventForm;
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