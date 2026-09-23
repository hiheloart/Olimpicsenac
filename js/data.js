/* =========================================================
   AUTIVERSI — Data / Conteúdo de Exemplo
   Ícones usam símbolos SVG inline: i-home, i-map, i-leaf, i-calendar, i-user, etc.
   ========================================================= */

const PLACES = [
  {
    id: 'p1',
    name: 'Café Folha',
    type: 'Cafeteria',
    icon: 'i-comfort',
    address: 'Rua das Flores, 142',
    city: 'Cuiabá',
    pos: { x: 30, y: 38 },
    comfort: 9,
    noise: 2,
    light: 3,
    crowd: 2,
    smell: 3,
    quietSpot: true,
    quietTime: '9h às 11h da manhã',
    tagline: 'Ambiente tranquilo com música baixa.',
    note: 'Cantinhos com sofás no fundo são bem silenciosos.'
  },
  {
    id: 'p2',
    name: 'Shopping Centro',
    type: 'Shopping',
    icon: 'i-bag',
    address: 'Av. Paulista, 1000',
    city: 'Cuiabá',
    pos: { x: 62, y: 30 },
    comfort: 4,
    noise: 5,
    light: 4,
    crowd: 5,
    smell: 3,
    quietSpot: true,
    quietTime: 'Terças e quartas até 16h',
    tagline: 'Muito movimentado no fim de tarde.',
    note: 'A área do estacionamento coberto costuma ser mais tranquila.'
  },
  {
    id: 'p3',
    name: 'Parque Verde',
    type: 'Parque',
    icon: 'i-tree',
    address: 'Av. das Árvores, s/n',
    city: 'Cuiabá',
    pos: { x: 78, y: 62 },
    comfort: 10,
    noise: 1,
    light: 4,
    crowd: 2,
    smell: 1,
    quietSpot: true,
    quietTime: 'Manhãs de dia útil',
    tagline: 'Muitas áreas verdes e bancos para descansar.',
    note: 'Perto do lago há menos movimento.'
  },
  {
    id: 'p4',
    name: 'Restaurante Sabor Leve',
    type: 'Restaurante',
    icon: 'i-comfort',
    address: 'Rua do Comércio, 76',
    city: 'Cuiabá',
    pos: { x: 22, y: 70 },
    comfort: 8,
    noise: 2,
    light: 2,
    crowd: 2,
    smell: 3,
    quietSpot: true,
    quietTime: '14h às 18h',
    tagline: 'Ambiente calmo à tarde.',
    note: 'Mesas perto da janela têm iluminação suave.'
  },
  {
    id: 'p5',
    name: 'Supermercado Bom',
    type: 'Mercado',
    icon: 'i-checklist',
    address: 'Rua São João, 230',
    city: 'Cuiabá',
    pos: { x: 50, y: 52 },
    comfort: 5,
    noise: 3,
    light: 4,
    crowd: 4,
    smell: 3,
    quietSpot: false,
    quietTime: 'Manhã antes das 9h',
    tagline: 'Evite horários de pão e fim de tarde.',
    note: 'Corredores de limpeza costumam ter cheiros fortes.'
  },
  {
    id: 'p6',
    name: 'Biblioteca Municipal',
    type: 'Biblioteca',
    icon: 'i-book',
    address: 'Rua da Cultura, 89',
    city: 'Cuiabá',
    pos: { x: 42, y: 20 },
    comfort: 10,
    noise: 1,
    light: 3,
    crowd: 1,
    smell: 1,
    quietSpot: true,
    quietTime: 'Qualquer horário',
    tagline: 'Silêncio, cadeiros confortáveis e espaços individuais.',
    note: 'Sala de leitura no 2º andar é quase vazia.'
  },
  {
    id: 'p7',
    name: 'Farmácia Saúde',
    type: 'Farmácia',
    icon: 'i-heart',
    address: 'Av. Central, 33',
    city: 'Cuiabá',
    pos: { x: 15, y: 45 },
    comfort: 7,
    noise: 2,
    light: 3,
    crowd: 2,
    smell: 3,
    quietSpot: false,
    quietTime: 'Meio-dia',
    tagline: 'Atendimento rápido e ambiente limpo.',
    note: 'Às vezes tem música ambiente.'
  },
  {
    id: 'p8',
    name: 'Estação de Trem',
    type: 'Transporte',
    icon: 'i-bell',
    address: 'Praça da Estação',
    city: 'Cuiabá',
    pos: { x: 55, y: 80 },
    comfort: 3,
    noise: 5,
    light: 4,
    crowd: 5,
    smell: 3,
    quietSpot: false,
    quietTime: 'Fora do horário comercial',
    tagline: 'Horário de pico é bastante intenso.',
    note: 'Bancos longe das catracas são melhores.'
  },
  {
    id: 'p9',
    name: 'Parque Municipal de Várzea Grande',
    type: 'Parque',
    icon: 'i-tree',
    address: 'Av. Beira Rio, s/n',
    city: 'Várzea Grande',
    pos: { x: 22, y: 48 },
    comfort: 9,
    noise: 1,
    light: 3,
    crowd: 2,
    smell: 1,
    quietSpot: true,
    quietTime: 'Manhãs antes das 10h',
    tagline: 'Área verde ampla com bancos e sombra.',
    note: 'Perto da orla há bancos tranquilos para descansar.'
  },
  {
    id: 'p10',
    name: 'Biblioteca de Várzea Grande',
    type: 'Biblioteca',
    icon: 'i-book',
    address: 'Rua 13 de Junho, 456',
    city: 'Várzea Grande',
    pos: { x: 35, y: 28 },
    comfort: 9,
    noise: 1,
    light: 2,
    crowd: 1,
    smell: 1,
    quietSpot: true,
    quietTime: 'Todos os dias, horário comercial',
    tagline: 'Sala de leitura silenciosa e acolhedora.',
    note: 'Espaço infantil separado, então adultos ficam em área calma.'
  },
  {
    id: 'p11',
    name: 'Café da Praça',
    type: 'Cafeteria',
    icon: 'i-comfort',
    address: 'Praça da Matriz, 78',
    city: 'Várzea Grande',
    pos: { x: 45, y: 58 },
    comfort: 8,
    noise: 2,
    light: 3,
    crowd: 2,
    smell: 2,
    quietSpot: true,
    quietTime: 'Terça a sexta, 14h às 17h',
    tagline: 'Cafés calmos com mesas externas na sombra.',
    note: 'Mesas internas ao fundo são mais silenciosas.'
  },
  {
    id: 'p12',
    name: 'Supermercado Pague Menos',
    type: 'Mercado',
    icon: 'i-checklist',
    address: 'Av. Pres. Dutra, 900',
    city: 'Várzea Grande',
    pos: { x: 12, y: 68 },
    comfort: 5,
    noise: 3,
    light: 4,
    crowd: 3,
    smell: 3,
    quietSpot: false,
    quietTime: 'Manhã antes das 8h30',
    tagline: 'Mercado bem organizado, sem muita multidão.',
    note: 'Evite sábados à tarde.'
  },
  {
    id: 'p13',
    name: 'Shopping Popular VG',
    type: 'Shopping',
    icon: 'i-bag',
    address: 'Av. Castelo Branco, 2300',
    city: 'Várzea Grande',
    pos: { x: 62, y: 68 },
    comfort: 4,
    noise: 4,
    light: 4,
    crowd: 4,
    smell: 3,
    quietSpot: true,
    quietTime: 'Dias úteis antes do almoço',
    tagline: 'Menor movimentação que o shopping central.',
    note: 'Tem uma área de descanso perto da praça de alimentação.'
  },
  {
    id: 'p14',
    name: 'Praça das Águas',
    type: 'Praça',
    icon: 'i-tree',
    address: 'Av. Fernando Corrêa, s/n',
    city: 'Várzea Grande',
    pos: { x: 78, y: 45 },
    comfort: 8,
    noise: 2,
    light: 3,
    crowd: 2,
    smell: 1,
    quietSpot: true,
    quietTime: 'Manhã e final de tarde',
    tagline: 'Praça com chafariz e bancos na sombra.',
    note: 'Perto das árvores há mais silêncio e frescor.'
  },
  {
    id: 'p15',
    name: 'Restaurante Caseiro VG',
    type: 'Restaurante',
    icon: 'i-comfort',
    address: 'Rua São Paulo, 120',
    city: 'Várzea Grande',
    pos: { x: 28, y: 85 },
    comfort: 7,
    noise: 2,
    light: 3,
    crowd: 2,
    smell: 3,
    quietSpot: true,
    quietTime: '15h às 18h',
    tagline: 'Comida caseira e ambiente acolhedor.',
    note: 'À tarde fica bem mais calmo, quase sem ninguém.'
  },
  {
    id: 'p16',
    name: 'Clínica Espaço Autista VG',
    type: 'Clínica',
    icon: 'i-heart',
    address: 'Rua Ceará, 345',
    city: 'Várzea Grande',
    pos: { x: 50, y: 12 },
    comfort: 10,
    noise: 1,
    light: 2,
    crowd: 1,
    smell: 1,
    quietSpot: true,
    quietTime: 'Agendamento prévio',
    tagline: 'Espaço preparado para pessoas autistas.',
    note: 'Sala sensorial com estímulos controlados. Atendimento humanizado.'
  }
];

