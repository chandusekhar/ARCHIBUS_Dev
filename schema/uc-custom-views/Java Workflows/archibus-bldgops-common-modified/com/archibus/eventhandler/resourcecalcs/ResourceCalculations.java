package com.archibus.eventhandler.resourcecalcs;

import java.text.SimpleDateFormat;
import java.util.Calendar;

import org.json.*;

import com.archibus.app.bldgops.partinv.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

public class ResourceCalculations {

    // ---------------------------------------------------------------------------------------------
    // BEGIN Update Inventory and Insert Inventory Transaction WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * This method serve as a WFR to update inventory information to pt table meanwhile store the
     * operation transaction into it table.
     *
     * @param partId: part code.
     * @param quantity: part quantity adjusted.
     * @param price: just introduced part price.
     * @param inAction: transaction or operation type.
     * @param acId: account code.
     *
     */
    public final static String INVENTORY_TRANSACTION_ADD = "Add_new";

    public final static String INVENTORY_TRANSACTION_DISBURSE = "Disburse";

    public final static String INVENTORY_TRANSACTION_RECTIFY = "Rectify";

    public final static String INVENTORY_TRANSACTION_RETURN = "Return";

    public void updatePartsAndIT(final String partId, final double quantity, final double price,
            final String inAction, final String acId) {

        final DataSource partDS =
                DataSourceFactory.createDataSourceForFields("pt",
                    new String[] { "part_id", "qty_on_hand", "qty_on_reserve", "cost_unit_avg",
                            "cost_unit_last", "cost_unit_std", "date_of_last_cnt",
                            "qty_physical_count" });

        final DataSource inventoryTransitionDS =
                DataSourceFactory.createDataSourceForFields("it",
                    new String[] { "trans_id", "part_id", "trans_type", "trans_date", "trans_time",
                            "trans_quantity", "ac_id", "cost_when_used", "cost_total",
                            "performed_by" });

        final DataRecord partRec = partDS.getRecord(" part_id='" + partId + "'");
        if (partRec == null) {
            return;
        }
        // Update part record with changed field values
        double qtyOnHandPt = partRec.getDouble("pt.qty_on_hand");
        final double qtyOnReservePt = partRec.getDouble("pt.qty_on_reserve");
        final double costUnitAvgPt = partRec.getDouble("pt.cost_unit_avg");
        final double costUnitStdPt = partRec.getDouble("pt.cost_unit_std");

        // kb#3042273: changed for part inventory enhancement of Bali3
        double quantityForUpdate = 0;
        final boolean isSchemaChanged = BldgopsPartInventoryUtility.isSchemaChanged();

        double costUnitLastNew = 0;
        // Calculate and Set correct quantity value to part record
        if (INVENTORY_TRANSACTION_ADD.equalsIgnoreCase(inAction)) {

            // kb#3042273: comments below code line since no need to update the part's quantity here
            if (!isSchemaChanged) {
                partRec.setValue("pt.qty_on_hand", qtyOnHandPt + quantity);
            } else {
                quantityForUpdate = quantity;
            }

            if (price > 0) {
                partRec.setValue("pt.cost_unit_last", price);
                // fix issue that part cost average value is calculated not correct when quantity
                // available less than 0.
                double quantityNew = quantity;
                if (qtyOnHandPt < 0) {
                    quantityNew = quantity + qtyOnHandPt;
                    qtyOnHandPt = 0;

                }
                final double costUnitAvgNew =
                        (((qtyOnHandPt + qtyOnReservePt) * costUnitAvgPt) + (quantityNew * price))
                                / replaceNumberIfValueIsZero(
                                    qtyOnHandPt + quantityNew + qtyOnReservePt);
                partRec.setValue("pt.cost_unit_avg", costUnitAvgNew);
                costUnitLastNew = price;
            }

        } else if (INVENTORY_TRANSACTION_DISBURSE.equalsIgnoreCase(inAction)) {

            // kb#3042273: comments below code line since no need to update the part's quantity here
            if (!isSchemaChanged) {
                partRec.setValue("pt.qty_on_hand", qtyOnHandPt - quantity);
            } else {
                quantityForUpdate = -quantity;
            }

            costUnitLastNew = costUnitStdPt;

        } else if (INVENTORY_TRANSACTION_RETURN.equalsIgnoreCase(inAction)) {

            // kb#3042273: comments below code line since no need to update the part's quantity here
            if (!isSchemaChanged) {
                partRec.setValue("pt.qty_on_hand", qtyOnHandPt + quantity);
            } else {
                quantityForUpdate = quantity;
            }

            costUnitLastNew = costUnitStdPt;

        } else if (INVENTORY_TRANSACTION_RECTIFY.equalsIgnoreCase(inAction)) {

            // kb#3042273: comments below code line since no need to update the part's quantity here
            if (!isSchemaChanged) {
                partRec.setValue("pt.qty_on_hand", quantity);
            } else {
                partRec.setValue("pt.qty_physical_count", quantity);
                partDS.saveRecord(partRec);
                final BldgopsPartInventory partInv = new BldgopsPartInventory(partId);
                partInv.updateWRPTStatusByPhsicalCount();
            }

            // kb#3044626: also update the Date of last count when rectify.
            partRec.setValue("pt.date_of_last_cnt", Utility.currentDate());

            costUnitLastNew = costUnitAvgPt;
        }

        partDS.saveRecord(partRec);

        // Insert a new Inventory Transition record
        final DataRecord itRec = inventoryTransitionDS.createNewRecord();
        itRec.setValue("it.trans_type", inAction);
        itRec.setValue("it.part_id", partId);
        itRec.setValue("it.trans_date", Utility.currentDate());
        itRec.setValue("it.trans_time", Utility.currentTime());
        itRec.setValue("it.trans_quantity", quantity);
        itRec.setValue("it.cost_when_used", costUnitLastNew);
        itRec.setValue("it.cost_total", costUnitLastNew * quantity);
        if (StringUtil.notNullOrEmpty(acId) && !"null".equalsIgnoreCase(acId)) {
            itRec.setValue("it.ac_id", acId);
        }
        itRec.setValue("it.performed_by", ContextStore.get().getUser().getName());
        inventoryTransitionDS.saveRecord(itRec);

        // kb#3035430: always run Calculate Inventory Usage from Adjust Inventory.
        this.CalculateInventoryUsage();

        // kb#3042273: changed for part inventory enhancement of Bali3
        if (isSchemaChanged) {
            if (!INVENTORY_TRANSACTION_RECTIFY.equalsIgnoreCase(inAction)) {
                final BldgopsPartInventory partInv = new BldgopsPartInventory(partId);
                partInv.updateWRPTStatus(quantityForUpdate);
            }
        }
    }

