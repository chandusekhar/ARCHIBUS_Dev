<?xml version="1.0" encoding="UTF-8"?>
<!-- processing sever-side error message in a separate window -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="ErrorMessage">
	<xsl:param name="afmTableGroup"/>
		<xsl:variable name="message_original" select="$afmTableGroup/dataSource/*/*/*/@*[name()='message']"/>
		<xsl:variable name="originalException_original" select="$afmTableGroup/dataSource/*/*/*/@*[name()='originalException']"/>
		<xsl:variable name="stackTrace" select="$afmTableGroup/dataSource/*/*/*/@*[name()='stackTrace']"/>
		<xsl:variable name="stackTraceAllowed" select="$afmTableGroup/dataSource/*/*/*/@*[name()='stackTraceAllowed']"/>
		<xsl:variable name="show_detail_button" select="//message[@name='show_detail_button']"/>
		<xsl:variable name="original_exception_original" select="//message[@name='original_exception']"/>
		<xsl:variable name="stack_trace_original" select="//message[@name='stack_trace']"/>
		<xsl:variable name="close_window" select="//message[@name='close_window']"/>
		<xsl:variable name="error_window_title" select="//message[@name='error_window_title']"/>
		<!-- removing new line characters -->
		<xsl:variable name="message" select="translate($message_original,'&#x0D;&#x0A;','')"/>
		<xsl:variable name="originalException" select="translate($originalException_original,'&#x0D;&#x0A;','')"/>
		<xsl:variable name="original_exception" select="translate($original_exception_original,'&#x0D;&#x0A;','')"/>
		<xsl:variable name="stack_trace" select="translate($stack_trace_original,'&#x0D;&#x0A;','')"/>
		<!-- store formatted and long string: stackTrace -->
		<!-- cannot pass a formatted long string such as stackTrace to javascript function as parameter -->
		<form name="error_message">
			<input type="hidden" name="error_message_stackTrace" value="{$stackTrace}"/>
			<input type="hidden" name="error_message_originalException" value="{$originalException}"/>
			<input type="hidden" name="error_message_stackTraceAllowed" value="{$stackTraceAllowed}"/>
		</form>
		<!-- opening a separate browser window to show the error messages -->
		<!-- variable abSchemaSystemJavascriptFolder is defined in constants.xsl -->
		<!--  calling javascript function OpenErrorMessageWindow(form_name, originalException_input_name, stackTrace_input_name, message,abSchemaSystemJavascriptFolder,previousPage) after error_message form-->
		<script language="JavaScript">
			if(opener!=null)
			{
				if(opener.loadingPdfGeneratingView!=null)
					opener.loadingPdfGeneratingView = false;
			}
			<!-- kb# 3010821 -->
			var errorMsg = "<xsl:value-of select='$message'/>";
			errorMsg = errorMsg.replace(/\"/g, '&quot;');
			OpenErrorMessageWindow("<xsl:value-of select='$error_window_title'/>","<xsl:value-of select='$show_detail_button'/>","<xsl:value-of select='$original_exception'/>","<xsl:value-of select='$stack_trace'/>","<xsl:value-of select='$close_window'/>","error_message", "error_message_originalException", "error_message_stackTrace", "error_message_stackTraceAllowed", errorMsg,"<xsl:value-of select='$abSchemaSystemJavascriptFolder'/>","<xsl:value-of select='$afmTableGroup/@previousPage'/>","<xsl:value-of select='//title'/>");
		</script>
	</xsl:template>
</xsl:stylesheet>