const NOISE_LABEL = ['Muito baixo', 'Baixo', 'Moderado', 'Médio', 'Alto', 'Muito alto'];
const LIGHT_LABEL = ['Muito escuro', 'Escuro', 'Baixa', 'Média', 'Alta', 'Muito clara'];
const CROWD_LABEL = ['Vazio', 'Quase vazio', 'Poucas pessoas', 'Moderado', 'Movimentado', 'Muito cheio'];
const SMELL_LABEL = ['Nenhum', 'Bem leve', 'Leve', 'Moderado', 'Forte', 'Muito forte'];

const STIM_LEVEL = [
  { id: 'baixo',   label: 'Baixo estímulo',   desc: 'Locais bem tranquilos' },
  { id: 'medio',   label: 'Médio estímulo',   desc: 'Ambientes equilibrados' },
  { id: 'alto',    label: 'Mais movimentado', desc: 'Permite mais movimento' }
];

const SENSORY_QUESTIONS = [
  { id: 'sound', icon: 'i-waves', title: 'Sons',
    question: 'Como você se sente com sons altos e ambientes barulhentos?',
    hint: 'Pense em restaurantes cheios, trânsito ou música alta.' },
  { id: 'light', icon: 'i-sun', title: 'Luz',
    question: 'Como você reage a luzes fortes, ambientes muito claros ou luzes piscantes?',
    hint: 'Luzes fluorescentes, telas ou sol forte podem ser exemplos.' },
  { id: 'crowd', icon: 'i-people', title: 'Multidões',
    question: 'Estar perto de muitas pessoas ou em locais cheios é confortável para você?',
    hint: 'Shoppings, transportes públicos e eventos.' },
  { id: 'touch', icon: 'i-hands', title: 'Toque / Texturas',
    question: 'Você tem sensibilidade a texturas, roupas apertadas, etiquetas ou contato físico?',
    hint: 'Pense em tecidos, toque inesperado ou etiquetas na roupa.' },
  { id: 'smell', icon: 'i-leaf', title: 'Cheiros',
    question: 'Cheiros fortes (perfumes, limpeza, comida) costumam te incomodar?',
    hint: 'Perfumes, produtos de limpeza e cheiros de cozinha.' },
  { id: 'social', icon: 'i-chat', title: 'Situações sociais',
    question: 'Interações sociais, conversas longas ou conhecer pessoas novas pode ser cansativo?',
    hint: 'Grupos grandes, conversas casuais e contato visual prolongado.' }
];

const SENS_OPTIONS = [
  { value: 4, label: 'Incomoda muito', sub: 'Evito sempre que posso', className: 'avoid' },
  { value: 3, label: 'Incomoda um pouco', sub: 'Prefiro evitar', className: 'alt' },
  { value: 2, label: 'Neutro', sub: 'Não me afeta', className: 'mid' },
  { value: 1, label: 'Gosto / Não me importo', sub: 'Me sinto confortável', className: 'correct' }
];

const SENS_LEVEL = (value) => {
  if (value >= 3.4) return { label: 'Alta sensibilidade', cls: 'very-high' };
  if (value >= 2.6) return { label: 'Média-alta', cls: 'high' };
  if (value >= 1.6) return { label: 'Média', cls: 'mid' };
  return { label: 'Baixa sensibilidade', cls: 'low' };
};

const SOCIAL_EXAMPLES = [
  {
    q: 'Uma pessoa respondeu “tá bom então” e saiu andando.',
    interps: [
      { t: 'Possibilidade 1', c: 'A pessoa pode simplesmente ter encerrado a conversa de forma natural e ter saído porque tinha algo para fazer.' },
      { t: 'Possibilidade 2', c: 'Pode ter ficado levemente frustrada ou desconfortável com algo, e preferiu se afastar.' },
      { t: 'Possibilidade 3', c: 'Pode estar com muita pressa e não teve tempo de se despedir melhor.' }
    ],
    replies: [
      'Se ficar com dúvida, depois você pode mandar uma mensagem: “Tudo bem? Se precisar de algo, é só chamar.”',
      'Também pode ser apenas um encerramento comum — não é necessário responder algo no momento.',
      'Se for alguém próximo, perguntar depois de forma calma: “Você estava com pressa mais cedo?” costuma funcionar.'
    ]
  }
];

const TRAINING_SCENARIOS = [
  {
    id: 'entrevista',
    icon: 'i-bag',
    title: 'Entrevista de emprego',
    desc: 'Praticar perguntas comuns em uma entrevista.',
    scene: 'Você está em uma entrevista de emprego. A pessoa recrutadora pergunta: “Fale um pouco sobre você.”',
    answers: [
      {
        text: '“Meu nome é Maria, gosto de organização e de aprender coisas novas. Já trabalhei com atendimento e nos meus projetos pessoais, crio rotinas para facilitar meu dia a dia.”',
        type: 'correct',
        worked: 'Essa resposta dá informações concretas, é clara e mostra um pouco da sua personalidade de forma equilibrada.',
        tip: 'Se possível, ligue suas qualidades a algo que você já fez ou um projeto.'
      },
      {
        text: '“Bom, eu não sei… não gosto muito de falar de mim.”',
        type: 'avoid',
        worked: 'Pode ser sincero, mas em uma entrevista o ideal é oferecer pelo menos um ou dois pontos positivos.',
        tip: 'Uma saída leve: “Costumo ser mais reservado, mas gosto de aprender e ser prestativo. No meu último trabalho, organizava os arquivos com cuidado.”'
      },
      {
        text: '“Tenho 24 anos, moro com meus pais e gosto de séries.”',
        type: 'alt',
        worked: 'É um começo, mas pode ser mais alinhado à vaga: focar em habilidades, interesses profissionais ou como você trabalha.',
        tip: 'Adicionar uma habilidade ajuda muito: “…e sou bastante detalhista em tarefas que exigem foco.”'
      }
    ]
  },
  {
    id: 'pedir_ajuda',
    icon: 'i-search',
    title: 'Pedir ajuda em uma loja',
    desc: 'Como encontrar um produto ou pedir orientação.',
    scene: 'Você entra em uma loja e não encontra o produto que procura. Um atendente se aproxima.',
    answers: [
      {
        text: '“Olá, estou procurando [nome do produto]. Você pode me dizer onde fica?”, com um tom claro e educado.',
        type: 'correct',
        worked: 'Direto, educado e claro. O atendente vai entender exatamente o que você precisa.',
        tip: 'Se preferir menos contato visual, pode olhar para o crachá ou próximo à pessoa, não precisa forçar o olhar.'
      },
      {
        text: '“Desculpa… eu não sei se tem, tipo, se vocês vendem isso…”',
        type: 'alt',
        worked: 'Funciona, mas pode ser mais direto. Informar o nome do produto ajuda muito.',
        tip: 'Começar com “desculpa” não é obrigatório, mas se te deixar mais confortável, tudo bem.'
      },
      {
        text: 'Espera o atendente embora sozinho e tenta procurar mais uma hora.',
        type: 'avoid',
        worked: 'Pode dar certo, mas você pode gastar mais energia do que precisa.',
        tip: 'Se falar for muito difícil, anotar o nome do produto no celular e mostrar também funciona.'
      }
    ]
  },
  {
    id: 'amizade',
    icon: 'i-people',
    title: 'Fazer amizade',
    desc: 'Como começar uma conversa leve com alguém novo.',
    scene: 'Na volta de um evento, você está ao lado de alguém que parece legal e também está em silêncio.',
    answers: [
      {
        text: '“E aí, gostou do evento? Eu achei bem interessante.”',
        type: 'correct',
        worked: 'Começa com um tema em comum, que é fácil e leve de responder.',
        tip: 'Se a pessoa responder com pouco, não significa que não goste de você — algumas pessoas também são mais tímidas.'
      },
      {
        text: '“Qual seu filme favorito? E sua cor favorita? Você tem irmãos?”',
        type: 'alt',
        worked: 'Perguntas são boas, mas muitas de uma vez podem parecer pressão.',
        tip: 'Uma pergunta de cada vez e, depois, compartilhar algo sobre você também deixa a conversa natural.'
      },
      {
        text: 'Não fala nada e fica no silêncio, mesmo querendo conversar.',
        type: 'alt',
        worked: 'Também é válido e tem seu charme. Amizades começam de jeitos diferentes.',
        tip: 'Mesmo um “oi” ou um sorriso já abre caminho para outro momento.'
      }
    ]
  },
  {
    id: 'ligar',
    icon: 'i-chat',
    title: 'Fazer uma ligação',
    desc: 'Praticar uma ligação para marcar consulta.',
    scene: 'Você precisa ligar para marcar uma consulta. A pessoa do outro lado atende: “Clínica Saúde, bom dia.”',
    answers: [
      {
        text: '“Bom dia. Eu me chamo [seu nome] e gostaria de marcar uma consulta com o(a) [nome do profissional], por favor.”',
        type: 'correct',
        worked: 'Lembretes de chamadas telefônicas: nome, motivo e pedido. Funciona quase sempre.',
        tip: 'Se ficar nervoso, anotar um roteiro de 3 pontos ajuda muito.'
      },
      {
        text: '“Oi… eu queria… ah, é que eu preciso de consulta.”',
        type: 'alt',
        worked: 'Dá para entender, mas ser um pouco mais específico evita trocas de idas e vindas.',
        tip: 'Pode ser direto mesmo: “Queria marcar consulta com a Dra. Ana, de preferência no período da manhã.”'
      },
      {
        text: '“Bom dia, gostaria de marcar consulta para o mais breve possível, de preferência à tarde.”',
        type: 'correct',
        worked: 'Muito claro. A atendente vai provavelmente oferecer horários em seguida.',
        tip: 'Se ela dispor de alternativas, você pode pedir 2 ou 3 opções para escolher com calma.'
      }
    ]
  },
  {
    id: 'professor',
    icon: 'i-book',
    title: 'Conversar com um professor',
    desc: 'Pedir esclarecimento sobre uma matéria.',
    scene: 'Você não entendeu uma explicação da aula. A pessoa professora está livre depois da aula.',
    answers: [
      {
        text: '“Oi [nome], poderia explicar novamente a parte de [tópico]? Fiquei com dúvida.”',
        type: 'correct',
        worked: 'Direto e claro. Professores costumam valorizar quem pede ajuda com clareza.',
        tip: 'Levar seu caderno ou mostrar onde você ficou com dúvida acelera muito.'
      },
      {
        text: '“Não entendi nada da aula.”',
        type: 'alt',
        worked: 'Pode funcionar, mas especificar um pedaço ajuda a pessoa a focar.',
        tip: '“A parte do exemplo prático, principalmente, eu consegui acompanhar.”'
      },
      {
        text: 'Evita perguntar e procura um colega depois.',
        type: 'alt',
        worked: 'Também funciona. Às vezes explicação de colega fica mais fácil mesmo.',
        tip: 'Se ficar em branco, mandar mensagem por escrito pode ser uma alternativa confortável.'
      }
    ]
  },
  {
    id: 'restaurante',
    icon: 'i-comfort',
    title: 'Pedir algo em restaurante',
    desc: 'Como fazer um pedido claro para o garçom.',
    scene: 'O garçom pergunta: “Você já decidiu o que vai querer?”',
    answers: [
      {
        text: '“Para mim, por favor: [nome do prato], sem [alimento que não gosta]. De bebida, [bebida]. Obrigado.”',
        type: 'correct',
        worked: 'Claro e educado. Especificar restrições logo de início ajuda o atendente.',
        tip: 'Mostrar o item no cardápio também funciona se houver barulho.'
      },
      {
        text: '“Qual você recomenda?”',
        type: 'correct',
        worked: 'Se não tiver certeza, pedir recomendação é um ótimo começo.',
        tip: 'Você pode adicionar: “Prefiro pratos leves, de preferência sem queijo.”'
      },
      {
        text: '“Qualquer coisa serve.”',
        type: 'avoid',
        worked: 'O garçom pode ficar sem saber o que trazer.',
        tip: 'Mesmo algo simples como “qualquer massa sem molho branco” já é muito melhor.'
      }
    ]
  }
];

