var abEhsRptMedMonitoringDetailsCtrl = View.createController('abEhsRptMedMonitoringDetailsCtrl', {

	afterInitialDataFetch: function(){
		var restriction =  new Ab.view.Restriction();
		for ( var name in window.location.parameters) {
			var value  =  window.location.parameters[name];
			restriction.addClause("ehs_medical_mon_results." +  name, value , "=");
		}
		this.abEhsRptMedMonitoringDetails_form.refresh(restriction);
	}
});

