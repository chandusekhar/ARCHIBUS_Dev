// ab-eq-edit-old.js

function showTree() {
	var treePanel = View.panels.get("abEqEditTreePanel");
	var equipmentId = View.panels.get("abEqEditConsole").getFieldValue("eq.eq_id");
	if (trim(equipmentId) == "") {
		treePanel.refresh("1=1");
	}
	else {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("eq.eq_id",equipmentId,"LIKE");
		treePanel.refresh(restriction);
	}
}
