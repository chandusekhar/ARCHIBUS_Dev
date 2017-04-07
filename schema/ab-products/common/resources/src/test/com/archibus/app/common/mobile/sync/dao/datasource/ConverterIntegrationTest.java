package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;
import java.util.Map.Entry;

import com.archibus.app.common.mobile.sync.AbstractIntegrationTest;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

/**
 * Integration tests for Converter.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class ConverterIntegrationTest extends AbstractIntegrationTest {
    private DataSource dataSource;
    
    /** {@inheritDoc} */
    
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        this.dataSource = prepareDataSource();
    }
    
    /**
     * Test method for {@link Converter#convertDtosToRecords(List, DataSource)} .
     */
    public final void testConvertDtosToRecords() {
        {
            final List<Record> recordDtos = new ArrayList<Record>();
            {
                final Record recordDto = new Record();
                recordDto.addOrSetFieldValue("priority", Integer.valueOf(3));
                recordDto.addOrSetFieldValue("curr_meter_val", Integer.valueOf(5));
                recordDto.addOrSetFieldValue("date_requested", new Date());
                recordDtos.add(recordDto);
            }
            {
                final Record recordDto = new Record();
                recordDto.addOrSetFieldValue("priority", Integer.valueOf(4));
                recordDto.addOrSetFieldValue("curr_meter_val", Integer.valueOf(6));
                recordDto.addOrSetFieldValue("date_requested", new Date());
                recordDtos.add(recordDto);
            }
            
            final Map<DataRecord, Record> actuals =
                    Converter.convertDtosToRecords(recordDtos, this.dataSource);
            
            // verify
            {
                for (final Entry<DataRecord, Record> entry : actuals.entrySet()) {
                    final Record expected = entry.getValue();
                    final DataRecord actual = entry.getKey();
                    
                    assertEquals(expected.getFieldValues().get(0).getFieldValue(),
                        actual.getValue("wr.priority"));
                    assertEquals(expected.getFieldValues().get(1).getFieldValue(),
                        actual.getValue("wr.curr_meter_val"));
                    assertEquals(expected.getFieldValues().get(2).getFieldValue(),
                        actual.getValue("wr.date_requested"));
                }
            }
        }
    }
    
    /**
     * Test method for {@link Converter#convertDtoToDataRecord(Record, DataSource)} .
     */
    public final void testConvertDtoToDataRecord() {
        {
            // Case #1: no autonumbered PK field value
            final Record expected = new Record();
            expected.addOrSetFieldValue("priority", Integer.valueOf(3));
            expected.addOrSetFieldValue("curr_meter_val", Integer.valueOf(5));
            expected.addOrSetFieldValue("date_requested", new Date());
            final DataRecord actual = Converter.convertDtoToDataRecord(expected, this.dataSource);
            
            assertEquals(expected.getFieldValues().get(0).getFieldValue(),
                actual.getValue("wr.priority"));
            assertEquals(expected.getFieldValues().get(1).getFieldValue(),
                actual.getValue("wr.curr_meter_val"));
            assertEquals(expected.getFieldValues().get(2).getFieldValue(),
                actual.getValue("wr.date_requested"));
        }
        
        {
            // Case #2: autonumbered PK field value
            final Record recordDto = new Record();
            recordDto.addOrSetFieldValue("wr_id", Integer.valueOf(3));
            
            try {
                Converter.convertDtoToDataRecord(recordDto, this.dataSource);
                fail("Exception expected");
            } catch (final ExceptionBase exception) {
                assertEquals(
                    "Record DTO has field [wr_id] which does not exist in the sync table.",
                    exception.getPattern());
            }
        }
    }
    
    /**
     * Test method for {@link Converter#convertRecordsToDtos(String, List, List)} .
     */
    public final void testConvertRecordsToDtos() {
        {
            final List<String> fieldNames = new ArrayList();
            fieldNames.add("priority");
            fieldNames.add("curr_meter_val");
            fieldNames.add("date_requested");
            
            final List<DataRecord> records = new ArrayList<DataRecord>();
            {
                final DataRecord record = new DataRecord();
                for (final String fieldName : fieldNames) {
                    record.addField(this.dataSource.findField("wr" + "." + fieldName));
                }
                
                record.setValue("wr.priority", Integer.valueOf(3));
                record.setValue("wr.curr_meter_val", Integer.valueOf(5));
                record.setValue("wr.date_requested", new Date());
                
                records.add(record);
            }
            
            final List<Record> actuals = Converter.convertRecordsToDtos("wr", fieldNames, records);
            
            {
                final DataRecord expected = records.get(0);
                final Record actual = actuals.get(0);
                assertEquals(expected.getValue("wr.priority"),
                    actual.findValueForFieldName("priority"));
                assertEquals(expected.getValue("wr.curr_meter_val"),
                    actual.findValueForFieldName("curr_meter_val"));
                assertEquals(expected.getValue("wr.date_requested"),
                    actual.findValueForFieldName("date_requested"));
            }
        }
    }
    
    /**
     * Test method for {@link Converter#convertRecordToDto(DataRecord, String, List)} .
     */
    public final void testConvertRecordToDto() {
        {
            final List<String> fieldNames = new ArrayList();
            fieldNames.add("priority");
            fieldNames.add("curr_meter_val");
            fieldNames.add("date_requested");
            
            final DataRecord expected = new DataRecord(true);
            for (final String fieldName : fieldNames) {
                expected.addField(this.dataSource.findField("wr" + "." + fieldName));
            }
            
            expected.setValue("wr.priority", Integer.valueOf(3));
            expected.setValue("wr.curr_meter_val", Integer.valueOf(5));
            expected.setValue("wr.date_requested", new Date());
            
            final Record actual = Converter.convertRecordToDto(expected, "wr", fieldNames);
            
            assertEquals(expected.getValue("wr.priority"), actual.getFieldValues().get(0)
                .getFieldValue());
            assertEquals(expected.getValue("wr.curr_meter_val"), actual.getFieldValues().get(1)
                .getFieldValue());
            assertEquals(expected.getValue("wr.date_requested"), actual.getFieldValues().get(2)
                .getFieldValue());
        }
    }
    
    private DataSource prepareDataSource() {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields("wr", new String[] { "priority",
                        "curr_meter_val", "date_requested", "wr_id" });
        dataSource.setContext();
        
        return dataSource;
    }
}
