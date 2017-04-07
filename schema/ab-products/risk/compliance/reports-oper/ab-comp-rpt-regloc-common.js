
/**
 *Run when we click row ,forword tab and save clicked row key.
 * @param index
 */
function nextTab(index){
	
	
	var commCtrl = View.getOpenerView().controllers.get(0);

/*	KB 3039343
	if(index==0){
		enableAndDisableTabs(commCtrl.sbfDetailTabs,commCtrl.enableTabsArr);
	}
*/
	
	var arrs=commCtrl.nextTabArr;
	
	var arr=arrs[index];
	if(valueExists(arr)){
		var gridName = arr.panelName;
	    var grid=View.panels.get(gridName);
	    var selectedRow = grid.rows[grid.selectedRowIndex];
	    
	    //set the current tab value is null before we change it.
	    commCtrl.objRestrictions= {"regulation": null,"reg_program": null,"reg_requirement": null};
	    
	    for(var j=0 ;j<arr.field.length;j++){
	    	var fromField=arr.field[j][0];
	    	var selectValue = selectedRow[fromField];
	    	
	    	if(j==0){
	    		commCtrl.objRestrictions['regulation']=selectValue;
	    	}
	    	
	    	if(j==1){
	    		commCtrl.objRestrictions['reg_program']=selectValue;
	    	
	    	}
	    	if(j==2){
	    		commCtrl.objRestrictions['reg_requirement']=selectValue;
	    	}
	    }

	    // Mark all other tabs for refresh except current tab
	    commCtrl.setOthersTabRefreshObj(commCtrl.sbfDetailTabs.tabs[index].name, 1, commCtrl.objRestrictions);
	    
	    commCtrl.sbfDetailTabs.selectTab(commCtrl.sbfDetailTabs.tabs[index + 1].name);
	}
}


/**
 * Private getnarate regulation restriction for regulation tab
 */
function generateProgramRestriction(){
	
	var programRes0=" 1=1 ";
	var programRes1=" 1=1 ";
	
	//add restriction for regulationRes
	
	var regAndProgramWithoutOr=" 1=1 ";
	var regAndProgramWithOr=" 1=1 ";
	
	var requirementResWithoutOr=" 1=1 ";
	var requirementResWithOr=" 1=1 ";
	
	// get sub sql without or for  program tab(vn_id,resp_person,comp_level)
	regAndProgramWithoutOr=getWithOrWithOutOrClauses('regulationAndProgram')[0];
	
	// get sub sql with or for  program tab(vn_id,resp_person,comp_level)
	regAndProgramWithOr=getWithOrWithOutOrClauses('regulationAndProgram')[1];
	
	// get sub sql with or and without or for  program tab exists sentence (vn_id,resp_person,comp_level) 
	requirementResWithoutOr=getWithOrWithOutOrClauses('requirement')[0];
	requirementResWithOr=getWithOrWithOutOrClauses('requirement')[1];
	
	
	var	programRes0=getProgramSubSqlString(regAndProgramWithoutOr,requirementResWithOr);
	var	programRes1=getProgramSubSqlString(regAndProgramWithOr,requirementResWithoutOr);
	
	var programString="";
	
	if(getWithOrWithOutOrClauses('program')[2]!="noOr"){
		programString =  " ( ( "+programRes0+") OR ("+programRes1+" )  )";
	}else{
		programString=getProgramSubSqlString(regAndProgramWithoutOr,requirementResWithoutOr);
	}
	
	//from visual field location restriction
	if(View.locationRestriction!=''&&View.locationRestriction!=undefined){
		programString=programString+View.locationRestriction;
	}
	return programString;
}


/**
 * Private getnarate regulation restriction for regulation tab
 */
