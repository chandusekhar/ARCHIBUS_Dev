package com.archibus.app.common.connectors.translation.common.outbound.impl;

import java.io.*;

/**
 * An output stream that can output piecewise to other output streams.
 * 
 * @author cole
 * 
 */
public class PiecewiseOutputStream extends OutputStream {
    
    /**
     * The current stream being written to.
     */
    private OutputStream wrappedStream;
    
    /**
     * @param wrappedStream the first stream to be written to.
     */
    public PiecewiseOutputStream(final OutputStream wrappedStream) {
        super();
        this.wrappedStream = wrappedStream;
    }
    
    /**
     * @param wrappedStream the next stream to be written to.
     */
    public void setWrappedStream(final OutputStream wrappedStream) {
        this.wrappedStream = wrappedStream;
    }
    
    @Override
    public void close() throws IOException {
        this.wrappedStream.close();
    }
    
    @Override
    public void flush() throws IOException {
        this.wrappedStream.flush();
    }
    
    @Override
    public void write(final byte[] arg0, final int arg1, final int arg2) throws IOException {
        this.wrappedStream.write(arg0, arg1, arg2);
    }
    
    @Override
    public void write(final byte[] arg0) throws IOException {
        this.wrappedStream.write(arg0);
    }
    
    @Override
    public void write(final int arg0) throws IOException {
        this.wrappedStream.write(arg0);
    }
}
