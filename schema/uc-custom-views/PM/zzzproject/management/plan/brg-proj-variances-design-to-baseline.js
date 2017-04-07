function setFilter()
{
	var restriction = getConsoleRestrictionMDX();
	var detailsFrame = getFrameObject(parent,'detailsFrame').name;
	
	var strXMLSQLTransaction = '<afmAction type="render" state="brg-proj-variances-design-to-baseline-mdx.axvw" response="true">';
	strXMLSQLTransaction += '<restrictions><userInputRecordsFlag><restriction type="sql" sql="'+restriction+'">';
	strXMLSQLTransaction += '</restriction></userInputRecordsFlag></restrictions>';
	strXMLSQLTransaction += '</afmAction>';
	sendingDataFromHiddenForm('',strXMLSQLTransaction, detailsFrame, '',false,'');	
}
