/**
 * @author Guo Jiangtao
 */
var abCompRptCommManLineChartController = View.createController('abCompRptCommManLineChartController', {

	/**
	 * the main view controller which contain this common chart view
	 */
	mainController : null,
	
	/**
	 * the console view controller
	 */
	consoleController : null,

	/**
	 * type of ManageReportControl
	 */
	control : null,
	
	/**
	 * severity field define
	 */
	severityFiledDef : null,

	/**
	 * reset the panel title after the chart loaded.
	 */
	afterInitialDataFetch : function() {
		//get severity field define from the datasource
		this.severityFiledDef = View.dataSources.get('abCompRptCommManChart_fieldDef_DS').fieldDefs.get('regviolation.severity');
		
		// get console view controller from opener view
		this.consoleController = View.getOpenerView().controllers.get('controllerConsole');
		//register to console controller
		if (this.consoleController) {
			this.consoleController.controllers.push(this);
		}
		
		// get main controller from opener view
		this.mainController = View.getOpenerView().controllers.get(0);

		// get property value from main controller
		if (this.mainController && this.mainController.controls) {

			var controls = this.mainController.controls;
			for ( var i = 0; i < controls.length; i++) {
				if (controls[i].type == 'lineChart' && !controls[i].isLoad) {
					this.control = controls[i];
					break;
				}
			}
			
			if(this.mainController.beforeControlLoad){
				this.mainController.beforeControlLoad(this.control,this.abCompRptCommManChart,abCompRptCommManLineChartController);
			}
		}
		
		// set all parameters
		this.setParameters();
		
		// reset the chart panel title
		this.abCompRptCommManChart.config.title = this.control.title

		// refresh and show chart
		if(this.consoleController.consoleRestriction){
			// fix KB3035927 - refreshed according to the console restrictions when switch from one tab to anothe
			this.refreshFromConsole();
		}else{
			this.abCompRptCommManChart.refresh();
		}

		//set isload flag
		this.control.isLoad = true;
	},

	/**
	 * set required parameters of this view.
	 */
	setParameters : function() {
		var chart = this.abCompRptCommManChart;
		this.setQuery();
		chart.setDataAxisTitle(this.control.firstCalcField.title);
		chart.addParameter('firstGroupField', this.control.firstGroupField.name);
		chart.addParameter('firstGroupField', this.control.firstGroupField.name);
		chart.addParameter('firstGroupSortField', this.control.firstGroupSortField.name);
		chart.addParameter('calcField', this.control.firstCalcField.name);
		
		if(this.control.permanentParameter){
			chart.addParameter('permanentParameter', this.control.permanentParameter);
		}
		
		chart.configObj.groupingAxis[0].title = this.control.firstGroupField.title;
	},
	
	/**
	 * set database query base on the main table name.
	 */
	setQuery : function() {
		var chart = this.abCompRptCommManChart;
		var query = ' '
		var mainTable = this.control.mainTable;
		var byLocation = this.control.byLocation;	
		switch(mainTable){	  
			  
		  case 'regviolation': 
			  //qurery from table regrequirement
			  query = 'select ctry_id,state_id,(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)regn_id,(state_id${sql.concat}\'-\'${sql.concat}city_id)city_id,county_id,site_id,pr_id,bl_id,'
				    + '       regviolation.severity severity,regviolation.cost_total cost_total,'
				    + '       regviolation.reg_program reg_program,regviolation.regulation regulation,'
				    + '       regviolation.date_assessed date_assessed,regviolation.violation_num violation_num '
				    + ' from regviolation'
				    + '      left join regloc on regloc.location_id = regviolation.location_id'
			        + '      left join compliance_locations on compliance_locations.location_id = regviolation.location_id'
			        + '      left join regulation on regulation.regulation = regviolation.regulation'
			        + '      left join regprogram on regprogram.reg_program = regviolation.reg_program and regprogram.regulation = regviolation.regulation'
			        + '      left join regrequirement on regrequirement.regulation = regviolation.regulation'
			        +'               and regrequirement.reg_program = regviolation.reg_program'
			        +'               and regrequirement.reg_requirement = regviolation.reg_requirement';



			  break;  
		}
		
		chart.addParameter('query', query);
	},
	
	/**
	 * refresh chart from console filter.
	 */
	refreshFromConsole: function() {
		if(this.consoleController){
			var chart = this.abCompRptCommManChart;
			
			//set parameter to the chart panel
			if(this.consoleController.consoleRestriction){
				chart.addParameter('consoleRestriction', this.consoleController.consoleRestriction);
			}
			
			chart.refresh();
		}
	},
	
	openPopUpView: function(ob) {
		if(this.mainController.openPopUpView){
			this.mainController.openPopUpView(ob,this.control);
		}
	}
});

/**
 * on click event handler of the chart.
 */
function onClickChart(ob){
	
	//get field define of first group field and second field define
	var firstGroupFieldDef = abCompRptCommManLineChartController[abCompRptCommManLineChartController.control.firstGroupFieldDef];
	var secondGroupFieldDef = abCompRptCommManLineChartController[abCompRptCommManLineChartController.control.secondGroupFieldDef];
	
	//convert the display value to raw value for first group field 
	if(firstGroupFieldDef){
		ob.selectedChartData['regloc.firstGroupField'] = getRawValueFromEnum(firstGroupFieldDef,ob.selectedChartData['regloc.firstGroupField']);
	}
	
	//convert the display value to raw value for second group field 
    if(secondGroupFieldDef){
    	ob.selectedChartData['regloc.secondGroupField'] = getRawValueFromEnum(secondGroupFieldDef,ob.selectedChartData['regloc.secondGroupField']);
	}
    
    //open pop up
	abCompRptCommManLineChartController.openPopUpView(ob);
	
}

/**
 * get the raw value base on the display value.
 */
function getRawValueFromEnum(fiedDef, displayedValue){
	
	for(var name in fiedDef.enumValues){
		if(fiedDef.enumValues[name] == displayedValue){
			return name;
			break;
		}
	}
	
}

/**
 * overwrite the getDataFromDataSources method of chart control to convert raw value to display value for enum type field.
 */
Ab.chart.ChartControl.prototype.getDataFromDataSources = function(restriction){	 
	
	try {
	    var parameters = this.getParameters(restriction);
	    //XXX: default time-out is 20S, but for charts, it should be longer (120S?)
        var result = Workflow.call(this.refreshWorkflowRuleId, parameters, 120);
        this.formatDataRecords(result);
    
        return toJSON(result.data);
	} catch (e) {
		this.handleError(e);
	}
	
 }

/**
 * extent the formatDataRecords method of chart control to convert raw value to display value for enum type field.
 */
Ab.chart.ChartControl.prototype.formatDataRecords =  function(result) {
	
	var firstGroupFieldDef = abCompRptCommManLineChartController[abCompRptCommManLineChartController.control.firstGroupFieldDef];
	var secondGroupFieldDef = abCompRptCommManLineChartController[abCompRptCommManLineChartController.control.secondGroupFieldDef];
	if(secondGroupFieldDef){
		for(var i=0; i<result.data.length;i++){
			result.data[i]['regloc.secondGroupField'] = secondGroupFieldDef.formatValue(result.data[i]['regloc.secondGroupField']);
		}
	}
	
    if(firstGroupFieldDef){
    	for(var i=0; i<result.data.length;i++){
    		for(var j=0; j<result.data[i].data.length;j++){
    			result.data[i].data[j]['regloc.firstGroupField'] = firstGroupFieldDef.formatValue(result.data[i].data[j]['regloc.firstGroupField']);
    		}
		}
	}
    
}