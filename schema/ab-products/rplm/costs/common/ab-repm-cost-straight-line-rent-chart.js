var abRepmStraightLineChartCtrl = View.createController('abRepmStraightLineChartCtrl',{
	dataAxisLabel: null,
	groupingAxisLabel: null,
	dataSet: null,
	panelTitle: null,
	currencyCode: "",
	printableRestriction: [],
	afterViewLoad: function(){
		// read chart parameters
		if(valueExistsNotEmpty(this.view.parameters['dataAxisLabel'])){
			this.dataAxisLabel = this.view.parameters['dataAxisLabel'].replace(":", "");
		}
		if(valueExistsNotEmpty(this.view.parameters['groupingAxisLabel'])){
			this.groupingAxisLabel = this.view.parameters['groupingAxisLabel'];
		}
		if(valueExistsNotEmpty(this.view.parameters['dataSet'])){
			this.dataSet = this.view.parameters['dataSet'];
			if(this.dataSet.length == 0){
				this.dataSet = null;
			}
		}
		if(valueExistsNotEmpty(this.view.parameters['panelTitle'])){
			this.panelTitle = this.view.parameters['panelTitle'];
		}
		if(valueExistsNotEmpty(this.view.parameters['currencyCode'])){
			this.currencyCode = this.view.parameters['currencyCode'];
		}
		if(valueExistsNotEmpty(this.view.parameters['printableRestriction'])){
			this.printableRestriction = this.view.parameters['printableRestriction'];
		}
		/*
		 * we must overwrite getDataFromDataSources of chart control 
		 * to pass customized data set
		 */
		this.abRepmStraightLineChart.getDataFromDataSources = this.custGetDataFromDataSources;
	},
	
	afterInitialDataFetch: function(){
		if(valueExists(this.abRepmStraightLineChart.getDataSource().fieldDefs.get("cost_tran_recur.net_amount_income").currency)){
			this.abRepmStraightLineChart.getDataSource().fieldDefs.get("cost_tran_recur.net_amount_income").currency = this.currencyCode;
			this.abRepmStraightLineChart.getDataSource().fieldDefs.get("cost_tran_recur.net_amount_income").currencySymbol = View.currencySymbolFor(this.currencyCode);
		}
		this.abRepmStraightLineChart.refresh();
		this.abRepmStraightLineChart.setTitle(this.panelTitle);
	},
	
	custGetDataFromDataSources: function(){
		var controller = View.controllers.get('abRepmStraightLineChartCtrl');
		this.config.dataAxis[0].title = controller.dataAxisLabel;
		this.config.groupingAxis[0].title = controller.groupingAxisLabel;
		return toJSON(controller.dataSet);
	},
	
	abRepmStraightLineChart_onDoc: function(){
		var  panel  =  this.abRepmStraightLineChart;
		var  parameters  = {};
		if(panel.getParametersForRefresh){
			parameters   =  panel.getParametersForRefresh();
		}
		parameters.printRestriction  =  true;
		parameters.printableRestriction  =  this.printableRestriction;

		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
		
		var  jobId  =  panel.callDOCXReportJob(panel.title,  panel.restriction,  parameters);
		
		var jobStatus = Workflow.getJobStatus(jobId);
		while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
			jobStatus = Workflow.getJobStatus(jobId);
		}
		
		if (jobStatus.jobFinished) {
			var url  = jobStatus.jobFile.url;
			if (valueExistsNotEmpty(url)) {
				window.location = url;
			}
		}
		
		View.closeProgressBar();
	}
	
});

