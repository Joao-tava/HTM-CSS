import unittest

# ============================================================
#  SISTEMA DE CADASTRO DE ALUNOS
# ============================================================


# ─── CLASSE: Aluno ───────────────────────────────────────────
class Aluno:
    def __init__(self, nome, idade, email, nota):
        self.nome   = nome
        self.idade  = idade
        self.email  = email
        self.nota   = nota
        self.status = None  # preenchido pelo AlunoService


# ─── CLASSE: AlunoService ────────────────────────────────────
class AlunoService:

    def __init__(self):
        self.alunos = []

    # Regra 1 – Nome obrigatório
    def validar_nome(self, nome):
        if not nome or nome.strip() == "":
            raise ValueError("Nome é obrigatório e não pode ser vazio.")
        if len(nome.strip()) < 3:
            raise ValueError("Nome deve ter pelo menos 3 caracteres.")

    # Regra 2 – Idade válida (16–100)
    def validar_idade(self, idade):
        if not isinstance(idade, (int, float)) or isinstance(idade, bool):
            raise ValueError("Idade deve ser um número.")
        if not float(idade).is_integer():
            raise ValueError("Idade deve ser um número inteiro.")
        if idade < 16:
            raise ValueError("Idade deve ser maior ou igual a 16.")
        if idade > 100:
            raise ValueError("Idade deve ser menor ou igual a 100.")

    # Regra 3 – Email válido
    def validar_email(self, email):
        if not email or email.strip() == "":
            raise ValueError("Email é obrigatório.")
        if "@" not in email:
            raise ValueError("Email inválido: deve conter '@'.")
        if "." not in email:
            raise ValueError("Email inválido: deve conter '.'.")

    # Regra 4 – Nota válida (0–10)
    def validar_nota(self, nota):
        if nota is None:
            raise ValueError("Nota é obrigatória.")
        if not isinstance(nota, (int, float)) or isinstance(nota, bool):
            raise ValueError("Nota deve ser um número.")
        if nota < 0:
            raise ValueError("Nota deve ser maior ou igual a 0.")
        if nota > 10:
            raise ValueError("Nota deve ser menor ou igual a 10.")

    # Regra 5 – Cálculo de status
    def calcular_status(self, nota):
        return "Aprovado" if nota >= 7 else "Reprovado"

    # Desafio extra – Email duplicado
    def verificar_email_duplicado(self, email):
        for aluno in self.alunos:
            if aluno.email.lower() == email.strip().lower():
                raise ValueError("Email já cadastrado.")

    # Função principal
    def cadastrar_aluno(self, nome, idade, email, nota):
        self.validar_nome(nome)
        self.validar_idade(idade)
        self.validar_email(email)
        self.validar_nota(nota)
        self.verificar_email_duplicado(email)

        aluno        = Aluno(nome.strip(), int(idade), email.strip().lower(), nota)
        aluno.status = self.calcular_status(nota)
        self.alunos.append(aluno)

        print(f"\nAluno cadastrado com sucesso")
        print(f"Status: {aluno.status}")
        return aluno


# ============================================================
#  TESTES UNITÁRIOS
# ============================================================

class TestValidarNome(unittest.TestCase):

    def setUp(self):
        self.svc = AlunoService()

    def test_nome_vazio_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_nome("")
        self.assertIn("obrigatório", str(ctx.exception))

    def test_nome_apenas_espacos_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_nome("   ")
        self.assertIn("obrigatório", str(ctx.exception))

    def test_nome_menos_de_3_caracteres_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_nome("Jo")
        self.assertIn("3", str(ctx.exception))

    def test_nome_valido_nao_lanca_erro(self):
        self.assertIsNone(self.svc.validar_nome("João Silva"))

    def test_nome_com_acento_valido(self):
        self.assertIsNone(self.svc.validar_nome("José"))


class TestValidarIdade(unittest.TestCase):

    def setUp(self):
        self.svc = AlunoService()

    def test_idade_menor_que_16_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_idade(15)
        self.assertIn("16", str(ctx.exception))

    def test_idade_zero_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_idade(0)
        self.assertIn("16", str(ctx.exception))

    def test_idade_negativa_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_idade(-1)
        self.assertIn("16", str(ctx.exception))

    def test_idade_maior_que_100_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_idade(101)
        self.assertIn("100", str(ctx.exception))

    def test_idade_decimal_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_idade(20.5)
        self.assertIn("inteiro", str(ctx.exception))

    def test_idade_valida_nao_lanca_erro(self):
        self.assertIsNone(self.svc.validar_idade(20))

    def test_idade_limite_inferior_valida(self):
        self.assertIsNone(self.svc.validar_idade(16))

    def test_idade_limite_superior_valida(self):
        self.assertIsNone(self.svc.validar_idade(100))


class TestValidarEmail(unittest.TestCase):

    def setUp(self):
        self.svc = AlunoService()

    def test_email_vazio_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_email("")
        self.assertIn("obrigatório", str(ctx.exception))

    def test_email_sem_arroba_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_email("emailsemarroba.com")
        self.assertIn("@", str(ctx.exception))

    def test_email_sem_ponto_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_email("email@sempontoCom")
        self.assertIn(".", str(ctx.exception))

    def test_email_valido_nao_lanca_erro(self):
        self.assertIsNone(self.svc.validar_email("aluno@escola.com"))

    def test_email_com_subdominio_valido(self):
        self.assertIsNone(self.svc.validar_email("user@mail.escola.edu.br"))


