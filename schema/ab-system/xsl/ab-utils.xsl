<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template name="replaceString"> 
    <xsl:param name="textStr"/>
    <xsl:param name="findStr"/>
    <xsl:param name="replaceStr"/>
    <xsl:choose> 
      <xsl:when test="contains($textStr, $findStr)"> 
        <xsl:value-of select="substring-before($textStr, $findStr)"/>
        <xsl:value-of select="$replaceStr"/>
				<xsl:call-template name="replaceString"> 
          <xsl:with-param name="textStr" select="substring-after($textStr, $findStr)"/>
    		  <xsl:with-param name="findStr" select="$findStr"/>
          <xsl:with-param name="replaceStr" select="$replaceStr"/>
				</xsl:call-template> 
      </xsl:when> 
      <xsl:otherwise> 
        <xsl:value-of select="$textStr"/> 
      </xsl:otherwise> 
    </xsl:choose> 
  </xsl:template> 

</xsl:stylesheet>
