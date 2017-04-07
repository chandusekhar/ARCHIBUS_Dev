/**
 * Store class to maintain Work Team models.
 *
 * @author Cristina Reghina
 * @since 21.3
 */
Ext.define('Maintenance.store.manager.WorkTeams', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.manager.WorkTeam'],

    serverTableName: 'work_team',

    serverFieldNames: ['work_team_id', 'description', 'cf_assign'],
    inventoryKeyNames: ['work_team_id'],

    config: {
        model: 'Maintenance.model.manager.WorkTeam',
        storeId: 'workTeamsStore',
        remoteSort: true,
        remoteFilter: true,
        sorters: [
            {
                property: 'work_team_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});