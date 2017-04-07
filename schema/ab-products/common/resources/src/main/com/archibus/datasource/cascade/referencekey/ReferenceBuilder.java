package com.archibus.datasource.cascade.referencekey;

import com.archibus.datasource.SqlUtils;

/**
 * 
 * Provides factory methods for OracleReferenceKey, SqlServerReferenceKey and ArchibusReferenceKey.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.2
 * 
 */
public final class ReferenceBuilder {
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private ReferenceBuilder() {
        super();
    }
    
    /**
     * 
     * create New PhysicalReference(Oracle and SQL Server only).
     * 
     * @return ReferenceKey
     */
    public static ReferenceKey createNewPhysicalReference() {
        return SqlUtils.isOracle() ? new OracleReferenceKeyImpl() : new SqlServerReferenceKeyImpl();
    }
    
    /**
     * 
     * create New PhysicalReference(Oracle and SQL Server only).
     * 
     * @return ReferenceKey
     */
    public static ReferenceKey createNewArchibusReference() {
        return new ArchibusForeignKeyImpl();
    }
}
