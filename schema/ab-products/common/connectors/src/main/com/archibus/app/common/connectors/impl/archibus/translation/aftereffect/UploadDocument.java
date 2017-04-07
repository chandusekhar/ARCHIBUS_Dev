package com.archibus.app.common.connectors.impl.archibus.translation.aftereffect;

import java.io.*;
import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.dao.jdbc.DocumentDaoImpl;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.schema.*;
import com.archibus.utility.ListWrapper;

/**
 * A rule for uploading a document specified in a field to document management.
 *
 * @author cole
 * @since 21.4
 *
 */
public class UploadDocument implements IAfterEffectRule {

    /**
     * The path to the file.
     */
    private String pathName;

    /**
     * The document table name.
     */
    private String tableName;
    
    /**
     * The document field name in the archibus database.
     */
    private String archibusFieldName;
    
    /**
     * The field definitions for the primary key for the record this document is attached to.
     */
    private ListWrapper.Immutable<Immutable> recordKeyFieldDefs;

    /**
     * Data access object for uploading files.
     */
    private DocumentDaoImpl documentDao;

    /**
     * {@inheritDoc}
     */
    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        this.pathName =
                EventHandlerBase.expandParameters(ContextStore.get().getEventHandlerContext(),
                    connectorField.getParameter());
        this.tableName = connectorField.getConnector().getArchibusTable();
        this.archibusFieldName = connectorField.getArchibusField();

        if (this.archibusFieldName == null || !connectorField.getIsSchemaField()) {
            throw new ConfigurationException("Upload document requires a schema field.", null);
        }
        
        final Project.Immutable project = ContextStore.get().getProject();
        final TableDef.Immutable tableDef = project.loadTableDef(this.tableName);
        this.recordKeyFieldDefs = tableDef.getPrimaryKey().getFields();
        this.documentDao = new DocumentDaoImpl();
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void applyAfterEffect(final Map<String, Object> archibusRecord,
            final Map<String, Object> transaction) throws TranslationException {
        final String fileName =
                (String) archibusRecord.get(this.tableName + '.' + this.archibusFieldName);
        InputStream inputStream;
        try {
            inputStream = new FileInputStream(this.pathName + fileName);
        } catch (final FileNotFoundException e) {
            throw new TranslationException(
                "File not found for upload: " + this.pathName + fileName, e);
        }
        
        final Map<String, String> keysMap = new HashMap<String, String>();
        
        for (final Immutable recordKeyFieldDef : this.recordKeyFieldDefs) {
            final Object value =
                    archibusRecord.get(this.tableName + '.' + recordKeyFieldDef.getName());
            keysMap.put(recordKeyFieldDef.getName(), value == null ? "" : value.toString());
        }
        
        this.documentDao.checkinNewFile(inputStream, keysMap, this.tableName,
            this.archibusFieldName, fileName, "Uploaded from Connector", "0");
    }
    
    /**
     * @return true as there must be a document path in the field.
     */
    @Override
    public boolean requiresExistingValue() {
        return true;
    }
}
