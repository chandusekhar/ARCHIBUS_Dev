
var abHpdCfWrUpdDetailsController = View.createController("abHpdCfWrUpdDetailsController",{
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.displayPanels();
	},
	
	requestPanel_beforeRefresh: function(){
		this.costPanel.show(false);
		this.cfPanel.show(false);
		this.hiddenPanel.show(false);
	},
	
	requestPanel_afterRefresh: function(){
		this.displayPanels();
		var status = this.requestPanel.getFieldValue("wr.status");
		this.createStatusSelectList(status);
		var selectElement = document.getElementById("selectStatus");	
		
		if(selectElement.disabled == true){
			this.requestPanel.actions.get("update").show(false);
		}
		// ER 11/29/11: Turn action back on for next requests
		else{
			this.requestPanel.actions.get("update").show(true);
		}
	},
	
	displayPanels: function(){
		var record = this.requestPanel.getRecord();
		
		this.costPanel.setRecord(record);
		this.cfPanel.setRecord(record);
		
		this.costPanel.show(true);
		this.cfPanel.show(true);
		//hidden
		this.hiddenPanel.show(false);
	},
	/**
	 * Create selection list for status depending on the current work request status<br />
	 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a><br />
	 * Possible values:
	 * <ul>
	 * 		<li>Issued and In Process: not for I, Com, S</li>
	 * 		<li>On Hold for Parts: not for HP, Com, S</li>
	 * 		<li>On Hold for Access: not for HA, Com, S</li>
	 * 		<li>On Hold for Labor: not for HL, Com, S</li>
	 * 		<li>Stopped: not for S</li>
	 * 		<li>Completed: not for Com</li>
	 * </ul>
	 * @param {String} status current work request status
	 */
	createStatusSelectList: function(status){
		document.getElementById("selectStatus").disabled = false;
	
		var states = [];
		var statusList = this.hiddenPanel.getFieldElement("wr.status");
		 
		for(var i = 0; i < statusList.length; i++){
			var value = statusList.options[i].value;
			var text = statusList.options[i].text;
			 
			if(value =='I'||value == 'HP'||value=='HA'||value=='HL'||value=='S'||value=='Com'){
				states.push({"value":value, "text":text});
			}
		}
	
		var selectElement = document.getElementById("selectStatus");	
				
		if(status =='I'||status == 'HP'||status=='HA'||status=='HL'){
			for(var i=0;i<states.length;i++){ 
				var option = new Option(states[i].text, states[i].value);
				selectElement.options[i] = option;
				if(status == states[i].value){
					selectElement.selectedIndex = i;
				}
			}
		}
		//disable for status select for S or Com 
		if(status=='Com' || status=='S'){
			for(var i=0;i<states.length;i++){ 
				if(status == states[i].value){
					selectElement.options[0] = new Option(states[i].text, states[i].value);
					selectElement.disabled = true;
				}
			}
		}
		if(selectElement.options.length==0){
			selectElement.disabled = true;
		}
	},
	
	/**
	 * Update Work Request, including status<br />
	 * Calls WFR <a href='../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#updateWorkRequestStatus(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-updateWorkRequestStatus</a>
	 * and reloads tab
	 * @param {String} form name of current form
	 */
	requestPanel_onUpdate: function(){
		var status = document.getElementById("selectStatus").value;
		var record = ABODC_getDataRecord2(this.requestPanel);
		var wr_id = this.requestPanel.getFieldValue("wr.wr_id");
		var result = {};
	    try {		
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', record,status);
	     } 
   		catch (e) {
		Workflow.handleError(e);
 		}
	    if(result.code == 'executed'){
			this.requestPanel.refresh();
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_cf_workrequest_updateDetails"] = true; 
		} else {
		 	Workflow.handleError(result);
		}
	}
});