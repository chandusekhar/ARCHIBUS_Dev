package com.archibus.app.sysadmin.updatewizard.schema.compare;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.SqlTypes;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.schema.*;
import com.archibus.utility.*;

/**
 * Compares a ARCHIBUS and SQL field based on size/allow null/default/primary key/foreign key.
 * 
 * @author Catalin Purice
 * 
 */
public class CompareFieldDef extends FieldDefinition {
    
    /**
     * ARCHIBUS field definition.
     */
    private transient ArchibusFieldDefBase.Immutable arcFieldDef;
    
    /**
     * ARCHIBUS table definition.
     */
    private final TableDef.ThreadSafe archTableDef;
    
    /**
     * Changed messages.
     */
    private List<String> changeMessages;
    
    /**
     * field name.
     */
    private String fieldName;
    
    /**
     * SQL table definition.
     */
    private final DatabaseSchemaTableDef sqlTableDef;
    
    /**
     * SQL field definition.
     */
    private transient DatabaseSchemaFieldDef sysFieldDef;
    
    /**
     * Constructor.
     * 
     * @param sqlTableDef @see {@link CompareFieldDef#sqlTableDef}
     * @param archTableDef @see {@link CompareFieldDef#archTableDef}
     * @param fieldName @see {@link CompareFieldDef#fieldName}
     */
    public CompareFieldDef(final DatabaseSchemaTableDef sqlTableDef,
            final TableDef.ThreadSafe archTableDef, final String fieldName) {
        super();
        this.fieldName = fieldName;
        this.sqlTableDef = sqlTableDef;
        this.archTableDef = archTableDef;
        
        // when checking for PK and FK differences we do not have a specific field to work on
        if (!("PRIMARY KEY".equals(fieldName) || "FOREIGN KEY".equals(fieldName))) {
            this.arcFieldDef = archTableDef.getFieldDef(fieldName);
            if (sqlTableDef.isNewField(fieldName)) {
                this.isNewField = true;
            } else {
                this.sysFieldDef = sqlTableDef.getFieldDef(fieldName);
            }
        }
        
        this.changeMessages = new ArrayList<String>();
    }
    
    /**
     * Compare sysFldDef with archFldDef and initialize the boolean members.
     * 
     * @return current object
     */
    public CompareFieldDef compareFieldProperties() {
        
        // check auto-number and default
        checkAutoNumDefault();
        
        // check type and size for non document fields
        checkTypeAndSize();
        
        // check AllowNull
        checkAllowNull();
        
        // set field changes
        setFieldChanged();
        
        if (this.isChanged()) {
            this.changeMessages = new Messages(this.fieldName, getProperties()).getMessages();
        }
        return this;
    }
    
    /**
     * @return the arcFieldDef
     */
    public ArchibusFieldDefBase.Immutable getArcFieldDef() {
        return this.arcFieldDef;
    }
    
    /**
     * @return the archTableDef
     */
    public TableDef.ThreadSafe getArchTableDef() {
        return this.archTableDef;
    }
    
    /**
     * @return the changeMessages
     */
    public List<String> getChangeMessages() {
        return this.changeMessages;
    }
    
    /**
     * @return the sysFieldDef
     */
    public DatabaseSchemaFieldDef getSysFieldDef() {
        return this.sysFieldDef;
    }
    
    /**
     * @return the sysTabledef
     */
    public DatabaseSchemaTableDef getSysTabledef() {
        return this.sqlTableDef;
    }
    
    // CHECKSTYLE:OFF Justification: Suppress "Strict duplicate code" warning: several classes have
    // "fieldName" property.
    /**
     * Getter for the fieldName property.
     * 
     * @see fieldName
     * @return the fieldName property.
     */
    public String getFieldName() {
        return this.fieldName;
    }
    
    // CHECKSTYLE:ON
    
