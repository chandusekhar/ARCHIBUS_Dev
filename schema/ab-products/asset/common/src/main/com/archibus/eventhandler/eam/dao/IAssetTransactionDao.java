package com.archibus.eventhandler.eam.dao;

import com.archibus.core.dao.IDao;
import com.archibus.core.event.data.RecordChangedEvent;

/**
 *
 * Provides methods to access asset transaction.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 * @param <AssetTransaction> type of object
 */
public interface IAssetTransactionDao<AssetTransaction> extends IDao<AssetTransaction> {
    
    /**
     * Log asset transaction from record change event.
     *
     * @param recordChangedEvent record change event
     */
    void logAssetTransactions(final RecordChangedEvent recordChangedEvent);
    
}
