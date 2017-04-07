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
