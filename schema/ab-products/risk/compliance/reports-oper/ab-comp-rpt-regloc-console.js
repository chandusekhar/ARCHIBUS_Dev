var reportReglocController =controllerConsole.extend({
	/**
	 * Get restriction for vn
	 * WHERE regloc.field IN (list)  OR (regloc.field IS NULL AND regrequirement.field IN (list)) 
	 * OR (regloc.field IS NULL AND regrequirement.field IS NULL AND regprogram.field IN (list))
	 */

	/**
	 * Get restriction for vn
	 */
	getVnRespComplevelResForRequireOrProgram:function(type,currentFieldClause,fieldName){
		if(currentFieldClause.indexOf('AND')!=-1){
			var fieldNameForRegloc = fieldName;
			if(fieldName=='em_id'){
				fieldNameForRegloc = 'resp_person';
			}
			if(type=='requirement'){
				return "regloc."+fieldNameForRegloc+"  is null AND  "+currentFieldClause;				
			}else if(type=='program'){
				
				return " regloc."+fieldNameForRegloc+" is null AND  (exists( select 1 from regrequirement  " +
				" where regloc.regulation=regrequirement.regulation AND regloc.reg_program=regrequirement.reg_program " +
				" AND  regloc.reg_requirement=regrequirement.reg_requirement AND " +
				" regrequirement."+fieldName+"  is null ) or not exists( select 1 from regrequirement  " +
				" where regloc.regulation=regrequirement.regulation AND regloc.reg_program=regrequirement.reg_program " +
				" AND  regloc.reg_requirement=regrequirement.reg_requirement) )" +
				"  AND "+currentFieldClause;
			}else{
				return currentFieldClause;
			}
	
		}else{
			return currentFieldClause;
		}
	}
	

});