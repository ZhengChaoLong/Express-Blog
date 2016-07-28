$(function($){
	$('#category .list-group-item .edit').click(function(e){
		if(!$(this).data('edit')){
			e.preventDefault();
			var text = $(this).siblings('span').text();
			var $node= $(this).siblings('.form-group');
			$node.find('input').val(text);
			$(this).siblings('span').hide();
			$node.show();
			$node.find('input').focus();
			$(this).val('保存');
			$(this).data('edit',true);
		}
		else{
			$(this).parents('form').submit();
		}
	})


	 $('#search').typeahead({
	    	source: function (query, process) {
		          $.get('/admin/category',function(arr){
		              process(arr);
		          });
   		 }
	});
})


