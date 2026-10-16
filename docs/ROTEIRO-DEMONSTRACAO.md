# Roteiro executável da demonstração NÓRD

O roteiro foi construído a partir dos componentes da loja e dos controllers da API.
Executa ações na interface e confirma respostas do backend real, sem mocks de pedidos, usuários ou estoque.
Use somente dados fictícios e banco local de demonstração.

## Vídeo 1 — da descoberta ao acompanhamento

| Cena | Navegação | Verificação | API envolvida |
| --- | --- | --- | --- |
| 1 | Home e coleção | Vitrine disponível | GET /api/produtos; GET /api/categorias |
| 2 | Categoria Camisas e menor preço | Três peças de exemplo e ordenação | Catálogo carregado da API; filtros locais |
| 3 | Busca Dry Trail, detalhe e zoom | Resultado único e imagem carregada | GET /api/catalogo/imagens/*.png |
| 4 | Cadastro, saída e novo login | Perfil real do cliente | POST /api/auth/registrar; POST /api/auth/login; GET /api/usuarios/me |
| 5 | Tamanho M; adicionar, aumentar, diminuir, remover e adicionar | Totais recalculados e carrinho vazio após remoção | GET /api/carrinho; POST/PUT/DELETE /api/carrinho/itens |
| 6 | Endereço fictício e PIX demonstrativo | Pedido 201, preço do servidor e estoque reduzido em uma unidade | GET/POST /api/enderecos; POST /api/pedidos; GET /api/produtos/{id} |
| 7 | Histórico e recarga da página | Pedido persiste | GET /api/pedidos/meus |
| 8 | Login em /admin; pedido para Enviado | Administrador vê o pedido e altera a etapa | GET /api/admin/pedidos; PATCH /api/admin/pedidos/{id}/status |
| 9 | Visão de produtos, categorias e usuários | Painel e listagem de usuários | GET /api/produtos; GET /api/categorias; GET /api/admin/usuarios |
| 10 | Voltar ao perfil do cliente | Status Enviado refletido na loja | GET /api/pedidos/meus |

Código: [journey.spec.ts](../e2e/journey.spec.ts).

## Vídeo 2 — gestão administrativa

1. Login administrativo.
2. Criar categoria e editar seu nome.
3. Criar produto com imagem, descrição, preço, tamanhos e estoque.
4. Editar estoque e confirmar os dados pela API pública.
5. Editar e desativar uma conta fictícia sem pedidos; confirmar que seu token perdeu acesso.
6. Excluir essa conta após a confirmação da interface.
7. Excluir o produto e a categoria criados no roteiro.

Código: [admin.spec.ts](../e2e/admin.spec.ts).
As exclusões atingem somente registros criados nessa execução. Uma falha intermediária pode deixar esses registros no banco de testes.

## Verificações complementares

[security.spec.ts](../e2e/security.spec.ts) usa a API real para verificar:

- Visitantes recebem 401 e CLIENTE recebe 403 nas rotas administrativas.
- CLIENTE não cadastra produtos.
- Uma conta não altera ou exclui endereço e item de carrinho de outra.
- O cliente não finaliza pedido com endereço de outra conta.
- Quantidade acima de 20 é rejeitada.
- Os pedidos de outra conta não aparecem no histórico.
- Conta com pedido não é excluída; pode ser desativada.
- Desativação revoga token e impede novo login.
- O administrador não exclui sua própria conta.
- O status do pedido não retrocede.

[mobile.spec.ts](../e2e/mobile.spec.ts) verifica navegação, catálogo e acesso ao login em 390 × 844.
Esses testes não representam uma auditoria completa de segurança nem cobertura de todos os dispositivos.

## Executar novamente

Pré-requisitos: PostgreSQL local, API com perfil dev em 8080 e frontend em 3000.
O banco deve ter os nove produtos de exemplo, a categoria Camisas e estoque disponível de Camiseta Dry Trail.
O teste não repõe estoque nem apaga pedidos: cada execução completa consome unidades do produto.

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test:e2e
pnpm demo:record
```

`test:e2e` executa os quatro cenários rapidamente. `demo:record` executa os mesmos cenários com pausas,
legendas e vídeos em 1440 × 900; a verificação mobile mantém 390 × 844.
Não precisa abrir um navegador manualmente. Os servidores devem permanecer ligados durante os testes.

Variáveis opcionais: `E2E_BASE_URL` (padrão http://127.0.0.1:3000), `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`.
Somente hosts locais são aceitos para evitar criação de pedidos em produção. Nunca use dados reais.
As credenciais padrão são exclusivamente as do perfil local dev.

Saídas públicas de demonstração: `docs/demo/nord-demo.webm`, `docs/demo/nord-admin.webm`, capturas PNG e `verification.json`.
Relatório técnico: `pnpm test:e2e:report`. `playwright-report` e `test-results` ficam fora do Git:
traces, relatórios e capturas de falha podem conter tokens e dados de requisições.
A gravação usa senhas em campos mascarados e dados fictícios, sem exportar armazenamento da sessão.

Para gerar MP4 a partir dos WebM, instale FFmpeg e execute `pnpm demo:export`.
Pode indicar o executável pela variável `FFMPEG_PATH`. MP4 e GIF são derivados do vídeo real, sem simular ações.
A gravação não inclui narração nem música. A prévia GIF é um trecho; o vídeo mantém o roteiro completo.
