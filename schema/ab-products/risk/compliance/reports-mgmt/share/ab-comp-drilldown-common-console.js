/**
 * Added for 20.2 Compliance  :  shared console controller of the management chart views with 21 fields
 * @author Guo Jiangtao
 */
var consoleController = View.createController('controllerConsole', {

	//view controllers that need current console controller to refresh
	controllers : [],
	
	//restriction of current console
	consoleRestriction: " regrequirement.status = 'Active' ",
	
	//regulation field array - 6 fields
	regulationFieldsArray : new Array(['regrequirement.regulation','=','regulation.regulation'], ['regulation.reg_cat'],
		['regulation.reg_type'], ['regulation.reg_rank'], ['regulation.authority'],['regulation.reg_class']),

	//regprogram field array - 6 fields
	regprogramFieldsArrays : new Array(['regrequirement.reg_program','=','regprogram.reg_program'], ['regprogram.regprog_cat'],
			['regprogram.regprog_type'], ['regprogram.priority'], ['regprogram.status'], ['regprogram.project_id']),

	//regrequirement field array - 5 fields
	regrequirementFieldsArray : new Array(['regrequirement.reg_requirement'], ['regrequirement.regreq_cat'], ['regrequirement.regreq_type'],
			['regrequirement.priority'], ['regrequirement.status']),
		
	/**
	 * get restriction from console values.
	 */
	getConsoleRestriction : function() {
		
		//get regulation restriction
		var regulationRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regulationFieldsArray);
		
		//get regprogram restriction
		var regprogramRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regprogramFieldsArrays);
		
		//get regrequirement restriction
		var regrequirementRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regrequirementFieldsArray);

		//get Responsible Person and Vendor Code restriction
		var responsiblePersonAndVnRestriction = this.getResponsiblePersonAndVnRestriction();
		
		//get location restriction
		var locationRestriction = this.getLocationRestriction();
		
		//get compliance level restriction
		var complianceLevelRestriction = this.getComplianceLevelRestriction();
		
		
		this.consoleRestriction = regulationRestriction + ' AND ' + regprogramRestriction + ' AND ' + regrequirementRestriction 
		      + ' AND ' + responsiblePersonAndVnRestriction  + ' AND ' + locationRestriction + ' AND ' + complianceLevelRestriction;
	},
	
	/**
	 * get location restriction from console values.
	 */
	getLocationRestriction : function() {
		
		var locationRestriction = ' 1=1 ';
			
		if(View.locationRestriction){
			locationRestriction = ' exists(select 1 from regloc left join compliance_locations on regloc.location_id = '
				+ 'compliance_locations.location_id where regloc.reg_requirement = regrequirement.reg_requirement ' 
				+ ' AND regloc.regulation = regrequirement.regulation ' 
				+ ' AND regloc.reg_program = regrequirement.reg_program ' 
				+ View.locationRestriction+')';
		}
		
		return locationRestriction;
		
	},
	
	/**
	 * get compliance level restriction from console values.
	 */
	getComplianceLevelRestriction : function() {
		
		var calculatedField = ' ${sql.isNull(\'(case when regrequirement.comp_level IS NULL THEN regprogram.comp_level ELSE regrequirement.comp_level END)\', "\'Not Entered\'")} ';
		
		var complianceLevelRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
                new Array(['regloc.comp_level','=',calculatedField]));
		
		return complianceLevelRestriction;
		
	},
	
	/**
	 * get Responsible Person and Vendor Code restriction from console values.
	 */
	getResponsiblePersonAndVnRestriction : function() {
		
		//Responsible Person restriction
		var responsiblePersonRestriction = '(('+
			
			getRestrictionStrFromConsole(this.abCompDrilldownConsole,
	                new Array(['regloc.resp_person','=','regprogram.em_id'])) +') OR ('+
	                
	                getRestrictionStrFromConsole(this.abCompDrilldownConsole,
	    	                new Array(['regloc.resp_person','=','regrequirement.em_id'])) + '))';
		
		//Vendor Code restriction
		var vnRestriction = '(('+
		
		getRestrictionStrFromConsole(this.abCompDrilldownConsole,
                new Array(['regloc.vn_id','=','regprogram.vn_id'])) +') OR ('+
                
                getRestrictionStrFromConsole(this.abCompDrilldownConsole,
    	                new Array(['regloc.vn_id','=','regrequirement.vn_id'])) + '))';
		
		return responsiblePersonRestriction+ ' AND ' + vnRestriction;
		
	},
		

	/**
	 * event handle when show button click.
	 */
	abCompDrilldownConsole_onShow : function() {
		//get console restriction
		this.getConsoleRestriction();
		
		//refresh all controls that register to this console
		for ( var i = 0; i < this.controllers.length; i++) {
			this.controllers[i].refreshFromConsole();
		}
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
	if(typeof abCompRptProLvlRegtController!="undefined"){
		selectRequirementCommon('abCompDrilldownConsole', 'regrequirement','multiple',extraRes);
	}else{
		selectRequirementCommon('abCompDrilldownConsole', 'regrequirement','multiple');
	}
}