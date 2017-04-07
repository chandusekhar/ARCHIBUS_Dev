package com.archibus.app.bldgops.partinv;

import static com.archibus.app.bldgops.partinv.BldgopsPartInventoryConstant.*;

import java.util.List;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.model.view.datasource.ClauseDef.*;
import com.archibus.model.view.datasource.ParsedRestrictionDef;

/**
 * Bldgops Part Inventory Object.
 *
 * <p>
 * History:
 * <li>21.2: Add for Bali3 Bldgops Part Inventory Feature.
 *
 * @author Zhang Yi
 *
 *
 */
public class BldgopsPartInventory {

    /**
     * Single Part Inventory.
     *
     */
    private final DataRecord part;

    /**
     * Part ID.
     *
     */
    private final String partId;

    /**
     * Estimated Parts for updating passed from client.
     *
     */
    private final List<DataRecord> estimatedParts;

    /**
     * DataSource of table pt(part).
     */
    private final DataSource partDS;

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
     */
    public BldgopsPartInventory(final String partId) {

        this.partId = partId;

        this.partDS = DataSourceFactory.createDataSourceForFields(PT_TABLE, this.partFields);
        this.estimatedPartDS =
                DataSourceFactory.createDataSourceForFields(WRPT_TABLE, this.estimatedPartFields);

        this.part = this.partDS.getRecord("part_id='" + this.partId + "'");

        this.estimatedParts = BldgopsPartInventoryUtility
            .getEstimatedPartsById(this.estimatedPartDS, this.partId);

    }

    /**
     *
     * Update part's quantity and estimate quantity.
     *
     * @param quantity double adjusted part quantity.
     */
    public void updateWRPTStatus(final double quantity) {

        if (quantity > 0) {

            this.updateStatusForQuantityIncrease(quantity);

        } else if (quantity < 0) {

            this.updateStatusForQuantityDecrease(quantity);
        }

        this.calculateReservedQuantityOfPart();
    }

    /**
     *
     * Update estimated parts status when available quantity increases.
     *
     * @param quantity double adjusted part quantity.
     */
    public void updateStatusForQuantityIncrease(final double quantity) {

        // Query 'Not In Stock' estimated parts
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();

        resDef.addClause(WRPT_TABLE, PART_ID, this.partId, Operation.EQUALS);
        resDef.addClause(WRPT_TABLE, STATUS, NOT_IN_STOCK, Operation.EQUALS);

        this.estimatedParts.clear();
        this.estimatedParts.addAll(this.estimatedPartDS.getRecords(resDef));

        // calculate new available quantity
        final double currentAvailableQuantity = this.part.getDouble(PT_QTY_ON_HAND);
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

        this.part.setValue(PT_QTY_ON_HAND, currentAvailableQuantity + quantity);
        this.partDS.updateRecord(this.part);
    }

    /**
     *
     * Update estimated parts status when available quantity decreases.
     *
     * @param quantity double adjusted part quantity.
     */
    public void updateStatusForQuantityDecrease(final double quantity) {

        // Query 'In Stock, Not Reserved' estimated parts
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();

        resDef.addClause(WRPT_TABLE, PART_ID, this.partId, Operation.EQUALS);
        resDef.addClause(WRPT_TABLE, STATUS, NOT_RESERVED, Operation.EQUALS);

        this.estimatedParts.clear();
        this.estimatedParts.addAll(this.estimatedPartDS.getRecords(resDef));

        // calculate new available quantity
        final double currentAvailableQuantity = this.part.getDouble(PT_QTY_ON_HAND);
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

        this.part.setValue(PT_QTY_ON_HAND, newAvailableQuantity);
        this.partDS.updateRecord(this.part);
    }

