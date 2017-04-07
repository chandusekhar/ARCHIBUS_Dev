
/**
* Description:
* ABHDRAC is the abbreviation for ab-helpdesk-request-approval-common
**/
function ABHDRAC_handleApprovalFields(tableName,approvalPanel,statusPanel){
		
	if(!valueExists(approvalPanel)
		|| !valueExists(tableName)
		|| !valueExists(statusPanel)){
		alert("the approvalPanel parameter is invalid!");
		return;	
	}
	
	var element = approvalPanel.getFieldElement(tableName + ".ac_id");
	if(element.value == ''){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	element = approvalPanel.getFieldElement(tableName + ".po_id");
	if(element.value == ''||element.value == '0'){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	element = approvalPanel.getFieldElement(tableName + ".cost_estimated");
	if(element.value == ''||element.value == '0.00'){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	element = approvalPanel.getFieldElement(tableName + ".cost_to_replace");
	if(element.value == ''||element.value == '0.00'){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	element = approvalPanel.getFieldElement(tableName + ".cost_cat_id");
	if(element.value == ''){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	//------------------------------------------------------------------
	var approval_type = approvalPanel.getFieldValue(tableName + "_step_waiting.step");
	var status = statusPanel.getFieldValue(tableName + ".status");
	
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getRequiredFieldsForStep', approval_type,status);
	}catch(e){
		Workflow.handleError(e);	
	}
	

	if(result.code == 'executed'){
		var res = eval('('+result.jsonExpression+')');
		for(i=0;i<res.length;i++){
			field = approvalPanel.getFieldElement(tableName + "." + res[i].field);
			//field.parentNode.parentNode.removeAttribute("style") ;
			if(valueExists(field)){
				field.parentNode.parentNode.style.display = '';
			} 
		}	
	} else{
		Workflow.handleError(result);	
	}	
}

function ABHDRAC_approveRequest(requestPanel){

	var record = ABHDC_getDataRecord2(requestPanel);     
	var comments = $("comments").value;
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record,comments);
	}catch(e){
		Workflow.handleError(e);
	}
		
	if(result.code == 'executed'){
		var tabs = View.getOpenerView().panels.get("helpDeskRequestApprovalTabs"); 
	    if (tabs != null) {
        	tabs.selectTab("select",null,false,false,false);
	    }
	} else {
		Workflow.handleError(result);
	}	
}

function ABHDRAC_reviewRequest(requestPanel){
	
	var record = ABHDC_getDataRecord2(requestPanel);
	var comments = $("comments").value;
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-reviewRequest',record,comments);
	} catch(e){
		Workflow.handleError(e);
	}
	
	if(result.code == 'executed'){
		var tabs = View.getOpenerView().panels.get("helpDeskRequestApprovalTabs"); 
	    if (tabs != null) {
        	tabs.selectTab("select",null,false,false,false);
	    }
	} else {
		Workflow.handleError(result);
	}	
}

function ABHDRAC_forwardApproval(approvalPanel,requestPanel){
		
	var forwardTo = approvalPanel.getFieldValue("activity_log.approved_by");
	approvalPanel.setFieldValue("activity_log.approved_by",'');
	
	var record = ABHDC_getDataRecord2(requestPanel);     
	var comments = $("comments").value;
    
    if (forwardTo == '') {
    	alert(getMessage('forwardToMissing'))
    	return;
    }
    
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-forwardApproval', record,comments,forwardTo);
	}catch(e){
		Workflow.handleError(e);
	}
	 
	if(result.code == 'executed'){
		var tabs = View.getOpenerView().panels.get("helpDeskRequestApprovalTabs"); 
	    if (tabs != null) {
        	tabs.selectTab("select",null,false,false,false);
	    }
	} else {
		Workflow.handleError(result);
	}
}
	
function ABHDRAC_rejectRequest(requestPanel){
	
	var record = ABHDC_getDataRecord2(requestPanel);     
	var comments = $("comments").value;

	//KB3021309 - Comments required when rejecting a request
	if(!valueExistsNotEmpty(comments)){
		View.showMessage(getMessage('noCommentsForReject'));
		return;
	}
    
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record,comments);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		var tabs = View.getOpenerView().panels.get("helpDeskRequestApprovalTabs"); 
	    if (tabs != null) {
        	tabs.selectTab("select",null,false,false,false);
	    }
	} else {
		Workflow.handleError(result);
	}
}