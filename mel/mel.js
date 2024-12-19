// Dados das perguntas e respostas
const questions = [
    {
        question: "Nome",  // Primeira pergunta que usará um input de texto
        answers: []  // Não há opções de resposta, pois é uma entrada de texto
    },
    {
        question: "Idade",  // Primeira pergunta que usará um input de texto
        answers: []  // Não há opções de resposta, pois é uma entrada de texto
    },
    {
        question: "Gênero",  // Primeira pergunta que usará um input de texto
        answers: []  // Não há opções de resposta, pois é uma entrada de texto
    },
    {
        question: "Data do teste",  // Primeira pergunta que usará um input de texto
        answers: []  // Não há opções de resposta, pois é uma entrada de texto
    },
    {
        question: "Apresenta algum problema de audição?",
        answers: ['Sim', 'Não']
    },
    {
        question: "Acompanhamento médico?",
        answers: ['Sim', 'Não']
    },
    {
        question: "Toma alguma medicação?",
        answers: ['Sim', 'Não']
    },
    {
        question: "Apresenta algum diagnóstico em alguma condição de saúde?",
        answers: ['Sim', 'Não']
    },
    {
        question: "Formação escolar/acadêmica",
        answers: []
    },
    {
        question: "Participa de atividades musicais?",
        answers: ['Sim', 'Não']
    },
    {
        question: "Sons que gosta",
        answers: []
    },
    {
        question: "Sons que não gosta",
        answers: []
    },
    {
        question: "Possui iniciação musical?",
        answers: ['Sim', 'Não']
    },
    {
        question: "Toca algum instrumento?",
        answers: ['Sim', 'Não']
    },
    {
        question: "Canta?",
        answers: ['Sim', 'Não']
    },
    {
        question: "Com que frequência você cantou?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Como foi essa experiência?",
        answers: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa']
    },
    {
        question: "Com que frequência você tocou instrumentos musicais ou digitais?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Como foi essa experiência?",
        answers: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa']
    },
    {
        question: "Quantas vezes você ouviu música?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Como foi essa experiência?",
        answers: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa']
    },
    {
        question: "Alguém da sua família ou residência toca algum instrumento musical?",
        answers: ['Sim', 'Não']
    },
    {
        question: "Quantas vezes você presenciou alguém tocar instrumentos?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Como foi essa experiência?",
        answers: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa']
    },
    // Perguntas sobre a frequência de audição para cada estilo musical
    {
        question: "Qual o tipo de música você e/ou sua fam[ilia ouviu?",
        answers: ['Regionalista/Folclore', 'Clássica', 'Jazz', 'Músicas infantis', 'Pop Music','Relaxamento (New-Age)', 'Dance Music']
    },
    {
        question: "Com que frequência você ouviu música regionalista ou do seu folclore?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Com que frequência você ouviu música clássica?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Com que frequência você ouviu jazz?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Com que frequência você ouviu músicas infantis?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Com que frequência você ouviu pop music?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Com que frequência você ouviu música de relaxamento?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Com que frequência você ouviu dance music?",
        answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
    },
    {
        question: "Você ouviu outro tipo de música, qual foi e com que frequência?",
        answers: ['Sim', 'Não']
    }
];

let currentQuestionIndex = 0;
// Array para armazenar as respostas
let responses = [];

