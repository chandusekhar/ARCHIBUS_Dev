/**
 * Controller for the Departments tree.
 *
 * Events:
 * app:space:express:console:beginAssignment
 * app:space:express:console:removeAssignment
 * app:space:express:console:cancelAssignment
 */
var spaceExpressConsoleDepartments = View.createController('spaceExpressConsoleDepartments', {

    /**
     * location and occupancy restrictions applied from the filter panel.
     * this is custom filter use only for current Rmstd tab.
     */
    rmFilter: null,
    
    /**
     * Last division id.
     */
    lastDvId:null,
    
    /**
     * Last department id.
     */
    lastDepartId:null,
    
    /**
     * Remember what was clicked and toggle on and off the tabs tree.
     */
    lastClicked:null,

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'click #departmentRestrictToLocation': function() {
            this.onCheckEvent();
        }
    },
    
    /**
     * Constructor.
     */
    afterCreate: function() {
        this.on('app:space:express:console:orgFilter', this.refresh);
    },

    /**
     * Insert filter message span and checkbox.
     * Initialize the department tree.
     */
    afterViewLoad: function() {
    	this.insertDepartmentFilterMessage();
    	this.initializeDepartmentTree();
    },
    
    /**
     * Insert filter message span and checkbox.
     * Add by heqiang
     */
    insertDepartmentFilterMessage: function() {
    	var template = _.template('<td class="checkbox-container" id="dpRestriction"><input type="checkbox" id="departmentRestrictToLocation" checked="false"/><span id="dpResMessageSpan">{{restrictToLocation}}</span></td>');
        Ext.DomHelper.insertHtml('afterBegin', this.departmentTree.toolbar.tr,template(View.messages));
        Ext.fly('dpRestriction').setDisplayed(false);
    },
    
    /**
     * Add restriction for tree level and set null value title when initialize the department tree.
     * Add by heqiang
     */
    initializeDepartmentTree: function() {
    	var innerThis = this;
    	this.departmentTree.createRestrictionForLevel = function(parentNode, level) {
            var restriction = null;
            if (level == 1) {
                restriction = new Ab.view.Restriction();
                var dv_id = parentNode.data['rm.dv_id'];
                restriction.addClause('rm.dv_id', dv_id, '=');
                //only add this parameter for the top sql before union keyword.
                innerThis.departmentTree.addParameter('dvIdClause', dv_id? "dv.dv_id ='"+makeLiteral(dv_id)+"'":" 1=1 ");
                innerThis.departmentTree.addParameter('dvIdClauseTbRm', dv_id? "rm.dv_id ='"+makeLiteral(dv_id)+"'":" 1=1 ");
            }
            return restriction;
        }
        this.departmentTree.setColorOpacity(this.drawingPanel.getFillOpacity());
        this.departmentTree.setNullValueTitle("rm.dv_id", getMessage("titleUnassigned"));
		this.departmentTree.setNullValueTitle('rm.dp_id', getMessage('titleUnassigned'));
		
		//to show legend hatch picture correctly
        this.departmentTree.setLegendTable(0, 'dv');
        this.departmentTree.setLegendTable(1, 'dp');
        this.departmentTree.setLegendFields(0, ['rm.dv_id']);
        this.departmentTree.setLegendFields(1, ['rm.dv_id', 'rm.dp_id']);
    },
    
    /**
     * Enable field and field actions after the completion of data fetch.
     */
    afterInitialDataFetch: function() {
    	this.edit_dv_detail.enableField("dv.hpattern_acad", false);
    	this.edit_dv_detail.enableFieldActions("dv.hpattern_acad", true);
    	
    	this.edit_dp_detail.enableField("dp.hpattern_acad", false);
    	this.edit_dp_detail.enableFieldActions("dp.hpattern_acad", true);
    },
    
    /**
     * Applies the filter restriction to the division-department tree.
     */
    refresh: function(filter) {
        if (filter) {
    		//use custom filter rmFilter replace common filter.
            this.rmFilter =  jQuery.extend(true, {}, filter);
    		//set custom parameter with different table name.
    		var rmExists = " AND rm.bl_id ${sql.concat} rm.fl_id ${sql.concat} rm.rm_id is not null ";
    		if (filter.parameters["organizationUnassigned"].indexOf("IS NULL")!=-1 || filter.parameters["typeUnassigned"].indexOf("IS NULL")!=-1) {
    			this.rmFilter.parameters["organizationUnassigned"] = filter.parameters["organizationUnassigned"]+rmExists;
    		}
    		if (filter.parameters["totalArea"].indexOf("total_area")!=-1||filter.parameters["totalArea"].indexOf("total_count")!=-1) {
    			this.rmFilter.parameters["totalArea"] = getTotalAreaAndCountQueryParameter();
    		}

			// Added for 23.1 Team Space Functionality
			addTeamRoomRestrictionParameter(this.rmFilter,false); 
        }
    	abSpConsole_refreshDataFromFilter(this.departmentTree, this.rmFilter, null);
    	abSpConsole_toggleFromFilter('departmentRestrictToLocation', ['dpRestriction'], 
    			'dpResMessageSpan', this.rmFilter.searchValuesString +  this.rmFilter.otherSearchValuesString);
    },
    
    /**
     * Handle the checked or unchecked event of the filter checkbox.
     */
    onCheckEvent: function() {
    	abSpConsole_toggleFromCheckEvent('departmentRestrictToLocation', ['dpRestriction'], 'dpResMessageSpan', this.rmFilter.searchValuesString + this.rmFilter.otherSearchValuesString);
    	abSpConsole_refreshDataFromCheckEvent('departmentRestrictToLocation', this.departmentTree, this.rmFilter, null);
    },
    
    
    /**
     * Assign a division to rooms and unhighlight the last clicked division.
     */
    departmentTree_onAssignDivision: function() {
    	var node = this.departmentTree.lastNodeClicked;
    	node.highlightNode(false);
    	this.trigger('app:space:express:console:beginAssignment', {
    		type: 'division',
    		dv_id: node.data['rm.dv_id'],
    		dv_name: node.data['rm.dv_name']
    	});
    },

    /**
     * Assign a department to rooms and unhighlight the last clicked department.
     */
    departmentTreeLevel_onAssignDepartment: function() {
        var node = this.departmentTree.lastNodeClicked;
        node.highlightNode(false);
        this.trigger('app:space:express:console:beginAssignment', {
            type: 'department',
            dv_id: node.parent.data['rm.dv_id'],
            dv_name: node.parent.data['rm.dv_name'],
            dp_id: node.data['rm.dp_id'],
            dp_name: node.data['rm.dp_name']
        });
    },
    
    /**
     * Commit assigned department list.
     */
    departmentPendingAssignments_onCommitDepartmentPendingAssignments: function() {
    	this.trigger('app:space:express:console:commitAssignment');
    },
    
    /**
     * Remove an assignment of a room. 
     */
    departmentPendingAssignments_onRemovePendingAssignment: function(row) {
        this.trigger('app:space:express:console:removeAssignment', {
            bl_id: row.getFieldValue('rm.bl_id'),
            fl_id: row.getFieldValue('rm.fl_id'),
            rm_id: row.getFieldValue('rm.rm_id')
        });
    },
    
    /**
     * Cancel all the division and department assignments.
     */
    departmentPendingAssignments_onCancelDepartmentPendingAssignments: function() {
        this.trigger('app:space:express:console:cancelAssignment');
    },
    
    /**
     * Edit a division in the tree panel.
     */
    departmentTree_onEditDivision: function(button, panel, node) {
    	node.highlightNode(false);
    	abSpConsole_onCommonEditForTabsRow('editDv', this.edit_dv_detail, button, panel, node);
    },
    
    /**
     * Edit a department in the second level of the department tree.
     */
    departmentTreeLevel_onEditDepartment: function(button, panel, node) {
    	node.highlightNode(false);
    	abSpConsole_onCommonEditForTabsRow('editDp', this.edit_dp_detail, button, panel, node);
    }
});


