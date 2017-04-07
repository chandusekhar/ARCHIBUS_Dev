//<feature logger>
Ext.define('Common.log.writer.File', {

    extend: 'Ext.log.writer.Writer',

    requires: [
        'Common.device.File',
        'Common.util.Queue'
    ],

    config: {
        throwOnErrors: false,
        throwOnWarnings: false,
        fileName: 'log/archibusmobile.log',
        fileRolloverSize: 50000,
        maxNumberOfFiles: 5
    },

    queue: null,

    isWriting: false,

    doWrite: function(event) {
        var me = this,
            message = event.message,
            priority = event.priorityName,
            clonedMessage;

        if (priority === 'error' && this.getThrowOnErrors()) {
            throw new Error(message);
        }

        clonedMessage = Ext.clone(message);
        me.queue.add(clonedMessage);

        if(!me.isWriting) {
            me.writeToFile();
        }
    },

    constructor: function() {
        this.callParent(arguments);

        this.queue = Ext.create('Common.util.Queue');
        this.createLogDirectory();
    },

    // write to file
    writeToFile: function() {
        var me = this,
            message,
            resetFlag = function() {
                me.isWriting = false;
            };

        if(me.queue.isEmpty()) {
            me.checkFileSize().then(function(size) {
                var backupFileName;
                if(size > me.getFileRolloverSize()) {
                    // Rename file
                    backupFileName = me.generateBackupFileName();
                    Common.device.File.moveToFile(me.getFileName(), 'log', backupFileName)
                        .then(function() {
                            me.processFiles().then(resetFlag, resetFlag);
                        }, resetFlag);
                } else {
                    resetFlag();
                }
            }, resetFlag);
        } else {
            me.isWriting = true;
            message = me.queue.dequeue();
            Common.device.File.appendFile(me.getFileName(), message)
                .then(function() {
                    me.writeToFile();
                });
        }
    },

    createLogDirectory: function() {
        var me = this,
            doneWriting = function() {
                me.isWriting = false;
            };
        me.isWriting = true;

        Common.device.File.getFolder('log').then(doneWriting, doneWriting);
    },

    checkFileSize: function() {
        var me = this;
        return new Promise(function(resolve, reject) {
            Common.device.File.getFileMetadata(me.getFileName())
                .then(function(metadata) {
                    resolve(metadata.size);
                }, reject);
        });

    },

    generateBackupFileName: function() {
        var dateStr = Ext.DateExtras.format(new Date(), 'Ymd_his'),
            fileName;

        dateStr = '_' + dateStr + '.bak';
        fileName = 'archibusmobile' + dateStr;

        return fileName;
    },

    processFiles: function() {
        var me = this;
        return new Promise(function(resolve, reject) {
            Common.device.File.getFilesInDirectory('log')
                .then(function(fileEntries) {
                    var filteredFiles = me.filterFileEntries(fileEntries),
                        oldestFileEntry;
                    if(filteredFiles.length < me.getMaxNumberOfFiles() + 1) {
                        resolve();
                    } else {
                        // Get the oldest file
                        oldestFileEntry = me.getOldestLogFile(filteredFiles);
                        if(oldestFileEntry) {
                            oldestFileEntry.fileEntry.remove(resolve, reject);
                        } else {
                            resolve();
                        }

                    }
                });
        });

    },

    /**
     * @private
     * @param fileEntries
     */
    filterFileEntries: function(fileEntries) {
        var filteredFileEntries = [];

        Ext.each(fileEntries, function(fileEntry) {
            if(fileEntry.name.indexOf('archibusmobile') !== -1) {
                filteredFileEntries.push(fileEntry);
            }
        });

        return filteredFileEntries;

    },

    getOldestLogFile: function(fileEntries) {
        var fileEntriesWithDates = [];

        Ext.each(fileEntries, function(fileEntry) {
            var archiveDateStr = fileEntry.name.match(/[0-9]{8}_[0-9]{6}/),
                archiveDate = Ext.DateExtras.parse(archiveDateStr, 'Ymd_his');

            fileEntriesWithDates.push({fileEntry: fileEntry, archiveDate: archiveDate});
        });

        fileEntriesWithDates.sort(function(a,b) {
            return a.archiveDate.getTime() - b.archiveDate.getTime();
        });

        if(fileEntriesWithDates.length > 0) {
            return fileEntriesWithDates[fileEntriesWithDates.length - 1];
        } else {
            return null;
        }
    }
});
//</feature>