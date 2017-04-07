//<feature logger>
Ext.define('Common.log.formatter.File', {
    extend: 'Ext.log.formatter.Formatter',

    config: {
        messageFormat: "[{priorityName}] [{time}] [{application}] {message} "
    },

    format: function(event) {
        var logEvent = Ext.merge({}, event, {
            priorityName: event.priorityName.toUpperCase(),
            time: Ext.DateExtras.format(new Date(event.time), 'Y-m-d h:m:s,u'),
            application: Common.Application.appName
        });

        return this.callParent([logEvent]);
    },

    substitute: function() {
        var fileTemplate = this.callParent(arguments);

        return fileTemplate + '\n';
    }
});
//</feature>
