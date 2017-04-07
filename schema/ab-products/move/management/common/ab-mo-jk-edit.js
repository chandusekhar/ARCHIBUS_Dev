// ab-mo-jk-edit.js

function showTree() {
	var treePanel = View.panels.get("treePanel");
	var jackId = View.panels.get("requestConsole").getFieldValue("jk.jk_id");
	if (trim(jackId) == "") {
		treePanel.refresh("1=1");
	}
	else{
		var restriction = new Ab.view.Restriction();
		restriction.addClause("jk.jk_id",jackId,"LIKE");
		treePanel.refresh(restriction);
	}
}
