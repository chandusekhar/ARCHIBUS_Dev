/**
 * View's controller
 */
var abEhsRptIncidentsCountCtrl = View.createController('abEhsRptIncidentsCountCtrl', {
	groupBy: 'type',//values: type, typeAndTime, site, property, building, businessUnit, division, department
	
	/**
	 * SQL for filter restriction 
	 */
	sqlFilterRestriction: '',
	
	/**
	 * Ab.view.Restriction object for filter restriction
	 */
	filterRestriction: null,
	
	afterViewLoad: function(){
		this.abEhsRptIncidentsCount_oneCritChartBu.show(false,false);
		this.abEhsRptIncidentsCount_oneCritChartBu.showHeader(false);
		
		this.abEhsRptIncidentsCount_oneCritChartDvDp.show(false,false);
		this.abEhsRptIncidentsCount_oneCritChartDvDp.showHeader(false);
		
		this.abEhsRptIncidentsCount_twoCritChart.show(false,false);
		this.abEhsRptIncidentsCount_twoCritChart.showHeader(false);
		
		document.getElementById("divideBy").disabled = true;
	},
	
	/**
	 * Apply filter restriction and display the chart
	 */
	abEhsRptIncidentsCount_filter_onFilter: function(){
		//divide by area or headcount is applied only for charts grouped by building, site and property
		var isDividable = false;
		
		var customField = '';
		
		var selectGroupBy = document.getElementById("groupBy");
		var groupByValue = selectGroupBy.options[selectGroupBy.selectedIndex].value;
		switch(groupByValue){
			case 'Incident Type':
				this.groupBy = 'type';
				customField = "ehs_incidents.incident_type";
				break;
			case 'Incident Type Over Time':
				this.groupBy = 'typeAndTime';
				break;
			case 'Site':
				this.groupBy = 'site';
				customField = "ehs_incidents.site_id";
				isDividable = true;
				break;
			case 'Property':
				this.groupBy = 'property';
				customField = "ehs_incidents.pr_id";
				isDividable = true;
				break;
			case 'Building':
				this.groupBy = 'building';
				customField = "ehs_incidents.bl_id";
				isDividable = true;
				break;
			case 'BusinessUnit':
				this.groupBy = 'businessUnit';
				customField = "dv.bu_id";
				break;
			case 'Division':
				this.groupBy = 'division';
				customField = "em.dv_id";
				break;
			case 'Department':
				this.groupBy = 'department';
				customField = "em.dp_id";
				break;
		}
		
		//get the value for 'Divide Totals By' field
		var selectDivideBy = document.getElementById("divideBy");
		var divideByValue = selectDivideBy.options[selectDivideBy.selectedIndex].value;
		
		//get the filter restriction
		this.filterRestriction = this.getFilterRestriction(this.abEhsRptIncidentsCount_filter);
		
		if(this.groupBy == 'typeAndTime'){
			this.abEhsRptIncidentsCount_twoCritChart.addParameter('consoleRestriction', this.sqlFilterRestriction);
		}else if (this.groupBy == 'businessUnit'){
			this.abEhsRptIncidentsCount_oneCritChartBu.addParameter('nonEm', getMessage("nonEmployeeAffected"));
			this.abEhsRptIncidentsCount_oneCritChartBu.addParameter('noDv', getMessage("noDvForAffectedEm"));
		}else if(this.groupBy == 'division' || this.groupBy == 'department'){
			//set grouping axis title
			this.abEhsRptIncidentsCount_oneCritChartDvDp.groupingAxis[0].title = getMessage(this.groupBy + "GroupingAxisTitle");
			
			this.abEhsRptIncidentsCount_oneCritChartDvDp.addParameter('nonEm', getMessage("nonEmployeeAffected"));
			this.abEhsRptIncidentsCount_oneCritChartDvDp.addParameter("customField",customField);
		}else{
			//set grouping axis title
			this.abEhsRptIncidentsCount_oneCritChart.groupingAxis[0].title = getMessage(this.groupBy + "GroupingAxisTitle");
			
			this.abEhsRptIncidentsCount_oneCritChart.addParameter('isDividable', isDividable);
			this.abEhsRptIncidentsCount_oneCritChart.addParameter('divideBy', divideByValue);
			this.abEhsRptIncidentsCount_oneCritChart.addParameter("customField",customField);
		}
		
		//display the chart
		var chartPanel = this.abEhsRptIncidentsCount_oneCritChart;
		var oppositeChartPanel1 = this.abEhsRptIncidentsCount_twoCritChart;
		var oppositeChartPanel2 = this.abEhsRptIncidentsCount_oneCritChartBu;
		var oppositeChartPanel3 = this.abEhsRptIncidentsCount_oneCritChartDvDp;
		
		if(this.groupBy == 'typeAndTime'){
			chartPanel = this.abEhsRptIncidentsCount_twoCritChart;
			oppositeChartPanel1 = this.abEhsRptIncidentsCount_oneCritChart;
			oppositeChartPanel2 = this.abEhsRptIncidentsCount_oneCritChartBu;
			oppositeChartPanel3 = this.abEhsRptIncidentsCount_oneCritChartDvDp;
		}
		
		if(this.groupBy == 'businessUnit'){
			chartPanel = this.abEhsRptIncidentsCount_oneCritChartBu;
			oppositeChartPanel1 = this.abEhsRptIncidentsCount_oneCritChart;
			oppositeChartPanel2 = this.abEhsRptIncidentsCount_twoCritChart;
			oppositeChartPanel3 = this.abEhsRptIncidentsCount_oneCritChartDvDp;
		}
		
		if(this.groupBy == 'division' || this.groupBy == 'department'){
			chartPanel = this.abEhsRptIncidentsCount_oneCritChartDvDp;
			oppositeChartPanel1 = this.abEhsRptIncidentsCount_oneCritChart;
			oppositeChartPanel2 = this.abEhsRptIncidentsCount_twoCritChart;
			oppositeChartPanel3 = this.abEhsRptIncidentsCount_oneCritChartBu;
		}
		
		oppositeChartPanel1.show(false,false);
		oppositeChartPanel1.showHeader(false);
		oppositeChartPanel2.show(false,false);
		oppositeChartPanel2.showHeader(false);
		oppositeChartPanel3.show(false,false);
		oppositeChartPanel3.showHeader(false);
		
		chartPanel.show(true,true);
		chartPanel.loadChartSWFIntoFlash();
		chartPanel.refresh(this.filterRestriction);
		
		//set the chart's title
		chartPanel.setTitle(getMessage(this.groupBy + "ChartTitle"));
		
		if(isDividable){
			this.abEhsRptIncidentsCount_oneCrit_ds.addParameter('isDividable', isDividable);
			this.abEhsRptIncidentsCount_oneCrit_ds.addParameter('divideBy', divideByValue);
			this.abEhsRptIncidentsCount_oneCrit_ds.addParameter("customField",customField);
			
			this.checkDivideByValues(divideByValue);
		}

	},
	
	/**
	 * Verify and notify the user that some of the area or headcount values were not known
	 * and the results are not so accurate.
	 */
	checkDivideByValues: function(divideBy){
		var dataSource = this.abEhsRptIncidentsCount_oneCritChart.getDataSource();
		var records = dataSource.getRecords(this.abEhsRptIncidentsCount_oneCritChart.restriction);
		
		var hasValidValue = true;
		var locations = [];
		
		for(var i=0; i<records.length; i++){
			if((records[i].getValue("ehs_incidents.vf_valid_divide")) == "false"){
				hasValidValue=false;
				if(records[i].getValue("ehs_incidents.vf_generic")){
					locations.push(records[i].getValue("ehs_incidents.vf_generic"));
				}else{
					locations.push(getMessage("noValueTitle"));
				}
			}
		}
		
		if(!hasValidValue){
			var message = getMessage("unavalableData").replace("{0}",(divideBy == 'unitArea') ? getMessage('unitAreaTitle') : getMessage('headcountTitle'));
			message = message.replace("{1}", "[" + locations.join("],[") + "]");
			View.showMessage(message);
		}
	},
	
	/**
	 * Set state (enabled/disabled) for the field Divide Totals By:
	 */
	setStateDivideBy: function(){
		var selectGroupBy = document.getElementById("groupBy");
		var groupByValue = selectGroupBy.options[selectGroupBy.selectedIndex].value; 
		if(groupByValue == 'Site' || groupByValue == 'Property' || groupByValue == 'Building'){
			document.getElementById("divideBy").disabled = false;
		}else{
			document.getElementById("divideBy").disabled = true;
			document.getElementById("divideBy").selectedIndex = 0;
		}
	},
	
	/**
	 * Clear filter
	 */
	abEhsRptIncidentsCount_filter_onClear: function(){
		this.abEhsRptIncidentsCount_filter.clear();
		var selectOptions = document.getElementById('groupBy').options;
	    for(var i=0; i<selectOptions.length; i++) {
			if(selectOptions[i].defaultSelected) {
				selectOptions[i].selected = true;
				break;
	    	}
		}

	    this.setStateDivideBy();
	},
	
	/**
	 * Get filter restriction
	 */
	getFilterRestriction: function(console){
		var restriction = new Ab.view.Restriction(); 
		this.sqlFilterRestriction = '1=1';
        
		var fieldId = 'ehs_incidents.incident_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + "=" + console.getFieldValue(fieldId);
		}
		
		fieldId = 'ehs_incidents.incident_type';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + " IN ('" + console.getFieldMultipleValues(fieldId).join("','") + "')";
		}
		
		fieldId = 'ehs_incidents.date_incident';
		if(console.getFieldValue('date_incident_from')){
			restriction.addClause(fieldId, console.getFieldValue('date_incident_from'), '>=');
			this.sqlFilterRestriction += " AND " + fieldId + " >= ${sql.date('" + console.getFieldValue('date_incident_from') + "')}";
		}
		if(console.getFieldValue('date_incident_to')){
			restriction.addClause(fieldId, console.getFieldValue('date_incident_to'), '<=');
			this.sqlFilterRestriction += " AND " + fieldId + " <= ${sql.date('" + console.getFieldValue('date_incident_to') + "')}";
		}
		
		fieldId = 'ehs_incidents.site_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + " IN ('" + console.getFieldMultipleValues(fieldId).join("','") + "')";
		}
		
		fieldId = 'ehs_incidents.pr_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + " IN ('" + console.getFieldMultipleValues(fieldId).join("','") + "')";
		}
		
		fieldId = 'ehs_incidents.bl_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + " IN ('" + console.getFieldMultipleValues(fieldId).join("','") + "')";
		}
		
		fieldId = 'ehs_incidents.fl_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + " IN ('" + console.getFieldMultipleValues(fieldId).join("','") + "')";
		}
		
		fieldId = 'ehs_incidents.em_id_affected';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + "='" + console.getFieldValue(fieldId) + "'";
		}
		
		fieldId = 'ehs_incidents.eq_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + "='" + console.getFieldValue(fieldId) + "'";
		}
		
		fieldId = 'ehs_incidents.responsible_mgr';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + "='" + console.getFieldValue(fieldId) + "'";
		}
		
		fieldId = 'ehs_incidents.cause_category_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + "='" + console.getFieldValue(fieldId) + "'";
		}
		
		fieldId = 'ehs_incidents.injury_category_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + "='" + console.getFieldValue(fieldId) + "'";
		}
		
		fieldId = 'ehs_incidents.injury_area_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		if(valueExistsNotEmpty(console.getFieldValue(fieldId))){
			this.sqlFilterRestriction += " AND " + fieldId + "='" + console.getFieldValue(fieldId) + "'";
		}
		
		return restriction;
	},
	
	abEhsRptIncidentsCount_oneCritChart_onReport:function(){
		View.openDialog('ab-ehs-rpt-incidents-count-dialog.axvw', this.filterRestriction, false, {
			afterViewLoad: function(dialogView) {
		        // access the dialog controller property
		        var grid = dialogView.panels.get("abEhsRptIncidentsCountDialog_grid");
	            grid.refresh();
		     }
		});
	},
	
	abEhsRptIncidentsCount_twoCritChart_onReport:function(){
		View.openDialog('ab-ehs-rpt-incidents-count-dialog.axvw', this.filterRestriction, false, {
			afterViewLoad: function(dialogView) {
		        // access the dialog controller property
		        var grid = dialogView.panels.get("abEhsRptIncidentsCountDialog_grid");
	            grid.refresh();
		     }
		});
	},
	
	abEhsRptIncidentsCount_oneCritChartBu_onReport:function(){
		View.openDialog('ab-ehs-rpt-incidents-count-dialog.axvw', this.filterRestriction, false, {
			afterViewLoad: function(dialogView) {
		        // access the dialog controller property
		        var grid = dialogView.panels.get("abEhsRptIncidentsCountDialog_grid");
	            grid.refresh();
		     }
		});
	},
	
	abEhsRptIncidentsCount_oneCritChartDvDp_onReport:function(){
		View.openDialog('ab-ehs-rpt-incidents-count-dialog.axvw', this.filterRestriction, false, {
			afterViewLoad: function(dialogView) {
		        // access the dialog controller property
		        var grid = dialogView.panels.get("abEhsRptIncidentsCountDialog_grid");
	            grid.refresh();
		     }
		});
	}
});