// Função para coletar e salvar as respostas
function collectResponse() {
    const additionalInput = document.getElementById("additional-input");
    const currentQuestion = questions[currentQuestionIndex].question;

    // Coleta a resposta do campo adicional
    let responseValue = "";

    if (currentQuestion === "Alguém da sua família ou residência toca algum instrumento musical?") {
        responseValue = document.getElementById("family-instrument") ? document.getElementById("family-instrument").value : "";
    } 
    else if (currentQuestion === "Você ouviu outro tipo de música, qual foi e com que frequência?") {
        responseValue = document.getElementById("music-type") ? document.getElementById("music-type").value : "";
    }
    else if (currentQuestion === "Apresenta algum problema de audição?") {
        responseValue = document.getElementById("hearing-issue") ? document.getElementById("hearing-issue").value : "";
    }
    else if (currentQuestion === "Acompanhamento médico?") {
        responseValue = document.getElementById("medical-follow-up") ? document.getElementById("medical-follow-up").value : "";
    }
    else if (currentQuestion === "Toma alguma medicação?") {
        responseValue = document.getElementById("medication") ? document.getElementById("medication").value : "";
    }
    else if (currentQuestion === "Apresenta algum diagnóstico em alguma condição de saúde?") {
        responseValue = document.getElementById("health-diagnosis") ? document.getElementById("health-diagnosis").value : "";
    }
    else if (currentQuestion === "Participa de atividades musicais?") {
        responseValue = document.getElementById("musical-activities") ? document.getElementById("musical-activities").value : "";
    }
    else if (currentQuestion === "Possui iniciação musical?") {
        responseValue = document.getElementById("musical-initiation") ? document.getElementById("musical-initiation").value : "";
    }
    else if (currentQuestion === "Toca algum instrumento?") {
        responseValue = document.getElementById("plays-instrument") ? document.getElementById("plays-instrument").value : "";
    }
    else if (currentQuestion === "Canta?") {
        responseValue = document.getElementById("sings") ? document.getElementById("sings").value : "";
    }

    // Armazena a resposta na posição correta do array
    responses[currentQuestionIndex] = responseValue;
}

// Função para avançar para a próxima pergunta
function nextQuestion() {
    // Coleta a resposta antes de avançar
    collectResponse();

    // Avança para a próxima pergunta
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;  // Incrementa o índice
        showQuestion(currentQuestionIndex);  // Exibe a próxima pergunta
    } else {
        // Exibe mensagem de conclusão
        alert("Obrigado por responder todas as perguntas!");
        // Aqui você pode salvar ou processar as respostas como desejar, por exemplo:
        saveResponses();
    }
}

// Função para salvar as respostas em um formato, por exemplo, CSV
function saveResponses() {
    const csvContent = "data:text/csv;charset=utf-8,"
        + questions.map((q, i) => {
            const response = responses[i] || '';  // Caso não tenha resposta, coloca um valor vazio
            return `"${q.question}","${response}"`;  // Formata cada linha como 'pergunta,resposta'
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "respostas.csv");  // Nome do arquivo CSV
    document.body.appendChild(link);  // Necessário para o link ser clicável
    link.click();  // Simula o clique no link para baixar o arquivo
}


function showQuestion(index) {
    const question = questions[index];
    const questionElement = document.getElementById("question");
    const buttonsContainer = document.getElementById("buttons-container");
    const additionalInput = document.getElementById("additional-input");
    const warningText = document.getElementById("warning-text");

    // Limpa a mensagem de aviso
    warningText.style.display = "none";  // Oculta o aviso quando a pergunta mudar

    // Exibe a pergunta
    questionElement.textContent = question.question;

    // Limpa os botões de respostas
    buttonsContainer.innerHTML = '';
    additionalInput.innerHTML = ''; 
    const responseText = document.getElementById("response-text");
    responseText.textContent = "Resposta: Nenhuma"; // Reinicia o texto para 'Nenhuma'

    // Se a pergunta for sobre a data do teste, exibe o campo de data com a data atual
    if (question.question === "Data do teste") {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];  // Formata a data no formato 'YYYY-MM-DD'
        additionalInput.innerHTML = `<input type="date" class="date-input" id="test-date" value="${formattedDate}" placeholder="Escolha a data">`;
   } else if (question.answers.length === 0) {
        // Se a pergunta não tem respostas (como Nome, Idade, Gênero), exibe um campo de texto
        additionalInput.innerHTML = '<input type="text" class="text-input" id="extra-response" placeholder="Digite sua resposta...">';
          
    // Adiciona foco no campo de texto assim que ele for exibido
    const textInput = document.getElementById("extra-response");
    if (textInput) {
        textInput.focus();
    }

    } else {
        // Cria os botões de respostas para as perguntas seguintes
        question.answers.forEach((answer) => {
            const button = document.createElement("button");
            button.classList.add("button");
            button.textContent = answer;
            button.onclick = () => selectAnswer(answer);
            buttonsContainer.appendChild(button);
        });
    }

    // Focar no primeiro botão de resposta ao mostrar a pergunta
    const firstButton = buttonsContainer.querySelector('button');
    if (firstButton) firstButton.focus();
}


