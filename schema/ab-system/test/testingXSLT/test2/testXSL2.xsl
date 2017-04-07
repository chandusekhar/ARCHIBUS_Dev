<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<xsl:template match="/">
		<span  name="id_relativeFileDirectory" value="#Attribute%//@relativeFileDirectory%"/>
		<span name="id_relativeActivityPath" value="#Attribute%//@relativeActivityPath%"/>
		<span name="id_absoluteFileDirectory" value="#Attribute%//@absoluteFileDirectory%"/>
		<span name="testLocalizedString" translatable="true">Testing XSLT localization</span>
	</xsl:template>
</xsl:stylesheet>