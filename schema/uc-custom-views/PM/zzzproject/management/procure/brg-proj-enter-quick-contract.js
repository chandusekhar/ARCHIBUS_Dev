function user_form_onload(){
/*
	var objConsoleFrame = getFrameObject(window, "consoleFrameMC");
	if (objConsoleFrame != null) {
		var view_project_id = objConsoleFrame.mc_project_id;
		if (view_project_id != null) {
			var restriction = new AFM.view.Restriction();
        	restriction.addClause('work_pkgs.project_id', view_project_id, '=');
			var centerPanel = AFM.view.View.getControl('centerFrame','centerPanel');
			if (centerPanel)
			{
				centerPanel.refresh(restriction);
				centerPanel.show(true);
			}
			var southPanel = AFM.view.View.getControl('southFrame','southPanel');
			if (southPanel)
			{
				southPanel.refresh(restriction);
				southPanel.show(true);
			}
		}
	}
*/	
	var tabsFrameDetails = getFrameObject(parent, "tabsFrame");
	if (tabsFrameDetails){
		tabsFrameDetails.restriction = "";
		tabsFrameDetails.setTabsRestriction(null,'quickContract');
//		tabsFrameDetails.setTabVisible("page2", false);
//		tabsFrameDetails.setTabVisible("doc", false);
//		tabsFrameDetails.setTabVisible("page3-sign", false);
		tabsFrameDetails.setTabVisible("page3-report", false);
//		tabsFrameDetails.setTabVisible("page4", false);
	}
}

function selectPage2(){ 	

	var edit_panel = AFM.view.View.getControl('','edit_panel');
	var restriction = new AFM.view.Restriction(edit_panel.getFieldValues());
	var tabsFrame = getFrameObject(parent, "tabsFrame"); 
	tabsFrame.restriction = restriction;
	
	tabsFrame.setTabVisible("quickContract", false);
	
/*	var tabsFrame = getFrameObject(parent, "tabsFrameDetails"); 
	var edit_panel = AFM.view.View.getControl('','edit_panel');
	
	var rest = "<restrictions><restriction type=\"sql\" sql=\""
	rest = rest + "work_pkg_bids.project_id = " + literalOrNull($('work_pkg_bids.project_id').value)
	rest = rest + " and work_pkg_bids.work_pkg_id = " + literalOrNull($('work_pkg_bids.work_pkg_id').value)  
	rest = rest + " and work_pkg_bids.vn_id = " + literalOrNull($('work_pkg_bids.vn_id').value) 
	rest = rest + "\"/></restrictions>";

	//var restriction = new AFM.view.Restriction(edit_panel.getFieldValues());
	//var restriction = tabsFrame.restriction;
	
	//restriction.addClause('work_pkg_bids.vn_id', $('work_pkg_bids.vn_id').value, '=');
	tabsFrame.restriction = edit_panel.restriction;
	//tabsFrame.refresh()
	tabsFrame.setTabsRestriction(rest,'page2');
	tabsFrame.setTabsRestriction(rest,'doc');
	tabsFrame.setTabsRestriction(rest,'page3-sign');
	tabsFrame.setTabsRestriction(rest,'page3-report');
	tabsFrame.setTabsRestriction(rest,'page4');
	tabsFrame.setTabVisible("quickContract", false);
*/

}

function literalOrNull(val, emptyString) {		
	if(val == undefined || val == null)
		return "NULL";
	else if (!emptyString && val == "")
		return "NULL";
	else
		return "'" + val.replace(/'/g, "''") + "'";
}


function approveBid(){
	var project_id = $('work_pkg_bids.project_id').value ;
	var work_pkg_id =$('work_pkg_bids.work_pkg_id').value;
	var vn_id = $('work_pkg_bids.vn_id').value;
	var parameters = {
		"project_id": project_id,
		"work_pkg_id": work_pkg_id,
		"vn_id": vn_id
	};
	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-approveWorkPkgBid', parameters);
	if (result.code == 'executed') {
	} else { 
		alert(result.code + " :: " + result.message);
	}	
}

function refreshOpener()
{
	parent.opener.refreshGrid();
}
/*
function refreshPanels()
{
	var detailsPanel = AFM.view.View.getControl('detailsFrame', 'detailsPanel');
	if (detailsPanel) 
	{
		detailsPanel.refresh();
		detailsPanel.show(true);
	}	
	var northPanel = AFM.view.View.getControl('northFrame', 'northPanel');
	if (northPanel) 
	{
		northPanel.refresh();
		northPanel.show(true);
	}		
}
*/
function getCurrentISODate()
{
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	= curDate.getDate();
	var year = curDate.getFullYear();
	month =  (month<10)?("0"+month):month;
	day =  (day<10)?("0"+day):day;
	return year + "-" + month + "-" + day;
}

function submitBid()
{
	var curDate = new Date();
	var month = curDate.getMonth()+1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	var formattedCurDate = FormattingDate(day, month, year, strDateShortPattern);
	$('work_pkg_bids.status').value = 'Approved';
	$('work_pkg_bids.date_submitted').value = formattedCurDate;
}


