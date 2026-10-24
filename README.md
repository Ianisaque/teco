# Teco

Plataforma que conecta tutores de pets a pessoas que oferecem **passeio, hospedagem e cuidados por algumas horas**.

Este é um projeto de demonstração: a interface é funcional, mas os cuidadores, avaliações, preços e depoimentos são **exemplos** e ainda não existe banco de dados, autenticação ou agendamento.

## O que já funciona

- Página inicial responsiva (computador, tablet e celular) com cabeçalho, hero, busca, serviços, como funciona, cuidadores, "Seja um cuidador", depoimentos e rodapé.
- No hero, seis bichos em pé sobre o card de busca: os olhos seguem o cursor (no celular, olham em volta sozinhos). Com `prefers-reduced-motion` ativo, ficam parados.
- Busca por tipo de serviço, região e data, com validação e mensagens de erro. Os filtros de serviço e região são aplicados pela API.
- Estados de carregamento, lista vazia e erro na lista de cuidadores.
- Perfil do cuidador em janela modal.
- Formulários de entrar e cadastrar-se com validação (nada é enviado nem salvo).
- Modo de alto contraste, lembrado entre visitas.
- Acessibilidade: link para pular ao conteúdo, foco visível, rótulos e mensagens associados aos campos, respeito a `prefers-reduced-motion`.

## Como executar

Requer Python 3.8 ou superior. Não há dependências para instalar.

```bash
python app.py
```

Depois abra http://localhost:8000. Para usar outra porta, defina a variável `PORT`.

## Estrutura

```
app.py                  servidor (biblioteca padrão do Python) e API
data/cuidadores.json    dados de demonstração
public/                 tudo que o navegador acessa
  index.html
  css/styles.css
  js/
    main.js             ponto de entrada
    components/         nav, busca, cuidadores, olhos dos pets, formulários, dialogs, toast...
    services/api.js     acesso à API (ponto único para integrações futuras)
    lib/                utilitários e tipos de serviço
  img/                  logo, fotos dos cuidadores, ilustração dos pets e sprite de ícones
  fonts/                Poppins
```

Só a pasta `public/` fica acessível pelo navegador; `app.py` e `data/` não.

## API

| Rota | Descrição |
| --- | --- |
| `GET /api/cuidadores` | Lista cuidadores. Aceita `?servico=passeio\|hospedagem\|cuidados` e `?bairro=Botafogo`. |
| `GET /api/bairros` | Regiões atendidas pelos cuidadores cadastrados. |

## Como os olhos funcionam

`public/index.html` tem um SVG sobre a imagem com uma pupila por olho. Cada olho guarda o centro e o raio da parte branca em `data-*` (coordenadas da imagem). `public/js/components/pet-eyes.js` calcula a direção do cursor e move cada pupila sem sair do olho. Para trocar a imagem, é preciso refazer essas medidas.

## Próximos passos

- Banco de dados no lugar de `data/cuidadores.json` (`carregar_cuidadores` em `app.py`).
- Autenticação: rotas de login e cadastro, ligadas a `public/js/components/auth-forms.js`.
- Agendamento por data, para que o campo de data da busca passe a filtrar a disponibilidade.

## Créditos

- Ícones: [Material Design Icons](https://pictogrammers.com/library/mdi/) (Apache License 2.0).
- Fonte: [Poppins](https://fonts.google.com/specimen/Poppins) (SIL Open Font License).
- Logo, fotos dos perfis e identidade visual: arquivos originais do projeto.
- Ilustração dos pets (`public/img/pets.webp`): gerada pelo autor do projeto. As pupilas foram removidas da imagem e são desenhadas em SVG por cima (`index.html`), para poderem se mover.
