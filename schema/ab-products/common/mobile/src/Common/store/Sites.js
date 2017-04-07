Ext.define('Common.store.Sites', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Site' ],

	serverTableName : 'site',

	serverFieldNames : [ 'site_id', 'name' ],
	inventoryKeyNames : [ 'site_id' ],

	config : {
		model : 'Common.model.Site',
		storeId : 'sitesStore',
		remoteSort : true,
		remoteFilter : true,
		tableDisplayName: LocaleManager.getLocalizedString('Sites', 'Common.store.Sites'),
		sorters : [ {
			property : 'name',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});