function selectAnswer(answer) {
    const responseText = document.getElementById("response-text");
    const additionalInput = document.getElementById("additional-input");

    // Armazena a resposta selecionada
    responses[currentQuestionIndex] = answer;

    // Atualiza o texto da resposta
    responseText.textContent = "Resposta: " + answer;  // Exibe a resposta selecionada


// Verifica se a resposta é "Sim" para exibir o campo adicional de texto
if (answer === "Sim") {
    // Verifica se a pergunta é "Alguém da sua família ou residência toca algum instrumento musical?"
    if (questions[currentQuestionIndex].question === "Alguém da sua família ou residência toca algum instrumento musical?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="family-instrument" placeholder="Qual instrumento?">';
    } 
    // Verifica se a pergunta é "Você ouviu outro tipo de música, qual foi e com que frequência?"
    else if (questions[currentQuestionIndex].question === "Você ouviu outro tipo de música, qual foi e com que frequência?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="music-type" placeholder="Qual tipo de música?">';
    }
    // Verifica se a pergunta é "Apresenta algum problema de audição?"
    else if (questions[currentQuestionIndex].question === "Apresenta algum problema de audição?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="hearing-issue" placeholder="Qual problema de audição?">';
    }
    // Verifica se a pergunta é "Acompanhamento médico?"
    else if (questions[currentQuestionIndex].question === "Acompanhamento médico?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="medical-follow-up" placeholder="Qual acompanhamento?">';
    }
    // Verifica se a pergunta é "Toma alguma medicação?"
    else if (questions[currentQuestionIndex].question === "Toma alguma medicação?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="medication" placeholder="Qual medicação, e por quanto tempo?">';
    }
    // Verifica se a pergunta é "Apresenta algum diagnóstico em alguma condição de saúde?"
    else if (questions[currentQuestionIndex].question === "Apresenta algum diagnóstico em alguma condição de saúde?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="health-diagnosis" placeholder="Qual diagnóstico?">';
    }
    // Verifica se a pergunta é "Participa de atividades musicais?"
    else if (questions[currentQuestionIndex].question === "Participa de atividades musicais?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="musical-activities" placeholder="Quais atividades?">';
    }
    // Verifica se a pergunta é "Possui iniciação musical?"
    else if (questions[currentQuestionIndex].question === "Possui iniciação musical?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="musical-initiation" placeholder="Qual tipo de iniciação musical?">';
    }
    // Verifica se a pergunta é "Toca algum instrumento?"
    else if (questions[currentQuestionIndex].question === "Toca algum instrumento?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="plays-instrument" placeholder="Qual instrumento, e por quanto tempo?">';
    }
    // Verifica se a pergunta é "Canta?"
    else if (questions[currentQuestionIndex].question === "Canta?") {
        additionalInput.innerHTML = '<input type="text" class="text-input" id="sings" placeholder="Qual gênero, e por quanto tempo?">';
    }

    // Após a inserção do input de texto, coloca o foco no campo de entrada
    const textInput = additionalInput.querySelector('input');
    if (textInput) {
        textInput.focus();  // Coloca o foco no campo de texto
    }

} else {
    // Caso contrário, oculta o campo de texto adicional
    additionalInput.innerHTML = '';
}
}




