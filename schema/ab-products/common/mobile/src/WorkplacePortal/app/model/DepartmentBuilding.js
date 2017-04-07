Ext.define('WorkplacePortal.model.DepartmentBuilding', {
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
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            }
        ]
    }
    
});
