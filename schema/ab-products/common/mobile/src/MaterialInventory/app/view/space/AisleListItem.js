Ext.define('MaterialInventory.view.space.AisleListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'aisleListItem',

    config: {

        cls: 'component-list-item',

        aisleInfo: {
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

    applyAisleInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getAisleInfo());
    },

    updateAisleInfo: function (newAisleInfo, oldAisleInfo) {
        if (newAisleInfo) {
            this.add(newAisleInfo);
        }
        if (oldAisleInfo) {
            this.remove(oldAisleInfo);
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

    updateRecord: function (newRecord) {
        var aisleInfo = this.getAisleInfo(),
            materialsButton = this.getMaterialsButton();

        if (newRecord) {
            aisleInfo.setHtml(this.buildAisleInfo(newRecord));
            materialsButton.setHidden(newRecord.get('has_materials') === 0);
            materialsButton.setRecord(newRecord);
        }
        this.callParent(arguments);
    },

    buildAisleInfo: function (record) {
        var aisleId = record.get('aisle_id'),
            name = record.get('name') ? record.get('name') : '',
            doneInventoryDate = record.get('done_inventory_date'),
            itemColor = (Ext.isEmpty(doneInventoryDate) || Ext.isEmpty(AppMode.getInventoryDate()) || doneInventoryDate.getTime() < AppMode.getInventoryDate().getTime()) ? 'black' : '#FFCC66',
            infoString = '<span style="color:{2}"><div>{0} {1}</div></span>';

        return Ext.String.format(infoString, aisleId, name, itemColor);
    }
});