/**
 * Open a pop-up window with the details of the incidents counted in the chart after clicking on the charts
 */
function displayChartItemsDialog(obj){
	var customField = "ehs_incidents.vf_generic";
	var controller = View.controllers.get('abEhsRptIncidentsCountCtrl');
    var groupBy = controller.groupBy;
    var filterRestriction = controller.filterRestriction;
    var selectionRestriction = new Ab.view.Restriction();
    var customFieldClause = '1=1';
    switch (groupBy){
    	case 'typeAndTime':
	    	var fieldId = 'ehs_incidents.chart_year_and_month';
			var fieldValue = obj.selectedChartData[fieldId].replace("(","").replace(")","");
			var dateArray = fieldValue.split("-");
			var year = dateArray[0];
			var month = dateArray[1];
			var minDate = year + '-' + month + '-' + '01';
			var maxDate = year + '-' + month + '-' + GetMonthMaxDays(parseInt(month), parseInt(year));
			
		    selectionRestriction.addClause('ehs_incidents.date_incident', minDate, '>=');
		    selectionRestriction.addClause('ehs_incidents.date_incident', maxDate, '<=');
		    
		    var incidentType = obj.selectedChartData["ehs_incidents.incident_type"];
		    if(valueExistsNotEmpty(incidentType)){
		    	selectionRestriction.addClause('ehs_incidents.incident_type', incidentType, '=');
		    }
		    
		    break;
    	case 'businessUnit':
    		var fieldId = 'dv.bu_id';
    		customField = 'ehs_incidents.bu_id';
    		
    		var nullValueTitle = obj.selectedChartData['nullValueTitle'];
			if(obj.selectedChartData[customField] == nullValueTitle){
				customFieldClause = fieldId + " IS NULL AND ehs_incidents.em_id_affected IS NOT NULL AND em.dv_id IS NOT NULL";
			}else if(obj.selectedChartData[customField] == getMessage('noDvForAffectedEm')){
				customFieldClause = " ehs_incidents.em_id_affected IS NOT NULL AND em.dv_id IS NULL";
			}else if(obj.selectedChartData[customField] == getMessage('nonEmployeeAffected')){
				customFieldClause = " ehs_incidents.em_id_affected IS NULL";
			}else{
				customFieldClause = fieldId + " = '" + obj.selectedChartData[customField] + "'";
			}
    		break;
    	case 'division':
    		var fieldId = 'em.dv_id';
    		
    		var nullValueTitle = obj.selectedChartData['nullValueTitle'];
			if(obj.selectedChartData[customField] == nullValueTitle){
				customFieldClause = fieldId + " IS NULL AND ehs_incidents.em_id_affected IS NOT NULL";
			}else if(obj.selectedChartData[customField] == getMessage('nonEmployeeAffected')){
				customFieldClause = " ehs_incidents.em_id_affected IS NULL";
			}else{
				customFieldClause = fieldId + " = '" + obj.selectedChartData[customField] + "'";
			}
    		break;
    	case 'department':
    		var fieldId = 'em.dp_id';
    		
    		var nullValueTitle = obj.selectedChartData['nullValueTitle'];
			if(obj.selectedChartData[customField] == nullValueTitle){
				customFieldClause = fieldId + " IS NULL AND ehs_incidents.em_id_affected IS NOT NULL";
			}else if(obj.selectedChartData[customField] == getMessage('nonEmployeeAffected')){
				customFieldClause = " ehs_incidents.em_id_affected IS NULL";
			}else{
				customFieldClause = fieldId + " = '" + obj.selectedChartData[customField] + "'";
			}
    		break;
    	default:
	    	var fieldId = '';
	    	switch(groupBy){
		    	case 'type':
		    		fieldId = 'ehs_incidents.incident_type';
		    		break;
		    	case 'site':
		    		fieldId = 'ehs_incidents.site_id';
		    		break;
		    	case 'property':
		    		fieldId = 'ehs_incidents.pr_id';
		    		break;
		    	case 'building':
		    		fieldId = 'ehs_incidents.bl_id';
		    		break;
	    	}
	    	
			var nullValueTitle = obj.selectedChartData['nullValueTitle'];
			if(obj.selectedChartData[customField] == nullValueTitle){
				customFieldClause = fieldId + " IS NULL";
			}else{
				customFieldClause = fieldId + " = '" + obj.selectedChartData[customField] + "'";
			}
			break;
    }
    
    if(filterRestriction){
    	selectionRestriction.addClauses(filterRestriction);
    }
    
    View.openDialog('ab-ehs-rpt-incidents-count-dialog.axvw', selectionRestriction, false,{
		afterViewLoad: function(dialogView) {
	        // access the dialog controller property
	        var grid = dialogView.panels.get("abEhsRptIncidentsCountDialog_grid");
	        grid.addParameter('customFieldClause',customFieldClause);
            grid.refresh();
	     }
	});
}