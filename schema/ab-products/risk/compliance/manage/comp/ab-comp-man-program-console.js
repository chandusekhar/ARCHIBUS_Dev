/**
* @inherit console ab-comp-rpt-drilldown-console.js 
*  different: missed part of fields.
* @author Song
*/
var manageConsole = controllerConsole.extend({
	
    afterInitialDataFetch: function(){
    	
    	this.regulationFieldsArraysForRes = new Array(['regprogram.regulation','=','regulation.regulation']);
		
		this.regprogramFieldsArraysForRes = new Array(['regprogram.reg_program'],['regprogram.regprog_cat'],
				['regprogram.regprog_type'],  ['regprogram.status'],['regprogram.em_id'],
				['regprogram.project_id']);
				
		this.regRequirementResOnlyForComplianceByLocRes = new Array(
				['regrequirement.em_id'],['regrequirement.vn_id']);
 
    }
	
});