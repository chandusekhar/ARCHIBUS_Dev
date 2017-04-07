var projFcpmDashQcAgeController = View.createController('projFcpmDashQcAge',{
	
});

function selectItem(obj) {
	if (obj.restriction.clauses[0]) {
		var project_title = obj.restriction.clauses[0].value;
		var index = project_title.indexOf(']');
		var project_id = project_title.substring(1, index);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
		View.openDialog('ab-proj-fcpm-dash-qc-projs-dtl.axvw', restriction);
	}
}
