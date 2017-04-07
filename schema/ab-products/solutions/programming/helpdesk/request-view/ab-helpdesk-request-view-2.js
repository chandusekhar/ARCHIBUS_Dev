/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-view.axvw' target='main'>ab-helpdesk-request-view.axvw</a>
 */
var lastStepType;

function user_form_afterSelect() {
	var controller = View.controllers.get('requestView');
	controller.afterSelect();
}

View.createController('requestView', {

    tableName: 'activity_log',
	
	requestId: '',

    afterViewLoad: function() { 
        this.tableName = getMessage('tableName');
    },
    
	afterSelect: function() {
		var request = this.requestDs.getRecord(View.parentTab.restriction);
		var requestId = request.getValue(this.tableName + ".activity_log_id");
		if (requestId === this.requestId) {
			return;
		}
		this.requestId = requestId;
		
		this.panelRequest.setRecord(request);
        this.panelLocation.setRecord(request);
        this.panelEquipment.setRecord(request);
        this.panelDescription.setRecord(request);
        this.panelPriority.setRecord(request);
        this.panelCosts.setRecord(request);
        this.panelSatisfaction.setRecord(request);

        this.panelRequest.show();
        this.panelLocation.show();
        this.panelEquipment.show();
        this.panelDescription.show();
        this.panelPriority.show();
        this.panelHistory.show();
        this.panelCosts.show();
        this.panelSatisfaction.show();

        this.panelDocuments.refresh(View.parentTab.restriction);
		
        //var quest = new Ab.questionnaire.Quest(requestId, true);

		var act_type = request.getValue(this.tableName + ".activity_type");
		if (act_type != null) {
			var quest = new Ab.questionnaire.Quest(act_type,'panelDescription', true);
			quest.showQuestions();
		}
		
		var steps = this.getStepInformation(this.tableName, 'activity_log_id', requestId);
		this.getLastStepType(steps);
		
		this.showPriorityLevel(this.tableName, 'activity_log_id', this.panelRequest);

        View.log('Request view loaded');
	},
    
	/**
	 * Retrieve step information for a given request (from wr or activity_log)<br />
	 * 
	 * This function is called while loading the form<br />
	 * The step log information is shown on the current form in the panel with id 'panel_history' in the table with id 'history' using dynamic HTML<br />
	 * Calls WFR <a href='../../javadoc/com/archibus/eventhandler/steps/StepHandler.html#getStepInformation(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getStepInformation</a><br />
	 * The jsonExpression returned by this workflow rule is parsed to create the history table.
	 * @param {String} table Workflow table
	 * @param {String} field Primary key field
	 * @param {int} pkey Primary key value
	 * @param {boolean} show Show the step history table or not
	 */
	getStepInformation: function(table,field,pkey) {
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', table,field,pkey);
			//<eventHandler class="com.archibus.eventhandler.steps.StepHandler" method="getStepInformation">
	        var apps = result.data;
            if (apps.length == 0) {
				this.panelHistory.show(false, true);
            } else {        
                this.panelHistory.show(true, true);
				
				$('history').innerHTML = '';
				
                //table headers
                var header = document.getElementById('history').createTHead();
                var x = header.insertRow(0);
                x.className = "headerRow";
                
                var user = document.createElement("th");
                user.className = "headerTitleText";
                user.innerHTML = getMessage("user"); 
                x.appendChild(user);
                
                var date = document.createElement("th");
                date.className = "headerTitleText";
                date.innerHTML = getMessage("on"); 
                x.appendChild(date);
                
                var type = document.createElement("th");
                type.className = "headerTitleText";
                type.innerHTML = getMessage("step"); 
                x.appendChild(type);
                
                var basicstatus = document.createElement("th");
                basicstatus.className = "headerTitleText";
                basicstatus.innerHTML = getMessage("status"); 
                x.appendChild(basicstatus);
                
                var stepstatus = document.createElement("th");
                stepstatus.className = "headerTitleText";
                stepstatus.innerHTML = getMessage("stepstatus"); 
                x.appendChild(stepstatus);
                
                var comments = document.createElement("th");
                comments.className = "headerTitleText";
                comments.style.width = "50%";
                comments.innerHTML = getMessage("comments"); 
                x.appendChild(comments);
                
                for (i=0;i<apps.length;i++){
                    //use dynamic html to enter step information in a table
                    var row=document.getElementById('history').insertRow(1);
                    var y=row.insertCell(0);
                    var z=row.insertCell(1);
                    var a=row.insertCell(2);
                    var d=row.insertCell(3)
                    var b=row.insertCell(4);
                    var c=row.insertCell(5);
                    
                    var user = "";
                    if(apps[i].user_name != undefined) user = apps[i].user_name;
                    if(apps[i].em_id != undefined && apps[i].em_id != "") user = apps[i].em_id;
                    if(apps[i].vn_id != undefined && apps[i].vn_id != "") user = apps[i].vn_id;
                    y.innerHTML= user;
                    
                    if(apps[i].date_response =="" && apps[i].time_response == ""){
                        datetime = getMessage("pending");
                    } else {
                        datetime = apps[i].date_response + " " + apps[i].time_response;
                    }
                    z.innerHTML=datetime;
                    if(apps[i].step != undefined) a.innerHTML=apps[i].step;
                    if(apps[i].status != undefined) d.innerHTML=apps[i].status;
                    if(apps[i].step_status_result != undefined) b.innerHTML=apps[i].step_status_result;
                    if(apps[i].comments != undefined) c.innerHTML=apps[i].comments;             
                }
                
                toprow = document.getElementById('history').insertRow(0);
                toprow.className = "space";
                topspace = toprow.insertCell(0);
                topspace.setAttribute("colspan","6");
                topspace.className = "formTopSpace";
                
                bottomrow = document.getElementById('history').insertRow(apps.length +2);
                bottomrow.className = "space";
                bottomspace = bottomrow.insertCell(0);
                bottomspace.setAttribute("colspan","6");             
                bottomspace.className = "formBottomSpace";
	        }
	        return apps;
	    } catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * get last step type
	 */
	getLastStepType:function(steps){
		if (steps && steps.length > 0) {
			var lastStep = steps[0];
			if (lastStep.date_response == "") {
				//lastStepLogId = lastStep.step_log_id;
				lastStepType = lastStep.step_type;
			}
		}
	},

	/**
	* Shows priority (number) with priority label (description) for a request<br />
	* This function is called while loading the form<br />
	* Calls WFR <a href='../../javadoc/com/archibus/eventhandler/SLA/ServiceLevelAgreementHandler.html#getSLAConditionParameters(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getSLAConditionParameters</a>.
	* @param {String} tableName request table (wr or activity_log)
	* @param {String} fieldName primary key field
	*/
	showPriorityLevel: function(tableName, fieldName, panel) {
		var record = ABHDC_getDataRecord2(panel);
	    
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAConditionParameters', tableName, fieldName, record); 
            var params  = result.data;

	        var priority_level = record[tableName+".priority"];
	
	        if(priority_level == 1){
	            pr = priority_level + " : " + params.priority_level_1;
	        } else if (priority_level == 2){
	            pr = priority_level + " : " + params.priority_level_2;
	        } else if (priority_level == 3){
	            pr = priority_level + " : " + params.priority_level_3;
	        } else if (priority_level == 4){
	            pr = priority_level + " : " + params.priority_level_4;
	        } else if (priority_level == 5){
	            pr = priority_level + " : " + params.priority_level_5;
	        }
	        document.getElementById("priority").innerHTML = pr;
	    } catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Opens new dialog for satisfaction survey for current request<br />
	 * Called by button 'Satisfaction Survey' which is only shown when the request status is 'Completed'
	 */
	panelRequest_onVerification: function() {
	    if (lastStepType && lastStepType.match("verification")) {
	        var activity_log_id = document.getElementById(this.tableName + ".activity_log_id").value;
	        
	        var restriction = new Ab.view.Restriction();
	        restriction.addClause("activity_log_step_waiting.activity_log_id", activity_log_id, '=');
	        restriction.addClause("activity_log_step_waiting.step_log_id", lastStepLogId, '=');
	        View.openDialog("ab-helpdesk-request-verification.axvw", restriction, false, 10, 10, 500, 200);
	        
	    }
	    else {
	        alert(getMessage("verificationNotAllowed"));
	    }
	},
	
	/**
	 * Opens new dialog for satisfaction survey for current request<br />
	 * Called by button 'Satisfaction Survey' which is only shown when the request status is 'Completed'
	 */
	panelRequest_onSurvey: function() {
        if (lastStepType && lastStepType.match("survey")) {
            var activity_log_id = document.getElementById(this.tableName + ".activity_log_id").value;
            
            var restriction = new Ab.view.Restriction();
            restriction.addClause("activity_log_step_waiting.activity_log_id", activity_log_id, '=');
            restriction.addClause("activity_log_step_waiting.step_log_id", lastStepLogId, '=');
            View.openDialog("ab-helpdesk-request-satisfaction.axvw", restriction, false);
        }
        else {
            alert(getMessage("surveyNotAllowed"));
        }
	},
	
	/**
	 * Opens window with workorder or work request for current action item<br />
	 * Called by 'Show Related On Demand Work' button<br />
	 * Opened dialog depends on whether a work request or a work order is linked to the action item (i.e. wr_id or wo_id given)
	 */
	panelRequest_onShowOnDemand: function() {
	    if (document.getElementById(this.tableName + ".wr_id").value == "" && document.getElementById(this.tableName + ".wo_id").value == "") {
	        alert("No workorder or work request for this request");
	    }
	    else {
	        if (document.getElementById(this.tableName + ".wr_id").value != "") {
	            var restriction = new Ab.view.Restriction();
	            restriction.addClause("wr.wr_id", parseInt(document.getElementById(this.tableName + ".wr_id").value), '=');
	            View.openDialog("ab-helpdesk-request-ondemand-wr.axvw", restriction, false);
	        }
	        else if (document.getElementById("activity_log.wo_id").value != "") {
	            var restriction = new Ab.view.Restriction();
	            restriction.addClause("wo.wo_id", parseInt(document.getElementById("activity_log.wo_id").value), '=');
	            View.openDialog("ab-helpdesk-request-ondemand-wo.axvw", restriction, false);
	        }
	    }
	},
	
	/**
	 * Cancel request before it has been approved<br />
	 * This function is called by the 'Cancel' button which is only shown if the request status is 'Requested'<br />
	 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#deleteRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-deleteRequest</a> and returns to select tab
	 */
	panelRequest_onCancel: function() {
	    if (confirm(getMessage("confirmCancel"))) {
	        var record = ABHDC_getDataRecord2(this.panelRequest);
	        
	        try {
	            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-deleteRequest', record);
	            var tabs = View.getControl('', 'tabs');
	            tabs.selectTab('select', {});
	        }
	        catch (e) {
	            Workflow.handleError(e);
	        }
	    }
	}
});
