/******************************************************************
	common.js
	common.js contains common javascript variables or functions
	which are used by a lot of other javascript files;
	Generally, common.js will be referred by all top-level XSL files;
	HTML URL or HTML FORM SUBMIT target:
	(1) _top; (2) _blank; (3) _self; (4) user's window's or frame's name
 ******************************************************************/
/*************Debug flag***********************/
//Debug is used to make decision if some javascript results are shown
//to developers for debugging purpose
var Debug = false;
//set up Debug variable used in common.xsl
//<afmXmlView debug="true|false"> will enable or disable the debug
//feature in client-side
//bDebug: the value from <afmXmlView debug="true|false">
function SetDebugVariable(bDebug)
{
	Debug = bDebug;
}

/*
 * Browser detection varables: use to check which browser is running the web page.
 * Example:
 *     if (microsoftIEBrowser) { IE-specific code goes here }
 */
var mozillaFireFoxBrowser=(navigator.userAgent.toUpperCase()).indexOf("FIREFOX")>0;
var microsoftIEBrowser=(navigator.userAgent.toUpperCase()).indexOf("MSIE")>0;

/************************************************/
/***********a form(method:POST) with a hidden input ***/
//the form with a hidden field is used to send client-side
//request data to server in xml-formatted string
//<form name="afmHiddenForm" method="POST">
//<input type="hidden" name="xml" value="..."/>
//</form>
var afmHiddenFormName = "afmHiddenForm";
var xmlName = "xml";
/******************************************************/
/**********A common form's name for users's data inputs*****/
//user inputs form's name
var afmInputsFormName = "afmInputsForm";
/************************************************************/
//sending xml data string from hidden form with POST method to server
//strHiddenFormName is the hidden form's name: sending xml data
//strViewDefinitionFormName is the form's name to hold user's inputs
var strSerializedStartTag = "<";				//do not use &lt;
var strSerializedCloseTag = ">";				//do not use &gt;
var strSerializedInsertingDataFirstPart = "";	//<afmAction ....>
var strSerializedInsertingDataRestPart	= "";    //...</afmAction>
/********************************************************/
//set up from common.xsl
var strPdfAfmActionSerialized = "";
var strExcelAfmActionSerialized = "";
var strPdfGeneratingViewUrl = "";
/********************************************************/

/**
 * Returns HTML DOM element by ID. This is a shortcut for document.getElementById(),
 * and a palceholder for future extension in the manner of JQuery.
 * @param {elemID} Element ID.
 */
function $(elemID){
	return document.getElementById(elemID);
}

/**
 * Checks whether specified value is defined.
 */
function valueExists(value) {
    return (typeof(value) != 'undefined' && value != null);
}

/**
 * If specified value is defined and is not null, returns it.
 * Otherwise returns specified default value.
 */
function getValueIfExists(value, defaultValue) {
    return valueExists(value) ? value : defaultValue;
}

/**
 * Checks whether specified value is defined and not an empty string.
 */
function valueExistsNotEmpty(value) {
    return (typeof(value) != 'undefined' && value != null && trim(value) != '');
}



/**
 * Converts string or boolean value to boolean.
 */
function getBoolean(value) {
    var result = false;
    if (valueExists(value) && value != '') {
        if (typeof value == 'boolean') {
            result = value;
        } else if (typeof value == 'string') {
            result = (value == 'true');
        }
    }
    return result;
}

