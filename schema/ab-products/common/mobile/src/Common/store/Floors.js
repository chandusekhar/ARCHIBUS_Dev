Ext.define('Common.store.Floors', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Floor' ],

	serverTableName : 'fl',
	serverFieldNames : [ 'bl_id', 'fl_id', 'name' ],
	inventoryKeyNames : [ 'bl_id', 'fl_id' ],

	config : {
		model : 'Common.model.Floor',
		remoteFilter : true,
		remoteSort : true,
		tableDisplayName: LocaleManager.getLocalizedString('Floors', 'Common.store.Floors'),
		sorters : [ {
			property : 'bl_id',
			direction : 'ASC'
		}, {
			property : 'fl_id',
			direction : 'ASC'
		} ],
		storeId : 'floorsStore',
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});