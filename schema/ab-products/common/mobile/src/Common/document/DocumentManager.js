/**
 * Helper functions used to display documents
 * @since 21.3
 */
Ext.define('Common.document.DocumentManager', {
    alternateClassName: ['DocumentManager'],
    singleton: true,

    requires: [
        'Common.util.Environment',
        'Common.service.document.Document'
    ],

    msgBoxTitle: LocaleManager.getLocalizedString('Document Display', 'Common.document.DocumentManager'),
    featureNotAvailableMsg: LocaleManager.getLocalizedString('Feature not available in the desktop environment.', 'Common.document.DocumentManager'),
    fileNotFoundMessage: LocaleManager.getLocalizedString('File does not exist', 'Common.document.DocumentManager'),

    /**
     * Displays the photos on the Document list
     * @param imageData
     * @param isDisplayOnly
     */
    displayImagePanel: function (imageData, isDisplayOnly, cameraControl) {
        if (!cameraControl) {
            cameraControl = Ext.create('Common.control.Camera');
        }
        cameraControl.setImageData(imageData);

        cameraControl.setDisplayOnly(isDisplayOnly);
        cameraControl.showPanel();
    },

    isPhotoDocument: function (fileName) {
        var photoRe = /\.png|\.gif|\.jpg|\.jpeg|\.tiff|\.tif/;
        return photoRe.test(fileName.toLowerCase());
    },

    isOfficeOrPdfDocument: function (fileName) {
        var docRe = /\.doc|\.docx|\.xls|\.xlsx|\.pdf|\.txt/;
        return docRe.test(fileName.toLowerCase());
    },

    isDocumentValidToDisplay: function (fileName) {
        var isValid = this.isPhotoDocument(fileName) || this.isOfficeOrPdfDocument(fileName),
            msg = LocaleManager.getLocalizedString('File {0} cannot be displayed on this device.', 'Common.document.DocumentManager');

        if (!isValid) {
            Ext.Msg.alert(this.msgBoxTitle, Ext.String.format(msg, fileName));
        }
        return isValid;
    },

    displayDocument: function (documentData, fileName) {
        var genericErrorMessage = LocaleManager.getLocalizedString('An error occured while displaying the document', 'Common.document.DocumentManager');

        //<debug>
        var msg = LocaleManager.getLocalizedString('File {0} cannot be displayed when in Desktop mode.', 'Common.document.DocumentManager'),
            index,
            fileExtension,
            url;

        if (!Environment.getNativeMode()) {
            // Get the file extension to use as the Mime type.
            // This implementation is a bit fragile in that it depends on the filename containing a single '.' character
            index = fileName.indexOf('.');
            if (index > -1) {
                fileExtension = fileName.substring(index + 1, fileName.length);
                url = 'data:application/' + fileExtension + ';base64,' + documentData;
                window.open(url);
            } else {
                Ext.Msg.alert(this.msgBoxTitle, Ext.String.format(msg, fileName));
            }
            return;
        }
        //</debug>

        /**
         * Converts the base64 document data to a binary file and displays the file.
         */
        DocumentConverter.convertBase64ToBinary(documentData, fileName, function (filePath) {
            // Display the document in the inAppBrowser if we are on an iOS device
            // Android will launch an intent to display the file
            // Windows Phone will launch the required app after converting the data to binary.
            if (Ext.os.is.ios) {
                window.open('file:///' + filePath, '_blank', 'location=no,EnableViewPortScale=yes');
            }
        }, function (error) {
            if (Ext.isEmpty(error)) {
                error = genericErrorMessage;
            }
            Ext.Msg.alert('', error);
        });
    },

    displayDocumentOrImage: function (documentData, fileName, cameraPanel) {
        var me = this;
        // Check if the document can be displayed on the device?
        if (!me.isDocumentValidToDisplay(fileName)) {
            return;
        }

        if (me.isPhotoDocument(fileName)) {
            me.displayImagePanel(documentData, true, cameraPanel);
        } else {
            me.displayDocument(documentData, fileName);
        }
    },

    /**
     * Checks out an ARCHIBUS document and saves the document on the device file system. The document is saved in the
     * AbOnDemandDocuments/[AppName] folder. The location of the download folder on the device varies by platform.
     * @param {String} documentTableName The name of the table containing the document
     * @param {String} documentFieldName The document field name
     * @param {String} documentFileName The document file name as saved in Web Central
     * @param {Object} primaryKey An object containing the primary key fields and values. Example {ls_id:102}
     * @returns {Promise} A Promise object resolved to true when the operation is completed.
     */
    downloadOnDemandDocument: function (documentTableName, documentFieldName, documentFileName, primaryKey) {
        var me = this,
            targetFile = DocumentManager.generateFileName(documentTableName, documentFieldName, documentFileName, primaryKey),
            downloadMessage = LocaleManager.getLocalizedString('Downloading Document', 'Common.document.DocumentManager'),
            documentFolder = GlobalParameters.onDemandDocumentFolder,
            fileUri,
            targetFolder;

        //<debug>
        if(Ext.os.is.Desktop) {
            Ext.Msg.alert('',this.featureNotAvailableMsg);
            return Promise.reject('Feature not available');
        }
        //</debug>

        return Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function (isConnected) {
                if (isConnected) {
                    Mask.displayLoadingMask(downloadMessage);
                    return Common.service.Session.start()
                        .then(function () {
                            return Common.service.document.Document.retrieveDocumentURL(primaryKey, documentTableName, documentFieldName, documentFileName);
                        })
                        .then(function (url) {
                            Log.log('Document URL ' + url, 'info', null, 'downloadOnDemandDocument');
                            targetFolder = documentFolder + '/' + Common.Application.appName;
                            fileUri = me.getOrigin() + url;
                            return Common.device.File.createDirectory(targetFolder);
                        })
                        .then(function () {
                            return Common.service.Session.end();
                        })
                        .then(function () {
                            Log.log('Start file download for URI ' + fileUri, 'info', null, 'downloadOnDemandDocument');
                            return Common.device.File.downloadFile(fileUri, targetFile, targetFolder);
                        })
                        .then(function () {
                            Mask.hideLoadingMask();
                            return Promise.resolve();
                        }, function (error) {
                            Ext.Msg.alert('', error);
                            Common.service.Session.end()
                                .then(function () {
                                    Mask.hideLoadingMask();
                                    return Promise.reject();
                                });
                        });
                } else {
                    Network.displayConnectionMessage();
                    return Promise.reject();
                }
            });
    },

    getOrigin: function() {
        return Ext.String.format('{0}//{1}', document.location.protocol, document.location.host);
    },

    /**
     * Downloads a file from a server.
     * @param {String} fileURI The fileURI of the file to download. The URI can be a path to the Web Central
     * server or to any other server.
     * @param {String} targetFileName The file name to use when the device is written to the device.
     * @parame {String} targetFolder The device folder where the file will be saved to. Example 'AbOnDemandDocuments/tmpFiles'. The
     * actual file location depends on the platform.
     * @returns {Promise} A Promise object that is resolved when the operation is completed.
     */
    downloadFileWithURI: function(fileURI, targetFileName, targetFolder) {

        //<debug>
        if(Ext.os.is.Desktop) {
            Ext.Msg.alert('',this.featureNotAvailableMsg);
            return Promise.reject('Feature not available');
        }
        //</debug>

        return Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function(isConnected) {
                if(isConnected) {
                    return Common.device.File.downloadFile(fileURI, targetFileName, targetFolder);
                } else {
                    Network.displayConnectionMessage();
                    return Promise.reject();
                }
            });

    },

    /**
     * Displays the document file. The file is displayed using the InAppBrowser component on the iOS platform. The Android
     * and Windows platforms launch external applications to view the file
     * @param {Object} primaryKey An object containing the primary key fields and values of the document record in Web Central
     * @param {String} tableName The document table name
     * @param {String} documentFieldName The document field name
     * @param {String} documentFileName The document file name in Web Central
     */
    displayOnDemandDocument: function (primaryKey, tableName, documentFieldName, documentFileName) {
        var me = this,
            documentFolder = GlobalParameters.onDemandDocumentFolder,
            fileName = DocumentManager.generateFileName(tableName, documentFieldName, documentFileName, primaryKey),
            directory = documentFolder + '/' + Common.Application.appName,
            filePath = directory + '/' + fileName;

        me.displayFile(filePath);
    },

    displayFile: function(filePath) {
        var me = this,
            deviceFilePath;

        Common.device.File.fileExists(filePath)
            .then(function (fileEntry) {
                deviceFilePath = fileEntry.nativeURL;
                if (Ext.os.is.ios) {
                    window.open(deviceFilePath, '_blank', 'location=no,EnableViewPortScale=yes');
                } else if (Ext.os.is.android || Ext.os.is.WindowsPhone) {
                    // Remove the file:/// prefix from the file
                    deviceFilePath = Ext.os.is.Android ? deviceFilePath.replace('file:///', '') : filePath;
                    DocumentConverter.displayFileUsingIntent(deviceFilePath, Ext.emptyFn, function (error) {
                        var errorMessage = (error === 'FileNotFound') ? me.fileNotFoundMessage : error;
                        Ext.Msg.alert('', errorMessage);
                    });
                }
            }, function () {
                Ext.Msg.alert('', me.fileNotFoundMessage);
            });
    },

    deleteDocumentFile: function(store, record, documentFieldName) {
        var me = this,
            useFileStorage = GlobalParameters.useFileStorage(),
            documentTable = store.getDocumentTable(),
            documentFileName = record.get(documentFieldName),
            primaryKeyFields = store.getDocumentTablePrimaryKeyFields(),
            primaryKey = me.generatePrimaryKeyObject(primaryKeyFields, record),
            folder = GlobalParameters.documentFolder + '/' + ConfigFileManager.username + '/' + store.getModelTableName(),
            fileName = DocumentManager.generateFileName(documentTable, documentFieldName, documentFileName, primaryKey );

        // Always resolve the Promise
        return new Promise(function(resolve) {
            if(useFileStorage) {
                Common.device.File.deleteFile(folder + '/' + fileName)
                    .then(resolve, resolve);
            } else {
                resolve();
            }

        });
    },

    /**
     * @private
     */
    generatePrimaryKeyObject: function (keyFields, record) {
        var primaryKey = {};

        Ext.each(keyFields, function (keyField) {
            primaryKey[keyField] = record.get(keyField);
        });

        return primaryKey;
    },


    /**
     * Generates a unique file name for a document file
     * @param {String} tableName The document table name
     * @param {String} documentField The document field name
     * @param {String} documentFileName The document file name in Web Central
     * @param {Object} key An object containing the primary key fields and values
     * @returns {String}
     */
    generateFileName: function (tableName, documentField, documentFileName, key) {
        var keyValues = '',
            value;

        for (value in key) {
            keyValues += key[value] + '-';
        }

        return Ext.String.format('{0}{1}-{2}-{3}', keyValues, tableName, documentField, documentFileName);
    },

    /**
     * Marks the document for deletion if a network connection is available. If the network is not available
     * the _contents field is set to MARK_DELETED. The document will be deleted on the next sync.
     * @param store
     * @param record
     */
    markDocumentDeleted: function(store, record, documentField) {
        var me = this,
            keyValues,
            documentTableName,
            removeDocumentMessage = LocaleManager.getLocalizedString('Removing Document', 'Common.document.DocumentManager');

        //<debug>
        if(!(Ext.isFunction(store.getDocumentTable) && Ext.isFunction(store.getDocumentTablePrimaryKeyFields))) {
            Log.log('The store must contain the documentTable and documentTablePrimaryKeyFields configuration', 'warn', me, arguments);
            return Promise.reject('Invalid store configuration');
        }
        //</debug>

        keyValues = me.generatePrimaryKeyObject(store.getDocumentTablePrimaryKeyFields(), record);
        documentTableName = store.getDocumentTable();

        return Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function(isConnected) {
                if(isConnected) {
                    Mask.displayLoadingMask(removeDocumentMessage);
                    return Common.service.Session.start()
                        .then(function() {
                            // Remove document from the transaction table
                            return Common.service.document.Document.markDocumentDeleted(keyValues, documentTableName, documentField);
                        })
                        .then(function() {
                            return me.getSyncTablePrimaryKeyValuesForDocument(store, record, keyValues);
                        })
                        .then(function(syncTablePrimaryKey) {
                            // Remove the document from the sync table if the sync table is different than the transaction table
                            if(store.serverTableName === documentTableName) {
                                return Promise.resolve();
                            } else {
                                return Common.service.document.Document.markDocumentDeleted(syncTablePrimaryKey, store.serverTableName, documentField);
                            }
                        })
                        .then(function() {
                            return Common.service.Session.end();
                        })
                        .then(function() {
                            Mask.hideLoadingMask();
                            return me.setDocumentContents(store, record, documentField, false);
                        })
                        .then(null, function(error) {
                            Mask.hideLoadingMask();
                            return Common.service.Session.end()
                                .then(function() {
                                    return Promise.reject(error);
                                });  // Close the session in case of error, Common.service.Session.end() always resolves.
                        });

                } else {
                    Ext.Msg.alert('', 'The network is not available. The document will be removed on the next sync.');
                    return me.setDocumentContents(store, record, documentField, true);
                }
            });

    },

    setDocumentContents: function(store, record, documentField, markForSyncDeletion) {
        return new Promise(function(resolve, reject) {
            var autoSync = store.getAutoSync();

            if(autoSync) {
                store.setAutoSync(false);
            }
            record.set(documentField, markForSyncDeletion ? documentField : null);
            record.set(documentField + '_contents', markForSyncDeletion ? 'TUFSS19ERUxFVEVE': null);
            record.set(documentField + '_isnew', markForSyncDeletion);
            record.set(documentField + '_file', '');

            store.sync(function(){
                store.setAutoSync(autoSync);
                resolve(record);
            }, function() {
                store.setAutoSync(autoSync);
                reject('Error syncing store ' + store.getStoreId());
            });
        });
    },

    deleteDocument: function(store, record, documentField) {
        var me = this,
            keyValues,
            documentTableName;

        //<debug>
        if(!(Ext.isFunction(store.getDocumentTable) && Ext.isFunction(store.getDocumentTablePrimaryKeyFields))) {
            Log.log('The store must contain the documentTable and documentTablePrimaryKeyFields configuration', 'warn', me, arguments);
            return Promise.reject('Invalid store configuration');
        }
        //</debug>

        keyValues = me.generatePrimaryKeyObject(store.getDocumentTablePrimaryKeyFields(), record);
        documentTableName = store.getDocumentTable();

        return Common.service.document.Document.markDocumentDeleted(keyValues, documentTableName, documentField)
            .then(function() {
                return me.getSyncTablePrimaryKeyValuesForDocument(store, record, keyValues);
            })
            .then(function(syncTablePrimaryKey) {
                // Remove the document from the sync table
                return Common.service.document.Document.markDocumentDeleted(syncTablePrimaryKey, store.serverTableName, documentField);
            });
    },

    getSyncTablePrimaryKeyValuesForDocument: function(store, record, clientTablePrimaryKey) {
        var tableDef = Common.promise.util.TableDef.getTableDefObject(store.serverTableName),
            primaryKeyFields = Common.promise.util.TableDef.getPrimaryKeyFieldsFromTableDef(tableDef),
            restriction = {clauses: []},
            p;

        // Create restriction for the sync table using the document primary key fields
        for (p in clientTablePrimaryKey) {
            restriction.clauses.push({
                tableName: store.serverTableName,
                fieldName: p,
                operation: 'EQUALS',
                value: clientTablePrimaryKey[p]
            });
        }

        // Add mob_locked_by user restriction clause
        restriction.clauses.push({
            tableName: store.serverTableName,
            fieldName: 'mob_locked_by',
            operation: 'EQUALS',
            value: ConfigFileManager.username
        });

        return MobileSyncServiceAdapter.retrieveRecords(store.serverTableName, primaryKeyFields, restriction)
            .then(function(record) {
                var primaryKeys = {};

                Ext.each(record[0].fieldValues, function (field) {
                    primaryKeys[field.fieldName] = field.fieldValue;
                });

                return Promise.resolve(primaryKeys);
            });

    }
});