///strUrl: url link to server, currently this value is always "dump.axvw"
//strSerialized: xml string to communicate with server, coming from action
//strTarget: request's target
//subFrameName: the frame's names will be refreshed following this request
//bData:if inserting client's data into strSerialized(xml string)
function sendingDataFromHiddenForm(strUrl, strSerialized, strTarget, subFrameName ,bData, newWindowSettings)
{
	var objHiddenForm = document.forms[afmHiddenFormName];
	var strData = "";
	var strXMLValue = "";
	//if bData is true, insert client data into xml string

	if(bData){
		setSerializedInsertingDataVariables(strSerialized);
		//gettingRecordsData() is defined in corresponding JS file
		//which XSL is calling sendingDataFromHiddenForm
		strData = gettingRecordsData();
		if(strData==null) return;
		if(strData != ""){
			if(strData.indexOf("<userInputRecordsFlag>") < 0)
				strData = "<userInputRecordsFlag>" + strData + "</userInputRecordsFlag>";
			strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
		}else{
			strXMLValue = strSerialized;
		}
	}else{
		strXMLValue = strSerialized;
	}

	if(objHiddenForm != null){
		//a new window is opened
		if(strTarget == "_blank" || strTarget == "blank"){
			var newTargetWindowName	= "newTargetWindow";
			var newTargetWindowSettings = "titlebar=no,toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=1000,height=650";
			if(newWindowSettings != "")
				newTargetWindowSettings = newWindowSettings;
			var newWindowObj			= window.open("", newTargetWindowName,newTargetWindowSettings);
			//avoid the some part of new window is hidden form screen,
			//move it to the left top of screen
			newWindowObj.moveTo(10,10);
			strTarget = newTargetWindowName;
		}

		if(strUrl == "")
			strUrl = "login.axvw";

		objHiddenForm.elements[xmlName].value = strXMLValue;
		objHiddenForm.target = strTarget;
		objHiddenForm.action = strUrl;

		//sending the hidden form to server
		objHiddenForm.submit();
		//refreshing sub frame if thare is subFrame content in XML
		if(subFrameName != '')
			reloadFrameWindow(subFrameName);
	}
}

//set up related javascript varaibles
//strSerializedStartTag, strSerializedCloseTag,
//strSerializedInsertingDataFirstPart, strSerializedInsertingDataRestPart = "";    //...</afmAction>
//strSerialized: xml string from action
function setSerializedInsertingDataVariables(strSerialized)
{
	var numPos1 = 0;
	var numPos2 = 0;
	//since the format of strSerialized is dependent on how to pass it
	//to javascript in XSLT, two tag cases must be included.
	var strCloseTag1 = ">";
	var strStartTag1 = "<";
	var strCloseTag2 = "&gt;";
	var strStartTag2 = "&lt;";
	numPos1 = strSerialized.indexOf(strCloseTag1);
	if(numPos1 > 0){
		strSerializedInsertingDataFirstPart = strSerialized.substring(0, numPos1 + strCloseTag1.length);
		//strSerializedInsertingDataRestPart = strSerialized.substring(numPos1 + 1 + strCloseTag1.length);
		strSerializedInsertingDataRestPart = strSerialized.substring(numPos1  + strCloseTag1.length);
	}else{
		numPos2 = strSerialized.indexOf(strCloseTag2);
		if(numPos2 > 0){
			strSerializedInsertingDataFirstPart = strSerialized.substring(0, numPos2 + strCloseTag2.length);
			//strSerializedInsertingDataRestPart = strSerialized.substring(numPos2 + 1 + strCloseTag2.length);
			strSerializedInsertingDataRestPart = strSerialized.substring(numPos2 + strCloseTag2.length);
		}
	}
}

//sending afmAction request with client-side data string to the server
function sendingAfmActionRequestWithClientDataXMLString2Server(targetName, afmActionSerializedXSLString, clientDataXMLString)
{
	if(clientDataXMLString!=""){
		if(clientDataXMLString.indexOf("<userInputRecordsFlag>") < 0){
			clientDataXMLString = "<userInputRecordsFlag>" + clientDataXMLString + "</userInputRecordsFlag>";
		}
	}
	var strXML = "";
	//parsing afmActionSerializedXSLString into two parts
	setSerializedInsertingDataVariables(afmActionSerializedXSLString);
	//inserting client-side data
	strXML = strSerializedInsertingDataFirstPart + clientDataXMLString + strSerializedInsertingDataRestPart;
	//sending to server
	sendingDataFromHiddenForm('',strXML, targetName, '', false, '');
}

//reloading specified frame window by name
function reloadFrameWindow(frameName)
{
	var objFrame  = null;
	//passing window as initial object
	objFrame = getFrameObject(window, frameName);
	if(objFrame != null){
		if(Debug){
			//showing frame's url
			alert(objFrame.name +" href: " + objFrame.location.href);
		}
		if (document.images){
			//browsers support reload();
			objFrame.location.reload();
		}else{
			//browsers don't support reload();
			objFrame.location.href = objFrame.location.href;
		}
	}else{
		if(Debug){
			alert("Cannot find frame named by " + frameName);
		}
	}
}

