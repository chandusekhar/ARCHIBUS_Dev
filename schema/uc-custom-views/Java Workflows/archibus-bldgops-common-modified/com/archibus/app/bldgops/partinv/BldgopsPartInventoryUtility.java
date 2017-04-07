package com.archibus.app.bldgops.partinv;

import static com.archibus.app.bldgops.partinv.BldgopsPartInventoryConstant.*;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Bldgops Part Inventory Utility.
 *
 * @author Guo Jiangtao
 */
public final class BldgopsPartInventoryUtility {

    /**
     * Indicates the name of view that contains DataSources.
     *
     */
    private static final String VIEW_NAME = "ab-bldgops-part-inv.axvw";

    /**
     * Indicates the index of 'NR' in status's enum list.
     *
     */
    private static final int INDEX_OF_NR_IN_ENUM = 4;

    /**
     * Indicates the length of changed enum list for field status that contains 'NR'value.
     *
     */
    private static final int LENGTH_IF_ENUMLIST = 10;

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private BldgopsPartInventoryUtility() {

    }

    /**
     * Query estimated part inventory list by part id.
     *
     * @param estimatedPartDS datasource
     * @param partId part code
     * @return estimated part list
     */
    static List<DataRecord> getEstimatedPartsById(final DataSource estimatedPartDS,
            final String partId) {

        return estimatedPartDS.getRecords(" part_id='" + partId + "' ");
    }

    /**
     *
     * Re-set status of wrpt that just changed the estimated quantity and is not 'reserved'.
     *
     * @param estimatePart DataRecord wrpt record.
     * @param status String wrpt status.
     * @param difference double change of estimated part quantity.
     * @param newEstimateQty double new estimated part quantity.
     * @param availableQuantity double available quantity of part.
     */
    static void updateStatusOfNotReservedWrpt(final DataRecord estimatePart, final String status,
            final double difference, final double newEstimateQty, final double availableQuantity) {

        if (NOT_IN_STOCK.equalsIgnoreCase(status)) {

            if (difference < 0 && newEstimateQty <= availableQuantity) {

                estimatePart.setValue(WRPT_STATUS, NOT_RESERVED);

            }

        } else if (NOT_RESERVED.equalsIgnoreCase(status) && difference > 0
                && newEstimateQty > availableQuantity) {

            estimatePart.setValue(WRPT_STATUS, NOT_IN_STOCK);
        }
    }

    /**
     * check schema changed.
     *
     * @return if necessary schema changes existed for Part Inventory Improvement.
     *
     */
    public static boolean isSchemaChanged() {

        boolean schemaChanged = true;

        // detect if wrpt.status contains enum option value 'NR'.
        final DataSource dsSchemaField =
                DataSourceFactory.loadDataSourceFromFile(VIEW_NAME, "schemaFieldDS");
        final String wrptStatusEnumList = dsSchemaField
            .getRecord("table_name='wrpt' and field_name='status'").getString("afm_flds.enum_list");
        final String[] valueArray = wrptStatusEnumList.split(";");
        if (valueArray.length != LENGTH_IF_ENUMLIST
                || !"NR".equalsIgnoreCase(valueArray[INDEX_OF_NR_IN_ENUM])) {
            schemaChanged = false;
        }

        final DataSource dsWorkflowRule =
                DataSourceFactory.loadDataSourceFromFile(VIEW_NAME, "workflowRuleDS");
        final DataRecord workflowRule = dsWorkflowRule.getRecord(
            "activity_id='AbBldgOpsBackgroundData' and rule_id='BldgopsPartInventoryService'");
        if (workflowRule == null || workflowRule.getInt("afm_wf_rules.is_active") != 1) {
            schemaChanged = false;
        }

        return schemaChanged;

    }

    /**
     * Check is storage location can be delete.
     *
     * @param storeLocId Storage location code.
     * @return if can be deleted ,return true,else, return false
     */
    public static boolean checkIsStoreLocCanBeDeleted(final String storeLocId) {
        boolean canDelete = true;
        final String where =
                "NOT EXISTS( select 1 from pt_store_loc_pt where qty_on_hand>0 and pt_store_loc_pt.pt_store_loc_id=pt_store_loc.pt_store_loc_id) and "
                        + "NOT EXISTS(select 1 from pt_store_loc_pt where qty_on_reserve!=0 and pt_store_loc_pt.pt_store_loc_id=pt_store_loc.pt_store_loc_id)"
                        + "and NOT EXISTS(select 1 from wrpt where wrpt.pt_store_loc_id=pt_store_loc.pt_store_loc_id)"
                        + "and NOT EXISTS (select 1 from po where po.receiving_location = pt_store_loc.pt_store_loc_id and po.status NOT IN ('Received', 'Partially Received', 'Error'))"
                        + "and NOT EXISTS (select 1 from it where it.req_item_status NOT IN ('Received', 'Error') AND (it.pt_store_loc_to = pt_store_loc.pt_store_loc_id OR it.pt_store_loc_from = pt_store_loc.pt_store_loc_id))"
                        + "and NOT EXISTS (select 1 from pms where pms.pt_store_loc_id = pt_store_loc.pt_store_loc_id)"
                        + "and " + "pt_store_loc_id='" + storeLocId + "'";

        final DataSource ptStoreLocDs =
                DataSourceFactory.createDataSourceForFields(PT_STORE_LOC_TABLE,
                    new String[] { PT_STORE_LOC_ID, PART_ID, QTY_MIN_HAND, COST_UNIT_STD });

        final List<DataRecord> storeLocRecords = ptStoreLocDs.getRecords(where);

        if (storeLocRecords.isEmpty()) {
            canDelete = false;
        }

        return canDelete;
    }

}
