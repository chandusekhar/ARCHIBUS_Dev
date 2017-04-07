Ext.define('SpaceBook.store.SpaceBookPlanTypes', {
    extend: 'Common.store.sync.SqliteStore',

    requires: 'SpaceBook.model.SpaceBookPlanType',

    config: {
        storeId: 'spaceBookPlanTypes',
        model: 'SpaceBook.model.SpaceBookPlanType',
        enableAutoLoad: true,
        remoteFilter: true,
        disablePaging: true,
        proxy: {
            type: 'SqliteView',
            viewDefinition: 'SELECT g.plan_type, g.active, p.title, g.mob_activity_id, g.display_order, ' +
            'p.view_file, p.hs_ds, p.label_ds, p.label_ht, p.view_file2, p.hs_ds2, p.label_ds2, p.label_ht2 ' +
            'FROM PlanType p INNER JOIN PlanTypeGroup g on p.plan_type = g.plan_type ' +
            'WHERE g.mob_activity_id = \'AbSpaceBook\' AND p.active = 1 AND g.active = 1',
            viewName: 'SpaceBookPlanType',

            baseTables: ['PlanType', 'PlanTypeGroup']
        },
        sorters: [
            {
                property: 'display_order',
                direction: 'ASC'
            }
        ]
    }
});