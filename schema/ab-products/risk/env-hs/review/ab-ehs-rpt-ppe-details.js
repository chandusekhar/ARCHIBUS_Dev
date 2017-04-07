var abEhsRptPPEDetailsCtrl = View.createController('abEhsRptPPEDetailsCtrl', {
	afterInitialDataFetch: function(){
		var restriction =  new Ab.view.Restriction();
		for ( var name in window.location.parameters) {
			var value  =  window.location.parameters[name];
			restriction.addClause("ehs_em_ppe_types." +  name, value , "=");
		}
		this.abEhsRptPPEDetails_form.refresh(restriction);
	}
});
