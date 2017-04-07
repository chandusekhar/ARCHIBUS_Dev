Ext.define('IncidentReporting.view.WitnessListItem', {

    extend: 'Ext.dataview.component.DataItem',

    xtype: 'witnessListItem',

    config: {
        cls: 'component-list-item',

        witnessInfo: {
            flex: 5,
            cls: 'x-detail'
        },
        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyWitnessInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getWitnessInfo());
    },

    updateWitnessInfo: function (newWitnessInfo, oldWitnessInfo) {
        if (newWitnessInfo) {
            this.add(newWitnessInfo);
        }
        if (oldWitnessInfo) {
            this.remove(oldWitnessInfo);
        }
    },

    updateRecord: function (newRecord) {
        var witnessInfo = this.getWitnessInfo();

        if (newRecord) {
            witnessInfo.setHtml(this.buildWitnessInfo(newRecord));
        }

        this.callParent(arguments);
    },

    buildWitnessInfo: function (record) {
        var witnessInfo = record.getData(),
            witnessType = witnessInfo.witness_type,
            witnessId = witnessInfo.em_id,
            contactId = witnessInfo.contact_id,
            nonEmName = witnessInfo.non_em_name,
            information = witnessInfo.information === null ? '' : witnessInfo.information,
            affectedPerson;

        if (witnessId) {
            affectedPerson = witnessId;
        } else if (contactId) {
            affectedPerson = contactId;
        } else {
            affectedPerson = nonEmName;
        }

        if (Ext.os.is.Phone) {
            return '<div class="prompt-list-hbox"><h1 style="width:100%;text-align:left">' + witnessType + '</h1></div>'
                + '<div class="prompt-list-hbox"><h3 style="width:100%;text-align:left">' + affectedPerson + '</h3></div>'
                + '<div style="width:100%"><h3>' + information + '</h3></div>';
        } else {
            return '<div class="prompt-list-hbox"><h1 style="width:30%;text-align:left">' + witnessType + '</h1>'
                + '<h1 style="width:70%;text-align:left">' + affectedPerson + '</h1></div>'
                + '<div style="width:100%"><h3>' + information + '</h3></div>';

        }
    }
});