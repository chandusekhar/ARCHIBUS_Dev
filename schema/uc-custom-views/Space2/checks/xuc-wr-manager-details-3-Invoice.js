function openInvoiceWindow()
{
	var form = View.getControl('', 'invoicePanel');
	var wr_id = form.getFieldValue('wr.wr_id');	
	window.open('uc-wr-manager-print-invoice.axvw?handler=com.archibus.config.ActionHandlerDrawing&wr.wr_id='+wr_id+'&wrcf.wr_id='+wr_id, 'newWindow', 'width=400, height=400, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');

}

var InvoiceTabController = View.createController('invoiceTabController', {
	firstLoad: true,	// variable to flag if the View is first loaded.
	
	afterInitialDataFetch: function() {
		this.inherit();
	},
	
	invoicePanel_afterRefresh: function() {
		// When the tab is refreshed by the parent, only the "main" (first) panel
		// is refreshed.  So we will refresh the other panels after the main panel
		// refreshes.
		//
		// This is done here instead of "afterInitialDataFetch" because
		// View.restriction is null during that event.
			
		var rest = View.restriction;
		this.wrcfReportGrid.refresh(rest);
		this.wrOtherReportGrid.refresh(rest);
		this.wrtlReportGrid.refresh(rest);
	}
});