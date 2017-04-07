var goaReportController = View.createController('goaReportController', {
    afterViewLoad: function() {
        //turn off print icon and mail icon.
        View.setToolbarButtonVisible('printButton', false);
        View.setToolbarButtonVisible('emailButton', false);
        View.setToolbarButtonVisible('alterButton', false);
        View.setToolbarButtonVisible('favoritesButton', false);
    }
});

function onShow() {
    var consolePanel = View.panels.get("consolePanel");
    var infoPanel = View.panels.get("projectInfoPanel");
    var costsPanel = View.panels.get("projectCostsPanel");

    // get Restriction
    var hasRest = false;
    var restriction = "1=1";
    var costRest = "1=1";

    var projectId = consolePanel.getFieldValue('brg_project_view.project_id');
    if (projectId) {
        restriction += " AND brg_project_view.project_id = '"+projectId.replace(/'/g, "''")+"'";
        costRest += " AND brg_proj_report_goa_view.project_id = '"+projectId.replace(/'/g, "''")+"'";
        hasRest = true;
    }

    var intNum = consolePanel.getFieldValue('brg_project_view.int_num');
    if (intNum) {
        restriction += " AND brg_project_view.int_num = '"+intNum.replace(/'/g, "''")+"'";
        costRest += " AND brg_proj_report_goa_view.project_id = (SELECT project_id FROM brg_project_view WHERE brg_project_view.int_num = '"+intNum.replace(/'/g, "''")+"')";
        hasRest = true;
    }

    if (hasRest) {
        infoPanel.refresh(restriction);
        costsPanel.refresh(costRest);
    }
    else {
        View.showMessage("No Project has been chosen, please choose a Project.");
    }
}

function export_docx()
{
    var consolePanel = View.panels.get("consolePanel");

    // get Restriction
    var hasRest = false;
    var restriction = "1=1";

    var projectId = consolePanel.getFieldValue('brg_project_view.project_id');
    if (projectId) {
        restriction += " &brg_project_view.project_id="+projectId;
        hasRest = true;
    }

    var intNum = consolePanel.getFieldValue('brg_project_view.int_num');
    if (intNum) {
        restriction += " &brg_project_view.int_num="+intNum;
        hasRest = true;
    }

    if (hasRest) {
        View.openDialog('ab-paginated-report-job.axvw?viewName=brg-proj-report-goa-docx.axvw&newtab=true&showresult=true'+restriction, null, false);
    }
    else {
        View.showMessage("No Project has been chosen, please choose a Project.");
    }
}