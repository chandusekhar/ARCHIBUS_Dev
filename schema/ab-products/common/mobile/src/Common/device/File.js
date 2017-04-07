Ext.define('Common.device.File', {
    singleton: true,

    requires: 'Common.util.Environment',

    errorHandler: function (e) {
        var msg = '';

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        }
        console.log('Error: ' + msg);
    },

    getFileSystem: function () {
        return new Promise(function (resolve, reject) {
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, resolve, function (error) {
                reject(error);
            });
        });
    },

    getFileEntry: function (fileSystem, fileName, createFile) {
        if (!Ext.isDefined(createFile)) {
            createFile = true;
        }
        return new Promise(function (resolve, reject) {
            fileSystem.root.getFile(fileName, {create: createFile, exclusive: false}, resolve, function (error) {
                var errorMsg = 'File Error code: ' + error.code + ' ' + error.message;
                reject(errorMsg);
            });
        });
    },

    /**
     * Gets a reference to a folder in the device file system. Creates the folder if it does not exist.
     * @param folderName
     * @returns {Promise} A Promise resolved when the operation is completed.
     */
    getFolder: function (folderName) {
        var me = this;
        return new Promise(function (resolve, reject) {
            me.getFileSystem().then(function (fileSystem) {
                fileSystem.root.getDirectory(folderName, {create: true, exclusive: false}, resolve, reject);
            });
        });
    },

    /**
     *
     * @param {String} directoryPath The directory path to create. The directories are seperated by /.
     */
    createDirectory: function (directoryPath) {
        var me = this,
            directories = directoryPath.split('/'),
            priorDirectories = '',
            p = Promise.resolve();

        directories.forEach(function (directory) {
            p = p.then(function () {
                if (priorDirectories.length > 0) {
                    priorDirectories += '/';
                }
                return me.getFolder(priorDirectories + directory)
                    .then(function () {
                        priorDirectories += directory;
                        return Promise.resolve();
                    });
            });
        });

        return p;
    },

    doFileRead: function (fileEntry) {
        return new Promise(function (resolve, reject) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    resolve(e.target.result);
                };
                reader.readAsText(file);
            }, function (error) {
                reject(error);
            });
        });
    },

    doFileWrite: function (fileEntry, data) {
        var me = this,
            fileData = me.convertFileData(data);

        if(data.length === 0) {
            return Promise.resolve();
        } else {
            return new Promise(function (resolve, reject) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function () {
                        if (fileWriter.length === 0) {
                            fileWriter.write(fileData);
                        } else {
                            resolve();
                        }
                    };
                    fileWriter.onerror = function (error) {
                        var errorMessage;
                        if (error && error.code) {
                            errorMessage = error.code;
                        } else {
                            if (error.target.error) {
                                errorMessage = error.target.error.message;
                            }
                        }
                        reject(errorMessage);
                    };

                    fileWriter.truncate(0);
                }, reject);
            });
        }
    },

    doFileAppend: function (fileEntry, data) {
        var me = this,
            fileData; // = me.convertFileData(data);

        return new Promise(function (resolve, reject) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = resolve;
                fileWriter.onerror = reject;

                fileData = me.convertFileData(data);
                fileWriter.seek(fileWriter.length); // Start write position at EOF.
                fileWriter.write(fileData);

            }, reject);
        });
    },

    readFile: function (fileName) {
        var me = this;

        return me.getFileSystem()
            .then(function (fileSystem) {
                return me.getFileEntry(fileSystem, fileName);
            })
            .then(function (fileEntry) {
                return me.doFileRead(fileEntry);
            });

    },

    writeFile: function (fileName, data) {
        var me = this;

        return me.getFileSystem()
            .then(function (fileSystem) {
                return me.getFileEntry(fileSystem, fileName);
            })
            .then(function (fileEntry) {
                return me.doFileWrite(fileEntry, data);
            });
    },

    appendFile: function (fileName, data) {
        var me = this;

        return me.getFileSystem()
            .then(function (fileSystem) {
                return me.getFileEntry(fileSystem, fileName);
            })
            .then(function (fileEntry) {
                return me.doFileAppend(fileEntry, data);
            });
    },

    convertFileData: function (data) {
        if (Environment.getNativeMode()) {
            return data;
        } else {
            return new Blob([data], {type: 'text/plain'});
        }
    },

    fileExists: function (fileName) {
        var me = this;

        return me.getFileSystem()
            .then(function (fileSystem) {
                return new Promise(function(resolve, reject) {
                    fileSystem.root.getFile(fileName, {create: false, exclusive: false}, resolve, reject);
                });
            });
    },

    getFileMetadata: function (fileName) {
        var me = this;

        return new Promise(function (resolve, reject) {
            me.getFileSystem()
                .then(function (fileSystem) {
                    return me.getFileEntry(fileSystem, fileName, false);
                }, reject)
                .then(function (fileEntry) {
                    fileEntry.getMetadata(function (metadata) {
                        resolve(metadata);
                    }, reject);
                }, reject);
        });
    },

    moveToFile: function (fileName, toDirectory, toFileName) {
        var me = this,
            file;

        return new Promise(function (resolve, reject) {
            me.getFileSystem()
                .then(function (fileSystem) {
                    return me.getFileEntry(fileSystem, fileName);
                })
                .then(function (fileEntry) {
                    file = fileEntry;
                    return me.getFolder(toDirectory);
                })
                .then(function (dirEntry) {
                    file.moveTo(dirEntry, toFileName, function () {
                        resolve(file);
                    }, function () {
                        reject();
                    });
                });
        });
    },

    getFilesInDirectory: function (directory) {
        var me = this,
            entries = [];

        return new Promise(function (resolve, reject) {
            me.getFolder(directory)
                .then(function (directoryEntry) {
                    var dirReader = directoryEntry.createReader();
                    var readEntries = function () {
                        dirReader.readEntries(function (results) {
                            if (!results.length) {
                                resolve(entries);
                            } else {
                                entries = entries.concat(results);
                                readEntries();
                            }
                        }, reject);
                    };
                    readEntries();
                }, reject);
        });
    },

    /**
     * Deletes all files in the provided directory. Does not delete files from and child directories
     * @param {String} directory
     * @returns {Promise}
     */
    deleteFilesInDirectory: function (directory) {
        return Common.device.File.getFilesInDirectory(directory)
            .then(function (fileEntries) {
                return Promise.all(fileEntries.map(Common.device.File.deleteFileWithFileEntry));
            });
    },

    /**
     * Deletes files in the directory starting at path. Walks the directory tree and
     * removes all files from the child directories.
     * @param {String} path The starting directory path
     * @returns {Promise}  A Promise object resolved to true when the operation is completed.
     */
    deleteFilesInDirectoryRecursive: function (path) {
        // Android returns the fullPath with a leading /. We need to remove it.
        if (path.indexOf('/') === 0) {
            path = path.substring(1);
        }

        return Common.device.File.getFilesInDirectory(path)
            .then(function (entries) {
                return Promise.all(entries.map(function (e) {
                    if (e.isFile) {
                        e.remove(function () {
                            Log.log('File ' + e.name + ' removed', 'verbose');
                        }, function (error) {
                            Log.log(error, 'error');
                        });
                    } else {
                        Common.device.File.deleteFilesInDirectoryRecursive(e.fullPath);
                    }
                }));
            }, function (error) {
                Log.log(error, 'error');
            });
    },

    deleteFileWithFileEntry: function (fileEntry) {
        return new Promise(function (resolve, reject) {
            fileEntry.remove(resolve, function (error) {
                reject(error.message);
            });
        });
    },

    deleteFile: function (filePath) {
        return Common.device.File.getFileSystem()
            .then(function (fileSystem) {
                return Common.device.File.getFileEntry(fileSystem, filePath, false);
            })
            .then(function (fileEntry) {
                return Common.device.File.deleteFileWithFileEntry(fileEntry);
            });
    },

    deleteFileIfExists: function (filePath) {
        var me = this;
        return me.fileExists(filePath)
            .then(function () {
                    return me.deleteFile(filePath);
                }, function () {
                    return Promise.resolve();
                }
            );
    },

    /**
     *
     * @param {String} fileUri The fully qualified file URI of the file to be downloaded.
     * @param {String} targetFile The name of the target file on the device
     * @param {String} targetFolder The name of the target folder on the device.
     * @returns {Promise}
     */
    downloadFile: function (fileUri, targetFile, targetFolder) {
        var me = this,
            targetPathName = targetFolder + '/' + targetFile,
            uri = encodeURI(fileUri);

        Log.log('Download file ' + uri, 'verbose');
        return me.getFileSystem()
            .then(function (fileSystem) {
                var filePath,
                    urlPath = fileSystem.root.toURL();

                filePath = urlPath + "\/" + targetPathName;

                return me.transferFile(uri, filePath);
            });
    },

    /**
     * Transfers a file from a remote sever to the device
     * @private
     * @param {String} uri The URI of the file to download
     * @param {String} filePath The file path on the device to store the downloaded file
     * @returns {Promise} A Promises resolved with the device target path.
     */
    transferFile: function (uri, filePath) {
        var transfer = new FileTransfer();

        return new Promise(function (resolve, reject) {
            transfer.download(
                uri,
                filePath,
                function (entry) {
                    var targetPath = entry.toURL();
                    Log.log('Downloaded file saved to: ' + targetPath, 'info');
                    resolve(targetPath);
                },
                function (error) {
                    Log.log('File Transfer failed. error: ' + error.code);
                    reject('File Transfer failed. error: ' + error.code);
                }
            );
        });
    }


});
