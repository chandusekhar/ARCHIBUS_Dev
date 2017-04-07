function user_form_onload()
{
	var form = AFM.view.View.getControl('', 'edit_panel');

	if (form != undefined && form != null) {
		var work_pkg_id = form.getFieldValue('invoice.work_pkg_id');
		var work_pkg;

		// auto-fill info
		if (form.getFieldValue('invoice.po') == "")
		{
			work_pkg = getDataValues('work_pkgs', ['work_pkg_id', 'po', 'int_num'], "work_pkg_id='"+replaceSingleQuote(work_pkg_id)+"'");
			form.setFieldValue('invoice.po', work_pkg['work_pkgs.po']);
		}
		
		if (form.getFieldValue('invoice.int_num') == "")
		{
			if (work_pkg == null) {
				work_pkg = getDataValues('work_pkgs', ['work_pkg_id', 'po', 'int_num'], "work_pkg_id='"+replaceSingleQuote(work_pkg_id)+"'");
			}
			
			form.setFieldValue('invoice.int_num', work_pkg['work_pkgs.int_num']);
			
			// get from project if still null
			if (form.getFieldValue('invoice.int_num') == "")
			{
				work_pkg = getDataValues('project', ['project_id', 'int_num'], "project_id='"+replaceSingleQuote(form.getFieldValue('invoice.project_id'))+"'");
				form.setFieldValue('invoice.int_num', work_pkg['project.int_num']);
			}
		}
	}
}


function refreshOpener()
{
	parent.opener.refreshNorthPanel();
}

function closeDialogAndRefreshOpener()
{
	parent.opener.closeInvoiceDialog();
}

function closeInvoiceDialog()
{
	AFM.view.View.closeDialog();
	refreshPanels();
}

function beforeSaveForm()
{	
	var form = AFM.view.View.getControl('', 'edit_panel'); 
	var curDate = new Date();
	var date_expected_rec = getDateObject(form.getFieldValue('invoice.date_expected_rec'));//note that getFieldValue returns date in ISO format
	if ((curDate - date_expected_rec)/(1000*60*60*24) >= 1){
    	if (!confirm(getMessage('dateBeforeCurrent'))) return false;
	}
    return true;
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

function issueInvoiceFromRow(context)
{
	var northPanel = AFM.view.View.getControl('northFrame', 'northPanel');
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);	
	var invoiceId = rowRestriction['invoice.invoice_id'];	
	if (issueInvoice(invoiceId)) refreshPanels();
}

function withdrawInvoiceFromRow(context)
{
	var northPanel = AFM.view.View.getControl('northFrame', 'northPanel');
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);	
	var invoiceId = rowRestriction['invoice.invoice_id'];
	if (withdrawInvoice(invoiceId)) refreshPanels();
}

function refreshPanels()
{
	var northPanel = AFM.view.View.getControl('northFrame', 'northPanel');
    northPanel.refresh();
   	northPanel.show(true);
   	var detailsPanel = AFM.view.View.getControl('detailsFrame', 'detailsPanel');
   	detailsPanel.refresh();
   	detailsPanel.show(true);
}

function refreshNorthPanel()
{
	var northPanel = AFM.view.View.getControl('northFrame', 'northPanel');
    northPanel.refresh();
   	northPanel.show(true);	
}

function issueInvoiceFromPanel()
{
	var invoiceId = $('invoice.invoice_id').value;
	if (issueInvoice(invoiceId)) closeDialogAndRefreshOpener();	
}

function withdrawInvoiceFromPanel()
{
	var invoiceId = $('invoice.invoice_id').value;	
	if (withdrawInvoice(invoiceId)) closeDialogAndRefreshOpener();	
}

function issueInvoice(invoice_id)
{	
	if(!confirm(getMessage('issueWarning'))) return;
		
	var record = "<record invoice.invoice_id = '"+invoice_id+"'><keys invoice.invoice_id = '"+invoice_id+"'/></record>";
    var parameters = {
         fields:record
        };
    var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-submitWorkPkgInvoice', parameters);
    if (result.code == 'executed') {
    	return true;
    } else {
         alert(result.code + " :: " + result.message);
    }	
}

function withdrawInvoice(invoice_id)
{
	var record = "<record invoice.invoice_id = '"+invoice_id+"'><keys invoice.invoice_id = '"+invoice_id+"'/></record>";
    var parameters = {
         fields:record
        };
    var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-withdrawWorkPkgInvoice', parameters);
    if (result.code == 'executed') {
    	return true;
    } else {
         alert(result.code + " :: " + result.message);
    }	
}


function getDataValues(tableName, fieldNames, restriction)
{
	var record = null;
	var parameters = 
	{
		tableName: tableName,
		fieldNames: toJSON(fieldNames),
		restriction: toJSON(restriction)
	};
	
	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters);
	if (result.code == 'executed'){
	} else {
		AFM.workflow.Workflow.handleError(result);
	}

	if (result != null) {
		record = result.data.records[0];
	}

	return record;
}

function replaceSingleQuote(val) {		
	if(val != null)
		return val.replace(/'/g, "''");
	else
		return null;
}