
var helpDeskRequestReviewController = View.createController("helpDeskRequestReviewController",{
	
	mainTabs: null,
	requestType: '',
	status:	'',
	requestDateFrom: '',
	requestDateTo: '',
	thisController: null,
	
	afterViewLoad: function(){
		thisController = this;
		this.mainTabs = View.panels.get("helpDeskRequestReviewTabs");
		
		if(this.mainTabs != null){
			this.mainTabs.workflow = 'enforced';
			this.mainTabs.enableTab("view",false);
			this.mainTabs.addEventListener('afterTabChange',this.mainTabsChange);	
		}
		this.removeStatusOptions("activity_log_hactivity_log");
	},
	
	requestConsole_afterRefresh: function(){
		this.setRequestParameters();
	},
	
	removeStatusOptions: function(){
	
		var selectedEl = this.requestConsole.getFieldElement("activity_log_hactivity_log.status");
		
		if (selectedEl == null) return;
		
		for (var i=selectedEl.options.length-1; i>=0; i--) {
			if(selectedEl.options[i].value == "N/A" 
				|| selectedEl.options[i].value == "CREATED" 
				|| selectedEl.options[i].value == "PLANNED" 
				|| selectedEl.options[i].value == "TRIAL" 
				|| selectedEl.options[i].value == "BUDGETED" 
				|| selectedEl.options[i].value == "SCHEDULED" 
				|| selectedEl.options[i].value == "IN PROCESS-H" 
				|| selectedEl.options[i].value == "COMPLETED-V"){
				
				selectedEl.remove(i);
			}
		}	
	},
	
	
	mainTabsChange: function(tabPanel, currentTabName, newTabName){
		if(tabPanel != null){
			if(currentTabName == 'select'){
				tabPanel.workflow = 'enforced';
				tabPanel.enableTab("view",false);
			}else{
				tabPanel.workflow = 'free';
				tabPanel.enableTab("select",true);
			}
		}	
	},
	
	requestConsole_onSelectActivityType: function(){
		
		var	tableName = 'activity_log_hactivity_log';
		
		Ab.view.View.selectValue('requestConsole', getMessage('requestType'),[tableName+'.activity_type'],
		'activitytype',['activitytype.activity_type'],['activitytype.activity_type','activitytype.description'],
		"activity_type LIKE 'SERVICE DESK%'");
	},
	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestParameters();
		
		this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		
		this.requestType = '';
		this.status = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		
		this.setRequestParameters();
		
		this.requestConsole_onFilter();
    },
    
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldElement("activity_log_hactivity_log.date_requested.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("activity_log_hactivity_log.date_requested.to").value;
		
		 // validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(dateRequestedTo,dateRequestedFrom)){
				// display the error message defined in AXVW as message element
				alert(getMessage('error_date_range'));
				return;
			}
		}	
		
		// prepare the grid report restriction from the console values
		var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
	   
		try{
			var status = this.requestConsole.getFieldValue('activity_log_hactivity_log.status');
			if (status != undefined){
				if (status == '--NULL--') {	
					restriction.removeClause('activity_log.status');
				}
			}
		} catch(err){}
		
		restriction.removeClause('activity_log_hactivity_log.date_requested.from');
		restriction.removeClause('activity_log_hactivity_log.date_requested.to');
		 
		if (dateRequestedFrom != '') {
			restriction.addClause('activity_log_hactivity_log.date_requested', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('activity_log_hactivity_log.date_requested', dateRequestedTo, '&lt;=');
		}
		//alert(toJSON(restriction));
		return restriction;
	},
	
	saveRequestParameters: function(){
		var console = this.requestConsole;
		this.requestType = console.getFieldValue("activity_log_hactivity_log.activity_type");
		this.status = console.getFieldValue("activity_log_hactivity_log.status");
		this.requestDateFrom = console.getFieldValue("activity_log_hactivity_log.date_requested.from");
		this.requestDateTo = console.getFieldValue("activity_log_hactivity_log.date_requested.to");
	},
	
	setRequestParameters: function(){
		this.requestConsole.setFieldValue("activity_log_hactivity_log.activity_type",this.requestType);
		this.requestConsole.setFieldValue("activity_log_hactivity_log.status",this.status);
		this.requestConsole.setFieldValue("activity_log_hactivity_log.date_requested.from",this.requestDateFrom);
		this.requestConsole.setFieldValue("activity_log_hactivity_log.date_requested.to",this.requestDateTo);
	},
	
	requestConsole_onSelectRequestType: function(){
		var	tableName = 'activity_log_hactivity_log';
		Ab.view.View.selectValue('requestConsole', getMessage('requestType'),[tableName+'.activity_type'],
		'activitytype',['activitytype.activity_type'],['activitytype.activity_type','activitytype.description'],
		"activity_type LIKE 'SERVICE DESK%'");
	
	},
	
	requestReportGrid_onView: function(row, action){
	
		this.saveRequestParameters();
	
		var record = row.getRecord();
		var activityLogId = record.getValue("activity_log_hactivity_log.activity_log_id");
		var activityType = 	record.getValue("activity_log_hactivity_log.activity_type");
		
		var rowRestriction = {
			"activity_log_hactivity_log.activity_log_id":activityLogId
		};
		
		if(this.mainTabs != null){
			this.mainTabs.selectTab("view",rowRestriction,false,false);
		}
	}	
});	
