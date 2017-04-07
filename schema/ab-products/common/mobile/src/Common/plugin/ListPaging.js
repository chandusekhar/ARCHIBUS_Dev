/**
 * Overrides the Ext.plugin.ListPaging class so that we can add the localized strings for the loadMoreText
 * and noMoreRecordsText configuration values.
 *
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('Common.plugin.ListPaging', {
    extend: 'Ext.plugin.ListPaging',

    // Supply localized strings for the Load More and No More Records text.
    config: {
        loadMoreText: LocaleManager.getLocalizedString('Load More...', 'Common.plugin.ListPaging'),
        noMoreRecordsText: LocaleManager.getLocalizedString('No More Records','Common.plugin.ListPaging')
    }
});