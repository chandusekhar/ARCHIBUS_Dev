Ext.define('WorkplacePortal.view.HotelingList', {
    extend: 'Common.view.navigation.ComponentListBase',

    requires: 'WorkplacePortal.view.HotelingListItem',

    xtype: 'hotelingListPanel',

    config: {
        title: LocaleManager.getLocalizedString('My Requests', 'WorkplacePortal.view.HotelingList'),

        activityType: '',

        mobileAction: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'syncHotelingBookingsButton',
                iconCls: 'refresh',
                align: 'right',
                displayOn: 'all'
            }
        ],

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        editViewClass: 'WorkplacePortal.view.HotelingSearchForm',

        cls: 'component-list',

        useComponents: true,

        defaultType: 'hotelingListItem',

        store: 'hotelingBookingsStore',

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        },

        itemConfig: {
            mobileAction: ''
        },

        // Set empty text
        emptyText: Ext.String.format(LocaleManager.getLocalizedString('{0} Tap {1} to add a new hoteling request.{2}',
            'WorkplacePortal.view.HotelingList'), '<div class="empty-text">','<span class="ab-add-icon"></span>','</div>')
    },

    applyMobileAction: function (config) {
        var itemConfig = this.getItemConfig();

        itemConfig.mobileAction = config;

        return config;
    }
});