class TestValidarNota(unittest.TestCase):

    def setUp(self):
        self.svc = AlunoService()

    def test_nota_negativa_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_nota(-0.1)
        self.assertIn("0", str(ctx.exception))

    def test_nota_maior_que_10_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_nota(10.1)
        self.assertIn("10", str(ctx.exception))

    def test_nota_none_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.validar_nota(None)
        self.assertIn("obrigatória", str(ctx.exception))

    def test_nota_minima_valida(self):
        self.assertIsNone(self.svc.validar_nota(0))

    def test_nota_maxima_valida(self):
        self.assertIsNone(self.svc.validar_nota(10))

    def test_nota_decimal_valida(self):
        self.assertIsNone(self.svc.validar_nota(7.5))


class TestCalcularStatus(unittest.TestCase):

    def setUp(self):
        self.svc = AlunoService()

    def test_nota_7_aprovado(self):
        self.assertEqual(self.svc.calcular_status(7), "Aprovado")

    def test_nota_10_aprovado(self):
        self.assertEqual(self.svc.calcular_status(10), "Aprovado")

    def test_nota_6_9_reprovado(self):
        self.assertEqual(self.svc.calcular_status(6.9), "Reprovado")

    def test_nota_0_reprovado(self):
        self.assertEqual(self.svc.calcular_status(0), "Reprovado")

    def test_nota_7_1_aprovado(self):
        self.assertEqual(self.svc.calcular_status(7.1), "Aprovado")

    def test_nota_5_reprovado(self):
        self.assertEqual(self.svc.calcular_status(5), "Reprovado")


class TestCadastrarAluno(unittest.TestCase):

    def setUp(self):
        self.svc = AlunoService()

    def test_cadastro_valido_retorna_aluno(self):
        aluno = self.svc.cadastrar_aluno("João Silva", 20, "joao@email.com", 8.5)
        self.assertIsNotNone(aluno)
        self.assertEqual(aluno.nome,   "João Silva")
        self.assertEqual(aluno.idade,  20)
        self.assertEqual(aluno.email,  "joao@email.com")
        self.assertEqual(aluno.nota,   8.5)
        self.assertEqual(aluno.status, "Aprovado")

    def test_cadastro_nota_baixa_status_reprovado(self):
        aluno = self.svc.cadastrar_aluno("Maria Souza", 22, "maria@email.com", 4)
        self.assertEqual(aluno.status, "Reprovado")

    def test_cadastro_nota_exata_7_aprovado(self):
        aluno = self.svc.cadastrar_aluno("Carlos Lima", 30, "carlos@email.com", 7)
        self.assertEqual(aluno.status, "Aprovado")

    def test_cadastro_adiciona_na_lista(self):
        self.svc.cadastrar_aluno("Ana Lima", 18, "ana@email.com", 9)
        self.assertEqual(len(self.svc.alunos), 1)

    def test_cadastro_nome_invalido_lanca_erro(self):
        with self.assertRaises(ValueError):
            self.svc.cadastrar_aluno("", 20, "x@x.com", 5)

    def test_cadastro_idade_invalida_lanca_erro(self):
        with self.assertRaises(ValueError):
            self.svc.cadastrar_aluno("Ana Lima", 15, "ana@x.com", 6)

    def test_cadastro_email_invalido_lanca_erro(self):
        with self.assertRaises(ValueError):
            self.svc.cadastrar_aluno("Bia Cruz", 18, "emailruim", 6)

    def test_cadastro_nota_invalida_lanca_erro(self):
        with self.assertRaises(ValueError):
            self.svc.cadastrar_aluno("Bia Cruz", 18, "bia@x.com", 11)


class TestEmailDuplicado(unittest.TestCase):

    def setUp(self):
        self.svc = AlunoService()
        self.svc.cadastrar_aluno("João Silva", 20, "joao@email.com", 8)

    def test_email_duplicado_lanca_erro(self):
        with self.assertRaises(ValueError) as ctx:
            self.svc.cadastrar_aluno("Outro Nome", 25, "joao@email.com", 7)
        self.assertIn("já cadastrado", str(ctx.exception))

    def test_email_diferente_nao_lanca_erro(self):
        aluno = self.svc.cadastrar_aluno("Maria Lima", 22, "maria@email.com", 9)
        self.assertIsNotNone(aluno)

    def test_email_case_insensitive(self):
        with self.assertRaises(ValueError):
            self.svc.cadastrar_aluno("Outro Nome", 25, "JOAO@EMAIL.COM", 7)


# ============================================================
#  EXECUÇÃO
# ============================================================

if __name__ == "__main__":
    # Exemplo de fluxo
    print("=" * 50)
    print(" EXEMPLO DE FLUXO")
    print("=" * 50)
    svc = AlunoService()
    svc.cadastrar_aluno("João Silva", 20, "joao@email.com", 8.5)

    # Testes
    print("\n" + "=" * 50)
    print(" EXECUTANDO TESTES UNITÁRIOS")
    print("=" * 50 + "\n")
    unittest.main(verbosity=2)