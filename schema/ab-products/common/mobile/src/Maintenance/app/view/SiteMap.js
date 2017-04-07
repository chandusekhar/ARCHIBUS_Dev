Ext.define('Maintenance.view.SiteMap', {
    extend: 'Floorplan.view.FloorPlan',

    requires: 'Floorplan.component.Svg',

    xtype: 'siteMapPanel',

    config: {
        items: [
            {
                xtype: 'svgcomponent',
                title: LocaleManager.getLocalizedString('Buildings', 'Maintenance.view.SiteMap'),
                height: '100%'
            }
        ]
    }
});