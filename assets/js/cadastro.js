const STORAGE_KEY = 'cinelista_filmes';
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjk3YzMyYzkyYjExN2NjZDRlODE1NjNjYTMwMDBiMyIsIm5iZiI6MTc5MzcwNTI3Mi42MjgsInN1YiI6IjZhZTljNTM4ZTdkZjljZTJkZmZmOTg2NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fq7PC3aaJBfdDGqRxKcjAeFEOTtZYS-H6lsaNyzTb-s";
const TMDB_URL = "https://api.themoviedb.org/3";
const formularioApi = document.querySelector("#form-api");
const campoBuscaApi = document.querySelector("#busca-api");
const resultadosApi = document.querySelector("#resultados-api");

function escapar(texto = "") {
  const caracteresSeguros = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return String(texto).replace(
    /[&<>"']/g,
    function (caractere) {
      return caracteresSeguros[caractere];
    }
  );
}

function carregarFilmes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function salvarFilmes(filmes) { localStorage.setItem(STORAGE_KEY, JSON.stringify(filmes)); }
function escapar(texto = '') { return String(texto).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

formularioApi.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const termoPesquisado = campoBuscaApi.value.trim();

  if (!termoPesquisado) {
    resultadosApi.innerHTML =
      "<p>Digite o título de um filme.</p>";

    return;
  }

  resultadosApi.innerHTML = "<p>Pesquisando...</p>";

  try {
    const endereco = new URL(`${TMDB_URL}/search/movie`);

    endereco.searchParams.set("query", termoPesquisado);
    endereco.searchParams.set("language", "pt-BR");
    endereco.searchParams.set("include_adult", "false");
    endereco.searchParams.set("page", "1");

    const resposta = await fetch(endereco, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_TOKEN}`
      }
    });

    if (!resposta.ok) {
      throw new Error(
        `Erro ao consultar a TMDB: ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    const filmesEncontrados = dados.results.slice(0, 6);

    exibirResultadosApi(filmesEncontrados);
  } catch (erro) {
    console.error(erro);

    resultadosApi.innerHTML = `
      <p>
        Não foi possível consultar a API.
        Verifique o token e a conexão com a internet.
      </p>
    `;
  }
});

function exibirResultadosApi(filmesEncontrados) {
  if (filmesEncontrados.length === 0) {
    resultadosApi.innerHTML =
      "<p>Nenhum filme encontrado.</p>";

    return;
  }

  resultadosApi.innerHTML = filmesEncontrados
    .map(function (filme, indice) {
      const ano = filme.release_date
        ? filme.release_date.slice(0, 4)
        : "Não informado";

      const tituloOriginal =
        filme.original_title || "Não informado";

      return `
        <article>
          <h3>${escapar(filme.title)}</h3>

          <p>
            <strong>Título original:</strong>
            ${escapar(tituloOriginal)}
          </p>

          <p>
            <strong>Ano:</strong>
            ${escapar(ano)}
          </p>

          <p>
            <strong>Avaliação da TMDB:</strong>
            ${
              filme.vote_average
                ? Number(filme.vote_average)
                    .toFixed(1)
                    .replace(".", ",")
                : "Não avaliado"
            }
          </p>

          <button
            type="button"
            data-api-indice="${indice}"
          >
            Usar estes dados
          </button>
        </article>
      `;
    })
    .join("");

  const botoes = resultadosApi.querySelectorAll(
    "[data-api-indice]"
  );

  botoes.forEach(function (botao) {
    botao.addEventListener("click", function () {
      const indice = Number(botao.dataset.apiIndice);
      const filmeSelecionado = filmesEncontrados[indice];

      preencherFormularioComApi(filmeSelecionado);
    });
  });
}

