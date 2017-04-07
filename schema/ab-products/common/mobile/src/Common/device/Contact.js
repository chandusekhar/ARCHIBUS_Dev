/**
 * Provides device contact information. This class is not complete and does not include all of the functionality
 * exposed by the Phonegap Contact API
 *
 * See https://github.com/apache/cordova-plugin-contacts/blob/master/doc/index.md for complete Phonegap API
 * documentation.
 *
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.device.Contact', {
    singleton: true,
    requires: 'Common.util.Environment',

    /**
     *
     * @param {Function} onCompleted Callback function invoked with the array or email objects
     * returned by the Contacts database
     * @param {Object []} onCompleted.emails An array of objects containing the contact name and email address
     * @param {Object} scope The scope that the onCompleted function is called in.
     */
    getEmails: function (onCompleted, scope) {
        var me = this,
            contactEmails = [],
            fields,

            onSuccess = function (contacts) {
                Ext.each(contacts, function (contact) {
                    var email = '';
                    if (contact.emails && contact.emails.length > 0) {
                        email = contact.emails[0].value;
                        contactEmails.push({name: contact.name.formatted, email: email});
                    }
                }, me);
                Ext.callback(onCompleted, scope || me, [contactEmails]);
            },

            onError = function (error) {
                var message = LocaleManager.getLocalizedString('Error retrieving contact information ' + error);
                Ext.Msg.alert('', message);
                Ext.callback(onCompleted, scope || me, [contactEmails]);
            };

        // Provide a hard coded list of emails for the desktop case.
        if (Environment.getNativeMode()) {
            fields = [navigator.contacts.fieldType.emails,
                navigator.contacts.fieldType.displayName,
                navigator.contacts.fieldType.name];

            navigator.contacts.find(fields, onSuccess, onError);
        } else {
            contactEmails = [
                {name: 'ARCHIBUS', email: 'info@archibus.com' },
                {name: 'John Smith', email: 'john_smith@archibus.com'},
                {name: 'Chris Keller', email: 'chris_keller@archibus.com'}
            ];
            Ext.callback(onCompleted, scope || me, [contactEmails]);
        }
    },

    /**
     *
     * @param {Function} onCompleted Callback function invoked with the array of objects
     * returned by the Contacts database with  phone and email, only for contacts that have email adress
     * @param {Object []} onCompleted.contactData An array of objects containing the contact name, email address and phone.
     * @param {Object} scope The scope that the onCompleted function is called in.
     */
    getEmailsAndPhones: function (onCompleted, scope) {
        var me = this,
            contactData = [],
            fields,

            onSuccess = function (contacts) {
                Ext.each(contacts, function (contact) {
                    var email = '',
                        phone = '';

                    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                        phone = contact.phoneNumbers[0].value;
                    }

                    if (contact.emails && contact.emails.length > 0) {
                        email = contact.emails[0].value;
                        // adaugarea doar a contactelor care au adresa de email
                        contactData.push({name: contact.name.formatted, email: email, phone: phone});
                    }

                }, me);
                Ext.callback(onCompleted, scope || me, [contactData]);
            },

            onError = function (error) {
                var message = LocaleManager.getLocalizedString('Error retrieving contact information ' + error);
                Ext.Msg.alert('', message);
                Ext.callback(onCompleted, scope || me, [contactData]);
            };

        // Provide a hard coded list of emails for the desktop case.
        if (Environment.getNativeMode()) {
            fields = [navigator.contacts.fieldType.emails,
                navigator.contacts.fieldType.phoneNumbers,
                navigator.contacts.fieldType.displayName,
                navigator.contacts.fieldType.name];

            navigator.contacts.find(fields, onSuccess, onError);
        } else {
            contactData = [
                {name: 'ARCHIBUS', email: 'info@archibus.com', phone: '227-2508' },
                {name: 'John Smith', email: 'john_smith@archibus.com', phone: '338-1011'},
                {name: 'Chris Keller', email: 'chris_keller@archibus.com'}
            ];
            Ext.callback(onCompleted, scope || me, [contactData]);
        }
    }

});