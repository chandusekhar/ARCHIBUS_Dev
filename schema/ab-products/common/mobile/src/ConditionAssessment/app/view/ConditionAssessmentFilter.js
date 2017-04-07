Ext.define('ConditionAssessment.view.ConditionAssessmentFilter', {
    extend: 'Common.view.navigation.FilterForm',

    requires: ['Ext.field.Radio',
        'Common.control.prompt.Site',
        'Common.control.prompt.Building',
        'Common.control.prompt.Floor',
        'Common.control.prompt.Room',
        'Common.control.prompt.EquipmentStandard'],

    xtype: 'conditionAssessmentFilterPanel',

    config: {
        layout: 'vbox',

        title: LocaleManager.getLocalizedString('Filter', 'ConditionAssessment.view.ConditionAssessmentFilter'),

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'titlepanel',
                        title: LocaleManager.getLocalizedString('Set Filter', 'Common.view.navigation.FilterForm')
                    },
                    {
                        xtype: 'sitePrompt',
                        store: 'assessmentSitesStore'
                    },
                    {
                        xtype: 'buildingPrompt',
                        store: 'assessmentBuildingsStore'
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'assessmentFloorsStore'
                    },
                    {
                        xtype: 'roomPrompt',
                        store: 'assessmentRoomsStore'
                    },
                    {
                        xtype: 'equipmentStandardPrompt'
                    },
                    {
                        xtype: 'barcodefield',
                        name: 'eq_id',
                        label: LocaleManager.getLocalizedString('Equipment Code', 'ConditionAssessment.view.ConditionAssessmentFilter'),
                        barcodeFormat: [{fields: ['eq_id']}]
                    },
                    {
                        xtype: 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Assessed State', 'ConditionAssessment.view.ConditionAssessmentFilter'),
                        name: 'cond_value',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        value: 'all',
                        options: [
                            {
                                displayValue: LocaleManager.getLocalizedString('Assessed', 'ConditionAssessment.view.ConditionAssessmentFilter'),
                                objectValue: 'assessed'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('Not Assessed', 'ConditionAssessment.view.ConditionAssessmentFilter'),
                                objectValue: '0'
                            },
                            {
                                displayValue: LocaleManager.getLocalizedString('All', 'ConditionAssessment.view.ConditionAssessmentFilter'),
                                objectValue: 'all'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    /**
     * Used in class ConditionAssessmentNavigation.
     * Creates and returns filter array for current form values.
     * @returns {Array}
     */
    buildConditionAssessmentFilters: function () {
        var me = this,
            fields = me.getFields(),
            values = me.getValues(),
            filterArray = [],
            filter, fieldName, fieldValue,
            condValueEnum, condValues, condValue;

        for (fieldName in fields) {
            fieldValue = values[fieldName];

            if ((fieldName !== 'cond_value'
                || (fieldName === 'cond_value' && fieldValue === '0'))
                && !Ext.isEmpty(fieldValue)) {
                if (fieldName === 'eq_std') {
                    fieldName = '(SELECT eq_std FROM Equipment WHERE Equipment.eq_id = ConditionAssessment.eq_id)';
                }

                filter = Ext.create('Common.util.Filter', {
                    property: fieldName,
                    value: fieldValue,
                    conjunction: 'AND',
                    exactMatch: true
                });
                filterArray.push(filter);
            } else if (fieldName === 'cond_value' && fieldValue === 'assessed') {
                condValueEnum = TableDef.getEnumeratedList('activity_log_sync', 'cond_value');
                condValues = Ext.Array.pluck(condValueEnum, 'objectValue');
                //remove 0 which is used in different filter: 'Not Assessed'
                condValues = Ext.Array.remove(condValues, 0);

                for (condValue in condValues) {
                    filter = Ext.create('Common.util.Filter', {
                        property: fieldName,
                        value: condValues[condValue],
                        conjunction: 'OR',
                        exactMatch: true
                    });
                    filterArray.push(filter);
                }
            }
        }

        return filterArray;
    }
});
