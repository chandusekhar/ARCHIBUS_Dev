package com.archibus.app.sysadmin.updatewizard.schema.compare;

import java.util.*;

/**
 * Defines field properties.
 * 
 * @author Catalin Purice
 * 
 */
public class FieldDefinition {
    
    /**
     * Foreign Key changed?.
     */
    protected boolean fkChanged;
    
    /**
     * Is new field.
     */
    protected boolean isNewField;
    
    /**
     * Primary Key Changed?.
     */
    protected boolean pkChanged;
    
    /**
     * Is Changed.
     */
    private boolean isFieldChanged;
    
    /**
     * New value.
     */
    private Object newValue;
    
    /**
     * Old value.
     */
    private Object oldValue;
    
    /**
     * Field properties.
     */
    private final List<FieldDefinition> properties = new ArrayList<FieldDefinition>();
    
    /**
     * Property type.
     */
    private PropertyType type;
    
    /**
     * Constructor.
     */
    public FieldDefinition() {
        initializeProperties();
    }
    
    /**
     * Constructor.
     * 
     * @param type type
     * @param newVal new value
     * @param oldVal old value
     */
    public FieldDefinition(final PropertyType type, final Object newVal, final Object oldVal) {
        this.type = type;
        this.newValue = newVal;
        this.oldValue = oldVal;
        this.isFieldChanged = false;
    }
    
    /**
     * 
     * @param key {@link PropertyType}
     * @return {@link FieldProp}
     */
    public FieldDefinition get(final PropertyType key) {
        final List<FieldDefinition> props = getProperties();
        FieldDefinition fDef = null;
        for (final FieldDefinition p : props) {
            if (key.equals(p.getType())) {
                fDef = p;
            }
        }
        return fDef;
    }
    
    /**
     * @return the newValue
     */
    public Object getNewValue() {
        return this.newValue;
    }
    
    /**
     * @return the oldValue
     */
    public Object getOldValue() {
        return this.oldValue;
    }
    
    /**
     * @return the properties
     */
    public List<FieldDefinition> getProperties() {
        return this.properties;
    }
    
    /**
     * @return the type
     */
    public PropertyType getType() {
        return this.type;
    }
    
    /**
     * @return the isChanged
     */
    public boolean isChanged() {
        return this.isFieldChanged;
    }
    
    /**
     * @return the fkChanged
     */
    public boolean isFkChanged() {
        return this.fkChanged;
    }
    
    /**
     * @return the isNew
     */
    public boolean isNew() {
        return this.isNewField;
    }
    
    /**
     * @return the pkChanged
     */
    public boolean isPkChanged() {
        return this.pkChanged;
    }
    
    /**
         */
    public void setChanged() {
        final String newVal = this.newValue.toString();
        final String oldVal = this.oldValue.toString();
        this.isFieldChanged = newVal.equalsIgnoreCase(oldVal) ? false : true;
    }
    
    /**
     * @param newValue the newValue to set
     */
    public void setNewValue(final Object newValue) {
        this.newValue = newValue;
    }
    
    /**
     * @param oldValue the oldValue to set
     */
    public void setOldValue(final Object oldValue) {
        this.oldValue = oldValue;
    }
    
    /**
     * 
     */
    protected void setFieldChanged() {
        final Iterator<FieldDefinition> itr = getProperties().iterator();
        while (itr.hasNext()) {
            final FieldDefinition prop = itr.next();
            if (prop.isChanged()) {
                this.isFieldChanged = true;
                return;
            }
        }
        this.isFieldChanged = false;
    }
    
    /**
     * 
     * @param key key
     * @param newVal new value
     * @param oldVal old value
     * @param sqlType SQL type
     */
    
    protected void setProperty(final PropertyType key, final Object newVal, final Object oldVal,
            final int sqlType) {
        Object myNewValue = newVal;
        Object myOldValue = oldVal;
        
        if (key == PropertyType.DEFAULT) {
            myNewValue = CompareFieldDefUtilities.convertDefaultValue(myNewValue, sqlType);
            myOldValue = CompareFieldDefUtilities.convertDefaultValue(myOldValue, sqlType);
        } else if (key == PropertyType.AUTONUM) {
            myNewValue = String.valueOf(myNewValue).toUpperCase();
            myOldValue = String.valueOf(myOldValue).toUpperCase();
        } else if (key == PropertyType.TYPE) {
            final int newType = Integer.parseInt(myNewValue.toString());
            final int oldType = Integer.parseInt(myOldValue.toString());
            
            if (CompareFieldDefUtilities.isSameGroupOfDataType(newType, oldType)) {
                myNewValue = myOldValue;
            }
        }
        get(key).setNewValue(myNewValue);
        get(key).setOldValue(myOldValue);
        get(key).setChanged();
    }
    
    /**
     * 
     * Initialize Properties.
     */
    private void initializeProperties() {
        this.properties.add(new FieldDefinition(PropertyType.TYPE, 0, 0));
        this.properties.add(new FieldDefinition(PropertyType.SIZE, 0, 0));
        this.properties.add(new FieldDefinition(PropertyType.DECIMALS, 0, 0));
        this.properties.add(new FieldDefinition(PropertyType.ALLOWNULL, 0, 0));
        this.properties.add(new FieldDefinition(PropertyType.DEFAULT, 0, 0));
        this.properties.add(new FieldDefinition(PropertyType.AUTONUM, 0, 0));
        this.properties.add(new FieldDefinition(PropertyType.PK_CHG, 0, 0));
        this.properties.add(new FieldDefinition(PropertyType.FK_CHG, 0, 0));
    }
}
