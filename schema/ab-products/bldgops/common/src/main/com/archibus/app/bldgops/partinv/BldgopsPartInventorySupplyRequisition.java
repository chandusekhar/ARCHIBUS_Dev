package com.archibus.app.bldgops.partinv;

import static com.archibus.app.bldgops.partinv.BldgopsPartInventoryConstant.*;

import java.util.Map;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.eventhandler.resourcecalcs.ResourceCalculations;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 *
 * Used by Multiple Part Storage Location.
 *
 * @author Guoqiang Jia
 * @since 23.1
 *
 */
public final class BldgopsPartInventorySupplyRequisition {

    /**
     * Supply requisition fields.
     */
    private static final String[] SUPPLY_REQ_FIELDS = new String[] { SUPPLY_REQ_ID, STATUS,
            LAST_UPDATE_BY, DATE_CREATED, TIME_CREATED, COMMENTS };

    /**
     * Inventory transaction fields.
     */
    private static final String[] IT_FIELDS = new String[] { TRANS_ID, PART_ID, REQ_ITEM_STATUS,
            SUPPLY_REQ_ID, PT_STORE_LOC_FROM, PT_STORE_LOC_TO, TRANS_DATE, TRANS_TIME, TRANS_TYPE,
            PERFORMED_BY, TRANS_QUANTITY, COMMENTS };

    /**
     * Part fields.
     */
    private static final String[] PT_FIELDS = new String[] { PART_ID, DESCRIPTION, CLASS, MODEL_NO,
            QTY_STD_ORDER, QTY_MIN_HAND, STOCK_NO, COST_UNIT_STD, UNITS_ISSUE, UNITS_ORDER };

    /**
     * Part Storage Location fields.
     */
    private static final String[] PT_STORE_LOC_FIELDS =
            new String[] { PT_STORE_LOC_ID, PART_ID, QTY_MIN_HAND, COST_UNIT_STD };

    /**
     * Storage location table fields.
     *
     */
    private static final String[] STORE_LOC_FIELDS =
            new String[] { PT_STORE_LOC_ID, BL_ID, FL_ID, RM_ID };

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private BldgopsPartInventorySupplyRequisition() {

    }

    /**
     *
     * Create new supply requisition.
     *
     * @param fromStoreLoc From storage location code
     * @param toStoreLoc To storage location code
     * @param supplyReqComments Supply Requisition Comments
     * @param itRecords JSON array of inventory transactions record
     */
    public static void createSupplyReq(final String fromStoreLoc, final String toStoreLoc,
            final String supplyReqComments, final JSONArray itRecords) {
        final DataSource supplyReqDs =
                DataSourceFactory.createDataSourceForFields(SUPPLY_REQ_TABLE, SUPPLY_REQ_FIELDS);
        final DataSource itDs = DataSourceFactory.createDataSourceForFields(IT_TABLE, IT_FIELDS);

        final String fromStoreLocId = fromStoreLoc;
        final String toStoreLocId = toStoreLoc;

        if (itRecords.length() > 0) {
            // Save new Record to supply requisition table
            final DataRecord supplyReqRecord = supplyReqDs.createNewRecord();
            supplyReqRecord.setValue(SUPPLY_REQ_TABLE + DOT + STATUS, SUPPLY_REQ_STATUS_NEW);
            supplyReqRecord.setValue(SUPPLY_REQ_TABLE + DOT + LAST_UPDATE_BY,
                ContextStore.get().getUser().getName());
            supplyReqRecord.setValue(SUPPLY_REQ_TABLE + DOT + DATE_CREATED, Utility.currentDate());
            supplyReqRecord.setValue(SUPPLY_REQ_TABLE + DOT + TIME_CREATED, Utility.currentTime());
            supplyReqRecord.setValue(SUPPLY_REQ_TABLE + DOT + COMMENTS, supplyReqComments);

            final DataRecord resultSupplyReqRecord = supplyReqDs.saveRecord(supplyReqRecord);
            if (!resultSupplyReqRecord.isNew()) {
                final Integer supplyReqId = Integer.parseInt(resultSupplyReqRecord
                    .getValue(SUPPLY_REQ_TABLE + DOT + SUPPLY_REQ_ID).toString());
                // Save new inventory transaction record by supply requisition code
                for (int i = 0; i < itRecords.length(); i++) {
                    final DataRecord itSaveRecord = itDs.createNewRecord();
                    final JSONObject itRecord = itRecords.getJSONObject(i);
                    itSaveRecord.setValue(IT_TABLE + DOT + SUPPLY_REQ_ID, supplyReqId);
                    itSaveRecord.setValue(IT_TABLE + DOT + PART_ID,
                        itRecord.getString(IT_TABLE + DOT + PART_ID));
                    itSaveRecord.setValue(IT_TABLE + DOT + TRANS_QUANTITY,
                        Double.parseDouble(itRecord.getString(IT_TABLE + DOT + TRANS_QUANTITY)));
                    itSaveRecord.setValue(IT_TABLE + DOT + PT_STORE_LOC_FROM, fromStoreLocId);
                    itSaveRecord.setValue(IT_TABLE + DOT + PT_STORE_LOC_TO, toStoreLocId);
                    itSaveRecord.setValue(IT_TABLE + DOT + TRANS_TYPE,
                        IT_TRANS_TYPE_VALUE_TRANSFER);
                    itSaveRecord.setValue(IT_TABLE + DOT + TRANS_DATE, Utility.currentDate());
                    itSaveRecord.setValue(IT_TABLE + DOT + TRANS_TIME, Utility.currentTime());
                    itSaveRecord.setValue(IT_TABLE + DOT + PERFORMED_BY,
                        ContextStore.get().getUser().getName());
                    itSaveRecord.setValue(IT_TABLE + DOT + COMMENTS,
                        itRecord.getString(IT_TABLE + DOT + COMMENTS));

                    itDs.saveRecord(itSaveRecord);

                }
            }

        }
    }

