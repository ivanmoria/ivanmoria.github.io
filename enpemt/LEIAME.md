# Presença XXVI ENPEMT

Lista de presença por QR code para o XXVI ENPEMT (8 a 10/10/2026, Escola de Música da UFMG), com o XII ENEMT no dia 11/10.
Funciona como site estático (GitHub Pages). Os dados ficam no Google Sheets, por meio de um Apps Script gratuito, sem servidor próprio.

```
Google Forms ──► Planilha de respostas ◄──► Apps Script (web app) ◄──► páginas do GitHub Pages
                  ├─ aba de respostas (+ coluna "ID ENPEMT")          ├─ crachas.html  (imprime QR)
                  └─ aba "Presenças" (criada sozinha)                  ├─ checkin.html  (monitor lê QR)
                                                                       └─ painel.html   (estados, atividades, carga horária)
Planilha publicada da programação (a mesma do site da UBAM) ──► lista de atividades do check-in
```

## Arquivos

| Arquivo | Para quê |
|---|---|
| `index.html` | Início: conectar à planilha, testar com o .xlsx e gerar o link de configuração dos monitores |
| `checkin.html` | Celular do monitor: escolhe a atividade da programação e lê o QR do crachá. Também busca por nome e funciona sem internet |
| `crachas.html` | Crachás (8 por A4) ou etiquetas adesivas (21 por A4) com QR individual |
| `painel.html` | Presentes por estado, região e vínculo; pessoas por atividade; carga horária de cada um (CSV para certificados) |
| `config.js` | Nome do evento e endereço da planilha da programação |
| `programacao-reserva.json` | Cópia da programação de 06/10, usada se a planilha estiver fora do ar |
| `apps-script/Codigo.gs` | Código para colar no Apps Script da planilha de inscrições |

## Montagem (cerca de 15 minutos, uma vez só)

1. **Abra a planilha de respostas** do Google Forms. No Forms: aba *Respostas* → *Vincular ao Planilhas*.
2. Na planilha: **Extensões → Apps Script**. Apague o conteúdo, cole o `apps-script/Codigo.gs` e troque `CHAVE` por uma senha longa.
   **Não** coloque essa senha no GitHub.
3. No editor, selecione a função **`instalarGatilho`** e clique em **Executar**. Autorize o acesso (*Avançado → Acessar*).
   Isso cria a coluna **ID ENPEMT** com um código para cada inscrito. Inscrições futuras recebem o código sozinhas.
4. **Implantar → Nova implantação → Tipo: App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
   - Copie o endereço que termina em `/exec`.
5. Abra o `index.html`, cole o endereço e a chave e clique em **Salvar e testar**. Deve aparecer "Conexão OK — 119 inscritos" (ou o número atual).
6. Em **Crachás com QR**, imprima. Os códigos definitivos são os do passo 3; não use crachás impressos no modo teste.
7. Em **Link para os monitores**, copie o link e envie em particular a cada monitor. Ele só precisa abrir uma vez.

> Alterou o `Codigo.gs` depois? Vá em *Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão*.
> Assim o endereço `/exec` continua o mesmo.

### Inscrições duplicadas

- Linhas cujo nome começa com **"DUPLICADA"** são ignoradas e não recebem crachá.
- Duas linhas com o **mesmo nome** viram uma pessoa só, com o mesmo código (ex.: quem enviou o formulário de novo para completar o pagamento).
- O e-mail **não** é usado para juntar pessoas, porque há pessoas diferentes que usam o mesmo e-mail.

## No evento

- **Antes de abrir as portas:** o monitor abre o link, digita o nome e toca na atividade. A lista mostra o dia de hoje e destaca em azul o que está acontecendo "agora".
- **Na porta:** aponte a câmera para o QR.
  - Verde com bipe: registrado.
  - Amarelo com ✓: registrado, e a pessoa tem um pedido de **acessibilidade** (o texto aparece na tela).
  - Amarelo com !: a pessoa já estava registrada nesta atividade.
  - Vermelho: código desconhecido.
- **Credenciamento:** o Forms não perguntou o estado. Por isso, nas atividades de *Credenciamento*, quem ainda não tem estado faz o celular mostrar os botões das UFs. Pergunte e toque. Se a fila apertar, ler o próximo crachá registra a pessoa anterior sem estado.
- **Esqueceu o crachá:** use "Busque pelo nome". Se a pessoa não se inscreveu, use "Pessoa não está na lista".
- **Atividade que não está na programação:** use "Atividade que não está na lista" e digite o nome.
- **Sem internet:** continue registrando. O selo do topo mostra "N aguardando envio" e o celular envia sozinho quando a conexão voltar.
  Não limpe os dados do navegador antes de ver "Tudo salvo".

## Programação

O check-in lê a mesma planilha publicada que monta a programação do site da UBAM. Se a programação mudar lá, o celular recebe a versão nova na próxima vez que abrir a tela de atividades.
Almoço e coffee break não aparecem. Workshops e Grupos de Trabalho simultâneos aparecem um por sala.

## Teste antes do evento

No `index.html`:
- **Testar com arquivo .xlsx/.csv:** usa a planilha baixada do Forms, só naquele navegador (nada é enviado). Os códigos são provisórios.
- **Usar modo demonstração:** 120 inscritos de exemplo ("Exemplo de nome 001"…) e presenças de exemplo, para treinar monitores e ver o painel cheio.

Para sair de um modo de teste, conecte com o endereço e a chave reais.

## Certificados

No painel, **Baixar frequência (CSV)** gera uma linha por pessoa com: atividades assistidas, carga horária (soma da duração de cada atividade diferente da programação) e presença em cada dia.

## Privacidade

- Nenhum nome ou e-mail fica no GitHub. O `.gitignore` bloqueia `.xlsx`, `.csv` e `.docx` desta pasta.
- O Apps Script entrega só nome, e-mail, vínculo e acessibilidade. Os links de comprovantes e declarações nunca saem da planilha.
- O QR do crachá contém só um código (ex.: `ENPEMT-K7F3QX`).
- Depois do evento, troque a `CHAVE` no Apps Script (e publique uma nova versão) para desativar os links dos monitores.

## Publicar no GitHub Pages

No `.gitignore` da raiz, descomente `!enpemt/` e `!enpemt/**`. O site fica em `https://ivanmoria.github.io/enpemt/`.
A câmera só funciona em `https://` (o GitHub Pages já usa) ou em `localhost`.
