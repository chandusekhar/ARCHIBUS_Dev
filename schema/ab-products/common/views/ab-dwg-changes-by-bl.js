var abDwgChangesByBlCtrl = View.createController('abDwgChangesByBlCtrl',{
	// selected building id
	blId: null,
	
	//selected floor id
	flId: null,
	
	/*
	 * on filter 
	 * TO DO: format console values for SQL
	 */
	abDwgChangesByBlFilter_onShow: function(){
		var paramSiteId = "1 = 1";
		var paramBlId = "1 = 1";
		var siteId = this.abDwgChangesByBlFilter.getFieldValue("bl.site_id");
		if (valueExistsNotEmpty(siteId)){
			paramSiteId = "site.site_id = '" + siteId + "'";
		}
		var blId = this.abDwgChangesByBlFilter.getFieldValue("bl.bl_id");
		if (valueExistsNotEmpty(blId)){
			paramBlId = "bl.bl_id = '" + blId + "'";
		}
		this.blId = null;
		this.flId = null;
		this.abDwgChangesByBlVersions.show(false, true);
		this.abDwgChangesByBlDwg.show(false, true);
		this.abDwgChangesByBlTreeSite.addParameter("siteId", paramSiteId);
		this.abDwgChangesByBlTreeSite.addParameter("blId", paramBlId);
		this.abDwgChangesByBlTreeSite.refresh();
	}
	
});

/*
 * click node event
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abDwgChangesByBlCtrl");
	var objTree = View.panels.get("abDwgChangesByBlTreeSite");
	var lastNodeClicked = objTree.lastNodeClicked;
	var flId = null;
	var blId = null;
	if (lastNodeClicked.restriction.findClause("bl.bl_id")){
		blId = lastNodeClicked.restriction.findClause("bl.bl_id").value;
		flId = null;
	}else if (lastNodeClicked.restriction.findClause("fl.fl_id")){
		flId = lastNodeClicked.restriction.findClause("fl.fl_id").value;
		blId = lastNodeClicked.parent.restriction.findClause("bl.bl_id").value;
	}
	controller.flId = flId;
	controller.blId = blId;
	var restriction = new Ab.view.Restriction();
	var restrValue = blId + (valueExistsNotEmpty(flId)?';'+flId:';%');
	restriction.addClause("afm_dwgs.space_hier_field_values", restrValue, "LIKE");
	controller.abDwgChangesByBlDwg.refresh(restriction);
	controller.abDwgChangesByBlVersions.show(false, true);
}
