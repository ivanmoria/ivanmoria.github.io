document.querySelector('.tooltip').addEventListener('click', function(event) {
    event.stopPropagation();  // Impede que o clique se propague para o elemento pai
  });
  const menuButton = document.getElementById('menuButton');

  menuButton.addEventListener('click', () => {
    menuButton.classList.toggle('active');
  });

  function toggleAudicaoInput(showTextBox) {
    const audicaoDetails = document.getElementById('audicaoDetails');
    if (showTextBox) {
      audicaoDetails.style.display = 'block'; // Mostra a caixa de texto
    } else {
      audicaoDetails.style.display = 'none';  // Esconde a caixa de texto
      document.getElementById('audicaoProblema').value = ''; // Limpa o texto inserido
    }
  }
  
  function toggleField(fieldId, showField) {
    const field = document.getElementById(fieldId);
    if (showField) {
      field.style.display = 'block'; // Exibe o campo
    } else {
      field.style.display = 'none';  // Esconde o campo
      // Limpa todos os inputs dentro do campo
      const inputs = field.querySelectorAll('input, textarea');
      inputs.forEach(input => input.value = '');
    }
  }
  function toggleOtherGender() {
    var genderSelect = document.getElementById('genderInput');
    var otherGenderContainer = document.getElementById('otherGenderContainer');
    
    if (genderSelect.value === 'outro') {
      otherGenderContainer.style.display = 'block';
    } else {
      otherGenderContainer.style.display = 'none';
    }
  }
  

  // Função para definir a data atual com o fuso horário do navegador
  function setCurrentDate() {
    var today = new Date();
    
    // Formatar a data no formato YYYY-MM-DD
    var formattedDate = today.toISOString().split('T')[0];
    
    // Definir a data no campo de entrada
    document.getElementById('dateInput').value = formattedDate;
  }

  // Chama a função assim que o script for carregado
  setCurrentDate();
      
  const questions = {
    masculino: [
        "Com que frequência você cantou?",
        "Como foi essa experiência?",
        "Com que frequência você tocou instrumentos musicais ou digitais?",
        "Tive dificuldade em respirar em alguns momentos (por exemplo respiração ofegante ou falta de ar - sem ter feito nenhum esforço físico).",
        "Achei difícil ter iniciativa para fazer as coisas.",
        "Tive a tendência de reagir de forma exagerada às situações.",
        "Senti tremores (por exemplo - nas mãos).",
        "Senti que estava sempre nervoso.",
        "Preocupei-me com situações em que eu pudesse entrar em pânico e parecesse ridículo.",
        "Senti que não tinha nada a desejar.",
        "Senti-me agitado.",
        "Achei difícil relaxar.",
        "Senti-me depressivo ou sem ânimo.",
        "Fui intolerante com as coisas que me impediam de continuar o que eu estava fazendo.",
        "Senti que ia entrar em pânico.",
        "Não consegui me entusiasmar com nada.",
        "Senti que não tinha valor como pessoa.",
        "Senti que estava um pouco emotivo ou sensível demais.",
        "Sabia que meu coração estava alterado mesmo não tendo feito nenhum esforço físico (por exemplo aumento da frequência cardíaca ou disritmia cardíaca).",
        "Senti medo sem motivo.",
        "Senti que a vida não tinha sentido."
    ],
    feminino: [
        "Com que frequência você cantou?",
        "Como foi essa experiência?",
        "Com que frequência você tocou instrumentos musicais ou digitais?",
        "Tive dificuldade em respirar em alguns momentos (por exemplo respiração ofegante ou falta de ar - sem ter feito nenhum esforço físico).",
        "Achei difícil ter iniciativa para fazer as coisas.",
        "Tive a tendência de reagir de forma exagerada às situações.",
        "Senti tremores (por exemplo - nas mãos).",
        "Senti que estava sempre nervosa.",
        "Preocupei-me com situações em que eu pudesse entrar em pânico e parecesse ridícula.",
        "Senti que não tinha nada a desejar.",
        "Senti-me agitada.",
        "Achei difícil relaxar.",
        "Senti-me depressiva ou sem ânimo.",
        "Fui intolerante com as coisas que me impediam de continuar o que eu estava fazendo.",
        "Senti que ia entrar em pânico.",
        "Não consegui me entusiasmar com nada.",
        "Senti que não tinha valor como pessoa.",
        "Senti que estava um pouco emotiva ou sensível demais.",
        "Sabia que meu coração estava alterado mesmo não tendo feito nenhum esforço físico (por exemplo aumento da frequência cardíaca ou disritmia cardíaca).",
        "Senti medo sem motivo.",
        "Senti que a vida não tinha sentido."
    ]
};



