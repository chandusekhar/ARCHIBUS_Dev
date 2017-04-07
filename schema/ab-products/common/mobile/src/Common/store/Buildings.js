Ext.define('Common.store.Buildings', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Building' ],

	serverTableName : 'bl',

	serverFieldNames : [
		'bl_id',
		'site_id',
		'pr_id',
		'name',
		'lat',   // Added lat and lon fields in 23.1
		'lon'
	],

	inventoryKeyNames : ['bl_id'],

	config : {
		model : 'Common.model.Building',
		storeId : 'buildingsStore',
		tableDisplayName: LocaleManager.getLocalizedString('Buildings', 'Common.store.Buildings'),
		remoteSort : true,
		remoteFilter : true,
		sorters : [ {
			property : 'bl_id',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});