/******************************************************************
	common-tabs.js
	Yong Shao
	2006-01-25
 ******************************************************************/
var tabsAfmActions = new Array();
var tabsWorkFlowRuleActions = new Array();
var restrictionsForTabAction = "";
var restrictionsForTabActionByName = new Array();
var queryParametersForTabAction = "";
var queryParametersForTabActionByName = new Array();
var tabsEventListener = "";
var selectedTabName = "";
var debugMode = false;
var tabsStatus=[];
var tabsViewNames=[];

//used to debug when debugMode=true
function debug(message) {
    if (debugMode) {
        alert(message);
    }
}
//called when users click on a tab to invoke its content
function onClickTab(tabName)
{
	var tab = $(tabName);
	var status = tabsStatus[tabName];
	if(status=="" || status=="selected"){
		if(tabsEventListener!=""){
			if(!eval(tabsEventListener)) {
				return;	
			}
		}
		selectTab(tabName);
	}
}
//private function: intialize and invoke tab's content
function selectTab(tabName)
{
	selectedTabName = tabName;
	
	//clear
	tabsEventListener="";

	setUpSelectedTabCSS(tabName);
	
	var renderActionXML = tabsAfmActions[tabName][0];
	var target = tabsAfmActions[tabName][1];
	var insertedXML = "";
	
	if(restrictionsForTabActionByName[tabName]!=null && restrictionsForTabActionByName[tabName]!=""){
		insertedXML = restrictionsForTabActionByName[tabName];
	}else{
		insertedXML = this.restrictionsForTabAction;
	}
	
	if(queryParametersForTabActionByName[tabName]!=null && queryParametersForTabActionByName[tabName]!=""){
		insertedXML = insertedXML + queryParametersForTabActionByName[tabName];
	}else{
		insertedXML = insertedXML + this.queryParametersForTabAction;
	}
	
	var wrfXML = tabsWorkFlowRuleActions[tabName];
	tabsWorkFlowRuleActions[tabName] = "";//XXX????
	if(wrfXML!=""){
		//XXX: insert restrictions into render action
		insertedXML = insertXML2AfmActionXML(insertedXML,renderActionXML)
		//XXX: insert render action into wrf action and run wrf
		sendingAfmActionRequestWithClientDataXMLString2Server(target, wrfXML, insertedXML);
	}else{
		//XXX: insert restrictions into render action and run render
		sendingAfmActionRequestWithClientDataXMLString2Server(target, renderActionXML, insertedXML)
	}
}
//return selected tab's name
function getSelectedTabName() {
	return selectedTabName;
}
//private function: change UI of tabs when a tab is selected
function setUpSelectedTabCSS(tabName)
{
	for(var s in tabsAfmActions){
		var tabObj = $(s);
		var status = tabsStatus[s];
		if(tabObj!=null){
			if(s==tabName){
				if(status=="selected")
					tabObj.className="selected";
				else
					tabObj.className="disabled_selected";
			}else{
				if(status=="disabled")
					tabObj.className="disabled";
				else
					tabObj.className="";
			}
		}

	}

}
//set up a restriction imposed on all tabs    
function setTabsRestriction(restriction)
{
	if(restriction==null)
		restriction = "";
	if(restriction!=""){
		if(restriction.indexOf("<userInputRecordsFlag>") < 0)
			restriction = '<userInputRecordsFlag>' + restriction + '</userInputRecordsFlag>';
		if(restriction.indexOf("<restrictions>") < 0)
			restriction = '<restrictions>' + restriction + '</restrictions>';
	}
	if (typeof arguments[1] != "undefined"){
		var tabName= arguments[1];
		restrictionsForTabActionByName[tabName]= restriction;
		debug(arguments[1] + ":\n\n " + restriction);
	}else{	
		
		this.restrictionsForTabAction = restriction;
		debug("Global: \n\n" + restriction);
	}
}
//return the restriction of tabs
function getTabsRestriction() {
	if (typeof arguments[0] != "undefined"){
		return restrictionsForTabActionByName[arguments[0]];
	} else {	
		return this.restrictionsForTabAction;
	}
}
//set query's parameters of tabs which are used by WFR(MDX?)
function setTabsQueryParameters(parameters)
{
	if(parameters==null)
		parameters = "";

	if(parameters!=""){
		if(parameters.indexOf("<userInputRecordsFlag>") < 0)
			parameters = '<userInputRecordsFlag>' + parameters + '</userInputRecordsFlag>';
		if(parameters.indexOf("<queryParameters>") < 0)
			parameters = '<queryParameters>' + parameters + '</queryParameters>';
	}
	if (typeof arguments[1] != "undefined"){
		queryParametersForTabActionByName[arguments[1]]= parameters;
	}else{	

		this.queryParametersForTabAction = parameters;
	}
	
}
//assign WFR seralized action XML to specified tab by its name
function setTabWFRActionXML(tabName, xml)
{
	tabsWorkFlowRuleActions[tabName] = xml;
}
//add event to tabs
function addTabsEventListener(event)
{
	tabsEventListener=event;
}
//enable or disable specified tab by its name
function setTabEnabled(tabName, isEnabled)
{
	for(var name in tabsAfmActions){
		if(tabName==name){
			doEnablingTabs(name, isEnabled);
			break;
		}
	}
}
//enable or disable all tabs
function setAllTabsEnabled(isEnabled)
{
	for(var name in tabsAfmActions){
		doEnablingTabs(name, isEnabled);
	}
}
//private function: update tab's UI
function doEnablingTabs(name, isEnabled)
{
	var tab = $(name);
	var className = tab.className;
	if(isEnabled){
		if(className=="disabled"){
			tabsStatus[name]="";
			tab.className="";
		}//else{
			//tabsStatus[name]="selected";
			//tab.className="selected";
		//}
	}else{
		if(className=="selected"){
			tabsStatus[name]="disabled_selected";
			tab.className="disabled_selected";
		}else{
			tabsStatus[name]="disabled";
			tab.className="disabled";
		}
	}

}

/**
 * Shows (visible==true) or hides (visible==false) specified tab page.
 */
function setTabVisible(tabName, visible) 
{
    var tab = $(tabName);
    if (tab != null) {
        if (visible) {
            tab.style.display = "inline";
        } else {
            tab.style.display = "none";
        }
    }
}

/**
 * Sets specified tab page title.
 * @param {tabName} Name attribute of tab element in AXVW.
 * @param {title}   Title text.
 */
function setTabTitle(tabName, title) {
    var tab = $(tabName);
    if (tab != null) {
        tab.firstChild.nodeValue  = title;
    }
}

/**
 * Returns specified tab page title.
 * @param {tabName} Name attribute of tab element in AXVW.
 * @return          Title text.
 */
function getTabTitle(tabName) {
    var title = '';
    var tab = $(tabName);
    if (tab != null) {
        title = tab.firstChild.nodeValue ;
    }
    return title;
}

// -------------------------------------------------------------------------------------------------
// support for view-specific tab frame initialization
//
// default implementation: do nothing
function user_form_onload(){}

// we need this event handler to call overloaded function 
function tabs_onload() 
{
    user_form_onload();
}

// set Window event handler (cannot be overloaded)
window.onload=tabs_onload;