    /**
     * Add parts to an existing supply requisition.
     *
     * @param supplyReqId Supply requisition code
     * @param itRecords JSON array of inventory transactions record
     */
    public static void addPartsToExistingSupplyReq(final String supplyReqId,
            final JSONArray itRecords) {
        // From storage location
        String fromStorageLoctionId = "";
        // To storage location
        String toStorageLocationId = "";

        // Part inventory datasource
        final DataSource itDs = DataSourceFactory.createDataSourceForFields(IT_TABLE, IT_FIELDS);
        // Sql string to get storage location and to storage location by supply requisition
        // code.
        itDs.addRestriction(new Restrictions.Restriction.Clause(IT_TABLE, SUPPLY_REQ_ID,
            supplyReqId, Restrictions.OP_EQUALS));
        itDs.setApplyVpaRestrictions(false);
        final DataRecord itStoreLocRecord = itDs.getRecord();

        if (itStoreLocRecord != null) {
            fromStorageLoctionId =
                    itStoreLocRecord.getValue(IT_TABLE + DOT + PT_STORE_LOC_FROM).toString();
            toStorageLocationId =
                    itStoreLocRecord.getValue(IT_TABLE + DOT + PT_STORE_LOC_TO).toString();
        }

        // Create new Record and save it to Inventory transactions table
        if (itRecords.length() > 0) {
            // Save new inventory transaction record by supply requisition code
            for (int i = 0; i < itRecords.length(); i++) {
                final DataRecord itSaveRecord = itDs.createNewRecord();
                final JSONObject itRecord = itRecords.getJSONObject(i);
                itSaveRecord.setValue(IT_TABLE + DOT + SUPPLY_REQ_ID,
                    Integer.parseInt(supplyReqId));
                itSaveRecord.setValue(IT_TABLE + DOT + PART_ID,
                    itRecord.getString(IT_TABLE + DOT + PART_ID));
                itSaveRecord.setValue(IT_TABLE + DOT + TRANS_QUANTITY,
                    Double.parseDouble(itRecord.getString(IT_TABLE + DOT + TRANS_QUANTITY)));
                itSaveRecord.setValue(IT_TABLE + DOT + PT_STORE_LOC_FROM, fromStorageLoctionId);
                itSaveRecord.setValue(IT_TABLE + DOT + PT_STORE_LOC_TO, toStorageLocationId);
                itSaveRecord.setValue(IT_TABLE + DOT + TRANS_TYPE, IT_TRANS_TYPE_VALUE_TRANSFER);
                itSaveRecord.setValue(IT_TABLE + DOT + TRANS_DATE, Utility.currentDate());
                itSaveRecord.setValue(IT_TABLE + DOT + TRANS_TIME, Utility.currentTime());
                itSaveRecord.setValue(IT_TABLE + DOT + PERFORMED_BY,
                    ContextStore.get().getUser().getName());
                itSaveRecord.setValue(IT_TABLE + DOT + COMMENTS,
                    itRecord.getString(IT_TABLE + DOT + COMMENTS));

                itDs.saveRecord(itSaveRecord);

            }
        }
    }

