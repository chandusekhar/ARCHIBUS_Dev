/**********************************************************
 ab-eq-locate-highlt-drawing.js
 Event handler functions for the Autodesk Express Viewer
 plugin.

 John Till
 3/9/05
 **********************************************************/
//overwritten in xslt
var projectDrawingsFolder = "";
var strDrawingName = "";
var strTransactionserialized = "";
var arrURLPKs = new Array();

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
	return "";
}


// OpenExpressViewerURL()
// Desc:  Constructs a 14i style URL and opens in the indicated frame
// Params:
//  strViewFile - View file name, e.g.: room-details.axvw
//  strFrame    - Name of the target frame, or empty to open in new window
//  strPKList   - String holding primary key values in URL parameter format, e.g.:
//                &em.bl_id=XX&em.fl_id=YY&em.rm_id=ZZ

function OpenExpressViewerURL(strViewFile, strFrame, strPKList)
{
	// If the view file name is blank, assume this is a drawing view
	// that is not supposed to launch another view
	//if (strViewFile == "") return;
	// Call the getFrameObject API to find the correct frame object
	var objTargetFrame = getFrameObject(window, strFrame);
	if(objTargetFrame != null)
	{
		var strConsoleFilterRestriction = getCookie("ab_eq_locate_filter_restriction_cookies");
		var strRMRestriction = "";
		var targetFrameName = objTargetFrame.name;

		for(var strPKName in arrURLPKs)
		{
			if(strRMRestriction != "")
				strRMRestriction = strRMRestriction + ' AND '
			strRMRestriction = strRMRestriction + strPKName + '=\'' + arrURLPKs[strPKName] + '\'';
		}
		strRMRestriction = '<restriction type="sql" sql="' + strRMRestriction + '"/>';
		//strSerialized is coming from server
		var strSerializedInsertingSQLCommandsFirstPart = "";
		var strSerializedInsertingSQLCommandsRestPart = "";
		var strStartTag = "<%2FafmAction>";
		var numPos = strTransactionserialized.indexOf(strStartTag);
		if(numPos > 0)
		{
			strSerializedInsertingSQLCommandsFirstPart = strTransactionserialized.substring(0, numPos);
			strSerializedInsertingSQLCommandsRestPart = strTransactionserialized.substring(numPos);
		}
		var strXMLSQLTransaction = '<afmAction type="render" state="ab-eq-locate-detail.axvw" response="true">';
		//<restrictions>
		strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions>';
//		strXMLSQLTransaction = strXMLSQLTransaction + strConsoleFilterRestriction;
		strXMLSQLTransaction = strXMLSQLTransaction + strRMRestriction;
		strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';
		strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';
		strXMLSQLTransaction = strSerializedInsertingSQLCommandsFirstPart + strXMLSQLTransaction + strSerializedInsertingSQLCommandsRestPart;
		//sending data to server through a hidden form
		sendingDataFromHiddenForm('',strXMLSQLTransaction, targetFrameName, '',false,'');
	}
}

function OnSelectObject(objNode, objHandled)
{
  if(objNode && objNode.Name != '')
  {
    // tell DWF viewer we are handling this event
    objHandled.State = true;

    var strURL = GetUrlLink(objNode.Name);

    // strTargetView and strTargetFrame should be provided by the XSL stylesheet
    OpenExpressViewerURL("ab-eq-locate-detail.axvw", "assetDetailsFrame", "");
  }
}

// loadDrawing()
// Desc:  Sets up the properties of the Express Viewer object and
//        sets the visiable layers of the current drawing.
//        Called from body onLoad()

function loadDrawing()
{
	//set localized strings
	strLoadError1 = document.getElementById("ab_eq_locate_highlt_drawing_strLoadError1").innerHTML;
	strLoadError2 = document.getElementById("ab_eq_locate_highlt_drawing_strLoadError2").innerHTML;
	strLoadError3 = document.getElementById("ab_eq_locate_highlt_drawing_strLoadError3").innerHTML;
	strLoadError4 = document.getElementById("ab_eq_locate_highlt_drawing_strLoadError4").innerHTML;

	//open child view for making room reservation
	OpenExpressViewerURL("ab-eq-locate-detail.axvw", "assetDetailsFrame", "");

	/* Test if there is a valid Express Viewer object
	   Under IE, if EV is not installed, it will install after the view
	   loads and everything should continue normally.
	   Under Netscape/Mozilla, objViewer will always be undefined, and
	   we can test this and stop processing js.
	*/
  if (typeof objViewer == "undefined")
  {
  	return;
  }

  if (strDrawingName == "")
  {
    // Drawing name is blank, show an error
    doDoneLoading(false);
    objViewer.outerHTML = strLoadError4;
    return;
  }

  // Check if the drawing name is valid
  // If not, show an error message in place of Viewer object
  if (!checkURL(strDrawingName))
  {
	  //hidden instruction
	  var temp_instruction_obj = document.getElementById("instruction");
	  if(temp_instruction_obj!=null)
		  temp_instruction_obj.style.display = "none";
	  objViewer.outerHTML = strLoadError3 + "<br/>"+ strDrawingName + "<br/>" + strLoadError2;
  }
  // Drawing exists, go ahead and tell Express Viewer to load it
  else
  {
    // Hide the viewer object while the DWF loads and we
    //  change the layer visibility
    doStartLoading();

    // Get layer lists to turn on/off from main view
    // strLayersOn and strLayersOff are defined in the XSL
    // as lists of layers separated by semi-colons
    var strLayersOn ='GROS$;GROS$TXT;RM$;RM$TXT;EM$;EM$TXT;EQ$;EQ$TXT;FP;FP$;FP$TXT;JK;JK$;JK$TXT;PB;PB$;PB$TXT;PN;PN$;PN$TXT;Z-RM-DHL';
    var arrOnLayers = strLayersOn.split(";");
    var source = strDrawingName + '?LayersOff=*';

    // Now run through layerOn list
    for(var nLayer in arrOnLayers)
    {
      if(arrOnLayers[nLayer]!='')
        source = source + ",\\!" + arrOnLayers[nLayer];
    }

    objViewer.SourcePath = source;
    // wait for 10 sec to hide the "Loading" message and show "Warning" message
    window.setTimeout("setMsgStyle()", 10000);
  }
}



