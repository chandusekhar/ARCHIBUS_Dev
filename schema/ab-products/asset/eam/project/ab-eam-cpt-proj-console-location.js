/**
 * Controller.
 */
var abEamCptProjConsLocationController = View.createController('abEamCptProjConsLocationController', {

    activityType: 'PROPOSED PROJECT LOCATION',

    projectIds: null,

    selectedNodeRestriction: null,

    tmpFromLocation: null,
    tmpLevel: null,
    tmpRestriction: null,
    tmpNodeData: null,
    tmpAnchor: null,

    tmpBlId: null,
    tmpFlId: null,
    tmpGpId: null,
    tmpProjectId: null,
    
    addLocationFrom: null,
    
    filterConfig: null,
    
    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'click input[type=radio]': function (input) {
            if (input.currentTarget.name === 'addFloorsConfirmForm_add_fl_confirm') {
                this.addFloorsConfirmForm_add_fl_confirm_onClick(input);
            }
        }
    },
    
    afterViewLoad: function(){
		var menuParent = Ext.get('reports');
		menuParent.on('click', this.abEamProjConsoleLocationFilter_onReports, this, null);
		this.initializeFilterConfig();
    },
    
    afterInitialDataFetch: function () {
        this.abEamProjConsoleLocationRefresh_afterRefresh();
    },
    
    
    initializeFilterConfig: function(){
    	if (this.filterConfig == null) {
    		this.filterConfig = new Ext.util.MixedCollection();
    		this.filterConfig.addAll(
    			{id: 'ctry.geo_region_id',  dfltValue: null, value: null},
    			{id: 'bl.state_id',  dfltValue: null, value: null},
    			{id: 'bl.city_id',  dfltValue: null, value: null},
    			{id: 'bl.site_id',  dfltValue: null, value: null},
    			{id: 'bl.bl_id',  dfltValue: null, value: null},
    			{id: 'rm.fl_id',  dfltValue: null, value: null},
    			{id: 'rm.dv_id',  dfltValue: null, value: null},
    			{id: 'rm.dp_id',  dfltValue: null, value: null}
    		);
    	}
    	
    },

    abEamProjConsoleLocationRefresh_afterRefresh: function () {
        // clear filter panel
    	this.resetFilter();
        // get selected project id's
        this.getSelectedProjects();
        // set title for filter console
        var consoleTitle = getMessage('titleConsole').replace('{0}', this.projectIds[0]);
        this.abEamProjConsoleLocationFilter.setTitle(consoleTitle);
        // refresh geographical tree
        var filterRestriction = this.getFilterRestriction();

        this.refreshView(filterRestriction, this.projectIds);
    },

    getMainController: function () {
        var controller = null;
        if (valueExists(this.view.getOpenerView()) && valueExists(this.view.getOpenerView().controllers.get('abEamCptProjConsoleCtrl'))) {
            controller = this.view.getOpenerView().controllers.get('abEamCptProjConsoleCtrl');
        }
        return controller;
    },
    
    resetFilter: function(){
    	var filterPanel = this.abEamProjConsoleLocationFilter;
    	filterPanel.clear();
    	this.filterConfig.each(function(field){
    		if(valueExistsNotEmpty(field.dfltValue)){
    			filterPanel.setFieldValue(field.id, field.dfltValue);
    		}
    	});
    },

    getSelectedProjects: function () {
        var mainController = this.getMainController();
        if (mainController) {
            this.projectIds = mainController.projectIds;
        }
    },

    getFilterRestriction: function () {
        var restriction = new Ab.view.Restriction();
        var filterPanel = this.abEamProjConsoleLocationFilter;
        filterPanel.fields.each(function (field) {
            if (valueExists(field.fieldDef)
                && field.fieldDef.id != 'dummy_field'
                && valueExistsNotEmpty(filterPanel.getFieldValue(field.fieldDef.id))) {

                if (filterPanel.hasFieldMultipleValues(field.fieldDef.id)) {
                    var values = filterPanel.getFieldMultipleValues(field.fieldDef.id);
                    restriction.addClause(field.fieldDef.id, values, 'IN');
                } else {
                    var value = filterPanel.getFieldValue(field.fieldDef.id);
                    if (field.fieldDef.controlType == 'comboBox' || field.fieldDef.isEnum) {
                        restriction.addClause(field.fieldDef.id, value, '=');
                    } else {
                        restriction.addClause(field.fieldDef.id, value, 'LIKE');
                    }
                }
            }
        });
        return restriction;
    },

    abEamProjConsoleLocationFilter_onFilter: function (panel, action) {
        var filterRestriction = this.getFilterRestriction();
        this.refreshView(filterRestriction, this.projectIds);
    },
    
    abEamProjConsoleLocationFilter_onClear: function(panel, action){
    	this.resetFilter();
    },

    refreshView: function (filterRestriction, projectIds) {
        // set details and display callback methods
        var controller = this;
        var parameters = {
            'onClickDetailsHandler': function (fromLocation, level, restriction, nodeData, button) {
                controller.onClickDetails(fromLocation, level, restriction, nodeData, button);
            },
            'onClickDisplayHandler': function (fromLocation, level, restriction, nodeData, button) {
                controller.onClickDisplay(fromLocation, level, restriction, nodeData, button);
            },
            'onClickMarkUpHandler': function (restriction, button) {
                controller.onClickMarkUp(restriction, button);
            },
            'onClickClearSelectionHandler': function(){
            	controller.onClickClearSelectionHandler();
            },
            'autoExpandLevelNoProgram': true,
            'showFieldLabelOnTreeTable': false
        };
        var geoLevels = ['geo_region', 'ctry', 'regn', 'state', 'city', 'site', 'bl', 'fl', 'rm'];
        var geoTreeParameters = this.getGeographicalRestrictionForLevels(geoLevels, filterRestriction, projectIds, parameters);
        
        geoTreeParameters["onClickPPTHandler"] = function(){
        	controller.onClickPPTHandler();
        }
        
        this.abEamProjConsoleLocTree.findTab('abEamProjConsoleLocTreeGeo').parameters = geoTreeParameters;

        var locLevels = ['site', 'bl', 'fl'];
        var locTreeParameters = this.getGeographicalRestrictionForLevels(locLevels, filterRestriction, projectIds, parameters);

        locTreeParameters["onClickAddHandler"] = function (selectedNodeRestriction, commandContext) {
            controller.onClickAddFromLocationTree(selectedNodeRestriction, commandContext);
        };

        this.abEamProjConsoleLocTree.findTab('abEamProjConsoleLocTreeLocation').parameters = locTreeParameters;

        var projectLevels = ['program', 'project', 'work_pkgs', 'activity_log'];
        var projectTreeParameters = this.getProjectRestrictionForLevels(projectLevels, filterRestriction, projectIds, parameters);

        projectTreeParameters["onAddActionHandler"] = function (selectedNodeRestriction, commandContext) {
            controller.onClickAddActionFromProjectTree(selectedNodeRestriction, commandContext);
        };
        projectTreeParameters["onAddWorkPkgHandler"] = function (selectedNodeRestriction, commandContext) {
            controller.onClickAddWorkPkgFromProjectTree(selectedNodeRestriction, commandContext);
        };
        projectTreeParameters["onClickPPTHandler"] = function(){
        	controller.onClickPPTHandler();
        };

        projectTreeParameters["showFieldLabelOnTreeTable"] = true;
        
        this.abEamProjConsoleLocTree.findTab('abEamProjConsoleLocTreeProject').parameters = projectTreeParameters;

        var selectedTabName = this.abEamProjConsoleLocTree.getSelectedTabName();
        this.abEamProjConsoleLocTree.refreshTab(selectedTabName);
    },

    getGeographicalRestrictionForLevels: function (levels, filterRestriction, projectIds, parameters) {
        var tmp = cloneObject(parameters);
        for (var i = 0; i < levels.length; i++) {
            var level = levels[i];
            var levelRestriction = this.getGeographicalRestrictionForLevel(level, filterRestriction, projectIds);
            tmp[level + "_restriction"] = levelRestriction;
        }
        return tmp;
    },

    getGeographicalRestrictionForLevel: function (level, filterRestriction, projectIds) {
        var blProjectRestriction = "";
        var siteProjectRestriction = "";
        var projectNames = getProjectNames(projectIds);
        var scenarioIds = getPortfolioScenarioIds(projectNames);

        var blRestriction = "EXISTS(SELECT bl.bl_id FROM bl WHERE ${sql.getVpaRestrictionForTable('bl')} ";
        var siteRestriction = "EXISTS(SELECT site.site_id FROM site WHERE ${sql.getVpaRestrictionForTable('site')} ";
        if (projectIds.length > 0) {

            blProjectRestriction = " AND (EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.bl_id = bl.bl_id AND activity_log.project_id IN ('" + makeSafeSqlValue(projectIds).join("', '") + "'))";
            siteProjectRestriction = " AND (EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.site_id = site.site_id AND activity_log.project_id IN ('" + makeSafeSqlValue(projectIds).join("', '") + "'))";
            if (scenarioIds.length > 0) {
                blProjectRestriction += " OR EXISTS(SELECT gp.gp_id FROM gp WHERE gp.bl_id = bl.bl_id AND gp.portfolio_scenario_id IN ('" + makeSafeSqlValue(scenarioIds).join("', '") + "'))";
                siteProjectRestriction += " OR EXISTS(SELECT bl.bl_id FROM bl, gp WHERE gp.bl_id = bl.bl_id AND bl.site_id = site.site_id AND gp.portfolio_scenario_id IN ('" + makeSafeSqlValue(scenarioIds).join("', '") + "'))";
            }
            blProjectRestriction += " OR EXISTS(SELECT sb_items.auto_number FROM sb_items WHERE sb_items.bl_id = bl.bl_id AND sb_items.sb_name IN ('" + makeSafeSqlValue(projectNames).join("', '") + "')))";
            siteProjectRestriction += " OR EXISTS(SELECT bl.bl_id FROM bl, sb_items WHERE sb_items.bl_id = bl.bl_id  AND bl.site_id = site.site_id AND sb_items.sb_name IN ('" + makeSafeSqlValue(projectNames).join("', '") + "')))";
        }

        switch (level) {
            case 'geo_region':
            {
                blRestriction += " AND EXISTS(SELECT ctry_a_bl.ctry_id FROM ctry ${sql.as} ctry_a_bl WHERE ctry_a_bl.geo_region_id = geo_region.geo_region_id AND ctry_a_bl.ctry_id = bl.ctry_id) ";
                blRestriction += blProjectRestriction + this.getFilterRestrictionForTable("bl", filterRestriction);

                siteRestriction += " AND EXISTS(SELECT ctry_a_site.ctry_id FROM ctry ${sql.as} ctry_a_site WHERE ctry_a_site.geo_region_id = geo_region.geo_region_id AND ctry_a_site.ctry_id = site.ctry_id) ";
                siteRestriction += siteProjectRestriction + this.getFilterRestrictionForTable("site", filterRestriction);

                blRestriction += ")";
                siteRestriction += ")";
                break;
            }
            case 'ctry':
            {
                blRestriction += " AND bl.ctry_id = ctry.ctry_id ";
                blRestriction += blProjectRestriction + this.getFilterRestrictionForTable("bl", filterRestriction);

                siteRestriction += " AND site.ctry_id = ctry.ctry_id ";
                siteRestriction += siteProjectRestriction + this.getFilterRestrictionForTable("site", filterRestriction);

                blRestriction += ")";
                siteRestriction += ")";
                break;
            }
            case 'regn':
            {
                blRestriction += " AND bl.ctry_id = regn.ctry_id AND bl.regn_id = regn.regn_id ";
                blRestriction += blProjectRestriction + this.getFilterRestrictionForTable("bl", filterRestriction);

                siteRestriction += " AND site.ctry_id = regn.ctry_id AND site.regn_id = regn.regn_id ";
                siteRestriction += siteProjectRestriction + this.getFilterRestrictionForTable("site", filterRestriction);

                blRestriction += ")";
                siteRestriction += ")";
                break;
            }
            case 'state':
            {
                blRestriction += " AND bl.state_id = state.state_id ";
                blRestriction += blProjectRestriction + this.getFilterRestrictionForTable("bl", filterRestriction);

                siteRestriction += " AND site.state_id = state.state_id ";
                siteRestriction += siteProjectRestriction + this.getFilterRestrictionForTable("site", filterRestriction);

                blRestriction += ")";
                siteRestriction += ")";
                break;
            }
            case 'city':
            {
                blRestriction += " AND bl.state_id = city.state_id AND bl.city_id = city.city_id ";
                blRestriction += blProjectRestriction + this.getFilterRestrictionForTable("bl", filterRestriction);

                siteRestriction += " AND site.state_id = city.state_id AND site.city_id = city.city_id ";
                siteRestriction += siteProjectRestriction + this.getFilterRestrictionForTable("site", filterRestriction);

                blRestriction += ")";
                siteRestriction += ")";
                break;
            }
            case 'site':
            {
                blRestriction += " AND bl.site_id = site.site_id ";
                blRestriction += blProjectRestriction + this.getFilterRestrictionForTable("bl", filterRestriction);
                // for site level - site restriction is different, site is main table
                siteRestriction = "(${sql.getVpaRestrictionForTable('site')} ";
                siteRestriction += siteProjectRestriction + this.getFilterRestrictionForTable("site", filterRestriction);

                blRestriction += ")";
                siteRestriction += ")";
                break;
            }
            case 'bl':
            {
                // for bl level - bl restriction is different, bl is main table
                blRestriction = " ${sql.getVpaRestrictionForTable('bl')} ";
                blRestriction += blProjectRestriction + this.getFilterRestrictionForTable("bl", filterRestriction);

                siteRestriction = "";
                break;
            }
            case 'fl':
            {
                var flProjectRestriction = " (EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.bl_id = fl.bl_id AND activity_log.fl_id = fl.fl_id AND activity_log.project_id IN ('" + makeSafeSqlValue(projectIds).join("', '") + "'))";
                if (scenarioIds.length > 0) {
                    flProjectRestriction += " OR EXISTS(SELECT gp.gp_id FROM gp WHERE gp.bl_id = fl.bl_id AND gp.fl_id = fl.fl_id AND gp.portfolio_scenario_id IN ('" + makeSafeSqlValue(scenarioIds).join("', '") + "'))";
                }
                flProjectRestriction += " OR EXISTS(SELECT sb_items.auto_number FROM sb_items WHERE sb_items.bl_id = fl.bl_id AND sb_items.fl_id = fl.fl_id AND sb_items.sb_name IN ('" + makeSafeSqlValue(projectNames).join("', '") + "')))";

                blRestriction = flProjectRestriction + this.getFilterClauseRestrictionForTable("fl", "rm.fl_id", filterRestriction);
                var dvRestriction = this.getFilterClauseRestrictionForTable("rm", "rm.dv_id", filterRestriction);
                var dpRestriction = this.getFilterClauseRestrictionForTable("rm", "rm.dp_id", filterRestriction);
                if (valueExistsNotEmpty(dvRestriction) || valueExistsNotEmpty(dpRestriction)) {
                    blRestriction += " AND EXISTS(SELECT rm.rm_id FROM rm WHERE rm.bl_id = fl.bl_id AND rm.fl_id = fl.fl_id";
                    blRestriction += dvRestriction;
                    blRestriction += dpRestriction;
                    blRestriction += ")";
                }
                siteRestriction = "";
                break;
            }
            case 'rm':
            {
                blRestriction = "1=1" + this.getFilterClauseRestrictionForTable("rm", "rm.dv_id", filterRestriction);
                blRestriction += this.getFilterClauseRestrictionForTable("rm", "rm.dp_id", filterRestriction);
                siteRestriction = "";
                break;
            }
        }


        var restriction = "";
        if (valueExistsNotEmpty(blRestriction)) {
            restriction = blRestriction;
        }
        if (valueExistsNotEmpty(siteRestriction)) {
            restriction += (valueExistsNotEmpty(blRestriction) ? " OR " : "") + siteRestriction;
        }
        if (valueExistsNotEmpty(restriction)) {
            restriction = "(" + restriction + ")";
        } else {
            restriction = "(1 = 1)";
        }
        return restriction;
    },

    getFilterRestrictionForTable: function (tableName, filterRestriction) {
        var restriction = "";
        // ctry.geo_region_id
        var filterClause = filterRestriction.findClause('ctry.geo_region_id');
        if (filterClause) {
            restriction += " AND EXISTS(SELECT ctry_b_" + tableName + ".ctry_id FROM ctry ${sql.as} ctry_b_" + tableName + " WHERE ctry_b_" + tableName + ".ctry_id = " + tableName + ".ctry_id AND ctry_b_" + tableName + ".geo_region_id " + getSqlClauseValue(filterClause.op, filterClause.value) + " )";
        }
        // bl.state_id
        var filterClause = filterRestriction.findClause('bl.state_id');
        if (filterClause) {
            restriction += " AND " + tableName + ".state_id " + getSqlClauseValue(filterClause.op, filterClause.value);
        }
        // bl.city_id
        var filterClause = filterRestriction.findClause('bl.city_id');
        if (filterClause) {
            restriction += " AND " + tableName + ".city_id " + getSqlClauseValue(filterClause.op, filterClause.value);
        }
        // bl.site_id
        var filterClause = filterRestriction.findClause('bl.site_id');
        if (filterClause) {
            restriction += " AND " + tableName + ".site_id " + getSqlClauseValue(filterClause.op, filterClause.value);
        }

        // bl.bl_id
        var blClause = "";
        var filterClause = filterRestriction.findClause('bl.bl_id');
        if (filterClause) {
            blClause += " AND bl.bl_id " + getSqlClauseValue(filterClause.op, filterClause.value);
        }
        //rm.fl_id
        var rmClause = "";
        var filterClause = filterRestriction.findClause('rm.fl_id');
        if (filterClause) {
            rmClause += " AND rm.fl_id " + getSqlClauseValue(filterClause.op, filterClause.value);
        }

        //rm.dv_id
        var filterClause = filterRestriction.findClause('rm.dv_id');
        if (filterClause) {
            rmClause += " AND rm.dv_id " + getSqlClauseValue(filterClause.op, filterClause.value);
        }

        //rm.dp_id
        var filterClause = filterRestriction.findClause('rm.dp_id');
        if (filterClause) {
            rmClause += " AND rm.dp_id " + getSqlClauseValue(filterClause.op, filterClause.value);
        }

        blClause = (tableName == 'site' ? " AND EXISTS(SELECT bl.bl_id FROM bl WHERE bl.site_id = site.site_id " : "") + blClause + (valueExistsNotEmpty(rmClause) ? " AND EXISTS(SELECT rm.rm_id FROM rm WHERE rm.bl_id = bl.bl_id " + rmClause + " )" : "") + (tableName == 'site' ? ")" : "");
        return restriction + blClause;
    },

    getProjectRestrictionForLevels: function (levels, filterRestriction, projectIds, parameters) {
        var tmp = cloneObject(parameters);
        for (var i = 0; i < levels.length; i++) {
            var level = levels[i];
            var levelRestriction = this.getProjectRestrictionForLevel(level, filterRestriction, projectIds);
            tmp[level + "_restriction"] = levelRestriction;
        }
        return tmp;
    },

    getProjectRestrictionForLevel: function (level, filterRestriction, projectIds) {
        var restriction = "";
        switch (level) {
            case 'program':
            {
                restriction = "EXISTS(SELECT project.project_id FROM project WHERE project.program_id = program.program_id AND project.project_id IN ('" + makeSafeSqlValue(projectIds).join("', '") + "') ";
                restriction += this.getFilterClauseRestrictionForTable('project', 'bl.site_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('project', 'bl.bl_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('project', 'rm.dv_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('project', 'rm.dp_id', filterRestriction);
                restriction += ")";
                break;
            }
            case 'project':
            {
                restriction = " project.project_id IN ('" + makeSafeSqlValue(projectIds).join("', '") + "') ";
                restriction += this.getFilterClauseRestrictionForTable('project', 'bl.site_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('project', 'bl.bl_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('project', 'rm.dv_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('project', 'rm.dp_id', filterRestriction);
                break;
            }
            case 'work_pkgs':
            {
            	restriction = " ( work_pkgs.project_id IN ('" + makeSafeSqlValue(projectIds).join("', '") + "') ";
                restriction += " OR EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.work_pkg_id = work_pkgs.work_pkg_id AND activity_log.project_id = work_pkgs.project_id ";
                restriction += " AND activity_log.project_id IN ('" + makeSafeSqlValue(projectIds).join("', '") + "') ";
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'bl.site_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'bl.bl_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'rm.fl_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'rm.dv_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'rm.dp_id', filterRestriction);
                restriction += "))";
                break;
            }
            case 'activity_log':
            {
                restriction += " activity_log.project_id IN ('" + makeSafeSqlValue(projectIds).join("', '") + "') ";
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'bl.site_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'bl.bl_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'rm.fl_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'rm.dv_id', filterRestriction);
                restriction += this.getFilterClauseRestrictionForTable('activity_log', 'rm.dp_id', filterRestriction);
                break;
            }
        }
        return restriction;
    },

    getFilterClauseRestrictionForTable: function (tableName, clauseName, filterRestriction) {
        var restriction = "";
        var filterClause = filterRestriction.findClause(clauseName);
        var clauseField = clauseName.substring(clauseName.indexOf(".") + 1);
        if (filterClause) {
            restriction += " AND " + tableName + "." + clauseField + " " + getSqlClauseValue(filterClause.op, filterClause.value);
        }
        return restriction;
    },
    
    onClickClearSelectionHandler: function(){
    	this.resetFilter();
    	var filterRestriction = this.getFilterRestriction();
    	this.refreshView(filterRestriction, this.projectIds);
    },

    /**
     * On Click details
     * @param fromLocation from where is called
     * @param level selected node tree level
     * @param restriction selected tree node restriction
     * @param nodeData seleted node data
     * @param button button clicked
     */
    onClickDetails: function (fromLocation, level, restriction, nodeData, button) {
        var detailViews = {
            'geo_region': null,
            'ctry': null,
            'regn': null,
            'state': null,
            'city': null,
            'site': 'ab-eam-site-details.axvw',
            'bl': 'ab-eam-bl-details.axvw',
            'fl': 'ab-eam-fl-details.axvw',
            'rm': 'ab-eam-rm-details.axvw',
            'program': 'ab-eam-program-details.axvw',
            'project': 'ab-eam-project-details.axvw',
            'work_pkgs': 'ab-proj-mng-pkg-prof-edit.axvw',
            'activity_log': 'ab-proj-mng-act-edit.axvw'
        };

        var detailsViewName = detailViews[level];
        if (detailsViewName != null) {
            var projectIds = this.projectIds;
            var controller = this;
            var dialogConfig = {
                width: 800,
                height: 600,
                projectIds: projectIds,
                itemType: level,
                callback: function () {
                    controller.reloadTree();
                }
            };
            if (level == 'project' || level == 'work_pkgs' || level == 'activity_log') {
                dialogConfig = {
                    width: 1024,
                    height: 800,
                    projectIds: projectIds,
                    showDocumentsPanel: true,
                    itemType: level,
                    isDeleteBtnVisible: false,
                    isCloseBtnVisible: false,
                    callback: function () {
                        controller.reloadTree();
                    }
                };
                if (level == 'activity_log') {
                    _.extend(dialogConfig, {
                        'panelsConfiguration': {
                            'projMngActEdit_Progress': {
                                actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                                fields: [
                                    {name: 'activity_log.status'},
                                    {name: 'activity_log.hours_est_baseline', required: true},
                                    {name: 'activity_log.date_planned_for', required: true},
                                    {name: 'activity_log.duration_est_baseline', required: true},
                                    {name: 'activity_log.date_required'},
                                    {name: 'activity_log.date_scheduled_end'}
                                ]
                            },
                            'projMngActEdit_Costs': {
                                actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                                fields: [
                                    {name: 'activity_log.cost_est_cap', required: true},
                                    {name: 'activity_log.cost_estimated', required: true}
                                ]
                            },
                            'projMngActEdit_Details': {
                                fields: [
                                    {name: 'activity_log.doc'},
                                    {name: 'activity_log.description'},
                                    {name: 'activity_log.created_by'},
                                    {name: 'activity_log.date_requested'},
                                    {name: 'activity_log.approved_by'},
                                    {name: 'activity_log.date_approved'}
                                ]
                            }
                        }
                    })
                }
            }
            View.openDialog(detailsViewName, restriction, false, dialogConfig);
        } else {
            alert('Not implemented - specs required');
        }
    },

    /**
     * On Click display
     * @param fromLocation from where is called
     * @param level selected node tree level
     * @param restriction selected tree node restriction
     * @param nodeData selected node data
     * @param button button clicked
     */
    onClickDisplay: function (fromLocation, level, restriction, nodeData, button) {
        this.tmpFromLocation = fromLocation;
        this.tmpLevel = level;
        this.tmpRestriction = restriction;
        this.tmpNodeData = nodeData;

        var objCheckbox = document.getElementById('abEamCptProjDisplaySelect_PanelA_map');
        objCheckbox.checked = false;

        objCheckbox = document.getElementById('abEamCptProjDisplaySelect_PanelA_drawing');
        objCheckbox.checked = false;
        objCheckbox.disabled = (level != 'fl' && level != 'rm');

        objCheckbox = document.getElementById('abEamCptProjDisplaySelect_PanelA_markup');
        objCheckbox.checked = false;
        objCheckbox.disabled = (level != 'fl' && level != 'project' && level != 'work_pkgs' && level != 'activity_log');

        objCheckbox = document.getElementById('abEamCptProjDisplaySelect_PanelB_map');
        objCheckbox.checked = false;

        objCheckbox = document.getElementById('abEamCptProjDisplaySelect_PanelB_drawing');
        objCheckbox.checked = false;
        objCheckbox.disabled = (level != 'fl' && level != 'rm');

        objCheckbox = document.getElementById('abEamCptProjDisplaySelect_PanelB_markup');
        objCheckbox.checked = false;
        objCheckbox.disabled = (level != 'fl' && level != 'project' && level != 'work_pkgs' && level != 'activity_log');

        this.abEamCptProjDisplaySelect.showInWindow({
            x: 300,
            y: 300,
            width: 600,
            height: 200,
            closeButton: false
        });
    },

    onClickMarkUp: function (restriction, button) {
        var blId = '', flId = '';
        if (valueExists(restriction)) {
            this.selectedNodeRestriction = restriction;
            blId = restriction.findClause('fl.bl_id').value,
                flId = restriction.findClause('fl.fl_id').value;
        }
        if (this.projectIds.length > 1) {
            this.abSelectProjects_form.showInWindow({
                x: 200,
                y: 200,
                width: 400,
                height: 200,
                closeButton: false
            });
            this.abSelectProjects_form.setTitle(getMessage('selectProjectMarkupMessage'));
            this.abSelectProjects_form.actions.get('doActionForSelectedProjects').setTitle(getMessage('markUpAction'));
            this.abSelectProjects_form.actions.get('doActionForSelectedProjects').button.el.dom.onclick = this.abSelectProjects_form_onDoMarkup.createDelegate(this);
            var selBoxField = this.abSelectProjects_form.fields.get('sel_project_ids');
            selBoxField.clearOptions();
            for (var i = 0; i < this.projectIds.length; i++) {
                selBoxField.addOption(this.projectIds[i], this.projectIds[i]);
            }
        }
        if (this.projectIds.length == 1) {
            this.markUp(this.projectIds[0], blId, flId);
        }
    },

    abSelectProjects_form_onDoMarkup: function () {
        var projectId = this.abSelectProjects_form.getFieldValue('sel_project_ids'),
            blId = '', flId = '';
        if (valueExists(this.selectedNodeRestriction)) {
            blId = this.selectedNodeRestriction.findClause('fl.bl_id').value;
            flId = this.selectedNodeRestriction.findClause('fl.fl_id').value;
        }
        this.markUp(projectId, blId, flId);
        this.abSelectProjects_form.closeWindow();
    },

    markUp: function (projectId, blId, flId) {
        View.openDialog('ab-eam-cpt-proj-mark-act-item.axvw', null, true, {
            width: 1024,
            height: 800,
            projectId: projectId,
            blId: blId,
            flId: flId,
            callback: function () {
            }
        });
    },

    onClickPPTHandler: function () {
        if (this.projectIds.length > 1) {
            this.abSelectProjects_form.showInWindow({
                x: 200,
                y: 200,
                width: 400,
                height: 200,
                closeButton: false
            });
            this.abSelectProjects_form.setTitle(getMessage('selectProjectPPTpMessage'));
            this.abSelectProjects_form.actions.get('doActionForSelectedProjects').setTitle(getMessage('pptAction'));
            this.abSelectProjects_form.actions.get('doActionForSelectedProjects').button.el.dom.onclick = this.abSelectProjects_form_onDoExportPPT.createDelegate(this);
            var selBoxField = this.abSelectProjects_form.fields.get('sel_project_ids');
            selBoxField.clearOptions();
            for (var i = 0; i < this.projectIds.length; i++) {
                selBoxField.addOption(this.projectIds[i], this.projectIds[i]);
            }
        }
        if (this.projectIds.length == 1) {
            this.exportPPT(this.projectIds[0]);
        }
    },

    abSelectProjects_form_onDoExportPPT: function () {
        var projectId = this.abSelectProjects_form.getFieldValue('sel_project_ids');
        this.exportPPT(projectId);
        this.abSelectProjects_form.closeWindow();
    },

    exportPPT: function (projectId) {
        var jobId = Workflow.startJob('AbCommonResources-ProjectRequirementsService-generatePPTPresentation', projectId);
        View.openJobProgressBar(getMessage("generatePPTMessage"), jobId, null, function (status) {
            var url = status.jobFile.url;
            window.location = url;
        });
    },

    abEamCptProjDisplaySelect_onSave: function () {
        var panelAType = null;
        var panelAFile = null;
        if (document.getElementById('abEamCptProjDisplaySelect_PanelA_map').checked) {
            panelAType = 'map';
            panelAFile = 'ab-eam-gis-map.axvw';
        } else if (document.getElementById('abEamCptProjDisplaySelect_PanelA_drawing').checked) {
            panelAType = 'drawing';
            panelAFile = 'ab-eam-floor-plan.axvw';
        } else if (document.getElementById('abEamCptProjDisplaySelect_PanelA_markup').checked) {
            panelAType = 'markup';
            panelAFile = 'ab-eam-view-markup.axvw';
        }

        var panelBType = null;
        var panelBFile = null;
        if (document.getElementById('abEamCptProjDisplaySelect_PanelB_map').checked) {
            panelBType = 'map';
            panelBFile = 'ab-eam-gis-map.axvw';
        } else if (document.getElementById('abEamCptProjDisplaySelect_PanelB_drawing').checked) {
            panelBType = 'drawing';
            panelBFile = 'ab-eam-floor-plan.axvw';
        } else if (document.getElementById('abEamCptProjDisplaySelect_PanelB_markup').checked) {
            panelBType = 'markup';
            panelBFile = 'ab-eam-view-markup.axvw';
        }
        // prepare map restriction
        var mapRestriction = this.getGisMapRestriction(this.tmpFromLocation, this.tmpLevel, this.tmpRestriction, this.projectIds);

        // config map tools action
        var menuActions = new Ext.util.MixedCollection();
        menuActions.addAll(
            {
                id: 'proposedProjectCost',
                actionConfig: {
                    visible: true,
                    enabled: true,
                    type: '',
                    listener: 'onSelectMenuActionFromProject',
                    selected: true,
                    dataSourceId: 'abEamGisDs_proposedProjectCost'
                }
            },
            {
                id: 'proposedProjectAssetCost',
                actionConfig: {
                    visible: true,
                    enabled: true,
                    type: '',
                    listener: 'onSelectMenuActionFromProject',
                    selected: false,
                    dataSourceId: 'abEamGisDs_proposedProjectAssetCost'
                }
            },
            {
                id: 'projectArea',
                actionConfig: {
                    visible: true,
                    enabled: true,
                    type: '',
                    listener: 'onSelectMenuActionFromProject',
                    selected: false,
                    dataSourceId: 'abEamGisDs_projectArea'
                }
            },
            {
                id: 'projectHeadcount',
                actionConfig: {
                    visible: true,
                    enabled: true,
                    type: '',
                    listener: 'onSelectMenuActionFromProject',
                    selected: false,
                    dataSourceId: 'abEamGisDs_projectHeadcount'
                }
            }
        );

        var mapToolsActionConfig = new Ext.util.MixedCollection();
        mapToolsActionConfig.add('toolsAction', {
            id: 'toolsAction',
            actionConfig: {
                visible: true,
                enabled: true,
                type: 'menu',
                listener: null,
                selected: false,
                actions: menuActions
            }
        });

        var selectedProjects = this.projectIds;
        if (this.tmpFromLocation == 'project') {
            if (valueExists(this.tmpNodeData)) {
                var projectId = null;
                if (valueExistsNotEmpty(this.tmpNodeData['project.project_id'])) {
                    projectId = this.tmpNodeData['project.project_id'];
                } else if (valueExistsNotEmpty(this.tmpNodeData['work_pkgs.project_id'])) {
                    projectId = this.tmpNodeData['work_pkgs.project_id'];
                } else if (valueExistsNotEmpty(this.tmpNodeData['activity_log.project_id'])) {
                    projectId = this.tmpNodeData['activity_log.project_id'];
                }
                if (valueExistsNotEmpty(projectId)) {
                    selectedProjects = [];
                    selectedProjects.push(projectId);
                }
            }
        }
        var panelParameters = {
            'mapToolsActionConfig': mapToolsActionConfig,
            'selectedProjects': selectedProjects,
            'mapRestriction': mapRestriction
        };
    	var restriction = this.tmpRestriction;
        // show panel A
        if (valueExists(panelAType)) {
            if (panelAType == 'map') {
                if (restriction.findClause('fl.fl_id')) {
                    _.extend(panelParameters, {mapZoomLevel: 16});
                }
                if (restriction.findClause('rm.rm_id')) {
                    _.extend(panelParameters, {mapZoomLevel: 19});
                }
                this.abEamProjConsoleLocPanelA.parameters = panelParameters;
                this.abEamProjConsoleLocPanelA.loadView(panelAFile, mapRestriction, null);
            }else{
                this.abEamProjConsoleLocPanelA.loadView(panelAFile, restriction, null);
            }
        }
        if (valueExists(panelBType)) {
            if (panelBType == 'map') {
                if (restriction.findClause('fl.fl_id')) {
                    _.extend(panelParameters, {mapZoomLevel: 16});
                }
                if (restriction.findClause('rm.rm_id')) {
                    _.extend(panelParameters, {mapZoomLevel: 19});
                }
                this.abEamProjConsoleLocPanelB.parameters = panelParameters;
                this.abEamProjConsoleLocPanelB.loadView(panelBFile, mapRestriction, null);
            }else{
                this.abEamProjConsoleLocPanelB.loadView(panelBFile, restriction, null);
            }
        }
        this.abEamCptProjDisplaySelect.closeWindow();
    },

    getGisMapRestriction: function (fromLocation, level, restriction, projectIds) {
        var result = new Ab.view.Restriction();
        if (fromLocation == 'project') {
            var buildings = null;
            if (level == 'program') {
                var programId = restriction.findClause('program.program_id').value;
                var tmpRestriction = "EXISTS(SELECT project.project_id FROM project WHERE project.project_id = activity_log.project_id AND ";
                tmpRestriction += " project.program_id = '" + makeSafeSqlValue(programId) + "' AND ";
                tmpRestriction += " project.project_id IN ('" + makeSafeSqlValue(projectIds).join("', '") + "')";
                tmpRestriction += ")";
                buildings = getActivityLogBuildings(tmpRestriction);
            } else {
                buildings = getActivityLogBuildings(restriction);
            }

            if (buildings.length > 0) {
                result.addClause('bl.bl_id', buildings, 'IN');
            }
        } else {
            // geographical or location
            if (level == 'fl') {
                result.addClause('bl.bl_id', restriction.findClause('fl.bl_id').value, '=');
            } else if (level == 'rm') {
                result.addClause('bl.bl_id', restriction.findClause('rm.bl_id').value, '=');
            } else {
                result = restriction;
            }
        }
        return result;
    },

    onClickAddActionFromProjectTree: function (selectedNodeRestriction, commandContext) {
    	if (valueExists(commandContext.nodeData)) {
			if (valueExists(commandContext.nodeData['activity_log.work_pkg_id'])) {
				selectedNodeRestriction.addClause('activity_log.work_pkg_id', commandContext.nodeData['activity_log.work_pkg_id'], '=');
	    		
	    	} else if (valueExists(commandContext.nodeData['work_pkgs.work_pkg_id'])) {
	    		selectedNodeRestriction.addClause('activity_log.work_pkg_id', commandContext.nodeData['work_pkgs.work_pkg_id'], '=');
	    	}
    		
    	}
        this.addActionForLocation(selectedNodeRestriction, this.projectIds, null);
    },

    onClickAddWorkPkgFromProjectTree: function (selectedNodeRestriction, commandContext) {
        this.addWorkPkgForLocation(selectedNodeRestriction, this.projectIds, null);
    },


    onClickAddFromLocationTree: function (selectedNodeRestriction, commandContext) {
        this.selectedNodeRestriction = selectedNodeRestriction;
        this.abAddProjectLocation.setFieldValue('add_location_from', '');

        this.tmpAnchor = (commandContext && commandContext.target) ? commandContext.target : null;

        this.abAddProjectLocation.showInWindow({
            anchor: this.tmpAnchor,
            x: ((commandContext && commandContext.xy) ? commandContext.xy[0] : null),
            y: ((commandContext && commandContext.xy) ? commandContext.xy[1] : null),
            width: 400,
            height: 200,
            closeButton: false
        });
    },

    abAddProjectLocation_onOk: function () {
        this.addLocationFrom = this.abAddProjectLocation.getFieldValue('add_location_from');
        if (!valueExistsNotEmpty(this.addLocationFrom)) {
            View.showMessage(getMessage('errSelectLocationFrom'));
            return false;
        }
        if (this.addLocationFrom == 'bl') {
            this.addLocationFromInventory(this.selectedNodeRestriction, this.projectIds);
        } else if (this.addLocationFrom == 'gp') {
            this.addLocationFromScenario(this.selectedNodeRestriction, this.projectIds);
        }
        this.abAddProjectLocation.closeWindow();
    },

    addLocationFromInventory: function (restriction, projectIds) {
        this.abAddFromInventory_form.clear();
        this.abAddFromInventory_form.showInWindow({
            anchor: this.tmpAnchor,
            width: 400,
            height: 200
        });
    },

    addLocationFromScenario: function (restriction, projectIds) {
        this.abAddFromScenario_form.clear();
        if (projectIds.length == 1) {
            this.abAddFromScenario_form.showField('gp.portfolio_scenario_id', false);
        }

        this.abAddFromScenario_form.showInWindow({
            anchor: this.tmpAnchor,
            width: 400,
            height: 200
        });
    },

    addActionForLocation: function (restriction, projectIds) {
        if (projectIds.length > 1 &&
            (restriction.clauses.length == 0 || valueExists(restriction.findClause('program.program_id')))) {
            this.selectedNodeRestriction = restriction;
            this.abSelectProjects_form.showInWindow({
                x: 200,
                y: 200,
                width: 400,
                height: 200,
                closeButton: false
            });
            this.abSelectProjects_form.setTitle(getMessage('selectProjectAddActionMessage'));
            this.abSelectProjects_form.actions.get('doActionForSelectedProjects').setTitle(getMessage('projectAddAction'));
            this.abSelectProjects_form.actions.get('doActionForSelectedProjects').button.el.dom.onclick = this.abSelectProjects_form_onAddAction.createDelegate(this);
            var selBoxField = this.abSelectProjects_form.fields.get('sel_project_ids');
            selBoxField.clearOptions();
            for (var i = 0; i < projectIds.length; i++) {
                selBoxField.addOption(projectIds[i], projectIds[i]);
            }
        } else {
            restriction.addClause('activity_log.project_id', projectIds[0]);
            this.addProjectAction(restriction, true);
        }
    },

    abSelectProjects_form_onAddAction: function () {
        var projectId = this.abSelectProjects_form.getFieldValue('sel_project_ids');
        var restriction = new Ab.view.Restriction({'activity_log.project_id': projectId});
        if (valueExists(this.selectedNodeRestriction)) {
            var workPkgClause = this.selectedNodeRestriction.findClause('work_pkgs.work_pkg_id');
            if (valueExists(workPkgClause)) {
                restriction.addClause('activity_log.work_pkg_id', workPkgClause.value);
            }
        }
        this.addProjectAction(restriction, true);
        this.abSelectProjects_form.closeWindow();
    },

    addProjectAction: function (restriction, newRecord) {
        View.openDialog('ab-proj-mng-act-edit.axvw', restriction, newRecord, {
            width: 1024,
            height: 600,
            createWorkRequest:false,
            isCopyAsNew: false,
            showDocumentsPanel: true,
            panelsConfiguration: {
                'projMngActEdit_Progress': {
                    actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                    fields: [
                         {name: 'activity_log.status'},
                         {name: 'activity_log.hours_est_baseline', required: true},
                         {name: 'activity_log.date_planned_for', required: true},
                         {name: 'activity_log.duration_est_baseline', required: true},
                         {name: 'activity_log.date_required'},
                         {name: 'activity_log.date_scheduled_end'}
                    ]
                },
                'projMngActEdit_Costs': {
                    actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                    fields: [
                        {name: 'activity_log.cost_est_cap', required: true},
                        {name: 'activity_log.cost_estimated', required: true}
                    ]
                },
                'projMngActEdit_Details': {
                    fields: [
                         {name: 'activity_log.doc'},
                         {name: 'activity_log.description'},
                         {name: 'activity_log.created_by'},
                         {name: 'activity_log.date_requested'},
                         {name: 'activity_log.approved_by'},
                        {name: 'activity_log.date_approved'}
                    ]
                }
            },
            callback: function () {
                View.controllers.get('abEamCptProjConsLocationController').reloadTree();
            }
        });
    },


    addWorkPkgForLocation: function (restriction, projectIds, floors) {
        var controller = this;
        View.openDialog('ab-proj-mng-pkg-prof-edit.axvw', restriction, true, {
            width: 800,
            height: 600,
            projectIds: projectIds,
            floors: floors,
            callback: function () {
                controller.reloadTree();
                View.closeDialog();
            }
        });
    },
    
    abAddFromInventory_form_onSave: function () {
        if (this.abAddFromInventory_form.canSave()) {
            var isActivityTypeDef = this.isActivityTypeDefined(this.activityType);
            var selProjectsNo = this.projectIds.length;
            if (isActivityTypeDef && selProjectsNo == 1) {
            	this.tmpProjectId = this.projectIds[0];
            	this.addBuildingInventory(this.tmpProjectId, this.activityType, this.tmpBlId, this.tmpFlId);
            } else {
                // user must select project or activity_log
                this.abAddActivityLog_form.refresh(new Ab.view.Restriction(), true);

                if (selProjectsNo == 1) {
                    this.abAddActivityLog_form.setFieldValue('activity_log.project_id', this.projectIds[0]);
                }
                if (isActivityTypeDef) {
                    this.abAddActivityLog_form.setFieldValue('activity_log.activity_type', this.activityType);
                }
                this.abAddActivityLog_form.setFieldValue('activity_log.bl_id', this.tmpBlId);
                this.abAddActivityLog_form.setFieldValue('activity_log.fl_id', this.tmpFlId);

                this.abAddActivityLog_form.showInWindow({
                    anchor: this.tmpAnchor,
                    width: 400,
                    height: 200
                });
            }
            this.reloadTree();
            this.abAddFromInventory_form.closeWindow();
        }
    },

    abAddFromScenario_form_onSave: function () {
        if (this.abAddFromScenario_form.canSave()) {
            if (this.projectIds.length > 1
                && !valueExistsNotEmpty(this.abAddFromScenario_form.getFieldValue('gp.portfolio_scenario_id'))) {
                View.showMessage(getMessage('errSelectProject'));
                return false;
            } else if (this.projectIds.length == 1) {
                this.abAddFromScenario_form.setFieldValue('gp.portfolio_scenario_id', this.projectIds[0]);
            }

            this.tmpBlId = this.abAddFromScenario_form.getFieldValue('gp.bl_id');
            this.tmpFlId = this.abAddFromScenario_form.getFieldValue('gp.fl_id');
            this.tmpProjectId = this.abAddFromScenario_form.getFieldValue('gp.portfolio_scenario_id');
            this.tmpGpId = this.getGpScenarioId(this.tmpProjectId, this.tmpBlId, this.tmpFlId);
            if (this.tmpGpId == -1) {
                this.createPortfolioScenario(this.tmpProjectId);
                this.abAddFromScenario_form.newRecord = true;
                if (this.abAddFromScenario_form.save()) {
                    this.tmpGpId = this.abAddFromScenario_form.getFieldValue('gp.gp_id');
                } else {
                    return false;
                }
            }
            // continue to next form
            var isActivityTypeDef = this.isActivityTypeDefined(this.activityType);
            if (isActivityTypeDef) {
                var activityLogRecord = new Ab.data.Record({
                    'activity_log.project_id': this.tmpProjectId,
                    'activity_log.activity_type': this.activityType,
                    'activity_log.gp_id': this.tmpGpId
                }, true);

                try {
                    this.abAddActivityLog_ds.saveRecord(activityLogRecord);

                } catch (e) {
                    Workflow.handleError(e)
                    return false;
                }
            } else {
                // user must select project or activity_log
                this.abAddActivityLog_form.refresh(new Ab.view.Restriction(), true);
                this.abAddActivityLog_form.setFieldValue('activity_log.project_id', this.tmpProjectId);
                this.abAddActivityLog_form.setFieldValue('activity_log.gp_id', this.tmpGpId);

                this.abAddActivityLog_form.showInWindow({
                    anchor: this.tmpAnchor,
                    width: 400,
                    height: 200
                });
            }
            this.abAddFromScenario_form.closeWindow()
        }
    },

    reloadTree: function () {
        var selectedTabName = this.abEamProjConsoleLocTree.getSelectedTabName();
        this.abEamProjConsoleLocTree.findTab(selectedTabName).refresh();
    },

    isActivityTypeDefined: function (activityType) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activitytype.activity_type', activityType, '=');
        var record = this.abActivityType_ds.getRecord(restriction);
        if (valueExists(record) && !record.isNew) {
            return true;
        } else {
            return false;
        }
    },

    getGpScenarioId: function (projectId, blId, flId) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('gp.portfolio_scenario_id', projectId, '=');
        restriction.addClause('gp.bl_id', blId, '=');
        restriction.addClause('gp.fl_id', flId, '=');
        var record = this.abAddFromScenario_ds.getRecord(restriction);
        if (valueExists(record) && record.isNew) {
            return -1;
        } else {
            return record.getValue('gp.gp_id');
        }
    },

    createPortfolioScenario: function (projectId) {
        var restriction = new Ab.view.Restriction({'portfolio_scenario.portfolio_scenario_id': projectId});
        var record = this.abPortfolioScenario_ds.getRecord(restriction);
        if (record.isNew) {
            record.setValue('portfolio_scenario.portfolio_scenario_id', projectId);
            this.abPortfolioScenario_ds.saveRecord(record);
        }
    },
    
    abEamProjConsoleLocationFilter_onReports: function(){
    	var buttonElem = Ext.get('reports');
    	var reportMenuItem = new MenuItem({
    		menuDef: {
    			id: 'reportsMenu',
    			type: 'menu',
    			viewName: null, 
    			isRestricted: false, 
    			parameters: null},
    		onClickMenuHandler: onClickMenu,
    		onClickMenuHandlerRestricted: onClickMenuWithRestriction,
    		submenu: abEamReportsCommonMenu
    	});
    	reportMenuItem.build();
    	
		var menu = new Ext.menu.Menu({items: reportMenuItem.menuItems});
		menu.show(buttonElem, 'tl-bl?');    	
    },
    
    addBuildingInventory: function(projectId, activityType, blIds, flIds){
    	var controller = this;
    	View.openDialog('ab-proj-mng-act-edit.axvw', null, true, {
    		width:800,
    		height:800,
    		isCopyAsNew: true,    		
    		tmpProjectId: projectId,
    		tmpActivityType: activityType,
    		tmpBlIds: blIds,
    		tmpFlIds: flIds,
    		closeWindowAfterSave: true,
    		panelsConfiguration: {
                'projMngActEdit_Progress': {
                    actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                    fields: [
                         {name: 'activity_log.status'},
                         {name: 'activity_log.hours_est_baseline', required: true},
                         {name: 'activity_log.date_planned_for', required: true},
                         {name: 'activity_log.duration_est_baseline', required: true},
                         {name: 'activity_log.date_required'},
                         {name: 'activity_log.date_scheduled_end'}
                    ]
                },
                'projMngActEdit_Costs': {
                    actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                    fields: [
                        {name: 'activity_log.cost_est_cap', required: true},
                        {name: 'activity_log.cost_estimated', required: true}
                    ]
                },
                'projMngActEdit_Details': {
                    fields: [
                         {name: 'activity_log.doc'},
                         {name: 'activity_log.description'},
                         {name: 'activity_log.created_by'},
                         {name: 'activity_log.date_requested'},
                         {name: 'activity_log.approved_by'},
                        {name: 'activity_log.date_approved'}
                    ]
                }
    		},
    		callback: function(){
    			controller.reloadTree();
    			controller.tmpBlId = null;
    			controller.tmpFlId = null;
    			controller.tmpProjectId = null;
    			controller.tmpFromLocation = null;
    		}
    	});
    	
    },
    
    abAddActivityLog_form_onSave: function(){
    	if (this.abAddActivityLog_form.canSave()){
    		if(this.addLocationFrom == 'bl'){
    			this.tmpProjectId = this.abAddActivityLog_form.getFieldValue('activity_log.project_id');
    			this.activityType = this.abAddActivityLog_form.getFieldValue('activity_log.activity_type');
    			this.addBuildingInventory(this.tmpProjectId, this.activityType, this.tmpBlId, this.tmpFlId);
    		} else if (this.addLocationFrom == 'gp') {
    			this.abAddActivityLog_form.save();
    		}
    	}
    	this.reloadTree();
    	this.abAddActivityLog_form.closeWindow();
    }
});

