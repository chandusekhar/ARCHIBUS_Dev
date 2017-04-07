var bldgTreeController = View.createController('bldgTree', {
	// filter settings
	filter:{
				'city_id':'',
				'state_id':'',
				'ctry_id':'',
				'su_manual_area_max':'',
				'su_manual_area_min':'',
				'su_usable_area_max':'',
				'su_usable_area_min':'',
				'manual_area_max':'',
				'manual_area_min':'',
				'cad_area_max':'',
				'cad_area_min':'',
				'purchasing_cost_max':'',
				'purchasing_cost_min':'',
				'book_value_min':'',
				'book_value_max':'',
				'market_value_min':'',
				'market_value_max':''
			},
			
	// tree object			
	tree:null,
	
	// array with non geocoded items
	notGeocodedItems:new Array(),
	
	// filter restriction
	filterRestriction:'',
	
	// active items restriction
	activeRestriction: '',
	
	afterViewLoad: function(){
		this.tree = View.panels.get('ctryTree');
		this.tree.setMultipleSelectionEnabled(1);
		this.tree.setMultipleSelectionEnabled(2);
		this.activeRestriction = "( EXISTS(SELECT 1 FROM ot WHERE ot.bl_id = bl.bl_id AND ot.status = 'Owned')  ";
		this.activeRestriction  += "OR EXISTS(SELECT 1 FROM ls WHERE ls.bl_id = bl.bl_id AND ls.signed = 1 AND ls.date_end >= ${sql.currentDate} AND ls.date_start <= ${sql.currentDate}) )";
		
		this.tree.addParameter('activeClause', this.activeRestriction);
	},
	
	afterInitialDataFetch: function(){
		this.tree.actions.get('ctryTree_showAsDialog').show(false);
	},
	// open filter pop-up
	ctryTree_onFilter: function(){
		openFilter(this.filter, 'building', this.applyFilter);
	},
	
	// uncheck all checked items
	ctryTree_onUnselectAll: function(){
		treeUnselectAll(this.tree.treeView);
	},
	
	// apply current restriction
	applyFilter: function(filter){
		controller = View.controllers.get('bldgTree');
		controller.filter = filter;
		// get restriction
		var restriction = controller.getRestriction(filter);
		controller.filterRestriction = restriction;
		// reset non geocoded array
		controller.notGeocodedItems = [];
		// refresh tree
		controller.tree.addParameter('filterRestriction', restriction);
		controller.tree.refresh();
	},
	
	getRestriction: function(filter){
		var restriction = "";
		
		if ( valueExistsNotEmpty(filter['city_id']) ) {
			restriction += " AND bl.city_id = '" + filter['city_id'] + "' ";
		}
		
		if ( valueExistsNotEmpty(filter['state_id']) ) {
			restriction += " AND bl.state_id = '" + filter['state_id'] + "' ";
		}

		if ( valueExistsNotEmpty(filter['ctry_id'])) {
			restriction += " AND bl.ctry_id = '" + filter['ctry_id'] + "' ";
		}
		
		if ( valueExistsNotEmpty(filter['su_manual_area_max'])) {
			restriction += " AND (SELECT SUM(su.area_manual) FROM su WHERE su.bl_id = bl.bl_id) < " + filter['su_manual_area_max'];
		}
		if ( valueExistsNotEmpty(filter['su_manual_area_min'])) {
			restriction += " AND (SELECT SUM(su.area_manual) FROM su WHERE su.bl_id = bl.bl_id) > " + filter['su_manual_area_min'];
		}
		
		if ( valueExistsNotEmpty(filter['su_usable_area_max'])) {
			restriction += " AND (SELECT SUM(su.area_usable) FROM su WHERE su.bl_id = bl.bl_id) < " + filter['su_usable_area_max'];
		}
		if ( valueExistsNotEmpty(filter['su_usable_area_min']) ) {
			restriction += " AND (SELECT SUM(su.area_usable) FROM su WHERE su.bl_id = bl.bl_id) > " + filter['su_usable_area_min'];
		}

		if ( valueExistsNotEmpty(filter['purchasing_cost_max']) ) {
			restriction += " AND (SELECT cost_purchase FROM ot WHERE ot.ot_id = (SELECT MAX(c.ot_id) FROM ot c WHERE c.bl_id =  bl.bl_id AND c.status = 'Owned')) < " + filter['purchasing_cost_max'];
		}
		if ( valueExistsNotEmpty(filter['purchasing_cost_min']) ) {
			restriction += " AND (SELECT cost_purchase FROM ot WHERE ot.ot_id = (SELECT MAX(c.ot_id) FROM ot c WHERE c.bl_id =  bl.bl_id AND c.status = 'Owned')) > " + filter['purchasing_cost_min'];
		}

		if ( valueExistsNotEmpty(filter['book_value_max']) ) {
			restriction += " AND bl.value_book < " + filter['book_value_max'];
		}

		if ( valueExistsNotEmpty(filter['book_value_min']) ) {
			restriction += " AND bl.value_book > " + filter['book_value_min'];
		}

		if ( valueExistsNotEmpty(filter['market_value_max']) ) {
			restriction += " AND bl.value_market < " + filter['market_value_max'];
		}

		if ( valueExistsNotEmpty(filter['market_value_min']) ) {
			restriction += " AND bl.value_market > " + filter['market_value_min'];
		}
		
		return (restriction);
	},
	
	// show selected items
	ctryTree_onShowSelected: function(){
		// get selected nodes  for level 2 and 3
		var cityNodes = this.tree.getSelectedNodes(1);	
		var blNodes = this.tree.getSelectedNodes(2);
		if(cityNodes.length == 0 && blNodes.length == 0){
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
		dsBl.addParameter('filterRestriction', this.filterRestriction );
		dsBl.addParameter('activeClause', this.activeRestriction );
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
		var canContinue = true;
		var isValidGisLicense = this.panel_row1col2.contentView.controllers.get('abBldgMangementTab').isValidGisLicense;
		if(maxItemsNo > -1 && items.length > maxItemsNo && isValidGisLicense ){
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
		var ctrlDetails = this.panel_row1col2.contentView.controllers.get('buildingManagementTableDetails');
		ctrlDetails.items = items;
		ctrlDetails.initializeView();
	},
	
	refreshTree: function(){
		this.applyFilter(this.filter);
	}
})

// check if items are geocoded or not
function afterGeneratingTreeNode(node){
	var controller = View.controllers.get('bldgTree');
	checkGeocoding(node, controller.notGeocodedItems);
}
