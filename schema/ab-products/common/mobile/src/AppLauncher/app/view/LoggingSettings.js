Ext.define('AppLauncher.view.LoggingSettings', {
    extend: 'Common.form.FormPanel',

    xtype: 'loggingsettings',

    isInit: false,

    config: {
        title: LocaleManager.getLocalizedString('Logging Settings', 'AppLauncher.view.LoggingSettings'),
        formFields: null,
        height: '100%',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
        items: [
            {
                xtype: 'fieldset',
                instructions: LocaleManager.getLocalizedString('Logging messages will affect performance of your apps. Only enable logging when required.',
                   'AppLauncher.view.LoggingSettings'),
                defaults: {
                    labelWidth: '50%'
                },
                items: [
                    {
                        xtype: 'togglefield',
                        label: LocaleManager.getLocalizedString('Logging','AppLauncher.view.LoggingSettings'),
                        name: 'logenabled'
                    },
                    {
                        xtype: 'selectfield',
                        label: LocaleManager.getLocalizedString('Level','AppLauncher.view.LoggingSettings'),
                        name: 'minlevel',
                        options: [
                            {text: LocaleManager.getLocalizedString('VERBOSE','AppLauncher.view.LoggingSettings'), value: 'verbose'},
                            {text: LocaleManager.getLocalizedString('INFO','AppLauncher.view.LoggingSettings'), value: 'info'},
                            {text: LocaleManager.getLocalizedString('DEPRECATE','AppLauncher.view.LoggingSettings'), value: 'deprecate'},
                            {text: LocaleManager.getLocalizedString('WARN','AppLauncher.view.LoggingSettings'), value: 'warn'},
                            {text: LocaleManager.getLocalizedString('ERROR','AppLauncher.view.LoggingSettings'), value: 'error'}
                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                itemId: 'consoleWriter',
                title: LocaleManager.getLocalizedString('Console Writer', 'AppLauncher.view.LoggingSettings'),
                instructions: LocaleManager.getLocalizedString('Displays messages in the device console','AppLauncher.view.LoggingSettings'),
                items: [
                    {
                        xtype: 'togglefield',
                        label: LocaleManager.getLocalizedString('Enabled', 'AppLauncher.view.LoggingSettings'),
                        name: 'consoleEnabled',
                        labelWidth: '50%'
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('File Writer','AppLauncher.view.LoggingSettings'),
                itemId: 'fileWriter',
                instructions: LocaleManager.getLocalizedString('Writes messages to the archibusmobile.log file. The file will be truncated when it reaches the Max. File setting.', 'AppLauncher.view.LoggingSettings'),
                defaults: {
                    labelWidth: '50%'
                },
                items: [
                    {
                        xtype: 'togglefield',
                        label: LocaleManager.getLocalizedString('Enabled', 'AppLauncher.view.LoggingSettings'),
                        name: 'fileEnabled'
                    },
                    {
                        xtype: 'formattednumberfield',
                        decimals: 0,
                        label: LocaleManager.getLocalizedString('Max. File Size', 'AppLauncher.view.LoggingSettings'),
                        name: 'maxFileSize',
                        minValue: 10000
                    },
                    {
                        xtype: 'formattednumberfield',
                        decimals: 0,
                        label: LocaleManager.getLocalizedString('Archived Files', 'AppLauncher.view.LoggingSettings'),
                        name: 'numberOfFiles',
                        minValue: 1
                    },
                    {
                        xtype: 'container',
                        height: '80px',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Display Log', 'AppLauncher.view.LoggingSettings'),
                                action: 'displayLog',
                                minWidth: Ext.os.is.Phone ? '300px' : '400px',
                                ui: 'action',
                                centered: true
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Database Writer', 'AppLauncher.view.LoggingSettings'),
                itemId: 'databaseWriter',
                instructions: LocaleManager.getLocalizedString('Writes messages to the device database.', 'AppLauncher.view.LoggingSettings'),
                defaults: {
                    labelWidth: '50%'
                },
                items: [
                    {
                        xtype: 'togglefield',
                        label: LocaleManager.getLocalizedString('Enabled', 'AppLauncher.view.LoggingSettings'),
                        name: 'databaseEnabled'
                    },

                    {
                        xtype: 'formattednumberfield',
                        decimals: 0,
                        label: LocaleManager.getLocalizedString('Max. Records', 'AppLauncher.view.LoggingSettings'),
                        name: 'databaseMaxRecords',
                        minValue: 10000
                    },
                    {
                        xtype: 'container',
                        height: '80px',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Sync Log', 'AppLauncher.view.LoggingSettings'),
                                action: 'syncLog',
                                minWidth: Ext.os.is.Phone ? '300px' : '400px',
                                ui: 'action',
                                centered: true
                            }
                        ]
                    }
                ]
            }

        ]

    },

    initialize: function() {
        var me = this,
            fields = me.getFields(),
            field;

        me.setFormFields(fields);

        for(field in fields) {
            if(fields.hasOwnProperty(field)) {
                fields[field].on('change', 'onFieldChange', me);
            }
        }

    },

    initValues: function() {
        var me = this,
            fields = me.getFields(),
            logger = ConfigFileManager.logger;

        me.isInit = true;

        fields.logenabled.setValue(Number(logger.enabled));
        fields.minlevel.setValue(logger.minLevel);
        fields.consoleEnabled.setValue(Number(logger.writers.console.enabled));

        fields.fileEnabled.setValue(Number(logger.writers.file.enabled));
        fields.maxFileSize.setValue(logger.writers.file.fileSize);
        fields.numberOfFiles.setValue(logger.writers.file.maxNumberOfFile);

        fields.databaseEnabled.setValue(Number(logger.writers.database.enabled));
        fields.databaseMaxRecords.setValue(logger.writers.database.maxRecords);

        // If logging is disabled then disable the writers
        if(!fields.logenabled.getValue()) {
            me.setFileWriterDisabled(true);
            me.setDatabaseWriterDisabled(true);
            me.setConsoleWriterDisabled(true);
        }

        me.isInit = false;
    },

    getFields: function() {
        var me = this,
            fields = me.query('field'),
            formFields = {};

        Ext.each(fields, function(field) {
            formFields[field.getName()] = field;
        });

        return formFields;
    },

    getValues: function() {
      var me = this,
          formFields = me.getFormFields();

          return {
              enabled: Boolean(formFields.logenabled.getValue()),
              minLevel: formFields.minlevel.getValue(),
              writers: {
                  console: {
                      enabled: Boolean(formFields.consoleEnabled.getValue())
                  },
                  file: {
                      enabled: Boolean(formFields.fileEnabled.getValue()),
                      fileSize: formFields.maxFileSize.getValue(),
                      maxNumberOfFile: formFields.numberOfFiles.getValue()
                  },
                  database: {
                      enabled: Boolean(formFields.databaseEnabled.getValue()),
                      maxRecords: formFields.databaseMaxRecords.getValue()
                  }
              }
          };


    },

    onFieldChange: function() {
        var me = this,
            formValues;

        if(me.isInit) {
            return;
        }

        Common.log.LogManager.setIsLoggingEnabled(false);

        formValues = me.getValues();
        ConfigFileManager.logger = formValues;
        ConfigFileManager.sync(function() {
            // Update logger settings
            Common.log.LogManager.updateLogger(formValues);
            Common.log.LogManager.setIsLoggingEnabled(true);
        });
    },

    setFileWriterDisabled: function(disable) {
        var me = this,
            fileWriterFields = me.query('#fileWriter > field');

        Ext.each(fileWriterFields, function(item) {
            if(item.getName() === 'fileEnabled') {
                item.setValue(0);
            }
            item.setDisabled(disable);
        });
    },

    setDatabaseWriterDisabled: function(disable) {
        var me = this,
            databaseWriterFields = me.query('#databaseWriter > field');

        Ext.each(databaseWriterFields, function(item) {
            if(item.getName() === 'databaseEnabled') {
                item.setValue(0);
            }
            item.setDisabled(disable);
        });
    },

    setConsoleWriterDisabled: function(disable) {
        var consoleField = this.down('togglefield[name=consoleEnabled]');

        consoleField.setDisabled(disable);
        consoleField.setValue(0);
    }
});