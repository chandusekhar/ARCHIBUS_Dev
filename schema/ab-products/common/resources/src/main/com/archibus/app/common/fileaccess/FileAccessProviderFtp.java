package com.archibus.app.common.fileaccess;

import com.archibus.utility.ExceptionBase;

/**
 * Provides read/write access to a file, using FTP protocol.
 * <p>
 * Each method invocation in this class opens, uses, and closes connection to FTP server. TODO
 * Opening connection to the FTP server might be an expensive operation (like database connection)
 * <p>
 * Documentation for the FTP library: @link
 * http://www.enterprisedt.com/products/edtftpjssl/examples/howto/index.html
 *
 * @author Valery Tydykov
 * @author Yong Shao
 *
 */
// TODO unit test
public class FileAccessProviderFtp extends AbstractFileAccessProviderFtp {

    @Override
    protected FtpTemplate createTemplate(final String host, final int port) throws ExceptionBase {
        return new FtpTemplate(host, port, this.getPassword(), this.getUsername());
    }
}
