Ext.define('Common.store.Divisions', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Division' ],

	serverTableName : 'dv',

	serverFieldNames : [ 'dv_id', 'name' ],
	inventoryKeyNames : [ 'dv_id' ],

	config : {
		model : 'Common.model.Division',
		storeId : 'divisionsStore',
		remoteSort : true,
		remoteFilter : true,
		sorters : [ {
			property : 'name',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		},
		tableDisplayName: LocaleManager.getLocalizedString('Divisions', 'Common.store.Divisions')
	}
});