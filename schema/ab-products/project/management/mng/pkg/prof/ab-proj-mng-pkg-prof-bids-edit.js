var projMngPkgProfBidsEditController = View.createController('projMngPkgProfBidsEdit',{
	
	afterInitialDataFetch: function() {
		var status = this.projMngPkgProfBidsEdit_form1.getFieldValue('work_pkg_bids.status');
		for (var i = 4; i < 12; i++) {
			this.projMngPkgProfBidsEdit_form1.getFieldElement('work_pkg_bids.status').options[i].setAttribute("disabled", "true");
		}
		if (status != 'Created') this.projMngPkgProfBidsEdit_form1.getFieldElement('work_pkg_bids.status').options[0].setAttribute("disabled", "true");
	},
	
	projMngPkgProfBidsEdit_form1_onSubmit : function() {
		var date = new Date();
		var currentDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
		this.projMngPkgProfBidsEdit_form1.setFieldValue('work_pkg_bids.status', 'Submitted');
		this.projMngPkgProfBidsEdit_form1.setFieldValue('work_pkg_bids.date_submitted', currentDate);
		if (!this.projMngPkgProfBidsEdit_form1.save()) return;
		View.getOpenerView().panels.get('projMngPkgProf_bidsGrid').refresh();
		View.closeThisDialog();
	},
	
	projMngPkgProfBidsEdit_form1_onWithdraw : function() {
		this.projMngPkgProfBidsEdit_form1.setFieldValue('work_pkg_bids.status', 'Withdrawn');
		if (!this.projMngPkgProfBidsEdit_form1.save()) return;
		View.getOpenerView().panels.get('projMngPkgProf_bidsGrid').refresh();
		View.closeThisDialog();
	}
});

function projMngPkgProfBidsEdit_onSelValVn() {
	View.openDialog('ab-proj-mng-pkg-bids-add-vn.axvw', null, false, {
		callback: function(vn_id) {
	        var controller = View.controllers.get('projMngPkgProfBidsEdit')
	        controller.projMngPkgProfBidsEdit_form1.setFieldValue('work_pkg_bids.vn_id', vn_id);
	    }
	});
}