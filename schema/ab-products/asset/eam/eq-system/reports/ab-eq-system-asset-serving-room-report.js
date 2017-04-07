View.createController('abEqSystemReportController', {
    selectedEquipmentId: null,
    filterRestriction: null,
    selectRoom: function (bl_id, fl_id, rm_id) {
        var emPanel = View.panels.get('rooms_employees_pn');
		var restriction = '';
		restriction +=     "(em.bl_id='" + bl_id + "'";
		restriction += " AND em.fl_id='" + fl_id + "'";
		restriction += " AND em.rm_id='" + rm_id + "')";
		emPanel.refresh(restriction);

        var eqPanel = View.panels.get('equipment_panel');
		restriction  = "eq.eq_id IN (SELECT DISTINCT eq_id FROM eq_rm WHERE eq_rm.bl_id='" + bl_id + "'";
		restriction += " AND eq_rm.fl_id='" + fl_id + "'";
		restriction += " AND eq_rm.rm_id='" + rm_id + "')";
		eqPanel.refresh(restriction);
    }
});
function onSelectRoom(row) {
    var bl_id = row.row.getRecord().getValue('rm.bl_id');
    var fl_id = row.row.getRecord().getValue('rm.fl_id');
    var rm_id = row.row.getRecord().getValue('rm.rm_id');
    View.controllers.get('abEqSystemReportController').selectRoom(bl_id,fl_id,rm_id);
}