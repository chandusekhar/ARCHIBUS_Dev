/**
 *  Provides additional filter functions.
 *  Allows filters to use NULL values when querying the SQLite database.
 *
 *  Example: Select all records from the SpaceSites table where the detail_dwg value is not NULL
 *
 *     var spaceBookSitesStore = Ext.getStore('spaceBookSites');
 *     var filter = Ext.create('Common.util.Filter', {
 *                                                      property: 'detail_dwg',
 *                                                      value: '',
 *                                                      matchIsNullValue: true,
 *                                                      isEqual: false
 *                                                   });
 *
 *      spaceBookSitesStore.filter(filter);
 *      spaceBookSitesStore.load();
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.Filter', {
    extend : 'Ext.util.Filter',

    isExtendedFilter : true,

    statics: {
        /**
         * Filter id is incremented for each created filter object. The filterId is used to generate a unique id
         * for the filter objects.
         */
        filterId: 0
    },

    // TODO: Populate property and value with defaults so devs do not need to supply 'dummy' values in the
    // config
    config : {
        /**
         * @cfg {Boolean} matchIsNullValue When true the filter will create a restriction using the database NULL value
         */
        matchIsNullValue : false,

        /**
         * @cfg {Boolean} isEqual When true the filter will create a restriction using IS NULL. When false the
         *      restriction is created as IS NOT NULL.
         */
        isEqual : true,

        /**
         * @cfg {String} conjunction The conjunction used when combining filters. Valid values are AND and OR
         */
        conjunction : 'AND',

        /**
         * @cfg {Object[]} subFilter
         */
        subFilter: [],

        /**
         * @cfg {String} operator The operator applied to the filter expression, Can be one of =, <>, <= or >=
         */
        operator: '='
    },

    constructor : function(config) {
        this.callParent([ config ]);
    },

    /**
     * Override the applyId function to allow us to generate a more specific id to prevent key collisions
     * when the filter is added to the {@link Ext.util.Collection}
     * @override
     * @param id
     * @returns {*|Object}
     */
    applyId: function(id) {
        id = this.callParent(arguments);

        return this.generateFilterId(id);
    },

    /**
     * Generates the filter id using the custom field properties.
     * @private
     * @param {String} currentId
     * @returns {String}
     */
    generateFilterId: function(currentId) {
        var me = this,
            conjunction = me.getConjunction(),
            operator = me.getOperator(),
            isEqual = me.getIsEqual(),
            matchNull = me.getMatchIsNullValue(),
            filterId = Common.util.Filter.filterId += 1;


        return currentId + '|' + conjunction + '|' + operator + '|' + matchNull.toString() + '|' +
            isEqual.toString() + '|' + filterId.toString();

    },

    applySubFilter: function(config) {
        var i;

        if(config && config.length > 0) {
            this.setProperty('_subfilter');
            this.setValue('_subfilter');

            for(i = 0; i< config.length; i++) {
                config[i].isEqual = config[i].isEqual === undefined ? true : config[i].isEqual;
                config[i].operator = config[i].operator === undefined ? '=' : config[i].operator;
            }
        }

        return config;
    },

    /**
     * Overrides the applyFilterFn to prevent the required property and value message from being displayed
     * when a subFilter value is set.
     * @override
     * @param filterFn
     * @returns {*}
     */
    applyFilterFn: function(filterFn) {
        if (filterFn === Ext.emptyFn) {
            filterFn = this.getInitialConfig('filter');
            if (filterFn) {
                return filterFn;
            }

            var value = this.getValue();
            if (!this.getProperty() && !value && value !== 0 && (this.getSubFilter().length === 0)) {
                // <debug>
                Ext.Logger.error('A Filter requires either a property and value, or a filterFn to be set');
                // </debug>
                return Ext.emptyFn;
            }
            else {
                return this.createFilterFn();
            }
        }
        return filterFn;
    }

});