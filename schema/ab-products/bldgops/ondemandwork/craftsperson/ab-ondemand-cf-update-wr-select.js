var abOdmdCfUpdWrSlktControllert = View.createController("abOdmdCfUpdWrSlktControllert",{
	
	probType : '' ,
	requestCodeFrom: '',
	requestCodeTo: '',
	requestDateFrom: '',
	requestDateTo: '',
	wrRecords:'',
	
	afterViewLoad: function(){
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		var cfWorkflowSubstitutes = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','cf_id').message;
		this.requestReportGrid.addParameter('cfWorkflowSubstitutes', cfWorkflowSubstitutes);
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setRequestConsole();
	},
	
	requestConsole_beforeRefresh: function(){
		
	},
	
	requestConsole_afterRefresh: function(){
		this.setRequestConsole();
		
		var ifRefresh = ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_cf_workrequest_updateDetails"]; 
		if( valueExists(ifRefresh)&& ifRefresh == true){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_cf_workrequest_updateDetails"] = false;
			this.requestConsole_onFilter();
		}
	},
	
	setRequestConsole: function(){
  		this.requestConsole.setFieldValue("wr.prob_type",this.probType);
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
  		
		this.probType = '';
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
	},
 	 	
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldElement("wr.date_requested.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("wr.date_requested.to").value;
		var requestCodeFrom = this.requestConsole.getFieldElement("wr.wr_id.from").value;
		var requestCodeTo = this.requestConsole.getFieldElement("wr.wr_id.to").value;
		
		// validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(dateRequestedTo,dateRequestedFrom)){
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
	requestReportGrid_afterRefresh: function(){
		if(parseInt(View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']) != 0){
			this.requestReportGrid.selectAll(true);
			var wr_rows = this.requestReportGrid.getPrimaryKeysForSelectedRows();
			
			//KB3036931 - only call WFR when the grid is not empty
			if(wr_rows.length>0){
				var result = {};
				try {
					 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkWrCfSubstitutes',wr_rows);
				} catch (e) {
					Workflow.handleError(e);
		   		}
				if(result.code == 'executed'){
					this.wrRecords = eval('('+result.jsonExpression+')');
					
					this.requestReportGrid.gridRows.each(function(row) {
			            
			            var wrId = row.getRecord().getValue('wr.wr_id');
			            for(var j=0;j<abOdmdCfUpdWrSlktControllert.wrRecords.length;j++){
			            	if(abOdmdCfUpdWrSlktControllert.wrRecords[j] == wrId){
			            		color = View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor'];
				            	Ext.get(row.dom).setStyle('background-color', color);
				            	break;
			            	}
			            }
			        });
					
					
				} else {
					Workflow.handleError(result);
				}
			}
			
			var instructions = "<span style='background-color:"+View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']+"'>"+getMessage("substituteLegend")+"</span>";
			this.requestReportGrid.setInstructions(instructions);
			this.requestReportGrid.selectAll(false);
		}
	}
});