// Definir caminhos dos áudios por pergunta, separados por tipo de voz e gênero
const audios = {
    homem_masculino: [
        'media/audio/audiosdass21/danielmasc/danm1.wav', 
        'media/audio/audiosdass21/danielmasc/danm2.wav', 
        'media/audio/audiosdass21/danielmasc/danm3.wav', 
        'media/audio/audiosdass21/danielmasc/danm4.wav', 
        'media/audio/audiosdass21/danielmasc/danm5.wav', 
        'media/audio/audiosdass21/danielmasc/danm6.wav',
        'media/audio/audiosdass21/danielmasc/danm7.wav',
        'media/audio/audiosdass21/danielmasc/danm8.wav', 
        'media/audio/audiosdass21/danielmasc/danm9.wav', 
        'media/audio/audiosdass21/danielmasc/danm10.wav', 
        'media/audio/audiosdass21/danielmasc/danm11.wav', 
        'media/audio/audiosdass21/danielmasc/danm12.wav', 
        'media/audio/audiosdass21/danielmasc/danm13.wav', 
        'media/audio/audiosdass21/danielmasc/danm14.wav', 
        'media/audio/audiosdass21/danielmasc/danm15.wav', 
        'media/audio/audiosdass21/danielmasc/danm16.wav', 
        'media/audio/audiosdass21/danielmasc/danm17.wav', 
        'media/audio/audiosdass21/danielmasc/danm18.wav', 
        'media/audio/audiosdass21/danielmasc/danm19.wav', 
        'media/audio/audiosdass21/danielmasc/danm20.wav', 
        'media/audio/audiosdass21/danielmasc/danm21.wav',

       
    ],
    homem_feminino: [
        'media/audio/audiosdass21/danielmasc/danm1.wav', 
        'media/audio/audiosdass21/danielmasc/danm2.wav', 
        'media/audio/audiosdass21/danielmasc/danm3.wav', 
        'media/audio/audiosdass21/danielmasc/danm4.wav', 
        'media/audio/audiosdass21/danielmasc/danm5.wav', 
        'media/audio/audiosdass21/danielmasc/danm6.wav',
        'media/audio/audiosdass21/danielmasc/danm7.wav',
        'media/audio/audiosdass21/danielfem/danielfem1.wav', 
        'media/audio/audiosdass21/danielfem/danielfem2.wav', 
        'media/audio/audiosdass21/danielmasc/danm10.wav', 
        'media/audio/audiosdass21/danielfem/danielfem3.wav', 
        'media/audio/audiosdass21/danielmasc/danm12.wav', 
        'media/audio/audiosdass21/danielfem/danielfem4.wav', 
        'media/audio/audiosdass21/danielmasc/danm14.wav', 
        'media/audio/audiosdass21/danielmasc/danm15.wav', 
        'media/audio/audiosdass21/danielmasc/danm16.wav', 
        'media/audio/audiosdass21/danielmasc/danm17.wav', 
        'media/audio/audiosdass21/danielfem/danielfem5.wav', 
        'media/audio/audiosdass21/danielmasc/danm19.wav', 
        'media/audio/audiosdass21/danielmasc/danm20.wav', 
        'media/audio/audiosdass21/danielmasc/danm21.wav',
    ],
    mulher_masculino: [
        'media/audio/audiosdass21/lilyfem/lilyfem1.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem2.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem3.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem4.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem5.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem6.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem7.wav',
        'media/audio/audiosdass21/lilymasc/lilymasc8.wav',
        'media/audio/audiosdass21/lilymasc/lilymasc9.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem10.wav',
        'media/audio/audiosdass21/lilymasc/lilymasc11.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem12.wav',
        'media/audio/audiosdass21/lilymasc/lilymasc13.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem14.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem15.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem16.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem17.wav',
        'media/audio/audiosdass21/lilymasc/lilymasc18.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem19.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem20.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem21.wav',
    ],
    mulher_feminino: [
        'media/audio/audiosdass21/lilyfem/lilyfem1.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem2.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem3.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem4.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem5.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem6.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem7.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem8.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem9.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem10.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem11.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem12.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem13.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem14.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem15.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem16.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem17.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem18.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem19.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem20.wav',
        'media/audio/audiosdass21/lilyfem/lilyfem21.wav',
    ]
};



  let currentQuestionIndex = 0;
  const answers = [];
  let participantName = '';
  let participantAge = '';
  let participantGender = '';
  let testDate = '';
  function startTest() {
    // Mostrar o modal para coletar dados
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';

    const instructionsSection = document.getElementById('instructionsSection');
    instructionsSection.style.display = 'none';




    // Ocultar o restante do conteúdo (como perguntas, resposta, áudio e formulário)
    const testContent = document.getElementById('testContent');
    const dassForm = document.getElementById('dassForm');
    const dassFormt = document.getElementById('dassFormt');

    // Verifique se a seleção do conteúdo está correta e defina o display como 'none'
    if (testContent) {
        testContent.style.display = 'none';  // Oculta o bloco com as perguntas e o formulário
    }

    if (dassForm) {
        dassForm.style.display = 'none';  // Também oculta o formulário
    }
    if (dassFormt) {
      dassFormt.style.display = 'none';  // Também oculta o formulário
  }
}

  function submitParticipantInfo() {
    // Obter os valores dos campos de entrada
    const nameInput = document.getElementById('nameInput');
    const genderInput = document.getElementById('genderInput');
    const ageInput = document.getElementById('ageInput');
    const dateInput = document.getElementById('dateInput');

    const audicaoSim = document.getElementById('audicaoSim');
    const audicaoNao = document.getElementById('audicaoNao');
    const audicaoProblema = document.getElementById('audicaoProblema');

    const acompanhamentoDetail = document.getElementById('acompanhamentoDetail');



    participantAudicaoSim = audicaoSim.value.trim();
    participantAudicaoNao = audicaoNao.value.trim();
    participantAudicaoProblema = audicaoProblema.value.trim();



 

    participantName = nameInput.value.trim();
    participantGender = genderInput.value.trim();
    participantAge = ageInput.value.trim();
    const rawDate = dateInput.value;
  
    // Validar os campos
    if (!participantName) {
      alert('Por favor, insira seu nome.');
      return;
    }
    if (!participantGender) {
      alert('Por favor, insira seu gênero.');
      return;
    }
    if (!participantAge || isNaN(participantAge)) {
      alert('Por favor, insira uma idade válida.');
      return;
    }
    if (!rawDate) {
      alert('Por favor, selecione uma data para o teste.');
      return;
    }
    // Formatar a data para dia-mês-ano
    const [year, month, day] = rawDate.split('-');
    testDate = `${day}-${month}-${year}`;

    // Fechar o modal
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    document.getElementById("testContainer").style.display = "block";
  
    // Exibir mensagem de boas-vindas
    alert(`Bem-vindo, ${participantName}.
  Por favor, leia cada afirmação e pressione uma resposta que indique o quanto a afirmação se aplicou a você na semana passada. 
  Não há respostas certas ou erradas. 
  Não gaste muito tempo em nenhuma afirmação. 

  NUNCA - Não se aplicou a mim de forma alguma;  
  ÀS VEZES - Aplicou-se a mim em algum grau, ou algumas vezes;  
  FREQUENTEMENTE - Aplicou-se a mim em um grau considerável, ou uma boa parte do tempo; 
  QUASE SEMPRE - Aplicou-se a mim muito, ou na maioria das vezes;
  
  O teste vai começar agora.`);
  
    // Tocar o primeiro áudio
    showQuestion();
  }
  
  // Função para numerar e exibir perguntas
