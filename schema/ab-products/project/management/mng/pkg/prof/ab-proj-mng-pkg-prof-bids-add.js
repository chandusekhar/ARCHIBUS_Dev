var projMngPkgProfBidsAddController = View.createController('projMngPkgProfBidsAdd',{
	
	projMngPkgProfBidsAdd_form1_onSubmit : function() {
		var date = new Date();
		var currentDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
		this.projMngPkgProfBidsAdd_form1.setFieldValue('work_pkg_bids.status', 'Submitted');
		this.projMngPkgProfBidsAdd_form1.setFieldValue('work_pkg_bids.date_submitted', currentDate);
		if (!this.projMngPkgProfBidsAdd_form1.save()) return;
		View.getOpenerView().panels.get('projMngPkgProf_bidsGrid').refresh();
		View.closeThisDialog();
	},
	
	projMngPkgProfBidsAdd_form1_onWithdraw : function() {
		this.projMngPkgProfBidsAdd_form1.setFieldValue('work_pkg_bids.status', 'Withdrawn');
		if (!this.projMngPkgProfBidsAdd_form1.save()) return;
		View.getOpenerView().panels.get('projMngPkgProf_bidsGrid').refresh();
		View.closeThisDialog();
	}
});

function projMngPkgProfBidsAdd_onSelValVn() {
	View.openDialog('ab-proj-mng-pkg-bids-add-vn.axvw', null, false, {
		callback: function(vn_id) {
	        var controller = View.controllers.get('projMngPkgProfBidsAdd')
	        controller.projMngPkgProfBidsAdd_form0.setFieldValue('work_pkg_bids.vn_id', vn_id);
	    }
	});
}