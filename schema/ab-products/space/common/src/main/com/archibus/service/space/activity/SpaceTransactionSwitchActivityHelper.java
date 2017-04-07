package com.archibus.service.space.activity;

import java.util.List;

import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.SpaceTransactionUtil;
import com.archibus.utility.StringUtil;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 * 
 * <p>
 * 
 */
public final class SpaceTransactionSwitchActivityHelper {
    
    /**
     * Indicates the string 'AbSpaceRoomChargebackAR' .
     * 
     */
    public static final String ABSPACEROOMCHARGEBACKAR = "AbSpaceRoomChargebackAR";
    
    /**
     * Indicates the string 'AbSpaceRoomInventoryBAR' .
     * 
     */
    public static final String AB_SPACE_ROOM_INVENTORY_BAR = "AbSpaceRoomInventoryBAR";
    
    /**
     * Indicates the string 'RoomTransactionRecorderForDataChangeEvent' .
     * 
     */
    public static final String ROOM_TRANSACTION_RECORDER_FOR_DATA_CHANGE_EVENT =
            "RoomTransactionRecorderForDataChangeEvent";
    
    /**
     * Indicates the string 'AbSpacePersonnelInventory' .
     * 
     */
    public static final String ABSPACEPERSONNELINVENTORY = "AbSpacePersonnelInventory";
    
    /**
     * Indicates the string 'Background Data RmTrans'.
     * 
     */
    public static final String BACKTROUD_DATA_RMTRANS = "Background Data RmTrans";
    
    /**
     * Indicates the string 'Background Data'.
     * 
     */
    public static final String BACKTROUD_DATA = "Background Data";
    
    /**
     * Indicates the string 'Client RmTrans' .
     * 
     */
    public static final String CLIENT_RMTRANS = "Client RmTrans";
    
    /**
     * Indicates the string 'Operational Reports RmTrans' .
     * 
     */
    public static final String OPERATIONAL_REPRORTS_RMTRANS = "Operational Reports RmTrans";
    
    /**
     * Indicates the string 'Manager' .
     * 
     */
    public static final String MANAGER = "Manager";
    
    /**
     * Indicates the string 'Service Desk Manager RmTrans' .
     * 
     */
    public static final String SERVICE_DESK_MANAGER_RMTRANS = "Service Desk Manager RmTrans";
    
    /**
     * Indicates the string 'Space Manager RmTrans' .
     * 
     */
    public static final String SPACE_MANAGER_RMTRANS = "Space Manager RmTrans";
    
    /**
     * Indicates the string 'Department Manager RmTrans' .
     * 
     */
    public static final String DEPARTMENT_MANAGER_RMTRANS = "Department Manager RmTrans";
    
    /**
     * Indicates the string 'Department Manager' .
     * 
     */
    public static final String DEPARTMENT_MANAGER = "Department Manager";
    
    /**
     * Indicates the string 'Space Chargeback RmTrans' .
     * 
     */
    public static final String SPACE_CHARGEBACK_RMTRANS = "Space Chargeback RmTrans";
    
    /**
     * Indicates the string 'Standard Space Chargeback' .
     * 
     */
    public static final String STANDARD_SPACE_CHARGEBACK = "Standard Space Chargeback";
    
    /**
     * Indicates the string 'Shared Workplace Chargeback' .
     * 
     */
    public static final String SHARED_WORKPLACE_CHARGEBACK = "Shared Workplace Chargeback";
    
    /**
     * Indicates the string 'Building Performance RmTrans' .
     * 
     */
    public static final String BUILDING_PERFORMANCE_RMTRANS = "Building Performance RmTrans";
    
    /**
     * Indicates the string 'Building Performance' .
     * 
     */
    public static final String BUILDING_PERFORMANCE = "Building Performance";
    
    /**
     * Indicates the string 'Group Inventory RmTrans' .
     * 
     */
    public static final String GROUP_INVENTORY_RMTRANS = "Group Inventory RmTrans";
    
