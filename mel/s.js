
const questions = {
    masculino: [
        {
            pergunta: "Com que frequência você cantou?",
            respostas: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
        },
        {
            pergunta: "Como foi essa experiência?",
            respostas: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa']
        },
        {
            pergunta: "Com que frequência você tocou instrumentos musicais ou digitais?",
            respostas: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
        },
        // Adicione as outras perguntas aqui
    ],
    feminino: [
        {
            pergunta: "Com que frequência você cantou?",
            respostas: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
        },
        {
            pergunta: "Como foi essa experiência?",
            respostas: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa']
        },
        {
            pergunta: "Com que frequência você tocou instrumentos musicais ou digitais?",
            respostas: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia']
        },
        // Adicione as outras perguntas aqui
    ]
};

let currentQuestionIndex = 0;
let selectedGender = 'masculino'; // Pode ser alterado com base na seleção do usuário
const currentQuestions = questions[selectedGender];

// Função para selecionar uma resposta
function selectAnswer(answerIndex) {
    const selectedAnswer = currentQuestions[currentQuestionIndex].respostas[answerIndex];
    document.getElementById("selectedAnswer").textContent = `Resposta: ${selectedAnswer}`;
}

// Função para mostrar a próxima pergunta
function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuestions.length) {
        document.getElementById("questionText").textContent = currentQuestions[currentQuestionIndex].pergunta;
        document.getElementById("selectedAnswer").textContent = "Resposta: Nenhuma";
    } else {
        // Exibir a tela final
        alert("Você completou o teste!");
    }
}

// Inicializa o teste
function startTest() {
    document.getElementById("instructionsSection").style.display = 'none';
    document.getElementById("testContainer").style.display = 'block';
    document.getElementById("questionText").textContent = currentQuestions[currentQuestionIndex].pergunta;
}





