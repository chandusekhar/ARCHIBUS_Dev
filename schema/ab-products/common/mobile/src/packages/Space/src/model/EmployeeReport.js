/**
 * Entity class for the EmployeesReport view. The view is used to join the Employee, SpaceBuilding, Floor and Room tables.
 */
Ext.define('Space.model.EmployeeReport', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'name_last',
                type: 'string'
            },
            {
                name: 'name_first',
                type: 'string'
            },
            {
                name: 'phone',
                type: 'string'
            },
            {
                name: 'email',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'ctry_id',
                type: 'string'
            },
            {
                name: 'state_id',
                type: 'string'
            },
            {
                name: 'city_id',
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
                name: 'site_id',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'bl_name',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'fl_name',
                type: 'string'
            },
            {
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'rm_name',
                type: 'string'
            },
            {
                name: 'em_photo',
                type: 'string'
            },
            {
                name: 'em_photo_contents',
                type: 'string',
                isSyncField: false
            }
        ]
    }
});