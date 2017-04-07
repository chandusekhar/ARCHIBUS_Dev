/**
* @inherit console ab-comp-rpt-drilldown-console.js 
*  different: missed part of fields.
* @author Song
*/
var manageConsole = controllerConsole.extend({
	
    afterInitialDataFetch: function(){
    	
    	this.regulationFieldsArraysForRes = new Array(['regrequirement.regulation','=','regulation.regulation']);
		
		this.regprogramFieldsArraysForRes = new Array(['regrequirement.reg_program','=','regprogram.reg_program'], ['regprogram.status']);
				
		this.regRequirementResOnlyForComplianceByLocRes = new Array(['regrequirement.reg_requirement'],
				['regrequirement.regreq_type'],  ['regrequirement.status']);
    							
    }
	
});