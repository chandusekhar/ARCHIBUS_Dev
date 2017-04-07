var abEhsRptIncidentDetailsCtrl = View.createController('abEhsRptIncidentDetailsCtrl',{
	afterViewLoad: function() {
		// override default createRestrictionForLevel() method for the tree panel
		//in order to restrict the incident level by site and by property, not only by property
		this.abEhsRptIncidentDetails_site_tree.createRestrictionForLevel = function(parentNode, level) {
			var restriction = null;
			// override only restriction applied from the 2nd level
			//(root level is site, 1st level is property and 2nd level is incident)
			if (level == 2) {
				restriction = new Ab.view.Restriction();
				var pr_id = parentNode.data['ehs_incidents.pr_id'];
				restriction.addClause('ehs_incidents.pr_id', pr_id, '=');
				var site_id = parentNode.parent.data['ehs_incidents.site_id'];
				restriction.addClause('ehs_incidents.site_id', site_id, '=');
			 }
			return restriction;
		}
	},
	
	/**
	 * Display in grid incident(s) for a selected site, 
	 * for a selected property depending also on the site level or 
	 * for a selected incident code 
	 * and expand the selected tree node.
	 */
	abEhsRptIncidentDetails_showGrid: function(node, fieldId){
		var nodeRestriction = node.restriction;
		var lastClickedNode = this.abEhsRptIncidentDetails_site_tree.lastNodeClicked;
	    var incidentRestriction = new Ab.view.Restriction();
	    for(var i = 0; i < nodeRestriction.clauses.length; i++){
	    	if(nodeRestriction.clauses[i].name == fieldId){
	    		incidentRestriction.addClause(fieldId, nodeRestriction.clauses[i].value, '=');
	    	}
	    }
	    
	    //take also restrictions from upper tree level
	    if(fieldId == 'ehs_incidents.pr_id'){
	    	var siteNode = lastClickedNode.parent;
	    	if(siteNode){
	    		for(var i = 0; i < siteNode.restriction.clauses.length; i++){
	    	    	if(siteNode.restriction.clauses[i].name == 'ehs_incidents.site_id'){
	    	    		incidentRestriction.addClause('ehs_incidents.site_id', siteNode.restriction.clauses[i].value, '=');
	    	    	}
	    	    }
	    	}
	    }
	    
	    this.abEhsRptIncidentDetails_grid.refresh(incidentRestriction);
	    this.abEhsRptIncidentDetails_site_tree.expandNode(lastClickedNode);
	}
});

function afterGeneratingTreeNode(treeNode) {
	if (treeNode.level.levelIndex == 0) {
		treeNode.restriction.addClause('ehs_incidents.site_id', treeNode.data['ehs_incidents.site_id']);
		if(!valueExistsNotEmpty(treeNode.data['ehs_incidents.site_id'])){
			treeNode.setUpLabel('N/A');
		}
	}
	if (treeNode.level.levelIndex == 1) {
		treeNode.restriction.addClause('ehs_incidents.pr_id', treeNode.data['ehs_incidents.pr_id']);
		if(!valueExistsNotEmpty(treeNode.data['ehs_incidents.pr_id'])){
			treeNode.setUpLabel('N/A');
		}
	}
	if (treeNode.level.levelIndex == 2) {
		if(!valueExistsNotEmpty(treeNode.data['ehs_incidents.bl_id'])
				&& !valueExistsNotEmpty(treeNode.data['ehs_incidents.fl_id'])
				&& !valueExistsNotEmpty(treeNode.data['ehs_incidents.rm_id'])){
			treeNode.setUpLabel('N/A');
		}
	}
}