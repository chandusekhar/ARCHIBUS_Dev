/**
 * Text field with phone icon for initiating a call to field value.
 *
 * @author Ana Albu
 * @since 23.1
 */
Ext.define('Common.control.field.Phone', {
    extend: 'Common.control.field.Text',

    xtype: 'commonphonefield',

    // @overwrite to show/hide the phone icon depending on input value.
    doKeyUp: function () {
        this.callParent(arguments);

        if (Ext.isEmpty(this.getValue())) {
            this.hidePhoneIcon();
        } else {
            this.showPhoneIcon();
        }
    },

    // @overwrite to hide the phone icon.
    onClearIconTap: function () {
        this.callParent(arguments);

        this.hidePhoneIcon();
    },

    // @overwrite to show/hide the phone icon depending on input value.
    updateReadOnly: function () {
        this.callParent(arguments);

        if (Ext.isEmpty(this.getValue())) {
            this.hidePhoneIcon();
        } else {
            this.showPhoneIcon();
        }
    },

    showPhoneIcon: function () {
        var fieldInputElement = this.getComponent().element;

        fieldInputElement.appendChild(this.getPhoneButton());
    },

    hidePhoneIcon: function () {
        var fieldInputElement = this.getComponent().element;

        if (fieldInputElement.contains(this.getPhoneButton())) {
            fieldInputElement.removeChild(this.getPhoneButton());
        }
    },

    getPhoneButton: function () {
        if (Ext.isEmpty(this.phoneButton)) {
            this.phoneButton = Ext.Element.create({
                cls: 'ab-phone-button'
            });

            this.phoneButton.on('tap', this.onPhoneTap, this);
        }

        return this.phoneButton;
    },

    onPhoneTap: function () {
        var phone = this.getValue();

        document.location.href = "tel:+" + phone;
    }
});

