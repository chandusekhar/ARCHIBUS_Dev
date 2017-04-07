var projReviewWorkPkgsOutForBidReportController = View.createController('projReviewWorkPkgsOutForBidReport', {
	
	projReviewWorkPkgsOutForBidReport_form_onWithdraw : function() {
		this.projReviewWorkPkgsOutForBidReport_form.setFieldValue('work_pkg_bids.status','Withdrawn');
		this.projReviewWorkPkgsOutForBidReport_form.save();
		var openerController = View.getOpenerView().controllers.get('projReviewWorkPkgsOutForBid');
		openerController.projReviewWorkPkgsOutForBid_bidReport.refresh();
		View.closeThisDialog();
	}
});