/**
 *  Restrict the highlights on the floor plan to the clicked division.
 */
function filterDrawingByDivision() {
    var currentNode = View.panels.get('departmentTree').lastNodeClicked;
    var dv_id = currentNode.data['rm.dv_id'];
    
    //add the highlights toggle on and off to control the filter with or without the parameter.
    with(spaceExpressConsoleDepartments) {
    	if (rmFilter.parameters['dv_id'].indexOf("rm.dv_id") != -1) {
        	if (lastDvId == dv_id) {
        		if (lastClicked == 'division') {
        			rmFilter.parameters['dv_id'] = " 1=1 ";
        			rmFilter.parameters['dp_id'] = " 1=1 ";
            		currentNode.highlightNode(false);
        		} else {
        			rmFilter.parameters['dv_id'] = " rm.dv_id = '"+makeLiteral(dv_id)+"'";
        			rmFilter.parameters['dp_id'] = " 1=1 ";
        		}
        	} else {
				rmFilter.parameters['dv_id'] = " rm.dv_id = '"+makeLiteral(dv_id)+"'";
        		rmFilter.parameters['dp_id'] = " 1=1 ";
        		lastDvId = dv_id;
        	}
        } else {
			rmFilter.parameters['dv_id'] = " rm.dv_id = '"+makeLiteral(dv_id)+"'";
        	rmFilter.parameters['dp_id'] = " 1=1 ";
        	lastDvId = dv_id;
        }
        lastClicked = 'division';
    	trigger('app:space:express:console:refreshDrawing', rmFilter);
    }
}

/**
 *  restrict the highlights on the floor plan to what was clicked.
 */
