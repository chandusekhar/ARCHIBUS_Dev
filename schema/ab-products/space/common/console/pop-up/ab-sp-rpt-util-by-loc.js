
/**
 * Controller for gap analysis.
 */
var allocWizSpGapController = View.createController('allocWizSpGapController', {
	
	/** 
	 * the gap analysis chart.
	 */
	gapAnalysisChart: null,
	
	consoleRestriction: null,
	
	areaUnitsConversionFactor: 1.0,
	
	
	afterViewLoad: function(){
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			if(View.user.displayUnits != View.project.units){
				this.areaUnitsConversionFactor = 1.0 / parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
    },
    
    afterInitialDataFetch: function() {
    	createGapAnalysisChart(this);
		//this.utilRptFilter_onFilter();
		this.initialFilterFieldValues();
    },

    initialFilterFieldValues: function() {
		if ( View.getOpenerView() ){
			var locationCtrl = View.getOpenerView().controllers.get('spaceExpressConsoleLocations');
			if ( locationCtrl ){
				var filterOptions = locationCtrl.locationFilterOptions; 
				if ( filterOptions.getFieldValue('util_from_date') ) {
					this.utilRptFilter.setFieldValue('date_from', filterOptions.getFieldValue('util_from_date'));
				}
				if ( filterOptions.getFieldValue('util_to_date') ) {
					this.utilRptFilter.setFieldValue('date_to', filterOptions.getFieldValue('util_to_date'));
				}
				if ( filterOptions.getFieldValue('util_from_time') ) {
					this.utilRptFilter.setFieldValue('time_from', filterOptions.getFieldValue('util_from_time'));
				}
				if ( filterOptions.getFieldValue('util_to_time') ) {
					this.utilRptFilter.setFieldValue('time_to', filterOptions.getFieldValue('util_to_time'));
				}

				var filter = locationCtrl.locationFilter; 
				if ( filter.getFieldValue('rm.bl_id') ) {
					this.utilRptFilter.setFieldValue('bas_measurement_scope.bl_id', filter.getFieldValue('rm.bl_id'));
				}
				if ( filter.getFieldValue('rm.fl_id') ) {
					this.utilRptFilter.setFieldValue('bas_measurement_scope.fl_id', filter.getFieldValue('rm.fl_id'));
				}
				if ( filter.getFieldValue('rm.rm_id') ) {
					this.utilRptFilter.setFieldValue('bas_measurement_scope.rm_id', filter.getFieldValue('rm.rm_id'));
				}
			}
		}
	},
        
    /**
     * Refresh the report.
     */
    utilRptFilter_onFilter: function() {
		this.consoleRestriction = " 1=1 ";
		//var panelsAndDatasources = [this.utilYearMonthDs, this.gapAnalysisHeadcountDs, this.gapAnalysisUnavailableDataDs, this.gapAnalysisAllocatedDataDs, this.allocWizSpGap_yearTree];
		//addDateRestriction(panelsAndDatasources, this.filter, this.checkOracleDataSource);
		//addLocationRestriction(panelsAndDatasources, this.filter);
		var blId = this.utilRptFilter.getFieldValue('bas_measurement_scope.bl_id');
		if (blId) {
			this.consoleRestriction += " AND bas_measurement_scope.bl_id=${sql.literal('"+blId+"')} ";
		}
		var flId = this.utilRptFilter.getFieldValue('bas_measurement_scope.fl_id');
		if (flId) {
			this.consoleRestriction += " AND bas_measurement_scope.fl_id=${sql.literal('"+flId+"')} ";
		}
		var rmId = this.utilRptFilter.getFieldValue('bas_measurement_scope.rm_id');
		if (rmId) {
			this.consoleRestriction += " AND bas_measurement_scope.rm_id=${sql.literal('"+rmId+"')} ";
		}

		var fromDate = this.utilRptFilter.getFieldValue('date_from');
		var fromTime = this.utilRptFilter.getFieldValue('time_from');
		if ( fromDate && fromTime ) {
			this.consoleRestriction += " AND ( bas_data_clean_num.date_measured>${sql.date('"+fromDate+"')} "
																+" or bas_data_clean_num.date_measured=${sql.date('"+fromDate+"')} "
																+"		and bas_data_clean_num.time_measured>=${sql.time('"+fromTime+"')} ) ";
		} 
		else if ( fromDate ) { 
			this.consoleRestriction += " AND bas_data_clean_num.date_measured>=${sql.date('"+fromDate+"')} ";
		}

		var toDate = this.utilRptFilter.getFieldValue('date_to');
		var toTime = this.utilRptFilter.getFieldValue('time_to');
		if ( toDate && toTime ) {
			this.consoleRestriction += " AND ( bas_data_clean_num.date_measured<${sql.date('"+toDate+"')} "
																+" or bas_data_clean_num.date_measured=${sql.date('"+toDate+"')} "
																+"		and bas_data_clean_num.time_measured<=${sql.time('"+toTime+"')} ) ";
		} 
		else if ( toDate ) { 
			this.consoleRestriction += " AND bas_data_clean_num.date_measured<=${sql.date('"+toDate+"')} ";
		}

    	this.gapAnalysisChart.dataProvider = createChartDataSeeds(this);
    	this.gapAnalysisChart.validateData();

		setTimeout(function(){allocWizSpGapController.utilRptFilter_onFilter();},120000);
    },

    addParametersForDataSource: function(name,value) {
    	this.utilYearMonthDs.addParameter(name, value);

		this.gapAnalysisHeadcountDs.addParameter(name, value);
		this.gapAnalysisUnavailableDataDs.addParameter(name, value);
		this.gapAnalysisAllocatedDataDs.addParameter(name, value);

		this.gapAnalysisTotalSeatsDataDs.addParameter(name, value);
		this.gapAnalysisOccupiedSeatsDataDs.addParameter(name, value);
    },
    
	createGuideLineForChart: function(){
    	var records = this.guideLinesDataSource.getRecords();
    	for (var i = 0 ; i < records.length; i++) {
    		var record = records[i];
    		var guideLine = new AmCharts.Guide();
    		guideLine.category = record.getValue('gp.eventDate');
    		guideLine.lineColor = "#CC0000";
    		guideLine.lineAlpha = 1;
    		guideLine.dashLength = 2;
    		guideLine.inside = true;
    		guideLine.labelRotation = 90;
    		guideLine.label = record.getValue('gp.description');
    		this.gapAnalysisChart.categoryAxis.addGuide(guideLine);
    	}
    },
    
	 utilRptFilter_onGenerateGapPPT: function() {
		 var slides = [];
		 if(this.gapAnalysisChartPanel.visible){
			 var amExportInstance = new AmCharts.AmExport(this.gapAnalysisChart,{}, true);
			 var imageBytes = '';
			 amExportInstance.output({output: 'datastring', format:"png"}, function(image){
				imageBytes = image.substring(22);
			 });
			 
			 slides.push({'title': $('gapAnalysisChartPanel_title').innerHTML,'images':[imageBytes]});  
		 }
		 		 
		 if(slides.length>0){
			 var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
		 	 View.openJobProgressBar(getMessage("wait")+"...", jobId, null, function(status) {
	   		 var url  = status.jobFile.url;
	    			window.location = url;
	 	   	 }); 
		 }
     }
});


