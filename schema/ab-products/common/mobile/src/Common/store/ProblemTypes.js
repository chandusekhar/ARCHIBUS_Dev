Ext.define('Common.store.ProblemTypes', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.ProblemType' ],

	serverTableName : 'probtype',
	serverFieldNames : [ 'prob_type', 'hierarchy_ids', 'description'],
	inventoryKeyNames : [ 'prob_type' ],

	config : {
		model : 'Common.model.ProblemType',
		disablePaging : true,
		storeId : 'problemTypesStore',
        remoteSort: true,
        sorters : [ {
            property : 'prob_type',
            direction : 'ASC'
        } ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		},
		tableDisplayName: LocaleManager.getLocalizedString('Problem Types', 'Common.store.ProblemTypes' )
	}
});