const SOUNDS = [
  { id: 'chuva',    icon: 'i-waves', label: 'Chuva' },
  { id: 'floresta', icon: 'i-tree',  label: 'Floresta' },
  { id: 'onda',     icon: 'i-leaf',  label: 'Ondas' },
  { id: 'fogo',     icon: 'i-sun',   label: 'Lareira' },
  { id: 'cafe',     icon: 'i-comfort', label: 'Cafeteria' },
  { id: 'vento',    icon: 'i-leaf',  label: 'Vento' }
];

const MOOD_OPTIONS = [
  { id: 'bem',     label: 'Bem',            value: 5 },
  { id: 'ok',      label: 'Ok',             value: 4 },
  { id: 'neutro',  label: 'Neutro',         value: 3 },
  { id: 'cansado', label: 'Cansado',        value: 2 },
  { id: 'sobrec',  label: 'Sobrecarregado', value: 1 }
];

const TAG_OPTIONS = [
  { id: 'noise',  icon: 'i-waves',  label: 'Muito barulho' },
  { id: 'crowd',  icon: 'i-people', label: 'Muitas pessoas' },
  { id: 'light',  icon: 'i-sun',    label: 'Luz desconfortável' },
  { id: 'social', icon: 'i-chat',   label: 'Situação social' },
  { id: 'tired',  icon: 'i-moon',   label: 'Cansaço' },
  { id: 'work',   icon: 'i-book',   label: 'Escola / trabalho' },
  { id: 'smell',  icon: 'i-leaf',   label: 'Cheiros' }
];

const LEAVE_CHECKLIST = [
  { id: 'dest',       label: 'Sei para onde vou' },
  { id: 'comochegar', label: 'Sei como chegar' },
  { id: 'itens',      label: 'Tenho meus itens necessários' },
  { id: 'horario',    label: 'Verifiquei o horário' },
  { id: 'pausa',      label: 'Sei onde posso fazer uma pausa' },
  { id: 'planoB',     label: 'Tenho uma alternativa caso precise ir embora' }
];

const WARM_MESSAGES = [
  'Vamos por partes.',
  'Você pode fazer no seu ritmo.',
  'Tudo bem precisar de uma pausa.',
  'Conhecer seus limites também é uma forma de autonomia.',
  'Não precisa entender tudo de uma vez.',
  'Cada passo pequeno já é um avanço.',
  'Estamos juntos nisso.',
  'Você já veio tão longe.'
];

/* =========================================================
   TELEFONES DE APOIO (para cuidadores e autistas)
   ========================================================= */
const SUPPORT_PHONES = [
  { name: 'Disque 100 (Direitos Humanos)', number: '100', desc: 'Atendimento sobre direitos de pessoas com deficiência', ico: 'i-heart', group: 'emergency' },
  { name: 'CVV — Centro de Valorização da Vida', number: '188', desc: 'Apoio emocional 24h, gratuito e sigiloso', ico: 'i-calm', group: 'emergency' },
  { name: 'SAMU', number: '192', desc: 'Emergências médicas 24h', ico: 'i-bell', group: 'emergency' },
  { name: 'Disque Saúde', number: '136', desc: 'Orientações sobre saúde e serviços do SUS', ico: 'i-hands', group: 'general' },
  { name: 'Associação Autismo MT (Várzea Grande)', number: '(65) 3000-1234', desc: 'Apoio local a famílias e pessoas autistas', ico: 'i-people', group: 'general', copyable: true },
  { name: 'Atenção — Saúde Mental', number: '(65) 99988-7766', desc: 'Atendimento psicológico (Cuiabá e VG)', ico: 'i-chat', group: 'general', copyable: true }
];

/* =========================================================
   TIPOS DE PERFIL (Pai/Mãe/Cuidador ou Autista)
   ========================================================= */
const PROFILE_ROLES = [
  { id: 'autista',      label: 'Eu sou autista',              hint: 'Ferramentas focadas em você' },
  { id: 'cuidador',     label: 'Sou pai, mãe ou cuidador',    hint: 'Apoio para cuidar da pessoa autista' }
];

const SUPPORT_LEVELS = [
  { value: 1, label: 'Nível 1 — Pouco suporte',    desc: 'Consigo fazer muitas coisas sozinho(a)',
    descCaregiver: 'Ela/Ele consegue fazer muitas coisas sozinho(a)' },
  { value: 2, label: 'Nível 2 — Suporte moderado', desc: 'Preciso de ajuda em algumas situações',
    descCaregiver: 'Ela/Ele precisa de ajuda em algumas situações' },
  { value: 3, label: 'Nível 3 — Muito suporte',    desc: 'Preciso de ajuda constante no dia a dia',
    descCaregiver: 'Ela/Ele precisa de ajuda constante no dia a dia' }
];

/* =========================================================
   IA — RESPOSTAS DA ASSISTENTE "ANA"
   ========================================================= */
