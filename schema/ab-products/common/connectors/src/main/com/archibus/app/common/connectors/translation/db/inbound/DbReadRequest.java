package com.archibus.app.common.connectors.translation.db.inbound;

import java.util.*;

/**
 * A request to read data from a database, this represents a SQL select statement.
 * 
 * @author cole
 * 
 */
public class DbReadRequest {
    /**
     * A parameterized query for retrieving data.
     */
    private final String query;
    
    /**
     * The order in which parameters appear in the query, by key.
     */
    private final List<String> parameterOrder;
    
    /**
     * A map of parameters.
     */
    private final Map<String, Object> parameters;
    
    /**
     * @param query a parameterized query for retrieving data.
     * @param parameterOrder the order in which parameters appear in the query, by key.
     * @param parameters a map of parameters.
     */
    public DbReadRequest(final String query, final List<String> parameterOrder,
            final Map<String, Object> parameters) {
        this.query = query;
        this.parameterOrder = parameterOrder;
        this.parameters = parameters;
    }
    
    /**
     * @return a parameterized query for retrieving data.
     */
    public String getQuery() {
        return this.query;
    }
    
    /**
     * @return the order in which parameters appear in the query, by key.
     */
    public List<String> getParameterOrder() {
        return this.parameterOrder;
    }
    
    /**
     * @return parameters a map of parameters.
     */
    public Map<String, Object> getParameters() {
        return this.parameters;
    }
}
