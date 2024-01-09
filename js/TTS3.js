(function(document) {

	var m_fileCheck,
		m_ttsTxtFocus = 0,
		m_ttsTextArea,
		m_curCharDisplay

	var g_last_msg = '';
	var g_last_voice = '';
	var g_last_engine = '';
	var g_last_success = 'false';

	$(document).ready(function()
		{
		grecaptcha.ready(function() {
		grecaptcha.execute('6LePFKgUAAAAAKIQTSnnKOotc90cHDvmHPOeUy3k', {action: 'homepage'}).then(function(token) {
				});
			});


        $("#lnkChoose").click(
            function()
            {
				grecaptcha.ready(function() {  grecaptcha.execute('6LePFKgUAAAAAKIQTSnnKOotc90cHDvmHPOeUy3k', {action: 'showvoices'}); });
  
                show_voices();
                
                //stop animation
                if(typeof(objMarquee) == "object")
                {
				    objMarquee.stopTransition();
			    }
            }
        );
            
        $("#div_languages a").attr('href', '#' );
        $("#chosenLanguage").html(' <span id="spanVoice"> Chris </span>');
        $("#txtvoice").val('chris');
        $("#txtengine").val('1');
            
            
		m_ttsTextArea = $("#ttsBanner textarea");
		m_curCharDisplay = $("#ttsBanner textarea + div span:first");
		
		$('#ttsBanner textarea').focus(function(){
			
			if(typeof(objMarquee) == "object"){
				objMarquee.stopTransition();
			}
			
			m_ttsTxtFocus = setInterval(chkTxtInput, 200);
		});
		
		$('#ttsBanner textarea').blur(function(){
			clearInterval(m_ttsTxtFocus);
		});

		$(".languageOptions a").each(function(p_index, p_elm){
			$(this).click(function(){
				if($('.languageOptions span.selected').length > 0){
					$('.languageOptions .selected').removeClass('selected');
				}
				$(this).parent().addClass('selected');		

			});
		}); 

		$("#btnSendTxt").click(function(){
			init();
		});
		
		$("#btnStopAudio").click(function(){
			callAS('stopAudio');
		});
  
	});

	function init()
		{
		
		var msg = $("#ttsTxt").val();
		var voice = $("#txtvoice").val();
		var engine = $("#txtengine").val();
		if (g_last_success == 'true' && g_last_msg == msg && g_last_voice == voice && g_last_engine == engine)
			{
			 $('audio.ttsplayer')[0].play();
			 return;
			}
		
		g_last_msg = msg;
		g_last_voice = voice;
		g_last_engine = engine;
		g_last_success = 'false';
		msg = msg.replace(/\"/g, "");

		if(msg.length > 1)
			{
		
			if(msg.length > 290){
 				var answer = confirm("You have entered more than 300 characters. Your text will be limited to 300 characters. Would you like to continue?");
				if (answer){
					msg = msg.substring(0,290);
					msg = msg.substring(0, msg.lastIndexOf(' '));
					document.getElementById('ttsTxt').value = msg;
					document.getElementById('curChar').innerHTML = msg.length;
				}else{
					return false;
				} 
			}
		
			//$("#btnSendTxt").attr('src', '/img/products/tts/btnListen-disabled.png');
			$("#requestPending").css('display', 'block');
			
			m_fileCheck = 0;
		
			grecaptcha.execute('6LePFKgUAAAAAKIQTSnnKOotc90cHDvmHPOeUy3k', {action: 'create_tts'}).then(function(token) 
				{
					
				 g_captcha = token;
			
				 $.ajax({
					url: '/products/tts/processTTS.ashx',
					data: 'msg=' + msg + '&voice=' + voice + '&engine=' + engine + '&captcha=' + g_captcha,
					type: 'POST',
					success: function (p_data, textStatus) {
						checkFile($(p_data).find('status').find('path').text());
					},
					error: function (data) {
						alert('Our service is temporarily down. We apologize for any inconvenience.');
					}
					});
				});
			
			}
		else
		{
			alert('Please enter text to try our text-to-speech tecnology');
		}
	}

	function checkFile(p_fileName){
	
		$.ajax({
			url: '/products/tts/fileReady.ashx',
			data: 'fileName=' + p_fileName,
			type: 'POST',
			success: function (p_data, textStatus) {
				if($(p_data).find('status').find('exists').text() == '1'){
					// Have Audio : Load
					$("#requestPending").css('display', 'none');
					$( "audio.ttsplayer" ).remove();
					$( "div.ttsControls" ).append($('<audio class="ttsplayer" ><source src="/products/tts/audio/' + p_fileName + '" type="audio/mpeg"></audio>'));
					g_last_success = 'true';
					setTimeout(function(){
						$('audio.ttsplayer')[0].play();
						//callAS('loadAudio', '/products/tts/audio/' + p_fileName);
					}, 200);
				}else{
					// No Audio yet : Set Que
					// Check For File Again
					if(m_fileCheck < 90){
						setTimeout(function(){checkFile(p_fileName)}, 750);
					}else{
						errorAlert();
					}
				}
			},
			error: function (data) {
				// Close timeout
				errorAlert();
			}
		});

		m_fileCheck++;	
	}

	function errorAlert(){
		$("#btnSendTxt").attr('src', '/img/products/tts/btnListen.png');
		alert('Our service is temporarily down. We apologize for any inconvenience.');
	}
	
	function chkTxtInput(){

		if(m_ttsTextArea.val().length <= 1000){		
			m_curCharDisplay.text(m_ttsTextArea.val().length);
		}else{
			var msg = m_ttsTextArea.val().substring(0, 1000);
			m_ttsTextArea.val(msg.substring(0, msg.lastIndexOf(' ')));
			
			m_curCharDisplay.val(msg.length);
			
			alert('The entered text is longer than 1000 characters. Your entry has been limited to 1000 characters.')
		}
	}

	function callAS(p_func, p_value) {
		if(arguments.length == 1){
			document["ttsAudioPlayer"][p_func]();
		}else{
			document["ttsAudioPlayer"][p_func](p_value);
		}
		return false;
	}
})(document);

function audioAction(p_action){

	if(p_action == 'play'){
		$("#requestPending").css('display', 'none');
		$("#btnSendTxt").css('display', 'none');
		$("#btnStopAudio").css('display', 'block');
	}else{
		$("#btnSendTxt").css('display', 'block');
		$("#btnStopAudio").css('display', 'none');
		$("#btnSendTxt").attr('src', '/img/products/tts/btnListen.png');
	}
}

        function change(voice,engine)
        {
            span_voice = voice.replace('_en' , '');
            span_voice = span_voice.replace('_cy', '');
          $("#chosenLanguage").html(' <span id="spanVoice"> ' + span_voice + ' </span>');
          $("#txtvoice").val(voice);
          $("#txtengine").val(engine);
          $("#div_languages").css('display', 'none');
          
          $('#ttsBanner textarea').focus();

        }


        function show_voices()
        {
            $("#div_languages").css('display', 'block');
        }
        

