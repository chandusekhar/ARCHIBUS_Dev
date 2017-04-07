/**
 * Assets transactions controller
 */
var abEamAssetTransCtrl = View.createController('abEamAssetTransCtrl', {
    filterController: null,
    assetType: null,
    assetId: null,

    afterViewLoad: function () {
        this.filterController = View.controllers.get('abEamAssetTransFilterCtrl');
        if (valueExists(this.filterController)) {
            this.filterController.onFilterCallback = function (restriction) {
                abEamAssetTransCtrl.onFilter(restriction);
            };
        }
    },
    /**
     * Refresh helper panel to set view restrictions
     */
    afterInitialDataFetch: function () {
        this.abEamLifecycleTransRefresh.refresh();
    },

    /**
     * Set input parameters with  view restriction and init filter controller
     */
    abEamLifecycleTransRefresh_afterRefresh: function () {
        this.getInputParameters();
        this.refreshView();
        // initialize filter
        if (valueExists(this.assetType) && valueExists(this.filterController)) {
            this.filterController.initializeConfigObjects(this.setFilterConfig(this.assetType));
            this.filterController.initializeFilter(this.assetType);
        }
    },
    /**
     * Set filter config by assetType.
     * @param assetType
     * @returns {Ext.util.MixedCollection}
     */
    setFilterConfig: function (assetType) {
        var filterConfig = new Ext.util.MixedCollection();
        var isBlOrProperty = ("bl" === assetType || "property" === assetType),
            isEqOrTa = ("eq" === assetType || "ta" === assetType);
        filterConfig.addAll(
            {
                id: 'asset_trans.bl_id',
                fieldConfig: {
                    type: 'text', hidden: isBlOrProperty, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.fl_id',
                fieldConfig: {
                    type: 'text', hidden: isBlOrProperty, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.rm_id',
                fieldConfig: {
                    type: 'text', hidden: isBlOrProperty, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.address1',
                fieldConfig: {
                    type: 'text', hidden: isEqOrTa, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.address_2',
                fieldConfig: {
                    type: 'text', hidden: isEqOrTa, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.dv_id',
                fieldConfig: {
                    type: 'text', hidden: isBlOrProperty, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.dp_id',
                fieldConfig: {
                    type: 'text', hidden: isBlOrProperty, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.ctry_id',
                fieldConfig: {
                    type: 'text', hidden: isEqOrTa, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.state_id',
                fieldConfig: {
                    type: 'text', hidden: isEqOrTa, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.city_id',
                fieldConfig: {
                    type: 'text', hidden: isEqOrTa, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            },
            {
                id: 'asset_trans.ac_id',
                fieldConfig: {
                    type: 'text', hidden: isEqOrTa, readOnly: false, values: null,
                    dfltValue: null, hasEmptyOption: false
                }
            }
        );
        return filterConfig;
    },
    /**
     * Set controller parameters.
     */
    getInputParameters: function () {
        var restriction = null;
        if (valueExists(View.restriction)) {
            restriction = View.restriction;
        }
        if (valueExists(restriction)) {
            var typeClause = restriction.findClause('asset_trans.mod_table');
            if (typeClause) {
                this.assetType = typeClause.value;
            }
            var idClause = restriction.findClause('asset_trans.asset_id');
            if (idClause) {
                this.assetId = idClause.value;
            }
        }
    },
    /**
     * Refresh transactions list
     */
    refreshView: function () {
        if (valueExistsNotEmpty(this.assetType) && valueExistsNotEmpty(this.assetId)) {
            // hide current asset information panels
            if ('eq' === this.assetType) {
                View.panels.get('abEamAssetTrans_ta_list').show(false);
            } else {
                if (valueExists(View.panels.get('abEamAssetTrans_eq_list'))) {
                    View.panels.get('abEamAssetTrans_eq_list').show(false);
                }
            }

            if ('bl' === this.assetType) {
                View.panels.get('abEamAssetTrans_property_list').show(false);
            } else {
                if (valueExists(View.panels.get('abEamAssetTrans_bl_list'))) {
                    View.panels.get('abEamAssetTrans_bl_list').show(false);
                }
            }
            // set asset panels restriction
            var fieldNameByType = {'bl': 'bl_id', 'property': 'pr_id', 'eq': 'eq_id', 'ta': 'ta_id'};
            var restriction = new Ab.view.Restriction();
            restriction.addClause(this.assetType + '.' + fieldNameByType[this.assetType], this.assetId, '=');
            View.panels.get('abEamAssetTrans_' + this.assetType + '_list').refresh(restriction);
            // set history panel restriction
            var historyController = View.controllers.get('abEamAssetTransHistoryCtrl');
            if (valueExists(historyController)) {
                historyController.setAssetParameters(this.assetType, this.assetId);
                historyController.view.panels.get('abEamAssetTransactionHistory').refresh(View.restriction);
            }
            var otPanel = View.panels.get('abRplmPortfolioadminAllOtReport_detailsPanel');
            if (valueExists(otPanel)) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('ot.' + fieldNameByType[this.assetType], this.assetId, '=');
                otPanel.refresh(restriction);
            }
        }
    },
    /**
     * On filter event handler
     * @param sqlRestriction restriction sql
     */
    onFilter: function (sqlRestriction) {
        var historyPanel = View.panels.get('abEamAssetTransactionHistory');
        historyPanel.addParameter('filterRestriction', sqlRestriction);
        View.panels.get('abEamAssetTransactionHistory').refresh();
    }
});