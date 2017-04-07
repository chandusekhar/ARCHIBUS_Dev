var projCreateWorkRequestController = View.createController('projCreateWorkRequest', {
    projCreateWorkRequestColumnReport_onCreateRequest : function() {
        var projCreateWorkRequestColumnReport = View.panels.get('projCreateWorkRequestColumnReport');

        View.openProgressBar("Submitting Work Request");

        // Replace stock createWorkRequstForAction with a standard Service Request submission, with the
        // assessment_id filled to link back to the Project Action.
        /*
        var activity_log_id = this.projCreateWorkRequestColumnReport.restriction['activity_log.activity_log_id'];
        var parameters = {'activity_log_id': activity_log_id, 'updatedRecordsRequired':false};
        var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-createWorkRequestForAction', parameters);
        if (result.code == 'executed') {
            this.projCreateWorkRequestRequestGrid.refresh();
        } else {
            View.showMessage(result.code + " :: " + result.message);
        }
        */

        // get Account Code
        var projectId = projCreateWorkRequestColumnReport.getFieldValue('activity_log.project_id');
        var accountCode = projCreateWorkRequestColumnReport.getFieldValue('activity_log.ac_id');
        if (accountCode == "" ){
            // Get Account Code from Project if Action does not have an Account
            var projectRestriction = "project.project_id = "+BRG.Common.literalOrNull(projectId, true);
            accountCode = BRG.Common.getDataValue("project", "ac_id", projectRestriction);
        }

        // fill Description
        var requestDescription = "";
        requestDescription = requestDescription + "Project:  " +  projectId + "\r\n"
        requestDescription = requestDescription + "Action Title:  " +  projCreateWorkRequestColumnReport.getFieldValue('activity_log.action_title')  + "\r\n"
        requestDescription = requestDescription + "Action Id:  " +  projCreateWorkRequestColumnReport.getFieldValue('activity_log.activity_log_id')  + "\r\n"
        requestDescription = requestDescription + "Description:  "   + "\r\n"
        requestDescription = requestDescription + projCreateWorkRequestColumnReport.getFieldValue('activity_log.description')  + "\r\n"

        var submitRecord = {};

        submitRecord["activity_log.assessment_id"] = projCreateWorkRequestColumnReport.getFieldValue("activity_log.activity_log_id");
        submitRecord["activity_log.activity_log_id"] = "0";
        submitRecord["activity_log.activity_type"] = "SERVICE DESK - MAINTENANCE";
        submitRecord["activity_log.tr_id"] = "CCC";
        submitRecord["activity_log.priority"] = "1";
        submitRecord["activity_log.prob_type"] = projCreateWorkRequestColumnReport.getFieldValue("activity_log.prob_type");
        submitRecord["activity_log.created_by"] = View.user.employee.id;
        submitRecord["activity_log.requestor"] = View.user.employee.id;
        submitRecord["activity_log.phone_requestor"] = View.user.employee.phone;

        submitRecord["activity_log.site_id"] = projCreateWorkRequestColumnReport.getFieldValue("activity_log.site_id");
        submitRecord["activity_log.bl_id"] = projCreateWorkRequestColumnReport.getFieldValue("activity_log.bl_id");
        submitRecord["activity_log.fl_id"] = projCreateWorkRequestColumnReport.getFieldValue("activity_log.fl_id");
        submitRecord["activity_log.rm_id"] = projCreateWorkRequestColumnReport.getFieldValue("activity_log.rm_id");
        submitRecord["activity_log.location"] = projCreateWorkRequestColumnReport.getFieldValue("activity_log.location");


        submitRecord["activity_log.description"] = requestDescription;
        submitRecord["activity_log.ac_id"] = accountCode;

        // Submit Request
        try {
            var submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, submitRecord);
            this.projCreateWorkRequestRequestGrid.refresh();
            View.closeProgressBar();
        }
        catch (e) {
            View.closeProgressBar();
            Workflow.handleError(e);
        }
    }
});

function projCreateWorkRequestGridOnSelectAction(row) {
    var activityLogId = row["activity_log.activity_log_id"];

    var actionRest = "activity_log.activity_log_id = "+activityLogId;
    var wrRest = "wr.activity_log_id IN (SELECT activity_log_id FROM activity_log WHERE assessment_id = "+activityLogId+")";

    View.panels.get("projCreateWorkRequestColumnReport").refresh(actionRest);
    View.panels.get("projCreateWorkRequestRequestGrid").refresh(wrRest);
}