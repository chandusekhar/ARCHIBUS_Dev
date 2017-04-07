/**
 * Encapsulates the current user profile properties.
 *
 * @author Jeff Martin
 * @since 21.1
 * @singleton
 */

Ext.define('Common.util.UserProfile', {
    alternateClassName: [ 'UserProfile' ],
    requires: [
        'Common.Session',
        'Common.service.MobileSecurityServiceAdapter'
    ],


    singleton: true,

    getUserProfile: function () {
        var me = this,
            store = Ext.getStore('userInfo');

        // Check if the store is loaded. Load it if it is not
        if (store && store.isLoaded()) {
            return me.loadUserProfile(store);
        } else {
            throw new Error(LocaleManager.getLocalizedString('The User Profile information is not available. Please Sync to retrieve the User Profile data.',
                'Common.util.UserProfile'));
        }
    },

    /**
     * @private
     * @param {Ext.data.Store} store
     * @returns {Object} userProfileObject
     */
    loadUserProfile: function (store) {
        // There is at most one record in the store
        var record = store.getAt(0);

        var userProfileObject = {
            user_name: '',
            em_id: '',
            email: '',
            cf_id: '',
            phone: '',
            site_id: '',
            bl_id: '',
            fl_id: '',
            rm_id: '',
            dv_id: '',
            dp_id: ''
        };

        if (!Ext.isEmpty(record)) {
            userProfileObject.user_name = record.get('user_name');
            userProfileObject.em_id = record.get('em_id');
            userProfileObject.email = record.get('email');
            userProfileObject.cf_id = record.get('cf_id');
            userProfileObject.bl_id = record.get('bl_id');
            userProfileObject.fl_id = record.get('fl_id');
            userProfileObject.rm_id = record.get('rm_id');
            userProfileObject.dv_id = record.get('dv_id');
            userProfileObject.dp_id = record.get('dp_id');
            userProfileObject.site_id = record.get('site_id');
            userProfileObject.phone = record.get('phone');
        }

        return userProfileObject;
    }

});