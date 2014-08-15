var Youtube =
{
    init: function(editor) {
        this.opts = {player_width: editor.settings.youtube_width ? editor.settings.youtube_width : 425, player_height: editor.settings.youtube_height ? editor.settings.youtube_height : 344};
        this.editor = editor;
        var node = editor.selection.getNode();
        if( Youtube.isYoutubeVideo(node, editor.dom) )
            jQuery("#url").val("http://www.youtube.com/watch?v=" + node.title);
    },

    update: function() {
        var editor = top.content.tinymce.activeEditor, form = document.forms[0], url = jQuery("#url").val();
        if( !url ) {
            alert("You need to supply the URL of a video to embed.");
            return;
        }

        var id = Youtube.getVideoId(url);
        if( !id )
        {
            return alert("The URL you supplied is missing Youtube's video identification information. Please double check that you have pasted in the correct video URL.");
        }

        var html = "<img " +
            "src='" + this.editor.windowManager.getParams().plugin_url + "/img/youtube-player.png' " +
            "title='" + id + "' " +
            "width='" + this.opts.player_width + "' " +
            "height='" + this.opts.player_height + "' " +
            "></img>";
            
        insertRawHtml(editor, html);
        top.content.tinymce.activeEditor.windowManager.close();
    },

    getVideoId: function(url) {
        // The actual video URL
        if( startsWith(url, "http://www.youtube.com/") || startsWith(url, "https://www.youtube.com/")) {
            var questionMark = url.indexOf("?");
            if( questionMark > 0 ) {
                var queryString = url.substring(questionMark + 1), id = "";
                each(queryString.split("&"), function(param) {
                    var value = param.split("=");
                    if( value[0] == "v" )
                        id = value[1];
                });
                return id;
            }
        }
        // The embedding code
        else if( startsWith(url, "<object") ) {
            return url.replace(/(.*\/v\/)([a-zA-Z0-9]+)(&.*)/g, "$2");
        }
        // You just entered in the video ID
        else if( url.match(/^[a-zA-Z0-9]+$/)) {
            return url;
        }
    },

    isYoutubeVideo: function(n) {
        return n && (n.nodeName == 'IMG') && (n.src.indexOf("img/youtube-player.png") != -1);
    }
};

function startsWith(s, substring) {
    return s.indexOf(substring) == 0;
}

Youtube.init(top.content.tinymce.activeEditor);
