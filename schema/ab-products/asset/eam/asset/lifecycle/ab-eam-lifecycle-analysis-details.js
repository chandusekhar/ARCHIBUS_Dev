var analisysDetailsController = View.createController('analisysDetailsController', {
    onEditRow: function (row) {
        var record = row.row.getRecord();
        var eqId = record.getValue('eq.eq_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('eq.eq_id', eqId, '=');
        View.openDialog('ab-eq-edit-form.axvw', restriction, false, {
            width: 1024,
            height: 800,
            closeButton: true,
            callback: function () {
                analisysDetailsController.analysisDetailsPanel.refresh(analisysDetailsController.analysisDetailsPanel.restriction);
            }
        });
    },

    onProfileRow: function (row) {
        var record = row.row.getRecord();
        var eqId = record.getValue('eq.eq_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('eq.eq_id', eqId, '=');

        View.openDialog('ab-profile-equipment.axvw', restriction, false, {
            width: 1024,
            height: 600,
            closeButton: true
        })
    }
});