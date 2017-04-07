package com.archibus.service.space.activity;

import java.util.List;

import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.SpaceTransactionUtil;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 * 
 * <p>
 * 
 */
public final class SpaceTransactionSwitchActivityUtil {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceTransactionSwitchActivityUtil() {
    }
    
    /**
     * Return if there is a role value by role id.
     * 
     * @param afmRoleId role code
     * @return true has record |false has not record
     */
    public static boolean isExistsRole(final String afmRoleId) {
        final DataSource rolesDS = SpaceTransactionUtil.getAfmRulesDatasource();
        
        final ParsedRestrictionDef afmRoleResDef = new ParsedRestrictionDef();
        boolean hasRecord = false;
        afmRoleResDef.addClause(SpaceConstants.AFM_ROLES, SpaceConstants.ROLE_NAME, afmRoleId,
            Operation.EQUALS);
        
        if (rolesDS.getRecords(afmRoleResDef).size() > 0) {
            hasRecord = true;
        }
        
        return hasRecord;
    }
    
    /**
     * Get afm role process record.
     * 
     * @param roleProcsDS afm_roleProcs datasource
     * @param roleId role_id
     * @param activityId activiti_id
     * @param newProcessId process_id
     * @return true has record | false no record.
     */
    public static boolean existsRoleProcsRecord(final DataSource roleProcsDS, final String roleId,
            final String activityId, final String newProcessId) {
        final ParsedRestrictionDef afmRoleProcsResDef = new ParsedRestrictionDef();
        boolean hasRecord = false;
        afmRoleProcsResDef.addClause(SpaceConstants.AFM_ROLEPROCS, SpaceConstants.ROLE_NAME,
            roleId, Operation.EQUALS);
        afmRoleProcsResDef.addClause(SpaceConstants.AFM_ROLEPROCS, SpaceConstants.ACTIVITY_ID,
            activityId, Operation.EQUALS);
        afmRoleProcsResDef.addClause(SpaceConstants.AFM_ROLEPROCS, SpaceConstants.PROCESS_ID,
            newProcessId, Operation.EQUALS);
        
        if (roleProcsDS.getRecords(afmRoleProcsResDef).size() > 0) {
            hasRecord = true;
        }
        return hasRecord;
    }
    
    /**
     * Get afm process record.
     * 
     * @param activityId activityId
     * @param processId process id
     * @return true|false
     */
    public static boolean existAfmProcessRecord(final String activityId, final String processId) {
        final DataSource afmProcDS = SpaceTransactionUtil.getAfmProcessDataSource();
        final ParsedRestrictionDef afmProcessResDef = new ParsedRestrictionDef();
        boolean hasRecord = false;
        afmProcessResDef.addClause(SpaceConstants.AFM_PROCESSES, SpaceConstants.ACTIVITY_ID,
            activityId, Operation.EQUALS);
        
        afmProcessResDef.addClause(SpaceConstants.AFM_PROCESSES, SpaceConstants.PROCESS_ID,
            processId, Operation.EQUALS);
        if (afmProcDS.getRecords(afmProcessResDef).size() > 0) {
            hasRecord = true;
        }
        return hasRecord;
    }
    
    /**
     * Determine if already exist afm_roleprocs record for given role name.
     * 
     * @param newRoleProcRecords List afm_roleprocs record list
     * @param roleName String role name
     * 
     * @return boolean indicate if newRoleProcRecords contains roleName
     */
    public static boolean existRoleProcRecord(final List<DataRecord> newRoleProcRecords,
            final String roleName) {
        boolean exist = false;
        for (DataRecord record : newRoleProcRecords) {
            if (record.getString(
                SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT + SpaceConstants.ROLE_NAME)
                .equalsIgnoreCase(roleName)) {
                exist = true;
                break;
            }
        }
        return exist;
    }
    
    /**
     * Check if we can get record from role process table by given clauses.
     * 
     * @param roleProcsDS DataSource afm_roleprocs datasource
     * @param activityId String activity id
     * @param processId String process id
     * @param oldRoleName String old role name
     * @return afm_roleprocs records
     */
    public static List<DataRecord> isExistsAfmRoleProcRecords(final DataSource roleProcsDS,
            final String activityId, final String processId, final String oldRoleName) {
        final ParsedRestrictionDef roleProcsResDef = new ParsedRestrictionDef();
        roleProcsResDef.addClause(SpaceConstants.AFM_ROLEPROCS, SpaceConstants.ACTIVITY_ID,
            activityId, Operation.EQUALS);
        roleProcsResDef.addClause(SpaceConstants.AFM_ROLEPROCS, SpaceConstants.PROCESS_ID,
            processId, Operation.EQUALS);
        roleProcsResDef.addClause(SpaceConstants.AFM_ROLEPROCS, SpaceConstants.ROLE_NAME,
            oldRoleName, Operation.EQUALS);
        return roleProcsDS.getRecords(roleProcsResDef);
    }
    
}