    public static void updateAverageCostForTransfer(final String partId, final double quantity,
            final String fromStorageLoc, final String toStorageLoc) {

        final DataSource ptLocDS = DataSourceFactory.createDataSourceForFields("pt_store_loc_pt",
            new String[] { "part_id", "pt_store_loc_id", "qty_on_hand", "qty_on_reserve",
                    "cost_unit_avg", "cost_unit_last", "cost_unit_std", "date_of_last_cnt",
                    "qty_physical_count" });

        DataRecord fromPtLocRecord = null;
        DataRecord toPtLocRecord = null;
        double qtyOnHandPtTo = 0;
        double qtyOnReservePtTo = 0;
        double costUnitAvgPtFrom = 0;
        double costUnitAvgPtTo = 0;

        fromPtLocRecord = ptLocDS
            .getRecord(" part_id='" + partId + "' and pt_store_loc_id ='" + fromStorageLoc + "'");
        toPtLocRecord = ptLocDS
            .getRecord(" part_id='" + partId + "' and pt_store_loc_id ='" + toStorageLoc + "'");

        if (fromPtLocRecord != null && toPtLocRecord != null) {
            qtyOnHandPtTo = toPtLocRecord.getDouble("pt_store_loc_pt.qty_on_hand");
            qtyOnReservePtTo = toPtLocRecord.getDouble("pt_store_loc_pt.qty_on_reserve");
            costUnitAvgPtTo = toPtLocRecord.getDouble("pt_store_loc_pt.cost_unit_avg");

            costUnitAvgPtFrom = fromPtLocRecord.getDouble("pt_store_loc_pt.cost_unit_avg");
            // fix issue that part cost average value is calculated not correct when quantity
            // available less than 0.
            double quantityNew = quantity;
            if (qtyOnHandPtTo < 0) {
                quantityNew = quantity + qtyOnHandPtTo;
                qtyOnHandPtTo = 0;
            }
            toPtLocRecord.setValue("pt_store_loc_pt.cost_unit_avg",
                (((qtyOnHandPtTo + qtyOnReservePtTo) * costUnitAvgPtTo)
                        + (quantityNew * costUnitAvgPtFrom))
                        / replaceNumberIfValueIsZero(
                            qtyOnHandPtTo + quantityNew + qtyOnReservePtTo));

            ptLocDS.saveRecord(toPtLocRecord);
        }
    }

