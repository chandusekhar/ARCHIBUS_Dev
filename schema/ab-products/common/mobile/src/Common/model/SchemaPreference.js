/**
 * Domain object for Currency symbols.
 *
 * @author Jeff Martin
 *
 * @since 21.2
 */
Ext.define('Common.model.SchemaPreference', {
    extend : 'Ext.data.Model',
    config : {
        fields : [ {
            name : 'id',
            type : 'int'
        }, {
            name : 'units',
            type : 'int'
        }, {
            name : 'base_metric_units',
            type : 'int'
        }]
    }
});