    /**
     * 
     * @return true if any of the foreign keys is changed.
     */
    public boolean hasForeignKeysChanged() {
        // if there is a difference in:
        // - the primary key,
        // - a field that used to be a fkey but is no longer an fkey
        // - a field that is now a fkey but did not used to be an fkey
        
        final ListWrapper.Immutable<ForeignKey.Immutable> archFkeys =
                SchemaUpdateWizardUtilities.getValidatedForeignKeys(this.archTableDef);
        final List<DatabaseSchemaForeignKeyDef> sqlFkeys = this.sqlTableDef.getFKeysDefn();
        
        // check number of fkeys
        if (archFkeys.size() == sqlFkeys.size()) {
            boolean fkFound = false;
            for (final ForeignKey.Immutable archFkey : archFkeys) {
                final String archibusFieldName = archFkey.getName();
                for (final DatabaseSchemaForeignKeyDef sqlFkey : sqlFkeys) {
                    final String sqlFieldName = sqlFkey.getName();
                    if (archibusFieldName.equalsIgnoreCase(sqlFieldName)) {
                        fkFound = true;
                        this.fieldName = archibusFieldName;
                        this.fkChanged = compareForeignKeyDefs(archFkey, sqlFkey);
                        if(this.fkChanged) {
                            return true;
                        }
                    }
                }
                if (!fkFound) {
                    this.fkChanged = true;
                    break;
                }
            }
        } else {
            this.fkChanged = true;
        }
        return this.fkChanged;
    }
    
    /**
     * Compares ARCHIBUS PK field with system PK field.
     * 
     * @return true if difference found or false otherwise
     */
    public boolean hasPrimaryKeysChanged() {
        final List<DatabaseSchemaPrimaryKeyDef> sysPKeysDef = getSysTabledef().getPKeysDefn();
        final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> archibusPKeysDef =
                this.archTableDef.getPrimaryKey().getFields();
        
        boolean tablePkChanged = false;

        if (archibusPKeysDef.size() == sysPKeysDef.size()) {
            // verify each PK field
            boolean pkFound = false;
            for (final DatabaseSchemaPrimaryKeyDef sysPKeyDef : sysPKeysDef) {
                final String sysFieldName = sysPKeyDef.getName();
                for (final ArchibusFieldDefBase.Immutable archibusPKeyDef : archibusPKeysDef) {
                    final String archibusFieldName = archibusPKeyDef.getName();
                    if (sysFieldName.equalsIgnoreCase(archibusFieldName)) {
                        pkFound = true;
                        this.fieldName = archibusFieldName;
                        this.arcFieldDef = archibusPKeyDef;
                        this.sysFieldDef = getSysTabledef().getFieldDef(sysFieldName);
                        compareFieldProperties();
                        this.pkChanged = isChanged();
                    }
                }
                if (this.pkChanged) {
                    tablePkChanged = true;
                }
                if (!pkFound) {
                    this.pkChanged = true;
                    tablePkChanged = true;
                    break;
                }
            }
        } else {
            this.pkChanged = true;
            tablePkChanged = true;
        }
        return tablePkChanged;
    }
    
    /**
     * Check for allow null differences.
     */
    private void checkAllowNull() {
        Object newValue = null;
        Object oldValue = null;
        if (!getArcFieldDef().isPrimaryKey()) {
            newValue = getArcFieldDef().getAllowNull();
            oldValue = getSysFieldDef().isAllowNull();
            setProperty(PropertyType.ALLOWNULL, newValue, oldValue, this.arcFieldDef.getSqlType());
        }
    }
    
    /**
     * Check for auto number differences.
     */
    private void checkAutoNumDefault() {
        Object newValue = null;
        Object oldValue = null;
        if (getArcFieldDef().isAutoNumber() || getSysFieldDef().isAutonum()) {
            newValue = getArcFieldDef().isAutoNumber();
            oldValue = getSysFieldDef().isAutonum();
            setProperty(PropertyType.AUTONUM, newValue, oldValue, this.arcFieldDef.getSqlType());
        } else {
            checkDefaultValue();
        }
    }
    
    /**
     * 
     * @param newVal
     * @param oldVal
     */
    private void checkDefaultValue() {
        final ArchibusFieldDefBase.Immutable newFldDef = this.getArcFieldDef();
        final DatabaseSchemaFieldDef oldFldDef = this.getSysFieldDef();
        
        Object newValue = SchemaUpdateWizardUtilities.getDefaultValue(newFldDef);
        Object oldValue = oldFldDef.getDfltVal();
        
        if (StringUtil.isNullOrEmpty(oldValue)) {
            oldValue = SchemaUpdateWizardConstants.NULL;
        } else {
            oldValue = oldValue.toString();
        }
        
        if (StringUtil.isNullOrEmpty(newValue)) {
            newValue = SchemaUpdateWizardConstants.NULL;
        } else {
            newValue = newValue.toString();
        }
        setProperty(PropertyType.DEFAULT, newValue, oldValue, this.arcFieldDef.getSqlType());
        
    }
    
