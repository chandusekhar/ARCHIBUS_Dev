/**
*	used for:
*	 Manage Compliance Requirements
*    Compliance Notification Templates
*    Manage My Permits and Licenses
*    Manage My Compliance Requirements
*/
var abCompSelectRequirementController = View.createController('abCompSelectRequirementController', {
    
	// parent tabs 
	tabs: null,
	
	//key field name
	key: "regrequirement.reg_requirement",
	
	//console restriction
	requirementRes:" 1=1 ", 

	//restriction of select requirement grid
	selectRes: " 1=1 ", 
	
	//check if it is permits and licenses.
	isPermitsAndLicenses: false,

	//----------------event handle--------------------
    afterViewLoad: function(){
		Ab.recurring.RecurringControl.addField({
			panel: this.abCompSelectRequirement,
			fields: new Array("regrequirement.recurring_rule"),
			exportButtons: new Array({id: "xls", type: "XLS"})
		});
    },
    
    afterInitialDataFetch: function(){
    	
    	this.mainController=View.getOpenerView().controllers.get(0);
		this.tabs = this.mainController.sbfDetailTabs;
		
		if(this.tabs.configureForAssignRequirement){
			this.configureForAssignRequirement();
		}
		else{
			this.configureForDefault();
		}
//		check if it's report model. use for Manage My Compliance Requirements
		if(this.mainController.isReport&&this.mainController.isReport==true){
			this.handleBeforeRefresh(this.mainController.extraRestriction);
		}
//		check if it's coordinator model. use for 'Manage My Permits and Licenses'  and  'Manage My Compliance Requirements'
		if(this.mainController.isCoordinator&&this.mainController.isCoordinator==true){
			this.handleBeforeRefresh(this.mainController.extraRestriction);
		  	this.abCompSelectRequirement.actions.get("addNew").show(false);
		  	
		}
//		check if it's coordinator model. use for 'Manage My Permits and Licenses' 
		if(this.mainController.isPermitsAndLicenses&&this.mainController.isPermitsAndLicenses==true){
			this.isPermitsAndLicenses = true;
			this.costomlizeConsole();
		}
		this.abCompSelectRequirement.refresh();
		
		//if there is a console exists, put current controller to the console controller array
		 if (typeof controllerConsole != "undefined") {
			 controllerConsole.controllers.push(abCompSelectRequirementController);
			 controllerConsole.getVnRespComplevelResForRequireOrProgram = getCustomFieldsResForRequirement;
		 }
    },
    
    /**
     * Requirement Type is a virtual field with static text string value of "License or Permit". 
	 * The virtual field is not used in the restriction, as that is already specified in the permanent 
	 * restriction below.  Requirement Status is disabled and set to "Active"
     */
    costomlizeConsole: function(){
    	var regreq_type = this.abCompSelectRequirementConsole.getFieldElement("regrequirement.regreq_type");
    	var license = "License";
    	var permit = "Permit";
    	var objLicense = findOption(regreq_type, license);
    	var objPermit = findOption(regreq_type, permit);
    	regreq_type.innerHTML = "";
    	addOption(regreq_type, "", "");
    	addOption(regreq_type, objLicense.value, objLicense.name);
    	addOption(regreq_type, objPermit.value, objPermit.name);
    },
    
    /**
     * for report model, determine sub tab with or without function button and disable specified fields.
     */
    handleBeforeRefresh: function(restriction){
    	//add parameter
	  	this.abCompSelectRequirement.addParameter('extraResParameter', restriction);
	  	//hide function button.
	  	this.abCompSelectRequirement.actions.get("addNew").show(false);
    },

    /**
	 * filter console show button click.
	 */
	refreshFromConsole:function(){

		//add restriction for requirementRes
		this.requirementRes = generateRequirementRestriction();
		
		//Add location restriction for this.regulationRes which use for regulation tab.
		addConsoleLocationResToTabRes(abCompSelectRequirementController,null,null,this.requirementRes);
		
		this.abCompSelectRequirement.addParameter('requirementRes', this.requirementRes);
		
		this.abCompSelectRequirement.refresh(this.getCostomFieldsRes());
		
		//store restriction for select requirement grid
		this.selectRes = this.requirementRes + " and " + this.getCostomFieldsRes();
	},
	/**
	 * Vendor Code, Responsible Person, Regulatory Contact in both regrequirement and regprogram.  
	 * A match is made (if the Vendor Code in regrequirement matches) OR (if the Vendor Code 
	 * in regprogram matches and Vendor Code in regrequirement is NULL).  Same logic applies to 
	 * Responsible Person and Regulatory Contact.
	 */
	getCostomFieldsRes: function(){
		
		var date_start = this.abCompSelectRequirementConsole.getFieldValue("regrequirement.date_start");
		var date_end = this.abCompSelectRequirementConsole.getFieldValue("regrequirement.date_end");

		var vn_ids = this.abCompSelectRequirementConsole.getFieldValue("regrequirement.vn_id");
		var em_ids = this.abCompSelectRequirementConsole.getFieldValue("regrequirement.em_id");
		var contact_ids = this.abCompSelectRequirementConsole.getFieldValue("regrequirement.contact_id");
		
		var restriction ="1=1 ";
		var dataRes="";
		
		//kb 3036550 
		//condition 1: WHERE ((date_end>DateFrom OR date_end IS NULL OR dateFrom IS NULL) 
		//condition 2: AND (date_start<DateTo OR date_start IS NULL OR dateTo IS NULL))
		if(!(date_start==''&&date_end=='')){
			
			var condition1 = " and ( regrequirement.date_end >= ${sql.date('"+date_start+"')} or regrequirement.date_end is null) ";
			var condition2 = " and (regrequirement.date_start < ${sql.date('"+date_end+"')} or  regrequirement.date_start is null)";
			
			if(date_start&&date_end){
				dataRes = condition1+condition2;
			}else if(date_start&&!date_end){// dateTo IS NULL --- condition 1
				dataRes = condition1;
			}else if(date_end&&!date_start){// dateFrom IS NULL --- condition 2
				dataRes = condition2;
			}
		}
		
		if(vn_ids!=""){
			dataRes+=" and ( regrequirement.vn_id in (" + this.changeStringFormat(vn_ids) + ") or (regrequirement.vn_id is null and regprogram.vn_id in (" + this.changeStringFormat(vn_ids) + ")))";
		}
		if(em_ids!=""){
			dataRes+=" and ( regrequirement.em_id in (" + this.changeStringFormat(em_ids) + ") or (regrequirement.em_id is null and regprogram.em_id in (" + this.changeStringFormat(em_ids) + ")))";
		}
		if(contact_ids!=""){
			dataRes+=" and ( regrequirement.contact_id in (" + this.changeStringFormat(contact_ids) + ") or (regrequirement.contact_id is null and regprogram.contact_id in (" + this.changeStringFormat(contact_ids) + ")))";
		}
		return restriction + dataRes;
	},
	
    /**
     * filter console show button click.
     */
    abCompSelectRequirementConsole_onShow: function(){
	   	 if (typeof controllerConsole != "undefined") {
	   		 controllerConsole.abCompDrilldownConsole = this.abCompSelectRequirementConsole;
	   		 controllerConsole.abCompDrilldownConsole_onShow();
	   		 return;
	   	 }
    },

	/**
     * private method
     * change array to String[key=value]
     */
    changeFormatForSqlIn: function(array){
   	 var result = "";
   	 if(array.length>1){
   		for(var i=0;i<array.length;i++){
   			result+="'"+array[i]+"',"
   		}
   		return result.substring(0,result.length-1);
   	 }
   	 return array;
    },
    /**
     * private method
     * change String e.g. :  abc#bbb to 'abc','bbb'
     */
    changeStringFormat: function(string){
    	var character  = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
    	if(string.indexOf(character)!=-1){
    		var array = string.split(character);
    		return this.changeFormatForSqlIn(array);
    	}else{
    		return "'"+string+"'";
    	}
    },
    /**
     * first tab row record button click change to tab2 edit form.
     */
    clickSelectButtonEdit: function(){
    	var grid = this.abCompSelectRequirement;
    	var row = grid.rows[grid.selectedRowIndex];

        var regrequirement = row[this.key];//regrequirement.reg_requirement
        var regulation = row['regrequirement.regulation'];//regrequirement.reg_requirement
        var reg_program = row['regrequirement.reg_program'];//regrequirement.reg_requirement
        this.tabs.regrequirement = regrequirement;       
        this.tabs.regprogram = reg_program;
        this.tabs.regulation = regulation;
        this.mainController.regulation = regulation;
        this.mainController.regprogram = reg_program;
        this.mainController.regrequirement = regrequirement;
        this.mainController.project_id = row["regprogram.project_id"];
        
        var viewTitle = getMessage("manageRequirement")+": "+row['regrequirement.reg_requirement']+" ("+getMessage("fromCompProgram")+": "+reg_program+")";
        //if it's View 'Manage My Permits and Licenses', reset View title to "Manage My Permits and Licenses:xxxx".
        if(this.mainController.isPermitsAndLicenses&&this.mainController.isPermitsAndLicenses==true){
        	viewTitle = getMessage("manageMyPermitsAndLicenses")+": "+row['regrequirement.reg_requirement']+" ("+getMessage("fromCompProgram")+": "+reg_program+")";
        }
        this.mainController.view.setTitle(viewTitle);
        
        var restriction = new Ab.view.Restriction();
    	restriction.addClause(this.key, regrequirement, '=');
    	restriction.addClause('regrequirement.regulation', regulation, '=');
    	restriction.addClause('regrequirement.reg_program', reg_program, '=');
    	
		this.mainController.newRecord = false;
    	this.mainController.setOthersTabRefreshObj("select", 1);
    	
    	this.tabs.selectTab("define", restriction, false, false, true);
    	
		this.tabs.setAllTabsEnabled(true);
//		this.tabs.disableTab('select');
    },
    
    /**
     * when add new button click.
     */
    abCompSelectRequirement_onAddNew: function(){
		this.mainController.newRecord = true;
		this.mainController.copyRecord = false;
    	
    	this.mainController.setOthersTabRefreshObj("select", 1);
    	
		var tabs = this.tabs;
		if( tabs.findTab('define')){
			tabs.selectTab("define", null, true);
			this.mainController.view.setTitle(getMessage("addNewRequirement"));
			this.tabs.enableTab('select');
		}
		
		var defineTab = tabs.findTab('define');
		defineTab.restriction = null;
    },

    /**
     * handler for 'Assign Selected' button click.
     */
    abCompSelectRequirement_onAssignSelected: function(){
		if(this.abCompSelectRequirement.getSelectedRows().length==0){
			View.showMessage(getMessage("selectNone"));
		} else{
			var templateIds = this.tabs.selectedTemplates;
			try{
				var requirements = this.abCompSelectRequirement.getSelectedRecords();
				var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-createNotifyTemplateAssignments', this.tabs.selectedTemplateIds, requirements, "requirement");
				if(result.code == 'executed'){
					//If no error, display temporary message (like when Saving)
					var instructions = "<span style='color:green'>" + getMessage("assignedRequirement") + "</span>";
					this.abCompSelectRequirement.setInstructions(instructions);
					this.abCompSelectRequirement.setInstructions.defer(2000, this.abCompSelectRequirement);

					//refresh grid in tab1 of Manage Notification Template tabs
					var index = View.getOpenerView().controllers.length-1;
					var topController = View.getOpenerView().controllers.get(index);
					if(topController){
						topController.needRefreshSelectList=true;				
					}
				}
			}catch(e){
				
				Workflow.handleError(e);
				return false;
			}
		}

    },

    /**
     * handler for 'Close' button click.
     */
    abCompSelectRequirement_onClose: function(){
		//Hide Tab 5.  Enable, refresh, and switch to Tab 1.
		this.mainController.needRefreshSelectList=true;
		this.tabs.selectTab("selectTemplate");
		this.abCompSelectRequirement.setAllRowsSelected(false);
    },

    configureForDefault: function(){
		this.abCompSelectRequirement.actions.get('assignSelected').show(false);
		this.abCompSelectRequirement.actions.get('close').show(false);
		showHideColumns(this.abCompSelectRequirement, "multipleSelectionColumn", true);
		// this.abCompSelectRequirement.update();
	},

    configureForAssignRequirement: function(){
		this.abCompSelectRequirement.setTitle(getMessage("selectToAssign"));
		this.abCompSelectRequirement.actions.get('addNew').show(false);
		showHideColumns(this.abCompSelectRequirement, "selectButton",true);
	},

	/**
	* Event Handler of action "Doc"
	*/
	abCompSelectRequirement_onDoc : function(){
		var	parameters = {};
		parameters.consoleRes = this.selectRes;
		//initializeReccuringParametersRpt(parameters);
		View.openPaginatedReportDialog("ab-comp-req-paginate-rpt.axvw" ,null, parameters);
	}
});  

/**
 * invoke select-value function, for pop-up grid, generate custom restriction if exist regreq_type
 * two case: 
 * if it is 'Permit and License' View. call method 'selectRequirementCommon' with a parameter 'extraRes'
 * 	of  sql condition regreq_type in ('License', 'Permit');
 * verse call original common method 'selectRequirementCommon' directly.
 */
function customSelectRequirementCommon(){
	var extraRes = " and regrequirement.regreq_type in ('License', 'Permit') ";
	if(abCompSelectRequirementController.isPermitsAndLicenses){
		selectRequirementCommon('abCompSelectRequirementConsole', 'regrequirement','multiple',extraRes);
	}else{
		selectRequirementCommon('abCompSelectRequirementConsole', 'regrequirement','multiple');
	}
}