package com.archibus.app.bldgops.partinv;

import static com.archibus.app.bldgops.partinv.BldgopsPartInventoryConstant.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.resourcecalcs.ResourceCalculations;
import com.archibus.security.UserAccount;
import com.archibus.utility.*;

/**
 *
 * Manage Purchase Orders.
 *
 * @author Jia Guoqiang
 * @since 23.1
 *
 */
public final class BldgopsPartInventoryPurchaseOrder {

    /**
     * purchase order table fields.
     *
     */
    private static final String[] PO_FIELDS =
            new String[] { PO_ID, STATUS, APPROVED_BY, DATE_RECEIVED, VN_ID, RECEIVING_LOCATION,
                    DATE_APPROVED, DATE_REQUEST, EM_ID, AC_ID, PO_NUMBER, SOURCE, COMMENTS };

    /**
     * purchase order item table field.
     */
    private static final String[] PO_LINE_FIELDS = new String[] { PO_ID, PO_LINE_ID, DATE_RECEIVED,
            STATUS, EM_ID, UNIT_COST, QUANTITY, CATNO, DESCRIPTION };

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private BldgopsPartInventoryPurchaseOrder() {

    }

    /**
     *
     * Change Purchase Orders to be Received or Error.
     *
     * @param poId Purchase Order id
     * @param poLineId Purchase Order Item Id
     * @param partCode Part code
     * @param receivedLocation Received Location.
     * @param transQty Transaction Quantity
     * @param costUnit Cost unit price
     * @param status Status 'Received' or 'Error'
     */
    public static void setPurchaseOrderTobeReceivedOrError(final String poId, final String poLineId,
            final String partCode, final String receivedLocation, final Double transQty,
            final Double costUnit, final String status) {

        final DataSource poLineDs =
                DataSourceFactory.createDataSourceForFields(PO_LINE_TABLE, PO_LINE_FIELDS);
        String updatePoStatusSql = "";
        // Get main storage location
        // final String toStorageLocation = getMainStorageLocation();
        String toStorageLocation = "";
        if (StringUtil.isNullOrEmpty(receivedLocation)) {
            toStorageLocation = BldgopsPartInventorySupplyRequisition.getMainStorageLocation();
        } else {
            toStorageLocation = receivedLocation;
        }

        // If part not exists in To Storage Location , then save a new record to part storage
        // location.
        if (STATUS_RECEIVED.equals(status)) {
            BldgopsPartInventorySupplyRequisition.addNewPartToStoreLocIfNotExists(toStorageLocation,
                partCode);
            updatePoStatusSql =
                    " update po_line set status='" + status + "',date_received= ${sql.date('"
                            + Utility.currentDate() + "')} where po_id=  '" + poId
                            + "'  and po_line_id='" + poLineId + "'           ";
        } else {
            updatePoStatusSql = "update po_line set status='" + status + "' where po_id=  '" + poId
                    + "' and po_line_id=   '" + poLineId + "'                 ";
        }

        SqlUtils.executeUpdate(PO_LINE_TABLE, updatePoStatusSql);
        // check to see if there are any remaining supply requisition items that are not
        // Received or Error
        poLineDs.addRestriction(new Restrictions.Restriction.Clause(PO_LINE_TABLE, PO_ID, poId,
            Restrictions.OP_EQUALS));
        final Restrictions.Restriction.Clause[] poLineStatusRestricitons =
                { Restrictions.ne(PO_LINE_TABLE, STATUS, STATUS_RECEIVED),
                        Restrictions.ne(PO_LINE_TABLE, STATUS, STATUS_ERROR) };
        poLineDs.addRestriction(Restrictions.and(poLineStatusRestricitons));

        poLineDs.setApplyVpaRestrictions(false);
        String defaultSupplyReqStatus = STATUS_RECEIVED;
        final DataRecord poLineRecord = poLineDs.getRecord();
        if (poLineRecord == null) {
            // Set supply requisition status to be Received or Partly Received.
            poLineDs.clearRestrictions();

            poLineDs.addRestriction(new Restrictions.Restriction.Clause(PO_LINE_TABLE, PO_ID, poId,
                Restrictions.OP_EQUALS));
            poLineDs.addRestriction(new Restrictions.Restriction.Clause(PO_LINE_TABLE, STATUS,
                STATUS_ERROR, Restrictions.OP_EQUALS));
            final DataRecord poLineErrorRecord = poLineDs.getRecord();

            if (poLineErrorRecord == null) {
                defaultSupplyReqStatus = STATUS_RECEIVED;
            } else {
                poLineDs.clearRestrictions();

                poLineDs.addRestriction(new Restrictions.Restriction.Clause(PO_LINE_TABLE, PO_ID,
                    poId, Restrictions.OP_EQUALS));
                poLineDs.addRestriction(new Restrictions.Restriction.Clause(PO_LINE_TABLE, STATUS,
                    STATUS_RECEIVED, Restrictions.OP_EQUALS));
                final DataRecord poLineReceivedRecord = poLineDs.getRecord();

                defaultSupplyReqStatus =
                        poLineReceivedRecord == null ? STATUS_ERROR : STATUS_PARTIALLY_RECEIVED;

            }
            final String updatePoStatusByItemStatusSql =
                    "update po set status='" + defaultSupplyReqStatus
                            + "',date_received=${sql.date('" + Utility.currentDate()
                            + "')} where   po_id='" + poId + "'                        ";

            SqlUtils.executeUpdate(PO_TABLE, updatePoStatusByItemStatusSql);

        }
        if (STATUS_RECEIVED.equals(status)) {
            // call WFR to transfer parts and calculate part count.
            final Double changeQty = transQty;
            final Double costUnitPrice = costUnit;
            if (changeQty > 0) {
                final ResourceCalculations resourceCalculate = new ResourceCalculations();
                final int transId = resourceCalculate.updatePartsAndITForMPSL(partCode, changeQty,
                    costUnitPrice, IT_TRANS_TYPE_VALUE_ADD_NEW, null, toStorageLocation, null);
                // Update cost field value of IT table.
                updateCostValueOfIT(transId, poId, poLineId, transQty, costUnit, toStorageLocation,
                    partCode);
            }
        }
    }

