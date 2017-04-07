Ext.define('IncidentReporting.view.IncidentListItem', {

    extend: 'Ext.dataview.component.DataItem',

    xtype: 'incidentListItem',

    config: {
        cls: 'component-list-item',

        incidentInfo: {
            flex: 5,
            cls: 'x-detail'
        },
        copyButton: {
            iconCls: 'file',
            action: 'copyIncident',
            margin: '0 5px 0 0',
            cls: ['ab-icon-button', 'x-button-icon-secondary']
        },

        deleteButton: {
            iconCls: 'delete',
            action: 'deleteIncident',
            margin: '0 5px 0 0',
            cls: ['ab-icon-button', 'x-button-icon-secondary']
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applyIncidentInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getIncidentInfo());
    },

    updateIncidentInfo: function (newIncidentInfo, oldIncidentInfo) {
        if (newIncidentInfo) {
            this.add(newIncidentInfo);
        }
        if (oldIncidentInfo) {
            this.remove(oldIncidentInfo);
        }
    },

    applyCopyButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getCopyButton());
    },

    updateCopyButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
        }
    },

    applyDeleteButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getDeleteButton());
    },

    updateDeleteButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
        }
    },

    updateRecord: function (newRecord) {
        var incidentInfo = this.getIncidentInfo(),
            deleteButton = this.getDeleteButton(),
            copyButton = this.getCopyButton();

        if (newRecord) {
            incidentInfo.setHtml(this.buildIncidentInfo(newRecord));
            deleteButton.setRecord(newRecord);
            copyButton.setRecord(newRecord);
            if (newRecord.get('mob_incident_id') === newRecord.get('parent_incident_id')) {
                if (this.hasChildren(newRecord.get('mob_incident_id'))) {
                    deleteButton.setVisibility(false);
                } else {
                    deleteButton.setVisibility(true);
                }
            } else {
                deleteButton.setVisibility(true);
            }
        }
        this.callParent(arguments);
    },

    hasChildren: function (parentMobId) {
        var boolHasChildren = false,
            incidentsStore = Ext.getStore('incidentsStore'),
            i, record;

        for (i = 0; i < incidentsStore.getTotalCount(); i++) {
            record = incidentsStore.getAt(i);
            if (record && record.get('parent_incident_id') === parentMobId
                && record.get('mob_incident_id') !== parentMobId) {
                boolHasChildren = true;
            }
        }

        return boolHasChildren;
    },

    buildIncidentInfo: function (record) {
        var incidentInfo = record.getData(),
            emIdAffected = incidentInfo.em_id_affected,
            contactId = incidentInfo.contact_id,
            nonEmName = incidentInfo.non_em_name,
            incidentType = incidentInfo.incident_type,
            dateIncident = incidentInfo.date_incident,
            description = incidentInfo.description === null ? '' : incidentInfo.description,
            formatedDate,
            affectedPerson,
            isParentIncident = (record.get('parent_incident_id') === record.get('mob_incident_id')),
            parentStyleColumn1,
            parentStyleColumn2;

        formatedDate = new Ext.XTemplate('{date_inc:date("m/d/Y")}').apply({date_inc: dateIncident});
        if (emIdAffected) {
            affectedPerson = emIdAffected;
        } else if (contactId) {
            affectedPerson = contactId;
        } else {
            affectedPerson = nonEmName;
        }

        if (Ext.os.is.Phone) {
            parentStyleColumn1 = (isParentIncident === true ? '' : 'margin-left:1em;font-weight:normal');

            return '<div class="prompt-list-hbox"><h1 style="width:100%;text-align:left;' + parentStyleColumn1 + '">' + affectedPerson + '</h1></div>'
                + '<div class="prompt-list-hbox"><h3 style="width:100%;text-align:left;' + parentStyleColumn1 + '">' + incidentType + '</h3></div>'
                + '<div class="prompt-list-hbox"><div class="prompt-list-date" style="width:100%;text-align:left;' + parentStyleColumn1 + '">' + formatedDate + '</div></div>'
                + '<div style="width:100%;' + parentStyleColumn1 + '"><h3>' + description + '</h3></div>';

        } else {
            parentStyleColumn1 = (isParentIncident === true ? '' : 'margin-left:2em;font-weight:normal');
            parentStyleColumn2 = (isParentIncident === true ? '' : 'margin-left:-2em;font-weight:normal');

            return '<div class="prompt-list-hbox"><h1 style="width:35%;text-align:left;' + parentStyleColumn1 + '">' + affectedPerson + '</h1>'
                + '<h1 style="width:40%;text-align:left;' + parentStyleColumn2 + '">' + incidentType + '</h1>'
                + '<div class="prompt-list-date" style="width:25%;text-align:center">' + formatedDate + '</div></div>'
                + '<div style="width:100%;' + parentStyleColumn1 + '"><h3>' + description + '</h3></div>';
        }
    }
});