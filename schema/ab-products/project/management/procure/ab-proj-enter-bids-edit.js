var projEnterBidsEditController = View.createController('projEnterBidsEdit',{
	
	afterInitialDataFetch : function() {
		if (this.projEnterBidsEdit_page1Form.newRecord != true) {
			this.projEnterBidsEdit_tabs.selectTab('projEnterBidsEdit_page2');
			var status = this.projEnterBidsEdit_page2Form.getFieldValue('work_pkg_bids.status');
			if (status == 'Submitted' || status == 'Submitted-InReview') {
				this.projEnterBidsEdit_page2Form.show(false);
				this.projEnterBidsEdit_page2SubmittedBidForm.show(true);
				$('projEnterBidsEdit_page3_status').value = status;
			}
			else {
				this.projEnterBidsEdit_page2Form.show(true);
				this.projEnterBidsEdit_page2SubmittedBidForm.show(false);
			}
		}
	},
	
	projEnterBidsEdit_page2SubmittedBidForm_onSaveStatusChange : function() {
		var status = $('projEnterBidsEdit_page3_status').value;
		this.projEnterBidsEdit_page2SubmittedBidForm.setFieldValue('work_pkg_bids.status', status);
		this.projEnterBidsEdit_page2SubmittedBidForm.save();
		View.getOpenerView().panels.get('projEnterBidsGrid').refresh();
		View.closeThisDialog();
	},
	
	projEnterBidsEdit_page2Form_onSubmit : function() {
		this.projEnterBidsEdit_page2Form.setFieldValue('work_pkg_bids.status', 'Submitted');
		this.projEnterBidsEdit_page2Form.setFieldValue('work_pkg_bids.date_submitted', new Date());
		this.projEnterBidsEdit_page2Form.save();
		View.getOpenerView().panels.get('projEnterBidsGrid').refresh();
		View.closeThisDialog();
	},
	
	projEnterBidsEdit_page2Form_onWithdraw : function() {
		this.projEnterBidsEdit_page2Form.setFieldValue('work_pkg_bids.status', 'Withdrawn');
		this.projEnterBidsEdit_page2Form.save();
		View.getOpenerView().panels.get('projEnterBidsGrid').refresh();
		View.closeThisDialog();
	}
});