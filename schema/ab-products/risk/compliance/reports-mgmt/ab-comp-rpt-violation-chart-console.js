/**
 * For Compliance Violations Count , the console filter for fields compliance level, 
 * location and response person and vendor code are special, so extend the shared console controller to implement special logic
 * 
 * @author Guo Jiangtao
 */

var violationChartConsole = consoleController.extend({
			
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
	                new Array(['regloc.comp_level','=','regprogram.comp_level'])) +') OR ('+
	                
	                getRestrictionStrFromConsole(this.abCompDrilldownConsole,
	    	                new Array(['regloc.comp_level','=','regrequirement.comp_level'])) + '))';
		
		
		return complianceLevelRestriction;
		
	}
});