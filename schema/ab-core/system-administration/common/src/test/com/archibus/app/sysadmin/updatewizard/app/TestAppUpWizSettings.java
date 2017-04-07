package com.archibus.app.sysadmin.updatewizard.app;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.app.property.Property;
import com.archibus.app.sysadmin.updatewizard.app.util.*;
import com.archibus.fixture.IntegrationTestBase;

public class TestAppUpWizSettings extends IntegrationTestBase {
    
    public void testGetActiveProjects() {
        // AppUpdWizSettings a = new AppUpdWizSettings();
        // a.getListOfFoldersToPreserve();
    }
    
    public void testGetFolderList() {
        new FolderTree();
        
        // a.getFolderList("D:\\Yalta\\tools\\tomcat\\webapps\\archibus\\lib");
        
    }
    
    public void testAddDataToFile() {
        new Property();
        
        List<String> sss = new ArrayList<String>();
        sss.add("D:\\Yalta\\tools\\tomcat\\webapps\\archibus\\lib");
        sss.add("D:\\Yalta\\tools\\tomcat\\webapps\\archibus\\lib2");
        sss.add("D:\\Yalta\\tools\\tomcat\\webapps\\archibus\\lib3");
        sss.add("D:\\Yalta\\tools\\tomcat\\webapps\\archibus\\lib4");
        
        // a.saveToDeploymentPreferencesFile();
    }
    
    public void testGetExtensionsFileDetails() {
        AppUpdateWizardUtilities.getExtensionsFileDetails();
    }
}
