const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js';

let pdfDoc = null,
    currentPage = 1,
    totalPages = 0,
    pageRendering = false,
    pageNumPending = null;

const viewerContainer = document.getElementById('viewerContainer');
const pageNumElem = document.getElementById('pageNum');
const pageCountElem = document.getElementById('pageCount');
const bookmarkList = document.getElementById('bookmarkList');

const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');

const pdfButtons = document.querySelectorAll('#pdfButtons button');

let currentPdfUrl = null;

// Função para carregar e renderizar PDF
async function loadPdf(url) {
  try {
    pdfDoc = await pdfjsLib.getDocument(url).promise;
    totalPages = pdfDoc.numPages;
    currentPage = 1;

    pageCountElem.textContent = totalPages;
    pageNumElem.textContent = currentPage;

    renderPage(currentPage);
    loadOutline();
  } catch (error) {
    bookmarkList.textContent = 'Erro ao carregar PDF: ' + error.message;
    viewerContainer.innerHTML = '';
    pageNumElem.textContent = 0;
    pageCountElem.textContent = 0;
  }
}

// Renderiza uma página do PDF no canvas
function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(page => {
    const scale = 1.3;
    const viewport = page.getViewport({ scale: scale });

    viewerContainer.innerHTML = '';

    // Criar canvas para página 1
    const canvas1 = document.createElement('canvas');
    const ctx1 = canvas1.getContext('2d');
    canvas1.height = viewport.height;
    canvas1.width = viewport.width;

    // Criar canvas para página 2 (se existir)
    let canvas2 = null;
    let ctx2 = null;
    if (num < totalPages) {
      canvas2 = document.createElement('canvas');
      ctx2 = canvas2.getContext('2d');
      canvas2.height = viewport.height;
      canvas2.width = viewport.width;
    }

    viewerContainer.appendChild(canvas1);
    if (canvas2) viewerContainer.appendChild(canvas2);

    const renderContext1 = { canvasContext: ctx1, viewport: viewport };
    const renderContext2 = canvas2 ? { canvasContext: ctx2, viewport: viewport } : null;

    const renderTask1 = page.render(renderContext1);

    renderTask1.promise.then(() => {
      if (canvas2) {
        pdfDoc.getPage(num + 1).then(page2 => {
          page2.render(renderContext2).promise.then(() => {
            pageRendering = false;
            pageNumElem.textContent = currentPage;
            if (pageNumPending !== null) {
              renderPage(pageNumPending);
              pageNumPending = null;
            }
          });
        });
      } else {
        pageRendering = false;
        pageNumElem.textContent = currentPage;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      }
    });
  });
}

function queueRenderPage(num) {
  if (num < 1 || num > totalPages) return;

  if (pageRendering) {
    pageNumPending = num;
  } else {
    currentPage = num;
    renderPage(num);
  }
}

// Navegação dos botões
prevPageBtn.addEventListener('click', () => {
  if (currentPage <= 1) return;
  queueRenderPage(currentPage - 2 >= 1 ? currentPage - 2 : 1);
});

nextPageBtn.addEventListener('click', () => {
  if (currentPage >= totalPages) return;
  queueRenderPage(currentPage + 2 <= totalPages ? currentPage + 2 : totalPages);
});

// Carregar e mostrar bookmarks (outline)
async function loadOutline() {
  try {
    const outline = await pdfDoc.getOutline();
    if (!outline || outline.length === 0) {
      bookmarkList.innerHTML = '<i>Este documento não possui bookmarks.</i>';
      return;
    }

    // Limpar lista atual
    bookmarkList.innerHTML = '';
    const ul = document.createElement('ul');

    // Função recursiva para criar bookmarks hierárquicos
    function createBookmarkItems(items, parentUl) {
      items.forEach(item => {
        // Ignorar bookmarks regionais
        if (item.title.toLowerCase().includes('region')) {
          const li = document.createElement('li');
          li.textContent = item.title;
          li.classList.add('region-highlight');
          parentUl.appendChild(li);
          // não cria sublista para region
          return;
        }

        const li = document.createElement('li');
        li.textContent = item.title;
        li.style.cursor = 'pointer';

        li.addEventListener('click', async () => {
          if (item.dest) {
            let dest = await pdfDoc.getDestination(item.dest);
            if (dest) {
              let pageIndex = dest[0];
              const pageNumber = pdfDoc._pageIndexMap.get(pageIndex) || (pageIndex + 1);
              // Ajustar página (considerando duplas)
              // Navegar para a página da bookmark - par se for página ímpar
              let goToPage = pageNumber;
              if (goToPage % 2 !== 0) goToPage = goToPage; // página ímpar, mostra ímpar + próxima
              else goToPage = goToPage; // página par, mostra par + próxima
              queueRenderPage(goToPage);
            }
          }
        });

        parentUl.appendChild(li);
        if (item.items && item.items.length > 0) {
          const subUl = document.createElement('ul');
          li.appendChild(subUl);
          createBookmarkItems(item.items, subUl);
        }
      });
    }

    createBookmarkItems(outline, ul);
    bookmarkList.appendChild(ul);

  } catch (err) {
    bookmarkList.textContent = 'Erro ao carregar bookmarks: ' + err.message;
  }
}

// Eventos dos botões para carregar PDFs
pdfButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const pdfName = btn.getAttribute('data-pdf');
    if (pdfName === currentPdfUrl) return; // mesmo pdf, não recarrega
    currentPdfUrl = pdfName;
    loadPdf(pdfName);
  });
});