// Função para avançar para a próxima pergunta
function nextQuestion() {
    const warningText = document.getElementById("warning-text");
    const responseText = document.getElementById("response-text");

    // Se a pergunta for um campo de texto, armazena a resposta
    const extraResponseInput = document.getElementById("extra-response");
    if (extraResponseInput) {
        const response = extraResponseInput.value.trim();
        if (response) {  // Verifica se há algo no campo de resposta
            responses[currentQuestionIndex] = response;
        } else {
            warningText.textContent = "Por favor, preencha a resposta antes de continuar.";
            warningText.style.display = "block";
            return; // Não avança se o campo de texto estiver vazio
        }
    }

    // Se a pergunta for sobre a data do teste, armazena a resposta
    const testDateInput = document.getElementById("test-date");
    if (testDateInput) {
        const response = testDateInput.value.trim();
        if (response) {  // Verifica se há uma data selecionada
            responses[currentQuestionIndex] = response;
        } else {
            warningText.textContent = "Por favor, selecione uma data.";
            warningText.style.display = "block";
            return; // Não avança se a data não foi selecionada
        }
    }

    // Se a resposta extra for um campo de texto com id específico (como instrumentos musicais, medicação, etc.)
    const familyInstrumentInput = document.getElementById("family-instrument");
    const musicTypeInput = document.getElementById("music-type");
    const hearingIssueInput = document.getElementById("hearing-issue");
    const medicalFollowUpInput = document.getElementById("medical-follow-up");
    const medicationInput = document.getElementById("medication");
    const healthDiagnosisInput = document.getElementById("health-diagnosis");
    const musicalActivitiesInput = document.getElementById("musical-activities");
    const musicalInitiationInput = document.getElementById("musical-initiation");
    const playsInstrumentInput = document.getElementById("plays-instrument");
    const singsInput = document.getElementById("sings");

    // Verificar e armazenar as respostas de inputs adicionais
    if (familyInstrumentInput) {
        const response = familyInstrumentInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }
    if (musicTypeInput) {
        const response = musicTypeInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }
    if (hearingIssueInput) {
        const response = hearingIssueInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }
    if (medicalFollowUpInput) {
        const response = medicalFollowUpInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }
    if (medicationInput) {
        const response = medicationInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }
    if (healthDiagnosisInput) {
        const response = healthDiagnosisInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }
    if (musicalActivitiesInput) {
        const response = musicalActivitiesInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }
    if (musicalInitiationInput) {
        const response = musicalInitiationInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }
    if (playsInstrumentInput) {
        const response = playsInstrumentInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }
    if (singsInput) {
        const response = singsInput.value.trim();
        if (response) {
            responses[currentQuestionIndex] = response;
        }
    }

    // Se não houver resposta para a pergunta, exibe um aviso
    if (!responses[currentQuestionIndex]) {
        warningText.textContent = "Por favor, selecione uma resposta antes de continuar.";
        warningText.style.display = "block";  // Exibe o aviso
        return;  // Não avança se não houver resposta
    }

    // Avança para a próxima pergunta
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;  // Incrementa o índice
        showQuestion(currentQuestionIndex);  // Exibe a próxima pergunta
    } else {
        responseText.textContent = "Obrigado por responder!";
        warningText.innerHTML = 'Clique no link abaixo para continuar: <button type="button" onclick="saveCSV()">Salvar em CSV</button> <a href="https://ivanmoria.github.io/dass21.html" style="color: green;">DASS-21</a>';
        warningText.style.display = "block";  // Exibe o link

        // Desabilita os botões de resposta e o botão "Próxima Pergunta"
        const buttons = document.querySelectorAll('.button');
        buttons.forEach(button => button.disabled = true);

        const nextButton = document.getElementById("next-button");
        nextButton.disabled = true;

        // Chama a função para salvar o CSV
        saveCSV();
    }
}

// Função para salvar as respostas em CSV
function saveCSV() {
    const csvContent = "data:text/csv;charset=utf-8,"
        + questions.map((q, i) => {
            const response = responses[i] || '';  // Caso não tenha resposta, coloca um valor vazio
            return `"${q.question}","${response}"`;  // Formata cada linha como 'pergunta,resposta'
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "respostas.csv");  // Nome do arquivo CSV
    document.body.appendChild(link);  // Necessário para o link ser clicável
    link.click();  // Simula o clique no link para baixar o arquivo
}

// Adicionando evento de teclado para interagir com os botões
document.addEventListener("keydown", function (event) {
    const buttons = document.querySelectorAll('.button');
    const nextButton = document.getElementById("next-button");

    // Para pressionar os botões com o teclado numérico
    if (event.key >= '1' && event.key <= '5') {
        const index = parseInt(event.key) - 1;
        if (buttons[index]) {
            buttons[index].click(); // Simula o clique no botão
        }
    }

    // Para passar para a próxima pergunta com a tecla "espaço"
    if (event.key === " ") {
        nextButton.click(); // Simula o clique no botão de próxima pergunta
    }
});





// Inicializa a primeira pergunta
showQuestion(currentQuestionIndex);