//looking up to search a specified frame object by its name
function getFrameObject(parentObj,frameName)
{
	var returnedFrameObj = null;
	if(parentObj != null){
        // first search all frames of the parentObj
		if(parentObj.frames != null){
			for(var i=0; i< parentObj.frames.length; i++){
				var arr = [];
                var name = parentObj.frames[i].name;
				if(name != null || name != ""){
					arr = name.match(frameName);
				}
				if(arr != null){
					//finding a name-matched frame object
					returnedFrameObj = parentObj.frames[i];
					break;
				}
			}
		}
		// if not found, recursively search on the next level up
		if(returnedFrameObj == null){
			if(parentObj!=window.top && parentObj.parent!=window.top)
				returnedFrameObj = getFrameObject(parentObj.parent, frameName);
		}
	}
	return returnedFrameObj;
}

//called when users push selectV button
function OpenSelectVWindow(strXMLData)
{
	//open a new browser window
	var selectValueWindowName		= "selectValueWindow";
	var selectValueWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=500,height=600";
	var selectValueWindow			= window.open("", selectValueWindowName,selectValueWindowSettings);
	//call sendingDataFromHiddenForm(strUrl, strSerialized, strTarget,
	//subFrameName ,bData) to target selectValueWindow
	sendingDataFromHiddenForm("dynamic-content.axvw", strXMLData, selectValueWindowName, "", false);
}

//????how to handle a few localized strings?????
//opening a separation window to show server-side error message
var objErrorMsgWindow = null;
function OpenErrorMessageWindow(window_title, show_detail_button, original_exception, stack_trace, close_window, form_name, originalException_input_name,stackTrace_input_name,stackTraceAllowed_input_name, message, abSchemaSystemJavascriptFolder, previousPage, title)
{
	//???formating html???
	if(objErrorMsgWindow == null || objErrorMsgWindow.closed){
		objErrorMsgWindow = window.open("","errorMessageDisplayWindow","menubar=no,scrollbars=yes,resizable=yes,status=yes,width=300,height=300");
	}

	//js variable schemaPath will look like "/archibus/schema".
	//ab-trigger-close-dialog.js is making error dialog window look
	//like modal window
	//temp_string = temp_string + '<script language="JavaScript" src="'+abSchemaSystemJavascriptFolder+'/ab-trigger-close-dialog.js"><\/script>';

	var temp_string = '<html><head><title>' + window_title + '<\/title>';
	temp_string = temp_string + '<script language="JavaScript">function showMessage(){var obj_originalException=document.getElementById("originalException");obj_originalException.style.display="";var obj_stackTrace=document.getElementById("stackTrace");obj_stackTrace.style.display="";}; self.moveTo(0,0); setInterval("popupItself()",100); self.focus(); function popupItself(){self.focus();};<\/script>';
	temp_string = temp_string + '<\/head><body style="margin: 0px; font-family: verdana; font-size: 12px"><center>';
	temp_string = temp_string + '<div style="width: 100%; height: 23px; background-color: #AEBAB6; color: #FFFFFF; font-weight: bold; padding-top: 3px; margin-bottom: 12px">'+title+'</div>';
	temp_string = temp_string + '<div style="width: 80%; margin-bottom: 12px">' + message + '</div>';
	temp_string = temp_string + '<div style="width: 80%; margin-bottom: 12px"><input name="detailButton" type="button" value="'+show_detail_button+'" onclick="showMessage();" style="margin-right: 8px">';
    temp_string = temp_string + '<script language="JavaScript">if(opener!=null){var stackTraceAllowed=opener.document.forms["'+form_name+'"].elements["'+stackTraceAllowed_input_name+'"].value;var detailButtonObj=document.getElementById("detailButton");if( undefined !=detailButtonObj) { if(stackTraceAllowed=="true"){detailButtonObj.style.display="";} else {detailButtonObj.style.display="none";}}}<\/script>';
    temp_string = temp_string + '<input type="button" value="'+ close_window +'" onclick="window.close()"></div>';
	temp_string = temp_string + '<div style="width: 80%; margin-bottom: 12px; display: none" id="originalException">' + original_exception + ' : <script language="JavaScript">if(opener!=null)document.write(opener.document.forms["'+form_name+'"].elements["'+originalException_input_name+'"].value);<\/script><\/div>';
	temp_string = temp_string + '<div style="width: 80%; margin-bottom: 12px; display: none" id="stackTrace">' + stack_trace + ' : <script language="JavaScript">if(opener!=null)document.write(opener.document.forms["'+form_name+'"].elements["'+stackTrace_input_name+'"].value);<\/script><\/div><\/center><\/body><\/html>';

	objErrorMsgWindow.document.write(temp_string);
	if(previousPage=='true')
		window.history.go(-1);
}

