<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
     <xsl:variable name="GraphicsFolder" select="//preferences/@abSchemaSystemGraphicsFolder"/>
     <xsl:variable name="administratorEMail" select="//preferences/mail/addresses/address[@name='administratorEMail']/@value"/>
     <xsl:include href="../../../xsl/constants.xsl" />

     <xsl:template match="/">
          <html>
		<span  name="relativeFileDirectory" value="#Attribute%//@relativeFileDirectory%"/>
		<span name="relativeActivityPath" value="#Attribute%//@relativeActivityPath%"/>
		<span name="absoluteFileDirectory" value="#Attribute%//@absoluteFileDirectory%"/>
		<span name="testLocalizedString" translatable="true">Testing XSLT localization-1</span>
	    
	     	<script language="javascript" src="#Attribute%//@relativeFileDirectory%/dummy.js">
		    <xsl:value-of select="$whiteSpace" />
	       </script>
		<xsl:call-template name="LinkingCSS" />
		<body class="body">
			<table class="topTitleBarTable">
			    <tr>
				 <td class="topTitleBarTableTitle">
				      <xsl:value-of select="//message[@name='headline']" />
				      <xsl:value-of select="$whiteSpace" />
				 </td>
			       </tr>
			</table>

		</body>
	</html>
    </xsl:template>

     <xsl:include href="../../../xsl/common.xsl" />
</xsl:stylesheet>
