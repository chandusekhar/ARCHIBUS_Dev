Ext.define('Common.store.Equipments', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Equipment' ],

	serverTableName : 'eq',
	serverFieldNames : [ 'eq_id', 'eq_std', 'site_id', 'bl_id', 'fl_id', 'rm_id' ],
	inventoryKeyNames : [ 'eq_id' ],

	config : {
		model : 'Common.model.Equipment',
		remoteFilter : true,
		storeId : 'equipmentsStore',
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		},
		tableDisplayName: LocaleManager.getLocalizedString('Equipment', 'Common.store.Equipments')
	}
});