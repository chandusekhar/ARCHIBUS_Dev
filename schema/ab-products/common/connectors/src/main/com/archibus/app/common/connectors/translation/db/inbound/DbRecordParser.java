package com.archibus.app.common.connectors.translation.db.inbound;

import java.sql.SQLException;
import java.util.*;

import javax.sql.RowSet;

import com.archibus.app.common.connectors.exception.StepException;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.common.inbound.*;

/**
 * A parser for an DB Connection that is expected to produce an Map.
 *
 * @author Catalin Purice
 *
 */
public class DbRecordParser implements IRecordParser<RowSet, Map<String, Object>> {
    
    /**
     * Names of fields to extract from the result.
     */
    private final List<String> fieldNames;
    
    /**
     * @param fieldNames names of fields to extract from the result.
     */
    public DbRecordParser(final List<String> fieldNames) {
        this.fieldNames = Collections.unmodifiableList(fieldNames);
    }
    
    /**
     * @param rowSet the row set from which to extract records.
     * @param handler record handler for processing records.
     * @throws StepException if a SQL error occurs when parsing records.
     */
    @Override
    public void parse(final RowSet rowSet, final IRecordHandler<Map<String, Object>, ?> handler)
            throws StepException {
        AdaptorException adaptorException = null;
        try {
            while (rowSet.next()) {
                final Map<String, Object> record = new HashMap<String, Object>();
                for (final String fieldName : this.fieldNames) {
                    record.put(fieldName, rowSet.getObject(fieldName));
                }
                handler.handleRecord(record);
            }
        } catch (final SQLException e) {
            throw new AdaptorException("Error reading fields from result set.", e);
        } finally {
            try {
                rowSet.close();
            } catch (final SQLException e) {
                if (adaptorException == null) {
                    adaptorException = new AdaptorException("Unable to close result set.", e);
                }
            }
        }
        if (adaptorException != null) {
            throw adaptorException;
        }
    }
}