    /**
     * Indicates the string 'Group Inventory' .
     * 
     */
    public static final String GROUP_INVENTORY = "Group Inventory";
    
    /**
     * Indicates the string 'Room Inventory - Reports RmTrans' .
     * 
     */
    public static final String ROOM_INVENTRORY_REPORTS_RMTRANS = "Room Inventory - Reports RmTrans";
    
    /**
     * Indicates the string 'Room Inventory - Setup RmTrans' .
     * 
     */
    public static final String ROOM_INVENTRORY_SETUP_RMTRANS = "Room Inventory - Setup RmTrans";
    
    /**
     * Indicates the string 'Room Inventory' .
     * 
     */
    public static final String ROOM_INVENTORY = "Room Inventory";
    
    /**
     * Indicates the string 'Space Manager' .
     * 
     */
    public static final String SPACE_MANAGER = "Space Manager";
    
    /**
     * Indicates the string 'Background Data RmTrans (SC)'.
     * 
     */
    public static final String BACKTROUD_DATA_RMTRANS_SC = "Background Data RmTrans (SC)";
    
    /**
     * Indicates the string 'Background Data (SC)'.
     * 
     */
    public static final String BACKTROUD_DATA_SC = "Background Data (SC)";
    
    /**
     * Indicates the string 'Client RmTrans (SC)' .
     * 
     */
    public static final String CLIENT_RMTRANS_SC = "Client RmTrans (SC)";
    
    /**
     * Indicates the string 'Operational Reports RmTrans (SC)' .
     * 
     */
    public static final String OPERATIONAL_REPRORTS_RMTRANS_SC = "Operational Reports RmTrans (SC)";
    
    /**
     * Indicates the string 'Manager (SC)' .
     * 
     */
    public static final String MANAGER_SC = "Manager (SC)";
    
    /**
     * Indicates the string 'Service Desk Manager RmTrans (SC)' .
     * 
     */
    public static final String SERVICE_DESK_MANAGER_RMTRANS_SC =
            "Service Desk Manager RmTrans (SC)";
    
    /**
     * Indicates the string 'Space Manager RmTrans (SC)' .
     * 
     */
    public static final String SPACE_MANAGER_RMTRANS_SC = "Space Manager RmTrans (SC)";
    
    /**
     * Indicates the string 'Department Manager RmTrans (SC)' .
     * 
     */
    public static final String DEPARTMENT_MANAGER_RMTRANS_SC = "Department Manager RmTrans (SC)";
    
    /**
     * Indicates the string 'Department Manager (SC)' .
     * 
     */
    public static final String DEPARTMENT_MANAGER_SC = "Department Manager (SC)";
    
    /**
     * Indicates the string 'Space Chargeback RmTrans (SC)' .
     * 
     */
    public static final String SPACE_CHARGEBACK_RMTRANS_SC = "Space Chargeback RmTrans (SC)";
    
    /**
     * Indicates the string 'Standard Space Chargeback (SC)' .
     * 
     */
    public static final String STANDARD_SPACE_CHARGEBACK_SC = "Standard Space Chargeback (SC)";
    
    /**
     * Indicates the string 'Shared Workplace Chargeback (SC)' .
     * 
     */
    public static final String SHARED_WORKPLACE_CHARGEBACK_SC = "Shared Workplace Chargeback (SC)";
    
    /**
     * Indicates the string 'Building Performance RmTrans (SC)' .
     * 
     */
    public static final String BUILDING_PERFORMANCE_RMTRANS_SC = "Bldg Performance RmTrans (SC)";
    
    /**
     * Indicates the string 'Building Performance (SC)' .
     * 
     */
    public static final String BUILDING_PERFORMANCE_SC = "Building Performance (SC)";
    
    /**
     * Indicates the string 'Group Inventory RmTrans (SC)' .
     * 
     */
    public static final String GROUP_INVENTORY_RMTRANS_SC = "Group Inventory RmTrans (SC)";
    
