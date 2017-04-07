/**
 * Text field with envelope icon for sending an email to field value.
 *
 * @author Ana Albu
 * @since 23.1
 */
Ext.define('Common.control.field.Email', {
    extend: 'Common.control.field.Text',

    xtype: 'commonemailfield',

    /**
     * @overwrite to show/hide the email icon depending on input value.
     */
    doKeyUp: function () {
        this.callParent(arguments);

        if (Ext.isEmpty(this.getValue())) {
            this.hideEmailIcon();
        } else {
            this.showEmailIcon();
        }
    },

    /**
     * @overwrite to hide the email icon.
     */
    onClearIconTap: function () {
        this.callParent(arguments);

        this.hideEmailIcon();
    },

    // @overwrite to show/hide the email icon depending on input value.
    updateReadOnly: function () {
        this.callParent(arguments);

        if (Ext.isEmpty(this.getValue())) {
            this.hideEmailIcon();
        } else {
            this.showEmailIcon();
        }
    },

    showEmailIcon: function () {
        var fieldInputElement = this.getComponent().element;

        fieldInputElement.appendChild(this.getEmailButton());
    },

    hideEmailIcon: function () {
        var fieldInputElement = this.getComponent().element;

        if (fieldInputElement.contains(this.getEmailButton())) {
            fieldInputElement.removeChild(this.getEmailButton());
        }

    },

    getEmailButton: function () {
        if (Ext.isEmpty(this.emailButton)) {
            this.emailButton = Ext.Element.create({
                cls: 'ab-email-button'
            });

            this.emailButton.on('tap', this.onEmailButtonTap, this);
        }

        return this.emailButton;
    },

    onEmailButtonTap: function () {
        var email = this.getValue();

        document.location.href = "mailto:" + email;
    }
});

