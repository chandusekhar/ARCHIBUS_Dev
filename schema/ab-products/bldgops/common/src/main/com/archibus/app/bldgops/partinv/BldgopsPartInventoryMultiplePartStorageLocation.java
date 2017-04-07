package com.archibus.app.bldgops.partinv;

import static com.archibus.app.bldgops.partinv.BldgopsPartInventoryConstant.*;

import java.util.List;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ParsedRestrictionDef;

/**
 * Bldgops Multiple Part Storage Location.
 *
 * <p>
 * History:
 * <li>23.1: Add for Bali5 Bldgops Multiple Part Storage Location Feature.
 *
 * @author Guo Jiangtao
 */
public class BldgopsPartInventoryMultiplePartStorageLocation {

    /**
     * Single Part Inventory.
     *
     */
    private final DataRecord partLocRecord;

    /**
     * Estimated Parts for updating passed from client.
     *
     */
    private final List<DataRecord> estimatedParts;

    /**
     * Part ID.
     *
     */
    private final String partId;

    /**
     * Part Location.
     *
     */
    private final String partLoc;

    /**
     * Single Part Inventory.
     *
     */
    private final DataRecord part;

    /**
     * DataSource of table pt(part).
     */
    private final DataSource partDS;

    /**
     * DataSource of table pt_store_loc_pt.
     */
    private final DataSource partLocDS;

    /**
     * DataSource of table wrpt(estimated part).
     */
    private final DataSource estimatedPartDS;

    /**
     * array of part field names.
     */
    private final String[] partFields = new String[] { PART_ID, "qty_on_hand", "qty_on_order",
            "qty_on_reserve", "qty_physical_count", "qty_to_order", "qty_min_hand" };

    /**
     * array of estimated part field names.
     */
    private final String[] estimatedPartFields =
            new String[] { PART_ID, "qty_estimated", "qty_actual", "qty_picked", STATUS, "wr_id" };

    /**
     *
     * Adjusts the status of part estimations as part quantities increase or decrease. The system
     * will call this WFR any time there is a change to any part's Quantity Available
     * (pt.qty_on_hand) or part estimates become "unreserved".
     *
     * @param partId String part code.
     * @param ptLoc String part storage location
     */
    public BldgopsPartInventoryMultiplePartStorageLocation(final String partId, final String ptLoc) {

        this.partId = partId;
        this.partLoc = ptLoc;

        this.partDS = DataSourceFactory.createDataSourceForFields(PT_TABLE, this.partFields);
        this.partLocDS =
                DataSourceFactory.createDataSourceForFields(PT_STORE_LOC_PT_TABLE, this.partFields);
        this.partLocDS.addField(PT_STORE_LOC_ID);

        this.estimatedPartDS =
                DataSourceFactory.createDataSourceForFields(WRPT_TABLE, this.estimatedPartFields);

        this.part = this.partDS.getRecord("part_id= '" + this.partId + "'   ");
        this.partLocRecord = this.partLocDS.getRecord(
            "part_id='" + this.partId + "' and pt_store_loc_id = '" + this.partLoc + "'  ");

        this.estimatedParts = BldgopsPartInventoryUtility
            .getEstimatedPartsById(this.estimatedPartDS, this.partId);

    }

    /**
     *
     * Update part's quantity and estimate quantity.
     *
     * @param quantity double adjusted part quantity.
     */
    public void updateWrptStatusForMpsl(final double quantity) {

        if (quantity > 0) {

            this.updateStatusForQuantityIncreaseForMpsl(quantity);

        } else if (quantity < 0) {

            this.updateStatusForQuantityDecreaseForMpsl(quantity);
        }

        this.calculateReservedQuantityOfPartForMpsl();
    }

