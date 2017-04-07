/**
 * Add console location field restriction to each tab console restriction.
 * @param mainController
 * @param regulationRes
 * @param programRes
 * @param requirementRes
 */
function addConsoleLocationResToTabRes(mainController,regulationRes,programRes,requirementRes){

	//Add location restriction for this.regulationRes which use for regulation tab.
	if(View.locationRestriction!=''&&View.locationRestriction!=undefined){
		
		if(regulationRes!=null){
			mainController.regulationRes=regulationRes+" AND EXISTS (SELECT 1 FROM regloc,compliance_locations WHERE regloc.location_id= compliance_locations.location_id AND regloc.regulation=regulation.regulation "+View.locationRestriction+")";
		}
		if(programRes!=null){
			mainController.programRes=programRes+" AND EXISTS (SELECT 1 FROM regloc,compliance_locations WHERE regloc.location_id= compliance_locations.location_id AND regloc.regulation=regprogram.regulation " +
						" AND regloc.reg_program=regprogram.reg_program "+View.locationRestriction+")";
		}		
		if(requirementRes!=null){
			mainController.requirementRes=requirementRes+" AND EXISTS (SELECT 1 FROM regloc,compliance_locations WHERE regloc.location_id= compliance_locations.location_id AND regloc.regulation=regrequirement.regulation " +
			"AND regloc.reg_requirement=regrequirement.reg_requirement AND regloc.reg_program=regrequirement.reg_program "+View.locationRestriction+")";
		}
	}
}

/**
 * Generate restriction from console for tree and center tabs except
 */
function generateRequirementRestriction(){
	
	var param=controllerConsole.parameters;
	var respPersonRes=" ( "+param.respPersonForProgram+" OR "+param.respPersonForRequire+" )";
	var vnRes=" ( "+param.vnForProgram+" OR "+param.vnForRequire+" )";
	var levelRes=" ( "+param.programLevelNotNull+" OR "+param.requireLevelNotNull+" )";
	var res = param.regulationRes+" AND " +param.regprogramRes+" AND " +param.requirementRes+ 
	" AND ("+respPersonRes+" AND "+vnRes+" AND "+levelRes+")";
	
	return res;
}
	
/**
 * Private generate regulation restriction for regulation tab
 */
function generateProgramRestriction(mainTableType){
	
	var param=controllerConsole.parameters;
	var generalFieldsRes = getProgramSubSqlString(param.regulationRes+" AND " +param.regprogramRes, param.requirementRes);
	/*
	 * custom logic for main table 'program' without location. 
	 * for view: ab-comp-rpt-program.axvw
	 */
	if(mainTableType&&mainTableType=="programRpt"){
		//contains custom fields 'Compliance Level, Responsible Person or Vendor Code'
		var respPersonRes=" ( "+param.respPersonForProgram+" OR "+param.respPersonForRequire+" )";
		var vnRes=" ( "+param.vnForProgram+" OR "+param.vnForRequire+" )";
		var levelRes=" ( "+param.programLevelNotNull+" OR "+param.requireLevelNotNull+" )";
		programString = generalFieldsRes+ " AND ("+respPersonRes+" AND "+vnRes+" AND "+levelRes+")";
	}
	/*
	 * custom logic for main table 'program' without location. 
	 * for view: ab-comp-program.axvw
	 */
	if(mainTableType&&mainTableType=="program"){
		//contains custom fields 'Compliance Level, Responsible Person or Vendor Code'
		var respPersonRes=param.respPersonForProgram;
		var vnRes=param.vnForProgram;
		var levelRes=param.compLevelForProgram;
		programString = generalFieldsRes+ " AND ("+respPersonRes+" AND "+vnRes+" AND "+levelRes+")";
	}
	
	return programString;
}


/**
 * Private getnarate regulation restriction for regulation tab
 */
function generateRegulationRestriction(){
	
	var param=controllerConsole.parameters;
	//if contains custom fields 'Compliance Level, Responsible Person or Vendor Code'
	var regulationString = param.regulationRes+
	" AND " + getProgramExistsStringForRegulation(param.regprogramRes)+
	" AND " +getRequirementExistsStringForRegulation(param.requirementRes)+ 
	" AND ("+param.respPersonForRegLoc+" AND "+param.vnForRegLoc+" AND "+param.locLevelNotNull+")";
	
	return regulationString;
}

/**
 * Private get regulation restriction by we give sql value
 */
function getProgramSubSqlString(regulationAndProgramSqlPart,requirementSqlPart){
	var sqlStr=getRequirementExistsStringForProgram(requirementSqlPart);
	if(sqlStr.indexOf('AND')!=-1){
		regulationAndProgramSqlPart=regulationAndProgramSqlPart+" AND "+sqlStr;
	}
	return regulationAndProgramSqlPart;
}

/**
 * Private get sub query exists program for regulation
 */
