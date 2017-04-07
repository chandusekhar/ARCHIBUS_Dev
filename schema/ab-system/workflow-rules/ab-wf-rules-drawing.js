/**********************************************************
  ab-express-viewer-drawing.js
  Event handler functions for the Autodesk Express Viewer
  plugin.

  Requires the following variables to be defined externally:
  strTargetView, strTargetFrame, strTargetTable
  strLayersOn, strLayersOff
**********************************************************/
var strTargetView = 'ab-wf-rules-edit.axvw';
var strTargetFrame = '';
var strTargetTable = 'afm_wf_rules';
var strLayersOn = 'WF;WF$;WF$TXT;WF-FLOW;Z-WF-DHL';
var strLayersOff = '';
DWF_showCloseButton=false;


//onload
function setUpDWFFileLink(){
	if(arrRecordPKsList!=null && arrRecordPKsList.length>0){
		var temp_array = arrRecordPKsList[0].split(";");
		var str="";
		var dwf_headerMessageElem=document.getElementById("DWF_headerMessage");
		if(dwf_headerMessageElem!=null){
			str = dwf_headerMessageElem.innerHTML;
			str = str + " " + temp_array[0]+"-"+temp_array[1];
			dwf_headerMessageElem.innerHTML = str;
		}
	}
	if(strDrawingName!=""){
		strDrawingName = strDrawingName.toLowerCase();
		if(strDrawingName.lastIndexOf(".dwf")<0){
			if(strDynamicHighlight=="true")
				strDrawingName = projectDrawingsFolder+'/'+ strDrawingName + '-absystemworkflow.dwf';
			else
				strDrawingName = projectDrawingsFolder+'/'+ strDrawingName + '.dwf';
		}
	}
}
//customized size of viewer control
function loadDwfViewer(width, height, path, version7){
	width="640";
	height="480";
	doLoadDwfViewer(width, height, path, version7);
}
// AddTableToExpressViewerURL()
// Desc:  Takes a list of primary keys and a table name
//        and inserts the table name into the PK list
// Params:
//   strPKList - string containing primary key list in a URL parameter formate, e.g.:
//               &bl_id=XX&fl_id=YY&rm_id=ZZ
//   strTable -  table name to insert
// Returns: new primary key list with table name spliced in, e.g.:
//            &em.bl_id=XX&em.fl_id=YY&em.rm_id=ZZ

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

// OnExecuteURL()
// Desc:  Function to handle the OnExecuteURL event of the Autodesk Express Viewer
//    Gets the primary keys from the DWF URL, builds a 14i URL and launches it.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  objLink, nIndex, objHandled, as defined in Express Viewer API

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
    //OpenExpressViewerURL(strTargetView, strTargetFrame, strLink);

    // open new WFR dialog
    OpenWorkflowRuleDialog(strLink);

    // Setting the handled state to true tells Express Viewer not to perform
    // its default action (launching URL in new browser window)
    objHandled.State = true;
  }

}

// OpenExpressViewerURL()
// Desc:  Constructs a 14i style URL and opens in the indicated frame
// Params:
//  strViewFile - View file name, e.g.: room-details.axvw
//  strFrame    - Name of the target frame, or empty to open in new window
//  strPKLIst   - String holding primary key values in URL parameter format, e.g.:
//                &em.bl_id=XX&em.fl_id=YY&em.rm_id=ZZ

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
		var selectValueWindowSettings	= "toolbar=no,menubar=no,status=yes,width=625,height=700";
		newWindow = openNewContent(strLink, strFrame, selectValueWindowSettings);
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
			var selectValueWindowSettings	= "toolbar=no,menubar=no,status=yes,width=625,height=700";
			newWindow = openNewContent(strLink, strFrame, selectValueWindowSettings);
			if (newWindow) newWindow.focus();
    }
  }
}


function OnSelectObject(objNode, objHandled)
{
	if(objNode && objNode.Name != ''){
		// tell DWF viewer we are handling this event
		objHandled.State = true;
		var strURL = GetUrlLink(objNode.Name);
		
		// strTargetView and strTargetFrame should be provided by the XSL stylesheet
		//OpenExpressViewerURL(strTargetView, strTargetFrame, strURL);
		
        // open new WFR dialog
		OpenWorkflowRuleDialog(strURL);
	}
}

function GetUrlLink(strPkeys){
	var strResult = "";
	var arrTemp = strPkeys.split(";");
	for (var i=0; i< arrTemp.length; ++i){
		var arrPkey = arrTemp[i].split("=");
		if(arrPkey.length > 0){
			var arr = arrPkey[0].split(".");
			if(arr.length == 1){
				strResult = strResult + "&" + strMainTable + "." + arrPkey[0] + "=" + arrPkey[1];
			}else{
				strResult = strResult + "&" + arrPkey[0] + "=" + arrPkey[1];
			}
		}
	}
	return strResult;
}

/**
 * Opens new WFR edit form in a dialog window. 
 * @param {strURL} URL parameter string, contains activity_id and rule_id values
 *                 used as a restriction for the edit form.
 */
function OpenWorkflowRuleDialog(strURL) {

	// create JSON restriction from URL parameters 
	var restriction = new Object();
	var urlItems = strURL.split('&');
	for (var i = 0; i < urlItems.length; i++) {
	    var urlItemParts = urlItems[i].split('=');
	    
	    var fieldName = urlItemParts[0];
	    var fieldValue = urlItemParts[1];
	    
	    if (fieldName != '') {
	        restriction[fieldName] = fieldValue;
	    }
	}
	
	// open the WFR edit form in a dialog window
	AFM.view.View.openDialog('ab-wf-rule-edit.axvw', restriction, false);
}


