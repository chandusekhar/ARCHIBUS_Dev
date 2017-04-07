/**
 * Manages currency information
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('Common.util.Currency', {
    singleton: true,

    currencySymbol: undefined,

    getCurrencySymbol: function() {
        var me = this,
            currencyCode,
            currencyStore,
            currencyRecord;

        // Cache the currency symbol on first access
        if(me.currencySymbol === undefined) {
            currencyCode = me.getBudgetCurrencyCode();
            currencyStore = Ext.getStore('currenciesStore');
            currencyRecord = currencyStore.findRecord('currency_id', currencyCode);
            if(currencyRecord) {
                me.currencySymbol = currencyRecord.get('currency_symbol');
            } else {
                me.currencySymbol = '';
            }
        }

        return me.currencySymbol;

    },

    /**
     * Retrieves the BudgetCurrency code from the Application Preferences
     * @returns {String} The project currency code
     */
    getBudgetCurrencyCode: function() {
        var preferencesStore = Ext.getStore('appPreferencesStore'),
            preferencesRecord = preferencesStore.findRecord('param_id', 'BudgetCurrency'),
            currencyCode = '$';

        if(preferencesRecord) {
            currencyCode = preferencesRecord.get('param_value');
        }

        return currencyCode;
    }
});
