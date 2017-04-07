function user_form_onload(){
	if ($('detailsPanel_head')){
		var tabsFrameDetails = getFrameObject(parent,'tabsFrameDetails');
		if (tabsFrameDetails == null) {
			tabsFrameDetails=getFrameObject(parent.parent, "tabsFrame");
		}
		

		var project_id = tabsFrameDetails.restriction['work_pkg_bids.project_id'];
		var work_pkg_id = tabsFrameDetails.restriction['work_pkg_bids.work_pkg_id'];
		var restriction = new AFM.view.Restriction();
		restriction.addClause('activity_log.project_id', project_id);
		restriction.addClause('activity_log.work_pkg_id', work_pkg_id);
		var detailsPanel = AFM.view.View.getControl('detailsFrame','detailsPanel');
		detailsPanel.refresh(restriction);

	}
	
	if ($('consolePanel_head')){
		var tabsFrameDetails = getFrameObject(parent,'tabsFrameDetails');
		if (tabsFrameDetails == null) {
			tabsFrameDetails=getFrameObject(parent.parent, "tabsFrame");
			var console_panel = AFM.view.View.getControl('consoleFrame','consolePanel');
			console_panel.restriction = tabsFrameDetails.restriction;
			console_panel.refresh();
			console_panel.show(true);
		}
		


	}

}

function cancel() {
	var tabsFrameDetails = getFrameObject(parent,'tabsFrameDetails');
//	if (tabsFrameDetails == null) {tabsFrameDetails=getFrameObject(parent.parent, "tabsFrameDetails");}
//	if (tabsFrameDetails.findTab('page1') == null) {

	if (tabsFrameDetails == null) {
		parent.opener.AFM.view.View.closeDialog()
	}
	else if (tabsFrameDetails.document.getElementById('page1') == null) {
		parent.opener.AFM.view.View.closeDialog()
	}
	else {
		tabsFrameDetails.selectTab("page1",null,false,true)
	}
}