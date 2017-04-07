/**********************************************************
  ab-rm-reserve-highlt-drawing.js
  Event handler functions for the Autodesk Express Viewer
  plugin.
**********************************************************/
//overwritten in xslt
var projectDrawingsFolder = "";
var strDrawingName = "";
var strTransactionserialized = "";
var arrURLPKs = new Array();
// Error strings
var strLoadError1 = "";
var strLoadError2 = "";
var strLoadError3 = "";
var strLoadError4 = "";
DWF_showCloseButton=false;
function setUpDWFFileLink(){
	if(arrRecordPKsList!=null && arrRecordPKsList.length>0){
		var temp_array = arrRecordPKsList[0].split(";");
		arrURLPKs['bl_id']=temp_array[0];
		arrURLPKs['fl_id']=temp_array[1];
		arrURLPKs['rm_id']=temp_array[2];
		var str="";
		var dwf_headerMessageElem=document.getElementById("DWF_headerMessage");
		if(dwf_headerMessageElem!=null){
			str = dwf_headerMessageElem.innerHTML;
			str = str + " " + arrURLPKs['bl_id']+"-"+arrURLPKs['fl_id']+"-"+arrURLPKs['rm_id'];
			dwf_headerMessageElem.innerHTML = str;
		}
	}
	if(strDrawingName!=""){
		strDrawingName = strDrawingName.toLowerCase();
		if(strDrawingName.lastIndexOf(".dwf")<0)
			strDrawingName = projectDrawingsFolder+'/'+ strDrawingName + '-abspacerminventoryb.dwf';
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
	//if (strViewFile == "") return;
	// Call the getFrameObject API to find the correct frame object
	var objTargetFrame = getFrameObject(window, strFrame);
	if(objTargetFrame != null){
		var strConsoleFilterRestriction = getCookie("ab_rm_reserve_filter_restriction_cookies");
		var strRMRestriction = "";
		var targetFrameName = objTargetFrame.name;

		for(var strPKName in arrURLPKs){
			strRMRestriction = strRMRestriction + '<clause relop="AND" op="=" value="'+arrURLPKs[strPKName]+'"><field name="'+strPKName+'" table="rm"/></clause>';
		}
		strRMRestriction = '<restriction type="parsed">' + strRMRestriction + '</restriction>';
		//strSerialized is coming from server
		var strSerializedInsertingSQLCommandsFirstPart = "";
		var strSerializedInsertingSQLCommandsRestPart = "";
		var strStartTag = "<%2FafmAction>";
		var numPos = strTransactionserialized.indexOf(strStartTag);
		if(numPos > 0){
			strSerializedInsertingSQLCommandsFirstPart = strTransactionserialized.substring(0, numPos);
			strSerializedInsertingSQLCommandsRestPart = strTransactionserialized.substring(numPos);
		}
		var strXMLSQLTransaction = '<afmAction type="render" state="ab-rm-reserve-detail.axvw" response="true">';
		//<restrictions>
		strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions>';
		strXMLSQLTransaction = strXMLSQLTransaction + strRMRestriction;
		strXMLSQLTransaction = strXMLSQLTransaction + strConsoleFilterRestriction;
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
  if(objNode && objNode.Name != ''){
    // tell DWF viewer we are handling this event
    objHandled.State = true;

    var strURL = GetUrlLink(objNode.Name);

    // strTargetView and strTargetFrame should be provided by the XSL stylesheet
    OpenExpressViewerURL("ab-rm-reserve-detail.axvw", "assetDetailsFrame", strURL);
  }
}

// loadDrawing()
// Desc:  Sets up the properties of the Express Viewer object and
//        sets the visiable layers of the current drawing.
//        Called from body onLoad()

function loadDrawing()
{
	GetErrorStrings();
	//open child view for making room reservation
	OpenExpressViewerURL("ab-rm-reserve-detail.axvw", "assetDetailsFrame", "");

	/* Test if there is a valid Express Viewer object
	   Under IE, if EV is not installed, it will install after the view
	   loads and everything should continue normally.
	   Under Netscape/Mozilla, objViewer will always be undefined, and
	   we can test this and stop processing js.
	*/
  if (typeof objViewer == "undefined"){
  	return;
  }

  // Check if the drawing name is valid
  // First check if drawing name is blank
  if (strDrawingName == ""){
     // Drawing name is blank, show an error
     doDoneLoading(false);
     objViewer.outerHTML = strLoadError4;
     return;
  }

  // Check if the drawing name is valid
  // If not, show an error message in place of Viewer object
  if (!checkURL(strDrawingName)){
	  //hidden instruction
	  var temp_instruction_obj = document.getElementById("instruction");
	  if(temp_instruction_obj!=null)
		  temp_instruction_obj.style.display = "none";
	  objViewer.outerHTML = strLoadError3 + "<br/>"+ strDrawingName + "<br/>" + strLoadError2;
  }else{
    // Hide the viewer object while the DWF loads and we
    //  change the layer visibility
    doStartLoading();

    // Get layer lists to turn on/off from main view
    // strLayersOn and strLayersOff are defined in the XSL
    // as lists of layers separated by semi-colons
    var strLayersOn ='GROS$;GROS$TXT;RM$;RM$TXT;';

    if(strDynamicHighlight == "true")
      strLayersOn = strLayersOn + "Z-RM-DHL;";
    else
      strLayersOn = strLayersOn + "Z-RM-HL-" + arrURLPKs['bl_id']+'-'+arrURLPKs['fl_id']+'-'+arrURLPKs['rm_id'] + ";";

    var arrOnLayers = strLayersOn.split(";");
    var source = strDrawingName + '?LayersOff=*';

    // Now run through layerOn list
    for(var nLayer in arrOnLayers){
       if(arrOnLayers[nLayer]!='')
         source = source + ",\\!" + arrOnLayers[nLayer];
    }

    objViewer.SourcePath = source;

    // wait for 10 sec to hide the "Loading" message and show "Warning" message
    window.setTimeout("setMsgStyle()", 10000);
  }
}





