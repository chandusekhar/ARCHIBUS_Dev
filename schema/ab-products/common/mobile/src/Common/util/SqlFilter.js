/**
 * // TODO: Docs
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.util.SqlFilter', {
    extend: Ext.util.Filter,

    isSqlFilter: true,

    statics: {
        /**
         * Filter id is incremented for each created filter object. The filterId is used to generate a unique id
         * for the filter objects.
         */
        filterId: 0
    },

    config: {

        /**
         * @cfg {String} sql The SQL statement to be applied to the filter
         */
        sql: null,

        /**
         * TODO: Only support AND
         */
        conjunction: 'AND',

        property: 'sql',

        value: 'sql'
    },

    constructor: function (config) {
        this.callParent([ config ]);
    },

    getSqlFilter: function () {
        return this.getSql();
    },


    /**
     * Override the applyId function to allow us to generate a more specific id to prevent key collisions
     * when the filter is added to the {@link Ext.util.Collection}
     * @override
     * @param id
     * @returns {*|Object}
     */
    applyId: function (id) {
        id = this.callParent(arguments);

        return this.generateFilterId(id);
    },

    // TODO: Duplicated in Common.util.Filter
    /**
     * Generates the filter id using the custom field properties.
     * @private
     * @param {String} currentId
     * @returns {String}
     */
    generateFilterId: function (currentId) {
        var filterId = Common.util.Filter.filterId += 1;

        return currentId + '|' + 'sql|' + filterId.toString();

    }
});