//javascript to set up cookie
function setCookie(name, value, expire)
{
	var today = new Date() ;
	if(expire == null)
		today.setTime(today.getTime() - 1);
	document.cookie = name + "=" + escape(value) + ((expire == null) ? ("; expires="+today.toGMTString()) : ("; expires=" + expire.toGMTString()))
}
//javascript to get cookie
function getCookie(name)
{
	var re = new RegExp(name + "=([^;]+)");
	var value = re.exec(document.cookie);
	return (value != null) ? unescape(value[1]) : null;
}
//trim left side of input string
function trimLeft(str)
{
	//remove all whitespaces from str's left side
	return str.replace(/^\s+/,'');
}
//trim right side of input string
function trimRight(str)
{
	//remove all whitespaces from str's right side
	return str.replace(/\s+$/,'');
}
//trim left and right sides of input string
function trim(str)
{
	if (str) {
		var temp_str = trimLeft(str);
		return trimRight(temp_str);
	}
	return str;
}

//open content
function openNewContent(requestUrl, target)
{
	openNewContent(requestUrl, target, "");
}
function openNewContent(requestUrl, target, selectValueWindowconfig)
{
	var selectValueWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=450,height=450";
	if(selectValueWindowconfig!=null && selectValueWindowconfig!="")
		selectValueWindowSettings = selectValueWindowconfig;

	if(Debug){
	    // TODO: replace by logging
		// alert("Request URL: " + requestUrl);
	}
	if(target=="_blank" || target==""){
		var selectValueWindowName = "newWindow";

		var selectValueWindow = window.open(requestUrl, selectValueWindowName,selectValueWindowSettings);
		selectValueWindow.moveTo(10,10);
		// return new window object so caller can set focus if desired
		return selectValueWindow;
	}else{
		//target to frame
		var objHiddenForm = document.forms[afmHiddenFormName];
		objHiddenForm.target = target;
		objHiddenForm.action = requestUrl;
		objHiddenForm.submit();
	}
}
//working in IE and NN7.1
//usage: <input type="text" value="" name="" onkeypress="return disableInputEnterKeyEvent( event)"/>
function disableInputEnterKeyEvent(event)
{
	var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
	if (keyCode == 13)
		return false;
	else
		return true;
}
//changing five special characters into valid XML characters
/*
 >     => &gt;
 <	   => &lt;
 "     => &quot;
 '	   => &apos;
 &     => &amp;
*/
 //make sure that never convert any field values more than one times
 //otherwise, five special characters will be messed up.
 function convert2validXMLValue(fieldValue)
 {
	////must first convert & character////
	//make sure that existing "&amp;" in user's input will not become "&amp;amp;"!!!
	fieldValue = fieldValue.replace(/&amp;/g, '&')
	fieldValue = fieldValue.replace(/&/g, '&amp;')
	/////////////////////////////////////////////
	fieldValue = fieldValue.replace(/>/g, "&gt;");
	fieldValue = fieldValue.replace(/</g, "&lt;");
	fieldValue = fieldValue.replace(/\'/g, "&apos;");	
	//fieldValue = fieldValue.replace(/\"/g, '&quot;');
	//double ' for passing server-side xsd validation 
	fieldValue = fieldValue.replace(/\"/g, "&apos;&apos;");	
	return fieldValue;
 }
 // performs the conversion opposite to convert2validXMLValue()
 function convertFromXMLValue(fieldValue){
 	if(typeof fieldValue != "undefined" && fieldValue != null){
		fieldValue = fieldValue.replace(/&amp;/g, '&')
		fieldValue = fieldValue.replace(/&gt;/g, '>');
		fieldValue = fieldValue.replace(/&lt;/g, '<');
		fieldValue = fieldValue.replace(/&apos;/g, '\'');
		fieldValue = fieldValue.replace(/&quot;/g, '\"');
		return fieldValue;
	}
	return "";
 }
 //AND literalize Value for sql statement
 function convert2validXMLValueAndLiteralizeValue(fieldValue)
 {
	////must first convert & character////
	//make sure that existing "&amp;" in user's input will not become "&amp;amp;"!!!
	 fieldValue = fieldValue.replace(/&amp;/g, '&')
	 fieldValue = fieldValue.replace(/&/g, '&amp;')
	/////////////////////////////////////////////
	 fieldValue = fieldValue.replace(/>/g, "&gt;");
	 fieldValue = fieldValue.replace(/</g, "&lt;");
	//double ' for SQL statement
	 fieldValue = fieldValue.replace(/\'/g, "&apos;&apos;");
	 fieldValue = fieldValue.replace(/\"/g, '&quot;');
	 return fieldValue;
 }
 //handling memo field value when being sent to server
 //make sure that never convert any field values more than one times
 //otherwise, five special characters will be messed up.
 function convertMemo2validateXMLValue(fieldValue)
 {
	 //normal convertion
	 fieldValue = convert2validXMLValue(fieldValue);
	 //handling new line feeding characters: \r\n
	 var regular_expression = new RegExp ('\r\n', 'gi') ;
	 //never change the name "#AFM_FLAG_NEWLINE#"!!!!!
	 fieldValue = fieldValue.replace(regular_expression,"#AFM_FLAG_NEWLINE#");
	 //handling new line feeding characters: \n
	 var regular_expression_n = new RegExp ('\n', 'gi') ;
	 fieldValue = fieldValue.replace(regular_expression_n,"#AFM_FLAG_NEWLINE#");
	 //handling new line feeding characters: \r
	 var regular_expression_r = new RegExp ('\r', 'gi') ;
	 fieldValue = fieldValue.replace(regular_expression_r,"#AFM_FLAG_NEWLINE#");

	 return fieldValue;
 }
//insert a view name for rendering when afmAction is excuted by server
function insertRenderedAXVWFile2AfmAction(strAfmActionSerialized, renderedAXVWFileName)
{
      var xmlDoc= parseXml(unescape(strAfmActionSerialized), null, true);
      var afmActions=xmlDoc.getElementsByTagName('afmAction');
      for(var i=0; i <afmActions.length; i++){
          var stateAttrib = afmActions[i].getAttribute('state');
          if(!stateAttrib){
            stateAttrib=xmlDoc.createAttribute("state");
            stateAttrib.value=renderedAXVWFileName;
            afmActions[i].setAttributeNode(stateAttrib);
          } else {
            afmActions[i].setAttribute("state",renderedAXVWFileName);
          }
      }
      return serializingXML(xmlDoc);
 }


 //opening none axvw files such as html, PDF, and MS Word/EXCEL/PPT
 //when URL comes from two different domain, new window must be used
 //projectGraphicsFolder: archibus/../.../ in which folder the opened file is
 //located;
 //referredFileName: opened file name;
 //bNewWindow: true|false
 function openNoneAXVWFile(relativeWebRootFolderName, referredFileName, bNewWindow)
 {
	 if(relativeWebRootFolderName != "" && referredFileName != ""){
		 //weblogic server: ?a=1;?????
		 var urlLink =  relativeWebRootFolderName + "/" + referredFileName + "?a=1";
		 if(bNewWindow){
			 var newWindowName		= "newWindow";
			 var newWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=450,height=450";
			 var newWindowObject = window.open(urlLink, newWindowName,newWindowSettings);
		 }else{
			 window.location.href = urlLink;
		 }
	 }
 }
 /////////////////////////////////////////////
 //XXX: export reports
  //opening the printable pdf report
 var loadingPdfGeneratingView = false;
 function openPdfGeneratingView(xml)
 {
	 if(xml!=null && xml!=""){
		 loadingPdfGeneratingView = true;
		 strPdfAfmActionSerialized = xml;
		 var selectValueWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=600";
		 strPdfGeneratingViewUrl="ab-generating-pdf.axvw";
		 openNewContent(strPdfGeneratingViewUrl, "_blank", selectValueWindowSettings);
	 }
 }
 //opening the printable excel report
 var loadingExcelGeneratingView = false;
 function openExcelGeneratingView(xml)
 {
	 if(xml!=null && xml!=""){
		 loadingExcelGeneratingView = true;
		 strExcelAfmActionSerialized = xml;
		 var selectValueWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=600";
		 var excelGeneratingViewUrl="ab-generating-excel.axvw";
		 openNewContent(excelGeneratingViewUrl, "_blank", selectValueWindowSettings);
	 }
 }

////////////////////////////////////////////////
function insertXML2AfmActionXML(xml, data)
{
	setSerializedInsertingDataVariables(xml);
	if(data != "")
		xml = strSerializedInsertingDataFirstPart + data +  strSerializedInsertingDataRestPart;
	return xml;
}
//////////////////////////////////////////////////////////////////////
/*APIs to parse and handle XML Objects*/
function getXmlAttribute(fieldId, xpath, name)
{
	var node = selectSingleNode(null, fieldId, xpath);
	if(node==null)return;
	return node.getAttribute(name);
}

function setXmlAttribute(fieldId, xpath, name, value)
{
	var fieldObject = $(fieldId);
	if(fieldObject==null)return;

	var xml=fieldObject.value;
	var xmlDocument = parseXml(xml, null, true);
	var nodes = selectNodes(xmlDocument, null, xpath);
	if(nodes==null || nodes.length==0)return;

	for(var i=0; i<nodes.length; i++){
		nodes[i].setAttribute(name,value);
	}

	fieldObject.value=serializingXML(xmlDocument);
}

function parseXml(xmlString, fieldId, bEncoding)
{
	var xml = "";
	if(xmlString!=null && xmlString!=""){
		xml = xmlString;
	}else{
		var fieldObject = $(fieldId);
		if(fieldObject==null) return null;
		xml = fieldObject.value;
	}

	if(xml==null || xml==""){
		return;
	}
	if(bEncoding){
		xml = xml.replace(/&gt;/g, ">");
		xml = xml.replace(/&lt;/g, "<");
		xml = xml.replace(/&quot;/g, '"');
		xml = xml.replace(/\'\'/g, '"');
	}

	var xmlDocument = null;
	if (window.ActiveXObject) {
		xmlDocument = new ActiveXObject('Microsoft.XMLDOM');
		xmlDocument.async = false;
		var loaded = xmlDocument.loadXML(xml);
	}else if(document.implementation && document.implementation.createDocument){
		xmlDocument = document.implementation.createDocument("","",null);
		xmlDocument.async = false;
		var objDOMParser = new DOMParser();
		xmlDocument = objDOMParser.parseFromString(xml, "text/xml");
		objDOMParser=null;
	}

	return xmlDocument;
}

function serializingXML(xmlDocument)
{
	var result="";
	if (window.ActiveXObject) {
		result = xmlDocument.xml;
	}else if(document.implementation && document.implementation.createDocument){
		var objXMLSerializer = new XMLSerializer;
		result = objXMLSerializer.serializeToString(xmlDocument);
		objXMLSerializer = null;
	}
	return result;
}

function selectNodes(xmlDocument, fieldId, xpath)
{
	var result=[];
	if(xmlDocument==null)
		xmlDocument = parseXml(null, fieldId, true);

	if(xmlDocument==null)return null;

	if (window.ActiveXObject) {
		result = xmlDocument.selectNodes(xpath);
	}else if(document.implementation && document.implementation.createDocument){
		var tempResult = xmlDocument.evaluate(xpath, xmlDocument,null, XPathResult.ANY_TYPE,null);
		var i=0;
		while (tempNode=tempResult.iterateNext()) {result[i++] = tempNode;}
	}
	return result;
}

function selectSingleNode(xmlDocument, fieldId, xpath)
{
	var result=null;
	var nodes = selectNodes(xmlDocument, fieldId, xpath);
	if(nodes!=null)
		result = nodes[0];
	return result;
}
//return localized message
function getMessage(name){
	var result="";
	//consistent with handling message in common.xsl
	var elemObj = $("message_"+name);
	if(elemObj!=null)
		result = elemObj.innerHTML;

	return result;
}
/**
 * Sets specified panel title.
 * @param {panelName} Name attribute of panel or afmTableGroup elements in AXVW.
 * @param {title}     Title text.
 */
function setPanelTitle(panelName, title) {
    var panelTitleTD = $(panelName + '_title');
    if (panelTitleTD != null) {
        panelTitleTD.innerHTML = title;
    }
}

/**
 * Returns specified panel title.
 * @param {panelName} Name attribute of panel or afmTableGroup elements in AXVW.
 * @return            Title text.
 */
function getPanelTitle(panelName) {
    var title = '';
    var panelTitleTD = $(panelName + '_title');
    if (panelTitleTD != null) {
        title = panelTitleTD.innerHTML;
    }
    return title;
}

//////////////////////////////////////////////////////////////////////////
