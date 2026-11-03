const STORAGE_KEY = 'cinelista_filmes';
const filmesIniciais = [
  { id: '1', titulo: 'Interestelar', genero: 'Ficção científica', ano: 2014, status: 'Assistido', nota: 9.5, sinopse: 'Uma equipe viaja pelo espaço em busca de um novo lar para a humanidade.' },
  { id: '2', titulo: 'O Show de Truman', genero: 'Drama', ano: 1998, status: 'Quero assistir', nota: null, sinopse: 'A vida de Truman é transmitida sem que ele saiba.' },
  { id: '3', titulo: 'De Volta para o Futuro', genero: 'Ficção científica', ano: 1985, status: 'Quero assistir', nota: null, sinopse: 'Uma viagem no tempo muda o passado e ameaça o futuro.' }
];

function carregarFilmes() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (!dados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filmesIniciais));
    return filmesIniciais;
  }
  try { return JSON.parse(dados); } catch { return []; }
}

function escapar(texto = '') {
  return String(texto).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

const filmes = carregarFilmes();
document.querySelector('#resumo-colecao').innerHTML = `
  <li><strong>${filmes.length}</strong> filmes cadastrados</li>
  <li><strong>${filmes.filter(f => f.status === 'Assistido').length}</strong> filmes assistidos</li>
  <li><strong>${filmes.filter(f => f.status !== 'Assistido').length}</strong> filmes para assistir</li>`;

document.querySelector('#destaques').innerHTML = filmes.slice(0, 3).map(filme => `
  <article>
    <h3>${escapar(filme.titulo)}</h3>
    <p><strong>Gênero:</strong> ${escapar(filme.genero)}</p>
    <p><strong>Ano:</strong> ${filme.ano}</p>
    <p><strong>Status:</strong> ${escapar(filme.status)}</p>
    <a href="detalhes.html?id=${encodeURIComponent(filme.id)}">Ver detalhes</a>
  </article>`).join('') || '<p>Nenhum filme cadastrado.</p>';
