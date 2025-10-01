const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dados das perguntas
const questions = [
    { question: "Nome", answers: [] },
    { question: "Idade", answers: [] },
    { question: "Gênero", answers: [] },
    { question: "Data do teste", answers: [] },
    { question: "Apresenta algum problema de audição?", answers: ['Sim', 'Não'] },
    { question: "Acompanhamento médico?", answers: ['Sim', 'Não'] },
    { question: "Toma alguma medicação?", answers: ['Sim', 'Não'] },
    { question: "Apresenta algum diagnóstico em alguma condição de saúde?", answers: ['Sim', 'Não'] },
    { question: "Formação escolar/acadêmica", answers: [] },
    { question: "Participa de atividades musicais?", answers: ['Sim', 'Não'] },
    { question: "Sons que gosta", answers: [] },
    { question: "Sons que não gosta", answers: [] },
    { question: "Possui iniciação musical?", answers: ['Sim', 'Não'] },
    { question: "Toca algum instrumento?", answers: ['Sim', 'Não'] },
    { question: "Canta?", answers: ['Sim', 'Não'] },
    { question: "Com que frequência você cantou?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Como foi essa experiência?", answers: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa'] },
    { question: "Com que frequência você tocou instrumentos musicais ou digitais?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Como foi essa experiência?", answers: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa'] },
    { question: "Quantas vezes você ouviu música?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Como foi essa experiência?", answers: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa'] },
    { question: "Alguém da sua família ou residência toca algum instrumento musical?", answers: ['Sim', 'Não'] },
    { question: "Quantas vezes você presenciou alguém tocar instrumentos?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Como foi essa experiência?", answers: ['Incrível', 'Muito positiva', 'Pouco positiva', 'Neutra', 'Negativa'] },
    { question: "Qual o tipo de música você e/ou sua família ouviu?", answers: ['Regionalista/Folclore', 'Clássica', 'Jazz', 'Músicas infantis', 'Pop Music', 'Relaxamento (New-Age)', 'Dance Music'] },
    { question: "Com que frequência você ouviu música regionalista ou do seu folclore?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Com que frequência você ouviu música clássica?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Com que frequência você ouviu jazz?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Com que frequência você ouviu músicas infantis?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Com que frequência você ouviu pop music?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Com que frequência você ouviu música de relaxamento?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Com que frequência você ouviu dance music?", answers: ['Todos os dias', 'Quase todos os dias', 'Alguns dias', 'Um dia', 'Nenhum dia'] },
    { question: "Você ouviu outro tipo de música, qual foi e com que frequência?", answers: ['Sim', 'Não'] }
];

// Endpoint para obter as perguntas
app.get('/api/questions', (req, res) => {
    res.json(questions);
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