const AI_RESPONSES = [
  {
    keys: ['sobrecarregado', 'angustiado', 'nervoso', 'crise', 'ansioso', 'mal', 'agitado', 'desesperado', 'pânico', 'assustado', 'medo'],
    answer: 'Sinto muito que você esteja se sentindo assim. 💙 Vamos com calma, tudo passa.\n\nTente fazer isso:\n1. Inspire pelo nariz contando até 4\n2. Segure a respiração contando até 7\n3. Solte devagar pela boca contando até 8\n\nRepita 3 vezes. Depois, se puder, vá para um lugar mais silencioso. Pegue seu objeto de conforto se tiver. Você consegue. ✨\n\nDica: na aba "Desacelerar → Respirar" tem o exercício com animação para você seguir junto.'
  },
  {
    keys: ['pedir ajuda', 'ajuda', 'loja', 'atendente', 'perguntar', 'pergunta', 'comprar', 'pagamento', 'caixa'],
    answer: 'Pedir ajuda é uma habilidade muito legal! 💪 Aqui vai uma forma simples:\n\n"Olá, estou procurando [nome do produto]. Você pode me dizer onde fica?"\n\n💡 Dica: Se ficar nervoso(a), você pode:\n• Escrever no celular e mostrar\n• Pedir para uma pessoa de confiança ir com você\n• Ir em horários mais calmos (de manhã cedo)\n\nO importante é você se sentir bem.'
  },
  {
    keys: ['rotina', 'dia', 'planejar', 'organizar', 'horário', 'agenda', 'programa'],
    answer: 'Uma rotina clara ajuda muito a se sentir seguro! 📅\n\nSugestão de manhã:\n• Acordar no mesmo horário\n• Tomar café do jeito que gosta\n• Escovar os dentes\n• Separar as roupas do dia\n• Ver os compromissos do dia\n\nNa aba "Rotina" você pode adicionar cada compromisso com horário e verificar o mapa de estímulos do local. Assim fica tudo previsível.'
  },
  {
    keys: ['pai', 'mãe', 'pais', 'cuidador', 'família', 'familia', 'mãe', 'pai'],
    answer: 'Ser pai, mãe ou cuidador de uma pessoa autista é um trabalho de muito amor e aprendizado. 💜\n\nLembre-se:\n• Você não está sozinho(a)\n• Cuidar de VOCÊ também é importante — tire seus minutos\n• Não se culpe por dias difíceis\n• Cada pequeno progresso vale muito\n• Respeite o ritmo da pessoa\n\nNa aba "Apoio Familiar" tem dicas práticas, orientações e telefones para buscar ajuda profissional.'
  },
  {
    keys: ['stimming', 'movimento', 'repetir', 'balançar', 'estereotipia', 'flap', 'bater mão'],
    answer: 'Stimming (movimentos repetitivos) é uma forma de autorregulação — ele ajuda a pessoa a se sentir mais calma e organizada. 🤲\n\nNão é algo "para parar". O ideal é entender a função do movimento e, se precisar, oferecer alternativas seguras.\n\nSe você é o autista: stimming faz parte de quem você é, não precisa se envergonhar. 💙\nSe você é cuidador: em vez de "para com isso", pergunte "quer uma alternativa mais segura?"'
  },
  {
    keys: ['amigo', 'amizade', 'conversar', 'pessoas', 'social', 'solitário', 'sozinho', 'popular'],
    answer: 'Fazer amizades pode ser difícil, mas existem pessoas que vão gostar muito de você do jeito que você é. 💙\n\nUma forma leve de começar:\n• Fale sobre algo que você gosta muito (interesses especiais são ótimos!)\n• Comece com um "oi" ou um comentário simples\n• Se a pessoa não responder muito, não é sua culpa\n• Grupos de interesse (jogos, desenhos, livros) são ótimos\n• Não é preciso ter muitos amigos — alguns bons já é ótimo\n\nVocê pode praticar na aba "Perfil → Situações Sociais → Treinador".'
  },
  {
    keys: ['escola', 'professor', 'sala', 'aula', 'prova', 'trabalho', 'lição', 'tarefa', 'bullying'],
    answer: 'A escola pode ser um lugar intenso, mas você tem direito a aprender com conforto. 🎒\n\nDicas que funcionam:\n• Avise seu professor sobre sons/luzes/texturas que te incomodam\n• Peça um "cantinho de descanso" na sala quando precisar\n• Use fones se a sala for muito barulhenta\n• Se tiver prova, pode pedir tempo extra se precisar\n• Diga se algo for demais para você\n\nSobre bullying: NÃO é sua culpa. É dever da escola proteger você. Fale com uma pessoa de confiança.'
  },
  {
    keys: ['barulho', 'som', 'ruído', 'barulhento', 'alto', 'som alto', 'hiperacusia'],
    answer: 'Sons altos são desconfortáveis mesmo — sua sensibilidade é real. 🔇\n\nO que ajuda:\n• Leve protetores auriculares ou fones de ouvido com você SEMPRE\n• Em ambientes barulhentos, procure um canto mais silencioso\n• Se puder, vá em horários mais calmos (supermercado de manhã cedo)\n• Combine com as pessoas de confiança um sinal para "quero sair"\n• Você não é "chato(a)" por isso — seu cérebro processa de forma diferente'
  },
  {
    keys: ['dormir', 'sono', 'dormir bem', 'acordar', 'insônia', 'dormir cedo', 'acordar tarde'],
    answer: 'Um sono bom faz muita diferença no dia seguinte. 😴\n\nRituais que ajudam:\n• Horário FIXO para dormir e acordar (inclusive fins de semana!)\n• Sem telas 1 hora antes de dormir (celular, TV, jogo)\n• Quarto escuro (cortina blackout ajuda muito)\n• Quarto silencioso (ou use ruído branco, sons de chuva)\n• Água morna ou chá calmante antes (camomila, erva-cidreira)\n• Evite chocolate/café/coca-cola à tarde\n\nNo "Desacelerar → Sons" tem sons para ouvir antes de dormir.'
  },
  {
    keys: ['obrigado', 'valeu', 'agradeço', 'tks', 'thanks', 'brigado', 'obrigada'],
    answer: 'De nada! 💙 Se precisar de mais alguma coisa, estou aqui. Lembre-se de ir devagar — você está fazendo o seu melhor e isso já é muito. Cada pequeno passo conta. ✨'
  },
  {
    keys: ['olá', 'oi', 'ola', 'e aí', 'eai', 'hello', 'hi', 'bom dia', 'boa tarde', 'boa noite'],
    answer: 'Olá! 😊 Eu sou a Ana, sua assistente do Autiversi. Como posso ajudar você hoje?\n\nVocê pode:\n• Me dizer como está se sentindo\n• Perguntar como lidar com alguma situação\n• Pedir dicas de rotina ou lugares calmos\n• Falar sobre escola, amigos ou família\n• Só conversar, se preferir\n\nÉ só digitar!'
  },
  {
    keys: ['quem é você', 'quem é vc', 'nome', 'sobre você', 'você é quem'],
    answer: 'Eu sou a Ana, sua assistente virtual do Autiversi. 💙\n\nEstou aqui para ajudar com dicas, orientações e para conversar sobre situações do dia a dia de pessoas autistas e seus cuidadores.\n\nNão sou um robô perfeito, mas quero te ajudar da melhor forma possível.\n\n⚠️ Se for uma emergência, ligue IMEDIATAMENTE:\n• 192 — SAMU (emergência médica)\n• 188 — CVV (apoio emocional 24h)'
  },
  {
    keys: ['diagnóstico', 'diagnostico', 'suspeito', 'suspeita', 'achar que sou autista', 'ser autista', 'como saber', 'sinais', 'sintomas'],
    answer: 'Suspeitar de autismo é o começo de uma jornada de autoconhecimento. 💙\n\nSinais comuns em adultos/crianças:\n• Dificuldade com mudanças de rotina\n• Interesses especiais muito intensos\n• Sensibilidade a sons/cores/texturas\n• Dificuldade com conversas sociais (olhar no olho, ironia)\n• Stimming (movimentos repetitivos)\n• Comunicação literal (gírias e duplo sentido difíceis)\n\n⚠️ Isso NÃO é diagnóstico! Procure um neuropediatra (crianças) ou psiquiatra/neurologista especializado em autismo para avaliação formal.\n\nNa aba "Apoio Familiar" tem mais orientações.'
  },
  {
    keys: ['PECS', 'pictograma', 'figura', 'comunicação alternativa', 'AAC', 'comunicação por figuras', 'cartões'],
    answer: 'PECS e comunicação alternativa (AAC) são ferramentas incríveis! 📸\n\nO que é PECS: usa figuras para a pessoa se comunicar, independentemente da fala.\n\nDicas para começar:\n• Use figuras GRANDES e claras\n• Comece com 3-5 figuras de coisas que a pessoa gosta MUITO (comida, brinquedo)\n• Coloque em um lugar fácil de alcançar\n• MODELE: pegue você mesmo a figura e peça em voz alta\n• Não force a fala junto — a figura é a comunicação!\n\nExistem também apps gratuitos como o LetMeTalk (Android) ou Proloquo2Go.'
  },
  {
    keys: ['birra', 'birra vs crise', 'birra x crise', 'diferença birra', 'xixi de pique'],
    answer: 'Birra ≠ Crise sensorial! É importante saber diferenciar: 📖\n\n🥊 BIRRA (chora de propósito):\n• Tem objetivo (ganhar algo)\n• Para com atenção ou quando consegue o que quer\n• A pessoa observa sua reação\n• Pára em segurança\n\n🌪️ CRISE SENSORIAL (cérebro sobrecarregado):\n• Não tem objetivo\n• A pessoa está DESREGULADA (não escolhe)\n• Não olha para você, não escuta\n• Precisa de ajuda para sair do estado\n• Pode demorar para passar\n\nNa crise: ambiente calmo + silêncio + objeto de conforto. NÃO É HORA DE ENSINAR LIÇÃO.'
  },
  {
    keys: ['alimentação', 'comida', 'alimentar', 'textura', 'seletivo', 'comer pouco', 'não come'],
    answer: 'Seletividade alimentar é SUPER comum no autismo — não é "falta de educação". 🍎\n\nDicas gentis:\n• Ofereça os alimentos SEGUROS (que a pessoa já gosta) SEMPRE\n• Introduza 1 alimento novo por vez, sem pressão\n• O contato visual/toque na comida já é um avanço — não precisa comer\n• Textura é mais importante que gosto! Misturar texturas dá medo\n• Não force a comer — refeição não deve ser batalha\n• Se for muito grave, consulte um nutricionista especializado em TEA\n\nPaciência: o objetivo é a pessoa se alimentar com conforto, não "limpar o prato".'
  },
  {
    keys: ['textura', 'tato', 'toque', 'roupa', 'sensibilidade tátil', 'tecido'],
    answer: 'Sensibilidade a texturas é real e pode ser dolorosa. 👕\n\nDicas para roupas:\n• Etiquetas: corte TODAS elas ou use lingerie por baixo\n• Tecidos: algodão PIMA, modal, tecidos macios e lisos\n• Evite: lã, renda, veludo, tecidos com textura\n• Costuras internas: procure roupas "seamless" (sem costura) ou vire do avesso\n• Calças/camisas: deixe 1 número maior se apertar for problema\n\nPara texturas em geral: objetos de conforto com textura CONHECIDA ajudam quando você tem que tocar algo novo.'
  },
  {
    keys: ['TDAH', 'hiperatividade', 'foco', 'concentrar', 'distrair', 'impulsivo'],
    answer: 'TDAH e autismo muitas vezes andam juntos (comorbidade). 🎯\n\nDicas para foco:\n• Ambiente LIMPO de distrações — mesa só com o que precisa\n• Técnica Pomodoro: 25 minutos foco + 5 minutos de pausa (stimming livre!)\n• Use timer visual para ver o tempo passando\n• Divida tarefas GRANDES em micro-passos\n• Lista escrita no papel: o cérebro autista não confia na memória\n• Música instrumental ou ruído branco de fundo pode ajudar\n\nSe isso estiver atrapalhando muito, fale com um psiquiatra sobre avaliação.'
  },
  {
    keys: ['terapia', 'ABA', 'TEACCH', 'fono', 'psicólogo', 'psicologa', 'terapia ocupacional'],
    answer: 'Terapias certas fazem muita diferença — mas escolha com cuidado. 💛\n\nTipos que têm boa evidência para autismo:\n• ABA (Applied Behavior Analysis) — mas APENAS ABA gentil, centrada na pessoa, sem "extinguir" stimming\n• TEACCH — organização visual e estruturada, ótimo para rotinas\n• Terapia Ocupacional — para integração sensorial\n• Fonoaudiologia — se houver dificuldade de fala/comunicação\n• Psicoterapia Cognitivo-Comportamental (TCC) adaptada para autismo\n\n⚠️ Fuja de terapias que prometem "curar" ou "remover traços de autismo". O objetivo do apoio é AUTONOMIA e BEM-ESTAR, não "parecer neurotípico".'
  },
  {
    keys: ['autismo adulto', 'adulto autista', 'trabalho', 'emprego', 'vida adulta'],
    answer: 'Autismo não é só de criança — adultos autistas existem e têm muito a contribuir. 💼\n\nDicas para trabalho:\n• Procure ambientes que respeitem seu ritmo\n• Divida tarefas por escrito, não só de boca\n• Fones de ouvido são seus amigos em escritórios abertos\n• Entrevista: pode divulgar ou não, é seu direito (mas divulgar ajuda com adaptações razoáveis)\n• ABNT NBR ISO 10015 + lei 13.146/2015 (Lei Brasileira de Inclusão) garantem adaptações\n\nAutoconhecimento é sua maior ferramenta: saiba o que te dá energia e o que te esgota.'
  },
  {
    keys: ['bullying', 'xingar', 'piada', 'zoar', 'humilhação', 'ofensa'],
    answer: 'Bullying NÃO é brincadeira. É violência e NÃO é sua culpa. 🛡️\n\nO que fazer:\n1. Saia do ambiente imediatamente se for seguro\n2. Fale com UMA PESSOA DE CONFIANÇA (pai/mãe/professor/amigo)\n3. Documente: datas, o que aconteceu, testemunhas (anote no celular)\n4. Em ambiente escolar/trabalho: exija providências oficiais\n5. Em casos graves: BO na delegacia (lei contra bullying existe em vários estados)\n\nVocê tem direito de ser respeitado do jeito que você é. 💙 Procure ajuda se precisar — 100 (Disque Direitos Humanos) ou 188 (CVV).'
  },
  {
    keys: ['amigos especiais', 'interesse especial', 'fixação', 'foco em', 'apaixonado por'],
    answer: 'Interesses especiais são SUPER PODERES das pessoas autistas! ⭐\n\nEles servem para:\n• Regular o sistema nervoso (acalmar)\n• Dar alegria e sentido para o dia\n• Fonte de aprendizado profundo\n• Conexão social (grupos de interesse)\n\n💡 Dica para pais/cuidadores: NÃO diga "para com isso" ou "você só fala disso". Em vez disso, pergunte: "Me conte mais sobre isso!" — você vai aprender muito e fortalecer o vínculo.\n\nOs interesses podem mudar, mas eles são parte do que faz VOCÊ ser VOCÊ.'
  },
  {
    keys: ['organizar', 'bagunça', 'quarto', 'limpar', 'arrumar'],
    answer: 'Organizar pode ser esmagador, mas dividindo fica fácil. 🧹\n\nMétodo micro-passo (15 minutos por dia):\n• Pegue 1 CAIXA e ponha tudo que está fora do lugar NELA. Não organize ainda — só junte.\n• Depois pegue a caixa e separe: 1) roupas 2) lixo 3) objetos\n• PONHA de volta UMA coisa de cada vez\n• Dê pausa de 5 minutos entre cada categoria\n• Parabenize-se por CADA item colocado no lugar\n\nO segredo é: NÃO precisa ficar perfeito. Basta ficar MELHOR que antes.'
  },
  {
    keys: ['viagem', 'sair', 'viagem de férias', 'aeroporto', 'ônibus', 'carro'],
    answer: 'Viajar pode ser incrível se planejarmos com antecedência. ✈️\n\nChecklist de preparo:\n• Leve SEU kit conforto: fones, objeto sensorial, lancha favorita, roupas que você conhece\n• PESQUISE antes: o lugar tem barulho? tem lugar silencioso?\n• Comunique-se: no avião, você pode pedir prioridade de embarque ou refeição especial\n• Crie uma "história social": escreva/draw os passos da viagem (acordar → carro → aeroporto → check-in → embarque → voo)\n• Horários: deixe BASTANTE tempo de sobra — pressa = ansiedade\n\nNo "Rotina → Preparar saída" tem um checklist completo para você usar!'
  },
  {
    keys: ['privacidade', 'dados', 'meus dados', 'segurança'],
    answer: 'Sua privacidade é SUPER importante para nós! 🔒\n\nComo o Autiversi funciona:\n• TUDO fica salvo APENAS no SEU navegador (localStorage)\n• NENHUM dado vai para servidor nenhum\n• Você pode apagar TUDO quando quiser\n\nPara limpar:\nAba "Perfil → Privacidade" → lá você apaga perfil sensorial, diário, rotina, locais salvos ou TUDO de uma vez.\n\nDica: Se compartilhar o computador, sempre limpe os dados antes de devolver ou use modo anônimo.'
  },
  {
    keys: ['autoestima', 'me aceitar', 'aceitação', 'não gosto de mim', 'me sinto diferente'],
    answer: 'Ser autista é uma forma de ser — não é um "erro", não é algo "para consertar". 💙\n\nVocê não é "demais", não é "pouco", você é VOCÊ. E isso é especial.\n\nPratique autoadvocacia:\n• Dizer "não" para situações que te machucam é direito SEU\n• Pedir adaptações não é pedir "favor" — é o mínimo de respeito\n• Não compare seu interior com o exterior dos outros\n• Celebre seus pequenos sucessos\n\nSe isso estiver muito pesado, procure um psicólogo ENTENDIDO sobre autismo. 188 (CVV) também está lá 24h se precisar de alguém para ouvir.'
  },
  {
    keys: ['epilepsia', 'convulsão', 'ataque', 'crise epilética'],
    answer: 'Epilepsia é comum em pessoas autistas (cerca de 20-30%). 🧠\n\nDurante uma convulsão:\n1. Afaste objetos perigosos da pessoa\n2. Coloque-a de lado (posição de recuperação)\n3. Afrouxe roupas apertadas no pescoço\n4. NÃO COLOQUE NADA NA BOCA (nem dedo, nem colher)\n5. NÃO segure a pessoa (ela pode se machucar)\n6. Anote o TEMPO que durou\n7. Se passar de 5 minutos → ligue 192 SAMU IMEDIATAMENTE\n\nDepois: repouso em lugar calmo. Conversar com neurologista sobre tratamento medicamentoso.'
  },
  {
    keys: ['dieta', 'comer saudável', 'alimentação saudável', 'sem glúten', 'caseína', 'restrição'],
    answer: 'Dieta em autismo: CUIDADO com modismos! 🥗\n\nO que tem EVIDÊNCIA:\n• Alimentação BALANCEADA, rica em frutas, legumes, proteína magra\n• Suplemento de OMEGA-3 e VITAMINA D (com orientação MÉDICA)\n• Se a pessoa tem alergia/restrição → remover o alimento (óbvio)\n\nO que NÃO tem evidência científica e pode ser PERIGOSO:\n• Dieta sem glúten/caseína SEM diagnóstico de alergia\n• Dietas restritivas extremas que cortam grupos alimentares\n• Suplementos "milagrosos" vendidos em redes sociais\n\nConsulte SEMPRE nutricionista ESPECIALIZADO antes de mudar a dieta da pessoa.'
  }
];

