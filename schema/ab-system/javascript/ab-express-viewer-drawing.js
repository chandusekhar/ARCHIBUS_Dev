/**********************************************************
  ab-express-viewer-drawing.js
  Event handler functions for the Autodesk Express Viewer
  plugin.

  Requires the following variables to be defined externally:
  strTargetView, strTargetFrame, strTargetTable
  strLayersOn, strLayersOff
**********************************************************/
DWF_showCloseButton=false;
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

// OnBeginLoadItem()
// Desc:  Function to handle the OnBeginLoadItem event of the Autodesk Express Viewer.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  strType, strData as defined in Express Viewer API

function OnBeginLoadItem (strType, strData)
{
}


// OnEndLoadItem()
// Desc:  Function to handle the OnEndLoadItem event of the Autodesk Express Viewer.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  strType, strData, strResult as defined in Express Viewer API

function OnEndLoadItem (strType, strData, nResult)
{
  // Testing indicates that -23 is the error code returned when Express Viewer is unable to
  // find the file at the URL indicated
  // If we were unable to load the document, alert the user
  if (strType == "DOCUMENT" && nResult == -23)
  {
    // Make sure the viewer object is visible
    doDoneLoading(false);
    // Show an error message in place of Viewer object
    objViewer.outerHTML = strLoadError1 +"<br/>"+ + strData + "<br/>" + strLoadError2;
  }
  // The load went OK, so let's set our viewer preferences and layer visibility
  else if (strType == "SHEET")
  {
    setupDrawing();
  }

}


// OnOverURL()
// Desc:  Function to handle the OnOverURL event of the Autodesk Express Viewer.
//    Shows the link description in the window statusbar.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  nX, nY, objLink, objHandled, as defined in Express Viewer API

function OnOverURL(nX, nY, objLink, objHandled)
{
  // Set status bar text to the link description
  window.status = objLink.Name(1);

  // Setting the handled state to true tells Express Viewer not to perform
  // its default action (showing the tooltip popup)
  objHandled.State = true;

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
    OpenExpressViewerURL(strTargetView, strTargetFrame, strLink);

    // Setting the handled state to true tells Express Viewer not to perform
    // its default action (launching URL in new browser window)
    objHandled.State = true;
  }
}


function OnOverObject(objNode, objHandled)
{
  highlightSingleObject(objNode);
}


var gLeaveNode = null;
function OnLeaveObject(objNode)
{
  gLeaveNode = objNode;
  setTimeout("highlightSingleObject(gLeaveNode); gLeaveNode=null;", 0);
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
}

// OnLeaveURL()
// Desc:  Function to handle the OnLeaveURL event of the Autodesk Express Viewer
//    OnLeaveURL is not currently firing as of Express Viewer version 4.0.0.160.
//    This function resets the window statusbar to the default text.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  nX, nY, objLink, as defined in Express Viewer API

function OnLeaveURL(nX, nY, objLink)
{
  // Reset window status
  window.status = window.defaultStatus;
}

// checkURL()
// Desc:  Checks if the passed URL exists.  Returns true if the URL is valid,
//        false if not.  Only works in IE, but should fail gracefully in other
//        modern browsers.

function checkURL (strURL) {
  try
  {
    var objRequest = new ActiveXObject('Microsoft.XMLHTTP');
    // Request the header information for the URL, which is enough to determine
    // if the file exists, but doesn't attempt get the whole file
    objRequest.open('HEAD', strURL, false);
    objRequest.send();
    // 200 is the HTTP status code for success
    if (200 != objRequest.status) return false;
    reSize();
  }
  catch (e)
  {
    // Failed in some way, return true to continue
    return true;
  }
  return true;
}



// loadDrawing()
// Desc:  Sets up the properties of the Express Viewer object and
//        sets the visiable layers of the current drawing.
//        Called from body onLoad()

