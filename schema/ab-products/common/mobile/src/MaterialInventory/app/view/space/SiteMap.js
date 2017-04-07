Ext.define('MaterialInventory.view.space.SiteMap', {
    extend: 'Space.view.SiteMap',

    xtype: 'materialSiteMapPanel',

    config: {
        editViewClass: 'MaterialInventory.view.space.FloorList',
        emptyDrawingText: LocaleManager.getLocalizedString('Site Plan is not available', 'MaterialInventory.view.space.SiteMap')
    }
});