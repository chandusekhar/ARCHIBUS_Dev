/**
 * Keven.xi
 * 02/07/2010
 */
var controller = View.createController('abEmEpUpdateStatus', {
    /**
     * called when view onload,initial the employee list panel
     */
    afterInitialDataFetch: function () {
        this.onStart();
    },
    onStart: function () {
        var restriction = new Ab.view.Restriction();
        if (this.abEqStatusUpdate_gr_fl.rows.length > 0) {
            var firstFlRow = this.abEqStatusUpdate_gr_fl.rows[0];
            restriction.addClause("eq.bl_id", firstFlRow["fl.bl_id"], "=");
            restriction.addClause("eq.fl_id", firstFlRow["fl.fl_id"], "=");
            this.abEqStatusUpdate_gr_eq.refresh(restriction);
        }
        else {
            restriction.addClause("eq.bl_id", "", "=");
            restriction.addClause("eq.fl_id", "", "=");
            this.abEqStatusUpdate_gr_eq.refresh(restriction);
        }
    },
    /**
     * called when user the refresh button in floor panel
     */
    abEqStatusUpdate_gr_fl_onRefresh: function () {
        var restriction = new Ab.view.Restriction();
        this.abEqStatusUpdate_gr_fl.refresh(restriction);
        this.onStart();
    },
    //Add title after delete
    updateEqStatusForm_onDelete: function () {
        this.updateEqStatusForm.displayTemporaryMessage(getMessage("deleteRecord"));
    },
    updateEqStatusForm_afterRefresh: function () {
        if (this.updateEqStatusForm.newRecord) {
            this.updateEqStatusForm.actions.get("delete").forceDisable(true);
            this.updateEqStatusForm.actions.get("addNew").forceDisable(true);
        } else {
            this.updateEqStatusForm.actions.get("delete").enable(true);
            this.updateEqStatusForm.actions.get("addNew").enable(true);
        }
        this.setEditPanelTitle(this.updateEqStatusForm.newRecord);
    },
    /**
     * called when user click add new button
     */
    updateEqStatusForm_onAddNew: function () {
        this.updateEqStatusForm.refresh(this.abEqStatusUpdate_gr_eq.restriction, true);
    },
    /**
     * called when user click cancel button
     */
    updateEqStatusForm_onCancel: function () {
        this.updateEqStatusForm.show(false);
    },
    /**
     * set Edit form title
     * @param {Object} newRecord
     */
    setEditPanelTitle: function (newRecord) {
        if (newRecord) {
            this.updateEqStatusForm.setTitle(getMessage("addNewPanelTitle"));
        } else {
            this.updateEqStatusForm.setTitle(getMessage("editPanelTitle"));
        }
    }
});
/**
 * called when user select floor
 */
function onClickFloor() {
    var flGrid = View.panels.get("abEqStatusUpdate_gr_fl");
    var selectedRow = flGrid.rows[flGrid.selectedRowIndex];

    var restriction = new Ab.view.Restriction();
    restriction.addClause("eq.bl_id", selectedRow["fl.bl_id"], "=");
    restriction.addClause("eq.fl_id", selectedRow["fl.fl_id"], "=");

    var eqGrid = View.panels.get("abEqStatusUpdate_gr_eq");
    eqGrid.refresh(restriction);
    var eqForm = View.panels.get("updateEqStatusForm");
    eqForm.refresh(restriction);
}
function onClickEquipment() {
    var eqGrid = View.panels.get("abEqStatusUpdate_gr_eq");
    var selectedRow = eqGrid.rows[eqGrid.selectedRowIndex];

    var restriction = new Ab.view.Restriction();
    restriction.addClause("eq.eq_id", selectedRow["eq.eq_id"], "=");

    var updateEqStatusForm = View.panels.get("updateEqStatusForm");
    updateEqStatusForm.refresh(restriction, false);
}
