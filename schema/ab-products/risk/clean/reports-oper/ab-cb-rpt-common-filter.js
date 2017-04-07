var abCbRptCommonFilterController = View.createController('abCbRptCommonFilterCtrl',{
    // selected projects + console restriction
    restriction: null,

    // restriction on assessments: assigned to logged in user
    userAssignedRestriction: "1=1",

    // selected projects + console printable restriction for paginated report
    printableRestriction: [],
    
    /* array of {table.field, field title, field value} objects
     * to display in the <instructions> element
     */
    instrLabels: [],
    
    // the controller of the container view
    panelsCtrl: null,
    
    // the projects panel of the container view
    projectsPanel: null,
    
    // visible fields group; values "site","proj"
    visibleFields: "",
    
    // paginated report name
    paginatedReportName: 'ab-cb-rpt-hl-bl-rm-pgrp.axvw',
    
    // is the DOC button a menu ?
    isDocButtonMenu: false,

    afterViewLoad: function(){
    	if(this.projectsPanel){
    		// hide DOC button on the console
    		if (this.abCbRptCommonFilter_console.getEl('abCbRptCommonFilter_paginatedReport')) {
    			this.abCbRptCommonFilter_console.showElement('abCbRptCommonFilter_paginatedReport', false);
    			setNextSiblingDisplay('abCbRptCommonFilter_paginatedReport', false);
    		}
    	}
    	
    	// construct the menu of the DOC button
    	if(this.isDocButtonMenu){
    		var docBtnObject = Ext.get('abCbRptCommonFilter_paginatedReport');
    		docBtnObject.on('click', this.showDOCMenu, this, null);
    	}
    	
    	// register onMultipleSelectionChange for projects panel
		this.abCbRptCommonFilter_projectsPanel.addEventListener('onMultipleSelectionChange',
				onMultipleSelectionChange_Projects.createDelegate(this, [this.abCbRptCommonFilter_projectsPanel]));
    	
        this.hideFields();
    },
    
    /**
	 * create and show DOC button menu
	 */
	showDOCMenu: function(e, item){
		var menuItems = [];
		menuItems.push({text: getMessage("menu_rooms"),
				handler: this.onDocMenu.createDelegate(this, ["rooms"])
		});
		menuItems.push({text: getMessage("menu_hazards"),
				handler: this.onDocMenu.createDelegate(this, ["hazards"])
		});
		menuItems.push({text: getMessage("menu_samples"),
				handler: this.onDocMenu.createDelegate(this, ["samples"])
		});
		var menu = new Ext.menu.Menu({items: menuItems});
	    menu.showAt(e.getXY());
	},
	
	/*
	 * DOC menu handler.
	 */
	onDocMenu: function(asset){
		switch (asset) {
		case "hazards":
			this.paginatedReportName = 'ab-cb-rpt-hl-haz-hazards-pgrp.axvw';
			break;

		case "samples":
			this.paginatedReportName = 'ab-cb-rpt-hl-haz-samples-pgrp.axvw';
			break;

		case "rooms":
		default:
			this.paginatedReportName = 'ab-cb-rpt-hl-bl-rm-pgrp.axvw';
			break;
		}

		this.abCbRptCommonFilter_console_onAbCbRptCommonFilter_paginatedReport(null, null, true);
	},

    /**
     * Shows the report grid according to the user restrictions
     */
    abCbRptCommonFilter_console_onFilter:function(){
    	// validateDates
    	var startDate = this.abCbRptCommonFilter_console.getFieldValue("date_assessed_" + this.visibleFields);
    	var endDate = this.abCbRptCommonFilter_console.getFieldValue("date_required_" + this.visibleFields);
    	if(!validateDates(startDate, endDate))
        	return;
    	
        this.setRestriction();
        
        this.panelsCtrl.refreshOnFilter(this.restriction, this.instrLabels);
    },
    
    /**
     * Sets the controller's attribute 'restriction'
     * according to the selected projects and the filter console selections
     */
    setRestriction: function(){
        this.instrLabels.length = 0;
        this.printableRestriction.length = 0;
        
        if(this.projectsPanel){
            var selectedProjectIds = getKeysForSelectedRows(this.projectsPanel, 'project.project_id');
            if(selectedProjectIds.length == 0)
                return;

            this.restriction = "activity_log.project_id IN ('" + selectedProjectIds.join("','") + "')";
            this.instrLabels.push({field: "activity_log.project_id", title: getMessage("project"), value: selectedProjectIds.join(", ")});
            this.printableRestriction.push({'title': getMessage("project"), 'value': selectedProjectIds.join(", ")});
        } else {
            this.restriction = "1=1";
        }
        
        this.addConsoleRestriction();
    },

    /**
     * Adds restriction to the controller restriction, according to the filter console selections
     */
    addConsoleRestriction: function() {
        var console = this.abCbRptCommonFilter_console;
        
        this.addGeoClause("bl.ctry_id");
        this.addGeoClause("bl.regn_id");
        this.addGeoClause("bl.state_id");
        this.addGeoClause("bl.city_id", "city_id_" + this.visibleFields);
        this.addGeoClause("bl.site_id");
        
        this.restriction += getRestrictionForField(console, "activity_log.project_id", this.instrLabels, this.printableRestriction);
        this.restriction += getRestrictionForField(console, "activity_log.prob_type", this.instrLabels, this.printableRestriction);
        this.restriction += getRestrictionForField(console, "activity_log.hcm_haz_status_id", this.instrLabels, this.printableRestriction);
        this.restriction += getRestrictionForField(console, "activity_log.hcm_cond_id", this.instrLabels, this.printableRestriction);
        this.restriction += getRestrictionForField(console, "activity_log.hcm_loc_typ_id", this.instrLabels, this.printableRestriction);
        this.restriction += getRestrictionForField(console, "activity_log.hcm_haz_rank_id", this.instrLabels, this.printableRestriction);
        this.restriction += getRestrictionForField(console, "activity_log.hcm_haz_rating_id", this.instrLabels, this.printableRestriction);
        this.restriction += getRestrictionForField(console, "activity_log.repair_type", this.instrLabels, this.printableRestriction);
        
        var isHazard1 = console.getFieldValue('hcm_is_hazard_or1');
		var isHazard2 = console.getFieldValue('hcm_is_hazard_or2');
		var consoleDs = console.getDataSource();
		var isHazardPrint ="";
		if(valueExistsNotEmpty(isHazard1) && valueExistsNotEmpty(isHazard2)){
			this.restriction += " AND (activity_log.hcm_is_hazard = '" + isHazard1 + "' OR activity_log.hcm_is_hazard = '" + isHazard2 +"')";
			isHazardPrint = consoleDs.formatValue("activity_log.hcm_is_hazard", isHazard1, true) + " " + getTitleOfConsoleField(console, "hcm_is_hazard_or2") + " " + consoleDs.formatValue("activity_log.hcm_is_hazard", isHazard2, true);
		}else if(valueExistsNotEmpty(isHazard1)){
        	this.restriction += " AND activity_log.hcm_is_hazard = '" + isHazard1 + "'";
        	isHazardPrint = consoleDs.formatValue("activity_log.hcm_is_hazard", isHazard1, true);
		}else if (valueExistsNotEmpty(isHazard2)) {
			isHazardPrint = consoleDs.formatValue("activity_log.hcm_is_hazard", isHazard2, true);
        	this.restriction += " AND activity_log.hcm_is_hazard = '" + isHazard2 + "'";
		}
				
		if(valueExistsNotEmpty(isHazard1) || valueExistsNotEmpty(isHazard2)){
			var title = getTitleOfConsoleField(console, "hcm_is_hazard_or1");
			this.instrLabels.push({field: "hcm_is_hazard_or1", title: title, value: isHazardPrint});
			this.printableRestriction.push({'title': title, 'value': isHazardPrint});
		}

        var isFriable = console.getFieldValue('activity_log.hcm_friable');
        if (valueExistsNotEmpty(isFriable)) {
            this.restriction += " AND activity_log.hcm_friable = '" + isFriable + "'";
            this.instrLabels.push({field: "activity_log.hcm_friable", title: getTitleOfConsoleField(console, "activity_log.hcm_friable"), value: isFriable});
            this.printableRestriction.push({'title': getTitleOfConsoleField(console, "activity_log.hcm_friable"), 'value': isFriable});
        }

        var date_fromId = "date_assessed_" + this.visibleFields;
        var date_from = console.getFieldValue(date_fromId);
        if (valueExistsNotEmpty(date_from)) {
            var title = getTitleOfConsoleField(console, date_fromId);
            this.restriction += " AND activity_log.date_assessed >= ${sql.date('" + date_from + "')}";
            this.instrLabels.push({field: "activity_log.date_assessed", title: title, value: date_from});
            this.printableRestriction.push({'title': title, 'value': date_from});
        }
        
        var date_toId = "date_required_" + this.visibleFields;
        var date_to = console.getFieldValue(date_toId);
        if (valueExistsNotEmpty(date_to)) {
            var title = getTitleOfConsoleField(console, date_toId);
            this.restriction += " AND activity_log.date_assessed <= ${sql.date('" + date_to + "')}";
            this.instrLabels.push({field: "activity_log.date_required", title: title, value: date_to});
            this.printableRestriction.push({'title': title, 'value': date_to});
        }
    },
    
    getConsoleRestriction: function() {
    	return (this.restriction == null) ? '1=1' : this.restriction;
    },

    /**
     * Adds restriction clause to the controller restriction for the given geographical field
     */
    addGeoClause: function(geoField, fieldAlias) {
        var console = this.abCbRptCommonFilter_console;
        var fieldId = fieldAlias ? fieldAlias : geoField;
        
        var fieldValue = console.hasFieldMultipleValues(fieldId) ? console.getFieldMultipleValues(fieldId) : console.getFieldValue(fieldId);
        if(valueExistsNotEmpty(fieldValue)){
            var fieldTitle = getTitleOfConsoleField(console, fieldId);
            var existsClause = "EXISTS(SELECT " + geoField + " FROM bl WHERE bl.bl_id = activity_log.bl_id AND " + geoField + " {0})";
            if(typeof(fieldValue) === 'object' && fieldValue instanceof Array){
                this.restriction += " AND " + existsClause.replace("{0}", "IN ('" + fieldValue.join("','") + "')");
                this.instrLabels.push({field: geoField, title: fieldTitle, value: fieldValue.join(", ")});
                this.printableRestriction.push({'title': fieldTitle, 'value': fieldValue.join(", ")});
            } else {
                this.restriction += " AND " + existsClause.replace("{0}", "= '" + fieldValue + "'");
                this.instrLabels.push({field: geoField, title: fieldTitle, value: fieldValue});
                this.printableRestriction.push({'title': fieldTitle, 'value': fieldValue});
            }
        }
    },

    /**
     * Hides the line with Site field or the one with Project field
     * @param {String} fieldsGroup Values in "site", "proj"
     */
    hideFields: function(){
        var fieldsToHide = (this.visibleFields == "site") ? "proj" : "site";
        this.abCbRptCommonFilter_console.showField("city_id_" + fieldsToHide, false);
        this.abCbRptCommonFilter_console.showField("date_assessed_" + fieldsToHide, false);
        this.abCbRptCommonFilter_console.showField("date_required_" + fieldsToHide, false);
        this.abCbRptCommonFilter_console.showField(fieldsToHide == "site" ? "bl.site_id" : "activity_log.project_id", false);
    },
    
    /**
     * generate paginated report for user selection
     */
    abCbRptCommonFilter_console_onAbCbRptCommonFilter_paginatedReport: function(button, event, forceReport){
    	// if DOC button has menu, do nothing, is the menu that handles
    	if(this.isDocButtonMenu && !forceReport){
    		return;
    	}
    	
    	// for Buildings and Rooms by Project, first select projects
    	if(this.paginatedReportName == "ab-cb-rpt-hl-bl-rm-prj-pgrp.axvw"){
    		var projPanel = this.abCbRptCommonFilter_projectsPanel;
    		projPanel.showInWindow({});
    		projPanel.refresh();
    		projPanel.actions.get("saveSelectedProjects").forcedDisabled = false;
    		return;
    	} else {
	        var parameters = null;
	        var consoleRestriction = (valueExistsNotEmpty(this.restriction) ? this.restriction : "1=1");
	        
	        parameters = {
	            'consoleRestriction': consoleRestriction,
	            'userAssignedRestriction': this.userAssignedRestriction,
	            'printRestriction': true, 
	            'printableRestriction': this.printableRestriction
	        };
	        
	        View.openPaginatedReportDialog(this.paginatedReportName, null, parameters);
    	}
    }
});

