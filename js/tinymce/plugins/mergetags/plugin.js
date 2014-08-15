/**
 * Merge Tag Plugin
 * @author Ian Thomas
 * @copyright Copyright © 2014, eTapestry, All Rights Reserved
 */
tinymce.PluginManager.requireLangPack("mergetags", "en");
tinymce.PluginManager.add('mergetags', function(editor, url) {
      //Create some functions we need within the plugin
        function isMergeTagElement(n) {
            {
                if( (n.nodeName == 'A') && (n.id == "etapDataTag" || n.className == "etapDataTag") )
                    return n;

                n = n.parentNode;
            }
            return null;
        }
        
        function handleUneditableTags() {
            jQuery(editor.getBody()).find("a.etapDataTag").wrap("<span class='junkSpanWrap'></span>");
            jQuery(editor.getBody()).find("a.etapDataTag").attr("data-mce-contenteditable", "false");
        }
        
        // A copy of that in etap.js
        function decodeField(fieldStr)
        {
            var field = {category:"", field:"", name:"", aggregate:"0", formatter:"", defaultValue:""};
            var attrs = fieldStr.split("|");
            for( var i = 0; i < attrs.length; i++ )
            {
                var attr = attrs[i].split("=");
                field[attr[0]] = attr[1];
            }
            return field;
        }
      
        //Create the plugin itself
        var me = this;
        me.url = url;

        // Register commands
        editor.addCommand('mceMergeTag', function() {
          editor.windowManager.open({url:url + '/merge.htm', width:500, height:310, inline:0, title: "Merge Tags"}, {plugin_url:url});
        });

        // Register buttons
        editor.addButton('mergetags', {
          title: tinymce.translate('mergetags_desc'),
          image: url + '/img/button.gif',
          onclick: function() { editor.execCommand("mceMergeTag"); },
          onPostRender: function() {
              var ctrl = this;
              editor.on('mouseup', function(e) {
                  ctrl.active(isMergeTagElement(e.target));
              });
          }
        });
        
        editor.addMenuItem('mergetags', {
            image: url + '/img/button.gif',
            text: tinymce.translate("mergetags_desc"),
            onclick: function() { editor.execCommand("mceMergeTag"); },
            context: 'mergetags'
        });

        // When we initialize the editor, do these things specific to the plugin
        editor.on("init", function() {
            // load styles for data tag placeholders
            editor.dom.loadCSS(url + "/css/content.css");
        });
        
        if(tinymce.isWebKit || tinymce.isGecko)
        {
            editor.on("SetContent", handleUneditableTags);
        }
          
        // Make sure any styling buried in the merge tag is bubbled outside of it
        editor.on("change", function(e) {
            var node = e.target;
            if( node = isMergeTagElement(node) )  // in case it's in a parent node
            {
                $A(node.childNodes).each(function(inside) {
                    if( inside.tagName )
                    {
                        // Apply any style formatting directly on the merge element
                        if( inside.style.fontSize ) node.style.fontSize = inside.style.fontSize;
                        if( inside.style.fontFamily ) node.style.fontFamily = inside.style.fontFamily;
                        if( inside.style.color ) node.style.color = inside.style.color;

                        // Embed the most recent font size class into the node
                        var sizes = (inside.className || "x").match("pt[0-9]+", "g");
                        if( sizes && sizes.length > 0 )
                        {
                            var existingSizes = (node.className || "x").match("pt[0-9]+", "g");
                            for( var i = 0; existingSizes && i < existingSizes.length; i++ )
                                editor.dom.removeClass(node, existingSizes[i]);

                            editor.dom.addClass(node, sizes[sizes.length-1]);
                        }
                        
                        var copy = inside.cloneNode(false);
                        copy = node.parentNode.insertBefore(copy, node);
                        copy.appendChild(node);
                    }
                    // Make sure only thing inside the link is the name
                    node.innerHTML = decodeField(node.title).name;
                });
            }
        });

            // open if you double click on a node
        editor.on("dblClick", function(e) {
            if( isMergeTagElement(e.target))
            {
                editor.selection.select(e.target);
                editor.windowManager.open({url:url + '/merge.htm', width:500, height:310, inline:0, title: "Merge Tags"}, {plugin_url:url});
            }
                
        });
    
  });
