const STORAGE_KEY = 'cinelista_filmes';

function carregarFilmes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function salvarFilmes(filmes) { localStorage.setItem(STORAGE_KEY, JSON.stringify(filmes)); }
function escapar(texto = '') { return String(texto).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

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
