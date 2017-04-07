/**
 * Store to maintain UserProfile models.
 *
 * @deprecated Use {@link Common.store.UserInfo}
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.UserProfiles', {
	extend : 'Common.store.sync.SqliteStore',

	requires : [
        'Common.store.proxy.SqliteView',
        'Common.model.UserProfile'
    ],

	config : {
		storeId : 'userProfileStore',
		model : 'Common.model.UserProfile',
		autoLoad : false,
		enableAutoLoad : true,
		remoteFilter : true,
		proxy : {
			type : 'SqliteView',

            viewDefinition: 'SELECT User.user_name,User.email,Craftsperson.cf_id' +
                            ',Employee.em_id,Employee.phone,Employee.bl_id,Employee.fl_id,Employee.rm_id,Employee.dv_id,Employee.dp_id' +
                            ',Building.site_id FROM User LEFT OUTER JOIN Craftsperson ON ' +
                            'User.email = Craftsperson.email LEFT OUTER JOIN Employee ON ' +
                            'User.email = Employee.email LEFT OUTER JOIN Building ON ' +
                            'Employee.bl_id = Building.bl_id',

            viewName : 'userProfile',

			baseTables : [ 'Employee', 'Building', 'Craftsperson', 'User' ]
		}
	}
});