function generateRegulationRestriction(){
	
	var regulationRes0=" 1=1 ";
	var regulationRes1=" 1=1 ";
	var regulationRes2=" 1=1 ";
	
	//add restriction for regulationRes
	
	var regResWithoutOr=" 1=1 ";
	var regResWithOr=" 1=1 ";
	
	var programResWithoutOr=" 1=1 ";
	var programResWithOr=" 1=1 ";
	
	var requirementResWithoutOr=" 1=1 ";
	var requirementResWithOr=" 1=1 ";
	
	var regulationString=" 1=1 " ;

	regResWithoutOr=getWithOrWithOutOrClauses('regulation')[0];
	programResWithoutOr=getWithOrWithOutOrClauses('program')[0];
	requirementResWithoutOr=getWithOrWithOutOrClauses('requirement')[0];
	if(getWithOrWithOutOrClauses('regulation')[2]!="noOr"){
		
		regResWithOr=getWithOrWithOutOrClauses('regulation')[1];
		
		programResWithOr=getWithOrWithOutOrClauses('program')[1];
		
		requirementResWithOr=getWithOrWithOutOrClauses('requirement')[1];
		var	regulationRes0=getRegulationSubSqlString(regResWithOr,programResWithoutOr,requirementResWithoutOr);
		var	regulationRes1=getRegulationSubSqlString(regResWithoutOr,programResWithOr,requirementResWithoutOr);
		var	regulationRes2=getRegulationSubSqlString(regResWithoutOr,programResWithoutOr,requirementResWithOr);
		
		regulationString = " (( "+regulationRes0+") OR ("+regulationRes1+" ) OR( "+regulationRes2+" )) ";
		
	}else{
		regulationString=getRegulationSubSqlString(regResWithoutOr,programResWithoutOr,requirementResWithoutOr);
	}
	
	//from visual field location restriction
	if(View.locationRestriction!=''&&View.locationRestriction!=undefined){
		regulationString=regulationString+View.locationRestriction;
	}
	return regulationString;
}

/**
 * Private get restriction for regulation tab and program and requirement tab with or (vn_id,resp_person,comp_level) or not or(vn_id,resp_person,comp_level).
 */
