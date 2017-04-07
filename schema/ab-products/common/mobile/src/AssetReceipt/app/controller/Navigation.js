Ext.define('AssetReceipt.controller.Navigation', {
    extend: 'Common.controller.NavigationController',

    config: {
        refs: {
            mainView: 'assetReceiptMain',
            homeButton: 'button[action=goToHomePage]',
            optionsPanel: 'optionsPanel',
            searchAssetField: 'optionsPanel searchScanField',
            inventoryList: 'inventoryList',
            equipmentList: 'equipmentList',
            editEquipmentPanel: 'editEquipmentPanel',
            commonDataPanel: 'commonDataPanel',
            sortEquipmentField: 'selectfield[name=sortEquipmentField]',
            lastNumberField: 'commonDataPanel arrowTextField[name=getLastNumber]',
            startNumberField: 'commonDataPanel commontextfield[name=startNumber]',
            totalCountField: 'commonDataPanel formattednumberfield[name=totalCount]',
            prefixField: 'commonDataPanel commontextfield[name=prefix]',
            methodSelectField: 'commonDataPanel selectfield[name=method]',
            eqIdField: 'editEquipmentPanel barcodefield[name=eq_id]',
            editSiteField: 'editEquipmentPanel sitePrompt',
            editBlField: 'editEquipmentPanel buildingPrompt',
            commonSiteField: 'commonDataPanel sitePrompt',
            commonBlField: 'commonDataPanel buildingPrompt',
            cancelButton: 'editEquipmentPanel button[itemId=cancelButton]',
            equipmentCheckbox: 'checkboxfield[name=equipmentCheckbox]',
            selectAllAssetsCheckbox: 'checkboxfield[name=selectAllAssets]',
            deleteSelectedAssetsButton: 'button[name=deleteSelectedAssets]',
            equipmentStandardPrompt: 'equipmentStandardPrompt',
            equipmentStandardDeleteBtn: 'button[name=eqstdDeleteBtn]'
        },

        control: {
            homeButton: {
                tap: 'onGoToHomePage'
            },
            'button[action=openDownloadDataView]': {
                tap: 'openDownloadDataView'
            },
            'optionsPanel searchScanField iconbutton[action=search]': {
                iconbuttontap: 'searchAsset'
            },
            'optionsPanel searchScanField search': {
                scancomplete: 'searchAsset'
            },
            'optionsPanel searchScanField search searchfield': {
                keyup: function (field) {
                    // set searchScanField max length for searching eq_id values
                    var maxEqIdLength = this.getEqIdMaxLength(),
                        value = field.getValue();

                    if (value.length > maxEqIdLength) {
                        value = value.substr(0, maxEqIdLength);
                        field.setValue(value);
                    }
                }
            },
            'button[action=addNewAsset]': {
                tap: 'displayAddNewAssetView'
            },
            'button[action=addManyAssets]': {
                tap: 'displayCommonDataView'
            },
            'button[action=showInventory]': {
                tap: function () {
                    this.displayInventoryList();
                }
            },
            sortEquipmentField: {
                initialize: 'onApplySortEq',
                change: 'onApplySortEq'
            },
            'inventoryList search': {
                searchkeyup: function (value) {
                    AssetReceiptFilter.onSearchInList(value, 'assetReceiptEquipment',
                        ['eq_id', 'eq_std']);
                },
                searchclearicontap: function () {
                    AssetReceiptFilter.onClearSearchInList('assetReceiptEquipment');
                }
            },
            lastNumberField: {
                fieldTapped: 'setLastNumber'
            },
            eqIdField: {
                change: 'onEqIdChange',
                keyup: function (field) {
                    var value = field.getValue(),
                        upperCaseValue = value.toUpperCase();
                    if (value !== upperCaseValue) {
                        field.setValue(upperCaseValue);
                    }
                },
                scancomplete: function (scanresult) {
                    var value = scanresult.code,
                        eqIdField = this.getEqIdField(),
                        maxLength = eqIdField.getMaxLength();

                    if (value.length > maxLength) {
                        Ext.Msg.confirm('', Ext.String.format(this.getCodeTooBigMsg(), maxLength), function (buttonId) {
                            if (buttonId === 'yes') {
                                eqIdField.setValue(value.substr(0, maxLength));
                            } else {
                                eqIdField.setValue('');
                            }
                        });
                    }
                },
                nexticontap: function (field) {
                    var me = this,
                        prefix = field.getValue(),
                        nextId;

                    me.getLastNumber(prefix, function (lastId) {
                        nextId = me.getNextId(lastId, prefix);
                        field.setValue(nextId);
                    });
                }
            },
            prefixField: {
                keyup: function (field) {
                    this.onPrefixChange(field.getValue());
                },
                clearicontap: function () {
                    this.onPrefixChange('');
                }
            },
            'button[action=startAddManyAssets]': {
                tap: 'startAddManyAssets'
            },
            editSiteField: {
                promptTapped: function () {
                    AssetReceiptFilter.filterSiteStore();
                }
            },
            editBlField: {
                promptTapped: function () {
                    AssetReceiptFilter.filterBlStore();
                }
            },
            commonSiteField: {
                promptTapped: function () {
                    AssetReceiptFilter.filterSiteStore();
                }
            },
            commonBlField: {
                promptTapped: function () {
                    AssetReceiptFilter.filterBlStore();
                }
            },
            cancelButton: {
                tap: function () {
                    var me = this,
                        addView = me.getEditEquipmentPanel(),
                        currentCount = addView.getCurrentCount(),
                        msg,
                        countIndicator = addView.down('container[itemId=countIndicator]');

                    if (countIndicator && !countIndicator.getHidden()) {
                        // current count starts from 1
                        if (currentCount === 1) {
                            msg = me.getCancelAssetRegistrationNoRecords();
                        } else {
                            msg = Ext.String.format(me.getCancelAssetRegistration(), 1, currentCount - 1);
                        }

                        Ext.Msg.confirm('', msg, function (buttonId) {
                            if (buttonId === 'yes') {
                                Ext.Viewport.remove(addView, true);
                            }
                        });
                    } else {
                        // only one asset is added
                        Ext.Viewport.remove(addView, true);
                    }

                }
            },
            'button[action=deleteAsset]': {
                tap: 'deleteAssetButtonTap'
            },
            equipmentCheckbox: {
                check: 'onAssetCheckboxChanged',
                uncheck: 'onAssetCheckboxChanged'
            },
            selectAllAssetsCheckbox: {
                check: 'onAssetsCheckboxAllChanged',
                uncheck: 'onAssetsCheckboxAllChanged'
            },
            deleteSelectedAssetsButton: {
                itemselected: 'deleteAssets'
            },
            equipmentStandardPrompt: {
                promptTapped: 'displayListEqstdView',
                addNewEqstd: 'displayAddEqstdView'
            },
            equipmentStandardDeleteBtn: {
                tap: 'deleteEquipmentStandard'
            }
        },

        eqInInventoryMsg: LocaleManager.getLocalizedString('Equipment with code {0} already exists in inventory.', 'AssetReceipt.controller.Navigation'),
        eqNotInInventoryMsg: LocaleManager.getLocalizedString('Equipment with code {0} does not exist in inventory.', 'AssetReceipt.controller.Navigation'),
        errorMsgTitle: LocaleManager.getLocalizedString('Error', 'AssetReceipt.controller.Navigation'),
        errorMsg: LocaleManager.getLocalizedString('An error occured while quering the database.', 'AssetReceipt.controller.Navigation'),
        addEquipmentTitle: LocaleManager.getLocalizedString('Add Equipment', 'AssetReceipt.controller.Navigation'),
        wfrErrorMsg: LocaleManager.getLocalizedString('An error occured while executing the workflow rule.', 'AssetReceipt.controller.Navigation'),
        selectTotalCountMsg: LocaleManager.getLocalizedString('You need to set the number of assets you want to add. Please fill the value for Total Count.', 'AssetReceipt.controller.Navigation'),
        selectStartNumberMsg: LocaleManager.getLocalizedString('You need to set the code for the first asset. Please fill the value for Start Number.', 'AssetReceipt.controller.Navigation'),
        rejectedEqIdsMsg: LocaleManager.getLocalizedString('You have already added equipment with the following codes: {0}', 'AssetReceipt.controller.Navigation'),
        rejectedEqstdIdsMsg: LocaleManager.getLocalizedString('This equipment standard already exists: {0}', 'AssetReceipt.controller.Navigation'),
        codeTooBigMsg: LocaleManager.getLocalizedString('Only asset codes with {0} characters or less are supported. Codes with more than {0} characters will be truncated.', 'AssetReceipt.controller.Navigation'),
        emptySearchFieldMsg: LocaleManager.getLocalizedString('Enter an equipment code first.', 'AssetReceipt.controller.Navigation'),
        noEqIdFound: LocaleManager.getLocalizedString('No equipment found for selected prefix.', 'AssetReceipt.controller.Navigation'),
        lastNumberNotTapped: LocaleManager.getLocalizedString('Please select Get Last Number field to verify there are no existing records for the selected Prefix. Trying to create records with existing values will generate errors.', 'AssetReceipt.controller.Navigation'),
        cancelAssetRegistration: LocaleManager.getLocalizedString('The records numbered {0} - {1} have been created and no additional records will be created. Proceed with cancel action?', 'AssetReceipt.controller.Navigation'),
        cancelAssetRegistrationNoRecords: LocaleManager.getLocalizedString('No records have been created and no additional records will be created. Proceed with cancel action?', 'AssetReceipt.controller.Navigation'),
        deleteTitle: LocaleManager.getLocalizedString('Delete', 'AssetReceipt.controller.Navigation'),
        deleteAssetMsg: LocaleManager.getLocalizedString('Delete asset?', 'AssetReceipt.controller.Navigation'),
        deleteSelectedAssetsMsg: LocaleManager.getLocalizedString('Delete selected asset(s)?', 'AssetReceipt.controller.Navigation'),
        deleteAllAssetsMsg: LocaleManager.getLocalizedString('Delete ALL assets?', 'AssetReceipt.controller.Navigation'),
        deleteEqstdMsg: LocaleManager.getLocalizedString('Delete equipment standard?', 'AssetReceipt.controller.Navigation'),
        existsEqWithEqstd: LocaleManager.getLocalizedString('This standard cannot be deleted because there are equipment items registered with this standard.', 'AssetReceipt.controller.Navigation'),

        rejectedEqIds: []
    },

    onGoToHomePage: function () {
        this.getMainView().reset();
    },

    openDownloadDataView: function () {
        var backgroundDataFilter = Ext.create('AssetReceipt.view.BackgroundDataFilter');

        this.getMainView().push(backgroundDataFilter);
    },

    onViewPushed: function (mainView, pushedView) {
        var addButton = this.getNavigationBar().getAddButton();

        this.callParent(arguments);

        addButton.setHidden(pushedView.xtype !== 'inventoryList');

        this.getHomeButton().setHidden(pushedView.xtype === 'commonDataPanel');
    },

    onViewPopped: function () {
        var navBar = this.getNavigationBar(),
            currentView = navBar.getCurrentView(),
            addButton = navBar.getAddButton();

        addButton.setHidden(currentView.xtype !== 'inventoryList');

        this.getHomeButton().setHidden(currentView.xtype === 'commonDataPanel' || currentView.xtype === 'assetReceiptMain');
    },

    displayAddPanel: function () {
        this.displayAddNewAssetView();
    },

    searchAsset: function () {
        var me = this,
            assetSearchField = me.getSearchAssetField(),
            searchInput = assetSearchField.down('search'),
            searchButton,
            assetId,
            msg,
            maxEqIdLength,
            searchEqIdOnServer = function () {
                Network.checkNetworkConnectionAndDisplayMessageAsync(function (isConnected) {
                    if (isConnected) {
                        Workflow.callMethodAsync('AbAssetEAM-AssetReceiptService-verifyExistsAsset',
                            ['eq', assetId], Network.SERVICE_TIMEOUT, function (success, errorMsg, result) {
                                if (success) {
                                    if (result.value) {
                                        msg = Ext.String.format(me.getEqInInventoryMsg(), assetId);
                                    } else {
                                        msg = Ext.String.format(me.getEqNotInInventoryMsg(), assetId);
                                    }
                                    Ext.Msg.alert('', msg);
                                } else {
                                    Ext.Msg.alert(me.getErrorMsgTitle(), me.getErrorMsg());
                                }
                            });
                    }
                }, me);
            };

        if (assetSearchField) {
            // if search is disabled exist search function
            searchButton = assetSearchField.down('iconbutton[action=search]');
            if (searchButton && searchButton.getDisabled()) {
                return;
            }

            assetId = assetSearchField.getValue();
            if (Ext.isEmpty(assetId)) {
                Ext.Msg.alert('', me.getEmptySearchFieldMsg());
                return;
            }

            maxEqIdLength = me.getEqIdMaxLength();
            if (assetId.length > maxEqIdLength) {
                Ext.Msg.confirm('', Ext.String.format(me.getCodeTooBigMsg(), maxEqIdLength), function (buttonId) {
                    if (buttonId === 'yes') {
                        assetId = assetId.substr(0, maxEqIdLength);
                        searchInput.setValue(assetId);
                        searchEqIdOnServer();
                    } else {
                        searchInput.setValue('');
                    }
                });
            } else {
                searchEqIdOnServer();
            }
        }
    },

    displayAddNewAssetView: function (record, totalCount, currentCount) {
        var currentView = this.getNavigationBar().getCurrentView(),
            view,
            viewRecord,
            saveButton,
            nextText = LocaleManager.getLocalizedString('Next', 'AssetReceipt.controller.Navigation'),
            doneText = LocaleManager.getLocalizedString('Done', 'AssetReceipt.controller.Navigation');

        currentView.config.addViewClass = 'AssetReceipt.view.EditEquipment';

        view = this.getModalAddPanel(currentView, {title: this.getAddEquipmentTitle()});

        // remove standard cancel button tap action handler because custom handler is used
        view.query('button[itemId=cancelButton]')[0].clearListeners();

        if (Ext.isEmpty(record) || !(record instanceof AssetReceipt.model.AssetReceiptEquipment)) {
            viewRecord = view.getRecord();

            if (viewRecord) {
                // set default values
                viewRecord.set('status', 'miss');
                view.setRecord(viewRecord);
            }

        } else {
            //set totalCount and currentCount before setting the record because these values are used in applyRecord function in the view
            view.setTotalCount(totalCount);
            view.setCurrentCount(currentCount);
            view.down('container[itemId=countIndicator]').setHidden(false);
            view.setRecord(record);

            saveButton = view.down('button[itemId=saveButton]');
            if (totalCount > currentCount) {
                saveButton.setText(nextText);
                saveButton.setIconCls('');
            } else {
                saveButton.setText(doneText);
                saveButton.setIconCls('');
            }
        }

        Ext.Viewport.add(view);
        view.show();
    },

    /**
     * Override to set the Auto Sync property to false before syncing the record
     * This is needed to prevent the record from being adding to the data base twice.
     * Saves the contents of the Edit Panel to the database Validates and displays validation errors on
     * the Edit Panel
     *
     * @param {Common.view.navigation.EditBase/Common.view.navigation.ListBase} currentView
     * The currently displayed view.
     */
    saveEditPanel: function (currentView) {
        var me = this,
            record = currentView.getRecord(),
            store = Ext.getStore(currentView.getStoreId()),
            navCurrentView = this.getNavigationBar().getCurrentView(),
            eqRecord,
            closeViewDisplayList = function () {
                if (navCurrentView.xtype !== 'inventoryList') {
                    me.displayInventoryList(function () {
                        Ext.Viewport.remove(currentView);
                    }, me);
                } else {
                    Ext.Viewport.remove(currentView);
                }
            };

        // Check validation
        if (record.isValid()) {
            if (record instanceof AssetReceipt.model.EquipmentStandardSync) {
                me.verifyEqStd(record.get('eq_std'), record.getId(), function () {
                    // add new eqstd record
                    record.setChangedOnMobile();
                    store.setAutoSync(false);
                    store.add(record);
                    store.sync(function () {
                        store.setAutoSync(true);
                        //load the store to display the new record in the correct order
                        store.load(function () {
                            Ext.Viewport.remove(currentView);
                        });
                    });
                }, me);
            } else {
                // add new eq record
                me.verifyEqId(record.get('eq_id'), record.getId(), function () {
                    record.setChangedOnMobile();
                    store.setAutoSync(false);
                    store.add(record);
                    store.sync(function () {
                        store.setAutoSync(true);
                        AssetReceiptFilter.filterEqListStore(function () {
                            if (currentView.getIsCreateView()) {
                                if (Ext.isFunction(currentView.getTotalCount) && currentView.getTotalCount() > 0) {
                                    if (currentView.getTotalCount() > currentView.getCurrentCount()) {
                                        eqRecord = this.createNewEqRecord(currentView.getRecord());
                                        this.displayAddNewAssetView(eqRecord, currentView.getTotalCount(), currentView.getCurrentCount() + 1);
                                        Ext.Viewport.remove(currentView);
                                    } else {
                                        closeViewDisplayList();
                                    }
                                } else {
                                    closeViewDisplayList();
                                }
                            } else {
                                me.getMainView().pop();
                            }
                        }, me);
                    });
                }, me);
            }
        } else {
            currentView.displayErrors(record);
        }
    },

    displayInventoryList: function (callbackFn, scope) {
        var me = this,
            view = Ext.create('AssetReceipt.view.InventoryList');

        AssetReceiptFilter.filterEqListStore(function () {
            me.getMainView().push(view);
            Ext.callback(callbackFn, scope || me);
        }, me);

    },

    /**
     * Applies the selected sort to the store.
     */
    onApplySortEq: function (field, value) {
        var equipmentStore = Ext.getStore('assetReceiptEquipment');

        switch (value) {
            case 'location':
                equipmentStore.setSorters(equipmentStore.getSortByLocation());
                break;

            case 'owner':
                equipmentStore.setSorters(equipmentStore.getSortByOwner());
                break;

            case 'standard':
                equipmentStore.setSorters(equipmentStore.getSortByStandard());
                break;

            // The location case is the default.
            default:
                equipmentStore.setSorters(equipmentStore.getSortByLocation());
                break;
        }

        equipmentStore.loadPage(1);
    },

    displayCommonDataView: function () {
        var view = Ext.create('AssetReceipt.view.CommonData');

        this.getMainView().push(view);
    },

    setLastNumber: function () {
        var me = this,
            prefixField = me.getPrefixField(),
            prefix = '';

        if (me.getMethodSelectField() && me.getMethodSelectField().getValue() === 'scan') {
            return;
        }

        this.getCommonDataPanel().setLastNumberTapped(true);

        if (prefixField && !Ext.isEmpty(prefixField.getValue())) {
            prefix = prefixField.getValue();
        }

        me.getLastNumber(prefix, function (lastId) {
            me.setLastNumberFieldValue(lastId, prefix);
        });
    },

    getLastNumber: function (prefix, callbackFn) {
        var me = this,
            lastId,
            searchMsg = LocaleManager.getLocalizedString('Searching', 'AssetReceipt.controller.AssetReceiptSync'),

            promiseChain = function () {
                Mask.displayLoadingMask(searchMsg);
                return new Promise(function (resolve, reject) {
                    Common.service.workflow.Workflow.execute('AbAssetEAM-AssetReceiptService-getLastId', ['eq', prefix])
                        .then(function (result) {
                            lastId = result.message;
                            if (Ext.isEmpty(lastId)) {
                                Ext.Msg.alert('', me.getNoEqIdFound());
                            }
                            Mask.hideLoadingMask();
                            resolve();
                        }, function (error) {
                            console.log('[ERROR]' + error);
                            Mask.hideLoadingMask();
                            reject(me.getErrorMsgTitle(), me.getWfrErrorMsg());
                        });
                });
            };

        return Network.checkNetworkConnectionAndDisplayMessage()
            .then(function (isConnected) {
                if (isConnected) {
                    SyncManager.doInSession(promiseChain, false)
                        .then(function () {
                            callbackFn(lastId);
                        });
                }
            });
    },

    setLastNumberFieldValue: function (lastId, prefix) {
        var nextId;

        this.getLastNumberField().setValue(lastId);

        nextId = this.getNextId(lastId, prefix);

        this.getStartNumberField().setValue(nextId);
    },

    // if last id ends with numbers increment those to create the start id, else add '000001' to create the start id.
    getNextId: function (lastId, enteredPrefix) {
        var regex = /[^0-9]*([0-9]+)$/g,
            matchResult,
            match,
            prefix,
            nextId,
            nextNumber;

        if (lastId.match(regex)) {
            match = regex.exec(lastId);
            matchResult = match[1];
            nextNumber = (parseInt(matchResult) + 1).toString();
            prefix = lastId.substr(0, lastId.length - matchResult.length);
            if (Ext.isEmpty(prefix)) {
                prefix = lastId.substr(0, lastId.length - matchResult.length);
            }
            //add leading zeros
            while (matchResult.length > nextNumber.length) {
                nextNumber = '0' + nextNumber;
            }
            nextId = prefix + nextNumber;
        } else {
            if (Ext.isEmpty(lastId)) {
                nextId = enteredPrefix + '000001';
            } else {
                nextId = lastId + '000001';
            }
        }

        return nextId;
    },

    displayUpdatePanel: function (view, record) {
        var editView = view.getEditViewClass(),
            updateView = Ext.create(editView);

        // necessary for seeting the status value on edit asset
        updateView.setRecord(record);

        this.getMainView().push(updateView);
    },

    onEqIdChange: function (field, value) {
        var me = this,
            record = this.getEditEquipmentPanel().getRecord(),
            mobAction,
            oldRecord,
            oldValue,
            eqStore = Ext.getStore('assetReceiptEquipment');

        if (record) {
            mobAction = record.get('mob_action');
            oldValue = record.get('eq_id');
            me.verifyEqId(value, record.getId(), function () {

                // When the user modifies the eq_id value on the client and the mob_action field is ERROR set mob_action to DELETE.
                // Then you create a copy of the record using the new eq_id with the mob_action value set to INSERT.
                // value si empty when the clear icon is tapped and there is no need to set mob_action until a new value is set
                if (mobAction && mobAction.toUpperCase() === 'ERROR' && !Ext.isEmpty(value)) {
                    eqStore.setAutoSync(false);

                    record.set('mob_action', 'INSERT');
                    record.set('eq_id', value);
                    eqStore.add(record);

                    oldRecord = me.getNewEqRecord(record);
                    oldRecord.set('mob_action', 'DELETE');
                    oldRecord.set('eq_id', oldValue);
                    eqStore.add(oldRecord);

                    eqStore.sync(function () {
                        eqStore.setAutoSync(true);
                        // filter and load equipment store
                        AssetReceiptFilter.filterEqListStore();
                    });
                }
            }, me);
        }
    },

    onPrefixChange: function (value) {
        var startNumberField = this.getStartNumberField(),
            regex = /[^0-9]*([0-9]+)$/g;

        if (startNumberField) {
            if (!Ext.isEmpty(value) && !value.match(regex)) {
                value = value + "000001";
            }
            startNumberField.setValue(value);
        }
    },

    getNewEqRecord: function (record) {
        var fields = Ext.getStore('assetReceiptEquipment').serverFieldNames,
            newRecord = Ext.create('AssetReceipt.model.AssetReceiptEquipment'),
            i;

        for (i = 0; i < fields.length; i++) {
            newRecord.set(fields[i], record.get(fields[i]));
        }

        return newRecord;
    },

    startAddManyAssets: function () {
        var parameters = this.getParametersObject(),
            commonData = this.getCommonDataObject();

        if (this.getMethodSelectField() && this.getMethodSelectField().getValue() === 'scan') {
            this.startScanManyAssets(parameters, commonData);
        } else {
            if (this.getCommonDataPanel().getLastNumberTapped()) {
                this.generateManyAssets(parameters, commonData);
            } else {
                Ext.Msg.alert('', this.getLastNumberNotTapped());
            }
        }
    },

    getParametersObject: function () {
        var parameters = {},
            lastNumberValue,
            startNumberValue,
            totalCountValue,
            prefixValue;

        lastNumberValue = this.getLastNumberField().getValue();
        parameters.getLastNumber = lastNumberValue;

        startNumberValue = this.getStartNumberField().getValue();
        parameters.startNumber = startNumberValue;

        totalCountValue = this.getTotalCountField().getValue();
        parameters.totalCount = totalCountValue;

        prefixValue = this.getPrefixField().getValue();
        parameters.prefix = prefixValue;

        return parameters;
    },

    getCommonDataObject: function () {
        var commonData = {},
            form = this.getCommonDataPanel(),
            field,
            fieldName,
            fieldNames = ['eq_std', 'status', 'site_id', 'bl_id', 'fl_id', 'rm_id', 'dv_id', 'dp_id', 'em_id', 'survey_comments'],
            i;

        for (i = 0; i < fieldNames.length; i++) {
            fieldName = fieldNames[i];
            field = form.down('textfield[name=' + fieldName + ']');
            commonData[fieldName] = field.getValue();
        }

        return commonData;
    },

    startScanManyAssets: function (parameters, commonData) {
        var totalCount = parameters.totalCount,
            eqRecord;

        if (Ext.isNumeric(totalCount) && totalCount > 0) {
            eqRecord = this.createNewEqRecord(commonData);
            this.displayAddNewAssetView(eqRecord, totalCount, 1);
        } else {
            Ext.Msg.alert('', this.getSelectTotalCountMsg());
        }
    },

    generateManyAssets: function (parameters, commonData) {
        var me = this,
            eqId,
            eqStore = Ext.getStore('assetReceiptEquipment'),
            listView,
            listSearchField;

        // verify user set total count and start number
        if (!Ext.isNumeric(parameters.totalCount) || parameters.totalCount <= 0) {
            Ext.Msg.alert('', me.getSelectTotalCountMsg());
            return;
        }
        if (Ext.isEmpty(parameters.startNumber)) {
            Ext.Msg.alert('', me.getSelectStartNumberMsg());
            return;
        }

        // generate eq records and add them in the store
        eqStore.setAutoSync(false);
        eqId = parameters.startNumber;
        me.displayAddManyProgressBar(parameters.totalCount);

        me.addEqRecord(parameters, commonData, eqId, 1, eqStore, function () {
            eqStore.setAutoSync(true);
            eqStore.load(function () {
                if (me.getRejectedEqIds().length > 0) {
                    Ext.Msg.alert('', Ext.String.format(me.getRejectedEqIdsMsg(), me.getRejectedEqIds().join(', ')));
                    me.setRejectedEqIds([]);
                }

                // display the inventory list containing the new records
                me.displayInventoryList(function () {
                    // filter the inventory list to display newly added assets (KB3049917)
                    listView = me.getInventoryList();
                    if (!Ext.isEmpty(parameters.prefix) && !Ext.isEmpty(listView) && listView.xtype === 'inventoryList') {
                        listSearchField = listView.down('search[name=searchAsset]');
                        listSearchField.setValue(parameters.prefix);
                        listSearchField.fireEvent('searchkeyup', parameters.prefix, listSearchField);
                        listSearchField.addValueToHistory(parameters.prefix);
                    }
                }, me);
            });
        }, me);
    },

    addEqRecord: function (parameters, commonData, eqId, currentCount, eqStore, callbackFn, scope) {
        var me = this,
            eqRecord,
            regex = /[^0-9]*([0-9]+)$/g,
            filter = AssetReceiptFilter.createFilter('eq_id', eqId),
            complete = function () {
                me.addManyEqProgressView.increment();
                if (parameters.totalCount === currentCount) {
                    Ext.callback(callbackFn, scope);
                } else {
                    eqId = me.getNextId(eqId, parameters.prefix);
                    currentCount++;
                    me.addEqRecord(parameters, commonData, eqId, currentCount, eqStore, callbackFn, scope);
                }
            };

        eqStore.retrieveRecord(filter, function (record) {
            if (record === null) {
                eqRecord = me.createNewEqRecord(commonData);
                if (!eqId.match(regex)) {
                    eqId = me.getNextId(eqId, parameters.prefix);
                }
                eqRecord.set('eq_id', eqId);
                eqRecord.setChangedOnMobile();
                eqStore.add(eqRecord);
                eqStore.sync(function () {
                    complete();
                });
            } else {
                me.getRejectedEqIds().push(eqId);
                complete();
            }
        });
    },

    displayAddManyProgressBar: function (totalCount) {
        var me = this,
            message = LocaleManager.getLocalizedString('Please wait while we generate your new assets:<br/> {0} / {1}', 'AssetReceipt.controller.Navigation');

        me.addManyEqProgressView = Ext.create('Common.view.panel.ProgressBar', {
            value: 0,
            maxValue: totalCount,
            //Set custom message
            progressMessage: message
        });

        me.addManyEqProgressView.addListener('complete', function () {
            this.hide();
            this.setCancelled(true);
        });
        if (me.addManyEqProgressView.getProgressBar().cancelBtn) {
            me.addManyEqProgressView.getProgressBar().cancelBtn.dom.style.display = "none";
        }
        Ext.Viewport.add(me.addManyEqProgressView);
        me.addManyEqProgressView.show();
    },

    /**
     * Create a new instance of AssetReceipt.model.AssetReceiptEquipment and set the field values from the object.
     * The object can contain the values form Common Data view or it can be the record from the previous add panel.
     * @param object record or common data object
     * @returns {AssetReceipt.model.AssetReceiptEquipment}
     */
    createNewEqRecord: function (object) {
        var record = Ext.create('AssetReceipt.model.AssetReceiptEquipment'),
            fieldNames = ['eq_std', 'status', 'site_id', 'bl_id', 'fl_id', 'rm_id', 'dv_id', 'dp_id', 'em_id', 'survey_comments'],
            i,
            isEqRecord = object instanceof AssetReceipt.model.AssetReceiptEquipment;

        for (i = 0; i < fieldNames.length; i++) {
            if (isEqRecord) {
                record.set(fieldNames[i], object.get(fieldNames[i]));
            } else {
                record.set(fieldNames[i], object[fieldNames[i]]);
            }
        }

        return record;
    },

    verifyEqId: function (eqId, recordId, isNewIdFn, scope) {
        var me = this,
            eqStore = Ext.getStore('assetReceiptEquipment'),
            filter,
            maxEqIdLength = me.getEqIdMaxLength();

        if (eqId.length > maxEqIdLength) {
            eqId = eqId.substr(0, maxEqIdLength);
        }

        filter = AssetReceiptFilter.createFilter('eq_id', eqId);
        eqStore.retrieveRecord(filter, function (record) {
            if (record === null || record.getId() === recordId) {
                Ext.callback(isNewIdFn, scope);
            } else {
                Ext.Msg.alert('', Ext.String.format(me.getRejectedEqIdsMsg(), eqId));
            }
        }, me);
    },

    verifyEqStd: function (eqstd, recordId, isNewEqstdFn, scope) {
        var me = this,
            eqstdStore = Ext.getStore('equipmentStandardsSyncStore'),
            filter;

        filter = AssetReceiptFilter.createFilter('eq_std', eqstd);
        eqstdStore.retrieveRecord(filter, function (record) {
            if (record === null || record.getId() === recordId) {
                Ext.callback(isNewEqstdFn, scope);
            } else {
                Ext.Msg.alert('', Ext.String.format(me.getRejectedEqstdIdsMsg(), eqstd));
            }
        }, me);
    },

    deleteAssetButtonTap: function (button) {
        var me = this,
            record = button.getRecord();

        Ext.Msg.confirm(me.getDeleteTitle(), me.getDeleteAssetMsg(),
            function (buttonId) {
                if (buttonId === 'yes') {
                    return me.deleteEquipment(record)
                        .then(function () {
                            return new Promise(function (resolve) {
                                me.getMainView().pop();
                                resolve();
                            });
                        });
                }
            }, me);
    },

    /**
     * Delete an equipment and return a Promise object after sync.
     * @param record
     * @returns {Promise} A Promise object
     */
    deleteEquipment: function (record) {
        var assetStore = Ext.getStore('assetReceiptEquipment'),
            mobileId,
            filterArray = [];

        mobileId = record.getId();
        filterArray.push(Ext.create('Common.util.Filter', {
            property: 'id',
            value: mobileId,
            conjunction: 'AND',
            exactMatch: true
        }));

        return assetStore.retrieveAllRecords(filterArray)
            .then(function (records) {
                if (records.length !== 0) {
                    assetStore.remove(records[0]);
                    return new Promise(function (resolve) {
                        assetStore.sync(resolve);
                    });
                } else {
                    return new Promise(function (resolve) {
                        resolve();
                    });
                }
            });
    },

    onAssetCheckboxChanged: function (chekcboxField, event) {
        if (!Ext.isEmpty(event)) {
            event.stopPropagation();
            event.preventDefault();
        }
    },

    /**
     * Checks/unchecks all the checkboxes of the inventory list ("equipmentCheckbox" checkboxes)
     * @param checkboxField
     */
    onAssetsCheckboxAllChanged: function (checkboxField) {
        var checked = checkboxField.getChecked(),
            equipmentList = this.getEquipmentList(),
            equipmentCheckboxes = equipmentList.query('checkboxfield[name=equipmentCheckbox]');

        if (checkboxField.eventsSuspended) {
            return;
        }

        Ext.each(equipmentCheckboxes, function (checkbox) {
            if (checked) {
                checkbox.check();
            } else {
                checkbox.uncheck();
            }
        });
    },

    deleteAssets: function (optionItem) {
        var me = this,
            option = optionItem.get('action'),
            equipmentList = this.getEquipmentList(),
            equipmentItems = equipmentList.query('equipmentListItem'),
            assetStore = Ext.getStore('assetReceiptEquipment');

        if (option === 'deleteSelectedAssets') {
            Ext.Msg.confirm(me.getDeleteTitle(), me.getDeleteSelectedAssetsMsg(),
                function (buttonId) {
                    if (buttonId === 'yes') {
                        me.deleteEquipmentItems(equipmentItems);
                    }
                });
        } else {
            Ext.Msg.confirm(me.getDeleteTitle(), me.getDeleteAllAssetsMsg(),
                function (buttonId) {
                    if (buttonId === 'yes') {
                        assetStore.removeAll();
                        assetStore.sync();
                    }
                });
        }
    },

    deleteEquipmentItems: function (equipmentItems) {
        var ids = [],
            equipmentRecord,
            equipmentCheckbox;

        equipmentItems.forEach(function (equipmentItem) {
            equipmentRecord = equipmentItem.getRecord();
            equipmentCheckbox = equipmentItem.down('checkboxfield[name=equipmentCheckbox]');

            if (!Ext.isEmpty(equipmentRecord) && !Ext.isEmpty(equipmentCheckbox) && equipmentCheckbox.getChecked() === true) {
                ids.push(equipmentRecord.getId());
            }
        });

        this.deleteEquipmentByIds(ids);
    },

    deleteEquipmentByIds: function (ids) {
        var assetStore = Ext.getStore('assetReceiptEquipment'),
            i;

        for (i = 0; i < ids.length; i++) {
            // the record is in the loaded store, otherwise it won't be displayed in the list
            assetStore.remove(assetStore.findRecord('id', ids[i]));
        }

        assetStore.sync();
    },

    getEqIdMaxLength: function () {
        var eqSyncTableDef = TableDef.getTableDefFieldCollection('eq_sync');

        return eqSyncTableDef.get('eq_id').size;
    },

    displayListEqstdView: function (promptField) {
        var listPanel = promptField.getPromptPanel();

        Ext.Viewport.add(listPanel);
        listPanel.show();
    },

    displayAddEqstdView: function () {
        var currentView = this.getEquipmentStandardPrompt().getPromptPanel(),
            addEqstdView,
            record = Ext.create('AssetReceipt.model.EquipmentStandardSync');

        currentView.config.addViewClass = 'AssetReceipt.view.EditEquipmentStandard';
        addEqstdView = this.getModalAddPanel(currentView, {zIndex: 15});

        addEqstdView.setRecord(record);
        Ext.Viewport.add(addEqstdView);
        addEqstdView.show();
    },

    deleteEquipmentStandard: function (button, event) {
        var me = this,
            record = button.getRecord(),
            equipmentStandardsSyncStore = Ext.getStore('equipmentStandardsSyncStore'),
            equipmentStore = Ext.getStore('assetReceiptEquipment'),
            filterArray = [],
            eqStd;

        if (!Ext.isEmpty(event)) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (!Ext.isEmpty(record)) {
            eqStd = record.get('eq_std');
            Ext.Msg.confirm(me.getDeleteTitle(), me.getDeleteEqstdMsg(),
                function (buttonId) {
                    if (buttonId === 'yes') {
                        //verify there are no eq with this standard before deletion
                        filterArray.push(Ext.create('Common.util.Filter', {
                            property: 'eq_std',
                            value: eqStd,
                            exactMatch: true
                        }));

                        return equipmentStore.retrieveAllRecords(filterArray)
                            .then(function (records) {
                                if (records.length !== 0) {
                                    Ext.Msg.alert(me.getErrorMsgTitle(), me.getExistsEqWithEqstd());
                                } else {
                                    equipmentStandardsSyncStore.remove(equipmentStandardsSyncStore.findRecord('eq_std', eqStd));
                                    equipmentStandardsSyncStore.sync(function () {
                                        equipmentStandardsSyncStore.load();
                                    });
                                }
                            });
                    }
                });
        }
    }
});
