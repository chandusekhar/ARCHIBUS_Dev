/* global Questionnaire */
/**
 * @since 21.3
 */
Ext.define('Questionnaire.FormFactory', {
    requires: 'Questionnaire.Question',
    singleton: true,

    storeMap: null,

    constructor: function() {
        this.storeMap = new Ext.util.MixedCollection();
    },

    getQuestionaireForm: function(records) {
        var items = [],
            sortedItems;

        Ext.each(records, function(record) {
            var item = Questionnaire.Question.createQuestionObject(record);
            if(!Ext.isEmpty(item)) {
                items.push(item);
            }
        });

        // Sort the items
        sortedItems = Ext.Array.sort(items, function(a,b) {
            return a.sort - b.sort;
        });

        return Ext.factory({items: sortedItems}, 'Ext.Container');
    }
});