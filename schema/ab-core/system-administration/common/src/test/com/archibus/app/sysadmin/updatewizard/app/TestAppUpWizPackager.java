package com.archibus.app.sysadmin.updatewizard.app;

import java.io.File;

import com.archibus.app.sysadmin.updatewizard.app.packager.*;
import com.archibus.fixture.IntegrationTestBase;
import com.archibus.jobmanager.JobStatus;

public class TestAppUpWizPackager extends IntegrationTestBase {
    
    public void testWriteFinalArchibusWAR() throws Exception {
        Extractor a = new Extractor(0, new JobStatus());
        
        // will extract the files from\webapps\archibus.war into /archibus/temp/deployment
        a.extractZipFiles("archibus.war");
        
        // will zip the files from /archive/temp/deployment into /archive/temp/archibus.war
        a.writeFinalArchibusWAR();
    }
    
    public void testGetPathFromPrefFile() throws Exception {
        // List<String> list = new ArrayList<String>();
        // AppUpWizPackager a = new AppUpWizPackager();
        // List<Data> d = a.getPathFromPrefFile();
    }
    
    public void testWriteAppExtensionsZip() throws Exception {
        // AppUpWizPackager a = new AppUpWizPackager();
        // a.writeAppExtensionsZip();
    }
    
    public void testWriteAppDataZip() throws Exception {
        // AppUpWizPackager a = new AppUpWizPackager();
        // a.writeAppDataZip();
    }
    
    public void testextractZipFiles() throws Exception {
        // AppUpWizPackager a = new AppUpWizPackager();
        // a.extractZipFiles("mysite-data.war");
        // a.extractZipFiles("archibus.war");
        // a.extractZipFiles("mysite-extensions.war");
    }
    
    public void testwriteFinalArchibusWAR() throws Exception {
        // AppUpWizPackager a = new AppUpWizPackager();
        // a.writeFinalArchibusWAR();
        // a.removeTempFolders();
    }
    
    public void testcopyFiles() throws Exception {
        new Packager(0, new JobStatus());
    }
    
    public void testmergePropertiesFiles() {
        new File("D:\\Yalta\\tools\\tomcat\\webapps\\archibus\\WEB-INF\\config\\debug.properties");
        new File(
            "D:\\Yalta\\tools\\tomcat\\webapps\\archibus\\temp\\deployment\\WEB-INF\\config\\debug.properties");
        // AppUpWizPackager a = new AppUpWizPackager();
        try {
            // a.mergePropertiesFiles(s, d);
        } catch (Exception e) {
            e.getMessage();
        }
    }
    
    public void testcopyExtensionsFiles() throws Exception {
        // AppUpWizPackager a = new AppUpWizPackager();
        // a.copyExtensionsFiles("");
    }
    
}