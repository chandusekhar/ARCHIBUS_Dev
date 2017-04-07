/**
 * Adds additional properties to the {@link Ext.data.Error} class. This class is used by the
 * {@link Common.form.FormPanel} class when displaying the form errors.
 * @since 21.2
 * @author Jeff Martin
 */

Ext.define('Common.data.Error', {
    extend: 'Ext.data.Error',

    isExtendedError: true,

    config: {
        /**
         * @cfg {String[]} dependentFields The dependent fields provided to the {@link Common.data.Model}
         * customValidations configuration object
         */
        dependentFields: [],

        /**
         * @cfg {Boolean} formatted When true, the {@link Common.form.FormPanel} class generates the error
         * message using the format string supplied in the {@link Common.data.Model} customValidations
         * configuration object
         */
        formatted: false
    }
});