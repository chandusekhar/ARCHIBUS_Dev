/**
 * Read only store containing distinct floors and departments.
 */
Ext.define('WorkplacePortal.store.DepartmentFloors', {
    extend: 'Common.store.sync.MaterializedViewStore',

    requires: [
        'WorkplacePortal.model.DepartmentFloor'
    ],

    config: {
        storeId: 'departmentFloorsStore',
        model: 'WorkplacePortal.model.DepartmentFloor',
        sorters: [
            {property: 'fl_id', direction: 'ASC'},
            {property: 'dv_id', direction: 'ASC'},
            {property: 'dp_id', direction: 'ASC'}
        ],
        sqlInsert: 'INSERT INTO DepartmentFloor(fl_id,dv_id,dp_id) SELECT fl_id, dv_id, dp_id FROM Room GROUP BY fl_id,dv_id,dp_id', 
        tableStoreIds: ['roomsStore']
    }
});
