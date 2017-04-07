/**
 * @author song
 */
var abCompDefineRequirementController = View.createController('abCompDefineRequirementController', {

	/**
	 * Maps DOM events to event listeners.
	 */
	events : {
		"click #editProcedures" : 'editProcedures'
	},

	keyValue: "regrequirement.reg_requirement",
	
    // KB 3047003: Ability to copy regulations and programs with some associated child records
    sourceRecord: {regulation: null, regprogram: null, regrequirement: null},
    
	//recurring pattern controller
	recurringPatternCtrl : null,
	
	afterViewLoad: function(){
		Ab.recurring.RecurringControl.addField({
			panel: this.abCompDefineRequirement,
			fields: new Array("regrequirement.recurring_rule"),
			exportButtons: new Array({id: "docx", type: "DOCX"})
		});
		
	},
	
    afterInitialDataFetch: function(){

    	this.mainController=View.getOpenerView().controllers.get(0);
    	//for we call it the view from *Compliance by Location Drill-down view requirement sub tab
    	if(!this.mainController){
    		this.mainController=View.controllers.get(mainController);
    	}
    	
    	if(this.mainController && this.mainController.sbfDetailTabs ){
    		this.sbfDetailTabs = this.mainController.sbfDetailTabs;
    	}
		//set recurring pattern controller
		this.recurringPatternCtrl = View.controllers.get("abRecurringPatternCtrl");
		
		if(valueExistsNotEmpty(this.mainController.isReport) && this.mainController.isReport==true){
 		  this.abCompDefineRequirement.refresh();
		} else {
			if (View.parentTab==null) {
				this.afterInitialDataFetch.defer(1000, this);
				return;
		  }
 		  this.abCompDefineRequirement.refresh(View.parentTab.restriction, this.mainController.newRecord);
 		  this.abCompDefineRequirementOthers.refresh(View.parentTab.restriction, this.mainController.newRecord);

		  if(!valueExistsNotEmpty(this.mainController.isCoordinator) || this.mainController.isCoordinator==false){
				//	Field yyy is date_recurrence_end, default value is date_end if date_recurrence_end is NULL.
			  var date_recurrence_end = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.date_recurrence_end");
			  if(!valueExistsNotEmpty(date_recurrence_end)){
			    var date_end = this.abCompDefineRequirement.getFieldValue("regrequirement.date_end");
				  this.abCompDefineRequirementOthers.setFieldValue("regrequirement.date_recurrence_end", date_end);
			  }

			  // for 22.1 Compliance: only show the button for Define Compliance Requirement tab in 	'Manage Compliance Requirement' view but not other coordinator views
			  var btnLabel = getMessage('btnLabel_AssignPmprocedure');
			  document.getElementById('abCompDefineRequirement_pmprocs_labelCell').innerHTML = "<a id='editProcedures' tabindex='' class='mediumAction button '>" + btnLabel + "</a>";
			} 
			
			//below logic moved here from 'generate' button click.
			var date_initial = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.date_initial");
	    	if(!valueExistsNotEmpty(date_initial)){
	    		//for report View, columnReport didn't need do this and invoke method "setFieldValue" throw exception.
	    		if(this.abCompDefineRequirementOthers.setFieldValue!=undefined){
	    			this.abCompDefineRequirementOthers.setFieldValue("regrequirement.date_initial",getCurrentDate());
	    		}
			}
		}

    },
    /**
     * first tab panel save button click 
     * After save record, Refresh grid in Tab 1.  
     * Show new record in Tab 2 form.  Disable all tabs after Tab 2. 
     *  Set View Title to 'Add New Regulation'.
     */
    abCompDefineRequirement_onSaveAndAddNew: function(){

    	if ( this.abCompDefineRequirement_onSave() ){ 
			if(this.sbfDetailTabs&&this.sbfDetailTabs.findTab('define')){
				this.mainController.view.setTitle(getMessage("addNewRequirement"));
				this.sbfDetailTabs.setAllTabsEnabled(false);
				this.sbfDetailTabs.enableTab('define');
				this.sbfDetailTabs.enableTab('select');
			}
				
			this.abCompDefineRequirement.newRecord= true;
			this.abCompDefineRequirement.refresh();
			this.abCompDefineRequirementOthers.newRecord= true;
			this.abCompDefineRequirementOthers.refresh();
		}
    },
    /**
     * Display confirmation message 'Save Changes and Generate Scheduled Events?'.  
     * If yes, save record and call generateEvents WFR with regulation, reg_program, reg_requirement,
     *  notify_active, and replaceAll parameters.  replaceAll flag is the value of the 
     *  [Replace future one-time and 'Do Not Reschedule' Events] checkbox (true/false).
     *    Display temporary panel message 'xxx Events were generated', where xxx is the number of events returned by WFR.
     */
    abCompDefineRequirementOthers_onSaveAndGenerate: function(){
    	
    	if ( this.abCompDefineRequirement_onSave() ){
    	
			var type = getSelectedRadioButton("type_option");
			if (type == "none") {
				View.alert(getMessage("messageRecurrencePattern"));
				return;
			}
			var regulation = this.abCompDefineRequirement.getFieldValue("regrequirement.regulation");
			var reg_program = this.abCompDefineRequirement.getFieldValue("regrequirement.reg_program");
			var reg_requirement = this.abCompDefineRequirement.getFieldValue("regrequirement.reg_requirement");
			var sched_loc = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.sched_loc");
			var notify_active = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.notify_active");
			var message =getMessage("saveAndGenerateConfirm");
			View.confirm(message, function(button){
				if (button == 'yes') {
					try{
						var result = Workflow.callMethod("AbRiskCompliance-ComplianceCommon-generateEvents", 
								regulation,reg_program, reg_requirement, $("replaceCheckbox").checked? true: false, notify_active*1);

						var jsonResult = eval("(" + result.jsonExpression + ")");
						var count= jsonResult['count'];
						var hasPastDate= jsonResult['hasPastDate'];
						var message = (hasPastDate?getMessage("messageGenerateEventPast"): getMessage("messageGenerateEvent")).replace("<{0}>", " "+count);
						View.alert(message);

					}catch(e){
						Workflow.handleError(e);
					}
				}
			});
		}
    },
    
    /**
     * call this method after panel refresh.
     */
    abCompDefineRequirement_afterRefresh: function(){
		if(this.recurringPatternCtrl ){
			this.recurringPatternCtrl .setRecurringPattern(this.abCompDefineRequirement.getFieldValue("regrequirement.recurring_rule"));
		  if((valueExistsNotEmpty(this.mainController.isCoordinator) && this.mainController.isCoordinator==true) || 
		    (valueExistsNotEmpty(this.mainController.isReport) && this.mainController.isReport==true)) {
			  this.recurringPatternCtrl.enableRecurringPattern(false);
		  }
		}
		
		if ( this.abCompDefineRequirementOthers && View.parentTab && View.parentTab.restriction){
			this.abCompDefineRequirementOthers.refresh(View.parentTab.restriction);
		}

		//added for 22.1 Compliance
		this.showOrHideAssignProcedureButtonAndList();
        
        // KB 3047003: Ability to copy regulations and programs with some associated child records
		if (!this.abCompDefineRequirement.newRecord) {
            this.mainController.copyRecord = false;
        }
        
	},
	
	/*
	 * Added for 22.1 Complliance - Kb#3048373: Disable Assign PM Procedures button for new requirement.  Enable after the requirement is saved.  
	 * Note that there are several paths to create a new requirement (Add New, Save and Add New, Copy As New), so make sure that disabling button works for all paths with common code.
	 */
	showOrHideAssignProcedureButtonAndList: function(){
		if (this.abCompDefineRequirement.newRecord)	{
			//this.abCompDefineRequirement.showField('pmprocs', false);
			$('vf_pmprocs').style.display="none";
			document.getElementById('abCompDefineRequirement_pmprocs_labelCell').style.display='none';
			//$('vf_'editProcedures').style.display = "none";
		} else {
		  if(!valueExistsNotEmpty(this.mainController.isReport) || this.mainController.isReport==false){
			$('vf_pmprocs').style.display="";
			if ( !valueExistsNotEmpty(this.mainController.isCoordinator) || this.mainController.isCoordinator==false ) {
				document.getElementById('abCompDefineRequirement_pmprocs_labelCell').style.display='';
			}
          }
			//Added for 22.1: initial vf_pmprocs
			this.setListOfAssignedProcedures();
		}
	},

	/**
	 * check all the fields.
	 */
	validateFields: function(){
    	if(!this.checkValidationDate()){
    		return false;
    	}
		this.abCompDefineRequirement.setFieldValue("regrequirement.recurring_rule", this.recurringPatternCtrl.getRecurringPattern());
		var date_initial = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.date_initial");
//	    For new records, when Date Requirement Start is entered in form, copy entry to Date Initial Scheduling in form, if empty.
		var date_start = this.abCompDefineRequirement.getFieldValue("regrequirement.date_start");
//		-If a recurrence pattern is selected in Panel 2, Date Initial Scheduling cannot be NULL.
		var recurring_rule = this.abCompDefineRequirement.getFieldValue("regrequirement.recurring_rule");
		if(!valueExistsNotEmpty(date_initial)){
			this.abCompDefineRequirementOthers.setFieldValue("regrequirement.date_initial",date_start);
			if(!valueExistsNotEmpty(date_start)){
				if(valueExistsNotEmpty(recurring_rule)){
					alert(getMessage('messageDateInitial'));
					return false;
				}
			}
		}
		//kb 3036318 add validation for fields 'event_duration' and 'event_sched_buffer'.
		var event_duration = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.event_duration");
		var event_sched_buffer = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.event_sched_buffer");
		if(event_duration<0){
			//can't use View.alert method beacuse it automatic ignore String message in '[ ]'.   
			alert(getMessage('messageEventDuration'));
			return false;
		}
		if(event_sched_buffer<0){
			alert(getMessage('messageEventSchedBuffer'));
			return false;
		}
		
		return true;
	},
	
	/**
	 * This event handler is called by 'Notifications' button click.
	 */
	abCompDefineRequirement_onNotifications: function(){
		
		this.showMenu(Ext.get("notifications"),null);
		
	},
	
    /**
     * show menu after click 'Notifications' button.
     * show  a menu with "Enable Notifications" and "Disable Notifications".
     */
    showMenu: function(e, item){
        var menuItems = [];
        var messageEnable = getMessage("messageEnable");
        var messageDisable = getMessage("messageDisable");;
        
        menuItems.push({
            text: messageEnable,
            handler: this.onAddNewButtonPush.createDelegate(this, ['FIRST'])
        });
        menuItems.push({
            text: messageDisable,
            handler: this.onAddNewButtonPush.createDelegate(this, ['SECOND'])
        });
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    
    /**
     * handle when menu click.
     */
    onAddNewButtonPush: function(menuItemId){
    	
    	var regulation = this.abCompDefineRequirement.getFieldValue("regrequirement.regulation"); 
    	var reg_program = this.abCompDefineRequirement.getFieldValue("regrequirement.reg_program"); 
    	var reg_requirement = this.abCompDefineRequirement.getFieldValue("regrequirement.reg_requirement"); 
        
        switch (menuItemId) {
        
            case "FIRST":
            	this.callNotificationWFR(regulation, reg_program, reg_requirement, 1);
            	View.alert(getMessage("confirmEnable"));
            	break;
            	
            case "SECOND":
            	this.callNotificationWFR(regulation, reg_program, reg_requirement, 0);
            	View.alert(getMessage("confirmDisable"));
                break;
        }
    },
    
    /**
     * private method.
     */
    callNotificationWFR: function(regulation, reg_program, reg_requirement, isActive){
    	
    	try{
    		var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-toggleNotifications',
    				regulation, reg_program, reg_requirement, isActive);
    	}catch(e){
    		Workflow.handleError(e);
    		return false;
    	}
    },
    
	/**
	 * This event handler is called by 'Save' button click.
	 */
    abCompDefineRequirement_onSave: function(){
    	var result;
		if(valueExistsNotEmpty(this.mainController.isCoordinator) && this.mainController.isCoordinator==true){
			result = this.abCompDefineRequirement.save();
			return result;
 		}
 		else { 
 			//for 'Save' perform entire validation for fields in top form as well bottom forms.
    		if(!this.validateFields()){
        		return false;
        	}
    	}
        
        // KB 3047003: Ability to copy regulations and programs with some associated child records
        var copyAsNew = this.mainController.copyRecord;
        
		this.handleEventField();
		this.saveFormAbCompDefineRequirementOthers();
		result = this.abCompDefineRequirement.save();

		// If this was a new record and still marked new, then save failed, nothing more to do
		if (this.abCompDefineRequirement.newRecord || !result) {
			return false;
		}
                
        var regulation = this.abCompDefineRequirement.getFieldValue('regrequirement.regulation');
        var reg_program = this.abCompDefineRequirement.getFieldValue('regrequirement.reg_program');
        var regrequirement = this.abCompDefineRequirement.getFieldValue(this.keyValue);
        this.mainController.regulation = regulation;
        this.mainController.regprogram = reg_program;
        this.mainController.regrequirement = regrequirement;
            
    	if(this.mainController && this.mainController.regulationTree){
    		this.mainController.abCompDefineRequirement_onSave(this.abCompDefineRequirement);
    	}else{
			//KB#3036243: added for using in Notify Template tab. 
			this.sbfDetailTabs.regprogram = reg_program;
			this.sbfDetailTabs.regulation = regulation;
			this.sbfDetailTabs.regrequirement = regrequirement;
			
			var viewTitle = getMessage("selectToManage")+": "+regrequirement+" ("+getMessage("fromCompProgram")+": "+reg_program+")";
			this.mainController.view.setTitle(viewTitle);
			this.sbfDetailTabs.setAllTabsEnabled(true);
				
			this.mainController.setOthersTabRefreshObj("define", 1);
    	}
    	
    	//3036507 add variable row to 'mainController' fixed checkDupulate issue in 'Location' tab.
        var dataSource = View.dataSources.get("abCompDefineRequirementDS");
        var wfrRecord = dataSource.processOutboundRecord(this.abCompDefineRequirement.getRecord());

        // KB 3047003: Ability to copy regulations and programs with some associated child records
        if (copyAsNew) {
            this.mainController.copyRecord = false;
            View.openDialog('ab-comp-copy-as-new.axvw', null, false, {
                width: 600, height: 500,
                title: getMessage('copyAsNew'),
                fromRecord: this.sourceRecord,
                toRecord: {regulation: this.mainController.regulation, regprogram: this.mainController.regprogram, 
                            regrequirement: this.mainController.regrequirement}                            
            });            
        }
		return true;
    },
    
    /**
     * //For the field event_title, for new records, copy Requirement Code (on blur) to event_title if text box is empty.
     */
    handleEventField: function(){
//    	3036292 In Manage Compliance Requirements, Define Requirement tab:
//    		For the field event_title, for new records, copy Summary field (on blur) to event_title if text box is empty. 
//    		When saving, if event_title is empty, copy Requirement Code to event_title.
    	var reg_requirement = this.abCompDefineRequirement.getFieldValue("regrequirement.reg_requirement");
		var event_title = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.event_title");
		var summary = this.abCompDefineRequirement.getFieldValue("regrequirement.summary");
		if(!valueExistsNotEmpty(event_title)){
			if(valueExistsNotEmpty(summary)){
				this.abCompDefineRequirementOthers.setFieldValue("regrequirement.event_title", summary);
			}else{
				this.abCompDefineRequirementOthers.setFieldValue("regrequirement.event_title", reg_requirement);
			}
		}
    	
    },
    /**
     * save south west form.
     */
    saveFormAbCompDefineRequirementOthers: function(){

    	var event_duration = this.abCompDefineRequirementOthers.getFieldValue('regrequirement.event_duration');
    	var event_sched_buffer = this.abCompDefineRequirementOthers.getFieldValue('regrequirement.event_sched_buffer');
    	var date_recurrence_end = this.abCompDefineRequirementOthers.getFieldValue('regrequirement.date_recurrence_end');
    	var sched_loc = this.abCompDefineRequirementOthers.getFieldValue('regrequirement.sched_loc');
    	var event_title = this.abCompDefineRequirementOthers.getFieldValue('regrequirement.event_title');
    	var notify_active = this.abCompDefineRequirementOthers.getFieldValue('regrequirement.notify_active');
    	var date_initial = this.abCompDefineRequirementOthers.getFieldValue('regrequirement.date_initial');
    	
    	this.abCompDefineRequirement.setFieldValue('regrequirement.event_duration',event_duration);
    	this.abCompDefineRequirement.setFieldValue('regrequirement.event_sched_buffer',event_sched_buffer);
    	this.abCompDefineRequirement.setFieldValue('regrequirement.date_recurrence_end',date_recurrence_end);
    	this.abCompDefineRequirement.setFieldValue('regrequirement.sched_loc',sched_loc);
    	this.abCompDefineRequirement.setFieldValue('regrequirement.event_title',event_title);
    	this.abCompDefineRequirement.setFieldValue('regrequirement.notify_active',notify_active);
    	this.abCompDefineRequirement.setFieldValue('regrequirement.date_initial',date_initial);
    	
    },
    /**
     * Enforce Date Completion Required >= Date Requirement End >= Date Requirement Start
     * Enforce Date Expire/Renewal >= Date Requirement Start
     *  If [Date Requirement Start] > [Date Initial Scheduling | Date Recurrence End | Date Requirement End | Date Completion Required | Date Expire/Renewal] (do not check empty fields), then display message "The field [Date Requirement Start] must have an earlier date than the value in fields [Date Initial Scheduling], [Date Recurrence End], [Date Requirement End], [Date Completion Required], and [Date Expire/Renewal]".  Do not save the record.
	    If [Date Initial Scheduling] > [Date Recurrence End | Date Requirement End | Date Completion Required] (do not check empty fields), then display message "The field [Date Initial Scheduling] must have an earlier date than the value in fields [Date Recurrence End], [Date Requirement End], and [Date Completion Required]".  Do not save the record.
	    If [Date Recurrence End] > [Date Requirement End | Date Completion Required] (do not check empty fields), then display message "The field [Date Recurrence End] must have an earlier date than the value in fields [Date Requirement End] and [Date Completion Required]".  Do not save the record.
		If [Date Requirement End] > [Date Completion Required] (do not check empty fields), then display message "The field [Date Requirement End] must have an earlier date than the value in field [Date Completion Required]".  Do not save the record.
     */
    checkValidationDate: function(){
    	var date_expire = this.abCompDefineRequirement.getFieldValue("regrequirement.date_expire");//Date Expire/Renewal
    	var date_start = this.abCompDefineRequirement.getFieldValue("regrequirement.date_start");//Date Requirement Start
    	var date_end = this.abCompDefineRequirement.getFieldValue("regrequirement.date_end");//Date Requirement End
    	var date_required = this.abCompDefineRequirement.getFieldValue("regrequirement.date_required");//Date Completion Required

    	var date_initial = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.date_initial");//Date Initial Scheduling
    	//Create Scheduled Events for Each Location    ----    Date Recurrence End
    	var date_recurrence_end = this.abCompDefineRequirementOthers.getFieldValue("regrequirement.date_recurrence_end");
    	if(date_start!=""&&
    			((date_initial==""? false: date_start > date_initial)||
    			    (date_end==""? false: date_start>date_end)||
    					(date_recurrence_end==""? false: date_start>date_recurrence_end)||
    							(date_required==""? false: date_start>date_required)||
    									(date_expire==""? false: date_start>date_expire))){
    		
    		alert(getMessage("messageDateRequirementStart"));return false;
    		
    	}else if(date_initial!=""
    		&&((date_end==""? false: date_initial>date_end)||
    				(date_recurrence_end==""? false: date_initial>date_recurrence_end)||
    				(date_required==""? false: date_initial>date_required))){
    		
    		alert(getMessage("messageDateInitialScheduling"));return false;
    		
	    }else if(date_recurrence_end!=""&&((date_end==""? false: date_recurrence_end>date_end)||
	    		(date_required==""? false: date_recurrence_end>date_required))){
	    	
	    	alert(getMessage("messageDateRecurrenceEnd"));return false;
	    	
	    }else if(date_end!=""&&date_required!=""&&date_end>date_required){
	    	
	    	alert(getMessage("DateRequirementEnd"));return false;
	    }
    	return true;
    },

	/**
     * when add delete button click.
     */
    abCompDefineRequirement_onDelete: function(){

        var confirmMessage = getMessage("messageConfirmDelete");
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
            	//kb 3036023 according spec30, call wfr 'deleteComplianceCleanup' before delete.
            	var regulation = abCompDefineRequirementController.abCompDefineRequirement.getFieldValue('regrequirement.regulation');
            	var reg_program = abCompDefineRequirementController.abCompDefineRequirement.getFieldValue('regrequirement.reg_program');
            	var regrequirement = abCompDefineRequirementController.abCompDefineRequirement.getFieldValue('regrequirement.reg_requirement');
        		if(regrequirement!=""){
        			try{
        				var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-deleteComplianceCleanup',
        						regulation, reg_program, regrequirement);
        			}catch(e){
        				Workflow.handleError(e);
        				return false;
        			}
        		}
            	abCompDefineRequirementController.abCompDefineRequirement.deleteRecord();
            	abCompDefineRequirementController.abCompDefineRequirement.show(false);
            	if(abCompDefineRequirementController.mainController.regulationTree){
            		abCompDefineRequirementController.mainController.abCompDefineRequirement_onSaveAndAddNew(abCompDefineRequirementController.abCompDefineRequirement);
            	}else{
            		abCompDefineRequirementController.sbfDetailTabs.setAllTabsEnabled(false);
            		abCompDefineRequirementController.sbfDetailTabs.enableTab("select");

            		abCompDefineRequirementController.mainController.setTabRefreshObj("select", 1);
            		
            		abCompDefineRequirementController.sbfDetailTabs.selectTab("select");
            		abCompDefineRequirementController.mainController.view.setTitle(getMessage("selectCompManage"));
            	}
            }
        });    
    },
    /**
     * when cancel button click.
     */
    abCompDefineRequirement_onCancel: function(){
    	if(this.mainController.regulationTree){
    		this.abCompDefineRequirement.show(false);
    		this.abCompDefineRequirementOthers.show(false);
    		if (this.recurringPatternCtrl ) {
                this.recurringPatternCtrl.showRecurringPatternPanel(false);
            }
    	}else{
    		this.abCompDefineRequirement.show(false);
    		this.sbfDetailTabs.setAllTabsEnabled(false);
    		this.sbfDetailTabs.enableTab("select");
    		this.sbfDetailTabs.selectTab("select");
    		this.mainController.view.setTitle(getMessage("selectCompManage"));
    	}
    },
    /**
     * tab 4 , copy as new button click.
     */
    abCompDefineRequirement_onCopyAsNew: function(){
        // KB 3047003: Ability to copy regulations and programs with some associated child records
        this.mainController.copyRecord = true;
        this.sourceRecord['regrequirement'] = this.abCompDefineRequirement.getFieldValue('regrequirement.reg_requirement');
        this.sourceRecord['regprogram'] = this.abCompDefineRequirement.getFieldValue('regrequirement.reg_program');
        this.sourceRecord['regulation'] = this.abCompDefineRequirement.getFieldValue('regrequirement.regulation');
        
        var keyValues = ["regrequirement.regulation", "regrequirement.reg_program", "regrequirement.reg_requirement"];
   		commonCopyAsNew(this.abCompDefineRequirement, keyValues, this.abCompDefineRequirementDS);
    	if(this.mainController.regulationTree){
    	}else{
    		this.mainController.view.setTitle(getMessage("addNewRequirement"));
    		this.sbfDetailTabs.setAllTabsEnabled(false);
    		this.sbfDetailTabs.enableTab('define');
    		this.sbfDetailTabs.enableTab('select');
    	}

		//added for 22.1 Compliance
		this.showOrHideAssignProcedureButtonAndList();
                        
    },

	/**
	* Added for 22.1 Compliance Bldgops Integration: open 'Assign Procedures to Compliance Requirement' view in the dialog.
	 * @author Zhang Yi
	 */
	editProcedures: function() {
		View.currentRegulation = this.abCompDefineRequirement.getFieldValue('regrequirement.regulation');
		View.currentProgram = this.abCompDefineRequirement.getFieldValue('regrequirement.reg_program');
		View.currentRequirement = this.abCompDefineRequirement.getFieldValue('regrequirement.reg_requirement');

		// store the reference to itself in a local variable, to be used in closures
		var me = this;
		View.openDialog('ab-comp-asgn-procs-to-requirement.axvw', null, false, 
			{	width:1000, height:600, 
				// When the window is closed, update the vf_pmprocs memo box to show the currently assigned procedures.
				callback: function(assignedProcedures) {
					$('vf_pmprocs').value= assignedProcedures;
				}
			}
		);
	},

	/**
	* Added for 22.1 Compliance Bldgops Integration: show list of Assigned Procedures.
	 * @author Zhang Yi
	 */
	setListOfAssignedProcedures: function() {
		var pmpDs = this.abCompDefineRequirementAssignedProceduresDS;
		pmpDs.addParameter("regulation", this.abCompDefineRequirement.getFieldValue('regrequirement.regulation'));
		pmpDs.addParameter("reg_program", this.abCompDefineRequirement.getFieldValue('regrequirement.reg_program'));
		pmpDs.addParameter("reg_requirement", this.abCompDefineRequirement.getFieldValue('regrequirement.reg_requirement'));

		var pmpRecords = pmpDs.getRecords();
		var assignedProcedures	  =""; 
		if ( pmpRecords && pmpRecords.length>0 ){
			for(var i=0; i<pmpRecords.length; i++){
				var pmpRecord = pmpRecords[i];
				 assignedProcedures = assignedProcedures +pmpRecord.getValue('regreq_pmp.pmp_id')+",";
			}
		}
		if ($('vf_pmprocs')) {
			$('vf_pmprocs').value= assignedProcedures;
		} else {
			var el = this.abCompDefineRequirement.getFieldEl("regrequirement.procs");
			if (el) {
              el.dom.innerHTML=assignedProcedures;
            }
		}
	}
});    

