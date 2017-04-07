Ext.define('Maintenance.view.WorkRequestCostEdit', {
    extend: 'Maintenance.view.WorkRequestEditBase',
    requires: [
        'Common.control.Select',
        'Common.control.field.Calendar'
    ],

    xtype: 'workRequestCostItem',

    config: {
        model: 'Maintenance.model.WorkRequestCost',
        storeId: 'workRequestCostsStore',

        addTitle: LocaleManager.getLocalizedString('Add Cost', 'Maintenance.view.WorkRequestCostEdit'),
        editTitle: LocaleManager.getLocalizedString('Edit Cost', 'Maintenance.view.WorkRequestCostEdit'),

        items: [
            {
                xtype: 'formheader',
                workRequestId: '',
                dateValue: '',
                displayLabels: !Ext.os.is.Phone
            },
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Resource Type', 'Maintenance.view.WorkRequestCostEdit'),
                        name: 'other_rs_type',
                        store: 'otherResourcesStore',
                        valueField: 'other_rs_type',
                        displayField: 'description'
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: LocaleManager.getLocalizedString('Actual Cost', 'Maintenance.view.WorkRequestCostEdit'),
                        name: 'cost_total',
                        labelFormat: 'currency',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'calendarfield',
                        label: LocaleManager.getLocalizedString('Date Used', 'Maintenance.view.WorkRequestCostEdit'),
                        name: 'date_used',
                        itemId: 'date_used',
                        dateFormat: LocaleManager.getLocalizedDateFormat(),
                        required: true
                    },
                    {
                        xtype: 'localizedspinnerfield',
                        minValue: 0,
                        stepValue: 1,
                        label: LocaleManager.getLocalizedString('Quantity Used', 'Maintenance.view.WorkRequestCostEdit'),
                        name: 'qty_used',
                        value: 0
                    },
                    {
                        xtype: 'commontextfield',
                        label: LocaleManager.getLocalizedString('Units', 'Maintenance.view.WorkRequestCostEdit'),
                        name: 'units_used',
                        maxLength: 3
                    },
                    {
                        xtype: 'commontextareafield',
                        label: LocaleManager.getLocalizedString('Description', 'Maintenance.view.WorkRequestCostEdit'),
                        name: 'description'
                    }
                ]
            }
        ]
    },

    applyViewIds: function (config) {
        var me = this,
            formHeader = me.down('formheader');
        formHeader.setWorkRequestId(config.workRequestId);
        return config;
    },

    initialize: function () {
        var me = this,
            resourceTypeEnumList;
        me.callParent();

        resourceTypeEnumList = TableDef.getEnumeratedList('other_rs', 'description');
        if (resourceTypeEnumList && resourceTypeEnumList.length > 0) {
            me.query('selectfield[name=other_rs_type]')[0].setOptions(resourceTypeEnumList);
        }

        me.setFieldLabelAndLength('wr_other_sync');
        me.setFieldsReadOnly();
    },

    setFieldsReadOnly: function () {
        var me = this,
            dateUsed = me.down('field[name=date_used]'),
            otherRsType = me.down('field[name=other_rs_type]');

        dateUsed.setReadOnly(!me.getIsCreateView());
        if(me.getIsCreateView()){
        	dateUsed.setValue(new Date());
        }
        
        otherRsType.setReadOnly(!me.getIsCreateView());
    },

    applyRecord: function (record) {
        var me = this,
            viewIds = me.getViewIds();

        if (!record) {
            record = Ext.create('Maintenance.model.WorkRequestCost');
        }
        record.set('wr_id', viewIds.workRequestId);
        record.set('mob_wr_id', viewIds.mobileId);
        if(me.getIsCreateView()){
        	record.set('date_used', new Date());
        }
        

        return record;
    }

});
