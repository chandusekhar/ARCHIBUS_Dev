/**
 * @since 21.1
 */
Ext.define('Common.util.Units', {
    requires: ['Common.util.Ui',
               'Common.util.ConfigFileManager'],

    singleton: true,

    units: undefined,

    baseMetricUnits: 'm',

    areaText: {
        imperial: LocaleManager.getLocalizedString('sq ft','Common.util.Units'),
        metric: LocaleManager.getLocalizedString('sq m', 'Common.util.Units')
    },

    lengthText: {
        imperial: LocaleManager.getLocalizedString('ft','Common.util.Units'),
        metric: LocaleManager.getLocalizedString('m', 'Common.util.Units')
    },

    getUnits: function() {
        var me = this,
            schemaPreferencesStore,
            schemaPreferencesRecord,
            data;

        // Cache the units value the first time it is accessed
        if(me.units === undefined) {
            schemaPreferencesStore = Ext.getStore('schemaPreferencesStore');
            schemaPreferencesRecord = schemaPreferencesStore.getAt(0);

            if(schemaPreferencesRecord) {
                data = schemaPreferencesRecord.getData();
                me.units = Common.util.Ui.getEnumeratedDisplayValue('afm_scmpref', 'units', data.units);
                me.baseMetricUnits = Common.util.Ui.getEnumeratedDisplayValue('afm_scmpref', 'base_metric_units',
                    data.base_metric_units);
            } else {
                me.units = 'Imperial';
            }
        }

        return me.units;
    },

    getAreaText: function() {
        var me = this,
            units = me.getUnits().toLowerCase(),
            areaText = me.areaText.imperial,
            locale = ConfigFileManager.localeName;

        if(units === 'imperial') {
            areaText = me.areaText.imperial;
        } else if (units === 'metric') {
            areaText = me.areaText.metric;
        } else if (units === 'per locale') {
            if(locale === 'en_US') {
                areaText = me.areaText.imperial;
            } else {
                areaText = me.areaText.metric;
            }
        }

        return areaText;
    },

    getLengthText: function() {
        var me = this,
            units = me.getUnits().toLowerCase(),
            lengthText = me.lengthText.imperial,
            locale = ConfigFileManager.localeName;

        if(units === 'imperial') {
            lengthText = me.lengthText.imperial;
        } else if (units === 'metric') {
            lengthText = me.baseMetricUnits;
        } else if (units === 'per locale') {
            if(locale === 'en_US') {
                lengthText = me.lengthText.imperial;
            } else {
                lengthText = me.lengthText.metric;
            }
        }

        return lengthText;
    }


});