var SubRequestsController = View.createController('SubRequestsController', {
	firstLoad: true,	// variable to flag if the View is first loaded.

	afterInitialDataFetch: function() {
		this.inherit();

	}
});

function openPrintoutWindow()
{
	var form = View.getControl('', 'costsSummaryPanel');
	var wo_id = form.getFieldValue('wo.wo_id');
	window.open('uc-wr-manager-wr-print-invoice-package.axvw?handler=com.archibus.config.ActionHandlerDrawing&wo.wo_id='+wo_id, 'newWindow', 'width=400, height=400, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');

}