    /**
     *
     * Add New part to default part storage location.
     *
     * @param partId Part code
     */
    public static void addNewPartToDefaultPartStoreLoc(final String partId) {
        /**
         * Get Main Warehouse Code from activity parameter.
         */
        final String mainWareHouseCode = getMainStorageLocation();
        // DataSource of Part table.
        final DataSource ptDs = DataSourceFactory.createDataSourceForFields(PT_TABLE, PT_FIELDS);
        // DataSource of Part Storage Location table.
        final DataSource ptStoreLocDs = DataSourceFactory
            .createDataSourceForFields(PT_STORE_LOC_PT_TABLE, PT_STORE_LOC_FIELDS);

        ptDs.addRestriction(
            new Restrictions.Restriction.Clause(PT_TABLE, PART_ID, partId, Restrictions.OP_EQUALS));
        ptDs.setApplyVpaRestrictions(false);
        final DataRecord ptRecord = ptDs.getRecord();
        if (ptRecord != null) {
            // Get value from record of part table.
            final Double qtyMinHand = ptRecord.getDouble(PT_TABLE + DOT + QTY_MIN_HAND);
            final Double costUnitStd = ptRecord.getDouble(PT_TABLE + DOT + COST_UNIT_STD);
            final DataRecord ptStoreLocRecord = ptStoreLocDs.createNewRecord();
            ptStoreLocRecord.setValue(PT_STORE_LOC_PT_TABLE + DOT + PT_STORE_LOC_ID,
                mainWareHouseCode);
            ptStoreLocRecord.setValue(PT_STORE_LOC_PT_TABLE + DOT + PART_ID, partId);
            ptStoreLocRecord.setValue(PT_STORE_LOC_PT_TABLE + DOT + QTY_MIN_HAND, qtyMinHand);
            ptStoreLocRecord.setValue(PT_STORE_LOC_PT_TABLE + DOT + COST_UNIT_STD, costUnitStd);

            ptStoreLocDs.saveRecord(ptStoreLocRecord);
        }

        // Copy location information from Storage Location to Part Storage Location table.
        copyLocationInformationByStorageLocation(mainWareHouseCode, partId);

    }

    /**
     * Get Main Storage Location from storage location table.
     *
     * @return mainStorageLocation MainStorageLocation value.
     */
    public static String getMainStorageLocation() {
        // The value of pt_store_loc_id is set to main
        final String mainStorageLocation = "MAIN";

        return mainStorageLocation;

    }

    /**
     *
     * Copy location information from storage location.
     *
     * @param ptStoreLocId Part storage location code
     * @param partId Part code.
     */
    public static void copyLocationInformationByStorageLocation(final String ptStoreLocId,
            final String partId) {
        // DataSource of Storage Location table.
        final DataSource storageLocationDs =
                DataSourceFactory.createDataSourceForFields(PT_STORE_LOC_TABLE, STORE_LOC_FIELDS);

        storageLocationDs.addRestriction(new Restrictions.Restriction.Clause(PT_STORE_LOC_TABLE,
            PT_STORE_LOC_ID, ptStoreLocId, Restrictions.OP_EQUALS));
        storageLocationDs.setApplyVpaRestrictions(false);
        final DataRecord storageLocRecord = storageLocationDs.getRecord();
        if (storageLocRecord != null) {
            final String blId = formatStringIfNull(
                storageLocRecord.getString(PT_STORE_LOC_TABLE + DOT + BL_ID));
            final String flId = formatStringIfNull(
                storageLocRecord.getString(PT_STORE_LOC_TABLE + DOT + FL_ID));
            final String rmId = formatStringIfNull(
                storageLocRecord.getString(PT_STORE_LOC_TABLE + DOT + RM_ID));

            final String copyLocationSql = "update pt_store_loc_pt set bl_id=" + blId + ",fl_id="
                    + flId + ",rm_id=" + rmId + " where pt_store_loc_id='" + ptStoreLocId
                    + "' and   part_id= '" + partId + "'                         ";
            SqlUtils.executeUpdate(PT_STORE_LOC_PT_TABLE, copyLocationSql);

        }
    }

