/**
 * Store class to maintain Craftsperson Work Team models.
 *
 * @author Cristina Reghina
 * @since 21.3
 */
Ext.define('Maintenance.store.manager.CraftspersonWorkTeams', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.manager.CraftspersonWorkTeam'],

    serverTableName: 'cf_work_team',

    serverFieldNames: ['work_team_id', 'cf_id'],
    inventoryKeyNames: ['work_team_id', 'cf_id'],

    config: {
        model: 'Maintenance.model.manager.CraftspersonWorkTeam',
        storeId: 'craftspersonWorkTeamsStore',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Craftsperson Work Teams', 'Maintenance.store.manager.CraftspersonWorkTeams'),
        sorters: [
            {
                property: 'work_team_id',
                direction: 'ASC'
            },
            {
                property: 'cf_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});