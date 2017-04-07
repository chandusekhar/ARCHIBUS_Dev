var abHpdRVSelectArchivedController =  View.createController("abHpdRVSelectArchivedController",{
	
	activityType : '' ,
	status : '',
	requestDateFrom: '',
	requestDateTo: '',
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setRequestConsole();
		this.removeStatusOptions("hactivity_log.status");
	},
	
	requestConsole_afterRefresh: function(){
		this.setRequestConsole();
		this.removeStatusOptions("hactivity_log.status");
	},
	
	
	setRequestConsole: function(){
  		this.requestConsole.setFieldValue("hactivity_log.activity_type",this.activityType);
  		this.requestConsole.setFieldValue("hactivity_log.status",this.status);
  		this.requestConsole.setFieldValue("hactivity_log.date_requested.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("hactivity_log.date_requested.to",this.requestDateTo);
  	}, 
	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		this.requestConsole.setFieldValue("hactivity_log.activity_type",'');
		this.requestConsole.setFieldValue("hactivity_log.date_requested.from",'');	
		this.requestConsole.setFieldValue("hactivity_log.date_requested.to",'');
		this.requestConsole.setFieldValue("hactivity_log.status",'');
		
		this.activityType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		this.status = '';
		
		this.requestConsole_onFilter();
    },
    
 	removeStatusOptions: function(fieldName){
		
		var selectElement = this.requestConsole.getFieldElement(fieldName);	
		if (selectElement == null) return;
		
		for (var i=selectElement.options.length-1; i>=0; i--) {
			if (selectElement.options[i].value == "N/A" || selectElement.options[i].value == "CREATED" 
			|| selectElement.options[i].value == "PLANNED" || selectElement.options[i].value == "TRIAL" 
			|| selectElement.options[i].value == "BUDGETED" || selectElement.options[i].value == "SCHEDULED" 
			|| selectElement.options[i].value == "IN PROCESS-H" || selectElement.options[i].value == "COMPLETED-V" 	
			) {
				selectElement.remove(i);
			}
		}	
	},
	
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
		var requestDateFrom = this.requestConsole.getFieldElement("hactivity_log.date_requested.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("hactivity_log.date_requested.to").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
		this.activityType = this.requestConsole.getFieldValue("hactivity_log.activity_type");
		this.status = this.requestConsole.getFieldValue("hactivity_log.status");
 	},
 	
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldValue("hactivity_log.date_requested.from");
		var dateRequestedTo = this.requestConsole.getFieldValue("hactivity_log.date_requested.to");
		
		 // validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(this.requestConsole.getFieldElement("hactivity_log.date_requested.to").value,this.requestConsole.getFieldElement("hactivity_log.date_requested.from").value)){
				// display the error message defined in AXVW as message element
				alert(getMessage('error_date_range'));
				return;
			}
		}	
		
		// prepare the grid report restriction from the console values
		var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
	   
		try{
			var status = this.requestConsole.getFieldValue('hactivity_log.status');
			if (status != undefined){
				if (status == '--NULL--' || status == '') {	
					restriction.removeClause('hactivity_log.status');
				}
			}
		} catch(err){}
		
		restriction.removeClause('hactivity_log.date_requested.from');
		restriction.removeClause('hactivity_log.date_requested.to');
		 
		if (dateRequestedFrom != '') {
			restriction.addClause('hactivity_log.date_requested', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('hactivity_log.date_requested', dateRequestedTo, '&lt;=');
		}
	
		return restriction;
	}
});


function SaveConsoleParameters(){
	abHpdRVSelectArchivedController.saveRequestConsoleParameters();
}