Ext.define('Common.view.registration.Registration', {
    extend: 'Common.form.FormPanel',
    requires: 'Ext.util.DelayedTask',

    xtype: 'registration',

    /**
     * @private
     * Flag used to prevent the register button from registering multiple taps
     */
    registerDeviceButtonTapped: false,


    config: {
        zIndex: 20,

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        displayCloseButton: true,

        items: [
            {
                xtype: 'titlebar',
                cls: 'ab-titlebar',
                height: Ext.os.is.Phone ? '45px' : '80px',
                docked: 'top',
                items: [
                    {
                        xtype: 'container',
                        height: Ext.os.is.Phone ? '40px' : '60px',
                        width: Ext.os.is.Phone ? '40px' : '60px',
                        style: 'margin-left:8px',
                        itemId: 'abIcon'

                    },
                    {
                        xtype: 'container',
                        cls: 'ailogo',
                        height: Ext.os.is.Phone ? '40px' : '60px',
                        width: Ext.os.is.Phone ? '150px' : '225px',
                        itemId: 'ailogo'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'delete',
                        align: 'right',
                        action: 'closeRegistrationView',
                        itemId: 'closeButton'
                    }
                ]
            },
            {
                xtype: 'container',
                padding: '4px',
                style: 'margin:2px;border:2px solid #D6DFED;background-color:#EFF3F9',
                defaults: {
                    labelAlign: Ext.os.is.Phone ? 'top' : 'left'
                },
                items: [
                    {
                        xtype: 'textfield',
                        label: LocaleManager.getLocalizedString('Username', 'AppLauncher.view.Registration'),
                        name: 'username',
                        required: true,
                        autoComplete: false,
                        autoCorrect: false,
                        placeHolder: LocaleManager.getLocalizedString('ARCHIBUS user name (upper case)', 'AppLauncher.view.Registration')
                    },
                    {
                        xtype: 'passwordfield',
                        label: LocaleManager.getLocalizedString('Password', 'AppLauncher.view.Registration'),
                        required: true,
                        name: 'password',
                        placeHolder: LocaleManager.getLocalizedString('ARCHIBUS password (case-sensitive)', 'AppLauncher.view.Registration')
                    },
                    {
                        xtype: 'container',
                        padding: Ext.os.is.Phone ? '30px 0px 10px 0px' : '30px',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: {
                            xtype: 'button',
                            itemId: 'registerButton',
                            text: LocaleManager.getLocalizedString('Register Device', 'AppLauncher.view.Registration'),
                            minWidth: Ext.os.is.Phone ? '300px' : '400px',
                            ui: 'action'
                        }
                    },
                    {
                        xtype: 'container',
                        padding: Ext.os.is.Phone ? '20px 0px 10px 0px' : '30px',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: {
                            xtype: 'button',
                            text: LocaleManager.getLocalizedString('Sign in as Guest', 'AppLauncher.view.Registration'),
                            action: 'guestSignOn',
                            itemId: 'guestSignOnButton',
                            hidden: true,
                            minWidth: Ext.os.is.Phone ? '300px' : '400px',
                            ui: 'action'
                        }
                    }

                ]
            }
        ]
    },

    initialize: function (config) {
        var me = this,
            passwordField = me.down('passwordfield'),
            userNameField = me.down('textfield[name=username]'),
            registerButton = me.down('#registerButton'),
            guestSignOnButton = me.down('#guestSignOnButton'),
            isNativeMode = Environment.getNativeMode(),
            task = Ext.create('Ext.util.DelayedTask'),
            iconContainer = me.down('#abIcon'),
            iconContainerCls = Ext.os.is.Phone ? 'ab-titlebar-logo' : 'ab-titlebar-logo-large';


        me.callParent([config]);

        me.innerElement.addCls('ab-form-color');

        // Use different images sizes for the phone and tablet platforms.
        iconContainer.addCls(iconContainerCls);

        guestSignOnButton.setHidden(isNativeMode);

        registerButton.on('tap', me.onRegisterButtonTapped, me);

        // Force user name to be upper case.
        // Android devices use a native registration form to eliminate issues with the
        // text field auto complete function.
        userNameField.on('keyup', function (textField, e) {
            task.delay(300, function () {
                var value = textField.getValue().toUpperCase();
                e.stopPropagation();
                e.stopEvent();
                textField.setValue('');
                textField.setValue(value);
            });
        }, me);

        me.setFormPlaceHolderText(userNameField, passwordField);
    },

    applyDisplayCloseButton: function (config) {
        var me = this,
            closeButton = me.down('#closeButton');

        if (closeButton) {
            closeButton.setHidden(!config);
        }

        return config;
    },

    onRegisterButtonTapped: function () {
        var me = this,
            passwordField = me.down('passwordfield');

        if (me.registerDeviceButtonTapped === true) {
            return;
        }

        me.registerDeviceButtonTapped = true;

        passwordField.blur();
        // Use a delay to allow Android devices to process the change to the
        // password field
        setTimeout(function () {
            me.fireEvent('register', me);
            me.clearRegisterDeviceButtonFlag();
        }, 50);
    },

    clearRegisterDeviceButtonFlag: function () {
        var me = this;
        setTimeout(function () {
            me.registerDeviceButtonTapped = false;
        }, 1000);
    },

    setFormPlaceHolderText: function (userNameField, passwordField) {
        var userNameText = LocaleManager.getLocalizedString('User name (upper case)', 'AppLauncher.view.Registration'),
            passwordText = LocaleManager.getLocalizedString('Password (case-sensitive)', 'AppLauncher.view.Registration');

        userNameField.setPlaceHolder(userNameText);
        passwordField.setPlaceHolder(passwordText);
    },

    /**
     * Parses the URL saved in the ConfigFileManager instance. Parses the URL
     * and displays the Web Central URL in the URL field.
     * @returns {string} The parsed URL
     */
    getWebCentralUrl: function () {
        var webCentralUrl = ConfigFileManager.url,
            index = webCentralUrl.indexOf('/archibus/');

        return webCentralUrl.substring(index, 0) + '/archibus';
    }
});