const AI_FALLBACK = 'Entendi! 😊\n\nSou a Ana, sua assistente virtual com dicas sobre autismo, rotina, calma e situações sociais.\n\nVocê pode perguntar coisas como:\n• "Como lidar com barulho alto?"\n• "Estou ansioso, o que fazer?"\n• "Dicas para fazer amizades"\n• "Como pedir ajuda em uma loja?"\n• "O que é PECS?"\n• "Como diferenciar birra de crise?"\n• "Dieta sem glúten funciona?"\n\n💡 Se for uma emergência, ligue para:\n• 192 — SAMU (médica)\n• 188 — CVV (apoio emocional 24h)\n• 100 — Direitos Humanos';

/* =========================================================
   CONTEÚDO PARA CRIANÇAS AUTISTAS (Espaço Criança)
   ========================================================= */

const NAV_LABELS_KIDS = {
  home: { label: '🏠 Início', hint: 'Aqui é o começo' },
  mapa: { label: '🗺️ Lugares', hint: 'Lugares bons para ir' },
  desacelerar: { label: '😮‍💨 Calma', hint: 'Para ficar tranquilo' },
  rotina:   { label: '✅ Tarefas', hint: 'Coisas do dia a dia' },
  cuidadores:{ label: '👨‍👩‍👧 Família', hint: 'Ajuda para adultos' },
  perfil:   { label: '👦 Você', hint: 'Seu perfil' }
};

