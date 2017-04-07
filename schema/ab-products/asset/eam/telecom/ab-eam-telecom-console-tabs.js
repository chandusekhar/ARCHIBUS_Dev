View.createController('abEamTcDetailsTabsController', {
    afterViewLoad: function () {
        // Set 'afterTabChange' listener when tabs are changed
        this.abEamTelConsTabs.addEventListener('afterTabChange', afterTabChange);
    }
});
/**
 * Called when details tab are changed.
 * @param tabPanel
 * @param newTabName
 */
function afterTabChange(tabPanel, newTabName) {
    hideChildList(tabPanel, newTabName);
}
/**
 * Hide child panel and applies or not drawing restriction.
 * @param tabPanel
 * @param tabName
 */
function hideChildList(tabPanel, tabName) {
    var tab = tabPanel.findTab(tabName);
    if (tab.isContentLoaded) {
        var controller = tab.getContentFrame().View.controllers.get('telConsCommonController');
        if (valueExists(controller["abEamTelConsDetailsChildList"])) {
            controller["abEamTelConsDetailsChildList"].show(false);
        }
    }
}