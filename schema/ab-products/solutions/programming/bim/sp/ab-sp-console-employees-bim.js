/**
 * Controller for the Employees panel.
 *
 * Events:
 * app:space:express:console:beginAssignment
 * app:space:express:console:locateEmployeesOrRooms
 * app:space:express:console:addEmployeeWaiting
 * app:space:express:console:unassignEmployees
 */
var spaceExpressConsoleEmployees = View.createController('spaceExpressConsoleEmployees', {
	
	/**
	 * indicate locating employee.
	 */
	isLocatingEmployee: false,

    /**
     * location and occupancy restrictions applied from the filter panel.
     * this is custom filter use only for current em tab.
     */
    emFilter: null,

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'click #employeeRestrictToLocation': function() {
            this.onCheckEvent();
        },
        'click #employeeUnassigned': 'toggleUnassigned'
    },

    /**
     * Constructor.
     */
    afterCreate: function() {
        this.on('app:space:express:console:emFilter', this.refresh);
        this.on('app:space:express:console:changeMode', this.afterChangeMode);
        this.on('app:space:express:console:setLocateEmployeeFlag', this.setLocateEmployeeFlag);
    },

    /**
     * Sets the initial UI state.
     */
    afterViewLoad: function() {
        var template = _.template('<td class="checkbox-container">' +
            '<input type="checkbox" id="employeeRestrictToLocation" checked="false"/><span id="employeesResMessageSpan">{{restrictToLocation}}</span>&nbsp;&nbsp;' +
            '<input type="checkbox" id="employeeUnassigned"/><span>{{unassigned}}</span>' +
            '</td>');
        Ext.DomHelper.insertHtml('afterBegin', this.employeeGrid.toolbar.tr, template(View.messages));
        Ext.fly('employeeRestrictToLocation').setDisplayed(false);
        Ext.fly('employeesResMessageSpan').setDisplayed(false);
        this.employeeGrid.actionbar.actions.each(function (action) {
            action.show(true);
        });
        
        this.enableSortLocationAndOrganization();
    },
    
    /**
     * after Initial Data Fetch.
     */
    afterInitialDataFetch: function() {
    	this.hidePagingForVirtualColumn();
    },
    
    /**
     *  hide the paging just when the user clicks on a sort for a virtual field,
     *  and then show paging again when the user clicks on another sort field.
     */
    hidePagingForVirtualColumn: function() {
    	var locationHeader = getMessage("locationHeader");
    	var organizationHeader = getMessage("organizationHeader");
    	var nameHeader = getMessage("nameHeader");
    	var editHeader = getMessage("editHeader");
    	var pageNext = getMessage("pageNext");
    	//get the virtual field headers.
    	var customizedHeaders = jQuery("#grid_employeeGrid_header").find("th[id*='sortHeader'] div:contains("+locationHeader+"), " +
    			"th[id*='sortHeader'] div:contains("+organizationHeader+"), th[id*='sortHeader'] div:contains("+nameHeader+")");
    	
    	//hide the paging just when the user clicks on a sort for a virtual field,
    	jQuery(customizedHeaders).each(function() {
    		jQuery(this).parent().on("click", function() {
    			jQuery("#grid_employeeGrid_footer a").text("");
            });
    	})
    	//show paging again when the user clicks on another sort field.
    	jQuery("#grid_employeeGrid_header").find("th[id*='sortHeader']").each(function() {
    		var text = jQuery(this).find("div").text();
    		if (text!= "" && text != locationHeader && text != organizationHeader && text.indexOf(nameHeader)==-1 && text != editHeader) {
    			jQuery(this).on("click", function() {
    				jQuery("#grid_employeeGrid_footer a").text(pageNext);
    			});
    		}
    	})
    },
    
    /**
     * Ensure that the grid columns are right-sized inside the tab.
     */
    afterChangeMode: function() {
        this.employeeGrid.resizeColumnWidths();
    },
    
    /**
     * add the ability to sort on calculated field location and organization.
     */
    enableSortLocationAndOrganization: function() {
    	this.employeeGrid.setFilterConfiguration({
            columns: {
                'em.location': {
                     fields: ['rm.bl_id', 'rm.fl_id', 'rm.rm_id'],
                     delimiter: '-',
                     placeholders: ['building', 'floor', 'room']
                },

                'em.organization': {
                     fields: ['em.dv_id', 'em.dp_id'],
                     delimiter: '-',
                     placeholders: ['division', 'department']
                }
            }
        });
    },

    /**
     * Called when the user checks on un-checks the Unassigned check box
     */
    toggleUnassigned: function() {
        var unassigned = $('employeeUnassigned').checked;
        var searchStr = this.emFilter.searchValuesString + this.emFilter.otherSearchValuesString;
    	var	refreshRestriction = new Ab.view.Restriction();
        //kb 3040516 remove the common method. refresh the employee grid according different condition.
    	if (searchStr != '') {
    		this.employeeGrid.addParameters(this.emFilter.parameters);
    	} 
        if (unassigned) {
            refreshRestriction = this.getUnassignedRestriction();
        }
        if (!$('employeeRestrictToLocation').checked) {
        	this.employeeGrid.clearParameters();
        }
    	this.employeeGrid.refresh(refreshRestriction);

    },

    /**
     * Applies the filter restriction to the employee grid.
     */
    refresh: function(filter) {
    	var parameterOccupancy= filter.parameters["occupancy"];
    	if (filter) {
    		//use custom filter emFilter replace common filter.
            this.emFilter =  jQuery.extend(true, {}, filter);
            this.trigger('app:space:express:console:setEmClauseToFilter', this.emFilter);
    		//set custom parameter with different table name.
    		if (filter.parameters["occupancy"].indexOf("EXISTS")!=-1) {
    			this.emFilter.parameters["occupancy"] = createOccupancyRestriction();
    		}
    		var rmExists = " AND rm.bl_id ${sql.concat} rm.fl_id ${sql.concat} rm.rm_id is not null ";
    		if (filter.parameters["organizationUnassigned"].indexOf("IS NULL")!=-1) {
    			this.emFilter.parameters["organizationUnassigned"] = filter.parameters["organizationUnassigned"]+rmExists;
    		}
    		if (filter.parameters["typeUnassigned"].indexOf("IS NULL")!=-1) {
    			this.emFilter.parameters["typeUnassigned"] = filter.parameters["typeUnassigned"]+rmExists;
    		}
    		if (filter.parameters["totalArea"].indexOf("total_area")!=-1||filter.parameters["totalArea"].indexOf("total_count")!=-1) {
    			this.emFilter.parameters["totalArea"] = getTotalAreaAndCountQueryParameter("em");
    		}
        }
    	//this.employeeGrid.refresh(this.emFilter.restriction);
    	abSpConsole_refreshDataFromFilter(this.employeeGrid, this.emFilter, this.getUnassignedRestriction());
    	abSpConsole_toggleFromFilter('employeeRestrictToLocation', ['employeeRestrictToLocation','employeesResMessageSpan'], 
    			'employeesResMessageSpan', this.emFilter.searchValuesString + this.emFilter.otherSearchValuesString);
        
        var checkedRecords = this.employeeGrid.getSelectedRows();
        //check original record which checked before to keep the status.
        this.checkOriginalRecords(checkedRecords);
    },
    
    /**
     * invoke when use click employee Restrict To Location.
     */
    onCheckEvent: function() {
        var employeeRestrict = $('employeeRestrictToLocation').checked;
        var unassigned = $('employeeUnassigned').checked;
        //add atrribute unassigned to parameter 'emFilter', that flag means refresh employeeGrid with only restriction 'unassigned'.
        if (unassigned && !employeeRestrict) {
        	this.emFilter.unassignedRes = this.getUnassignedRestriction();
        }
    	abSpConsole_toggleFromCheckEvent('employeeRestrictToLocation', ['employeeRestrictToLocation','employeesResMessageSpan'], 'dpResMessageSpan',
    			this.emFilter.searchValuesString + this.emFilter.otherSearchValuesString);
    	abSpConsole_refreshDataFromCheckEvent('employeeRestrictToLocation', this.employeeGrid, this.emFilter, this.getUnassignedRestriction());
    	
    	var checkedRecords = this.employeeGrid.getSelectedRows();
        //check original record which checked before to keep the status.
        this.checkOriginalRecords(checkedRecords);

    	this.emFilter.unassignedRes = null;
    },
    
    /**
     * get the unassigned restriction if the checkbox's status is 'checked or true'.
     */
    getUnassignedRestriction: function() {
    	var unassigned = Ext.getDom('employeeUnassigned').checked;
    	var restriction = new Ab.view.Restriction(); 
    	if (unassigned) {
    		restriction.addClause('em.bl_id', '', 'IS NULL');
            restriction.addClause('em.fl_id', '', 'IS NULL');
            restriction.addClause('em.rm_id', '', 'IS NULL');
    	}
    	return restriction;
    },
    
    /**
     * get checked records before refresh grid.
     */
    checkOriginalRecords: function(checkedRecords) {
    	var checkedLocation = [];
    	var rows = this.employeeGrid.rows;
    	for (var i = 0; i < rows.length; i++) {
    		var row = rows[i];
    		for (var j=0;j<checkedRecords.length; j++ ) {
    			var checkedRow = checkedRecords[j];
    			if (row["em.em_id"] == checkedRow["em.em_id"]) {
    				row.row.select();
    				break;
    			}
    		}
    	}
    	if (checkedRecords&&checkedRecords.length>0) {
    		this.employeeGrid.actionbar.actions.each(function (action) {
    			action.enable(true);
    		});
    	}
    },
    

    /**
     * Initializes the employee assignment mode when the user clicks on an employee row.
     * @param row
     */
    employeeGrid_onMultipleSelectionChange: function(row) {
        var employees = [];
        var rows = this.employeeGrid.getSelectedGridRows();
        for (var i = 0; i < rows.length; i++) {
            employees.push(this.createEmployeeAssignmentFromGridRow(rows[i]));
        }
        
        if (!this.isLocatingEmployee) {
        	
    		this.trigger('app:space:express:console:beginAssignment', {
                type: 'employee',
                employees: employees
            });
        	
        }
        // console is a 'read-only' version, for those users who do not have authority to make any edits or assignments
    	this.disableButtonIfReadOnlyUserGroup();
    },
    
    /**
     * console is a 'read-only' version, for those users who do not have authority to make any edits or assignments
     */
    disableButtonIfReadOnlyUserGroup: function() {
    	if (!View.user.isMemberOfGroup('SPACE-CONSOLE-ALL-ACCESS')) {
            this.employeeGrid.actionbar.actions.each(function (action) {
            	if (action.id == 'unassign') {
            		action.enable(false);
            	}
            });
    	}
    },
    
    /**
     * when on waiting button click, trigger method 'addEmployeeWaiting'.
     */
    employeeGrid_onWaiting: function() {
        var assignments = [];
        var rows = this.employeeGrid.getSelectedGridRows();
        for (var i = 0; i < rows.length; i++) {
            assignments.push(this.createEmployeeAssignmentFromGridRow(rows[i]));
        }

        this.employeeGrid.refresh();

        this.trigger('app:space:express:console:addEmployeeWaiting', assignments);
    },
    
    /**
     * when on unassign button click, trigger method 'unassignEmployees'.
     */
    employeeGrid_onUnassign: function() {
        var assignments = [];
        var rows = this.employeeGrid.getSelectedGridRows();
        var location = '';
        for (var i = 0; i < rows.length; i++) {
            assignments.push(this.createEmployeeAssignmentFromGridRow(rows[i]));
            //kb 3042586 get location from em table.
            location+= (rows[i].getFieldValue('em.location'));
        }
        // when checked employee contains rows all without location.
        //then do not show warning message when click 'Unassign' button.
        if (location!= '--') {
        	var controller = this;
        	var message = getMessage('unassignEmployeeWarning');
        	View.confirm(message, function(button) {
        		if (button == 'yes') {
        			controller.employeeGrid.unselectAll();
        			controller.trigger('app:space:express:console:unassignEmployees', assignments);
        		}
        	});
        }
    },

    /**
     * Creates a new pending assignment from an employee record.
     * @param row
     * @return {Object}
     */
    createEmployeeAssignmentFromGridRow: function(row) {
        return {
            type: 'employee',
            em_id: row.getFieldValue('em.em_id'),
            bl_id: row.getFieldValue('rm.bl_id'),
            fl_id: row.getFieldValue('rm.fl_id'),
            rm_id: row.getFieldValue('rm.rm_id'),
            to_bl_id: '',
            to_fl_id: '',
            to_rm_id: ''
        };
    },
    
    /**
     * method invoke when remove pending assignment button click.
     */
    employeePendingAssignments_onRemovePendingAssignment: function(row) {
        this.trigger('app:space:express:console:removeAssignment', {
            em_id: row.getFieldValue('em.em_id'),
            location: row.getFieldValue('em.to')
        });
    },

    
    /**
     * method invoke when cancel employee pending assignment event click.
     */
    employeePendingAssignments_onCancelEmployeePendingAssignments: function() {
        this.trigger('app:space:express:console:cancelEmployeeAssignment');
    },

    
    /**
     * method invoke when commit employee button click.
     */
    employeePendingAssignments_onCommitEmployeePendingAssignments: function() {
    
    },
    
    /**
     * we refresh the employee grid after we save the form so that the user can see the results immediately.
     */
    editEmployeeForm_onSave: function() {
    	if (this.editEmployeeForm.save()) {
    		this.employeeGrid.refresh();
    	}
    },
    
    /**
     * set the flag to locate employee to avoid assign model.
     */
    setLocateEmployeeFlag: function(flag) {
    	this.isLocatingEmployee = flag;
    },

    /**
     * grid after refresh.
     * remove the page number after refresh.and
     * for the'Last, First name' column, add a space after the comma.
     */
    employeeGrid_afterRefresh: function() {
    	//remove the page number after refresh.
		jQuery("#employeeGrid_indexRow").remove();
		//make the check box disabled if user is not 'SPACE-CONSOLE-ALL-ACCESS'.
		//implement this feature in js because 
		// multipleSelectionEnabled="${user.isMemberOfGroup('SPACE-CONSOLE-ALL-ACCESS')}"
		// was not support in axvw.
    	if (!View.user.isMemberOfGroup('SPACE-CONSOLE-ALL-ACCESS')) {
    		jQuery("#employeeGrid input[type=checkbox]").attr("disabled","true");
    	}
    	//for the'Last, First name' column, add a space after the comma.
    	var nameHeader = getMessage("nameHeader");
    	var th = jQuery("#grid_employeeGrid_header th[id*='sortHeader'] div:contains("+nameHeader+")").parent();
    	var index = jQuery("#grid_employeeGrid_header th[id*='sortHeader']").index(th.get(0));
    	jQuery("#grid_employeeGrid_body tr").each(function(){
    		var $td = jQuery(this).find("td:eq("+index+"):contains(',')");
    		var textWithComma = jQuery($td).text().replace(",",",&nbsp;&nbsp;");
        	jQuery($td).empty().append(textWithComma);
            if(!/\S[\,]\s\s\S/.test(jQuery($td).text())){ 
        		var newText = jQuery($td).text().replace(",","");
            	jQuery($td).empty().append(jQuery.trim(newText));
        	}
    	});
	}
});