    /**
     *
     * Update cost field value in IT table.
     *
     * @param transId Transaction Id
     * @param poId Purchase Order Code
     * @param poLineId Purchase Order Item Code
     * @param transQty Quantity to Transfer
     * @param costUnit Unit cost + per quantity shipping and tax
     * @param toStorageLocation To Storage Location
     * @param partCode Part code
     */
    public static void updateCostValueOfIT(final int transId, final String poId,
            final String poLineId, final Double transQty, final Double costUnit,
            final String toStorageLocation, final String partCode) {

        String updateCostSql = "";
        // (1)Cost per Unit when used = Unit Cost from PO Line Item + (Shipping and Taxes from PO
        // Line Item / Transaction Quantity)
        // (2)The Total Cost is still calculated by multiplying (Cost per Unit when used) by
        // (Transaction Quantity),
        updateCostSql = "update it set cost_when_used=" + costUnit + ",cost_total="
                + costUnit * transQty + " where trans_id='" + transId + "'      ";

        SqlUtils.executeUpdate(IT_TABLE, updateCostSql);
    }

    /**
     * Update purchase order info by purchase order status.
     *
     * @param poId Purchase order ID.
     * @param beforeStatus Purchase order status before change.
     * @param afterStatus Purchase order status after change.
     */
    public static void updatePurchaseOrderInfoByPoStatus(final int poId, final String beforeStatus,
            final String afterStatus) {
        String updatePoSql = "";
        String updatePoLineSql = "";
        final String currentUserName = ContextStore.get().getUser().getName();
        if (STATUS_ISSUED.equals(afterStatus)) {
            updatePoSql = "update po set date_sent=${sql.date('" + Utility.currentDate()
                    + "')},status=  '" + afterStatus + "'   where po_id='" + poId + "'    ";
            updatePoLineSql = "update po_line set status='Issued' where po_line.po_id='" + poId
                    + "' and po_line.status not in ('Received','Error')";
        } else {
            if (STATUS_ISSUED.equals(beforeStatus)) {
                updatePoLineSql = "update po_line set status='Not Yet Issued' where po_line.po_id='"
                        + poId + "' and  po_line.status not in ('Received','Error')";
            }
        }
        if ("Approved".equals(afterStatus)) {

            updatePoSql = "update po set date_approved=${sql.date('" + Utility.currentDate()
                    + "')} ,approved_by= '" + currentUserName + "',status='" + afterStatus
                    + "',amount_approved=(select (select sum(po_line.quantity * po_line.unit_cost) from po_line where po_id='"
                    + poId + "')+po.federal_tax+po.state_tax+po.shipping from po where po_id='"
                    + poId + "') where po_id='" + poId + "'  ";
        }
        if ("Rejected".equals(afterStatus)) {
            updatePoSql = "update po set  status='" + afterStatus + "',date_approved=${sql.date('"
                    + Utility.currentDate() + "')},approved_by='" + currentUserName
                    + "' where po_id='" + poId + "'   ";
        }
        if ("Requested".equals(afterStatus)) {
            updatePoSql = "update po set    status='" + afterStatus
                    + "',date_approved=null,approved_by=null,amount_approved=0.00,date_sent=null where po_id='"
                    + poId + "'        ";
        }
        SqlUtils.executeUpdate(PO_TABLE, updatePoSql);
        if (!"".equals(updatePoLineSql)) {
            SqlUtils.executeUpdate(PO_LINE_TABLE, updatePoLineSql);
        }

    }

