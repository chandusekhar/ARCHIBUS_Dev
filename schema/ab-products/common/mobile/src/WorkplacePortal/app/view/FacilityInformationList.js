Ext.define('WorkplacePortal.view.FacilityInformationList', {
    extend: 'Common.control.DataView',

    requires: 'WorkplacePortal.view.FacilityInformationListItem',

    xtype: 'facilityInformationListPanel',

    isFacilityInformationList: true,

    config: {

        cls: 'component-list',

        useComponents: true,

        defaultType: 'facilityInformationListItem',

        store: 'mobileMenusStore',

        items: [
            {
                xtype: 'component',
                html: '<div style="font-weight:bold;padding-left:1.2em;padding-bottom:0.6em;padding-top:1.6em;font-size:1.2em;">' +
                    LocaleManager.getLocalizedString('Information', 'WorkplacePortal.view.FacilityInformationList') + '</div>',
                docked: 'top'
            }
        ]
    }
});