    /**
     * Format String if value is Empty.
     *
     * @param value String value
     * @return String result
     */
    public static String formatStringIfNull(final String value) {
        String result = "";

        if (StringUtil.notNullOrEmpty(value)) {
            result = "     '" + value + "'             ";
        } else {
            result = NULL_VALUE;
        }

        return result;
    }

    /**
     * Add New part to Storage Location if it doesn't exists in storage location.
     *
     * @param ptStoreLocId Part storage location code
     * @param partId Part code
     */
    public static void addNewPartToStoreLocIfNotExists(final String ptStoreLocId,
            final String partId) {
        // DataSource of Part table.
        final DataSource ptDs = DataSourceFactory.createDataSourceForFields(PT_TABLE, PT_FIELDS);
        // DataSource of Part Storage Location table.
        final DataSource ptStoreLocDs = DataSourceFactory
            .createDataSourceForFields(PT_STORE_LOC_PT_TABLE, PT_STORE_LOC_FIELDS);
        // Check if part exists in part storage location
        ptStoreLocDs.addRestriction(new Restrictions.Restriction.Clause(PT_STORE_LOC_PT_TABLE,
            PART_ID, partId, Restrictions.OP_EQUALS));
        ptStoreLocDs.addRestriction(new Restrictions.Restriction.Clause(PT_STORE_LOC_PT_TABLE,
            PT_STORE_LOC_ID, ptStoreLocId, Restrictions.OP_EQUALS));
        ptStoreLocDs.setApplyVpaRestrictions(false);
        final DataRecord ptStoreLocExsitsRecord = ptStoreLocDs.getRecord();
        // If part do not exists in part storage location, save a new record to part storage
        // location.
        if (ptStoreLocExsitsRecord == null) {
            ptDs.addRestriction(new Restrictions.Restriction.Clause(PT_TABLE, PART_ID, partId,
                Restrictions.OP_EQUALS));
            ptDs.setApplyVpaRestrictions(false);
            final DataRecord ptRecord = ptDs.getRecord();
            if (ptRecord != null) {
                // Get value from record of part table.
                final Double qtyMinHand = ptRecord.getDouble(PT_TABLE + DOT + QTY_MIN_HAND);
                final Double costUnitStd = ptRecord.getDouble(PT_TABLE + DOT + COST_UNIT_STD);
                final DataRecord ptStoreLocRecord = ptStoreLocDs.createNewRecord();
                ptStoreLocRecord.setValue(PT_STORE_LOC_PT_TABLE + DOT + PT_STORE_LOC_ID,
                    ptStoreLocId);
                ptStoreLocRecord.setValue(PT_STORE_LOC_PT_TABLE + DOT + PART_ID, partId);
                ptStoreLocRecord.setValue(PT_STORE_LOC_PT_TABLE + DOT + QTY_MIN_HAND, qtyMinHand);
                ptStoreLocRecord.setValue(PT_STORE_LOC_PT_TABLE + DOT + COST_UNIT_STD, costUnitStd);

                ptStoreLocDs.saveRecord(ptStoreLocRecord);

                // Copy location information from Storage Location to Part Storage Location table.
                copyLocationInformationByStorageLocation(ptStoreLocId, partId);
            }
        }

    }

