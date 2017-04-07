Ext.define('Solutions.view.EsriMap', {
    extend: 'Ext.Container',

    requires: [
        'Map.component.EsriMap'
    ],

    config: {
        items: [
            {
                xtype: 'esrimap',
                basemapLayer: 'World Topographic Map',
                mapCenter: [42.35803652353272, -71.06163024902344],
                mapZoom: 14,
                style: 'height:100%;width:100%'
            }
        ]
    }

});