function addParametersToInvoicePanel(groupByField,groupByValue){
	var panel = View.panels.get("abRplmRcblInvForCommon_invoices");
	panel.addParameter("groupByFieldRestriction","invoice."+groupByField+" = '"+groupByValue+"'");
	panel.addParameter("groupByField",groupByField);
}

function refreshInvoicePanel(){
	var panel = View.panels.get("abRplmRcblInvForCommon_invoices");
   	if(panel.parameters["groupByField"]!=null){
		panel.refresh();
   	}
}

function refreshCostPanel(){
	var panel = View.panels.get("abRplmRcblInvForCommon_costs");
    if(valueExistsNotEmpty(panel.parameters["invoice_id"])){
    	panel.refresh();
    }
}

function loadInvoicesPanel(row, controllerId){
	var controller = View.controllers.get(controllerId);
	var groupByField = controller.groupByField;
	var groupByTable = controller.groupByTable;
	
	var groupByValue = row[groupByTable+'.'+groupByField];
	var queryParameter = "invoice."+groupByField+" = '"+groupByValue+"'";

	controller.setGroupByValue(groupByValue);
	
	var invoicePanel = View.panels.get("abRplmRcblInvForCommon_invoices");
	invoicePanel.addParameter("groupByFieldRestriction", queryParameter);
	invoicePanel.refresh();
	
	initCostPanel();
}

function loadCostsPanel(row, controllerId){
	var controller = View.controllers.get(controllerId);
	var invoice_id = row['invoice.invoice_id'];
	var queryParameter = "cost_tran.invoice_id = '"+invoice_id+"'";
	
	controller.invoice_id = invoice_id;
	
	costPanel = View.panels.get("abRplmRcblInvForCommon_costs");
	costPanel.addParameter('invoice_id',queryParameter);
	costPanel.refresh();
}

function initInvoicePanel(groupByField){
	var panel = View.panels.get("abRplmRcblInvForCommon_invoices");
	panel.addParameter(groupByField,"invoice."+groupByField+" = ''");
	panel.refresh();
	panel.setFieldLabel("invoice.groupingField", getMessage(groupByField + "_label"));
}

function initCostPanel(){
	var panel = View.panels.get("abRplmRcblInvForCommon_costs");
	panel.addParameter('invoice_id',"cost_tran.invoice_id = '-1'");
	panel.refresh();
}