function showQuestion() {
    const questionElement = document.getElementById('question');
    const questionText = questions[currentGender][currentQuestionIndex];
    questionElement.textContent = `${currentQuestionIndex + 1}. ${questionText}`; // Numerar a pergunta
}

// Função para selecionar resposta com base no índice da pergunta
function selectAnswer(value) {
    const selectedAnswerElement = document.getElementById('selectedAnswer');
    const responseOptions = currentQuestionIndex < 10 
        ? ['Nenhum dia', 'Um dia', 'Alguns dias', 'Quase todos os dias', 'Todos os dias'] 
        : ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa'];
    selectedAnswerElement.textContent = `Resposta: ${responseOptions[value]}`;
    selectedAnswerElement.classList.add('highlight');
}

// Função para mudar para a próxima pergunta
function nextQuestion() {
    if (currentQuestionIndex < questions[currentGender].length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        alert("Fim do questionário!");
    }
}
    // Exibir a pergunta
    document.getElementById('questionText').textContent = `${currentQuestionIndex + 1}: ${currentQuestionText}`;
    
    // Exibir a resposta selecionada como padrão
    document.getElementById('selectedAnswer').textContent = 'Resposta: Nenhuma';
    

// Variável para controlar se o alerta já foi exibido
let alertShown = false;







  function showAlertMessage(message) {
      const alertDiv = document.getElementById('alertMessage');
      alertDiv.textContent = message;
      alertDiv.style.display = 'block';
      setTimeout(() => {
          alertDiv.style.display = 'none';
      }, 3000);
  }
  function nextQuestion() {
    // Verifica se a resposta da pergunta atual foi selecionada
    if (answers[currentQuestionIndex] === undefined) {
        playAudio();
        showAlertMessage('Você deve selecionar uma resposta antes de continuar.');
        return;
    }

    // Se não for a última pergunta, avança para a próxima
    if (currentQuestionIndex < questions.masculino.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        // Se todas as perguntas foram respondidas, mostra mensagem de conclusão
        alert('Teste concluído! Obrigado por responder.');
        // Oculta os dois divs
      const questionDiv = document.getElementById('questionText').parentElement;  // Pega o <div> que contém a pergunta
      const answerDiv = document.getElementById('selectedAnswer').parentElement;  // Pega o <div> que contém as respostas

      questionDiv.style.display = 'none';  // Oculta a div da pergunta
      answerDiv.style.display = 'none';  // Oculta a div das respostas
        processResponses();
    }
}


  document.addEventListener('keydown', (event) => {
      if (event.key >= '1' && event.key <= '4') {
          selectAnswer(parseInt(event.key) - 1);
      } else if (event.key === ' ') {
          nextQuestion();
      }
  });




  showQuestion();
  function showAlertMessage(message) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 3000);
}

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const progress = (currentQuestionIndex / questions[participantGender].length) * 100;
    progressBar.value = progress;
}



