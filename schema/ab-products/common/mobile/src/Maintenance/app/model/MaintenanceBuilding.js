Ext.define('Maintenance.model.MaintenanceBuilding', {
    extend: 'Ext.data.Model',
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
                name: 'pr_id',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'address1',
                type: 'string'
            },
            {
                name: 'address2',
                type: 'string'
            },
            {
                name: 'lon',
                type: 'float'
            },
            {
                name: 'lat',
                type: 'float'
            }
        ]
    }
});