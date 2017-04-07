// CHANGE LOG
// 2016-02-09 - MSHUSSAI - WR365590 - Added function openWRDetailsNew in order to enable linking with all the fields in the grid

var SubRequestsController = View.createController('SubRequestsController', {
	firstLoad: true,	// variable to flag if the View is first loaded.
	
	afterInitialDataFetch: function() {
		this.inherit();

	},
	
	costsSummaryPanel_afterRefresh: function() {
		// When the tab is refreshed by the parent, only the "main" (first) panel
		// is refreshed.  So we will refresh the other panels after the main panel
		// refreshes.
		//
		// This is done here instead of "afterInitialDataFetch" because
		// View.restriction is null during that event.
		
		var rest = View.restriction;
		var cftableRest = "EXISTS(SELECT 1 FROM wr WHERE wr.wr_id = wrcf.wr_id AND "+rest+")"
		var tltableRest = "EXISTS(SELECT 1 FROM wr WHERE wr.wr_id = wrtl.wr_id AND "+rest+")"
		var othertableRest = "EXISTS(SELECT 1 FROM wr WHERE wr.wr_id = wr_other.wr_id AND "+rest+")"
		
		this.wrcfReportGrid.refresh(cftableRest);
		this.wrtlReportGrid.refresh(tltableRest);
		this.wrOtherReportGrid.refresh(othertableRest);
		this.subReqGrid.refresh(rest);

	},
	
	/*subReqGrid_onOpenSubRequest: function(row)
	{
		var wr_id = row['wr.wr_id']; //row.getFieldValue('wr.wr_id');
		detailsAxvw = "uc-wr-manager-details.axvw?wrId="+wr_id;
		View.getControl('','wr_details_frame').frame.dom.contentWindow.location.href = detailsAxvw;
	},*/

});

function openWRDetailsNew(row) 
{
		var wr_id = row['wr.wr_id']; //row.getFieldValue('wr.wr_id');
		detailsAxvw = "uc-wr-manager-details.axvw?wrId="+wr_id;
		View.getControl('','wr_details_frame').frame.dom.contentWindow.location.href = detailsAxvw;	
}
	
function openPrintoutWindow()
{
	var form = View.getControl('', 'costsSummaryPanel');
	var wo_id = form.getFieldValue('wo.wo_id');	
	window.open('uc-wr-manager-wr-print-invoice-package.axvw?handler=com.archibus.config.ActionHandlerDrawing&wo.wo_id='+wo_id, 'newWindow', 'width=400, height=400, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');

}