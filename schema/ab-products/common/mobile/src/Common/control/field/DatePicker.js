Ext.define('Common.control.field.DatePicker', {
    extend: 'Ext.field.DatePicker',

    xtype: 'commondatepickerfield',

    config: {
        /**
         * @cfg {Booleam} useFieldDefLabel true to use multiline heading from TableDef as field label,
         * or false to use defined label.
         */
        useFieldDefLabel: true
    },

    /**
     * Returns the {@link Date} value of this field.
     * If you wanted a formatted date use the {@link #getFormattedValue} method.
     * @return {Date} The date selected
     */
    getValue: function () {
        var value;
        if (this._picker && this._picker instanceof Ext.picker.Date) {
            value = this._picker.getValue();
            if (Ext.isDate(value) && value.getFullYear() === 1901) {
                return null;
            } else {
                return this._picker.getValue();
            }

        }

        return this._value;
    }
});