package com.archibus.eventhandler.eam.datachangeevent;

import java.util.List;

import org.springframework.context.ApplicationEvent;

import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.eventhandler.eam.dao.IAssetTransactionDao;
import com.archibus.eventhandler.eam.domain.AssetTransaction;

/**
 * Enterprise Asset Management - Data change event listener. Is configured to be notified by the
 * core when there is a DataEvent (only RecordChangedEvent).
 *
 * Log all changes for specified fields into asset_trans table. List of fields defined in
 * "WEB-INF\config\context\applications\applications-child-context.xml" bean
 * "AbAssetEAM-DataChangeEventListener"
 *
 * Configured as a WFR of DataEvent type. The WFR container loads
 * "AbAssetEAM-DataChangeEventListener" prototype Spring bean, defined in
 * WEB-INF/config/context/applications/applications-child-context.xml.
 * <p>
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class DataChangeEventListener implements IDataEventListener {
    
    /**
     * List with asset table names where listener is enabled. Set by spring configuration file.
     */
    private List<String> transactionTables;
    
    /**
     * Custom data source used to load object from database. Set by spring configuration file.
     */
    private IAssetTransactionDao<AssetTransaction> assetTransactionDao;

    @Override
    public void onApplicationEvent(final ApplicationEvent event) {
        if (event instanceof RecordChangedEvent) {
            final RecordChangedEvent recordChangedEvent = (RecordChangedEvent) event;
            onRecordChangedEvent(recordChangedEvent);
        }
    }
    
    /**
     * Getter for the assetTransactionDao property.
     *
     * @see assetTransactionDao
     * @return the assetTransactionDao property.
     */
    public IAssetTransactionDao<AssetTransaction> getAssetTransactionDao() {
        return this.assetTransactionDao;
    }

    /**
     * Setter for the assetTransactionDao property.
     *
     * @see assetTransactionDao
     * @param assetTransactionDao the assetTransactionDao to set
     */
    
    public void setAssetTransactionDao(
            final IAssetTransactionDao<AssetTransaction> assetTransactionDao) {
        this.assetTransactionDao = assetTransactionDao;
    }

    /**
     * Getter for the transactionTables property.
     *
     * @see transactionTables
     * @return the transactionTables property.
     */
    public List<String> getTransactionTables() {
        return this.transactionTables;
    }

    /**
     * Setter for the transactionTables property.
     *
     * @see transactionTables
     * @param transactionTables the transactionTables to set
     */
    
    public void setTransactionTables(final List<String> transactionTables) {
        this.transactionTables = transactionTables;
    }

    /**
     * Handles ApplicationEvent "RecordChanged".
     *
     * @param recordChangedEvent record changed event
     */
    private void onRecordChangedEvent(final RecordChangedEvent recordChangedEvent) {
        final boolean isLogEnabled =
                this.transactionTables.contains(recordChangedEvent.getTableName());
        final boolean isBeforeInsertOrUpdate =
                BeforeOrAfter.BEFORE.equals(recordChangedEvent.getBeforeOrAfter())
                        && (ChangeType.INSERT.equals(recordChangedEvent.getChangeType()) || ChangeType.UPDATE
                            .equals(recordChangedEvent.getChangeType()));
        final boolean isBeforeDelete =
                BeforeOrAfter.BEFORE.equals(recordChangedEvent.getBeforeOrAfter())
                        && ChangeType.DELETE.equals(recordChangedEvent.getChangeType());
        if (isLogEnabled && (isBeforeInsertOrUpdate || isBeforeDelete)) {
            this.assetTransactionDao.logAssetTransactions(recordChangedEvent);
        }
    }

}
