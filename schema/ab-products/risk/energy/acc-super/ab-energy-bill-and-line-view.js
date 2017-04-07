function refreshReport(){
    //refresh billLineGrid
    var billsGrid = View.panels.get('billsGrid');
    var billId = billsGrid.rows[billsGrid.selectedRowIndex]["bill.bill_id"];
    var vendorId = billsGrid.rows[billsGrid.selectedRowIndex]["bill.vn_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("bill_line.bill_id", billId, "=");
    restriction.addClause("bill_line.vn_id", vendorId, "=");
    View.panels.get('billLinesReport').refresh(restriction);
    //set panel titles
    var title = getMessage("billFormTitle").replace("<{0}>", billId);
    setPanelTitle("billForm", title);
    title = getMessage("billLinesReportTitle").replace("<{0}>", billId);
    setPanelTitle("billLinesReport", title);
}
/**
 * Print Bill
 * Print Paginated Report of Bill and its lines
 */
 
function printBill(){
		//a paginated view name 
		var reportViewName = "ab-energy-bill-print.axvw";
		var panel = View.getControl('', 'billForm');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bill.bill_id', panel.getFieldValue('bill.bill_id'), '=');
		restriction.addClause('bill.vn_id', panel.getFieldValue('bill.vn_id'), '=');
		
		var anotherRestriction = new Ab.view.Restriction();
		anotherRestriction.addClause('bill_line.bill_id', panel.getFieldValue('bill.bill_id'), '=');
		anotherRestriction.addClause('bill_line.vn_id', panel.getFieldValue('bill.vn_id'), '=');
		
		//paired dataSourceId with Restriction objects
		var passedRestrictions = {'ds_bill': restriction, 'ds_bill_line': anotherRestriction};
		
		//parameters
		var parameters = null;
		
		//passing restrictions
		View.openPaginatedReportDialog(reportViewName, passedRestrictions, parameters);	
	}
