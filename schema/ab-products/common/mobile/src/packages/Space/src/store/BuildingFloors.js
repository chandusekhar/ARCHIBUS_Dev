/**
 * Store to maintain BuildingFloor view.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Space.store.BuildingFloors', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [ 'Common.store.proxy.SqliteView', 'Space.model.BuildingFloor' ],

    config: {
        storeId: 'buildingFloorsStore',
        model: 'Space.model.BuildingFloor',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT SpaceBuilding.site_id,SpaceBuilding.bl_id,SpaceFloor.fl_id' +
                ' FROM SpaceBuilding JOIN SpaceFloor on SpaceBuilding.bl_id = SpaceFloor.bl_id',

            viewName: 'BuildingFloor',

            baseTables: [ 'SpaceBuilding', 'SpaceFloor' ]
        }
    }
});