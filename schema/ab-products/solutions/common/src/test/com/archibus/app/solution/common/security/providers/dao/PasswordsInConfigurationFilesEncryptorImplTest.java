package com.archibus.app.solution.common.security.providers.dao;

import java.io.File;

import junit.framework.TestCase;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;

import com.archibus.app.solution.common.security.providers.dao.PasswordsInConfigurationFilesEncryptorImpl;
import com.archibus.servletx.WebCentralConfigListener;
import com.archibus.utility.FileUtil;

public class PasswordsInConfigurationFilesEncryptorImplTest extends TestCase {

    public void testEncryptPasswords() {
        PasswordsInConfigurationFilesEncryptorImpl encryptor = new PasswordsInConfigurationFilesEncryptorImpl();
        StandardPBEStringEncryptor stringEncryptor = new StandardPBEStringEncryptor();
        stringEncryptor.setAlgorithm("PBEWithMD5AndDES");
        stringEncryptor.setPassword(WebCentralConfigListener.PASSWORD);
        encryptor.setStringEncryptor(stringEncryptor);

        File configDir = FileUtil.determineConfigDir();
        encryptor.encryptPasswords(configDir);

        // TODO verify
    }
}