    /**
     *
     * Update estimated parts status when available quantity increases.
     *
     * @param quantity double adjusted part quantity.
     */
    public void updateStatusForQuantityIncreaseForMpsl(final double quantity) {

        // Query 'Not In Stock' estimated parts
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();

        resDef.addClause(WRPT_TABLE, PART_ID, this.partId, Operation.EQUALS);
        resDef.addClause(WRPT_TABLE, PT_STORE_LOC_ID, this.partLoc, Operation.EQUALS);
        resDef.addClause(WRPT_TABLE, STATUS, NOT_IN_STOCK, Operation.EQUALS);

        this.estimatedParts.clear();
        this.estimatedParts.addAll(this.estimatedPartDS.getRecords(resDef));

        // calculate new available quantity
        final double currentAvailableQuantity = this.partLocRecord.getDouble(PT_LOC_QTY_ON_HAND);
        final double newAvailableQuantity = currentAvailableQuantity + quantity;

        // Loop all estimated parts to check if the quantity estimated is less than or equal to the
        // part's new Quantity Available,then change the status of the estimate to "In Stock, not
        // Reserved"
        for (final DataRecord estimatePart : this.estimatedParts) {

            final double estimatedQuantity = estimatePart.getDouble(WRPT_QTY_ESTIMATED);
            if (newAvailableQuantity >= estimatedQuantity) {

                estimatePart.setValue(WRPT_STATUS, NOT_RESERVED);
                this.estimatedPartDS.updateRecord(estimatePart);
            }
        }

        this.part.setValue(PT_QTY_ON_HAND, this.part.getDouble(PT_QTY_ON_HAND) + quantity);
        this.partLocRecord.setValue(PT_LOC_QTY_ON_HAND, currentAvailableQuantity + quantity);
        this.partDS.updateRecord(this.part);
        this.partLocDS.updateRecord(this.partLocRecord);
    }

    /**
     *
     * Update estimated parts status when available quantity decreases.
     *
     * @param quantity double adjusted part quantity.
     */
    public void updateStatusForQuantityDecreaseForMpsl(final double quantity) {

        // Query 'In Stock, Not Reserved' estimated parts
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();

        resDef.addClause(WRPT_TABLE, PART_ID, this.partId, Operation.EQUALS);
        resDef.addClause(WRPT_TABLE, PT_STORE_LOC_ID, this.partLoc, Operation.EQUALS);
        resDef.addClause(WRPT_TABLE, STATUS, NOT_RESERVED, Operation.EQUALS);

        this.estimatedParts.clear();
        this.estimatedParts.addAll(this.estimatedPartDS.getRecords(resDef));

        // calculate new available quantity
        final double currentAvailableQuantity = this.partLocRecord.getDouble(PT_LOC_QTY_ON_HAND);
        final double newAvailableQuantity = currentAvailableQuantity + quantity;

        // Loop all estimated parts to check if the quantity estimated is greater than the
        // part's new Quantity Available,then change the status of the estimate to "Not In Stock"
        for (final DataRecord estimatePart : this.estimatedParts) {

            final double estimatedQuantity = estimatePart.getDouble(WRPT_QTY_ESTIMATED);
            if (newAvailableQuantity < estimatedQuantity) {

                estimatePart.setValue(WRPT_STATUS, NOT_IN_STOCK);
                this.estimatedPartDS.updateRecord(estimatePart);
            }
        }

        this.part.setValue(PT_QTY_ON_HAND, this.part.getDouble(PT_QTY_ON_HAND) + quantity);
        this.partDS.updateRecord(this.part);

        this.partLocRecord.setValue(PT_LOC_QTY_ON_HAND, newAvailableQuantity);
        this.partLocDS.updateRecord(this.partLocRecord);
    }

    /**
     *
     * When a part estimation is changed, update the part's available quantity and its other
     * associated wrpt's status.
     *
     * @param wrId int work request id.
     * @param date String assigned date.
     * @param time String assigned time.
     * @param difference double difference of part estimated quantity.
     */
    public void adjustPartEstimationQuantityForMpsl(final int wrId, final String date,
            final String time, final double difference) {

        final StringBuffer restriction = new StringBuffer();
        restriction.append(" pt_store_loc_id = "
                + EventHandlerBase.literal(ContextStore.get().getEventHandlerContext(),
                    this.partLoc)
                + " and part_id = "
                + EventHandlerBase.literal(ContextStore.get().getEventHandlerContext(), this.partId)
                + " AND wr_id = " + wrId + " AND date_assigned = " + date + " AND time_assigned = "
                + time);

        final DataRecord estimatePart = this.estimatedPartDS.getRecord(restriction.toString());

        final double newEstimateQty = estimatePart.getDouble(WRPT_QTY_ESTIMATED);
        final double oldEstimateQty = newEstimateQty - difference;
        final String status = estimatePart.getString(WRPT_STATUS);
        final double availableQuantity = this.partLocRecord.getDouble(PT_LOC_QTY_ON_HAND);

        // if no estimated quantity change then return
        if (difference == 0) {
            return;
        }

        double quantity = 0;
        if (RESERVED.equalsIgnoreCase(status)) {

            if (difference > availableQuantity) {

                estimatePart.setValue(WRPT_STATUS, NOT_IN_STOCK);
                quantity = oldEstimateQty;

            } else if (difference <= availableQuantity) {

                quantity = -difference;
            }

        } else {
            BldgopsPartInventoryUtility.updateStatusOfNotReservedWrpt(estimatePart, status,
                difference, newEstimateQty, availableQuantity);
        }

        this.estimatedPartDS.updateRecord(estimatePart);

        if (quantity != 0) {

            this.updateWrptStatusForMpsl(quantity);
        }
    }

