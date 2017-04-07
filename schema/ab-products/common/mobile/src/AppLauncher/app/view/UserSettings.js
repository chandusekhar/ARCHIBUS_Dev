Ext.define('AppLauncher.view.UserSettings', {
    extend: 'Common.form.FormPanel',
    xtype: 'usersettings',
    config: {
        title: LocaleManager.getLocalizedString('User', 'AppLauncher.view.UserSettings'),
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        height: '100%',
        items: [
            {
                margin: '10px',
                defaults: {
                    readOnly: true,
                    xtype: 'textfield',
                    labelWidth: '40%'
                },
                items: [
                    {
                        label: LocaleManager.getLocalizedString('Registered User', 'AppLauncher.view.UserSettings'),
                        name: 'user_name',
                        placeHolder: LocaleManager.getLocalizedString('Device is not Registered', 'AppLauncher.view.UserSettings'),
                        itemId: 'userName'
                    },
                    {
                        label: LocaleManager.getLocalizedString('Employee ID', 'AppLauncher.view.UserSettings'),
                        name: 'em_id'
                    },
                    {
                        label: LocaleManager.getLocalizedString('Email', 'AppLauncher.view.UserSettings'),
                        name: 'email'
                    },
                    {
                        label: LocaleManager.getLocalizedString('Phone', 'AppLauncher.view.UserSettings'),
                        name: 'phone'
                    },
                    {
                        label: LocaleManager.getLocalizedString('Building', 'AppLauncher.view.UserSettings'),
                        name: 'bl_id'
                    },
                    {
                        label: LocaleManager.getLocalizedString('Floor', 'AppLauncher.view.UserSettings'),
                        name: 'fl_id'
                    },
                    {
                        label: LocaleManager.getLocalizedString('Room', 'AppLauncher.view.UserSettings'),
                        name: 'rm_id'
                    },
                    {
                        label: LocaleManager.getLocalizedString('Division', 'AppLauncher.view.UserSettings'),
                        name: 'dv_id'
                    },
                    {
                        label: LocaleManager.getLocalizedString('Department', 'AppLauncher.view.UserSettings'),
                        name: 'dp_id'
                    },
                    {
                        xtype: 'container',
                        height: '80px',
                        layout: {
                            type: 'vbox',
                            pack: 'center',
                            align: 'center'
                        },
                        defaults: {
                            minWidth: Ext.os.is.Phone ? '300px' : '400px',
                            ui: 'action',
                            hidden: true,
                            style: 'margin-top:20px'
                        },
                        items: [
                            {
                                xtype: 'button',
                                itemId: 'logoutButton',
                                text: LocaleManager.getLocalizedString('Log Out', 'AppLauncher.view.UserSettings'),
                                action: 'logout'
                            },
                            {
                                xtype: 'button',
                                itemId: 'registerDeviceButton',
                                text: LocaleManager.getLocalizedString('Register Device', 'AppLauncher.view.UserSettings'),
                                action: 'registerDevice'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            logoutButton = me.down('#logoutButton'),
            registerDeviceButton = me.down('#registerDeviceButton');

        Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function (isConnected) {
                if (isConnected) {
                    MobileSecurityServiceAdapter.isSsoMode()
                        .then(function (isSsoMode) {
                                if (isSsoMode) {
                                    logoutButton.setHidden(isSsoMode);
                                    registerDeviceButton.setHidden(isSsoMode);
                                } else {
                                    MobileSecurityServiceAdapter.isDeviceRegistered(ConfigFileManager.deviceId)
                                        .then(function (isRegistered) {
                                            me.setButtonState(isRegistered);
                                        });
                                }
                            }, function () {
                                me.setButtonState(false); // SSO Check error condition
                            }
                        );
                } else {
                    me.setButtonState(false); // No Connection
                }
            });
    },

    setButtonState: function (isRegistered) {
        var me = this,
            logoutButton = me.down('#logoutButton'),
            registerDeviceButton = me.down('#registerDeviceButton');

        logoutButton.setHidden(!isRegistered);
        registerDeviceButton.setHidden(isRegistered);
    },

    applyRecord: function (record) {
        if (record) {
            this.setValues(record);
        }
        return record;
    },

    getFields: function () {
        var me = this,
            fields = me.query('field'),
            formFields = {};

        Ext.each(fields, function (field) {
            formFields[field.getName()] = field;
        });

        return formFields;
    }
});