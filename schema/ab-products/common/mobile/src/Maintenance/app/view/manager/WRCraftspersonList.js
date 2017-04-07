Ext.define('Maintenance.view.manager.WRCraftspersonList', {
    extend: 'Ext.dataview.List',

    requires: ['Maintenance.view.manager.WRCraftspersonListItem'],

    xtype: 'wrCraftspersonList',

    config: {
        defaultType: 'wrCraftspersonListItem',

        store: 'workRequestCraftspersonsStore',

        /**
         * True/false if view is opened for multiple selection (multiple work requests) or single selection
         */
        multipleSelection: false,

        loadingText: false,

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: true
        }
    }
});