
var abTableMetricsBuildingsHeatMap_ctrl = View.createController('abTableMetricsBuildingsHeatMap_ctrl', {
	
	selectedMetric_index:0,
	minMax_record:null,

	afterViewLoad: function(){
		this.minMax_record = this.dsMinMaxBuildingsHeatMap.getRecord();
		
		this.createFieldsArray();
		this.drawMap();
		
		//set parameters for metric fields query
        
        this.tableMetricFields_bldgs_heatmap.addParameter("cost_per_area", getMessage("cost_per_area"));
        this.tableMetricFields_bldgs_heatmap.addParameter("avg_area_em", getMessage("avg_area_em"));
        this.tableMetricFields_bldgs_heatmap.addParameter("ru_ratio", getMessage("ru_ratio"));
        this.tableMetricFields_bldgs_heatmap.addParameter("usable_area", getMessage("usable_area"));
        this.tableMetricFields_bldgs_heatmap.addParameter("value_book", getMessage("value_book"));
        this.tableMetricFields_bldgs_heatmap.addParameter("value_market", getMessage("value_market"));
        this.tableMetricFields_bldgs_heatmap.addParameter("fci", getMessage("fci"));
        this.tableMetricFields_bldgs_heatmap.addParameter("operating_costs", getMessage("operating_costs"));
        this.tableMetricFields_bldgs_heatmap.addParameter("capital_project_cost", getMessage("capital_project_cost"));
        this.tableMetricFields_bldgs_heatmap.addParameter("area_estimated", getMessage("area_estimated"));
        this.tableMetricFields_bldgs_heatmap.addParameter("efficency_rate", getMessage("efficency_rate"));
        this.tableMetricFields_bldgs_heatmap.addParameter("int_gross_area", getMessage("int_gross_area"));
        this.tableMetricFields_bldgs_heatmap.addParameter("total_lease_neg_area", getMessage("total_lease_neg_area"));
        this.tableMetricFields_bldgs_heatmap.addParameter("total_occup_area", getMessage("total_occup_area"));
        this.tableMetricFields_bldgs_heatmap.addParameter("rentable_area", getMessage("rentable_area"));
        this.tableMetricFields_bldgs_heatmap.addParameter("total_room_area", getMessage("total_room_area"));
        this.tableMetricFields_bldgs_heatmap.addParameter("employee_headcount", getMessage("employee_headcount"));
        this.tableMetricFields_bldgs_heatmap.addParameter("max_bldg_occup", getMessage("max_bldg_occup"));
        this.tableMetricFields_bldgs_heatmap.addParameter("building_occupancy", getMessage("building_occupancy"));
        this.tableMetricFields_bldgs_heatmap.addParameter("vacancy_percent", getMessage("vacancy_percent"));
        this.tableMetricFields_bldgs_heatmap.addParameter("chargeable_cost", getMessage("chargeable_cost"));
    },
	
	createFieldsArray: function(){
        this.fieldsArray = new Array();
        this.fieldsArray.push('bl.area_estimated');
        this.fieldsArray.push('bl.area_gross_int');
        this.fieldsArray.push('bl.area_rentable');
        this.fieldsArray.push('bl.area_ls_negotiated');
        this.fieldsArray.push('bl.area_ocup');
        this.fieldsArray.push('bl.area_rm');
        this.fieldsArray.push('bl.area_usable');
        this.fieldsArray.push('bl.active_capital_cost');
        this.fieldsArray.push('bl.chargeable_cost');
        this.fieldsArray.push('bl.operating_costs');
        this.fieldsArray.push('bl.value_book');
        this.fieldsArray.push('bl.value_market');
        this.fieldsArray.push('bl.count_occup');
        this.fieldsArray.push('bl.count_em');
        this.fieldsArray.push('bl.count_max_occup');
        this.fieldsArray.push('bl.vacancy_percent');
        this.fieldsArray.push('bl.area_avg_em');
        this.fieldsArray.push('bl.cost_sqft');
        this.fieldsArray.push('bl.ratio_ur');
        this.fieldsArray.push('bl.fci');
        this.fieldsArray.push('bl.ratio_ru');
    },
	
	// disable multiple selection for grid panel
	tableMetricFields_bldgs_heatmap_multipleSelectionColumn_onClick: function(row){
		var selected = row.isSelected();
		this.tableMetricFields_bldgs_heatmap.setAllRowsSelected(false);
		row.select(selected);
		this.selectedMetric_index = row.getIndex();
	},
	drawMap: function(){
		
		var min = parseFloat(this.minMax_record.getValue(this.fieldsArray[this.selectedMetric_index]+"_min"));
		var max = parseFloat(this.minMax_record.getValue(this.fieldsArray[this.selectedMetric_index]+"_max"));
		
		if(max == min){
			max = (min >0) ? min*2 : 100;
		}
		var middle = (min+max)/2;
		
		var colorEntries = [];
		colorEntries.push({color:'0xFFFF00',limit:min,alpha:0.1});
		colorEntries.push({color:'0xFF7700',limit:middle,alpha:0.5});
		colorEntries.push({color:'0xFF0000',limit:max,alpha:0.9});
		
        var mapControl = new Ab.flash.HeatMap(
        	'bldgsHeatMap',//controlId
        	'world', //mapType
        	'dsBuildingsHeatMap', //dataSourceId
        	'bl.bl_id', //primaryKeyField
        	'bl.lat', //latField
        	'bl.lon', //lonField
        	this.fieldsArray[this.selectedMetric_index], //colorValueField
        	this.fieldsArray[this.selectedMetric_index], //sizeValueField
        	'bl.bl_id;'+ this.fieldsArray[this.selectedMetric_index],//labelField
        	true,	//showLegend
         	true,	//showPins
         	colorEntries								
        );
	},
	
	tableMetricFields_bldgs_heatmap_onShowMetric: function(){
		this.drawMap();
		var mapControl = Ab.view.View.getControl('', 'bldgsHeatMap');
		mapControl.refresh();
	}
});

function initializeSelectMetricGrid(){
	var gridPanel = abTableMetricsBuildingsHeatMap_ctrl.tableMetricFields_bldgs_heatmap;
	gridPanel.enableSelectAll(false);
	gridPanel.rows[abTableMetricsBuildingsHeatMap_ctrl.selectedMetric_index].row.select(true);
	
}