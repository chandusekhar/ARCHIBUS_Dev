/**
 * Mobile Service Exception Handler
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Common.service.MobileServiceErrorHandler', {

    requires: 'Common.service.ExceptionTranslator',

    errorHandlerFunction: function (promiseRejectFn, message, exception) {
        var errorMessage = ExceptionTranslator.extractMessage(exception);
        promiseRejectFn(errorMessage);
    }
});