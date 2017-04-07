Ext.define('Maintenance.model.manager.CraftspersonWorkTeam', {
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
                name: 'work_team_id',
                type: 'string'
            }
        ]
    }
});