// AI / IT 术语题库：题干和选项均提供中文、韩文和英文版本。
// answer 是 options 数组的正确答案下标，从 0 开始计数。
const questions = [
  {
    id: 1,
    term: "人工智能",
    korean: "인공지능",
    term_en: "Artificial Intelligence",
    description: "让计算机执行通常需要人类智能才能完成的任务。",
    question: {
      zh: "让计算机执行通常需要人类智能的任务，这类技术统称为什么？",
      ko: "일반적으로 인간의 지능이 필요한 작업을 컴퓨터가 수행하게 하는 기술을 무엇이라고 하나요?",
      en: "What is the technology called that enables computers to perform tasks typically requiring human intelligence?"
    },
    options: [
      { zh: "人工智能", ko: "인공지능", en: "Artificial intelligence" },
      { zh: "数据库", ko: "데이터베이스", en: "Database" },
      { zh: "云计算", ko: "클라우드 컴퓨팅", en: "Cloud computing" },
      { zh: "版本管理", ko: "버전 관리", en: "Version control" }
    ],
    answer: 0
  },
  {
    id: 2,
    term: "机器学习",
    korean: "기계 학습",
    term_en: "Machine Learning",
    description: "通过数据训练模型，使计算机能够从经验中改进任务表现。",
    question: {
      zh: "通过数据训练模型，使计算机能够从经验中改进任务表现的方法是什么？",
      ko: "데이터로 모델을 학습시켜 경험을 통해 컴퓨터의 작업 성능을 향상시키는 방법은 무엇인가요?",
      en: "What method trains models with data so computers can improve their performance through experience?"
    },
    options: [
      { zh: "计算机视觉", ko: "컴퓨터 비전", en: "Computer vision" },
      { zh: "机器学习", ko: "기계 학습", en: "Machine learning" },
      { zh: "物联网", ko: "사물 인터넷", en: "Internet of Things" },
      { zh: "前端", ko: "프런트엔드", en: "Frontend" }
    ],
    answer: 1
  },
  {
    id: 3,
    term: "深度学习",
    korean: "딥 러닝",
    term_en: "Deep Learning",
    description: "使用多层神经网络学习数据中的复杂特征。",
    question: {
      zh: "使用多层神经网络学习复杂数据特征的方法是什么？",
      ko: "다층 신경망을 사용해 복잡한 데이터 특징을 학습하는 방법은 무엇인가요?",
      en: "What method uses multilayer neural networks to learn complex features in data?"
    },
    options: [
      { zh: "边缘计算", ko: "에지 컴퓨팅", en: "Edge computing" },
      { zh: "后端", ko: "백엔드", en: "Backend" },
      { zh: "深度学习", ko: "딥 러닝", en: "Deep learning" },
      { zh: "应用程序接口", ko: "응용 프로그래밍 인터페이스", en: "API" }
    ],
    answer: 2
  },
  {
    id: 4,
    term: "神经网络",
    korean: "신경망",
    term_en: "Neural Network",
    description: "由相互连接的计算节点组成，用于学习数据模式的模型。",
    question: {
      zh: "受生物神经系统启发、由相互连接的节点组成的计算模型是什么？",
      ko: "생물의 신경계에서 영감을 받아 서로 연결된 노드로 구성된 컴퓨팅 모델은 무엇인가요?",
      en: "What computing model, inspired by biological nervous systems, consists of interconnected nodes?"
    },
    options: [
      { zh: "提示词", ko: "프롬프트", en: "Prompt" },
      { zh: "云计算", ko: "클라우드 컴퓨팅", en: "Cloud computing" },
      { zh: "多模态", ko: "멀티모달", en: "Multimodal" },
      { zh: "神经网络", ko: "신경망", en: "Neural network" }
    ],
    answer: 3
  },
  {
    id: 5,
    term: "大语言模型",
    korean: "대규모 언어 모델",
    term_en: "Large Language Model",
    description: "能够理解并生成人类语言的强大 AI 模型。",
    question: {
      zh: "以下哪种模型经过大量文本训练，能够理解和生成自然语言？",
      ko: "대량의 텍스트로 학습되어 자연어를 이해하고 생성할 수 있는 모델은 무엇인가요?",
      en: "Which model is trained on large amounts of text and can understand and generate natural language?"
    },
    options: [
      { zh: "大语言模型", ko: "대규모 언어 모델", en: "Large language model" },
      { zh: "物联网", ko: "사물 인터넷", en: "Internet of Things" },
      { zh: "数据库", ko: "데이터베이스", en: "Database" },
      { zh: "前端", ko: "프런트엔드", en: "Frontend" }
    ],
    answer: 0
  },
  {
    id: 6,
    term: "生成式人工智能",
    korean: "생성형 인공지능",
    term_en: "Generative AI",
    description: "根据输入生成文本、图像、音频等新内容的人工智能。",
    question: {
      zh: "能够根据输入生成文本、图像或音频等新内容的人工智能类型是什么？",
      ko: "입력에 따라 텍스트, 이미지, 오디오 등의 새로운 콘텐츠를 생성하는 인공지능은 무엇인가요?",
      en: "What type of AI generates new content such as text, images, or audio from input?"
    },
    options: [
      { zh: "版本管理", ko: "버전 관리", en: "Version control" },
      { zh: "生成式人工智能", ko: "생성형 인공지능", en: "Generative AI" },
      { zh: "后端", ko: "백엔드", en: "Backend" },
      { zh: "边缘计算", ko: "에지 컴퓨팅", en: "Edge computing" }
    ],
    answer: 1
  },
  {
    id: 7,
    term: "自然语言处理",
    korean: "자연어 처리",
    term_en: "Natural Language Processing",
    description: "帮助计算机分析、理解和生成人类语言的技术领域。",
    question: {
      zh: "让计算机分析、理解或生成人类语言的技术领域是什么？",
      ko: "컴퓨터가 인간의 언어를 분석하고 이해하거나 생성하도록 하는 기술 분야는 무엇인가요?",
      en: "What field enables computers to analyze, understand, or generate human language?"
    },
    options: [
      { zh: "应用程序接口", ko: "응용 프로그래밍 인터페이스", en: "API" },
      { zh: "深度学习", ko: "딥 러닝", en: "Deep learning" },
      { zh: "自然语言处理", ko: "자연어 처리", en: "Natural language processing" },
      { zh: "云计算", ko: "클라우드 컴퓨팅", en: "Cloud computing" }
    ],
    answer: 2
  },
  {
    id: 8,
    term: "计算机视觉",
    korean: "컴퓨터 비전",
    term_en: "Computer Vision",
    description: "让计算机从图像和视频中提取信息并理解内容。",
    question: {
      zh: "让计算机从图像或视频中提取信息并进行理解的领域是什么？",
      ko: "컴퓨터가 이미지나 동영상에서 정보를 추출하고 내용을 이해하도록 하는 분야는 무엇인가요?",
      en: "What field enables computers to extract information from and understand images or videos?"
    },
    options: [
      { zh: "数据库", ko: "데이터베이스", en: "Database" },
      { zh: "提示词", ko: "프롬프트", en: "Prompt" },
      { zh: "机器学习", ko: "기계 학습", en: "Machine learning" },
      { zh: "计算机视觉", ko: "컴퓨터 비전", en: "Computer vision" }
    ],
    answer: 3
  },
  {
    id: 9,
    term: "提示词",
    korean: "프롬프트",
    term_en: "Prompt",
    description: "用户输入给 AI、用于引导其生成结果的指令或内容。",
    question: {
      zh: "用户为了引导 AI 生成期望结果而输入的指令或内容叫什么？",
      ko: "사용자가 AI가 원하는 결과를 생성하도록 안내하기 위해 입력하는 지시나 내용을 무엇이라고 하나요?",
      en: "What is the instruction or content a user enters to guide an AI toward a desired result called?"
    },
    options: [
      { zh: "提示词", ko: "프롬프트", en: "Prompt" },
      { zh: "神经网络", ko: "신경망", en: "Neural network" },
      { zh: "物联网", ko: "사물 인터넷", en: "Internet of Things" },
      { zh: "后端", ko: "백엔드", en: "Backend" }
    ],
    answer: 0
  },
  {
    id: 10,
    term: "智能体",
    korean: "지능형 에이전트",
    term_en: "AI Agent",
    description: "能够感知环境、规划步骤并调用工具完成任务的 AI 程序。",
    question: {
      zh: "能够感知环境、制定计划并调用工具执行任务的 AI 程序通常称为什么？",
      ko: "환경을 인식하고 계획을 세우며 도구를 호출해 작업을 수행하는 AI 프로그램을 무엇이라고 하나요?",
      en: "What is an AI program called when it can perceive its environment, plan, and use tools to complete tasks?"
    },
    options: [
      { zh: "前端", ko: "프런트엔드", en: "Frontend" },
      { zh: "智能体", ko: "지능형 에이전트", en: "AI agent" },
      { zh: "版本管理", ko: "버전 관리", en: "Version control" },
      { zh: "计算机视觉", ko: "컴퓨터 비전", en: "Computer vision" }
    ],
    answer: 1
  },
  {
    id: 11,
    term: "检索增强生成",
    korean: "검색 증강 생성",
    term_en: "Retrieval-Augmented Generation",
    description: "先检索外部知识，再结合检索内容生成答案的方法。",
    question: {
      zh: "让大语言模型先检索外部资料再生成答案的方法缩写是什么？",
      ko: "대규모 언어 모델이 외부 자료를 먼저 검색한 뒤 답변을 생성하는 방법의 약어는 무엇인가요?",
      en: "What is the abbreviation for the method where a large language model retrieves external information before generating an answer?"
    },
    options: [
      { zh: "大语言模型 (LLM)", ko: "대규모 언어 모델 (LLM)", en: "LLM" },
      { zh: "应用程序接口 (API)", ko: "응용 프로그래밍 인터페이스 (API)", en: "API" },
      { zh: "检索增强生成 (RAG)", ko: "검색 증강 생성 (RAG)", en: "RAG" },
      { zh: "自然语言处理 (NLP)", ko: "자연어 처리 (NLP)", en: "NLP" }
    ],
    answer: 2
  },
  {
    id: 12,
    term: "多模态",
    korean: "멀티모달",
    term_en: "Multimodal",
    description: "能够处理或结合文本、图像、音频等多种数据形式。",
    question: {
      zh: "能够处理文字、图像或音频等多种数据形式的 AI 能力称为什么？",
      ko: "텍스트, 이미지, 오디오 등 여러 종류의 데이터를 처리할 수 있는 AI 능력을 무엇이라고 하나요?",
      en: "What is the AI capability called that can process multiple data types such as text, images, and audio?"
    },
    options: [
      { zh: "数据库", ko: "데이터베이스", en: "Database" },
      { zh: "边缘计算", ko: "에지 컴퓨팅", en: "Edge computing" },
      { zh: "智能体", ko: "지능형 에이전트", en: "AI agent" },
      { zh: "多模态", ko: "멀티모달", en: "Multimodal" }
    ],
    answer: 3
  },
  {
    id: 13,
    term: "数据库",
    korean: "데이터베이스",
    term_en: "Database",
    description: "用于有序存储、管理和查询数据的软件系统。",
    question: {
      zh: "用于组织、存储和查询数据的软件系统称为什么？",
      ko: "데이터를 체계적으로 구성하고 저장하며 조회하는 소프트웨어 시스템을 무엇이라고 하나요?",
      en: "What is the software system for organizing, storing, and querying data called?"
    },
    options: [
      { zh: "数据库", ko: "데이터베이스", en: "Database" },
      { zh: "提示词", ko: "프롬프트", en: "Prompt" },
      { zh: "生成式人工智能", ko: "생성형 인공지능", en: "Generative AI" },
      { zh: "前端", ko: "프런트엔드", en: "Frontend" }
    ],
    answer: 0
  },
  {
    id: 14,
    term: "应用程序接口",
    korean: "응용 프로그래밍 인터페이스",
    term_en: "Application Programming Interface",
    description: "定义软件系统之间如何请求功能和交换数据的接口。",
    question: {
      zh: "软件系统之间用于通信和交换数据的接口通常缩写为什么？",
      ko: "소프트웨어 시스템 간 통신과 데이터 교환에 사용되는 인터페이스를 보통 무엇이라고 줄여 부르나요?",
      en: "What is the interface used for communication and data exchange between software systems commonly abbreviated as?"
    },
    options: [
      { zh: "检索增强生成 (RAG)", ko: "검색 증강 생성 (RAG)", en: "RAG" },
      { zh: "应用程序接口 (API)", ko: "응용 프로그래밍 인터페이스 (API)", en: "API" },
      { zh: "大语言模型 (LLM)", ko: "대규모 언어 모델 (LLM)", en: "LLM" },
      { zh: "物联网 (IoT)", ko: "사물 인터넷 (IoT)", en: "IoT" }
    ],
    answer: 1
  },
  {
    id: 15,
    term: "前端",
    korean: "프런트엔드",
    term_en: "Frontend",
    description: "网站或应用中用户直接看到并进行交互的部分。",
    question: {
      zh: "网站或应用中用户直接看到并交互的部分称为什么？",
      ko: "웹사이트나 애플리케이션에서 사용자가 직접 보고 상호작용하는 부분은 무엇인가요?",
      en: "What is the part of a website or app that users see and interact with directly called?"
    },
    options: [
      { zh: "云计算", ko: "클라우드 컴퓨팅", en: "Cloud computing" },
      { zh: "后端", ko: "백엔드", en: "Backend" },
      { zh: "前端", ko: "프런트엔드", en: "Frontend" },
      { zh: "机器学习", ko: "기계 학습", en: "Machine learning" }
    ],
    answer: 2
  },
  {
    id: 16,
    term: "后端",
    korean: "백엔드",
    term_en: "Backend",
    description: "负责服务器端业务逻辑、数据处理和存储的部分。",
    question: {
      zh: "负责服务器端逻辑、数据处理和业务功能的部分称为什么？",
      ko: "서버 측 로직, 데이터 처리 및 비즈니스 기능을 담당하는 부분은 무엇인가요?",
      en: "What is the part responsible for server-side logic, data processing, and business functions called?"
    },
    options: [
      { zh: "物联网", ko: "사물 인터넷", en: "Internet of Things" },
      { zh: "计算机视觉", ko: "컴퓨터 비전", en: "Computer vision" },
      { zh: "提示词", ko: "프롬프트", en: "Prompt" },
      { zh: "后端", ko: "백엔드", en: "Backend" }
    ],
    answer: 3
  },
  {
    id: 17,
    term: "云计算",
    korean: "클라우드 컴퓨팅",
    term_en: "Cloud Computing",
    description: "通过互联网按需提供服务器、存储和计算能力。",
    question: {
      zh: "通过互联网按需使用服务器、存储等计算资源的方式称为什么？",
      ko: "인터넷을 통해 서버와 저장소 등의 컴퓨팅 자원을 필요할 때 사용하는 방식을 무엇이라고 하나요?",
      en: "What is the on-demand use of computing resources such as servers and storage over the internet called?"
    },
    options: [
      { zh: "云计算", ko: "클라우드 컴퓨팅", en: "Cloud computing" },
      { zh: "神经网络", ko: "신경망", en: "Neural network" },
      { zh: "数据库", ko: "데이터베이스", en: "Database" },
      { zh: "深度学习", ko: "딥 러닝", en: "Deep learning" }
    ],
    answer: 0
  },
  {
    id: 18,
    term: "物联网",
    korean: "사물 인터넷",
    term_en: "Internet of Things",
    description: "让实体设备连接网络并收集、交换数据的技术体系。",
    question: {
      zh: "让日常物品通过网络连接并交换数据的技术通常缩写为什么？",
      ko: "일상적인 사물을 네트워크에 연결해 데이터를 주고받게 하는 기술은 보통 무엇이라고 줄여 부르나요?",
      en: "What is the technology that connects everyday objects to a network so they can exchange data commonly abbreviated as?"
    },
    options: [
      { zh: "人工智能 (AI)", ko: "인공지능 (AI)", en: "AI" },
      { zh: "物联网 (IoT)", ko: "사물 인터넷 (IoT)", en: "IoT" },
      { zh: "应用程序接口 (API)", ko: "응용 프로그래밍 인터페이스 (API)", en: "API" },
      { zh: "检索增强生成 (RAG)", ko: "검색 증강 생성 (RAG)", en: "RAG" }
    ],
    answer: 1
  },
  {
    id: 19,
    term: "边缘计算",
    korean: "에지 컴퓨팅",
    term_en: "Edge Computing",
    description: "在靠近数据来源的位置处理数据，以减少延迟和传输量。",
    question: {
      zh: "在靠近数据产生位置的设备上处理数据的方式称为什么？",
      ko: "데이터가 생성되는 위치와 가까운 장치에서 데이터를 처리하는 방식을 무엇이라고 하나요?",
      en: "What is the method of processing data on devices close to where the data is generated called?"
    },
    options: [
      { zh: "生成式人工智能", ko: "생성형 인공지능", en: "Generative AI" },
      { zh: "云计算", ko: "클라우드 컴퓨팅", en: "Cloud computing" },
      { zh: "边缘计算", ko: "에지 컴퓨팅", en: "Edge computing" },
      { zh: "自然语言处理", ko: "자연어 처리", en: "Natural language processing" }
    ],
    answer: 2
  },
  {
    id: 20,
    term: "版本管理",
    korean: "버전 관리",
    term_en: "Version Control",
    description: "记录和管理文件或源代码随时间发生的修改。",
    question: {
      zh: "用于跟踪和管理源代码不同修改版本的方法或工具称为什么？",
      ko: "소스 코드의 변경 이력을 추적하고 여러 버전을 관리하는 방법이나 도구를 무엇이라고 하나요?",
      en: "What is the method or tool for tracking and managing different versions of source code changes called?"
    },
    options: [
      { zh: "多模态", ko: "멀티모달", en: "Multimodal" },
      { zh: "大语言模型", ko: "대규모 언어 모델", en: "Large language model" },
      { zh: "应用程序接口", ko: "응용 프로그래밍 인터페이스", en: "API" },
      { zh: "版本管理", ko: "버전 관리", en: "Version control" }
    ],
    answer: 3
  }
];
