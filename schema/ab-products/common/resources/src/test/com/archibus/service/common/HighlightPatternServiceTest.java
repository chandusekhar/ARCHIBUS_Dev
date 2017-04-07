package com.archibus.service.common;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.drawing.highlight.patterns.*;

public class HighlightPatternServiceTest extends DataSourceTestBase {
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml",
                "/context/reports/docx/reports-docx.xml",
                "/context/controls/drawing/controls-drawing.xml", "appContext-test.xml" };
    }
    
    public void testCreateHatchPattern() {
        final HighlightPatternService hpatGenerator = new HighlightPatternService();
        
        // only colors, no sortfield
        hpatGenerator.createHatchPatterns("rmcat", "hpattern_acad", true, null, null, true);
        DataSource ds = DataSourceFactory.createDataSourceForFields("rmcat",
            new String[] { "rm_cat", "hpattern_acad" });

        List<String> generatedHPats = new ArrayList<String>();
        for (final DataRecord res : ds.getRecords()) {
            assertNotNull(res.getValue("rmcat.hpattern_acad"));
            assertFalse(generatedHPats.contains(res.getString("rmcat.hpattern_acad")));
            generatedHPats.add(res.getString("rmcat.hpattern_acad"));
            
        }
        
        // colors and patterns, no sortField
        hpatGenerator.createHatchPatterns("gpstd", "hpattern_acad", false, null, null, false);
        ds = DataSourceFactory.createDataSourceForFields("gpstd",
            new String[] { "gp_std", "hpattern_acad" });
        generatedHPats = new ArrayList<String>();
        for (final DataRecord res : ds.getRecords()) {
            assertNotNull(res.getValue("gpstd.hpattern_acad"));
            assertFalse(generatedHPats.contains(res.getString("gpstd.hpattern_acad")));
            generatedHPats.add(res.getString("gpstd.hpattern_acad"));
            
        }
        
        // colors and patterns, sortField
        hpatGenerator.createHatchPatterns("dp", "hpattern_acad", false, "dv_id", null, false);
        ds = DataSourceFactory.createDataSourceForFields("dp",
            new String[] { "dv_id", "dp_id", "hpattern_acad" });
        generatedHPats = new ArrayList<String>();
        
        String dv_id = null;
        long color = 0;
        for (final DataRecord res : ds.getRecords()) {
            assertNotNull(res.getValue("dp.hpattern_acad"));
            
            if (dv_id != null && dv_id.equals(res.getString("dp.dv_id"))) {
                final String hpat = res.getString("dp.hpattern_acad");
                final HighlightPattern pattern = HighlightPatternUtilities.decodePattern(hpat);
                assertEquals(color, pattern.getRgbColorValue());
            } else {
                dv_id = res.getString("dp.dv_id");
                final String hpat = res.getString("dp.hpattern_acad");
                final HighlightPattern pattern = HighlightPatternUtilities.decodePattern(hpat);
                color = pattern.getRgbColorValue();
            }
            assertFalse(generatedHPats.contains(res.getString("dp.hpattern_acad")));
            generatedHPats.add(res.getString("dp.hpattern_acad"));
            
        }
        
        // only colors, sortField
        hpatGenerator.createHatchPatterns("rmtype", "hpattern_acad", true, "rm_cat", null, false);
        ds = DataSourceFactory.createDataSourceForFields("rmtype",
            new String[] { "rm_type", "rm_cat", "hpattern_acad" });
        generatedHPats = new ArrayList<String>();
        
        for (final DataRecord res : ds.getRecords()) {
            assertNotNull(res.getValue("rmtype.hpattern_acad"));
            assertFalse(generatedHPats.contains(res.getString("rmtype.hpattern_acad")));
            generatedHPats.add(res.getString("rmtype.hpattern_acad"));
        }
        
    }
    
    public void testCreateHatchPatternLegends() {
        final HighlightPatternService hpatGenerator = new HighlightPatternService();
        
        hpatGenerator.createHatchPatternLegends("dp", "hpattern_acad", "");
    }
}
