var viewProratedAggregated = View.createController('viewProratedAggregated', {
	
	afterViewLoad: function() {
	    this.addRadioButtonEventListeners('billType', this.onSelectRuleType);
	    this.addRadioButtonEventListeners('approved', this.onSelectBillTable);
	    var res = "(bill.prorated_aggregated = 'PRORATED-TIME' AND bill.reference_bill_id IS NOT NULL) OR bill.prorated_aggregated = 'AGGREGATED'";
	    this.billsGrid.restriction = res;
    },
    
    
    onSelectRuleType: function(radioButton) {
    	if (radioButton.checked) {
    	    var billType = radioButton.value;
    	    var radio = document.getElementsByName("approved");
    		var selectedValue = "";
    	    for(var i=0; i<radio.length; i++) {                
    	        if(radio[i].checked) { 
    				selectedValue = radio[i].value;
    				break;
    	    	}
    		}
    	    this.changeBillTable(billType,selectedValue);
    	}
    },
    
    onSelectBillTable: function(radioButton) {
    	if (radioButton.checked) {
    	    var selectedValue = radioButton.value;
    	    var radio = document.getElementsByName("billType");
    		var billType = "";
    	    for(var i=0; i<radio.length; i++) {                
    	        if(radio[i].checked) { 
    	        	billType = radio[i].value;
    				break;
    	    	}
    		}   	    
    	    this.changeBillTable(billType,selectedValue);
    	}
    },
    
    changeBillTable:function(billType,selectedValue){
    	var res = "";
    	this.billForm.show(false);
    	this.billFormArchive.show(false);
    	this.parentBillForm.show(false);
    	this.parentBillFormArchive.show(false);
    	this.sourceBillGrid.show(false);
    	this.sourceBillGridArchive.show(false);
    	this.billLinesReport.show(false);
    	this.billLinesReportArchive.show(false);
 	    if(selectedValue == "pending"){
	    	    if (billType == "pro_agg") {
	    	    	res = "(bill.prorated_aggregated = 'PRORATED-TIME' AND bill.reference_bill_id IS NOT NULL) OR bill.prorated_aggregated = 'AGGREGATED'";
	    	    }else{
	    	    	res = "bill.prorated_aggregated = 'PRORATED-LOCATION' AND bill.reference_bill_id IS NOT NULL AND (EXISTS (SELECT 1 FROM bill b WHERE b.bill_id = bill.reference_bill_id) OR EXISTS (SELECT 1 FROM bill_archive ba WHERE ba.bill_id = bill.reference_bill_id ))";
	    	    }
	    	    this.billsGridArchive.show(false);
	    	    this.billsGrid.refresh(res);
 	    }else{
 	    	if (billType == "pro_agg") {
	    	    	res = "(bill_archive.prorated_aggregated = 'PRORATED-TIME' AND bill_archive.reference_bill_id IS NOT NULL) OR bill_archive.prorated_aggregated = 'AGGREGATED'";
	    	    }else{
	    	    	res = "bill_archive.prorated_aggregated = 'PRORATED-LOCATION' AND bill_archive.reference_bill_id IS NOT NULL AND (EXISTS (SELECT 1 FROM bill_archive ba WHERE ba.bill_id = bill_archive.reference_bill_id ) OR EXISTS (SELECT 1 FROM bill b WHERE b.bill_id = bill_archive.reference_bill_id))";
	    	    }
	    	    this.billsGrid.show(false);
	    	    this.billsGridArchive.refresh(res);
 	    }
    },
    
    addRadioButtonEventListeners: function(radioButtonName, method) {
	    var radioButtons = document.getElementsByName(radioButtonName);
        for (i = 0; i < radioButtons.length; i++) {
        	var radioButton = radioButtons[i];
        	Ext.get(radioButton).on('click', method.createDelegate(this, [radioButton]));
        }
    },
    
    sourceBillGridArchive_onClickItem: function (row) {
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("bill_line_archive.bill_id", row.getFieldValue("bill_archive.bill_id"), "=");
    	restriction.addClause("bill_line_archive.vn_id", row.getFieldValue("bill_archive.vn_id"), "=");
    	title = getMessage("sourceBillLine").replace("<{0}>", row.getFieldValue("bill_archive.bill_id"));
    	setPanelTitle("billLinesReportArchivePopUp", title);
    	this.billLinesReportArchivePopUp.refresh(restriction);
    	this.billLinesReportArchivePopUp.showInWindow({
    	 	x: 200,
    	    y: 200, 
    	    width: 800,
    	    height: 300
     });
    },
    
    sourceBillGrid_onClickItem: function (row) {
    	 var restriction = new Ab.view.Restriction();
         restriction.addClause("bill_line.bill_id", row.getFieldValue("bill.bill_id"), "=");
         restriction.addClause("bill_line.vn_id", row.getFieldValue("bill.vn_id"), "=");
         title = getMessage("sourceBillLine").replace("<{0}>", row.getFieldValue("bill.bill_id"));
         setPanelTitle("billLinesReportPopUp", title);
         this.billLinesReportPopUp.refresh(restriction);
         this.billLinesReportPopUp.showInWindow({
        	 	x: 200,
        	    y: 200, 
        	    width: 800,
        	    height: 300
         });
    }
    
});


