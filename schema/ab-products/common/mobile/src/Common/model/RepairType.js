/**
 * Domain object for RepairType.
 * <p>
 *
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.RepairType', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'repair_type',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            }
        ]
    }
});