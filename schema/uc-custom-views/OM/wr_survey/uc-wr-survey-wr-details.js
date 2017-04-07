function openInvoiceWindow()
{
	var form = View.getControl('', 'invoicePanel');
	var wr_id = form.getFieldValue('wr.wr_id');
	if (wr_id == '') {
		wr_id = form.getFieldValue('hwr.wr_id');
		window.open('uc-wr-manager-hwr-print-invoice.axvw?handler=com.archibus.config.ActionHandlerDrawing&hwr.wr_id='+wr_id+'&hwrcf.wr_id='+wr_id, 'newWindow', 'width=400, height=400, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
	}
	else {
		window.open('uc-wr-manager-print-invoice.axvw?handler=com.archibus.config.ActionHandlerDrawing&wr.wr_id='+wr_id+'&wrcf.wr_id='+wr_id, 'newWindow', 'width=400, height=400, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
	}
}

var InvoiceTabController = View.createController('invoiceTabController', {
	firstLoad: true,	// variable to flag if the View is first loaded.
	afterViewLoad: function() {

	},
	
	afterInitialDataFetch: function() {
		alert("Hello");
		var wr_id = window.location.parameters['wrId'];
		rest = "wr_id='"+wr_id+"'"
		this.invoicePanel.refresh(rest);
		
		//this.wrcfReportGrid.refresh(rest);
		//this.wrOtherReportGrid.refresh(rest);
		//this.wrtlReportGrid.refresh(rest);
		this.wrHistReportGrid.refresh(rest);
	},
	
	invoicePanel_afterRefresh: function() {
	}
});