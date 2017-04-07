var projFcpmCpsPkgProfContrController = View.createController('projFcpmCpsPkgProfContr', {
	
	afterInitialDataFetch: function() {
		var status = this.projFcpmCpsPkgProfContr_form1.getFieldValue('work_pkg_bids.status');
		for (var i = 0; i < 5; i++) {
			this.projFcpmCpsPkgProfContr_form1.getFieldElement('work_pkg_bids.status').options[i].setAttribute("disabled", "true");
		}
		if (status != 'Approved') this.projFcpmCpsPkgProfContr_form1.getFieldElement('work_pkg_bids.status').options[5].setAttribute("disabled", "true");
	}
});