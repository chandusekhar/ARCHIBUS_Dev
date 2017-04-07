var projCreateInvoicesController = View.createController('projCreateInvoices', {
	
	projCreateInvoicesForm_onIssue : function() {
		var controller = this;
		View.confirm(getMessage('issueWarning'), function(button) {
	        if (button == 'yes') {
	        	controller.projCreateInvoicesForm.setFieldValue('invoice.status', 'ISSUED');
	        	controller.projCreateInvoicesForm.save();
	        	controller.projCreateInvoicesGrid.refresh();
	        	controller.projCreateInvoicesForm.refresh();
	        }
	    });
	},
	
	projCreateInvoicesForm_onWithdraw : function() {
		this.projCreateInvoicesForm.setFieldValue('invoice.status', 'WITHDRAW');
		this.projCreateInvoicesForm.save();
		this.projCreateInvoicesGrid.refresh();
		this.projCreateInvoicesForm.refresh();
	}
});

function selectWorkPkg(row) {
	var project_id = row['work_pkgs.project_id'];
	var work_pkg_id = row['work_pkg_bids.work_pkg_id'];
	var vn_id = row['work_pkg_bids.vn_id'];
	var controller = View.controllers.get('projCreateInvoices');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('invoice.work_pkg_id', work_pkg_id);
	restriction.addClause('invoice.vn_id', vn_id);
	restriction.addClause('invoice.project_id', project_id);
	controller.projCreateInvoicesGrid.refresh(restriction);
	restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.work_pkg_id', work_pkg_id);
	restriction.addClause('activity_log.project_id', project_id);
	controller.projCreateInvoicesActionsGrid.refresh(restriction);
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

/****************************************************************
 * Work Package Restriction Console functions
 */

function onProjectIdSelval() {
	var restriction = "project.is_template = 0 AND EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = project.project_id "+
	"AND activity_log.work_pkg_id IN (SELECT work_pkg_id FROM work_pkg_bids WHERE work_pkg_bids.status "+
	"IN ( 'Contract Signed', 'In Process', 'In Process-On Hold', 'Completed', 'Completed and Verified', 'Paid in Full') "+
	"AND vn_id = (SELECT vn_id FROM vn WHERE vn.email='"+View.user.email+"')))";
	projectIdSelval(restriction);
}
