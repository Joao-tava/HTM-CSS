// ─── CLASSE: Aluno ───────────────────────────────────────────────────────
class Aluno {
  constructor(nome, idade, email, nota) {
    this.nome   = nome;
    this.idade  = idade;
    this.email  = email;
    this.nota   = nota;
    this.status = null; // preenchido pelo AlunoService
  }
}

// ─── CLASSE: AlunoService ────────────────────────────────────────────────
class AlunoService {

  // Regra 1 – Nome obrigatório
  validarNome(nome) {
    if (!nome || nome.trim().length === 0)
      throw new Error('Nome é obrigatório e não pode ser vazio.');
    if (nome.trim().length < 3)
      throw new Error('Nome deve ter pelo menos 3 caracteres.');
    if (nome.trim().length > 100)
      throw new Error('Nome deve ter no máximo 100 caracteres.');
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(nome.trim()))
      throw new Error('Nome deve conter apenas letras.');
  }

  // Regra 2 – Idade válida (16–100)
  validarIdade(idade) {
    const n = Number(idade);
    if (idade === '' || idade === null || idade === undefined || isNaN(n))
      throw new Error('Idade é obrigatória e deve ser um número.');
    if (!Number.isInteger(n))
      throw new Error('Idade deve ser um número inteiro.');
    if (n < 16)
      throw new Error('Idade deve ser maior ou igual a 16.');
    if (n > 100)
      throw new Error('Idade deve ser menor ou igual a 100.');
  }

  // Regra 3 – Email válido
  validarEmail(email) {
    if (!email || email.trim().length === 0)
      throw new Error('Email é obrigatório.');
    if (!email.includes('@'))
      throw new Error("Email inválido: deve conter '@'.");
    if (!email.includes('.'))
      throw new Error("Email inválido: deve conter '.'.");
  }

  // Regra 4 – Nota válida (0–10)
  validarNota(nota) {
    if (nota === '' || nota === null || nota === undefined)
      throw new Error('Nota é obrigatória.');
    const n = Number(nota);
    if (isNaN(n))
      throw new Error('Nota deve ser um número.');
    if (n < 0)
      throw new Error('Nota deve ser maior ou igual a 0.');
    if (n > 10)
      throw new Error('Nota deve ser menor ou igual a 10.');
  }

  // Regra 5 – Cálculo de status (≥ 7 → Aprovado)
  calcularStatus(nota) {
    return Number(nota) >= 7 ? 'Aprovado' : 'Reprovado';
  }

  // Verifica email duplicado na lista de alunos
  emailDuplicado(email, excludeIndex = -1) {
    return alunos.some((a, i) =>
      i !== excludeIndex &&
      a.email.toLowerCase() === email.trim().toLowerCase()
    );
  }

  // Função principal: valida + cadastra + retorna aluno com status
  cadastrarAluno(nome, idade, email, nota) {
    this.validarNome(nome);
    this.validarIdade(Number(idade));
    this.validarEmail(email);
    this.validarNota(Number(nota));

    const aluno  = new Aluno(nome.trim(), Number(idade), email.trim().toLowerCase(), Number(nota));
    aluno.status = this.calcularStatus(Number(nota));
    return aluno;
  }
}

// ─── STATE ───────────────────────────────────────────────────────────────
let alunos = [];
let editIndex = null;
let nextId = 1;
const alunoService = new AlunoService();

// ─── FORM LOGIC ─────────────────────────────────────────────────────────
function onNotaChange() {
  clearErr('nota');
  const val = document.getElementById('f-nota').value;
  const prev = document.getElementById('status-preview');
  if (val === '' || isNaN(Number(val))) {
    prev.innerHTML = '<span style="color:var(--muted)">Informe a nota para calcular</span>';
    return;
  }
  const n = Number(val);
  if (n < 0 || n > 10) {
    prev.innerHTML = '<span style="color:var(--red)">Nota inválida</span>';
    return;
  }
  prev.innerHTML = statusBadge(alunoService.calcularStatus(n));
}

