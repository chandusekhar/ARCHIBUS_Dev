var abEhsRptTrainingDetailsCtrl = View.createController('abEhsRptTrainingDetailsCtrl', {
	
	afterInitialDataFetch: function(){
		var restriction =  new Ab.view.Restriction();
		for ( var name in window.location.parameters) {
			var value  =  window.location.parameters[name];
			restriction.addClause("ehs_training_results." +  name, value , "=");
		}
		this.abEhsRptTrainingDetails_form.refresh(restriction);
	}
});
