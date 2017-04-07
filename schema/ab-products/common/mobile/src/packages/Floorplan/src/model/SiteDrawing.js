/**
 * Replaces Space.model.SiteDrawing
 * @since 22.1
 */
Ext.define('Floorplan.model.SiteDrawing', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'site_id',
                type: 'string'
            },
            {
                name: 'svg_data',
                type: 'string',
                isFloorplanField: true
            },
            {
                name: 'svg_data_file',
                type: 'string'
            }
        ]
    }
});