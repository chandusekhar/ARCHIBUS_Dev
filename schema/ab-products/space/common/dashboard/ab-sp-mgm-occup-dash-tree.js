var treeController = View.createController('treeController', {

	treeRes:'bl_id is not null',
	groupLevel:'bl_id is not null',
	
	locMetricDashCtrl:null,
	
	/**
     * apply the current tree restriction to whole dashboard views
     */
	onTreeBlClick: function(){
		this.setRestriction();
        // apply the tree restriction to all sub views of the parent controller
        //this.dashCostAnalysisMainController.treeRes = treeRes;
        //this.dashCostAnalysisMainController.groupLevel = groupLevel;
		if (!this.locMetricDashCtrl) 
			this.locMetricDashCtrl = getDashMainController('locMetricDashCtrl');
		if (this.locMetricDashCtrl)
	        this.locMetricDashCtrl.refreshDashboard();
    },

	/**
	 * Generate restriction from tree.
	 */
	setRestriction:function(){
        //get the current tree node
        var currentTreeNode = this.abSpAsgnEmToRm_blTree.lastNodeClicked;
        
        //create tree restriction from currentTreeNode data values
        var treeRes = " 1=1 ";
        var groupLevel = "bl_id is not null";
		if (currentTreeNode.level.levelIndex == 0) {
			treeRes="bl_id is not null";
			groupLevel="bl_id is not null";
		}
		else if (currentTreeNode.level.levelIndex == 1) {
			treeRes =  "bl_id in (select bl_id from bl where bl.ctry_id in ( select ctry.ctry_id from ctry where ctry.geo_region_id = '" + currentTreeNode.data["geo_region.geo_region_id"] + "'))" ;
			groupLevel = "bl.ctry_id";
		}
		else  if (currentTreeNode.level.levelIndex == 2) {
				treeRes = "bl_id in (select bl_id from bl where bl.ctry_id = '" + currentTreeNode.data["ctry.ctry_id"] + "')" ;
				groupLevel = "bl.regn_id";
		} 
		else  if (currentTreeNode.level.levelIndex == 3) {
					treeRes =  "bl_id in (select bl_id from bl where bl.regn_id = '" + currentTreeNode.data["regn.regn_id"] + "' and bl.ctry_id ='" + currentTreeNode.data["regn.ctry_id.key"] + "')" ;
					groupLevel = "bl.state_id";
		}
		else  if (currentTreeNode.level.levelIndex == 4) {
						treeRes =  "bl_id in (select bl_id from bl where bl.state_id = '" + currentTreeNode.data["state.state_id"] + "')" ;
						groupLevel = "bl.city_id";
		}
		else  if (currentTreeNode.level.levelIndex == 5) {
							treeRes =  "bl_id in (select bl_id from bl where bl.city_id = '" + currentTreeNode.data["city.city_id"] + "' and bl.state_id ='" + currentTreeNode.data["city.state_id.key"] + "')" ;
							groupLevel = "bl.site_id";
		}
		else  if (currentTreeNode.level.levelIndex == 6) {
								treeRes = "bl_id in (select bl_id from bl where bl.site_id = '" + currentTreeNode.data["site.site_id"] + "')";
								groupLevel = "bl.bl_id";
		}
		else  if (currentTreeNode.level.levelIndex == 7) {
									treeRes = "bl_id  = '" + currentTreeNode.data["bl.bl_id"] + "'";
									groupLevel = "fl.fl_id";
		}
		this.treeRes = treeRes;
		this.groupLevel = groupLevel;
	}

})

/**
 * Add title for tree world level.
 * @param treeNode
 */
function afterGeneratingTreeNode(treeNode){
    if (treeNode.level.levelIndex == 0) {
        treeNode.setUpLabel('<b>' + getMessage('world') + '</b>');
    }
}