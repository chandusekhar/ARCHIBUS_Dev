/**
 * @since 21.2
 */
Ext.define('WorkplacePortal.view.FacilityInformationListItem', {

    extend: 'Ext.dataview.component.DataItem',

    xtype: 'facilityInformationListItem',

    config: {

        cls: 'component-list-item',
        image: {
            cls: 'ab-siteimage'
        },

        facilityInformationInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyFacilityInformationInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getFacilityInformationInfo());
    },

    updateFacilityInformationInfo: function (newFacilityInformationInfo, oldFacilityInformationInfo) {
        if (newFacilityInformationInfo) {
            this.add(newFacilityInformationInfo);
        }
        if (oldFacilityInformationInfo) {
            this.remove(oldFacilityInformationInfo);
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
        var facilityInformationInfo = this.getFacilityInformationInfo(),
            imageData,
            image = this.getImage();

        if (newRecord) {
            imageData = newRecord.get('menu_icon_contents');
            if (imageData) {
                image.removeCls('ab-siteimage');
                image.setSrc('data:image/jpg;base64,' + imageData);
            }
            facilityInformationInfo.setHtml(this.buildFacilityInformationInfo(newRecord));

        }
        this.callParent(arguments);
    },

    buildFacilityInformationInfo: function (record) {
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