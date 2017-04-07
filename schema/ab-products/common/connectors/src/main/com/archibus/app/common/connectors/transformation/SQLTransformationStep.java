package com.archibus.app.common.connectors.transformation;

import java.util.*;

import com.archibus.app.common.connectors.*;
import com.archibus.app.common.connectors.exception.DatabaseException;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;

/**
 * A method for mapping data from one database table to another as a phase in the data migration
 * process of a Connector.
 * 
 * @author cole
 * 
 */
public class SQLTransformationStep extends AbstractStep<List<DataRecord>> {
    /**
     * The SQL statement to execute to perform the migration. This should be an insert or update
     * statement.
     */
    private final String sql;
    
    /**
     * The name of the table being modified.
     */
    private final String table;
    
    /**
     * The names of the fields being modified.
     */
    private final String[] fields;
    
    /**
     * Create a transformation step moving data from one database table to another.
     * 
     * @param stepName a descriptive name for this step.
     * @param table the name of the table being modified.
     * @param fields the names of the fields being modified.
     * @param sql the SQL statement to execute to perform the migration. This should be an insert or
     *            update statement.
     */
    public SQLTransformationStep(final String stepName, final String table, final String[] fields,
            final String sql) {
        super(stepName);
        this.sql = sql;
        this.table = table;
        this.fields = new String[fields.length];
        System.arraycopy(fields, 0, this.fields, 0, fields.length);
    }
    
    /**
     * Move the data.
     * 
     * @param previousResults results of previous steps by step name.
     * @return data records return by SqlUtils.executeQuery.
     * @throws DatabaseException thrown when the execution of the SQL statement returns in error.
     */
    public List<DataRecord> execute(final Map<String, Object> previousResults) throws DatabaseException {
        /*
         * TODO accept query parameters from previous results.
         */
        return SqlUtils.executeQuery(this.table, this.fields, this.sql);
    }
}
