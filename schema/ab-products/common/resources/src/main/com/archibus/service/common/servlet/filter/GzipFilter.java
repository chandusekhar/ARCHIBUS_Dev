package com.archibus.service.common.servlet.filter;

import java.io.*;
import java.util.zip.GZIPOutputStream;

import javax.servlet.*;
import javax.servlet.http.*;

/**
 * Copyright 2003 Jayson Falkner (jayson@jspinsider.com).
 * <p>
 * This code is from "Servlets and JavaServer pages; the J2EE Web Tier", http://www.jspbook.com. You
 * may freely use the code both commercially and non-commercially. If you like the code, please pick
 * up a copy of the book and help support the authors, development of more free code, and the
 * JSP/Servlet/J2EE community.
 *
 * @author Jayson Falkner
 * @author Valery Tydykov
 * @since 23.1
 *
 */

public class GzipFilter implements Filter {
    /**
     * Constant: Name of encoding from request header: gzip.
     */
    public static final String GZIP = "gzip";

    @Override
    // CHECKSTYLE:OFF Justification: throws two exceptions from super.
    public void doFilter(final ServletRequest req, final ServletResponse res,
            final FilterChain chain) throws IOException, ServletException {
        // CHECKSTYLE:ON
        if (req instanceof HttpServletRequest) {
            final HttpServletRequest request = (HttpServletRequest) req;
            final HttpServletResponse response = (HttpServletResponse) res;
            final String acceptEncoding = request.getHeader("accept-encoding");
            if (acceptEncoding != null && acceptEncoding.indexOf(GZIP) != -1) {
                final GZIPResponseWrapper wrappedResponse = new GZIPResponseWrapper(response);
                chain.doFilter(req, wrappedResponse);
                wrappedResponse.finishResponse();

                return;
            }

            chain.doFilter(req, res);
        }
    }

    @Override
    public void init(final FilterConfig filterConfig) {
        // noop
    }

    @Override
    public void destroy() {
        // noop
    }
}

/**
 * Stream that wraps original output stream of the response and knows how to write GZIP.
 *
 * @author Jayson Falkner
 * @author Valery Tydykov
 *
 */
class GZIPResponseStream extends ServletOutputStream {
    /**
     * Stream to be used by gzipStream.
     */
    protected ByteArrayOutputStream byteArrayStream;

    /**
     * Stream that writes GZIP.
     */
    protected GZIPOutputStream gzipStream;

    /**
     * True if this stream is closed.
     */
    protected boolean isClosed;

    /**
     * Response to which GZIP should be written to.
     */
    protected HttpServletResponse response;

    /**
     *
     * Constructor specifying response to which GZIP should be written to.
     *
     * @param response response to which GZIP should be written to.
     * @throws IOException If GZIPOutputStream throws IOException, or response.getOutputStream()
     *             throws IOException.
     */
    public GZIPResponseStream(final HttpServletResponse response) throws IOException {
        super();

        this.isClosed = false;
        this.response = response;
        this.byteArrayStream = new ByteArrayOutputStream();
        this.gzipStream = new GZIPOutputStream(this.byteArrayStream);
    }

    @Override
    public void close() throws IOException {
        if (this.isClosed) {
            throw new IOException("This output stream has already been closed");
        }

        this.gzipStream.finish();

        final byte[] bytes = this.byteArrayStream.toByteArray();

        this.response.addHeader("Content-Length", Integer.toString(bytes.length));
        this.response.addHeader("Content-Encoding", GzipFilter.GZIP);

        final ServletOutputStream output = this.response.getOutputStream();
        output.write(bytes);
        output.flush();
        output.close();

        this.isClosed = true;
    }

    @Override
    public void flush() throws IOException {
        if (this.isClosed) {
            throw new IOException("Cannot flush a closed output stream");
        }

        this.gzipStream.flush();
    }

    @Override
    public void write(final int bte) throws IOException {
        if (this.isClosed) {
            throw new IOException();
        }

        this.gzipStream.write((byte) bte);
    }

    @Override
    public void write(final byte[] bte) throws IOException {
        write(bte, 0, bte.length);
    }

    @Override
    public void write(final byte[] bte, final int off, final int len) throws IOException {
        if (this.isClosed) {
            throw new IOException("Cannot write to a closed output stream");
        }

        this.gzipStream.write(bte, off, len);
    }

    /**
     *
     * Returns true if this stream is closed.
     *
     * @return true if this stream is closed.
     */
    public boolean closed() {
        return this.isClosed;
    }
}

/**
 * Wrapper for response that knows how to write GZIP into response.
 *
 * @author Jayson Falkner.
 *
 */
class GZIPResponseWrapper extends HttpServletResponseWrapper {
    /**
     * Original response to be wrapped.
     */
    protected HttpServletResponse originalResponse;

    /**
     * Stream to be used by writer.
     */
    protected ServletOutputStream stream;

    /**
     * Writer to perform actual work.
     */
    protected PrintWriter writer;

    /**
     *
     * Constructor specifying response.
     *
     * @param response HttpServletResponse.
     */
    public GZIPResponseWrapper(final HttpServletResponse response) {
        super(response);

        this.originalResponse = response;
    }

    /**
     * Creates stream that can write GZIP into response.
     *
     * @return Created GZIPResponseStream.
     * @throws IOException If GZIPResponseStream throws IOException.
     */
    public ServletOutputStream createOutputStream() throws IOException {
        return new GZIPResponseStream(this.originalResponse);
    }

    /**
     * Finishes response: closes writer and stream.
     *
     * @throws IOException If close method of writer or stream throws IOException.
     */
    void finishResponse() throws IOException {
        if (this.writer == null) {
            if (this.stream != null) {
                this.stream.close();
            }
        } else {
            this.writer.close();
        }
    }

    @Override
    public void flushBuffer() throws IOException {
        // noop
    }

    @Override
    public ServletOutputStream getOutputStream() throws IOException {
        if (this.writer != null) {
            throw new IllegalStateException("getWriter() has already been called!");
        }

        if (this.stream == null) {
            this.stream = createOutputStream();
        }

        return this.stream;
    }

    @Override
    public PrintWriter getWriter() throws IOException {
        if (this.writer == null) {
            if (this.stream != null) {
                throw new IllegalStateException("getOutputStream() has already been called!");
            }

            this.stream = createOutputStream();
            this.writer = new PrintWriter(new OutputStreamWriter(this.stream, "UTF-8"));
        }

        return this.writer;
    }

    @Override
    public void setContentLength(final int length) {
        // noop
    }
}
