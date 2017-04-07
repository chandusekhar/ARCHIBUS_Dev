/**
 * Store class to maintain Craftsperson models.
 *
 * @author Cristina Reghina
 * @since 21.3
 */
Ext.define('Maintenance.store.manager.Craftspersons', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.manager.Craftsperson'],

    serverTableName: 'cf',

    serverFieldNames: ['cf_id', 'email', 'assign_work', 'work_team_id', 'is_supervisor', 'is_estimator', 'is_planner', 'cf_change_wr', 'cf_unschedule', 'tr_id',
        'rate_hourly', 'rate_over', 'rate_double'],
    inventoryKeyNames: ['cf_id'],

    config: {
        model: 'Maintenance.model.manager.Craftsperson',
        storeId: 'craftspersonStore',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.store.manager.Craftspersons'),
        sorters: [
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