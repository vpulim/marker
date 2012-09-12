(function($) {

    var re = {
        h1: /^# /,
        h2: /^## /,
        h3: /^### /,
        ol: /^\- /,
    }

    function positionInNode(node, range, state) {
        var pos = 0,
            children = node.childNodes;
        state = state || {};
        for (var i=0, child; child = children[i]; i++) {
            if (child == range.startContainer) {
                pos += range.startOffset; 
                state.found = true;
                break;
            }
            else if (child.nodeType === Node.TEXT_NODE) {
                pos += child.nodeValue.length;
            }
            else if (child.nodeType === Node.ELEMENT_NODE) {
                pos += positionInNode(child, range, state);
                if (state.found) break;
            }
        }
        return pos;
    }

    function rangeForPosition(node, position, state) {
        var children = node.childNodes;
        if (!children) return;
        state = state || { position: position };
        for (var i=0, child; child = children[i]; i++) {
            if (child.nodeType === Node.TEXT_NODE) {
                var length = child.nodeValue.length;
                if (length >= state.position) {
                    var range = document.createRange();
                    range.setStart(child, state.position);
                    range.setEnd(child, state.position);
                    return range;
                }
                state.position -= length;
            }
            else if (child.nodeType === Node.ELEMENT_NODE) {
                var range = rangeForPosition(child, position, state);
                if (range) return range;
            }
        }
        return;        
    }

    function containerParagraph(node) {
        while (node && node.nodeName !== 'P') node = node.parentNode;
        return node;
    }
    
    function getCursor() {
        var range = document.getSelection().getRangeAt(0),
            paragraph = containerParagraph(range.startContainer),
            position = positionInNode(paragraph, range);
        return {
            paragraph: paragraph,
            position: position
        }
    }

    function formatCurrentParagraph() {
        var selection = window.getSelection();

        if (!selection.isCollapsed) return;

        var cursor = getCursor(),
            position = cursor.position,
            p = cursor.paragraph,
            $p = $(p),
            text = $p.text();
        $p.removeAttr('class');
        text = $('<div>').text(text).html()
        _.each(re, function(regex, clas) {
            if (regex.exec(text)) {
                $p.addClass(clas)
            }
        })
        if (text.match(/\*\*([^\*]+?)\*\*/)) {
            text = text.replace(/\*\*([^\*]+?)\*\*/g, '**<strong>$1</strong>**')
        }
        else {
            text = text.replace(/\*([^\*]+?)\*/g, '*<em>$1</em>*')
        }
        if (!text) text = '<br>'
        $p.html(text);
        var range = rangeForPosition(p, position);
        if (!range) {
            range = document.createRange(); 
            range.setStart(p, 0);
            range.setEnd(p, 0);            
        }
        selection.removeAllRanges();
        selection.addRange(range);
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

        $this.on('keypress', function(e) {
            formatCurrentParagraph();
        });
    };

})(jQuery);
