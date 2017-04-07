Ext.define('Common.store.RoomCategories', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.RoomCategory' ],

	serverTableName : 'rmcat',

	serverFieldNames : [ 'rm_cat', 'description' ],
	inventoryKeyNames : [ 'rm_cat' ],

	config : {
		model : 'Common.model.RoomCategory',
		storeId : 'roomCategoriesStore',
		tableDisplayName: LocaleManager.getLocalizedString('Room Categories','Common.store.RoomCategories'),
		remoteSort : true,
		remoteFilter : true,
		sorters : [ {
			property : 'description',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});