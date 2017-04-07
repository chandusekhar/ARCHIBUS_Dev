var projApproveBidsController = View.createController('projApproveBids', {
	
	projApproveBidsGrid_afterRefresh : function() {
		this.projApproveBidsGrid.gridRows.each(function (row) {
		   var status = row.getRecord().getValue('work_pkgs.status');
		   if (status == 'Approved-Bids Award') {
			   var action = row.actions.get('approve');
			   action.show(false);
		   }
		});
	},
	
	projApproveBidsApproveColumnReport_onApprove : function(row, action) {
		var record = this.projApproveBidsApproveColumnReport.getRecord();
		var project_id = record.getValue('work_pkg_bids.project_id');
		var work_pkg_id = record.getValue('work_pkg_bids.work_pkg_id');
		var vn_id = record.getValue('work_pkg_bids.vn_id');
		var parameters = {
			"project_id": project_id,
			"work_pkg_id": work_pkg_id,
			"vn_id": vn_id
		};
		var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-approveWorkPkgBid', parameters);
		if (result.code == 'executed') 
		{
			this.projApproveBidsApproveColumnReport.refresh();
			this.selectWorkPkgReport.refresh();
			this.projApproveBidsGrid.refresh();
			View.showMessage(String.format(getMessage('bidApproved'), vn_id));
			View.closeThisDialog();
		} else 
		{ 
			alert(result.code + " :: " + result.message);
		}	
	}
});

/****************************************************************
 * Work Package Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("EXISTS(SELECT * FROM work_pkgs WHERE work_pkgs.project_id = project.project_id AND work_pkgs.status IN ('Approved-Out for Bid', 'Approved-Bid Review'))");
}

function onWorkPkgIdSelval() {
	workPkgIdSelval("work_pkgs.status IN ('Approved-Out for Bid', 'Approved-Bid Review')");
}
