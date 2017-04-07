/**
 * for View : Missed and Overdue Events
 */
var customConsoleController = consoleController.extend({
	
	//compliance level restriction
	complianceLevelRestriction : ' 1=1 ',


    	
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
			
			getRestrictionStrFromConsole(this.abCompDrilldownConsole,
	                new Array(['regloc.comp_level','=','regrequirement.comp_level'])) +') OR (regrequirement.comp_level IS NULL AND '+
	                
	                getRestrictionStrFromConsole(this.abCompDrilldownConsole,
	    	                new Array(['regloc.comp_level','=','regprogram.comp_level'])) + '))';
		
		return complianceLevelRestriction;
		
	},
	
	/**
	 * get Responsible Person and Vendor Code restriction from console values.
	 */
	getResponsiblePersonAndVnRestriction : function() {
		
		//Responsible Person restriction
		var responsiblePersonRestriction = '('+
			
			getRestrictionStrFromConsole(this.abCompDrilldownConsole,
	                new Array(['regloc.resp_person','=','activity_log.manager'])) +')';
		
		//Vendor Code restriction
		var vnRestriction = '('+
		
		getRestrictionStrFromConsole(this.abCompDrilldownConsole,
                new Array(['regloc.vn_id','=','activity_log.vn_id'])) +')';
		
		return responsiblePersonRestriction+ ' AND ' + vnRestriction;
		
	}
});