function onEditNotaChange() {
  const val = document.getElementById('e-nota').value;
  const prev = document.getElementById('e-status-preview');
  if (val === '' || isNaN(Number(val))) { prev.innerHTML = '<span style="color:var(--muted)">—</span>'; return; }
  const n = Number(val);
  if (n < 0 || n > 10) { prev.innerHTML = '<span style="color:var(--red)">Nota inválida</span>'; return; }
  prev.innerHTML = statusBadge(alunoService.calcularStatus(n));
}

function statusBadge(status) {
  const cls = status === 'Aprovado' ? 'badge-aprovado' : 'badge-reprovado';
  const icon = status === 'Aprovado' ? '✓' : '✗';
  return `<span class="status-badge ${cls}">${icon} ${status}</span>`;
}

function showErr(field, msg) {
  const el = document.getElementById('err-' + field);
  const inp = document.getElementById('f-' + field) || document.getElementById('e-' + field);
  if (el) el.textContent = msg;
  if (inp) inp.classList.add('error');
}
function clearErr(field) {
  const el = document.getElementById('err-' + field);
  const inp = document.getElementById('f-' + field) || document.getElementById('e-' + field);
  if (el) el.textContent = '';
  if (inp) inp.classList.remove('error');
}

function submitForm() {
  const nome  = document.getElementById('f-nome').value;
  const idade = document.getElementById('f-idade').value;
  const email = document.getElementById('f-email').value;
  const nota  = document.getElementById('f-nota').value;

  ['nome','idade','email','nota'].forEach(f => clearErr(f));

  // Usa AlunoService para validar e cadastrar
  try {
    alunoService.validarNome(nome);
  } catch(e) { showErr('nome', e.message); }

  try {
    alunoService.validarIdade(Number(idade));
  } catch(e) { showErr('idade', e.message); }

  try {
    alunoService.validarEmail(email);
  } catch(e) { showErr('email', e.message); }

  try {
    alunoService.validarNota(Number(nota));
  } catch(e) { showErr('nota', e.message); }

  // Checa se ainda há erros visíveis antes de continuar
  const temErro = ['nome','idade','email','nota'].some(f =>
    document.getElementById('err-' + f).textContent !== ''
  );
  if (temErro) return;

  if (alunoService.emailDuplicado(email)) {
    showErr('email', 'Email já cadastrado.');
    return;
  }

  // cadastrarAluno() já valida + cria + calcula status
  const novoAluno = alunoService.cadastrarAluno(nome, Number(idade), email, Number(nota));
  novoAluno.id = nextId++;
  alunos.push(novoAluno);

  resetForm();
  updateStats();
  toast('Aluno cadastrado com sucesso!', 'success');
  switchTab('lista');
}

function resetForm() {
  ['f-nome','f-idade','f-email','f-nota'].forEach(id => document.getElementById(id).value = '');
  ['nome','idade','email','nota'].forEach(f => clearErr(f));
  document.getElementById('status-preview').innerHTML = '<span style="color:var(--muted)">Informe a nota para calcular</span>';
  editIndex = null;
  document.getElementById('form-mode-label').textContent = 'NOVO CADASTRO';
}

