package com.archibus.app.sysadmin.updatewizard.project.loader;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.compare.CompareFieldDef;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.schema.*;

/**
 * Loads data from afm_flds.csv to Map object.
 * 
 * @author Catalin Purice
 * 
 */
public class LoadFieldData {
    
    /**
     * constant.
     */
    private static final int AFM_DOC_TYPE = 2170;
    
    /**
     * true if archibus field exists.
     */
    private transient boolean afmFieldExists = true;
    
    /**
     * archibus table definition.
     */
    private transient TableDef.ThreadSafe archTableDef;
    
    /**
     * comp field definition.
     */
    private transient CompareFieldDef compField;
    
    /**
     * field map from csv file.
     */
    private final transient Map<String, Object> csvFldMap;
    
    /**
     * archibus field definition.
     */
    private transient ArchibusFieldDefBase.Immutable fieldDef;
    
    /**
     * field name.
     */
    private transient String fieldName;
    
    /**
     * sql field definition.
     */
    private transient DatabaseSchemaFieldDef sqlFieldDef;
    
    /**
     * true if sql field exists.
     */
    private transient boolean sqlFieldExists = true;
    
    /**
     * sql table definition.
     */
    private transient DatabaseSchemaTableDef sqlTableDef;
    
    /**
     * table name.
     */
    private transient String tableName;
    
    /**
     * Archibus field definition.
     */
    private DataRecord archibusFldDefnRecord = new DataRecord();
    
    /**
     * 
     * @param fldMap field map
     */
    public LoadFieldData(final Map<String, Object> fldMap) {
        this.csvFldMap = fldMap;
    }
    
    /**
     * Constructor.
     * 
     * @param fldData LoadFieldData
     */
    public LoadFieldData(final LoadFieldData fldData) {
        this.csvFldMap = fldData.csvFldMap;
        this.tableName = fldData.tableName;
        this.fieldName = fldData.fieldName;
        this.archTableDef = fldData.archTableDef;
        this.fieldDef = fldData.fieldDef;
        this.afmFieldExists = fldData.afmFieldExists;
        this.sqlTableDef = fldData.sqlTableDef;
        this.sqlFieldDef = fldData.sqlFieldDef;
        this.sqlFieldExists = fldData.sqlFieldExists;
        this.compField = fldData.compField;
        this.archibusFldDefnRecord = fldData.archibusFldDefnRecord;
    }
    
    /**
     * @return the compField
     */
    public CompareFieldDef getCompField() {
        return this.compField;
    }
    
    /**
     * @return the csvFldMap
     */
    public Map<String, Object> getCsvFldMap() {
        return this.csvFldMap;
    }
    
    /**
     * @return the fieldDef
     */
    public ArchibusFieldDefBase.Immutable getFieldDef() {
        return this.fieldDef;
    }
    
    /**
     * @return the fieldName
     */
    public String getFieldName() {
        return this.fieldName;
    }
    
    /**
     * @return the sqlFieldDef
     */
    public DatabaseSchemaFieldDef getSqlFieldDef() {
        return this.sqlFieldDef;
    }
    
    /**
     * @return the sqlTableDef
     */
    public DatabaseSchemaTableDef getSqlTableDef() {
        return this.sqlTableDef;
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * @return the afmFieldExists
     */
    public boolean isAfmFieldExists() {
        return this.afmFieldExists;
    }
    
    /**
     * @return the sqlFieldExists
     */
    public boolean isSqlFieldExists() {
        return this.sqlFieldExists;
    }
    
    /**
     * @return the archibusFldDefnRecord
     */
    public DataRecord getArchibusFldDefnRecord() {
        return this.archibusFldDefnRecord;
    }
    
    /**
     * @return the sqlFieldExists
     */
    public boolean isDocStgAfmType() {
        return AFM_DOC_TYPE == getFieldDef().getArchibusFieldType().getCode() ? true : false;
    }
    
    /**
     * Loads data to be compared: ARCHIBUS data dictionary, SQL properties, CSV record.
     * 
     * @param currSqlTableDef sql table definition
     * @return this
     */
    public LoadFieldData loadData(final DatabaseSchemaTableDef currSqlTableDef) {
        // get the field definition from ARCHIBUS data dictionary
        final Project.Immutable project = ContextStore.get().getProject();
        this.tableName = this.csvFldMap.get(ProjectUpdateWizardConstants.TABLE_NAME).toString();
        this.fieldName = this.csvFldMap.get(ProjectUpdateWizardConstants.FIELD_NAME).toString();
        if (ProjectUpdateWizardUtilities.isTableInArchibus(this.tableName)) {
            this.archTableDef = project.loadTableDef(this.tableName);
            if (ProjectUpdateWizardUtilities.isFieldInArchibus(this.tableName, this.fieldName)) {
                this.fieldDef = this.archTableDef.getFieldDef(this.fieldName);
                loadArchibusFieldProperties();
            } else {
                this.afmFieldExists = false;
            }
        } else {
            this.afmFieldExists = false;
        }
        this.sqlTableDef = currSqlTableDef;
        if (this.sqlTableDef.exists()) {
            this.sqlFieldDef = this.sqlTableDef.getFieldDef(this.fieldName);
            if (this.sqlFieldDef == null) {
                this.sqlFieldExists = false;
            } else if (this.afmFieldExists) {
                this.compField =
                        new CompareFieldDef(this.sqlTableDef, this.archTableDef, this.fieldName)
                            .compareFieldProperties();
            }
        } else {
            this.sqlFieldExists = false;
        }
        return this;
    }
    
    /**
     * Gets field value from afm_flds for the specified field.
     * 
     */
    public void loadArchibusFieldProperties() {
        final DataSource fieldPropDS =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
                            ProjectUpdateWizardConstants.FIELD_NAME, this.getFieldName()))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
                            ProjectUpdateWizardConstants.TABLE_NAME, this.getTableName()));
        this.archibusFldDefnRecord = fieldPropDS.getRecord();
    }
    
    /**
     * loads all fields from file into memory.
     * 
     * @return List<Map<String, Object>>
     */
    public static List<Map<String, Object>> loadAllFieldsData() {
        final DataSourceFile dsfTables = new DataSourceFile("afm_flds.csv");
        return dsfTables.getAllRecords();
    }
}
