Ext.define('WorkplacePortal.model.RoomArrangeType', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'auto'
            },
            {
                name: 'rm_arrange_type_id',
                type: 'string'
            },
            {
                name: 'arrange_name',
                type: 'string'
            }
        ]
    }

});
