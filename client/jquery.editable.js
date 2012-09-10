(function($) {
	
	$.fn.editable = function() {
		var $this = $(this);

        $this.attr('contenteditable', true);

		$this.on('paste', function(e) {
			var data = e.originalEvent.clipboardData.getData('Text');
			console.log('PASTED:', data);
			e.preventDefault();
		});
    };

})(jQuery);