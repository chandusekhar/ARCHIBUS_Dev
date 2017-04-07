/**
 * Holds various application parameters.
 *
 * @author Cristina Reghina
 * @since 21.3
 */
Ext.define('Maintenance.util.ApplicationParameters', {
    alternateClassName: ['ApplicationParameters'],

    singleton: true,

    config: {
        userRoleNameStorageKey: 'Ab.Maintenance.UserRoleName'
    },

    constructor: function () {
        this.initConfig();
    },

    /**
     * True if the user is a craftsperson, part of a team that allows craftspersons to assign work to themselves
     * (the work team has the Craftspersons Assign Themselves flag set to Yes).
     *
     * This parameter should be set at launch of the app
     */
    isCraftspersonSelfAssign: false,

    /**
     * True if the user is a craftsperson and estimator.
     *
     * This parameter should be set at launch of the app
     */
    isCraftspersonEstimator: false,

    /**
     * True if the user is a craftsperson and planner.
     *
     * This parameter should be set at launch of the app
     */
    isCraftspersonPlanner: false,
    
    /**
     * True if the user is a cf.cf_change_wr = 1.
     *
     * This parameter should be set at launch of the app
     */
    canCraftspersonChangeWorkRequest: false,
    
    /**
     * True if the user is a cf.cf_unschedule = 1.
     *
     * This parameter should be set at launch of the app
     */
    canCraftspersonReturnWorkRequest: false,


    /**
     * Holds the role name of the user, determined server side: supervisor/craftsperson/approver/step completer/client
     * This parameter is set at app startup and after each sync
     * Default: the most restrictive role (client)
     */
    getUserRoleName: function () {
        var key = this.getUserRoleNameStorageKey(),
            userRoleName = localStorage.getItem(key);

        if (userRoleName) {
            return Ext.JSON.decode(userRoleName);
        } else {
            return 'client';
        }
    },

    setUserRoleName: function (userRoleName) {
        var key = this.getUserRoleNameStorageKey();

        // TODO: Why are we using JSON when we are storing a string
        localStorage.setItem(key, Ext.JSON.encode(userRoleName));
    },

    /**
     * Sets the isCraftspersonSelfAssign flag
     */
    setCraftspersonParameters: function (onCompleted, scope) {
        var me = this,
            userProfile = Common.util.UserProfile.getUserProfile(),
            craftspersonStore = Ext.getStore('craftspersonStore'),
            workTeamsStore = Ext.getStore('workTeamsStore'),
            filterArray = [],
            subFilterArray = [],
            workTeamsfilter = null,
            selfAssignfilter = WorkRequestFilter.createFilter('cf_assign', '1'),
            workTeamId,
            subFilter;

        if (ApplicationParameters.getUserRoleName() === 'craftsperson'||ApplicationParameters.getUserRoleName() === 'supervisor') {
            filterArray.push(WorkRequestFilter.createFilter('cf_id', userProfile.cf_id));

            craftspersonStore.retrieveRecord(filterArray, function (cf) {


                if (cf) {
                    filterArray.length = 0;

                    if ( cf.get('is_estimator') === 1 ) {
                        me.isCraftspersonEstimator = true;
                    }

                    if ( cf.get('is_planner') === 1 ) {
                        me.isCraftspersonPlanner = true;
                    }
                    
                    if ( cf.get('cf_change_wr') === 1 ) {
                        me.canCraftspersonChangeWorkRequest = true;
                    }
                    
                    if ( cf.get('cf_unschedule') === 1 ) {
                        me.canCraftspersonReturnWorkRequest = true;
                    }
                    
                    // set the work team restriction
                    workTeamId = cf.get('work_team_id');
                    if (!Ext.isEmpty(workTeamId)) {
                        subFilter = {
                            property: 'work_team_id',
                            value: workTeamId,
                            conjunction: 'OR'
                        };
                        subFilterArray.push(subFilter);
                    }

                    // add the other work teams of the craftsperson
                    me.getCraftspersonWorkTeamsSubFilter(function (workTeamsSubFilter) {
                        subFilterArray = subFilterArray.concat(workTeamsSubFilter);
                        if (!Ext.isEmpty(subFilterArray)) {
                            workTeamsfilter = WorkRequestFilter.createFilter('dummyProperty', 'dummyValue');
                            workTeamsfilter.setSubFilter(subFilterArray);
                        }

                        filterArray.push(selfAssignfilter);
                        if (workTeamsfilter) {
                            filterArray.push(workTeamsfilter);
                        }

                        workTeamsStore.retrieveRecord(filterArray, function (records) {
                            if (!Ext.isEmpty(records)) {
                                me.isCraftspersonSelfAssign = true;
                            }
                            Ext.callback(onCompleted, scope || me);
                        }, me);
                    }, me);

                } else {
                    Ext.callback(onCompleted, scope || me);
                }
            }, me);
        } else {
            Ext.callback(onCompleted, scope || me);
        }
    },

    /**
     * @private
     */
    getCraftspersonWorkTeamsSubFilter: function (onCompleted, scope) {
        var me = this,
            userProfile = Common.util.UserProfile.getUserProfile(),
            craftspersonWorkTeamsStore = Ext.getStore('craftspersonWorkTeamsStore'),
            filterArray = [],
            workTeamsSubFilterArray = [];

        filterArray.push(WorkRequestFilter.createFilter('cf_id', userProfile.cf_id));

        craftspersonWorkTeamsStore.retrieveAllStoreRecords(filterArray, function (records) {
            if (records) {
                Ext.each(records, function (record) {
                    workTeamsSubFilterArray.push({
                        property: 'work_team_id',
                        value: record.get('work_team_id'),
                        conjunction: 'OR',
                        exactMatch: true
                    });
                }, me);
            }
            Ext.callback(onCompleted, scope || me, [workTeamsSubFilterArray]);
        }, me);
    }
});