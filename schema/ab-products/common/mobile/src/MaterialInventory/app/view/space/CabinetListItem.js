Ext.define('MaterialInventory.view.space.CabinetListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'cabinetListItem',

    config: {

        cls: 'component-list-item',

        cabinetInfo: {
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

    applyCabinetInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getCabinetInfo());
    },

    updateCabinetInfo: function (newCabinetInfo, oldCabinetInfo) {
        if (newCabinetInfo) {
            this.add(newCabinetInfo);
        }
        if (oldCabinetInfo) {
            this.remove(oldCabinetInfo);
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
        var cabinetInfo = this.getCabinetInfo(),
            materialsButton = this.getMaterialsButton();

        if (newRecord) {
            cabinetInfo.setHtml(this.buildCabinetInfo(newRecord));
            materialsButton.setHidden(newRecord.get('has_materials') === 0);
            materialsButton.setRecord(newRecord);
        }

        this.callParent(arguments);
    },

    buildCabinetInfo: function (record) {
        var aisleId = record.get('aisle_id'),
            cabinetId = record.get('cabinet_id'),
            name = record.get('name') ? record.get('name') : '',
            doneInventoryDate = record.get('done_inventory_date'),
            itemColor = (Ext.isEmpty(doneInventoryDate) || Ext.isEmpty(AppMode.getInventoryDate()) || doneInventoryDate.getTime() < AppMode.getInventoryDate().getTime()) ? 'black' : '#FFCC66',
            infoString = '<span style="color:{3}"><div>{0} {1} {2}</div></span>';

        return Ext.String.format(infoString, aisleId, cabinetId, name, itemColor);
    }
});