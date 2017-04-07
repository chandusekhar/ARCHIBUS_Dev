var abEhsRptEmRestrictionsCtrl = View.createController('abEhsRptEmRestrictionsCtrl',{
	emId:null,
	
	userRestricted: false,
	activeRestriction: '',
	
	afterViewLoad: function(){
		/*
		 * restrict data to the user's employee ?
		 * Yes if from "EHS - Employee Review" process and "Employee Work Restrictions" task
		 */
		if(View.taskInfo.processId == "EHS - Employee Review" && View.taskInfo.taskId == 'Employee Work Restrictions'){
			// employee
			this.userRestricted = true;
		} else if(View.taskInfo.processId == "EHS - Review" && View.taskInfo.taskId == 'Employee Work Restrictions'){
			// manager
			this.userRestricted = false;
		} else {
			// default
			this.userRestricted = false;
		}
	},
	
	afterInitialDataFetch: function(){
		this.initConsole();
		
		// For Employee Review, the data is restricted to current user's employee, so display his data
		if(this.userRestricted){
			this.abEhsRptEmRestrictions_console_onFilter();
		}
	},
	
	clearForm: function(){
		this.abEhsRptEmRestrictions_console.clear();
		this.initConsole();
	},
	
	initConsole: function(){
		// For Employee Review, restrict the data to current user's employee
		if(this.userRestricted){
			this.abEhsRptEmRestrictions_console.setFieldValue("em.em_id", View.user.employee.id);
		}
		
		document.getElementById("onlyActiveRestrictions").checked = true;
	},
	
	/**
	 * Shows the report according to the user restriction
	 */
	abEhsRptEmRestrictions_console_onFilter: function(){
		this.emId = this.abEhsRptEmRestrictions_console.getFieldValue("em.em_id");
    	var filterRestriction = new Ab.view.Restriction();
    	if(valueExistsNotEmpty(this.emId)){
    		filterRestriction.addClause("ehs_restrictions.em_id",this.emId,"=");
    	}
    	    
    	this.activeRestriction = '';
        if(document.getElementById("onlyActiveRestrictions").checked){
    		this.activeRestriction += " (ehs_restrictions.date_start <= ${sql.currentDate}) AND (ehs_restrictions.restriction_type_id = 'Permanent' OR " +
    		"(ehs_restrictions.restriction_type_id = 'Temporary' " +
    		"	AND (ehs_restrictions.date_end IS NULL OR ehs_restrictions.date_end > ${sql.currentDate})))";
        }
        
        this.abEhsRptEmRestrictions_panel.addParameter('activeRestriction',this.activeRestriction);
        
		this.abEhsRptEmRestrictions_panel.refresh(filterRestriction);
		if(document.getElementById("onlyActiveRestrictions").checked){
			this.abEhsRptEmRestrictions_panel.setTitle(getMessage("activeRestrictionsPanelTitle"));
		}else{
			this.abEhsRptEmRestrictions_panel.setTitle(getMessage("allRestrictionsPanelTitle"));
		}
	}
})