    /**
     * Create new purchase order records.
     *
     *
     * @param poRecord Purchase Order parameter record
     * @param poLineRecords Purchase Order Line Item Records
     *
     */
    public static void createNewPurchaseOrder(final JSONArray poRecord,
            final JSONArray poLineRecords) {
        final DataSource poDs = DataSourceFactory.createDataSourceForFields(PO_TABLE, PO_FIELDS);
        final DataSource poLineDs =
                DataSourceFactory.createDataSourceForFields(PO_LINE_TABLE, PO_LINE_FIELDS);
        // check if the rule specifies the security group, and the user is a member of this group
        final UserAccount.Immutable userAccount =
                ContextStore.get().getUserSession().getUserAccount();
        boolean isMemberOfPoApprover = false;
        if (userAccount.isMemberOfGroup(SECURITY_GROUP_PO_APPROVER)) {
            isMemberOfPoApprover = true;
        }

        if (poLineRecords.length() > 0) {

            final JSONObject poJSONRecord = poRecord.getJSONObject(0);

            final String vnId = poJSONRecord.getString("vnId");
            final String receivingLoc = poJSONRecord.getString("receivingLoc");
            final String emId = poJSONRecord.getString("emId");
            final String acId = poJSONRecord.getString("acId");
            final String poNumber = poJSONRecord.getString("poNumber");
            final String source = poJSONRecord.getString("source");
            final String comments = poJSONRecord.getString("comments");

            final DataRecord poSaveRecord = poDs.createNewRecord();

            poSaveRecord.setValue(PO_TABLE + DOT + VN_ID, vnId);
            poSaveRecord.setValue(PO_TABLE + DOT + RECEIVING_LOCATION, receivingLoc);
            poSaveRecord.setValue(PO_TABLE + DOT + EM_ID, emId);
            String status = "";
            if (isMemberOfPoApprover) {
                status = STATUS_APPROVED;
                poSaveRecord.setValue(PO_TABLE + DOT + DATE_REQUEST, Utility.currentDate());
            } else {
                status = STATUS_REQUESTED;
                poSaveRecord.setValue(PO_TABLE + DOT + DATE_REQUEST, Utility.currentDate());
            }

            poSaveRecord.setValue(PO_TABLE + DOT + STATUS, status);
            poSaveRecord.setValue(PO_TABLE + DOT + AC_ID, acId);
            poSaveRecord.setValue(PO_TABLE + DOT + PO_NUMBER, poNumber);
            poSaveRecord.setValue(PO_TABLE + DOT + SOURCE, source);
            poSaveRecord.setValue(PO_TABLE + DOT + COMMENTS, comments);

            final DataRecord purchaseOrderSavedRecord = poDs.saveRecord(poSaveRecord);
            final int poId = Integer
                .parseInt(purchaseOrderSavedRecord.getValue(PO_TABLE + DOT + PO_ID).toString());

            // Update Building information by storage location code
            updatePoBuildingInforByStorageLocationCode(poId, receivingLoc);
            // Save purchase order item record by poLineRecords parameter.
            savePoLineByPoLineRecords(poLineRecords, poId, poLineDs, vnId, emId);

            if (STATUS_APPROVED.equals(status)) {
                // Update purchase order information when purchase order's status is 'Approved'
                updatePurchaseOrderInfoByPoStatus(poId, "", STATUS_APPROVED);
            }
        }
    }

