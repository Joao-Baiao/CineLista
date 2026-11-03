const STORAGE_KEY = 'cinelista_filmes';
function carregarFilmes() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function salvarFilmes(filmes) { localStorage.setItem(STORAGE_KEY, JSON.stringify(filmes)); }
function escapar(texto = '') { return String(texto).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function formatarNota(nota) { return nota === null || nota === '' ? 'Não avaliado' : Number(nota).toFixed(1).replace('.', ','); }

const corpo = document.querySelector('#corpo-filmes');
const pesquisa = document.querySelector('#pesquisa');
const filtro = document.querySelector('#filtro-status');
const ordenacao = document.querySelector('#ordenacao');
const mensagem = document.querySelector('#mensagem-lista');

function renderizar() {
  const termo = pesquisa.value.trim().toLocaleLowerCase('pt-BR');
  let filmes = carregarFilmes().filter(filme => filme.titulo.toLocaleLowerCase('pt-BR').includes(termo) && (!filtro.value || filme.status === filtro.value));
  filmes.sort((a,b) => ordenacao.value === 'za' ? b.titulo.localeCompare(a.titulo,'pt-BR') : ordenacao.value === 'ano' ? b.ano-a.ano : ordenacao.value === 'nota' ? (b.nota??-1)-(a.nota??-1) : a.titulo.localeCompare(b.titulo,'pt-BR'));
  corpo.innerHTML = filmes.map(filme => `<tr><td>${escapar(filme.titulo)}</td><td>${escapar(filme.genero)}</td><td>${filme.ano}</td><td>${escapar(filme.status)}</td><td>${formatarNota(filme.nota)}</td><td><a href="detalhes.html?id=${encodeURIComponent(filme.id)}">Ver detalhes</a> <a href="cadastro.html?id=${encodeURIComponent(filme.id)}">Editar</a> <button type="button" data-excluir="${escapar(filme.id)}">Excluir</button></td></tr>`).join('');
  mensagem.textContent = filmes.length ? `${filmes.length} filme(s) encontrado(s).` : 'Nenhum filme encontrado.';
}

document.querySelector('#form-consulta').addEventListener('submit', e => { e.preventDefault(); renderizar(); });
pesquisa.addEventListener('input', renderizar);
filtro.addEventListener('change', renderizar);
ordenacao.addEventListener('change', renderizar);
corpo.addEventListener('click', evento => {
  const id = evento.target.dataset.excluir;
  if (!id || !confirm('Deseja realmente excluir este filme?')) return;
  salvarFilmes(carregarFilmes().filter(filme => filme.id !== id));
  renderizar();
});
renderizar();
