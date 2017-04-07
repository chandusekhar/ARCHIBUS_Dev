/**
 * Common configuration options for text controls.
 * Set useFieldDefLabel property.
 *
 * @author Ana Paduraru
 * @since 22.1
 */
Ext.define('Common.control.Text', {
    extend: 'Ext.field.Text',

    xtype: 'commontext',

    config: {
        /**
         * @cfg {Booleam} useFieldDefLabel true to use multiline heading from TableDef as field label,
         * or false to use defined label.
         */
        useFieldDefLabel: true
    }
});