    public int updatePartsAndITForMPSL(final String partId, final double quantity,
            final double price, final String inAction, final String fromStorageLoc,
            final String toStorageLoc, final String acId) {
        int transId = -1;
        final DataSource partDS =
                DataSourceFactory.createDataSourceForFields("pt",
                    new String[] { "part_id", "qty_on_hand", "qty_on_reserve", "cost_unit_avg",
                            "cost_unit_last", "cost_unit_std", "date_of_last_cnt",
                            "qty_physical_count" });

        final DataSource inventoryTransitionDS = DataSourceFactory.createDataSourceForFields("it",
            new String[] { "trans_id", "part_id", "trans_type", "trans_date", "trans_time",
                    "trans_quantity", "ac_id", "cost_when_used", "cost_total", "performed_by",
                    "pt_store_loc_from", "pt_store_loc_to" });

        final DataSource ptLocDS = DataSourceFactory.createDataSourceForFields("pt_store_loc_pt",
            new String[] { "part_id", "pt_store_loc_id", "qty_on_hand", "qty_on_reserve",
                    "cost_unit_avg", "cost_unit_last", "cost_unit_std", "date_of_last_cnt",
                    "qty_physical_count" });

        final DataRecord partRec = partDS.getRecord(" part_id='" + partId + "'");
        if (partRec == null) {
            return -1;
        }

        DataRecord fromPtLocRecord = null;
        DataRecord toPtLocRecord = null;
        double qtyOnHandPtFrom = 0;
        double qtyOnHandPtTo = 0;
        double qtyOnReservePtTo = 0;
        double costUnitAvgPtTo = 0;

        if (StringUtil.notNullOrEmpty(fromStorageLoc)) {
            BldgopsPartInventorySupplyRequisition.addNewPartToStoreLocIfNotExists(fromStorageLoc,
                partId);
            fromPtLocRecord = ptLocDS.getRecord(
                " part_id='" + partId + "' and pt_store_loc_id ='" + fromStorageLoc + "'");
            qtyOnHandPtFrom = fromPtLocRecord.getDouble("pt_store_loc_pt.qty_on_hand");
        }

        if (StringUtil.notNullOrEmpty(toStorageLoc)) {
            BldgopsPartInventorySupplyRequisition.addNewPartToStoreLocIfNotExists(toStorageLoc,
                partId);
            toPtLocRecord = ptLocDS
                .getRecord(" part_id='" + partId + "' and pt_store_loc_id ='" + toStorageLoc + "'");

            qtyOnHandPtTo = toPtLocRecord.getDouble("pt_store_loc_pt.qty_on_hand");
            qtyOnReservePtTo = toPtLocRecord.getDouble("pt_store_loc_pt.qty_on_reserve");
            costUnitAvgPtTo = toPtLocRecord.getDouble("pt_store_loc_pt.cost_unit_avg");
        }

        // Update part record with changed field values
        double qtyOnHandPt = partRec.getDouble("pt.qty_on_hand");
        final double qtyOnReservePt = partRec.getDouble("pt.qty_on_reserve");
        final double costUnitAvgPt = partRec.getDouble("pt.cost_unit_avg");
        final double costUnitStdPt = partRec.getDouble("pt.cost_unit_std");

        // kb#3042273: changed for part inventory enhancement of Bali3
        double quantityForUpdate = 0;
        final boolean isSchemaChanged = BldgopsPartInventoryUtility.isSchemaChanged();

        double costUnitLastNew = 0;
        // Calculate and Set correct quantity value to part record
        if (INVENTORY_TRANSACTION_ADD.equalsIgnoreCase(inAction)) {

            // kb#3042273: comments below code line since no need to update the part's quantity here
            if (!isSchemaChanged) {
                partRec.setValue("pt.qty_on_hand", qtyOnHandPt + quantity);
                toPtLocRecord.setValue("pt_store_loc_pt.qty_on_hand", qtyOnHandPtTo + quantity);
            } else {
                quantityForUpdate = quantity;
            }

            if (price > 0) {
                partRec.setValue("pt.cost_unit_last", price);
                // fix issue that part cost average value is calculated not correct when quantity
                // available less than 0.
                double quantityPtNew = quantity;
                if (qtyOnHandPt < 0) {
                    quantityPtNew = quantity + qtyOnHandPt;
                    qtyOnHandPt = 0;
                }
                final double costUnitAvgNew =
                        (((qtyOnHandPt + qtyOnReservePt) * costUnitAvgPt) + (quantityPtNew * price))
                                / replaceNumberIfValueIsZero(
                                    qtyOnHandPt + quantityPtNew + qtyOnReservePt);
                partRec.setValue("pt.cost_unit_avg", costUnitAvgNew);

                toPtLocRecord.setValue("pt_store_loc_pt.cost_unit_last", price);
                // fix issue that part cost average value is calculated not correct when quantity
                // available less than 0.
                double quantityNew = quantity;
                if (qtyOnHandPtTo < 0) {
                    quantityNew = quantity + qtyOnHandPtTo;
                    qtyOnHandPtTo = 0;
                }

                toPtLocRecord.setValue("pt_store_loc_pt.cost_unit_avg",
                    (((qtyOnHandPtTo + qtyOnReservePtTo) * costUnitAvgPtTo) + (quantityNew * price))
                            / replaceNumberIfValueIsZero(
                                qtyOnHandPtTo + quantityNew + qtyOnReservePtTo));

                costUnitLastNew = price;
            }

        } else if (INVENTORY_TRANSACTION_DISBURSE.equalsIgnoreCase(inAction)) {

            // kb#3042273: comments below code line since no need to update the part's quantity here
            if (!isSchemaChanged) {
                partRec.setValue("pt.qty_on_hand", qtyOnHandPt - quantity);
                fromPtLocRecord.setValue("pt_store_loc_pt.qty_on_hand", qtyOnHandPtFrom - quantity);
            } else {
                quantityForUpdate = -quantity;
            }

            costUnitLastNew = costUnitStdPt;

        } else if (INVENTORY_TRANSACTION_RETURN.equalsIgnoreCase(inAction)) {

            // kb#3042273: comments below code line since no need to update the part's quantity here
            if (!isSchemaChanged) {
                partRec.setValue("pt.qty_on_hand", qtyOnHandPt + quantity);
                toPtLocRecord.setValue("pt_store_loc_pt.qty_on_hand", qtyOnHandPtTo + quantity);
            } else {
                quantityForUpdate = quantity;
            }

            costUnitLastNew = costUnitStdPt;

        } else if (INVENTORY_TRANSACTION_RECTIFY.equalsIgnoreCase(inAction)) {

            toPtLocRecord.setValue("pt_store_loc_pt.qty_physical_count", quantity);
            ptLocDS.saveRecord(toPtLocRecord);
            final BldgopsPartInventoryMultiplePartStorageLocation partInv =
                    new BldgopsPartInventoryMultiplePartStorageLocation(partId, toStorageLoc);
            partInv.updateWRPTStatusByPhsicalCountForMpsl();

            // kb#3044626: also update the Date of last count when rectify.
            partRec.setValue("pt.date_of_last_cnt", Utility.currentDate());
            toPtLocRecord.setValue("pt_store_loc_pt.date_of_last_cnt", Utility.currentDate());

            costUnitLastNew = costUnitAvgPtTo;
        } else if ("transfer".equalsIgnoreCase(inAction)
                || "req_transfer".equalsIgnoreCase(inAction)) {

            final BldgopsPartInventoryMultiplePartStorageLocation partInvTo =
                    new BldgopsPartInventoryMultiplePartStorageLocation(partId, toStorageLoc);
            partInvTo.updateWrptStatusForMpsl(quantity);
            final BldgopsPartInventoryMultiplePartStorageLocation partInvFrom =
                    new BldgopsPartInventoryMultiplePartStorageLocation(partId, fromStorageLoc);
            if (qtyOnHandPtFrom < quantity) {
                partInvFrom.unReserveAllPartEstimationsForMpsl();
            }

            partInvFrom.updateWrptStatusForMpsl(-quantity);

            costUnitLastNew = fromPtLocRecord.getDouble("pt_store_loc_pt.cost_unit_avg");
        }

        partDS.saveRecord(partRec);
        if (fromPtLocRecord != null) {
            ptLocDS.saveRecord(fromPtLocRecord);
        }

        if (toPtLocRecord != null) {
            ptLocDS.saveRecord(toPtLocRecord);
        }

        if (!"req_transfer".equalsIgnoreCase(inAction)) {
            // Insert a new Inventory Transition record
            final DataRecord itRec = inventoryTransitionDS.createNewRecord();
            itRec.setValue("it.trans_type", inAction);
            itRec.setValue("it.part_id", partId);
            itRec.setValue("it.trans_date", Utility.currentDate());
            itRec.setValue("it.trans_time", Utility.currentTime());
            itRec.setValue("it.trans_quantity", quantity);

            if (StringUtil.notNullOrEmpty(acId) && !"null".equalsIgnoreCase(acId)) {
                itRec.setValue("it.ac_id", acId);
            }
            itRec.setValue("it.performed_by", ContextStore.get().getUser().getName());
            itRec.setValue("it.pt_store_loc_from", fromStorageLoc);
            itRec.setValue("it.pt_store_loc_to", toStorageLoc);

            final DataRecord itRecord = inventoryTransitionDS.saveRecord(itRec);

            transId = Integer.parseInt(itRecord.getValue("it.trans_id").toString());

            // fix issue that sometimes can not select max trans_id. so update cost value after save
            // record.
            final String updateCostSql = "update it set cost_when_used=" + costUnitLastNew
                    + ",cost_total=" + costUnitLastNew * quantity + " where trans_id=" + transId;

            SqlUtils.executeUpdate("it", updateCostSql);
        }

        // kb#3042273: changed for part inventory enhancement of Bali3
        if (isSchemaChanged) {
            if (!INVENTORY_TRANSACTION_RECTIFY.equalsIgnoreCase(inAction)
                    && !"transfer".equalsIgnoreCase(inAction)
                    && !"req_transfer".equalsIgnoreCase(inAction)) {
                String ptLoc = toStorageLoc;
                if (INVENTORY_TRANSACTION_DISBURSE.equalsIgnoreCase(inAction)) {
                    ptLoc = fromStorageLoc;
                }
                final BldgopsPartInventoryMultiplePartStorageLocation partInv =
                        new BldgopsPartInventoryMultiplePartStorageLocation(partId, ptLoc);
                partInv.updateWrptStatusForMpsl(quantityForUpdate);
            }
        }

        // kb#3035430: always run Calculate Inventory Usage from Adjust Inventory.
        this.CalculateInventoryUsageForMPSL();

        return transId;
    }

