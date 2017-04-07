package com.archibus.app.common.connectors.translation.common.outbound.impl;

import java.util.*;

import com.archibus.app.common.connectors.translation.common.outbound.*;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A RequestDef defines methods for creating a request to a foreign system.
 *
 * @param <RequestFieldDefType> the type of field definitions for this request definition.
 *
 * @author cole
 */
public class RequestDef<RequestFieldDefType extends IRequestFieldDefinition> implements IRequestDef {

    /**
     * Fields are properties on a transaction, and the foreign field definitions define how they are
     * interpreted. The order may be significant, and these fields should be extracted in the order
     * specified by the list.
     */
    private final List<? extends RequestFieldDefType> foreignFieldDefinitions;

    /**
     * Create a request transaction definition.
     *
     * @param foreignFieldDefinitions fields are properties on a transaction, and the foreign field
     *            definitions define how they are interpreted. The order may be significant, and
     *            these fields should be extracted in the order specified by the list.
     */
    public RequestDef(final List<? extends RequestFieldDefType> foreignFieldDefinitions) {
        this.foreignFieldDefinitions = Collections.unmodifiableList(foreignFieldDefinitions);
    }

    /**
     * Create a request to a foreign system using a request template and database parameters.
     *
     * @param requestTemplate the format of the request.
     * @param databaseParameters the content for the request, in database format.
     * @param <RequestType> the type of request to be created by the template.
     * @return a request for a foreign system based on this template and provided parameters.
     * @throws TranslationException if one or more of the fields cannot be converted in to a foreign
     *             value.
     */
    public <RequestType> RequestType createRequest(
            final IRequestTemplate<RequestType> requestTemplate,
            final Map<String, Object> databaseParameters) throws TranslationException {
        final Map<String, Object> foreignParameters = new HashMap<String, Object>();
        for (final RequestFieldDefType foreignFieldDefinition : this.foreignFieldDefinitions) {
            foreignParameters.put(foreignFieldDefinition.getFieldName(), foreignFieldDefinition
                .translateToForeign(this.getDatabaseValue(foreignFieldDefinition,
                    databaseParameters)));
        }
        return requestTemplate.generateRequest(foreignParameters);
    }

    /**
     * @param foreignFieldDefinition the mapping of database values to foreign values.
     * @param databaseParameters the database values.
     * @return the database value for this field.
     */
    protected Object getDatabaseValue(final RequestFieldDefType foreignFieldDefinition,
            final Map<String, Object> databaseParameters) {
        return databaseParameters.get(foreignFieldDefinition.getFieldName());
    }

    /**
     * @param request the request to be considered.
     * @return the reason the request should be skipped, or null otherwise.
     */
    public String shouldSkip(final Map<String, Object> request) {
        return null;
    }
}
