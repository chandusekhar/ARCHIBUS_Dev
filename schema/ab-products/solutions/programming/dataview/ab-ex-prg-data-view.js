
/**
 * Example controller class.
 */
var dataViewController = View.createController('dataView', {
    
	/**
	 * Open the DataView content table in Excel:
	 * - send the DataView HTML table to a standard WFR; 
	 * - WFR saves HTML to a temp file using the given extension and returns the file URL;
	 * - open the URL in a new window.
	 */
	prgDataView_myRequestsConsole_onExport: function() {
		var exportXLSParams = {
			html: "<HTML><BODY>" + this.prgDataView_myRequests.dataView.getContentBuffer() + "</BODY></HTML>",
			fileExtension: 'xls'
		};
		try	{
			var result = Workflow.call('AbCommonResources-writeHTMLtoFile', exportXLSParams);
			var excelWindow = window.open(result.data.exportFileName, 'exportWindow');			
		}
		catch (e) {
            Workflow.handleError(e);
		}
	}
});