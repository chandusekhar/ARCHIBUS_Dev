Ext.define('Common.store.Projects', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Project' ],

	serverTableName : 'project',

	serverFieldNames : [ 'project_id', 'project_name', 'project_type', 'date_created', 'status' ],
	inventoryKeyNames : [ 'project_id' ],

	config : {
		model : 'Common.model.Project',
		storeId : 'projectsStore',
		remoteSort : true,
		remoteFilter : true,
		pageSize : 100,	// change it when implementing Projects list view
		sorters : [ {
			property : 'project_id',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		},
		tableDisplayName: LocaleManager.getLocalizedString('Projects', 'Common.store.Projects')
	}
});