    /**
     * Update purchase orders information from building table by storage location.
     *
     * @param poId Purchase Order Code.
     * @param receivingLoc Receiving location.
     */
    public static void updatePoBuildingInforByStorageLocationCode(final int poId,
            final String receivingLoc) {

        final String updateSql = "update po set "
                + " ship_address1=(select address1 from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "')) ,"
                + " bill_address1=(select address1 from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "') ),"
                + " ship_address2=(select address2 from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "' )),"
                + " bill_address2=(select address2 from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "'  )),"
                + " ship_city_id=(select city_id from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "')  ),"
                + " bill_city_id=(select city_id from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "'))  ,"
                + " ship_state_id=(select state_id from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "')), "
                + " bill_state_id=(select state_id from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "')),  "
                + " ship_zip=(select zip from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "') ), "
                + " bill_zip=(select zip from bl where bl.bl_id=(select bl_id from pt_store_loc where pt_store_loc_id='"
                + receivingLoc + "' ) ) " + " where po_id='" + poId + "'       ";

        SqlUtils.executeUpdate(PO_TABLE, updateSql);
    }

    /**
     * Save purchase order line records.
     *
     * @param poLineRecords purchase order item JSONArray records.
     * @param poId Purchase order code.
     * @param poLineDs Purchase order line datasource.
     * @param vnId Vendor code.
     * @param poEmId Employee Id from Purchase Order.
     */
    public static void savePoLineByPoLineRecords(final JSONArray poLineRecords, final int poId,
            final DataSource poLineDs, final String vnId, final String poEmId) {
        for (int i = 0; i < poLineRecords.length(); i++) {
            final DataRecord poLineSaveRecord = poLineDs.createNewRecord();
            final JSONObject poLineRecord = poLineRecords.getJSONObject(i);

            poLineSaveRecord.setValue(PO_LINE_TABLE + DOT + PO_ID, poId);

            final int poLineId = getMaxPoLineIdByPoId(poId);
            poLineSaveRecord.setValue(PO_LINE_TABLE + DOT + PO_LINE_ID, poLineId + 1);
            poLineSaveRecord.setValue(PO_LINE_TABLE + DOT + UNIT_COST,
                poLineRecord.getDouble(PO_LINE_TABLE + DOT + UNIT_COST));
            poLineSaveRecord.setValue(PO_LINE_TABLE + DOT + QUANTITY,
                poLineRecord.getInt(PO_LINE_TABLE + DOT + QUANTITY));
            poLineSaveRecord.setValue(PO_LINE_TABLE + DOT + EM_ID, poEmId);

            final String catLogNo = poLineRecord.getString(PO_LINE_TABLE + DOT + CATNO);
            final String partId = poLineRecord.getString(PO_LINE_TABLE + DOT + PART_ID);
            addToPvTableIfVnPartNotExists(vnId, partId, catLogNo);
            poLineSaveRecord.setValue(PO_LINE_TABLE + DOT + CATNO, catLogNo);
            poLineSaveRecord.setValue(PO_LINE_TABLE + DOT + DESCRIPTION,
                poLineRecord.getString(PO_LINE_TABLE + DOT + DESCRIPTION));
            poLineDs.saveRecord(poLineSaveRecord);
        }
    }

    /**
     * Add record to an existing purchase order.
     *
     * @param poId Purchase Order code
     * @param vnId Vendor code.
     * @param poLineRecords Purchase Order Line Item Records
     */
    public static void addToExistingPurchaseOrder(final int poId, final String vnId,
            final JSONArray poLineRecords) {
        final DataSource poLineDs =
                DataSourceFactory.createDataSourceForFields(PO_LINE_TABLE, PO_LINE_FIELDS);

        final DataSource poDs = DataSourceFactory.createDataSourceForFields(PO_TABLE, PO_FIELDS)
            .addRestriction(Restrictions.sql("po_id='" + poId + "'            "));

        final DataRecord poRecord = poDs.getRecord();
        final String approvedBy = poRecord.getString(PO_TABLE + DOT + APPROVED_BY);
        final String poStatus = poRecord.getString(PO_TABLE + DOT + "status");
        final String emId = poRecord.getString(PO_TABLE + DOT + EM_ID);
        if (poLineRecords.length() > 0) {
            // Save purchase order item record by poLineRecords parameter.
            savePoLineByPoLineRecords(poLineRecords, poId, poLineDs, vnId, emId);
        }

        final UserAccount.Immutable userAccount =
                ContextStore.get().getUserSession().getUserAccount();

        String beforeStatus;
        String afterStatus;

        if (poStatus.equals(STATUS_APPROVED)) {
            if (userAccount.isMemberOfGroup(SECURITY_GROUP_PO_APPROVER)) {
                final String userName = ContextStore.get().getUser().getName();

                beforeStatus = STATUS_APPROVED;
                afterStatus = getPoAfterStatus(userName, approvedBy);

            } else {
                beforeStatus = STATUS_APPROVED;
                afterStatus = STATUS_REQUESTED;
            }

            updatePurchaseOrderInfoByPoStatus(poId, beforeStatus, afterStatus);
        }
    }

