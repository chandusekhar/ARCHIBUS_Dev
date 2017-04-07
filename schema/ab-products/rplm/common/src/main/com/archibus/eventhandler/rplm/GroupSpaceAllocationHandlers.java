package com.archibus.eventhandler.rplm;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.*;

import org.json.*;

import com.archibus.app.rplm.space.*;
import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

public class GroupSpaceAllocationHandlers extends EventHandlerBase {
    
    // @translatable
    public static final String GROUP_DESCRIPTION = "Create Group";
    
    // @translatable
    public static final String UNASSIGNED = "UNASSIGNED";
    
    // @translatable
    public static final String GROWTH_REDUCTION = "Growth/Reduction";
    
    // @translatable
    public static final String LEASE_EVENT = "LEASE INFORMATION";
    
    // @translatable
    public static final String LEASE = "Lease";
    
    /** The view file holding the datasources for creating gp records. */
    public static final String CREATE_GROUP_INVENTORY_DS_FILE_NAME =
            "ab-alloc-wiz-create-gp-inventory-ds.axvw";

    public void getGroupSpaceAllocationData() {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // get data records using the default event handler
        final ViewHandlers defaultHandler = new ViewHandlers();
        defaultHandler.getDataRecords(context);
        
        final JSONArray dataArray = context.getJSONArray("jsonExpression");
        
        //
        // add more records for the available area information
        //
        String viewName = "";
        if (context.parameterExists("viewName")) {
            viewName = context.getString("viewName");
        }
        
        // get restriction
        String restriction = "";
        if (context.parameterExists("restriction")) {
            restriction = context.getString("restriction");
        }
        
        final JSONArray groupingAxisJson = context.getJSONArray("groupingAxis");
        final JSONArray secondaryGroupingAxisJson = context.getJSONArray("secondaryGroupingAxis");
        final JSONArray dataAxisJson = context.getJSONArray("dataAxis");
        
        if (groupingAxisJson != null && groupingAxisJson.length() > 0) {
            
            // get all records for the primary grouping axis
            final JSONObject groupingAxis = (JSONObject) groupingAxisJson.get(0);
            final String groupingAxisDataSourceId = groupingAxis.get("dataSourceId").toString();
            final String groupingAxisFieldName = groupingAxis.get("id").toString();
            final DataSource groupingAxisDataSource =
                    DataSourceFactory.loadDataSourceFromFile(viewName, groupingAxisDataSourceId);
            final List<DataRecord> groupingAxisRecords =
                    groupingAxisDataSource.getRecords(restriction);

            // get the secondaryGroupAxis field name
            final String secondaryGroupingAxisFieldName =
                    ((JSONObject) secondaryGroupingAxisJson.get(0)).get("id").toString();

            // get the dataAxis field name
            final String dataAxisFieldName =
                    ((JSONObject) dataAxisJson.get(0)).get("id").toString();

            new JSONArray();
            final String availableAreaDataSourceId = "ds_availableArea";
            final DataSource availableAreaDataSource =
                    DataSourceFactory.loadDataSourceFromFile(viewName, availableAreaDataSourceId);
            final List<DataRecord> availableAreaRecords = availableAreaDataSource.getRecords();
            
            final JSONArray availableRecords = new JSONArray();
            
            // for each groupingAxisRecord
            // {"gp.area": 2101.97, "gp.bl_fl": "HQ-17"}
            for (int i = 0; i < groupingAxisRecords.size(); i++) {
                final DataRecord groupingAxisRecord = groupingAxisRecords.get(i);
                final Object groupingAxisValue = groupingAxisRecord.getValue(groupingAxisFieldName);
                
                for (int j = 0; j < availableAreaRecords.size(); j++) {
                    final DataRecord availableAreaRecord = availableAreaRecords.get(j);
                    
                    final Object tmpGroupAxisValue =
                            availableAreaRecord.getValue(groupingAxisFieldName);

                    if (groupingAxisValue.toString().compareTo(tmpGroupAxisValue.toString()) == 0) {
                        final Double availableValue =
                                (Double) availableAreaRecord.getValue(dataAxisFieldName);

                        final JSONObject availableRecord = new JSONObject();
                        if (availableValue.doubleValue() < 0) {
                            availableRecord.put(dataAxisFieldName, 0);
                        } else {
                            availableRecord.put(dataAxisFieldName, availableValue);
                        }
                        availableRecord.put(groupingAxisFieldName, groupingAxisValue);
                        
                        availableRecords.put(availableRecord);
                        break;
                    }
                } // end for(int j = 0; j < availableAreaRecords.size(); j++)
            } // end for (int i = 0; i < groupingAxisRecords.size(); i++)
            
            final JSONObject finalAvailableData = new JSONObject();
            finalAvailableData.put("data", availableRecords);
            finalAvailableData.put(secondaryGroupingAxisFieldName, "AVAILABLE");
            
            dataArray.put(finalAvailableData);
            
            // put the updated JSON data back into the response
            context.addResponseParameter("jsonExpression", dataArray.toString());
            
        }
    }
    
    /**
     * Modified for 23.1, see also kb3047638 - By ZY. Copies group records from inventory to the
     * Baseline scenario - Updated by C. Kriezis on 4/12/10 to copy data to any scenario and renamed
     * the rule to reflect this change.
     */
    public void copyGroupInventoryToScenario(final String date_start, final String date_end,
            final String to_portfolio_scenario_id) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        String bl_id = "";
        String fl_id = "";
        String sql = "";
        
        final String[] fieldNames = { "bl_id", "fl_id" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields("fl", fieldNames);
        
        final String restriction = "rtrim(bl_id)" + formatSqlConcat(context)
                + "rtrim(fl_id) in (select rtrim(bl_id)" + formatSqlConcat(context)
                + "rtrim(fl_id) from gp where portfolio_scenario_id IS NULL)";
        ds.addRestriction(Restrictions.sql(restriction));
        
        final List<DataRecord> records = ds.getRecords();
        
        final DataSource dsBl =
                DataSourceFactory.createDataSourceForFields("bl", new String[] { "bl_id" });
        final DataRecord blRecord = dsBl.createNewRecord();
        
        // for each record
        for (final DataRecord record : records) {
            
            bl_id = (String) record.getValue("fl.bl_id");
            fl_id = (String) record.getValue("fl.fl_id");
            
            sql = "DELETE FROM gp where bl_id='" + bl_id + "' AND fl_id='" + fl_id
                    + "' AND portfolio_scenario_id = '" + to_portfolio_scenario_id + "'";

            SqlUtils.executeUpdate("gp", sql);
            
            blRecord.setValue("bl.bl_id", bl_id);
            final DataSetList newBuildingList = new DataSetList();
            newBuildingList.addRecord(blRecord);

            final DataSetList newFloorList = new DataSetList();
            newFloorList.addRecord(record);
            
            this.createLeaseAreaGroupRecords(to_portfolio_scenario_id, newBuildingList,
                newFloorList, null, date_start, null, null, null);

            // create gp records with Usable Area - Owned
            this.createUsableOwnedAreaGroupRecords(to_portfolio_scenario_id, newBuildingList,
                newFloorList, null, date_start, null, null, null);

            // create gp records with penetration vertial area
            this.createUnavailablePVAreaGroupRecords(to_portfolio_scenario_id, newBuildingList,
                newFloorList, null, date_start, null, null, null);

            // create gp records with unavailable service area
            this.createUnavailableServiceAreaGroupRecords(to_portfolio_scenario_id, newBuildingList,
                newFloorList, null, date_start, null, null, null);

            // create gp recors with unavailable remaining area
            this.createUnavailableRemainingAreaGroupRecords(to_portfolio_scenario_id,
                newBuildingList, newFloorList, null, date_start, null, null, null);

            sql = "INSERT INTO gp (portfolio_scenario_id,date_start,date_end,gp_num,name,head,description,gp_function,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,area_manual,pct_floor)"
                    + " SELECT '" + to_portfolio_scenario_id + "',"
                    + formatSqlIsoToNativeDate(context, date_start) + ","
                    + formatSqlIsoToNativeDate(context, date_end)
                    + ",gp_num,name,head,description,gp_function,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,(case when area_manual is null or area_manual=0 then area else area_manual end),pct_floor"
                    + " FROM gp where dp_id IS NOT NULL and portfolio_scenario_id IS NULL AND bl_id='"
                    + bl_id + "' AND fl_id='" + fl_id + "'";
                    
            SqlUtils.executeUpdate("gp", sql);
        }
    }
    
