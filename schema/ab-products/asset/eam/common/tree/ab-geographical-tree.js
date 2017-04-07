/**
 * Geographical tree controller.
 */
var abGeoTreeController = View.createController('abGeoTreeController', {
	
	// on click display handler: defined in caller view
	onClickDisplayHandler: null,
	
	// on click details handler: defined in caller view
	onClickDetailsHandler: null,
	
	// on click markup handler: defined in caller view
    onClickMarkUpHandler: null,
	
	onClickNodeEventHandler: null,
	
    onClickPPTHandler: null,
    
    onClickClearSelectionHandler: null,

    restriction: null,
	
	projectIds: null,
	
	parameters: null,
	
	
	afterInitialDataFetch: function(){
		// refresh helper panel to trigger afterRefresh event
		this.abGeoTreeGenericHelper.refresh();
	},
	
	abGeoTreeGenericHelper_afterRefresh: function(){
		if(valueExists(this.view.restriction)){
			this.restriction = new Ab.view.Restriction();
			this.restriction.addClauses(this.view.restriction);
		}
		if(valueExists(this.view.getParentTab())){
			var parentTab = this.view.getParentTab();
			if(valueExists(parentTab.parameters)){
				this.parameters = parentTab.parameters;
			}
			if(valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickDetailsHandler)){
				this.onClickDetailsHandler = parentTab.parameters.onClickDetailsHandler;
			}
			if(valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickDisplayHandler)){
				this.onClickDisplayHandler = parentTab.parameters.onClickDisplayHandler;
			}
			
			if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickMarkUpHandler)) {
                this.onClickMarkUpHandler = parentTab.parameters.onClickMarkUpHandler;
            }

            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickPPTHandler)) {
                this.onClickPPTHandler = parentTab.parameters.onClickPPTHandler;
            }

            if(valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickNodeEventHandler)){
				this.onClickNodeEventHandler = parentTab.parameters.onClickNodeEventHandler;
			}

            if(valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickClearSelectionHandler)){
				this.onClickClearSelectionHandler = parentTab.parameters.onClickClearSelectionHandler;
			}
		}
		
		if (valueExists(this.parameters['showFieldLabelOnTreeTable']) 
				&& !this.parameters['showFieldLabelOnTreeTable']) {
			for(var i=0; i < this.abGeographicalTree.config.panelsData.length; i++){
				this.abGeographicalTree.config.panelsData[i].showLabels = this.parameters['showFieldLabelOnTreeTable'];
				this.abGeographicalTree._panelsData[i].showLabels = this.parameters['showFieldLabelOnTreeTable'];
			}
		}
		this.abGeographicalTree.actions.get('clearSelection').show(valueExists(this.onClickClearSelectionHandler));
		this.refreshTree(this.restriction, this.parameters);
	},
	
	getProjectRestriction: function(){
		var restriction = "1=1"; 
		if(this.projectIds.length > 0){
			var projectIds = makeSafeSqlValue(this.projectIds);
			restriction = "EXISTS(SELECT activity_log.bl_id FROM activity_log WHERE activity_log.bl_id = bl.bl_id AND activity_log.project_id IN ('" + projectIds.join("','") + "'))";
		}
		return restriction;
	},
	
	/**
	 * Refresh tree control.
	 */
	refreshTree: function(restriction, parameters){
		if(valueExists(parameters)){
			for(var param in parameters){
				if(param.indexOf('_restriction') != -1){
					this.abGeographicalTree.addParameter(param, parameters[param]);
				}
			}
		}
		this.abGeographicalTree.refresh(restriction);
	},
	
	abGeographicalTreeCtry_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'ctry');
	},
	
	abGeographicalTreeCtry_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'ctry');
	},
	
	abGeographicalTreeRegn_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'regn');
	},
	
	abGeographicalTreeRegn_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'regn');
	},
	
	abGeographicalTreeState_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'state');
	},
	
	abGeographicalTreeState_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'state');
	},

	abGeographicalTreeCity_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'city');
	},
	
	abGeographicalTreeCity_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'city');
	},

	abGeographicalTreeSite_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'site');
	},
	
	abGeographicalTreeSite_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'site');
	},

	abGeographicalTreeBl_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'bl');
	},
	
	abGeographicalTreeBl_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'bl');
	},

	abGeographicalTreeFl_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'fl');
	},
	
	abGeographicalTreeFl_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'fl');
	},
	
	abGeographicalTreeFl_onMarkUp: function (button, panel, node) {
        this.onMarkUpCommon(button, panel, node);
    },

	abGeographicalTreeRm_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'rm');
	},
	
	abGeographicalTreeRm_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'rm');
	},
	
	onDisplayCommon: function(button, panel, node, level){
		var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
		if(valueExists(this.onClickDisplayHandler)){
			this.onClickDisplayHandler('geographical', level, selectedNodeRestriction, node.data, button);
		}
	},
	
	onDetailsCommon: function(button, panel, node, level){
		var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
		if(valueExists(this.onClickDisplayHandler)){
			this.onClickDetailsHandler('geographical', level, selectedNodeRestriction, node.data, button);
		}
	},
	
	onMarkUpCommon: function (button, panel, node) {
        var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
        if (valueExists(this.onClickMarkUpHandler)) {
            this.onClickMarkUpHandler(selectedNodeRestriction, button);
        }
    },
	
	onAddLocation: function(level){
		var lastNodeClicked = this.abGeographicalTree.lastNodeClicked;
		var restriction = this.getSelectedNodeTreeRestriction(lastNodeClicked);
		var controller = this;
		var dialogConfig = {
				width: 1024, 
				height: 800, 
				closeButton: true, 
				type: level, 
				callback: function(){
					controller.reloadTreeData();
				}};  
		
		View.getOpenerView().openDialog('ab-eam-def-geo-loc.axvw', restriction, true, dialogConfig);
	},
	
	getSelectedNodeTreeRestriction: function(node){
		var restriction = new Ab.view.Restriction();
		if(valueExists(node)){
			var tmpNode = node;
			while(!tmpNode.isRoot()){
				restriction.addClauses(tmpNode.restriction);
				tmpNode = tmpNode.parent;
			}
		}
		return restriction;
	},

	getSelectedNodeRestriction: function(node){
		var restriction = new Ab.view.Restriction();
		if(valueExists(node)){
			restriction.addClauses(node.restriction);
		}
		return restriction;
	},
	
	reloadTreeData: function(){
		this.abGeoTreeGenericHelper_afterRefresh();
	},
	
	onClickNode: function(panelId, restriction){
		var lastNodeClicked = this.abGeographicalTree.lastNodeClicked;
		if(valueExists(this.onClickNodeEventHandler)){
			var restriction = this.getSelectedNodeRestriction(lastNodeClicked);
			this.onClickNodeEventHandler('geographical', restriction);
		}else{
			if(lastNodeClicked.expanded){
				lastNodeClicked.collapse();
			}else{
				lastNodeClicked.expand();
			}
		}
	},
	
    //called from project tab
	abGeographicalTree_onExportPPT: function () {
        this.exportPPT();
    },

    exportPPT: function (projectId) {
        if (valueExists(this.onClickPPTHandler)) {
            this.onClickPPTHandler(projectId);
        }
    },
    
    abGeographicalTree_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('geo_region.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('geo_region.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['geo_region.geo_region_id'] + '</b>, ' + node.data['geo_region.geo_region_name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abGeographicalTreeCtry_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('ctry.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('ctry.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['ctry.ctry_id'] + '</b>, ' + node.data['ctry.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abGeographicalTreeRegn_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('regn.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('regn.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['regn.regn_id'] + '</b>, ' + node.data['regn.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abGeographicalTreeState_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('state.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('state.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['state.state_id'] + '</b>, ' + node.data['state.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abGeographicalTreeCity_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('city.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('city.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['city.city_id'] + '</b>, ' + node.data['city.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abGeographicalTreeSite_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('site.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('site.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['site.site_id'] + '</b>, ' + node.data['site.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abGeographicalTreeBl_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('bl.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('bl.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['bl.bl_id'] + '</b>, ' + node.data['bl.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abGeographicalTreeFl_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('fl.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('fl.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['fl.fl_id'] + '</b>, ' + node.data['fl.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abGeographicalTreeRm_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('rm.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('rm.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['rm.rm_id'] + '</b>, ' + node.data['rm.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abGeographicalTree_onClearSelection: function(){
    	if(valueExists(this.onClickClearSelectionHandler)){
    		this.onClickClearSelectionHandler();
    	}
    }
});

/**
 * On add location handler
 * @param level location level
 */
function onAddLocation(level){
	var controller = View.controllers.get('abGeoTreeController');
	controller.onAddLocation(level);
}

/**
 * On click node event handler.
 * @param context
 */
function onClickNodeHandler(context){
	var controller = View.controllers.get('abGeoTreeController');
	controller.onClickNode(context.command.parentPanelId, context.restriction);
}

