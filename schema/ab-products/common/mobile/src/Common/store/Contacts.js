Ext.define('Common.store.Contacts', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Common.model.Contact' ],

	serverTableName : 'contact',

	serverFieldNames : [ 'contact_id', 'email', 'name_first', 'name_last'],
	inventoryKeyNames : [ 'contact_id' ],

	config : {
		model : 'Common.model.Contact',
		storeId : 'contactsStore',
		remoteSort : true,
		remoteFilter : true,
		sorters : [ {
			property : 'contact_id',
			direction : 'ASC'
		} ],
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		},
		tableDisplayName: LocaleManager.getLocalizedString('Contacts', 'Common.store.Contacts')
	}
});