Ext.define('Maintenance.model.manager.Craftsperson', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'cf_id',
                type: 'string'
            },
            {
                name: 'email',
                type: 'string'
            },
            {
                name: 'assign_work',
                type: 'int'
            },
            {
                name: 'work_team_id',
                type: 'string'
            },
            {
                name: 'is_supervisor',
                type: 'int'
            },
            {
                name: 'is_estimator',
                type: 'int'
            },
            {
                name: 'cf_change_wr',
                type: 'int'
            },
            {
                name: 'cf_unschedule',
                type: 'int'
            },
            {
                name: 'is_planner',
                type: 'int'
            },
            {
                name: 'tr_id',
                type: 'string'
            },
            {
                name: 'rate_hourly',
                type: 'float'
            },
            {
                name: 'rate_over',
                type: 'float'
            },
            {
                name: 'rate_double',
                type: 'float'
            }
        ]
    }
});