/**
 * Provides translation of exception thrown by DWR service into generic
 * exception with end-user-friendly error message.
 *
 * @singleton
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.service.ExceptionTranslator', {
    alternateClassName: ['ExceptionTranslator'],
    singleton: true,

    /**
     * Translates exception, thrown by DWR service. Converts RemoteException to
     * generic exception, throws the converted exception.
     *
     * @param {Object} exception to be translated.
     */
    translate: function (exception) {
        var exceptionMessage = this.extractMessage(exception);

        // throw the converted exception
        throw new Error(exceptionMessage);
    },

    /**
     * Extracts message from the exception object. Maps particular error codes to end-user-friendly error messages.
     * Checks all possible exception properties.
     * @private
     * @param {Error} exception from which the error message needs to be extracted.
     */
    extractMessage: function (exception) {
        var me = this,
            dwrMessage;

        if (exception === null) {
            return '';
        }

        if (exception.code && exception.code === 101) {
            return LocaleManager.getLocalizedString('Network connection is not available',
                'Common.service.ExceptionTranslator');
        }

        if (exception.localizedMessage && exception.localizedMessage.length > 0) {
            return exception.localizedMessage;
        }

        if (exception.message && exception.message.length > 0 && exception.message !== ' :: ') {
            // The 'No data received message originates from the DWR framework, translate it here.
            dwrMessage = me.checkDwrFrameworkMessages(exception.message);
            if (dwrMessage !== '') {
                return dwrMessage;
            } else {
                return exception.message;
            }
        }

        if (exception.details && exception.details.length > 0) {
            return exception.details;
        }

        if (exception.pattern && exception.pattern.length > 0) {
            return exception.pattern;
        }

        if (exception.genericMessage && exception.genericMessage.length > 0) {
            return exception.genericMessage;
        }

        if (exception.description && exception.description.length > 0) {
            return exception.description;
        }

        return LocaleManager.getLocalizedString('Unknown Error', 'Common.service.ExceptionTranslator');
    },

    /**
     * Checks for common DWR error message strings and localizes the strings before they are displayed.
     * @param {String} message The message returned from the DWR service.
     * @returns {string} The localized message
     * @private
     */
    checkDwrFrameworkMessages: function (message) {
        var noDataRecievedMessage = LocaleManager.getLocalizedString('No data received from server', 'Common.service.ExceptionTranslator'),
            timeOutMessage = LocaleManager.getLocalizedString('Timeout', 'Common.service.ExceptionTranslator'),
            dwrMessages = [
                {
                    message: 'no data received from server',
                    localizedMessage: noDataRecievedMessage
                },
                {
                    message: 'timeout',
                    localizedMessage: timeOutMessage
                }
            ],
            lowerCaseMessage = message.toLowerCase(),
            localizedMessage = message;

        Ext.each(dwrMessages, function (dwrMessage) {
            if (lowerCaseMessage.indexOf(dwrMessage.message) !== -1) {
                localizedMessage = dwrMessage.localizedMessage;
                return false;
            }
        }, this);

        return localizedMessage;
    }


});