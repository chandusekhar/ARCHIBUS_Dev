Ext.define('WorkplacePortal.view.ServiceRequestListItem', {

    extend: 'Ext.dataview.component.DataItem',

    xtype: 'serviceRequestListItem',

    config: {

        cls: 'component-list-item',

        image: true,

        serviceRequestInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyServiceRequestInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getServiceRequestInfo());
    },

    updateServiceRequestInfo: function (newServiceRequestInfo, oldServiceRequestInfo) {
        if (newServiceRequestInfo) {
            this.add(newServiceRequestInfo);
        }
        if (oldServiceRequestInfo) {
            this.remove(oldServiceRequestInfo);
        }
    },

    applyImage: function (config) {
        return Ext.factory(config, Ext.Img, this.getImage());
    },

    updateImage: function (newImage, oldImage) {

        if (newImage) {
            this.add(newImage);
        }

        if (oldImage) {
            this.remove(oldImage);
        }
    },

    updateRecord: function (newRecord) {
        var serviceRequestInfo = this.getServiceRequestInfo(),
            imageData,
            image = this.getImage();

        if (newRecord) {
            imageData = newRecord.get('menu_icon_contents');
            if (imageData) {
                image.removeCls('ab-siteimage');
                image.setSrc('data:image/jpg;base64,' + imageData);
            }
            serviceRequestInfo.setHtml(this.buildServiceRequestInfo(newRecord));

        }
        this.callParent(arguments);
    },

    buildServiceRequestInfo: function (record) {
        var activityType = record.get('title'),
            description = record.get('description'),
            html;

        html = '<div>';
        if (!Ext.isEmpty(activityType)) {
            html += '<h1>' + activityType + '</h1>';
        }
        if (!Ext.isEmpty(description)) {
            html += '<h3>' + description + '</h3>';
        }

        return html;
    }

});