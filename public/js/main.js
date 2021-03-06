var CheckCNPJ = (function() {
	'use strict';
	var dados = {};

	var setDados = function(dado){
		dados = dado;
	}

	var getDados = function(){
		return dados;
	}
	var refresh = function(callback){
		$.ajax({
	        url: 'refreshToken.php',
	        type: 'POST',
	        dataType: 'JSON',
	        cache: false,
	        success: function(res){
	        	var response = {
	        		status 	: res.status
	        	};

	        	if('data' in res){
	        		if(res.data.length > 1){
	        			response.img = 'getcaptcha.php?id=' + res.data[0];
	        			response.viewstate = res.data[1];
	        		}
	        	}

	        	if(typeof callback === 'function'){
	        		return callback(response);
	        	} else {
	        		return response;
	        	}
	        }
    	});
	}

	var post = function(args, callback){
		$.ajax({
		    url: 'processa.php',
		    type: 'POST',
		    dataType: 'JSON',
		    data: args,
		    cache: false,
		    success: function(res){
		    	setDados(res);
		    	if(typeof callback === 'function'){
	        		return callback(res);
	        	} else {
	        		return res;
	        	}

		    }
		    
		})
	}

	var CheckCNPJ = {
		init : function(){
			$(document).on('ready', function(){
				var url = getUrlData();

				if('cnpj' in url){
					$('#cnpj').val(url.cnpj.mask('##.###.###/####-##'));
				}
				var viewstate = $('.viewstate');
				var captcha = $('.captchaImage');
				captcha.val('');

				CheckCNPJ.refresh(function(res){
					if(res.status){
						captcha.attr('src', res.img);
						viewstate.val(res.viewstate);
					}
				});

			});

			$('.refresh').on('click', function(e){
				e.preventDefault();
				var self = $(this);
				var viewstate = $('#viewstate');
				var captcha = $('#captchaImage');
				var captchaText = $('#captcha');
				captchaText.val('');

				CheckCNPJ.refresh(function(res){
					if(res.status){
						captcha.attr('src', res.img);
						viewstate.val(res.viewstate);
					}
				});
			});

			$('form').on('submit', function(e){
				$('body').loader('show');
				e.preventDefault();
				var template = _.template($('#dataReturn').html());
				var cnpj = $('#cnpj').val();
					cnpj = cnpj.replace(/[^0-9]/g, '');

				CheckCNPJ.post({
					cnpj 		: cnpj,
					viewstate	: $('#viewstate').val(),
					captcha 	: $('#captcha').val()
				}, function(res){
					$('body').loader('hide');
					$('.refresh').trigger('click');
					if(res.length == 0){
						bootbox.dialog({
							message: "Erro ao consultar registro, tente novamente!",
							title: "Erro!",
							buttons: {
								danger: {
									label: "Fechar",
									className: "btn-danger",
									callback: function() {
										//Example.show("uh oh, look out!");
									}
								}
							}
						});	
					} else {
						bootbox.dialog({
							message: template(res),
							title: "Dados da Empresa",
							buttons: {
								danger: {
									label: "Fechar",
									className: "btn-danger",
									callback: function() {
										//Example.show("uh oh, look out!");
									}
								},
								success: {
									label: "Enviar dados",
									className: "btn-success",
									callback: function() {
										window.opener.CheckCnpjPopUp.setCallbackPopup(res);
										open(location, '_self').close();
										//Example.show("great success");
									}
								}
							}
						});
					}
					
				});
			});

			$('form').on('reset', function(e){
				e.preventDefault();
			    $('#cnpj').val('');
			    $('#captcha').val('');
			    $('.refresh').trigger('click');
			})
		},
		post : post,
		refresh : refresh,
		getDados : getDados
	};

	return CheckCNPJ;

}());
