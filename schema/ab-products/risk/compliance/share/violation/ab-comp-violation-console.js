/**
*
* Shared Compliance Violation Console , used in :

* 1.	Manage Compliance Violations View
* 2.  Operational Report - Compliance Violations 
*
* @author Zhang Yi
*/
var abCompViolationConsoleController = View.createController('abCompViolationConsoleController',
{
	consoleRes: " 1=1 ",
	violationRes:" 1=1 ",
	progRes:" 1=1 ",
	reqRes:" 1=1 ",
	locRes:" 1=1 ",
	
	violationFieldsArraysForRes: new Array(['regviolation.regulation'], ['regviolation.reg_program'], ['regviolation.reg_requirement'], 
		['regviolation.violation_id'], ['regviolation.violation_type'], ['regviolation.authority'],
		 ['virtual_severity', 'pscope', 'regviolation.severity'] ),
	
	requirementFieldsArraysForRes: new Array(['regrequirement.regreq_type']),	
		
	programFieldsArraysForRes: new Array(['regprogram.project_id']),
	
	mixFieldsArraysForRes: new Array(['comp_level'], ['priority'],['contact_id']),	
	
	/**
	 * Events Handler for 'Show' action on console 
	 */
	abCompViolationConsole_onShow: function(){
		this.consoleRes = " 1=1 ";

		//get normal restriction  from console
		this.violationRes = getRestrictionStrFromConsole(this.abCompViolationConsole, this.violationFieldsArraysForRes);
		this.progRes = getRestrictionStrFromConsole(this.abCompViolationConsole, this.programFieldsArraysForRes);
		this.reqRes = getRestrictionStrFromConsole(this.abCompViolationConsole, this.requirementFieldsArraysForRes);
		
		var compLevel = this.abCompViolationConsole.getFieldValue("regrequirement.comp_level") ;
		if(compLevel ){
			var levelRes = getMultiSelectFieldRestriction(new Array(['regrequirement.comp_level']), compLevel);
			this.consoleRes += " AND (  "+levelRes +" or  "+levelRes.replace("regrequirement", "regprogram")+" ) " ;			
		}

		var contactId = this.abCompViolationConsole.getFieldValue("regrequirement.contact_id") ;
		if(contactId ){
			var contactRes = getMultiSelectFieldRestriction(new Array(['regrequirement.contact_id']), contactId);
			this.consoleRes += " AND (  "+contactRes +" or  "+contactRes.replace("regrequirement", "regprogram")+" ) " ;			
		}

		var priorityValue=$("virtual_priority").value;
		var inSql = "";
		if(priorityValue==0){
						inSql = " (1,2,3) "
		} else  if(priorityValue==1){
			inSql = " (4,5,6) "
		} else  if(priorityValue==2){
			inSql = " (7,8,9) "
		}
		if(inSql){
			this.consoleRes += " AND  ( regrequirement.priority IN " +inSql +" or regprogram.priority IN "+inSql+" )" ;	
		}

		var dateRes =  getDatesRestrictionFromConsole(this.abCompViolationConsole, new Array( ['regviolation.date_assessed'] ) );

		this.consoleRes += " AND " + dateRes + " AND " + this.violationRes + " AND "+this.progRes+ " AND " +this.reqRes;

		//location restriction.
		if(View.locationRestriction){
			this.consoleRes = this.consoleRes  + " and exists (select 1 from compliance_locations " 
				+	"where regviolation.location_id = compliance_locations.location_id "
				+ View.locationRestriction+")";
		}

		//if loaded in Manage view, get select controller of first tab and call refresh function
		var selectController=View.controllers.get("abCompViolationSelectController");
		if(selectController){
			selectController.onRefresh(this.consoleRes);

		} 
		// else loaded in Operational report, refresh the grid
		else {
			var index = View.controllers.length;
			var parentController = View.controllers.get(index-1);
			parentController.onFilter(this);
		}
    },

	 /**
      * event handle when search button click.
      */
	abCompViolationConsole_onClear: function(){
		this.abCompViolationConsole.clear();
		$("virtual_location").value="";
		View.locationRestriction = "";

		//set custom dropdown list to select none 
		setOptionValue("virtual_priority",-1);
		setOptionValue("virtual_severity",-1);
	}

});