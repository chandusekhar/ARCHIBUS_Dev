Ext.define('Space.view.SiteMap', {
    extend: 'Floorplan.view.FloorPlan',

    xtype: 'siteMapPanel',

    isNavigationList: true,

    config: {
        editViewClass: 'Space.view.FloorList',
        itemId: 'sitesMap',
        width: '100%',
        height: '100%',
        hidden: true,
        items: [
            {
                xtype: 'svgcomponent'
            }
        ]
    }
});