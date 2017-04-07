
/**
 * Controller for gap analysis.
 */
var allocWizSpGapController = View.createController('allocWizSpGapController', {
	/** the portfolio scenario id.*/
	scn_id: '',
	
	/** the filter from the console.*/
	filter: null,
	
	/** 
	 * the gap analysis chart.
	 */
	gapAnalysisChart: null,
	
	/** 
	 * the gap analysis chart.
	 */
	occupGapAnalysisChart: null,

	currentGapChart: null,

	isShowUtilizationLine: true,
	isShowOccupancyRateLine: true,
	
	utiliztionAreaGraph: null,
	
	areaUnitsConversionFactor: 1.0,
	
	
	afterViewLoad: function(){
		//create restriction for the event tree
		this.allocWizSpGap_yearTree.createRestrictionForLevel = this.createLevelRestrictionForEventTree;
		
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			if(View.user.displayUnits != View.project.units){
				this.areaUnitsConversionFactor = 1.0 / parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
    },
    
    afterInitialDataFetch: function() {
    	var allocWizController = View.getOpenerView().controllers.get('allocWiz');
		this.scn_id = allocWizController.scn_id;
		this.filter = {};
		this.filter['scn_id'] = this.scn_id;
		this.refreshTab(this.filter);

		this.gapAnalysisChartPanel.actions.get('closeOccupancyRate').show(false);
    },
        
    /**
     * Refresh the tab.
     */
    refreshTab: function(filter) {
    	if (filter) {
    		this.filter = filter;
    	}
    	
    	if (this.filter['scn_id']) {
    		this.scn_id = this.filter['scn_id'];
    	}
    	if(this.scn_id != null && this.scn_id != '') {
			var scnIdRestriction = getScenarioIdRestriction(this.scn_id);
			this.allocWizSpGap_yearTree.addParameter('scenarioIdRestriction', scnIdRestriction);
			this.addParametersForDataSource('scenarioIdRestriction', scnIdRestriction);
		}
    			
		var panelsAndDatasources = [this.groupYearMonthGpDataSource, this.gapAnalysisUsableDataDs, this.gapAnalysisUnavailableDataDs, this.gapAnalysisAllocatedDataDs, this.allocWizSpGap_yearTree, this.gapAnalysisTotalSeatsDataDs, this.gapAnalysisOccupiedSeatsDataDs];
		addDateRestriction(panelsAndDatasources, this.filter, this.checkOracleDataSource);
		addLocationRestriction(panelsAndDatasources, this.filter);
    	
    	//add areaConversionFactor for events tree
    	this.allocWizSpGap_yearTree.addParameter('areaUnitsConversionFactor', this.areaUnitsConversionFactor);
    	
    	this.allocWizSpGap_yearTree.refresh();
		
		if ( !this.gapAnalysisChart && !this.occupGapAnalysisChart ){
			createGapAnalysisChart(this);
			this.currentGapChart = this.gapAnalysisChart;
		}

		if ( this.gapAnalysisChart )	{
			this.gapAnalysisChart.dataProvider = createChartDataSeeds(this);
			this.gapAnalysisChart.validateData();
		}

		if ( this.occupGapAnalysisChart ){
			this.occupGapAnalysisChart.dataProvider = createOccupChartDataSeeds(this);
			this.occupGapAnalysisChart.validateData();
		}
    },

    addParametersForDataSource: function(name,value) {
    	this.groupYearMonthGpDataSource.addParameter(name, value);

		this.gapAnalysisUsableDataDs.addParameter(name, value);
		this.gapAnalysisUnavailableDataDs.addParameter(name, value);
		this.gapAnalysisAllocatedDataDs.addParameter(name, value);

		this.gapAnalysisTotalSeatsDataDs.addParameter(name, value);
		this.gapAnalysisOccupiedSeatsDataDs.addParameter(name, value);
    },
    
    applyChangedScenario: function(filter) {
    	this.filter = filter;
    	//this.refreshTab();
    },
    
    gapAnalysisChartPanel_onCloseUtilization: function() {
    	if(this.gapAnalysisChart) {
    		if(this.isShowUtilizationLine) {
	    		this.gapAnalysisChart.hideGraph(this.utiliztionAreaGraph);
	    		this.gapAnalysisChartPanel.actions.get('closeUtilization').setTitle(getMessage('showUtilizationLine'));
	    		this.isShowUtilizationLine = false;
    		} else {
    			this.gapAnalysisChart.showGraph(this.utiliztionAreaGraph);
	    		this.gapAnalysisChartPanel.actions.get('closeUtilization').setTitle(getMessage('closeUtilizationLine'));
	    		this.isShowUtilizationLine = true;
    		}
    	} 
    },
    
    gapAnalysisChartPanel_onCloseOccupancyRate: function() {
    	if(this.occupGapAnalysisChart) {
    		if(this.isShowOccupancyRateLine) {
	    		this.occupGapAnalysisChart.hideGraph(this.occupRateGraph);
	    		this.gapAnalysisChartPanel.actions.get('closeOccupancyRate').setTitle(getMessage('showOccupancyRateLine'));
	    		this.isShowOccupancyRateLine = false;
    		} else {
    			this.occupGapAnalysisChart.showGraph(this.occupRateGraph);
	    		this.gapAnalysisChartPanel.actions.get('closeOccupancyRate').setTitle(getMessage('closeOccupancyRateLine'));
	    		this.isShowOccupancyRateLine = true;
    		}
    	} 
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
    
    createLevelRestrictionForEventTree: function(parentNode, level) {
    	if (parentNode.data) {
			var restriction = null;
			if (level == 1) {
				var dvId = parentNode.data['gp.dv_id'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('gp.dv_id', dvId, '=');
			} else if (level == 2) {
				var eventName = parentNode.data['gp.event_name'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('gp.event_name', eventName, '=');
			} else if (level == 3) {
				var gpName = parentNode.data['gp.name'];
				var eventName = parentNode.data['gp.event_name'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('gp.name', gpName, '=');
				restriction.addClause('gp.event_name', eventName, '=');
			}
			return restriction;
		}
    },

	 gapAnalysisChartPanel_onSwitchToOccupancyView: function() {
		 if (this.currentGapChart == this.gapAnalysisChart){
			$('gapAnalysisChartDiv').style.display="none";
			$('occupGapAnalysisChartDiv').style.display="";

			this.gapAnalysisChartPanel.actions.get('closeUtilization').show(false);
			this.gapAnalysisChartPanel.actions.get('closeOccupancyRate').show(true);
			this.gapAnalysisChartPanel.actions.get('switchToOccupancyView').setTitle(getMessage('toAreaView'));

			if ( !this.occupGapAnalysisChart ){
				createOccupGapAnalysisChart(this);
				this.occupGapAnalysisChart.dataProvider = createOccupChartDataSeeds(this);
				this.occupGapAnalysisChart.validateData();
			}
			this.currentGapChart = this.occupGapAnalysisChart;
		 } 
		 else {
			$('gapAnalysisChartDiv').style.display="";
			$('occupGapAnalysisChartDiv').style.display="none";

			this.gapAnalysisChartPanel.actions.get('closeUtilization').show(true);
			this.gapAnalysisChartPanel.actions.get('closeOccupancyRate').show(false);
			this.gapAnalysisChartPanel.actions.get('switchToOccupancyView').setTitle(getMessage('toOccupView'));

			if ( !this.gapAnalysisChart ){
				createGapAnalysisChart(this);
				this.gapAnalysisChart.dataProvider = createChartDataSeeds(this);
				this.gapAnalysisChart.validateData();
			}
			this.currentGapChart = this.gapAnalysisChart;
		 }
	 },

	 gapAnalysisChartPanel_onGenerateGapPPT: function() {
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
		 	 View.openJobProgressBar(getMessage("z_MESSAGE_WAIT")+"...", jobId, null, function(status) {
	   		 var url  = status.jobFile.url;
	    			window.location = url;
	 	   	 }); 
		 }
     }
});


