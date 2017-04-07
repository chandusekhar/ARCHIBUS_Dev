<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2006-02-16 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<xsl:template name="panel_console">
		<xsl:param name="panel"/>
		<xsl:param name="panel_id"/>
 		<xsl:param name="afmTableGroup"/>
        <xsl:param name="tabIndex"/>
		<xsl:call-template name="panel_form">
			<xsl:with-param name="panel" select="$panel"/>
			<xsl:with-param name="panel_id" select="$panel_id"/>
			<xsl:with-param name="type" select="'console'"/>
            <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
			<xsl:with-param name="tabIndex" select="$tabIndex"/>
			<xsl:with-param name="isConsole" select="'true'"/>
		 </xsl:call-template>
		 <script>
			<xsl:variable name="restriction_title" select="/afmXmlView/actionIn/restrictions/restriction[@type='parsed']/title"/>
			console_form_restriction_title = "<xsl:value-of select='$restriction_title'/>";				
		 </script>
	</xsl:template>
</xsl:stylesheet>