function preencherFormularioComApi(filme) {
  formulario.elements.titulo.value =
    filme.title || "";

  formulario.elements.ano.value =
    filme.release_date
      ? filme.release_date.slice(0, 4)
      : "";

  formulario.elements.sinopse.value =
    filme.overview ||
    "Sinopse não disponível em português.";

  formulario.elements.genero.value = "Outro";

  feedback.textContent =
    "Dados da TMDB preenchidos. Escolha o gênero e o status, revise os dados e salve o cadastro.";

  formulario.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

const formulario = document.querySelector('#form-filme');
const feedback = document.querySelector('#feedback');
const idEdicao = new URLSearchParams(location.search).get('id');
const filmes = carregarFilmes();
const filmeEditado = filmes.find(filme => filme.id === idEdicao);

if (filmeEditado) {
  document.querySelector('#cadastro-titulo').textContent = 'Editar filme';
  formulario.querySelector('button[type="submit"]').textContent = 'Salvar alterações';
  ['titulo', 'genero', 'ano', 'status', 'nota', 'sinopse'].forEach(campo => {
    formulario.elements[campo].value = filmeEditado[campo] ?? '';
  });
}

formulario.addEventListener('submit', evento => {
  evento.preventDefault();
  if (!formulario.checkValidity()) { formulario.reportValidity(); return; }
  const dados = new FormData(formulario);
  const filme = {
    id: filmeEditado?.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    titulo: dados.get('titulo').trim(), genero: dados.get('genero'),
    ano: Number(dados.get('ano')), status: dados.get('status'),
    nota: dados.get('nota') === '' ? null : Number(dados.get('nota')),
    sinopse: dados.get('sinopse').trim()
  };
  if (filme.ano < 1888 || filme.ano > 2100 || (filme.nota !== null && (filme.nota < 0 || filme.nota > 10))) {
    feedback.textContent = 'Revise o ano e a nota informados.';
    return;
  }
  salvarFilmes(filmeEditado ? filmes.map(item => item.id === filme.id ? filme : item) : [...filmes, filme]);
  feedback.textContent = filmeEditado ? 'Filme atualizado com sucesso.' : 'Filme cadastrado com sucesso.';
  setTimeout(() => location.href = 'filmes.html', 700);
});

document.querySelector('#form-api').addEventListener('submit', async evento => {
  evento.preventDefault();
  const termo = document.querySelector('#busca-api').value.trim();
  const resultados = document.querySelector('#resultados-api');
  if (!termo) return;
  resultados.innerHTML = '<p>Pesquisando...</p>';
  try {
    const resposta = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(termo)}`);
    if (!resposta.ok) throw new Error();
    const dados = (await resposta.json()).slice(0, 5);
    resultados.innerHTML = dados.length ? dados.map(({show}, i) => `<article><h3>${escapar(show.name)}</h3><p><strong>Gênero:</strong> ${escapar(show.genres?.[0] || 'Outro')}</p><p><strong>Ano:</strong> ${escapar(show.premiered?.slice(0,4) || '')}</p><button type="button" data-indice="${i}">Usar estes dados</button></article>`).join('') : '<p>Nenhum resultado encontrado.</p>';
    resultados.querySelectorAll('[data-indice]').forEach(botao => botao.addEventListener('click', () => {
      const show = dados[Number(botao.dataset.indice)].show;
      formulario.elements.titulo.value = show.name || '';
      const genero = show.genres?.[0] || 'Outro';
      formulario.elements.genero.value = [...formulario.elements.genero.options].some(o => o.value === genero) ? genero : 'Outro';
      formulario.elements.ano.value = show.premiered?.slice(0,4) || '';
      formulario.elements.sinopse.value = (show.summary || '').replace(/<[^>]+>/g, '');
      feedback.textContent = 'Dados externos preenchidos. Revise e salve para adicionar ao localStorage.';
      formulario.scrollIntoView({behavior:'smooth'});
    }));
  } catch { resultados.innerHTML = '<p>Não foi possível consultar a API. Tente novamente.</p>'; }
});