function refreshReport(){
    //refresh billLineGrid
    var billsGrid = View.panels.get('billsGrid');
    var billForm = View.panels.get('billForm');
    var parentBillForm = View.panels.get('parentBillForm');
    var parentBillFormArchive = View.panels.get('parentBillFormArchive');
    var sourceBillGrid = View.panels.get('sourceBillGrid');
    var sourceBillGridArchive = View.panels.get('sourceBillGridArchive');
    var billId = billsGrid.rows[billsGrid.selectedRowIndex]["bill.bill_id"];
    var vendorId = billsGrid.rows[billsGrid.selectedRowIndex]["bill.vn_id"];
    var billType = billsGrid.rows[billsGrid.selectedRowIndex]["bill.prorated_aggregated.raw"];
    var referenceBillId = billsGrid.rows[billsGrid.selectedRowIndex]["bill.reference_bill_id"];
    var res = new Ab.view.Restriction();
    res.addClause("bill.bill_id", referenceBillId, "=");
    res.addClause("bill.vn_id", vendorId, "=");
    parentBillFormArchive.show(false);
    View.panels.get('billLinesReportArchive').show(false);
    if(billType == "AGGREGATED"){
    	sourceBillGridArchive.show(false);
    	View.panels.get('billLinesReport').show(false);
    	parentBillForm.show(false);
    	title = getMessage("aggBill").replace("<{0}>", billId);
    	setPanelTitle("billForm", title); 
    	title = getMessage("sourceBill");
        setPanelTitle("sourceBillGrid", title); 
        title = getMessage("parentBill").replace("<{0}>", referenceBillId);
        setPanelTitle("parentBillForm", title)
         var res = new Ab.view.Restriction();
        res.addClause("bill.reference_bill_id", billId, "=");
        res.addClause("bill.vn_id", vendorId, "=");
        sourceBillGrid.refresh(res);
        if(sourceBillGrid.getDataRows().length == 0){
        	sourceBillGrid.show(false);
        	sourceBillGrid = View.panels.get('sourceBillGridArchive');
        	title = getMessage("sourceBill");
        	setPanelTitle("sourceBillGridArchive", title);
        	res = new Ab.view.Restriction();
            res.addClause("bill_archive.reference_bill_id", billId, "=");
            res.addClause("bill_archive.vn_id", vendorId, "=");
            sourceBillGrid.refresh(res);
        }
    }else{
    	if(billType == "PRORATED-TIME"){
        	title = getMessage("proBill").replace("<{0}>", billId);
            setPanelTitle("billForm", title);
    	}else{
    		title = getMessage("multBill").replace("<{0}>", billId);
        	setPanelTitle("billForm", title);
    	}   	
    	sourceBillGrid.show(false);
    	sourceBillGridArchive.show(false);
    	title = getMessage("proBill").replace("<{0}>", billId);
        setPanelTitle("billForm", title); 
        title = getMessage("parentBill").replace("<{0}>", referenceBillId);
        setPanelTitle("parentBillForm", title)
        parentBillForm.refresh(res);
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bill_line.bill_id", referenceBillId, "=");
        restriction.addClause("bill_line.vn_id", vendorId, "=");
        View.panels.get('billLinesReport').refresh(restriction);
        title = getMessage("parentBillLine").replace("<{0}>", referenceBillId);
        setPanelTitle("billLinesReport", title);
        if( !valueExistsNotEmpty(parentBillForm.getFieldValue("bill.bill_id")) ){
        	var res = new Ab.view.Restriction();
            res.addClause("bill_archive.bill_id", referenceBillId, "=");
            res.addClause("bill_archive.vn_id", vendorId, "=");
        	parentBillForm.show(false);
        	View.panels.get('billLinesReport').show(false);
            title = getMessage("parentBill").replace("<{0}>", referenceBillId);
            setPanelTitle("parentBillFormArchive", title)
            parentBillFormArchive.refresh(res);
            var restriction = new Ab.view.Restriction();
            restriction.addClause("bill_line_archive.bill_id", referenceBillId, "=");
            restriction.addClause("bill_line_archive.vn_id", vendorId, "=");
            View.panels.get('billLinesReportArchive').refresh(restriction);
            title = getMessage("parentBillLine").replace("<{0}>", referenceBillId);
            setPanelTitle("billLinesReportArchive", title);
        	}
    	}
    }