    /**
     * Create Groups from Room and Employee Inventory. Department Employee Headcounts are derived
     * from the Employees table. Department Floor Area Allocations are derived from the Room table.
     *
     */
    public void createGroupFromInventory(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords, final String dateStart,
            final String groupBy, final Double pct_growth, final String unitTitle) {
        // Call the existing method to create gp records with Allocated Area
        // this.addRmEmLsGroups(portfolioScenarioId, blRecords, flRecords, dateStart, groupBy,
        // pct_growth, unitTitle);
        final List<DataRecord> blRecordList = blRecords.getRecords();

        final DataSource existingGroupFloorDataSource = DataSourceFactory.loadDataSourceFromFile(
            CREATE_GROUP_INVENTORY_DS_FILE_NAME, "existingGroupFloorDataSource");
        existingGroupFloorDataSource.addParameter("scn_id", portfolioScenarioId,
            DataSource.DB_ROLE_DATA);
        existingGroupFloorDataSource.addParameter("bl_id",
            blRecordList.get(0).getString("bl.bl_id"), DataSource.DB_ROLE_DATA);
        final List<DataRecord> existingFloors = existingGroupFloorDataSource.getAllRecords();

        for (final DataRecord record : blRecordList) {
            final DataSetList newBuildingList = new DataSetList();
            newBuildingList.addRecord(record);

            this.createLeaseAreaGroupRecords(portfolioScenarioId, newBuildingList, flRecords,
                existingFloors, dateStart, groupBy, pct_growth, unitTitle);

            this.createAllocatedAreaGroupRecords(portfolioScenarioId, newBuildingList, flRecords,
                existingFloors, dateStart, groupBy, pct_growth, unitTitle);

            // create gp records with Usable Area - Owned
            this.createUsableOwnedAreaGroupRecords(portfolioScenarioId, newBuildingList, flRecords,
                existingFloors, dateStart, groupBy, pct_growth, unitTitle);

            // create gp records with Usable Area - Owned
            this.createEmptyAvailableAreaGroupRecords(portfolioScenarioId, newBuildingList,
                flRecords, existingFloors, dateStart, groupBy, pct_growth, unitTitle);

            // create gp records with penetration vertial area
            this.createUnavailablePVAreaGroupRecords(portfolioScenarioId, newBuildingList,
                flRecords, existingFloors, dateStart, groupBy, pct_growth, unitTitle);

            // create gp records with unavailable service area
            this.createUnavailableServiceAreaGroupRecords(portfolioScenarioId, newBuildingList,
                flRecords, existingFloors, dateStart, groupBy, pct_growth, unitTitle);

            // create gp recors with unavailable remaining area
            this.createUnavailableRemainingAreaGroupRecords(portfolioScenarioId, newBuildingList,
                flRecords, existingFloors, dateStart, groupBy, pct_growth, unitTitle);
        }
    }
    
