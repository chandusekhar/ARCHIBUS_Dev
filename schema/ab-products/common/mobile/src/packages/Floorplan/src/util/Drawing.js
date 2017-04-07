/**
 * Utility classes used in the Floorplan package
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Floorplan.util.Drawing', {
    requires: [
        'Floorplan.util.Floorplan',
        'Common.util.Network',
        'Common.service.drawing.Drawing'
    ],

    singleton: true,

    /**
     * Reads the floor plan data from the database if it is available. If the data does not exist in the database
     * @param {String} buildingCode The building code
     * @param {String} floorCode The floor code
     * @param {String} planType The Plan Type to apply to the SVG data
     * @param {Object[]} highLights The highlights to apply to the SVG data
     * @param {Function} onCompleted The function called after the SVG data is retrieved from the server
     * @param {Object} scope The scope to execute the callback function in.
     */
    readDrawingFromStorageOrRetrieveIfNot: function (buildingCode, floorCode, planType, highLights, onCompleted, scope) {
        var me = this,
            localPublishDate,
            serverPublishDate,
            pkeyValues = {
                bl_id: buildingCode,
                fl_id: floorCode
            },
            onFinish = function (svgData) {
                Ext.callback(onCompleted, scope || me, [svgData]);
            };

        if (Ext.isEmpty(highLights)) {
            highLights = [];
        }

        // Get the local floor plan publish date
        Floorplan.util.Floorplan.createDrawingTableIfNotExists()
            .then(function() {
                return Floorplan.util.Floorplan.getDrawingPublishDate(buildingCode, floorCode, planType);
            })
            .then(function(publishDate) {
                localPublishDate = publishDate;
                serverPublishDate = Ext.getStore('publishDates').getServerPublishDate(buildingCode, floorCode);
                return Floorplan.util.Floorplan.readFloorPlan(buildingCode, floorCode, planType);
            })
            .then(function (svgData) {
                var tmpSvgData = svgData;
                if (Ext.isEmpty(svgData)){
                   return me.retrieveSvgDataFromServer(pkeyValues, planType, highLights);
                } else {
                    // The floor plan is cached, check if there is a newer version on the server.
                    if (me.retrieveNewDrawing(localPublishDate, serverPublishDate)) {
                        return me.retrieveSvgDataFromServer(pkeyValues, planType, highLights)
                            .then(function (svgData) {
                                if (Ext.isEmpty(svgData)) {
                                    return Promise.resolve(tmpSvgData);
                                } else {
                                    return Promise.resolve(svgData);
                                }
                            });
                    } else {
                        return Promise.resolve(tmpSvgData);
                    }
                }

            }).done(onFinish, function (error) {
                Log.log(error, 'error');
                onFinish('');
            });

    },

    /**
     * Returns true if there is a newer version of the drawing available on the server.
     * @param {Date} localPublishDate publish date stored on the client
     * @param {Date} serverPublishDate publish date stored on the server
     * @returns {boolean} true if there is a newer version of the drawing on the server.
     */
    retrieveNewDrawing: function(localPublishDate, serverPublishDate) {
        var loadNewDrawing = false;
        if(localPublishDate !== null && serverPublishDate !== null) {
            loadNewDrawing =  (serverPublishDate > localPublishDate);
        }
        return loadNewDrawing;
    },

    /**
     * @private
     * @param primaryKeys
     * @param planType
     * @param highlights
     * @returns {*}
     */
    retrieveSvgDataFromServer: function (primaryKeys, planType, highlights) {
        var svgData = '';
        return Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function (isConnected) {
                if (isConnected) {
                    Mask.displayLoadingMask();
                    return Common.service.Session.start()
                        .then(function () {
                            return Common.service.drawing.Drawing.retrieveSvgFromServer(primaryKeys, planType, highlights);
                        })
                        .then(function (data) {
                            svgData = data;
                            return Common.service.Session.end();
                        })
                        .then(function () {
                            Mask.hideLoadingMask();
                            return Promise.resolve(svgData);
                        })
                        .then(null, function (error) {
                            Mask.hideLoadingMask();
                            Log.log(error, 'error');
                            return Common.service.Session.end();  // Close the session if there is an error. Session.end() always resolves.
                        });
                } else {
                    return Promise.resolve();
                }
            }, function () {
                return Promise.resolve();
            });
    },

    /**
     * Retrieves the detail_dwg file names from the SpaceSite table
     * @returns {Promise} A Promise resolved with the detailDrawing object
     */
    getSiteDrawingRecords: function () {
        return new Promise(function (resolve, reject) {
            var db = SqliteConnectionManager.getConnection(),
                sql = 'SELECT site_id,detail_dwg FROM SpaceSite WHERE detail_dwg IS NOT NULL';

            db.transaction(function (tx) {
                tx.executeSql(sql, null, function (tx, result) {
                    var ln = result.rows.length,
                        detailDrawings = [],
                        i;

                    for (i = 0; i < ln; i++) {
                        detailDrawings.push({
                            site_id: result.rows.item(i).site_id,
                            detail_dwg: result.rows.item(i).detail_dwg
                        });
                    }
                    resolve(detailDrawings);
                }, function (tx, error) {
                    reject(error.message);
                });
            });
        });
    },

    /**
     * Returns an array of Active Plan Types
     * @returns {Ext.data.Model[]}
     */
    getActivePlanTypes: function () {
        var planTypesStore = Ext.getStore('planTypes'),
            activePlanTypes = [];

        // The Plan Types store is loaded and does not have a page size set
        planTypesStore.each(function (planType) {
            if (planType.get('active') === 1) {
                activePlanTypes.push(planType.get('plan_type'));
            }
        });
        return activePlanTypes;
    },

    /**
     * Returns an array of active Plan Types for specific app
     * @param store id for active app plan types
     * @returns {Ext.data.Model[]}
     */
    getPlanTypesForApp: function (appPlanTypeStoreId) {
        var activePlanTypes = [],
            planTypesStore = Ext.getStore(appPlanTypeStoreId);

        // The Plan Type Groups store is loaded and does not have a page size set
        if (planTypesStore) {
            planTypesStore.each(function (planTypeRecord) {
                activePlanTypes.push(planTypeRecord.get('plan_type'));
            });
        }

        return activePlanTypes;
    },

    /**
     * Returns an array of Plan Types
     * @returns {Ext.data.Model[]}
     */
    getAllPlanTypes: function () {
        var planTypesStore = Ext.getStore('planTypes'),
            planTypes = [];

        // The Plan Types store is loaded and does not have a page size set
        planTypesStore.each(function (planType) {
            planTypes.push(planType.get('plan_type'));
        });

        return planTypes;
    },

    saveSiteDrawing: function (siteId, svgData) {
        var me = this,
            useFileStorage = GlobalParameters.useFileStorage(),
            p = Promise.resolve();

        return p.then(function () {
            if (useFileStorage) {
                return me.saveSiteDrawingToFile(siteId, svgData);
            } else {
                return Promise.resolve();
            }
        }).then(function () {
            var data = useFileStorage ? '' : svgData;
            return me.saveSiteDrawingToDatabase(siteId, data);
        });
    },

    saveSiteDrawingToDatabase: function (siteId, svgData) {
        return new Promise(function (resolve, reject) {
            var deleteSql = 'DELETE FROM SiteDrawing WHERE site_id=?',
                insertSql = 'INSERT INTO SiteDrawing(site_id, svg_data, svg_data_file) VALUES(?,?,?)',
                db = Common.store.proxy.SqliteConnectionManager.getConnection(),
                afterDelete = function (tx) {
                    tx.executeSql(insertSql, [siteId, svgData, siteId], resolve, function (tx, error) {
                        reject(error.message);
                    });
                };

            db.transaction(function (tx) {
                tx.executeSql(deleteSql, [siteId], afterDelete, function (tx, error) {
                    reject(error.message);
                });
            });

        });

    },

    saveSiteDrawingToFile: function (siteId, svgData) {
        var folder = GlobalParameters.floorplanFolder + '/' + ConfigFileManager.username;

        return Common.device.File.createDirectory(folder).
            then(function () {
                return Common.device.File.writeFile(folder + '/' + siteId, svgData);
            });
    }


});