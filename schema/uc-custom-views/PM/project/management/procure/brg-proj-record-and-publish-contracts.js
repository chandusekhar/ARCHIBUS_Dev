var projRecordPublishContractsController = View.createController('projRecordPublishContracts', {
	selectWorkPkgReport_afterRefresh : function() {
		this.selectWorkPkgReport.gridRows.each(function (row) {
		   var status = row.getRecord().getValue('work_pkg_bids.status');
		   if (status != 'Approved') {
			   var action = row.actions.get('sign');
			   action.show(false);
		   }
		});
	}
});

/****************************************************************
 * Work Package Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("EXISTS(SELECT * FROM work_pkgs WHERE work_pkgs.project_id = project.project_id)");
}

function onWorkPkgIdSelval() {
	workPkgIdSelval("");
}
