const STORAGE_KEY = 'cinelista_filmes';
function carregarFilmes() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function escapar(texto = '') { return String(texto).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function formatarNota(nota) { return nota === null || nota === '' ? 'Não avaliado' : Number(nota).toFixed(1).replace('.', ','); }

const id = new URLSearchParams(location.search).get('id');
const filme = carregarFilmes().find(item => item.id === id);
const conteudo = document.querySelector('#detalhes-filme');
if (!filme) {
  conteudo.innerHTML = '<h2>Filme não encontrado</h2><p><a href="filmes.html">Voltar para a lista</a></p>';
} else {
  conteudo.innerHTML = `<header><h2>${escapar(filme.titulo)}</h2></header><dl><dt>Gênero</dt><dd>${escapar(filme.genero)}</dd><dt>Ano</dt><dd>${filme.ano}</dd><dt>Status</dt><dd>${escapar(filme.status)}</dd><dt>Nota</dt><dd>${formatarNota(filme.nota)}</dd><dt>Sinopse</dt><dd>${escapar(filme.sinopse || 'Não informada')}</dd></dl><p><a href="cadastro.html?id=${encodeURIComponent(filme.id)}">Editar</a> <a href="filmes.html">Voltar</a></p>`;
}
