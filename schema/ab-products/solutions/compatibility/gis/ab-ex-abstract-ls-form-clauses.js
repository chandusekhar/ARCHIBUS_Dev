
function user_form_onload() {
	onloadHelper();
}

function onloadHelper() {
    window.tabs = getFrameObject(parent, 'tabsFrame');
    //alert(window.tabs.getTabsRestriction("clauses"));
    if (window.tabs == null) {
        alert("This view can only be used as a part of the Abstract Builder wizard");
    }
    
    if ((window.tabs.ls_id != null) && (window.tabs.ls_id != ""))
    	setPanelTitle("LeaseClauses", "Manage Lease Clauses - " + window.tabs.ls_id);
}

function addClause(action, target) {
	var restriction = window.tabs.getTabsRestriction("clauses");
	self.newWindow = openNewWindow();
	sendAction(action, restriction, self.newWindow.name);
}

function editClause(action, rowPKs, target)
{
	var restriction = getParsedRestrictionFromRowKeys(rowPKs);
	self.newWindow = openNewWindow();
	sendAction(action, restriction, self.newWindow.name);
}

function getClauseRestrictionFromRowKeys(rowPKs)
{
	var returnedValue="";
	rowPKs = trim(rowPKs);
	if(rowPKs!=""){
		rowPKs = convert2validXMLValue(rowPKs);
		rowPKs = rowPKs.replace(/AFM_FLAG::QUOTE/g, '"');
		var tempArrayMain = rowPKs.split(" ");
		for(var i=0;i<tempArrayMain.length/2;i++){
			var tempArray = tempArrayMain[i].split("=");
			for(var j=0;j<tempArray.length/2;j++){
				var name= tempArray[j];
				name = trim(name);
				var table = name.split(".")[0];
				var field = name.split(".")[1];
				var value = tempArray[j+1];
				value = trim(value);
				returnedValue = returnedValue + '<clause relop="AND" op="=" value='+value+'><field name="'+field+'" table="'+table+'"/></clause>';		
			}
		}

	}
	if(returnedValue!=""){
		returnedValue = '<userInputRecordsFlag><restrictions><restriction type="parsed">'+returnedValue+'</restriction></restrictions></userInputRecordsFlag>';
	}

	return returnedValue;
}

function openNewWindow(newTargetWindowconfig)
{
	var newTargetWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=768,height=640";
	if(newTargetWindowconfig!=null && newTargetWindowconfig!="")
		newTargetWindowSettings = newTargetWindowconfig;

		var newTargetWindowName = "newWindow";

		var newTargetWindow = window.open("", newTargetWindowName,newTargetWindowSettings);
		newTargetWindow.moveTo(10,10);
		// return new window object so caller can set focus if desired
		return newTargetWindow;
}

//function openDialog(viewName) {
//	var newWindowSettings = "toolbar=no,menubar=no,resizable=yes,scrollbars=no,status=yes,width=600,height=400";
//	self.newWindow = openNewContent(viewName, "", newWindowSettings);
//	self.newWindow.focus();
//}

function refreshPage(pageNameToRefresh) {
    if (window.tabs != null) {
        window.tabs.selectTab(pageNameToRefresh); 
    }
    
    // close the pop-up window
    if (self.newWindow != null) {
        self.newWindow.close();
        self.newWindow = null;
    }
}