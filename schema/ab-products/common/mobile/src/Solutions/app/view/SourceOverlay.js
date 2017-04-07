/**
 * This is used to display the source code for any given example. Each example has a 'Source' button
 * on its top toolbar that activates this
 * Taken from the Sencha Kitchensink example.
 */
Ext.define('Solutions.view.SourceOverlay', {
    extend: 'Ext.Panel',
    xtype: 'sourceoverlay',
    config: {
        cls: 'ux-code',
        modal: true,
        styleHtmlContent: true,
        hideOnMaskTap: true,
        top: '10%',
        left: Ext.filterPlatform('ie10') ? 0 : '10%',
        right: Ext.filterPlatform('ie10') ? 0 : '10%',
        bottom: '10%',
        scrollable: true,
        items: [
            {
                xtype: 'titlebar',
                title: 'Source',
                docked: 'top',
                ui: 'neutral'
            }
        ]
    },

    applyHtml: function (html) {
        var v,
            fmt,
            between,
            highlight;

        this.matches = [];

        v = html;
        fmt = '<span class="ux-code-{0}">{1}</span>';

        between = Ext.Function.bind(function (idx, length) {
            var i, m, s, e;
            for (i = 0; i < this.matches.length; i++) {
                m = this.matches[i];
                s = m[0];
                e = m[1];
                if ((s <= idx && idx < e) || (s < (idx + length) && (idx + length) <= e)) {
                    return true;
                }
            }
            return false;
        }, this);

        highlight = Ext.Function.bind(function (str, regex, cls, fn) {
            var match,
                mdata,
                midx,
                mstr,
                replacement,
                diff,i,m;

            regex.compile(regex);

            while (match = regex.exec(str)) {
                mdata = fn ? fn(match) : [match.index, match[0]];
                midx = mdata[0];
                mstr = mdata[1];
                if (!between(midx, mstr.length)) {
                    replacement = Ext.util.Format.format(fmt, cls, mstr);
                    diff = (replacement.length - mstr.length);
                    str = str.slice(0, midx) + replacement + str.slice(midx + mstr.length);
                    regex.lastIndex = midx + replacement.length;
                    for (i = 0; i < this.matches.length; i++) {
                        m = this.matches[i];
                        if (m[1] < midx) continue;

                        m[0] += diff;
                        m[1] += diff;
                    }
                    this.matches.push([midx, regex.lastIndex]);
                }
                else {
                    break;
                }
            }
            return str;
        }, this);

        // Escape HTML...whatever

        // var htmlRE = /<((.|\w)*)>/ig, match;
        // while (match = htmlRE.exec(v)) {
        // v = v.slice(0, match.index) + Ext.util.Format.format('&lt;{0}&gt;', match[1]) + v.slice(match.index + match[0].length);
        // }

        v = v.replace(/</g, '&lt;');
        v = v.replace(/</g, '&gt;');

        // Block comments
        v = highlight(v, /\/\*(.|\s)*?\*\//ig, 'comment');

        // String literals
        v = highlight(v, (/("|')[^\1\n\r]*?\1/ig), 'string');

        // Line comments
        v = highlight(v, /\/\/[^\n\r]*/ig, 'comment');

        // Function names
        v = highlight(v, /(\w+)\s*\:\s*function/ig, 'function', function (match) {
            return [match.index, match[1]];
        });

        v = highlight(v, /function (\w+)/ig, 'function', function (match) {
            return [match.index + 9, match[1]];
        });

        // Keywords
        v = highlight(v, /\b(this|function|null|return|true|false|new|int|float|break|const|continue|delete|do|while|for|in|switch|case|throw|try|catch|typeof|instanceof|var|void|with|yield|if|else)\b/ig, 'keyword');

        // Operators
        v = highlight(v, /\.|\,|\:|\;|\=|\+|\-|\&|\%|\*|\/|\!|\?|\<|\>|\||\^|\~/ig, 'operator');

        return '<pre>' + v + '</pre>';
    },

    initialize: function() {
        var me = this,
            titleBar = me.down('titlebar');

        if(Ext.os.is.Phone) {
            me.setHeight('100%');
            me.setWidth('100%');
            me.setTop(0);
            me.setBottom(0);
            me.setLeft(0);
            me.setRight(0);
            titleBar.add({
                xtype: 'button',
                align: 'right',
                text: 'Done',
                action: 'sourceDone'
            });
        }
    }
});
