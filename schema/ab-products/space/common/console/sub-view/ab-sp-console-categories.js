/**
 * Controller for the RoomCategories tree.
 *
 * Events:
 * app:space:express:console:beginAssignment
 * app:space:express:console:removeAssignment
 * app:space:express:console:cancelAssignment
 */
var spaceExpressConsoleCategories = View.createController('spaceExpressConsoleCategories', {

    /**
     * Location and occupancy restrictions applied from the filter panel.
     * This is custom filter used only for current Rmstd tab.
     */
    rmFilter: null,

    /**
     * Last room category for highlight.
     */
    lastCategoryId:null,
    
    /**
     * Last room type for highlight.
     */
    lastTypeId:null,
    
    /**
     * Remember what was clicked to toggle on and off of the tree.
     */
    lastClicked:null,

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        "click #categoriesRestrictToLocation": function() {
            this.onCheckEvent();
        }
    },

    /**
     * Constructor.
     */
    afterCreate: function() {
        this.on('app:space:express:console:rmCatFilter', this.refresh);
    },

    /**
     * We insert filter checkbox and message span and initialize the categories tree.
     */
    afterViewLoad: function() {
    	this.insertFilterMessageCheckBox();
        this.initializeCategoriesTree();
    },
    
    /**
     * Insert check box and message span for the filter criteria comes from the filter console.
     * We hide it until the user filters.
     * Add by heqiang
     */
    insertFilterMessageCheckBox: function() {
        var template = _.template('<td class="checkbox-container" id="catRestriction"><input type="checkbox" id="categoriesRestrictToLocation" checked="false"/><span id="catResMessageSpan">{{restrictToLocation}}</span></td>');
        Ext.DomHelper.insertHtml('afterBegin', this.categoriesTree.toolbar.tr, template(View.messages));
        Ext.fly('catRestriction').setDisplayed(false);
    },
    
    /**
     * Initialize the categories tree.
     * We create restriction and set null value title.
     * Add by heqiang
     */
    initializeCategoriesTree: function() {
    	//create restriction
    	var innerThis = this;
        this.categoriesTree.createRestrictionForLevel = function(parentNode, level) {
            var restriction = null;
            if (level == 1) {
                restriction = new Ab.view.Restriction();
                var rmcat = parentNode.data['rm.rm_cat'];
                restriction.addClause('rm.rm_cat',rmcat , '=');
                
                //only add this parameter for the top sql before union keyword.
                innerThis.categoriesTree.addParameter('rmcatClause', rmcat?"rmcat.rm_cat ='"+makeLiteral(rmcat)+"'":" 1=1 ");
                innerThis.categoriesTree.addParameter('rmcatClauseTbRm', rmcat?"rm.rm_cat ='"+makeLiteral(rmcat)+"'":" 1=1 ");
            }
            return restriction;
        }
        
    	//set null value title
        this.categoriesTree.setNullValueTitle("rm.rm_cat", getMessage("titleUnassigned"));
        this.categoriesTree.setNullValueTitle("rm.rm_type", getMessage("titleUnassigned"));
        
        //to show legend hatch picture correctly
        this.categoriesTree.setLegendTable(0, 'rmcat');
        this.categoriesTree.setLegendTable(1, 'rmtype');
        this.categoriesTree.setLegendFields(0, ['rm.rm_cat']);
        this.categoriesTree.setLegendFields(1, ['rm.rm_cat', 'rm.rm_type']);
    },
    
    /**
     * We enable field and field actions after the completion of data fetch.
     */
    afterInitialDataFetch: function() {
    	this.edit_cate_detail.enableField("rmcat.hpattern_acad", false);
    	this.edit_cate_detail.enableFieldActions("rmcat.hpattern_acad", true);
    	
    	this.edit_type_detail.enableField("rmtype.hpattern_acad", false);
    	this.edit_type_detail.enableFieldActions("rmtype.hpattern_acad", true);
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
    		if (filter.parameters["typeUnassigned"].indexOf("IS NULL")!=-1||filter.parameters["organizationUnassigned"].indexOf("IS NULL")!=-1) {
    			this.rmFilter.parameters["typeUnassigned"] = filter.parameters["typeUnassigned"]+rmExists;
    		}
    		if (filter.parameters["totalArea"].indexOf("total_area")!=-1||filter.parameters["totalArea"].indexOf("total_count")!=-1) {
    			this.rmFilter.parameters["totalArea"] = getTotalAreaAndCountQueryParameter();
    		}

			// Added for 23.1 Team Space Functionality
			addTeamRoomRestrictionParameter(this.rmFilter, false); 
        }
        abSpConsole_refreshDataFromFilter(this.categoriesTree, this.rmFilter, null);
    	abSpConsole_toggleFromFilter('categoriesRestrictToLocation', ['catRestriction'], 'catResMessageSpan',
    			this.rmFilter.searchValuesString +  this.rmFilter.otherSearchValuesString);
    },
        
    /**
     * Get the checkbox status and change the text and also refresh data container if necessary.
     */
    onCheckEvent: function() {
    	abSpConsole_toggleFromCheckEvent('categoriesRestrictToLocation', ['catRestriction'], 'catResMessageSpan', this.rmFilter.searchValuesString + this.rmFilter.otherSearchValuesString);
    	abSpConsole_refreshDataFromCheckEvent('categoriesRestrictToLocation', this.categoriesTree, this.rmFilter, null);
    },
    
    /**
     * Assign a category to rooms and unhighlight the last clicked category.
     */
    categoriesTree_onAssignCategory: function() {
        var node = this.categoriesTree.lastNodeClicked;
        node.highlightNode(false);
        this.trigger('app:space:express:console:beginAssignment', {
    		type: 'category',
    		rm_cat: node.data['rm.rm_cat']
    	});
    },
    
    /**
     * Assign a type to rooms and unhighlight the last clicked type.
     */
    typesTree_onAssignType: function() {
        var node = this.categoriesTree.lastNodeClicked;
        this.trigger('app:space:express:console:beginAssignment', {
            type: 'type',
            rm_cat: node.parent.data['rm.rm_cat'],
            rm_type: node.data['rm.rm_type']
        });
    },

    /**
     * Remove a pending assignment of room categories or room types.
     */
    categoryPendingAssignments_onRemovePendingAssignment: function(row) {
        this.trigger('app:space:express:console:removeAssignment', {
            bl_id: row.getFieldValue('rm.bl_id'),
            fl_id: row.getFieldValue('rm.fl_id'),
            rm_id: row.getFieldValue('rm.rm_id')
        });
    },

    /**
     * Cancel a pending assignment of room categories or room types.
     */
    categoryPendingAssignments_onCancelCategoryPendingAssignments: function() {
        this.trigger('app:space:express:console:cancelAssignment');
    },
    
    /**
     * Commit pending assignments of room categories or room types.
     */
    categoryPendingAssignments_onCommitCategoryPendingAssignments: function() {
    	this.trigger('app:space:express:console:commitAssignment');
    },
    
    /**
     * Edit category from the tree panel edit icon.
     */
    categoriesTree_onEditCategory: function(button, panel, node) {
    	node.highlightNode(false);
    	abSpConsole_onCommonEditForTabsRow('editCategory', this.edit_cate_detail, button, panel, node);
    },
    
    /**
     * Edit type from the tree panel edit icon.
     */
    typesTree_onEditType: function(button, panel, node) {
    	node.highlightNode(false);
    	abSpConsole_onCommonEditForTabsRow('editType', this.edit_type_detail, button, panel, node);
    }
});

