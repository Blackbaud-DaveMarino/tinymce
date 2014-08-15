/**
 * Plugin for adding youtube videos through tinyMCE
 */
tinymce.PluginManager.add('youtube', function(editor, url) {
    //Create some functions we need within the plugin
    function isYoutubeVideo(n) {
        var isyt = n && (n.nodeName === 'IMG') && (n.src.indexOf("img/youtube-player.png") != -1);
        return isyt;
    }

    function isYoutubeVideoObject(n) {
        return n && (n.nodeName === "IFRAME") && (n.className === "embeddedyoutube");
    }

    function each(array, fn) {
        for( var i = 0; i < array.length; i++ )
            fn(array[i], i);
    }
    
    var me = this;
    me.url = url;
    me.opts = {player_width: editor.settings.youtube_width ? editor.settings.youtube_width : 425,
               player_height: editor.settings.youtube_height ? editor.settings.youtube_height : 344,
               player_transparent: editor.settings.youtube_transparent};

    function openWindow() {
      editor.windowManager.open({ url:url + '/youtube.htm', width:425, height:315, inline:1, title: "YouTube"}, {plugin_url:url});
    };

    // Register commands
    editor.addCommand('mceYoutube', openWindow);

    // Register buttons
    editor.addButton('youtube', {
        title : 'Insert Youtube Video', 
        onclick : function() { editor.execCommand("mceYoutube"); }, 
        image : url + '/img/youtube.png',
        onPostRender: function() {
            var ctrl = this;
            editor.on('NodeChange', function(e) {
                ctrl.active(isYoutubeVideo(e.element));
            });
        }
    });
    
    editor.addMenuItem('youtube', {
        image: url + '/img/youtube.png',
        text: 'Insert Youtube Video',
        onclick: function() { editor.execCommand("mceYoutube"); },
        context: 'youtube'
    });

    // open if you double click on a node
    editor.on("dblClick", function(e) {
        if( isYoutubeVideo(e.target) )
            openWindow();
    });

    // When loading the editor contents, turn the OBJECT nodes into the equivalent IMG placeholder
    editor.on("BeforeSetContent", function(e) {
      
      var content = jQuery("<div>" + e.content + "</div>"); //Process our content into a jquery object
      content.find("iframe").each(function(i) {
            if( isYoutubeVideoObject(this) ) {
                var html = "<img title=\"" + this.id + "\" src=\"" + me.url + "/img/youtube-player.png\" \"style=\"width: " +  me.opts.player_width + "px; height: " + me.opts.player_height + "px;\" />";
                jQuery(this).replaceWith(html);
                e.content = content.html();
            }
        });
    });

    // When converting the editor contents into the final HTML, convert the IMG placeholder into the *actual* video embedding code
    editor.on("PreProcess", function(e) {
      jQuery(e.node).find("img").each(function(i) {
        if( isYoutubeVideo(this))
        {
            var html = "<iframe class=\"embeddedyoutube\" type=\"text/html\" id=\"" + this.title + "\" width=\"" + me.opts.player_width  + "\" height=\"" + me.opts.player_height + "\" src=\"https://www.youtube.com/embed/" + this.title + "\" frameborder=\"0\"/>";
            jQuery(this).replaceWith(html);
        }
      });                
    });
});
