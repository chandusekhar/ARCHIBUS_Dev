package com.archibus.app.common.space.dao.datasource;

import com.archibus.app.common.space.domain.ArchivedRoomTransaction;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.ObjectDataSourceImpl;

/**
 * Implementation of DataSource for ArchivedRoomTransaction.
 * <p>
 * Uses FIELDS_TO_PROPERTIES from RoomTransactionDataSource.
 * 
 * @see ObjectDataSourceImpl.
 * 
 * @author Valery Tydykov
 * 
 */
public class ArchivedRoomTransactionDataSource extends
        ObjectDataSourceImpl<ArchivedRoomTransaction> implements IDao<ArchivedRoomTransaction> {
    
    /**
     * Constructs ArchivedRoomTransactionDataSource, mapped to <code>hrmpct</code> table, using
     * <code>archivedRoomTransaction</code> bean.
     */
    protected ArchivedRoomTransactionDataSource() {
        super("archivedRoomTransaction", "hrmpct");
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return RoomTransactionDataSource.FIELDS_TO_PROPERTIES.clone();
    }
}
