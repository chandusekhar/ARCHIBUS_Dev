var abHpdWrReqIssueSlktControllert = View.createController("abHpdWrReqIssueSlktControllert",{
	
	workType : '' ,
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
		
		var ifRefresh = ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_workrequest_issue_update"]; 
		if( valueExists(ifRefresh)&& ifRefresh == true){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_workrequest_issue_update"] = false;
			this.requestConsole_onFilter();
		}
	},
	
	setRequestConsole: function(){
  		this.requestConsole.setFieldValue("wo.wo_type",this.workType);
  		this.requestConsole.setFieldValue("wo.bl_id",this.buildingId);
		this.requestConsole.getFieldElement("wo.wo_id.from").value = this.requestCodeFrom;
  		this.requestConsole.getFieldElement("wo.wo_id.to").value = this.requestCodeTo;
  		this.requestConsole.setFieldValue("wo.date_assigned.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("wo.date_assigned.to",this.requestDateTo);
  	}, 
  	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		this.requestConsole.setFieldValue("wo.wo_type",'');
		this.requestConsole.setFieldValue("wo.date_assigned.from",'');	
		this.requestConsole.setFieldValue("wo.date_assigned.to",'');
		this.requestConsole.getFieldElement("wo.wo_id.from").value = '';
  		this.requestConsole.getFieldElement("wo.wo_id.to").value = '';
  		this.requestConsole.getFieldElement("wo.bl_id").value = '';
  			
		this.workType = '';
		this.buildingId = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		this.requestCodeFrom = '';
  		this.requestCodeTo = '';
  		
		this.requestConsole_onFilter();
    },
    
 	 
	
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
		var requestDateFrom = this.requestConsole.getFieldElement("wo.date_assigned.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("wo.date_assigned.to").value;
		var requestCodeFrom = this.requestConsole.getFieldElement("wo.wo_id.from").value;
		var requestCodeTo = this.requestConsole.getFieldElement("wo.wo_id.to").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
		this.requestCodeFrom = requestCodeFrom;
		this.requestCodeTo = requestCodeTo;
		this.workType = this.requestConsole.getFieldValue("wo.wo_type");
		this.buildingId = this.requestConsole.getFieldValue("wo.bl_id");
		
	},
 	 	
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldValue("wo.date_assigned.from");
		var dateRequestedTo = this.requestConsole.getFieldValue("wo.date_assigned.to");
		
	 	var requestCodeFrom = this.requestConsole.getFieldElement("wo.wo_id.from").value;
		var requestCodeTo = this.requestConsole.getFieldElement("wo.wo_id.to").value;
		
		// validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(this.requestConsole.getFieldElement("wo.date_assigned.to").value,this.requestConsole.getFieldElement("wo.date_assigned.from").value)){
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
	   
		restriction.removeClause('wo.date_assigned.from');
		restriction.removeClause('wo.date_assigned.to');
		restriction.removeClause('wo.wo_id.from');
		restriction.removeClause('wo.wo_id.to');
		if(this.requestConsole.getFieldValue("wo.wo_type") == '--NULL--'
			|| this.requestConsole.getFieldValue("wo.wo_type") == '') {        	  
			restriction.removeClause('wo.wo_type');
        }
        
		
		if (dateRequestedFrom != '') {
			restriction.addClause('wo.date_assigned', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('wo.date_assigned', dateRequestedTo, '&lt;=');
		}
		if (requestCodeFrom != '' && requestCodeFrom != '0') {
			restriction.addClause('wo.wo_id', requestCodeFrom, '&gt;=');
		}
		if (requestCodeTo != '' && requestCodeTo != '0') {
			restriction.addClause('wo.wo_id', requestCodeTo, '&lt;=');
		}
		//alert(toJSON(restriction));
		return restriction;
	},
	
    //Guo added 2010-09-10 to fox KB3023963 and KB3028371
    getPrintRestriction: function(){
        var restriction = null;
        
        var records = this.requestReportGrid.getSelectedRows();
        if (records.length != 0) {
            var woIds = new Array();
            for (var i = 0; i < records.length; i++) {
                woIds.push(records[i]['wo.wo_id']);
            }
            
            restriction = ' wo_id IN (' + woIds.toString()+')';
        }else{
			View.alert(getMessage('noItems'));
		}
        
        return restriction;
    },
    requestReportGrid_afterRefresh: function(){
    	//this.highlightByWoSubstitute();
    	highlightWoBySubstitute(this.requestReportGrid,false);
	}
});


function issueSelected(){
	var panel = View.panels.get("requestReportGrid");
	var records = panel.getPrimaryKeysForSelectedRows();
	
	if(records.length < 1){
		View.alert(getMessage('noItems'));
		return;
	}
	var result = {};
	try {
		result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkOrders',records);
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
		abHpdWrReqIssueSlktControllert.requestConsole_onFilter();
	} else {
		Workflow.handleError(result);
	}
}
