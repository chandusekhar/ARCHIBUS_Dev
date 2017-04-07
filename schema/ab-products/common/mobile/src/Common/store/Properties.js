Ext.define('Common.store.Properties', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Property' ],

	serverTableName : 'property',

	serverFieldNames : [ 'pr_id', 'name', 'site_id' ],
	inventoryKeyNames : [ 'pr_id' ],

	config : {
		model : 'Common.model.Property',
		storeId : 'propertiesStore',
		remoteSort : true,
		remoteFilter : true,
		pageSize : 200, //for selectFields
		sorters : [ {
			property : 'name',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		},
		tableDisplayName: LocaleManager.getLocalizedString('Properties', 'Common.store.Properties')
	}
});