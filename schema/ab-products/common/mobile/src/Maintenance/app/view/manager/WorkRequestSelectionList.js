Ext.define('Maintenance.view.manager.WorkRequestSelectionList', {
    extend: 'Ext.dataview.List',

    requires: ['Maintenance.view.manager.WorkRequestSelectionListItem'],

    xtype: 'workrequestSelectionList',

    config: {
        cls: 'workrequest-list',

        defaultType: 'workrequestSelectionListItem',

        store: 'workRequestsStore',

        loadingText: false,

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: true
        }
    }
});