// ─── TABLE ───────────────────────────────────────────────────────────────
function renderTable() {
  const q = (document.getElementById('search-input').value || '').toLowerCase();
  const filtered = alunos.filter(a =>
    a.nome.toLowerCase().includes(q) ||
    a.email.toLowerCase().includes(q) ||
    String(a.nota).includes(q)
  );
  const tbody = document.getElementById('table-body');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon">${q ? '🔍' : '📭'}</div>${q ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado ainda.'}</div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map((a, i) => {
    const realIdx = alunos.indexOf(a);
    return `<tr>
      <td><span style="color:var(--muted)">#${a.id}</span></td>
      <td><strong>${a.nome}</strong></td>
      <td>${a.idade}</td>
      <td style="color:var(--muted)">${a.email}</td>
      <td><strong style="color:${a.nota >= 5 ? 'var(--green)' : 'var(--red)'}">${a.nota.toFixed(1)}</strong></td>
      <td>${statusBadge(a.status)}</td>
      <td><div class="td-actions">
        <button class="btn btn-edit btn-sm" onclick="openEdit(${realIdx})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAluno(${realIdx})">Excluir</button>
      </div></td>
    </tr>`;
  }).join('');
}

function updateStats() {
  const total = alunos.length;
  const aprov = alunos.filter(a => a.status === 'Aprovado').length;
  const reprov = total - aprov;
  const media = total > 0 ? (alunos.reduce((s, a) => s + a.nota, 0) / total).toFixed(1) : '—';
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-aprov').textContent = aprov;
  document.getElementById('stat-reprov').textContent = reprov;
  document.getElementById('stat-media').textContent = media;
  renderTable();
}

function deleteAluno(idx) {
  if (!confirm(`Excluir "${alunos[idx].nome}"?`)) return;
  alunos.splice(idx, 1);
  updateStats();
  toast('Aluno removido.', 'error');
}

// ─── EDIT MODAL ──────────────────────────────────────────────────────────
function openEdit(idx) {
  editIndex = idx;
  const a = alunos[idx];
  document.getElementById('e-nome').value  = a.nome;
  document.getElementById('e-idade').value = a.idade;
  document.getElementById('e-email').value = a.email;
  document.getElementById('e-nota').value  = a.nota;
  document.getElementById('e-status-preview').innerHTML = statusBadge(a.status);
  ['e-nome','e-idade','e-email','e-nota'].forEach(f => { clearErr(f); document.getElementById(f).classList.remove('error'); });
  document.getElementById('edit-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('edit-modal').classList.remove('open');
  editIndex = null;
}

function saveEdit() {
  const nome  = document.getElementById('e-nome').value;
  const idade = document.getElementById('e-idade').value;
  const email = document.getElementById('e-email').value;
  const nota  = document.getElementById('e-nota').value;

  ['e-nome','e-idade','e-email','e-nota'].forEach(f => {
    document.getElementById('err-' + f).textContent = '';
    document.getElementById(f).classList.remove('error');
  });

  const setEditErr = (field, msg) => {
    document.getElementById('err-e-' + field).textContent = msg;
    document.getElementById('e-' + field).classList.add('error');
  };

  try { alunoService.validarNome(nome);         } catch(e) { setEditErr('nome',  e.message); }
  try { alunoService.validarIdade(Number(idade));} catch(e) { setEditErr('idade', e.message); }
  try { alunoService.validarEmail(email);        } catch(e) { setEditErr('email', e.message); }
  try { alunoService.validarNota(Number(nota));  } catch(e) { setEditErr('nota',  e.message); }

  const temErro = ['nome','idade','email','nota'].some(f =>
    document.getElementById('err-e-' + f).textContent !== ''
  );
  if (temErro) return;

  if (alunoService.emailDuplicado(email, editIndex)) {
    setEditErr('email', 'Email já cadastrado.');
    return;
  }

  const updated = alunoService.cadastrarAluno(nome, Number(idade), email, Number(nota));
  alunos[editIndex] = { ...alunos[editIndex], ...updated };
  closeModal();
  updateStats();
  toast('Aluno atualizado com sucesso!', 'success');
}

// ─── TABS ─────────────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.tab-btn')[['cadastro','lista','testes'].indexOf(name)].classList.add('active');
  if (name === 'lista') updateStats();
}

// ─── TOAST ───────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = (type === 'success' ? '✓ ' : '✗ ') + msg;
  el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

