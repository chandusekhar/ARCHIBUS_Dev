var abOdmdCfUpdLaborController = View.createController("abOdmdCfUpdLaborController",{
	
	
	requestCode: '',
	requestDateFrom: '',
	requestDateTo: '',
	
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
	},
	
	setRequestConsole: function(){
  		this.requestConsole.getFieldElement("wrcf.wr_id").value = this.requestCode;
  		this.requestConsole.setFieldValue("wrcf.date_start.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("wrcf.date_start.to",this.requestDateTo);
  	}, 
  	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
	
		this.requestConsole.setFieldValue("wrcf.date_start.from",'');	
		this.requestConsole.setFieldValue("wrcf.date_start.to",'');
		this.requestConsole.getFieldElement("wrcf.wr_id").value = '';
  	
  		this.requestDateFrom = '';
		this.requestDateTo = '';
		this.requestCode = '';
  		
		this.requestConsole_onFilter();
    },
    
 	 
	
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
		var requestDateFrom = this.requestConsole.getFieldElement("wrcf.date_start.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("wrcf.date_start.to").value;
		
		var requestCode = this.requestConsole.getFieldElement("wrcf.wr_id").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
		this.requestCode = requestCode;
		
	},
 	 	
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldValue("wrcf.date_start.from");
		var dateRequestedTo = this.requestConsole.getFieldValue("wrcf.date_start.to");
		var requestCode = this.requestConsole.getFieldElement("wrcf.wr_id").value;
		
		// validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(this.requestConsole.getFieldElement("wrcf.date_start.to").value,this.requestConsole.getFieldElement("wrcf.date_start.from").value)){
				// display the error message defined in AXVW as message element
				alert(getMessage('error_date_range'));
				return;
			}
		}	
		
		// prepare the grid report restriction from the console values
		var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
	   
		restriction.removeClause('wrcf.date_start.from');
		restriction.removeClause('wrcf.date_start.to');
		restriction.removeClause('wrcf.wr_id');
		 
		if (dateRequestedFrom != '') {
			restriction.addClause('wrcf.date_start', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('wrcf.date_start', dateRequestedTo, '&lt;=');
		}
		if (requestCode != '' && requestCode != '0') {
			restriction.addClause('wrcf.wr_id', requestCode, '=');
		}
		
		return restriction;
	},
	
	assignReportGrid_onUpdate: function(){
		
		var panel = View.panels.get("assignReportGrid");
		var fieldValues = panel.getFieldValues();
	
		panel.save();
		var result = {};
		try {
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateCraftspersonCosts',fieldValues);
		}catch (e) {
        Workflow.handleError(e);
   		 }
		if(result.code == 'executed'){
			this.requestConsole_onFilter();
			this.assignReportGrid.refresh();
		} else {
			Workflow.handleError(result);
		}
	},
	requestReportGrid_afterRefresh: function(){
		highlightBySubstitute(this.requestReportGrid, 'cf.email', View.user.email);		 
	}
});