    /**
     * Check for data type and size differences.
     */
    private void checkTypeAndSize() {
        Object newValue = null;
        Object oldValue = null;
        int sqlType = 0;
        
        if (CompareFieldDefUtilities.isDoc(this.getArcFieldDef())) {
            sqlType = SqlTypes.SQL_LONGVARBINARY;
        } else {
            sqlType = getArcFieldDef().getSqlType();
        }
        
        newValue = sqlType;
        
        if (SqlUtils.isOracle()) {
            oldValue = getSysFieldDef().getOracleSqlType();
        } else if (SqlUtils.isSqlServer()) {
            oldValue = getSysFieldDef().getSqlServerSqlType();
        } else {
            oldValue = getSysFieldDef().getDataType().toString();
        }
        if (!SqlTypes.compareArchibusDataType(Integer.parseInt(String.valueOf(newValue)),
            Integer.parseInt(String.valueOf(oldValue)))) {
            oldValue = newValue;
        }
        setProperty(PropertyType.TYPE, newValue, oldValue, this.arcFieldDef.getSqlType());
        if (new SqlTypes(sqlType).isSizeMatters()) {
            // check Size
            newValue = getArcFieldDef().getSize();
            oldValue = getSysFieldDef().getSize();
            setProperty(PropertyType.SIZE, newValue, oldValue, this.arcFieldDef.getSqlType());
        }
        
        if (new SqlTypes(sqlType).isDecimalsMatters()) {
            // check Decimals
            newValue = getArcFieldDef().getDecimals();
            oldValue = getSysFieldDef().getDecimals();
            setProperty(PropertyType.DECIMALS, newValue, oldValue, this.arcFieldDef.getSqlType());
        }
        
    }
    
    /**
     * Compare foreign field.
     * 
     * @param archFkey ARCHIBUS foreign key
     * @param sqlFkey SQL foreign key
     * @return true if difference is found
     */
    private boolean compareForeignKeyDefs(final ForeignKey.Immutable archFkey,
            final DatabaseSchemaForeignKeyDef sqlFkey) {
        
        boolean fkHasChanged = false;
        
        this.arcFieldDef = getArchTableDef().getFieldDef(archFkey.getName());
        this.sysFieldDef = getSysTabledef().getFieldDef(sqlFkey.getName());
        compareFieldProperties();
        if (isChanged()) {
            fkHasChanged = true;
        } else {
            final ListWrapper.Immutable<String> archForeignFields = archFkey.getForeignFields();
            final List<String> sqlForeignFields = sqlFkey.getForeignFields();
            
            final String arcForeignTable = archFkey.getForeignTable();
            final String sqlForeignTable = sqlFkey.getForeignTableName();
            final TableDef.ThreadSafe archForeignTableDef =
                    ContextStore.get().getProject().loadTableDef(arcForeignTable);
            // TableDef from SQL schema
            final DatabaseSchemaTableDef sqlForeignTblDef =
                    new DatabaseSchemaTableDef(sqlForeignTable).loadTableFieldsDefn();
            
            if (sqlForeignTable.equalsIgnoreCase(arcForeignTable)) {
                fkHasChanged =
                        isForeignKeysChanged(archForeignTableDef, archForeignFields,
                            sqlForeignTblDef, sqlForeignFields);
            } else {
                // RefTable has been changed
                fkHasChanged = true;
            }
        }
        return fkHasChanged;
    }
    
    /**
     * 
     * Return true if the foreign key changed.
     * 
     * @param archForeignTableDef ARCHIBUS Table definition
     * @param archForeignFields ARCHIBUS foreign keys
     * @param sqlForeignTblDef SQL Table definition
     * @param sqlForeignFields SQL foreign keys
     * @return boolean
     */
    private boolean isForeignKeysChanged(final TableDef.ThreadSafe archForeignTableDef,
            final ListWrapper.Immutable<String> archForeignFields,
            final DatabaseSchemaTableDef sqlForeignTblDef, final List<String> sqlForeignFields) {
        boolean fieldFound = false;
        boolean fkHasChanged = false;
        for (final String archForeignField : archForeignFields) {
            for (final String sqlForeignField : sqlForeignFields) {
                if (archForeignField.equalsIgnoreCase(sqlForeignField)) {
                    // field found ... now compare if properties changed
                    fieldFound = true;
                    this.arcFieldDef = archForeignTableDef.getFieldDef(archForeignField);
                    this.sysFieldDef = sqlForeignTblDef.getFieldDef(sqlForeignField);
                    compareFieldProperties();
                    if (isChanged()) {
                        fkHasChanged = true;
                        break;
                    }
                }
            }
            if (!fieldFound) {
                fkHasChanged = true;
                break;
            }
        }
        return fkHasChanged;
    }
}