function runTests() {
  const savedAlunos = [...alunos];
  alunos = [];

  const svc = alunoService;

  // Helpers internos
  function assertThrows(fn, keyword) {
    try { fn(); return [false, 'Nenhum erro lançado', keyword || '(erro esperado)']; }
    catch(e) {
      if (keyword && !e.message.toLowerCase().includes(keyword.toLowerCase()))
        return [false, e.message, keyword];
      return [true, e.message, keyword || '(erro esperado)'];
    }
  }
  function assertNoThrow(fn) {
    try { fn(); return [true, 'OK', 'OK']; }
    catch(e) { return [false, e.message, 'sem erro']; }
  }
  function assertEqual(a, b) {
    return [a === b, String(a), String(b)];
  }

  const groups = [
    {
      name: '📝 Validação de Nome',
      tests: [
        { name: 'Rejeita nome vazio',                    fn: () => assertThrows(() => svc.validarNome(''), 'obrigatório') },
        { name: 'Rejeita nome com menos de 3 caracteres',fn: () => assertThrows(() => svc.validarNome('Jo'), '3') },
        { name: 'Rejeita nome com mais de 100 caracteres',fn: () => assertThrows(() => svc.validarNome('A'.repeat(101)), '100') },
        { name: 'Rejeita nome com números/símbolos',     fn: () => assertThrows(() => svc.validarNome('João123'), 'letras') },
        { name: 'Aceita nome válido "Maria Silva"',      fn: () => assertNoThrow(() => svc.validarNome('Maria Silva')) },
        { name: 'Aceita nome com acento "José"',         fn: () => assertNoThrow(() => svc.validarNome('José')) },
      ]
    },
    {
      name: '🔢 Validação de Idade (16–100)',
      tests: [
        { name: 'Rejeita idade vazia',           fn: () => assertThrows(() => svc.validarIdade(NaN), 'número') },
        { name: 'Rejeita idade 15 (menor que 16)',fn: () => assertThrows(() => svc.validarIdade(15), '16') },
        { name: 'Rejeita idade negativa (-1)',    fn: () => assertThrows(() => svc.validarIdade(-1), '16') },
        { name: 'Rejeita idade > 100 (101)',      fn: () => assertThrows(() => svc.validarIdade(101), '100') },
        { name: 'Rejeita idade decimal (20.5)',   fn: () => assertThrows(() => svc.validarIdade(20.5), 'inteiro') },
        { name: 'Aceita idade válida (20)',        fn: () => assertNoThrow(() => svc.validarIdade(20)) },
        { name: 'Aceita idade limite (100)',       fn: () => assertNoThrow(() => svc.validarIdade(100)) },
        { name: 'Aceita idade limite (16)',        fn: () => assertNoThrow(() => svc.validarIdade(16)) },
      ]
    },
    {
      name: '📧 Validação de Email',
      tests: [
        { name: 'Rejeita email vazio',         fn: () => assertThrows(() => svc.validarEmail(''), 'obrigatório') },
        { name: 'Rejeita email sem @',          fn: () => assertThrows(() => svc.validarEmail('emailsemarroba.com'), '@') },
        { name: 'Rejeita email sem ponto',      fn: () => assertThrows(() => svc.validarEmail('email@sempontoCom'), '.') },
        { name: 'Aceita email válido',          fn: () => assertNoThrow(() => svc.validarEmail('aluno@escola.com')) },
        { name: 'Aceita email com subdomínio',  fn: () => assertNoThrow(() => svc.validarEmail('user@mail.escola.edu.br')) },
      ]
    },
    {
      name: '📊 Validação de Nota (0–10)',
      tests: [
        { name: 'Rejeita nota vazia',           fn: () => assertThrows(() => svc.validarNota(''), 'obrigatória') },
        { name: 'Rejeita nota negativa (-0.1)', fn: () => assertThrows(() => svc.validarNota(-0.1), '0') },
        { name: 'Rejeita nota > 10 (10.1)',     fn: () => assertThrows(() => svc.validarNota(10.1), '10') },
        { name: 'Aceita nota 0 (mínimo)',        fn: () => assertNoThrow(() => svc.validarNota(0)) },
        { name: 'Aceita nota 10 (máximo)',       fn: () => assertNoThrow(() => svc.validarNota(10)) },
        { name: 'Aceita nota decimal (7.5)',     fn: () => assertNoThrow(() => svc.validarNota(7.5)) },
      ]
    },
    {
      name: '🎯 Regra de Negócio — Status (≥ 7 = Aprovado)',
      tests: [
        { name: 'Nota = 7 → Aprovado',    fn: () => assertEqual(svc.calcularStatus(7),    'Aprovado') },
        { name: 'Nota = 10 → Aprovado',   fn: () => assertEqual(svc.calcularStatus(10),   'Aprovado') },
        { name: 'Nota = 6.9 → Reprovado', fn: () => assertEqual(svc.calcularStatus(6.9),  'Reprovado') },
        { name: 'Nota = 0 → Reprovado',   fn: () => assertEqual(svc.calcularStatus(0),    'Reprovado') },
        { name: 'Nota = 7.1 → Aprovado',  fn: () => assertEqual(svc.calcularStatus(7.1),  'Aprovado') },
        { name: 'Nota = 5 → Reprovado',   fn: () => assertEqual(svc.calcularStatus(5),    'Reprovado') },
      ]
    },
    {
      name: '✅ Teste de Sucesso Completo — cadastrarAluno()',
      tests: [
        {
          name: 'Cadastro válido retorna objeto com todos os campos',
          fn: () => {
            const a = svc.cadastrarAluno('João Silva', 20, 'joao@email.com', 8.5);
            const ok = a && a.nome === 'João Silva' && a.idade === 20 && a.nota === 8.5 && a.status === 'Aprovado';
            return [ok, ok ? 'OK' : JSON.stringify(a), 'objeto completo'];
          }
        },
        {
          name: 'Cadastro com nota 4 retorna status Reprovado',
          fn: () => {
            const a = svc.cadastrarAluno('Maria Souza', 22, 'maria@email.com', 4);
            return assertEqual(a.status, 'Reprovado');
          }
        },
        {
          name: 'Cadastro com nota 7 retorna status Aprovado',
          fn: () => {
            const a = svc.cadastrarAluno('Carlos Lima', 30, 'carlos@email.com', 7);
            return assertEqual(a.status, 'Aprovado');
          }
        },
        {
          name: 'cadastrarAluno() lança erro se nome inválido',
          fn: () => assertThrows(() => svc.cadastrarAluno('', 20, 'x@x.com', 5), 'obrigatório')
        },
        {
          name: 'cadastrarAluno() lança erro se idade inválida (15)',
          fn: () => assertThrows(() => svc.cadastrarAluno('Ana Lima', 15, 'ana@x.com', 6), '16')
        },
        {
          name: 'cadastrarAluno() lança erro se email inválido',
          fn: () => assertThrows(() => svc.cadastrarAluno('Bia Cruz', 18, 'emailruim', '@')
          )
        },
        {
          name: 'cadastrarAluno() lança erro se nota inválida (11)',
          fn: () => assertThrows(() => svc.cadastrarAluno('Bia Cruz', 18, 'bia@x.com', 11), '10')
        },
      ]
    },
    {
      name: '🔄 Lógica de CRUD',
      tests: [
        {
          name: 'Inserção adiciona aluno ao array',
          fn: () => {
            alunos = [];
            const a = svc.cadastrarAluno('Ana Lima', 22, 'ana@teste.com', 8);
            a.id = 1; alunos.push(a);
            return assertEqual(alunos.length, 1);
          }
        },
        {
          name: 'Remoção diminui o array',
          fn: () => {
            alunos = [{ id:1, nome:'A', idade:20, email:'a@a.com', nota:5, status:'Reprovado' }];
            alunos.splice(0, 1);
            return assertEqual(alunos.length, 0);
          }
        },
        {
          name: 'Edição atualiza nome e status corretamente',
          fn: () => {
            alunos = [{ id:1, nome:'Antes', idade:18, email:'edit@a.com', nota:4, status:'Reprovado' }];
            const upd = svc.cadastrarAluno('Depois', 18, 'edit@a.com', 9);
            alunos[0] = { ...alunos[0], ...upd };
            const ok = alunos[0].nome === 'Depois' && alunos[0].status === 'Aprovado';
            return [ok, alunos[0].nome + '/' + alunos[0].status, 'Depois/Aprovado'];
          }
        },
        {
          name: 'Detecção de email duplicado',
          fn: () => {
            alunos = [{ id:1, nome:'X', idade:20, email:'dup@dup.com', nota:6, status:'Reprovado' }];
            return assertEqual(svc.emailDuplicado('dup@dup.com'), true);
          }
        },
        {
          name: 'Email duplicado não bloqueia o próprio aluno na edição',
          fn: () => {
            alunos = [{ id:1, nome:'X', idade:20, email:'eu@eu.com', nota:6, status:'Reprovado' }];
            return assertEqual(svc.emailDuplicado('eu@eu.com', 0), false);
          }
        },
        {
          name: 'Cálculo de média geral',
          fn: () => {
            alunos = [{ nota:8 }, { nota:6 }, { nota:4 }];
            const media = alunos.reduce((s,a) => s + a.nota, 0) / alunos.length;
            return assertEqual(media, 6);
          }
        },
      ]
    }
  ];

  let totalPass = 0, totalFail = 0;
  const html = groups.map(g => {
    const items = g.tests.map(t => {
      let passed, got, expected, errMsg = '';
      try {
        [passed, got, expected] = t.fn();
      } catch(e) {
        passed = false; got = 'EXCEÇÃO: ' + e.message; expected = '—'; errMsg = e.message;
      }
      if (passed) totalPass++; else totalFail++;
      return `<div class="test-item ${passed ? 'pass' : 'fail'}">
        <span class="test-icon"></span>
        <div>
          <div class="test-name">${t.name}</div>
          <div class="test-detail ${passed ? '' : 'fail-detail'}">
            ${passed ? 'OK' : `Esperado: <strong>${expected}</strong> · Recebido: <strong>${got}</strong>`}
          </div>
        </div>
      </div>`;
    }).join('');
    const gPass = items.split('class="test-item pass"').length - 1;
    const gTotal = g.tests.length;
    return `<div class="test-group">
      <div class="test-group-header">${g.name}
        <span style="margin-left:auto;font-size:0.75rem;color:${gPass===gTotal?'var(--green)':'var(--red)'}">${gPass}/${gTotal}</span>
      </div>
      ${items}
    </div>`;
  }).join('');

  const total = totalPass + totalFail;
  document.getElementById('test-summary').style.display = 'flex';
  document.getElementById('test-summary').innerHTML = `
    <span class="test-stat ts-total">Total: ${total}</span>
    <span class="test-stat ts-pass">✓ Passaram: ${totalPass}</span>
    <span class="test-stat ts-fail">✗ Falharam: ${totalFail}</span>
    <span class="test-stat" style="background:var(--surface2);color:${totalFail===0?'var(--green)':'var(--red)'};border:1px solid ${totalFail===0?'rgba(0,229,160,0.3)':'rgba(255,68,102,0.3)'}">
      ${totalFail === 0 ? '🎉 Todos os testes passaram!' : `⚠ ${totalFail} teste(s) falharam`}
    </span>`;
  document.getElementById('test-results').innerHTML = html;

  alunos = savedAlunos;
}

// Close modal on overlay click
document.getElementById('edit-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});