function getProgramExistsStringForRegulation(str){
	var sqlStr=" 1=1 ";
	if(str.indexOf('AND')!=-1){
		sqlStr=" EXISTS(SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation  AND  "+str+")";
	}
	
	return sqlStr;
}

/**
 * Private get sub query exists requirement for program
 */
function getRequirementExistsStringForProgram(str){
	
	var sqlStr=" 1=1 ";
	if(str.indexOf('AND')!=-1){
		sqlStr="  EXISTS(SELECT 1 FROM regrequirement WHERE regrequirement.regulation=regprogram.regulation AND regrequirement.reg_program=regprogram.reg_program  AND "+str+" )";
	}
	return sqlStr;
}

/**
 * Private get sub query exists requirement for regulation
 */
function getRequirementExistsStringForRegulation(str){
	
	var sqlStr=" 1=1 ";
	if(str.indexOf('AND')!=-1){
		sqlStr="  EXISTS(SELECT 1 FROM regrequirement WHERE regrequirement.regulation=regulation.regulation AND "+str+" )";
	}
	return sqlStr;
}
/**
 * use for View ' manage or report drilldown'.
 * for below variable in common file 'ab-comp-rpt-drilldown-console.js', 
 * overwrite the parameter special logic for fields 'Compliance Level, Responsible Person, Vendor Code'
 * 
		this.parameters.locLevelNotNull = locLevelNotNull;
		this.parameters.requireLevelNotNull = requireLevelNotNull;
		this.parameters.programLevelNotNull = programLevelNotNull;
		
		this.parameters.respPersonForRegLoc = respPersonForRegLoc;
		this.parameters.respPersonForProgram = respPersonForProgram;
		this.parameters.respPersonForRequire = respPersonForRequire;
		
		this.parameters.vnForRegLoc = vnForRegLoc;
		this.parameters.vnForProgram = vnForProgram;
		this.parameters.vnForRequire = vnForRequire;
		@param type ,'isProgram' or nothing.
 */
function overWriteConsoleSpecialVariable(type){
	
	//response person
	var respPersonForRegLoc = getCustomFieldsResForRegulation('em_id');

	var respPersonForRequire = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, controllerConsole.respPersonForRequire);
		
	var respPersonForProgram = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, controllerConsole.respPersonForProgram);
	
	//for vn
	var vnForRegLoc = getCustomFieldsResForRegulation('vn_id');
	
	var vnForRequire = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, controllerConsole.vnForRequire);
	
	var vnForProgram = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, controllerConsole.vnForProgram,'vn_id');
	
	//regloc.comp_level if not null; else if regloc.reg_requirement is not null then regrequirement.comp_level if not null; 
	//else if regloc.regprogram is not null then regprogram.comp_level if not null; else no match.
	
	var locLevelNotNull = getCustomFieldsResForRegulation('comp_level');
	
	var requireLevelNotNull = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, controllerConsole.compLevelForRequire);
		
	var programLevelNotNull = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, controllerConsole.compLevelForProgram);

	if(type=="isProgram"){
		respPersonForRequire= getCustomFieldsResForProgram('requirement', respPersonForRequire,'em_id', true);
		respPersonForProgram= getCustomFieldsResForProgram('program', respPersonForProgram,'em_id', true);
		vnForRequire= getCustomFieldsResForProgram('requirement',vnForRequire,'vn_id', true);
		vnForProgram= getCustomFieldsResForProgram('program',vnForProgram, 'vn_id', true);
		requireLevelNotNull= getCustomFieldsResForProgram('requirement',requireLevelNotNull,'comp_level', true);
		programLevelNotNull= getCustomFieldsResForProgram('program',programLevelNotNull,'comp_level', true);
	}else{
		respPersonForRequire= getCustomFieldsResForRequirement('requirement', respPersonForRequire,'em_id', true);
		respPersonForProgram= getCustomFieldsResForRequirement('program', respPersonForProgram,'em_id', true);
		vnForRequire= getCustomFieldsResForRequirement('requirement',vnForRequire,'vn_id', true);
		vnForProgram= getCustomFieldsResForRequirement('program',vnForProgram, 'vn_id', true);
		requireLevelNotNull= getCustomFieldsResForRequirement('requirement',requireLevelNotNull,'comp_level', true);
		programLevelNotNull= getCustomFieldsResForRequirement('program',programLevelNotNull,'comp_level', true);
	}
	
	controllerConsole.parameters.locLevelNotNull = locLevelNotNull;
	controllerConsole.parameters.requireLevelNotNull = requireLevelNotNull;
	controllerConsole.parameters.programLevelNotNull = programLevelNotNull;
	
	controllerConsole.parameters.respPersonForRegLoc = respPersonForRegLoc;
	controllerConsole.parameters.respPersonForProgram = respPersonForProgram;
	controllerConsole.parameters.respPersonForRequire = respPersonForRequire;
	
	controllerConsole.parameters.vnForRegLoc = vnForRegLoc;
	controllerConsole.parameters.vnForProgram = vnForProgram;
	controllerConsole.parameters.vnForRequire = vnForRequire;
}

