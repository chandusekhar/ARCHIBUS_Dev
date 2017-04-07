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
 * open filter dialog
 * @param {Object} filter : current filter settings
 * @param {Object} type: filter type building/property
 * @param {Object} callback: callback function 
 */
function openFilter(filter, type, callback){
	View.openDialog('ab-rplm-pfadmin-building-property-filter.axvw',null, true, {
		width:800,
		height:400, 
		closeButton:true,
		filterType:type,
		filter: filter,
		callback: callback
	});
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
