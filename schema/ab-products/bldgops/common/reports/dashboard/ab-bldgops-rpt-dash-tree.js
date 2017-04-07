/**
 * Controller of the LaborAnalysis dashboard tree view
 * @author Guo Jiangtao
 */
var dashTreeController = View.createController('dashTreeController', {

    //paren view controller, defined in ab-bldgops-rpt-dash-labor-analysis-main.js
    parentController: null,
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
        //default show location tree, hide organization tree
        this.world_tree.setSingleVisiblePanel(true);
        this.world_tree.show(true, true);
        this.organizational_tree.show(false, true);

        //set parent controller and default treeRes as '1=1'
        //this.parentController = View.getOpenerView().controllers.get('dashLaborAnalysisMainController');
        //this.parentController.treeRes = " 1=1 ";
    },
    
    /**
     * switch tree panel
     */
    switchTree: function(){
        //if the tree panel is showed, hide it || if the tree is hidden, display it. 
        this.world_tree.setSingleVisiblePanel(!this.world_tree.visible);
        this.world_tree.show(!this.world_tree.visible);
        this.organizational_tree.setSingleVisiblePanel(!this.organizational_tree.visible);
        this.organizational_tree.show(!this.organizational_tree.visible);
    },
    
    /**
     * get current displayed tree
     */
    getCurrentTreePanel: function(){
        if (this.world_tree.visible) {
            return this.world_tree;
        }
        else {
            return this.organizational_tree;
        }
    },
    
    /**
     * apply the current tree restriction to whole dashboard views
     */
    applyTreeRestriction: function(){
        //get the current tree panel
        var currentTreePanel = this.getCurrentTreePanel();
        //get the current tree node
        var currentTreeNode = currentTreePanel.lastNodeClicked;
        
        //create tree restriction from currentTreeNode data values
        var treeRes = " 1=1 ";
        var groupLevel = "bl.bl_id";
        var isLocationTree = (currentTreePanel.id == 'world_tree');
        if (currentTreeNode.level.levelIndex == 1) {
            treeRes = isLocationTree ? "rm.bl_id in (select bl_id from bl where bl.ctry_id in ( select ctry.ctry_id from ctry where ctry.geo_region_id = '" + currentTreeNode.data["geo_region.geo_region_id"] + "'))" : " rm.dv_id in  (select dv_id from dv where dv.bu_id = '" + currentTreeNode.data["bu.bu_id"] + "')";
	        groupLevel = "bl.ctry_id";
        }
        else 
            if (currentTreeNode.level.levelIndex == 2) {
                treeRes = isLocationTree ? "rm.bl_id in (select bl_id from bl where bl.ctry_id = '" + currentTreeNode.data["ctry.ctry_id"] + "')" : " rm.dv_id = '" + currentTreeNode.data["dv.dv_id"] + "'";
				groupLevel = "bl.regn_id";
            }
            else 
                if (currentTreeNode.level.levelIndex == 3) {
                    treeRes = isLocationTree ? "rm.bl_id in (select bl_id from bl where bl.regn_id = '" + currentTreeNode.data["regn.regn_id"] + "' and bl.ctry_id ='" + currentTreeNode.data["regn.ctry_id.key"] + "')" : "rm.dv_id = '" + currentTreeNode.data["rm.dv_id"] + "' and rm.dp_id ='" + currentTreeNode.data["rm.dp_id"] + "'";
					groupLevel = "bl.state_id";
                }
                else 
                    if (currentTreeNode.level.levelIndex == 4) {
                        treeRes = isLocationTree ? "rm.bl_id in (select bl_id from bl where bl.state_id = '" + currentTreeNode.data["state.state_id"] + "')" : " rm.bl_id in  (select bl_id from bl where bl.use1 = '" + currentTreeNode.data["bl.use1"] + "')";
						groupLevel = "bl.city_id";
                    }
                    else 
                        if (currentTreeNode.level.levelIndex == 5) {
                            treeRes = isLocationTree ? "rm.bl_id in (select bl_id from bl where bl.city_id = '" + currentTreeNode.data["city.city_id"] + "' and bl.state_id ='" + currentTreeNode.data["city.state_id.key"] + "')" : "rm.bl_id  = '" + currentTreeNode.data["bl.bl_id"] + "'";
							groupLevel = "bl.site_id";
                        }
                        else 
                            if (currentTreeNode.level.levelIndex == 6) {
                                treeRes = "rm.bl_id in (select bl_id from bl where bl.site_id = '" + currentTreeNode.data["site.site_id"] + "')";
                            }
                            else 
                                if (currentTreeNode.level.levelIndex == 7) {
                                    treeRes = "rm.bl_id  = '" + currentTreeNode.data["bl.bl_id"] + "'";
                                }
        
        // apply the tree restriction to all sub views of the parent controller
        this.parentController.treeRes = treeRes;
        this.parentController.groupLevel = groupLevel;
        this.parentController.refreshDashboard();
    }
});

function afterGeneratingTreeNode(treeNode){

	//KB3035658 - only add world title for world tree and organizational tree
    if ((treeNode.tree.id == "world_tree"||treeNode.tree.id == "organizational_tree") && treeNode.level.levelIndex == 0) {
        treeNode.setUpLabel('<b>' + getMessage('world') + '</b>');
    }
    if ((treeNode.tree.id == "world_tree" && treeNode.level.levelIndex == 7) || (treeNode.tree.id == "organizational_tree" && treeNode.level.levelIndex == 5)) {
        var label = treeNode.data['bl.bl_id'] + " " + treeNode.data['bl.name'];
        if (!treeNode.data['bl.lon'] || !treeNode.data['bl.lat']) {
            label += "<img alt='" + getMessage('not_geocoded') + "' border='0' src='/archibus/schema/ab-system/graphics/no_geocode.png'/>"
        }
        treeNode.setUpLabel(label);
    }
    
    if (treeNode.tree.id == "organizational_tree" && treeNode.level.levelIndex == 4) {
        treeNode.restriction.addClause('bl.use1', treeNode.data['bl.use1']);
    }
}
