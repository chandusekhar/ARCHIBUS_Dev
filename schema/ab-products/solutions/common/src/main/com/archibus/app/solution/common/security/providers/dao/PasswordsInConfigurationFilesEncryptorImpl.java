package com.archibus.app.solution.common.security.providers.dao;

import java.io.*;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.directwebremoting.util.Logger;
import org.jasypt.encryption.pbe.PBEStringEncryptor;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.*;

import com.archibus.context.*;
import com.archibus.security.providers.dao.PasswordsInConfigurationFilesEncryptor;
import com.archibus.utility.*;
import com.archibus.utility.regexp.*;

public class PasswordsInConfigurationFilesEncryptorImpl implements InitializingBean,
        PasswordsInConfigurationFilesEncryptor {
    
    static class Results {
        int counter = 0;
        
        String fileContentProcessed;
    }
    
    private static RE reToEncrypt;
    
    static {
        try {
            reToEncrypt = new RE("TO_ENCRYPT\\(([^\\)]+)\\)");
        } catch (final RESyntaxException e) {
            e.printStackTrace();
        }
    }
    
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    private PBEStringEncryptor stringEncryptor;
    
    /*
     * (non-Javadoc)
     * 
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
     */
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.stringEncryptor, "stringEncryptor must be set");
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.archibus.app.solution.common.security.providers.dao.PasswordsInConfigurationFilesEncryptor
     * #encryptPasswords()
     */
    public String encryptPasswords() throws ExceptionBase {
        this.logger.info("encryptPasswords");
        
        final Context context = ContextStore.get();
        final File config = FileUtil.determineConfigDir(context.getWebAppPath());
        
        return encryptPasswords(config);
    }
    
    public PBEStringEncryptor getStringEncryptor() {
        return this.stringEncryptor;
    }
    
    public void setStringEncryptor(final PBEStringEncryptor stringEncryptor) {
        this.stringEncryptor = stringEncryptor;
    }
    
    private int processFile(final File file) throws ExceptionBase {
        // @non-translatable
        final String operation = String.format("Processing file=[%s]", file);
        this.logger.info(operation);
        
        try {
            // read file into String
            final String fileContent = readFile(file);
            
            final Results results = this.replaceAndEncryptPasswords(fileContent);
            
            // if password was replaced
            if (results.counter > 0) {
                this.logger.info(String.format("Encrypted [%s] passwords, writing file",
                    results.counter));
                
                // write string to file
                writeFile(file, results.fileContentProcessed);
            }
            
            return results.counter;
        } catch (final Exception e) {
            final ExceptionBase exception = new ExceptionBase(operation, e);
            throw exception;
        }
    }
    
    private String readFile(final File file) throws FileNotFoundException, IOException {
        final Reader reader = new FileReader(file);
        final String fileContent = FileCopyUtils.copyToString(reader);
        
        return fileContent;
    }
    
    private Results replaceAndEncryptPasswords(final String fileContent) {
        final Results results = new Results();
        
        results.fileContentProcessed = fileContent;
        
        results.counter = 0;
        // Match pre-compiled expression against fileContentProcessed
        // match TO_ENCRYPT(<password>)
        while (reToEncrypt.match(results.fileContentProcessed)) {
            results.counter++;
            
            final String password = reToEncrypt.getParen(1);
            // inside Parens
            
            // replace "TO_ENCRYPT(<password>)" with "ENC(<encryptedPassword>)"
            // encrypt <password>
            String passwordEncrypted = this.stringEncryptor.encrypt(password);
            passwordEncrypted = String.format("ENC(%s)", passwordEncrypted);
            
            // substitute macro with encrypted password value
            results.fileContentProcessed = reToEncrypt.subst(results.fileContentProcessed,
                passwordEncrypted, RE.REPLACE_FIRSTONLY);
        }
        
        return results;
    }
    
    private void writeFile(final File file, final String fileContentProcessed) throws IOException {
        final Writer writer = new FileWriter(file);
        FileCopyUtils.copy(fileContentProcessed, writer);
    }
    
    String encryptPasswords(final File config) throws ExceptionBase {
        // collect list of files to be processed
        // add all *.properties files in config subdirectories
        final String[] extensions = new String[] { "properties" };
        final List<File> filesToProcess = (List<File>) FileUtils
            .listFiles(config, extensions, true);
        
        {
            // add afm-projects.xml to the list
            final File afmProjectsXml = new File(config, "afm-projects.xml");
            filesToProcess.add(afmProjectsXml);
        }
        
        int updatedFilesCounter = 0;
        int passwordCounter = 0;
        // for each configuration file
        for (final File file : filesToProcess) {
            
            final int encryptedPasswordsInFile = processFile(file);
            if (encryptedPasswordsInFile > 0) {
                updatedFilesCounter++;
            }
            
            passwordCounter += encryptedPasswordsInFile;
        }
        
        final String result = String.format("Success: updated %s files, encrypted %s passwords.",
            updatedFilesCounter, passwordCounter);
        return result;
    }
}
