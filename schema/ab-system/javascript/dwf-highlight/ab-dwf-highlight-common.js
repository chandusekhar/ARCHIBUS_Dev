/*ab-dwf-highlight-common.js
 *Created By Yong Shao on 11/29/2006
 *(1)optimize and improve the performance of highlight
 *(2)centralize the dwf JS coding
 *(3)make the size of DWF ActiveX fit the size of popup dialog window
 */
//overwritten in xslt
var projectDrawingsFolder = "";
var str_bl_id = "";
var str_fl_id = "";
var strDrawingName = "";
var strTargetTable="";
var strLayersOn ='GROS$;GROS$TXT;RM$;RM$TXT;Z-RM-DHL';
//onload
function setUpDWFFileLink(){
	if(strDrawingName!=""){
		strDrawingName = strDrawingName.toLowerCase();
		if(strDrawingName.lastIndexOf(".dwf")<0)
			strDrawingName = projectDrawingsFolder+'/'+ strDrawingName + '-abspacerminventoryb.dwf';
	}
}
//should be overwritten by XSL
var DWF_singleclickable=true;
//should be overwritten by customized JS
var DWF_showCloseButton=true;
// Error strings
var strLoadError1 = "Express Viewer is unable to load the file:";
var strLoadError2 = "Please contact your system administrator.";
var strLoadError3 = "The selected drawing file does not exist: ";
var strLoadError4 = "There is no drawing file associated with the selected item.";
function GetErrorStrings(){
	// Error strings
	strLoadError1 = "Express Viewer is unable to load the file: ";
	if(document.getElementById("UNABLE_LOAD")!=null)
		strLoadError1 =  document.getElementById("UNABLE_LOAD").innerHTML + "\n";
	strLoadError2 = "Please contact your system administrator.";
	if(document.getElementById("CONTACT_SYS")!=null)
		strLoadError2 =  "\n" + document.getElementById("CONTACT_SYS").innerHTML;
	strLoadError3 = "The selected drawing file does not exist: ";
	if(document.getElementById("NO_DWF")!=null)
		strLoadError3 =  document.getElementById("NO_DWF").innerHTML;
	strLoadError4 = "There is no drawing file associated with the selected item.";
	if(document.getElementById("NO_ASSOCIATED_DWF")!=null)
		strLoadError4 =  document.getElementById("NO_ASSOCIATED_DWF").innerHTML;
}
// Set the default text for the window status bar
window.defaultStatus = "";
function OpenExpressViewerURL(strPKList){
   //strPKList(rm.bl_id=HQ&rm.fl_id=19&rm.rm_id=109) to get rm.rm_id and pass it to opener window
	var array_temp = strPKList.split("&");
	//array_temp[3]: rm.rm_id=109
	var selected_rm_id = array_temp[3].split("=")[1];
	//passing selected_rm_id to opener's targeted field
	if(opener != null){
		var objSelectedVForm = opener.document.forms[opener.selectedValueInputFormName];
		if(objSelectedVForm != null){
			var objSelectedVTargetField = objSelectedVForm.elements[opener.selectValueInputFieldID];

			// for Yalta 5 view
			if(objSelectedVTargetField==null){
				var formName = opener.selectedValueInputFormName;
				var formFieldPrefix = formName.substring(0, formName.lastIndexOf('_'));
				var fieldFullName = formFieldPrefix + '_' + trim(opener.selectValueInputFieldID);
				objSelectedVTargetField = objSelectedVForm.elements[fieldFullName];
			}
			
			if(objSelectedVTargetField!=null){
				objSelectedVTargetField.value=selected_rm_id;
			}
		}
	}
}

