/**
 * Displays Web Central, Mobile Client and App build info
 * @author Jeff Martin
 * @since 23.1
 */
Ext.define('AppLauncher.view.Version', {
    extend: 'Ext.Container',

    requires: 'Common.control.field.Text',

    xtype: 'aboutPanel',

    config: {
        scrollable: true,
        height: '100%',
        cls: 'ab-about',
        items: [
            {
                xtype: 'fieldset',
                style: 'margin:30px 10px 10px 10px',
                items: [
                    {
                        xtype: 'commontextfield',
                        itemId: 'mobileClientVersion',
                        label: LocaleManager.getLocalizedString('Mobile Client 2.0 Version', 'AppLauncher.view.About'),
                        readOnly: true,
                        labelWidth: '50%'
                    },
                    {
                        xtype: 'commontextfield',
                        itemId: 'webCentralVersion',
                        label: LocaleManager.getLocalizedString('Web Central Version','AppLauncher.view.About'),
                        readOnly: true,
                        labelWidth: '50%'
                    }
                ]
            },
            {
                xtype: 'container',
                itemId: 'buildVersionContainer',
                styleHtmlContent: true
            }
        ]
    }
});