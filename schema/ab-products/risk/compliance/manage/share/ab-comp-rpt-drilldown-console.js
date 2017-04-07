var controllerConsole = View.createController('controllerConsole', {

	controllers : [],

	parameters : null,
	
	locationRes: null,
	
	reglocFieldsArraysForRes : ' 1=1 ',

	regulationFieldsArraysForRes : new Array(['regrequirement.regulation','=','regulation.regulation'], ['regulation.reg_class'],['regulation.reg_cat'],
			 ['regulation.reg_type'], ['regulation.authority'], ['regulation.reg_rank']),

	regprogramFieldsArraysForRes : new Array(['regrequirement.reg_program','=','regprogram.reg_program'],['regprogram.regprog_cat'],
			['regprogram.regprog_type'], ['regprogram.priority'], ['regprogram.status'],
		['regprogram.project_id']),
	
	regRequirementResOnlyForComplianceByLocRes : new Array(['regrequirement.reg_requirement'],['regrequirement.regreq_cat'],
			['regrequirement.regreq_type'], ['regrequirement.priority'], ['regrequirement.status'],
			['regrequirement.em_id'],['regrequirement.vn_id']),	
			
			
	//	Other Special Fields:
	//		- Match Compliance Level in regprogram OR regrequirement.
	//		- Responsible Person matches regprogram.em_id OR regrequirement.em_id
	//		- Vendor Code matches regprogram.vn_id OR regrequirement.vn_id
	compLevelForResLoc: new Array(['regrequirement.comp_level','','regloc.comp_level']),
	compLevelForProgram: new Array(['regrequirement.comp_level','','regprogram.comp_level']),
	compLevelForRequire: new Array(['regrequirement.comp_level','','regrequirement.comp_level']),
	
	
	respPersonForRegLoc: new Array(['regloc.resp_person','','regloc.resp_person']),
	respPersonForProgram: new Array(['regloc.resp_person','','regprogram.em_id']),
	respPersonForRequire: new Array(['regloc.resp_person','','regrequirement.em_id']),
	
	vnForRegLoc: new Array(['regloc.vn_id','','regloc.vn_id']),
	vnForProgram: new Array(['regloc.vn_id','','regprogram.vn_id']),
	vnForRequire: new Array(['regloc.vn_id','','regrequirement.vn_id']),	
	
	//FOR *Compliance by Location Drill-down task event tab
	vnForActivityLog: new Array(['regloc.vn_id','','activity_log.vn_id']),	
	respPersonForActivityLog: new Array(['regloc.resp_person','','activity_log.manager']),	
	
	//regloc.comp_level if not null; else if regloc.reg_requirement is not null then regrequirement.comp_level if not null; else if regloc.regprogram is not null then regprogram.comp_level if not null; else no match
	compLevelForRes: new Array(['regrequirement.comp_level','=','(case when (regloc.comp_level is not null) then regloc.comp_level when (regrequirement.comp_level is not null) then regrequirement.comp_level when (regprogram.comp_level is not null) then regprogram.comp_level else  null end)']),

	/**
	 * event handle when show button click.
	 */
	abCompDrilldownConsole_onShow : function() {
		//- Search Compliance Level in regloc, regrequirement, and regprogram tables, using an OR operator.

		//- Search Vendor Code, Responsible Person in both regrequirement and regprogram, using an OR operator.

		//for compliance level
		var compLevelForResLoc = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.compLevelForResLoc);
		var compLevelForProgram = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.compLevelForProgram);
		var compLevelForRequire = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.compLevelForRequire);
				
		var respPersonForRegLoc = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.respPersonForRegLoc);
		var respPersonForRegLocOfTree=respPersonForRegLoc;
		
		var respPersonForRequire = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.respPersonForRequire);
		var respPersonForRequireOfTree=respPersonForRequire;
			respPersonForRequire=this.getVnRespComplevelResForRequireOrProgram('requirement', respPersonForRequire,'em_id');
			
		var respPersonForProgram = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.respPersonForProgram);
		var respPersonForProgramOfTree=respPersonForProgram;
			respPersonForProgram=this.getVnRespComplevelResForRequireOrProgram('program', respPersonForProgram,'em_id');
		
		//for vn
		var vnForRegLoc = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.vnForRegLoc);
		var vnForRegLocOfTree=vnForRegLoc;
		
		var vnForRequire = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.vnForRequire);
		var vnForRequireOfTree=vnForRequire;
			vnForRequire=this.getVnRespComplevelResForRequireOrProgram('requirement',vnForRequire,'vn_id');
		
		var vnForProgram = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.vnForProgram);
		var vnForProgramOfTree=vnForProgram;
		
			vnForProgram=this.getVnRespComplevelResForRequireOrProgram('program',vnForProgram,'vn_id');
		
		//regloc.comp_level if not null; else if regloc.reg_requirement is not null then regrequirement.comp_level if not null; 
		//else if regloc.regprogram is not null then regprogram.comp_level if not null; else no match.
		
		var locLevelNotNull = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.compLevelForResLoc);
			locLevelNotNull=this.getVnRespComplevelResForRequireOrProgram('regloc',locLevelNotNull,'comp_level');
			
		var requireLevelNotNull = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.compLevelForRequire);
		
			requireLevelNotNull=this.getVnRespComplevelResForRequireOrProgram('requirement',requireLevelNotNull,'comp_level');
			
		var programLevelNotNull = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.compLevelForProgram);
		
			programLevelNotNull=this.getVnRespComplevelResForRequireOrProgram('program',programLevelNotNull,'comp_level');
			
		this.parameters = {};
		
		//regloc.comp_level if not null; else if regloc.reg_requirement is not null then regrequirement.comp_level if not null; else if regloc.regprogram is not null then regprogram.comp_level if not null; else no match
		var compLevelForRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.compLevelForRes);
	
		var vnForActivityLog = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.vnForActivityLog);
		var respPersonForActivityLog = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.respPersonForActivityLog);
		
		this.parameters.compLevelForRes = compLevelForRes;
		
		//FOR *Compliance by Location Drill-down task event tab
		this.parameters.vnForActivityLog = vnForActivityLog;
		this.parameters.respPersonForActivityLog = respPersonForActivityLog;
		
		//translate parameter for main 	grid or tree.
		this.parameters.compLevelForResLoc = compLevelForResLoc;
		this.parameters.compLevelForProgram = compLevelForProgram;
		this.parameters.compLevelForRequire = compLevelForRequire;
		
		//translate parameter for main 	grid or tree.
		this.parameters.compLevelForResLocOfTree = compLevelForResLoc;
		this.parameters.compLevelForRequireOfTree = compLevelForRequire;
		this.parameters.compLevelForProgramOfTree = compLevelForProgram;
		
		//translate parameter for main 	grid or tree.
		this.parameters.vnForRegLocOfTree = vnForRegLocOfTree;
		this.parameters.vnForRequireOfTree = vnForRequireOfTree;
		this.parameters.vnForProgramOfTree = vnForProgramOfTree;
		
		//translate parameter for main 	grid or tree.
		this.parameters.respPersonForRegLocOfTree = respPersonForRegLocOfTree;
		this.parameters.respPersonForRequireOfTree = respPersonForRequireOfTree;
		this.parameters.respPersonForProgram = respPersonForProgram;
		
		//translate parameter for main grid or tree.
		this.parameters.locLevelNotNull = locLevelNotNull;
		this.parameters.requireLevelNotNull = requireLevelNotNull;
		this.parameters.programLevelNotNull = programLevelNotNull;
		
		this.parameters.respPersonForRegLoc = respPersonForRegLoc;
		this.parameters.respPersonForProgram = respPersonForProgram;
		this.parameters.respPersonForRequire = respPersonForRequire;
		
		this.parameters.vnForRegLoc = vnForRegLoc;
		this.parameters.vnForProgram = vnForProgram;
		this.parameters.vnForRequire = vnForRequire;
		
		this.parameters.reglocRes = this.reglocFieldsArraysForRes;
		this.parameters.regulationRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regulationFieldsArraysForRes);
		
		this.parameters.regprogramRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regprogramFieldsArraysForRes);
		
		this.parameters.requirementRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regRequirementResOnlyForComplianceByLocRes);
		this.parameters.regRequirementResOnlyForComplianceByLocRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regRequirementResOnlyForComplianceByLocRes);
		
		//add this parameter to be compatible with original implementation 'report requirement'.
		this.parameters.regcomplianceRes = this.parameters.regRequirementResOnlyForComplianceByLocRes;
		
		for ( var i = 0; i < this.controllers.length; i++) {
			this.controllers[i].refreshFromConsole();
		}
	},
	
	/**
	 * Get restriction for vn ,default for task Compliance by Location Drill-down
	 */
	getVnRespComplevelResForRequireOrProgram:function(type,currentFieldClause,fieldName){
		if(fieldName=="comp_level"){
			if(type=='requirement'){
				return getRestrictionStrFromConsole(this.abCompDrilldownConsole, 
						new Array(['regrequirement.comp_level','','${sql.isNull(\'regrequirement.comp_level\', \'regrequirement.comp_level_calc\')}']));
			}else if(type=='program'){
				return getRestrictionStrFromConsole(this.abCompDrilldownConsole, 
						new Array(['regrequirement.comp_level','','${sql.isNull(\'regprogram.comp_level\',\'regprogram.comp_level_calc\')}']));
			}else{
				return getRestrictionStrFromConsole(this.abCompDrilldownConsole, 
						new Array(['regrequirement.comp_level','','${sql.isNull(\'regloc.comp_level\', \'regloc.comp_level_calc\')}']));
			}
			
		}else{
			return currentFieldClause;
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
	
	if(typeof(permitController)!='undefined'&&permitController.isPermit){
		selectRequirementCommon('abCompDrilldownConsole', 'regrequirement','multiple',extraRes);
		
	}else{
		selectRequirementCommon('abCompDrilldownConsole', 'regrequirement','multiple');
	}

	if(typeof(abCompSelectRequirementController)!='undefined'&&abCompSelectRequirementController.isPermitsAndLicenses){
		selectRequirementCommon('abCompSelectRequirementConsole', 'regrequirement','multiple',extraRes);
		
	}else{
		selectRequirementCommon('abCompSelectRequirementConsole', 'regrequirement','multiple');
	}
}
