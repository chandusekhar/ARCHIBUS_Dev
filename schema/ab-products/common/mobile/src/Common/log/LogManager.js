/**
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Common.log.LogManager', {
    singleton: true,

    requires: [
        'Common.util.ConfigFileManager'
    ],

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        defaultLogConfig: {
            enabled: Ext.os.is.Desktop? true: false,
            xclass: 'Ext.log.Logger',
            minPriority: 'verbose',
            writers: {
                console: {
                    xclass: 'Ext.log.writer.Console',
                    throwOnErrors: false,
                    formatter: {
                        xclass: 'Ext.log.formatter.Default',
                        messageFormat: "[{priorityName}] {message}"
                    }
                }
            }
        },

        isLoggingEnabled: true
    },

    consoleWriterConfig: {
        xclass: 'Ext.log.writer.Console',
        throwOnErrors: false,
        formatter: {
            xclass: 'Ext.log.formatter.Default',
            messageFormat: "[{priorityName}] {message}"
        }
    },

    fileWriterConfig: {
        xclass: 'Common.log.writer.File',
        throwOnErrors: false,
        fileRolloverSize: 50000,
        maxNumberOfFiles: 5,
        formatter: {
            xclass: 'Common.log.formatter.File'
        }
    },

    databaseWriterConfig: {
        xclass: 'Common.log.writer.Database',
        throwOnErrors: false,
        maxRecords: 30000,
        formatter: {
            xclass: 'Ext.log.formatter.Default'
        }
    },


    constructor: function () {
        this.initConfig();
        return this;
    },

    updateLogger: function (logger) {
        var me = this,
            currentLogger = Ext.Logger;

        // Disable logging while the logger is being updated to prevent writing messages while the
        // Logger is in an unpredicatable state.
        me.setIsLoggingEnabled(false);

        if (currentLogger.getEnabled() !== logger.enabled) {
            Ext.Logger.setEnabled(logger.enabled);
        }

        if (currentLogger.getMinPriority() !== logger.minLevel) {
            Ext.Logger.setMinPriority(logger.minLevel);
        }


        if (Ext.Logger.getWriters().hasOwnProperty('console')) {
            delete Ext.Logger._writers.console;
        }
        if(logger.writers.console.enabled) {
            me.addConsoleWriter();
        }

        if (Ext.Logger.getWriters().hasOwnProperty('file')) {
            delete Ext.Logger._writers.file;
        }

        if (logger.writers.file.enabled) {
            me.fileWriterConfig.fileRolloverSize = logger.writers.file.fileSize;
            me.fileWriterConfig.maxNumberOfFiles = logger.writers.file.maxNumberOfFile;
            me.addFileWriter();
        }

        if (Ext.Logger.getWriters().hasOwnProperty('database')) {
            delete Ext.Logger._writers.database;
        }

        if (logger.writers.database.enabled) {
            me.databaseWriterConfig.maxRecords = logger.writers.database.maxRecords;
            me.addDatabaseWriter();
        }

        me.setIsLoggingEnabled(true);
    },

    addFileWriter: function () {
        var me = this;

        Ext.factoryConfig(me.fileWriterConfig, function (fileWriterClass) {
            var writers = Ext.Logger.getWriters();
            writers.file = fileWriterClass;
        });
    },

    addDatabaseWriter: function () {
        var me = this;

        Ext.factoryConfig(me.databaseWriterConfig, function (databaseWriterClass) {
            var writers = Ext.Logger.getWriters();
            writers.database = databaseWriterClass;
        });
    },

    addConsoleWriter: function() {
        var me = this;

        Ext.factoryConfig(me.consoleWriterConfig, function (consoleWriterClass) {
            var writers = Ext.Logger.getWriters();
            writers.console = consoleWriterClass;
        });
    }


});
