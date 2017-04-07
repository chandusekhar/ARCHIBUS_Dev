var abOrganizationTreeController =  View.createController('abOrganizationTreeController', {
	// on click display handler: defined in caller view
	onClickDisplayHandler: null,
	
	// on click details handler: defined in caller view
	onClickDetailsHandler: null,
	
	onClickNodeEventHandler: null,

	onClickAddHandler: null,
	
	onClickClearSelectionHandler: null,

	restriction: null,
	
	projectIds: null,

	parameters: null,

	afterInitialDataFetch: function(){
		// refresh helper panel to trigger afterRefresh event
		this.abOrganizationTreeGenericHelper.refresh();
	},
	
	abOrganizationTreeGenericHelper_afterRefresh: function(){
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

			if(valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickAddHandler)){
				this.onClickAddHandler = parentTab.parameters.onClickAddHandler;
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
			for(var i=0; i < this.abOrganizationTree.config.panelsData.length; i++){
				this.abOrganizationTree.config.panelsData[i].showLabels = this.parameters['showFieldLabelOnTreeTable'];
				this.abOrganizationTree._panelsData[i].showLabels = this.parameters['showFieldLabelOnTreeTable'];
			}
		}

		
		// show add button
		this.abOrganizationTree.actions.get('addOrganization').show(valueExists(this.onClickAddHandler));
		this.abOrganizationTree.actions.get('clearSelection').show(valueExists(this.onClickClearSelectionHandler));

		this.refreshTree(this.restriction, this.parameters);
	},
	
	/**
	 * Refresh tree control.
	 */
	refreshTree: function(restriction, parameters){
		if(valueExists(parameters)){
			for(var param in parameters){
				if(param.indexOf('_restriction') != -1){
					this.abOrganizationTree.addParameter(param, parameters[param]);
				}
			}
		}
		this.abOrganizationTree.refresh(restriction);
	},

	abOrganizationTree_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'bu');
	},
	
	abOrganizationTree_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'bu');
	},

	abOrganizationTreeDv_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'dv');
	},
	
	abOrganizationTreeDv_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'dv');
	},

	abOrganizationTreeDp_onDisplay: function(button, panel, node){
		this.onDisplayCommon(button, panel, node, 'dp');
	},
	
	abOrganizationTreeDp_onDetails: function(button, panel, node){
		this.onDetailsCommon(button, panel, node, 'dp');
	},

	onDisplayCommon: function(button, panel, node, level){
		var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
		if(valueExists(this.onClickDisplayHandler)){
			this.onClickDisplayHandler('organization', level, selectedNodeRestriction, node.data, button);
		}
	},
	
	onDetailsCommon: function(button, panel, node, level){
		var selectedNodeRestriction = this.getSelectedNodeRestriction(node);
		if(valueExists(this.onClickDisplayHandler)){
			this.onClickDetailsHandler('organization', level, selectedNodeRestriction, node.data, button);
		}
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
		this.abOrganizationTreeGenericHelper_afterRefresh();
	},

	abOrganizationTree_onAddOrganization: function(){
		var commandContext = null;
		if(arguments && arguments.length > 0 ){
			// first argument is action button  and second argument is browser event
			if(valueExists(arguments[1])){
				commandContext = arguments[1];
			}
		}
		var selecteNodeRestriction = this.getSelectedNodeTreeRestriction(this.abOrganizationTree.lastNodeClicked);
		if(valueExists(this.onClickAddHandler)){
			this.onClickAddHandler(selecteNodeRestriction, commandContext);
		}
	},
	
	onClickNode: function(panelId, restriction){
		var lastNodeClicked = this.abOrganizationTree.lastNodeClicked;
		if(valueExists(this.onClickNodeEventHandler)){
			var restriction = this.getSelectedNodeRestriction(lastNodeClicked);
			this.onClickNodeEventHandler('organization', restriction);
		}else{
			if(lastNodeClicked.expanded){
				lastNodeClicked.collapse();
			}else{
				lastNodeClicked.expand();
			}
		}
	},
	
	abOrganizationTree_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('bu.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('fl.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['bu.bu_id'] + '</b>, ' + node.data['bu.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abOrganizationTreeDv_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('dv.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('dv.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['dv.dv_id'] + '</b>, ' + node.data['dv.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abOrganizationTreeDp_afterGeneratingTreeNode: function(node){
    	if(valueExists(node.level.dataSourceFieldDefs.get('dp.vf_concatenated_node'))
    			&& node.level.dataSourceFieldDefs.get('dp.vf_concatenated_node').hidden == 'false'){
    		var nodeLabel = '<b>' + node.data['dp.dp_id'] + '</b>, ' + node.data['dp.name'];
    		node.label = node.label.replace('{label_html}', nodeLabel);
    	}
    },
    
    abOrganizationTree_onClearSelection: function(){
    	if(valueExists(this.onClickClearSelectionHandler)){
    		this.onClickClearSelectionHandler();
    	}
    }
});

/**
 * On click node event handler.
 * @param context
 */
function onClickNodeHandler(context){
	var controller = View.controllers.get('abOrganizationTreeController');
	controller.onClickNode(context.command.parentPanelId, context.restriction);
}

