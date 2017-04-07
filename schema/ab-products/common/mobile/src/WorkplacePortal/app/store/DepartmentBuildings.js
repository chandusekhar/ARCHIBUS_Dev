/**
 * Read only store containing distinct buildings and departments.
 */
Ext.define('WorkplacePortal.store.DepartmentBuildings', {
    extend: 'Common.store.sync.MaterializedViewStore',

    requires: [
        'WorkplacePortal.model.DepartmentBuilding'
    ],

    config: {
        model: 'WorkplacePortal.model.DepartmentBuilding',
        storeId: 'departmentBuildingsStore',
        sorters: [
            {property: 'site_id', direction: 'ASC'},
            {property: 'bl_id', direction: 'ASC'},
            {property: 'dv_id', direction: 'ASC'},
            {property: 'dp_id', direction: 'ASC'}
        ],
        tableStoreIds: ['roomsStore', 'spaceBookBuildings'],
        sqlInsert: 'INSERT INTO DepartmentBuilding(site_id,bl_id,dv_id,dp_id) SELECT bl.site_id, rm.bl_id, rm.dv_id, rm.dp_id ' +
        'FROM Room rm ' +
        'LEFT JOIN SpaceBuilding bl ON bl.bl_id = rm.bl_id ' +
        'GROUP BY bl.site_id, rm.bl_id, rm.dv_id, rm.dp_id'
    }
});
