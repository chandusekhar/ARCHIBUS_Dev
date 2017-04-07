Ext.define('WorkplacePortal.view.ServiceRequestList', {
    extend: 'Common.control.DataView',

    requires: 'WorkplacePortal.view.ServiceRequestListItem',

    xtype: 'serviceRequestListPanel',

    isServiceRequestList: true,

    config: {

        cls: 'component-list',

        useComponents: true,

        defaultType: 'serviceRequestListItem',

        store: 'facilityServicesMenusStore',

        items: [
            {
                xtype: 'component',
                //style: 'height:2em',
                html: '<div style="font-weight:bold;padding-left:1.2em;padding-bottom:0.6em;font-size:1.2em;">' +
                    LocaleManager.getLocalizedString('Requests', 'WorkplacePortal.view.ServiceRequestList') + '</div>',
                docked: 'top'
            }
        ]

    }
});