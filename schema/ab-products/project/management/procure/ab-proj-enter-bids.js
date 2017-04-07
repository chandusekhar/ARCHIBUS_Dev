var projEnterBidsController = View.createController('projEnterBids', {
	
	afterInitialDataFetch : function() {
		clearConsole();
	}
});

/****************************************************************
 * Work Package Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("EXISTS(SELECT * FROM work_pkgs WHERE work_pkgs.project_id = project.project_id AND work_pkgs.status IN ('Approved-Out for Bid'))");
}

function onWorkPkgIdSelval() {
	workPkgIdSelval("work_pkgs.status IN ('Approved-Out for Bid')");
}