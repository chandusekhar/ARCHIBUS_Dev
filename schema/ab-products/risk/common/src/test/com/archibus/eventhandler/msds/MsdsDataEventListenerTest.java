package com.archibus.eventhandler.msds;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.compliance.Constant;

/**
 * Listener which is configured to be notified by the core when there is a DataEvent. Records any
 * MSDS data changes to according historical tables.
 * 
 * 
 * @author Zhang Yi
 * 
 */
public class MsdsDataEventListenerTest extends DataSourceTestBase {
    
    /**
     * Constant: Table name: "msds_h_chemical".
     */
    private static final String MSDS_ID = "msds_id";
    
    /**
     * Define String AND.
     */
    private final static String AND = " and ";
    
    /**
     * Define String DESCRIPTION.
     */
    private final static String DESCRIPTION = "description";
    
    /**
     * Define String EQUALS.
     */
    private final static String EQUALS = "=";
    
    /**
     * Define String DESCRIPTIONSTR.
     */
    private final static String DESCRIPTIONSTR = "test unit test";
    
    /**
     * Define String MSDS_H_CHEMICAL.
     */
    private final static String CHEMICAL_ID = "chemical_id";
    
    /**
     * Define String MSDS_H_CHEMICAL.
     */
    private final static String ALIAS = "alias";
    
    // @translatable
    private static String message1 = "Success";
    
    /**
     * Define String message2.
     */
    // @translatable
    private static String message2 = "Fail";
    
    /** {@inheritDoc} */
    public void testOnApplicationEvent() {
        msdsDataTest();
        msdsDataChemicalTest();
    }
    
    /**
     * Test msds data msdsDataTest.
     */
    private void msdsDataTest() {
        final DataSource mdds = getMsdsData();
        final DataRecord record = mdds.getRecord();
        record.setValue("msds_data.description", "test unit test");
        mdds.saveRecord(record);
        
        final DataSource mddsdistory = getMsdsHistoryData();
        final List<DataRecord> records =
                mddsdistory.getRecords(MsdsConstants.MSDS_H_DATA + Constant.DOT + MSDS_ID + EQUALS
                        + record.getInt(MsdsConstants.MSDS_DATA + Constant.DOT + MSDS_ID) + AND
                        + MsdsConstants.MSDS_H_DATA + Constant.DOT + DESCRIPTION + EQUALS + " '"
                        + DESCRIPTIONSTR + "' ");
        if (records.isEmpty()) {
            decideIfSuccess(records, message2, message1);
        }
    }
    
    /**
     * Test msds msds chemical.
     */
    private void msdsDataChemicalTest() {
        final DataSource mdds = getMsdsChemicalData();
        final DataRecord record = mdds.getRecord();
        record.setValue(MsdsConstants.MSDS_CHEMICAL + Constant.DOT + ALIAS, DESCRIPTIONSTR);
        mdds.saveRecord(record);
        
        final DataSource mddsdistory = getMsdsChemicalHistoryData();
        final List<DataRecord> records =
                mddsdistory.getRecords(MsdsConstants.MSDS_H_CHEMICAL
                        + Constant.DOT
                        + CHEMICAL_ID
                        + EQUALS
                        + " '"
                        + record
                            .getString(MsdsConstants.MSDS_CHEMICAL + Constant.DOT + CHEMICAL_ID)
                        + "' " + AND + MsdsConstants.MSDS_H_CHEMICAL + Constant.DOT + ALIAS
                        + EQUALS + "' " + DESCRIPTIONSTR + " '");
        if (records.isEmpty()) {
            decideIfSuccess(records, message2, message1);
        }
    }
    
    /**
     * @return datasource of table MSDS_DATA.
     * 
     */
    private static DataSource getMsdsChemicalData() {
        return DataSourceFactory.createDataSourceForFields(MsdsConstants.MSDS_CHEMICAL,
            new String[] { CHEMICAL_ID, ALIAS });
        
    }
    
    /**
     * @return datasource of table MSDS_H_DATA.
     * 
     */
    private static DataSource getMsdsChemicalHistoryData() {
        return DataSourceFactory.createDataSourceForFields(MsdsConstants.MSDS_H_CHEMICAL,
            new String[] { MsdsConstants.TIME_ARCHIVED, MsdsConstants.DATE_ARCHIVED, CHEMICAL_ID,
                    ALIAS });
    }
    
    /**
     * @return datasource of table MSDS_DATA.
     * 
     */
    private static DataSource getMsdsData() {
        return DataSourceFactory.createDataSourceForFields(MsdsConstants.MSDS_DATA, new String[] {
                MSDS_ID, DESCRIPTION });
        
    }
    
    /**
     * @return datasource of table MSDS_H_DATA.
     * 
     */
    private static DataSource getMsdsHistoryData() {
        return DataSourceFactory.createDataSourceForFields(MsdsConstants.MSDS_H_DATA, new String[] {
                MsdsConstants.TIME_ARCHIVED, MsdsConstants.DATE_ARCHIVED, MSDS_ID, DESCRIPTION });
    }
    
    /**
     * Decide If Success.
     * 
     * @param records .
     * @param m1 .
     * @param m2 .
     */
    private static void decideIfSuccess(final List<DataRecord> records, final String m1,
            final String m2) {
        if (records.isEmpty()) {
            System.out.print(m1);
        } else {
            System.out.print(m2);
        }
        
    }
}
