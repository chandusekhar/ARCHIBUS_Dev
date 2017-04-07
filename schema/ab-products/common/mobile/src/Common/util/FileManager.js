/**
 * File handling functions
 * @deprecated 22.1 Use Common.device.File instead
 * @author Jeff Martin
 * @since 21.2
 * @singleton
 */

Ext.define('Common.util.FileManager', {
    singleton: true,

    /**
     * Decodes the FileError code
     * @param {Number} errorCode
     * @returns {String} The FileError message
     */
    decodeFileError: function(errorCode) {
        var errors = [
            {
                code: FileError.NOT_FOUND_ERR,
                message: LocaleManager.getLocalizedString('File was not found', 'Common.util.FileManager')
            },
            {
                code: FileError.SECURITY_ERR,
                message: LocaleManager.getLocalizedString('File security error', 'Common.util.FileManager')},
            {
                code: FileError.ABORT_ERR,
                message: LocaleManager.getLocalizedString('File access was aborted', 'Common.util.FileManager')},
            {
                code: FileError.NOT_READABLE_ERR,
                message: LocaleManager.getLocalizedString('File was not readable', 'Common.util.FileManager')},
            {
                code: FileError.ENCODING_ERR,
                message: LocaleManager.getLocalizedString('File encoding error', 'Common.util.FileManager')},
            {
                code: FileError.NO_MODIFICATION_ALLOWED_ERR,
                message: LocaleManager.getLocalizedString('File modification is not allowed', 'Common.util.FileManager')},
            {
                code: FileError.INVALID_STATE_ERR,
                message: LocaleManager.getLocalizedString('File is in an invalid state', 'Common.util.FileManager')},
            {
                code: FileError.INVALID_MODIFICATION_ERR,
                message: LocaleManager.getLocalizedString('Invalid file modification error', 'Common.util.FileManager')},
            {
                code: FileError.QUOTA_EXCEEDED_ERR,
                message: LocaleManager.getLocalizedString('File quota exceeded', 'Common.util.FileManager')},
            {
                code: FileError.TYPE_MISMATCH_ERR,
                message: LocaleManager.getLocalizedString('File type mismatch error', 'Common.util.FileManager')},
            {
                code: FileError.PATH_EXISTS_ERR,
                message: LocaleManager.getLocalizedString('File already exists', 'Common.util.FileManager')}
        ], i;

        for(i = 0; i < errors.length; i++) {
            if(errors[i].code === errorCode) {
                return errors[i].message;
            }
        }

        return 'File Error';
    },

    /**
     * Displays the FileError message
     * @param {Object} fileError The FileError object
     */
    fileErrorHandler: function(fileError) {
        var msgBoxTitle = LocaleManager.getLocalizedString('File Error', 'Common.util.FileManager');

        Ext.Msg.alert(msgBoxTitle, Common.util.FileManager.decodeFileError(fileError.code));
    },

    /**
     * Returns the file system object
     * @param {Function} onCompleted called when the operation is completed
     * @param {Object} scope The scope to execute the callback in.
     */
    getFileSystem: function(onCompleted, scope) {
        var me = this;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            Ext.callback(onCompleted, scope || me, [fileSystem]);
        });
    },


    /**
     * Returns a file reference
     * @param {String} directory The directory containing the file
     * @param {String} fileName The file name
     * @param {Function} onCompleted Called when the operation is completed.
     * @param {Object} scope The scope to execute the onCompleted function
     */
    getFile: function(directory, fileName, onCompleted, scope) {
        var me = this,
            options = {
                create: true,
                exclusive: false
            };

        me.getFileSystem(function(fileSystem) {
            fileSystem.root.getDirectory(directory, options, function(dirEntry) {
                dirEntry.getFile(fileName, options, function(fileEntry) {
                    Ext.callback(onCompleted, scope || me, [fileEntry]);
                }, me.fileErrorHandler);
            });
        }, me.fileErrorHandler);
    },


    /**
     * Removes a file
     * @param {String} directory The directory containing the file
     * @param {String} fileName The file name
     * @param {Function} onCompleted Called when the operation is completed.
     * @param {Object} scope The scope to execute the onCompleted function
     */
    removeFile: function(directory, fileName, onCompleted, scope) {
        var me = this;
        me.getFile(directory, fileName, function(fileEntry) {
            fileEntry.remove(function() {
                Ext.callback(onCompleted, scope || me);
            });
        }, me.fileErrorHandler);
    },

    /**
     * Removes a file, then writes the data to the file
     * @param {String} directory The directory containing the file
     * @param {String} fileName The file name
     * @param {String} data The data to write to the file
     * @param {Function} onCompleted Called when the operation is completed.
     * @param {Object} scope The scope to execute the onCompleted function
     */
    removeFileThenWrite: function (directory, fileName, data, onCompleted, scope) {
        var me = this;
        me.removeFile(directory, fileName, function() {
            me.write(directory, fileName, data, function(evt) {
                Ext.callback(onCompleted, scope || me, [evt]);
            });
        }, me);
    },

    /**
     * Writes data to a file
     * @param {String} directory The directory containing the file
     * @param {String} fileName The file name
     * @param {String} data The data to write to the file
     * @param {Function} onCompleted Called when the operation is completed.
     * @param {Object} scope The scope to execute the onCompleted function
     */
    write: function(directory, fileName, data, onCompleted, scope) {
        var me = this;
        // Get the fileEntry
        me.getFile(directory, fileName, function(fileEntry) {
            fileEntry.createWriter(function(writer) {
                writer.onwriteend = function(evt) {
                    Ext.callback(onCompleted, scope || me, [evt]);
                };

                // If this is a mobile browser we can just write the string
                // if this is a desktop browser we have to convert to a Blob before
                // writing
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                    writer.write(data);
                } else {
                    // The paddedStr is an ugly hack. The Blob object does not replace the file
                    // if the new file contents are 'shorter' than the original the remaining characters
                    // will be left in place. The additional spaces at the end of the file prevent this.
                    // This is only required for development on the desktop browser.
                    //var paddedStr = configObjStr + '                        ';
                    var blob = new Blob([ data ], {
                        "type" : "text\/plain"
                    });
                    writer.write(blob);
                }
            }, me.fileErrorHandler);
        }, me.fileErrorHandler);
    },


    /**
     * Reads the contents of the file
     * @param {String} directory The directory containing the file
     * @param {String} fileName The file name
     * @param {Function} onCompleted Called when the operation is completed.
     * @param {Object} scope The scope to execute the onCompleted function
     */
    read: function(directory, fileName, onCompleted, scope) {
        var me = this;

        me.getFile(directory, fileName, function(fileEntry) {
            fileEntry.file(function(file) {
                me.readFile(file, function(result) {
                    Ext.callback(onCompleted, scope || me, [result]);
                }, me);
            }, Ext.emptyFn);
        });
    },

    /**
     * @private
     * @param {String} file
     * @param {Function} resultCallback
     * @param {Object} scope
     */
    readFile : function(file, resultCallback, scope) {
        var me = this,
            reader = new FileReader();

        reader.onloadend = function(evt) {
            // Convert the JSON string from the file to a configuration object
            Ext.callback(resultCallback, scope || me, [evt.target.result]);
        };
        reader.readAsText(file);
    }
});
