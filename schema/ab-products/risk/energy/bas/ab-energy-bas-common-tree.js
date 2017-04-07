var nullValueCode = 'WW99';

var energyBasCommonTreeController = View.createController('energyBasCommonTree', {
	site_id: '',
	bl_id: '',
	
	afterViewLoad: function(){
		this.initializeTreePanel();
	},
	
	afterInitialDataFetch: function() {
		this.expandFirstCtryNode();
	},
	
	initializeTreePanel: function(){
    	this.energyBasCommonTree_ctryTree.createRestrictionForLevel = createRestrictionForLevelDefMeters;
    },
    
    expandFirstCtryNode: function() {
    	var treeNode = this.energyBasCommonTree_ctryTree.treeView.getRoot();
		if(treeNode.hasChildren()){
			for (var i = 0; i < treeNode.children.length;i++) {
				treeNode.children[i].expand();
			}
	    }
    },
    
    energyBasCommonTree_ctryTree_afterRefresh: function() {
    	this.expandFirstCtryNode();
    }
});

function createRestrictionForLevelDefMeters(parentNode, level){
    var restriction = new Ab.view.Restriction();
    if (parentNode.data) {
        if (level == 1) {
        	restriction.addClause('ctry.ctry_id', parentNode.data['ctry.ctry_id'], '=', 'AND', true);
        }        
        if (level == 2){
        	restriction.addClause('site.site_id', parentNode.data['site.site_id'], '=', 'AND', true);
        }
        if (level == 3){
        	restriction.addClause('bl.site_id', parentNode.data['bl.site_id'], '=', 'AND', true);
        	restriction.addClause('bl.bl_id', parentNode.data['bl.bl_id'], '=', 'AND', true);
        }
    }
    return restriction;
}

function onClickTreeNodeDefMeters(panelId){
	var controller = View.controllers.get('energyBasCommonTree');
	var objTree = View.panels.get(panelId);
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	var restriction = new Ab.view.Restriction();
	if (levelIndex == 0){
		var ctry_id = crtNode.data['ctry.ctry_id'];
		if (ctry_id == 'WW99') {
			restriction.addClause('bas_data_point.ctry_id', '', 'IS NULL');
		} else {
			restriction.addClause('bas_data_point.ctry_id', ctry_id);   	
		}
		controller.site_id = '';
		controller.bl_id = '';
	}
	if (levelIndex == 1){
		var site_id = crtNode.data['site.site_id'];
		if (site_id == 'WW99') {
			restriction.addClause('bas_data_point.site_id', '', 'IS NULL');
			controller.site_id = '';
			controller.bl_id = '';
		} else {
			restriction.addClause('bas_data_point.site_id', site_id); 
			controller.site_id = site_id;
			controller.bl_id = '';
		}
	}
	if (levelIndex == 2){
		var bl_id = crtNode.data['bl.bl_id'];
		var site_id = crtNode.data['bl.site_id'];
		if (bl_id == 'WW99') {
			restriction.addClause('bas_data_point.bl_id', '', 'IS NULL');
			controller.bl_id = '';
		} else {
			restriction.addClause('bas_data_point.bl_id', bl_id);  
			controller.bl_id = bl_id;
		}
		if (site_id == 'WW99') {
			restriction.addClause('bas_data_point.site_id', '', 'IS NULL');
			controller.site_id = '';
		} else {
			restriction.addClause('bas_data_point.site_id', site_id);  
			controller.site_id = site_id;
		}
	}
	View.panels.get('energyBasEdit_select').refresh(restriction);
}

function afterGeneratingTreeNode(node){
	var label = node.label;
	var levelIndex = node.level.levelIndex;
	var msg_id = '';
	if (levelIndex == 0){
		msg_id = 'msg_no_ctry_id';
	} else if (levelIndex == 1){
		msg_id = 'msg_no_site_id';
	} else if (levelIndex == 2){
		msg_id = 'msg_no_bl_id';
	}
	if(label.indexOf(nullValueCode)!= -1){
		var labelText = label.replace(nullValueCode, getMessage(msg_id));
		node.setUpLabel(labelText);
	}
}
