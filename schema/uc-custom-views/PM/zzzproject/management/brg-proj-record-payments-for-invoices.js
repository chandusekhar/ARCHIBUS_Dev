var view_project_id = '';

function user_form_onload()
{
	if($('westPanel_head'))
	{	
		// project_id has been passed in by mc
		if (view_project_id == '')
		{
			var objConsoleFrame = getFrameObject(window, "consoleFrameMC");
			if (objConsoleFrame != null) {
				view_project_id = objConsoleFrame.mc_project_id;
			}
		}
		if (view_project_id != '') {
			var restriction = new AFM.view.Restriction();
	        restriction.addClause('invoice.project_id', view_project_id, '=');
			var targetPanel = AFM.view.View.getControl('', 'westPanel');
			if(targetPanel) 
			{	
				targetPanel.restriction = restriction;
				targetPanel.refresh();
				targetPanel.show(true);
			}
		}
	}
}

function selectTab2(context)
{
	var tabsFrame = getFrameObject(parent,'tabsFrameDetails');
	tabsFrame.setTabVisible('page2',true);
	tabsFrame.setTabVisible('page3',true);
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	tabsFrame.restriction = rowRestriction;
	var invoice_id = rowRestriction['invoice.invoice_id'];
	var amount_tot_invoice = this['invoice.amount_tot_invoice'];
	var invoiceAmount = getMessage('invoiceAmount');
	tabsFrame.setTabTitle('page2',invoice_id + " - " + invoiceAmount +": "+ amount_tot_invoice);	
	tabsFrame.selectTab('page2');
}

function openDetails(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	var invoice_id = rowRestriction['invoice.invoice_id'];
	openDetailsDialog(invoice_id);	
}

function openDetailsPage2()
{
	var northPanel = AFM.view.View.getControl('northFrame','northPanel');
	var invoice_id = northPanel.restriction['invoice.invoice_id'];
	openDetailsDialog(invoice_id);
}

function openDetailsDialog(invoiceId)
{
	var restriction = "invoice_id = \'"+invoiceId+"\'";
	var strXMLSQLTransaction = '<afmAction type="render" state="brg-proj-invoices-and-payments-details.axvw" response="true">';
	strXMLSQLTransaction += '<restrictions><userInputRecordsFlag><restriction type="sql" sql="'+restriction+'">';
	strXMLSQLTransaction += '</restriction></userInputRecordsFlag></restrictions>';
	strXMLSQLTransaction += '</afmAction>';
	var newTargetWindowName		= "newTargetWindow";
	var newTargetWindowSettings = "titlebar=no,toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=600,height=350";
	var newWindowObj			= window.open("", newTargetWindowName, newTargetWindowSettings);
	newWindowObj.moveTo(10,10);
	var strTarget = newTargetWindowName;
	sendingDataFromHiddenForm('',strXMLSQLTransaction, strTarget, '',false,'');	
}

function applyPaymentToVendorInvoice()
{
	var northPanel = AFM.view.View.getControl('northFrame','northPanel');
	var invoice_id = northPanel.restriction['invoice.invoice_id'];
	var parameters = {'invoice.invoice_id':invoice_id};
	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-applyPaymentToVendorInvoice', parameters);
	if (result.code == 'executed') {
		northPanel.refresh();	
  	} 
  	else 
  	{
    	alert(result.code + " :: " + result.message);
  	}
}

function setPanelTitle()
{
	var title = getMessage('panelTitle');
	var detailsPanel = AFM.view.View.getControl('detailsFrame','detailsPanel');
	var payment_id = detailsPanel.getFieldValue('invoice_payment.payment_id');
	var detailsFrame = getFrameObject(parent, 'detailsFrame');
	var titleElement = detailsFrame.$('detailsPanel_head').firstChild.firstChild.firstChild;
	if (titleElement)
	{
		if (payment_id != '') 
			titleElement.innerHTML = title + " - " + payment_id;
		else 
			titleElement.innerHTML = title;
	}
}

function paymentDetailsBeforeSave(form)
{
	var contSave = true;
	
	var reviewed = form.getFieldValue("invoice_payment.reviewed");
	if (reviewed == '1')
	{
		// Ensure that activity_log_id is filled before setting the "reviewed" flag.
		var activity_log_id = form.getFieldValue("invoice_payment.activity_log_id");
		if (activity_log_id == "") {
			contSave = false;
			alert("The Activity Log ID must be filled before the payment can be considered Reviewed.");
			form.setFieldValue("invoice_payment.reviewed", '0', '0');
		}
	}
	
	return contSave;
}

