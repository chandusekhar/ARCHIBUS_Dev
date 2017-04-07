/**
 * Store for space Employees Report view.
 *
 * @author Ana Paduraru
 * @since 21.2
 */
Ext.define('Space.store.EmployeesReport', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'Common.store.proxy.SqliteView',
        'Space.model.EmployeeReport'
    ],

    inventoryKeyNames: ['em_id'],

    config: {
        storeId: 'employeesReportStore',
        model: 'Space.model.EmployeeReport',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT em.em_id, em.name_last, em.name_first, em.phone, em.email, em.dv_id, em.dp_id, ' +
            'bl.ctry_id, bl.state_id, bl.city_id, bl.address1, bl.address2, bl.site_id, em.bl_id, bl.name as bl_name, ' +
            'em.fl_id, fl.name as fl_name, em.rm_id, rm.name as rm_name, em.em_photo, em.em_photo_contents' +
            ' FROM Employee em LEFT JOIN SpaceBuilding bl ON em.bl_id = bl.bl_id ' +
            'LEFT JOIN SpaceFloor fl ON em.bl_id = fl.bl_id AND em.fl_id = fl.fl_id ' +
            'LEFT JOIN Room rm ON em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id',

            viewName: 'EmployeesReport',

            baseTables: ['Employee', 'SpaceBuilding', 'SpaceFloor', 'Room'],

            // Base the total number of rows count on the Employee table to insure that the COUNT() command
            // succeeds
            countTable: 'Employee'
        }
    }
});