    /**
     * Excute 1//UPDATE pt SET qty_on_hand = qty_physical_count - qty_on_reserve 2This method serve
     * as a WFR to update inventory information to pt table meanwhile store the operation
     * transaction into it table.
     *
     * @param records
     */
    public void updateQuantityAvailableFromPhysicalCount(final JSONArray records) {

        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {

                final JSONObject record = records.getJSONObject(i);
                // UPDATE pt SET qty_on_hand = qty_physical_count - qty_on_reserve
                // new FieldFormula("pt").calculate("qty_on_hand",
                // "qty_physical_count - qty_on_reserve");
                this.updatePartsAndIT(record.getString("pt.part_id"),
                    record.getDouble("pt.qty_physical_count")
                            - record.getDouble("pt.qty_on_reserve"),
                    record.getDouble("pt.cost_unit_last"), "Rectify",
                    record.getString("pt.acc_prop_type"));
            }
        }

    }

    /**
     *
     * If value is 0, replace it to 9999999999999.999999.
     *
     * @param value Double value.
     * @return result Result.
     */
    public static double replaceNumberIfValueIsZero(final double value) {
        double result;
        if (value == 0) {
            result = 9999999999999.999999;
        } else {
            result = value;
        }

        return result;
    }

    /**
     * Excute 1//UPDATE pt SET qty_on_hand = qty_physical_count - qty_on_reserve 2This method serve
     * as a WFR to update inventory information to pt table meanwhile store the operation
     * transaction into it table.
     *
     * @param records
     */
    public void updateQuantityAvailableFromPhysicalCountForMPSL(final JSONArray records) {

        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {

                final JSONObject record = records.getJSONObject(i);
                // UPDATE pt SET qty_on_hand = qty_physical_count - qty_on_reserve
                // new FieldFormula("pt").calculate("qty_on_hand",
                // "qty_physical_count - qty_on_reserve");
                this.updatePartsAndITForMPSL(record.getString("pt_store_loc_pt.part_id"),
                    record.getDouble("pt_store_loc_pt.qty_physical_count"),
                    record.getDouble("pt_store_loc_pt.cost_unit_last"), "Rectify", null,
                    record.getString("pt_store_loc_pt.pt_store_loc_id"),
                    record.getString("pt.acc_prop_type"));
            }
        }

    }

    // ---------------------------------------------------------------------------------------------
    // END Update Inventory and Insert Inventory Transaction WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN Calculate Parts of Equipment WFR
    // ---------------------------------------------------------------------------------------------
    /*
     * Converted from PTXEQ.ABS 2010.08.5
     *
     * Performs parts of equipment calculations.
     */
    public void CalcEqPtUsePerYr() {
        new FieldFormula("ep").setAssignedRestriction("pt_life != 0").calculate("pt_use_yr",
            "(52/pt_life)*quantity");
        new FieldFormula("ep").setAssignedRestriction("pt_life = 0").calculate("pt_use_yr",
            "pt_life");
    }

    // ---------------------------------------------------------------------------------------------
    // END Calculate Parts of Equipment WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN Calculate Inventory Usage WFR
    // ---------------------------------------------------------------------------------------------
    /*
     * Converted from PTCALC.ABS 2010.08.5
     *
     * Performs parts inventory calculations: CostTotal, CalcDefaultAvgCost, DateLastUse,
     * QtyToDateYrUse, QtyYrUse, QtyWkUse, QtyVendors, QtyToOrder
     */
    public void CalculateInventoryUsage() {

        // Calculate parts total values
        new FieldFormula("pt").calculate("cost_total",
            "(qty_on_hand + qty_on_reserve) * cost_unit_std");

        // Calculate default parts average cost
        new FieldFormula("pt").setAssignedRestriction("cost_unit_avg = 0")
            .calculate("cost_unit_avg", "cost_unit_std");

        // Calculate quantity of vendors
        new FieldOperation("pt", "pv").addOperation("pt.qty_of_vendors", "COUNT", "*").calculate();

        // Calculate quantity to order
        new FieldFormula("pt").calculate("qty_to_order", "qty_min_hand - qty_on_hand");
        new FieldFormula("pt").setAssignedRestriction("qty_to_order < 0").calculate("qty_to_order",
            "0");

        // kb#3042273: change the calculation logics for field 'qty_to_order'when required schema
        // changed for Part Inventory Improvement.
        // pt.qty_to_order = if pt.qty on hand >= (pt.quantity_min_hand + sum (unreserved parts)),
        // then 0 else (pt.quantity_min_hand – (pt.qty on hand – sum (unreserved parts)))
        if (BldgopsPartInventoryUtility.isSchemaChanged()) {
            final StringBuilder sql = new StringBuilder();
            final StringBuilder sumSql = new StringBuilder();
            sumSql.append(EventHandlerBase.formatSqlIsNull(
                ContextStore.get().getEventHandlerContext(),
                "(select sum (qty_estimated) from wrpt where pt.part_id=wrpt.part_id and (wrpt.status='NI' or wrpt.status='NR')), 0"));

            sql.append("UPDATE pt SET pt.qty_to_order = ");
            sql.append("  CASE WHEN pt.qty_on_hand >= (pt.qty_min_hand +").append(sumSql.toString())
                .append("                             )");
            sql.append("  THEN 0 ");
            sql.append("      WHEN pt.qty_on_hand < (pt.qty_min_hand + ").append(sumSql.toString())
                .append("                             )");
            sql.append("  THEN pt.qty_min_hand - pt.qty_on_hand +").append(sumSql.toString());
            sql.append(" END");
            SqlUtils.executeUpdate("pt", sql.toString());
        }

        // Start Calculate date last used
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sDefaultDate =
                EventHandlerBase.formatSqlIsoToNativeDate(context, "1899-12-30");
        // Construct sql for select last date from hwrpt
        final String sMaxHwrpt =
                EventHandlerBase.formatSqlIsNull(context, " MAX(date_assigned)," + sDefaultDate);
        final StringBuilder selectMaxHwrptBuilder = new StringBuilder();
        selectMaxHwrptBuilder.append("( SELECT ").append(sMaxHwrpt);
        selectMaxHwrptBuilder.append("  FROM hwrpt");
        // kb#3042747: only considering the actual used part estimation.
        selectMaxHwrptBuilder.append("  WHERE hwrpt.part_id = pt.part_id and hwrpt.qty_actual>0 )");
        final String selectMaxHwrpt = selectMaxHwrptBuilder.toString();

        // Construct sql for select last date from it
        final String sMaxIt =
                EventHandlerBase.formatSqlIsNull(context, " MAX(trans_date), " + sDefaultDate);
        final StringBuilder selectMaxItBuilder = new StringBuilder();
        selectMaxItBuilder.append("( SELECT ").append(sMaxIt);
        selectMaxItBuilder.append("  FROM it ");
        selectMaxItBuilder.append("  WHERE it.part_id = pt.part_id");
        selectMaxItBuilder.append("        AND it.trans_type = 'Disburse')");
        final String selectMaxIt = selectMaxItBuilder.toString();

        // Construct sql for to update date_of_last_use of part
        final StringBuilder sqlStatement1 = new StringBuilder();
        sqlStatement1.append("UPDATE pt SET pt.date_of_last_use = ");
        sqlStatement1.append("(CASE WHEN ").append(selectMaxHwrpt).append(">").append(selectMaxIt);
        sqlStatement1.append("   THEN ").append(selectMaxHwrpt);
        sqlStatement1.append(" WHEN ").append(selectMaxIt).append(">").append(selectMaxHwrpt);
        sqlStatement1.append("   THEN ").append(selectMaxIt);
        sqlStatement1.append(" WHEN ").append(selectMaxIt).append("=").append(selectMaxHwrpt);
        sqlStatement1.append(" AND ").append(selectMaxIt).append(" <> ").append(sDefaultDate);
        sqlStatement1.append("   THEN ").append(selectMaxIt);
        sqlStatement1.append(" ELSE NULL END)");

        EventHandlerBase.executeDbSql(context, sqlStatement1.toString(), false);
        // End Calculate date last used

        // Calculate quantity to date year use of part
        final Calendar c = Calendar.getInstance();
        final String year = String.valueOf(c.get(Calendar.YEAR));
        final String FirstOfYear =
                EventHandlerBase.formatSqlIsoToNativeDate(context, year + "-01-01");
        final String sSumIt = EventHandlerBase.formatSqlIsNull(context, "SUM(it.trans_quantity),0");
        final String sSumHwrpt =
                EventHandlerBase.formatSqlIsNull(context, "SUM(hwrpt.qty_actual),0");
        final StringBuilder sqlStatement2 = new StringBuilder();
        sqlStatement2.append("UPDATE pt SET pt.qty_to_date_yr_use = ");
        if (SqlUtils.isOracle()) {
            sqlStatement2.append("(SELECT ( SELECT ").append(sSumIt);
        } else {
            sqlStatement2.append(" ( SELECT ").append(sSumIt);
        }

        sqlStatement2.append("  FROM it");
        sqlStatement2.append("  WHERE it.trans_type IN ('Disburse', 'Return')");
        sqlStatement2.append("        AND it.part_id = pt.part_id");
        sqlStatement2.append("        AND it.trans_date >= ").append(FirstOfYear);
        sqlStatement2.append(")");
        sqlStatement2.append(" + ");
        sqlStatement2.append("( SELECT ").append(sSumHwrpt);
        sqlStatement2.append("  FROM hwrpt,hwr");
        sqlStatement2.append("  WHERE hwrpt.part_id = pt.part_id");
        sqlStatement2.append("        AND hwr.wr_id = hwrpt.wr_id");
        sqlStatement2.append("        AND hwr.status <> 'Can'");
        sqlStatement2.append("        AND hwrpt.date_assigned >= ").append(FirstOfYear);
        if (SqlUtils.isOracle()) {
            sqlStatement2.append(") FROM dual)");
        } else {
            sqlStatement2.append(") ");
        }
        EventHandlerBase.executeDbSql(context, sqlStatement2.toString(), false);

        // Calculate quantity year use of part
        c.add(Calendar.YEAR, -1);
        final SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        final String YearAgo =
                EventHandlerBase.formatSqlIsoToNativeDate(context, df.format(c.getTime()));
        final StringBuilder sqlStatement3 = new StringBuilder();
        sqlStatement3.append("UPDATE pt SET pt.qty_calc_yr_use = ");
        if (SqlUtils.isOracle()) {
            sqlStatement3.append("(SELECT ( SELECT ").append(sSumIt);
        } else {
            sqlStatement3.append(" ( SELECT ").append(sSumIt);
        }

        sqlStatement3.append("  FROM it");
        sqlStatement3.append("  WHERE it.trans_type IN ('Disburse', 'Return')");
        sqlStatement3.append("        AND it.part_id = pt.part_id");
        sqlStatement3.append("        AND it.trans_date >= ").append(YearAgo);
        sqlStatement3.append("        AND it.trans_date < ").append(FirstOfYear);
        sqlStatement3.append(")");
        sqlStatement3.append("+");
        sqlStatement3.append("( SELECT ").append(sSumHwrpt);
        sqlStatement3.append("  FROM hwrpt,hwr");
        sqlStatement3.append("  WHERE hwrpt.part_id = pt.part_id");
        sqlStatement3.append("        AND hwr.wr_id = hwrpt.wr_id");
        sqlStatement3.append("        AND hwr.status <> 'Can'");
        sqlStatement3.append("        AND hwrpt.date_assigned >= ").append(YearAgo);
        sqlStatement3.append("        AND hwrpt.date_assigned < ").append(FirstOfYear);
        sqlStatement3.append(")");
        sqlStatement3.append("+");

        if (SqlUtils.isOracle()) {
            sqlStatement3.append("+ pt.qty_to_date_yr_use FROM dual)");
        } else {
            sqlStatement3.append("+ pt.qty_to_date_yr_use ");
        }

        EventHandlerBase.executeDbSql(context, sqlStatement3.toString(), false);

        // Calculate quantity week use
        new FieldFormula("pt").calculate("qty_calc_wk_use", "qty_calc_yr_use/52");
    }

    /*
     * Converted from PTCALC.ABS 2010.08.5
     *
     * Performs parts inventory calculations: CostTotal, CalcDefaultAvgCost, DateLastUse,
     * QtyToDateYrUse, QtyYrUse, QtyWkUse, QtyVendors, QtyToOrder
     */
    public void CalculateInventoryUsageForMPSL() {

        // Calculate parts total values
        new FieldFormula("pt").calculate("cost_total",
            "(qty_on_hand + qty_on_reserve) * cost_unit_std");

        new FieldFormula("pt_store_loc_pt").calculate("cost_total",
            "(qty_on_hand + qty_on_reserve) * cost_unit_std");

        // Calculate default parts average cost
        new FieldFormula("pt").setAssignedRestriction("cost_unit_avg = 0")
            .calculate("cost_unit_avg", "cost_unit_std");
        new FieldFormula("pt_store_loc_pt").setAssignedRestriction("cost_unit_avg = 0")
            .calculate("cost_unit_avg", "cost_unit_std");

        // Calculate quantity of vendors
        new FieldOperation("pt", "pv").addOperation("pt.qty_of_vendors", "COUNT", "*").calculate();

        // Calculate quantity to order
        new FieldFormula("pt").calculate("qty_to_order", "qty_min_hand - qty_on_hand");
        new FieldFormula("pt_store_loc_pt").calculate("qty_to_order", "qty_min_hand - qty_on_hand");

        new FieldFormula("pt").setAssignedRestriction("qty_to_order < 0").calculate("qty_to_order",
            "0");
        new FieldFormula("pt_store_loc_pt").setAssignedRestriction("qty_to_order < 0")
            .calculate("qty_to_order", "0");

        // kb#3042273: change the calculation logics for field 'qty_to_order'when required schema
        // changed for Part Inventory Improvement.
        // pt.qty_to_order = if pt.qty on hand >= (pt.quantity_min_hand + sum (unreserved parts)),
        // then 0 else (pt.quantity_min_hand – (pt.qty on hand – sum (unreserved parts)))
        if (BldgopsPartInventoryUtility.isSchemaChanged()) {
            StringBuilder sql = new StringBuilder();
            StringBuilder sumSql = new StringBuilder();
            sumSql.append(EventHandlerBase.formatSqlIsNull(
                ContextStore.get().getEventHandlerContext(),
                "(select sum (qty_estimated) from wrpt where pt.part_id=wrpt.part_id and (wrpt.status='NI' or wrpt.status='NR')), 0"));

            sql.append("UPDATE pt SET pt.qty_to_order = ");
            sql.append("  CASE WHEN pt.qty_on_hand >= (pt.qty_min_hand +").append(sumSql.toString())
                .append("                             )");
            sql.append("  THEN 0 ");
            sql.append("      WHEN pt.qty_on_hand < (pt.qty_min_hand + ").append(sumSql.toString())
                .append("                             )");
            sql.append("  THEN pt.qty_min_hand - pt.qty_on_hand +").append(sumSql.toString());
            sql.append(" END");
            SqlUtils.executeUpdate("pt", sql.toString());

            sql = new StringBuilder();
            sumSql = new StringBuilder();
            sumSql.append(EventHandlerBase.formatSqlIsNull(
                ContextStore.get().getEventHandlerContext(),
                "(select sum (qty_estimated) from wrpt where pt_store_loc_pt.part_id=wrpt.part_id and pt_store_loc_pt.pt_store_loc_id = wrpt.pt_store_loc_id and (wrpt.status='NI' or wrpt.status='NR')), 0"));

            sql.append("UPDATE pt_store_loc_pt SET pt_store_loc_pt.qty_to_order = ");
            sql.append("  CASE WHEN pt_store_loc_pt.qty_on_hand >= (pt_store_loc_pt.qty_min_hand +")
                .append(sumSql.toString()).append("                             )");
            sql.append("  THEN 0 ");
            sql.append("      WHEN pt_store_loc_pt.qty_on_hand < (pt_store_loc_pt.qty_min_hand + ")
                .append(sumSql.toString()).append("                             )");
            sql.append("  THEN pt_store_loc_pt.qty_min_hand - pt_store_loc_pt.qty_on_hand +")
                .append(sumSql.toString());
            sql.append(" END");
            SqlUtils.executeUpdate("pt_store_loc_pt", sql.toString());
        }

        // Start Calculate date last used
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sDefaultDate =
                EventHandlerBase.formatSqlIsoToNativeDate(context, "1899-12-30");
        // Construct sql for select last date from hwrpt
        String sMaxHwrpt =
                EventHandlerBase.formatSqlIsNull(context, " MAX(date_assigned)," + sDefaultDate);
        StringBuilder selectMaxHwrptBuilder = new StringBuilder();
        selectMaxHwrptBuilder.append("( SELECT ").append(sMaxHwrpt);
        selectMaxHwrptBuilder.append("  FROM hwrpt");
        // kb#3042747: only considering the actual used part estimation.
        selectMaxHwrptBuilder.append("  WHERE hwrpt.part_id = pt.part_id and hwrpt.qty_actual>0 )");
        String selectMaxHwrpt = selectMaxHwrptBuilder.toString();

        // Construct sql for select last date from it
        String sMaxIt =
                EventHandlerBase.formatSqlIsNull(context, " MAX(trans_date), " + sDefaultDate);
        StringBuilder selectMaxItBuilder = new StringBuilder();
        selectMaxItBuilder.append("( SELECT ").append(sMaxIt);
        selectMaxItBuilder.append("  FROM it ");
        selectMaxItBuilder.append("  WHERE it.part_id = pt.part_id");
        selectMaxItBuilder.append("        AND it.trans_type = 'Disburse')");
        String selectMaxIt = selectMaxItBuilder.toString();

        // Construct sql for to update date_of_last_use of part
        StringBuilder sqlStatement1 = new StringBuilder();
        sqlStatement1.append("UPDATE pt SET pt.date_of_last_use = ");
        sqlStatement1.append("(CASE WHEN ").append(selectMaxHwrpt).append(">").append(selectMaxIt);
        sqlStatement1.append("   THEN ").append(selectMaxHwrpt);
        sqlStatement1.append(" WHEN ").append(selectMaxIt).append(">").append(selectMaxHwrpt);
        sqlStatement1.append("   THEN ").append(selectMaxIt);
        sqlStatement1.append(" WHEN ").append(selectMaxIt).append("=").append(selectMaxHwrpt);
        sqlStatement1.append(" AND ").append(selectMaxIt).append(" <> ").append(sDefaultDate);
        sqlStatement1.append("   THEN ").append(selectMaxIt);
        sqlStatement1.append(" ELSE NULL END)");

        EventHandlerBase.executeDbSql(context, sqlStatement1.toString(), false);

        sMaxHwrpt =
                EventHandlerBase.formatSqlIsNull(context, " MAX(date_assigned)," + sDefaultDate);
        selectMaxHwrptBuilder = new StringBuilder();
        selectMaxHwrptBuilder.append("( SELECT ").append(sMaxHwrpt);
        selectMaxHwrptBuilder.append("  FROM hwrpt");
        // kb#3042747: only considering the actual used part estimation.
        selectMaxHwrptBuilder.append(
            "  WHERE hwrpt.part_id = pt_store_loc_pt.part_id and hwrpt.pt_store_loc_id = pt_store_loc_pt.pt_store_loc_id and hwrpt.qty_actual>0 )");
        selectMaxHwrpt = selectMaxHwrptBuilder.toString();

        // Construct sql for select last date from it
        sMaxIt = EventHandlerBase.formatSqlIsNull(context, " MAX(trans_date), " + sDefaultDate);
        selectMaxItBuilder = new StringBuilder();
        selectMaxItBuilder.append("( SELECT ").append(sMaxIt);
        selectMaxItBuilder.append("  FROM it ");
        selectMaxItBuilder.append(
            "  WHERE it.part_id = pt_store_loc_pt.part_id and it.pt_store_loc_from = pt_store_loc_pt.pt_store_loc_id");
        selectMaxItBuilder.append("        AND it.trans_type = 'Disburse')");
        selectMaxIt = selectMaxItBuilder.toString();

        // Construct sql for to update date_of_last_use of part
        sqlStatement1 = new StringBuilder();
        sqlStatement1.append("UPDATE pt_store_loc_pt SET pt_store_loc_pt.date_of_last_use = ");
        sqlStatement1.append("(CASE WHEN ").append(selectMaxHwrpt).append(">").append(selectMaxIt);
        sqlStatement1.append("   THEN ").append(selectMaxHwrpt);
        sqlStatement1.append(" WHEN ").append(selectMaxIt).append(">").append(selectMaxHwrpt);
        sqlStatement1.append("   THEN ").append(selectMaxIt);
        sqlStatement1.append(" WHEN ").append(selectMaxIt).append("=").append(selectMaxHwrpt);
        sqlStatement1.append(" AND ").append(selectMaxIt).append(" <> ").append(sDefaultDate);
        sqlStatement1.append("   THEN ").append(selectMaxIt);
        sqlStatement1.append(" ELSE NULL END)");

        EventHandlerBase.executeDbSql(context, sqlStatement1.toString(), false);
        // End Calculate date last used

        // Calculate quantity to date year use of part
        Calendar c = Calendar.getInstance();
        String year = String.valueOf(c.get(Calendar.YEAR));
        String FirstOfYear = EventHandlerBase.formatSqlIsoToNativeDate(context, year + "-01-01");
        String sSumIt = EventHandlerBase.formatSqlIsNull(context, "SUM(it.trans_quantity),0");
        String sSumHwrpt = EventHandlerBase.formatSqlIsNull(context, "SUM(hwrpt.qty_actual),0");
        StringBuilder sqlStatement2 = new StringBuilder();
        sqlStatement2.append("UPDATE pt SET pt.qty_to_date_yr_use = ");
        if (SqlUtils.isOracle()) {
            sqlStatement2.append("(SELECT ( SELECT ").append(sSumIt);
        } else {
            sqlStatement2.append(" ( SELECT ").append(sSumIt);
        }

        sqlStatement2.append("  FROM it");
        sqlStatement2.append("  WHERE it.trans_type IN ('Disburse', 'Return')");
        sqlStatement2.append("        AND it.part_id = pt.part_id");
        sqlStatement2.append("        AND it.trans_date >= ").append(FirstOfYear);
        sqlStatement2.append(")");
        sqlStatement2.append(" + ");
        sqlStatement2.append("( SELECT ").append(sSumHwrpt);
        sqlStatement2.append("  FROM hwrpt,hwr");
        sqlStatement2.append("  WHERE hwrpt.part_id = pt.part_id");
        sqlStatement2.append("        AND hwr.wr_id = hwrpt.wr_id");
        sqlStatement2.append("        AND hwr.status <> 'Can'");
        sqlStatement2.append("        AND hwrpt.date_assigned >= ").append(FirstOfYear);
        if (SqlUtils.isOracle()) {
            sqlStatement2.append(") FROM dual)");
        } else {
            sqlStatement2.append(") ");
        }
        EventHandlerBase.executeDbSql(context, sqlStatement2.toString(), false);

        c = Calendar.getInstance();
        year = String.valueOf(c.get(Calendar.YEAR));
        FirstOfYear = EventHandlerBase.formatSqlIsoToNativeDate(context, year + "-01-01");
        sSumIt = EventHandlerBase.formatSqlIsNull(context, "SUM(it.trans_quantity),0");
        sSumHwrpt = EventHandlerBase.formatSqlIsNull(context, "SUM(hwrpt.qty_actual),0");
        sqlStatement2 = new StringBuilder();
        sqlStatement2.append("UPDATE pt_store_loc_pt SET pt_store_loc_pt.qty_to_date_yr_use = ");
        if (SqlUtils.isOracle()) {
            sqlStatement2.append("(SELECT ( SELECT ").append(sSumIt);
        } else {
            sqlStatement2.append(" ( SELECT ").append(sSumIt);
        }

        sqlStatement2.append("  FROM it");
        sqlStatement2.append("  WHERE it.trans_type IN ('Disburse', 'Return')");
        sqlStatement2.append(
            "        AND it.part_id = pt_store_loc_pt.part_id AND (it.pt_store_loc_from = pt_store_loc_pt.pt_store_loc_id or it.pt_store_loc_to = pt_store_loc_pt.pt_store_loc_id)");
        sqlStatement2.append("        AND it.trans_date >= ").append(FirstOfYear);
        sqlStatement2.append(")");
        sqlStatement2.append(" + ");
        sqlStatement2.append("( SELECT ").append(sSumHwrpt);
        sqlStatement2.append("  FROM hwrpt,hwr");
        sqlStatement2.append(
            "  WHERE hwrpt.part_id = pt_store_loc_pt.part_id and hwrpt.pt_store_loc_id=pt_store_loc_pt.pt_store_loc_id");
        sqlStatement2.append("        AND hwr.wr_id = hwrpt.wr_id");
        sqlStatement2.append("        AND hwr.status <> 'Can'");
        sqlStatement2.append("        AND hwrpt.date_assigned >= ").append(FirstOfYear);
        if (SqlUtils.isOracle()) {
            sqlStatement2.append(") FROM dual)");
        } else {
            sqlStatement2.append(") ");
        }
        EventHandlerBase.executeDbSql(context, sqlStatement2.toString(), false);

        // Calculate quantity year use of part
        c.add(Calendar.YEAR, -1);
        final SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        String YearAgo = EventHandlerBase.formatSqlIsoToNativeDate(context, df.format(c.getTime()));
        StringBuilder sqlStatement3 = new StringBuilder();
        sqlStatement3.append("UPDATE pt SET pt.qty_calc_yr_use = ");
        if (SqlUtils.isOracle()) {
            sqlStatement3.append("(SELECT ( SELECT ").append(sSumIt);
        } else {
            sqlStatement3.append(" ( SELECT ").append(sSumIt);
        }

        sqlStatement3.append("  FROM it");
        sqlStatement3.append("  WHERE it.trans_type IN ('Disburse', 'Return')");
        sqlStatement3.append("        AND it.part_id = pt.part_id");
        sqlStatement3.append("        AND it.trans_date >= ").append(YearAgo);
        sqlStatement3.append("        AND it.trans_date < ").append(FirstOfYear);
        sqlStatement3.append(")");
        sqlStatement3.append("+");
        sqlStatement3.append("( SELECT ").append(sSumHwrpt);
        sqlStatement3.append("  FROM hwrpt,hwr");
        sqlStatement3.append("  WHERE hwrpt.part_id = pt.part_id");
        sqlStatement3.append("        AND hwr.wr_id = hwrpt.wr_id");
        sqlStatement3.append("        AND hwr.status <> 'Can'");
        sqlStatement3.append("        AND hwrpt.date_assigned >= ").append(YearAgo);
        sqlStatement3.append("        AND hwrpt.date_assigned < ").append(FirstOfYear);
        sqlStatement3.append(")");
        sqlStatement3.append("+");

        if (SqlUtils.isOracle()) {
            sqlStatement3.append("+ pt.qty_to_date_yr_use FROM dual)");
        } else {
            sqlStatement3.append("+ pt.qty_to_date_yr_use ");
        }

        EventHandlerBase.executeDbSql(context, sqlStatement3.toString(), false);

        // Calculate quantity week use
        new FieldFormula("pt").calculate("qty_calc_wk_use", "qty_calc_yr_use/52");

        // Calculate quantity year use of part
        c.add(Calendar.YEAR, -1);
        YearAgo = EventHandlerBase.formatSqlIsoToNativeDate(context, df.format(c.getTime()));
        sqlStatement3 = new StringBuilder();
        sqlStatement3.append("UPDATE pt_store_loc_pt SET pt_store_loc_pt.qty_calc_yr_use = ");
        if (SqlUtils.isOracle()) {
            sqlStatement3.append("(SELECT ( SELECT ").append(sSumIt);
        } else {
            sqlStatement3.append(" ( SELECT ").append(sSumIt);
        }

        sqlStatement3.append("  FROM it");
        sqlStatement3.append("  WHERE it.trans_type IN ('Disburse', 'Return')");
        sqlStatement3.append(
            "        AND it.part_id = pt_store_loc_pt.part_id and (it.pt_store_loc_from = pt_store_loc_pt.pt_store_loc_id or it.pt_store_loc_to = pt_store_loc_pt.pt_store_loc_id)");
        sqlStatement3.append("        AND it.trans_date >= ").append(YearAgo);
        sqlStatement3.append("        AND it.trans_date < ").append(FirstOfYear);
        sqlStatement3.append(")");
        sqlStatement3.append("+");
        sqlStatement3.append("( SELECT ").append(sSumHwrpt);
        sqlStatement3.append("  FROM hwrpt,hwr");
        sqlStatement3.append(
            "  WHERE hwrpt.part_id = pt_store_loc_pt.part_id and hwrpt.pt_store_loc_id=pt_store_loc_pt.pt_store_loc_id");
        sqlStatement3.append("        AND hwr.wr_id = hwrpt.wr_id");
        sqlStatement3.append("        AND hwr.status <> 'Can'");
        sqlStatement3.append("        AND hwrpt.date_assigned >= ").append(YearAgo);
        sqlStatement3.append("        AND hwrpt.date_assigned < ").append(FirstOfYear);
        sqlStatement3.append(")");
        sqlStatement3.append("+");

        if (SqlUtils.isOracle()) {
            sqlStatement3.append("+ pt_store_loc_pt.qty_to_date_yr_use FROM dual)");
        } else {
            sqlStatement3.append("+ pt_store_loc_pt.qty_to_date_yr_use ");
        }

        EventHandlerBase.executeDbSql(context, sqlStatement3.toString(), false);

        // Calculate quantity week use
        new FieldFormula("pt_store_loc_pt").calculate("qty_calc_wk_use", "qty_calc_yr_use/52");
    }

    // ---------------------------------------------------------------------------------------------
    // END Calculate Inventory Usage WFR
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN Calculate Tool Type Quantity by Tools
    // ---------------------------------------------------------------------------------------------
    public void updateTtByTl() {
        // Calculate quantity of vendors
        new FieldOperation("tt", "tl").addOperation("tt.total_quantity", "COUNT", "*").calculate();

    }
    // ---------------------------------------------------------------------------------------------
    // END Calculate Tool Type Quantity by Tools
    // ---------------------------------------------------------------------------------------------

}