function loadDrawing()
{
	GetErrorStrings();
	// Turn off instruction text until loading is complete
	document.getElementById("instructionText").className = "visHide";

	/* Test if there is a valid Express Viewer object
	   Under IE, if EV is not installed, it will install after the view
	   loads and everything should continue normally.
	   Under Netscape/Mozilla, objViewer will always be undefined, and
	   we can test this and stop processing js.
	*/
	if (typeof objViewer == "undefined")
		return;

  // Hide the viewer object while the DWF loads and we change the layer visibility
	doStartLoading();

  // Check if the drawing name is valid
  // First check if base drawing name is blank
  if (strBaseDrawingName == "")
  {
    // Drawing name is blank, show an error
    doDoneLoading(false);
    objViewer.outerHTML = strLoadError4;
    return;
  }

  // Next, check the full URL
  if (!checkURL(strDrawingName))
  {
    // URL is invalid, show an error message in place of Viewer object
    doDoneLoading(false);
    objViewer.outerHTML = strLoadError3 + "<br/>" + strDrawingName + "<br/>" + strLoadError2;
    return;
  }

  // Drawing exists, go ahead and tell Express Viewer to load it

  // Get layer lists to turn on/off from main view
  // strLayersOn and strLayersOff are defined in the XSL
  // as lists of layers separated by semi-colons
  var arrOnLayers = strLayersOn.split(";");
  var source = strDrawingName + '?LayersOff=*';

  // Now run through layerOn list
  for(var nLayer in arrOnLayers)
  {
     if(arrOnLayers[nLayer]!='')
       source = source + ",\\!" + arrOnLayers[nLayer];
  }

	try{
  	objViewer.SourcePath = source;
	} catch (e){
		
	}	

  // wait for 10 sec to hide the "Loading" message and show "Warning" message
  window.setTimeout("setMsgStyle()", 10000);

}


function setMsgStyle()
{
   document.body.style.cursor = "default";
   document.all.loadingMessage.className = "visHide";
   var temp_warning_obj = document.getElementById("warningMessage");
   if(temp_warning_obj!=null)
	temp_warning_obj.className = "visShow";
}





// doStartLoading()
// Desc:  This fuction hides the Express viewer object,
//     shows the loading message, and sets an hourglass cursor

function doStartLoading()
{
    document.body.style.cursor = "wait";
    if(document.getElementById("loadingMessage")!=null)
		 document.getElementById("loadingMessage").className = "visShow";
    // objViewer.className = "visHide";
    if(document.getElementById("instructionText")!=null)
	    document.getElementById("instructionText").className = "visHide";

    var temp_warning_obj = document.getElementById("warningMessage");
    if(temp_warning_obj!=null)
	temp_warning_obj.className = "visHide";
}



function setupDrawing()
{
	GetErrorStrings();

	objViewer.Viewer.SingleClickHyperlink = true;
  // Hide the Express Viewer toolbar
	objViewer.Viewer.ToolBarVisible = false;
  // Set zoom increment (controls mouse weel zooming)
	objViewer.Viewer.ZoomIncrement = 10;
  // DWF Viewer 5 hangs if this API call is made while the object is hidden
	objViewer.Viewer.PaperVisible = false;

	objViewer.executecommand('FITTOWINDOW');  // fit dwf contents to window

  // DWF Viewer 5 does not support this command
	objViewer.executecommand('NAVBAR');  // hide the navbar

  // turn off the animation bar
	try
	{
    //Pass a empty string to get the default version.
		var version = objViewer.ProductVersion('');

    // The following example will turn off all the toolbars and data panes
		var Cmds = objViewer.ECompositeViewer.Commands;
		Cmds('ANIMATIONBAR').Toggled = false; // hide Animation bar
		Cmds('GRIDROLLOVER').Toggled = false; // hide grid roll over (up arrow)
		Cmds('DATAFRAMEUI').Toggled = false;  // hide data pane
		Cmds('CANVASTITLE').Toggled = false;  // show canvas title bar
	}
	catch(e)
	{
    // if the version is before 7, do nothing
	}

  // if use "dynamic highlighting" then highlight...
	if(strDynamicHighlight == "true")
	{
		objViewer.DocumentHandler.executecommand('SELECT');
	}

	if(strDynamicHighlight == "true")
	{
		doHighlighting();  // Perform highlighting
	}

  // Show the viewer object now that we have set
  //  the layer visibility
	doDoneLoading(true);

}


