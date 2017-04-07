Ext.define('MaterialInventory.view.MaterialListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'materialListItem',

    config: {

        cls: 'component-list-item',

        materialInfo: {
            flex: Ext.os.is.Phone ? 3 : 10,
            cls: 'x-detail'
        },

        buttonContainer: {
            layout: Ext.os.is.Phone ? 'vbox' : 'hbox',
            flex: 1,
            items: [
                {
                    xtype: 'button',
                    action: 'viewMsds',
                    iconCls: 'news',
                    cls: ['ab-list-item-button', 'ab-icon-button', 'x-button-icon-secondary']
                },
                {
                    xtype: 'button',
                    action: 'verifyMaterial',
                    iconCls: 'check',
                    cls: ['ab-icon-button']
                }
            ]
        },

        statusInfo: {
            flex: 2,
            align: 'right'
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyMaterialInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getMaterialInfo());
    },

    updateMaterialInfo: function (newMaterialInfo, oldMaterialInfo) {
        if (newMaterialInfo) {
            this.add(newMaterialInfo);
        }
        if (oldMaterialInfo) {
            this.remove(oldMaterialInfo);
        }
    },

    applyButtonContainer: function (config) {
        return Ext.factory(config, Ext.Container, this.getButtonContainer());
    },

    updateButtonContainer: function (newContainer, oldContainer) {
        if (newContainer) {
            this.add(newContainer);
        }
        if (oldContainer) {
            this.remove(oldContainer);
        }
    },

    applyStatusInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getStatusInfo());
    },

    updateStatusInfo: function (newStatusInfo, oldStatusInfo) {
        if (newStatusInfo) {
            this.add(newStatusInfo);
        }
        if (oldStatusInfo) {
            this.remove(oldStatusInfo);
        }
    },

    updateRecord: function (newRecord) {
        var materialInfo = this.getMaterialInfo(),
            buttonContainer = this.getButtonContainer(),
            statusInfo = this.getStatusInfo(),
            buttons;

        if (newRecord) {
            materialInfo.setHtml(this.buildMaterialInfo(newRecord));
            statusInfo.setHtml(this.buildStatusInfo(newRecord));

            buttons = buttonContainer.query('button');
            Ext.each(buttons, function (button) {
                button.setRecord(newRecord);
            }, this);

            this.showHideCheckButton(newRecord);
        }
        this.callParent(arguments);
    },

    showHideCheckButton: function (record) {
        var buttonContainer = this.getButtonContainer(),
            verifyButton = buttonContainer.query('button[action=verifyMaterial]')[0];

        if (verifyButton) {
            if ((AppMode.isInventoryUpdateMode() || AppMode.isInventoryMode()) && !Ext.isEmpty(AppMode.getInventoryDate())) {
                verifyButton.setHidden(false);
                verifyButton.setRecord(record);
                MaterialInventory.util.Ui.setColorOfCheckButton(verifyButton, record);
            } else {
                verifyButton.setHidden(true);
            }
        }
    },

    buildMaterialInfo: function (record) {
        var html,
            productName = record.get('product_name'),
            containerCode = record.get('container_code') ? record.get('container_code') : '',
            blId = record.get('bl_id') ? record.get('bl_id') : '',
            flId = record.get('fl_id') ? record.get('fl_id') : '',
            rmId = record.get('rm_id') ? record.get('rm_id') : '',
            aisleId = record.get('aisle_id') ? record.get('aisle_id') : '',
            cabinetId = record.get('cabinet_id') ? record.get('cabinet_id') : '',
            shelfId = record.get('shelf_id') ? record.get('shelf_id') : '',
            binId = record.get('bin_id') ? record.get('bin_id') : '',
            quantity = record.get('quantity'),
            quantity_units = record.get('quantity_units') ? record.get('quantity_units') : '',
            dateLastInv = record.get('date_last_inv'),
            itemColor;

        itemColor = this.getItemColor(dateLastInv);

        html = ['<div class="prompt-list-hbox">',
            '<h1 style="width:' + (Ext.os.is.Phone ? '100%' : '50%') + '; font-weight: bold; color:', itemColor, '">', productName, '</h3>',
            '<h3 style="width:30%;">', quantity, ' ', quantity_units, '</h1>',
            '</div>',
            '<div class="prompt-list-hbox">',
            '<h3 style="color:', itemColor, '">',
            containerCode,
            '</h3>',
            '</div>',
            '<div class="prompt-list-hbox">',
            '<h3 style="color:', itemColor, '">',
            blId, ' ', flId, ' ', rmId, ' ', aisleId, ' ', cabinetId, ' ', shelfId, ' ', binId,
            '</h3>',
            '</div>']
            .join('');

        return html;
    },

    buildStatusInfo: function (record) {
        var html,
            status = record.get('container_status'),
            displayStatus = Common.util.Ui.getEnumeratedDisplayValue('msds_location_sync', 'container_status', status),
            tier2 = record.get('tier2'),
            dotClass;

        switch (tier2) {
            case 'Unknown':
                dotClass = 'dot-unknown';
                break;
            case 'Not Listed':
                dotClass = 'dot-not-listed';
                break;
            case  'Hazardous':
                dotClass = 'dot-hazardous';
                break;
            case 'Extremely Hazardous':
                dotClass = 'dot-extremly-hazardous';
                break;
        }

        html = ['<div class="list-element-right">',
            '<div class="text-element">' + displayStatus + '</div>',

            '<div class="x-button ab-icon-button">',
            '<span class="x-button-icon x-shown dot ' + dotClass + '">&nbsp;</span>',
            '</div>',
            '</div>']
            .join('');

        return html;
    },

    getItemColor: function (dateLastInv) {
        var itemColor;

        if (Ext.isEmpty(dateLastInv)) {
            itemColor = 'black';
        } else {
            if (!Ext.isEmpty(AppMode.getInventoryDate()) && dateLastInv.getTime() >= AppMode.getInventoryDate().getTime()) {
                itemColor = '#FFCC66';
            } else {
                itemColor = 'black';
            }
        }
        return itemColor;
    }
});