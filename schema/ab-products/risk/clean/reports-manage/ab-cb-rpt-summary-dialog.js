var abCbRptSummaryDialogController = View.createController('abCbRptSummaryDialogCtrl',{
	
	
	// tabs' panels with their restriction and their instruction label
	panelsRestriction: [{id: "abCbRptSummaryDialog_panelSubstance", restriction: null},
	                    {id: "abCbRptSummaryDialog_panelProject", restriction: null},
	                    {id: "abCbRptSummaryDialog_panelSite", restriction: null},
	                    {id: "abCbRptSummaryDialog_panelBuilding", restriction: null},
	                    {id: "abCbRptSummaryDialog_panelBlBySubst", restriction: null},
	                    {id: "abCbRptSummaryDialog_panelFloor", restriction: null},
	                    {id: "abCbRptSummaryDialog_panelRoom", restriction: null},
	                    {id: "abCbRptSummaryDialog_panelAssessments", restriction: null}
	                    ],
	/**
	 * On click event
	 * @param {Object} commandObject The clicked line command
	 * @param {Object} tabIndex
	 */
	onClickItem: function(commandObject, tabIndex) {
		
		
		var selectedPanelRestr = new Ab.view.Restriction();
		if(this.panelsRestriction[tabIndex].restriction){
			selectedPanelRestr.addClauses(this.panelsRestriction[tabIndex].restriction);
		}
		
		for (var i = (tabIndex + 1); i < this.panelsRestriction.length; i++) {
			var panelRestriction = this.panelsRestriction[i];

			// set the restriction of the clicked panel
			panelRestriction.restriction = new Ab.view.Restriction();
			panelRestriction.restriction.addClauses(selectedPanelRestr);

			// build the restriction according to user's click in a row
			if(commandObject.restriction.clauses.length > 0){
				var splitRestriction = this.getCmdObjRestriction(commandObject.restriction);
				panelRestriction.restriction.addClauses(splitRestriction);
			}
			
			// get the final restriction: (projects selection + console) + click in a crossTable row
			var restriction = panelRestriction.restriction;
			
			// set the instructions element
			this.setInstructionsElement(i);
			
			// refresh the panel
			View.panels.get(panelRestriction.id).refresh(restriction);
		}
		
		// select the next tab
		this.abCbRptSummaryDialog_tabs.selectTab(this.abCbRptSummaryDialog_tabs.tabs[tabIndex + 1].name);
	},
	
	/**
	 * Returns a Restriction object from the given restriction,
	 * with the composed clauses split into simple clauses
	 * (ex: site + bl clause split into site clause and bl clause)
	 */
	getCmdObjRestriction: function(srcRestr){
		var destRestr = new Ab.view.Restriction();
		
		for(var i=0; i<srcRestr.clauses.length; i++){
			var clause = srcRestr.clauses[i];
			switch (clause.name) {
			case 'activity_log.vf_site_bl':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('activity_log.site_id', splitValue[0], '=', 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('activity_log.bl_id', splitValue[1], '=', 'AND', true);
				}
				break;

			case 'activity_log.vf_site_bl_subst':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('activity_log.site_id', splitValue[0], '=', 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('activity_log.bl_id', splitValue[1], '=', 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // prob_type
					destRestr.addClause('activity_log.prob_type', splitValue[2], '=', 'AND', true);
				}
				break;

			case 'activity_log.vf_site_bl_fl':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('activity_log.site_id', splitValue[0], '=', 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('activity_log.bl_id', splitValue[1], '=', 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // fl_id
					destRestr.addClause('activity_log.fl_id', splitValue[2], '=', 'AND', true);
				}
				break;

			case 'activity_log.vf_site_bl_fl_rm':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('activity_log.site_id', splitValue[0], '=', 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('activity_log.bl_id', splitValue[1], '=', 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // fl_id
					destRestr.addClause('activity_log.fl_id', splitValue[2], '=', 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[3])){ // rm_id
					destRestr.addClause('activity_log.rm_id', splitValue[3], '=', 'AND', true);
				}
				break;

			default:
				destRestr.addClause(clause.name, clause.value, clause.op, clause.relop, true);
				break;
			}
		}
		
		return destRestr;
	},
	
	
	/**
	 * Gets the instructions object from the filter controller
	 * and merge it with the restriction of the given panel,
	 * into a new instructions element for the given panel
	 */
	setInstructionsElement: function(panelIndex){
		var instructions = [];
		var panelRestriction = (this.panelsRestriction[panelIndex].restriction) ? this.panelsRestriction[panelIndex].restriction : View.panels.items[panelIndex].restriction;
		
		for (var i = 0; i < panelRestriction.clauses.length; i++) {
			var clause = panelRestriction.clauses[i];

			// remove the potential existent instruction
			for (var j = 0; j < instructions.length; j++) {
				if(instructions[j].field == clause.name){
					instructions.splice(j,1);
					break;
				}
			}
			
			instructions.push({field: clause.name, title: this.getFieldTitle(clause.name), value: clause.value});
		}
		
		this.setInstructions(instructions, panelIndex);
	},
	
	/**
	 * Fills instructions element with the current restriction
	 */
	setInstructions: function(instructions, panelIndex){
		var labels = "";
		
	    for (var i = 0; i < instructions.length; i++) {
	        var field = instructions[i];
	        labels += field.title + ": " + field.value + "; ";
	    }

	    if(panelIndex){
	    	View.panels.get(this.panelsRestriction[panelIndex].id).setInstructions(labels);
	    } else {
			for (var i = 0; i < this.panelsRestriction.length; i++) {
				var panelRestriction = this.panelsRestriction[i];
				View.panels.get(panelRestriction.id).setInstructions(labels);
			}
	    }
	},
	
	getFieldTitle: function(fieldName){
		switch (fieldName) {
		case "activity_log.project_id":
			return getMessage("title_project");
			break;

		case "activity_log.prob_type":
			return getMessage("title_substance");
			break;

		case "activity_log.site_id":
			return getMessage("title_site");
			break;

		case "activity_log.bl_id":
			return getMessage("title_bldg");
			break;

		case "activity_log.fl_id":
			return getMessage("title_floor");
			break;

		case "activity_log.rm_id":
			return getMessage("title_room");
			break;

		default:
			return "";
			break;
		}
	},
	
	onPaginatedReport: function(commandObject, pagRepName){
		var panel = commandObject.getParentPanel();
		var filterRestr = panel.parameters ? panel.parameters.filterRestriction : null;
		var filterPrintableRestriction = panel.parameters ? panel.parameters.filterPrintableRestriction : null;
		
		var printableRestriction = getPrintableRestrictionFromClauses(panel.restriction.clauses, panel);
		
		var parameters = {
	        'consoleRestriction': getSqlFromClauses(panel.restriction.clauses)
	        					+ (valueExistsNotEmpty(filterRestr) ? " AND " + filterRestr : ""),
	        'printRestriction':true,
	        'printableRestriction': filterPrintableRestriction.concat(printableRestriction)
	    };
		
		View.openPaginatedReportDialog(pagRepName, null, parameters);
	}
});


/**
 * Generate a string SQL from the clauses of a Ab.view.Restriction object.
 * 
 * @param restrClauses
 * @returns {String}
 */
function getSqlFromClauses( restrClauses){
	
	var restriction  = " 1=1 ";
	for (var i = 0; i<restrClauses.length; i++){
		restriction += " and " + restrClauses[i].name + " ='" + restrClauses[i].value + "' ";
	}
	return restriction
}

/**
 * Generate a printable restriction from the clauses of a Ab.view.Restriction object.
 * 
 * @param restrClauses
 * @returns map({title,value})
 */
function getPrintableRestrictionFromClauses(restrClauses, panel){
	var printableRestriction = [];
	var ds = panel.getDataSource();
	for (var i = 0; i<restrClauses.length; i++){
		printableRestriction.push({'title':abCbRptSummaryDialogController.getFieldTitle(restrClauses[i].name), 'value': restrClauses[i].value});
	}
	return printableRestriction
}