/**
 * Make use of the category node content the user clicked in the categories tree to filter the drawing panel.
 */
function filterDrawingByCat() {
    var currentNode = View.panels.get('categoriesTree').lastNodeClicked;
    var rm_cat = currentNode.data['rm.rm_cat'];
    
    //add the highlights toggle on and off to control the filter with or without the parameter.
    with (spaceExpressConsoleCategories) {
    	if (rmFilter.parameters['rm_cat'].indexOf("rm.rm_cat") != -1) {//the parameters has been set before
        	if (lastCategoryId == rm_cat) {//the user toggle on and off
        		if (lastClicked == 'category') {//the last clicked node is category
        			rmFilter.parameters['rm_cat'] = " 1=1 ";
        			rmFilter.parameters['rm_type'] = " 1=1 ";
        			currentNode.highlightNode(false);
        		} else {//the last clicked node is type
					rmFilter.parameters['rm_cat'] = " rm.rm_cat = '"+makeLiteral(rm_cat)+"'";
        			rmFilter.parameters['rm_type'] = " 1=1 ";
        		}
        	} else {
				rmFilter.parameters['rm_cat'] = " rm.rm_cat = '"+makeLiteral(rm_cat)+"'";
        		rmFilter.parameters['rm_type'] = " 1=1 ";
        		lastCategoryId = rm_cat;
        	}
        } else {//the parameters has not been set before,just set the category
			rmFilter.parameters['rm_cat'] = " rm.rm_cat = '"+makeLiteral(rm_cat)+"'";
        	rmFilter.parameters['rm_type'] = " 1=1 ";
        	lastCategoryId = rm_cat;
        }
        lastClicked = 'category';
        trigger('app:space:express:console:refreshDrawing', rmFilter);
    }
}

