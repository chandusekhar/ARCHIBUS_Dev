/**
 * The model for the resource standard.Currently, we only need two fields.
 * @author heqiang
 */
Ext.define('WorkplacePortal.model.RoomResource', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'resource_std',
                type: 'string'
            },

            {
                name: 'resource_name',
                type: 'string'
            }
        ]
    }
});