const WARM_MESSAGES_KIDS = [
  '🌈 Você é muito especial!',
  '🎈 Tudo bem fazer do seu jeito.',
  '💙 O mundo é mais bonito com você nele.',
  '🌟 Calma, pequeno(a) — um passo de cada vez.',
  '🎨 Seus interesses são muito legais!',
  '🦸 Você consegue, eu confio em você.',
  '🍫 Você merece um momento de pausa.',
  '🌱 Todo dia você aprende um pouco mais.',
  '🤗 Tudo bem se você precisar de silêncio.',
  '✨ Seu jeito de ver as coisas é único.'
];

const CHILD_CATEGORIES = [
  { cat: 'colorir',  cls: 'ci-1', emoji: '🎨', title: 'Colorir',         small: 'Desenhos para pintar' },
  { cat: 'puzzle',   cls: 'ci-2', emoji: '🧩', title: 'Quebra-cabeça',   small: 'Monte peça por peça' },
  { cat: 'livros',   cls: 'ci-3', emoji: '📚', title: 'Histórias',       small: 'Histórias curtinhas' },
  { cat: 'musicas',  cls: 'ci-4', emoji: '🎵', title: 'Músicas calmas',  small: 'Sons para relaxar' },
  { cat: 'amigos',   cls: 'ci-5', emoji: '🐻', title: 'Amiguitos',       small: 'Personagens legais' },
  { cat: 'aprender', cls: 'ci-6', emoji: '🌱', title: 'Aprender',        small: 'Descobrir coisas novas' },
  { cat: 'memoria',  cls: 'ci-7', emoji: '🃏', title: 'Jogo da Memória', small: 'Ache os pares iguais' },
  { cat: 'formas',   cls: 'ci-8', emoji: '🔴', title: 'Formas e Cores',  small: 'Nomeie cada cor' },
  { cat: 'pontos',   cls: 'ci-9', emoji: '🔵', title: 'Ligue os Pontos', small: 'De 1 até o final' },
  { cat: 'contar',   cls: 'ci-10',emoji: '✋', title: 'Contar Dedinhos', small: 'Até chegar em 10' },
  { cat: 'sombras',  cls: 'ci-11',emoji: '🌑', title: 'Ache a Sombra',   small: 'Qual combina?' },
  { cat: 'ritmo',    cls: 'ci-12',emoji: '🥁', title: 'Bata o Ritmo',    small: 'Tum, tum, tum...' },
  { cat: 'intruso',  cls: 'ci-13',emoji: '🦄', title: 'Qual é diferente?', small: 'Ache o intruso' },
  { cat: 'social',   cls: 'ci-14',emoji: '🗣️', title: 'Conversar',       small: 'Como responder?' },
  { cat: 'letras',   cls: 'ci-15',emoji: '🔤', title: 'ABC divertido',   small: 'Aprender as letras' },
  { cat: 'sentir',   cls: 'ci-16',emoji: '💗', title: 'Meus sentimentos', small: 'Nomear emoções' },
  { cat: 'corpo',    cls: 'ci-17',emoji: '🤸', title: 'Movimento legal', small: 'Mexer o corpo' }
];

const CHILD_GAME_STEPS = {
  colorir: {
    emoji: '🎨',
    title: 'Vamos pintar um desenho!',
    steps: [
      'Pegue folha em branco e giz de cera ou canetinhas.',
      'Escolha um tema que você goste: sol, mar, bichos, casa.',
      'Desenhe as formas grandes primeiro.',
      'Pinte devagar, sem pressa. Você escolhe as cores.',
      'Quando terminar, mostre para alguém que você goste!'
    ]
  },
  puzzle: {
    emoji: '🧩',
    title: 'Quebra-cabeça tranquilo',
    steps: [
      'Abra o puzzle na mesa. Você pode começar com 6 peças só.',
      'Separe as peças pelas cores primeiro.',
      'Monte as bordas primeiro — fica mais fácil.',
      'Depois encaixe as peças do meio, uma por vez.',
      'Quando terminar, sorria para o seu feito! 👏'
    ]
  },
  livros: {
    emoji: '📚',
    title: 'Hora de ouvir uma história',
    steps: [
      'Sente num lugar macio: sofá, cama ou tapete.',
      'Pegue um livro ou peça para alguém ler com você.',
      'Olhe as figuras com calma. Cada página é um mundo novo.',
      'Pare quando quiser. Não tem pressa de terminar!',
      'Conte com suas palavras o que você ouviu.'
    ]
  },
  musicas: {
    emoji: '🎵',
    title: 'Sons que acalmam',
    steps: [
      'Coloque fones se quiser — ou use o som baixinho.',
      'Feche os olhos só um pouco, se você quiser.',
      'Respire com a música: inspira, expira.',
      'Tente ouvir só o som, sem pensar em outras coisas.',
      'Quando acabar, você está mais calmo(a)! 💙'
    ]
  },
  amigos: {
    emoji: '🐻',
    title: 'Visite os amiguitos',
    steps: [
      'Pegue seu bichinho de pelúcia preferido.',
      'Conte para ele como foi o seu dia hoje.',
      'Pergunte: "como você está hoje, amiguito?"',
      'Dê um abraço apertado, se tiver vontade.',
      'Coloque ele para dormir na caminha dele. 💤'
    ]
  },
  aprender: {
    emoji: '🌱',
    title: 'Descobrir coisas novas',
    steps: [
      'Escolha um tema: animais, planetas, carros, dinossauros...',
      'Assista um vídeo curto (5 minutos só) sobre o tema.',
      'Ou peça para um adulto te contar.',
      'Desenhe o que você aprendeu.',
      'Conte para alguém o que descobriu hoje!'
    ]
  },
  memoria: {
    emoji: '🃏',
    title: 'Jogo da memória fácil',
    steps: [
      'Pegue 8 cartinhas (4 pares iguais). Baralhe.',
      'De todas viradas para baixo, numa mesa.',
      'Vire duas: se forem iguais, você ganhou esse par!',
      'Se forem diferentes, vire de volta e tente de novo.',
      'Ache todos os 4 pares para vencer! 🏆'
    ]
  },
  formas: {
    emoji: '🔴',
    title: 'Formas e cores divertidas',
    steps: [
      'Pegue blocos de montar ou objetos coloridos.',
      'Diga em voz alta: círculo, quadrado, triângulo.',
      'Agora diga a cor de cada um: vermelho, azul, amarelo.',
      'Pegue 2 formas diferentes e brinque de montar.',
      'Parabéns! Você conhece muitas formas e cores! 🎉'
    ]
  },
  pontos: {
    emoji: '🔵',
    title: 'Ligue os pontinhos',
    steps: [
      'Pegue papel e lápis. Desenhe pontinhos com números: 1, 2, 3...',
      'Comece pelo número 1, com um círculo.',
      'Faça uma linha do 1 até o 2.',
      'Siga: 3, 4, 5... até o último número.',
      'Olhe o desenho que apareceu! Pinte se quiser.'
    ]
  },
  contar: {
    emoji: '✋',
    title: 'Contar até 10 com os dedinhos',
    steps: [
      'Mostre as duas mãos abertas. Temos 10 dedinhos!',
      'Dobre 1 dedo: "1". Dobre outro: "2".',
      'Vá devagar, contando cada um em voz alta.',
      'Quando chegar em 5, conte a outra mão.',
      'Uau! Você chegou até 10! Muito bem! 🌟'
    ]
  },
  sombras: {
    emoji: '🌑',
    title: 'Ache a sombra igual',
    steps: [
      'Pegue um brinquedo: bicho, carro, boneco.',
      'Coloque ele em cima de uma mesa, com luz do lado.',
      'Veja a sombra que ele faz. Ela é do mesmo formato.',
      'Agora tente outro brinquedo. Cada sombra é diferente!',
      'Você também pode fazer sombras com as mãos. 🐕'
    ]
  },
  ritmo: {
    emoji: '🥁',
    title: 'Bata o ritmo comigo',
    steps: [
      'Sente confortavelmente. Coloque as mãos nas pernas.',
      'Aperte as palmas: palma, palma, palma — devagar.',
      'Agora bata as pernas: tum, tum, tum.',
      'Tente alternar: palma → perna → palma → perna.',
      'Parabéns! Você já é um baterista! 🎶'
    ]
  },
  intruso: {
    emoji: '🦄',
    title: 'Qual é o diferente?',
    steps: [
      'Pegue 4 objetos: 3 bolinhas azuis e 1 quadrado amarelo.',
      'Coloque todos na mesa.',
      'Olhe cada um com calma. Qual é o diferente?',
      'Aponte para ele e diga porque ele não é igual.',
      'Vá aumentando: 6 objetos, 2 grupos diferentes.'
    ]
  },
  social: {
    emoji: '🗣️',
    title: 'Treino de conversa',
    steps: [
      'Responda em voz alta ou com palavras suas.',
      'Quando alguém perguntar: "Tudo bem?" Você pode dizer: "Tudo sim, obrigado!"',
      'Se não souber a resposta: "Ainda não sei, vou pensar."',
      'Se precisar de silêncio: "Hoje prefiro ficar quietinho, tudo bem?"',
      'Você já consegue! 💙 Pratique com um adulto.'
    ]
  },
  letras: {
    emoji: '🔤',
    title: 'ABC divertido',
    steps: [
      'Pegue um alfabeto de brinquedo ou desenhe as letras em papel.',
      'Comece com as 5 primeiras letras: A, B, C, D, E. Diga o nome de cada uma em voz alta.',
      'Pense em uma coisa que comece com cada letra: A de abacate, B de bola...',
      'Agora tente as próximas 5. Vá devagar, não tem pressa!',
      'Quando você quiser, cante a música do alfabeto com alguém. 🎶 Parabéns!'
    ]
  },
  sentir: {
    emoji: '💗',
    title: 'Meus sentimentos',
    steps: [
      'Sente confortavelmente. Respire fundo 3 vezes.',
      'Pergunte para si mesmo(a): "Como eu estou me sentindo agora?"',
      'Escolha um nome para o sentimento: feliz, triste, bravo, calmo, ansioso.',
      'Você pode desenhar o sentimento: um sol para feliz, uma gota para triste.',
      'Se quiser, conte para alguém como está se sentindo. Não tem vergonha nenhuma! 💙'
    ]
  },
  corpo: {
    emoji: '🤸',
    title: 'Movimento legal',
    steps: [
      'Fique de pé, com espaço ao seu redor. Música de fundo ajuda!',
      'Estique os braços para cima, bem devagar: 1, 2, 3. Agora desça.',
      'Balance os ombros 10 vezes, fazendo círculos para frente e para trás.',
      'Dê pulinhos no lugar (pode segurar na mão de alguém se precisar).',
      'Agora deite no chão e respire. Seu corpo agradece! 🌟 Muito bem!'
    ]
  }
};

