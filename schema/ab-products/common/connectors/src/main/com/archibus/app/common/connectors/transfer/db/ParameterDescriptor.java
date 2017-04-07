package com.archibus.app.common.connectors.transfer.db;

import com.archibus.schema.DataType;

/**
 * Describes a database column and it's type.
 * 
 * @author cole
 * 
 */
public class ParameterDescriptor {
    /**
     * A database column name.
     */
    private final String fieldKey;
    
    /**
     * The type of the database column name.
     */
    private final DataType dataType;
    
    /**
     * @param fieldKey a database column name.
     * @param dataType the type of the database column name.
     */
    public ParameterDescriptor(final String fieldKey, final DataType dataType) {
        super();
        this.fieldKey = fieldKey;
        this.dataType = dataType;
    }
    
    /**
     * @return the database column name.
     */
    public String getFieldKey() {
        return this.fieldKey;
    }
    
    /**
     * @return the type of the database column name.
     */
    public DataType getDataType() {
        return this.dataType;
    }
}
