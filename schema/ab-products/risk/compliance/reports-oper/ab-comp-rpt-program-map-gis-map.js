
var programMapController = mapController.extend({
	
	//Marker size option list
	markerSizeOptions: ['option_none', 'option_regulation_count', 'option_program_count', 'option_requirement_count'],

    //Marker color option list
    markerColorOptions: ['option_none', 'option_regulation_rank', 'option_compliance_evel', 'option_compliance_priority',
                         'option_compliance_level_priority'],

	//Location for option name
	locationFor  : 'option_regulations',
	
	//Information window fields array
	inforWindowField:  ['regloc.groupField', 'regloc.complianceLevelField', 'regloc.compliancePriorityField', 
	                    'regloc.regulationRankField', 'regloc.regulation_count', 'regloc.program_count', 'regloc.regcomp_count'],
	
	// Html option and datasource field relation
	optionFieldMap : {
		'option_regulation_count' : 'count(distinct regloc.regulation)',
		'option_program_count' : 'count(distinct regloc.reg_program)',
		'option_requirement_count' : 'count(distinct regloc.reg_requirement)',
		'option_country' : 'ctry_id',
		'option_region' : '(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)',
		'option_state' : 'state_id',
		'option_city' : '(state_id${sql.concat}\'-\'${sql.concat}city_id)',
		'option_county' : 'county_id',
		'option_site' : 'site_id',
		'option_property' : 'pr_id',
		'option_building' : 'bl_id',
		'option_regulations' : 'regloc.regulation IS NOT NULL',
		'option_programs' : 'regloc.reg_program IS NOT NULL',
		'option_regulation_rank': 'regulation.reg_rank',
		'option_compliance_evel': 'regcomplevel.level_number',
		'option_compliance_priority': 'regprogram.priority'
		
	},

	/**
	 * Get tree and console restriction.
	 */
	getTreeConsoleRestriction : function() {
		
		var tabs = View.panels.get('tabsBldgManagement');
		var treeConsoleRestriction = tabs.treeRestriction
		+" and "+ tabs.regulationRes
		+" and "+ tabs.regprogramRes
		+" and "+ tabs.regcomplianceRes;
		
		return treeConsoleRestriction;
		
	},
	
	/**
	 * Set datasource parameters base on selected options group.
	 */
	setParametersByOption : function() {
		this.sizeField = this.getOptionValue('makerSize');
		this.colorField = this.getOptionValue('makerColor');
		this.colorMethod = this.getOptionValue('makerColorMethod');
		this.minThreshold = this.getOptionValue('minThreshold');
		this.location = this.getOptionValue('location');
		this.locationFor = this.getOptionValue('locationFor');
		
		var ds = this.dsBuilding;
		if(this.sizeField != 'option_none'){
			ds.addParameter('sizeField', this.optionFieldMap[this.sizeField]);
		}else{
			ds.addParameter('sizeField', '1');
		}
		
		ds.addParameter('groupField', this.optionFieldMap[this.location]);
		ds.addParameter('locationFor', this.optionFieldMap[this.locationFor]);
		ds.addParameter('colorField', '1');
		
		if(this.colorMethod =='option_average_value'){
			ds.addParameter('complianceLevelField', this.getAverageField('regcomplevel.level_number'));
			ds.addParameter('compliancePriorityField',this.getAverageField('regprogram.priority'));
			ds.addParameter('regulationRankField',this.getAverageField('regulation.reg_rank')); 
		}else{
			ds.addParameter('complianceLevelField', '1');
			ds.addParameter('compliancePriorityField','1');
			ds.addParameter('regulationRankField','1'); 
		}
		
		ds.addParameter('treeConsoleRestriction', this.treeConsoleRestriction);
		this.higestCountCalculationDS.addParameter('treeConsoleRestriction', this.treeConsoleRestriction);
		this.higestAndLowestValueCalculationDS.addParameter('treeConsoleRestriction', this.treeConsoleRestriction);
	},
	
	/**
	 * handle data after get map data.
	 */
	afterGetMapData : function(records) {
		for(var i=0; i<records.length;i++){
			var locationValue = records[i].getValue('regloc.groupField');
			var locationRestriction = '';
			if(locationValue){
				locationRestriction = this.optionFieldMap[this.location]+ " = '"+locationValue+"'";
			}else{
				locationRestriction = this.optionFieldMap[this.location]+ " is null ";
			}
			
			this.higestCountCalculationDS.addParameter('locationRestriction',locationRestriction);
			this.higestAndLowestValueCalculationDS.addParameter('locationRestriction',locationRestriction);
			
			if(this.colorMethod!='option_average_value'){
				records[i].setValue('regloc.complianceLevelField',this.calculationFieldValueByColorMethod('regcomplevel.level_number'));
				records[i].setValue('regloc.compliancePriorityField',this.calculationFieldValueByColorMethod('regprogram.priority'));
				records[i].setValue('regloc.regulationRankField',this.calculationFieldValueByColorMethod('regulation.reg_rank'));
			}else{
				records[i].setValue('regloc.complianceLevelField',this.stringToInteger(records[i].getValue('regloc.complianceLevelField')));
				records[i].setValue('regloc.compliancePriorityField',this.stringToInteger(records[i].getValue('regloc.compliancePriorityField')));
				records[i].setValue('regloc.regulationRankField',this.stringToInteger(records[i].getValue('regloc.regulationRankField')));
			}
			
			this.calculateColorFieldValue(records[i]);
		}
	},
	
	/**
	 * calculate color field value.
	 */
	calculateColorFieldValue : function(record) {
		if(this.colorField =='option_regulation_rank'){
			record.setValue('regloc.colorField', record.getValue('regloc.regulationRankField'));
		}else if(this.colorField =='option_compliance_evel'){
			record.setValue('regloc.colorField', record.getValue('regloc.complianceLevelField'));
		}else if(this.colorField =='option_compliance_priority'){
			record.setValue('regloc.colorField', record.getValue('regloc.compliancePriorityField'));
		}else if(this.colorField =='option_compliance_level_priority'){
			record.setValue('regloc.colorField', this.getMatricFieldValue(record,'regloc.compliancePriorityField','regloc.complianceLevelField'));
		}
		
		this.convertColorFieldToThematic('regloc',record);
	}
	
});

/**
 * onClickMarker open a report for selected item
 */
function onClickMarker(title, attributes) {
	var restriction = '';
	//var attributes = eval("(" + attributes + ")");
	
	var location = attributes['regloc.groupField'];
	var locationOption = mapController.getOptionValue('location');
	
	//get restriction from click object
	if(location){
		restriction = mapController.optionFieldMap[locationOption]+ "='"+location+"' "
	}else{
		restriction = mapController.optionFieldMap[locationOption]+ " IS NULL "
	}
	
	var tabs = View.panels.get('tabsBldgManagement');
	tabs.markerRestriction = restriction;
	
    //KB3035975 - change the location tab to pop up to avoid issue in Firefox
	var restriction = tabs.treeRestriction 
	+ " and " + tabs.regulationRes
	+ " and " + tabs.regprogramRes
	+ " and " + tabs.regcomplianceRes
    + " and " + tabs.markerRestriction;
	View.getOpenerView().openDialog("ab-comp-rpt-program-map-loc-tab.axvw",restriction);
}
