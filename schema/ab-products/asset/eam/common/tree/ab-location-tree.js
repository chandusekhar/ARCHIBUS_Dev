/**
 * Location tree controller
 */
var abLocationTreeController = View.createController('abLocationTreeController', {

    // on click display handler: defined in caller view
    onClickDisplayHandler: null,

    // on click details handler: defined in caller view
    onClickDetailsHandler: null,

    // on click markup handler: defined in caller view
    onClickMarkUpHandler: null,

    onClickNodeEventHandler: null,

    onClickAddHandler: null,
    
    onClickClearSelectionHandler: null,
    
    onClickPPTHandler: null,

    restriction: null,

    projectIds: null,

    parameters: null,

    afterInitialDataFetch: function () {
        // refresh helper panel to trigger afterRefresh event
        this.abLocTreeGenericHelper.refresh();
    },

    abLocTreeGenericHelper_afterRefresh: function () {
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

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickMarkUpHandler)) {
                this.onClickMarkUpHandler = parentTab.parameters.onClickMarkUpHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickAddHandler)) {
                this.onClickAddHandler = parentTab.parameters.onClickAddHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickNodeEventHandler)) {
                this.onClickNodeEventHandler = parentTab.parameters.onClickNodeEventHandler;
            }
            
            if(valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickClearSelectionHandler)){
				this.onClickClearSelectionHandler = parentTab.parameters.onClickClearSelectionHandler;
			}
            if(valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickPPTHandler)){
				this.onClickPPTHandler = parentTab.parameters.onClickPPTHandler;
			}
        }
        
		if (valueExists(this.parameters['showFieldLabelOnTreeTable']) 
				&& !this.parameters['showFieldLabelOnTreeTable']) {
			for(var i=0; i < this.abLocationTree.config.panelsData.length; i++){
				this.abLocationTree.config.panelsData[i].showLabels = this.parameters['showFieldLabelOnTreeTable'];
				this.abLocationTree._panelsData[i].showLabels = this.parameters['showFieldLabelOnTreeTable'];
			}
		}
        // show add button
        this.abLocationTree.actions.get('addLocation').show(valueExists(this.onClickAddHandler));
        this.abLocationTree.actions.get('exportPPT').show(valueExists(this.onClickPPTHandler));
        this.abLocationTree.actions.get('clearSelection').show(valueExists(this.onClickClearSelectionHandler));

        this.refreshTree(this.restriction, this.parameters);
    },

    getProjectRestriction: function () {
        var restriction = "1=1";
        if (this.projectIds.length > 0) {
            var projectIds = makeSafeSqlValue(this.projectIds);
            restriction = "EXISTS(SELECT activity_log.bl_id FROM activity_log WHERE activity_log.bl_id = bl.bl_id AND activity_log.project_id IN ('" + projectIds.join("','") + "'))";
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
                    this.abLocationTree.addParameter(param, parameters[param]);
                }
            }
        }
        this.abLocationTree.refresh(restriction);
    },

    abLocationTree_onDisplay: function (button, panel, node) {
        this.onDisplayCommon(button, panel, node, 'site');
    },

    abLocationTree_onDetails: function (button, panel, node) {
        this.onDetailsCommon(button, panel, node, 'site');
    },

    abLocationTreeBl_onDisplay: function (button, panel, node) {
        this.onDisplayCommon(button, panel, node, 'bl');
    },

    abLocationTreeBl_onDetails: function (button, panel, node) {
        this.onDetailsCommon(button, panel, node, 'bl');
    },

    abLocationTreeFl_onDisplay: function (button, panel, node) {
        this.onDisplayCommon(button, panel, node, 'fl');
    },

    abLocationTreeFl_onDetails: function (button, panel, node) {
        this.onDetailsCommon(button, panel, node, 'fl');
    },
    
    abLocationTreeFl_onMarkUp: function (button, panel, node) {
        this.onMarkUpCommon(button, panel, node);
    },

    onDisplayCommon: function (button, panel, node, level) {
        var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
        if (valueExists(this.onClickDisplayHandler)) {
            this.onClickDisplayHandler('location', level, selectedNodeRestriction, node.data, button);
        }
    },

    onDetailsCommon: function (button, panel, node, level) {
        var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
        if (valueExists(this.onClickDisplayHandler)) {
            this.onClickDetailsHandler('location', level, selectedNodeRestriction, node.data, button);
        }
    },

    onMarkUpCommon: function (button, panel, node) {
        var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
        if (valueExists(this.onClickMarkUpHandler)) {
            this.onClickMarkUpHandler(selectedNodeRestriction, button);
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
        this.abLocTreeGenericHelper_afterRefresh();
    },

    abLocationTree_onAddLocation: function () {
        var commandContext = null;
        if (arguments && arguments.length > 0) {
            // first argument is action button  and second argument is browser event
            if (valueExists(arguments[1])) {
                commandContext = arguments[1];
            }
        }
        var selecteNodeRestriction = this.getSelectedNodeTreeRestriction(this.abLocationTree.lastNodeClicked);
        if (valueExists(this.onClickAddHandler)) {
            this.onClickAddHandler(selecteNodeRestriction, commandContext);
        }
    },

    onClickNode: function (panelId, restriction) {
        var lastNodeClicked = this.abLocationTree.lastNodeClicked;
        if (valueExists(this.onClickNodeEventHandler)) {
            var restriction = this.getSelectedNodeRestriction(lastNodeClicked);
            this.onClickNodeEventHandler('location', restriction);
        } else {
            if (lastNodeClicked.expanded) {
                lastNodeClicked.collapse();
            } else {
                lastNodeClicked.expand();
            }
        }
    },
    
    abLocationTree_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('site.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('site.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['site.site_id'] + '</b>, ' + node.data['site.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abLocationTreeBl_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('bl.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('bl.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['bl.bl_id'] + '</b>, ' + node.data['bl.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abLocationTreeFl_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('fl.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('fl.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['fl.fl_id'] + '</b>, ' + node.data['fl.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abLocationTree_onClearSelection: function(){
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
    var controller = View.controllers.get('abLocationTreeController');
    controller.onClickNode(context.command.parentPanelId, context.restriction);
}