/**
 * Action Listener for select value button 'program'.
 * For new records, when Compliance Program is selected, copy the following fields from selected program, 
 * if the form fields are empty: Responsible Person, Vendor Code,
 *  Regulatory Contact, Compliance Priority (to Requirement Priority).
 */
function afterSelectProgram(fieldName, selectedValue, previousValue){
	
		var form = abCompDefineRequirementController.abCompDefineRequirement; 
		//if 'fieldName' is 'regulation' save 'selectedValue' to a temporary variable.
	   if(fieldName.indexOf("reg_program")!=-1){
		   if(abCompDefineRequirementController.abCompDefineRequirement.newRecord){
			//query requirement record according to pk field values
			var restriction = new Ab.view.Restriction();
			restriction.addClause('regrequirement.reg_program', selectedValue, '=');
			restriction.addClause('regrequirement.regulation', form.getFieldValue('regrequirement.regulation'), '=');
			
			var parameters = {
					tableName: 'regprogram',
					fieldNames: toJSON(['regprogram.contact_id','regprogram.em_id','regprogram.vn_id','regprogram.priority']),
					restriction: toJSON(restriction)
			};
			try{
				var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
				if(result.code == "executed" && result.data.records.length > 0){
					
					//query requirement type value from requirement record
					var record = result.data.records[0];
					var contact_id = record['regprogram.contact_id'];
					var em_id = record['regprogram.em_id'];
					var vn_id = record['regprogram.vn_id'];
					var priority = record['regprogram.priority.raw'];
					if(!form.getFieldValue("regrequirement.contact_id")){
						form.setFieldValue("regrequirement.contact_id", contact_id);
					}
					if(!form.getFieldValue("regrequirement.em_id")){
						form.setFieldValue("regrequirement.em_id", em_id);
					}
					if(!form.getFieldValue("regrequirement.vn_id")){
						form.setFieldValue("regrequirement.vn_id", vn_id);
					}
					form.setFieldValue("regrequirement.priority", priority);
					form.setFieldValue("regrequirement.reg_program", selectedValue);
				}
			}catch (e){
				Workflow.handleError(e);
				return false;
			}
		}else{
			form.setFieldValue("regrequirement.reg_program", selectedValue);
		}
		   
	}
}

/**
 * return current date
 * @returns {String}
 */
function getCurrentDate(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}
