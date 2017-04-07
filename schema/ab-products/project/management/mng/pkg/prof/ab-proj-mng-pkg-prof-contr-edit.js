var projMngPkgProfContrEditController = View.createController('projMngPkgProfContrEdit', {
	
	afterInitialDataFetch: function() {
		var status = this.projMngPkgProfContrEdit_form1.getFieldValue('work_pkg_bids.status');
		for (var i = 0; i < 5; i++) {
			this.projMngPkgProfContrEdit_form1.getFieldElement('work_pkg_bids.status').options[i].setAttribute("disabled", "true");
		}
		if (status != 'Approved') this.projMngPkgProfContrEdit_form1.getFieldElement('work_pkg_bids.status').options[5].setAttribute("disabled", "true");
	},
	
	projMngPkgProfContrEdit_form1_onSignContract : function() {
		var cost_contract = this.projMngPkgProfContrEdit_form1.getFieldValue('work_pkg_bids.cost_contract');
		if (Number(cost_contract) == 0) {
			var controller = this;
			View.confirm(getMessage('zeroCostContr'), function(button){
	            if (button == 'yes') {
	            	controller.signContract();
	            }
	            else {
	                
	            }
	        });
		}
		else this.signContract();
	},
	
	signContract: function() {
		this.projMngPkgProfContrEdit_form1.setFieldValue('work_pkg_bids.status','Contract Signed');
		if (!this.projMngPkgProfContrEdit_form1.save()) return;
		View.getOpenerView().panels.get('projMngPkgProf_workpkgForm').refresh();
		View.closeThisDialog();
	}
});

function verifyEndAfterStart(formId) {
	var form = View.panels.get(formId);
	var date_started = form.getFieldValue('work_pkg_bids.date_contract_start');
	var date_completed = form.getFieldValue('work_pkg_bids.date_contract_end');
	if (date_started != '' && date_completed != '' && date_completed < date_started) {
		form.setFieldValue('work_pkg_bids.date_contract_end', date_started);
	}
}