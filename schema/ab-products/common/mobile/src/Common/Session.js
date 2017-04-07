/**
 * Provides WebCentral user session management: starts and ends user session around the specified operation. The
 * operation is typically a DWR service call, if that service method requires existing user session.
 *
 * @deprecated 23.1 Use Common.service.Session instead.
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.Session', {

    requires: [
        'Common.service.MobileSecurityServiceAdapter',
        'Common.util.ConfigFileManager',
        'Common.util.Device',
        'Ext.data.identifier.Uuid'
    ],

    config: {
        /**
         * @cfg {String} deviceId ID of the device.
         * Required to login to WebCentral, if WebCentral is not in SSO mode.
         */
        deviceId: null,

        /**
         * @cfg {String} username Username of the current user.
         * Cached in this class, to be used in derived classes to create restrictions by username and to pass to
         * WFRs.
         */
        username: null,

        /**
         * @cfg {String} localeName Current Java locale name, for example "en_US".
         * Used after the WebCentral user session is started, to set the locale of the session.
         */
        localeName: null,

        sessionId: null
    },

    statics: {
        sessionCount: 0
    },

    constructor: function(config) {
        var me = this,
            sessionId;

        me.initConfig(config);

        sessionId = Ext.data.identifier.Uuid.Global.generate();
        me.setSessionId(sessionId);
    },

    /**
     * Sets the Session properties using the properties stored in the ConfigFileManager class.
     * @private
     */
    setSessionProperties: function() {
        var me = this;

        me.setDeviceId(ConfigFileManager.deviceId);
        me.setUsername(ConfigFileManager.username);
        me.setLocaleName(ConfigFileManager.localeName);
    },

    /**
     *  Performs specified callbackOperation in context of user session: starts new user session,
     *         performs callbackOperation, ends the user session.
     *
     * @throws an
     *             exception if user does not have the authorization to access Web Central from a mobile device,
     *             or if user account cannot be found, or if user session cannot be started.
     *
     */
    doInSession: function(callbackOperation) {
        var me = this;
        me.setSessionProperties();
        try {
            if (Common.Session.sessionCount > 0) {
                me.logoutOfOrphanedSessions();
            }
            Common.Session.sessionCount += 1;
            MobileSecurityServiceAdapter.startMobileUserSession(me.getDeviceId(), me.getLocaleName());
            Log.log(Ext.String.format('Start Session Client Session Id:[{0}]', me.getSessionId()), me, arguments);
            callbackOperation();
        }
        catch (e) {
            throw new Error(e);
        }
        finally {
            MobileSecurityServiceAdapter.logout();
            Log.log(Ext.String.format('End Session Client Session Id:[{0}]', me.getSessionId()), me, arguments);
            if (Common.Session.sessionCount > 0) {
                Common.Session.sessionCount -= 1;
            }
        }
    },

    /**
     * Performs specified callbackOperation in context of user session: starts new user session,
     *         performs callbackOperation, ends the user session. Notifies the caller when the
     *         session has been closed
     * In some cases, when performing multiple service calls, program control can return to the caller
     * before the session has been closed.
     * For these cases, the onLogout callback is provided to allow the caller to know when the session
     * has ended
     * @param {Function} callbackOperation The operation to execute in the session
     * @param {Function} onLogout Function called when the session has ended
     * @param {Object} scope Scope to execute the callback in.
     * @deprecated 23.1
     */
    doInSessionWithLogoutNotify: function (operation, onLogout, scope) {
        var me = this;
        me.setSessionProperties();
        try {
            if (Common.Session.sessionCount > 0) {
                me.logoutOfOrphanedSessions();
            }
            MobileSecurityServiceAdapter.startMobileUserSession(me.getDeviceId(), me.getLocaleName());
            Log.log(Ext.String.format('Start Session Client Session Id:[{0}]', me.getSessionId()), 'info', me, arguments);
            Common.Session.sessionCount += 1;
            operation();
        } finally {
            Common.service.MobileSecurityServiceAdapter.logout();
            if (Common.Session.sessionCount > 0) {
                Common.Session.sessionCount -= 1;
            }
            if (typeof onLogout === 'function') {
                onLogout.call(scope || me);
            }
        }
    },

    /**
     * Close all open sessions. Orphaned sessions can occur when an exception is thrown
     * and the processing is not stopped before the exception is handled.
     */
    logoutOfOrphanedSessions: function() {
        var orphanedSessions = Common.Session.sessionCount,
            i;

        for (i = 0; i < orphanedSessions; i++) {
            MobileSecurityServiceAdapter.logout();
            Log.log('Closing Orphaned Session: Calls to startSession and endSession should be balanced.','warn', this, arguments);
            Log.log(Ext.String.format('End Session Client Session Id:[{0}]', this.getSessionId()), 'info', this, arguments);
            Common.Session.sessionCount -= 1;
        }
    },

    /**
     * Starts a user session. The programmer is responsible for closing the session
     * using the endSession function.
     */
    startSession: function() {
        var me = this,
            deviceId = ConfigFileManager.deviceId,
            localeName = ConfigFileManager.localeName;

        if (Common.Session.sessionCount > 0) {
            me.logoutOfOrphanedSessions();
        }

        // TODO: Handle errors
        MobileSecurityServiceAdapter.startMobileUserSession(deviceId, localeName);
        Log.log(Ext.String.format('Start Session Client Session Id:[{0}]', me.getSessionId()), 'info', me, arguments);
        Common.Session.sessionCount += 1;
    },

    /**
     * Ends a user session
     */
    endSession: function() {
        MobileSecurityServiceAdapter.logout();
        Log.log(Ext.String.format('End Session Client Session Id:[{0}]', this.getSessionId()), 'info', this, arguments);
        if (Common.Session.sessionCount > 0) {
            Common.Session.sessionCount -= 1;
        }
    },


    /**
     * Starts a user session. Does not throw an exception if the session invocation fails
     * @returns {Object} sessionResult
     *         success - true if the session started without errors
     *         errorMessage - the error message if success is false.
     */
    startSessionWithReturn: function startSessionWithReturn() {
        var me = this,
            deviceId = ConfigFileManager.deviceId,
            localeName = ConfigFileManager.localeName,
            sessionResult;

        if (Common.Session.sessionCount > 0) {
            me.logoutOfOrphanedSessions();
        }

        Log.log(Ext.String.format('Start Session Client Session Id:[{0}]', me.getSessionId()), 'info', me, arguments);
        sessionResult = MobileSecurityServiceAdapter.startMobileUserSessionWithReturn(deviceId, localeName);
        Common.Session.sessionCount += 1;

        return sessionResult;
    }
});