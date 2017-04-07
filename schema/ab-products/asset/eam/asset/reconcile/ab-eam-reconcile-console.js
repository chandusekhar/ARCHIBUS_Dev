var abEamAssetReconcileController = View.createController('abEamAssetReconcileController', {
    afterViewLoad: function () {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('afm_connector.connector_id', 'Asset_%', 'LIKE');
        this.abEamReconcileTabs.setTabRestriction('abEamReconcileTabs_conn_exec', restriction);
        this.abEamReconcileTabs.addEventListener('afterTabChange', afterTabChange);
    }
});

/**
 * sets tab restriction
 * @param tabPanel
 * @param newTabName
 */
function afterTabChange(tabPanel, newTabName) {
    if ("abEamReconcileTabs_conn_exec" === newTabName || "abEamReconcileTabs_conn_select" === newTabName) {
        tabPanel.enableTab("abEamReconcileTabs_asset_added", false);
        tabPanel.enableTab("abEamReconcileTabs_asset_deleted", false);
        tabPanel.enableTab("abEamReconcileTabs_asset_updated", false);
    } else {
        var connSelectionParams = tabPanel.parameters;
        /**
         * use source table restriction based on imported asset types
         */
        var restriction = "eq.source_table='" + connSelectionParams.sourceTable + "'";
        if ("abEamReconcileTabs_asset_added" === newTabName) {
        	restriction += " AND EXISTS (SELECT 1 FROM asset_trans WHERE asset_trans.mod_table = eq.source_table";
        	restriction += " AND asset_trans.asset_id = eq.asset_id";
            restriction += " AND asset_trans.change_type IN ('Insert')";
            restriction += " AND  ${sql.yearMonthDayOf('asset_trans.date_trans')} = '" + connSelectionParams.dateLog + "')";
        } else if ("abEamReconcileTabs_asset_deleted" === newTabName) {
            restriction += " AND eq.source_status IN ('DELETED')";
            restriction += " AND ${sql.yearMonthDayOf('eq.source_date_update')} = '" + connSelectionParams.dateLog + "'";
        } else if ("abEamReconcileTabs_asset_updated" === newTabName) {
        	restriction += " AND EXISTS (SELECT 1 FROM asset_trans WHERE asset_trans.mod_table = eq.source_table";
        	restriction += " AND asset_trans.asset_id = eq.asset_id";
            restriction += " AND asset_trans.change_type IN ('Update')";
            restriction += " AND ${sql.yearMonthDayOf('asset_trans.date_trans')} = '" + connSelectionParams.dateLog + "')";
        }
        restriction += " AND eq.source_system_id = '" + connSelectionParams.sourceSystemId + "'";
        tabPanel.setTabRestriction(newTabName, restriction);
        var tab = tabPanel.findTab(newTabName);
        if (tab.isContentLoaded) {
            var controller = tab.getContentFrame().View.controllers.get('abEamAssetReconcileController');
            controller.loadAssetPanel();
            if (valueExists(controller.abEamAssetActivitiesTabs)) {
                controller.abEamAssetActivitiesTabs.tabPanel.container.dom.style.display = "none";
            }
        }
    }
}