// OnBeginLoadItem()
// Desc:  Function to handle the OnBeginLoadItem event of the Autodesk Express Viewer.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  strType, strData as defined in Express Viewer API
function OnBeginLoadItem (strType, strData){}
// OnEndLoadItem()
// Desc:  Function to handle the OnEndLoadItem event of the Autodesk Express Viewer.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  strType, strData, strResult as defined in Express Viewer API
function OnEndLoadItem (strType, strData, strResult){
	GetErrorStrings();
	// Testing indicates that -23 is the error code returned when Express Viewer is unable to
	// find the file at the URL indicated
	// If we were unable to load the document, alert the user
	if (strType == "DOCUMENT" && strResult == -23){
		// Make sure the viewer object is visible
		doDoneLoading(false);
		// Show an error message in place of Viewer object
		objViewer.outerHTML = strLoadError1 + strData + strLoadError2;
	}else if (strType == "SHEET"){
		configureDWFViewer();
		setupDrawing();
	}
}
// OnOverURL()
// Desc:  Function to handle the OnOverURL event of the Autodesk Express Viewer.
//    Shows the link description in the window statusbar.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  nX, nY, objLink, objHandled, as defined in Express Viewer API
function OnOverURL(nX, nY, objLink, objHandled){
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
function OnExecuteURL(objLink, nIndex, objHandled){
	if(strDynamicHighlight != "true"){
		// Build real URL here and send browser to it
		var strLink = objLink.Link(nIndex);
		strLink = AddTableToExpressViewerURL(strLink, strTargetTable);
		var bHandling = false;
		var str_temp = "";
		//strLink: &bl_id=HQ&fl_id=19&rm_id=107
		var array_temp = strLink.split("&");
		//array_temp[1]: bl_id=HQ;
		//array_temp[2]:fl_id=19;array_temp[3]:rm_id=107
		//array_temp[1].split("=")[1]: HQ; array_temp[2].split("=")[1]: 17;
		//array_temp[3].split("=")[1]: 107
		str_temp = array_temp[1].split("=")[1]+'-'+array_temp[2].split("=")[1]+'-'+array_temp[3].split("=")[1];
		OpenExpressViewerURL(strLink);
		// Setting the handled state to true tells Express Viewer not to perform
		// its default action (launching URL in new browser window)
		objHandled.State = true;

		//close it
		window.close();
	}
}
function AddTableToExpressViewerURL(strPKList, strTable){
	return strPKList;
}
function OnOverObject(objNode, objHandled){
	highlightSingleObject(objNode);
}
var gLeaveNode = null;
function OnLeaveObject(objNode){
	gLeaveNode = objNode;
	setTimeout("highlightSingleObject(gLeaveNode); gLeaveNode=null;", 0);
}
function OnSelectObject(objNode, objHandled){
	if(typeof DWF_singleclickable == "undefined"  || typeof DWF_singleclickable != "undefined" && DWF_singleclickable){
		if(objNode && objNode.Name != ''){
			// tell DWF viewer we are handling this event
			objHandled.State = true;
			var strURL = GetUrlLink(objNode.Name);
			// strTargetView and strTargetFrame should be provided by the XSL stylesheet
			OpenExpressViewerURL(strURL);
			//close it
			window.close();
		}
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
// OnLeaveURL()
// Desc:  Function to handle the OnLeaveURL event of the Autodesk Express Viewer
//    OnLeaveURL is not currently firing as of Express Viewer version 4.0.0.160.
//    This function resets the window statusbar to the default text.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  nX, nY, objLink, as defined in Express Viewer API
function OnLeaveURL(nX, nY, objLink){
	// Reset window status
	window.status = window.defaultStatus;
}
// checkURL()
// Desc:  Checks if the passed URL exists.  Returns true if the URL is valid,
//        false if not.  Only works in IE, but should fail gracefully in other
//        modern browsers.
function checkURL (strURL) {
	try{
		var objRequest = new ActiveXObject('Microsoft.XMLHTTP');
		// Request the header information for the URL, which is enough to determine
		// if the file exists, but doesn't attempt get the whole file
		objRequest.open('HEAD', strURL, false);
		objRequest.send();
		// 200 is the HTTP status code for success
		if (200 != objRequest.status) return false;
	}catch (e){
		// Failed in some way, return true to continue
		return true;
	}
	return true;
}
// loadDrawing()
// Desc:  Sets up the properties of the Express Viewer object and
//        sets the visiable layers of the current drawing.
//        Called from body onLoad()
function loadDrawing(){
	GetErrorStrings();
	// Turn off instruction text until loading is complete
	var instructionElem = document.getElementById("instructionText");
	if(instructionElem!=null)
		instructionElem.className = "visHide";
	if (typeof objViewer == "undefined")
		return;
	// Check if we have a valid drawing name, show an error msg if not
	if (strDrawingName == ""){
		if(instructionElem!=null)
			instructionElem.className = "visHide";
		objViewer.outerHTML = strLoadError4;
		return;
	}

	if (!checkURL(strDrawingName)){
		if(instructionElem!=null)
			instructionElem.className = "visHide";
		objViewer.outerHTML = strLoadError3 + strDrawingName;
	}else{
		doStartLoading();
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
	
	reSize();
	// wait for 10 sec to hide the "Loading" message and show "Warning" message
	window.setTimeout("setMsgStyle()", 1000);

}
function setMsgStyle(){
	document.body.style.cursor = "default";
	if(document.getElementById("loadingMessage")!=null)
		document.getElementById("loadingMessage").className = "visHide";
	var temp_warning_obj = document.getElementById("warningMessage");
	if(temp_warning_obj!=null)
		temp_warning_obj.className = "visShow";
}
// doStartLoading()
// Desc:  This fuction hides the Express viewer object,
//     shows the loading message, and sets an hourglass cursor
function doStartLoading(){
	document.body.style.cursor = "wait";
	// objViewer.className = "visHide";
	if(document.getElementById("loadingMessage")!=null)
		document.getElementById("loadingMessage").className = "visShow";
	if(document.getElementById("instructionText")!=null)
		document.getElementById("instructionText").className = "visHide";
	var temp_warning_obj = document.getElementById("warningMessage");
	if(temp_warning_obj!=null)
		temp_warning_obj.className = "visHide";
}
// doDoneLoading()
// Desc:  This fuction shows the Express viewer object,
//    hides the loading message, and resets cursor
function doDoneLoading(bNoError){
	document.body.style.cursor = "default";
	// objViewer.className = "visShow";
	if(document.getElementById("loadingMessage")!=null)
		document.getElementById("loadingMessage").className = "visHide";
	if (bNoError && document.getElementById("instructionText")!=null)
		document.getElementById("instructionText").className = "instruction";

	var temp_warning_obj = document.getElementById("warningMessage");
	if(temp_warning_obj!=null)
		temp_warning_obj.className = "visShow";

}
//
function configureDWFViewer(){
	// Set properties of the Express viewer object
	// single click links instead of control + click
	objViewer.Viewer.SingleClickHyperlink = true;
	// Hide the Express Viewer toolbar
	objViewer.Viewer.ToolBarVisible = false;
	// DWF Viewer 5 hangs if this API call is made while the object is hidden
	objViewer.Viewer.PaperVisible = false;
	objViewer.executecommand('FITTOWINDOW');  // fit dwf contents to window
	// DWF Viewer 5 does not support this command
	objViewer.executecommand('NAVBAR');  // hide the navbar
	// Set zoom increment (controls mouse weel zooming)
	objViewer.Viewer.ZoomIncrement = 10;
	// turn off the animation bar
	try{
		//Pass a empty string to get the default version.
		var version = objViewer.ProductVersion('');
		// The following example will turn off all the toolbars and data panes
		var Cmds = objViewer.ECompositeViewer.Commands;
		Cmds('TOOLBAR').Toggled = false; // hide tool bar
		Cmds('ANIMATIONBAR').Toggled = false; // hide Animation bar
		Cmds('GRIDROLLOVER').Toggled = false; // hide grid roll over (up arrow)
		Cmds('DATAFRAMEUI').Toggled = false;  // hide data pane
		Cmds('CANVASTITLE').Toggled = false;  // show canvas title bar
	} catch(e){}
}
// setupDrawing()
// Desc:  Sets up the properties of the Express Viewer object and
//        sets the visiable layers of the current drawing.
//        Called from body onLoad()
function setupDrawing(){
	// if use "dynamic highlighting" then highlight...
	if(strDynamicHighlight == "true"){
		objViewer.DocumentHandler.executecommand('SELECT');
		doHighlighting();
	}

	// Show the viewer object now that we have set
	// the layer visibility
	doDoneLoading(true);

}
// onload
// loadDwfViewer
// Desc: Dynamically load DWF Viewer control 6 or 7 to workaround "Press Spacebar or enter to active control" message
function loadDwfViewer(width, height, path, version7){
	doLoadDwfViewer(width, height, path, version7);
}
//previate function
function doLoadDwfViewer(width, height, path, version7){
	showDWFWindowCloseButton();
	var elem = document.getElementById("dwfViewerControl");
	var warning = 	"DWF Viewer failed to load. ARCHIBUS Web Central supports DWF drawings on Internet Explorer 6 or later. " +
					"If you are using a supported browser, contact your system administrator to install the Autodesk DWF " +
					"Viewer. You can also download it from autodesk website." + 
				    '<a href="http://www.autodesk.com/global/dwfviewer/installer/DWFViewerSetup.cab#version=9,0,0,96">DOWNLOAD</a>';
	if(document.getElementById("GENERAL_WARNING")!=null && document.getElementById("DOWNLOAD")!=null){
		warning = document.getElementById("GENERAL_WARNING").innerHTML;
		warning = 	warning + '<a h0ref="http://www.autodesk.com/global/dwfviewer/installer/DWFViewerSetup.cab#version=9,0,0,96">' + 
					document.getElementById("DOWNLOAD").innerHTML + '</a>';
	}
	var  str = '<object id="objViewer" width="' + width + '" height="' + height +'"';
	 str = str + ' classid="clsid:A662DA7E-CCB7-4743-B71A-D817F6D575DF"';
	 str = str + '<embed id="objViewer">';
	 str = str + '<div id="warningMessage" class="visHide" align="left">' + warning + '</div>';
	 str = str + '</embed>';
	 str = str + '</object>';

	elem.innerHTML = str;
}


// The array should be built by the XSL creating this view
// this array is used by dynamic highlighting to convert from Autocad Color Index(ACI) to RGB color
var arrACItoRGB=[[1,0,0],[1,1,0],[0,1,0],[0,1,1],[0,0,1],[1,0,1],[1,0,1],[0.502,0.502,0.502],[0.753,0.753,0.753],[1,0,0],[1,0.5,0.5],[0.65,0,0],[0.65,0.325,0.325],[0.5,0,0],[0.5,0.25,0.25],[0.3,0,0],[0.3,0.15,0.15],[0.15,0,0],[0.15,0.075,0.075],[1,0.25,0],[1,0.25,0],[0.65,0.1625,0],[0.65,0.4063,0.325],[0.5,0.125,0],[0.5,0.3125,0.25],[0.3,0.075,0],[0.3,0.1875,0.15],[0.15,0.0375,0],[0.15,0.0938,0.075],[1,0.5,0],[1,0.75,0.5],[0.65,0.325,0],[0.65,0.4875,0.325],[0.5,0.25,0],[0.5,0.375,0.25],[0.3,0.15,0],[0.3,0.225,0.15],[0.15,0.075,0],[0.15,0.1125,0.075],[1,0.75,0],[1,0.875,0.5],[0.65,0.4875,0],[0.65,0.5688,0.325],[0.5,0.375,0],[0.5,0.4375,0.25],[0.3,0.225,0],[0.3,0.2625,0.15],[0.15,0.1125,0],[0.15,0.1313,0.075],[1,1,0],[1,1,0.5],[0.65,0.65,0],[0.65,0.65,0.325],[0.5,0.5,0],[0.5,0.5,0.25],[0.3,0.3,0],[0.3,0.3,0.15],[0.15,0.15,0],[0.15,0.15,0.075],[0.75,1,0],[0.875,1,0.5],[0.4875,0.65,0],[0.5688,0.65,0.325],[0.375,0.5,0],[0.4375,0.5,0.25],[0.225,0.3,0],[0.2625,0.3,0.15],[0.1125,0.15,0],[0.1313,0.15,0.075],[0.5,1,0],[0.75,1,0.5],[0.325,0.65,0],[0.4875,0.65,0.325],[0.25,0.5,0],[0.375,0.5,0.25],[0.15,0.3,0],[0.225,0.3,0.15],[0.075,0.15,0],[0.1125,0.15,0.075],[0.25,1,0],[0.625,1,0.5],[0.1625,0.65,0],[0.4063,0.65,0.325],[0.125,0.5,0],[0.3125,0.5,0.25],[0.075,0.3,0],[0.1875,0.3,0.15],[0.0375,0.15,0],[0.0938,0.15,0.075],[0,1,0],[0.5,1,0.5],[0,0.65,0],[0.325,0.65,0.32],[0,0.5,0],[0.25,0.5,0.25],[0,0.3,0],[0.15,0.3,0.15],[0,0.15,0],[0.075,0.15,0.07],[0,1,0.25],[0.5,1,0.625],[0,0.65,0.1625],[0.325,0.65,0.4063],[0,0.5,0.125],[0.25,0.5,0.3125],[0,0.3,0.075],[0.15,0.3,0.1875],[0,0.15,0.0375],[0.075,0.15,0.0938],[0,1,0.5],[0.5,1,0.75],[0,0.65,0.325],[0.325,0.65,0.4875],[0,0.5,0.25],[0.25,0.5,0.375],[0,0.3,0.15],[0.15,0.3,0.225],[0,0.15,0.075],[0.075,0.15,0.1125],[0,1,0.75],[0.5,1,0.875],[0,0.65,0.4875],[0.325,0.65,0.5688],[0,0.5,0.375],[0.25,0.5,0.4375],[0,0.3,0.225],[0.15,0.3,0.2625],[0,0.15,0.1125],[0.075,0.15,0.1313],[0,1,1],[0.5,1,1],[0,0.65,0.65],[0.325,0.65,0.65],[0,0.5,0.5],[0.25,0.5,0.5],[0,0.3,0.3],[0.15,0.3,0.3],[0,0.15,0.15],[0.075,0.15,0.15],[0,0.75,1],[0.5,0.875,1],[0,0.4875,0.65],[0.325,0.5688,0.65],[0,0.375,0.5],[0.25,0.4375,0.5],[0,0.225,0.3],[0.15,0.2625,0.3],[0,0.1125,0.15],[0.075,0.1313,0.15],[0,0.5,1],[0.5,0.75,1],[0,0.325,0.65],[0.325,0.4875,0.65],[0,0.25,0.5],[0.25,0.375,0.5],[0,0.15,0.3],[0.15,0.225,0.3],[0,0.075,0.15],[0.075,0.1125,0.15],[0,0.25,1],[0.5,0.625,1],[0,0.1625,0.65],[0.325,0.4063,0.65],[0,0.125,0.5],[0.25,0.3125,0.5],[0,0.075,0.3],[0.15,0.1875,0.3],[0,0.0375,0.15],[0.075,0.0938,0.15],[0,0,1],[0.5,0.5,1],[0,0,0.65],[0.325,0.325,0.65],[0,0,0.5],[0.25,0.25,0.5],[0,0,0.3],[0.15,0.15,0.3],[0,0,0.15],[0.075,0.075,0.1],[0.25,0,1],[0.625,0.5,1],[0.1625,0,0.65],[0.4063,0.325,0.65],[0.125,0,0.5],[0.3125,0.25,0.5],[0.075,0,0.3],[0.1875,0.15,0.3],[0.0375,0,0.15],[0.0938,0.075,0.15],[0.5,0,1],[0.75,0.5,1],[0.325,0,0.65],[0.4875,0.325,0.65],[0.25,0,0.5],[0.375,0.25,0.5],[0.15,0,0.3],[0.225,0.15,0.3],[0.075,0,0.15],[0.1125,0.075,0.15],[0.75,0,1],[0.875,0.5,1],[0.4875,0,0.65],[0.5688,0.325,0.65],[0.375,0,0.5],[0.4375,0.25,0.5],[0.225,0,0.3],[0.2625,0.15,0.3],[0.1125,0,0.15],[0.1313,0.075,0.15],[1,0,1],[1,0.5,1],[0.65,0,0.65],[0.65,0.325,0.65],[0.5,0,0.5],[0.5,0.25,0.5],[0.3,0,0.3],[0.3,0.15,0.3],[0.15,0,0.15],[0.15,0.075,0.15],[1,0,0.75],[1,0.5,0.875],[0.65,0,0.4875],[0.65,0.325,0.5688],[0.5,0,0.375],[0.5,0.25,0.4375],[0.3,0,0.225],[0.3,0.15,0.2625],[0.15,0,0.1125],[0.15,0.075,0.1313],[1,0,0.5],[1,0.5,0.75],[0.65,0,0.325],[0.65,0.325,0.4875],[0.5,0,0.25],[0.5,0.25,0.375],[0.3,0,0.15],[0.3,0.15,0.225],[0.15,0,0.075],[0.15,0.075,0.1125],[1,0,0.25],[1,0.5,0.625],[0.65,0,0.1625],[0.65,0.325,0.4063],[0.5,0,0.125],[0.5,0.25,0.3125],[0.3,0,0.075],[0.3,0.15,0.1875],[0.15,0,0.0375],[0.15,0.075,0.0938],[0.33,0.33,0.33],[0.464,0.464,0.464],[0.598,0.598,0.598],[0.732,0.732,0.732],[0.866,0.866,0.866],[1,1,1]];
// main function for dynamic highlight
// loop through each object in the layer, then highlight the object if satisfy the restriction
function doHighlighting(){
	var objNodes = objViewer.DocumentHandler.ObjectNodes;
	for (var i = 1; i <= objNodes.Count; ++i){
		var currNode = objNodes.Item(i);
		highlightSingleObject(currNode);
	}
}
// highlight the current node if satisfy the restriction
function highlightSingleObject(currNode){
	if (!currNode) return;
	// get node's pk in format of bl_id=HQ;fl_id=17;rm_id=101
	var strPkeys = currNode.Name;


	if (!strPkeys || strPkeys.length ==0)
		return;
	//compose string from the pk string
	var pkValue = parsePKString(strPkeys);
	// get color for the node - from db (if highlight by owner) or preset value
	var color = getColorFromPkeys(pkValue);
	// Set color and highlight object
	objViewer.Viewer.ObjectHighlightColor = color;
	// comment this out, this line causes the Design Review 2009 to crush
	// use the "currNode.Selected=true" instead
	//currNode.Highlighted = true;
	
	//workaround for Design Review 2009 crush
	objViewer.Viewer.ObjectSelectedColor = color;
	currNode.Selected = true;
}

//  Find record using PKey and highlight it
function getColorFromPkeys(dwPKValue){
	// default to paper color (not highlighted)
	var color = objViewer.Viewer.PaperColor;
	// Cycle through objects till our callback matches the records
	// and gives us the color
	//(1): not sorted on primary keys
	var found = regularSearch(arrRecordPKsList, dwPKValue);
	//(2): not sorted on primary keys
	//var found = binarySearch(arrRecordPKsList, dwPKValue);

	if(found!=null){

		color = DWF_defaultHighlightColor;
		var hpatternValue = arrRecordHpattenList[found];
		if(hpatternValue != ""){
			color = parseColor(hpatternValue, 'dwf');
		}
		return color;
	}
	return color;
}
function parseColor(strColor, type){
	var nColor = DWF_defaultHighlightColor;
	var strArr = strColor.split(" ");
	if(strArr.length < 2){
		if(type=='dwf')
			return convertToDwfColor(nColor);
		else
			return convertToHexColor(nColor);
	}
	var nVersion = parseInt(strArr[0]);
	var nStyle, nRGBColor;
	if(nVersion == 14){
		nStyle = parseInt(strArr[1]);
		// for solid or hatch - hatch only display base color
		if( nStyle == 0 || nStyle == 1){
			nColor = parseInt(strArr[2]);
			if(strArr.length > 3){
				nRGBColor = parseInt(strArr[3]);
				if(nRGBColor > 255)
					nColor = nRGBColor;
			}
		}else{
			if(strArr.length > 5){
				nRGBColor = parseInt(strArr[5]);
				if(nRGBColor > 255)
					nColor = nRGBColor;
			}
		}
	}else{
		nColor = parseInt(strArr[1]);
	}

	if(type=='dwf')
		return convertToDwfColor(nColor);
	else
		return convertToHexColor(nColor);
}
// parse the pk string
//bl_id=HQ;fl_id=17;rm_id=101
//return: HQ;17;101;
function parsePKString(strPkeys){
	var result = '';
	var arrTemp = strPkeys.split(";");
	for (var i=0; i< arrTemp.length; i++){
		var arrPkey = arrTemp[i].split("=");
		if(arrPkey.length > 0){
			result = result + arrPkey[1]+";";
		}
	}
	return result;
}
function convertToHexColor (nColorNum){
	var nColor;
	//---- Convert color number to true color
	if (nColorNum <= 0)
		nColor = 0;
	else if (  nColorNum > 0 && nColorNum < 255) {
		var nRed = parseInt(arrACItoRGB[nColorNum-1][0] * 255);
		var nGreen = parseInt(arrACItoRGB[nColorNum-1][1] * 255);
		var nBlue = parseInt(arrACItoRGB[nColorNum-1][2] * 255);
		nColor = RGBtoHex(nRed, nGreen, nBlue);
	} else{
		var nBlue = parseInt(nColorNum/(256*256));
		var nGreen = parseInt((nColorNum - nBlue*256*256)/256);
		var nRed = nColorNum - nBlue*256*256 - nGreen*256;
		nColor = RGBtoHex(nRed, nGreen, nBlue);
	}
	return nColor;
}
function convertToDwfColor (nColorNum){
	var nColor;
	//---- Convert color number to true color
	if (nColorNum <= 0){
		nColor = 0;
	}else if (  nColorNum > 0 && nColorNum < 255) {
		var nRed = parseInt(arrACItoRGB[nColorNum-1][0] * 255);
		var nGreen = parseInt(arrACItoRGB[nColorNum-1][1] * 255);
		var nBlue = parseInt(arrACItoRGB[nColorNum-1][2] * 255);
		nColor = RGBtoDWF(nRed, nGreen, nBlue);
	} else{
		nColor = nColorNum;
	}
	return nColor;
}
function RGBtoDWF(R,G,B){
	return (R + G*256 + B*256*256);
}
function RGBtoHex(R,G,B){
	return toHex(R)+toHex(G)+toHex(B);
}
function toHex(num){
	if (num==null) return "00";

	var num=parseInt(num);
	if (num==0 || isNaN(num))
		return "00";
	num=Math.max(0,num);
	num=Math.min(num,255);
	num=Math.round(num);
	var hex = "0123456789ABCDEF".charAt((num-num%16)/16) + "0123456789ABCDEF".charAt(num%16);
	return hex;
}
function getHatched(strColor){
	var strArr = strColor.split(" ");
	if(strArr.length < 2)
		return '';

	var nVersion = parseInt(strArr[0]);
	var nStyle;

	if(nVersion == 14){
		nStyle = parseInt(strArr[1]);
		// for solid or hatch - hatch only display base color
		if( nStyle == 1){
			if(strArr.length > 6){
				return strArr[6];
			}
		}
	}else{
		if(strArr.length > 3){
			return strArr[3];
		}
	}
	return '';
}
//array is not sorted!!!
function regularSearch(array, find){
	var result=null;
	if (!array || typeof array != "object" || typeof find == "undefined" || !array.length) {
		result=null
	}else{
		for(var i=0; i<array.length; i++){
			if(array[i]==find){
				result=i; break;
			}
		}
	}
	return result;
}
//array: sorted ["X1","X2","X3"]
//find: "X2";
//return null if not found, otherwise found index (0-indexed)
function binarySearch(array, find) {
	if (!array || typeof array != "object" || typeof find == "undefined" || !array.length) {
		return null;
	}
	var low = 0;
	var high = array.length - 1;
	var searchOrder = array[0] > array[array.length-1] ? 1 : 0;
	while (low <= high) {
		var foundIndex = parseInt((low + high) / 2);
		var foundValue = array[foundIndex];
		if (!searchOrder) {
			if (foundValue < find) {
				low = foundIndex + 1;
				continue;
			}
			if (foundValue > find) {
				high = foundIndex - 1;
				continue;
			}
		} else {
			if (foundValue > find) {
				low = foundIndex + 1;
				continue;
			}
			if (foundValue < find) {
				high = foundIndex - 1;
				continue;
			}
		}
		return foundIndex;
	}
	return null;
}
//XXX:
function showDWFWindowCloseButton(){
	var closeElem = document.getElementById("DWF_WIND_CLOSE_BUTTON");
	if(closeElem!=null){
		if(DWF_showCloseButton)
			closeElem.style.display = "";
		else
			closeElem.style.display = "none";

	}
}

function reSize(){
	try{
			objViewer.width=parent.document.body.clientWidth-30;
			objViewer.height=parent.document.body.clientHeight-60;
	} catch(e){
	}
}