function filterDrawingByDepartment() {
	var currentNode = View.panels.get('departmentTree').lastNodeClicked;
	var dv_id = currentNode.parent.data['rm.dv_id'];
	var dp_id = currentNode.data['rm.dp_id'];
	
    //add the highlights toggle on and off to control the filter with or without the parameter.
	with (spaceExpressConsoleDepartments) {
		if (lastDepartId == dp_id) {
			if (lastDvId == dv_id) {
				if (lastClicked == 'department') {
					if (rmFilter.parameters['dv_id'].indexOf('1=1') != -1) {
						rmFilter.parameters['dv_id'] = " rm.dv_id = '"+makeLiteral(dv_id)+"'";
						rmFilter.parameters['dp_id'] = " rm.dp_id = '"+makeLiteral(dp_id)+"'";
					} else {
						rmFilter.parameters['dv_id'] = " 1=1 ";
						rmFilter.parameters['dp_id'] = " 1=1 ";
						currentNode.highlightNode(false);
					}
				} else {
					rmFilter.parameters['dv_id'] = " rm.dv_id = '"+makeLiteral(dv_id)+"'";
					rmFilter.parameters['dp_id'] = " rm.dp_id = '"+makeLiteral(dp_id)+"'";
				}
			} else {
				rmFilter.parameters['dv_id'] = " rm.dv_id = '"+makeLiteral(dv_id)+"'";
				rmFilter.parameters['dp_id'] = " 1=1 ";
				lastDvId = dv_id;
			}
		} else {
			rmFilter.parameters['dv_id'] = " rm.dv_id = '"+makeLiteral(dv_id)+"'";
			rmFilter.parameters['dp_id'] = " rm.dp_id = '"+makeLiteral(dp_id)+"'";
			lastDvId = dv_id;
			lastDepartId = dp_id;
		}
		lastClicked = 'department';
		trigger('app:space:express:console:refreshDrawing', rmFilter);
	}
}

/**
 * export xls format for department tree list.
 */
function exportDepartmentTreeToXLS() {
	doDepartmentTreeCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, 'xls');
}

/**
 * export docx format for depart tree list.
 */
function exportDepartmentTreeToDOCX() {
	doDepartmentTreeCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, 'docx');
}

/**
 * Get customed report.
 * 
 * @param workflowRuleName
 * @param outputType
 */
function doDepartmentTreeCustomExport(workflowRuleName, outputType) {
	var firstLevelDataSourceId = 'divisionDS';
	var secondLevelDataSourceId = 'departmentDS';
	var departmentTree = View.panels.get("departmentTree");
	
	var hasRes = Ext.getDom('departmentRestrictToLocation').checked ? true: false;
	var parameters = hasRes ? spaceExpressConsoleDepartments.rmFilter.parameters: {};
	
	var restriction = spaceExpressConsoleDepartments.rmFilter.restriction;
	var printableRestrictions = getPrintableRestrictions(restriction, hasRes);
	
	if (hasRes) {
		var team_id_value = View.panels.get("locationFilter").getFieldValue('team_properties.team_id');
		if ( valueExistsNotEmpty(team_id_value) ) {
			printableRestrictions.push({'title': getMessage("teamCode"), 'value': team_id_value});
			var asOfDate = View.panels.get("locationFilter").getFieldValue('rm.date_last_surveyed');
			printableRestrictions.push({'title': getMessage("asOfDate"), 'value': asOfDate});
		}
	}

	parameters.printRestriction = hasRes;
	parameters.printableRestriction = printableRestrictions;
	parameters.categoryDataSourceId = firstLevelDataSourceId;
	parameters.categoryFields = getCategoryFieldsArrayForTreePanel(departmentTree, firstLevelDataSourceId, 0);
	parameters.categoryFieldDrillDownParametersPattern = [{name:"dvIdClause", pattern:"dv.dv_id='%s'"}, {name:"dvIdClauseTbRm", pattern:"rm.dv_id='%s'"}];
	parameters.categoryFieldDrillDownRestrictionPattern = "rm.dv_id='%s'";

	var fieldDefs = spaceExpressConsoleDepartments.divisionDS.fieldDefs;
	var fieldDefs2 = spaceExpressConsoleDepartments.departmentDS.fieldDefs;
	if (outputType != 'xls') {
		parameters.outputType = outputType;
		fieldDefs.items[0].title = getMessage("dvTitle");
		fieldDefs2.items[2].title = getMessage("dpName");//doc
	} else {
		fieldDefs.items[0].title = getMessage("dvDpTitle");
		fieldDefs2.items[2].title = getMessage("name");//excel
	}
	var orgReport = getMessage("orgReport");
	//set up second level by its dataSource id and field defs
	var jobId = Workflow.startJob(workflowRuleName, 
									departmentTree._viewFile,  
			 						secondLevelDataSourceId, 
			 						orgReport, 
			 						getCategoryFieldsArrayForTreePanel(departmentTree, secondLevelDataSourceId, 1), 
			 						'', 
			 						parameters);
	
	//get and open reported URL
	doExportPanel(jobId, outputType);
}
