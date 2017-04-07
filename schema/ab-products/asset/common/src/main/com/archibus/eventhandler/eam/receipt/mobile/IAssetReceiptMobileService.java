package com.archibus.eventhandler.eam.receipt.mobile;

/**
 * API of the Asset Management Workflow Rule Service for mobile asset receipt application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbAssetManagement-AssetReceiptMobileService'.
 * <p>
 * Provides methods for searching assets and synchronization between sync table (eq_sync) and
 * inventory table (eq).
 * <p>
 * Invoked by mobile client.
 *
 * @author Ana Paduraru
 * @since 22.1
 */
public interface IAssetReceiptMobileService {
    /**
     * Copies records from eq_sync table into eq one by one. Removes from eq_sync the records that
     * have a new eq_id and can be copied into eq.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     * @return false if not all eq_sync records were copied into eq.
     */
    boolean completeReceiptEq(final String userName);

    /**
     * Populate eqstd table with new values from eqstd_sync table.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     */
    void saveNewEquipmentStandards(final String userName);

    /**
     * Populate eqstd_sync table with values from eqstd table.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     */
    void copyEqStdToSyncTable(final String userName);
}
