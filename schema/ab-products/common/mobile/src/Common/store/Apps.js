/**
 * Provides persistence for the list of enabled for the user applications.
 * Uses Sqlite.
 * The Store class encapsulates a client side cache of Model objects.
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.Apps', {
	extend : 'Common.store.sync.SqliteStore',
	requires : [ 'Common.model.App' ],

	config : {
		model : 'Common.model.App',
		storeId : 'apps',
		enableAutoLoad : false,
		disablePaging : false,
		proxy : {
			type : 'Sqlite'
		}
	}
});