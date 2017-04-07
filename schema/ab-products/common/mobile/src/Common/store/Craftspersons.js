/**
 * Store class to maintain Craftsperson models.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.Craftspersons', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Craftsperson' ],

	serverTableName : 'cf',

	serverFieldNames : [ 'cf_id', 'email' ],
	inventoryKeyNames : [ 'cf_id' ],

	config : {
		model : 'Common.model.Craftsperson',
		storeId : 'craftspersonStore',
		remoteSort : true,
		remoteFilter : true,
		sorters : [ {
			property : 'cf_id',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		},
		tableDisplayName: LocaleManager.getLocalizedString('Craftspersons', 'Common.store.Craftspersons')
	}
});