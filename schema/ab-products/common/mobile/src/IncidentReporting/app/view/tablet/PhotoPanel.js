Ext.define('IncidentReporting.view.tablet.PhotoPanel', {
    extend: 'IncidentReporting.view.PhotoPanel',

    xtype: 'tabletIncidentPhotoPanel',

    config: {
        modal: true,
        hidden: true,
        hideOnMaskTap: false,
        width: 400,
        height: 500,
        centered: true
    }
});