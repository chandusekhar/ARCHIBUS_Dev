Ext.define('AppLauncher.view.Preferences', {
    extend: 'Ext.form.FormPanel',

    requires: 'Common.util.ConfigFileManager',

    xtype: 'preferencesPanel',

    config: {
        layout: {
            type: 'vbox'
        },
        showAnimation: {
            type: 'slide',
            direction: 'up',
            duration: 300
        },

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        defaults: {
            xtype: 'fieldset'
        },

        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                title: LocaleManager.getLocalizedString('Preferences', 'AppLauncher.view.tablet.Preferences'),
                items: [
                    {
                        xtype: 'button',
                        align: 'right',
                        action: 'cancelPreferences',
                        text: LocaleManager.getLocalizedString('Done', 'AppLauncher.view.tablet.Preferences')
                    }

                ]
            },
            {
                itemId: 'urlFieldSet',
                padding: '4px',
                margin: Ext.os.is.Phone ? '2px' : '20px',

                style: 'border:1px solid #748FB7;-webkit-border-radius:0.3em',
                items: [
                    {
                        xtype: 'textfield',
                        label: LocaleManager.getLocalizedString('Web Central URL',  'AppLauncher.view.tablet.Preferences'),
                        name: 'url',
                        labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                        readOnly: true
                    },
                    {
                        xtype: 'container',
                        height: '80px',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Change Web Central Server URL', 'AppLauncher.view.tablet.Preferences'),
                                action: 'resetWebCentralUrl',
                                minWidth: Ext.os.is.Phone ? '300px' : '400px',
                                ui: 'action',
                                centered: true
                            }
                        ]
                    }
                ]
            },
            {
                padding: '2px',
                margin: Ext.os.is.Phone ? '2px' : '20px',
                style: 'border:1px solid #748FB7;-webkit-border-radius:0.3em',
                items: [
                    {
                        xtype: 'textfield',
                        label: LocaleManager.getLocalizedString('Registered User', 'AppLauncher.view.tablet.Preferences'),
                        name: 'user_name',
                        labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                        readOnly: true
                    },
                    {
                        xtype: 'container',
                        height: '80px',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Change Registered User',
                                    'AppLauncher.view.tablet.Preferences'),
                                action: 'registerUser',
                                minWidth: Ext.os.is.Phone ? '300px' : '400px',
                                ui: 'action'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                height: '80px',
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'center'
                },
                padding: '2px',
                margin: Ext.os.is.Phone ? '2px' : '20px',
                style: 'border:1px solid #748FB7;-webkit-border-radius:0.3em',
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Reset Background Data Sync Flag',
                            'AppLauncher.view.tablet.Preferences'),
                        action: 'resetSyncHistory',
                        minWidth: Ext.os.is.Phone ? '300px' : '400px',
                        ui: 'action'

                    }
                ]
            },
            {
                padding: '2px',
                margin: Ext.os.is.Phone ? '2px' : '20px',
                style: 'border:1px solid #748FB7;-webkit-border-radius:0.3em',
                items: [
                    {
                        xtype: 'togglefield',
                        label: 'Logging'
                    },
                    {
                        xtype: 'selectfield',
                        label: 'Minimum Level',
                        options: [
                            {text: 'VERBOSE - All Messages',  value: 'verbose'},
                            {text: 'INFO', value: 'info'},
                            {text: 'DEPRECATE',  value: 'deprecate'},
                            {text: 'WARN',  value: 'warn'},
                            {text: 'ERROR',  value: 'error'}
                        ]
                    },
                    {
                        xtype: 'container',
                        height: '80px',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Display Log', 'AppLauncher.view.tablet.Preferences'),
                                action: 'displayLog',
                                minWidth: Ext.os.is.Phone ? '300px' : '400px',
                                ui: 'action',
                                centered: true
                            }
                        ]
                    }


                ]
            }
        ]
    },

    setValues: function (userName, url, logging, minLoggingLevel) {
        var me = this,
            webCentralUrlField = me.down('textfield[name=url]'),
            userNameField = me.down('textfield[name=user_name]'),
            loggingField = me.down('togglefield'),
            minLoggingLevelField = me.down('selectfield');

        webCentralUrlField.setValue(url);
        userNameField.setValue(userName);
        loggingField.setValue(logging);
        minLoggingLevelField.setValue(minLoggingLevel);
    },

    /**
     * Sets the regions displayed in the Preferences form.
     * Only display the URL field if we are in native mode
     * Do not display the register user button if we are in SSO mode
     * @param {Boolean} isNativeMode true if the app is launched using the Mobile Client
     * @param {Boolean} isInSsoMode true if Web Central is configured in SSO mode
     */
    setDisplay: function (isNativeMode, isInSsoMode) {
        var me = this,
            urlFieldSet = me.query('#urlFieldSet'),
            registerUserButton = me.query('button[action=registerUser]');

        if (urlFieldSet && urlFieldSet.length > 0) {
            urlFieldSet[0].setHidden(!isNativeMode);
        }

        if (registerUserButton && registerUserButton.length > 0) {
            registerUserButton[0].setHidden(isInSsoMode);
        }
    },

    initialize: function () {
        var textFields = this.query('textfield');

        if (Ext.os.is.Phone) {
            Ext.each(textFields, function (field) {
                field.getComponent().setStyle('padding-left:0.8em');
            });
        }
    }
});