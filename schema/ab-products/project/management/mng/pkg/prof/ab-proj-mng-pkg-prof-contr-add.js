var projMngPkgProfContrAddController = View.createController('projMngPkgProfContrAdd', {
	
	afterInitialDataFetch: function() {
		for (var i = 0; i < 6; i++) {
			this.projMngPkgProfContrAdd_form1.getFieldElement('work_pkg_bids.status').options[i].setAttribute("disabled", "true");
		}
	},
	
	projMngPkgProfContrAdd_form0_onSave: function() {
		var cost_contract = this.projMngPkgProfContrAdd_form0.getFieldValue('work_pkg_bids.cost_contract');
		this.projMngPkgProfContrAdd_form0.setFieldValue('work_pkg_bids.cost_bid', cost_contract);
		if (!this.projMngPkgProfContrAdd_form0.save()) return;
		
		this.updateWorkPackage(this.projMngPkgProfContrAdd_form0.getRecord());
		
		this.projMngPkgProfContrAddTabs.selectTab('projMngPkgProfContrAddTab2', this.projMngPkgProfContrAdd_form0.getFieldRestriction());
	},
	
	updateWorkPackage: function(record) {
		var openerController = View.getOpenerView().controllers.get('projMngPkgProf');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', record.getValue('work_pkg_bids.project_id'));
		restriction.addClause('work_pkgs.work_pkg_id', record.getValue('work_pkg_bids.work_pkg_id'));
		var record = openerController.projMngPkgProfDs0.getRecord(restriction);
		record.setValue('work_pkgs.status', 'Approved-Bids Award');
		openerController.projMngPkgProfDs0.saveRecord(record);
		openerController.projMngPkgProf_workpkgForm.refresh();
	},
	
	projMngPkgProfContrAdd_form1_onSave : function() {
		var cost_contract = this.projMngPkgProfContrAdd_form1.getFieldValue('work_pkg_bids.cost_contract');
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
		this.projMngPkgProfContrAdd_form1.setFieldValue('work_pkg_bids.status','Contract Signed');
		if (!this.projMngPkgProfContrAdd_form1.save()) return;
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

function projMngPkgProfContrAdd_onSelValVn() {
	View.openDialog('ab-proj-mng-pkg-bids-add-vn.axvw', null, false, {
		callback: function(vn_id) {
	        var controller = View.controllers.get('projMngPkgProfContrAdd')
	        controller.projMngPkgProfContrAdd_form0.setFieldValue('work_pkg_bids.vn_id', vn_id);
	    }
	});
}