const CHILD_STORIES = [
  { title: 'O Coelho Silencioso', emoji: '🐰', text: 'Era uma vez um coelhinho que não gostava de barulhos. Ele encontrou uma toca calma, com flores cheirosas e luz suave. Lá ele se sentia bem! Quando alguém perguntava se ele queria brincar, ele dizia: "Quer sim, mas vamos com calma!" 🌼' },
  { title: 'A Tartaruga Calma', emoji: '🐢', text: 'A tartaruga vivia no seu ritmo. Todos diziam: "você é devagar!" Mas ela sabia que devagar também é certo. Um dia ela encontrou um lago bem tranquilo e ficou ali feliz, porque era o lugar perfeito para ela.' },
  { title: 'O Peixinho Colorido', emoji: '🐠', text: 'O peixinho tinha cores muito bonitas. Cada cor era um interesse especial dele: azul era mar, amarelo era sol, verde era plantas. Ele colecionava pedrinhas do mar e era muito feliz assim. 💛' },
  { title: 'O Ursinho que Precisava de Abraço', emoji: '🧸', text: 'Um ursinho às vezes precisava de um abraço apertado, e às vezes não. A mamãe ursa sempre perguntava: "quer um abraço?" Se ele balançasse a cabeça, ela dava um sorriso. Respeitar o espaço do outro é amor! 💙' }
];

const CHILD_DRAWINGS = [
  { title: 'Sol e Nuvem', emoji: '☀️', desc: 'Desenhe um sol amarelo e uma nuvem branca. Use cores claras e calmas.' },
  { title: 'Árvore Feliz', emoji: '🌳', desc: 'Desenhe uma árvore com folhas verdes e um tronco castanho. Pode colocar frutas!' },
  { title: 'Peixinho no Mar', emoji: '🐟', desc: 'Desenhe peixinhos coloridos nadando no mar azul. Você coloca bolhas!' },
  { title: 'Casa Aconchegante', emoji: '🏡', desc: 'Desenhe uma casa com telhado vermelho e janelas. Dentro tem sua família.' }
];

const CHILD_GAMES = [
  { title: 'Encontre o Par', emoji: '🃏', desc: 'Jogo da memória com figuras grandes e poucas peças. Comece com 4 pares.' },
  { title: 'Quebra-Cabeça', emoji: '🧩', desc: 'Puzzle de 6 a 12 peças com imagens de animais. Tema preferido funciona melhor.' },
  { title: 'Formas e Cores', emoji: '🔴', desc: 'Monte círculos, quadrados e triângulos. Nomeie cada cor devagar.' },
  { title: 'Contar Dedo', emoji: '✋', desc: 'Mostre 1 dedo, depois 2... até 10. Conte com calma e com a pessoa.' }
];

const CHILD_BOOKS = [
  { title: 'O Menino que Descobriu o Silêncio', emoji: '📖', desc: 'História sobre um menino que encontra calma em meio ao mundo barulhento.' },
  { title: 'Ritinha e sua Rotina', emoji: '📚', desc: 'Uma história de como uma rotina organizada faz toda a diferença.' },
  { title: 'Amigos Diferentes, Amigos Iguais', emoji: '🤝', desc: 'Mostra que cada pessoa tem seu jeito — e isso é o que nos torna especiais.' },
  { title: 'O Coração Colorido', emoji: '💖', desc: 'Cada sentimento é uma cor. Aprender a nomear as emoções ajuda muito!' }
];

const CHILD_MUSICS = [
  { title: 'Pássaros pela manhã', emoji: '🎵', desc: 'Sons de pássaros cantando, muito leve.' },
  { title: 'Chuva na janela', emoji: '🌧️', desc: 'Som de chuva caindo devagar — ajuda a relaxar.' },
  { title: 'Flauta calma', emoji: '🎶', desc: 'Música instrumental suave, sem letras, para ouvir de olhos fechados.' },
  { title: 'Ondas do mar', emoji: '🌊', desc: 'Som do mar subindo e descendo. Muito tranquilizante!' },
  { title: 'Piano 432Hz', emoji: '🎹', desc: 'Notas suaves em 432Hz, a frequência do relaxamento.' },
  { title: 'Ruído branco', emoji: '⚪', desc: 'Som homogêneo que abafa outros ruídos — ótimo para focar.' },
  { title: 'Floresta calma', emoji: '🌳', desc: 'Vento nas folhas e animais distantes — natureza de verdade.' },
  { title: 'Canção de ninar', emoji: '🌙', desc: 'Melodia bem suave, como uma canção de ninar de colo.' },
  { title: 'Ciranda musical', emoji: '💃', desc: 'Notas circulares e leves, ótimas para dançar devagar.' },
  { title: 'Roda de amigos', emoji: '🎉', desc: 'Ritmo feliz mas tranquilo, para cantar com a família.' }
];

/* =========================================================
   CUIDADORES — Conteúdo da área de pais e cuidadores
   ========================================================= */

