/**
 * for View : Expired License/Permit Count
 */
var customConsoleController = consoleController.extend({

	//compliance level restriction
	complianceLevelRestriction : ' 1=1 ',
	
	/**
	 * Get compliance level restriction from console values.
	 * Compliance Level = regloc.comp_level, else regloc.comp_level_calc, else regrequirement.comp_level,
	 *  else regrequirement.comp_level_calc, else regprogram.comp_level, else regprogram.comp_level_calc . 
	 */
	getComplianceLevelRestriction : function() {
		
		if(abCompRptProLvlRegtController.isRegulationLocation){
			var calculatedField = " (CASE WHEN regloc.comp_level IS NULL THEN regloc.comp_level_calc " +
			" WHEN regloc.comp_level_calc IS NULL THEN  regrequirement.comp_level" +
			" WHEN regrequirement.comp_level IS NULL THEN  regrequirement.comp_level_calc" +
			" WHEN regrequirement.comp_level_calc IS NULL THEN regprogram.comp_level " +
			" ELSE regprogram.comp_level_calc END) ";
			
			var complianceLevelRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
					new Array(['regloc.comp_level','=',calculatedField]));
			
			return complianceLevelRestriction;
		}else{
			/*
			 * since consoleController.getComplianceLevelRestriction() was called itself not extend method. copy the method body as a solution.
			 * below was copy from View: ab-comp-drilldown-common-console.js, method : getComplianceLevelRestriction()
			 */
			var calculatedField = ' ${sql.isNull(\'(case when regrequirement.comp_level IS NULL THEN regprogram.comp_level ELSE regrequirement.comp_level END)\', "\'Not Entered\'")} ';
			
			var complianceLevelRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
	                new Array(['regloc.comp_level','=',calculatedField]));
			
			return complianceLevelRestriction;
		}
		
	}
});