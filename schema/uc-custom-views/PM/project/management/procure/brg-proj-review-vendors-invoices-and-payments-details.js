var projReviewVendorsInvoicesPaymentsDetailsController = View.createController('projReviewVendorsInvoicesPaymentsDetails', {
	
	afterInitialDataFetch : function() {
		var restriction = this.projReviewVendorsInvoicesPaymentsDetailsColumnReport.restriction;
		this.projReviewVendorsInvoicesPaymentsDetailsGrid.refresh(restriction);
	}
});
