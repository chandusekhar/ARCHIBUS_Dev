/**
 * A Number field that displays a localized thousands and decimal separator. The number format is generated
 * using the {@link Common.util.Format#formatNumber} and {@link Common.util.Format#parseNumber} functions.
 *
 *      Ext.create('Ext.form.Panel',
 *         { fullscreen: true,
 *           items: [
 *               {
 *                   xtype: 'fieldset',
 *                       items: [
 *                           { xtype: 'formattednumberfield',
 *                             label: 'Actual Cost',
 *                             name: 'cost_total'
 *                           }
 *                          ]
 *                      }
 *                  ]
 *          });
 *
 * ## Adding Units to the Label
 *
 * The labelFormat property provides a way to display currency, area and length units in the field label.
 *
 *     {
 *			xtype : 'formattednumberfield',
 *			label : 'Actual Cost',
 *			name : 'cost_total',
 *          labelFormat: 'currency',
 *     }
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.control.field.Number', {
    extend: 'Common.control.Text',
    requires: 'Common.util.Format',

    xtype: 'formattednumberfield',

    decimalSeperator: Common.util.Format.decimalSeparator,

    config: {
        decimals: 2,

        /**
         * @cfg {Boolean} numericKeyboard true to display the numeric keyboard on iOS devices. The numeric
         * keyboard displayed on iOS phones does not include the decimal (.) character.
         */
        numericKeyboard: false,

        /**
         * @cfg {String} labelFormat The format symbol to add to the label text.
         * Can be one of number, currency, area or length.
         */
        labelFormat: null,

        value: 0
    },

    isNegativeNumber: false,

    proxyConfig: {
        /**
         * @cfg {Number} minValue The minimum value that this Number field can accept
         * @accessor
         */
        minValue: null,

        /**
         * @cfg {Number} maxValue The maximum value that this Number field can accept
         * @accessor
         */
        maxValue: null,

        /**
         * @cfg {Number} stepValue The amount by which the field is incremented or decremented each time the spinner is tapped.
         * Defaults to undefined, which means that the field goes up or down by 1 each time the spinner is tapped
         * @accessor
         */
        stepValue: null
    },

    initialize: function () {
        var me = this;

        me.on('keyup', 'onNumberKeyUp', me);
        me.on('blur', 'onLostFocus', me);
        me.callParent();
    },

    doInitValue: function () {
        var value = this.getInitialConfig().value;

        if (value) {
            value = this.applyValue(value);
        }

        this.originalValue = value;
    },

    onNumberKeyUp: function () {
        var me = this,
            validNumberPattern = '(^-?\\d*\\' + me.decimalSeperator + '?\\d*$)|^-$',
            invalidCharacterPattern = '[^0-9' + me.decimalSeperator + ']',
            validNumberRe = new RegExp(validNumberPattern),
            invalidCharacterRe = new RegExp(invalidCharacterPattern),
            currentValue = me.getComponent().getValue(),
            decimals = me.getDecimals(),
            numberValue,
            minValue = me.getMinValue(),
            numberOfDecimalCharacters = me.getNumberOfDecimalCharacters(currentValue);

        // Allow the first character to be a '-'
        me.isNegativeNumber = (currentValue.length > 0 && currentValue[0] === '-');

        // Strip alpha characters
        if (!validNumberRe.test(currentValue)) {
            numberValue = currentValue.replace(invalidCharacterRe, '');
            //numberValue = currentValue.replace(/[^0-9.']/,'');
            if(me.isNegativeNumber) {
                numberValue = '-' + numberValue;
            }
            if(Ext.isEmpty(numberValue) && Ext.isNumber(minValue)) {
                numberValue = minValue < 0 ? 0 : minValue;
            }
            me.setValue(numberValue);
        }

        // Limit decimal places
        if (numberOfDecimalCharacters > decimals) {
            numberValue = currentValue.substring(0, currentValue.length - (numberOfDecimalCharacters - decimals));
            me.setValue(numberValue);
        }

        if( me.isNumberOutOfRange(currentValue)) {
            numberValue = me.getNumberLimitValue(currentValue);
            me.setValue(numberValue);
        }

        return false;
    },


    applyValue: function (value) {
        return this.formatNumber(value);
    },

    getValue: function () {
        var me = this,
            value = me.callParent();

        value = me.convertDecimalSeperator(value);
        value = parseFloat(value);

        return (isNaN(value)) ? 0 : value;
    },

    getNumberOfDecimalCharacters: function (value) {
        var me = this,
            index = value.indexOf(me.decimalSeperator),
            numberOfDecimalCharacters = 0;

        if (index > -1) {
            numberOfDecimalCharacters = value.length - index - 1;
        }
        return numberOfDecimalCharacters;
    },

    /**
     * Override to allow the component value to be set. If the minValue is defined
     * and is the minValue is greater than 0 then set the value to the minValue.
     * If minValue is defined and is negative then set the value to 0
     */
    doClearIconTap: function (me) {
        var decimals = me.getDecimals(),
            minValue = me.getMinValue(),
            zeroValue = 0; // = Ext.isNumber(minValue) ? minValue: 0;

        if(Ext.isNumber(minValue)) {
            if(minValue > 0) {
                zeroValue = minValue;
            }
        }

        me.setValue(Common.util.Format.formatNumber(zeroValue, decimals));
        me.getComponent().setValue(zeroValue);
    },

    convertDecimalSeperator: function (value) {
        var me = this;

        if (Ext.isNumber(value)) {
            return value;
        }

        if (me.decimalSeperator !== '.') {
            value = value.replace(me.decimalSeperator, '.');
        }

        return value;

    },

    /**
     *
     * @param value
     * @returns {String} The number value formatted as a String
     */
    formatNumber: function (value) {
        var me = this,
            numberOfDecimals = me.getDecimals();

        if (Ext.isNumber(value)) {
            value = value.toFixed(numberOfDecimals);
        }
        if (value && me.decimalSeperator !== '.') {
            value = value.replace('.', me.decimalSeperator);
        }
		
        return value;

    },

    applyNumericKeyboard: function (config) {
        var me = this,
            component;

        if (config) {
            component = me.getComponent();
            component.setPattern('[0-9]*');
        }
        return config;
    },

    updateNumericKeyboard: function (newValue) {
        var me = this,
            component = me.getComponent();

        if (newValue) {
            component.setPattern('[0-9]*');
        } else {
            component.setPattern('');
        }
    },

    getLabelText: function () {
        var me = this,
            label = me.getLabel(),
            labelFormatText = me.getLabelFormat();

        if (labelFormatText !== '') {
            label = label + ' (' + labelFormatText + ')';
        }
        return label;
    },

    /**
     * Returns the format string using the labelFormat config setting
     * @private
     * @returns {string}
     */
    getLabelFormatString: function () {
        var me = this,
            labelFormat = me.getLabelFormat(),
            labelFormatString = '';

        if (Ext.isEmpty(labelFormat)) {
            labelFormat = 'number';
        }

        switch (labelFormat) {
            case 'number':
                labelFormatString = '';
                break;
            case 'currency':
                labelFormatString = Common.util.Currency.getCurrencySymbol();
                break;
            case 'area':
                labelFormatString = Common.util.Units.getAreaText();
                break;
            case 'length':
                labelFormatString = Common.util.Units.getLengthText();
                break;
            default:
                labelFormatString = '';
        }
        return labelFormatString;
    },

    isNumberOutOfRange: function(value) {
        var me = this,
            minValue = me.getMinValue(),
            maxValue = me.getMaxValue(),
            numberValue;

        // Convert value to a number to check min and max limits then convert back to a string
        if (Ext.isString(value)) {
            numberValue = parseFloat(value);
        } else {
            numberValue = value;
        }

        if(Ext.isNumber(minValue) && Ext.isNumber(maxValue)) {
            return numberValue < minValue || numberValue > maxValue;
        } else {
            return false;
        }
    },


    getNumberLimitValue: function (value) {
        var me = this,
            minValue = me.getMinValue(),
            maxValue = me.getMaxValue(),
            numberValue;


        // Convert value to a number to check min and max limits then convert back to a string
        if (Ext.isString(value)) {
            numberValue = parseFloat(value);
        } else {
            numberValue = value;
        }

        if (Ext.isNumber(minValue)) {
            if(minValue < 0) {
                minValue = 0;
            }
            numberValue = Math.max(numberValue, minValue);
        }

        if (Ext.isNumber(maxValue)) {
            numberValue = Math.min(numberValue, maxValue);
        }

        return numberValue;
    },

    /**
     * Set the field value when focus is lost. Applies the number format to the displayed
     * value.
     * @param {Common.control.field.Number} field
     */
    onLostFocus: function(field) {
        field.setValue(field._value);
    }
});
