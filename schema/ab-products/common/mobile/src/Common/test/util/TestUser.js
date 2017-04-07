Ext.define('Common.test.util.TestUser', {

    requires: [
        'Common.util.Device',
        'Common.util.ConfigFileManager',
        'Common.service.MobileSecurityServiceAdapter'
    ],

    singleton: true,

    testUserDeviceId: null,

    registerTestUser: function(userName, password) {
        var deviceId = Device.generateDeviceId();
        ConfigFileManager.deviceId = deviceId;
        ConfigFileManager.username = userName;
        ConfigFileManager.isRegistered = false;
        ConfigFileManager.isDeviceRegistered = true;  // Set to true to satisfy the Session#isClientRegistered method.

        this.testUserDeviceId = deviceId;

        return Common.service.MobileSecurityServiceAdapter.registerDevice(deviceId, userName, password, 'en_US');
    }
});