    /**
     *
     * Re-set status of wrpt that just changed the estimated quantity and is not 'reserved'.
     *
     * @param estimatePart DataRecord wrpt record.
     * @param status String wrpt status.
     */
    public void updateStatusForRequestCloseForMpsl(final DataRecord estimatePart,
            final String status) {

        final double estimateQty = estimatePart.getDouble(WRPT_QTY_ESTIMATED);
        final double actualQty = estimatePart.getDouble(QTY_ACTUAL);
        final double availableQty = this.partLocRecord.getDouble(PT_LOC_QTY_ON_HAND);
        final double reservedQty = this.partLocRecord.getDouble(PT_LOC_QTY_ON_RESERVE);
        final double difference = actualQty - estimateQty;

        // kb3043739: when closing a Not reserved part estimation, just take its actual quantity
        // used as the difference between estimation and actualy used.
        if (NOT_IN_STOCK.equalsIgnoreCase(status) || NOT_RESERVED.equalsIgnoreCase(status)) {

            if (actualQty > 0) {
                this.updateStatusForQuantityDecreaseForMpsl(-actualQty);
            }

        } else {
            if (difference > 0) {

                if (difference <= availableQty) {

                    this.part.setValue(PT_QTY_ON_RESERVE,
                        this.part.getDouble(PT_QTY_ON_RESERVE) - estimateQty);
                    this.partDS.updateRecord(this.part);
                    this.partLocRecord.setValue(PT_LOC_QTY_ON_RESERVE, reservedQty - estimateQty);
                    this.partLocDS.updateRecord(this.partLocRecord);

                    this.updateStatusForQuantityDecreaseForMpsl(-difference);

                } else if (difference > availableQty) {

                    this.unReserveAllPartEstimationsForMpsl();
                    this.updateStatusForQuantityDecreaseForMpsl(-difference);
                }

            } else if (difference < 0) {

                this.part.setValue(PT_QTY_ON_RESERVE,
                    this.part.getDouble(PT_QTY_ON_RESERVE) - estimateQty);
                this.partDS.updateRecord(this.part);

                this.partLocRecord.setValue(PT_LOC_QTY_ON_RESERVE, reservedQty - estimateQty);
                this.partLocDS.updateRecord(this.partLocRecord);

                this.updateStatusForQuantityIncreaseForMpsl(-difference);

            } else {
                // kb#3044675: also update part's available quantity when actual used is equal to
                // estimated
                this.part.setValue(PT_QTY_ON_RESERVE,
                    this.part.getDouble(PT_QTY_ON_RESERVE) - estimateQty);
                this.partDS.updateRecord(this.part);

                this.partLocRecord.setValue(PT_LOC_QTY_ON_RESERVE, reservedQty - estimateQty);
                this.partLocDS.updateRecord(this.partLocRecord);
            }
        }
    }

