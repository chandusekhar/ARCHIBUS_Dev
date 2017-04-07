/**
 * Registers custom data types on start-up.
 * Custom data types must be available for the Model class declarations.
 *
 * @author Jeff Martin
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.type.TypeManager', {

    requires: [
        'Common.type.Integer',
        'Common.type.Date',
        'Common.type.Time',
        'Common.type.Timestamp'
    ],

    singleton: true,

    constructor: function () {
        this.initializeCustomTypes();
    },

    initializeCustomTypes: function () {
        // INTEGER
        Ext.data.Types.INTEGERCLASS = {
            convert: function (value) {
                return Ext.create('Common.type.Integer', {
                    value: value
                });
            },
            sortType: function (v) {
                return v.value; // When sorting, order by value
            },
            type: 'IntegerClass'
        };

        // DATE
        Ext.data.Types.DATECLASS = {
            convert: function (value) {

                if (!value) {
                    return null;
                }

                return Ext.create('Common.type.Date', {
                    value: value
                });
            },
            sortType: function (v) {
                return v.value; // When sorting, order by value
            },
            type: 'DateClass'
        };

        // TIME
        Ext.data.Types.TIMECLASS = {
            convert: function (value) {
                if (!value) {
                    return null;
                }

                return Ext.create('Common.type.Time', {
                    value: value
                });
            },
            sortType: function (v) {
                return v.value; // When sorting, order by value
            },
            type: 'TimeClass'
        };

        // TIMESTAMP
        Ext.data.Types.TIMESTAMPCLASS = {

            convert: function (value) {
                if (!value) {
                    return null;
                }

                return Ext.create('Common.type.Timestamp', {
                    value: value
                });
            },
            sortType: function (v) {
                return v.value; // When sorting, order by value
            },
            type: 'TimestampClass'
        };
    }
});
