/**
 * @since 21.2
 */
Ext.define('Common.plugin.DataViewListPaging', {
    extend: 'Ext.plugin.ListPaging',

    alias: 'plugin.dataviewlistpaging',

    config: {
        loadMoreText: LocaleManager.getLocalizedString('Load More...', 'Common.plugin.DataViewListPaging'),
        noMoreRecordsText: LocaleManager.getLocalizedString('No More Records','Common.plugin.DataViewListPaging'),

        // Supply the docked configuration to place the Load More text at the bottom of the list
        loadMoreCmp: {
            xtype: 'component',
            baseCls: Ext.baseCSSPrefix + 'list-paging',
            scrollDock: 'bottom',
            docked: 'bottom',
            hidden: true
        }
    }


});
