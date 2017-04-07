/**
 * Floorplan utility functions
 *
 * @author Jeff Martin
 * @since 22.1
 */
Ext.define('Floorplan.util.Floorplan', {
    singleton: true,

    requires: [
        'Floorplan.model.Drawing'
    ],

    dateFormat: 'Y-m-d H:i:s.000',

    mixins: ['Common.promise.util.DatabaseOperation'],

    isDownloadCancelled: false,

    cancelDownload: function () {
        this.isDownloadCancelled = true;
    },

    saveFloorPlan: function (blId, flId, planType, data) {
        var me = this,
            useFileStorage = GlobalParameters.useFileStorage(),
            fileName = useFileStorage ? me.generateFileName(blId, flId, planType) : '',
            floorplanFolder = GlobalParameters.floorplanFolder + '/' + ConfigFileManager.username,
            publishedDates = Ext.getStore('publishDates').getPublishDates();

        if (Ext.isEmpty(data)) {
            return Promise.resolve();
        } else {
            return me.createDrawingTableIfNotExists()
                .then(function () {
                    if (useFileStorage) {
                        return me.writeFloorplanToFile(floorplanFolder, fileName, data);
                    } else {
                        return Promise.resolve();
                    }
                })
                .then(function () {
                    var svgData = useFileStorage ? '' : data,
                        publishDate = publishedDates[blId + ';' + flId];

                    if(!publishDate) {
                        publishDate = null;
                    }
                    return me.saveToDatabase(blId, flId, planType, fileName, svgData, publishDate);
                });
        }
    },

    /**
     * Reads the floorPlan drawing data from the database.
     * @param blId
     * @param flId
     * @param planType
     */
    readFloorPlan: function (blId, flId, planType) {
        var me = this,
            useFileStorage = GlobalParameters.useFileStorage(),
            fileName = me.generateFileName(blId, flId, planType),
            folder = GlobalParameters.floorplanFolder + '/' + ConfigFileManager.username;

        return me.createDrawingTableIfNotExists()
            .then(function () {
                if (useFileStorage) {
                    return me.readFloorplanFromFile(folder, fileName);
                } else {
                    return me.readFromDatabase(blId, flId, planType);
                }
            })
            .then(null, function (error) {
                Ext.Msg.alert('', error);
                return Promise.reject('');
            });
    },

    generateFileName: function (blId, flId, planType) {
        var fileName = blId + '_' + flId + '_' + planType;

        fileName = fileName.replace(/\s+/g, '');
        return fileName + '.svg';

    },

    writeFloorplanToFile: function (folder, file, data) {
        return Common.device.File.createDirectory(folder)
            .then(function () {
                return Common.device.File.writeFile(folder + '/' + file, data);
            });
    },

    readFloorplanFromFile: function (folder, file) {
        return Common.device.File.createDirectory(folder)
            .then(function () {
                return Common.device.File.readFile(folder + '/' + file);
            });
    },

    createDrawingTableIfNotExists: function () {
        var me = this,
            drawingModel = Ext.ModelManager.getModel('Floorplan.model.Drawing');
        return me.createOrModifyTable('Drawing', drawingModel);
    },

    saveToDatabase: function (blId, flId, planType, fileName, data, publishDate) {
        var me = this,
            deleteSql = 'DELETE FROM Drawing WHERE blId = ? AND flId = ? AND planType = ?',
            insertSql = 'INSERT INTO DRAWING(blId,flId,planType,data,fileName,publishDate) VALUES (?, ?, ?, ?, ?, ?);';

        return me.executeSqlCommand(deleteSql, [blId, flId, planType])
            .then(function () {
                var formattedDate = publishDate ? Ext.Date.format(publishDate, me.dateFormat): null;
                return me.executeSqlCommand(insertSql, [blId, flId, planType, data, fileName, formattedDate]);
            });
    },

    readFromDatabase: function (blId, flId, planType) {
        return new Promise(function (resolve, reject) {
            var sql = 'SELECT data FROM Drawing WHERE blId = ? AND flId = ? AND planType = ?',
                db = SqliteConnectionManager.getConnection();

            db.transaction(function (tx) {
                tx.executeSql(sql, [blId, flId, planType], function (tx, result) {
                    var data = null;
                    if (result.rows.length > 0) {
                        data = result.rows.item(0).data;
                    }
                    resolve(data);
                }, function (tx, error) {
                    reject(error.message);
                });
            });

        });
    },

    executeSqlCommand: function (sql, parameters) {
        return new Promise(function (resolve, reject) {
            var db = SqliteConnectionManager.getConnection();
            db.transaction(function (tx) {
                tx.executeSql(sql, parameters, resolve,
                    function (tx, error) {
                        reject(error.message);
                    });
            });
        });
    },


    /**
     * Retrieves the SVG data from the server for each plan type for the floor
     * @private
     * @param primaryKey
     * @param planTypes
     * @returns {Promise} A Promise that resolves to an array of drawing objects
     */
    getDrawingsForFloor: function (primaryKey, planTypes) {
        var clonedPlanTypes = Ext.Array.clone(planTypes),
            planType,
            floorData = {
                primaryKey: primaryKey,
                drawings: []
            };

        var getDrawings = function (planTypes) {
            var p = Promise.resolve();

            planTypes.forEach(function (planType) {
                var currentPlanType = planType;
                p = p.then(function () {
                        return Common.service.drawing.Drawing.retrieveSvgFromServer(primaryKey, currentPlanType, null);
                    })
                    .then(function (svgData) {
                        if (svgData !== '') {
                            floorData.drawings.push({
                                planType: currentPlanType,
                                svg: svgData
                            });
                        }
                        return Promise.resolve(floorData);
                    });
            });
            return p;
        };

        var getFirstSvgDrawing = function (planType) {
            return Common.service.drawing.Drawing.retrieveSvgFromServer(primaryKey, planType, null)
                .then(function (svgData) {
                    if (svgData !== '') {
                        floorData.drawings.push({
                            planType: planType,
                            svg: svgData
                        });
                    }
                    return Promise.resolve(floorData);
                });
        };

        planType = clonedPlanTypes.shift();
        return getFirstSvgDrawing(planType)
            .then(function (floorPlan) {
                if (floorPlan.drawings.length > 0) {
                    return getDrawings(clonedPlanTypes);
                } else {
                    return Promise.resolve(floorPlan);
                }
            });
    },


    /**
     * Downloads the floor plans for each of the floors identified by the floorCodes array.
     * Writes each of the plan types for each floor to the database Drawing table
     * @param {Object[]} floorCodes An array of floor code primary keys
     * @param {String[]} planTypes The plan type codes to download
     * @param {Function} progressBarUpdateFn The function used to update the progress bar.
     */
    getDrawingsForFloors: function (floorCodes, planTypes, progressBarUpdateFn) {
        var me = this,
            numberOfFloorPlansDownloaded = 0,
            numberOfProcessedFloors = 0,
            isCancelled = false,
            publishDateStore = Ext.getStore('publishDates');

        var getAllDrawings = function () {
            var p = Promise.resolve();

            Ext.Array.each(floorCodes, function (floorCode) {
                p = p.then(function () {
                    return me.getDrawingsForFloor(floorCode, planTypes);
                }).then(function (floorDrawings) {
                    numberOfProcessedFloors += 1;
                    if (typeof progressBarUpdateFn === 'function') {
                        progressBarUpdateFn.call(this, numberOfProcessedFloors);
                    }
                    if (floorDrawings.drawings.length > 0) {
                        numberOfFloorPlansDownloaded += 1;
                    }
                    return me.writeFloorPlanData(floorDrawings);
                }).then(function () {
                    if (me.isDownloadCancelled) {
                        isCancelled = true;
                        return Promise.reject(numberOfFloorPlansDownloaded);
                    } else {
                        return Promise.resolve(numberOfFloorPlansDownloaded);
                    }
                }, function () {
                    // writeFloorPlanData error handler
                    // TODO: File storage quota error in Chrome should terminate download.
                    return Promise.reject(numberOfFloorPlansDownloaded);
                });
            });

            return p;
        };

        if ((floorCodes && floorCodes.length === 0) || (planTypes && planTypes.length === 0)) {
            return Promise.resolve();
        } else {
            // Update the pubish dates
            return publishDateStore.deleteAndImportRecords()
                .then(function () {
                    return SyncManager.loadStore(publishDateStore);
                })
                .then(function () {
                    return getAllDrawings();
                });
        }
    },

    /**
     *
     * @param {Object} floorPlanData The floorPlan data object containing the floor plan primary key and data for
     * each plan type
     * @returns {Promise}
     */
    writeFloorPlanData: function (floorPlanData) {
        var writeFloorPlans = function () {
            var p = Promise.resolve();
            floorPlanData.drawings.forEach(function (drawing) {
                p = p.then(function () {
                    return Floorplan.util.Floorplan.saveFloorPlan(floorPlanData.primaryKey.bl_id, floorPlanData.primaryKey.fl_id, drawing.planType, drawing.svg);
                });
            });
            return p;
        };

        if (floorPlanData && floorPlanData.drawings && floorPlanData.drawings.length > 0) {
            return writeFloorPlans();
        } else {
            return Promise.resolve();
        }
    },

    /**
     * Retrieves the local publish date from the client Drawing table. The drawing publish time is
     * recorded when the floor plan is downloaded.
     * @param {String} blId building code
     * @param {String} flId floor code
     * @param {String} planType plan type.
     */
    getDrawingPublishDate: function(blId, flId, planType) {
        var me = this,
            sql = 'SELECT publishDate FROM Drawing WHERE blId = ? AND flId = ? AND planType = ?',
            db = SqliteConnectionManager.getConnection();

        return new Promise(function(resolve, reject) {
            db.transaction(function(tx) {
                tx.executeSql(sql, [blId, flId, planType], function(tx, result) {
                    var publishDate;
                    if(result.rows.length > 0) {
                        publishDate = result.rows.item(0).publishDate;
                        if(publishDate) {
                            publishDate = Ext.Date.parse(publishDate, me.dateFormat);
                        }
                        resolve(publishDate);
                    } else {
                        resolve(null);
                    }
                }, function(tx, error) {
                    reject(error.message);
                });
            });
        });
    }
});