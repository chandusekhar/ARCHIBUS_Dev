/**
 * @since 21.2
 */
Ext.define('Space.view.BuildingListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'buildingListItem',

    config: {

        cls: 'component-list-item',

        image: {
            cls: 'ab-buildingimage'
        },

        buildingInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        detailButton: {
            cls: 'ab-space-detail-button'
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyBuildingInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getBuildingInfo());
    },

    updateBuildingInfo: function (newBuildingInfo, oldBuildingInfo) {
        if (newBuildingInfo) {
            this.add(newBuildingInfo);
        }
        if (oldBuildingInfo) {
            this.remove(oldBuildingInfo);
        }
    },

    applyDetailButton: function (config) {
        var buttonContainer = Ext.factory(config, Ext.Container, this.getDetailButton());

        buttonContainer.innerElement.dom.setAttribute('detailbutton', true);
        buttonContainer.innerElement.addCls('ab-detail-icon');
        return buttonContainer;
    },

    updateDetailButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
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
        var me = this,
            buildingInfo = me.getBuildingInfo(),
            imageData,
            image = me.getImage();

        if (newRecord) {
            imageData = newRecord.get('bldg_photo_contents');
            if (imageData) {
                image.setSrc('data:image/jpg;base64,' + imageData);
                image.removeCls('ab-buildingimage');
            } else {
                image.addCls('ab-buildingimage');
            }
            buildingInfo.setHtml(me.buildBuildingInfo(newRecord));
        }
        me.callParent(arguments);
    },

    buildBuildingInfo: function (record) {
        var buildingInfo = record.getData(), html;

        html = '<div>' + buildingInfo.bl_id;
        if (buildingInfo.name !== null) {
            html += ', ' + buildingInfo.name;
        }
        html += '</div><h3>';
        if (buildingInfo.city_id !== null) {
            html += buildingInfo.city_id;
        }
        if (buildingInfo.state_id !== null) {
            html += ' ' + buildingInfo.state_id;
        }
        if (buildingInfo.ctry_id) {
            html += ', ' + buildingInfo.ctry_id;
        }
        html += '</h3>';

        return html;
    }
});