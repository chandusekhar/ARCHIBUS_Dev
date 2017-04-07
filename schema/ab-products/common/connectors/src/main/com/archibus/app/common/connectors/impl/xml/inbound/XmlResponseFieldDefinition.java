package com.archibus.app.common.connectors.impl.xml.inbound;

import org.dom4j.Node;
import org.dom4j.tree.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.AbstractArchibusResponseFieldDefinition;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * A method for extracting field data from an XML structure.
 * 
 * @author cole
 * 
 */
public class XmlResponseFieldDefinition extends AbstractArchibusResponseFieldDefinition<Node> {
    
    /**
     * The xPath for extracting a field from a record Node.
     */
    private final String xPath;
    
    /**
     * Create a method for extracting field data from an XML Node that provides a field value based
     * on afm_conn_flds and afm_flds records.
     * 
     * @param connectorField the field associated with the afm_connector record that describes this
     *            field.
     * @param fieldDefLoader a means to retrieve the afm_flds data about this field.
     * @throws ConfigurationException if a connector rule associated with this field cannot be
     *             instantiated.
     */
    public XmlResponseFieldDefinition(final ConnectorFieldConfig connectorField,
            final DataSourceFieldDefLoader fieldDefLoader) throws ConfigurationException {
        super(connectorField, fieldDefLoader);
        this.xPath = connectorField.getForeignFieldPath();
    }
    
    /**
     * Extract this field's value from the record Node read from the XML file.
     * 
     * @param recordNode a Node from the source XML file.
     * @return The value of the field from the record, extracted using the xPath provided by the
     *         afm_conn_flds table.
     */
    public Object extractValue(final Node recordNode) {
        Object value = null;
        if (this.xPath != null) {
            value = recordNode.selectObject(this.xPath);
            if (value instanceof DefaultAttribute) {
                value = ((DefaultAttribute) value).getValue();
            } else if (value instanceof DefaultElement) {
                value = ((DefaultElement) value).getText();
            }
        }
        return value;
    }
}
