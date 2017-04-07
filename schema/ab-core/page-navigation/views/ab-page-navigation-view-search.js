/**
 * "ab-page-navigation-view-search.js"
 * Provides view search and open dialog functionality for PageNavigation interface 
 *
 * Created by Meyer on 11/26/2014.
 */

var viewSearchController = View.createController('viewSearchController', {

    afterLayout: function () {
        var dbExtension = View.user.dbExtension;
        var searchPanel = View.getControl('', 'taskSearchReportGrid');
        var searchText = '%';

        var frame = jQuery("#alert-drilldown-frame");
        if (frame != null) {
            var loc = frame.context.location.href;
            searchText = loc.substr(loc.indexOf("searchText=") + 11);
            searchText = searchText.replace(/%20/g, ' ');
        }

        searchPanel.addParameter('searchString', searchText);
        if (dbExtension.length > 0) {
            searchPanel.addParameter('taskTitleColumn', 'afm_ptasks.task_' + dbExtension);
            searchPanel.addParameter('processesTitleColumn', 'afm_processes.title_' + dbExtension);
            searchPanel.addParameter('activitiesTitleColumn', 'afm_activities.title_' + dbExtension);
            searchPanel.addParameter('productsTitleColumn', 'afm_products.title_' + dbExtension);
        }
    }
});

/**
 * Open the dialog's selected task in the opener window's viewContent panel
 *
 */
function openTaskInViewContent() {
    var searchPanel = View.getControl('','taskSearchReportGrid');
    var row = searchPanel.rows[searchPanel.selectedRowIndex];

    // set the row elem attributes for openPTask()
    jQuery(row).attr('href', row['afm_ptasks.task_file']);
    jQuery(row).attr('rel', 'eTask');

    var openerViewTop = View.getOpenerWindow().top;
    openerViewTop.goHome();
    openerViewTop.openSoloTask(row, null);
    openerViewTop.taskInfo = {
        activityId:  row['afm_ptasks.activity_id'],
        processId:  row['afm_ptasks.process_id'],
        taskId:  row['afm_ptasks.task_id']
    };

    // lose this dialog containing the frame & view
    openerViewTop.closeSearchDialog();
}

