/**
 * Asset transactions tabs
 */
var abEamAssetTransTabsCtrl = View.createController('abEamAssetTransTabsCtrl', {
    /**
     * Set tabs state like the ones from where is opened
     * @param originalTabs
     */
    setTabsState: function (originalTabs) {
        var tabManager = View.panels.get('abEamAssetActivitiesTabs');

        var selectedTabName = originalTabs.getSelectedTabName();
        var currentSelectedTab = originalTabs.findTab(selectedTabName);
        var enabled = currentSelectedTab.isRefreshed && valueExistsNotEmpty(currentSelectedTab.restriction);

        var depreciationTab = originalTabs.findTab('abEamAssetActivitiesTabs_depreciation');
        tabManager.showTab('abEamAssetActivitiesTabs_depreciation', !depreciationTab.forcedHidden);
        tabManager.enableTab('abEamAssetActivitiesTabs_depreciation', enabled);
        tabManager.setTabRestriction('abEamAssetActivitiesTabs_depreciation', depreciationTab.restriction);

        var currentTab = originalTabs.findTab('abEamAssetActivitiesTabs_current');
        tabManager.showTab('abEamAssetActivitiesTabs_current', !currentTab.forcedHidden);
        tabManager.enableTab('abEamAssetActivitiesTabs_current', enabled);
        tabManager.setTabRestriction('abEamAssetActivitiesTabs_current', currentTab.restriction);

        var historyEqTaTab = originalTabs.findTab('abEamAssetActivitiesTabs_history_eq_ta');
        tabManager.showTab('abEamAssetActivitiesTabs_history_eq_ta', !historyEqTaTab.forcedHidden);
        tabManager.enableTab('abEamAssetActivitiesTabs_history_eq_ta', enabled);
        tabManager.setTabRestriction('abEamAssetActivitiesTabs_history_eq_ta', historyEqTaTab.restriction);

        var historyBlPrTab = originalTabs.findTab('abEamAssetActivitiesTabs_history_bl_pr');
        tabManager.showTab('abEamAssetActivitiesTabs_history_bl_pr', !historyBlPrTab.forcedHidden);
        tabManager.enableTab('abEamAssetActivitiesTabs_history_bl_pr', enabled);
        tabManager.setTabRestriction('abEamAssetActivitiesTabs_history_bl_pr', historyBlPrTab.restriction);

        var historyOtTab = originalTabs.findTab('abEamAssetActivitiesTabs_history_ot');
        tabManager.showTab('abEamAssetActivitiesTabs_history_ot', !historyOtTab.forcedHidden);
        tabManager.enableTab('abEamAssetActivitiesTabs_history_ot', enabled);
        tabManager.setTabRestriction('abEamAssetActivitiesTabs_history_ot', historyOtTab.restriction);

        tabManager.selectTab(selectedTabName, null, false, false, true);

        tabManager.findTab('abEamAssetActivitiesTabs_history_eq_ta').parameters = {'collapsedFilter': false};
        tabManager.findTab('abEamAssetActivitiesTabs_history_bl_pr').parameters = {'collapsedFilter': false};

        this.setActivitiesAssetTitle(currentSelectedTab);
    },

    /**
     * Set activities tabs title based on the selected asset type
     * @param currentSelectedTab
     */
    setActivitiesAssetTitle: function (currentSelectedTab) {
        var assetActivitiesTitlePanel = View.panels.get('assetActivitiesTitle');
        var assetInfoTitle = '';
        if (valueExistsNotEmpty(currentSelectedTab.restriction)) {
            var restriction = currentSelectedTab.restriction;
            var typeClause = restriction.findClause('asset_trans.mod_table'),
                idClause = restriction.findClause('asset_trans.asset_id');
            if (valueExists(typeClause) && valueExists(idClause)) {
                assetInfoTitle += ' - ' + getMessage('asset_type_' + typeClause.value) + ' ' + idClause.value;
            } else {
                typeClause = restriction.findClause('bl.asset_type'),
                    idClause = restriction.findClause('bl.asset_id');
                if (valueExists(typeClause) && valueExists(idClause)) {
                    assetInfoTitle += ' - ' + getMessage('asset_type_' + typeClause.value) + ' ' + idClause.value;
                }
            }
        }
        assetActivitiesTitlePanel.setTitle(getMessage('Asset Activities') + ' ' + assetInfoTitle);
    }
});