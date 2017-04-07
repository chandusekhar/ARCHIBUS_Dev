var spaceProjectReportController = View.createController('spaceProjectReportController', {
    afterViewLoad: function() {
        //turn off print icon and mail icon.
        View.setToolbarButtonVisible('printButton', false);
        View.setToolbarButtonVisible('emailButton', false);
        View.setToolbarButtonVisible('alterButton', false);
        View.setToolbarButtonVisible('favoritesButton', false);
    }
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("brg_project_view.is_template = 0");
}