function refreshReportArchive(){
    //refresh billLineGridArchive
    var billsGrid = View.panels.get('billsGridArchive');
    var billForm = View.panels.get('billFormArchive');
    var parentBillForm = View.panels.get('parentBillFormArchive');
    var sourceBillGrid = View.panels.get('sourceBillGridArchive');
    var billId = billsGrid.rows[billsGrid.selectedRowIndex]["bill_archive.bill_id"];
    var vendorId = billsGrid.rows[billsGrid.selectedRowIndex]["bill_archive.vn_id"];
    var billType = billsGrid.rows[billsGrid.selectedRowIndex]["bill_archive.prorated_aggregated.raw"];
    var referenceBillId = billsGrid.rows[billsGrid.selectedRowIndex]["bill_archive.reference_bill_id"];
    var res = new Ab.view.Restriction();
    res.addClause("bill_archive.bill_id", referenceBillId, "=");
    if(billType == "AGGREGATED"){
    	View.panels.get('billLinesReportArchive').show(false);
    	parentBillForm.show(false);
    	title = getMessage("aggBill").replace("<{0}>", billId);
    	setPanelTitle("billFormArchive", title); 
    	title = getMessage("sourceBill");
        setPanelTitle("sourceBillGridArchive", title); 
        title = getMessage("parentBill").replace("<{0}>", referenceBillId);
        setPanelTitle("parentBillFormArchive", title)
         var res = new Ab.view.Restriction();
        res.addClause("bill_archive.reference_bill_id", billId, "=");
        res.addClause("bill_archive.vn_id", vendorId, "=");
        sourceBillGrid.refresh(res);
    }else{
    	if(billType == "PRORATED-TIME"){
        	title = getMessage("proBill").replace("<{0}>", billId);
            setPanelTitle("billFormArchive", title);
    	}else{
    		title = getMessage("multBill").replace("<{0}>", billId);
        	setPanelTitle("billFormArchive", title);
    	}
    	sourceBillGrid.show(false);
    	title = getMessage("proBill").replace("<{0}>", billId);
        setPanelTitle("billFormArchive", title); 
        title = getMessage("parentBill").replace("<{0}>", referenceBillId);
        setPanelTitle("parentBillFormArchive", title)
        parentBillForm.refresh(res);
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bill_line_archive.bill_id", referenceBillId, "=");
        restriction.addClause("bill_line_archive.vn_id", vendorId, "=");
        View.panels.get('billLinesReportArchive').refresh(restriction);
        title = getMessage("parentBillLine").replace("<{0}>", referenceBillId);
        setPanelTitle("billLinesReportArchive", title);
    	}
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