    /**
     * Indicates the string 'Group Inventory (SC)' .
     * 
     */
    public static final String GROUP_INVENTORY_SC = "Group Inventory (SC)";
    
    /**
     * Indicates the string 'Room Inventory - Reports RmTrans (SC)' .
     * 
     */
    public static final String ROOM_INVENTRORY_REPORTS_RMTRANS_SC =
            "Room Inventory - Reports RmTrans (SC)";
    
    /**
     * Indicates the string 'Room Inventory - Setup RmTrans (SC)' .
     * 
     */
    public static final String ROOM_INVENTRORY_SETUP_RMTRANS_SC =
            "Room Inventory - Setup RmTrans (SC)";
    
    /**
     * Indicates the string 'Room Inventory (SC)' .
     * 
     */
    public static final String ROOM_INVENTORY_SC = "Room Inventory (SC)";
    
    /**
     * Indicates the string 'Space Manager (SC)' .
     * 
     */
    public static final String SPACE_MANAGER_SC = "Space Manager (SC)";
    
    /**
     * Indicates the string 'Room Inv - Setup RmTrans (SC)' .
     * 
     */
    public static final String ROOM_INV_SETUP_RMTRANS_SC = "Room Inv - Setup RmTrans (SC)";
    
    /**
     * Indicates the string 'Room Inv - Setup RmTrans (SC)' .
     * 
     */
    public static final String ROOM_INV_REPORTS_RMTRANS_SC = "Room Inv - Reports RmTrans (SC)";
    
    /**
     * Indicates the string 'Room Inv - Setup RmTrans (SC)' .
     * 
     */
    public static final String SERVICE_DESK_MGR_RMTRANS_SC = "Service Desk Mgr RmTrans (SC)";
    
    /**
     * Indicates the string 'Executive Reports' .
     * 
     */
    public static final String EXECUTIVE_REPORTS = "Executive Reports";
    
    /**
     * Indicates the string 'process' .
     * 
     */
    public static final String PROCESS = "Process";
    
    /**
     * Indicates the string 'EXECUTIVE MANAGER' .
     * 
     */
    public static final String EXECUTIVE_MANAGER = "EXECUTIVE MANAGER";
    
    /**
     * Indicates the string 'EXECUTIVE MANAGER(ACP)' .
     * 
     */
    public static final String EXECUTIVE_MANAGER_ACP = "EXECUTIVE MANAGER (ACP)";
    
    /**
     * Get new role process and old role process mapping array.
     * 
     * @return mapping
     */
    public static final String[][] ROOM_TRANSACTION_LEGACY_NULL_MAPPING = new String[][] {
            { SpaceConstants.SPACE_ACTIVITY, EXECUTIVE_REPORTS, EXECUTIVE_MANAGER },
            { SpaceConstants.SPACE_ACTIVITY, EXECUTIVE_REPORTS, EXECUTIVE_MANAGER_ACP },
            { SpaceConstants.SPACE_ACTIVITY, PROCESS, EXECUTIVE_MANAGER },
            { SpaceConstants.SPACE_ACTIVITY, PROCESS, EXECUTIVE_MANAGER_ACP }
    
    };
    
