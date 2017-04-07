Ext.define('Common.store.RoomTypes', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.RoomType' ],

	serverTableName : 'rmtype',

	serverFieldNames : [ 'rm_cat', 'rm_type', 'description' ],
	inventoryKeyNames : [ 'rm_cat', 'rm_type' ],

	config : {
		model : 'Common.model.RoomType',
		storeId : 'roomTypesStore',
		remoteSort : true,
		remoteFilter : true,
		tableDisplayName: LocaleManager.getLocalizedString('Room Types', 'Common.store.RoomTypes'),
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