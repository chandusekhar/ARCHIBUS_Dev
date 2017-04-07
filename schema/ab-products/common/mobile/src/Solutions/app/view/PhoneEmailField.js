Ext.define('Solutions.view.PhoneEmailField', {
    extend: 'Common.view.navigation.EditBase',

    requires: [
        'Common.control.field.Phone',
        'Common.control.field.Email'
    ],

    config: {
        defaults: {
            xtype: 'fieldset',
            margin: '6px'
        },
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        items: [
            {
                xtype: 'container',
                styleHtmlContent: true,
                html: Ext.os.is.Phone ? 'Uses the phone field - \'Common.control.field.Phone\'<br> and the email field- \'Common.control.field.Email\'.' :
                    'Uses the phone field \'Common.control.field.Phone\' and the email field \'Common.control.field.Email\'.'
            },
            {
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelAlign: Ext.os.is.Phone ? 'top' : 'left'
                },
                items: [
                    {
                        xtype: 'commonphonefield',
                        label: 'Phone'
                    },
                    {
                        xtype: 'commonemailfield',
                        label: 'Email'
                    }
                ]
            },
            {
                xtype: 'container',
                styleHtmlContent: true,
                html: 'Read only fields with preset values.'
            },
            {
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelAlign: Ext.os.is.Phone ? 'top' : 'left'
                },
                items: [
                    {
                        xtype: 'commonphonefield',
                        label: 'Phone',
                        readOnly: true,
                        value: '338-1011'
                    },
                    {
                        xtype: 'commonemailfield',
                        label: 'Email',
                        readOnly: true,
                        value: 'test_address@tgd.com'
                    }
                ]
            }
        ]
    }
});