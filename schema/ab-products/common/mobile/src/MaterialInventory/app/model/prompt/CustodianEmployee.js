/**
 * Employees and custodians for Custodian prompt field.
 */
Ext.define('MaterialInventory.model.prompt.CustodianEmployee', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'custodian_id',
                type: 'string'
            }
        ]
    }
});