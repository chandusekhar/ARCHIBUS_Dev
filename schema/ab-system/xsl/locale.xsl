<?xml version="1.0" encoding="UTF-8"?>
<!-- which is used to set javascript locale API-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">		
	<!-- template: set up all necessary javascript locale variables -->
	<xsl:template name="SetUpLocales">
		<script language="JavaScript">
			<!-- javascript functions are in locale.js -->
			<xsl:for-each select="//preferences/locale/@*">
				SetLocaleCommonJSVariables('<xsl:value-of select="name()"/>','<xsl:value-of select="."/>');
			</xsl:for-each>
			<xsl:for-each select="//preferences/locale/dateFormat/@*">
				SetLocaleDateJSVariables("<xsl:value-of select="name()"/>","<xsl:value-of select="."/>");
			</xsl:for-each>
			<xsl:for-each select="//preferences/locale/timeFormat/@*">
				SetLocaleTimeJSVariables("<xsl:value-of select="name()"/>","<xsl:value-of select="."/>");
			</xsl:for-each>
		</script>
	</xsl:template>
</xsl:stylesheet>


