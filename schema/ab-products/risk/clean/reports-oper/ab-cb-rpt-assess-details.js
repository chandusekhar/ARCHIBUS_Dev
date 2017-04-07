View.createController('abCbRptAssessDetails', {
	
	afterInitialDataFetch: function(){
		var restriction = View.getOpenerView().parameters['restriction'];
		this.abCbAssessDetailsForm.refresh(restriction);
	}
});