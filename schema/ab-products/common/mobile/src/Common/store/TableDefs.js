Ext.define('Common.store.TableDefs', {
	extend : 'Common.store.sync.SqliteStore',
	requires : [ 'Common.model.TableDef' ],

	config : {
		model : 'Common.model.TableDef',
		storeId : 'tableDefsStore',
		disablePaging : true,
		enableAutoLoad : false,
		proxy : {
			type : 'Sqlite'
		}
	}
});