    /**
     * Get new role process and old role process mapping array.
     * 
     * @return mapping
     */
    public static final String[][] ROOM_TRANSACTION_MAPPING =
            new String[][] {
                    { ABSPACEPERSONNELINVENTORY, BACKTROUD_DATA_RMTRANS, BACKTROUD_DATA },
                    { ABSPACEPERSONNELINVENTORY, CLIENT_RMTRANS, "" },
                    { ABSPACEPERSONNELINVENTORY, SERVICE_DESK_MANAGER_RMTRANS, "" },
                    { ABSPACEROOMCHARGEBACKAR, DEPARTMENT_MANAGER_RMTRANS, DEPARTMENT_MANAGER },
                    { SpaceConstants.SPACE_ACTIVITY, BACKTROUD_DATA_RMTRANS, BACKTROUD_DATA },
                    { SpaceConstants.SPACE_ACTIVITY, BUILDING_PERFORMANCE_RMTRANS,
                            BUILDING_PERFORMANCE },
                    { SpaceConstants.SPACE_ACTIVITY, DEPARTMENT_MANAGER_RMTRANS, DEPARTMENT_MANAGER },
                    { SpaceConstants.SPACE_ACTIVITY, GROUP_INVENTORY_RMTRANS, GROUP_INVENTORY },
                    { SpaceConstants.SPACE_ACTIVITY, SERVICE_DESK_MANAGER_RMTRANS, "" },
                    { SpaceConstants.SPACE_ACTIVITY, SPACE_MANAGER_RMTRANS, SPACE_MANAGER },
                    { SpaceConstants.SPACE_ACTIVITY, EXECUTIVE_REPORTS, "" },
                    { SpaceConstants.SPACE_ACTIVITY, PROCESS, "" },
                    
                    { ABSPACEPERSONNELINVENTORY, BACKTROUD_DATA_RMTRANS_SC, BACKTROUD_DATA_SC },
                    { ABSPACEPERSONNELINVENTORY, CLIENT_RMTRANS_SC, "" },
                    { ABSPACEPERSONNELINVENTORY, SERVICE_DESK_MGR_RMTRANS_SC, "" },
                    { ABSPACEROOMCHARGEBACKAR, DEPARTMENT_MANAGER_RMTRANS_SC, DEPARTMENT_MANAGER_SC },
                    { SpaceConstants.SPACE_ACTIVITY, BACKTROUD_DATA_RMTRANS_SC, BACKTROUD_DATA_SC },
                    { SpaceConstants.SPACE_ACTIVITY, BUILDING_PERFORMANCE_RMTRANS_SC,
                            BUILDING_PERFORMANCE_SC },
                    { SpaceConstants.SPACE_ACTIVITY, DEPARTMENT_MANAGER_RMTRANS_SC,
                            DEPARTMENT_MANAGER_SC },
                    { SpaceConstants.SPACE_ACTIVITY, GROUP_INVENTORY_RMTRANS_SC, GROUP_INVENTORY_SC },
                    { SpaceConstants.SPACE_ACTIVITY, SERVICE_DESK_MGR_RMTRANS_SC, "" },
                    { SpaceConstants.SPACE_ACTIVITY, SPACE_MANAGER_RMTRANS_SC, SPACE_MANAGER_SC }
            
            };
    
    /**
     * Get new role process and old role process mapping array.
     * 
     * @return mapping
     */
    public static final String[][] ROOM_TRANSACTION_CROSS_MAPPING =
            new String[][] {
                    { ABSPACEPERSONNELINVENTORY, OPERATIONAL_REPRORTS_RMTRANS, MANAGER },
                    { ABSPACEPERSONNELINVENTORY, SPACE_MANAGER_RMTRANS, MANAGER },
                    { ABSPACEROOMCHARGEBACKAR, SPACE_CHARGEBACK_RMTRANS, STANDARD_SPACE_CHARGEBACK },
                    { ABSPACEROOMCHARGEBACKAR, SPACE_CHARGEBACK_RMTRANS,
                            SHARED_WORKPLACE_CHARGEBACK },
                    { SpaceConstants.SPACE_ACTIVITY, ROOM_INVENTRORY_REPORTS_RMTRANS,
                            ROOM_INVENTORY },
                    { SpaceConstants.SPACE_ACTIVITY, ROOM_INVENTRORY_SETUP_RMTRANS, ROOM_INVENTORY },
                    
                    { ABSPACEPERSONNELINVENTORY, OPERATIONAL_REPRORTS_RMTRANS_SC, MANAGER_SC },
                    { ABSPACEPERSONNELINVENTORY, SPACE_MANAGER_RMTRANS_SC, MANAGER_SC },
                    { ABSPACEROOMCHARGEBACKAR, SPACE_CHARGEBACK_RMTRANS_SC,
                            STANDARD_SPACE_CHARGEBACK_SC },
                    { ABSPACEROOMCHARGEBACKAR, SPACE_CHARGEBACK_RMTRANS_SC,
                            SHARED_WORKPLACE_CHARGEBACK_SC },
                    { SpaceConstants.SPACE_ACTIVITY, ROOM_INV_REPORTS_RMTRANS_SC, ROOM_INVENTORY_SC },
                    { SpaceConstants.SPACE_ACTIVITY, ROOM_INV_SETUP_RMTRANS_SC, ROOM_INVENTORY_SC }
            
            };
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceTransactionSwitchActivityHelper() {
    }
    
