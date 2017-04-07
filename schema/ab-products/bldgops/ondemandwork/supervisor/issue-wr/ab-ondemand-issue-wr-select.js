var abOndemandIssueWrSlktController = View.createController("abOndemandIssueWrSlktController",{
	
	probType : '' ,
	buildingId: '',
	requestCodeFrom: '',
	requestCodeTo: '',
	requestDateFrom: '',
	requestDateTo: '',
	
	  /**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestReportGrid.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setRequestConsole();
		
		//Guo added 2010-09-10 to fox KB3023963 and KB3028371
		//abHdWoPrintCommonControllert is defined in js file ab-helpdesk-workorder-print-common.js
		abHdWoPrintCommonControllert.createMenuOfPrintButton(this, 'printWO');
	},
	
	requestConsole_beforeRefresh: function(){
		
	},
	
	requestConsole_afterRefresh: function(){
		this.setRequestConsole();
		
		var ifRefresh = ABHDC_getTabsSharedParameters()["refresh_from_ab_ondemand_issue_wr_update"]; 
		if( valueExists(ifRefresh)&& ifRefresh == true){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_ondemand_issue_wr_update"] = false;
			this.requestConsole_onFilter();
		}
	},
	
	setRequestConsole: function(){
  		this.requestConsole.setFieldValue("wr.prob_type",this.probType);
  		this.requestConsole.setFieldValue("wr.bl_id",this.buildingId);
		this.requestConsole.getFieldElement("wr.wr_id.from").value = this.requestCodeFrom;
  		this.requestConsole.getFieldElement("wr.wr_id.to").value = this.requestCodeTo;
  		this.requestConsole.setFieldValue("wr.date_requested.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("wr.date_requested.to",this.requestDateTo);
  	}, 
  	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		this.requestConsole.setFieldValue("wr.prob_type",'');
		this.requestConsole.setFieldValue("wr.date_requested.from",'');	
		this.requestConsole.setFieldValue("wr.date_requested.to",'');
		this.requestConsole.getFieldElement("wr.wr_id.from").value = '';
  		this.requestConsole.getFieldElement("wr.wr_id.to").value = '';
  		this.requestConsole.getFieldElement("wr.bl_id").value = '';
  			
		this.probType = '';
		this.buildingId = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		this.requestCodeFrom = '';
  		this.requestCodeTo = '';
  		
		this.requestConsole_onFilter();
    },
    
 	 
	
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
		var requestDateFrom = this.requestConsole.getFieldElement("wr.date_requested.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("wr.date_requested.to").value;
		var requestCodeFrom = this.requestConsole.getFieldElement("wr.wr_id.from").value;
		var requestCodeTo = this.requestConsole.getFieldElement("wr.wr_id.to").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
		this.requestCodeFrom = requestCodeFrom;
		this.requestCodeTo = requestCodeTo;
		this.probType = this.requestConsole.getFieldValue("wr.prob_type");
		this.buildingId = this.requestConsole.getFieldValue("wr.bl_id");
		
	},
 	 	
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldValue("wr.date_requested.from");
		var dateRequestedTo = this.requestConsole.getFieldValue("wr.date_requested.to");
		
	 	var requestCodeFrom = this.requestConsole.getFieldElement("wr.wr_id.from").value;
		var requestCodeTo = this.requestConsole.getFieldElement("wr.wr_id.to").value;
		
		// validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(this.requestConsole.getFieldElement("wr.date_requested.to").value,this.requestConsole.getFieldElement("wr.date_requested.from").value)){
				// display the error message defined in AXVW as message element
				alert(getMessage('error_date_range'));
				return;
			}
		}	
		if(requestCodeFrom != '' 
			&& requestCodeFrom != '0'
			&& requestCodeTo != ''
			&& requestCodeTo != '0'){
			try{
				codeNumberFrom = parseInt(requestCodeFrom) ;
				codeNumberTo = parseInt(requestCodeTo);
				//alert(codeNumberTo + "--" + codeNumberFrom);
				if(codeNumberTo <= codeNumberFrom){
					alert(getMessage('error_code_range'));
					return;
				}
			}catch(e){
				alert(getMessage('error_code_range'));
				return;
			}
		}
		
		// prepare the grid report restriction from the console values
		var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
	   
		restriction.removeClause('wr.date_requested.from');
		restriction.removeClause('wr.date_requested.to');
		restriction.removeClause('wr.wr_id.from');
		restriction.removeClause('wr.wr_id.to');
		if(this.requestConsole.getFieldValue("wr.prob_type") == '--NULL--'
			|| this.requestConsole.getFieldValue("wr.prob_type") == '') {        	  
			restriction.removeClause('wr.prob_type');
        }
        
	
		if (dateRequestedFrom != '') {
			restriction.addClause('wr.date_requested', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('wr.date_requested', dateRequestedTo, '&lt;=');
		}
		
        
		if (requestCodeFrom != '' && requestCodeFrom != '0') {
			restriction.addClause('wr.wr_id', requestCodeFrom, '&gt;=');
		}
		if (requestCodeTo != '' && requestCodeTo != '0') {
			restriction.addClause('wr.wr_id', requestCodeTo, '&lt;=');
		}
		//alert(toJSON(restriction));
		return restriction;
	},
	
	//Guo added 2010-09-10 to fox KB3023963 and KB3028371
	//ER 10/27/11: change restriction to wr instead of wo
    getPrintRestriction: function(){
        var restriction = null;
        
        var records = this.requestReportGrid.getSelectedRows();
        if (records.length != 0) {
            var wrIds = new Array();
            for (var i = 0; i < records.length; i++) {
                wrIds.push(records[i]['wr.wr_id']);
            }
            
            restriction = ' wr_id IN (' + wrIds.toString()+')';
        }else{
			View.alert(getMessage("noItems"));
		}
        
        return restriction;
    },
    requestReportGrid_afterRefresh: function(){
    	highlightWrBySubstitute(this.requestReportGrid,false);
	}
});
 
 
function issueSelected(panelId){
	var panel = View.panels.get(panelId);
	var records = panel.getSelectedRows();
	
	if(records.length < 1){
		View.alert(getMessage("noItems"));
		return;
	}
	
	var wrRecords = [];
	    
    for (var i = 0; i < records.length; i++) {
		wrRecords[i] = new Object();
        wrRecords[i]['wr.wr_id'] = records[i]["wr.wr_id"];
		wrRecords[i]['wr.wo_id'] = records[i]["wr.wo_id"];
    }

	var result = {};
	try {
		result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkRequests',wrRecords);
	} 
    catch (e) {
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
            Workflow.handleError(e); 
        }
        return;
 	}
	if (result.code == 'executed'){
		//refresh the panel	
		abOndemandIssueWrSlktController.requestConsole_onFilter();	
	} else {
		Workflow.handleError(result);
	}
}

function cancelWrs(panelId){
	var panel = View.panels.get(panelId);
	var records = panel.getPrimaryKeysForSelectedRows();
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequests',records);
	} catch (e) {
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
            Workflow.handleError(e); 
        }
        return;
 	}
	if (result.code == 'executed'){
		abOndemandIssueWrSlktController.requestConsole_onFilter();	
	} else {
		Workflow.handleError(result);
	}
}