    /**
     * Get Purchase Order after status by userName and ApprovedBy field. If user is previous
     * approver, then status is changed to be Approved.Else , status is changed to be Request.
     *
     * @param userName Current Login User Name
     * @param approvedBy Purchase Order Approver
     * @return afterStatus Approved or Requested
     */
    public static String getPoAfterStatus(final String userName, final String approvedBy) {
        String afterStatus;
        if (userName.equals(approvedBy)) {
            afterStatus = STATUS_APPROVED;
        } else {
            afterStatus = STATUS_REQUESTED;
        }

        return afterStatus;

    }

    /**
     * Get max P.O. Line Number.
     *
     * @param poId Purchase Order Code.
     * @return poLineId Max P.O. Line Number.
     */
    public static int getMaxPoLineIdByPoId(final int poId) {
        final String maxPoLineId = "maxPoLineId";
        int poLineId = 0;
        final DataSource poLineDs = DataSourceFactory.createDataSource().addTable(PO_LINE_TABLE)
            .addQuery("select max(po_line_id) as maxPoLineId from po_line where po_id='" + poId
                    + "'             ")
            .addVirtualField(PO_LINE_TABLE, maxPoLineId, DataSource.DATA_TYPE_INTEGER);

        poLineDs.setApplyVpaRestrictions(false);

        final DataRecord record = poLineDs.getRecord();

        if (record != null) {

            poLineId = record.getValue(PO_LINE_TABLE + DOT + maxPoLineId) == null ? poLineId
                    : record.getInt(PO_LINE_TABLE + DOT + maxPoLineId);

        }

        return poLineId;

    }

    /**
     * Insert a new record to pv table if record not exists by vnId and partId.
     *
     * @param vnId Vendor Id
     * @param partId Part Code
     * @param catLogNo Catlog Number
     */
    public static void addToPvTableIfVnPartNotExists(final String vnId, final String partId,
            final String catLogNo) {
        final String pvCount = "pvCount";
        final String vnPtNum = "vnPtNum";
        final DataSource pvDs = DataSourceFactory.createDataSource().addTable(PV_TABLE)
            .addQuery("select count(1) as pvCount from pv where vn_id='" + vnId
                    + "' and part_id=                 '" + partId + "'          ")
            .addVirtualField(PV_TABLE, pvCount, DataSource.DATA_TYPE_TEXT);

        final DataRecord record = pvDs.getRecord();

        final int count = Integer.parseInt(record.getString(PV_TABLE + DOT + pvCount));

        if (count < 1) {
            final String insertSql = "insert into pv(vn_id,part_id,vn_pt_num) values ('" + vnId
                    + "',  '" + partId + "','" + catLogNo + "')";

            SqlUtils.executeUpdate(PV_TABLE, insertSql);
        } else {
            final DataSource vnPtNumDs = DataSourceFactory.createDataSource().addTable(PV_TABLE)
                .addQuery("select vn_pt_num as vnPtNum from pv where vn_id='" + vnId
                        + "' and part_id=       '" + partId + "'     ")
                .addVirtualField(PV_TABLE, vnPtNum, DataSource.DATA_TYPE_TEXT);
            final DataRecord vnPtNumRecord = vnPtNumDs.getRecord();

            final Object vnPtNumValue = vnPtNumRecord.getValue(PV_TABLE + DOT + vnPtNum);

            if (StringUtil.isNullOrEmpty(vnPtNumValue)) {
                final String vnPtNumSql = "update pv set vn_pt_num=part_id where vn_id='" + vnId
                        + "' and part_id='" + partId + "'";
                SqlUtils.executeUpdate(PV_TABLE, vnPtNumSql);
            }

        }
    }
}