    /**
     * Update All Supply Requisition items when part storage location is change.
     *
     * @param supplyReqChangeRecords Supply Requisition Changed Record
     */
    public static void updateSupplyReqItemWhenPartStoreLocationChange(
            final JSONArray supplyReqChangeRecords) {

        if (supplyReqChangeRecords.length() > 0) {

            for (int i = 0; i < supplyReqChangeRecords.length(); i++) {
                final JSONObject supplyReqChangeRecord = supplyReqChangeRecords.getJSONObject(i);
                final int supplyRequisitionId = supplyReqChangeRecord.getInt(SUPPLY_REQ_ID);
                supplyReqChangeRecord.getString("before_from_store_loc");
                final String fromStoreLocNew =
                        supplyReqChangeRecord.getString("new_from_store_loc");
                supplyReqChangeRecord.getString("before_to_store_loc");
                final String toStoreLocNew = supplyReqChangeRecord.getString("new_to_store_loc");

                supplyReqChangeRecord.getString("before_status");
                final String newStatus = supplyReqChangeRecord.getString("new_status");
                String updateSql = "update it set ";

                updateSql += " pt_store_loc_from='" + fromStoreLocNew + "',";

                updateSql += " pt_store_loc_to='" + toStoreLocNew + "',   ";

                updateSql += " req_item_status='" + newStatus + "'                        ";

                updateSql += " where it.supply_req_id='" + supplyRequisitionId
                        + "' and it.req_item_status!='Received' and  it.req_item_status!='Error'";

                SqlUtils.executeUpdate(IT_TABLE, updateSql);

            }

        }
    }

