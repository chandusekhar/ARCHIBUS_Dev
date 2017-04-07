View.createController('abCbRptAssessSamples', {
	
	afterInitialDataFetch: function(){
		var restriction = View.getOpenerView().parameters['restriction'];
		this.abCbRptAssessSamplesList.refresh(restriction);
	}
});