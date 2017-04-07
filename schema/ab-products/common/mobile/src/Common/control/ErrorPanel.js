/**
 * A panel that displays error messages.
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Common.control.ErrorPanel', {
    extend: 'Ext.Component',

    xtype: 'errorpanel',

    isPainted: false,

    config: {
        baseCls: 'ab-error-panel',

        heading: LocaleManager.getLocalizedString('Please correct the following:', 'Common.control.ErrorPanel'),

        /**
         * @cfg {Array} errorMessages An array of error messages to display in the error panel. Each message is an object
         * { field: fieldName, message: errorMessage }
         */
        errorMessages: []

    },

    template: [
        {
            tag: 'div',
            reference: 'heading'
        }
    ],

    initialize: function () {
        var me = this;

        me.callParent();

        me.heading.dom.innerText = me.getHeading();

        me.on('painted', me.onPainted, me, {single: true});
    },

    updateErrorMessages: function(newMessages, oldMessages) {
        var me = this;

        if(oldMessages) {
            me.removeAllErrorMessages();
        }

        if(newMessages && me.isPainted) {
            Ext.each(newMessages, function (message) {
                me.addErrorMessage(message.fieldName, message.errorMessage);
            }, me);
        }
    },

    addErrorMessage: function (fieldName, errorMessage) {
        var me = this,
            el = new Ext.Element(document.createElement('div'));

        el.dom.innerText = errorMessage;
        el.dom.setAttribute('field', fieldName);
        el.addCls('ab-error-msg');
        me.heading.appendChild(el);
    },

    removeErrorMessage: function (fieldName) {
        var me = this;

        Ext.each(me.heading.dom.children, function (child) {
            var fieldAttribute = child.getAttribute('field');
            if (fieldAttribute === fieldName) {
                Ext.get(child.id).destroy();
            }
        }, me);
    },

    removeAllErrorMessages: function () {
        var me = this;

        Ext.each(me.heading.dom.children, function (child) {
            Ext.get(child.id).destroy();
        }, me);
    },

    /**
     * We need to wait for the element to be painted before adding the message elements.
     */
    onPainted: function() {
        var me = this,
            errorMessages = me.getErrorMessages();

        me.isPainted = true;

        Ext.each(errorMessages, function (message) {
            me.addErrorMessage(message.fieldName, message.errorMessage);
        }, me);
    }


});