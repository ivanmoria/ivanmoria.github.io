const perguntas = [
    "Precisão de afinação?",
    "Agilidade de Mudança",
    "Andamento",
    "Dinâmica"
];

// Função para gerar o objeto de dados com base no prefixo
function criarDados(prefixo, imagem, audioBasePath) {
    return {
        imagem: imagem,
        audio: `${audioBasePath}/${prefixo}_MAHLER_4.wav`,
        perguntas: perguntas.map(p => `${prefixo} ${p}`)
    };
}

// Definindo os dados
const dados = [
    criarDados("TA", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_24_04-12-2024"),
    criarDados("TB", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_24_04-12-2024"),
    criarDados("TC", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_24_04-12-2024"),
    criarDados("TD", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_24_04-12-2024"),
    criarDados("TE", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_24_04-12-2024"),
    criarDados("TF", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_24_04-12-2024"),
    criarDados("TB", "/media/audio/trompete/imagem2.jpeg", "/media/audio/trompete/OneDrive_23_04-12-2024"),
    criarDados("TC", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_23_04-12-2024"),
    criarDados("TD", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_23_04-12-2024"),
    criarDados("TE", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_23_04-12-2024"),
    criarDados("TF", "/media/audio/trompete/imagem1.jpeg", "/media/audio/trompete/OneDrive_23_04-12-2024")
];


// Variáveis para controlar o fluxo do teste
let indexAtual = 0;
let perguntaAtual = 0;
const respostas = [];
let notaSelecionada = null;
const participante = {};
let audioElement;

// Função chamada ao clicar no botão Iniciar
function iniciarTeste() {
    const nome = document.getElementById("nome").value.trim();
    const atuacao = document.getElementById("atuacao").value.trim();

    const data = document.getElementById("data").value.trim();
    const anosEstudo = document.getElementById("anos-estudo").value.trim();
// Coletando as opções de formação
const formacaoCheckboxes = document.querySelectorAll('input[name="formacao"]:checked');
const formacao = Array.from(formacaoCheckboxes).map(checkbox => checkbox.value);

// Verificando o campo "Outros" (caso tenha sido marcado)
const outrosTexto = document.getElementById("outros-texto").value.trim();
if (formacao.includes("Outros") && outrosTexto) {
    formacao.push(outrosTexto);  // Adiciona o valor do campo "Outros" à lista de formação
}

    if (!nome || !data || !anosEstudo) {
        alert("Por favor, preencha todas as informações do participante.");
        return;
    }

    participante.nome = nome;
    participante.anosEstudo = anosEstudo;
    participante.atuacao = atuacao;
    participante.formacao = formacao.join(", ");  // As opções de formação separadas por vírgula
    participante.data = document.getElementById("data").value.trim();
    participante.data = data;


    document.getElementById("participant-info").classList.add("hidden");
    document.getElementById("test-container").classList.remove("hidden");
    carregarDados(indexAtual, perguntaAtual);
}
// Função para carregar os dados do áudio e perguntas
function carregarDados(index, perguntaIndex) {
    if (index >= dados.length) {
        alert("Fim do teste! Você pode agora fornecer sua crítica ou sugestão.");
        
        // Exibir o campo para a crítica ou sugestão
        document.getElementById("form-critica").style.display = 'block';
        
        // Desabilitar o botão de "Próximo" para evitar que o participante avance sem enviar a crítica
        document.getElementById("proximo-btn").disabled = true;

        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement.setAttribute("controls", false);  // Desabilita controles
        return;
    }

    const audioData = dados[index];
    document.getElementById("image").src = audioData.imagem;
    audioElement = document.getElementById("audio");
    audioElement.src = audioData.audio;
    audioElement.play();

    document.getElementById("pergunta").innerText = `Pergunta ${perguntaIndex + 1}: ${audioData.perguntas[perguntaIndex]}`;
    document.getElementById("selectAnswer").textContent = "Resposta: Nenhuma";

    notaSelecionada = null;
    atualizarBotoes();
}


// Função para atualizar os botões de seleção de nota
function atualizarBotoes() {
    for (let i = 1; i <= 5; i++) {
        const button = document.getElementById(`button-${i}`);
        button.classList.toggle("selected", notaSelecionada === i);
    }
}

// Função para selecionar a nota
function selectAnswer(nota) {
    notaSelecionada = nota;
    atualizarBotoes();
    document.getElementById("selectAnswer").textContent = `Resposta: ${nota}`;
}

// Função para avançar para o próximo áudio
function proximoAudio() {
    if (notaSelecionada === null) {
        alert("Por favor, selecione uma nota antes de continuar.");
        return;
    }
    const audioData = dados[indexAtual];
    respostas.push({
        pergunta: perguntaAtual + 1,
        audio: audioData.audio,
        nota: notaSelecionada
    });

    perguntaAtual++;

    if (perguntaAtual >= audioData.perguntas.length) {
        perguntaAtual = 0;
        indexAtual++;
    }

    carregarDados(indexAtual, perguntaAtual);
}

// Função para enviar os resultados por e-mail
function enviarResultadosPorEmail() {
    // Cabeçalho para os dados do participante
    const participanteTexto = `
        Nome: ${participante.nome}
        Data: ${participante.data}
        Anos de Estudo: ${participante.anosEstudo}
        Atuação: ${participante.atuacao}
        Formação: ${participante.formacao}
    `;
    
    // Corpo da mensagem com as respostas
    let respostasTexto = "\nRespostas:\n";
    respostas.forEach(resposta => {
        // Extrair o nome do arquivo de áudio
        const nomeAudio = resposta.audio.split('/').pop();  // Pega o nome do arquivo sem o caminho completo
        respostasTexto += `Pergunta ${resposta.pergunta}: Áudio: ${nomeAudio}, Nota: ${resposta.nota}\n`;
    });
    
    // Gerar o corpo do e-mail com todos os dados
    const corpoEmail = encodeURIComponent(participanteTexto + respostasTexto);
    
    // Abrir o cliente de e-mail com a mensagem
    window.location.href = `mailto:gustavomacholi@gmail.com?subject=Resultados da Pesquisa de Flexibilidade no Trompete&body=${corpoEmail}`;
}

function exportarResultados() {
    // Cabeçalhos do CSV para informações do participante
    const participanteHeader = ["Nome", "Data", "Anos de Estudo", "Atuacao", "Formacao", "Critica/Sugestao"];
    let csvContent = "data:text/csv;charset=utf-8," + participanteHeader.join(",") + "\n";
    
    // Adicionar as informações do participante na primeira linha
    const participanteInfo = [
        participante.nome,
        participante.data,
        participante.anosEstudo,
        participante.atuacao,
        participante.formacao,
        criticaOuSugestao // Adiciona a crítica/sugestão ao CSV
    ];
    
    // Adicionar as informações do participante
    csvContent += participanteInfo.join(",") + "\n\n";  // Adiciona uma linha em branco após as informações do participante
    
    // Cabeçalhos para as respostas
    const respostasHeader = ["Pergunta", "Áudio", "Nota"];
    csvContent += respostasHeader.join(",") + "\n";
    
    // Adicionar as respostas
    respostas.forEach(resposta => {
        // Extrair apenas o nome do arquivo de áudio
        const nomeAudio = resposta.audio.split('/').pop();  // Pega o nome do arquivo sem o caminho completo

        const row = [
            resposta.pergunta,    // Pergunta
            nomeAudio,            // Nome do áudio sem o caminho completo
            resposta.nota         // Nota dada
        ];
        csvContent += row.join(",") + "\n";
    });

    // Criar o link para download do CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const nomeArquivo = `${participante.nome}_resultados.csv`;  // Nome do arquivo de resultados
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", nomeArquivo);
    document.body.appendChild(link);
    link.click();

    // Exibir alerta e desabilitar botão de exportação
    alert("Resultados exportados com sucesso!");
    document.getElementById("exportar-btn").disabled = true;
    
    // Exibir a opção de enviar os resultados por e-mail após a exportação
    document.getElementById("enviarEmail-btn").classList.remove("hidden");
}


// Adicionando a funcionalidade para enviar os resultados por e-mail
document.getElementById("enviarEmail-btn").addEventListener("click", enviarResultadosPorEmail);




// Ouvinte para capturar teclas pressionadas
document.addEventListener('keydown', function(event) {
    // Checa se o teste está ativo
    if (document.getElementById("test-container").classList.contains("hidden")) return;

    switch(event.key) {
        case '1':
            selectAnswer(1);  // Seleciona a nota 1
            break;
        case '2':
            selectAnswer(2);  // Seleciona a nota 2
            break;
        case '3':
            selectAnswer(3);  // Seleciona a nota 3
            break;
        case '4':
            selectAnswer(4);  // Seleciona a nota 4
            break;
        case '5':
            selectAnswer(5);  // Seleciona a nota 5
            break;
        case ' ':
            proximoAudio();  // Avança para o próximo áudio
            break;
    }
});


// Função para mostrar ou esconder o campo de texto "Outros"
function toggleOutroText() {
    const outrosCheckbox = document.getElementById("formacao-outros");
    const outrosTexto = document.getElementById("outros-texto");

    if (outrosCheckbox.checked) {
        outrosTexto.style.display = "block";  // Mostra o campo de texto
    } else {
        outrosTexto.style.display = "none";  // Esconde o campo de texto
    }
}


document.getElementById("welcomeModal").classList.add("show");

document.getElementById("closeModalBtn").addEventListener("click", function() {
    document.getElementById("welcomeModal").classList.remove("show");
});
function finalizarTeste() {
    // Coletar a crítica ou sugestão
    criticaOuSugestao = document.getElementById("critica").value.trim();

    if (!criticaOuSugestao) {
        alert("Por favor, insira uma crítica ou sugestão antes de finalizar.");
        return;
    }

    // Exibir os botões de exportação e envio por e-mail
    document.getElementById("exportar-btn").classList.remove("hidden");
    document.getElementById("enviarEmail-btn").classList.remove("hidden");

    // Desabilitar o botão de "Próximo" pois o teste foi finalizado
    document.getElementById("proximo-btn").disabled = true;

    // Mostrar alert para indicar que o teste foi finalizado
    alert("Teste finalizado! Você pode agora exportar os resultados ou enviá-los por e-mail.");
}
function enviarResultadosPorEmail() {
    // Cabeçalho para os dados do participante
    const participanteTexto = `
        Nome: ${participante.nome}
        Data: ${participante.data}
        Anos de Estudo: ${participante.anosEstudo}
        Atuação: ${participante.atuacao}
        Formação: ${participante.formacao}
        Crítica/Sugestão: ${criticaOuSugestao}  
    `;
    
    // Corpo da mensagem com as respostas
    let respostasTexto = "\nRespostas:\n";
    respostas.forEach(resposta => {
        // Extrair o nome do arquivo de áudio
        const nomeAudio = resposta.audio.split('/').pop();  // Pega o nome do arquivo sem o caminho completo
        respostasTexto += `Pergunta ${resposta.pergunta}: Áudio: ${nomeAudio}, Nota: ${resposta.nota}\n`;
    });
    
    // Gerar o corpo do e-mail com todos os dados
    const corpoEmail = encodeURIComponent(participanteTexto + respostasTexto);
    
    // Abrir o cliente de e-mail com a mensagem
    window.location.href = `mailto:gustavomacholi@gmail.com?subject=Resultados da Pesquisa de Flexibilidade no Trompete&body=${corpoEmail}`;
}
