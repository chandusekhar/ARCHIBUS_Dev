var helpdeskRequestIssueEditController = View.createController("helpdeskRequestIssueEditController",{
	
	afterViewLoad: function(){
		var tabs=View.getOpenerView().tabs;
		
	},
	/**
     * private method,only use for approve
     * get assigned employee list.
     */
    getMoveRecords: function(activityLogIdValue){
    	var dsRmpct = View.dataSources.get("ds_for_get_date_use_by_js");
        dsRmpct.addParameter('activity_log_id',activityLogIdValue);
	    return dsRmpct.getRecords();
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

	var assignmentObject = tabs.assignments;

	var activityLogIdValue = tabs.activityLogIdValue;

	var requestDate = tabs.dateEnd;
    
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
		changeTab(activityLogIdValue,tabs,"select");
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
		changeTab(activityLogIdValue,tabs,"select");
	}catch(e){
		Workflow.handleError(e);
	}
}

/**
 * private method
 */
function changeTab(activityLogIdValue,tabs,tabName){
	var restriction = new Ab.view.Restriction();
    restriction.addClause("activity_log.activity_log_id", activityLogIdValue);
    tabs.selectTab(tabName, restriction, false, false, false);
}
/**
* Stop request<br />
* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#stopRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-stopRequest</a><br />
* Reloads select tab<br />
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
* Complete request<br />
* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#completeRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-completeRequest</a><br />
* Reloads select tab<br />
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