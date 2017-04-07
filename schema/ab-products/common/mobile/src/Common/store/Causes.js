Ext.define('Common.store.Causes', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Cause' ],

	serverTableName : 'causetyp',
	serverFieldNames : [ 'cause_type', 'description' ],
	inventoryKeyNames : [ 'cause_type' ],

	config : {
		autoLoad : false,
		model : 'Common.model.Cause',
		sorters : [ {
			property : 'description',
			direction : 'ASC'
		} ],
		tableDisplayName: LocaleManager.getLocalizedString('Cause Types', 'Common.store.Causes'),
		storeId : 'causesStore',
		enableAutoLoad : true,
        disablePaging: true,
		proxy : {
			type : 'Sqlite'
		}

	}
});