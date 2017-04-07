package com.archibus.service.space.activity;

import java.util.List;

import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.helper.SpaceTransactionUtil;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 * 
 * <p>
 * 
 */
public final class SpaceTransactionSwitchActivity {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceTransactionSwitchActivity() {
    }
    
    /**
     * Set value of activity parameter UseWorkspaceTransactions.
     * 
     * @param enable boolean true' or false to indicate '1' or '0' of value of activity parameter
     *            UseWorkspaceTransactions.
     */
    public static void updateActivityParameterUseWorkspaceTransactions(final boolean enable) {
        // 1update activity param
        final DataSource activityParamsDataSource =
                SpaceTransactionUtil.getActivityParamsDataSource();
        
        final ParsedRestrictionDef activityParamResDef = new ParsedRestrictionDef();
        activityParamResDef.addClause(SpaceConstants.AFM_ACTIVITY_PARAMS, SpaceConstants.PARAM_ID,
            SpaceConstants.USEWORKSPACETRANSACTIONS, Operation.EQUALS);
        final List<DataRecord> paramRecords =
                activityParamsDataSource.getRecords(activityParamResDef);
        final String value = enable ? "1" : "0";
        for (final DataRecord paramRecord : paramRecords) {
            paramRecord.setValue(SpaceConstants.AFM_ACTIVITY_PARAMS + SpaceConstants.DOT
                    + SpaceConstants.PARAM_VALUE, value);
            activityParamsDataSource.saveRecord(paramRecord);
        }
    }
    
    /**
     * Enable workspace transaction process by view task.
     * 
     * @param enable boolean '1' or '0' to indicate enable or disable workspace transaction process.
     */
    public static void updateRoleProcs(final boolean enable) {
        
        final DataSource roleProcsDS = SpaceTransactionUtil.getRoleProcessDataSource();
        
        SpaceTransactionSwitchActivityHelper.updateProcessActiveTrue();
        SpaceTransactionSwitchActivityHelper.createProcessForNoLegacy(enable);
        SpaceTransactionSwitchActivityHelper.updateNonDuplicateProcess(roleProcsDS, enable);
        
        SpaceTransactionSwitchActivityHelper.updateDuplicateProcess(roleProcsDS, enable);
        
    }
}