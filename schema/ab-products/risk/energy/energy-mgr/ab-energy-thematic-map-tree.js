var bldgTreeController = View.createController('bldgTree',{
	tree:null,
	notGeocodedItems:new Array(),
	afterViewLoad: function(){
		this.tree = View.panels.get('worldTree');		
		this.tree.setMultipleSelectionEnabled(0);
		this.tree.setMultipleSelectionEnabled(1);
		this.tree.setMultipleSelectionEnabled(2);
		this.tree.setMultipleSelectionEnabled(3);
	},
	//kb#3045637
	//afterInitialDataFetch:function(){
		//this.worldTree.actions.get('worldTree_showAsDialog').show(false);
		//if(this.panel_row0.actions.get('panel_row0_showAsDialog')){
		//	this.panel_row0.actions.items.get('panel_row0_showAsDialog').show(false);
		//}
	//},
	worldTree_onUnselectAll: function(){
		treeUnselectAll(this.tree.treeView);
	},
	
	worldTree_onShowSelected: function(){
		var isValidGisLicense = this.panel_row1col2.contentView.controllers.get('mapCtrl').isValidLicense;
		if(!isValidGisLicense){
			View.showMessage(getMessage('invalidLic'));
			return;
		}
		if(this.panel_row1col2.contentView == null ||
			this.panel_row1col2.contentView == undefined)
		{
			setTimeout('bldgTreeController.worldTree_onShowSelected()', 500);
			return;
		}
		
		// get selected nodes  for levels 0, 1, 2, and 3
		var worldNodes = this.tree.getSelectedNodes(0);
		var ctryNodes = this.tree.getSelectedNodes(1);
		var cityNodes = this.tree.getSelectedNodes(2);	
		var blNodes = this.tree.getSelectedNodes(3);
		if(worldNodes.length == 0 && ctryNodes.length == 0 && cityNodes.length == 0 && blNodes.length == 0){
			View.showMessage(getMessage('error_noselection'));
			return;
		}

		// we need to pass an array with selected building id's
		var maxItemsNo = getMaxItemsNo();
		var items = new Array();
		var showNotGeocodedMessage = false;
		// add selected buildings from tree
		for(var i = 0; i < blNodes.length; i++ ) {
			var node = blNodes[i];
			if(! valueExistsNotEmpty(node.data['bl.lat']) || !valueExistsNotEmpty(node.data['bl.lon'])) {
				showNotGeocodedMessage = true;
			}
			var blId = "'"+ node.data['bl.bl_id.key']+"'";
			items.push(blId);
		}
		// get buildings for selected cities that don't have child nodes displayed
		var dsBl = View.dataSources.get('dsBldgBuildings');
		for(var i = 0; i < cityNodes.length; i++){
			var node = cityNodes[i];
			if(node.children.length == 0){
				// childrens are not displayed. Read from database
				var records = dsBl.getRecords(node.restriction);
				for ( var j=0; j< records.length; j++ ){
					var rec = records[j];
					var blId = "'"+ rec.getValue('bl.bl_id')+"'";
					if(! valueExistsNotEmpty(rec.getValue('bl.lat')) || !valueExistsNotEmpty(rec.getValue('bl.lon'))) {
						showNotGeocodedMessage = true;
						this.notGeocodedItems.push(blId);
					}
					items.push(blId);
				}
			}
		}
		// get buildings for selected countries that don't have child nodes displayed		
		for(var i = 0; i < ctryNodes.length; i++){
			var node = ctryNodes[i];
			if(node.children.length == 0){
				// childrens are not displayed. Read from database
				var records = dsBl.getRecords(node.restriction);
				for ( var j=0; j< records.length; j++ ){
					var rec = records[j];
					var blId = "'"+ rec.getValue('bl.bl_id')+"'";
					if(! valueExistsNotEmpty(rec.getValue('bl.lat')) || !valueExistsNotEmpty(rec.getValue('bl.lon'))) {
						showNotGeocodedMessage = true;
						this.notGeocodedItems.push(blId);
					}
					items.push(blId);
				}
			}
		}
		// get buildings for selected world that doesn't have child nodes displayed		
		for(var i = 0; i < worldNodes.length; i++){
			var node = worldNodes[i];
			if(node.children.length == 0){
				// childrens are not displayed. Read from database
				var records = dsBl.getRecords(node.restriction);
				for ( var j=0; j< records.length; j++ ){
					var rec = records[j];
					var blId = "'"+ rec.getValue('bl.bl_id')+"'";
					if(! valueExistsNotEmpty(rec.getValue('bl.lat')) || !valueExistsNotEmpty(rec.getValue('bl.lon'))) {
						showNotGeocodedMessage = true;
						this.notGeocodedItems.push(blId);
					}
					items.push(blId);
				}
			}
		}
		var canContinue = true;
		if(maxItemsNo > -1 && items.length > maxItemsNo ){
			View.confirm(getMessage('error_max_no_selected_items'), function(button){
				if(button == 'yes'){
					canContinue = true;
				}else{
					canContinue = false;
				}
			})
		}
		if(!canContinue){
			return;
		}

		var ctrlMap = (isValidGisLicense ? this.panel_row1col2.contentView.controllers.get('mapCtrl'):null);
		if (ctrlMap != null) {
			ctrlMap.showSelectedBuildings(items, showNotGeocodedMessage);
		}
		var ctrlDetails = this.panel_row1col2.contentView.controllers.get('mapCtrl');
		ctrlDetails.items = items;
		//ctrlDetails.initializeView();
	}
})


