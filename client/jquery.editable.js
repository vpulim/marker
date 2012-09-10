(function($) {

    var re = {
        strong: /^# /
    }

    function containerParagraph(node) {
        while (node && node.nodeName !== 'P') node = node.parentNode;
        return node;
    }
    
    function cursorParagraph() {
        var range = document.getSelection().getRangeAt(0);
        return containerParagraph(range.startContainer);
    }

    function formatCurrentParagraph() {
        var p = cursorParagraph(),
            $p = $(p),
            text = $p.text();
        $p.removeAttr('class');
        if (re.strong.exec(text)) {
            $p.addClass('h1')
            console.log($p);
        }
        $p.html(text);
    }

    function doPaste(data) {
        var range = document.getSelection().getRangeAt(0),
            start = containerParagraph(range.startContainer),
            end = containerParagraph(range.endContainer),
            deleted = [],
            curr;

        if (start && end) {
            while (start !== end) {
                deleted.push(end);
                end = end.previousSibling;
            }

            _.each(deleted, function(node) {
                console.log('deleted:', $(node).html());
            })            
        }

        document.execCommand("inserthtml", false, data);
    }

    $.fn.editable = function() {
        var $this = $(this);

        $this.attr('contenteditable', true);

        $this.on('paste', function(e) {
            doPaste(e.originalEvent.clipboardData.getData('Text'));
            formatCurrentParagraph();
            e.preventDefault();
        });

        $this.on('keyup', function(e) {
            formatCurrentParagraph();
        });
    };

})(jQuery);
