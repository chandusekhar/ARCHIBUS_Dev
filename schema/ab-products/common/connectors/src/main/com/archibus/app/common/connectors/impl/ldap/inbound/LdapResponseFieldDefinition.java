package com.archibus.app.common.connectors.impl.ldap.inbound;

import javax.naming.directory.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.AbstractArchibusResponseFieldDefinition;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * A mapping between an ARCHIBUS database column and and a field in an LDAP search result.
 * 
 * @author cole
 * 
 */
public class LdapResponseFieldDefinition extends
        AbstractArchibusResponseFieldDefinition<SearchResult> {
    /**
     * The name of the field in the LDAP search results' attributes.
     */
    private final String fieldKey;
    
    /**
     * Create a method for extracting field data from a source that provides a map of field values
     * based on afm_conn_flds and afm_flds records.
     * 
     * @param connectorField the field associated with the afm_connector record that describes this
     *            field.
     * @param fieldDefLoader a means to retrieve the afm_flds data about this field.
     * @throws ConfigurationException if a connector rule associated with this field cannot be
     *             instantiated.
     */
    public LdapResponseFieldDefinition(final ConnectorFieldConfig connectorField,
            final DataSourceFieldDefLoader fieldDefLoader) throws ConfigurationException {
        super(connectorField, fieldDefLoader);
        this.fieldKey = connectorField.getForeignFieldPath();
    }
    
    /**
     * @param searchResult the equivalent of a record from LDAP.
     * @return the value of an attribute in teh searchResult coresponding to the foreign field path
     *         in the field mapping.
     */
    public Object extractValue(final SearchResult searchResult) {
        Object value = null;
        final Attributes attributes = searchResult.getAttributes();
        final Attribute attribute = attributes.get(this.fieldKey);
        if (attribute != null) {
            value = attribute.toString().substring(this.fieldKey.length() + 1).trim();
        }
        return value;
    }
}
