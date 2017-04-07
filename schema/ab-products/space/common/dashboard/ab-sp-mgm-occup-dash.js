var locMetricDashCtrl = View.createController('locMetricDashCtrl', {
	
	consoleCtrl:null,
	treeCtrl:null,
	chartCtrls:[],

	//occupAndCapController:'',
	//keyTotalMetricController:'',
	//areaByBlUsecController:'',
	//areaPerSeatController:'',
	//usableStackBarController:'',
	//vacancyChartController:'',
	//gisController:'',

	afterViewLoad: function() {
		//var controllerConsole=View.controllers.get('controllerConsole');
		//controllerConsole.abHelpRequestTreeConsole.actions.get('filter').show(false);
		//this.showOrHideConsole.defer(4000);
	},
	
	/**
	 * Show or hide console button
	 */
	showOrHideConsole:function(){
		//var controllerConsole=View.controllers.get('controllerConsole');
		//controllerConsole.abHelpRequestTreeConsole.actions.get('filter').show(true);
	},
	
	afterInitialDataFetch: function() {
		this.treeCtrl=View.controllers.get('treeController');
		this.consoleCtrl=View.controllers.get('consoleController');
		//View.controllers.get('treeController').dashCostAnalysisMainController=this;
	},
	
	registerChartCtrl: function(chartCtrl){
		this.chartCtrls.push(chartCtrl);
	},

	getChartControllerById:function(chartCtrlId){
		if ( this.chartCtrls ) {
			for ( var i=0; i<this.chartCtrls.length; i++ ) {	
				if ( this.chartCtrls[i].id == chartCtrlId ) {
					return this.chartCtrls[i];
				}
			}
		}
		return null;
	},

	/**
	 * Refresh dash board.
	 */
	refreshDashboard:function(){
		for (var i=0; i<this.chartCtrls.length; i++ ) {
			 this.chartCtrls[i].refreshChart();
		}
	}
})

