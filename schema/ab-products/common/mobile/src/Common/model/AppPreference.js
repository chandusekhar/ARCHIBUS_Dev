/**
 * Domain object for AppPreference.
 *
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.AppPreference', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'activity_id',
                type: 'string'
            },
            {
                name: 'param_id',
                type: 'string'
            },
            {
                name: 'param_value',
                type: 'string'
            },
            {
                name: 'applies_to',
                type: 'string'
            }
        ]
    }
});