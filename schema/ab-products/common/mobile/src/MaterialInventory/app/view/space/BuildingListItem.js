Ext.define('MaterialInventory.view.space.BuildingListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'materialBuildingListItem',

    config: {

        cls: 'component-list-item',

        image: {
            cls: 'ab-buildingimage'
        },

        buildingInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        materialsButton: {
            xtype: 'button',
            iconCls: 'doc_pencil',
            cls: ['ab-list-item-button', 'ab-icon-button', 'x-button-icon-secondary']
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

    applyMaterialsButton: function (config) {
        var buttonContainer = Ext.factory(config, Ext.Container, this.getMaterialsButton());

        buttonContainer.innerElement.dom.setAttribute('materialsbutton', true);
        return buttonContainer;
    },

    updateMaterialsButton: function (newButton, oldButton) {
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
        var buildingInfo = this.getBuildingInfo(),
            imageData,
            image = this.getImage(),
            materialsButton = this.getMaterialsButton();

        if (newRecord) {
            imageData = newRecord.get('bldg_photo_contents');
            if (imageData) {
                image.setSrc('data:image/jpg;base64,' + imageData);
                image.removeCls('ab-buildingimage');
            } else {
                image.addCls('ab-buildingimage');
            }
            buildingInfo.setHtml(this.buildBuildingInfo(newRecord));

            materialsButton.setHidden(newRecord.get('has_materials') === 0);
            materialsButton.setRecord(newRecord);
        }
        this.callParent(arguments);
    },

    buildBuildingInfo: function (record) {
        var buildingInfo = record.getData(),
            html,
            doneInventoryDate = record.get('done_inventory_date'),
            itemColor = (Ext.isEmpty(doneInventoryDate) || Ext.isEmpty(AppMode.getInventoryDate()) || doneInventoryDate.getTime() < AppMode.getInventoryDate().getTime()) ? 'black' : '#FFCC66';

        html = '<span style="color:' + itemColor + '">';

        html += '<div>' + buildingInfo.bl_id;
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

        html += '</span>';

        return html;
    }
});