/**
 * Get restriction Compliance Level, Responsible Person, Vendor Code: 
 * WHERE regprogram.field IN (list) OR (regprogram.field IS NULL AND EXISTS (SELECT 1 FROM regrequirement 
 * WHERE regrequirement.regulation=regprogram.regulation AND regrequirement.reg_program=regprogram.reg_program 
 * AND regrequirement.field IN (list))).
 */
function getCustomFieldsResForRegulation(fieldName){
	
    var fieldRequirementClause = "";
    var fieldProgramClause = "";
    if(fieldName=="comp_level"){
    	var fieldValue = controllerConsole.abCompDrilldownConsole.getFieldValue("regrequirement.comp_level");
    	if(!fieldValue) return " 1=1 ";
    	new Array(['regrequirement.comp_level','','regloc.comp_level'])
    	fieldRequirementClause = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, new Array(['regrequirement.comp_level']));
    	fieldProgramClause = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, new Array(['regrequirement.comp_level','','regprogram.comp_level']));
    	return resForRegulation(fieldName,fieldRequirementClause,fieldProgramClause,true);
    }else if(fieldName=="em_id"){
    	var fieldValue = controllerConsole.abCompDrilldownConsole.getFieldValue("regloc.resp_person");
    	if(!fieldValue) return " 1=1 ";
    	fieldRequirementClause = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, new Array(['regloc.resp_person','','regrequirement.em_id']));
    	fieldProgramClause = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, new Array(['regloc.resp_person','','regprogram.em_id']));
    	return resForRegulation(fieldName,fieldRequirementClause,fieldProgramClause,true);
    }else if(fieldName=="vn_id"){
    	var fieldValue = controllerConsole.abCompDrilldownConsole.getFieldValue("regloc.vn_id");
    	if(!fieldValue) return " 1=1 ";
    	fieldRequirementClause = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, new Array(['regloc.vn_id','','regrequirement.vn_id']));
    	fieldProgramClause = getRestrictionStrFromConsole(controllerConsole.abCompDrilldownConsole, new Array(['regloc.vn_id','','regprogram.vn_id']));
    	return resForRegulation(fieldName,fieldRequirementClause,fieldProgramClause,true);
    }else{
    	return " 1=1 ";
    }
}

/**
 * private method.
 */
function resForRegulation(fieldName,fieldRequirementClause,fieldProgramClause,checkNull){
	
	var isNullClause = " 2=2 ";
	if(!checkNull){
		isNullClause = " regprogram."+fieldName+" IS NULL ";
	}
	var requirement = "( EXISTS (SELECT 1 FROM regrequirement,regprogram " +
		" WHERE regrequirement.regulation = regulation.regulation " +
		" AND regprogram.regulation = regprogram.regulation  " +
		" AND regrequirement.reg_program = regprogram.reg_program AND" +
		isNullClause +
	" AND " +fieldRequirementClause+ "))";
	
	var program = "(  EXISTS (SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation " +
	" AND " +fieldProgramClause+ "))";
	
	return "("+requirement +" OR "+ program+")";
		
}
/**
 * Get restriction Compliance Level, Responsible Person, Vendor Code: 
 * WHERE regprogram.field IN (list) OR (regprogram.field IS NULL AND EXISTS (SELECT 1 FROM regrequirement 
 * WHERE regrequirement.regulation=regprogram.regulation AND regrequirement.reg_program=regprogram.reg_program 
 * AND regrequirement.field IN (list))).
 */
function getCustomFieldsResForProgram(type,currentFieldClause,fieldName,checkNull){
	
	var isNullClause = " 2=2 ";
	if(!checkNull){
		isNullClause = "regprogram."+fieldName +" IS NULL ";
	}
	if(currentFieldClause.indexOf('AND')!=-1){
		if(type=='requirement'){
			
			return "(" +isNullClause + 
			"AND EXISTS (SELECT 1 FROM regrequirement WHERE regrequirement.regulation=regprogram.regulation " +
			"AND regrequirement.reg_program=regprogram.reg_program AND " +currentFieldClause+ "))";
		
		}else if(type=='program'){
			
			return currentFieldClause;

		}

	}else{
		return currentFieldClause;
	}
}

/**
 * Get restriction Compliance Level, Responsible Person, Vendor Code: 
 * WHERE regrequirement.field IN (list) OR (regrequirement.field IS NULL AND regprogram.field IN (list)
 */
function getCustomFieldsResForRequirement(type,currentFieldClause,fieldName,checkNull){
	
	var isNullClause = " 2=2 ";
	if(!checkNull){
		isNullClause = "regrequirement."+fieldName +" IS NULL ";
	}
	if(currentFieldClause.indexOf('AND')!=-1){
		if(type=='requirement'){
			return "("+ currentFieldClause+ ")";

		}else if(type=='program'){
			
			return "("+ isNullClause +" AND " +currentFieldClause+ ")";
			
		}

	}else{
		return currentFieldClause;
	}
}