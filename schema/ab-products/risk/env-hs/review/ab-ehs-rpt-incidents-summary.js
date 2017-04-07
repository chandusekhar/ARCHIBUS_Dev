/**
 * View's controller
 */
var abEhsRptIncidentsSummaryCtrl = View.createController('abEhsRptIncidentsSummaryCtrl', {
	filterRestriction:null,
	abEhsRptIncidentsSummary_filter_onShow: function(){
		this.filterRestriction = this.getFilterRestriction(this.abEhsRptIncidentsSummary_filter);
		this.abEhsRptIncidentsSummary_details.refresh(this.filterRestriction);
	},
	
	/**
	*	Add a new title row to the crossTable
	*/
	abEhsRptIncidentsSummary_details_afterRefresh: function(){
		var tableEl = document.getElementById('abEhsRptIncidentsSummary_details_table');
		if(tableEl && tableEl.children.length >0){
			var tableBodyEl = tableEl.children[0];
			var newRow = tableBodyEl.insertRow(0);
			newRow.className="first";
			
			// cells 1-2
		  	var cell1 = newRow.insertCell(0);
		  	var textNodeEl = document.createTextNode(getMessage("injuryAndIllnessTypes"));
		  	cell1.colSpan = 2;
		  	cell1.className = "AbMdx_DimensionNames first";
		  	cell1.appendChild(textNodeEl);
		  
		  	// cells 3-6
		  	var cell2 = newRow.insertCell(1);
		  	var folderEl = document.createTextNode(getMessage("numberOfCases"));
		  	cell2.colSpan = 4;
		  	cell2.className = "AbMdx_DimensionNames";
		  	cell2.appendChild(folderEl);
		  	
		  	// cells 7-8
		  	var cell3 = newRow.insertCell(2);
		  	var folderEl = document.createTextNode(getMessage("numberOfDays"));
		  	cell3.colSpan = 2;
		  	cell3.className = "AbMdx_DimensionNames last";
		  	cell3.appendChild(folderEl);
		  	
		}
	},
	
	/**
	 * Get filter restriction
	 */
	getFilterRestriction: function(console){
		var restriction = new Ab.view.Restriction(); 

		var fieldId = 'ehs_incidents.incident_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.incident_type';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		if(console.getFieldValue('date_incident_from')){
			restriction.addClause('ehs_incidents.date_incident', console.getFieldValue('date_incident_from'), '>=');
		}
		if(console.getFieldValue('date_incident_to')){
			restriction.addClause('ehs_incidents.date_incident', console.getFieldValue('date_incident_to'), '<=');
		}
		
		fieldId = 'ehs_incidents.safety_officer';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.site_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.pr_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.bl_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.fl_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.em_id_affected';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.cause_category_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.injury_category_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		return restriction;
	}
});