/**
 *  Make use of the type node content the user clicked in the categories tree to filter the drawing panel.
 */
function filterDrawingByType() {
	var currentNode = View.panels.get('categoriesTree').lastNodeClicked;
	var rm_cat = currentNode.parent.data['rm.rm_cat'];
	var rm_type = currentNode.data['rm.rm_type'];
	
    //add the highlights toggle on and off to control the filter with or without the parameter.
	var drawingFilter = spaceExpressConsoleCategories.rmFilter;
	with(spaceExpressConsoleCategories) {
		if (lastTypeId == rm_type) {
			if (lastCategoryId == rm_cat) {
				if (lastClicked == 'type') {
					if (rmFilter.parameters['rm_cat'].indexOf('1=1') != -1) {
						rmFilter.parameters['rm_cat'] = " rm.rm_cat = '"+makeLiteral(rm_cat)+"'";
						rmFilter.parameters['rm_type'] = " rm.rm_type = '"+makeLiteral(rm_type)+"'";
					} else {
						rmFilter.parameters['rm_cat'] = " 1=1 ";
						rmFilter.parameters['rm_type'] = " 1=1 ";
						currentNode.highlightNode(false);
					}
				} else {
					rmFilter.parameters['rm_cat'] = " rm.rm_cat = '"+makeLiteral(rm_cat)+"'";
					rmFilter.parameters['rm_type'] = " rm.rm_type = '"+makeLiteral(rm_type)+"'";
				}
			} else {
				rmFilter.parameters['rm_cat'] = " rm.rm_cat = '"+makeLiteral(rm_cat)+"'";
				rmFilter.parameters['rm_type'] = " 1=1 ";
				lastCategoryId = rm_cat;
			}
		} else {
			rmFilter.parameters['rm_cat'] = " rm.rm_cat = '"+makeLiteral(rm_cat)+"'";
			rmFilter.parameters['rm_type'] = " rm.rm_type = '"+makeLiteral(rm_type)+"'";
			lastCategoryId = rm_cat;
			lastTypeId = rm_type;
		}
		lastClicked = 'type';
		trigger('app:space:express:console:refreshDrawing', rmFilter);
	}
}

/**
 * Export the categories tree in XLS format.
 */
function exportCategoriesTreeToXLS() {
	doCategoriesTreeCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, 'xls');
}

/**
 * Export the categories tree in docx format.
 */
function exportCategoriesTreeToDOCX() {
	doCategoriesTreeCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, 'docx');
}

/**
 * Get customed report.
 * 
 * @param workflowRuleName
 * @param outputType
 */
function doCategoriesTreeCustomExport(workflowRuleName, outputType) {
	var firstLevelDataSourceId = 'categoriesDS';
	var secondLevelDataSourceId = 'typesDS';
	var categoriesTree = View.panels.get("categoriesTree");
	
	var hasRes = Ext.getDom('categoriesRestrictToLocation').checked ? true: false;
	var parameters = hasRes ? spaceExpressConsoleCategories.rmFilter.parameters: {};
	
	var restriction = spaceExpressConsoleCategories.rmFilter.restriction;
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
	parameters.categoryFields = getCategoryFieldsArrayForTreePanel(categoriesTree, firstLevelDataSourceId, 0);
	parameters.categoryFieldDrillDownParametersPattern = [{name:"rmcatClause", pattern:"rmcat.rm_cat='%s'"}, {name:"rmcatClauseTbRm", pattern:"rm.rm_cat='%s'"}];
	parameters.categoryFieldDrillDownRestrictionPattern = "rm.rm_cat='%s'";

	var fieldDefs = spaceExpressConsoleCategories.categoriesDS.fieldDefs;
	if (outputType != 'xls') {
		parameters.outputType = outputType;
		fieldDefs.items[0].title = getMessage("roomCatTitle");
	} else {
		fieldDefs.items[0].title = getMessage("catTypeTitle");
	}
	var roomCatReport = getMessage("roomCatReport");
	//set up second level by its dataSource id and field defs
	var jobId = Workflow.startJob(workflowRuleName, 
									categoriesTree._viewFile,  
			 						secondLevelDataSourceId, 
			 						roomCatReport, 
			 						getCategoryFieldsArrayForTreePanel(categoriesTree, secondLevelDataSourceId, 1),
			 						'', 
			 						parameters);

	//get and open reported URL
	doExportPanel(jobId, outputType);
}
