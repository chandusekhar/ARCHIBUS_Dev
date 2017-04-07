Ext.define('Maintenance.view.overlay.HoldAction', {
    extend: 'Ext.Panel',

    xtype: 'holdActionPanel',

    config: {
        modal: true,
        hidden: true,
        hideOnMaskTap: false,
        padding: '4px',
        defaults: {
            xtype: 'button',
            height: '30px',
            scope: this,
            margin: '6px'
        },
        items: [
            {
                text: LocaleManager.getLocalizedString('On Hold For Parts',
                    'Maintenance.view.overlay.HoldAction'),
                itemId: 'holdParts'
            },
            {
                text: LocaleManager.getLocalizedString('On Hold for Labor',
                    'Maintenance.view.overlay.HoldAction'),
                itemId: 'holdLabor'
            },
            {
                text: LocaleManager.getLocalizedString('On Hold for Access',
                    'Maintenance.view.overlay.HoldAction'),
                itemId: 'holdAccess'
            },
            {
                text: LocaleManager.getLocalizedString('Resume To Issued',
                    'Maintenance.view.overlay.HoldAction'),
                itemId: 'resumeToIssued'
            },
            {
                text: LocaleManager.getLocalizedString('No Status Change',
                    'Maintenance.view.overlay.HoldAction'),
                itemId: 'holdCancel'
            }
        ]
    }
});