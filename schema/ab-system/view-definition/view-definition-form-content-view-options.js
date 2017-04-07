/******************************************************************
	Javascript Api to set up filters in Tgrp.
 ******************************************************************/
//overwritten in  view-definition-form-content-view-options.xsl
var titleName = "title";
var isMDX = "false";

//used by sendingDataFromHiddenForm() in common.js to send data to
//server
//afmInputsFormName is defined in common.js
function gettingRecordsData()
{
	var strReturned = '';
	var objForm = document.forms[afmInputsFormName];
	var strTitle = "";
	if(objForm != null)
	{
		strTitle = objForm.elements[titleName].value;
		//trim() and convert2validXMLValue() in common.js
		strTitle = trim(strTitle);
		strTitle = convert2validXMLValue(strTitle);
	}
	
	{
		var pdfButton = document.getElementById("PDF");
		var excelButton = document.getElementById("EXCEL");
		var preferences = "<preferences>";
		var pdfButtonShow = "false";
		var pdfButtonStyle = "portrait";
		if(pdfButton.checked)
		{
			pdfButtonShow = "true";
			var pdfStyleLandscape = document.getElementById("landscape");
			if(pdfStyleLandscape.checked){
				pdfButtonStyle = "landscape";
			}
		}
		preferences = preferences + '<pdfButton show="'+pdfButtonShow+'" style="'+pdfButtonStyle+'"/>';
		if(isMDX == "false"){
			//regular excel export
			preferences = preferences + '<export><excel><button  show="'+excelButton.checked+'"/></excel></export>';
		}else{
			//mdx excel export
			preferences = preferences + '<export><excel><mdx><button  show="'+excelButton.checked+'"/></mdx></excel></export>';
		}
		
		preferences = preferences + '</preferences>';
		
		strReturned = "<viewOptions>";
		strReturned = strReturned + "<afmXmlView>";

		strReturned = strReturned + preferences;
		
		strReturned = strReturned + '<title>'+strTitle+'</title>';
		
		strReturned = strReturned + "</afmXmlView>";
		strReturned = strReturned + "</viewOptions>";
		//user's inputs
		strReturned = "<userInputRecordsFlag>" + strReturned + "</userInputRecordsFlag>";
	}
	return strReturned;
}
//handle style for pdf
function onPDF(elem)
{
	var pdfButton = document.getElementById("PDF");
	if(!pdfButton.disabled){
		var styleArea = document.getElementById("styleArea");
		if(elem.checked)
		{
			styleArea.style.display="";
		}else{
			styleArea.style.display="none";
		}
	}

}
//onload
function setUpForm(showPDFButton, pdfShow, pdfStyle, showExcelButton, excelShow, showMdxExcelButton, mdxExcelShow, beingMDX, isColumnFormat)
{
	isMDX = beingMDX;
	var styleArea = document.getElementById("styleArea");
	var pdfButton = document.getElementById("PDF");
	var excelButton = document.getElementById("EXCEL");
	
	//Excel button
	if(showExcelButton==null || showExcelButton==""){
		showExcelButton = "false";
	}
	if(showMdxExcelButton==null || showMdxExcelButton==""){
		showMdxExcelButton = "false";
	}
	
	if(showExcelButton == "false" && showMdxExcelButton== "false"){
		excelButton.disabled=1;
	}else{
		excelButton.disabled=0;
	}
	//column format: no excel export
	if(isColumnFormat=="true")
		excelButton.disabled=1;

	if(!excelButton.disabled){
		if(excelShow!=null && excelShow!="" && excelShow=="true" && isMDX=="false"){
			excelButton.checked = 1;
		}else if(mdxExcelShow!=null && mdxExcelShow!="" && mdxExcelShow=="true" && isMDX=="true"){
			excelButton.checked = 1;
		}
	}
	
	//PDF button
	if(showPDFButton==null || showPDFButton==""){
		showPDFButton = "false";
	}

	if(showPDFButton=="false"){
		pdfButton.disabled=1;
	}else{
		pdfButton.disabled=0;
	}
	
	if(!pdfButton.disabled){
		if(pdfShow!=null && pdfShow!="" && pdfShow=="true"){
			pdfButton.checked = 1;
		}
		if(pdfButton.checked){
			styleArea.style.display="";
			var pdfStyleLandscape = document.getElementById("landscape");
			if(pdfStyle!=null && pdfStyle!="" && pdfStyle=="landscape"){
				pdfStyleLandscape.checked = 1;
			}
		}
	}
	

}


	

