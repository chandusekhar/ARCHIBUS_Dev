/**
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Common.log.Logger', {
    alternateClassName: ['Log'],
    singleton: true,

    requires: 'Common.log.LogManager',

    isLoggerInBuild: false,

    log: function(message, priority, classScope, funcArguments) {
        var className = '',
            functionName = '',
            logMessage,
            lineNumber;

        if(classScope && classScope.$className) {
            className = classScope.$className;
        }

        if(funcArguments && funcArguments.callee) {
            functionName = Ext.isDefined(funcArguments.callee.$name) ? '#' + funcArguments.callee.$name : '';
        }

        if(functionName === '' && Ext.isString(funcArguments)) {
            functionName = '#' + funcArguments;
        }

        if(Ext.os.is.Desktop && Ext.browser.is.Chrome) {
            lineNumber = Common.log.Logger.getLineNumber();
            logMessage = Ext.String.format('[{0}{1}:{2}] {3}',className, functionName, lineNumber, message);
        } else {
            logMessage = Ext.String.format('[{0}{1}] {2}',className, functionName, message);
        }

        if(Common.log.LogManager.getIsLoggingEnabled() && Ext.Logger && Ext.Logger.log) {
            Ext.Logger.log(logMessage, priority);
        }
    },

    getErrorObject: function() {
        try { throw new Error(''); } catch(err) { return err; }
    },

    getLineNumber: function() {
        var e = Common.log.Logger.getErrorObject(),
            stackItems = e.stack.split('\n'),
            callerItem = stackItems[4],
            lineNumberEnd = callerItem.lastIndexOf(':'),
            lineNumberStart = callerItem.lastIndexOf(':', lineNumberEnd-1),
            lineNumber = callerItem.substring(lineNumberStart+1, lineNumberEnd);

        return lineNumber;
    }

});