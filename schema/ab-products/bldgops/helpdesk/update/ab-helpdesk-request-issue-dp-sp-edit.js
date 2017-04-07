var helpdeskRequestIssuedpController = View.createController("helpdeskRequestIssuedpController",{
	
	afterViewLoad: function(){
//		var tabs=View.getOpenerView().tabs;
//		var activityLogIdValue=tabs.activityLogIdValue;
//		var restriction = new Ab.view.Restriction();
//		restriction.addClause('activity_log.activity_log_id', activityLogIdValue, '=');
//		var record = this.updateDs_0.getRecord(restriction);
//		this.updatePanel.setRecord(record);
	},
	afterInitialDataFetch: function(){
		var tabs = View.getControlsByType(parent, 'tabs')[0];
		this.updatePanel.addParameter("activity_log_id",tabs.activityLogIdValue);
		this.updatePanel.refresh();
	}
});
/**
* Issue request
* Called by 'Issue' button
* @param {String} formName form submitted
*/
function onIssueRequest(){	
	//var record = gettingRecordsData(document.forms[formName]);                     
    
    var panel = View.panels.get("updatePanel");
    //var activityLogId = panel.getFieldValue("activity_log.activity_log_id");
    var record = ABHDC_getDataRecord2(panel);

	var tabs = View.getControlsByType(parent, 'tabs')[0];

	var assignmentObject = tabs.newAssignment;

	var activityLogIdValue = tabs.activityLogIdValue;

	var requestDate = tabs.requestDate;
    
	try {
		var result = null;
			if(requestDate!=null&&requestDate<new Date()){
				requestDate = dateFormat(getCurrentDate());
			result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAllForPastDate', 
					parseInt(activityLogIdValue), record, requestDate,assignmentObject,false);
		}else{
			 result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueAll', 
					parseInt(activityLogIdValue), record, requestDate,assignmentObject,false);
		}
		View.getOpenerView().tabs.selectTab("select");
	}catch(e){
		Workflow.handleError(e);
	}

}

/**
* Cancel request
* Called by 'Cancel' button
* @param {String} formName form submitted
*/
function onCancelRequest(formName){	
	
	var panel = View.panels.get("updatePanel");
    var record = ABHDC_getDataRecord2(panel);

    var activityLogIdValue = panel.getFieldValue("activity_log.activity_log_id");

	var tabs = View.getControlsByType(parent, 'tabs')[0];

	try {
		var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-cancelAll',
				parseInt(activityLogIdValue), record, tabs.originalAssignments,tabs.requestDate);
		View.getOpenerView().tabs.selectTab("select");
	}catch(e){
		Workflow.handleError(e);
	}
}

/**
* Stop request
* Called by 'Stop' button
* @param {String} formName form submitted
*/
function onStopRequest(formName){	
	
	var panel = View.panels.get("updatePanel");
    var record = ABHDC_getDataRecord2(panel);
	
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-stopRequest', record);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		View.getOpenerView().tabs.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}

/**
* Complete request
* Called by 'Complete' button
* @param {String} formName form submitted
*/
function onCompleteRequest(){

	var panel = View.panels.get("updatePanel");
    var record = ABHDC_getDataRecord2(panel);
    
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-completeRequest', record);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		View.getOpenerView().tabs.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}
/**
 * private method, return date format mm/dd/yyyy 
 * @param dateStr
 * @returns
 */
function dateFormat(dateStr){
	if(dateStr!=null&&dateStr!='')
	  return dateStr.split("/")[2]+"-"+dateStr.split("/")[0]+"-"+dateStr.split("/")[1];
	else 
	  return "";
}
/**
 * return current date
 * @returns {String}
 */
function getCurrentDate(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    
//    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
    return  ((month < 10) ? "0" : "") + month + "/" + ((day < 10) ? "0" : "") + day + "/" +year ;
}