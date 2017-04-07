import java.util.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.BasicRuleBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

/**
 * Portfolio Scenario & Strategic Master Planning Migration Class.
 *
 * Added for 22.1 Space and Portfolio Planing.
 *
 * @author ASC-BJ:Zhang Yi
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class REPMPortfolioForecastingUpgradeDataToAdvancedFormat extends BasicRuleBase {

    /** The view file holding the datasources for creating gp records. */
    public static final String CREATE_GROUP_INVENTORY_DS_FILE_NAME =
            "ab-alloc-wiz-create-gp-inventory-ds.axvw";
    
    /**
     * Table name 'portfolio_scenario'.
     *
     */
    public static final String SCENARIO = "portfolio_scenario";
    
    /**
     * Field name 'portfolio_scenario_id'.
     *
     */
    public static final String SCENARIO_ID = "portfolio_scenario_id";
    
    /**
     * Field name 'bl_id'.
     *
     */
    public static final String BL_ID = "bl_id";
    
    /**
     * Field name 'fl_id'.
     *
     */
    public static final String FL_ID = "fl_id";

    /**
     * Field name 'area_manual'.
     *
     */
    public static final String AREA_MANUAL = "area_manual";

    /**
     * Table-field name 'gp.sort_order'.
     *
     */
    public static final String GP_SORT_ORDER = "gp.sort_order";
    
    /**
     * Table-field name 'gp.bl_id'.
     *
     */
    public static final String GP_BL_ID = "gp.bl_id";
    
    /**
     * Table-field name 'gp.fl_id'.
     *
     */
    public static final String GP_FL_ID = "gp.fl_id";

    /**
     * Table-field name 'portfolio_scenario.portfolio_scenario_id'.
     *
     */
    public static final String PORTFOLIO_SCENARIO_ID = "portfolio_scenario.portfolio_scenario_id";

    /**
     * Default floor's count of building UNALLOC.
     *
     */
    public static final int DEFAULT_FLOOR_COUNT = 5;
    
    /**
     * Default floor's area.
     *
     */
    public static final int DEFAULT_FLOOR_AREA = 25000;
    
    /**
     * Default sort order start number for building 'UNALLOC'.
     *
     */
    public static final int DEFAULT_SORT_ORDER_BASE = 500;
    
    /**
     * THIS IS THE LIST OF SPACE REQUIREMENTS (SB.SB_NAME) THAT PROVIDED BY USER FOR MIGRATION.
     * PLEASE REPLACE test1, test2 WITH REAL SB_NAME VALUES AND ADD MORE ONES AS WELL.
     *
     */
    private static final String SB_NAMES_LIST = "('test1', 'test2')";
    
    /**
     * Table name 'gp'.
     *
     */
    private static final String GP_TABLE = "gp";

    /**
     * Field name 'date_start'.
     *
     */
    private static final String DATE_START = "date_start";
    
    /**
     * Field name 'gp_id'.
     *
     */
    private static final String GP_ID = "gp_id";
    
    /**
     * Field name 'planning_bu_id'.
     *
     */
    private static final String PLANING_BU_ID = "planning_bu_id";
    
    /**
     * Default event name.
     *
     */
    // @translatable
    private static final String UNALLOC_EVENTN_NAME = "Add space from inventory";

    /**
     * Default bl_id 'UNALLOC'.
     *
     */
    // @translatable
    private static final String UNALLOC_BL_ID = "UNALLOC";

    /**
     * Default group name for 'UNALLOC'.
     *
     */
    // @translatable
    private static final String UNALLOC_BL_NAME = "Unallocated";

    /**
     * Default restriction for identifying the scenarios create prior to 22.1.
     *
     */
    // @translatable
    private static final String DEFAULT_RESTRICTION = "scn_name is null";
    
    /**
     * Group DataSource.
     *
     */
    private final DataSource dsGroup = DataSourceFactory.createDataSourceForFields(GP_TABLE,
        new String[] { SCENARIO_ID, "event_name", DATE_START, "date_end", GP_ID, "gp_function",
                PLANING_BU_ID, BL_ID, FL_ID, "dv_id", "dp_id", "allocation_type", "sort_order",
            "parent_group_id", AREA_MANUAL, "name", "description" });
    
    /**
     * Portfolio Scenario DataSource.
     *
     */
    private final DataSource dsScenario = DataSourceFactory.createDataSourceForFields(SCENARIO,
        new String[] { SCENARIO_ID, DATE_START });

    /**
     * Portfolio Scenarios and Space Budgets that were created prior to version 22.1 are not compatible with the Space and Portfolio Planning Console. 
     *  
     * However, administrators can convert the data so that it is usable in 22.1 by running a migration script.  
     * 
     * This one script will apply to both Portfolio Scenarios and Strategic Master Planning data, even though some clients may only have data from one application or the other.
     *
     */
    public void handle() {
        
        this.deleteGroups();
        
        this.updateExistingGroups();
        
        this.addNewGroupsForScenarios();
        
        this.addNewGroupsForUNALLOC();
        
        this.updateExistingGroupSortOrder();
        
        this.updateSpaceRequirements();

        this.updateSpaceRequirementItems();

        this.updateScenarios();
    }

    /**
     *  Set Scenario Name:  Copy the Portfolio Scenario ID into this field (portfolio_scenario.scn_name). 
     *
     */
    private void updateScenarios() {
        
        final StringBuilder sql = new StringBuilder();
        
        sql.append(" UPDATE portfolio_scenario  ");
        sql.append(" SET scn_name = portfolio_scenario_id, ");
        sql.append("     scn_level = ( case when exists (select 1 from gp where gp.portfolio_scenario_id=portfolio_scenario.portfolio_scenario_id and gp.dp_id is not null ) then 'dp' ");
        sql.append("                        when exists (select 1 from gp where gp.portfolio_scenario_id=portfolio_scenario.portfolio_scenario_id and gp.dv_id is not null ) then 'dv' ");
        sql.append("                        when exists (select 1 from gp where gp.portfolio_scenario_id=portfolio_scenario.portfolio_scenario_id and gp.planning_bu_id is not null ) then 'bu' ");
        sql.append("                        else '0' ");
        sql.append("                    end ), ");
        sql.append("     date_start = ( select min(gp.date_start) from gp where gp.portfolio_scenario_id=portfolio_scenario.portfolio_scenario_id ), ");
        sql.append("     status = 'Active' ");
        sql.append(" WHERE portfolio_scenario.scn_name is null ");
        
        SqlUtils.executeUpdate(SCENARIO, sql.toString());
    }
    
    /**
     *
     *  Add group records for the UNALLOC building: Follow the same procedure for adding these records when creating a new Portfolio Scenario.
     *
     */
    private void addNewGroupsForUNALLOC() {

        final List<DataRecord> scenarios = this.dsScenario.getRecords(DEFAULT_RESTRICTION);
        
        for (final DataRecord scenario : scenarios) {
            final String scenarioId = scenario.getString(PORTFOLIO_SCENARIO_ID);
            for (int i = 1; i <= DEFAULT_FLOOR_COUNT; i++) {
                final DataRecord newGpRecord = this.dsGroup.createNewRecord();
                newGpRecord.setValue("gp.event_name", UNALLOC_EVENTN_NAME);
                newGpRecord.setValue(GP_BL_ID, UNALLOC_BL_ID);
                newGpRecord.setValue("gp.name", UNALLOC_BL_NAME);
                
                newGpRecord.setValue(GP_FL_ID, "0" + i);

                newGpRecord.setValue("gp.allocation_type", "Usable Area - Owned");
                newGpRecord.setValue("gp.area_manual", new Double(DEFAULT_FLOOR_AREA));
                
                newGpRecord.setValue("gp.portfolio_scenario_id", scenarioId);
                newGpRecord.setValue("gp.date_start",
                    scenario.getDate("portfolio_scenario.date_start"));
                newGpRecord.setValue(GP_SORT_ORDER, DEFAULT_SORT_ORDER_BASE + i);
                
                this.dsGroup.saveRecord(newGpRecord);
            }

            // KB#3050460: need to calculate the date_start directly from gp but not from scenario
            final StringBuilder sql = new StringBuilder();
            sql.append(" UPDATE gp  ");
            sql.append(" SET gp.date_start = ( select min(g1.date_start) from gp ${sql.as} g1 where g1.portfolio_scenario_id=gp.portfolio_scenario_id AND g1.bl_id!='UNALLOC' ) ");
            sql.append(" WHERE gp.portfolio_scenario_id='"+ scenarioId +"' AND gp.bl_id='UNALLOC' ");
            SqlUtils.executeUpdate(SCENARIO, sql.toString());
        }
    }
    
    /**
     *
     * Create Usable Areas: we are only concerned with floors that contain allocations in the scenario (have a value for gp.BU or gp.DV or gp.DP).  
     * If a scenario floor only contains Lease or Unavailable Space, then it can be excluded from the new stack.  
     * Get a distinct list of BL/FL for which there is at least one record with a value for BU or DV or DP. 
     * Then delete all GP records that are not in that list.
     *
     */
    private void addNewGroupsForScenarios() {
        
        final List<DataRecord> scenarios = this.dsScenario.getRecords(DEFAULT_RESTRICTION);

        final DataSource dsGroupFloor =
                DataSourceFactory.createDataSourceForFields(GP_TABLE,
                    new String[] { BL_ID, FL_ID, });

        final DataSource dsGroupStartDate =
                DataSourceFactory.createDataSource().addTable(GP_TABLE)
                    .addVirtualField(GP_TABLE, "min_date", DataSource.DATA_TYPE_DATE);
        // dsGroupStartDate.addVirtualField(GP_TABLE, DATE_START, DATE_START);

        final DataSource dsBl =
                DataSourceFactory.createDataSourceForFields("bl", new String[] { BL_ID });
        final DataSource dsFl =
                DataSourceFactory.createDataSourceForFields("fl", new String[] { BL_ID, FL_ID });

        final DataRecord blRecord = dsBl.createNewRecord();
        final DataRecord flRecord = dsFl.createNewRecord();
        
        for (final DataRecord scenario : scenarios) {
            final String scenarioId = scenario.getString(PORTFOLIO_SCENARIO_ID);
            
            final StringBuilder sql = new StringBuilder();
            sql.append(" SELECT DISTINCT bl_id, fl_id from gp where bl_id is not null and fl_id is not null ");
            sql.append("and portfolio_scenario_id='" + scenarioId + "' and bl_id!='UNALLOC' ");

            dsGroupFloor.addQuery(sql.toString());

            final List<DataRecord> gpFloors = dsGroupFloor.getAllRecords();
            for (final DataRecord gpFloor : gpFloors) {

                blRecord.setValue("bl.bl_id", gpFloor.getValue(GP_BL_ID));
                flRecord.setValue("fl.fl_id", gpFloor.getValue(GP_FL_ID));

                final DataSetList newBuildingList = new DataSetList();
                newBuildingList.addRecord(blRecord);

                final DataSetList newFloorList = new DataSetList();
                newFloorList.addRecord(flRecord);

                dsGroupStartDate
                .addQuery(" select min(date_start) ${sql.as} min_date from gp WHERE bl_id='"
                        + gpFloor.getString(GP_BL_ID) + "' and fl_id='"
                        + gpFloor.getString(GP_FL_ID) + "' and portfolio_scenario_id='"
                        + scenarioId + "' and bl_id!='UNALLOC'");
                final DataRecord startDateRecord = dsGroupStartDate.getRecord();

                final String dateStart =
                        DateTime.dateToString(
                            new java.sql.Date(startDateRecord.getDate("gp.min_date").getTime()),
                            "yyyy-MM-dd");
                

                if (!this.createLeaseAreaGroupRecords(scenarioId, newBuildingList, newFloorList,
                    dateStart, null, null, null)) {

                    if (this.isFloorContainsRooms(gpFloor)) {
                        
                        // call existing wfr logic to create gp records with Usable Area - Owned
                        this.createUsableOwnedAreaGroupRecords(scenarioId, newBuildingList,
                            newFloorList, dateStart, null, null, null);
                        
                    } else {
                        // Owned floors that do not have RM records get the usable area from
                        // fl.area_usable.
                        this.createUsableOwnedAreaGroupFromFloor(scenarioId, gpFloor, dateStart);
                    }
                    
                }

                // Only create Unavailable records for floors that do not have RM records no matter
                // they are Owned or Leased
                if (this.isFloorContainsRooms(gpFloor)) {
                    // create gp records with penetration vertial area
                    this.createUnavailablePVAreaGroupRecords(scenarioId, newBuildingList,
                        newFloorList, dateStart, null, null, null);
                    
                    // create gp records with unavailable service area
                    this.createUnavailableServiceAreaGroupRecords(scenarioId, newBuildingList,
                        newFloorList, dateStart, null, null, null);
                    
                    // create gp recors with unavailable remaining area
                    this.createUnavailableRemainingAreaGroupRecords(scenarioId, newBuildingList,
                        newFloorList, dateStart, null, null, null);
                }

            }
            
        }
    }
    
    /**
     * Delete any records that have a Lease Code; it’s cleaner to simply recreate these using the
     * Add Building workflow rule.
     *
     * If there are no actual allocations on the floor, then this Unavailable record can be deleted.
     */
    private void deleteGroups() {
        
        StringBuilder sql = new StringBuilder();
        sql.append(" DELETE FROM gp WHERE gp.ls_id is not null and exists (select 1 from portfolio_scenario where scn_name is null "
                + "and portfolio_scenario.portfolio_scenario_id=gp.portfolio_scenario_id)");
        SqlUtils.executeUpdate(GP_TABLE, sql.toString());

        sql = new StringBuilder();
        sql.append(" DELETE FROM gp  ");
        sql.append(" WHERE not exists (select 1 from gp ${sql.as} g1 where g1.bl_id=gp.bl_id and g1.fl_id=gp.fl_id and ( g1.planning_bu_id is not null or g1.dv_id is not null or g1.dp_id is not null) ) "
                + " and exists (select 1 from portfolio_scenario where scn_name is null and portfolio_scenario.portfolio_scenario_id=gp.portfolio_scenario_id)");
        SqlUtils.executeUpdate(GP_TABLE, sql.toString());
    }
    
    /**
     * Set the Allocation Type and Group Event Names for group records.
     */
    private void updateExistingGroups() {
        
        final StringBuilder sql = new StringBuilder();

        sql.append(" UPDATE gp  ");
        sql.append(" SET allocation_type = ( case when gp.is_available=1 and gp.ls_id is null then 'Allocated Area' ");
        sql.append("                              when gp.is_available=0 then 'Unavailable Area'else gp.allocation_type ");
        sql.append("                         end ), ");
        sql.append("     event_name = gp.description ");
        sql.append(" WHERE exists (select 1 from portfolio_scenario where portfolio_scenario.portfolio_scenario_id=gp.portfolio_scenario_id and portfolio_scenario.scn_name is null) ");
        
        SqlUtils.executeUpdate(GP_TABLE, sql.toString());
    }
    
    /**
     * Set Sort Order (optional)
     *
     * o The default sort_order is based on the size of the stack elements on each floor. The groups
     * with the largest areas are assigned to the lowest sort order, so they appear on the left side
     * of the stack.
     *
     * o For all groups that have a later start date than the Usable Area start date for that floor,
     * set the sort_order to be greater than the maximum sort_order of the allocations on that floor
     * so that it appears to right of all the other allocations on that floor.
     *
     */
    private void updateExistingGroupSortOrder() {
        
        final List<DataRecord> scenarios = this.dsScenario.getRecords(DEFAULT_RESTRICTION);

        this.dsGroup.addSort(GP_TABLE, BL_ID);
        this.dsGroup.addSort(GP_TABLE, FL_ID);
        this.dsGroup.addSort(GP_TABLE, AREA_MANUAL, DataSource.SORT_DESC);

        for (final DataRecord scenario : scenarios) {

            final StringBuilder gpRes = new StringBuilder();
            gpRes.append(" bl_id is not null and fl_id is not null ");
            gpRes
            .append("      and ( planning_bu_id is not null or dv_id is not null or dp_id is not null) ");
            
            gpRes.append(" and portfolio_scenario_id='" + scenario.getString(PORTFOLIO_SCENARIO_ID)
                + "' ");

            final List<DataRecord> gps = this.dsGroup.getRecords(gpRes.toString());

            int count = 0;
            for (final DataRecord gp : gps) {
                gp.setValue(GP_SORT_ORDER, DEFAULT_SORT_ORDER_BASE + (count++));
                this.dsGroup.updateRecord(gp);
            }
        }
    }

    /**
     * Identify records in the sb table that were created prior to the 22.1 Space Requirements.
     * These can be identified by checking for records that have empty values in the fields that
     * were added in 22.1, such as sb.sb_type and sb.sb_level.
     *
     * Update Space Requirements records.
     *
     */
    private void updateSpaceRequirements() {
        
        final StringBuilder sql = new StringBuilder();
        
        sql.append(" UPDATE sb  ");
        sql.append(" SET sb_type = ( case when exists (select 1 from sb_items where sb_items.sb_name=sb.sb_name and sb_items.p01_value is not null  and sb_items.p01_value!=0) then 'Space Forecast' ");
        sql.append("                      else 'Space Requirements'  end ), ");
        sql.append("     sb_level = ( case when exists (select 1 from sb_items where sb_items.sb_name=sb.sb_name and sb_items.dp_id is not null ) then 'dp' ");
        sql.append("                       when exists (select 1 from sb_items where sb_items.sb_name=sb.sb_name and sb_items.dv_id is not null ) then 'dv' ");
        sql.append("                       else 'bu' end  ) ");
        sql.append(" WHERE sb_name in " + SB_NAMES_LIST);
        
        SqlUtils.executeUpdate("sb", sql.toString());
    }

    /**
     * Migrate the Space Requirement items.
     */
    private void updateSpaceRequirementItems() {
        
        final StringBuilder sql = new StringBuilder();
        
        sql.append(" UPDATE sb_items  ");
        sql.append(" SET p12_value = p11_value, ");
        sql.append("     p11_value = p10_value, ");
        sql.append("     p10_value = p09_value, ");
        sql.append("     p09_value = p08_value, ");
        sql.append("     p08_value = p07_value, ");
        sql.append("     p07_value = p06_value, ");
        sql.append("     p06_value = p05_value, ");
        sql.append("     p05_value = p04_value, ");
        sql.append("     p04_value = p03_value, ");
        sql.append("     p03_value = p02_value, ");
        sql.append("     p02_value = p01_value, ");
        sql.append("     p01_value = p00_value, ");
        sql.append("     p00_value = 0, ");
        sql.append("     p12_expr = p11_expr, ");
        sql.append("     p11_expr = p10_expr, ");
        sql.append("     p10_expr = p09_expr, ");
        sql.append("     p09_expr = p08_expr, ");
        sql.append("     p08_expr = p07_expr, ");
        sql.append("     p07_expr = p06_expr, ");
        sql.append("     p06_expr = p05_expr, ");
        sql.append("     p05_expr = p04_expr, ");
        sql.append("     p04_expr = p03_expr, ");
        sql.append("     p03_expr = p02_expr, ");
        sql.append("     p02_expr = p01_expr, ");
        sql.append("     p01_expr = p00_expr, ");
        sql.append("     p00_expr = '0', ");
        sql.append("     rm_std_area = (select rmstd.std_area from rmstd where rmstd.rm_std = sb_items.rm_std) , ");
        sql.append("     cost_of_space =  ${sql.isNull('(select rmstd.cost_of_space from rmstd where rmstd.rm_std = sb_items.rm_std)',0)} , ");
        sql.append("     cost_of_furn = ${sql.isNull('(select rmstd.cost_of_furn from rmstd where rmstd.rm_std = sb_items.rm_std)',0)} , ");
        sql.append("     cost_of_move = ${sql.isNull('(select rmstd.cost_of_move from rmstd where rmstd.rm_std = sb_items.rm_std)',0)} ");
        sql.append(" WHERE sb_name in  " + SB_NAMES_LIST);
        
        SqlUtils.executeUpdate("sb_items", sql.toString());
        
    }

    public boolean createLeaseAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords, final String dateStart,
            final String groupBy, final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs =
                DataSourceFactory.loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                        "createLeasedAreaDs");
        this.addParametersForLeasedAreaDs(inventoryDs, blRecords, flRecords, dateStart);
        final List<DataRecord> allRecords = inventoryDs.getRecords();
        final DataSource saveAllocationDs = this.createDataSourceForLeasedGroup();

        boolean isLeaseCreated = false;
        for (final DataRecord record : allRecords) {
            final DataRecord newGpRecord = saveAllocationDs.createNewRecord();
            newGpRecord.setValue("gp.name", record.getString("gp.name"));
            final String buildingId = record.getString("gp.bl_id");
            newGpRecord.setValue("gp.bl_id", buildingId);
            final String floorId = record.getString("gp.fl_id");
            newGpRecord.setValue("gp.fl_id", floorId);
            final String lsDateStart = record.getString("gp.date_start");
            if (StringUtil.isNullOrEmpty(lsDateStart)) {
                newGpRecord.setValue("gp.date_start",
                    DateTime.stringToDate(dateStart, "yyyy-MM-dd"));
            } else {
                final Date lsDate = DateTime.stringToDate(lsDateStart, "yyyy-MM-dd");
                final Date portfolioStartDate = DateTime.stringToDate(dateStart, "yyyy-MM-dd");
                if (lsDate.after(portfolioStartDate)) {
                    newGpRecord.setValue("gp.date_start", lsDate);
                } else {
                    newGpRecord.setValue("gp.date_start", portfolioStartDate);
                }
            }
            newGpRecord.setValue("gp.date_end",
                DateTime.stringToDate(record.getString("gp.date_end"), "yyyy-MM-dd"));
            newGpRecord.setValue("gp.ls_id", record.getString("gp.ls_id"));
            newGpRecord.setValue("gp.portfolio_scenario_id", portfolioScenarioId);
            newGpRecord.setValue("gp.allocation_type", "Usable Area - Leased");
            newGpRecord.setValue("gp.event_name", "Add space from inventory");
            newGpRecord.setValue("gp.description", record.getString("gp.description"));
            final double areaManual =
                    this.getLeaseAreaFromInventory(record.getString("gp.ls_id"), buildingId,
                        floorId);
            newGpRecord.setValue("gp.area_manual", areaManual);
            newGpRecord.setValue("gp.sort_order",
                this.getFloorSortOrderForLeasedRecord(buildingId, floorId));
            saveAllocationDs.saveRecord(newGpRecord);

            isLeaseCreated = true;
        }

        return isLeaseCreated;
    }

    public void createUsableOwnedAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords, final String dateStart,
            final String groupBy, final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs =
                DataSourceFactory.loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                        "createUsableOwnedAreaDs");
        this.addBuildingAndFloorParameters("CREATE-UNAVAILABLE-AREA", inventoryDs, blRecords,
            flRecords);
        final DataSource newGpDataSource = this.createDataSourceForGroup();
        final List<DataRecord> allRecords = inventoryDs.getRecords();
        int start = 500;
        for (final DataRecord record : allRecords) {
            final DataRecord newGpRec = newGpDataSource.createNewRecord();
            newGpRec.setValue("gp.allocation_type", "Usable Area - Owned");
            newGpRec.setValue("gp.bl_id", record.getString("rm.bl_id"));
            newGpRec.setValue("gp.fl_id", record.getString("rm.fl_id"));

            final int newGpRecOrder = (int) record.getDouble("rm.sort_order");
            if (newGpRecOrder == 0) {
                newGpRec.setValue("gp.sort_order", start);
                start = start + 1;
            } else {
                newGpRec.setValue("gp.sort_order", newGpRecOrder);
            }

            newGpRec.setValue("gp.is_available", 1);
            newGpRec.setValue("gp.area_manual", record.getDouble("rm.usable_owned_area"));
            newGpRec.setValue("gp.name", "Owned Floor");
            newGpRec.setValue("gp.description", "Create Group");
            newGpRec.setValue("gp.event_name", "Add space from inventory");
            newGpRec.setValue("gp.date_start", DateTime.stringToDate(dateStart, "yyyy-MM-dd"));
            newGpRec.setValue("gp.portfolio_scenario_id", portfolioScenarioId);
            newGpDataSource.saveRecord(newGpRec);
        }
    }

    public void createUsableOwnedAreaGroupFromFloor(final String portfolioScenarioId,
            final DataRecord gpFloor, final String dateStart) {

        final DataSource newGpDataSource = this.createDataSourceForGroup();
        int start = 500;
        final DataRecord newGpRec = newGpDataSource.createNewRecord();
        newGpRec.setValue("gp.allocation_type", "Usable Area - Owned");
        newGpRec.setValue("gp.bl_id", gpFloor.getString("gp.bl_id"));
        newGpRec.setValue("gp.fl_id", gpFloor.getString("gp.fl_id"));

        final DataSource dsFloor =
                DataSourceFactory.createDataSourceForFields("fl", new String[] { BL_ID, FL_ID,
                        "area_usable", "sort_order" });
        final DataRecord flRecord =
                dsFloor.getRecord("bl_id='" + gpFloor.getString("gp.bl_id") + "' and fl_id='"
                        + gpFloor.getString("gp.fl_id") + "'");
        
        final int newGpRecOrder = flRecord.getInt("fl.sort_order");
        if (newGpRecOrder == 0) {
            newGpRec.setValue("gp.sort_order", start);
            start = start + 1;
        } else {
            newGpRec.setValue("gp.sort_order", newGpRecOrder);
        }

        newGpRec.setValue("gp.is_available", 1);
        newGpRec.setValue("gp.area_manual", flRecord.getDouble("fl.area_usable"));
        newGpRec.setValue("gp.name", "Owned Floor");
        newGpRec.setValue("gp.description", "Create Group");
        newGpRec.setValue("gp.event_name", "Add space from inventory");
        newGpRec.setValue("gp.date_start", DateTime.stringToDate(dateStart, "yyyy-MM-dd"));
        newGpRec.setValue("gp.portfolio_scenario_id", portfolioScenarioId);
        newGpDataSource.saveRecord(newGpRec);

    }
    
    public void createUnavailablePVAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords, final String dateStart,
            final String groupBy, final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs =
                DataSourceFactory.loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                        "createUnavailableVPAreaDs");
        // this.addRestrictionsForInventoryDataSource(inventoryDs, blRecords, flRecords);
        this.addBuildingAndFloorParameters("CREATE-UNAVAILABLE-AREA", inventoryDs, blRecords,
            flRecords);
        final DataSource newGpDataSource = this.createDataSourceForGroup();
        final List<DataRecord> allRecords = inventoryDs.getRecords();
        for (final DataRecord record : allRecords) {
            final DataRecord newGpRec = newGpDataSource.createNewRecord();
            newGpRec.setValue("gp.allocation_type", "Unavailable - Vertical Penetration Area");
            newGpRec.setValue("gp.bl_id", record.getString("rm.bl_id"));
            newGpRec.setValue("gp.fl_id", record.getString("rm.fl_id"));
            newGpRec.setValue("gp.sort_order", -3);
            newGpRec.setValue("gp.is_available", 1);
            newGpRec.setValue("gp.area_manual", record.getDouble("rm.vert_pene_area"));
            newGpRec.setValue("gp.name", "Unavailable - Vertical Penetration Area");
            newGpRec.setValue("gp.description", "Create Group");
            newGpRec.setValue("gp.event_name", "Add space from inventory");
            newGpRec.setValue("gp.date_start", DateTime.stringToDate(dateStart, "yyyy-MM-dd"));
            newGpRec.setValue("gp.portfolio_scenario_id", portfolioScenarioId);
            newGpDataSource.saveRecord(newGpRec);
        }
    }

    public void createUnavailableServiceAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords, final String dateStart,
            final String groupBy, final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs =
                DataSourceFactory.loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                        "createUnavailableServiceAreaDs");
        // this.addRestrictionsForInventoryDataSource(inventoryDs, blRecords, flRecords);
        this.addBuildingAndFloorParameters("CREATE-UNAVAILABLE-AREA", inventoryDs, blRecords,
            flRecords);
        final DataSource newGpDataSource = this.createDataSourceForGroup();
        final List<DataRecord> allRecords = inventoryDs.getRecords();
        for (final DataRecord record : allRecords) {
            final DataRecord newGpRec = newGpDataSource.createNewRecord();
            newGpRec.setValue("gp.allocation_type", "Unavailable - Service Area");
            newGpRec.setValue("gp.bl_id", record.getString("rm.bl_id"));
            newGpRec.setValue("gp.fl_id", record.getString("rm.fl_id"));
            newGpRec.setValue("gp.sort_order", -2);
            newGpRec.setValue("gp.is_available", 1);
            newGpRec.setValue("gp.area_manual", record.getDouble("rm.unavail_serv_area"));
            newGpRec.setValue("gp.name", "Unavailable - Service Area");
            newGpRec.setValue("gp.description", "Create Group");
            newGpRec.setValue("gp.event_name", "Add space from inventory");
            newGpRec.setValue("gp.date_start", DateTime.stringToDate(dateStart, "yyyy-MM-dd"));
            newGpRec.setValue("gp.portfolio_scenario_id", portfolioScenarioId);
            newGpDataSource.saveRecord(newGpRec);
        }
    }

    public void createUnavailableRemainingAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords, final String dateStart,
            final String groupBy, final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs =
                DataSourceFactory.loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                        "createUnavailableRemainingAreaDs");
        // this.addRestrictionsForInventoryDataSource(inventoryDs, blRecords, flRecords);
        this.addBuildingAndFloorParameters("CREATE-UNAVAILABLE-AREA", inventoryDs, blRecords,
            flRecords);
        final DataSource newGpDataSource = this.createDataSourceForGroup();
        final List<DataRecord> allRecords = inventoryDs.getRecords();
        for (final DataRecord record : allRecords) {
            final DataRecord newGpRec = newGpDataSource.createNewRecord();
            newGpRec.setValue("gp.allocation_type", "Unavailable - Remaining Area");
            newGpRec.setValue("gp.bl_id", record.getString("rm.bl_id"));
            newGpRec.setValue("gp.fl_id", record.getString("rm.fl_id"));
            newGpRec.setValue("gp.sort_order", -1);
            newGpRec.setValue("gp.is_available", 1);
            newGpRec.setValue(
                "gp.area_manual",
                record.getDouble("rm.area_gross") - record.getDouble("rm.area_vert_serv")
                        - record.getDouble("rm.area_usbl"));
            newGpRec.setValue("gp.name", "Unavailable - Remaining Area");
            newGpRec.setValue("gp.description", "Create Group");
            newGpRec.setValue("gp.event_name", "Add space from inventory");
            newGpRec.setValue("gp.date_start", DateTime.stringToDate(dateStart, "yyyy-MM-dd"));
            newGpRec.setValue("gp.portfolio_scenario_id", portfolioScenarioId);
            newGpDataSource.saveRecord(newGpRec);
        }
    }

    private void addParametersForLeasedAreaDs(final DataSource ds, final DataSetList blRecords,
            final DataSetList flRecords, final String dateStart) {
        this.addBuildingAndFloorParameters("CREATED-LEASED-AREA", ds, blRecords, flRecords);
        final String dateStartParameter = dateStart;
        ds.addParameter("portfolioDateStart", dateStartParameter, DataSource.DATA_TYPE_DATE);
    }

    private void addBuildingAndFloorParameters(final String calType, final DataSource ds,
            final DataSetList blRecords, final DataSetList flRecords) {
        ds.addParameter("inventoryBlId", blRecords.getRecords().get(0).getString("bl.bl_id"),
            DataSource.DATA_TYPE_TEXT);
        if (flRecords.getRecords().size() > 0) {
            final StringBuilder strBuilder = new StringBuilder();
            if (calType.equals("CREATED-LEASED-AREA")) {
                strBuilder.append("su.fl_id IN");
            } else if (calType.equals("CREATED-ALLOCATED-AREA-DV")) {
                strBuilder.append("rm.fl_id IN");
            } else if (calType.equals("CREATED-ALLOCATED-AREA-BU")) {
                strBuilder.append("rm.fl_id IN");
            } else if (calType.equals("CREATED-ALLOCATED-AREA-DP-FG")) {
                strBuilder.append("rm.fl_id IN");
            } else if (calType.equals("CREATE-UNAVAILABLE-AREA")) {
                strBuilder.append("rm.fl_id IN");
            }
            strBuilder.append("(");
            strBuilder.append("'");
            strBuilder.append(flRecords.getRecords().get(0).getString("fl.fl_id"));
            strBuilder.append("'");
            final List<DataRecord> inventoryList = flRecords.getRecords();
            for (int i = 1; i < inventoryList.size(); i++) {
                strBuilder.append(", '");
                strBuilder.append(inventoryList.get(i).getString("fl.fl_id"));
                strBuilder.append("'");
            }
            strBuilder.append(")");
            ds.addParameter("inventoryFlIds", strBuilder.toString(), DataSource.DATA_TYPE_VERBATIM);
        }
    }
    
    private DataSource createDataSourceForLeasedGroup() {
        return DataSourceFactory.createDataSourceForFields("gp", new String[] { "gp_id", "name",
                "bl_id", "fl_id", "date_start", "date_end", "ls_id", "portfolio_scenario_id",
                "allocation_type", "event_name", "description", "area_manual", "sort_order" });
    }
    
    private int getFloorSortOrderForLeasedRecord(final String buildingId, final String floorId) {
        final DataSource sortOrderDs = this.createFloorDataSourceForSortOrder();
        sortOrderDs.addRestriction(Restrictions.eq("fl", "fl_id", floorId)).addRestriction(
            Restrictions.eq("fl", "bl_id", buildingId));
        int sortOrder = 200;
        final List<DataRecord> records = sortOrderDs.getRecords();
        if (records.size() > 0) {
            final DataRecord record = records.get(0);
            sortOrder = record.getInt("fl.sort_order");
        }
        return sortOrder;
    }
    
    private DataSource createFloorDataSourceForSortOrder() {
        return DataSourceFactory.createDataSourceForFields("fl", new String[] { "fl_id", "bl_id",
        "sort_order" });
    }

    /**
     * Create datasource for table gp.
     *
     * @return gp datasource
     */
    private DataSource createDataSourceForGroup() {
        return DataSourceFactory.createDataSourceForFields("gp", new String[] { "gp_id",
                "allocation_type", "bl_id", "fl_id", "sort_order", "is_available", "area_manual",
                "name", "description", "event_name", "date_start", "portfolio_scenario_id" });
    }
    
    /** ROOM SUITE lease area method. */
    public static final String LEASE_AREA_METHOD_ROOM_SUITE = "su";
    
    /** group lease area method. */
    public static final String LEASE_AREA_METHOD_ROOM_GROUP = "gp";

    /** room composite lease area method. */
    public static final String LEASE_AREA_METHOD_ROOM_COMPOSITE = "cr";
    
    /** all room lease area method. */
    public static final String LEASE_AREA_METHOD_ROOM_ALLROOM = "ar";
    
    // ----------------------- business methods --------------------------------
    
    /** The preference table name. */
    private static final String PREFERENCE_TBL_NAME = "afm_scmpref";
    
    /** The parameter of the building id. */
    private static final String INVENTORY_BL_ID = "inventoryBlId";

    /** The parameter of the floor id. */
    private static final String INVENTORY_FL_ID = "inventoryFlId";

    /** The parameter of the lease id. */
    private static final String INVENTORY_LS_ID = "inventoryLsId";

    /**
     * Get the lease area for the building and floor.
     *
     * @param blId building id
     * @param flId floor id
     * @param lsId lease id
     * @return the lease area.
     */
    public static double getLeaseAreaFromInventory(final String lsId, final String blId,
            final String flId) {
        final String leaseAreaMethod = getLeaseAreaMethod();
        double area = 0;
        DataSource inventoryDs =
                DataSourceFactory.loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                        "calculateSuLeasedAreaDs");
        if (LEASE_AREA_METHOD_ROOM_GROUP.equalsIgnoreCase(leaseAreaMethod)) {
            inventoryDs =
                    DataSourceFactory.loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                        "calculateGpLeasedAreaDs");
        } else if (LEASE_AREA_METHOD_ROOM_COMPOSITE.equalsIgnoreCase(leaseAreaMethod)
                || LEASE_AREA_METHOD_ROOM_ALLROOM.equalsIgnoreCase(leaseAreaMethod)) {
            inventoryDs =
                    DataSourceFactory.loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                            "calculateRoomCompositeOrAllLeasedAreaDs");
        }
        inventoryDs.addParameter(INVENTORY_BL_ID, blId, DataSource.DATA_TYPE_TEXT);
        inventoryDs.addParameter(INVENTORY_FL_ID, flId, DataSource.DATA_TYPE_TEXT);
        inventoryDs.addParameter(INVENTORY_LS_ID, lsId, DataSource.DATA_TYPE_TEXT);
        final List<DataRecord> records = inventoryDs.getRecords();
        if (!records.isEmpty()) {
            final DataRecord areaRecord = inventoryDs.getRecords().get(0);
            area = areaRecord.getDouble("gp.area");
        }
        return area;
    }

    /**
     * Get the method of lease area.
     *
     * @return the method
     */
    public static String getLeaseAreaMethod() {
        final DataRecord record = getLeasePreferences();
        return record.getString("afm_scmpref.lease_area_type");
    }
    
    /**
     * Get lease preference data record.
     *
     * @return data record.
     */
    private static DataRecord getLeasePreferences() {
        final String[] fieldNames = { "lease_area_type", "lease_proration_method" };
        final DataSource leasePrefDs =
                DataSourceFactory.createDataSourceForFields(PREFERENCE_TBL_NAME, fieldNames);
        return leasePrefDs.getRecord();
    }

    /**
     * Delete any records that have a Lease Code; it’s cleaner to simply recreate these using the
     * Add Building workflow rule.
     *
     * If there are no actual allocations on the floor, then this Unavailable record can be deleted.
     */
    private boolean isFloorContainsRooms(final DataRecord gpFloor) {
        
        final DataSource dsRoom =
                DataSourceFactory.createDataSourceForFields("rm", new String[] { BL_ID, FL_ID, });
        final List<DataRecord> roomListForFloor =
                dsRoom.getRecords("bl_id='" + gpFloor.getString("gp.bl_id") + "' and fl_id='"
                        + gpFloor.getString("gp.fl_id") + "'");
        
        if (roomListForFloor == null || roomListForFloor.isEmpty()) {
            return false;
            
        } else {
            return true;
        }
        
    }

}