//Function to set the next sibling element to (not) display
//Used to clean/show the vertical lines between the action buttons 

function setNextSiblingDisplay(fieldName, display) {
	field=document.getElementById(fieldName);
	if (field != null && field.parentNode != null && field.parentNode.nextSibling) {
			field.parentNode.nextSibling.style.display = (display == true ? '' : 'none');
	}
}

/**
 * onMultipleSelectionChange event listener.
 * 
 * @param objGrid
 * @returns
 */
function onMultipleSelectionChange_Projects(grid){
	// if multiple selection is enabled 
	if ( grid.multipleSelectionEnabled ){
		// enable /disable save selected button
		var selectedRows = grid.getSelectedGridRows();
		grid.enableAction('saveSelectedProjects', selectedRows.length > 0);
		
		// check select all status
	    if(selectedRows.length === grid.gridRows.length){
			var checkAllEl = Ext.get(grid.id + '_checkAll');
			if (valueExists(checkAllEl)) {
				checkAllEl.dom.checked = true;
			}
	    }
	}
}

/**
 * Calls the paginated report with selected projects restriction
 * 
 */
function onSelectProjects(context){
	var grid = context.command.getParentPanel();
	var selectedProjectIds = getKeysForSelectedRows(grid, 'project.project_id');
	var restriction = "";
	var printableRestriction = [];
	
	// create the restriction with the selected projects
    if(selectedProjectIds.length > 0){
	    restriction = " AND activity_log.project_id IN ('" + selectedProjectIds.join("','") + "')";
	    printableRestriction.push({'title': getMessage("project"), 'value': selectedProjectIds.join(", ")});
    }
	
    // create the final restriction
    var parameters = null;
    var consoleRestriction = (valueExistsNotEmpty(abCbRptCommonFilterController.restriction) ? abCbRptCommonFilterController.restriction : "1=1");
    consoleRestriction += restriction;
    printableRestriction = abCbRptCommonFilterController.printableRestriction.concat(printableRestriction);
    
    parameters = {
        'consoleRestriction': consoleRestriction,
        'userAssignedRestriction': abCbRptCommonFilterController.userAssignedRestriction,
        'printRestriction': true, 
        'printableRestriction': printableRestriction
    };
    
    // close the projects popup
    grid.closeWindow();
    
    View.openPaginatedReportDialog(abCbRptCommonFilterController.paginatedReportName, null, parameters);
}