    /**
     *
     * Transfer parts between storage location.
     *
     * @param supplyReqId Supply requisition id
     * @param transId Transaction Id
     * @param fromStorageLocation From Storage Location
     * @param toStorageLocation To Storage Location
     * @param partCode Part code
     * @param transQty Transaction Quantity
     * @param status Status
     */
    public static void transferPartsBetweenStorageLocationBySupplyReq(final String supplyReqId,
            final String transId, final String fromStorageLocation, final String toStorageLocation,
            final String partCode, final Double transQty, final String status) {

        final DataSource itDs = DataSourceFactory.createDataSourceForFields(IT_TABLE, IT_FIELDS);
        // If part not exists in To Storage Location , then save a new record to part storage
        // location.
        if (STATUS_RECEIVED.equals(status)) {
            addNewPartToStoreLocIfNotExists(toStorageLocation, partCode);
        }

        // Requisition event handler
        final String updateSupplyReqStatusSql =
                "update it set req_item_status='" + status + "',trans_date=${sql.date('"
                        + Utility.currentDate() + "')},trans_time=${sql.time('"
                        + Utility.currentTime() + "')} where trans_id='" + transId + "'       ";
        SqlUtils.executeUpdate(IT_TABLE, updateSupplyReqStatusSql);
        // check to see if there are any remaining supply requisition items that are not
        // Received or Error
        itDs.addRestriction(new Restrictions.Restriction.Clause(IT_TABLE, SUPPLY_REQ_ID,
            supplyReqId, Restrictions.OP_EQUALS));
        final Restrictions.Restriction.Clause[] itStatusRestricitons =
                { Restrictions.ne(IT_TABLE, REQ_ITEM_STATUS, STATUS_RECEIVED),
                        Restrictions.ne(IT_TABLE, REQ_ITEM_STATUS, STATUS_ERROR) };
        itDs.addRestriction(Restrictions.and(itStatusRestricitons));

        itDs.setApplyVpaRestrictions(false);
        String defaultSupplyReqStatus = STATUS_RECEIVED;
        final DataRecord itRecord = itDs.getRecord();
        if (itRecord == null) {
            // Set supply requisition status to be Received or Partly Received.
            itDs.clearRestrictions();

            itDs.addRestriction(new Restrictions.Restriction.Clause(IT_TABLE, SUPPLY_REQ_ID,
                supplyReqId, Restrictions.OP_EQUALS));
            itDs.addRestriction(new Restrictions.Restriction.Clause(IT_TABLE, REQ_ITEM_STATUS,
                STATUS_ERROR, Restrictions.OP_EQUALS));
            final DataRecord itErrorRecord = itDs.getRecord();

            if (itErrorRecord == null) {
                defaultSupplyReqStatus = STATUS_RECEIVED;
            } else {
                itDs.clearRestrictions();

                itDs.addRestriction(new Restrictions.Restriction.Clause(IT_TABLE, SUPPLY_REQ_ID,
                    supplyReqId, Restrictions.OP_EQUALS));
                itDs.addRestriction(new Restrictions.Restriction.Clause(IT_TABLE, REQ_ITEM_STATUS,
                    STATUS_RECEIVED, Restrictions.OP_EQUALS));
                final DataRecord itReceivedRecord = itDs.getRecord();

                defaultSupplyReqStatus =
                        itReceivedRecord == null ? STATUS_ERROR : STATUS_PARTIALLY_RECEIVED;

            }
            final String currentUserName = ContextStore.get().getUser().getName();
            final String updateSupplyReqStatusByItItemsStatusSql = "update supply_req set status='"
                    + defaultSupplyReqStatus + "',last_updated_by='" + currentUserName
                    + "' where supply_req_id='" + supplyReqId + "'               ";

            SqlUtils.executeUpdate(SUPPLY_REQ_TABLE, updateSupplyReqStatusByItItemsStatusSql);

        }
        if (STATUS_RECEIVED.equals(status)) {
            // KB#3051919
            // update cost_unit_avg and cost total value of it table.
            String updateCostSql = "";
            if (SqlUtils.isOracle()) {
                updateCostSql =
                        "update it set cost_when_used=(select  NVL(sum(cost_unit_avg),0) from pt_store_loc_pt where pt_store_loc_id='"
                                + fromStorageLocation + "' and      part_id='" + partCode
                                + "'),cost_total=(select NVL(sum(cost_unit_avg),0)*" + transQty
                                + " from  pt_store_loc_pt where pt_store_loc_id='"
                                + fromStorageLocation + "' and   part_id='" + partCode
                                + "') where  trans_id='" + transId + "' ";
            } else {
                updateCostSql =
                        "update it set cost_when_used=(select isnull(sum(cost_unit_avg),0) from pt_store_loc_pt where pt_store_loc_id='"
                                + fromStorageLocation + "' and     part_id='" + partCode
                                + "'),cost_total=(select isnull(sum(cost_unit_avg),0)*" + transQty
                                + " from pt_store_loc_pt where pt_store_loc_id='"
                                + fromStorageLocation + "' and  part_id='" + partCode
                                + "') where trans_id='" + transId + "'";
            }

            SqlUtils.executeUpdate(IT_TABLE, updateCostSql);
            // re-calculate average cost
            ResourceCalculations.updateAverageCostForTransfer(partCode, transQty,
                fromStorageLocation, toStorageLocation);

            // call WFR to transfer parts and calculate part count.
            final Double changeQty = transQty;
            if (changeQty > 0) {
                final ResourceCalculations resourceCalculate = new ResourceCalculations();
                resourceCalculate.updatePartsAndITForMPSL(partCode, changeQty, 0,
                    IT_TRANS_TYPE_VALUE_REQ_TRANSFER, fromStorageLocation, toStorageLocation, null);
            }

        }

    }

