export interface Lesson {
  id: number;
  fase: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
}

export const LESSONS: Lesson[] = [
  {
    id: 1,
    fase: "AULA 01",
    title: "Método Redrive",
    description:
      "A visão geral do método completo. Entenda como cada fase se conecta e por que a ordem das engrenagens importa para o resultado da sua operação.",
    duration: "16 MIN",
    videoUrl: "https://player.vimeo.com/video/1212028137?h=f668af186e&badge=0&autopause=0&player_id=0&app_id=58479",
  },
  {
    id: 2,
    fase: "AULA 02",
    title: "A Máquina de Vendas",
    description:
      "Como transformar sua operação em uma máquina previsível de vendas. Estrutura, processos e a lógica por trás de cada decisão que gera resultado.",
    duration: "32 MIN",
    videoUrl: "https://player.vimeo.com/video/1212028149?h=8d7f8d11b0&badge=0&autopause=0&player_id=0&app_id=58479",
  },
  {
    id: 3,
    fase: "AULA 03",
    title: "A Janela de Atenção",
    description:
      "O conceito que muda a forma como você aborda leads. Entenda o timing certo para cada interação e por que a velocidade de resposta define a conversão.",
    duration: "11 MIN",
    videoUrl: "https://player.vimeo.com/video/1212028169?badge=0&autopause=0&player_id=0&app_id=58479",
  },
  {
    id: 4,
    fase: "AULA 04",
    title: "Descobertas Importantes",
    description:
      "Os insights que o Daniel acumulou em anos operando a Redrive. Padrões, armadilhas e atalhos que a maioria dos times descobre tarde demais.",
    duration: "28 MIN",
    videoUrl: "https://player.vimeo.com/video/1212028169?badge=0&autopause=0&player_id=0&app_id=58479",
  },
  {
    id: 5,
    fase: "AULA 05",
    title: "A Matéria Prima",
    description:
      "Leads são a matéria-prima da operação. Aprenda a gerar volume com qualidade, diversificar canais de captação e nunca mais depender de uma única fonte.",
    duration: "16 MIN",
    videoUrl: "https://player.vimeo.com/video/1212068988?badge=0&autopause=0&player_id=0&app_id=58479",
  },
  {
    id: 6,
    fase: "AULA 06",
    title: "Ativação",
    description:
      "Ter leads não é ter oportunidades. Aprenda a ativar contatos parados, criar demandas e transformar conversas em receita com cadência e personalização.",
    duration: "1H08 MIN",
    videoUrl: "",
  },
  {
    id: 7,
    fase: "AULA 07",
    title: "A Escala",
    description:
      "Como escalar o atendimento sem perder qualidade. IA, agentes inteligentes e automações que trabalham enquanto sua equipe foca no que importa.",
    duration: "29 MIN",
    videoUrl: "",
  },
  {
    id: 8,
    fase: "AULA 08",
    title: "O Controle",
    description:
      "Gestão, métricas e indicadores que importam. Como enxergar a saúde da operação em tempo real e tomar decisões baseadas em dados.",
    duration: "21 MIN",
    videoUrl: "https://player.vimeo.com/video/1212126159?badge=0&autopause=0&player_id=0&app_id=58479",
  },
];