    private void createLeaseAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords,
            final List<DataRecord> existingFloors, final String dateStart, final String groupBy,
            final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs = DataSourceFactory
            .loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME, "createLeasedAreaDs");
        this.addParametersForLeasedAreaDs(inventoryDs, blRecords, flRecords, existingFloors,
            dateStart);
        final List<DataRecord> allRecords = inventoryDs.getRecords();
        final DataSource saveAllocationDs = this.createDataSourceForLeasedGroup();
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
            final double areaManual = LeaseAreaHelper
                .getLeaseAreaFromInventory(record.getString("gp.ls_id"), buildingId, floorId);
            newGpRecord.setValue("gp.area_manual", areaManual);
            newGpRecord.setValue("gp.sort_order",
                this.getFloorSortOrderForLeasedRecord(buildingId, floorId));
            saveAllocationDs.saveRecord(newGpRecord);
        }
    }

    private void addParametersForLeasedAreaDs(final DataSource ds, final DataSetList blRecords,
            final DataSetList flRecords, final List<DataRecord> existingFloors,
            final String dateStart) {
        this.addBuildingAndFloorParameters("CREATED-LEASED-AREA", ds, blRecords, flRecords,
            existingFloors);
        final String dateStartParameter = dateStart;
        ds.addParameter("portfolioDateStart", dateStartParameter, DataSource.DATA_TYPE_DATE);
    }

    private int getFloorSortOrderForLeasedRecord(final String buildingId, final String floorId) {
        final DataSource sortOrderDs = this.createFloorDataSourceForSortOrder();
        sortOrderDs.addRestriction(Restrictions.eq("fl", "fl_id", floorId))
            .addRestriction(Restrictions.eq("fl", "bl_id", buildingId));
        int sortOrder = 200;
        final List<DataRecord> records = sortOrderDs.getRecords();
        if (records.size() > 0) {
            final DataRecord record = records.get(0);
            sortOrder = record.getInt("fl.sort_order");
        }
        return sortOrder;
    }

    private DataSource createDataSourceForLeasedGroup() {
        return DataSourceFactory.createDataSourceForFields("gp",
            new String[] { "gp_id", "name", "bl_id", "fl_id", "date_start", "date_end", "ls_id",
                    "portfolio_scenario_id", "allocation_type", "event_name", "description",
                    "area_manual", "sort_order" });
    }
    
    private DataSource createFloorDataSourceForSortOrder() {
        return DataSourceFactory.createDataSourceForFields("fl",
            new String[] { "fl_id", "bl_id", "sort_order" });
    }

    private void createAllocatedAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords,
            final List<DataRecord> existingFloors, final String dateStart, final String groupBy,
            final Double pct_growth, final String unitTitle) {
        DataSource inventoryDs = null;
        List<DataRecord> allRecords = null;
        String allocatedFloorType = "";
        if (groupBy.equalsIgnoreCase("dv")) {
            inventoryDs = DataSourceFactory.loadDataSourceFromFile(
                CREATE_GROUP_INVENTORY_DS_FILE_NAME, "createAllocatedAreaDvLevelDs");
            allocatedFloorType = "CREATED-ALLOCATED-AREA-DV";
        } else if (groupBy.equalsIgnoreCase("bu")) {
            inventoryDs = DataSourceFactory.loadDataSourceFromFile(
                CREATE_GROUP_INVENTORY_DS_FILE_NAME, "createAllocatedAreaBuLevelDs");
            allocatedFloorType = "CREATED-ALLOCATED-AREA-BU";
        } else if (groupBy.equalsIgnoreCase("dp") || groupBy.equalsIgnoreCase("fg")) {
            inventoryDs = DataSourceFactory.loadDataSourceFromFile(
                CREATE_GROUP_INVENTORY_DS_FILE_NAME, "createAllocatedAreaDpOrFgLevelDs");
            allocatedFloorType = "CREATED-ALLOCATED-AREA-DP-FG";
        }
        final DataSource newGpDataSource = this.createDataSourceForAllocatedGroup();
        this.addBuildingAndFloorParameters(allocatedFloorType, inventoryDs, blRecords, flRecords,
            existingFloors);
        allRecords = inventoryDs.getRecords();
        int incrementSortOrder = 1;
        for (final DataRecord record : allRecords) {
            final DataRecord newGpRec = newGpDataSource.createNewRecord();
            newGpRec.setValue("gp.name", record.getString("gp.name"));
            newGpRec.setValue("gp.bl_id", record.getString("gp.bl_id"));
            newGpRec.setValue("gp.fl_id", record.getString("gp.fl_id"));
            newGpRec.setValue("gp.allocation_type", "Allocated Area");
            String name = record.getString("gp.name");
            if (groupBy.equalsIgnoreCase("fg")) {
                name = record.getString("gp.dp_id");
                if (name == null || name.equalsIgnoreCase("")) {
                    name = "UNASSIGNED";
                }
            }
            
            // Since the records are sorted by area manual in decreasing order, the sort order will
            // be incremented.
            newGpRec.setValue("gp.sort_order", incrementSortOrder);
            incrementSortOrder += 1;
            newGpRec.setValue("gp.planning_bu_id", record.getValue("gp.bu_id"));
            if (groupBy.equalsIgnoreCase("dv")) {
                newGpRec.setValue("gp.dv_id", record.getValue("gp.dv_id"));
                newGpRec.setValue("gp.dp_id", "");
            } else if (groupBy.equalsIgnoreCase("bu")) {
                newGpRec.setValue("gp.dv_id", "");
                newGpRec.setValue("gp.dp_id", "");
            } else if (groupBy.equalsIgnoreCase("dp") || groupBy.equalsIgnoreCase("fg")) {
                newGpRec.setValue("gp.dv_id", record.getValue("gp.dv_id"));
                newGpRec.setValue("gp.dp_id", record.getValue("gp.dp_id"));
            }
            newGpRec.setValue("gp.gp_std", "DEPT-AREA");
            newGpRec.setValue("gp.count_em", record.getInt("gp.count_em"));
            newGpRec.setValue("gp.area_manual", record.getDouble("gp.area_manual"));
            newGpRec.setValue("gp.pct_floor", record.getDouble("gp.pct_floor"));
            newGpRec.setValue("gp.area_chargable", record.getDouble("gp.area_chargable"));
            newGpRec.setValue("gp.area_comn", record.getDouble("gp.area_comn"));
            newGpRec.setValue("gp.area_comn_gp", record.getDouble("gp.area_comn_rm"));
            newGpRec.setValue("gp.area_comn_serv", record.getDouble("gp.area_comn_serv"));
            newGpRec.setValue("gp.date_start", DateTime.stringToDate(dateStart, "yyyy-MM-dd"));
            newGpRec.setValue("gp.portfolio_scenario_id", portfolioScenarioId);
            newGpRec.setValue("gp.description", "Create Group");
            newGpRec.setValue("gp.event_name", "Add space from inventory");
            newGpDataSource.saveRecord(newGpRec);
        }
    }

    private void addBuildingAndFloorParameters(final String calType, final DataSource ds,
            final DataSetList blRecords, final DataSetList flRecords,
            final List<DataRecord> existingFloors) {
        ds.addParameter("inventoryBlId", blRecords.getRecords().get(0).getString("bl.bl_id"),
            DataSource.DATA_TYPE_TEXT);

        final StringBuilder strBuilder = new StringBuilder();
        if (calType.equals("CREATED-LEASED-AREA")) {
            strBuilder.append("su.fl_id ");
        } else if (calType.equals("CREATED-ALLOCATED-AREA-DV")) {
            strBuilder.append("rm.fl_id ");
        } else if (calType.equals("CREATED-ALLOCATED-AREA-BU")) {
            strBuilder.append("rm.fl_id ");
        } else if (calType.equals("CREATED-ALLOCATED-AREA-DP-FG")) {
            strBuilder.append("rm.fl_id ");
        } else if (calType.equals("CREATE-UNAVAILABLE-AREA")) {
            strBuilder.append("rm.fl_id ");
        }

        if (flRecords.getRecords().size() > 0) {
            strBuilder.append(" IN (");
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
        } else {
            if (existingFloors!=null && !existingFloors.isEmpty()) {
                strBuilder.append(" NOT  IN (");
                for (final DataRecord floorRecord : existingFloors) {
                    strBuilder.append("'");
                    strBuilder.append(floorRecord.getString("fl.fl_id"));
                    strBuilder.append("'");
                    strBuilder.append(",");
                }
                strBuilder.replace(strBuilder.length() - 1, strBuilder.length(), ") ");
                ds.addParameter("inventoryFlIds", strBuilder.toString(),
                    DataSource.DATA_TYPE_VERBATIM);
            }
            
        }
    }

    private DataSource createDataSourceForAllocatedGroup() {
        return DataSourceFactory.createDataSourceForFields("gp",
            new String[] { "gp_id", "gp_std", "count_em", "allocation_type", "bl_id", "fl_id",
                    "sort_order", "planning_bu_id", "dv_id", "dp_id", "area_manual", "name",
                    "description", "event_name", "date_start", "portfolio_scenario_id", "pct_floor",
                    "area_chargable", "area_comn", "area_comn_gp", "area_comn_serv", });
    }

    private void createUsableOwnedAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords,
            final List<DataRecord> existingFloors, final String dateStart, final String groupBy,
            final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs = DataSourceFactory
            .loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME, "createUsableOwnedAreaDs");
        this.addBuildingAndFloorParameters("CREATE-UNAVAILABLE-AREA", inventoryDs, blRecords,
            flRecords, existingFloors);
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

    private void createEmptyAvailableAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords,
            final List<DataRecord> existingFloors, final String dateStart, final String groupBy,
            final Double pct_growth, final String unitTitle) {

        final DataSource noAvailableAreaGpFlDs = DataSourceFactory
            .loadDataSourceFromFile(CREATE_GROUP_INVENTORY_DS_FILE_NAME, "noAvailableAreaGpFlDs");
        noAvailableAreaGpFlDs.addParameter("scn_id", portfolioScenarioId, DataSource.DB_ROLE_DATA);
        noAvailableAreaGpFlDs.addParameter("bl_id",
            blRecords.getRecords().get(0).getString("bl.bl_id"), DataSource.DB_ROLE_DATA);

        final StringBuilder flIdRes = new StringBuilder();
        flIdRes.append("(");
        if (flRecords.getRecords().size() > 0) {
            flIdRes.append(" fl.fl_id=");
            flIdRes.append("'");
            flIdRes.append(flRecords.getRecords().get(0).getString("fl.fl_id"));
            flIdRes.append("'");
            final List<DataRecord> inventoryList = flRecords.getRecords();
            for (int i = 1; i < inventoryList.size(); i++) {
                flIdRes.append(" or fl.fl_id='");
                flIdRes.append(inventoryList.get(i).getString("fl.fl_id"));
                flIdRes.append("' ");
            }
        } else {
            flIdRes.append(" 1=1 ");
        }
        flIdRes.append(")");
        noAvailableAreaGpFlDs.addParameter("fl_id", flIdRes.toString(),
            DataSource.DATA_TYPE_VERBATIM);

        final DataSource newGpDataSource = this.createDataSourceForGroup();
        final List<DataRecord> allFloors = noAvailableAreaGpFlDs.getRecords();
        for (final DataRecord record : allFloors) {
            final DataRecord newGpRec = newGpDataSource.createNewRecord();
            newGpRec.setValue("gp.allocation_type", "Usable Area - Owned");
            newGpRec.setValue("gp.bl_id", record.getString("fl.bl_id"));
            newGpRec.setValue("gp.fl_id", record.getString("fl.fl_id"));

            newGpRec.setValue("gp.is_available", 1);
            newGpRec.setValue("gp.area_manual", 0.0);
            newGpRec.setValue("gp.name", "Owned Floor");
            newGpRec.setValue("gp.description", "Create Group");
            newGpRec.setValue("gp.event_name", "Add space from inventory");
            newGpRec.setValue("gp.date_start", DateTime.stringToDate(dateStart, "yyyy-MM-dd"));
            newGpRec.setValue("gp.portfolio_scenario_id", portfolioScenarioId);
            newGpDataSource.saveRecord(newGpRec);
        }
    }

    private void createUnavailablePVAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords,
            final List<DataRecord> existingFloors, final String dateStart, final String groupBy,
            final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs = DataSourceFactory.loadDataSourceFromFile(
            CREATE_GROUP_INVENTORY_DS_FILE_NAME, "createUnavailableVPAreaDs");
        // this.addRestrictionsForInventoryDataSource(inventoryDs, blRecords, flRecords);
        this.addBuildingAndFloorParameters("CREATE-UNAVAILABLE-AREA", inventoryDs, blRecords,
            flRecords, existingFloors);
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

    private void createUnavailableServiceAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords,
            final List<DataRecord> existingFloors, final String dateStart, final String groupBy,
            final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs = DataSourceFactory.loadDataSourceFromFile(
            CREATE_GROUP_INVENTORY_DS_FILE_NAME, "createUnavailableServiceAreaDs");
        // this.addRestrictionsForInventoryDataSource(inventoryDs, blRecords, flRecords);
        this.addBuildingAndFloorParameters("CREATE-UNAVAILABLE-AREA", inventoryDs, blRecords,
            flRecords, existingFloors);
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

    private void createUnavailableRemainingAreaGroupRecords(final String portfolioScenarioId,
            final DataSetList blRecords, final DataSetList flRecords,
            final List<DataRecord> existingFloors, final String dateStart, final String groupBy,
            final Double pct_growth, final String unitTitle) {
        final DataSource inventoryDs = DataSourceFactory.loadDataSourceFromFile(
            CREATE_GROUP_INVENTORY_DS_FILE_NAME, "createUnavailableRemainingAreaDs");
        // this.addRestrictionsForInventoryDataSource(inventoryDs, blRecords, flRecords);
        this.addBuildingAndFloorParameters("CREATE-UNAVAILABLE-AREA", inventoryDs, blRecords,
            flRecords, existingFloors);
        final DataSource newGpDataSource = this.createDataSourceForGroup();
        final List<DataRecord> allRecords = inventoryDs.getRecords();
        for (final DataRecord record : allRecords) {
            final DataRecord newGpRec = newGpDataSource.createNewRecord();
            newGpRec.setValue("gp.allocation_type", "Unavailable - Remaining Area");
            newGpRec.setValue("gp.bl_id", record.getString("rm.bl_id"));
            newGpRec.setValue("gp.fl_id", record.getString("rm.fl_id"));
            newGpRec.setValue("gp.sort_order", -1);
            newGpRec.setValue("gp.is_available", 1);
            newGpRec.setValue("gp.area_manual", record.getDouble("rm.area_gross")
                    - record.getDouble("rm.area_vert_serv") - record.getDouble("rm.area_usbl"));
            newGpRec.setValue("gp.name", "Unavailable - Remaining Area");
            newGpRec.setValue("gp.description", "Create Group");
            newGpRec.setValue("gp.event_name", "Add space from inventory");
            newGpRec.setValue("gp.date_start", DateTime.stringToDate(dateStart, "yyyy-MM-dd"));
            newGpRec.setValue("gp.portfolio_scenario_id", portfolioScenarioId);
            newGpDataSource.saveRecord(newGpRec);
        }
    }

    /**
     * Create datasource for table gp.
     *
     * @return gp datasource
     */
    private DataSource createDataSourceForGroup() {
        return DataSourceFactory.createDataSourceForFields("gp",
            new String[] { "gp_id", "allocation_type", "bl_id", "fl_id", "sort_order",
                    "is_available", "area_manual", "name", "description", "event_name",
                    "date_start", "portfolio_scenario_id" });
    }

    /**
     * Create Groups from Room and Employee Inventory. Department Employee Headcounts are derived
     * from the Employees table. Department Floor Area Allocations are derived from the Room table.
     *
     * Add Leave Events (groups) where corresponding suites exist with active leases.
     *
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     */
    public void addRmEmLsGroups(final String portfolio_scenario_id, final DataSetList blRecords,
            final DataSetList flRecords, final String date_start, final String groupBy,
            final Double pct_growth, final String unitTitle) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        addBlLeaseEvents(context, portfolio_scenario_id, blRecords, flRecords, date_start,
            unitTitle);

        String gpFieldList = "planning_bu_id, dv_id, dp_id, ";
        String rmFieldList =
                "CASE WHEN dv.bu_id = 'WW99' THEN '' ELSE dv.bu_id END ${sql.as} bu_id, rm.dv_id, rm.dp_id, ";
        String groupByClause = "rm.bl_id, rm.fl_id, dv.bu_id, rm.dv_id, rm.dp_id ";
        String nameClause = "CASE WHEN rm.dp_id IS NULL THEN '" + UNASSIGNED
                + "' ELSE (UPPER(RTRIM(rm.dv_id)) " + formatSqlConcat(context) + " '-' "
                + formatSqlConcat(context) + " UPPER(RTRIM(rm.dp_id))) END";
        String emWhereClause =
                "em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.dv_id = rm.dv_id AND em.dp_id = rm.dp_id";
        final double pct_growth_multiplier = 1.00 + 0.01 * pct_growth;
        String pctGrowthClause = "(CASE WHEN (rm.dv_id IS NULL AND rm.dp_id IS NULL) THEN 1 ELSE "
                + pct_growth_multiplier + " END)";
        final String description = "'" + GROUP_DESCRIPTION + "' ";
        String descriptionClause =
                "(CASE WHEN (rm.dv_id IS NULL AND rm.dp_id IS NULL) THEN '' ELSE ";

        if (groupBy.equals("bu")) {
            gpFieldList = "planning_bu_id, ";
            rmFieldList = "CASE WHEN dv.bu_id = 'WW99' THEN '' ELSE dv.bu_id END ${sql.as} bu_id, ";
            groupByClause = "rm.bl_id, rm.fl_id, dv.bu_id ";
            nameClause = "CASE WHEN dv.bu_id = 'WW99' THEN '" + UNASSIGNED
                    + "' WHEN dv.bu_id IS NULL THEN '" + UNASSIGNED
                    + "' ELSE UPPER(RTRIM(dv.bu_id)) END";
            emWhereClause =
                    "em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND dv.bu_id = division.bu_id";
            pctGrowthClause =
                    "(CASE WHEN (dv.bu_id IS NULL) THEN 1 ELSE " + pct_growth_multiplier + " END)";
            descriptionClause = "(CASE WHEN (dv.bu_id IS NULL) THEN '' ELSE ";
        }
        if (groupBy.equals("dv")) {
            gpFieldList = "planning_bu_id, dv_id, ";
            rmFieldList =
                    "CASE WHEN dv.bu_id = 'WW99' THEN '' ELSE dv.bu_id END ${sql.as} bu_id, rm.dv_id, ";
            groupByClause = "rm.bl_id, rm.fl_id, dv.bu_id, rm.dv_id ";
            nameClause = "CASE WHEN rm.dv_id IS NULL THEN '" + UNASSIGNED
                    + "' ELSE UPPER(RTRIM(rm.dv_id)) END";
            emWhereClause = "em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.dv_id = rm.dv_id";
            pctGrowthClause =
                    "(CASE WHEN (rm.dv_id IS NULL) THEN 1 ELSE " + pct_growth_multiplier + " END)";
            descriptionClause = "(CASE WHEN (rm.dv_id IS NULL) THEN '' ELSE ";
        }

        String blIdList = "";
        for (final DataRecord record : blRecords.getRecords()) {
            if (blIdList != "") {
                blIdList += ", ";
            }
            blIdList += "'" + record.getString("bl.bl_id") + "'";
        }

        String flIdList = "IS NOT NULL";
        final List<DataRecord> flRecordList = flRecords.getRecords();
        final int flRecordSize = flRecordList.size();
        for (int i = 0; i < flRecordSize; i++) {
            if (i == 0) {
                flIdList = "IN ('" + flRecordList.get(i).getString("fl.fl_id") + "'";
            } else {
                if (i == flRecordSize - 1) {
                    flIdList = flIdList + ", '" + flRecordList.get(i).getString("fl.fl_id") + "')";
                } else {
                    flIdList = flIdList + ", '" + flRecordList.get(i).getString("fl.fl_id") + "'";
                }
            }
        }

        if (pct_growth > 0 || pct_growth < 0) {
            descriptionClause += "' (" + pct_growth + "% " + GROWTH_REDUCTION + ")'";
        } else {
            descriptionClause += "''";
        }
        descriptionClause += " END)";

        final StringBuilder sql = new StringBuilder();
        sql.append(" INSERT INTO gp(name, bl_id, fl_id, allocation_type, sort_order, " + gpFieldList
                + "gp_std, count_em, area_manual, pct_floor, ");
        sql.append(
            "     area_chargable, area_comn, area_comn_gp, area_comn_serv, date_start, portfolio_scenario_id, description ) ");
        sql.append(" SELECT " + nameClause + ", ");
        sql.append(" rm.bl_id, rm.fl_id, 'Allocated Area', 100, " + rmFieldList + "'DEPT-AREA', ");
        sql.append(
            " (SELECT COUNT(em.em_id) FROM em LEFT OUTER JOIN (SELECT CASE WHEN dv.bu_id IS NULL THEN 'WW99' ELSE dv.bu_id END ${sql.as} bu_id, dv.dv_id FROM dv) ${sql.as} division ON em.dv_id = division.dv_id WHERE "
                    + emWhereClause + ") * " + pctGrowthClause + ", ");
        sql.append(" SUM(rm.area) * " + pctGrowthClause + ", ");
        sql.append(" CASE WHEN MAX(fl.area_rm) = 0 THEN 0 ELSE 100*(SUM(rm.area) * "
                + pctGrowthClause + ")/MAX(fl.area_rm) END, ");
        sql.append(" SUM(rm.area_chargable) * " + pctGrowthClause + ",  ");
        sql.append(" SUM(rm.area_comn) * " + pctGrowthClause + ", ");
        sql.append(" SUM(rm.area_comn_rm) * " + pctGrowthClause + ", ");
        sql.append(" SUM(rm.area_comn_serv) * " + pctGrowthClause + ",  ");
        sql.append(formatSqlIsoToNativeDate(context, date_start) + ", ");
        sql.append("'" + portfolio_scenario_id + "', ");
        sql.append(description + formatSqlConcat(context) + descriptionClause);
        sql.append(" FROM rm ");
        sql.append(
            " LEFT OUTER JOIN (SELECT CASE WHEN dv.bu_id IS NULL THEN 'WW99' ELSE dv.bu_id END ${sql.as} bu_id, dv_id FROM dv) ${sql.as} dv ON rm.dv_id = dv.dv_id ");
        sql.append(" LEFT OUTER JOIN fl ON fl.fl_id = rm.fl_id AND fl.bl_id = rm.bl_id ");
        sql.append(" LEFT OUTER JOIN rmcat ON rm.rm_cat= rmcat.rm_cat");
        sql.append(" WHERE rm.bl_id IN (" + blIdList + ") ");
        sql.append(" AND rmcat.supercat = 'USBL' ");
        sql.append(" AND rm.fl_id ");
        sql.append(flIdList);
        sql.append(
            " AND ((SELECT COUNT(em.em_id) FROM em LEFT OUTER JOIN (SELECT CASE WHEN dv.bu_id IS NULL THEN 'WW99' ELSE dv.bu_id END ${sql.as} bu_id, dv.dv_id FROM dv) ${sql.as} division ON em.dv_id = division.dv_id WHERE "
                    + emWhereClause + ") > 0 OR rm.dv_id IS NOT NULL OR rm.dp_id IS NOT NULL)");
        sql.append(" GROUP BY " + groupByClause + " ");
        sql.append(" ORDER BY " + groupByClause + " ");
        SqlUtils.executeUpdate("gp", sql.toString());

    }

    private void addBlLeaseEvents(final EventHandlerContext context,
            final String portfolio_scenario_id, final DataSetList blRecords,
            final DataSetList flRecords, final String date_start, final String unitTitle) {

        final String description = "'" + LEASE + " ' " + formatSqlConcat(context) + " ls.ls_id ";
        String blIdList = "";
        for (final DataRecord record : blRecords.getRecords()) {
            if (blIdList != "") {
                blIdList += ", ";
            }
            blIdList += "'" + record.getString("bl.bl_id") + "'";
        }

        String flIdList = "1=1";
        final List<DataRecord> flRecordList = flRecords.getRecords();
        final int flRecordSize = flRecordList.size();
        for (int i = 0; i < flRecordSize; i++) {
            if (i == 0) {
                flIdList = "su.fl_id IN ('" + flRecordList.get(i).getString("fl.fl_id") + "'";
            } else {
                if (i == flRecordSize - 1) {
                    flIdList = flIdList + ", '" + flRecordList.get(i).getString("fl.fl_id") + "')";
                } else {
                    flIdList = flIdList + ", '" + flRecordList.get(i).getString("fl.fl_id") + "'";
                }
            }
        }

        final StringBuilder sql = new StringBuilder();
        sql.append(
            " INSERT INTO gp(name, bl_id, fl_id, date_start, date_end, ls_id, portfolio_scenario_id, allocation_type, event_name, description) ");
        sql.append(" SELECT '" + LEASE_EVENT + "', ");
        sql.append(" su.bl_id, su.fl_id, ");
        sql.append(formatSqlIsoToNativeDate(context, date_start) + ", ");
        sql.append(" MIN(ls.date_end), ls.ls_id, ");
        sql.append("'" + portfolio_scenario_id + "', ");
        sql.append("'Usable Area - Leased', ");
        sql.append("'Add space from inventory', ");
        sql.append(description);
        sql.append(" FROM su ");
        sql.append(" LEFT OUTER JOIN ls ON ls.ls_id = su.ls_id ");
        sql.append(" WHERE su.bl_id IN (" + blIdList + ") ");
        sql.append(" AND " + flIdList);
        sql.append(" AND ls.use_as_template = 0 ");
        sql.append(" AND ls.date_start IS NOT NULL ");
        sql.append(" AND (ls.date_end IS NULL OR ls.date_end >= "
                + formatSqlIsoToNativeDate(context, date_start) + ")");
        sql.append(" AND su.ls_id IS NOT NULL");
        sql.append(" GROUP BY su.bl_id, su.fl_id, ls.ls_id ");
        sql.append(" ORDER BY su.bl_id, su.fl_id, ls.ls_id ");
        SqlUtils.executeUpdate("gp", sql.toString());
    }

    /**
     * Returns grid records with overallocation alert
     *
     * @param parameters
     * @return List<DataRecord>, empty if there are no such records.
     */
    public final DataSetList getEvtsListRecords(final JSONObject parameters) {
        final DataSource dataSource = DataSourceFactory
            .loadDataSourceFromFile("ab-alloc-wiz-evts.axvw", "allocWizEvtsList_ds0");
        dataSource.setContext();
        String restriction = "";
        if (parameters.has("restriction")) {
            restriction = parameters.getString("restriction");
        }

        final List<DataRecord> records = dataSource.getRecords(restriction);
        final User user = ContextStore.get().getUser();
        JSONObject overAllocJSON = null;
        String isOverAlloc = null;
        String localizedDateStart = null;
        String localizedDateEnd = null;
        Double convFactor = (double) 1;
        Double area, areaManual, areaLs;
        
        if (ContextStore.get().getProject().getUnits() != user.getDisplayUnits()) {
            convFactor = 1 / user.getAreaUnits().getConversionFactor();
        }

        for (final DataRecord record : records) {
            overAllocJSON = getOverAllocJSON(record);
            isOverAlloc = overAllocJSON.getString("isOverAlloc");
            record.setValue("gp.option1", isOverAlloc);
            localizedDateStart = record.findField("gp.date_start").getLocalizedValue();
            localizedDateEnd = record.findField("gp.date_end").getLocalizedValue();
            areaManual = record.getDouble("gp.area_manual");
            area = record.getDouble("gp.area");
            areaLs = record.getDouble("gp.ls_area");
            record.setValue("gp.area_manual", areaManual * convFactor);
            record.setValue("gp.area", area * convFactor);
            record.setValue("gp.ls_area", areaLs * convFactor);
            record.setValue("gp.date_start", localizedDateStart);
            record.setValue("gp.date_end", localizedDateEnd);
        }

        return new DataSetList(records);
    }

    public final JSONObject getOverAllocJSON(final DataRecord record) {
        final JSONObject overAllocJSON = new JSONObject().put("isOverAlloc", "0");

        final String scnId = (String) record.getValue("gp.portfolio_scenario_id");
        final String blId = (String) record.getValue("gp.bl_id");
        final String flId = (String) record.getValue("gp.fl_id");

        DataSource dataSource = null;
        java.util.Date dateReview = null;
        List<DataRecord> allocRecords = null;
        DataRecord overAllocRecord = null;

        final List<DataRecord> dateReviewRecords = getDateReviewRecords(record);
        for (final DataRecord dateReviewRecord : dateReviewRecords) {
            dateReview = dateReviewRecord.getDate("gp.date_start");
            dataSource = DataSourceFactory.loadDataSourceFromFile("ab-alloc-wiz-common.axvw",
                "allocWizCommon_ds1");
            dataSource.addRestriction(Restrictions.eq("gp", "portfolio_scenario_id", scnId));
            dataSource.addRestriction(Restrictions.eq("gp", "bl_id", blId));
            dataSource.addRestriction(Restrictions.eq("gp", "fl_id", flId));
            dataSource.addRestriction(Restrictions.eq("gp", "option1", "1"));
            dataSource.addParameter("dateReview", dateReview, DataSource.DATA_TYPE_DATE);
            allocRecords = dataSource.getRecords();
            if (allocRecords.size() > 0) {
                overAllocRecord = allocRecords.get(0);
                overAllocJSON.remove("isOverAlloc");
                overAllocJSON.put("isOverAlloc", "1");
                overAllocJSON.put("date_review",
                    overAllocRecord.findField("gp.date_review").getLocalizedValue());
                overAllocJSON.put("gp_area",
                    overAllocRecord.findField("gp.gp_area").getLocalizedValue());
                overAllocJSON.put("su_area",
                    overAllocRecord.findField("gp.su_area").getLocalizedValue());
                overAllocJSON.put("su_exists",
                    overAllocRecord.findField("gp.su_exists").getLocalizedValue());
                overAllocJSON.put("fl_area",
                    overAllocRecord.findField("gp.fl_area").getLocalizedValue());
                break;
            }
        }
        return overAllocJSON;
    }

    private final List<DataRecord> getDateReviewRecords(final DataRecord record) {
        final java.util.Date dateStart = record.getDate("gp.date_start");
        final java.util.Date dateEnd = record.getDate("gp.date_end");
        final String scnId = (String) record.getValue("gp.portfolio_scenario_id");
        final String blId = (String) record.getValue("gp.bl_id");
        final String flId = (String) record.getValue("gp.fl_id");
        final DataSource dataSource = DataSourceFactory
            .loadDataSourceFromFile("ab-alloc-wiz-common.axvw", "allocWizCommon_ds2");
        dataSource.addRestriction(Restrictions.gte("gp", "date_start", dateStart));
        if (dateEnd != null) {
            dataSource.addRestriction(Restrictions.lte("gp", "date_start", dateEnd));
        }
        dataSource.addRestriction(Restrictions.eq("gp", "portfolio_scenario_id", scnId));
        dataSource.addRestriction(Restrictions.eq("gp", "bl_id", blId));
        dataSource.addRestriction(Restrictions.eq("gp", "fl_id", flId));
        return dataSource.getRecords();
    }

    /**
     * Copies group records from one scenario to another
     */
    public void copyScenario(final String from_portfolio_scenario_id,
            final String to_portfolio_scenario_id, final String scenario_exists) {

        String sql = "";

        if (scenario_exists.equals("N")) {
            sql = "INSERT INTO portfolio_scenario (portfolio_scenario_id) VALUES ('"
                    + to_portfolio_scenario_id + "')";

            SqlUtils.executeUpdate("gp", sql);
        } else {
            sql = "DELETE FROM gp where portfolio_scenario_id = '" + to_portfolio_scenario_id + "'";

            SqlUtils.executeUpdate("gp", sql);
        }

        sql = "INSERT INTO gp (portfolio_scenario_id,gp_num,name,head,description,gp_function,cost,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,area_manual,pct_floor,date_start,date_end)"
                + " SELECT '" + to_portfolio_scenario_id
                + "',gp_num,name,head,description,gp_function,cost,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,area_manual,pct_floor,date_start,date_end"
                + " FROM gp where portfolio_scenario_id='" + from_portfolio_scenario_id + "'";

        SqlUtils.executeUpdate("gp", sql);
    }

    /**
     * Deletes a scenario's group records and te scenario as well.
     */
    public void deleteScenario(final String portfolio_scenario_id) {

        String sql = "DELETE FROM gp where portfolio_scenario_id = '" + portfolio_scenario_id + "'";

        SqlUtils.executeUpdate("gp", sql);

        sql = "DELETE FROM portfolio_scenario where portfolio_scenario_id = '"
                + portfolio_scenario_id + "'";

        SqlUtils.executeUpdate("gp", sql);
    }

    /**
     * Allocates costs to groups for a single building and a specific date
     */
    public void updateGroupAllocationCosts(final String bl_id, final String date_report,
            final String portfolio_scenario_id, final String bl_annual_cost) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String sql = "UPDATE gp SET gp.cost = " + bl_annual_cost + "*"
                + " ( (CASE WHEN gp.area = 0 THEN gp.area_manual ELSE gp.area END) / "
                + " (SELECT SUM(CASE WHEN gp.area = 0 THEN gp.area_manual ELSE gp.area END) "
                + " FROM gp WHERE bl_id = '" + bl_id + "' AND portfolio_scenario_id = '"
                + portfolio_scenario_id + "'" + " AND "
                + formatSqlIsoToNativeDate(context, date_report)
                + " between date_start and date_end)) " + " WHERE bl_id = '" + bl_id
                + "' AND portfolio_scenario_id = '" + portfolio_scenario_id + "' AND "
                + formatSqlIsoToNativeDate(context, date_report)
                + " between date_start and date_end";

        SqlUtils.executeUpdate("gp", sql);

    }

    /**
     * Allocates costs to groups for all buildings and a specific date
     *
     */
    public void updateGroupAllocationCostsAll(final String date_report,
            final String portfolio_scenario_id, final String site_id) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        String siteRestriction = "";
        if (site_id.equals("")) {
            siteRestriction = "";
        } else {
            siteRestriction = "site_id = '" + site_id + "' AND ";
        }

        final String[] dateList = date_report.split("-");
        String sql = "";
        String bl_id = "";

        final int year = Integer.parseInt(dateList[0]);
        DateTime.getFirstDayOfYear(year);
        DateTime.getLastDayOfYear(year);

        final String[] fieldNames = { "bl_id" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields("bl", fieldNames);

        final String restriction = siteRestriction
                + "bl_id IN (SELECT DISTINCT bl_id FROM gp WHERE portfolio_scenario_id = '"
                + portfolio_scenario_id + "' AND " + formatSqlIsoToNativeDate(context, date_report)
                + " BETWEEN date_start AND date_end)";
        ds.addRestriction(Restrictions.sql(restriction));

        final List<DataRecord> records = ds.getRecords();

        ContextStore.get().getEventHandler("CostService");

        // for each record
        for (final DataRecord record : records) {
            bl_id = (String) record.getValue("bl.bl_id");

            final DataSet2D dataSet = new DataSet2D("", "");
            // DataSet2D dataSet = (DataSet2D) service.getCashFlowProjection(projectionType,
            // dateFrom,
            // dateTo, calculationPeriod, calculationType, false, false, false, true, "bl_id = '"
            // + bl_id + "'", "", "", null);

            final List<DataRecord> cashFlowRecords = dataSet.getRecords();

            if (cashFlowRecords.size() > 0) {

                final BigDecimal buildingCostExpense = (BigDecimal) (cashFlowRecords.get(0)
                    .getValue("cost_tran_recur.amount_income"));
                /*
                 * 06/08/2010 IOAN kb 3027914 Format number
                 */
                final BigDecimal buildingCost = buildingCostExpense.abs();
                final DecimalFormat noFormatter = new DecimalFormat("#.##");
                final String strBuildingCost = noFormatter.format(buildingCost.doubleValue());

                sql = "UPDATE gp SET gp.cost = " + strBuildingCost + "*"
                        + " ( (CASE WHEN gp.area = 0 THEN gp.area_manual ELSE gp.area END) / "
                        + " (SELECT SUM(CASE WHEN gp.area = 0 THEN gp.area_manual ELSE gp.area END) "
                        + " FROM gp WHERE bl_id = '" + bl_id + "' AND portfolio_scenario_id = '"
                        + portfolio_scenario_id + "'" + " AND "
                        + formatSqlIsoToNativeDate(context, date_report)
                        + " between date_start and date_end)) " + " WHERE bl_id = '" + bl_id
                        + "' AND portfolio_scenario_id = '" + portfolio_scenario_id + "' AND "
                        + formatSqlIsoToNativeDate(context, date_report)
                        + " between date_start and date_end";

                SqlUtils.executeUpdate("gp", sql);
            }
        }
    }

    /*
     * //can do the dame job in java script code, so comment out this WFR public void
     * updateGroupSpaceAllocationData(EventHandlerContext context) {
     *
     * String viewName = "";
     *
     * if (context.parameterExists("viewName")) { viewName = context.getString("viewName"); }
     *
     * String dataSourceName = ""; if (context.parameterExists("dataSourceName")) { dataSourceName =
     * context.getString("dataSourceName"); }
     *
     * String old_bl_fl_value = context.getString("old_bl_fl_value"); String new_bl_fl_value =
     * context.getString("new_bl_fl_value"); String dv_dp_value = context.getString("dv_dp_value");
     *
     * // get records from datasource
     *
     * DataSource groupDataSource = DataSourceFactory.loadDataSourceFromFile(viewName,
     * dataSourceName);
     *
     * List records = groupDataSource.getRecords(); boolean findRightGroup = false; boolean
     * findRightFloor = false; DataRecord currentRecord = null; DataRecord rightGroupRecord = null;
     *
     * String new_fl = ""; String new_bl = ""; String bl = ""; String fl = ""; String dv = "";
     * String dp = ""; Integer record_gp = new Integer(-1); Integer gp = null;
     *
     * // for each record for (int i = 0; i < records.size(); i++) { currentRecord = (DataRecord)
     * records.get(i);
     *
     * if (!findRightGroup || !findRightFloor) {
     *
     * bl = currentRecord.getValue("gp.bl_id").toString(); fl =
     * currentRecord.getValue("gp.fl_id").toString(); dv =
     * currentRecord.getValue("gp.dv_id").toString(); dp =
     * currentRecord.getValue("gp.dp_id").toString(); gp =
     * Integer.valueOf(currentRecord.getValue("gp.gp_id").toString());
     *
     * // for source group if (!findRightGroup && (bl + "-" + fl).equals(old_bl_fl_value) && (dv +
     * "-" + dp).equals(dv_dp_value)) { rightGroupRecord = currentRecord; findRightGroup = true;
     * record_gp = gp; }
     *
     * // for destination floor if (!findRightFloor && (bl + "-" + fl).equals(new_bl_fl_value)) {
     * new_fl = fl; new_bl = bl; findRightFloor = true; } }// end if (!findRightGroup ||
     * !findRightFloor) else { break; } }// end for (int i = 0; i < records.size(); i++)
     *
     * if (findRightGroup && findRightFloor) {
     *
     * // set the new bl_fl value for the group rightGroupRecord.setValue("gp.fl_id", new_fl);
     * rightGroupRecord.setValue("gp.bl_id", new_bl);
     *
     * // have to set the old value which is the same as the new value to gp_id // because(1) it it
     * primary key, so this field will be included in the record // (2) it is integer, if do not
     * set, our code will set the old value as "" which is a // string, // and will cause type
     * mismatch error rightGroupRecord.setOldValue("gp.gp_id", record_gp);
     *
     * groupDataSource.saveRecord(rightGroupRecord); } }
     */

    /**
     * Allocates costs to groups for all buildings and a specific date.
     *
     * Added for 22.1 Space and Portfolio Planing - Allocate Space with Space Requirements.
     *
     * By Zhang Yi, on 2015-05-22.
     *
     */
    public void allocateGroupFromSpaceRequirements(final String sbName, final String scenarioId,
            final String asOfDate, final JSONArray periodsData, final String unitTitle) {
        new SpaceRequirementGroupAllocate(sbName, scenarioId, asOfDate, periodsData, unitTitle)
            .allocate();
    }

    /**
     * Portfolio Scenarios that are at the Functional Group level will have linked Space
     * Requirements. The sb_items records for these Space Requirements can be synched to group
     * records in the stack. Space Planners can sync their Space Requirements to create group
     * records in the stack, and then go back to the Space Requirements to make changes, and then
     * resync back to the scenario..
     *
     * Added for 22.1 Space and Portfolio Planing - Sync Space Requirements
     *
     * By Zhang Yi, on 2015-05-26.
     *
     */
    public void syncSpaceRequirements(final String sbName, final String scenarioId,
            final String eventName, final String startDate, final String unitTitle) {
        new SpaceRequirementSync(sbName, scenarioId, eventName, startDate, unitTitle).startSync();
    }

    /**
     * Delete the SB record and all records in sb_items for that SB record..
     *
     * Added for 22.1 Space and Portfolio Planing - Define Space Requirements
     *
     * By Zhang Yi, on 2015-05-26.
     *
     */
    public void deleteSpaceRequirement(final String requirementName) {

        StringBuilder deleteSql = new StringBuilder();
        deleteSql.append(" DELETE FROM sb_items where sb_name="
                + literal(ContextStore.get().getEventHandlerContext(), requirementName));
        SqlUtils.executeUpdate("sb_items", deleteSql.toString());

        deleteSql = new StringBuilder();
        deleteSql.append(" DELETE FROM sb where sb_name="
                + literal(ContextStore.get().getEventHandlerContext(), requirementName));
        SqlUtils.executeUpdate("sb", deleteSql.toString());
    }

    /**
     * Merge the stack's slides with action item's slides of mark-up image.
     *
     * Added for 22.1 Space and Portfolio Planing - Generate PPT
     *
     * By Zhang Yi, on 2015-07-10.
     *
     */
    public void generatePresentation(final List<Map<String, String>> slides,
            final Map<String, String> config, final String scenarioId) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final SpacePortfolioConsoleGeneratePresentationJob pptGenerator =
                (SpacePortfolioConsoleGeneratePresentationJob) ContextStore.get()
                    .getBean("SpacePortfolioConsolePptJobBean");

        pptGenerator.setParameters(slides, config, scenarioId);
        
        final JobManager.ThreadSafe jobManager = getJobManager(context);
        final String jobId = jobManager.startJob(pptGenerator);
        
        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);
        
        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());
        
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Create Groups from Room and Employee Inventory. Department Employee Headcounts are derived
     * from the Employees table. Department Floor Area Allocations are derived from the Room table.
     *
     * Add Leave Events (groups) where corresponding suites exist with active leases.
     *
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     */
    public void addRmEmLsGroups_pf(final String portfolio_scenario_id, final DataSetList blRecords,
            final String date_start, final String groupBy, final Double pct_growth,
            final String unitTitle) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        addBlLeaseEvents_pf(context, portfolio_scenario_id, blRecords, date_start, unitTitle);

        String gpFieldList = "planning_bu_id, dv_id, dp_id, ";
        String rmFieldList =
                "CASE WHEN dv.bu_id = 'WW99' THEN '' ELSE dv.bu_id END ${sql.as} bu_id, rm.dv_id, rm.dp_id, ";
        String groupByClause = "rm.bl_id, rm.fl_id, dv.bu_id, rm.dv_id, rm.dp_id ";
        String nameClause = "CASE WHEN rm.dp_id IS NULL THEN '" + UNASSIGNED
                + "' ELSE (UPPER(RTRIM(rm.dv_id)) " + formatSqlConcat(context) + " '-' "
                + formatSqlConcat(context) + " UPPER(RTRIM(rm.dp_id))) END";
        String emLeftJoinClause =
                " LEFT OUTER JOIN (select em.bl_id, em.fl_id, dv1.bu_id, em.dv_id, em.dp_id, count(em.em_id) ${sql.as} emCount from em "
                        + "left outer join dv dv1 on em.dv_id=dv1.dv_id group by dv1.bu_id, em.dv_id, em.dp_id, em.fl_id, em.bl_id) emc "
                        + "on emc.bl_id=rm.bl_id and emc.fl_id=rm.fl_id and emc.bu_id=dv.bu_id and emc.dv_id=dv.dv_id and emc.dp_id=rm.dp_id ";
        String emWhereClause =
                "em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.dv_id = rm.dv_id AND em.dp_id = rm.dp_id";
        final double pct_growth_multiplier = 1.00 + 0.01 * pct_growth;
        String pctGrowthClause = "(CASE WHEN (rm.dv_id IS NULL AND rm.dp_id IS NULL) THEN 1 ELSE "
                + pct_growth_multiplier + " END)";
        final String description = "'" + GROUP_DESCRIPTION + "' ";
        String descriptionClause =
                "(CASE WHEN (rm.dv_id IS NULL AND rm.dp_id IS NULL) THEN '' ELSE ";

        if (groupBy.equals("bu_id")) {
            gpFieldList = "planning_bu_id, ";
            rmFieldList = "CASE WHEN dv.bu_id = 'WW99' THEN '' ELSE dv.bu_id END ${sql.as} bu_id, ";
            groupByClause = "rm.bl_id, rm.fl_id, dv.bu_id ";
            nameClause = "CASE WHEN dv.bu_id = 'WW99' THEN '" + UNASSIGNED
                    + "' WHEN dv.bu_id IS NULL THEN '" + UNASSIGNED
                    + "' ELSE UPPER(RTRIM(dv.bu_id)) END";
            emWhereClause =
                    "em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND dv.bu_id = division.bu_id";
            emLeftJoinClause =
                    " LEFT OUTER JOIN (select em.bl_id, em.fl_id, dv1.bu_id, count(em.em_id) emCount from em left outer join dv dv1 on em.dv_id=dv1.dv_id group by dv1.bu_id, em.fl_id, em.bl_id) emc on emc.bl_id=rm.bl_id and emc.fl_id=rm.fl_id and emc.bu_id=dv.bu_id ";
            pctGrowthClause =
                    "(CASE WHEN (dv.bu_id IS NULL) THEN 1 ELSE " + pct_growth_multiplier + " END)";
            descriptionClause = "(CASE WHEN (dv.bu_id IS NULL) THEN '' ELSE ";
        }
        if (groupBy.equals("dv_id")) {
            gpFieldList = "planning_bu_id, dv_id, ";
            rmFieldList =
                    "CASE WHEN dv.bu_id = 'WW99' THEN '' ELSE dv.bu_id END ${sql.as} bu_id, rm.dv_id, ";
            groupByClause = "rm.bl_id, rm.fl_id, dv.bu_id, rm.dv_id ";
            nameClause = "CASE WHEN rm.dv_id IS NULL THEN '" + UNASSIGNED
                    + "' ELSE UPPER(RTRIM(rm.dv_id)) END";
            emWhereClause = "em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.dv_id = rm.dv_id";
            emLeftJoinClause =
                    " LEFT OUTER JOIN (select em.bl_id, em.fl_id, dv1.bu_id, dv1.dv_id, count(em.em_id) emCount from em left outer join dv dv1 on em.dv_id=dv1.dv_id group by dv1.bu_id, dv1.dv_id, em.fl_id, em.bl_id) emc on emc.bl_id=rm.bl_id and emc.fl_id=rm.fl_id and emc.bu_id=dv.bu_id and emc.dv_id=dv.dv_id ";
            pctGrowthClause =
                    "(CASE WHEN (rm.dv_id IS NULL) THEN 1 ELSE " + pct_growth_multiplier + " END)";
            descriptionClause = "(CASE WHEN (rm.dv_id IS NULL) THEN '' ELSE ";
        }

        String blIdList = "";
        for (final DataRecord record : blRecords.getRecords()) {
            if (blIdList != "") {
                blIdList += ", ";
            }
            blIdList += "'" + record.getString("bl.bl_id") + "'";
        }

        if (pct_growth > 0 || pct_growth < 0) {
            descriptionClause += "' (" + pct_growth + "% " + GROWTH_REDUCTION + ")'";
        } else {
            descriptionClause += "''";
        }
        descriptionClause += " END)";

        final StringBuilder sql = new StringBuilder();
        sql.append(" INSERT INTO gp(name, bl_id, fl_id, " + gpFieldList
                + "gp_std, count_em, area_manual, pct_floor, ");
        sql.append(
            "     area_chargable, area_comn, area_comn_gp, area_comn_serv, date_start, portfolio_scenario_id, description ) ");
        sql.append(" SELECT " + nameClause + ", ");
        sql.append(" rm.bl_id, rm.fl_id, " + rmFieldList + "'DEPT-AREA', ");
        sql.append(" CASE WHEN emc.emCount is null then 0 else emc.emCount " + " * "
                + pctGrowthClause + " end, ");
        sql.append(" SUM(rm.area) * " + pctGrowthClause + ", ");
        sql.append(" CASE WHEN MAX(fl.area_rm) = 0 THEN 0 ELSE 100*(SUM(rm.area) * "
                + pctGrowthClause + ")/MAX(fl.area_rm) END, ");
        sql.append(" SUM(rm.area_chargable) * " + pctGrowthClause + ",  ");
        sql.append(" SUM(rm.area_comn) * " + pctGrowthClause + ", ");
        sql.append(" SUM(rm.area_comn_rm) * " + pctGrowthClause + ", ");
        sql.append(" SUM(rm.area_comn_serv) * " + pctGrowthClause + ",  ");
        sql.append(formatSqlIsoToNativeDate(context, date_start) + ", ");
        sql.append("'" + portfolio_scenario_id + "', ");
        sql.append(description + formatSqlConcat(context) + descriptionClause);
        sql.append(" FROM rm ");
        sql.append(
            " LEFT OUTER JOIN (SELECT CASE WHEN dv.bu_id IS NULL THEN 'WW99' ELSE dv.bu_id END ${sql.as} bu_id, dv_id FROM dv) ${sql.as} dv ON rm.dv_id = dv.dv_id ");
        sql.append(emLeftJoinClause);
        sql.append(" LEFT OUTER JOIN fl ON fl.fl_id = rm.fl_id AND fl.bl_id = rm.bl_id ");
        sql.append(" WHERE rm.bl_id IN (" + blIdList + ") ");
        sql.append(" AND rm.fl_id IS NOT NULL ");
        sql.append(
            " AND ((SELECT COUNT(em.em_id) FROM em LEFT OUTER JOIN (SELECT CASE WHEN dv.bu_id IS NULL THEN 'WW99' ELSE dv.bu_id END ${sql.as} bu_id, dv.dv_id FROM dv) ${sql.as} division ON em.dv_id = division.dv_id WHERE "
                    + emWhereClause + ") > 0 OR rm.dv_id IS NOT NULL OR rm.dp_id IS NOT NULL)");
        sql.append(" GROUP BY " + groupByClause + " ");
        sql.append(",fl.area_rm, emc.emCount ");
        sql.append(" ORDER BY " + groupByClause + " ");
        SqlUtils.executeUpdate("gp", sql.toString());

    }

    private void addBlLeaseEvents_pf(final EventHandlerContext context,
            final String portfolio_scenario_id, final DataSetList blRecords,
            final String date_start, final String unitTitle) {

        /*
         * final String su_area =
         * " SUM(CASE WHEN su.area_usable=0 THEN su.area_manual ELSE su.area_usable END) ";
         *
         * final String description = "'" + LEASE + " ' " + formatSqlConcat(context) + " ls.ls_id "
         * + formatSqlConcat(context) + " ' (' " + formatSqlConcat(context) + su_area +
         * formatSqlConcat(context) + " ' " + unitTitle + ")' ";
         */
        final String description = "'" + LEASE + " ' " + formatSqlConcat(context) + " ls.ls_id ";
        String blIdList = "";
        for (final DataRecord record : blRecords.getRecords()) {
            if (blIdList != "") {
                blIdList += ", ";
            }
            blIdList += "'" + record.getString("bl.bl_id") + "'";
        }
        final StringBuilder sql = new StringBuilder();
        sql.append(
            " INSERT INTO gp(name, bl_id, fl_id, date_start, date_end, ls_id, portfolio_scenario_id, description ) ");
        sql.append(" SELECT '" + LEASE_EVENT + "', ");
        sql.append(
            " su.bl_id, su.fl_id, MIN(CASE WHEN ls.date_move IS NULL THEN ls.date_start ELSE ls.date_move END) ${sql.as} date_start, MIN(ls.date_end), ls.ls_id, ");
        sql.append("'" + portfolio_scenario_id + "', ");
        sql.append(description);
        sql.append(" FROM su ");
        sql.append(" LEFT OUTER JOIN ls ON ls.ls_id = su.ls_id ");
        sql.append(" WHERE su.bl_id IN (" + blIdList + ") ");
        sql.append(" AND ls.use_as_template = 0 ");
        sql.append(" AND ls.date_start IS NOT NULL ");
        sql.append(" AND (ls.date_end IS NULL OR ls.date_end >= "
                + formatSqlIsoToNativeDate(context, date_start) + ")");
        sql.append(" GROUP BY su.bl_id, su.fl_id, ls.ls_id ");
        sql.append(" ORDER BY su.bl_id, su.fl_id, ls.ls_id ");
        SqlUtils.executeUpdate("gp", sql.toString());
    }

    /**
     * Old WFR for views prior to 22.1, renamed. Copies group records from inventory to the Baseline
     * scenario - Updated by C. Kriezis on 4/12/10 to copy data to any scenario and renamed the rule
     * to reflect this change.
     */
    public void copyGroupInventoryToScenario_pf(final String date_start, final String date_end,
            final String to_portfolio_scenario_id) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        String bl_id = "";
        String fl_id = "";
        String sql = "";
        
        final String[] fieldNames = { "bl_id", "fl_id" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields("fl", fieldNames);
        
        final String restriction = "rtrim(bl_id)" + formatSqlConcat(context)
                + "rtrim(fl_id) in (select rtrim(bl_id)" + formatSqlConcat(context)
                + "rtrim(fl_id) from gp where portfolio_scenario_id IS NULL)";
        ds.addRestriction(Restrictions.sql(restriction));
        
        final List<DataRecord> records = ds.getRecords();
        
        // for each record
        for (final DataRecord record : records) {
            
            bl_id = (String) record.getValue("fl.bl_id");
            fl_id = (String) record.getValue("fl.fl_id");
            
            sql = "DELETE FROM gp where bl_id='" + bl_id + "' AND fl_id='" + fl_id
                    + "' AND portfolio_scenario_id = '" + to_portfolio_scenario_id + "'";

            SqlUtils.executeUpdate("gp", sql);
            
            sql = "INSERT INTO gp (portfolio_scenario_id,date_start,date_end,gp_num,name,head,description,gp_function,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,area_manual,pct_floor)"
                    + " SELECT '" + to_portfolio_scenario_id + "',"
                    + formatSqlIsoToNativeDate(context, date_start) + ","
                    + formatSqlIsoToNativeDate(context, date_end)
                    + ",gp_num,name,head,description,gp_function,option1,option2,ls_id,gp_std,dv_id,dp_id,bl_id,fl_id,count_em,area,area_manual,pct_floor"
                    + " FROM gp where dp_id IS NOT NULL and portfolio_scenario_id IS NULL AND bl_id='"
                    + bl_id + "' AND fl_id='" + fl_id + "'";

            SqlUtils.executeUpdate("gp", sql);
        }
    }
    
    /**
     * Adde for 23.1: apply the hpattern_cad value to groups of same organization of given group.
     */
    public void updateHpatternOfSameOrganization(final String hpatternValue, final int gpId) {

        final StringBuilder sql = new StringBuilder();
        sql.append("UPDATE gp set gp.hpattern_acad='"+hpatternValue+"' ");
        sql.append(" WHERE exists ( select 1 from gp ${sql.as} g where gp.portfolio_scenario_id=g.portfolio_scenario_id and g.gp_id="+gpId);
        sql.append("                   and (gp.planning_bu_id is null and g.planning_bu_id is null or gp.planning_bu_id=g.planning_bu_id )   ");
        sql.append("                   and (gp.dv_id is null and g.dv_id is null or gp.dv_id=g.dv_id )   ");
        sql.append("                   and (gp.dp_id is null and g.dp_id is null or gp.dp_id=g.dp_id )   ");
        sql.append("                   and (gp.gp_function is null and g.gp_function is null or gp.gp_function=g.gp_function )   ");
        sql.append("     )");

        SqlUtils.executeUpdate("gp", sql.toString());
   }    
}