    /**
     *
     * Transfer parts between storage location.
     *
     * @param fromStorageLocation From Storage Location
     * @param toStorageLocation To Storage Location
     * @param partCode Part code
     * @param transQty Transaction Quantity
     * @param qtyReserved Quantity Reserved
     * @param wrptRecords WRPT records
     */
    public static void transferPartsBetweenStorageLocationByAdjust(final String fromStorageLocation,
            final String toStorageLocation, final String partCode, final Double transQty,
            final Double qtyReserved, final JSONArray wrptRecords) {
        // If part not exists in To Storage Location , then save a new record to part storage
        // location.
        addNewPartToStoreLocIfNotExists(toStorageLocation, partCode);

        // re-calculate average cost
        ResourceCalculations.updateAverageCostForTransfer(partCode, transQty, fromStorageLocation,
            toStorageLocation);

        // Change Quantity reserved if transfer quantity reserved count greater than 0
        if (qtyReserved > 0) {
            // Decrease the Quantity Reserved of the From Storage Location by the quantity of
            // reserved parts that are being transferred.
            final String decreaseQtyReservedSql =
                    "update pt_store_loc_pt set qty_on_reserve=(qty_on_reserve-" + qtyReserved
                            + ") where   pt_store_loc_id='" + fromStorageLocation
                            + "' and    part_id='" + partCode + "'           ";
            SqlUtils.executeUpdate(PT_STORE_LOC_PT_TABLE, decreaseQtyReservedSql);

            // Increase the Quantity Reserved of the Storage Location To by the quantity of reserved
            // parts that are being transferred.
            final String increaseQtyReservedSql =
                    "update pt_store_loc_pt set qty_on_reserve=(qty_on_reserve+" + qtyReserved
                            + ") where pt_store_loc_id='" + toStorageLocation + "' and part_id='"
                            + partCode + "'        ";
            SqlUtils.executeUpdate(PT_STORE_LOC_PT_TABLE, increaseQtyReservedSql);
            // For each selected Part Reservation record, update the value of wrpt.pt_store_loc_id
            // to match the To Storage Location field
            if (wrptRecords.length() > 0) {
                for (int i = 0; i < wrptRecords.length(); i++) {
                    final JSONObject wrptRecord = wrptRecords.getJSONObject(i);

                    final Map<Object, Object> values = EventHandlerBase.fromJSONObject(wrptRecord);
                    final int wrId = wrptRecord.getInt(WRPT_TABLE + DOT + WR_ID);
                    String dateAssigned = null;
                    String timeAssigned = null;

                    dateAssigned = SqlUtils
                        .formatValueForSql(values.get(WRPT_TABLE + DOT + DATE_ASSIGNED));
                    timeAssigned = SqlUtils
                        .formatValueForSql(values.get(WRPT_TABLE + DOT + TIME_ASSIGNED));

                    final String whereSql = "part_id = '" + partCode + "' AND wr_id = '" + wrId
                            + "' AND date_assigned =${sql.date(" + dateAssigned
                            + ")} AND time_assigned  = ${sql.time(" + timeAssigned + ")} ";

                    final String updateWrptSql = "update wrpt set pt_store_loc_id='"
                            + toStorageLocation + "' where " + whereSql;

                    SqlUtils.executeUpdate(WRPT_TABLE, updateWrptSql);

                    // re-calculate work request cost based the to storage location
                    final String updateWrptCostSql =
                            " update wrpt SET cost_estimated = qty_estimated * (select pt_store_loc_pt.cost_unit_avg from pt_store_loc_pt where pt_store_loc_pt.part_id = wrpt.part_id and pt_store_loc_pt.pt_store_loc_id = wrpt.pt_store_loc_id) ,"
                                    + " cost_actual = qty_actual * (select pt_store_loc_pt.cost_unit_avg FROM pt_store_loc_pt where pt_store_loc_pt.part_id = wrpt.part_id and pt_store_loc_pt.pt_store_loc_id = wrpt.pt_store_loc_id)"
                                    + " where part_id = '" + partCode
                                    + "' and wrpt.pt_store_loc_id = '" + toStorageLocation
                                    + "' AND wr_id = " + wrId + " AND date_assigned = ${sql.date("
                                    + dateAssigned + ")} AND time_assigned = " + "${sql.time("
                                    + timeAssigned + ")}";

                    SqlUtils.executeUpdate(WRPT_TABLE, updateWrptCostSql);
                    final WorkRequestHandler wrHandler = new WorkRequestHandler();
                    final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
                    wrHandler.recalculateCosts(context, wrId);
                    wrHandler.recalculateEstCosts(context, wrId);

                }
            }
        }

        // If the transfer quantity is greater than the sum of the selected reserved parts,
        // then transfer the remainder of the quantity of parts by using the same calculation as in
        // section 11.1.2
        final Double changeQty = transQty - qtyReserved;
        if (changeQty > 0) {
            final ResourceCalculations resourceCalculate = new ResourceCalculations();
            resourceCalculate.updatePartsAndITForMPSL(partCode, changeQty, 0,
                IT_TRANS_TYPE_VALUE_TRANSFER, fromStorageLocation, toStorageLocation, null);
        }
    }

}
