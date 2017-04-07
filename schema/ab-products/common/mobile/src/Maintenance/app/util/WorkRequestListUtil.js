/**
 * Holds common functions for the 2 work request lists
 *
 * @author Cristina Reghina
 * @since 21.3
 */
Ext.define('Maintenance.util.WorkRequestListUtil', {
    alternateClassName: ['WorkRequestListUtil'],

    singleton: true,

    /**
     * Stores the craftsperson records for the workrequestManagerList, used by the list's items (workrequestManagerListItem)
     * TODO: find a better way to have the work request craftspersons records in workrequestManagerListItem
     */
    managerWorkRequestListCraftspersons: [],

    /**
     * Filters and shows the Work Request List (workrequestList or workrequestManagerList), according to the parameters
     *
     * @param {Object} mainView
     * @param {String} listType Values: 'MyWork', 'MyRequests', 'Requested', 'Approved', 'Issued', 'Completed'
     * @param {Array} filterArray
     */
    filterAndShowWorkRequestList: function (mainView, listType, filterArray) {
        var me = this,
            currentView = mainView.getNavigationBar().getCurrentView(),
            workRequestListView = mainView.down('workrequestListPanel'),
            //myWorkToolbar = workRequestListView.down('titlebar[itemId=myWorkToolbar]'),
            myWorkToolbar = workRequestListView.down('toolbar[itemId=myWorkToolbar]'),
            workRequestManageListView = workRequestListView.down('workrequestManagerList');

        me.setWorkRequestListTitle(mainView, listType);

        // kb#3046741: only set the store to list when actually determine the user's role and filter and show proper list in sub-tab
        if ( !workRequestManageListView.getStore() ){
            workRequestManageListView.setStore('workRequestsStore');
        }

        //when selecting 'My Request' tab hide the tab's toolbar line
        myWorkToolbar.setHidden(listType === Constants.MyRequests);

        me.showHideMyWorkToolbarItems(myWorkToolbar, listType);

        NavigationUtil.showHideToolbarButtons(mainView, currentView);
        workRequestListView.down('workrequestManagerList').setGrouped(listType !== Constants.MyRequests);

        WorkRequestFilter.clearUserRestriction();
        WorkRequestFilter.applyWorkRequestListFilter(listType, filterArray || [], function () {
            //me.showWorkRequestList(workRequestListView, listType);
        }, me);
    },

    /**
     * Initialize the drop down buttons (button picker)
     * and the filters the work request list according to the default list to show to the user.
     * Supervisor: show all, default = Approved
     * Craftsperson of an "Craftspersons Assign Themselves" work team: show My Work| My Requests | Approved, default = My Work
     * Craftsperson of no "Craftspersons Assign Themselves" work team: show My Work| My Requests, default = My Work
     * Approver: show My Requests | Requested | Approved, default = Requested
     * Step completer: show My Requests | Requested | Approved | Completed, default = Approved
     * Client: My Requests
     *
     * Add tabs if there are work requests for them.
     */
    // TODO: Function is too large. Refactor to fix JSLint errors. JEFFM
    initDropDownButtonsAndWorkRequestList: function (mainView, selectedListType) {
        var me = this,
            userRoleName = ApplicationParameters.getUserRoleName(),
            workRequestsStore = Ext.getStore('workRequestsStore'),
            filterValues = [],
            filterValuesIfWorkRequestsExist = [],
            defaultListType = Constants.MyWork,
            listType,
            numberOfTabsToAdd = 0,
            wrStoreAltered = false,
            addTabIfWorkRequestsExist = function (listTypesToAdd, onCompleted, scope) {
                var wrSavedFilters = null,
                    wrIsPagingDisabled = null,
                    listTypeToAdd,
                    filterArray;

                if (numberOfTabsToAdd === 0) {
                    if (wrStoreAltered) {
                        workRequestsStore.resumeEvents(true);
                        workRequestsStore.setFilters(wrSavedFilters);
                        workRequestsStore.setDisablePaging(wrIsPagingDisabled);
                    }

                    Ext.callback(onCompleted, scope || me);
                    return;
                }

                listTypeToAdd = listTypesToAdd[listTypesToAdd.length - numberOfTabsToAdd];
                filterArray = WorkRequestFilter.getBaseFilterForListType(listTypeToAdd);

                if (numberOfTabsToAdd === listTypesToAdd.length) {
                    wrStoreAltered = true;
                    workRequestsStore.suspendEvents();
                    workRequestsStore.setDisablePaging(true);
                }

                numberOfTabsToAdd--;

                workRequestsStore.clearFilter();
                if (!Ext.isEmpty(filterArray)) {
                    workRequestsStore.setFilters(filterArray);
                }

                workRequestsStore.load(function (records) {
                    if (!Ext.isEmpty(records)) {
                        filterValues.push(listTypeToAdd);
                    }
                    Ext.callback(addTabIfWorkRequestsExist, me, [listTypesToAdd, onCompleted, scope || me]);
                }, me);
            },
            doInit = function () {
                var buttonPicker = mainView.down('workrequestListPanel > toolbar[docked=bottom] > buttonpicker'),
                    dropDownButtonsStore = Ext.getStore('dropDownButtonsStore'),
                    panelHeight,
                    panelHeightOnPhone,
                    storeFilters;

                dropDownButtonsStore.clearFilter();
                //dropDownButtonsStore.setFilters(filterArray); does AND; we need OR
                //dropDownButtonsStore.filterBy(filterByFunction);

                // Create the Common.util.Filter objects to apply to the Drop Down list store.
                // Common.util.Filter allows us to use the OR operator to join filters.
                storeFilters = me.createDropDownButtonsStoreFilter(filterValues);
                dropDownButtonsStore.setFilters(storeFilters);

                dropDownButtonsStore.loadPage(1, function () {
                    listType = (Ext.isDefined(selectedListType) && filterValues.join(',').indexOf(selectedListType) >= 0) ?
                        selectedListType : defaultListType;
                    panelHeight = panelHeightOnPhone = '' + 3 * dropDownButtonsStore.getCount() + 'em';
                    buttonPicker.setPanelSize({
                        tablet: {width: '18em', height: panelHeight},
                        phone: {width: '14em', height: panelHeightOnPhone}
                    });
                    buttonPicker.setValue(listType);
                    buttonPicker.setDisabled(dropDownButtonsStore.getCount() === 1);
                    WorkRequestListUtil.filterAndShowWorkRequestList(mainView, listType, null);
                }, me);
            };

        if (userRoleName === 'supervisor') {
            filterValues = [Constants.MyWork, Constants.MyRequests, Constants.Requested, Constants.Approved,
                Constants.Issued, Constants.Completed];
            defaultListType = Constants.Approved;
        } else if (userRoleName === 'craftsperson') {
            if (ApplicationParameters.isCraftspersonSelfAssign) {
                filterValues = [Constants.MyWork, Constants.MyRequests, Constants.Approved];
                filterValuesIfWorkRequestsExist = [Constants.Requested, Constants.Issued, Constants.Completed];
            } else {
                filterValues = [Constants.MyWork, Constants.MyRequests];
                filterValuesIfWorkRequestsExist = [Constants.Approved, Constants.Requested, Constants.Issued, Constants.Completed];
            }

            defaultListType = Constants.MyWork;
            
        } else if (userRoleName === 'approver') {
            filterValues = [Constants.MyRequests, Constants.Requested, Constants.Approved];
            filterValuesIfWorkRequestsExist = [Constants.MyWork, Constants.Issued, Constants.Completed];
            defaultListType = Constants.Requested;
        } else if (userRoleName === 'step completer') {
            filterValues = [Constants.MyRequests, Constants.Requested, Constants.Approved, Constants.Completed];
            filterValuesIfWorkRequestsExist = [Constants.MyWork, Constants.Issued];
            defaultListType = Constants.Approved;
        } else {
            // 'client'
            filterValues = [Constants.MyRequests];
            filterValuesIfWorkRequestsExist = [];
            defaultListType = Constants.MyRequests;
        }

        numberOfTabsToAdd = filterValuesIfWorkRequestsExist.length;
        addTabIfWorkRequestsExist(filterValuesIfWorkRequestsExist, doInit, me);
    },

    /**
     * Creates the filters to be applied to the Drop Down list store.
     * @param filterValues
     * @returns {Array}
     */
    createDropDownButtonsStoreFilter: function(filterValues) {
        var filters = [];

        Ext.each(filterValues, function(filterValue) {
            filters.push(Ext.create('Common.util.Filter', {
                property: 'value',
                value: filterValue,
                conjunction: 'OR'
            }));
        });

        return filters;
    },

    /**
     * Shows/hides items of the myWorkToolbar component according to the list type
     * Also resets the checkbox field to unchecked
     * @param myWorkToolbar
     * @param listType
     */
    showHideMyWorkToolbarItems: function (myWorkToolbar, listType) {
        var me = this,
            workRequestFilterButton = myWorkToolbar.down('button[name=workRequestFilterButton]'),
            workRequestCheckboxAll = myWorkToolbar.down('checkboxfield[name=workRequestCheckboxAll]');

        if (listType === Constants.MyWork || listType === Constants.MyRequests) {
            workRequestFilterButton.setHidden(true);
            workRequestCheckboxAll.setHidden(true);
        } else {
            workRequestFilterButton.setHidden(false);
            workRequestCheckboxAll.setHidden(false);
            me.changeCheckboxFieldAndFireEvent(workRequestCheckboxAll, false);
        }
    },

    /**
     * Checks/Unchecks the given checkbox field and fires the corresponding event
     * if the new value equals the old one.
     * @param checkboxField
     * @param check
     */
    changeCheckboxFieldAndFireEvent: function (checkboxField, check) {
        if (checkboxField.getChecked() !== check) {
            if (check) {
                checkboxField.check();
            } else {
                checkboxField.uncheck();
            }
        } else {
            checkboxField.fireEvent(check ? 'check' : 'uncheck', checkboxField);
        }
    },

    /**
     * @param {Object} mainView
     * @param {String} listType Values: 'MyWork', 'MyRequests', 'Requested', 'Approved', 'Issued', 'Completed'
     */
    setWorkRequestListTitle: function (mainView, listType) {
        var navBar = mainView.getNavigationBar(),
            workRequestListView = mainView.down('workrequestListPanel'),
            title = "";

        switch (listType) {
            case Constants.MyWork:
                title = LocaleManager.getLocalizedString('My Work', 'Maintenance.util.WorkRequestListUtil');
                break;

            case Constants.MyRequests:
                title = LocaleManager.getLocalizedString('My Requests', 'Maintenance.util.WorkRequestListUtil');
                break;

            case 'Requested':
                title = LocaleManager.getLocalizedString('Requested', 'Maintenance.util.WorkRequestListUtil');
                break;

            case 'Approved':
                title = LocaleManager.getLocalizedString('Approved', 'Maintenance.util.WorkRequestListUtil');
                break;

            case 'Issued':
                title = LocaleManager.getLocalizedString('Issued', 'Maintenance.util.WorkRequestListUtil');
                break;

            case 'Completed':
                title = LocaleManager.getLocalizedString('Completed', 'Maintenance.util.WorkRequestListUtil');
                break;

            default:
                break;
        }

        navBar.setTitle(title);

        // Set the display mode of the work request view
        workRequestListView.setDisplayMode(listType);
    },

    highlightItem: function (date_escalation_completion) {
        var currentDate = new Date(),
            formattedCurrentDate = Ext.DateExtras.format(currentDate, 'yyyy-mm-dd'),
            dateEscCompl,
            formattedDateEscCompl;

        if (!Ext.isEmpty(date_escalation_completion)) {
            dateEscCompl = Ext.isDate(date_escalation_completion) ? date_escalation_completion : date_escalation_completion.getValue();
            if (Ext.isDate(dateEscCompl)) {
                formattedDateEscCompl = Ext.DateExtras.format(dateEscCompl, 'yyyy-mm-dd');
                if (formattedDateEscCompl === formattedCurrentDate) {
                    return "#FACC2E";
                } else if (formattedDateEscCompl < formattedCurrentDate) {
                    return "red";
                }
            }
        }

        return "";
    }
});