package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;

import com.archibus.app.common.mobile.sync.service.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.db.ViewField;
import com.archibus.utility.ExceptionBase;

/**
 * Utility class: converter for DTO: Record.
 * <p>
 * Provides methods to convert Record to/from DataRecord (including lists of records).
 * <p>
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
final class Converter {
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private Converter() {
    }
    
    /**
     * Converts Record DTOs to DataRecord records.
     * 
     * @param recordDtos DTOs to be converted.
     * @param dataSource to be used as a source of ViewField.Immutable.
     * @return map of converted DataRecord records to record DTOs.
     */
    static Map<DataRecord, Record> convertDtosToRecords(final List<Record> recordDtos,
            final DataSource dataSource) {
        final Map<DataRecord, Record> dataRecords = new HashMap<DataRecord, Record>();
        for (final Record recordDto : recordDtos) {
            // Add the record to the array to return
            dataRecords.put(convertDtoToDataRecord(recordDto, dataSource), recordDto);
        }
        
        return dataRecords;
    }
    
    /**
     * Converts Record DTO to DataRecord.
     * 
     * @param recordDto DTO to be converted.
     * @param dataSource to be used as a source of ViewField.Immutable.
     * @return converted record.
     */
    static DataRecord convertDtoToDataRecord(final Record recordDto, final DataSource dataSource) {
        final DataRecord dataRecord = new DataRecord(true);
        // add all fields except autonumbered PK
        for (final ViewField.Immutable fieldDef : dataSource.getAllFields()) {
            if (!fieldDef.isAutoNumber()) {
                dataRecord.addField(fieldDef);
            }
        }
        
        for (final FieldNameValue fieldNameValue : recordDto.getFieldValues()) {
            final String fieldName = fieldNameValue.getFieldName();
            final String fullFieldName =
                    dataSource.getMainTableName() + SyncDataSourceUtilities.DOT + fieldName;
            
            if (dataRecord.findField(fullFieldName) == null) {
                if (!fieldName.endsWith(DocumentFieldsDataSource.FIELD_POSTFIX_CONTENTS)
                        && !dataSource.getMainTableDef().getFieldDef(fieldName).isDocument()) {
                    // non-translatable
                    throw new ExceptionBase(String.format(
                        "Record DTO has field [%s] which does not exist in the sync table.",
                        fieldName));
                }
            } else {
                dataRecord.setValue(fullFieldName, fieldNameValue.getFieldValue());
            }
        }
        
        return dataRecord;
    }
    
    /**
     * Converts DataRecord records to DTOs.
     * 
     * @param tableName name of the table from which the record is coming.
     * @param fieldNames names of the fields to be present in the converted record.
     * @param records to be converted.
     * @return converted record DTOs.
     */
    static List<Record> convertRecordsToDtos(final String tableName, final List<String> fieldNames,
            final List<DataRecord> records) {
        final List<Record> recordsToReturn = new ArrayList<Record>();
        // For each record:
        for (final DataRecord record : records) {
            // Add the record to the array to return
            recordsToReturn.add(convertRecordToDto(record, tableName, fieldNames));
        }
        
        return recordsToReturn;
    }
    
    /**
     * Converts DataRecord To Record DTO.
     * 
     * @param record to be converted.
     * @param tableName name of the table from which the record is coming.
     * @param fieldNames names of the fields to be present in the converted record.
     * @return converted record DTO.
     */
    static Record convertRecordToDto(final DataRecord record, final String tableName,
            final List<String> fieldNames) {
        final Record recordDto = new Record();
        for (final String fieldName : fieldNames) {
            recordDto.addOrSetFieldValue(fieldName,
                record.getValue(tableName + SyncDataSourceUtilities.DOT + fieldName));
        }
        
        return recordDto;
    }
}
