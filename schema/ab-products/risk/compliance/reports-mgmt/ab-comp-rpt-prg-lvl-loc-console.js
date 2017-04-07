/**
 * For Compliance Requirements Count by Compliance Level and Location, the console filter for fields compliance level, 
 * location and response person and vendor code are special, so extend the shared console controller to implement special logic
 * 
 * @author Guo Jiangtao
 */

var complianceLevelAndLocationConsole = regprogramConsoleController.extend({
	
	//compliance level restriction
	complianceLevelRestriction : ' 1=1 ',
	
	/**
	 * get restriction from console values, excluding compliance level restriction. 
	 * For compliance level restriction, add single variable to store 
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
		
		var dateRestriction = this.getDateRestriction();
		
		
		this.consoleRestriction = regulationRestriction + ' AND ' + regprogramRestriction + ' AND ' + regrequirementRestriction 
		      + ' AND ' + responsiblePersonAndVnRestriction  + ' AND ' + locationRestriction  +' AND (' +dateRestriction+")";

		this.complianceLevelRestriction = this.getComplianceLevelRestriction();
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
		
		var calculatedField =  ' (CASE WHEN progloc_lvl IS NOT NULL THEN progloc_lvl  '
			  +  ' WHEN reqloc_avg_lvl_loc IS NOT NULL THEN reqloc_avg_lvl_loc '
			  +  ' WHEN prog_lvl IS NOT NULL THEN prog_lvl '
			  +  ' WHEN prog_lvl_calc IS NOT NULL THEN prog_lvl_calc   '
			  +  ' ELSE  \'Not Entered\' END )';
		
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
	                new Array(['regloc.resp_person','=','regloc.resp_person'])) +') OR ('+
				
				getRestrictionStrFromConsole(this.abCompDrilldownConsole,
		                new Array(['regloc.resp_person','=','regprogram.em_id'])) +') )';
		
		//Vendor Code restriction
		var vnRestriction = '(('+
			getRestrictionStrFromConsole(this.abCompDrilldownConsole,
	                new Array(['regloc.vn_id','=','regloc.vn_id'])) +') OR ('+
			
				getRestrictionStrFromConsole(this.abCompDrilldownConsole,
		                new Array(['regloc.vn_id','=','regprogram.vn_id'])) +'))';
		
		return responsiblePersonRestriction+ ' AND ' + vnRestriction;
		
	}
	
});