/**
 * Uncheck pairs checkboxes
 * @param checkbox1 source element
 * @param checkbox2 pair
 * @param checkbox3 pair
 */
function uncheck(checkbox1, checkbox2, checkbox3) {
    var obj1 = document.getElementById(checkbox1),
        obj2 = document.getElementById(checkbox2),
        obj3 = document.getElementById(checkbox3);
    if (obj1.checked && obj2.checked) {
        obj2.checked = false;
    }
    if (obj1.checked && obj3.checked) {
        obj3.checked = false;
    }
}


/**
 * On select building with add new
 * @param context
 */
function onSelectBuildingWithAddNew(context) {
    var panelId = context.command.parentPanelId;
    var parentPanel = View.panels.get(panelId);
    var blId = parentPanel.getFieldValue('fl.bl_id');
    var controller = View.controllers.get('abEamCptProjConsLocationController');
    
    View.openDialog('ab-bl-select-value-with-add-new.axvw', null, false, {
        width: 800,
        height: 800,
        blId: blId,
        callback: function (row) {
        	var selectedBlId = row.getFieldValue('bl.bl_id');
        	controller.tmpBlId = new Array();
        	controller.tmpBlId.push(selectedBlId);
            parentPanel.setFieldValue('fl.bl_id', selectedBlId);
        }
    });
}

