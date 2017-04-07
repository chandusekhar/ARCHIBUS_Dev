package com.archibus.app.solution.logiccookbook;

import java.util.List;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Java Examples unit test.
 */
public class TestJavaExamples extends DataSourceTestBase {
    
    /**
     * Cost of labor: 70.
     */
    private static final double COST_OF_LABOR = 70.0;
    
    /**
     * Cost of materials: 20.
     */
    private static final double COST_OF_MATERIALS = 20.0;
    
    /**
     * Max number of requests: 10.
     */
    private static final int MAX_NUMBER_OF_REQUESTS = 10;
    
    public void testUseCollections() {
        final JavaExamples examples = new JavaExamples();
        examples.useCollections();
    }
    
    public void testUseDataTypes() {
        final JavaExamples examples = new JavaExamples();
        examples.useDataTypes(COST_OF_LABOR, COST_OF_MATERIALS, MAX_NUMBER_OF_REQUESTS);
    }
    
    public void testUseForLoop() {
        final JavaExamples examples = new JavaExamples();
        final List<Integer> searchResults = examples.useForLoop();
        
        assertTrue(searchResults.size() <= JavaExamples.MAX_NUMBER_OF_RECORDS);
    }
    
    public void testUseGetAndUpdateRecordLoop() {
        final JavaExamples examples = new JavaExamples();
        examples.useGetAndUpdateRecordLoop();
    }
}
