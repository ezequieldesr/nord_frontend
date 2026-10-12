# NÓRD — frontend Next.js

Frontend oficial da API Nord (Java/Spring Boot). Mantém o design original e usa dados reais para catálogo, tamanhos, estoque, cadastro, login, carrinho, endereços e pedidos. A conta administrativa também consulta pedidos e atualiza seus status. CRUD de produtos/categorias continua disponível pelos endpoints administrativos do backend; não há editor desses recursos nesta interface.

## Rodar localmente

Requisitos: Node.js 24, pnpm, Java 17, Maven e PostgreSQL. Os projetos continuam independentes.

1. Abra o Docker Desktop. Em um terminal na pasta `C:\Users\ezequ\Downloads\nord-loja\nord`:

```powershell
docker compose up -d
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Se Maven não estiver no PATH, execute pela IDE com `SPRING_PROFILES_ACTIVE=dev`. A API fica em `http://localhost:8080`. O perfil dev cria produtos de exemplo e o administrador `admin@loja.com` / `admin12345`. Use essas credenciais somente localmente.

2. Em outro terminal, nesta pasta (`C:\Users\ezequ\Downloads\e-commerce-de-moda`):

```powershell
Copy-Item .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Abra **http://localhost:3000**. Crie uma conta ou use o administrador local, escolha um produto e tamanho, adicione ao carrinho e finalize informando um endereço. Confira o pedido na área Conta.

O navegador chama `/api/*` na mesma origem do frontend. O Next encaminha essas chamadas para `NORD_API_URL`, preservando método, query, corpo e header Authorization. O valor padrão é `http://127.0.0.1:8080`. Reinicie o Next depois de mudar `.env.local`. A variável é exclusiva do servidor e não precisa de prefixo NEXT_PUBLIC.

## Autenticação e dados

- JWT enviado em `Authorization: Bearer ...`; sessão mantida em sessionStorage da aba. Fechar a aba remove a cópia local; logout não revoga o token no servidor.
- HTTP 401 em operação protegida limpa a sessão e apresenta o erro.
- Carrinho persiste no banco pelo usuário autenticado; a interface usa IDs de itens e totais devolvidos pelo Nord.
- Tamanhos vêm de cada produto. Sem tamanhos cadastrados, usa `Único`. Produto sem estoque não pode ser adicionado.
- Imagem ausente usa placeholder; descrição, preço e estoque vêm da API.
- Catálogo indisponível apresenta erro e opção de tentar novamente; não há fallback para produtos fictícios.
- Checkout registra pedido em AGUARDANDO_PAGAMENTO. **Não há cobrança real, integração com gateway ou coleta de cartão.**

## Verificação

```powershell
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Oito testes validam contratos da API, JWT, expiração de sessão, erros de validação e mapeamento de dados. `node tests/proxy-smoke.cjs` testa uma instância Next de produção contra um backend controlado, usando as portas 8080 e 3100: execute somente com essas portas livres e após `pnpm build`. Esse teste encerra os processos criados. Não é um teste de persistência PostgreSQL.

Validação desta integração: TypeScript aprovado, build de produção aprovado, 8 testes frontend aprovados, smoke test HTTP aprovado e 29 testes backend aprovados. Validação local posterior em 11/10/2026: compra completa testada com PostgreSQL 16.15, incluindo persistência, baixa de estoque e isolamento entre usuários. Foram deixados dois pedidos fictícios e contas de teste no banco local.

## Hospedagem

Execute Next.js e Nord como dois serviços. Configure NORD_API_URL com a URL interna/HTTPS do serviço Nord **antes de gerar o build do Next**; o destino do rewrite é materializado no build. Faça novo build se o destino mudar. Em produção, o backend deve usar perfil prod e os segredos documentados no seu README. Nunca ative dev em uma URL pública.

O Next precisa de runtime Node; `output: export`/hospedagem puramente estática não executa o proxy. Como o navegador acessa o proxy na mesma origem, não é necessário liberar um domínio CORS adicional no Nord para este fluxo. Proteções de abuso e demais pendências do backend continuam no relatório de segurança.

## Painel administrativo

Acesse `http://localhost:3000/admin` com uma conta ADMIN. A loja continua em `/`.
O painel possui login e sessão próprios, gest?o de usuários (nome, e-mail, permissão e ativação),
exclusão de contas sem pedidos, produtos, estoque, categorias e acompanhamento dos pedidos.
Usuários com pedidos devem ser desativados para preservar o histórico. Não é permitido excluir,
bloquear ou rebaixar a própria conta administrativa. Alterações em usuários invalidam seus tokens;
após esta atualização, fa?a login novamente também na loja.

A autorização ADMIN ? aplicada pela API. `/admin` é uma URL separada no mesmo domínio;
para isolamento por domínio/infraestrutura é necessário configurar uma implantação própria.
O status do pedido não comprova pagamento: a confirmação financeira continua fora deste projeto.