/**
 * Highlights selected employee on the drawing. Only highlights employee that are located on visible floors.
 */
function locateEmployee() {
	var thisController = View.controllers.get('spaceExpressConsoleEmployees');
    var employeeGrid = View.panels.get('employeeGrid');
    var rowIndex = employeeGrid.rows[employeeGrid.selectedRowIndex];
    employeeGrid.unselectAll();
    rowIndex.row.select();
    var em_id = rowIndex["em.em_id"];
    var bl_id = rowIndex["rm.bl_id"];
    var fl_id = rowIndex["rm.fl_id"];
    var rm_id = rowIndex["rm.rm_id"];
    var dwgname = rowIndex["rm.dwgname"];

    var employees = [];
    employees.push({
        em_id: em_id,
        bl_id: bl_id,
        fl_id: fl_id,
        rm_id: rm_id,
        dwgname: dwgname
    });
    thisController.trigger('app:space:express:console:setLocateEmployeeFlag', true);
    thisController.trigger('app:space:express:console:locateEmployeesOrRooms', employees, true);
    employeeGrid.unselectAll();
    thisController.trigger('app:space:express:console:setLocateEmployeeFlag', false);
}


/**
 * Export in XLS format.
 */
function exportEmToXLS() {
	doEmCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, 'xls');
}

