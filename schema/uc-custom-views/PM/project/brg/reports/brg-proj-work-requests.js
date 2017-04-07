var projectWorkRequestsController = View.createController('projectWorkRequestsController', {
    afterViewLoad: function() {
        //turn off print icon and mail icon.
        View.setToolbarButtonVisible('printButton', false);
        View.setToolbarButtonVisible('emailButton', false);
        View.setToolbarButtonVisible('alterButton', false);
        View.setToolbarButtonVisible('favoritesButton', false);
    }
});

function openWRList(row) {
    var panel = View.panels.get("projectWorkRequestsGrid");
    panel.addParameter("projectId", row["project.project_id"]);
    panel.refresh();
}