    /**
     *
     * Calculate quantities and costs for the parts inventory.
     *
     */
    public void calculatePartQuantity() {

        // Query 'In Stock, Not Reserved' or 'Not In Stock' estimated parts
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();

        resDef.addClause(WRPT_TABLE, PART_ID, this.partId, Operation.EQUALS);
        resDef.addClause(WRPT_TABLE, STATUS, NOT_RESERVED, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        resDef.addClause(WRPT_TABLE, STATUS, NOT_IN_STOCK, Operation.EQUALS, RelativeOperation.OR);

        this.estimatedParts.clear();
        this.estimatedParts.addAll(this.estimatedPartDS.getRecords(resDef));

        // "Unreserved Parts" is calculated as the quantity estimated for part estimates that have a
        // status of Not In Stock or In Stock, Not Reserved (wrpt.status = 'NI' or 'NR')
        double sumUnReserved = 0;
        for (final DataRecord estimatePart : this.estimatedParts) {

            sumUnReserved += estimatePart.getDouble(WRPT_QTY_ESTIMATED);
        }

        // Determine if there are enough parts available to account for all unreserved estimates and
        // the minimum to keep on hand, and if so, set Quantity Understocked to 0. Otherwise, add up
        // the number of parts needed for all unreserved estimates plus the minimum to keep on hand,
        // and subtract the current number of parts available to come up with the Quantity
        // Understocked.
        final double availableQuantity = this.part.getDouble(PT_QTY_ON_HAND);
        final double minimunAvailableQuantity = this.part.getDouble("pt.qty_min_hand");
        if (availableQuantity >= minimunAvailableQuantity + sumUnReserved) {
            this.part.setValue(PT_QTY_TO_ORDER, 0);

        } else {
            this.part.setValue(PT_QTY_TO_ORDER,
                minimunAvailableQuantity + sumUnReserved - availableQuantity);
        }
        this.partDS.updateRecord(this.part);
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
    public void adjustPartEstimationQuantity(final int wrId, final String date, final String time,
            final double difference) {

        final StringBuffer restriction = new StringBuffer();
        restriction
            .append(" part_id = "
                    + EventHandlerBase.literal(ContextStore.get().getEventHandlerContext(),
                        this.partId)
                    + " AND wr_id = " + wrId + " AND date_assigned = " + date
                    + " AND time_assigned = " + time);

        final DataRecord estimatePart = this.estimatedPartDS.getRecord(restriction.toString());

        final double newEstimateQty = estimatePart.getDouble(WRPT_QTY_ESTIMATED);
        final double oldEstimateQty = newEstimateQty - difference;
        final String status = estimatePart.getString(WRPT_STATUS);
        final double availableQuantity = this.part.getDouble(PT_QTY_ON_HAND);

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

            this.updateWRPTStatus(quantity);
        }
    }

    /**
     *
     * Re-set status of wrpt that just changed the estimated quantity and is not 'reserved'.
     *
     * @param estimatePart DataRecord wrpt record.
     * @param status String wrpt status.
     */
    public void updateStatusForRequestClose(final DataRecord estimatePart, final String status) {

        final double estimateQty = estimatePart.getDouble(WRPT_QTY_ESTIMATED);
        final double actualQty = estimatePart.getDouble("wrpt.qty_actual");
        final double availableQty = this.part.getDouble(PT_QTY_ON_HAND);
        final double reservedQty = this.part.getDouble(PT_QTY_ON_RESERVE);
        final double difference = actualQty - estimateQty;

        // kb3043739: when closing a Not reserved part estimation, just take its actual quantity
        // used as the difference between estimation and actualy used.
        if (NOT_IN_STOCK.equalsIgnoreCase(status) || NOT_RESERVED.equalsIgnoreCase(status)) {

            if (actualQty > 0) {
                this.updateStatusForQuantityDecrease(-actualQty);
            }

        } else {
            if (difference > 0) {

                if (difference <= availableQty) {

                    this.part.setValue(PT_QTY_ON_RESERVE, reservedQty - estimateQty);
                    this.partDS.updateRecord(this.part);
                    this.updateStatusForQuantityDecrease(-difference);

                } else if (difference > availableQty) {

                    this.unReserveAllPartEstimations();
                    this.updateStatusForQuantityDecrease(-difference);
                }

            } else if (difference < 0) {

                this.part.setValue(PT_QTY_ON_RESERVE, reservedQty - estimateQty);
                this.partDS.updateRecord(this.part);
                this.updateStatusForQuantityIncrease(-difference);

            } else {
                // kb#3044675: also update part's available quantity when actual used is equal to
                // estimated
                this.part.setValue(PT_QTY_ON_RESERVE, reservedQty - estimateQty);
                this.partDS.updateRecord(this.part);
            }
        }
    }

    /**
     *
     * Update reserved estimated parts to be 'In Stock Not Reserved', recalculate reserved quantity
     * and available quantity.
     *
     */
    private void unReserveAllPartEstimations() {

        // Query 'Reserved' estimated parts
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();

        resDef.addClause(WRPT_TABLE, PART_ID, this.partId, Operation.EQUALS);
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

        this.part.setValue(PT_QTY_ON_RESERVE, 0.0);
        this.part.setValue(PT_QTY_ON_HAND, sumReserved + this.part.getDouble(PT_QTY_ON_HAND));
        this.partDS.updateRecord(this.part);
    }

    /**
     *
     * Calculate part's reserved quantity after all part estimations update.
     *
     */
    private void calculateReservedQuantityOfPart() {

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
    }

    /**
     *
     * Re-set status of part estimations as well as part's quantity values since directly setting of
     * part's phsical count.
     *
     */
    public void updateWRPTStatusByPhsicalCount() {

        final double reservedQty = this.part.getDouble(PT_QTY_ON_RESERVE);
        final double phsicalQty = this.part.getDouble("pt.qty_physical_count");
        final double availableQty = this.part.getDouble(PT_QTY_ON_HAND);

        if (phsicalQty < reservedQty) {

            this.unReserveAllPartEstimations();

            this.updateStatusForQuantityDecrease(phsicalQty - reservedQty - availableQty);
            // kb#3043789: also need to process 'Not In Stock' part estimations even after quantity
            // decrease.
            this.updateStatusForQuantityIncrease(0);

        } else if (phsicalQty < reservedQty + availableQty) {

            this.updateStatusForQuantityDecrease(phsicalQty - reservedQty - availableQty);

        } else if (phsicalQty > reservedQty + availableQty) {

            this.updateStatusForQuantityIncrease(phsicalQty - reservedQty - availableQty);
        }
    }

    /**
     *
     * Re-set status of wrpt when reject a work request.
     *
     * @param estimatePart DataRecord wrpt record.
     */
    public void updateStatusForRequestReject(final DataRecord estimatePart) {

        this.updateStatusForQuantityIncrease(0);

    }
}
