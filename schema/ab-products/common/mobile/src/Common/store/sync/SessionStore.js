/**
 * Provides persistence and synchronization to application domain objects/models.
 * Uses SQLite database for persistence.
 * Uses DWR services for synchronization with the server.
 * Holds information required for mapping to the server-side table: serverTableName, inventoryKeyNames.
 * The Store class encapsulates a cache of domain objects.
 *
 * @deprecated Use {@link Common.service.Session} To start and end sessions at the application leve.
 * Stores no longer manage their own sessions. Sessions are started and ended by the application. The
 * application should start a single session for each service action. KB 3044818
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.sync.SessionStore', {
	extend : 'Common.store.sync.SqliteStore',
	requires : [ 'Common.Session' ],

	constructor : function() {
		this.callParent(arguments);
		this.cacheSession();
	},

	// Cached references
	session : null,

	/**
	 * Caches reference to Session with the deviceId from the preferences.
	 * 
	 * @private
	 */
	cacheSession : function() {
		// create and cache Session
		this.session = Ext.create('Common.Session');
	},

	/**
	 * Calls specified callback in context of user session: starts new user session, calls callback, ends the user
	 * session. To be called from the corresponding controller.
     * The callback needs to be specified in the controller, and should contain business logic specific for the
	 * application and the table. The callback typically contains calls to the synchronize method and to the DWR
	 * services.
	 * 
	 * @param {Function} callback to be called inside of the WebCentral user session.
	 * 
	 */
	doInSession : function(callback) {
		this.session.doInSession(callback);
	},

    /**
     * Calls specified callback in context of user session: starts new user session, calls callback, ends the user
     * session. To be called from the corresponding controller.
     * @param {Function} callback  Function executed inside the sessioin
     * @param {Function} onLoggedOut  Called when the session has ended
     * @param {Object} scope The scope to execute onLoggedOut callback.
     */
    doInSessionWithLogoutNotify: function (callback, onLoggedOut, scope) {
        this.session.doInSessionWithLogoutNotify(callback, onLoggedOut, scope);
    }

});