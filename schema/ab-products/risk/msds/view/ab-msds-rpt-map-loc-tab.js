var msdsLocationTabController = View.createController('msdsLocationTabController', {
	items : new Array(),
	consoleRestriction : '1=1',
	
	afterViewLoad : function() {
		//append default unit to he grid column heading
		this.addUnitToColumnTitle();
	},

	afterInitialDataFetch : function() {
		this.msds_location_grid.addParameter('locationSqlView', ' msds_location left join bl on msds_location.bl_id=bl.bl_id ');
		this.msds_location_grid.addParameter('where', " where bl.site_id = a.site_id and msds_location.bl_id = a.bl_id and (case when msds_location.fl_id is null then ' ' else msds_location.fl_id end)= a.fl_id and (case when msds_location.rm_id is null then ' ' else msds_location.rm_id end)= a.rm_id and (case when msds_location.eq_id is null then ' ' else msds_location.eq_id end)= a.eq_id ");
		this.msds_location_grid.addParameter('massQuantity',"(msds_location.quantity * (case when (select bill_unit.conversion_factor from bill_unit where bill_unit.bill_unit_id = msds_location.quantity_units and bill_unit.bill_type_id = 'MSDS - MASS') IS NULL THEN 0 ELSE (select bill_unit.conversion_factor from bill_unit where bill_unit.bill_unit_id = msds_location.quantity_units and bill_unit.bill_type_id = 'MSDS - MASS') END) / (select bill_unit.conversion_factor from bill_unit where bill_unit.is_dflt=1 and bill_unit.bill_type_id = 'MSDS - MASS'))");
		this.msds_location_grid.addParameter('volumeQuantity',"(msds_location.quantity * (case when (select bill_unit.conversion_factor from bill_unit where bill_unit.bill_unit_id = msds_location.quantity_units and bill_unit.bill_type_id = 'MSDS - VOLUME') IS NULL THEN 0 ELSE (select bill_unit.conversion_factor from bill_unit where bill_unit.bill_unit_id = msds_location.quantity_units and bill_unit.bill_type_id = 'MSDS - VOLUME') END) / (select bill_unit.conversion_factor from bill_unit where bill_unit.is_dflt=1 and bill_unit.bill_type_id = 'MSDS - VOLUME'))");
		this.msds_location_grid.addParameter('quantityMSSQL'," (msds_location.quantity * (case when billUnit.conversion_factor IS NULL THEN 0  ELSE billUnit.conversion_factor END)/ defaultBillUnit.conversion_factor )");
		this.msds_location_grid.addParameter('crossApplyMass'," cross apply (select bill_unit.conversion_factor from bill_unit where bill_unit.bill_unit_id  = msds_location.quantity_units and bill_unit.bill_type_id = 'MSDS - MASS') billUnit cross apply (select bill_unit.conversion_factor from bill_unit where bill_unit.is_dflt=1 and bill_unit.bill_type_id = 'MSDS - MASS') defaultBillUnit ");
		this.msds_location_grid.addParameter('crossApplyVolume'," cross apply (select bill_unit.conversion_factor from bill_unit where bill_unit.bill_unit_id  = msds_location.quantity_units and bill_unit.bill_type_id = 'MSDS - VOLUME') billUnit cross apply (select bill_unit.conversion_factor from bill_unit where bill_unit.is_dflt=1 and bill_unit.bill_type_id = 'MSDS - VOLUME') defaultBillUnit ");
		
		this.msds_location_grid.viewDef.viewName = 'ab-msds-rpt-map-loc-tab';
		this.msds_grid.viewDef.viewName = 'ab-msds-rpt-map-loc-tab';
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("msds_location.bl_id", '', "IS NULL");
		this.msds_location_grid.refresh(restriction);
		this.msds_grid.clear();
		
		//fix3034231 - fix the location grid hight to avoid the grid two height when there are many msds locations
		var locGridElement = Ext.get('msds_location_grid');
		locGridElement.setStyle('overflow', 'auto');
		locGridElement.setStyle('height', '340px');
	},
	
	addUnitToColumnTitle: function() {
		var columns = this.msds_location_grid.columns;
		var unitDS = this.unitDS;
		var units = unitDS.getRecords("bill_unit.bill_type_id = 'MSDS - MASS'");
		if(units.length>0){
			var unit = units[0].getValue('bill_unit.bill_unit_id')
			for ( var i = 0; i < columns.length; i++) {
				if (columns[i].id.indexOf('solid_quantity')!=-1) {
					columns[i].name = columns[i].name + '('+unit+')';
					break;
				}
			}
		}
		
		var units = unitDS.getRecords("bill_unit.bill_type_id = 'MSDS - VOLUME'");
		if(units.length>0){
			var unit = units[0].getValue('bill_unit.bill_unit_id');
			for ( var i = 0; i < columns.length; i++) {
				if (columns[i].id.indexOf('volume_quantity')!=-1) {
					columns[i].name = columns[i].name + '('+unit+')';
					break;
				}
			}
		}
	},

	initializeView : function() {
		var restriction = new Ab.view.Restriction();
		if (this.items.length > 0) {
			restriction.addClause("msds_location.bl_id", this.items, "IN");
		}else{
			restriction.addClause("msds_location.bl_id", '', "IS NULL");
		}
		this.msds_location_grid.refresh(restriction);
		this.msds_grid.clear();
	}
})

function selectMSDSLocation(row) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause("msds_location.bl_id", row['msds_location.bl_id'], "=");
	restriction.addClause("msds_location.fl_id", row['msds_location.fl_id'], "=");
	restriction.addClause("msds_location.rm_id", row['msds_location.rm_id'], "=");
	restriction.addClause("msds_location.eq_id", row['msds_location.eq_id'], "=");
	View.panels.get('msds_grid').refresh(restriction);
}

function selectMSDS(row) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause("msds_data.msds_id", row['msds_location.msds_id'], "=");
	var tabs = View.getControlsByType(self, 'tabs')[0];
	View.panels.get('tabsBldgManagement').selectTab('msdsTab');
	tabs.msdsRestriction = restriction;
	View.controllers.get("msdsDetailsController").onTabsChange('', 'identification');
	tabs.selectTab('identification');
	
	msdsLocationTabController.abRiskMsdsRptMsdsClassForm.show(false);
}
