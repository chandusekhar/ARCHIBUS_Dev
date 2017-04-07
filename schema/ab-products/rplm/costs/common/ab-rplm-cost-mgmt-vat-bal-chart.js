var abRepmVatBalChartCtrl = View.createController('abRepmVatBalChartCtrl',{
	dataAxisLabel: null,
	groupingAxisLabel: null,
	dataSet: null,
	panelTitle: null,
	currencyCode: "",
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
		/*
		 * we must overwrite getDataFromDataSources of chart control 
		 * to pass customized data set
		 */
		this.abRepmVatBalChart.getDataFromDataSources = this.custGetDataFromDataSources;
	},
	
	afterInitialDataFetch: function(){
		var currencyCode = this.currencyCode;
		var currencySymbol = View.currencySymbolFor(this.currencyCode);
		
		this.abRepmVatBalChart.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
				fieldDef.currencySymbol = currencySymbol;
			}
		});
		this.abRepmVatBalChart.refresh();
		this.abRepmVatBalChart.setTitle(this.panelTitle);
	},
	
	custGetDataFromDataSources: function(){
		var controller = View.controllers.get('abRepmVatBalChartCtrl');
		this.config.dataAxis[0].title = controller.dataAxisLabel;
		this.config.groupingAxis[0].title = controller.groupingAxisLabel;
		return toJSON(controller.dataSet);
	}
	
});

