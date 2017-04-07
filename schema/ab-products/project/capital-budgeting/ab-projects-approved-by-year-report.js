/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Completed-Pending')");
}

/**
 * 05/27/2010 IOAN KB 3027743
 * apply console restriction on drill down
 * @param {Object} cmdCtx
 */
function showDetailsOnClick(cmdCtx){
	var targetPanel = View.panels.get('projectsApprovedByYearDrilldownGrid');
	var consoleRestriction = getConsoleRestriction();
	var commandRestriction = cmdCtx.command.getRestriction();
	for(var i=0;i< commandRestriction.clauses.length;i++){
		var clause = commandRestriction.clauses[i];
		consoleRestriction += " " + clause.relOp + " " + clause.name + " " + clause.op ;
		if(clause.op != "IS NULL" && clause.op != "IS NOT NULL"){
			consoleRestriction += "'"+ clause.value +"'";
		}
	}
	consoleRestriction += " AND project.status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Completed-Pending')";
	consoleRestriction += " AND EXISTS (SELECT * from projfunds WHERE project.project_id = projfunds.project_id)";
	
	if ($('select_display')) {
	    var display = $('select_display').value;
	    if (display == '0') consoleRestriction += " AND project.program_id IS NOT NULL";
	    else if (display == '1') consoleRestriction += " AND project.program_id IS NOT NULL";    	
	}
	
	targetPanel.refresh(consoleRestriction, false);
	targetPanel.showInWindow({});
}
