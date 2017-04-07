/**********************************************************
  ab-campus-map-drawing.js
  Yong Shao
  12/14/2006
**********************************************************/
DWF_showCloseButton=false;
strLayersOn = 'GROS$;GROS$TXT;RM$;RM$TXT;';//'Z-RM-DHL;';
strLayersOff = '';
strTargetTable="em";
strTargetFrame="assetDetailsFrame";
strTargetView="ab-ex-dwgs-details.axvw";
function setUpDWFFileLink(){
	if(strDynamicHighlight != "true"){
		var temp_str="";
		for(var i in arrRecordPKsList){
			var pks =  arrRecordPKsList[i].split(";");
			temp_str = temp_str + "Z-RM-HL-"+pks[0]+"-"+pks[1]+"-"+pks[2]+";";
		}
		strLayersOn = strLayersOn + temp_str;
	}
	if(strDrawingName!=""){
		strDrawingName = strDrawingName.toLowerCase();
		if(strDrawingName.lastIndexOf(".dwf")<0)
			strDrawingName = projectDrawingsFolder+'/'+ strDrawingName + '-abspacerminventoryb.dwf';
	}
}
function loadDwfViewer(width, height, path, version7){
	doLoadDwfViewer(400, 220, path, version7);
}/*
function OpenExpressViewerURL(strViewFile, strFrame, strPKList)
{
  // If the view file name is blank, assume this is a drawing view
  // that is not supposed to launch another view
	if (strViewFile == "") return;

  // Build the 14i link, containing the view file, handler action and primary key list
	var strLink = strViewFile + "?handler=com.archibus.config.ActionHandlerDrawing" + strPKList;

  // Check if we have been supplied a target frame
	if(strFrame == "")
	{
    // No frame supplied, just launch in a new window
		newWindow = openNewContent(strLink, strFrame);
		if (newWindow) newWindow.focus();
	}
	else
	{
    // Call the getFrameObject API to find the correct frame object
		var objTargetFrame = getFrameObject(window, strFrame);
		if(objTargetFrame != null)
		{
      // If we found it, tell that frame to launch the URL
			objTargetFrame.location.href = strLink;
		}
		else
		{
      // couldn't find the frame object, launch in new window
			newWindow = openNewContent(strLink, strFrame);
			if (newWindow) newWindow.focus();
		}
	}
}
function OnExecuteURL(objLink, nIndex, objHandled)
{
  // tell browser we are handling the event
	objHandled.State = true;

	if(strDynamicHighlight != "true")
	{
    // Build real URL here and send browser to it
		var strLink = objLink.Link(nIndex);

    // Add table specifier to primary key names: rm_id becomes em.rm_id
		strLink = AddTableToExpressViewerURL(strLink, strTargetTable);

    // strTargetView and strTargetFrame should be provided by the XSL stylesheet
		OpenExpressViewerURL(strTargetView, strTargetFrame, strLink);

    // Setting the handled state to true tells Express Viewer not to perform
    // its default action (launching URL in new browser window)
		objHandled.State = true;
	}
}
function AddTableToExpressViewerURL(strPKList, strTable)
{
  // get only the parameter list - strip anything before ?
	var iPos = strPKList.indexOf("?");
	if(iPos > 0)
		strPKList = strPKList.substring(iPos+1);


  // The & character separates the PK list
	arrStrings = strPKList.split("&");

  // declare strResult as empty string so we can add to it below
	var strResult = "";
  // iterate through the array containing PK value pairs
	for(nLayer in arrStrings)
	{
    // first string in array will be empty, make sure to check length
		if (arrStrings[nLayer].length > 0)
			strResult += "&" + strTable + "." + arrStrings[nLayer];

	}

	return strResult;
}
function OnSelectObject(objNode, objHandled)
{
	if(objNode && objNode.Name != '')
	{
    // tell DWF viewer we are handling this event
		objHandled.State = true;

		var strURL = GetUrlLink(objNode.Name);

    // strTargetView and strTargetFrame should be provided by the XSL stylesheet
		OpenExpressViewerURL(strTargetView, strTargetFrame, strURL);

	}
}
function GetUrlLink(strPkeys)
{
	var strResult = "";
	var arrTemp = strPkeys.split(";");

	for (var i=0; i< arrTemp.length; ++i)
	{

		var arrPkey = arrTemp[i].split("=");

		if(arrPkey.length > 0)
		{
			var arr = arrPkey[0].split(".");
			if(arr.length == 1)
			{
				strResult = strResult + "&" + strMainTable + "." + arrPkey[0] + "=" + arrPkey[1];
			}
			else
			{
				strResult = strResult + "&" + arrPkey[0] + "=" + arrPkey[1];
			}
		}

	}

	return strResult;
}*/