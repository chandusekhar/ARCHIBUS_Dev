/**
 * A checkbox field that allows the checked color to be set dynamically.
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.control.field.Checkbox', {
   extend: 'Ext.field.Checkbox',
    xtype: 'commoncheckbox',

    config: {
        color: null,
        /**
         * @cfg {Booleam} useFieldDefLabel true to use multiline heading from TableDef as field label,
         * or false to use defined label.
         */
        useFieldDefLabel: true
    },

    applyColor: function(config) {
        if(config) {
            this.addColorCls(config);
        }

        return config;
    },

    updateColor: function(newColor) {
        if(newColor) {
            this.removeColorCls();
            this.addColorCls(newColor);
        }
    },

    removeColorCls: function() {
        var component = this.getComponent();

        component.removeCls('x-field-checkbox-orange');
        component.removeCls('x-field-checkbox-red');
    },

    addColorCls: function(color) {
        if(color === 'orange') {
            this.getComponent().addCls('x-field-checkbox-orange');
        }
        if(color === 'green') {
            this.getComponent().addCls('x-field-checkbox-green');
        }
    }
});