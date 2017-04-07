package com.archibus.service.space;

import java.util.Date;
import com.archibus.datasource.SqlUtils;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * Space Management business logic.
 * <p>
 * History:
 * <li>Web Central 18.1: Initial implementation.
 *
 * @author Sergey Kuramshin
 */
public class SpaceService extends JobBase {
    
    /**
     * The includeGroupsInUnifiedSpaceCalcs activity parameter controls whether groups are included
     * into area calculations.
     */
    public static final String INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS =
            "includeGroupsInUnifiedSpaceCalcs";
    
    /**
     * By default, groups are included into area calculations.
     */
    public static final boolean INCLUDE_GROUPS_IN_UNIFIED_SPACE_CALCS_DEFAULT = true;
    
    // ----------------------- All Rooms method ---------------------------------------------------
    
    /**
     * add_nocup() in arup.abs
     */
    public void addStandardRoomCategoriesAndTypes() {
        AllRoomAreaUpdate.addNonoccupiableRoomCategories(this.status);
    }
    
    /**
     * calc_gross() calc_nocup() calc_ocup() in arup.abs calc_gp() in ciup.abs
     */
    public void updateAreaTotals() {
        AllRoomAreaUpdate.updateAreaTotals(this.status);
    }
    
    /**
     * arcb() in arcb.abs cicbgp() in cicbgp.abs
     */
    public void performChargebackAllRoom() {
        this.status.setResult(new JobResult("Standard Space Chargeback"));
        this.status.setTotalNumber(100);
        
        AllRoomChargeback.performChargeback();
        this.status.setCurrentNumber(50);
        
        GroupChargeback.performChargeback();
        this.status.setCurrentNumber(100);
    }
    
    // ----------------------- Shared Workspace method --------------------------------------------
    
    /**
     * syncpct() in aruppct.abs
     */
    public void synchronizeSharedRooms() {
        this.status.setResult(new JobResult("Synchronize Shared Rooms"));
        
        final String useRoomTransactions =
                Configuration.getActivityParameterString("AbSpaceRoomInventoryBAR",
                    "UseWorkspaceTransactions");
        final String captureSpaceHistory =
                Configuration.getActivityParameterString("AbSpaceRoomInventoryBAR",
                    "CaptureSpaceHistory");
        if ("1".equals(useRoomTransactions) || "1".equals(captureSpaceHistory)) {
            
            Reconcile.run(this.status);
            
        } else {
            AllRoomPercentageUpdate.synchronizeRoomPercentages();
            this.status.setCurrentNumber(100);
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * update_space() in aruppct.abs
     */
    public void updateAreaTotalsSpace() {
        AllRoomPercentageUpdate.updateSpace(this.status);
    }
    
    /**
     * update_space_time() in aruppct.abs
     */
    public void updateAreaTotalsSpaceTime(final Date dateFrom, final Date dateTo) {
        AllRoomPercentageUpdate.updateSpaceTime(dateFrom, dateTo, this.status);
    }
    
    /**
     * arcbpct() in arcbpct.abs
     */
    public void performChargebackSharedWorkspace() {
        AllRoomPercentageChargeback.performChargeback(this.status);
        
        // Modified for 20.1 Space WFR: 10.12-SpaceService.java (existing), by Liu XianChao
        final String useRoomTransactions =
                Configuration.getActivityParameterString("AbSpaceRoomInventoryBAR",
                    "UseWorkspaceTransactions");
        if (!"0".equalsIgnoreCase(useRoomTransactions)) {
            GroupChargeback.performChargeback();
        }
    }
    
    /**
     * Added for synchronously call two WFR methods updateSpaceTime and performChargeback for
     * Hoteling
     */
    public void updateAreaTotalsSpaceTimeAndPerformChargeBack(final Date dateFrom, final Date dateTo) {
        AllRoomPercentageUpdate.updateSpaceTime(dateFrom, dateTo, this.status);
        AllRoomPercentageChargeback.performChargeback(this.status);
    }
    
    // ----------------------- Employee methods ---------------------------------------------------
    
    /**
     * Employee update calculations.
     *
     * @see emup.abs
     */
    public void updateEmployeeHeadcounts() {
        this.status.setResult(new JobResult("Update Employee Headcounts"));
        this.status.setTotalNumber(100);
        EmployeeUpdate.updateEmployeeHeadcounts();
        this.status.setCurrentNumber(100);
    }
    
    /**
     * Infers Department Assignments from Employees.
     *
     * @see emdbtorm.abs
     */
    public void inferRoomDepartmentsFromEmployees(final String restriction) {
        EmployeeUpdate.inferRoomDepartmentsFromEmployees(restriction, this.status);
    }
    
    /**
     * Updates rm.area from rm.area_manual where rm.area is NULL or 0.
     *
     * @see manarrm.abs
     */
    public void updateRoomAreaFromManualArea() {
        this.status.setResult(new JobResult("Update Room Area from Manual Area"));
        this.status.setTotalNumber(100);
        SqlUtils
        .executeUpdate("rm",
                "UPDATE rm SET area = area_manual WHERE (dwgname IS NULL AND ehandle IS NULL) OR area IS NULL");
        this.status.setCurrentNumber(100);
    }
    
    /**
     * Updates su.area_usable from su.area_manual where su.area_usable is NULL or 0.
     *
     * @see manarsu.abs
     */
    public void updateSuiteAreaFromManualArea() {
        this.status.setResult(new JobResult("Update Suite Area from Manual Area"));
        this.status.setTotalNumber(100);
        SqlUtils.executeUpdate("su",
            "UPDATE su SET area_usable = area_manual WHERE area_usable = 0 OR area_usable IS NULL");
        this.status.setCurrentNumber(100);
    }
    
    /**
     * Updates Room's Employee Capacity from Room Standard's Standard Employee Headcount.
     */
    public void updateRoomCapacityFromRoomStandard() {
        this.status.setResult(new JobResult("Update Room Capacity from Room Standard"));
        this.status.setTotalNumber(100);
        SqlUtils
            .executeUpdate(
                "rm",
                "UPDATE rm SET cap_em = (SELECT std_em FROM rmstd WHERE rmstd.rm_std = rm.rm_std) WHERE rm_std IS NOT NULL");
        this.status.setCurrentNumber(100);
    }
}