function getWithOrWithOutOrClauses(type){
	var param=controllerConsole.parameters;
	
	var temp0=" 1=1 ";
	var temp1=" 1=1 ";
	var temp2=" 1=1 " ;
	
	var arr=[' 1=1 ',' 1=1 '];
	if((type=="regulation")&&(param.regulationRes.indexOf('AND')!=-1||param.vnForRegLoc.indexOf('AND')!=-1||param.respPersonForRegLoc.indexOf('AND')!=-1|| param.compLevelForResLoc.indexOf('AND')!=-1)){

		
		//add program res
		if(param.regulationRes.indexOf('AND')!=-1){
			temp0=param.regulationRes ;
		}
		
		arr[0]=temp0;
		
		//add program res
		if(param.locLevelNotNull.indexOf('AND')!=-1){
			temp0=temp0+" AND "+param.locLevelNotNull ;
		}
		
		
		if(param.vnForRegLoc.indexOf('AND')!=-1){
			temp0=temp0+" AND "+param.vnForRegLoc;
		}
		
		if(param.respPersonForRegLoc.indexOf('AND')!=-1){
			temp0=temp0+" AND "+param.respPersonForRegLoc;
		}
	
		arr[1]=temp0;
	}else if((type=="program")&&(param.compLevelForProgram.indexOf('AND')!=-1||param.respPersonForProgram.indexOf('AND')!=-1|| param.regprogramRes.indexOf('AND')!=-1|| param.vnForProgram.indexOf('AND')!=-1)){
		
		if(param.regprogramRes.indexOf('AND')!=-1){
			temp1=temp1+" AND "+param.regprogramRes;
		}
		
		
		arr[0]=temp1;
		
		if(param.programLevelNotNull.indexOf('AND')!=-1){
			temp1=temp1+" AND "+param.programLevelNotNull;
		}
		
		if(param.respPersonForProgram.indexOf('AND')!=-1){
			temp1=temp1+" AND "+param.respPersonForProgram;
		}
		
		if(param.vnForProgram.indexOf('AND')!=-1){
			temp1=temp1+" AND "+param.vnForProgram;
		}
	
		
		arr[1]=temp1;
	}else if((type=="requirement")&&(param.requirementRes.indexOf('AND')!=-1||param.compLevelForRequire.indexOf('AND')!=-1||param.respPersonForRequire.indexOf('AND')!=-1|| param.vnForRequire.indexOf('AND')!=-1)){
		
		if(param.requirementRes.indexOf('AND')!=-1){
			temp2=temp2+" AND "+param.requirementRes;
		}
	
		
		arr[0]=temp2;
		
		if(param.requireLevelNotNull.indexOf('AND')!=-1){
			temp2=temp2+" AND "+param.requireLevelNotNull;
		}
		
		if(param.respPersonForRequire.indexOf('AND')!=-1){
			temp2=temp2+" AND "+param.respPersonForRequire;
		}
		if(param.vnForRequire.indexOf('AND')!=-1){
			temp2=temp2+" AND "+param.vnForRequire;
		}
		arr[1]=temp2;
					
	}else if((type=="regulationAndProgram")){
		// for program tab sub sql to regulation+program +exists( select 1 from requirment)
		
		//response person
		var respPersonRes=" (( "+param.respPersonForProgram+ " ) or ( "+param.respPersonForRegLoc+" ))";
		
		//for vn
		var vnRes="( ( "+param.vnForProgram+ " ) or ( " + param.vnForRegLoc + " ) )";
		
		//for vn
		var levelRes="( ( "+param.locLevelNotNull+ " ) or ( " + param.programLevelNotNull + " ) )";
		
		var orRes=" 1=1 ";
	
		if(respPersonRes.indexOf('AND')!=-1){
			orRes=orRes+ " AND "+respPersonRes;
		}
		
		if(vnRes.indexOf('AND')!=-1){
			orRes=orRes+ " AND "+vnRes;
		}
		
		if(levelRes.indexOf('AND')!=-1){
			orRes=orRes+ " AND "+levelRes;
		}
	
		var res=param.regulationRes+" AND " +param.regprogramRes;
		arr[0]=res;
		//from console restriction 
		res=param.regulationRes+" AND " +param.regprogramRes +" AND  ( "+orRes+")";
		arr[1]=res;
	}
	
	//Not exists vn_id ,resp_person field value ,so we need use or clause.
	if(arr[0]==arr[1]){
		arr[2]='noOr';
	}
	
	return arr;
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
 * Private get regulation restriction by we give sql value
 */
function getRegulationSubSqlString(regulationSqlPart,programSqlPart,requirementSqlPart){
	var sqlStr=getRequirementExistsStringForProgram(requirementSqlPart);
		
	if(sqlStr.indexOf('AND')!=-1){
		programSqlPart=sqlStr+" AND "+programSqlPart;
	}
	
	return regulationSqlPart+" AND "+getProgramExistsStringForRegulation(programSqlPart);
}

/**
 * Private get sub query exists program for regulation
 */
function getProgramExistsStringForRegulation(str){
	var sqlStr=" 1=1 ";
	if(str.indexOf('AND')!=-1){
		sqlStr=" EXISTS(SELECT 1 FROM regprogram WHERE regprogram.regulation=regloc.regulation AND  regprogram.reg_program=regloc.reg_program AND "+str+")";
	}
	
	return sqlStr;
}

/**
 * Private get sub query exists requirement for program
 */
function getRequirementExistsStringForProgram(str){
	
	var sqlStr=" 1=1 ";
	if(str.indexOf('AND')!=-1){
		sqlStr="  EXISTS(SELECT 1 FROM regrequirement WHERE regrequirement.regulation=regloc.regulation AND regrequirement.reg_program=regloc.reg_program  AND regrequirement.reg_requirement=regloc.reg_requirement AND "+str+" )";
	}
	return sqlStr;
}

/**
 * Generate restriction from console for tree and center tabs except
 */
function generateConsoleRestriction(){
	var param=controllerConsole.parameters;

	//regloc.comp_level if not null; else if regloc.reg_requirement is not null then regrequirement.comp_level
	//if not null; else if regloc.regprogram is not null then regprogram.comp_level if not null; else no match.
	//Restriction for tree and center tabs except two tab ,regulation ,program tabs.
	
	var compLevelForRes=" (( "+param.compLevelForResLocOfTree+ " ) or ( regloc.comp_level IS NULL AND "+ param.compLevelForRequireOfTree+ " ) or ( regloc.comp_level IS NULL AND regrequirement.comp_level IS NULL AND "+param.compLevelForProgramOfTree+" ))";

	//response person
	var vnRes=" (( "+param.vnForRegLocOfTree+ " ) or ( regloc.vn_id IS NULL AND "+param.vnForRequireOfTree+ " ) or ( regloc.vn_id IS NULL AND regrequirement.vn_id IS NULL AND "+param.vnForProgramOfTree+" ))";
	
	//for vn
	var respPersonRes="( ( "+param.respPersonForRegLocOfTree+ " ) or (  regloc.resp_person IS NULL AND " + param.respPersonForRequireOfTree + " ) or ( regloc.resp_person IS NULL AND regrequirement.em_id IS NULL AND " + param.respPersonForProgram + " ) )";
	var orRes=" 1=1 ";
		
	if(respPersonRes.indexOf('AND')!=-1){
		orRes=orRes+ " AND "+respPersonRes;
	}
	
	if(vnRes.indexOf('AND')!=-1){
		orRes=orRes+ " AND "+vnRes;
	}
	
	//from console restriction 
	var res=compLevelForRes+" AND "+param.regulationRes+" AND " +param.regprogramRes +" AND "+param.regRequirementResOnlyForComplianceByLocRes+" AND  ( "+orRes+")";
	
	//from visual field location restriction
	if(View.locationRestriction!=''&&View.locationRestriction!=undefined){
		res=" 1=1 "+View.locationRestriction+" AND "+res;
	}

	
	return res;
}