/**
 * On select floor with add new
 * @param context
 */
function onSelectFloorWithAddNew(context) {
    var panelId = context.command.parentPanelId;
    var parentPanel = View.panels.get(panelId);
    var blId = parentPanel.getFieldValue('fl.bl_id');
    var flId = parentPanel.getFieldValue('fl.fl_id');
    var controller = View.controllers.get('abEamCptProjConsLocationController');

    View.openDialog('ab-fl-select-value-with-add-new.axvw', null, false, {
        width: 800,
        height: 800,
        selectValueType: 'multiple',
        blId: blId,
        flId: flId,
        callback: function (rows) {
        	var selectedBlId = '';
        	var selectedFlId = '';
        	controller.tmpBlId = new Array();
        	controller.tmpFlId = new Array();
        	for (var i = 0; i< rows.length; i++) {
        		var row = rows[i];
        		var tmpBlId = row.getFieldValue('fl.bl_id');
        		var tmpFlId = row.getFieldValue('fl.fl_id');
        		
        		if(controller.tmpBlId.indexOf(tmpBlId) == -1) {
            		selectedBlId += (selectedBlId.length > 0? Ab.form.Form.MULTIPLE_VALUES_SEPARATOR:'') + tmpBlId;
        		}
        		selectedFlId += (selectedFlId.length > 0? Ab.form.Form.MULTIPLE_VALUES_SEPARATOR:'') + tmpFlId;
        		
        		controller.tmpBlId.push(tmpBlId);
        		controller.tmpFlId.push(tmpFlId);
        	}
        	parentPanel.setFieldValue('fl.bl_id', selectedBlId);
            parentPanel.setFieldValue('fl.fl_id', selectedFlId);
        }
    });
}

function onSelectValue_activity_log_project_id() {
    var controller = View.controllers.get('abEamCptProjConsLocationController');
    var title = controller.abAddActivityLog_form.fields.get('activity_log.project_id').fieldDef.config.title;
    var restriction = new Ab.view.Restriction();
    restriction.addClause('project.project_id', controller.projectIds, 'IN');


    View.selectValue('abAddActivityLog_form', title, ['activity_log.project_id'], 'project', ['project.project_id'],
        ['project.project_id', 'project.project_name', 'project.status'], restriction);

}

function onSelectValue_gp_project_id() {
    var controller = View.controllers.get('abEamCptProjConsLocationController');
    var title = controller.abAddFromScenario_form.fields.get('gp.portfolio_scenario_id').fieldDef.config.title;
    var restriction = new Ab.view.Restriction();
    restriction.addClause('project.project_id', controller.projectIds, 'IN');


    View.selectValue('abAddFromScenario_form', title, ['gp.portfolio_scenario_id'], 'project', ['project.project_id'],
        ['project.project_id', 'project.project_name', 'project.status'], restriction);
}


function onClickMenu(menu){
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}

function onClickMenuWithRestriction(menu){
	// TODO : pass restriction to view name
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}

