/**
* @inherit console ab-comp-rpt-drilldown-console.js 
*  different: missed part of fields.
* @author Song
*/
var manageConsole = controllerConsole.extend({
	
    afterInitialDataFetch: function(){
    	
    	this.regulationFieldsArraysForRes = new Array(['regrequirement.regulation','=','regulation.regulation']);
		
		this.regprogramFieldsArraysForRes = new Array(
				['regprogram.project_id']);
				
		this.regRequirementResOnlyForComplianceByLocRes = new Array(['regrequirement.reg_requirement'],['regrequirement.regreq_cat'],
				['regrequirement.regreq_type'], ['virtual_prioriry', 'pscope', 'regrequirement.priority', 'regprogram.priority'], ['regrequirement.status'], ['regrequirement.reg_program']);
 
    }
	
});