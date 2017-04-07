<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="yes" />

    <xsl:variable name="SchemaFolder" select="//preferences/@abSchemaSystemFolder"/>
    <xsl:variable name="GraphicsFolder" select="//preferences/@abSchemaSystemGraphicsFolder"/>
    <xsl:variable name="HelpFolder" select="//preferences/@abSchemaSystemHelpFolder"/>
    <xsl:variable name="JavascriptFolder" select="//preferences/@abSchemaSystemJavascriptFolder"/>
    <xsl:variable name="administratorEMail" select="//preferences/mail/addresses/address[@name='administratorEMail']/@value"/>
    <xsl:variable name="DateFormat" select="//preferences/formatting/dateFormat/@format"/>
    <xsl:variable name="projectFolder" select="//preferences/@projectFolder"/>
    <xsl:variable name="projectGraphicsFolder" select="//preferences/@projectGraphicsFolder"/>
    <xsl:variable name="projectDrawingsFolder" select="//preferences/@projectDrawingsFolder"/>

    <xsl:include href="../../../ab-system/xsl/constants.xsl" />

    <xsl:template match="/">
	<html>

	    <!-- LinkingCSS in common.xsl includes the default style sheets -->
	    <xsl:call-template name="LinkingCSS" />
	    <body class="body">
	        <table class="topTitleBarTable">
		    <tr><td class="topTitleBarTableTitle">
		        <xsl:value-of select="/*/title" />
			<xsl:value-of select="$whiteSpace" />
		    </td></tr>
		</table>

		<!-- Application preferences from afm-config.xml file-->
		<h3><span translatable="false" style="padding-left:2">Application Preferences</span></h3>
		<table>
		    <tr>
		        <td align="right">
		            <img alt="Group Image" src="{$GraphicsFolder}/ab-activity-dflt-it.gif"/>
			</td>
		    </tr>
		    <tr>
		        <td align="right">
			    <b><span translatable="false" style="padding-left:2">Schema Folder </span></b>
			</td>
			<td align="left">
			    <xsl:value-of select="$SchemaFolder"/>
			</td>
		    </tr>
		    <tr>
		        <td align="right">
			    <b><span translatable="false" style="padding-left:2">Graphics Folder </span></b>
			</td>
			<td align="left">
			    <xsl:value-of select="$GraphicsFolder"/>
			</td>
		    </tr>
		    <tr>
		        <td align="right">
			    <b><span translatable="false" style="padding-left:2">System Help Folder </span></b>
			</td>
			<td align="left">
			    <xsl:value-of select="$HelpFolder"/>
			</td>
		    </tr>
		    <tr>
		        <td align="right">
			    <b><span translatable="false" style="padding-left:2">Javascript Folder </span></b>
			</td>
			<td align="left">
			    <xsl:value-of select="$JavascriptFolder"/>
			</td>
		    </tr>
		    <tr>
		        <td align="right">
			    <b><span translatable="false" style="padding-left:2">Administrator's EMail </span></b>
			</td>
			<td align="left">
			    <xsl:value-of select="$administratorEMail"/>
			</td>
		    </tr>
		    <tr>
		        <td align="right">
			    <b><span translatable="false" style="padding-left:2">Date Format </span></b>
			</td>
			<td align="left">
			    <xsl:value-of select="$DateFormat"/>
			</td>
		    </tr>
		</table>

		<!-- Project preferences from project ini file-->
		<h3><span translatable="false" style="padding-left:2">Project Preferences </span></h3>
		<table>
		    <tr>
		        <td align="right">
			    <b><span translatable="false" style="padding-left:2">Project Folder </span></b>
			</td>
			<td align="left">
			    <xsl:value-of select="$projectFolder"/>
			</td>
		    </tr>
		    <tr>
		        <td align="right">
			    <b><span translatable="false" style="padding-left:2">Project Graphics Folder </span></b>
			</td>
			<td align="left">
			    <xsl:value-of select="$projectGraphicsFolder"/>
			</td>
		    </tr>
		    <tr>
		        <td align="right">
			    <b><span translatable="false" style="padding-left:2">Project Drawings Folder </span></b>
			</td>
			<td align="left">
			    <xsl:value-of select="$projectDrawingsFolder"/>
			</td>
		    </tr>
		</table>
	    </body>
	</html>
    </xsl:template>
    <xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>

