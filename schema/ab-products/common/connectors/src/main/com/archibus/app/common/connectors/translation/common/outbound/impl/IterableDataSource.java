package com.archibus.app.common.connectors.translation.common.outbound.impl;

import java.util.*;
import java.util.Map.Entry;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;

/**
 * A DataSource that can be iterated over. Note that this will buffer data records, and the buffer
 * size is determined by maxRecords.
 * 
 * @author cole
 * 
 */
public class IterableDataSource extends DataSourceImpl implements Iterable<Map<String, Object>> {
    
    /**
     * An iterator for data records that returns a map of field name -> data values.
     * 
     * @author cole
     * 
     */
    private static class DataRecordIterator implements Iterator<Map<String, Object>> {
        
        /**
         * The data source being iterated over.
         */
        private final DataSource dataSource;
        
        /**
         * The records returned by the last call to getRecords().
         */
        private List<DataRecord> buffer;
        
        /**
         * Create an iterator for the given data source.
         * 
         * @param dataSource the data source to be iterated over for records.
         */
        public DataRecordIterator(final DataSource dataSource) {
            this.dataSource = dataSource;
            this.buffer = this.dataSource.getRecords();
        }
        
        /**
         * @return whether there are any more records to be returned from the data source.
         */
        public boolean hasNext() {
            return !this.buffer.isEmpty() || this.dataSource.hasMoreRecords();
        }
        
        /**
         * @return a field name -> data value map for the next record available from the data
         *         source.
         */
        public Map<String, Object> next() {
            if (this.buffer.isEmpty()) {
                if (this.dataSource.hasMoreRecords()) {
                    this.buffer = this.dataSource.getRecords();
                } else {
                    throw new NoSuchElementException("DataSource has no more records.");
                }
            }
            final Map<String, Object> fields = new HashMap<String, Object>();
            for (final Entry<String, DataValue> field : this.buffer.remove(0).getFieldsByName()
                .entrySet()) {
                final DataValue value = field.getValue();
                fields.put(field.getKey().split("\\.")[1], value == null ? null : value.getValue());
            }
            return fields;
        }
        
        /*
         * TODO delete the record from the database?
         */
        /**
         * @throw UnsupportedOperationException always.
         */
        public void remove() {
            throw new UnsupportedOperationException(
                "DataSource records may only ever be read once.");
        }
    }
    
    /**
     * Create an data source that can be iterated over as a copy of a regular data source.
     * 
     * @param anotherDataSource the data source to be copied.
     */
    public IterableDataSource(final DataSourceImpl anotherDataSource) {
        super(anotherDataSource);
    }
    
    /**
     * @return an iterator over a copy of this data source, in the order records are returned from
     *         the data source.
     */
    public Iterator<Map<String, Object>> iterator() {
        return new DataRecordIterator(this.createCopy());
    }
}
