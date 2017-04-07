var projReviewWorkPkgsOutForBidEditController = View.createController('projReviewWorkPkgsOutForBidEdit', {

	projReviewWorkPkgsOutForBidEdit_form_onSubmit : function() {
		var vn_id = this.projReviewWorkPkgsOutForBidEdit_form.getFieldValue('work_pkg_bids.vn_id');
		var message = String.format(getMessage('confirmSubmit'), vn_id);

        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
                controller.projReviewWorkPkgsOutForBidEdit_form.setFieldValue('work_pkg_bids.status', 'Submitted');
                controller.projReviewWorkPkgsOutForBidEdit_form.setFieldValue('work_pkg_bids.date_submitted', new Date());
                controller.projReviewWorkPkgsOutForBidEdit_form.save();
        		var openerController = View.getOpenerView().controllers.get('projReviewWorkPkgsOutForBid');
        		openerController.projReviewWorkPkgsOutForBid_bidReport.refresh();
        		View.closeThisDialog();
            }
        });
	}
});
