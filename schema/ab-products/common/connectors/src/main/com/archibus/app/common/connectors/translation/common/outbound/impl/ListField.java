package com.archibus.app.common.connectors.translation.common.outbound.impl;

/**
 * A field to be written to format where values are identified by the order they appear in.
 *
 * @author cole
 */
public class ListField {
    /**
     * The name of the field.
     */
    private final String fieldName;

    /**
     * The zero based position of the field.
     */
    private final int position;

    /**
     * @param fieldName the name of the field.
     * @param position the zero based position of the field.
     */
    public ListField(final String fieldName, final int position) {
        this.fieldName = fieldName;
        this.position = position;
    }

    /**
     * @return the name of the field.
     */
    public String getFieldName() {
        return this.fieldName;
    }

    /**
     * @return the zero based position of the field.
     */
    public int getPosition() {
        return this.position;
    }
}
