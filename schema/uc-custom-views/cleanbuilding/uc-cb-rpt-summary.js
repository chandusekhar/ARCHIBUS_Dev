var abCbRptSummaryController = View.createController('abCbRptSummaryCtrl',{
	filterController: null,
	
	// tabs' panels with their restriction and their instruction label
	panelsRestriction: [{id: "abCbRptSummary_panelSubstance", restriction: null},
	                    {id: "abCbRptSummary_panelProject", restriction: null},
	                    {id: "abCbRptSummary_panelSite", restriction: null},
	                    {id: "abCbRptSummary_panelBuilding", restriction: null},
	                    {id: "abCbRptSummary_panelBlBySubst", restriction: null},
	                    {id: "abCbRptSummary_panelFloor", restriction: null},
	                    {id: "abCbRptSummary_panelRoom", restriction: null},
	                    {id: "abCbRptSummary_panelAssessments", restriction: null}
	                    ],

    afterViewLoad:function(){
    	this.filterController = View.controllers.get("abCbRptSummaryFilterCtrl");
    	this.filterController.panelsCtrl = this;
    	this.filterController.tabsObject = this.abCbRptSummary_tabs;
	},

	/**
	 * On click event
	 * @param {Object} commandObject The clicked line command
	 * @param {Object} tabIndex
	 */
	onClickItem: function(commandObject, tabIndex) {
		var filterRestriction = this.filterController.restriction;
		
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
			var restriction = this.getFinalRestriction(filterRestriction, panelRestriction.restriction);
			
			// set the instructions element
			this.setInstructionsElement(i);
			
			// refresh the panel
			View.panels.get(panelRestriction.id).refresh(restriction);
		}
		
		// select the next tab
		this.abCbRptSummary_tabs.selectTab(this.abCbRptSummary_tabs.tabs[tabIndex + 1].name);
	},
	
	/**
	 * Builds the final restriction: (projects selection + console) + click in a crossTable row
	 */
	getFinalRestriction: function(filterRestriction, clickRestriction){
		var finalRestr = filterRestriction;
		
		if(clickRestriction){
			for ( var i = 0; i < clickRestriction.clauses.length; i++) {
				var clause = clickRestriction.clauses[i];
				if(clause.op === "IS NULL") {
					finalRestr += " AND " + clause.name + " " + clause.op;
				} else {
					finalRestr += " AND " + clause.name + " = " + "'" + clause.value + "'";
				}
			}
		}
		
		return finalRestr;
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
				} else {
					destRestr.addClause('activity_log.site_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('activity_log.bl_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.bl_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'activity_log.vf_site_bl_subst':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('activity_log.site_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.site_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('activity_log.bl_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.bl_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // prob_type
					destRestr.addClause('activity_log.prob_type', splitValue[2], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.prob_type', "", "IS NULL", 'AND', true);
				}
				break;

			case 'activity_log.vf_site_bl_fl':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('activity_log.site_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.site_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('activity_log.bl_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.bl_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // fl_id
					destRestr.addClause('activity_log.fl_id', splitValue[2], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.fl_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'activity_log.vf_site_bl_fl_rm':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('activity_log.site_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.site_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('activity_log.bl_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.bl_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // fl_id
					destRestr.addClause('activity_log.fl_id', splitValue[2], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.fl_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[3])){ // rm_id
					destRestr.addClause('activity_log.rm_id', splitValue[3], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.rm_id', "", "IS NULL", 'AND', true);
				}
				break;

			default:
				destRestr.addClause(clause.name, clause.value, valueExistsNotEmpty(clause.value) ? clause.op : "IS NULL", clause.relop, true);
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
		var panelRestriction = this.panelsRestriction[panelIndex].restriction;
		
		for (var i = 0; i < this.filterController.instrLabels.length; i++) {
			instructions.push(this.filterController.instrLabels[i]);
		}
		
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
		var parameters = {
	        'consoleRestriction': commandObject.getParentPanel().restriction,
	        'printRestriction': true, 
	        'printableRestriction': abCbRptSummaryController.filterController.printableRestriction
	    };
		
		View.openPaginatedReportDialog(pagRepName, null, parameters);
	}
});
