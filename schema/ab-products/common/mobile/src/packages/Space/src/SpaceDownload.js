/**
 * Utility class to manage download operations on Space objects
 *
 * @author Ana Paduraru
 * @since 21.2
 */
Ext.define('Space.SpaceDownload', {
    singleton: true,
    mixins: ['Ext.mixin.Observable'],
    requires: [
        'Common.service.drawing.Drawing',
        'Floorplan.util.Drawing',
        'Common.service.ExceptionTranslator',
        'Common.sync.Manager',
        'Floorplan.util.Floorplan'
    ],

    downloadFloorPlanMessage: LocaleManager.getLocalizedString('You are going to download plans for {0} floors and this action may take some time. Proceed?', 'Space.SpaceDownload'),
    noFloorPlansMessage: LocaleManager.getLocalizedString('Use the {0} icon to download your list of floors and buildings before downloading floor plans.', 'Space.SpaceDownload'),
    noFloorPlansTitle: LocaleManager.getLocalizedString('Floor Plans', 'Space.SpaceDownload'),
    downloadFloorPlansTitle: LocaleManager.getLocalizedString('Download Floor Plans', 'Space.SpaceDownload'),
    numberOfFloorPlansDownloadedMessage: LocaleManager.getLocalizedString('Downloaded plans for {0} floors.', 'Space.SpaceDownload'),
    //numberOfFloorPlansIncompleteMessage: LocaleManager.getLocalizedString('Not all {0} floors of the selected buildings have floor plans available.', 'Space.SpaceDownload'),
    cancelMessage: LocaleManager.getLocalizedString('Floor Plan download was cancelled.', 'Space.SpaceDownload'),
    noFloorPlansAvailable: LocaleManager.getLocalizedString('No Floor Plans available to download', 'Space.SpaceDownload'),

    noActivePlanTypesFound: LocaleManager.getLocalizedString('No active plan types found.', 'Space.SpaceDownload'),
    noPlanTypesFound: LocaleManager.getLocalizedString('No plan types found', 'Space.SpaceDownload'),




    NUMBER_OF_PLANS_WARNING: 100,

    constructor: function () {
        var me = this;
        // The exception event is fired if an exception is caught by the global exception
        // handler. Clean up when an unhandled exception occurs.
        me.on('exception', function () {
            setTimeout(function () {
                me.cancelDownload();
            }, 500);
        }, me);
    },

    cancelDownload: function () {
        Floorplan.util.Floorplan.cancelDownload();
    },

    /**
     * Action Download Data.
     */
    onDownloadData: function (scope, onCompleted) {
        var me = this,
            siteList = scope.getSiteList(),
            emptyTextMessage = siteList.getEmptyText(),
            onFinish = function () {
                SyncManager.endSync();
                Common.service.Session.end()
                    .then(function () {
                        // KB3049392 - scroll to top of the list
                        if (siteList && siteList.getScrollable() && siteList.getScrollable().getScroller()) {
                            siteList.getScrollable().getScroller().scrollToTop();
                        }
                        siteList.setEmptyText(emptyTextMessage);
                        Ext.callback(onCompleted, scope || me);
                    });
            };

        if (SyncManager.syncIsActive) {
            return;
        }

        Mask.displayLoadingMask();
        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                Mask.hideLoadingMask();
                if (isConnected) {
                    Common.service.Session.start()
                        .then(function () {
                            SyncManager.startSync();
                            return SyncManager.downloadValidatingTables();
                        })
                        .then(function () {
                            // KB3049392 - reset sites store page to load first page on Download Data
                            Ext.getStore('spaceBookSites').currentPage = 1;
                            return SyncManager.loadStoresAfterSync();
                        })
                        .then(function () {
                            // Load the SiteDrawings store to ensure the table is created before saving drawings.
                            return SyncManager.loadStore('siteDrawings');
                        })
                        .then(function () {
                            Mask.setLoadingMessage(LocaleManager.getLocalizedString('Downloading Site Maps', 'Space.SpaceDownload'));
                            return me.downloadSiteDrawings();
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Promise.reject();
                        })
                        .done(onFinish, onFinish);
                }
            }, function() {
                // Check connection error
                Mask.hideLoadingMask();
                Ext.callback(onCompleted, scope || me);
            });
    },

    /**
     * Retrieve the site_id values for all of the records where the detail_dwg field is not null. Retrieve the site
     * drawing data from the server for each of the returned site records. Note: We are retrieving the site records from
     * the database to avoid complications that arise from using the SpaceSite store to display the main page list of
     * sites.
     * @return {Promise} A Promise that is resolved when the site drawings are retrieved.
     */

    downloadSiteDrawings: function () {
        var me = this;

        return Floorplan.util.Drawing.getSiteDrawingRecords()
            .then(function (siteRecords) {
                return me.getSiteDrawingFromServerWithoutSession(siteRecords);
            });
    },


    /**
     * Retrieves the site drawings from the server. Saves the site drawings to the client database.
     * @param {Object[]} siteRecords An array of objects containing the site_id.
     */
    getSiteDrawingFromServerWithoutSession: function (siteRecords) {
        var highlightParameters = [
            {
                view_file: 'ab-sp-space-book-bl.axvw',
                hs_ds: 'ds_ab-sp-space-book-bl_blHighlight',
                label_ds: 'ds_ab-sp-space-book-bl_blLabel',
                label_ht: '1'
            }
        ];

        var downloadSiteDrawings = function (siteRecords) {
            var p = Promise.resolve();
            siteRecords.forEach(function (siteRecord) {
                p = p.then(function () {
                    return Common.service.drawing.Drawing.retrieveSvgFromServer({site_id: siteRecord.site_id}, null, highlightParameters);
                }).then(function (svgData) {
                    return Floorplan.util.Drawing.saveSiteDrawing(siteRecord.site_id, svgData);
                });
            });
            return p;
        };

        return downloadSiteDrawings(siteRecords);
    },

    /**
     * Downloads all floor plans for the provided location level
     * @param {String} level The location level.
     * Valid levels are:
     *  - all: download all floor plans
     *  - site: download all floor plans for the site
     *  - building: download all floor plans for the building
     *  @param {Object} scope Caller scope
     *  @param {Boolean} useOnlyActivePlanTypes
     *  @param [applySecurityGroups] Applies user security groups when true
     *  @param {Ext.data.Store} appPlanTypeStoreId [since 22.1] store name for the store containing the active plan types for the current app.
     *  It uses the plantype_groups server table.
     */

    downloadFloorPlans: function (level, scope, useOnlyActivePlanTypes, applySecurityGroups, appPlanTypeStoreId) {
        var me = this,
            onFinish = function () {
                Common.service.Session.end();
            };

        return Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                if (isConnected) {
                    return Common.service.Session.start()
                        .then(SyncManager.downloadValidatingTable.bind(SyncManager, 'planTypes'))
                        .then(SyncManager.loadStore.bind(SyncManager, 'planTypes'))
                        .then(function () {
                            if (applySecurityGroups) {
                                return SpaceBook.util.Ui.applyUserGroups();
                            } else {
                                return Promise.resolve();
                            }
                        })
                        .then(me.getFloorCodesToDownload.bind(me, level, scope ))
                        .then(function (floorCodes) {
                            return me.doDownloadFloorPlans(floorCodes, useOnlyActivePlanTypes, appPlanTypeStoreId);
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Promise.reject();
                        })
                        .done(onFinish, onFinish);
                }
            });

    },

    /**
     *
     * @param {String} level The location hierarchy level, site or building
     * @param {Object} scope The executing scope. Used to reference the current view
     * @returns {Promise} A Promise resolved with an object array containing building ids and floor ids of
     * floors that have published drawings
     */
    getFloorCodesToDownload: function (level, scope) {
        var siteIds = [],
            blIds = [];

        if (level === 'building') {
            blIds.push(scope.getFloorsListView().getParentId());
        }

        if (level === 'site') {
            siteIds.push(scope.getSiteView().getParentId());
        }

        return Common.service.drawing.Drawing.getFloorCodesForPublishedDrawings(siteIds, blIds);
    },

    verifyExistActivePlanTypes: function () {
        var activePlanTypes = Floorplan.util.Drawing.getActivePlanTypes();

        if (activePlanTypes.length === 0) {
            Ext.Msg.alert('', Space.SpaceDownload.noActivePlanTypesFound);
            return false;
        }

        return true;
    },

    /**
     * Verify if there are active plan types for a specific app.
     * @param {String} store id for active app plan types
     * @returns {boolean}
     */
    verifyExistActivePlanTypesForApp: function (appPlanTypeStoreId) {
        var activePlanTypes = Floorplan.util.Drawing.getPlanTypesForApp(appPlanTypeStoreId);

        if (activePlanTypes.length === 0) {
            Ext.Msg.alert('', Space.SpaceDownload.noActivePlanTypesFound);
            return false;
        }

        return true;
    },

    updateProgressBar: function () {
        Space.SpaceDownload.progressView.increment();
    },

    doDownloadFloorPlans: function (floorCodes, activePlanTypesOnly, appPlanTypeStoreId) {
        var me = this,
            planTypes,
            message,
            numberOfFloors,
            floorCodesToDownload;

        if (Ext.isEmpty(appPlanTypeStoreId)) {
            planTypes = activePlanTypesOnly ? Floorplan.util.Drawing.getActivePlanTypes() : Floorplan.util.Drawing.getAllPlanTypes();
        } else {
            planTypes = Floorplan.util.Drawing.getPlanTypesForApp(appPlanTypeStoreId);
        }

        if (planTypes.length === 0) {
            message = activePlanTypesOnly ? Space.SpaceDownload.noActivePlanTypesFound : Space.SpaceDownload.noPlanTypesFound;
            return Promise.reject(message);
        } else {
            floorCodesToDownload = floorCodes;
            numberOfFloors = floorCodes.length;

            if (numberOfFloors === 0) {
                return Promise.reject(me.noFloorPlansAvailable);
            } else {
                return Space.SpaceDownload.checkFloorPlanDownloadLimitAndContinue(numberOfFloors)
                    .then(function (continueDownload) {
                        if (continueDownload) {
                            Space.SpaceDownload.displayProgressBar(numberOfFloors);
                            return Floorplan.util.Floorplan.getDrawingsForFloors(floorCodesToDownload, planTypes, Space.SpaceDownload.updateProgressBar)
                                .then(function (numberOfFloorPlansDownloaded) {
                                    var downloadMessage = Ext.String.format(me.numberOfFloorPlansDownloadedMessage, numberOfFloorPlansDownloaded);
                                    Ext.Msg.alert('', downloadMessage);
                                    return Promise.resolve();
                                }, function (numberOfFloorPlansDownloaded) {
                                    // TODO: Handling the cancel action here means that we swallow any rejection handlers.
                                    var downloadMessage = Ext.String.format(me.numberOfFloorPlansDownloadedMessage, numberOfFloorPlansDownloaded),
                                        message = me.cancelMessage + '<br>' + downloadMessage;
                                    Floorplan.util.Floorplan.isDownloadCancelled = false;
                                    Ext.Msg.alert('', message);
                                    return Promise.resolve();
                                });
                        } else {
                            return Promise.resolve();
                        }
                    });
            }
        }
    },

    /**
     * Retrieves floor codes from the BuildingFloors view.
     * @param filter {Object} Restricts the returned recordset. The applied filter
     * is determined by the selected location that the download action is initiated from.
     * @return {Promise} A Promise resolved to an array of Floor Codes
     */
    getFloorCodes: function (filter) {
        var me = this,
            buildingFloorStore = Ext.getStore('buildingFloorsStore'),
            floorCodes;

        return buildingFloorStore.retrieveAllRecords(filter)
            .then(function (records) {
                floorCodes = Ext.Array.map(records, function (record) {
                    return {
                        bl_id: record.data.bl_id,
                        fl_id: record.data.fl_id
                    };
                }, me);
                return Promise.resolve(floorCodes);
            });
    },

    /**
     * Displays a warning message if the number of floor plans to download exceeds the NUMBER_OF_PLANS_WARNING
     * number
     * @deprecated Use checkFloorPlanDownloadLimitAndContinue instead
     * @param {Number} numberOfPlans The number of floor plans to download. This is the number of floors * the
     * number of active plan types
     * @param {Function} callback called when the message is acknowledged
     * @param {Object} scope The scope to execute the callback function.
     */
    checkNumberOfFloorPlansToDownload: function (numberOfPlans, callback, scope) {
        var me = this, message;

        if (numberOfPlans < me.NUMBER_OF_PLANS_WARNING) {
            Ext.callback(callback, scope || me, [true]);
        } else {
            message = me.downloadFloorPlanMessage.replace('{0}', numberOfPlans);
            Ext.Msg.confirm(me.downloadFloorPlansTitle, message, function (buttonId) {
                var returnVal = buttonId === 'yes';
                Ext.callback(callback, scope || me, [returnVal]);
            });
        }
    },

    /**
     *
     * @param {Number} numberOfFloors The number of floors to download floor plans for.
     * @returns {Promise} A Promise that resovles to true if the number of floor plans is less than the limit.
     * The Promise resolves to true if the number of floor plans exceeds the limit but the user decides to proceed.
     */
    checkFloorPlanDownloadLimitAndContinue: function (numberOfPlans) {
        var me = this;
        return new Promise(function (resolve) {
            var message;

            if (numberOfPlans < me.NUMBER_OF_PLANS_WARNING) {
                resolve(true);
            } else {
                message = me.downloadFloorPlanMessage.replace('{0}', numberOfPlans);
                Ext.Msg.confirm(me.downloadFloorPlansTitle, message, function (buttonId) {
                    resolve(buttonId === 'yes');
                });
            }
        });
    },

    displayProgressBar: function (maxValue) {
        var me = this,
            progressMessage = LocaleManager.getLocalizedString('Loading Plans for Floor {0} of {1}', 'Space.SpaceDownload');

        if (!me.progressView) {
            me.progressView = Ext.create('Common.view.panel.ProgressBar', {
                value: 0,
                maxValue: maxValue,
                progressMessage: progressMessage
            });
            Ext.Viewport.add(this.progressView);
        } else {
            me.progressView.setProgressMessage(progressMessage);
            me.progressView.setValue(0);
            me.progressView.setMaxValue(maxValue);
            me.progressView.setCancelled(false);
        }
        me.progressView.show();
    },

    onCancelProgress: function () {
        var me = this;

        me.cancelDownload();
        me.hideProgressView();
    },

    onCompleteProgress: function () {
        this.hideProgressView();
    },

    hideProgressView: function () {
        if (this.progressView) {
            this.progressView.hide();
        }
    }

});