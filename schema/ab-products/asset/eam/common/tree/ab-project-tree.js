/**
 * Project tree controller.
 */
var abProjectTreeController = View.createController('abProjectTreeController', {

    // on click display handler: defined in caller view
    onClickDisplayHandler: null,

    // on click details handler: defined in caller view
    onClickDetailsHandler: null,

    // on click markup handler: defined in caller view
    onClickMarkUpHandler: null,

    onClickNodeEventHandler: null,

    onClickAddHandler: null,

    onAddWorkPkgHandler: null,

    onAddActionHandler: null,

    onClickPPTHandler: null,

    onClickPPTHandler_level: null,

    onClickClearSelectionHandler: null,

    restriction: null,

    projectIds: null,

    parameters: null,

    // used to create and order no programs level
    nullValuePrgCode: '000000_NO_PRG',
    // used to create no work package level
    nullValueWorkPkgCode: '000000_NO_WORK_PKG',

    autoExpandLevelNoProgram: false,
    // the maximum width of a node content,
    // beyond which content is shortened to ellipses and whole content is shown in tooltip
    maxContentWidth: 30,

    afterInitialDataFetch: function () {
        // apply levels restrictions
        this.abProjectTree.updateRestrictionForLevel = function (parentNode, level, restriction) {
            var programId = parentNode.data['program.program_id'];
            if (level == 1 && programId != abProjectTreeController.nullValuePrgCode) {
                restriction.addClause('project.program_id', parentNode.data['program.program_id']);
            } else if (level == 2) {
                restriction.addClause('work_pkgs.project_id', parentNode.data['project.project_id']);
            } else if (level == 3) {
                restriction.addClause('activity_log.project_id', parentNode.data['work_pkgs.project_id']);
                var workPkgId = parentNode.data['work_pkgs.work_pkg_id'];
                if (workPkgId != abProjectTreeController.nullValueWorkPkgCode) {
                    restriction.addClause('activity_log.work_pkg_id', workPkgId);
                }
            }
        };
        // refresh helper panel to trigger afterRefresh event
        this.abProjectTreeGenericHelper.refresh();
    },

    abProjectTreeGenericHelper_afterRefresh: function () {
        if (valueExists(this.view.restriction)) {
            this.restriction = new Ab.view.Restriction();
            this.restriction.addClauses(this.view.restriction);
        }
        if (valueExists(this.view.getParentTab())) {
            var parentTab = this.view.getParentTab();
            if (valueExists(parentTab.parameters)) {
                this.parameters = parentTab.parameters;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickDetailsHandler)) {
                this.onClickDetailsHandler = parentTab.parameters.onClickDetailsHandler;
            }
            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickDisplayHandler)) {
                this.onClickDisplayHandler = parentTab.parameters.onClickDisplayHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickAddHandler)) {
                this.onClickAddHandler = parentTab.parameters.onClickAddHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onAddWorkPkgHandler)) {
                this.onAddWorkPkgHandler = parentTab.parameters.onAddWorkPkgHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onAddActionHandler)) {
                this.onAddActionHandler = parentTab.parameters.onAddActionHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickPPTHandler)) {
                this.onClickPPTHandler = parentTab.parameters.onClickPPTHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickPPTHandler_level)) {
                this.onClickPPTHandler_level = parentTab.parameters.onClickPPTHandler_level;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickMarkUpHandler)) {
                this.onClickMarkUpHandler = parentTab.parameters.onClickMarkUpHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickNodeEventHandler)) {
                this.onClickNodeEventHandler = parentTab.parameters.onClickNodeEventHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.autoExpandLevelNoProgram)) {
                this.autoExpandLevelNoProgram = parentTab.parameters.autoExpandLevelNoProgram;
            }

            if(valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickClearSelectionHandler)){
				this.onClickClearSelectionHandler = parentTab.parameters.onClickClearSelectionHandler;
			}

        }

        if (valueExists(this.parameters['showFieldLabelOnTreeTable'])
            && !this.parameters['showFieldLabelOnTreeTable']) {
            for (var i = 0; i < this.abProjectTree.config.panelsData.length; i++) {
                this.abProjectTree.config.panelsData[i].showLabels = this.parameters['showFieldLabelOnTreeTable'];
                this.abProjectTree._panelsData[i].showLabels = this.parameters['showFieldLabelOnTreeTable'];
            }
        }
        // call method after the node expand is complete to display certain node actions
        this.abProjectTree.treeView.subscribe("expandComplete", this.expandComplete, this);

        // show add button
        this.abProjectTree.actions.get('addProject').show(valueExists(this.onClickAddHandler));
        this.abProjectTree.actions.get('addProject_menu').show(valueExists(this.onAddWorkPkgHandler) || valueExists(this.onAddActionHandler));


        // show "exportPPT" on tree panel
        this.abProjectTree.actions.get('exportPPT').show(valueExists(this.onClickPPTHandler));
        this.abProjectTree.actions.get('markUp').show(valueExists(this.onClickMarkUpHandler));
        this.abProjectTree.actions.get('clearSelection').show(valueExists(this.onClickClearSelectionHandler));

        // show hide buttons on tree levels
        for (var i = 0; i < this.abProjectTree._panelsData.length; i++) {
            for (var j = 0; j < this.abProjectTree._panelsData[i].fieldDefs.length; j++) {
                if (this.abProjectTree._panelsData[i].fieldDefs[j].controlType == 'image'
                    || this.abProjectTree._panelsData[i].fieldDefs[j].controlType == 'button') {
                    if (this.abProjectTree._panelsData[i].fieldDefs[j].id == 'display') {
                        this.abProjectTree._panelsData[i].fieldDefs[j].hidden = (valueExists(this.onClickDisplayHandler) ? 'false' : 'true');
                    }
                    if (this.abProjectTree._panelsData[i].fieldDefs[j].id == 'details') {
                        this.abProjectTree._panelsData[i].fieldDefs[j].hidden = (valueExists(this.onClickDetailsHandler) ? 'false' : 'true');
                    }
                    if (this.abProjectTree._panelsData[i].fieldDefs[j].id == 'exportPPT') {
                        this.abProjectTree._panelsData[i].fieldDefs[j].hidden = (valueExists(this.onClickPPTHandler_level) ? 'false' : 'true');
                    }
                }
            }
        }
        this.refreshTree(this.restriction, this.parameters);
    },

    getProjectRestriction: function () {
        var restriction = "1=1";
        if (this.projectIds.length > 0) {
            var projectIds = makeSafeSqlValue(this.projectIds);
            restriction = "EXISTS(SELECT project.project_id FROM project WHERE project.program_id = program.program_id AND project.project_id IN ('" + projectIds.join("','") + "'))";
        }
        return restriction;
    },

    /**
     * Refresh tree control.
     */
    refreshTree: function (restriction, parameters) {
        if (valueExists(parameters)) {
            for (var param in parameters) {
                if (param.indexOf('_restriction') != -1) {
                    this.abProjectTree.addParameter(param, parameters[param]);
                }
            }
        }
        this.abProjectTree.refresh(restriction);
    },

    /**
     * Hide action when program id is null.
     * @param panel
     */
    abProjectTree_afterRefresh: function (panel) {
        for (var i = 0; i < panel._nodes.length; i++) {
            if (panel._nodes[i].data['program.program_id'] === this.nullValuePrgCode) {
                //hide action buttons
                this.hideActionsForFieldNode(panel._nodes[i]);
                //reset restriction to program id null
                panel._nodes[i].restriction.removeClause('program.program_id');
                panel._nodes[i].restriction.addClause('program.program_id', null, 'IS NULL');
                if (this.autoExpandLevelNoProgram) {
                    panel.expandNode(panel._nodes[i]);
                }
                break;
            }
        }
    },
    /**
     * Called after a tree node is expanded to find special nodes.
     * @param node
     * @param controller
     */
    expandComplete: function (node, controller) {
        if (node.level.levelIndex == 1) {//expand complete for project
            for (var i = 0; i < node.children.length; i++) {
                if (node.children[i].data['work_pkgs.work_pkg_id'] === controller.nullValueWorkPkgCode) {
                    //hide action buttons
                    controller.hideActionsForFieldNode(node.children[i]);
                    //reset restriction to work_pkg_id null
                    node.children[i].restriction.removeClause('work_pkgs.work_pkg_id');
                    node.children[i].restriction.addClause('work_pkgs.work_pkg_id', null, 'IS NULL');
                    break;
                }
            }
        }
    },
    /**
     * Hide actions onm tree node level.
     * @param node
     */
    hideActionsForFieldNode: function (node) {
        //hide action buttons
        var displayButton = document.getElementById(node.contentElId + '_1');
        var detailsButton = document.getElementById(node.contentElId + '_2');
        if (valueExists(displayButton)) {
            displayButton.style.display = "none";
        }
        if (valueExists(detailsButton)) {
            detailsButton.style.display = "none";
        }
    },

    abProjectTree_onDisplay: function (button, panel, node) {
        this.onDisplayCommon(button, panel, node, 'program');
    },

    abProjectTree_onDetails: function (button, panel, node) {
        this.onDetailsCommon(button, panel, node, 'program');
    },

    abProjectTreeProject_onDisplay: function (button, panel, node) {
        this.onDisplayCommon(button, panel, node, 'project');
    },

    abProjectTreeProject_onDetails: function (button, panel, node) {
        this.onDetailsCommon(button, panel, node, 'project');
    },

    abProjectTreeWorkPkg_onDisplay: function (button, panel, node) {
        this.onDisplayCommon(button, panel, node, 'work_pkgs');
    },

    abProjectTreeWorkPkg_onDetails: function (button, panel, node) {
        this.onDetailsCommon(button, panel, node, 'work_pkgs');
    },

    abProjectTreeAction_onDisplay: function (button, panel, node) {
        this.onDisplayCommon(button, panel, node, 'activity_log');
    },

    abProjectTreeAction_onDetails: function (button, panel, node) {
        this.onDetailsCommon(button, panel, node, 'activity_log');
    },

    onDisplayCommon: function (button, panel, node, level) {
        var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
        if (valueExists(this.onClickDisplayHandler)) {
            this.onClickDisplayHandler('project', level, selectedNodeRestriction, node.data, button);
        }
    },

    onDetailsCommon: function (button, panel, node, level) {
        var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
        if (valueExists(this.onClickDisplayHandler)) {
            this.onClickDetailsHandler('project', level, selectedNodeRestriction, node.data, button);
        }
    },

    getSelectedNodeTreeRestriction: function (node) {
        var restriction = new Ab.view.Restriction();
        if (valueExists(node)) {
            var tmpNode = node;
            while (!tmpNode.isRoot()) {
                restriction.addClauses(tmpNode.restriction);
                tmpNode = tmpNode.parent;
            }
        }
        return restriction;
    },

    getSelectedNodeRestriction: function (node) {
        var restriction = new Ab.view.Restriction();
        if (valueExists(node)) {
            restriction.addClauses(node.restriction);
        }
        return restriction;
    },

    reloadTreeData: function () {
        this.abProjectTreeGenericHelper_afterRefresh();
    },

    abProjectTree_onAddProject: function () {
        var commandContext = null;
        if (arguments && arguments.length > 0) {
            // first argument is action button  and second argument is browser event
            if (valueExists(arguments[1])) {
                commandContext = arguments[1];
            }
        }
        var selecteNodeRestriction = this.getSelectedNodeTreeRestriction(this.abProjectTree.lastNodeClicked);
        if (valueExists(this.onClickAddHandler)) {
            this.onClickAddHandler(selecteNodeRestriction, commandContext);
        }
    },

    //called from project tab
    abProjectTree_onExportPPT: function () {
        if (valueExists(this.onClickPPTHandler)) {
            this.onClickPPTHandler();
        }
    },

    //called from tree project
    abProjectTreeProject_onExportPPT: function (button, panel, node) {
        node.highlightNode(false);
        if (valueExists(this.onClickPPTHandler_level)) {
            this.onClickPPTHandler_level(node.data['project.project_id']);
        }
    },

    abProjectTree_onMarkUp: function () {
        if (valueExists(this.onClickMarkUpHandler)) {
            this.onClickMarkUpHandler();
        }
    },

    onClickNode: function (panelId, restriction) {
        var lastNodeClicked = this.abProjectTree.lastNodeClicked;
        var levelIndex = lastNodeClicked.level.levelIndex;
        if (levelIndex == 0) {
            var programId = lastNodeClicked.data['program.program_id'];
            if (programId === this.nullValuePrgCode) {
                lastNodeClicked.restriction.removeClause('program.program_id');
                lastNodeClicked.restriction.addClause('program.program_id', null, 'IS NULL');
            }
        }
        if (valueExists(this.onClickNodeEventHandler)) {
            var restriction = this.getSelectedNodeRestriction(lastNodeClicked);
            this.onClickNodeEventHandler('project', restriction);
        } else {
            if (lastNodeClicked.expanded) {
                lastNodeClicked.collapse();
            } else {
                lastNodeClicked.expand();
            }
        }
    },

    abProjectTree_afterGeneratingTreeNode: function (node) {
        var controller = View.controllers.get('abProjectTreeController');
        if (valueExists(node.level.dataSourceFieldDefs.get('program.vf_concatenated_node'))
            && node.level.dataSourceFieldDefs.get('program.vf_concatenated_node').hidden == 'false') {
            var nodeLabel = '<b>' + node.data['program.program_id'] + '</b>';
            var description = node.data['program.description'];
            if (valueExistsNotEmpty(description)) {
                var tooltip = '';
                if (description.length > controller.maxContentWidth) {
                    description = Ext.util.Format.ellipsis(description, controller.maxContentWidth);
                    var tooltipTag = (Ext.isIE) ? 'title' : 'ext:qtip';
                    tooltip = tooltipTag + '="' + node.data['program.description'] + '"';
                }
                nodeLabel += '<span ' + tooltip + '"> ,' + description + '</span>';
            } else {
                if (node.data['program.program_id'] == controller.nullValuePrgCode) {
                    nodeLabel = '<b>' + getMessage("msg_no_program") + '</b>';
                }
            }
            node.label = node.label.replace('{label_html}', nodeLabel);
        }
    },

    abProjectTreeProject_afterGeneratingTreeNode: function (node) {
        if (valueExists(node.level.dataSourceFieldDefs.get('project.vf_concatenated_node'))
            && node.level.dataSourceFieldDefs.get('project.vf_concatenated_node').hidden == 'false') {
            var nodeLabel = '<b>' + node.data['project.project_id'] + '</b>';
            if (valueExistsNotEmpty(node.data['project.project_name'])) {
                nodeLabel += ', ' + node.data['project.project_name'];
            }
            node.label = node.label.replace('{label_html}', nodeLabel);
        }
    },

    abProjectTreeWorkPkg_afterGeneratingTreeNode: function (node) {
        var controller = View.controllers.get('abProjectTreeController');
        if (valueExists(node.level.dataSourceFieldDefs.get('work_pkgs.vf_concatenated_node'))
            && node.level.dataSourceFieldDefs.get('work_pkgs.vf_concatenated_node').hidden == 'false') {
            var nodeLabel = '<b>' + node.data['work_pkgs.work_pkg_id'] + '</b>';
            if (node.data['work_pkgs.work_pkg_id'] == controller.nullValueWorkPkgCode) {
                nodeLabel = '<b>' + getMessage("msg_no_work_pkg") + '</b>';
            }
            node.label = node.label.replace('{label_html}', nodeLabel);
        }
    },

    abProjectTreeAction_afterGeneratingTreeNode: function (node) {
        if (valueExists(node.level.dataSourceFieldDefs.get('activity_log.vf_concatenated_node'))
            && node.level.dataSourceFieldDefs.get('activity_log.vf_concatenated_node').hidden == 'false') {
            var nodeLabel = '<b>' + node.data['activity_log.activity_log_id'] + '</b>';
            if (valueExistsNotEmpty(node.data['activity_log.action_title'])) {
                nodeLabel += ', ' + node.data['activity_log.action_title'];
            }
            node.label = node.label.replace('{label_html}', nodeLabel);
        }
    },

    onAddWorkPkg: function(context){
        if (valueExists(this.onAddWorkPkgHandler)) {
        	var lastNodeClicked = this.abProjectTree.lastNodeClicked;
        	if (valueExists(lastNodeClicked)) {
        		context.nodeData = lastNodeClicked.data;
        	}
        	var restriction = this.getSelectedNodeRestriction(lastNodeClicked);
            this.onAddWorkPkgHandler(restriction, context);
        }
    },

    onAddAction: function(context){
        if (valueExists(this.onAddActionHandler)) {
        	var lastNodeClicked = this.abProjectTree.lastNodeClicked;
        	if (valueExists(lastNodeClicked)) {
        		context.nodeData = lastNodeClicked.data;
        	}
        	var restriction = this.getSelectedNodeRestriction(lastNodeClicked);
            this.onAddActionHandler(restriction, context);
        }
    },

    abProjectTree_onClearSelection: function(){
    	if(valueExists(this.onClickClearSelectionHandler)){
    		this.onClickClearSelectionHandler();
    	}
    }
});

/**
 * On click node event handler.
 * @param context
 */
function onClickNodeHandler(context) {
    var controller = View.controllers.get('abProjectTreeController');
    controller.onClickNode(context.command.parentPanelId, context.restriction);
}

/**
 * Called after tree node label is created.
 * Used when panel type tree without control type table.
 * @param node
 */
function afterGeneratingTreeNode(node) {
    var controller = View.controllers.get('abProjectTreeController');
    if (node.level.levelIndex == 0) {
        if (node.data['program.program_id'] == controller.nullValuePrgCode) {
            node.label = node.label.replace(controller.nullValuePrgCode, getMessage("msg_no_program"));
        }
    }
    if (node.level.levelIndex == 2) {
        if (node.data['work_pkgs.work_pkg_id'] == controller.nullValueWorkPkgCode) {
            node.label = node.label.replace(controller.nullValueWorkPkgCode, getMessage("msg_no_work_pkg"));
        }
    }
}


function onAddWorkPkg(context){
	var controller = View.controllers.get('abProjectTreeController');
	controller.onAddWorkPkg(context);
}

function onAddAction(context){
    var controller = View.controllers.get('abProjectTreeController');
    controller.onAddAction(context);
}