// check if items are geocoded or not
function afterGeneratingTreeNode(node){
	var controller = View.controllers.get('bldgTree');
	checkGeocoding(node, controller.notGeocodedItems);
	if (node.level.levelIndex == 0) {
		node.setUpLabel('<b>' + getMessage('world') + '</b>');
	}
}


/**
 * get max items that can be displayed on map
 * 
 */
function getMaxItemsNo(){
	var maxItemsNo = -1;
	var params = {
		tableName: 'afm_activity_params',
		fieldNames: toJSON(['afm_activity_params.activity_id', 'afm_activity_params.param_id', 'afm_activity_params.param_value']),
		restriction: toJSON({
			'afm_activity_params.activity_id': 'AbRPLMPortfolioAdministration',
			'afm_activity_params.param_id': 'MaxPortfolioItemsToDisplayOnMap'
		})
	}
	var result = Workflow.call('AbCommonResources-getDataRecords', params);
	if(result.code == 'executed'){
		maxItemsNo = result.data.records[0]['afm_activity_params.param_value'];
		return maxItemsNo;
	}else{
		Workflow.handleError(result);
	}
}

/**
 * unselect all nodes from tree
 * 
 * @param {Object} treeView
 */
function treeUnselectAll(treeView){
	for(var i=0; i< treeView._nodes.length; i++){
		var node = treeView._nodes[i];
		if(node && node.setSelected && node.isSelected()){
			node.setSelected(false);
		}
	}
	
}
/**
 * check if item is geocoded and add geocode icon
 * not geocoded items are saved in array
 * @param {Object} node - tree node 
 * @param {Object} storage - array were not geocoded items are stored
 */
function checkGeocoding(node, storage){
	var data = node.data;
	var geoCodeItem = '<img title="'+getMessage('msg_not_geocoded')+'" border="0" src="/archibus/schema/ab-system/graphics/no_geocode.png"/>';
	// is building
	if(data['bl.bl_id.key']){
		if(!valueExistsNotEmpty(data['bl.lat']) || !valueExistsNotEmpty(data['bl.lon'])){
			node.setUpLabel(node.label+geoCodeItem);
			storage.push("'"+data['bl.bl_id.key']+"'");
		}
	}
	// is property
	if(data['property.pr_id.key']){
		if(!valueExistsNotEmpty(data['property.lat']) || !valueExistsNotEmpty(data['property.lon'])){
			node.setUpLabel(node.label+geoCodeItem);
			storage.push("'"+data['property.pr_id.key']+"'");
		}
	}
	
}
