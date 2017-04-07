var ucReplmBasicLeaseReportCtrl = View.createController('ucReplmBasicLeaseReportCtrl', {
    abViewdefReport_detailsPanel_onBtnLsView: function(row) {
        var ls_id = row.getFieldValue("ls.ls_id");
        var pr_id = row.getFieldValue("ls.pr_id");
        var bl_id = row.getFieldValue("ls.bl_id");

        var blpr = "b";
        if (bl_id == "" && pr_id != "") {
            blpr = "p";
        }

        View.openDialog("uc-repm-addedit-lease-form.axvw?ls_id="+ls_id+"&blpr="+blpr, "", false, {
                maximize: true}
        );
    }
});