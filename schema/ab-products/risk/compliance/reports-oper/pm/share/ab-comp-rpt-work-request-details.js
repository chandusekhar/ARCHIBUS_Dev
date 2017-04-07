/**
 * Controller of the work request detail.
 */	
View.createController('wrDetails', {
	// store location information for showing floor plan
	locArray:[],

	afterInitialDataFetch:function(){
		this.setPriorityLabel();

		this.getStepInfo();

		this.enableButtons();
	},

    /**
     * After initial data fetch. Enable or disable related buttons.
     */	
	enableButtons: function(){
		// Disable the action [View Service Request] if the work request did not come from a service request.
		if ( this.wrRequestorDetails.getFieldValue('wrhwr.activity_log_id') ) {
			this.wrRequestorDetails.enableButton("viewSr", true);
		}
		else {
			this.wrRequestorDetails.enableButton("viewSr", false);
		}

		//Disable action [View Work Order] if the work request does not yet have a work order.
		if ( this.wrRequestorDetails.getFieldValue('wrhwr.wo_id') ) {
			this.wrRequestorDetails.enableButton("viewWo", true);
		}
		else {
			this.wrRequestorDetails.enableButton("viewWo", false);
		}

		// [Show Equipment Details] is disabled if Equipment Code is null
		if ( this.wrLocationDetails.getFieldValue('wrhwr.eq_id') ) {
			this.wrLocationDetails.enableButton("showEqDetails", true);
		}
		else {
			this.wrLocationDetails.enableButton("showEqDetails", false);
		}	
	},
	  
    /**
     * After initial data fetch. Show relevant panel.
     */	
	wrPriorityDetails_afterRefresh: function(){
		//set priority label
		this.setPriorityLabel();			
	},
	  
	 /**
		 * Check if exists my approved requests.
		 */
	setPriorityLabel: function() {
		var priorityLabel = '';
		try {
			priorityLabel = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getPriorityLable', parseInt(this.wrRequestorDetails.getFieldValue('wrhwr.wr_id'))).message;
		} 
		catch (e) {
		}
		if ( $('priority') ){
			$('priority').innerHTML = ": "+priorityLabel;
		}

		this.displaySlaInfo();
    },
		
	/**
	 * Calls WFR AbBldgOpsHelpDesk-getSLAInformation
	 * to retrieve SLA information for the new priority and shows this information on the request form
	 * change the priority and get the sla information
	 */
	displaySlaInfo: function(){
		var wrId = this.wrDetails.getFieldValue("wrhwr.wr_id");
		var ordering_seq = this.getOrderingSeq(wrId);
		var priority_level = this.wrDetails.getFieldValue("wrhwr.priority");
		var activity_type = this.wrDetails.getFieldValue("wrhwr.activity_type");
		var result ;
		try {
			result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAInformation',ordering_seq,priority_level, activity_type,-1);
		} 
		catch (e) {
			//Workflow.handleError(e);
			document.getElementById("priority").innerHTML = priority_level;
            return;
		}

		if (result.code == 'executed') {
			var SLA = eval('(' + result.jsonExpression + ')');
			var SLAinfo = "<b>" + getMessage("slainfo") + "</b>";
			
			if (SLA.time_to_respond != "" && SLA.interval_to_respond != "") {
				SLAinfo += "<br /> " + getMessage("responseRequired") + " " + SLA.time_to_respond;
				if (SLA.interval_to_respond == 'h') 
					SLAinfo += " " + getMessage("hours");
				if (SLA.interval_to_respond == 'd') 
					SLAinfo += " " + getMessage("days");
				if (SLA.interval_to_respond == 'w') 
					SLAinfo += " " + getMessage("weeks");
				if (SLA.interval_to_respond == 'm') 
					SLAinfo += " " + getMessage("months");
			}
			if (SLA.time_to_complete != "" && SLA.interval_to_complete != "") {
				SLAinfo += "<br /> " + getMessage("completionRequired") + " " + SLA.time_to_complete;
				if (SLA.interval_to_complete == 'h') 
					SLAinfo += " " + getMessage("hours");
				if (SLA.interval_to_complete == 'd') 
					SLAinfo += " " + getMessage("days")
				if (SLA.interval_to_complete == 'w') 
					SLAinfo += " " + getMessage("weeks");
				if (SLA.interval_to_complete == 'm') 
					SLAinfo += " " + getMessage("months");
			}
			if (SLA.approvals != "") 
				SLAinfo += "<br />" + SLA.approvals;
			
			if (typeof(SLA.cost) != "undefined" && SLA.cost != "") 
				SLAinfo += "<br /> " + getMessage("costInfo") + " " + SLA.cost;
			
			if (typeof(SLA.vn_id) != "undefined" && SLA.vn_id != "") 
				SLAinfo += "<br /> " + getMessage("assigned") + " " + SLA.vn_id;
			
			if (typeof(SLA.em_id) != "undefined" && SLA.em_id != "") 
				SLAinfo += "<br /> " + getMessage("assigned") + " " + SLA.em_id;
			
			if (typeof(SLA.supervisor) != "undefined" && SLA.supervisor != "") 
				SLAinfo += "<br /> " + getMessage("supervised") + " " + SLA.supervisor;
			
			if (typeof(SLA.cf_id) != "undefined" && SLA.cf_id != "") 
				SLAinfo += "<br /> " + getMessage("assigned") + " " + SLA.cf_id;
			
			if (typeof(SLA.dispatcher) != "undefined" && SLA.dispatcher != "") 
				SLAinfo += "<br /> " + getMessage("dispatched") + " " + SLA.dispatcher;
			
			document.getElementById("SLAinfo").innerHTML = SLAinfo;
		}
		else {
			Workflow.handleError(result);
		}
	},

	getOrderingSeq: function(wrId){
		var record = ABODC_getDataRecord2(this.wrDetails);
		var result = {};

		try {
			result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAConditionParameters',null,null, record);
		}catch (e) {
			//Workflow.handleError(e);
			return 	null;
		}

		if (result.code == 'executed') {
			var params = eval("(" + result.jsonExpression + ")");
			return 	params.ordering_seq;
		 }
		else {
			Workflow.handleError(result);
			return 	null;
		}
	},

	/**
     * Get step information
     */
	getStepInfo: function(){
        this.getStepInfoHelper(this.historyPanel, 'wr', 'helpdesk_step_log');
        this.getStepInfoHelper(this.hhistoryPanel, 'hwr', 'hhelpdesk_step_log');
    },
    
	/**
     * Get step information
     */
	getStepInfoHelper: function(hpanel, wrTable, stepTable){
		try {
			//call wfr to get all steps of the selected work request
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', wrTable,'wr_id',this.wrRequestorDetails.getFieldValue('wrhwr.wr_id'));
			var steps = eval('('+result.jsonExpression+')');
			
			//if no steps, hide history panel 
            if (steps.length == 0) {
                hpanel.show(false);
            }
            else {
            	//if exists steps, show history panel and refresh the history panel 
            	hpanel.show(true);
            	
            	//prepare restrition for history panel
                var restriction = new Ab.view.Restriction();
                if (steps.length == 1) {
                    restriction.addClause(stepTable+'.step_log_id', steps[0].step_log_id, "=");
                }
                else {
                    restriction.addClause(stepTable+'.step_log_id', steps[0].step_log_id, "=", ")AND(");
                    for (var i = 1, step; step = steps[i]; i++) {
                        restriction.addClause(stepTable+'.step_log_id', step.step_log_id, "=", "OR");
                    }
                }
                
                //refresh the history panel
                hpanel.refresh(restriction);
	         }
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
    /**
     * Set history field
     */
	historyPanel_afterRefresh: function(){
        this.historyPanel_afterRefresh_helper(this.historyPanel, 'helpdesk_step_log')
    },
    
	hhistoryPanel_afterRefresh: function(){
        this.historyPanel_afterRefresh_helper(this.hhistoryPanel, 'hhelpdesk_step_log')
    },

    /**
     * Set history field
     */
	historyPanel_afterRefresh_helper: function(hpanel, stepTable){
		var rows = hpanel.rows;
	    
	    var datetime = "";
	    for (var i = 0; i < rows.length; i++) {
	        var row = rows[i];
	        var user = "";
	        if (row[stepTable+'.user_name']) 
	            user = row[stepTable+'.user_name'];
	        if (row[stepTable+'.em_id']) 
	            user = row[stepTable+'.em_id'];
	        if (row[stepTable+'.vn_id']) 
	            user = row[stepTable+'.vn_id'];
	        row[stepTable+'.vn_id'] = user;
	        
	        if (row[stepTable+".date_response"] == "" && row[stepTable+".time_response"] == "") {
	            datetime = getMessage("pending");
	        }
	        else {
	            datetime = row[stepTable+".date_response"] + " " + row[stepTable+".time_response"];
	        }
	        row[stepTable+'.date_response'] = datetime;
	    }
	    hpanel.reloadGrid();
    },

	wrRequestorDetails_onViewWoDetails: function(){
		var restriction = new Ab.view.Restriction();
		var woId = this.wrRequestorDetails.record.getValue('wrhwr.wo_id');
		restriction.addClause('wohwo.wo_id', woId);
		View.openDialog('ab-comp-rpt-work-order-details.axvw', restriction, false, {
			width: 1024, 
			height: 800, 
			closeButton: true 
		});
	},
	
	wrRequestorDetails_onViewSr: function(){
		var restriction = new Ab.view.Restriction();
		var id = this.wrRequestorDetails.record.getValue('wrhwr.activity_log_id');
		restriction.addClause('activity_log_hactivity_log.activity_log_id', id);
		View.openDialog('ab-comp-rpt-service-request-details.axvw', restriction, false, {
			width: 1024, 
			height: 800, 
			closeButton: true 
		});
	}
});

