/**
 * Store class to maintain User models.
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.Users', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : 'Common.model.User',

	serverTableName : 'afm_users',

	serverFieldNames : ['user_name', 'email'],

	inventoryKeyNames : ['user_name'],

	config : {
		model : 'Common.model.User',
		storeId : 'usersStore',
		remoteSort : true,
		remoteFilter : true,
		sorters : [ {
			property : 'user_name',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		},
		tableDisplayName: ' '
	},

    /**
     * The contents of the User table are restricted to the current mobile user.
     * @override Override deleteAndImportRecords to allow us to set the user
     * restriction when downloading the users table
     */
    deleteAndImportRecords: function() {
        this.setRestriction({
            tableName: 'afm_users',
            fieldName: 'user_name',
            operation: 'EQUALS',
            value: ConfigFileManager.username
        });
        return this.callParent();
    }
});