Ext.define('Maintenance.store.manager.CraftspersonInPlannerWorkTeam', {
    extend: 'Ext.data.Store',

    requires: [
        'Maintenance.store.manager.Craftspersons',
        'Maintenance.store.manager.CraftspersonWorkTeams',
        'Common.util.UserProfile'
    ],

    config: {
        fields: [
            {name: 'cf_id', type: 'string'},
            {name: 'tr_id', type: 'string'}
        ],

        storeId: 'craftspersonInPlannerWorkTeamStore',

        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: function () {
                var viewStr = 'SELECT cf_id , tr_id from  Craftsperson WHERE Craftsperson.work_team_id IS NULL ' +
                    'OR Craftsperson.cf_id IN (SELECT a.cf_id FROM CraftspersonWorkTeam a ' +
                    'WHERE a.work_team_id IN (SELECT b.work_team_id FROM CraftspersonWorkTeam b where b.cf_id = \'{0}\'))';

                return Ext.String.format(viewStr, Common.util.UserProfile.getUserProfile().cf_id);
            },

            viewName: 'CraftspersonInPlannerWorkTeamView',

            baseTables: ['Craftsperson', 'CraftspersonWorkTeam'],

            usesTransactionTable: false
        }
    }
});