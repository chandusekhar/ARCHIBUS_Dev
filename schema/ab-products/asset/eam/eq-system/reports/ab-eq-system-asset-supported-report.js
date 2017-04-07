View.createController('abEqSystemReportController', {
    selectedEquipmentId: null,
    filterRestriction: null,
    selectEquipment: function (teamName) {
        var restriction = '';
        restriction += " eq.eq_id IN (SELECT DISTINCT eq_id FROM team WHERE contact_id ='" + teamName + "' OR em_id='" + teamName + "' OR vn_id='" + teamName + "') ";
        var eqPanel = View.panels.get('equipment_pn');
        eqPanel.refresh(restriction);
        eqPanel.refresh();
    }
});
function onSelectTeamMember(row) {
    var teamName = row.row.getRecord().getValue('team.t_name');
    View.controllers.get('abEqSystemReportController').selectEquipment(teamName);
}