<?xml version="1.0"?>
<!-- this xslt is contained in almost all other xslt files-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:variable name="afmHiddenForm" select="'afmHiddenForm'"/>
	<xsl:variable name="xml"  select="'xml'"/>
	<xsl:variable name="afmInputsForm" select="'afmInputsForm'"/>
	<xsl:variable name="whiteSpace">
		<xsl:text> </xsl:text>
	</xsl:variable>
	<!-- all linked css, javascript files and image files in html must use schemaPath to refer to -->
	<!-- schema -->
	<xsl:variable name="schemaPath" select="//preferences/@relativeSchemaPath"/>
	<xsl:variable name="absoluteAppPath" select="//preferences/@absoluteAppPath"/>
	<!-- ab-system -->
	<xsl:variable name="abSchemaSystemFolder" select="//preferences/@abSchemaSystemFolder"/>
	<xsl:variable name="abSchemaSystemGraphicsFolder" select="//preferences/@abSchemaSystemGraphicsFolder"/>
	<xsl:variable name="abSchemaSystemHelpFolder" select="//preferences/@abSchemaSystemHelpFolder"/>
	<xsl:variable name="abSchemaSystemJavascriptFolder" select="//preferences/@abSchemaSystemJavascriptFolder"/>
	<xsl:variable name="abSchemaSystemCSSFolder" select="//preferences/@abSchemaSystemCSSFolder"/>
	<!-- user's selecting project -->
	<xsl:variable name="projectFolder" select="//preferences/@projectFolder"/>
	<xsl:variable name="projectGraphicsFolder" select="//preferences/@projectGraphicsFolder"/>
	<xsl:variable name="projectDrawingsFolder" select="//preferences/@projectDrawingsFolder"/>
	<!--  abCascadingStyleSheetFile == CCS -->
	<xsl:variable name="abCascadingStyleSheetFile">
		<xsl:choose>
			<xsl:when test="//preferences/@clr_scheme">
				<!-- don't use variable here, otherwise trouble(a bug???) -->
				<!--xsl:variable name="clr_scheme" select="//preferences/@clr_scheme"/-->
				<!-- set up css files -->
				<xsl:if test="//preferences/@clr_scheme='SLATE'">abcascadingstylesheet-slate.css</xsl:if>
				<xsl:if test="//preferences/@clr_scheme='OCHRE'">abcascadingstylesheet-ochre.css</xsl:if>
				<xsl:if test="//preferences/@clr_scheme='IMPACT'">abcascadingstylesheet-impact.css</xsl:if>
				<xsl:if test="//preferences/@clr_scheme='SLATE-LARGE'">abcascadingstylesheet-slate-large-font.css</xsl:if>
				<xsl:if test="//preferences/@clr_scheme=''">
					<xsl:value-of select="//preferences/formatting/css/@file"/>
				</xsl:if>
				<!--xsl:if test="$clr_scheme='SLATE'">abcascadingstylesheet-slate.css</xsl:if>
				<xsl:if test="$clr_scheme='SLATE'">abcascadingstylesheet-slate.css</xsl:if-->
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="//preferences/formatting/css/@file"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="panel_form_label_default_position" select="'left'"/>
	<xsl:decimal-format name="AFM_Format" grouping-separator="," decimal-separator="." minus-sign="-"/>
</xsl:stylesheet>