    /**
     * Set is_active is 1 for afm_process records will be inserted into afm_roleprocs in the
     * processing of enable or disable.
     */
    public static void updateProcessActiveTrue() {
        
        for (String[] map : ROOM_TRANSACTION_MAPPING) {
            final String activityId = map[0];
            final String newProcessId = map[1];
            final String legacyProcessId = map[2];
            updateProcsRecord(activityId, newProcessId, legacyProcessId);
            
        }
        for (String[] map : ROOM_TRANSACTION_CROSS_MAPPING) {
            final String activityId = map[0];
            final String newProcessId = map[1];
            final String legacyProcessId = map[2];
            updateProcsRecord(activityId, newProcessId, legacyProcessId);
            
        }
    }
    
    /**
     * Set is_active is 1 for afm_process record will be inserted into afm_roleprocs in the
     * processing of enable or disable.
     * 
     * @param activityId activity id
     * @param newProcessId process id when we enable process.
     * @param legacyProcessId process id when we disable process.
     */
    private static void updateProcsRecord(final String activityId, final String newProcessId,
            final String legacyProcessId) {
        
        final DataSource procsDS = SpaceTransactionUtil.getProcessDataSource();
        final ParsedRestrictionDef procsResDef = new ParsedRestrictionDef();
        procsResDef.addClause(SpaceConstants.AFM_PROCESSES, SpaceConstants.ACTIVITY_ID, activityId,
            Operation.EQUALS);
        procsResDef.addClause(SpaceConstants.AFM_PROCESSES, SpaceConstants.PROJECT_ID,
            newProcessId, Operation.EQUALS, RelativeOperation.AND_BRACKET);
        procsResDef.addClause(SpaceConstants.AFM_PROCESSES, SpaceConstants.PROJECT_ID,
            legacyProcessId, Operation.EQUALS, RelativeOperation.OR);
        
        final List<DataRecord> procsRecord = procsDS.getRecords(procsResDef);
        for (DataRecord record : procsRecord) {
            record.setValue(SpaceConstants.AFM_PROCESSES + SpaceConstants.DOT
                    + SpaceConstants.IS_ACTIVE, 1);
            procsDS.saveRecord(record);
        }
    }
    
    /**
     * Add and delete process that has non-duplicate mapping in the
     * SpaceTransactionUtil.ROOM_TRANSACTION_NON_DUPLICATE_MAPPING.
     * 
     * @param roleProcsDS role process table ds.
     * @param enable boolean '1' or '0' to indicate enable or disable workspace transaction process.
     */
    public static void updateNonDuplicateProcess(final DataSource roleProcsDS, final boolean enable) {
        for (String[] map : ROOM_TRANSACTION_MAPPING) {
            
            final String activityId = map[0];
            final String newProcessId = map[1];
            final String legacyProcessId = map[2];
            
            if (StringUtil.notNullOrEmpty(legacyProcessId)) {
                // For existed legacy process, if enable workspace transaction, then update legacy
                // process id to new process id; else if disable then do converse.
                switchProcess(enable, roleProcsDS, activityId, newProcessId, legacyProcessId);
                
            } else {
                // For not existed legacy process, if disable workspace transaction, then delete new
                // process for legacy Space.
                if (!enable) {
                    final List<DataRecord> records =
                            getAfmRoleProcRecords(roleProcsDS, activityId, newProcessId);
                    for (DataRecord record : records) {
                        roleProcsDS.deleteRecord(record);
                    }
                    
                }
            }
        }
    }
    
