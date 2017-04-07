/**
 * DAO for the SVG file publish date.
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Floorplan.model.PublishDate', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'dwg_file',
                type: 'string'
            },
            {
                name: 'space_hier_field_values',
                type: 'string'
            },
            {
                name: 'date_comn_svg_last_pub',
                type: 'DateClass'
            }
        ]
    }
});