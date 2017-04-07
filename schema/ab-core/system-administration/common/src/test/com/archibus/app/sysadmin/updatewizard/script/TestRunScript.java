package com.archibus.app.sysadmin.updatewizard.script;

import java.nio.charset.Charset;

import com.archibus.app.sysadmin.updatewizard.script.file.InboundFileSystem;
import com.archibus.app.sysadmin.updatewizard.script.parser.*;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.JobStatus;

public class TestRunScript extends DataSourceTestBase {

    private static final String FILE_PATH = "d:/test.duw";
    
    public void testRunScript() {
        final DelimitedTextLineParser parser =
                new DelimitedTextLineParser(new ScriptFileCharSequenceSet(),
                    Charset.defaultCharset());
        final JobStatus status = new JobStatus();
        final CommandHandler cHandler = new CommandHandler(status);
        parser.parse(new InboundFileSystem(FILE_PATH).getInputStream(), cHandler);
        System.out.print("test");
        
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml",
                "/context/core/core-optional.xml", "/context/reports/docx/reports-docx.xml",
                "/context/controls/drawing/controls-drawing.xml", "appContext-test.xml" };
    }

}
