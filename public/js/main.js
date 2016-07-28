$(function($){
	$('#category .list-group-item').dblclick(function(e){
		if(!$(this).attr('edit')){
			var text = $(this).find('span').text();
			var $node= $(this).find('.form-group');
			$node.find('input').val(text);
			$(this).find('span').hide();
			$node.show();
			$node.find('input').focus();
		}
	})
	$('#category .list-group-item input').focusout(function(){
		var text = $(this).val();
		var $span = $(this).parents('.list-group-item').find('span');
		$(this).parent().hide();
		$span.text(text);
		$span.show();
	});

	 $('#search').typeahead({
	    	source: function (query, process) {
		          $.get('/admin/category',function(arr){
		              process(arr);
		          });
   		 }
	});

})


