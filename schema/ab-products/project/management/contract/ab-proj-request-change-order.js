var projRequestChangeOrderController = View.createController('projRequestChangeOrder', {

	projRequestChangeOrderForm_onRequest : function() {
		var curDate = new Date();
		var date_planned_for = getDateObject(this.projRequestChangeOrderForm.getFieldValue('activity_log.date_planned_for'));//note that getFieldValue returns date in ISO format
		var controller = this;
		if ((curDate - date_planned_for)/(1000*60*60*24) >= 1){
			View.confirm(getMessage('dateBeforeCurrent'), function(button) {
	            if (button == 'yes') {
	            	controller.requestChangeOrder();
	            }
	        });
		}
		else this.requestChangeOrder();
	},
	
	requestChangeOrder : function() {
		this.projRequestChangeOrderForm.setFieldValue('activity_log.date_scheduled', this.projRequestChangeOrderForm.getFieldValue('activity_log.date_planned_for'));
		this.projRequestChangeOrderForm.setFieldValue('activity_log.duration', this.projRequestChangeOrderForm.getFieldValue('activity_log.duration_est_baseline'));
		this.projRequestChangeOrderForm.setFieldValue('activity_log.hours_est_design', this.projRequestChangeOrderForm.getFieldValue('activity_log.hours_est_baseline'));
		this.projRequestChangeOrderForm.setFieldValue('activity_log.created_by', View.user.email);
		this.projRequestChangeOrderForm.setFieldValue('activity_log.status', 'REQUESTED');
		this.projRequestChangeOrderForm.setFieldValue('activity_log.requestor_type', 'Vendor');
		this.projRequestChangeOrderForm.setFieldValue('activity_log.activity_type', 'PROJECT - CHANGE ORDER');
		this.projRequestChangeOrderForm.save();	
	}
});

function selectWorkPkg(row) {
	var work_pkg_id = row['work_pkg_bids.work_pkg_id'];
	var project_id = row['work_pkgs.project_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.work_pkg_id', work_pkg_id);
	restriction.addClause('activity_log.project_id', project_id);
	View.panels.get('projRequestChangeOrderForm').newRecord = true;
	View.panels.get('projRequestChangeOrderForm').refresh(restriction);
	View.panels.get('projRequestChangeOrderForm').show();
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






