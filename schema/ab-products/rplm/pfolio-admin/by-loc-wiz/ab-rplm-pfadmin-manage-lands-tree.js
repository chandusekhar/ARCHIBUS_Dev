var landTreeController = View.createController('landTree',{
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
			
	// if UOM is enabled
	isUOMEnabled: false,
			
	areaUnitsConversionFactor : 1.0,
	
	// tree object			
	tree:null,

	// array with non geocoded items
	notGeocodedItems:new Array(),

	// filter restriction
	filterRestriction:'',
	
	// active items restriction
	activeRestriction: '',
	
	selectedItems: new Array(),
	showNotGeocodedMessage: false,
	
	afterViewLoad: function(){
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			this.isUOMEnabled = true;
		}
		
		// UOM Changes
		if(this.isUOMEnabled){
			// UOM Changes
			if(View.user.displayUnits != View.project.units){
				this.areaUnitsConversionFactor = 1 / parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
		
		this.tree = View.panels.get('ctryTree');
		this.tree.setMultipleSelectionEnabled(1);
		this.tree.setMultipleSelectionEnabled(2);
		this.activeRestriction = "( EXISTS(SELECT 1 FROM ot WHERE ot.pr_id = property.pr_id AND ot.status = 'Owned')  ";
		this.activeRestriction  += "OR EXISTS(SELECT 1 FROM ls WHERE ls.pr_id = property.pr_id AND ls.signed = 1 AND ls.date_end >= ${sql.currentDate} AND ls.date_start <= ${sql.currentDate}) )";

		this.tree.addParameter('activeClause', this.activeRestriction);
	},
	
	afterInitialDataFetch: function(){
		this.tree.actions.get('ctryTree_showAsDialog').show(false);
	},
	// open filter pop-up
	ctryTree_onFilter: function(){
		openFilter(this.filter, 'property', this.applyFilter);
	},

	// uncheck all checked items
	ctryTree_onUnselectAll: function(){
		treeUnselectAll(this.tree.treeView);
	},

	// apply current restriction
	applyFilter: function(filter){
		controller = View.controllers.get('landTree');
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
			restriction += " AND property.city_id = '" + filter['city_id'] + "' ";
		}
		
		if ( valueExistsNotEmpty(filter['state_id']) ) {
			restriction += " AND property.state_id = '" + filter['state_id'] + "' ";
		}

		if ( valueExistsNotEmpty(filter['ctry_id'])) {
			restriction += " AND property.ctry_id = '" + filter['ctry_id'] + "' ";
		}


		if ( valueExistsNotEmpty(filter['manual_area_max'])) {
			restriction += " AND (property.area_manual * " + this.areaUnitsConversionFactor + ") < " + filter['manual_area_max'];
		}
		
		if ( valueExistsNotEmpty(filter['manual_area_min'])) {
			restriction += " AND (property.area_manual * " + this.areaUnitsConversionFactor + ") > " + filter['manual_area_min'];
		}
		

		if ( valueExistsNotEmpty(filter['cad_area_max'])) {
			restriction += " AND (property.area_cad * " + this.areaUnitsConversionFactor + ") < " + filter['cad_area_max'];
		}
		
		if ( valueExistsNotEmpty(filter['cad_area_min'])) {
			restriction += " AND (property.area_cad * " + this.areaUnitsConversionFactor + ") > " + filter['cad_area_min'];
		}

		if ( valueExistsNotEmpty(filter['purchasing_cost_max']) ) {
			restriction += " AND (SELECT cost_purchase * ${sql.exchangeRateFromBudgetToUserForDate('Budget', 'ot.date_purchase')} FROM ot WHERE ot.ot_id = (SELECT MAX(c.ot_id) FROM ot c WHERE c.pr_id =  property.pr_id AND c.status = 'Owned')) < " + filter['purchasing_cost_max'];
		}
		if ( valueExistsNotEmpty(filter['purchasing_cost_min']) ) {
			restriction += " AND (SELECT cost_purchase * ${sql.exchangeRateFromBudgetToUserForDate('Budget', 'ot.date_purchase')} FROM ot WHERE ot.ot_id = (SELECT MAX(c.ot_id) FROM ot c WHERE c.pr_id =  property.pr_id AND c.status = 'Owned')) > " + filter['purchasing_cost_min'];
		}

		if ( valueExistsNotEmpty(filter['book_value_max']) ) {
			restriction += " AND (property.value_book * ${sql.exchangeRateFromBudgetToUserForDate('Budget', 'property.date_book_val')}) < " + filter['book_value_max'];
		}

		if ( valueExistsNotEmpty(filter['book_value_min']) ) {
			restriction += " AND (property.value_book * ${sql.exchangeRateFromBudgetToUserForDate('Budget', 'property.date_book_val')}) > " + filter['book_value_min'];
		}

		if ( valueExistsNotEmpty(filter['market_value_max']) ) {
			restriction += " AND (property.value_market * ${sql.exchangeRateFromBudgetToUserForDate('Budget', 'property.date_market_val')}) < " + filter['market_value_max'];
		}

		if ( valueExistsNotEmpty(filter['market_value_min']) ) {
			restriction += " AND (property.value_market * ${sql.exchangeRateFromBudgetToUserForDate('Budget', 'property.date_market_val')}) > " + filter['market_value_min'];
		}
		
		return (restriction);
	},

	// show selected items
	ctryTree_onShowSelected: function(){
		// get selected nodes  for level 2 and 3
		var cityNodes = this.tree.getSelectedNodes(1);	
		var landNodes = this.tree.getSelectedNodes(2);
		if(cityNodes.length == 0 && landNodes.length == 0){
			View.showMessage(getMessage('error_noselection'));
			return;
		}
		
		// we need to pass an array with selected land id's
		var maxItemsNo = getMaxItemsNo();
		var items = new Array();
		var showNotGeocodedMessage = false;
		// add selected structures from tree
		for(var i = 0; i < landNodes.length; i++ ) {
			var node = landNodes[i];
			if(! valueExistsNotEmpty(node.data['property.lat']) || !valueExistsNotEmpty(node.data['property.lon'])) {
				showNotGeocodedMessage = true;
			}
			var landId = "'"+ node.data['property.pr_id.key']+"'";
			items.push(landId);
		}
		// get lands for selected cities that don't have child nodes displayed
		var dsLand = View.dataSources.get('dsLandLands');
		dsLand.addParameter('filterRestriction', this.filterRestriction );
		dsLand.addParameter('activeClause', this.activeRestriction );
		for(var i = 0; i < cityNodes.length; i++){
			var node = cityNodes[i];
			if(node.children.length == 0){
				// childrens are not displayed. Read from database
				var records = dsLand.getRecords(node.restriction);
				for ( var j=0; j< records.length; j++ ){
					var rec = records[j];
					var landId = "'"+ rec.getValue('property.pr_id')+"'";
					if(! valueExistsNotEmpty(rec.getValue('property.lat')) || !valueExistsNotEmpty(rec.getValue('property.lon'))) {
						showNotGeocodedMessage = true;
						this.notGeocodedItems.push(landId);
					}
					items.push(landId);
				}
			}
		}
		var canContinue = true;
		var isValidGisLicense = this.panel_row1col2.contentView.controllers.get('abLandMangementTab').isValidGisLicense;
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
			ctrlMap.showSelectedLands(items, showNotGeocodedMessage);
		}
		var ctrlDetails = this.panel_row1col2.contentView.controllers.get('landManagementTableDetails');
		ctrlDetails.items = items;
		ctrlDetails.initializeView();
		
		this.selectedItems = items;
		this.showNotGeocodedMessage = showNotGeocodedMessage;
	},
	
	refreshTree: function(){
		this.applyFilter(this.filter);
	}})

// check if items are geocoded or not
function afterGeneratingTreeNode(node){
	var controller = View.controllers.get('landTree');
	checkGeocoding(node, controller.notGeocodedItems);
}
