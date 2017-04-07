package com.archibus.app.common.connectors.translation.db.inbound;

import java.util.*;

import com.archibus.app.common.connectors.translation.common.outbound.IRequestTemplate;

/**
 * 
 * A template for a request for queries matching specified criteria. Reads from foreign system.
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class DbReadRequestTemplate implements IRequestTemplate<DbReadRequest> {
    /**
     * A parameterized query for retrieving data from a database.
     */
    private final String query;
    
    /**
     * The order in which parameters occur in the query.
     */
    private final List<String> parameterOrder;
    
    /**
     * @param query a parameterized query for retrieving data from a database.
     * @param parameterOrder the order in which parameters occur in the query.
     */
    public DbReadRequestTemplate(final String query, final List<String> parameterOrder) {
        this.query = query;
        this.parameterOrder = Collections.unmodifiableList(parameterOrder);
    }
    
    /**
     * @param templateParameters parameters to be used in the query, which minimally includes fields
     *            in parameterOrder (see constructor).
     * @return a singleton list of template parameters.
     */
    public Iterable<? extends Map<String, Object>> generateRequestParameters(
            final Map<String, Object> templateParameters) {
        return Collections.singleton(templateParameters);
    }
    
    /**
     * @param requestParameters parameters to be used in the query, which minimally includes fields
     *            in parameterOrder (see constructor).
     * @return the equivalent of a SQL query using the parameterized query passed to the
     *         constructor.
     */
    public DbReadRequest generateRequest(final Map<String, Object> requestParameters) {
        return new DbReadRequest(this.query, this.parameterOrder, requestParameters);
    }
}
