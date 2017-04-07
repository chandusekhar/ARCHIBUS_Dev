/**
 * 
 */
package com.archibus.app.common.fileaccess;

import java.io.*;
import java.net.*;
import java.util.Date;

import junit.framework.TestCase;

import com.archibus.app.common.fileaccess.FileAccessProviderFileSystem;
import com.archibus.ext.fileaccess.FileAccessProvider;
import com.archibus.utility.*;

/**
 * @author tydykov
 * 
 */
public class FileAccessProviderFileSystemTest extends TestCase {
    
    private static final String TEST_FILE_CONTENT = "Test file content.";
    
    /**
     * Test method for
     * {@link com.archibus.app.common.fileaccess.FileAccessProviderFileSystem#writeFile(java.io.InputStream, String)}
     * .
     * 
     * @throws URISyntaxException
     */
    public void testWriteFileWithRelativePath() throws URISyntaxException {
        final FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        String fileName = null;
        String relativePath = null;
        {
            final URL resource = this.getClass().getResource("test.txt");
            fileName = FileUtil.getName(resource.getPath());
            
            relativePath = new File(resource.getPath()).getParentFile().getName();
            // combine relativePath with fileName
            fileName = new File(new File(relativePath), fileName).getPath();
            
            final String folder =
                    FileUtil.getParentPath(FileUtil.getParentPath(resource.getPath()));
            fileAccessProviderFileSystem.setFolder(folder);
        }
        
        fileAccessProviderFileSystem.writeFile(prepareInputStream(TEST_FILE_CONTENT), fileName);
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.common.fileaccess.FileAccessProviderFileSystem#writeFile(java.io.InputStream, String)}
     * .
     * 
     * @throws URISyntaxException
     */
    public void testWriteFile() throws URISyntaxException {
        final FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        final URL resource = this.getClass().getResource("test.txt");
        final String fileName = FileUtil.getName(resource.getPath());
        final String folder = FileUtil.getParentPath(resource.getPath());
        fileAccessProviderFileSystem.setFolder(folder);
        
        final InputStream inputStream = prepareInputStream(TEST_FILE_CONTENT);
        
        fileAccessProviderFileSystem.writeFile(inputStream, fileName);
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.common.fileaccess.FileAccessProviderFileSystem#readFile(String)}
     * .
     * 
     * @throws URISyntaxException
     * @throws IOException
     */
    public void testReadFile() throws URISyntaxException, IOException {
        final FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        final URL resource = this.getClass().getResource("test.txt");
        final String fileName = FileUtil.getName(resource.getPath());
        final String folder = FileUtil.getParentPath(resource.getPath());
        fileAccessProviderFileSystem.setFolder(folder);
        
        final InputStream inputStream = fileAccessProviderFileSystem.readFile(fileName);
        final byte[] bytes = new byte[inputStream.available()];
        inputStream.read(bytes);
        final String fileContent = new String(bytes);
        
        assertEquals(TEST_FILE_CONTENT, fileContent);
    }
    
    public void testGetLastModified() throws URISyntaxException, IOException {
        final FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        final URL resource = this.getClass().getResource("test.txt");
        final String fileName = FileUtil.getName(resource.getPath());
        final String folder = FileUtil.getParentPath(resource.getPath());
        fileAccessProviderFileSystem.setFolder(folder);
        
        final Date lastModified = fileAccessProviderFileSystem.getLastModified(fileName);
        
        // TODO verify
        assertNotNull(lastModified);
    }
    
    public void testGetSize() throws URISyntaxException, IOException {
        final FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        final URL resource = this.getClass().getResource("test.txt");
        final String fileName = FileUtil.getName(resource.getPath());
        final String folder = FileUtil.getParentPath(resource.getPath());
        fileAccessProviderFileSystem.setFolder(folder);
        
        final long size = fileAccessProviderFileSystem.getSize(fileName);
        
        // verify
        assertEquals(18, size);
    }
    
    public static InputStream prepareInputStream(final String fileContent) throws ExceptionBase {
        InputStream inputStream = null;
        try {
            inputStream = new ByteArrayInputStream(fileContent.getBytes("UTF-8"));
        } catch (final UnsupportedEncodingException e) {
            ExceptionBase.throwNew(null, e);
        }
        
        return inputStream;
    }
}