/**
 * Export in docx format.
 */
function exportEmToDOCX() {
	doEmCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, 'docx');
}

/**
 * Get customed report.
 * 
 * @param workflowRuleName
 * @param outputType
 */
function doEmCustomExport(workflowRuleName, outputType) {
	var ds = 'employeeDS';
	var categoryFieldsArray = [
	                           abSpConsole_getFieldDef(ds, 'em.em_id'),
	                           abSpConsole_getFieldDef(ds, 'em.location'), 
	                           abSpConsole_getFieldDef(ds, 'em.organization'),
	                           abSpConsole_getFieldDef(ds, 'em.total_area')];
	
	var employeeRestrictToLocationChecked = Ext.getDom('employeeRestrictToLocation').checked;
	var employeeUnassignedChecked = Ext.getDom('employeeUnassigned').checked;
	
	var employeeGrid = View.panels.get("employeeGrid");
	var parameters = employeeGrid.getParametersForRefresh();
	
	var hasRes = employeeRestrictToLocationChecked ? true: false;
	
	if (!employeeRestrictToLocationChecked && employeeUnassignedChecked) {
		parameters = {};
	} 
	if (employeeUnassignedChecked) {
		parameters['emUnassigned'] = " em.bl_id IS NULL AND em.fl_id IS NULL AND  em.rm_id IS NULL ";
	}
	var restriction = spaceExpressConsoleEmployees.emFilter.restriction;
	var printableRestrictions = getPrintableRestrictions(restriction, hasRes);
	parameters.printRestriction = hasRes;
	
	if (employeeUnassignedChecked) {
		printableRestrictions.push({'title': getMessage("unassignedEmployee"), 'value': '[Yes]'});
		parameters.printRestriction = true;
	}
	if (hasRes) {
		//add em code print restriction only for employee tab.
		var em_id_value = View.panels.get("locationFilter").getFieldValue('em.em_id');
		if (valueExistsNotEmpty(em_id_value)) {
			printableRestrictions.push({'title': getMessage("employeeCode"), 'value': em_id_value});
		}
	}
	
	parameters.printableRestriction = printableRestrictions;
	parameters.categoryFields = categoryFieldsArray;
	
	var jobId = '';
	if (outputType == 'xls') {
		jobId = employeeGrid.callXLSReportJob(getMessage("employeeReport"),'',parameters);
	} else {
		jobId = employeeGrid.callDOCXReportJob(getMessage("employeeReport"),'',parameters);
	}
	doExportPanel(jobId, outputType);
}
