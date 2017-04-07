package com.archibus.app.sysadmin.updatewizard.schema.compare;

import java.util.*;

/**
 * Stores the messages of differences for a field.
 * 
 * @author Catalin Purice
 * 
 */
public class Messages {
    
    /**
     * Message template. <field name>. <different message> <new value> [<old value>]
     */
    private static final String MESSAGE_TEMPLATE = "%s. %s %s [%s]";
    
    /**
     * Field name.
     */
    private final String fieldName;
    
    /**
     * Properties of a field.
     */
    private final List<FieldDefinition> properties;
    
    /**
     * Constructor.
     * 
     * @param fieldName @see {@link Messages#fieldName}
     * @param properties @see {@link Messages#properties}
     */
    public Messages(final String fieldName, final List<FieldDefinition> properties) {
        super();
        this.fieldName = fieldName;
        this.properties = properties;
    }
    
    /**
     * Set changed Message to be inserted into afm_transfer_set table.
     * 
     * @return List<String>
     */
    public List<String> getMessages() {
        final List<String> messages = new ArrayList<String>();
        for (final FieldDefinition property : this.properties) {
            if (property.isChanged()) {
                switch (property.getType()) {
                    case TYPE:
                        messages.add(String.format(MESSAGE_TEMPLATE, this.fieldName,
                            "Data Type differs: ", property.getNewValue(), property.getOldValue()));
                        break;
                    case SIZE:
                        messages.add(String.format(MESSAGE_TEMPLATE, this.fieldName,
                            "Size differs: ", property.getNewValue(), property.getOldValue()));
                        break;
                    case DECIMALS:
                        messages.add(String.format(MESSAGE_TEMPLATE, this.fieldName,
                            "Decimals differs: ", property.getNewValue(), property.getOldValue()));
                        break;
                    case ALLOWNULL:
                        messages
                            .add(String.format(MESSAGE_TEMPLATE, this.fieldName,
                                "Allow Null differs: ", property.getNewValue(),
                                property.getOldValue()));
                        break;
                    case DEFAULT:
                        messages.add(String.format(MESSAGE_TEMPLATE, this.fieldName,
                            "Default differs: ", property.getNewValue(), property.getOldValue()));
                        break;
                    case AUTONUM:
                        messages.add(this.fieldName + ". " + "Autoincrement changed.");
                        break;
                    default:
                        break;
                }
            }
        }
        return messages;
    }
}
