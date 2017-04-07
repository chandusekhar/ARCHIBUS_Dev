var abCbRptDrilldownController = View.createController('abCbRptDrilldownCtrl',{
	filterController: null,
	
	// tabs' panels with their restriction and their instruction label
	panelsRestriction: [{id: "abCbRptDrilldown_panelCountry", restriction: null},
	                    {id: "abCbRptDrilldown_panelRegion", restriction: null},
	                    {id: "abCbRptDrilldown_panelState", restriction: null},
	                    {id: "abCbRptDrilldown_panelCity", restriction: null},
	                    {id: "abCbRptDrilldown_panelSite", restriction: null},
	                    {id: "abCbRptDrilldown_panelBldg", restriction: null},
	                    {id: "abCbRptDrilldown_panelFloor", restriction: null},
	                    {id: "abCbRptDrilldown_panelRoom", restriction: null},
	                    {id: "abCbRptDrilldown_panelAssessments", restriction: null}
	                    ],

    afterViewLoad:function(){
    	this.filterController = View.controllers.get("abCbRptCommonFilterCtrl");
    	this.filterController.projectsPanel = this.abCbRptProjects_projectsPanel;
    	this.filterController.panelsCtrl = this;
    	this.filterController.visibleFields = "site";
	},

	/**
	 * Shows the report grid according to the user restrictions
	 */
	refreshOnFilter: function(restriction, instrLabels){
		if(restriction == null) {
			View.showMessage(getMessage('noProjectSelected'));
       		return;
		}

		for (var i = 0; i < this.panelsRestriction.length; i++) {
			var panelRestriction = this.panelsRestriction[i];

			// set the restriction to null
			panelRestriction.restriction = null;
			
			// refresh the panel with the filter restriction
			View.panels.get(panelRestriction.id).refresh(restriction);
		}

		this.abCbRptDrilldown_tabs.selectTab(this.abCbRptDrilldown_tabs.tabs[0].name);
		
		this.setInstructions(instrLabels);
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
		this.abCbRptDrilldown_tabs.selectTab(this.abCbRptDrilldown_tabs.tabs[tabIndex + 1].name);
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
			case 'activity_log.vf_ctry_regn':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('bl.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // regn_id
					destRestr.addClause('bl.regn_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.regn_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'activity_log.vf_ctry_state':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('bl.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // state_id
					destRestr.addClause('bl.state_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.state_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'activity_log.vf_ctry_state_city':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('bl.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // state_id
					destRestr.addClause('bl.state_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.state_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // city_id
					destRestr.addClause('bl.city_id', splitValue[2], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.city_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'activity_log.vf_ctry_site':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('bl.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // site_id
					destRestr.addClause('bl.site_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.site_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'activity_log.vf_ctry_site_bldg':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('bl.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // site_id
					destRestr.addClause('bl.site_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.site_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // bl_id
					destRestr.addClause('activity_log.bl_id', splitValue[2], '=', 'AND', true);
				} else {
					destRestr.addClause('activity_log.bl_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'activity_log.vf_site_bldg_floor':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('bl.site_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.site_id', "", "IS NULL", 'AND', true);
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

			case 'activity_log.vf_site_bldg_floor_room':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('bl.site_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('bl.site_id', "", "IS NULL", 'AND', true);
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
		case "bl.ctry_id":
			return getMessage("title_country");
			break;

		case "bl.regn_id":
			return getMessage("title_region");
			break;

		case "bl.state_id":
			return getMessage("title_state");
			break;

		case "bl.city_id":
			return getMessage("title_city");
			break;

		case "bl.site_id":
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
	        'printableRestriction': abCbRptDrilldownController.filterController.printableRestriction
	    };
		
		View.openPaginatedReportDialog(pagRepName, null, parameters);
	}
});
