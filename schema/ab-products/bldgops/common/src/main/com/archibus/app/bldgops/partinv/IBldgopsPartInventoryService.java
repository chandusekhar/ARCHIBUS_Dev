package com.archibus.app.bldgops.partinv;

import java.util.List;

import org.json.JSONArray;

import com.archibus.datasource.data.DataRecord;

/**
 * Bldgops Part Inventory Service holds Workflow Rule methods.
 *
 * <p>
 * History:
 * <li>21.2: Add for Bali3 Bldgops Part Inventory Feature.
 *
 * @author Zhang Yi
 *
 *         <p>
 *         Suppress PMD.TooManyMethods warning.
 *         <p>
 *         Justification: This class contains public methods called from axvw.
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
public interface IBldgopsPartInventoryService {

    /**
     *
     * Adjusts the status of part estimations as part quantities increase or decrease. The system
     * will call this WFR any time there is a change to any part's Quantity Available
     * (pt.qty_on_hand) or part estimates become "unreserved".
     *
     * @param partId String part code.
     * @param estimatedParts List estimated part records.
     * @param quantity int adjusted part quantity.
     */
    void updateWrptStatus(final String partId, final List<DataRecord> estimatedParts,
            final double quantity);

    /**
     *
     * Adjusts the status of part estimations as part quantities increase or decrease. The system
     * will call this WFR any time there is a change to any part's Quantity Available
     * (pt.qty_on_hand) or part estimates become "unreserved".
     *
     * @param partId String part code.
     * @param partLocId String part storage location code.
     * @param quantity double adjusted part quantity.
     */
    void updateWrptStatusForMpsl(final String partId, final String partLocId,
            final double quantity);

    /**
     *
     * @return if necessary schema changes existed for Part Inventory Improvement.
     *
     */
    boolean isSchemaChanged();

    /**
     * Create Supply Requisition. by Jia Guoqiang
     *
     * @param fromStoreLoc From storage location code
     * @param toStoreLoc To storage location code
     * @param supplyReqComments Supply Requisition Comments
     * @param itRecords List of part records
     */
    void createSupplyReq(final String fromStoreLoc, final String toStoreLoc,
            final String supplyReqComments, final JSONArray itRecords);

    /**
     * Add parts to an existing supply requisition. by Jia Guoqiang
     *
     * @param supplyReqId Supply requisition code
     * @param itRecords JSON array of inventory transactions record
     */
    void addPartsToExistingSupplyReq(final String supplyReqId, final JSONArray itRecords);

    /**
     *
     * Add New part to default part storage location.
     *
     * @param partId Part code
     */
    void addNewPartToDefaultPartStoreLoc(final String partId);

    /**
     * Update All Supply Requisition items when part storage location is change.
     *
     * @param supplyReqChangeRecords Supply Requisition Changed Record
     */
    void updateSupplyReqItemWhenPartStoreLocationChange(final JSONArray supplyReqChangeRecords);

    /**
     *
     * Transfer parts between storage location By Received action of supply requisitions.
     *
     * @param supplyReqId Supply requisition id
     * @param transId Transaction Id
     * @param fromStorageLocation From Storage Location
     * @param toStorageLocation To Storage Location
     * @param partCode Part code
     * @param transQty Transaction Quantity
     * @param status Status
     */
    void transferPartsBetweenStorageLocationBySupplyReq(final String supplyReqId,
            final String transId, final String fromStorageLocation, final String toStorageLocation,
            final String partCode, final Double transQty, final String status);

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
    void transferPartsBetweenStorageLocationByAdjust(final String fromStorageLocation,
            final String toStorageLocation, final String partCode, final Double transQty,
            final Double qtyReserved, final JSONArray wrptRecords);

    /**
     *
     * Change Purchase Orders to be Received or Error.
     *
     * @param poId Purchase Order id
     * @param poLineId Purchase Order Item Id
     * @param partCode Part code
     * @param receivedLocation Receiving Location
     * @param transQty Transaction Quantity
     * @param costUnit Cost unit price
     * @param status Status 'Received' or 'Error'
     */
    void setPurchaseOrderTobeReceivedOrError(final String poId, final String poLineId,
            final String partCode, final String receivedLocation, final Double transQty,
            final Double costUnit, final String status);

    /**
     * Update purchase order info by purchase order status.
     *
     * @param poId Purchase order ID.
     * @param beforeStatus Purchase order status before change.
     * @param afterStatus Purchase order status after change.
     */
    void updatePurchaseOrderInfoByPoStatus(final int poId, final String beforeStatus,
            final String afterStatus);

    /**
     * Create new purchase order records.
     *
     * @param poRecord Purchase Order parameter record
     * @param poLineRecords Purchase Order Line Item Records
     */
    void createNewPurchaseOrder(final JSONArray poRecord, final JSONArray poLineRecords);

    /**
     * Add record to an existing purchase order.
     *
     * @param poId Purchase Order code
     * @param vnId Vendor code.
     * @param poLineRecords Purchase Order Line Item Records
     */
    void addToExistingPurchaseOrder(final int poId, final String vnId,
            final JSONArray poLineRecords);

    /**
     * Remove aisle code shelf code Cabinet code and bin code.
     *
     * @param ptLocId part storage location
     */
    void removePartLocations(final String ptLocId);

    /**
     * Check is storage location can be delete.
     *
     * @param storeLocId Storage location code.
     * @return if can be deleted ,return true,else, return false
     */
    boolean checkIsStoreLocCanBeDeleted(final String storeLocId);
}
