/**
 * @author Guo Jiangtao
 */

var abCompEventCalendarConsole = View.createController('abCompEventCalendarConsole', {

	//view controllers that need current console controller to refresh
	controllers : [],
	
	//restriction of current console
	consoleRestriction: " 1=1 ",
	
	//regulation table field used for console
	regulationFieldsArray : new Array(['regrequirement.regulation','=','regulation.regulation'], ['regulation.reg_rank']),
	
	//regprogram table field used for console
	regprogramFieldsArray : new Array(['regrequirement.reg_program','=','regprogram.reg_program'], ['regprogram.regprog_cat'], ['regprogram.regprog_type'], ['regprogram.project_id']),
	
	//regrequirement table field used for console
	regrequirementFieldsArray : new Array(['regrequirement.reg_requirement'], ['regrequirement.regreq_cat'], ['regrequirement.regreq_type'], ['regrequirement.status'],
			['virtual_prioriry', 'pscope', 'regrequirement.priority']),
			
	//activtiy_log table field used for console
	activityLogFieldsArray : new Array(['activity_log.action_title', 'like'], ['activity_log.status'], ['activity_log.manager'], ['activity_log.vn_id'], ['activity_log.contact_id']),
	
			
	/**
	 * get restriction from console values.
	 */
	getConsoleRestriction : function() {
		
		//get regulation restriction
		var regulationRestriction = getRestrictionStrFromConsole(this.console, this.regulationFieldsArray);
		
		//get regprogram restriction
		var regprogramRestriction = getRestrictionStrFromConsole(this.console, this.regprogramFieldsArray);
		
		//get regrequirement restriction
		var regrequirementRestriction = getRestrictionStrFromConsole(this.console, this.regrequirementFieldsArray);
		
		//get activity_log restriction
		var activityLogRestriction = getRestrictionStrFromConsole(this.console, this.activityLogFieldsArray);
		
		//get location restriction
		var locationRestriction = this.getLocationRestriction();
		
		//get compliance level restriction
		var complianceLevelRestriction = this.getComplianceLevelRestriction();
		
		
		this.consoleRestriction = regulationRestriction + ' AND ' + regprogramRestriction + ' AND ' + regrequirementRestriction 
		      + ' AND ' + activityLogRestriction  + ' AND ' + locationRestriction + ' AND ' + complianceLevelRestriction;
	},
	
	/**
	 * get location restriction from console values.
	 */
	getLocationRestriction : function() {
		
		var locationRestriction = ' 1=1 ';
		
		if(View.locationRestriction){
			locationRestriction += View.locationRestriction;
		}
		
		return locationRestriction;
		
	},
	
	/**
	 * get compliance level restriction from console values.
	 */
	getComplianceLevelRestriction : function() {

		//compliance level restriction
		var complianceLevelRestriction = '(('+
			
			getRestrictionStrFromConsole(this.console,
	                new Array(['regrequirement.comp_level','=','regrequirement.comp_level'])) +') OR (regrequirement.comp_level IS NULL AND '+
	                
	                getRestrictionStrFromConsole(this.console,
	    	                new Array(['regrequirement.comp_level','=','regprogram.comp_level'])) + '))';
		
		return complianceLevelRestriction;
		
	},
	
	/**
	 * event handle when show button click.
	 */
	console_onShow : function() {
		//get console restriction
		this.getConsoleRestriction();
		
		for ( var i = 0; i < this.controllers.length; i++) {
			this.controllers[i].refreshFromConsole();
		}
	},

   /**
	* EventHandler for action "Clear": clear console,  set custom dropdown list to select none 
	*/
	console_onClear : function() {
		//clear console values
		this.console.clear();
		
		//clear virtual location field value and View.locationRestriction, this method is defined in ab-comp-locations-console.js
		clearConsoleFields();
		
		//set the virtual field virtual_prioriry empty
		setOptionValue("virtual_prioriry",-1);
	}
});

