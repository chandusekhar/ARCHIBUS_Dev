function showDetails(context)
{
	var treePanel = AFM.view.View.getControl('treeFrameMC','treePanel');
	var restriction = treePanel.getPrimaryKeysForRow(this);
	var project_id = restriction['project.project_id'];
	var objConsoleFrame = getFrameObject(window, "consoleFrameMC");
	if (objConsoleFrame != null) {
		objConsoleFrame.mc_project_id = project_id;
	}
			
	var menuType = getMessage('menuType');
	if (menuType)
	{
		var tabsFrame = getFrameObject(window,'tabsFrame');
		if (tabsFrame && project_id != "")
		{
				project_id = escape(project_id);
				project_id = project_id.replace(/\+/g, '%2B');
			tabsFrame.location.href = "brg-proj-console-"+menuType+"-tabs.axvw?handler=com.archibus.config.Find&project.project_id="+project_id;
		}
	}
}