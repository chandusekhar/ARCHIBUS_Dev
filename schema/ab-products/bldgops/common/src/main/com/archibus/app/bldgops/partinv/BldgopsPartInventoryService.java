package com.archibus.app.bldgops.partinv;

import java.util.List;

import org.json.JSONArray;

import com.archibus.datasource.SqlUtils;
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
public class BldgopsPartInventoryService implements IBldgopsPartInventoryService {

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
    @Override
    public void updateWrptStatus(final String partId, final List<DataRecord> estimatedParts,
            final double quantity) {

        final BldgopsPartInventory partInv = new BldgopsPartInventory(partId);

        partInv.updateWRPTStatus(quantity);

    }

    /**
     * Adjusts the status of part estimations as part quantities increase or decrease. The system
     * will call this WFR any time there is a change to any part's Quantity Available
     * (pt.qty_on_hand) or part estimates become "unreserved".
     *
     * @param partId String part code.
     * @param partLocId String part storage location code.
     * @param quantity double adjusted part quantity.
     */
    @Override
    public void updateWrptStatusForMpsl(final String partId, final String partLocId,
            final double quantity) {

        final BldgopsPartInventoryMultiplePartStorageLocation partInv =
                new BldgopsPartInventoryMultiplePartStorageLocation(partId, partLocId);

        partInv.updateWrptStatusForMpsl(quantity);

    }

    /**
     * check schema changed.
     *
     * @return if necessary schema changes existed for Part Inventory Improvement.
     *
     */
    @Override
    public boolean isSchemaChanged() {

        return BldgopsPartInventoryUtility.isSchemaChanged();
    }

    /**
     * Create Supply Requisition. by Jia Guoqiang
     *
     * @param fromStoreLoc From storage location code
     * @param toStoreLoc To storage location code
     * @param supplyReqComments Supply Requisition Comments
     * @param itRecords List of part records
     */
    @Override
    public void createSupplyReq(final String fromStoreLoc, final String toStoreLoc,
            final String supplyReqComments, final JSONArray itRecords) {
        BldgopsPartInventorySupplyRequisition.createSupplyReq(fromStoreLoc, toStoreLoc,
            supplyReqComments, itRecords);
    }

    /**
     * Add parts to an existing supply requisition. by Jia Guoqiang
     *
     * @param supplyReqId Supply requisition code
     * @param itRecords JSON array of inventory transactions record
     */
    @Override
    public void addPartsToExistingSupplyReq(final String supplyReqId, final JSONArray itRecords) {
        BldgopsPartInventorySupplyRequisition.addPartsToExistingSupplyReq(supplyReqId, itRecords);
    }

    /**
     *
     * Add New part to default part storage location.
     *
     * @param partId Part code
     */
    @Override
    public void addNewPartToDefaultPartStoreLoc(final String partId) {
        BldgopsPartInventorySupplyRequisition.addNewPartToDefaultPartStoreLoc(partId);
    }

    /**
     * Update All Supply Requisition items when part storage location is change.
     *
     * @param supplyReqChangeRecords Supply Requisition Changed Record
     */
    @Override
    public void updateSupplyReqItemWhenPartStoreLocationChange(
            final JSONArray supplyReqChangeRecords) {
        BldgopsPartInventorySupplyRequisition
            .updateSupplyReqItemWhenPartStoreLocationChange(supplyReqChangeRecords);
    }

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
    @Override
    public void transferPartsBetweenStorageLocationBySupplyReq(final String supplyReqId,
            final String transId, final String fromStorageLocation, final String toStorageLocation,
            final String partCode, final Double transQty, final String status) {
        BldgopsPartInventorySupplyRequisition.transferPartsBetweenStorageLocationBySupplyReq(
            supplyReqId, transId, fromStorageLocation, toStorageLocation, partCode, transQty,
            status);
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
    @Override
    public void transferPartsBetweenStorageLocationByAdjust(final String fromStorageLocation,
            final String toStorageLocation, final String partCode, final Double transQty,
            final Double qtyReserved, final JSONArray wrptRecords) {
        BldgopsPartInventorySupplyRequisition.transferPartsBetweenStorageLocationByAdjust(
            fromStorageLocation, toStorageLocation, partCode, transQty, qtyReserved, wrptRecords);
    }

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
    @Override
    public void setPurchaseOrderTobeReceivedOrError(final String poId, final String poLineId,
            final String partCode, final String receivedLocation, final Double transQty,
            final Double costUnit, final String status) {
        BldgopsPartInventoryPurchaseOrder.setPurchaseOrderTobeReceivedOrError(poId, poLineId,
            partCode, receivedLocation, transQty, costUnit, status);
    }

    /**
     * Update purchase order info by purchase order status.
     *
     * @param poId Purchase order ID.
     * @param beforeStatus Purchase order status before change.
     * @param afterStatus Purchase order status after change.
     */
    @Override
    public void updatePurchaseOrderInfoByPoStatus(final int poId, final String beforeStatus,
            final String afterStatus) {
        BldgopsPartInventoryPurchaseOrder.updatePurchaseOrderInfoByPoStatus(poId, beforeStatus,
            afterStatus);
    }

    /**
     * Create new purchase order records.
     *
     * @param poRecord Purchase Order parameter record
     * @param poLineRecords Purchase Order Line Item Records
     *
     */
    @Override
    public void createNewPurchaseOrder(final JSONArray poRecord, final JSONArray poLineRecords) {
        BldgopsPartInventoryPurchaseOrder.createNewPurchaseOrder(poRecord, poLineRecords);
    }

    /**
     * Add record to an existing purchase order.
     *
     * @param poId Purchase Order code
     * @param vnId Vendor code.
     * @param poLineRecords Purchase Order Line Item Records
     */
    @Override
    public void addToExistingPurchaseOrder(final int poId, final String vnId,
            final JSONArray poLineRecords) {
        BldgopsPartInventoryPurchaseOrder.addToExistingPurchaseOrder(poId, vnId, poLineRecords);
    }

    /**
     * Remove aisle code shelf code Cabinet code and bin code.
     *
     * @param ptLocId part storage location
     */
    @Override
    public void removePartLocations(final String ptLocId) {
        SqlUtils.executeUpdate("pt_store_loc_pt",
            "update pt_store_loc_pt set bl_id = null, fl_id = null, rm_id = null, aisle_id = null, cabinet_id = null, shelf_id = null, bin_id = null where pt_store_loc_id='"
                    + SqlUtils.makeLiteralOrBlank(ptLocId) + "'");
    }

    /**
     * Check is storage location can be delete.
     *
     * @param storeLocId Storage location code.
     * @return if can be deleted ,return true,else, return false.
     */
    @Override
    public boolean checkIsStoreLocCanBeDeleted(final String storeLocId) {
        return BldgopsPartInventoryUtility.checkIsStoreLocCanBeDeleted(storeLocId);
    }
}
