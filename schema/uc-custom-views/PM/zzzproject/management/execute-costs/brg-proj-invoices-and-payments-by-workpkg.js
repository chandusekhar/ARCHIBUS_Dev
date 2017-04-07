function openDetails(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	var invoice_id = rowRestriction['invoice.invoice_id'];
	var restriction = "invoice_id = \'"+invoice_id+"\'";	
	var strXMLSQLTransaction = '<afmAction type="render" state="ab-proj-invoices-and-payments-details.axvw" response="true">';
	strXMLSQLTransaction += '<restrictions><userInputRecordsFlag><restriction type="sql" sql="'+restriction+'">';
	strXMLSQLTransaction += '</restriction></userInputRecordsFlag></restrictions>';
	strXMLSQLTransaction += '</afmAction>';
	sendingDataFromHiddenForm('',strXMLSQLTransaction, '_blank', '',false,'');	
}

