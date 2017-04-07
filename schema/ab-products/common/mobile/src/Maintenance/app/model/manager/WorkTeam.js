Ext.define('Maintenance.model.manager.WorkTeam', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'work_team_id',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'cf_assign',
                type: 'int'
            }
        ]
    }
});