const CAREGIVER_SECTIONS = [
  {
    id: 'intro',
    icon: 'i-hands',
    title: 'Olá, pai, mãe ou cuidador',
    desc: 'Este espaço foi pensado para ajudar você a entender e apoiar melhor a pessoa autista sob seus cuidados. Cada pessoa é única — use estas dicas como referência e adapte ao que funciona no seu dia a dia.',
    content: [
      { t: 'Primeiro: escute e acredite', c: 'Quando a pessoa disser que algo a incomoda (barulho, luz, toque, texto longo), acredite. O que parece leve para você pode ser avassalador para ela.' },
      { t: 'Respeite o ritmo dela', c: 'Não pressione para socializar, responder rápido ou “superar” algo. Ofereça escolhas, não ordens. O “não” de hoje não é um desafio a você.' },
      { t: 'Comunicação direta', c: 'Fale de forma clara, objetiva e sem duplo sentido. Evite sarcasmo, ironias ou frases como “você sabe muito bem do que estou falando”.' },
      { t: 'Previsibilidade reduz ansiedade', c: 'Rotinas, avisos prévios de mudança e um “mapa” do dia a dia dão segurança. O imprevisto pode ser doloroso.' },
      { t: 'Elogie os esforços, não só os resultados', c: 'Um “você tentou” ou “gostei que você falou como se sentiu” fortalece a autoestima muito mais do que cobranças.' }
    ]
  },
  {
    id: 'psicologo',
    icon: 'i-heart',
    title: 'Orientação de psicólogos: primeiros passos',
    desc: 'Recomendações consolidadas por profissionais que atuam com autismo, baseadas em evidências e acolhimento.',
    content: [
      { t: 'Evite “conter” comportamentos', c: 'Não diga “para com isso” sem entender a função. Muitas vezes o stimming (movimentos repetitivos) é uma forma de autorregulação — ele acalma.' },
      { t: 'Reforce comunicação alternativa', c: 'Se a pessoa tem dificuldade com fala, use cartões, aplicativos, figuras, PECS ou escrita. Comunicação não é só voz.' },
      { t: 'Não compare com outras crianças', c: 'Cada desenvolvimento tem seu tempo. Um marco que chega “tarde” não é fracasso — é o ritmo da pessoa.' },
      { t: 'Busque diagnóstico e terapia cedo', c: 'Acompanhamento com neuropediatra e terapia ABA/TEACCH (sempre adaptado) pode fazer muita diferença. Mas, em qualquer idade, aprendizado é possível.' },
      { t: 'Não use “bom menino/boa menina” por suprimir necessidades', c: 'Elogie esforços, conquistas, falas de sentimento. Não recompense silêncio ou negação do conforto próprio.' }
    ]
  },
  {
    id: 'crise',
    icon: 'i-calm',
    title: 'Durante uma crise ou sobrecarga',
    desc: 'Uma crise sensorial não é birra. É quando o cérebro não consegue mais processar os estímulos. O que fazer: passo a passo.',
    steps: [
      'Mantenha a calma. Fale baixo e devagar, se for falar. Seu estado emocional afeta o dela.',
      'Leve a pessoa para um local com menos estímulos: silencioso, pouca luz, poucas pessoas.',
      'Não toque sem perguntar ou sem que ela já conheça e aceite seu toque. Toque pode aumentar a sobrecarga.',
      'Ofereça o objeto de conforto, se houver (fones, cobertor, brinquedo, objeto sensorial).',
      'Diga frases curtas e previsíveis: “Estou aqui.” “Podemos esperar.” “Quer sair?”',
      'Não faça perguntas em excesso, não tire foto e não chame atenção em público.',
      'Depois que passar, não critique. Agradeça se ela compartilhar como se sentiu. Registre os gatilhos para evitar da próxima vez.'
    ]
  },
  {
    id: 'escola',
    icon: 'i-book',
    title: 'Apoio na escola e na aprendizagem',
    desc: 'Dicas práticas para construir uma parceria com a escola e garantir um ambiente acolhedor.',
    tips: [
      'Converse com a escola antecipadamente sobre as necessidades específicas da pessoa: barulho, luz, intervalos, texturas de caderno.',
      'Sugira um “cantinho de descanso” na sala de aula — um espaço silencioso para recuperar quando a sobrecarga chegar.',
      'Negocie formas alternativas de avaliação: prova oral, projeto em casa, tempo extra. A criança já pode estar cansada só de estar na escola.',
      'Compartilhe com o professor o que funciona em casa: rituais de transição, objetos de conforto, comunicação por figuras.',
      'Se houver bullying, não minimize: “é só brincadeira” pode se tornar trauma. A escola tem responsabilidade legal.'
    ]
  },
  {
    id: 'comunicar',
    icon: 'i-chat',
    title: 'Como se comunicar melhor',
    desc: 'Pequenos ajustes fazem muita diferença na hora de conversar.',
    tips: [
      'Use frases curtas e diretas: “Vamos sair às 14h.” em vez de “A gente já vai, está quase na hora, você se arruma aí?”.',
      'Avise sobre mudanças com antecedência. Explique o porquê, se possível. “A visita da vovó vai ser amanhã, não hoje, porque ela ficou doente.”',
      'Dê tempo para a pessoa responder. O silêncio não é vazio — pode ser processamento.',
      'Se ela preferir, comunique-se por escrito, mensagem ou figuras. Comunicação é entendimento, não oralidade.',
      'Não termine frases pela pessoa. Não responda por ela em conversas com terceiros. Dê espaço.',
      'Use o nome real dos sentimentos: “Você parece sobrecarregado.” em vez de “Não fica assim.”. Nomear emoções ajuda a construir repertório.'
    ]
  },
  {
    id: 'rotina',
    icon: 'i-calendar',
    title: 'Apoio na rotina e em saídas',
    desc: 'Preparação evita surpresas e reduz ansiedade. Kit e planejamento são seus aliados.',
    list: [
      'Converse sobre o dia: o que vai acontecer, em que ordem, por quanto tempo. Use figuras, agenda visual ou calendário.',
      'Ao visitar um lugar novo, compartilhe fotos, horário e possíveis estímulos (barulho, cheiros, multidão). Isso prepara o cérebro.',
      'Leve sempre o kit conforto: fones de ouvido, óculos escuros, protetor auricular, água, objeto de conforto, lanche.',
      'Tenha um “plano de saída” combinado — um sinal secreto se a pessoa quiser ir embora antes. Sem drama, sem cobrança.',
      'Cronometre atividades cansativas. Intercale com descanso de 10-15 minutos.',
      'Se uma atividade for muito intensa, deixe o resto do dia mais leve. Não encha a agenda.'
    ]
  },
  {
    id: 'alimentacao',
    icon: 'i-comfort',
    title: 'Alimentação e sono',
    desc: 'Rotinas alimentares e de sono são pilares de bem-estar. Respeite aversões sensoriais.',
    pontos: [
      'Muitas pessoas autistas têm aversões a texturas, cheiros ou temperaturas de alimentos. Não force “só um pouquinho”. Ofereça alternativas nutritivas.',
      'Introduza novos alimentos de forma gentil: primeiro só na mesa, depois no prato ao lado, depois um toque. Pode demorar semanas.',
      'Rituais de sono são fundamentais: horário fixo, quarto escuro, sem tela 1h antes, música baixa ou ruído branco.',
      'Se a pessoa só aceita poucos alimentos, consulte um nutricionista especializado em TEA para evitar deficiências.'
    ]
  },
  {
    id: 'sociedade',
    icon: 'i-people',
    title: 'Com família, amigos e sociedade',
    desc: 'Como explicar autismo para outras pessoas e construir uma rede de apoio.',
    tips: [
      'Não tenha vergonha de explicar de forma simples: “Meu filho(a) é autista, então barulhos fortes o incomodam muito, por isso usamos fones.”',
      'Evite que outras pessoas digam “não parece autista” ou “você está exagerando”. A sua observação vale mais.',
      'Convide parentes e amigos a conhecer os interesses especiais da pessoa. Conversar sobre algo que ela ama constrói vínculo.',
      'Explicar para irmãos na idade deles ajuda a reduzir ciúmes e construir parceria.',
      'Busque grupos de pais: a troca de experiências práticas vale mais do que qualquer conteúdo teórico sozinho.'
    ]
  },
  {
    id: 'autocuidado',
    icon: 'i-heart',
    title: 'Cuide de você também',
    desc: 'Se você não estiver bem, não consegue apoiar ninguém. Isso não é egoísmo — é cuidado necessário.',
    pontos: [
      'Reserve tempo para o seu descanso, seus hobbies e suas pessoas queridas. Mesmo 30 minutos por dia já faz diferença.',
      'Não carregue tudo sozinho. Divida tarefas, peça ajuda a parentes e busque apoio profissional se possível (psicólogo, terapia ocupacional, fono).',
      'Não se culpe por dias difíceis. O importante é a consistência, não a perfeição. Chorar, cansar e errar faz parte.',
      'Aprenda a reconhecer seus próprios sinais de cansaço. Antes de “estourar”, peça ajuda.',
      'Conecte-se com outros cuidadores. Grupos presenciais ou online trazem alívio e dicas práticas.',
      'Não precisa ser “pai herói” ou “mãe superprotetora” o tempo todo. Você é humano.'
    ]
  },
  {
    id: 'recursos',
    icon: 'i-book',
    title: 'Recursos e ajuda profissional',
    desc: 'Sinais de que é hora de buscar ajuda, e quais profissionais consultar.',
    content: [
      { t: 'Quando procurar avaliação', c: 'Atraso na fala após 2 anos, pouco contato visual, não aponta para objetos, não responde ao nome, movimentos repetitivos. Mas atenção: cada pessoa tem um ritmo — sempre consulte profissional antes de qualquer conclusão.' },
      { t: 'Profissionais importantes', c: 'Neuropediatra/neurologista (diagnóstico), psicólogo especializado em TEA, fonoaudiólogo (comunicação e fala), terapeuta ocupacional (integração sensorial e atividades do dia a dia), psicanalista (se a família se identificar).' },
      { t: 'Direitos legais no Brasil', c: 'Lei Berenice Piana (12.764/2012) garante direitos à pessoa com TEA: atendimento prioritário, acesso à educação inclusiva, isenção de impostos na compra de veículo, BPC/LOAS em casos de baixa renda. Informe-se.' },
      { t: 'Dicas de leitura', c: '“O autismo explicado às pessoas normais” (Wendy Lawson), “Ninguém é normal” (Steve Silberman), artigos de pais adultos autistas. Ouça vocês também — eles são os maiores especialistas.' }
    ]
  }
];