    /**
     *
     * Update reserved estimated parts to be 'In Stock Not Reserved', recalculate reserved quantity
     * and available quantity.
     *
     */
    public void unReserveAllPartEstimationsForMpsl() {

        // Query 'Reserved' estimated parts
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();

        resDef.addClause(WRPT_TABLE, PART_ID, this.partId, Operation.EQUALS);
        resDef.addClause(WRPT_TABLE, PT_STORE_LOC_ID, this.partLoc, Operation.EQUALS);
        resDef.addClause(WRPT_TABLE, STATUS, RESERVED, Operation.EQUALS);

        this.estimatedParts.clear();
        this.estimatedParts.addAll(this.estimatedPartDS.getRecords(resDef));

        // Loop all reserved estimated parts to get the sum reserved quantity
        double sumReserved = 0;
        for (final DataRecord estimatePart : this.estimatedParts) {

            final double estimatedQuantity = estimatePart.getDouble(WRPT_QTY_ESTIMATED);
            sumReserved += estimatedQuantity;
            estimatePart.setValue(WRPT_STATUS, NOT_RESERVED);
            this.estimatedPartDS.updateRecord(estimatePart);
        }

        this.part.setValue(PT_QTY_ON_RESERVE, this.part.getDouble(PT_QTY_ON_RESERVE) - sumReserved);
        this.part.setValue(PT_QTY_ON_HAND, sumReserved + this.part.getDouble(PT_QTY_ON_HAND));
        this.partDS.updateRecord(this.part);

        this.partLocRecord.setValue(PT_LOC_QTY_ON_RESERVE, 0.0);
        this.partLocRecord.setValue(PT_LOC_QTY_ON_HAND,
            sumReserved + this.partLocRecord.getDouble(PT_LOC_QTY_ON_HAND));
        this.partLocDS.updateRecord(this.partLocRecord);
    }

    /**
     *
     * Calculate part's reserved quantity after all part estimations update.
     *
     */
    private void calculateReservedQuantityOfPartForMpsl() {

        final List<DataRecord> allEstimatedParts = BldgopsPartInventoryUtility
            .getEstimatedPartsById(this.estimatedPartDS, this.partId);

        double reservedQuantity = 0;

        for (final DataRecord estimatePart : allEstimatedParts) {

            if (RESERVED.equalsIgnoreCase(estimatePart.getString(WRPT_STATUS))) {

                reservedQuantity += estimatePart.getDouble(WRPT_QTY_ESTIMATED);
            }
        }

        this.part.setValue(PT_QTY_ON_RESERVE, reservedQuantity);
        this.partDS.updateRecord(this.part);

        final List<DataRecord> allEstimatedPartsOfCurrentLoc = this.estimatedPartDS.getRecords(
            " part_id='" + this.partId + "' and pt_store_loc_id='" + this.partLoc + "'");

        double reservedQuantityOfCurrentLoc = 0;

        for (final DataRecord estimatePart : allEstimatedPartsOfCurrentLoc) {

            if (RESERVED.equalsIgnoreCase(estimatePart.getString(WRPT_STATUS))) {

                reservedQuantityOfCurrentLoc += estimatePart.getDouble(WRPT_QTY_ESTIMATED);
            }
        }

        this.partLocRecord.setValue(PT_LOC_QTY_ON_RESERVE, reservedQuantityOfCurrentLoc);
        this.partLocDS.updateRecord(this.partLocRecord);
    }

    /**
     *
     * Re-set status of part estimations as well as part's quantity values since directly setting of
     * part's phsical count.
     *
     */
    public void updateWRPTStatusByPhsicalCountForMpsl() {

        final double reservedQty = this.partLocRecord.getDouble(PT_LOC_QTY_ON_RESERVE);
        final double phsicalQty =
                this.partLocRecord.getDouble("pt_store_loc_pt.qty_physical_count");
        final double availableQty = this.partLocRecord.getDouble(PT_LOC_QTY_ON_HAND);

        if (phsicalQty < reservedQty) {

            this.unReserveAllPartEstimationsForMpsl();

            this.updateStatusForQuantityDecreaseForMpsl(phsicalQty - reservedQty - availableQty);
            // kb#3043789: also need to process 'Not In Stock' part estimations even after quantity
            // decrease.
            this.updateStatusForQuantityIncreaseForMpsl(0);

        } else if (phsicalQty < reservedQty + availableQty) {

            this.updateStatusForQuantityDecreaseForMpsl(phsicalQty - reservedQty - availableQty);

        } else if (phsicalQty > reservedQty + availableQty) {

            this.updateStatusForQuantityIncreaseForMpsl(phsicalQty - reservedQty - availableQty);
        }
    }
}