    /**
     * Create record for afm_roleprocs when we enable which legacy value is null.
     * 
     * @param enable true false
     */
    public static void createProcessForNoLegacy(final boolean enable) {
        if (enable) {
            final DataSource roleProcsDS = SpaceTransactionUtil.getRoleProcessDataSource();
            
            for (String[] map : ROOM_TRANSACTION_LEGACY_NULL_MAPPING) {
                final String activityId = map[0];
                final String newProcessId = map[1];
                final String roleId = map[2];
                final DataRecord newRecord = roleProcsDS.createNewRecord();
                newRecord.setValue(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                        + SpaceConstants.ROLE_NAME, roleId);
                
                newRecord.setValue(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                        + SpaceConstants.ACTIVITY_ID, activityId);
                newRecord.setValue(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                        + SpaceConstants.PROCESS_ID, newProcessId);
                if (!SpaceTransactionSwitchActivityUtil.existsRoleProcsRecord(roleProcsDS, roleId,
                    activityId, newProcessId)
                        && SpaceTransactionSwitchActivityUtil.isExistsRole(roleId)) {
                    roleProcsDS.saveRecord(newRecord);
                }
                
            }
        }
        
    }
    
    /**
     * Add and delete process that has duplicate mapping in the
     * SpaceTransactionUtil.ROOM_TRANSACTION_DUPLICATE_MAPPING.
     * 
     * @param roleProcsDS role process table ds.
     * @param enable boolean '1' or '0' to indicate enable or disable workspace transaction process.
     */
    public static void updateDuplicateProcess(final DataSource roleProcsDS, final boolean enable) {
        // Create a new role process record by mapping.
        for (String[] map : ROOM_TRANSACTION_CROSS_MAPPING) {
            final String activityId = map[0];
            String newProcessId = "";
            String oldProcessId = "";
            if (enable) {
                newProcessId = map[2];
                oldProcessId = map[1];
            } else {
                newProcessId = map[1];
                oldProcessId = map[2];
            }
            
            final List<DataRecord> oldProcRecord =
                    getAfmRoleProcRecords(roleProcsDS, activityId, newProcessId);
            for (DataRecord record : oldProcRecord) {
                if (SpaceTransactionSwitchActivityUtil.isExistsAfmRoleProcRecords(
                    roleProcsDS,
                    activityId,
                    oldProcessId,
                    record.getString(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                            + SpaceConstants.ROLE_NAME)).size() == 0) {
                    createNewRoleProcessRecord(roleProcsDS, activityId, oldProcessId, record);
                }
            }
            
        }
        // Delete a old role process record by mapping.
        for (String[] map : ROOM_TRANSACTION_CROSS_MAPPING) {
            final String activityIdForDel = map[0];
            String newProcIdForDel = "";
            if (enable) {
                newProcIdForDel = map[2];
            } else {
                newProcIdForDel = map[1];
            }
            final List<DataRecord> roleNameRecord =
                    getAfmRoleProcRecords(roleProcsDS, activityIdForDel, newProcIdForDel);
            if (!roleNameRecord.isEmpty()) {
                for (DataRecord record : roleNameRecord) {
                    roleProcsDS.deleteRecord(record);
                }
            }
        }
        
    }
    
