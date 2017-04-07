/**********************************************************
 ab-rm-change-dp-vacant-drawing-common.js
  Event handler functions for the Autodesk Express Viewer
  plugin.

  Requires the following variables to be defined externally:
  strTargetView, strTargetFrame, strTargetTable
  strLayersOn, strLayersOff
**********************************************************/
DWF_showCloseButton=false;


// Set the default text for the window status bar
window.defaultStatus = "";


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
    newWindow = openNewContent(strLink, strFrame);
    if (newWindow) newWindow.focus();
  }
  else
  {

	  var objMainToolbarFrame = window.top;
	  if(objMainToolbarFrame!=null)
	  {
		//saving strSQLRestriction into array:
		//objMainToolbarFrame.arrReferredByAnotherFrame1
		//since Show action will refresh console window
		  var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1;
		  if(tempArray!=null)
			  tempArray["ab_rm_change_dp_rem_edit_refreshDrawingFrame"]=false;
	  }

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



// OnExecuteURL()
// Desc:  Function to handle the OnExecuteURL event of the Autodesk Express Viewer
//    Gets the primary keys from the DWF URL, builds a 14i URL and launches it.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  objLink, nIndex, objHandled, as defined in Express Viewer API
function OnSelectObject(objNode, objHandled){
	if(typeof DWF_singleclickable == "undefined"  || typeof DWF_singleclickable != "undefined" && DWF_singleclickable){
		if(objNode && objNode.Name != ''){
			// tell DWF viewer we are handling this event
			objHandled.State = true;
			var strURL = GetUrlLink(objNode.Name);
			// strTargetView and strTargetFrame should be provided by the XSL stylesheet
			OpenExpressViewerURL(strTargetView, strTargetFrame, strURL);
			//close it
			//window.close();
		}
	}

}
function OnExecuteURL(objLink, nIndex, objHandled)
{
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

function reSize(){
}