/**
 * Controller for Space Report Gap Analysis Chart Panel.
 */
View.createController('spaceGapChartControllerr', {
	
	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:space:portfolio:report:showComparionResult', this.refreshGapAnalysisChart);
	},
	
    afterInitialDataFetch: function() {
    	createGapAnalysisChart(this,1);
    	createGapAnalysisChart(this,2);
    	this.gapAnalysisChartPanel1.show(false);
    	this.gapAnalysisChartPanel2.show(false);
    	jQuery('#printPPT').show();
    },
	
	// ----------------------- Action event handler--------------------

	/**
	 * Refresh Gap Analysis Chart.
	 */
	refreshGapAnalysisChart : function(scenarioRows, comparisonType) {
		this.gapAnalysisChartPanel1.show(false);
		this.gapAnalysisChartPanel2.show(false);
		
		if(comparisonType == 'gap'){
			if(scenarioRows.length == 1){
				this.gapAnalysisChartPanel1.show(true);
				this.setGapPanelTitle(this.gapAnalysisChartPanel1,scenarioRows[0].record['portfolio_scenario.scn_name']);
				this.setDataSourceParameters('scenarioIdRestriction', this.getScenarioIdRestriction(scenarioRows[0]));
				this.gapAnalysisChart1.dataProvider = createChartDataSeeds(this);
		    	this.gapAnalysisChart1.validateData();
			}else if(scenarioRows.length == 2){
				this.gapAnalysisChartPanel1.show(true);
				this.gapAnalysisChartPanel2.show(true);
				this.setGapPanelTitle(this.gapAnalysisChartPanel1,scenarioRows[0].record['portfolio_scenario.scn_name']);
				this.setGapPanelTitle(this.gapAnalysisChartPanel2,scenarioRows[1].record['portfolio_scenario.scn_name']);
				
				this.setDataSourceParameters('scenarioIdRestriction', this.getScenarioIdRestriction(scenarioRows[0]));
				this.gapAnalysisChart1.dataProvider = createChartDataSeeds(this);
		    	this.gapAnalysisChart1.validateData();
		    	
		    	this.setDataSourceParameters('scenarioIdRestriction', this.getScenarioIdRestriction(scenarioRows[1]));
				this.gapAnalysisChart2.dataProvider = createChartDataSeeds(this);
		    	this.gapAnalysisChart2.validateData();
		    	
			}
		}
	},
	
	setGapPanelTitle: function(panel,scenario) {
		// reset the chart panel title
		panel.setTitle(getMessage('gapAnalysis') + ' - ' + scenario);
	},
	
	getScenarioIdRestriction: function(scenarioRow) {
		var scenarioId = scenarioRow.record['portfolio_scenario.portfolio_scenario_id'];
		return  "gp.portfolio_scenario_id = '" + scenarioId + "'";
	},
	
	setDataSourceParameters: function(name,value) {
		this.groupYearMonthGpDataSource.addParameter(name, value);
		this.gapAnalysisUsableDataDs.addParameter(name, value);
		this.gapAnalysisUnavailableDataDs.addParameter(name, value);
		this.gapAnalysisAllocatedDataDs.addParameter(name, value);
	 },
	 
	 spRptFilter_onPrintPPT: function() {
		 var slides = [];
		 if(this.gapAnalysisChartPanel1.visible){
			 var amExportInstance = new AmCharts.AmExport(this.gapAnalysisChart1,{}, true);
			 var imageBytes = '';
			 amExportInstance.output({output: 'datastring', format:"png"}, function(image){
				imageBytes = image.substring(22);
			 });
			 
			 slides.push({'title': $('gapAnalysisChartPanel1_title').innerHTML,'images':[imageBytes]});  
		 }
		 
		 if(this.gapAnalysisChartPanel2.visible){
			 var amExportInstance = new AmCharts.AmExport(this.gapAnalysisChart2,{}, true);
			 var imageBytes = '';
			 amExportInstance.output({output: 'datastring', format:"png"}, function(image){
				imageBytes = image.substring(22);
			 });
			 
			 slides.push({'title': $('gapAnalysisChartPanel2_title').innerHTML,'images':[imageBytes]});  
		 }
		 
		 if(slides.length>0){
			 var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
		 	 View.openJobProgressBar( getMessage('z_MESSAGE_WAIT')+"...", jobId, null, function(status) {
	   		 var url  = status.jobFile.url;
	    			window.location = url;
	 	   	 }); 
		 }
		 
     }

});
