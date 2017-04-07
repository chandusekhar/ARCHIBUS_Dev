/**
 * Domain object for Currency symbols.
 *
 * @author Jeff Martin
 *
 * @since 21.2
 */
Ext.define('Common.model.Currency', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'currency_id',
                type: 'string'
            },
            {
                name: 'currency_symbol',
                type: 'string'
            }
        ]
    }
});