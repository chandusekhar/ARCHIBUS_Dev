
View.createController('defSchedGroup', {

    pmgp_detail_onSave: function(){
        this.pmgp_detail.save();
        this.pmgp_select.refresh();
    },
    
    pmgp_select_onShowdetail: function(row, action){
        var record = row.getRecord();
        var restriction = new Ab.view.Restriction();
        restriction.addClause('pms.pm_group', record.getValue('pmgp.pm_group'));
        View.openDialog('ab-pm-sched-for-group.axvw', restriction, false, {
            width: 2000,
            height: 1800
        });
        
    },
    /**
     * for kb3021761
     */
    pmgp_select_afterRefresh: function(){
        this.disableViewScheBtn();
    },
    /**
     * for kb3021761
     */
    disableViewScheBtn: function(){
        var controller = this;
        this.pmgp_select.gridRows.each(function(row){
            var pmGroupCode = row.record["pmgp.pm_group"];
            var action = row.actions.get("showdetail");
            if (!controller.isExistedInPMSche(pmGroupCode)) {
                action.forceDisable(true);
            }
            
        });
    },
    /**
     * for kb3021761
     * @param {Object} pmGroup
     */
    isExistedInPMSche: function(pmGroup){
        var parameters = {
            tableName: 'pms',
            fieldNames: toJSON(['pms.pms_id']),
            restriction: toJSON({
                'pms.pm_group': pmGroup
            })
        };
        try {
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            var rows = result.data.records;
            return rows.length > 0;
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    }
});

