
var violationMapController = mapController.extend({
	
	//Marker size option list
	markerSizeOptions: ['option_none', 'option_violation_count', 'option_violation_amount'],

    //Marker color option list
    markerColorOptions: ['option_none', 'option_violation_severity', 'option_level_severity', 
                         'option_severity_priority', 'option_severity_rank','option_level_priority'],
	
	//Information window fields array
	inforWindowField:  ['regviolation.groupField','regviolation.violationSeverity', 'regviolation.complianceLevelField', 
	                    'regviolation.compliancePriorityField', 'regviolation.violation_count',  'regviolation.regulation_count',
	                    'regviolation.program_count', 'regviolation.regcomp_count','regviolation.regulationRankField'],
	
	// Html option and datasource field relation
	optionFieldMap : {
		'option_violation_count' : 'count(regviolation.violation_num)',
		'option_violation_amount' : 'sum(regviolation.cost_total)',
		'option_country' : 'ctry_id',
		'option_region' : '(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)',
		'option_state' : 'state_id',
		'option_city' : '(state_id${sql.concat}\'-\'${sql.concat}city_id)',
		'option_county' : 'county_id',
		'option_site' : 'site_id',
		'option_property' : 'pr_id',
		'option_building' : 'bl_id',
		'option_regulations' : 'regviolation.regulation IS NOT NULL',
		'option_programs' : 'regviolation.reg_program IS NOT NULL',
		'option_violation_severity': 'regviolation.severity'
	},
	
	/**
	 * Get tree and console restriction.
	 */
	getTreeConsoleRestriction : function() {
		
		var tabs = View.panels.get('tabsBldgManagement');
		var treeConsoleRestriction = tabs.treeRestriction
		+" and "+ tabs.regulationRes
		+" and "+ tabs.regprogramRes
		+" and "+ tabs.regcomplianceRes
		+" and "+ tabs.regviolationRes;
		
		return treeConsoleRestriction;
		
	},
	
	/**
	 * Set datasource parameters base on selected options group.
	 */
	setParametersByOption : function() {
		this.getSeletedOptionsGroup();
		
		var ds = this.dsBuilding;
		if(this.sizeField != 'option_none'){
			ds.addParameter('sizeField', this.optionFieldMap[this.sizeField]);
		}else{
			ds.addParameter('sizeField', '1');
		}
		
		ds.addParameter('groupField', this.optionFieldMap[this.location]);
		
		ds.addParameter('colorField', '1');
		
		if(this.colorMethod =='option_average_value'){
			ds.addParameter('complianceLevelField', this.getAverageField('regcomplevel.level_number'));
			ds.addParameter('compliancePriorityField',this.getAverageField('regprogram.priority'));
			ds.addParameter('regulationRankField',this.getAverageField('regulation.reg_rank')); 
			ds.addParameter('violationSeverity',this.getAverageField('regviolation.severity')); 
		}else{
			ds.addParameter('complianceLevelField', '1');
			ds.addParameter('compliancePriorityField','1');
			ds.addParameter('regulationRankField','1'); 
			ds.addParameter('violationSeverity','1'); 
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
			var locationValue = records[i].getValue('regviolation.groupField');
			var locationRestriction = '';
			if(locationValue){
				locationRestriction = this.optionFieldMap[this.location]+ " = '"+locationValue+"'";
			}else{
				locationRestriction = this.optionFieldMap[this.location]+ " is null ";
			}
			
			this.higestCountCalculationDS.addParameter('locationRestriction',locationRestriction);
			this.higestAndLowestValueCalculationDS.addParameter('locationRestriction',locationRestriction);
			
			if(this.colorMethod!='option_average_value'){
				records[i].setValue('regviolation.violationSeverity',this.calculationFieldValueByColorMethod('regviolation.severity'));
				records[i].setValue('regviolation.compliancePriorityField',this.calculationFieldValueByColorMethod('regprogram.priority'));
				records[i].setValue('regviolation.regulationRankField',this.calculationFieldValueByColorMethod('regulation.reg_rank'));
				records[i].setValue('regviolation.complianceLevelField',this.calculationFieldValueByColorMethod('regcomplevel.level_number'));
			}else{
				records[i].setValue('regviolation.violationSeverity',this.stringToInteger(records[i].getValue('regviolation.violationSeverity')));
				records[i].setValue('regviolation.compliancePriorityField',this.stringToInteger(records[i].getValue('regviolation.compliancePriorityField')));
				records[i].setValue('regviolation.regulationRankField',this.stringToInteger(records[i].getValue('regviolation.compliancePriorityField')));
				records[i].setValue('regviolation.complianceLevelField',this.stringToInteger(records[i].getValue('regviolation.complianceLevelField')));
			}
			
			this.calculateColorFieldValue(records[i]);
		}
	},
	
	/**
	 * calculate color field value.
	 */
	calculateColorFieldValue : function(record) {
		if(this.colorField =='option_level_severity'){
			record.setValue('regviolation.colorField', this.getMatricFieldValue(record,'regviolation.violationSeverity','regviolation.complianceLevelField'));
		}else if(this.colorField =='option_severity_priority'){
			record.setValue('regviolation.colorField', this.getMatricFieldValue(record,'regviolation.compliancePriorityField','regviolation.violationSeverity'));
		}else if(this.colorField =='option_severity_rank'){
			record.setValue('regviolation.colorField', this.getMatricFieldValue(record,'regviolation.regulationRankField','regviolation.violationSeverity'));
		}else if(this.colorField =='option_level_priority'){
			record.setValue('regviolation.colorField', this.getMatricFieldValue(record,'regviolation.compliancePriorityField','regviolation.complianceLevelField'));
		}else if(this.colorField =='option_violation_severity'){
			record.setValue('regviolation.colorField', record.getValue('regviolation.violationSeverity'));
		}
		
		this.convertColorFieldToThematic('regviolation',record);
	}

});


/**
 * onClickMarker open a report for selected item
 */
function onClickMarker(title, attributes) {
	
	var restriction = ' regviolation.location_id IS NOT NULL ';
    //var attributes = eval("(" + attributes + ")");
	
	var location = attributes['regviolation.groupField'];
	var locationOption = mapController.getOptionValue('location');
	
	//get restriction from click object
	if(location){
		restriction += ' AND ' + mapController.optionFieldMap[locationOption]+ "='"+location+"' "
	}else{
		restriction += ' AND ' + mapController.optionFieldMap[locationOption]+ " IS NULL "
	}
	
	var tabs = View.panels.get('tabsBldgManagement');
	tabs.markerRestriction = restriction;
    //KB3035975 - change the location tab to pop up to avoid issue in Firefox
	var restriction = tabs.treeRestriction 
	+ " and " + tabs.regulationRes
	+ " and " + tabs.regprogramRes
	+ " and " + tabs.regcomplianceRes
	+ " and " + tabs.regviolationRes
    + " and " + tabs.markerRestriction;
	View.getOpenerView().mode = 'report';
	View.getOpenerView().openDialog("ab-comp-violation-grid-rpt.axvw", restriction);
}