    /**
     * Create a new role-process record.
     * 
     * @param roleProcsDS role process table ds.
     * @param activityId activity id
     * @param oldProcessId old process id
     * @param record old Process Record .
     */
    private static void createNewRoleProcessRecord(final DataSource roleProcsDS,
            final String activityId, final String oldProcessId, final DataRecord record) {
        if (SpaceTransactionSwitchActivityUtil.existAfmProcessRecord(activityId, oldProcessId)) {
            
            final DataRecord newRecord = roleProcsDS.createNewRecord();
            newRecord.setValue(
                SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT + SpaceConstants.ROLE_NAME,
                record.getString(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                        + SpaceConstants.ROLE_NAME));
            
            newRecord.setValue(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                    + SpaceConstants.ACTIVITY_ID, activityId);
            newRecord.setValue(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                    + SpaceConstants.PROCESS_ID, oldProcessId);
            newRecord.setValue(
                SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT + SpaceConstants.TRANSFER_STATUS,
                record.getString(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                        + SpaceConstants.TRANSFER_STATUS));
            roleProcsDS.saveRecord(newRecord);
        }
    }
    
    /**
     * Enable or Disable NON-duplicated process by view task.
     * 
     * @param enable boolean '1' or '0' to indicate enable or disable workspace transaction process.
     * @param roleProcsDS DataSource afm_roleprocs datasource
     * @param activityId String activity id
     * @param newProcessId String process id of new Workspace Transaction
     * @param legacyProcessId String process id of Legacy Space
     */
    private static void switchProcess(final boolean enable, final DataSource roleProcsDS,
            final String activityId, final String newProcessId, final String legacyProcessId) {
        final List<DataRecord> oldRoleProcRecords =
                getAfmRoleProcRecords(roleProcsDS, activityId, legacyProcessId);
        final List<DataRecord> newRoleProcRecords =
                getAfmRoleProcRecords(roleProcsDS, activityId, newProcessId);
        if (enable) {
            for (DataRecord oldRoleProcRecord : oldRoleProcRecords) {
                updateProcessId(roleProcsDS, newProcessId, newRoleProcRecords, oldRoleProcRecord);
            }
        } else if (!enable) {
            for (DataRecord newRoleProcRecord : newRoleProcRecords) {
                updateProcessId(roleProcsDS, legacyProcessId, oldRoleProcRecords, newRoleProcRecord);
            }
        }
    }
    
    /**
     * Update old process id to new process id for role-process record.
     * 
     * @param roleProcsDS DataSource afm_roleprocs datasource
     * @param newProcessId String process id of new Workspace Transaction
     * @param newRoleProcRecords List activity id
     * @param oldRoleProcRecord DataRecord
     */
    private static void updateProcessId(final DataSource roleProcsDS, final String newProcessId,
            final List<DataRecord> newRoleProcRecords, final DataRecord oldRoleProcRecord) {
        
        if (!SpaceTransactionSwitchActivityUtil.existRoleProcRecord(
            newRoleProcRecords,
            oldRoleProcRecord.getString(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                    + SpaceConstants.ROLE_NAME))
                && SpaceTransactionSwitchActivityUtil.existAfmProcessRecord(
                    oldRoleProcRecord.getString(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                            + SpaceConstants.ACTIVITY_ID), newProcessId)) {
            // Look if there are record in afm_processes table in the clause that new process_id and
            // activity_id for new record.
            
            oldRoleProcRecord.setValue(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                    + SpaceConstants.PROCESS_ID, newProcessId);
            roleProcsDS.saveRecord(oldRoleProcRecord);
        }
        
    }
    
    /**
     * Get afm_roleprocs record by activity id and process id.
     * 
     * @param roleProcsDS DataSource afm_roleprocs datasource
     * @param activityId String activity id
     * @param processId String process id
     * 
     * @return afm_roleprocs records
     */
    private static List<DataRecord> getAfmRoleProcRecords(final DataSource roleProcsDS,
            final String activityId, final String processId) {
        final ParsedRestrictionDef roleProcsResDef = new ParsedRestrictionDef();
        roleProcsResDef.addClause(SpaceConstants.AFM_ROLEPROCS, SpaceConstants.ACTIVITY_ID,
            activityId, Operation.EQUALS);
        roleProcsResDef.addClause(SpaceConstants.AFM_ROLEPROCS, SpaceConstants.PROCESS_ID,
            processId, Operation.EQUALS);
        return roleProcsDS.getRecords(roleProcsResDef);
    }
    
}