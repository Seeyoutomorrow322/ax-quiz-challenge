// 游戏状态：记录当前分数、题号和本轮抽中的题目。
let currentScore = 0; // 当前累计分数
let currentQuestionIndex = 0; // 当前题目在本轮中的位置
const questionBank = questions; // 从 questions.js 读取题库
const QUESTIONS_PER_ROUND = 10; // 每轮计划抽取的题目数量
const POINTS_PER_QUESTION = 10; // 每题答对可得分数
const MAX_SCORE = QUESTIONS_PER_ROUND * POINTS_PER_QUESTION;
const HIGH_SCORE_STORAGE_KEY = "axQuizHighScore";
const DAILY_WORD_COUNT_STORAGE_KEY = "axQuizDailyWordCount";
const STUDY_PROGRESS_STORAGE_KEY = "axQuizStudyProgress";
const DEFAULT_DAILY_WORD_COUNT = 10;
const MAX_DAILY_WORD_COUNT = 50;
let currentLanguage = "zh";
let currentRoundQuestions = [];
let isAnswerLocked = false;
let currentFeedbackKey = "";
let advanceTimeoutId = null;
let isPageTransitioning = false;
let dailyWordCount = DEFAULT_DAILY_WORD_COUNT;
let currentStudyDay = 1;
let completedStudyDay = 0;
let isStudyDayTransitioning = false;

const vocabularyList = [
  { term: "强化学习", korean: "강화 학습", term_en: "Reinforcement Learning", description: "智能体通过与环境交互，并依据奖励或惩罚信号来学习行动策略的方法。" },
  { term: "监督学习", korean: "지도 학습", term_en: "Supervised Learning", description: "使用带有正确答案标签的数据训练模型，使其学习输入与目标输出之间关系的方法。" },
  { term: "无监督学习", korean: "비지도 학습", term_en: "Unsupervised Learning", description: "使用没有预先标注结果的数据，发现数据中的结构、类别或规律的方法。" },
  { term: "半监督学习", korean: "준지도 학습", term_en: "Semi-supervised Learning", description: "结合少量带标签数据和大量未标注数据训练模型的方法。" },
  { term: "迁移学习", korean: "전이 학습", term_en: "Transfer Learning", description: "将模型在一个任务或数据集上学到的知识迁移到相关新任务中的方法。" },
  { term: "联邦学习", korean: "연합 학습", term_en: "Federated Learning", description: "在数据保留于本地设备或机构的情况下协同训练模型的方法。" },
  { term: "特征工程", korean: "특성 공학", term_en: "Feature Engineering", description: "从原始数据中选择、转换或构造适合模型使用的特征的过程。" },
  { term: "训练集", korean: "훈련 데이터셋", term_en: "Training Set", description: "用于训练模型并调整模型参数的数据集合。" },
  { term: "验证集", korean: "검증 데이터셋", term_en: "Validation Set", description: "用于评估训练过程、选择模型或调整超参数的数据集合。" },
  { term: "测试集", korean: "테스트 데이터셋", term_en: "Test Set", description: "用于在训练完成后评估模型对未见数据的泛化表现的数据集合。" },
  { term: "过拟合", korean: "과적합", term_en: "Overfitting", description: "模型过度适应训练数据中的细节或噪声，导致对新数据表现变差的现象。" },
  { term: "欠拟合", korean: "과소적합", term_en: "Underfitting", description: "模型复杂度或训练不足以捕捉数据中的主要规律，导致训练和测试表现都较差的现象。" },
  { term: "梯度下降", korean: "경사 하강법", term_en: "Gradient Descent", description: "通过沿着损失函数梯度的反方向更新参数，以逐步降低模型误差的优化方法。" },
  { term: "反向传播", korean: "역전파", term_en: "Backpropagation", description: "在神经网络中将误差信号从输出层向前传递，用于计算各参数梯度的算法。" },
  { term: "损失函数", korean: "손실 함수", term_en: "Loss Function", description: "衡量模型预测结果与目标结果之间差异的函数，通常用于指导模型训练。" },
  { term: "优化器", korean: "최적화 알고리즘", term_en: "Optimizer", description: "根据梯度更新模型参数，以减少损失函数值的算法或训练组件。" },
  { term: "卷积神经网络", korean: "합성곱 신경망", term_en: "Convolutional Neural Network (CNN)", description: "使用卷积运算提取局部特征，常用于图像识别和视觉任务的神经网络。" },
  { term: "循环神经网络", korean: "순환 신경망", term_en: "Recurrent Neural Network (RNN)", description: "通过循环结构处理序列信息，适用于文本、语音等时序数据的神经网络。" },
  { term: "Transformer", korean: "트랜스포머", term_en: "Transformer", description: "以注意力机制为核心的神经网络架构，广泛用于自然语言处理和多模态任务。" },
  { term: "注意力机制", korean: "어텐션 메커니즘", term_en: "Attention Mechanism", description: "让模型根据当前任务需要，为输入中的不同部分分配不同关注权重的机制。" },
  { term: "分词", korean: "토큰화", term_en: "Tokenization", description: "将文本拆分为词、子词或其他基本单元，供语言模型处理的过程。" },
  { term: "词嵌入", korean: "단어 임베딩", term_en: "Word Embedding", description: "将词语表示为数值向量，使模型能够处理词语及其语义关系的方法。" },
  { term: "向量数据库", korean: "벡터 데이터베이스", term_en: "Vector Database", description: "用于存储向量并按相似度进行检索的数据库，常用于语义搜索和检索增强生成。" },
  { term: "微调", korean: "파인 튜닝", term_en: "Fine-tuning", description: "在预训练模型基础上使用特定任务或领域的数据继续训练，以适配新用途的过程。" },
  { term: "量化", korean: "양자화", term_en: "Quantization", description: "使用较低精度表示模型参数或计算结果，以减少模型占用空间和推理成本的技术。" },
  { term: "知识蒸馏", korean: "지식 증류", term_en: "Knowledge Distillation", description: "将较大教师模型学到的知识迁移到较小学生模型中的模型压缩方法。" },
  { term: "上下文窗口", korean: "컨텍스트 윈도우", term_en: "Context Window", description: "语言模型在一次处理或生成过程中能够参考的输入信息范围。" },
  { term: "模型推理", korean: "모델 추론", term_en: "Model Inference", description: "使用已训练模型对新输入执行预测、分类或内容生成的过程。" },
  { term: "AI 幻觉", korean: "AI 환각", term_en: "AI Hallucination", description: "生成式模型产生看似合理、但与事实不符或缺乏依据内容的现象。" },
  { term: "系统提示词", korean: "시스템 프롬프트", term_en: "System Prompt", description: "用于设定 AI 助手角色、行为规则和回答约束的初始指令。" },
  { term: "超文本标记语言", korean: "하이퍼텍스트 마크업 언어", term_en: "HyperText Markup Language (HTML)", description: "用于描述网页结构和内容的标记语言。" },
  { term: "层叠样式表", korean: "캐스케이딩 스타일 시트", term_en: "Cascading Style Sheets (CSS)", description: "用于控制网页布局、颜色、字体和响应式显示效果的样式语言。" },
  { term: "JavaScript", korean: "자바스크립트", term_en: "JavaScript", description: "常用于实现网页交互、动态内容和服务端应用的编程语言。" },
  { term: "文档对象模型", korean: "문서 객체 모델", term_en: "Document Object Model (DOM)", description: "浏览器将 HTML 文档表示为可由脚本读取和修改的节点树结构。" },
  { term: "响应式网页设计", korean: "반응형 웹 디자인", term_en: "Responsive Web Design", description: "使网页布局能够根据屏幕尺寸和设备特征自动适配的设计方法。" },
  { term: "单页应用", korean: "싱글 페이지 애플리케이션", term_en: "Single-Page Application (SPA)", description: "主要通过客户端动态更新页面内容，减少整页重新加载的 Web 应用。" },
  { term: "服务端渲染", korean: "서버 사이드 렌더링", term_en: "Server-Side Rendering (SSR)", description: "由服务器生成网页 HTML 后发送给浏览器的渲染方式。" },
  { term: "Node.js", korean: "노드.js", term_en: "Node.js", description: "基于 V8 引擎的 JavaScript 运行环境，可用于构建服务端和命令行应用。" },
  { term: "微服务", korean: "마이크로서비스", term_en: "Microservices", description: "将应用拆分为多个可独立开发、部署和扩展的小型服务的架构风格。" },
  { term: "REST API", korean: "REST API", term_en: "REST API", description: "遵循 REST 架构约束，通常通过 HTTP 资源和方法提供服务接口的设计方式。" },
  { term: "GraphQL", korean: "그래프QL", term_en: "GraphQL", description: "一种 API 查询语言和运行时，客户端可声明所需的数据字段。" },
  { term: "结构化查询语言", korean: "구조화 질의 언어", term_en: "Structured Query Language (SQL)", description: "用于定义、查询和操作关系型数据库中数据的语言。" },
  { term: "缓存", korean: "캐시", term_en: "Cache", description: "将常用数据暂存于更快的存储位置，以减少重复计算或访问延迟的技术。" },
  { term: "超文本传输协议", korean: "하이퍼텍스트 전송 프로토콜", term_en: "HyperText Transfer Protocol (HTTP)", description: "浏览器与 Web 服务器之间传输网页及相关资源时常用的应用层协议。" },
  { term: "域名系统", korean: "도메인 네임 시스템", term_en: "Domain Name System (DNS)", description: "将域名解析为 IP 地址等网络信息的分布式命名系统。" },
  { term: "IP 地址", korean: "IP 주소", term_en: "IP Address", description: "用于标识 IP 网络中设备或网络接口的逻辑地址。" },
  { term: "传输控制协议", korean: "전송 제어 프로토콜", term_en: "Transmission Control Protocol (TCP)", description: "提供可靠、有序数据传输的传输层协议。" },
  { term: "传输层安全协议", korean: "전송 계층 보안", term_en: "Transport Layer Security (TLS)", description: "用于保护网络通信机密性和完整性的加密协议，常用于 HTTPS。" },
  { term: "负载均衡", korean: "로드 밸런싱", term_en: "Load Balancing", description: "将网络请求分配到多个服务器或资源，以提升可用性和处理能力的技术。" },
  { term: "内容分发网络", korean: "콘텐츠 전송 네트워크", term_en: "Content Delivery Network (CDN)", description: "通过分布在多个位置的服务器缓存并交付内容，以降低访问延迟的网络服务。" }
];

// 界面翻译只作用于带有 data-i18n 的 UI 元素，不会改动题目或答案选项。
const translations = {
  zh: {
    accessibility: {
      navigation: "页面导航",
      language: "选择界面语言",
      scoreSummary: "学习进度摘要",
      progress: "答题进度：第 1 题，共 10 题",
      options: "答案选项"
    },
    pageTitle: "AX Quiz Challenge",
    navigation: {
      home: "开始",
      vocabulary: "词语库",
      quiz: "答题",
      results: "成绩"
    },
    home: {
      eyebrow: "AI · IT TERMINOLOGY",
      title: "准备好挑战术语了吗？",
      intro: "通过中、韩、英术语练习，让每天学习一点点变得有趣。",
      round: "每轮 10 道题",
      points: "每题 10 分",
      spotlightCaption: "每答一题，进步一点。"
    },
    button: {
      openVocabulary: "查看词语库",
      start: "开始答题",
      replay: "再玩一次"
    },
    vocabulary: {
      eyebrow: "VOCABULARY",
      title: "AI·IT 词语库",
      description: "搜索并学习题库中的中文、韩文和英文术语。",
      searchLabel: "搜索词语",
      searchPlaceholder: "输入中文、韩文或英文",
      chinese: "中文",
      korean: "韩文",
      englishDescription: "英文与描述",
      dailyCountLabel: "每日学习单词数",
      dailyCountHelp: "设置每天学习的词数（1–50）",
      studyDays: "每日学习计划",
      previous: "上一个",
      next: "下一个",
      dayLabel: "Day {day}",
      daySummary: "Day {day} · {count} 个单词",
      markComplete: "完成今日学习",
      completedStatus: "已完成 Day {day}，进度已保存。",
      pendingStatus: "正在学习 Day {day} · {count} 个单词。",
      completeAllStatus: "恭喜！已完成全部 50 个单词。",
      invalidDailyCount: "请输入 1 到 50 之间的整数。",
      noResults: "没有找到匹配的词语。",
      speakKorean: "朗读韩文：{term}",
      speakEnglish: "朗读英文：{term}",
      speaking: "正在朗读：{term}",
      speechUnavailable: "此浏览器暂不支持语音朗读。"
    },
    quiz: {
      questionCount: "第 01 题 / 共 10 题",
      progressLabel: "本轮进度",
      currentScore: "当前得分",
      questionExample: "中文问题示例",
      personalBest: "个人最佳",
      feedback: "选择答案后，这里显示答对或答错的提示。"
    },
    score: {
      complete: "挑战完成",
      final: "最终得分",
      highest: "历史最高分",
      highestHome: "历史最高分：0",
      outOf: " / 100 分"
    },
    game: {
      correct: "回答正确！+10 分",
      incorrect: "回答错误，再接再厉！",
      notEnoughQuestions: "题库目前只有 {count} 道题，至少需要 10 道不重复题目才能开始。"
    },
    about: {
      eyebrow: "关于本项目",
      title: "关于 AX Quiz Challenge",
      description: "这是一个帮助学习者认识 AI·IT 术语的中、韩、英闯关小游戏。",
      featureRandom: "随机练习，减少重复做题",
      featureFeedback: "每题即时反馈，逐步累计成绩",
      featureResponsive: "支持电脑与手机浏览"
    },
    footer: {
      text: "AX Quiz Challenge · 项目结构与页面草图"
    }
  },
  ko: {
    accessibility: {
      navigation: "페이지 탐색",
      language: "인터페이스 언어 선택",
      scoreSummary: "학습 진행 요약",
      progress: "퀴즈 진행 상황: 10문제 중 1번째 문제",
      options: "답변 선택지"
    },
    pageTitle: "AX Quiz Challenge",
    navigation: {
      home: "시작",
      vocabulary: "단어장",
      quiz: "퀴즈",
      results: "결과"
    },
    home: {
      eyebrow: "AI · IT 용어",
      title: "용어 퀴즈를 시작할 준비가 되었나요?",
      intro: "중국어, 한국어, 영어 용어를 연습하며 매일 조금씩 재미있게 배워 보세요.",
      round: "한 라운드 10문제",
      points: "문제당 10점",
      spotlightCaption: "한 문제씩 풀며 꾸준히 성장하세요."
    },
    button: {
      openVocabulary: "단어장 보기",
      start: "퀴즈 시작",
      replay: "다시 하기"
    },
    vocabulary: {
      eyebrow: "단어장",
      title: "AI·IT 단어장",
      description: "문제 은행의 중국어, 한국어, 영어 용어를 검색하고 학습하세요.",
      searchLabel: "단어 검색",
      searchPlaceholder: "중국어, 한국어 또는 영어 입력",
      chinese: "중국어",
      korean: "한국어",
      englishDescription: "영어 및 설명",
      dailyCountLabel: "하루 학습 단어 수",
      dailyCountHelp: "하루에 학습할 단어 수를 설정하세요 (1–50)",
      studyDays: "일일 학습 계획",
      previous: "이전",
      next: "다음",
      dayLabel: "Day {day}",
      daySummary: "Day {day} · 단어 {count}개",
      markComplete: "오늘 학습 완료",
      completedStatus: "Day {day} 학습을 완료하고 진행 상황을 저장했습니다.",
      pendingStatus: "Day {day} 학습 중 · 단어 {count}개.",
      completeAllStatus: "축하합니다! 50개 단어를 모두 학습했습니다.",
      invalidDailyCount: "1에서 50 사이의 정수를 입력하세요.",
      noResults: "일치하는 단어를 찾을 수 없습니다.",
      speakKorean: "한국어 발음 듣기: {term}",
      speakEnglish: "영어 발음 듣기: {term}",
      speaking: "발음 재생 중: {term}",
      speechUnavailable: "이 브라우저는 음성 읽기를 지원하지 않습니다."
    },
    quiz: {
      questionCount: "문제 01 / 10",
      progressLabel: "라운드 진행률",
      currentScore: "현재 점수",
      questionExample: "중국어 문제 예시",
      personalBest: "개인 최고 기록",
      feedback: "답을 선택하면 정답 또는 오답 안내가 여기에 표시됩니다."
    },
    score: {
      complete: "도전 완료",
      final: "최종 점수",
      highest: "역대 최고 점수",
      highestHome: "역대 최고 점수: 0",
      outOf: " / 100점"
    },
    game: {
      correct: "정답입니다! +10점",
      incorrect: "오답입니다. 다음 문제에 도전해 보세요!",
      notEnoughQuestions: "현재 문제는 {count}개입니다. 시작하려면 중복되지 않는 문제가 10개 이상 필요합니다."
    },
    about: {
      eyebrow: "프로젝트 소개",
      title: "AX Quiz Challenge 소개",
      description: "AI·IT 용어를 중국어, 한국어, 영어로 익힐 수 있는 퀴즈 게임입니다.",
      featureRandom: "무작위 문제로 반복 출제를 줄입니다",
      featureFeedback: "문제마다 즉시 피드백을 제공하고 점수를 누적합니다",
      featureResponsive: "컴퓨터와 모바일에서 모두 이용할 수 있습니다"
    },
    footer: {
      text: "AX Quiz Challenge · 프로젝트 구조와 페이지 스케치"
    }
  },
  en: {
    accessibility: {
      navigation: "Page navigation",
      language: "Choose interface language",
      scoreSummary: "Learning progress summary",
      progress: "Quiz progress: question 1 of 10",
      options: "Answer options"
    },
    pageTitle: "AX Quiz Challenge",
    navigation: {
      home: "Home",
      vocabulary: "Vocabulary",
      quiz: "Quiz",
      results: "Results"
    },
    home: {
      eyebrow: "AI · IT TERMINOLOGY",
      title: "Ready to take on the terminology challenge?",
      intro: "Practice Chinese, Korean, and English terms and make learning a little fun every day.",
      round: "10 questions per round",
      points: "10 points per question",
      spotlightCaption: "Keep learning, one question at a time."
    },
    button: {
      openVocabulary: "View Vocabulary",
      start: "Start Quiz",
      replay: "Play Again"
    },
    vocabulary: {
      eyebrow: "VOCABULARY",
      title: "AI·IT Vocabulary",
      description: "Search and study Chinese, Korean, and English terms from the question bank.",
      searchLabel: "Search vocabulary",
      searchPlaceholder: "Enter Chinese, Korean, or English",
      chinese: "Chinese",
      korean: "Korean",
      englishDescription: "English & description",
      dailyCountLabel: "Words per day",
      dailyCountHelp: "Choose how many words to study each day (1–50)",
      studyDays: "Daily study plan",
      previous: "Previous",
      next: "Next",
      dayLabel: "Day {day}",
      daySummary: "Day {day} · {count} words",
      markComplete: "Complete today's study",
      completedStatus: "Day {day} completed. Your progress has been saved.",
      pendingStatus: "Studying Day {day} · {count} words.",
      completeAllStatus: "Congratulations! You have completed all 50 words.",
      invalidDailyCount: "Enter a whole number from 1 to 50.",
      noResults: "No matching terms found.",
      speakKorean: "Speak Korean: {term}",
      speakEnglish: "Speak English: {term}",
      speaking: "Speaking: {term}",
      speechUnavailable: "Speech is not supported by this browser."
    },
    quiz: {
      questionCount: "QUESTION 01 / 10",
      progressLabel: "ROUND PROGRESS",
      currentScore: "Current score",
      questionExample: "Chinese question example",
      personalBest: "PERSONAL BEST",
      feedback: "After you choose an answer, feedback will appear here."
    },
    score: {
      complete: "CHALLENGE COMPLETE",
      final: "Final score",
      highest: "All-time high score",
      highestHome: "High score: 0",
      outOf: " / 100 points"
    },
    game: {
      correct: "Correct! +10 points",
      incorrect: "Not quite. Keep going!",
      notEnoughQuestions: "The question bank has {count} questions. Add at least 10 unique questions to start."
    },
    about: {
      eyebrow: "ABOUT THIS PROJECT",
      title: "About AX Quiz Challenge",
      description: "A quiz game that helps learners explore AI and IT terms in Chinese, Korean, and English.",
      featureRandom: "Practice with random questions to avoid repeats",
      featureFeedback: "Get instant feedback and build your score with each question",
      featureResponsive: "Works on desktop and mobile"
    },
    footer: {
      text: "AX Quiz Challenge · Project structure and page sketches"
    }
  }
};

const LANGUAGE_STORAGE_KEY = "axQuizLanguage";

// 切换界面语言并保存选择；输入语言代码，更新页面文字和按钮状态，无返回值。
function switchLanguage(lang) {
  if (!Object.prototype.hasOwnProperty.call(translations, lang)) {
    console.warn(`不支持的界面语言：${lang}`);
    return;
  }

  currentLanguage = lang;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translationKey = element.dataset.i18n;
    const translation = translationKey
      .split(".")
      .reduce((value, key) => value && value[key], translations[lang]);

    if (typeof translation === "string") {
      element.textContent = translation;
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const translationKey = element.dataset.i18nAriaLabel;
    const translation = translationKey
      .split(".")
      .reduce((value, key) => value && value[key], translations[lang]);

    if (typeof translation === "string") {
      element.setAttribute("aria-label", translation);
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const translationKey = element.dataset.i18nPlaceholder;
    const translation = translationKey
      .split(".")
      .reduce((value, key) => value && value[key], translations[lang]);

    if (typeof translation === "string") {
      element.setAttribute("placeholder", translation);
    }
  });

  document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  document.title = translations[lang].pageTitle;

  document.querySelectorAll(".language-button").forEach((button) => {
    const isActive = button.dataset.lang === lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  renderVocabulary();
  document.querySelector("#speech-status").textContent = "";
  updateCurrentQuestionLanguage();
  updateDynamicLabels();
}

// 按每日计划渲染当前学习日的词语表和 Day 标签。
function renderVocabulary() {
  const vocabularyListElement = document.querySelector("#vocabulary-list");
  const studyDayTabs = document.querySelector("#study-day-tabs");
  if (!vocabularyListElement || !studyDayTabs) {
    return;
  }

  const totalDays = Math.ceil(vocabularyList.length / dailyWordCount);
  currentStudyDay = Math.min(Math.max(currentStudyDay, 1), totalDays);
  renderStudyDayTabs(studyDayTabs, totalDays);
  renderStudyDayNavigation(totalDays);
  vocabularyListElement.replaceChildren();

  const startIndex = (currentStudyDay - 1) * dailyWordCount;
  const dailyVocabulary = vocabularyList.slice(startIndex, startIndex + dailyWordCount);

  dailyVocabulary.forEach((term) => {
    const row = document.createElement("tr");
    row.dataset.searchText =
      `${term.term} ${term.korean} ${term.term_en} ${term.description}`
        .toLocaleLowerCase();

    const chineseCell = document.createElement("td");
    const koreanCell = document.createElement("td");
    const englishCell = document.createElement("td");
    chineseCell.textContent = term.term;
    koreanCell.append(
      document.createTextNode(term.korean),
      createSpeechButton(term.korean, "ko")
    );
    const englishTerm = document.createElement("div");
    const englishDescription = document.createElement("p");
    englishTerm.className = "vocabulary-term-line";
    englishTerm.append(
      document.createTextNode(term.term_en),
      createSpeechButton(term.term_en, "en")
    );
    englishDescription.className = "vocabulary-description";
    englishDescription.textContent = term.description;
    englishCell.append(englishTerm, englishDescription);

    row.append(chineseCell, koreanCell, englishCell);
    vocabularyListElement.append(row);
  });

  applyVocabularySearch();
  updateStudyPlanStatus();
}

// 根据当前语言和学习日生成上一天、下一天按钮。
function renderStudyDayNavigation(totalDays) {
  const navigation = document.querySelector("#study-day-navigation");
  if (!navigation) {
    return;
  }

  const languageText = translations[currentLanguage].vocabulary;
  navigation.replaceChildren();

  const previousButton = document.createElement("button");
  previousButton.className = "btn btn-outline btn-sm";
  previousButton.type = "button";
  previousButton.dataset.studyDirection = "previous";
  previousButton.textContent = languageText.previous;
  previousButton.disabled = isStudyDayTransitioning || currentStudyDay <= 1;
  navigation.append(previousButton);

  const nextButton = document.createElement("button");
  nextButton.className = "btn btn-outline btn-sm";
  nextButton.type = "button";
  nextButton.dataset.studyDirection = "next";
  nextButton.textContent = languageText.next;
  nextButton.disabled = isStudyDayTransitioning || currentStudyDay >= totalDays;
  navigation.append(nextButton);
}

// 生成学习日选项卡。
function renderStudyDayTabs(tabsContainer, totalDays) {
  const languageText = translations[currentLanguage].vocabulary;
  tabsContainer.replaceChildren();

  for (let day = 1; day <= totalDays; day += 1) {
    const tab = document.createElement("button");
    tab.className = day === currentStudyDay
      ? "tab study-day-tab tab-active"
      : "tab study-day-tab";
    tab.type = "button";
    tab.role = "tab";
    tab.dataset.studyDay = String(day);
    tab.setAttribute("aria-selected", String(day === currentStudyDay));
    tab.textContent = languageText.dayLabel.replace("{day}", String(day));
    tabsContainer.append(tab);
  }
}

// 更新当前学习日摘要、打卡按钮和进度提示。
function updateStudyPlanStatus(message = "") {
  const status = document.querySelector("#study-progress-status");
  const summary = document.querySelector("#study-day-summary");
  const completeButton = document.querySelector("#complete-study-day");
  if (!status || !summary || !completeButton) {
    return;
  }

  const languageText = translations[currentLanguage].vocabulary;
  const totalDays = Math.ceil(vocabularyList.length / dailyWordCount);
  const startIndex = (currentStudyDay - 1) * dailyWordCount;
  const wordsToday = Math.min(dailyWordCount, vocabularyList.length - startIndex);
  const isCompleted = completedStudyDay === currentStudyDay;

  summary.textContent = languageText.daySummary
    .replace("{day}", String(currentStudyDay))
    .replace("{count}", String(wordsToday));
  status.textContent = message || (isCompleted
    ? currentStudyDay === totalDays
      ? languageText.completeAllStatus
      : languageText.completedStatus.replace("{day}", String(currentStudyDay))
    : languageText.pendingStatus
      .replace("{day}", String(currentStudyDay))
      .replace("{count}", String(wordsToday)));
  completeButton.disabled = isCompleted;
  completeButton.classList.toggle("btn-disabled", isCompleted);
}

// 读取并绑定每日计划设置和本地打卡进度。
function initializeStudyPlan() {
  const dailyWordCountInput = document.querySelector("#daily-word-count");
  const savedWordCount = Number(localStorage.getItem(DAILY_WORD_COUNT_STORAGE_KEY));

  if (Number.isInteger(savedWordCount) && savedWordCount >= 1 && savedWordCount <= MAX_DAILY_WORD_COUNT) {
    dailyWordCount = savedWordCount;
  }
  dailyWordCountInput.value = String(dailyWordCount);

  const savedCompletedDay = Number(localStorage.getItem(STUDY_PROGRESS_STORAGE_KEY));
  const totalDays = Math.ceil(vocabularyList.length / dailyWordCount);
  if (Number.isInteger(savedCompletedDay) && savedCompletedDay >= 1 && savedCompletedDay <= totalDays) {
    completedStudyDay = savedCompletedDay;
    currentStudyDay = savedCompletedDay;
  }

  dailyWordCountInput.addEventListener("change", handleDailyWordCountChange);
  document.querySelector("#study-day-tabs").addEventListener("click", handleStudyDayTabClick);
  document.querySelector("#study-day-navigation").addEventListener("click", handleStudyDayNavigation);
  document.querySelector("#complete-study-day").addEventListener("click", handleStudyDayComplete);
}

function handleDailyWordCountChange(event) {
  if (isStudyDayTransitioning) {
    event.currentTarget.value = String(dailyWordCount);
    return;
  }

  const newDailyWordCount = event.currentTarget.valueAsNumber;
  if (!Number.isInteger(newDailyWordCount) || newDailyWordCount < 1 || newDailyWordCount > MAX_DAILY_WORD_COUNT) {
    event.currentTarget.value = String(dailyWordCount);
    event.currentTarget.setAttribute("aria-invalid", "true");
    updateStudyPlanStatus(translations[currentLanguage].vocabulary.invalidDailyCount);
    return;
  }

  event.currentTarget.removeAttribute("aria-invalid");
  dailyWordCount = newDailyWordCount;
  localStorage.setItem(DAILY_WORD_COUNT_STORAGE_KEY, String(dailyWordCount));
  const totalDays = Math.ceil(vocabularyList.length / dailyWordCount);
  currentStudyDay = Math.min(currentStudyDay, totalDays);
  completedStudyDay = Math.min(completedStudyDay, totalDays);

  if (completedStudyDay > 0) {
    localStorage.setItem(STUDY_PROGRESS_STORAGE_KEY, String(completedStudyDay));
  }
  renderVocabulary();
}

function handleStudyDayTabClick(event) {
  if (isStudyDayTransitioning) {
    return;
  }

  const tab = event.target.closest("[data-study-day]");
  if (!tab) {
    return;
  }

  currentStudyDay = Number(tab.dataset.studyDay);
  renderVocabulary();
}

function handleStudyDayNavigation(event) {
  if (isStudyDayTransitioning) {
    return;
  }

  const button = event.target.closest("[data-study-direction]");
  if (!button || button.disabled) {
    return;
  }

  const direction = button.dataset.studyDirection === "next" ? 1 : -1;
  const totalDays = Math.ceil(vocabularyList.length / dailyWordCount);
  const targetDay = currentStudyDay + direction;
  if (targetDay < 1 || targetDay > totalDays) {
    return;
  }

  transitionToStudyDay(targetDay, direction);
}

async function transitionToStudyDay(targetDay, direction) {
  const viewport = document.querySelector("#vocabulary-page-viewport");
  const page = document.querySelector(".vocabulary-table-wrap");
  if (!viewport || !page) {
    currentStudyDay = targetDay;
    renderVocabulary();
    return;
  }

  isStudyDayTransitioning = true;
  viewport.setAttribute("aria-busy", "true");
  const totalDays = Math.ceil(vocabularyList.length / dailyWordCount);
  renderStudyDayNavigation(totalDays);

  const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
  if (duration === 0) {
    currentStudyDay = targetDay;
    renderVocabulary();
    isStudyDayTransitioning = false;
    viewport.removeAttribute("aria-busy");
    renderStudyDayNavigation(totalDays);
    return;
  }

  const startHeight = viewport.getBoundingClientRect().height;
  viewport.style.height = `${startHeight}px`;
  const exitAnimation = page.animate(
    [
      { transform: "translateX(0)", opacity: 1 },
      { transform: `translateX(${direction > 0 ? "-100%" : "100%"})`, opacity: 0 },
    ],
    { duration, easing: "ease", fill: "forwards" }
  );
  await exitAnimation.finished;
  exitAnimation.cancel();

  currentStudyDay = targetDay;
  renderVocabulary();
  const targetHeight = page.getBoundingClientRect().height;
  const entryAnimation = page.animate(
    [
      { transform: `translateX(${direction > 0 ? "100%" : "-100%"})`, opacity: 0 },
      { transform: "translateX(0)", opacity: 1 },
    ],
    { duration, easing: "ease", fill: "forwards" }
  );
  const heightAnimation = viewport.animate(
    [{ height: `${startHeight}px` }, { height: `${targetHeight}px` }],
    { duration, easing: "ease", fill: "forwards" }
  );
  await Promise.all([entryAnimation.finished, heightAnimation.finished]);
  entryAnimation.cancel();
  heightAnimation.cancel();
  viewport.style.height = "";
  viewport.removeAttribute("aria-busy");
  isStudyDayTransitioning = false;
  renderStudyDayNavigation(totalDays);
}

function handleStudyDayComplete() {
  if (isStudyDayTransitioning) {
    return;
  }

  completedStudyDay = currentStudyDay;
  localStorage.setItem(STUDY_PROGRESS_STORAGE_KEY, String(completedStudyDay));
  updateStudyPlanStatus();
}

// 创建指定语言的朗读按钮；输入术语与语言代码，返回可访问的按钮元素。
function createSpeechButton(term, language) {
  const button = document.createElement("button");
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const speechText = translations[currentLanguage].vocabulary[
    language === "ko" ? "speakKorean" : "speakEnglish"
  ].replace("{term}", term);

  button.className = "btn btn-ghost btn-sm speaker-button";
  button.type = "button";
  button.dataset.speak = term;
  button.dataset.speechLanguage = language;
  button.setAttribute("aria-label", speechText);
  button.title = speechText;

  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("width", "20");
  icon.setAttribute("height", "20");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "1.5");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  icon.classList.add("speaker-icon");

  iconPath.setAttribute(
    "d",
    "M4 10v4h4l5 4V6l-5 4H4Zm12-1.5a5 5 0 0 1 0 7m2-9a8 8 0 0 1 0 11"
  );
  icon.append(iconPath);
  button.append(icon);
  return button;
}

// 根据搜索框内容筛选词语行；无输入，更新表格可见状态和无结果提示。
function applyVocabularySearch() {
  const searchInput = document.querySelector("#vocabulary-search");
  const vocabularyList = document.querySelector("#vocabulary-list");
  const emptyMessage = document.querySelector("#vocabulary-empty");
  if (!searchInput || !vocabularyList || !emptyMessage) {
    return;
  }

  const searchText = searchInput.value.trim().toLocaleLowerCase();
  let visibleRows = 0;

  vocabularyList.querySelectorAll("tr").forEach((row) => {
    const matches = row.dataset.searchText.includes(searchText);
    row.hidden = !matches;
    if (matches) {
      visibleRows += 1;
    }
  });

  emptyMessage.hidden = visibleRows > 0;
}

// 使用 Web Speech API 朗读术语；输入按钮点击事件，按韩语或英语设置语音并显示状态。
function handleVocabularySpeech(event) {
  const button = event.target.closest("[data-speak]");
  if (!button) {
    return;
  }

  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    document.querySelector("#speech-status").textContent =
      translations[currentLanguage].vocabulary.speechUnavailable;
    return;
  }

  const term = button.dataset.speak;
  const speechLanguage = button.dataset.speechLanguage;
  const utterance = new window.SpeechSynthesisUtterance(term);
  utterance.lang = speechLanguage === "ko" ? "ko-KR" : "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  document.querySelector("#speech-status").textContent =
    translations[currentLanguage].vocabulary.speaking.replace("{term}", term);
}

// 确认文字包含中文、韩文和英文版本。
function hasAllTranslations(value) {
  return value !== null
    && typeof value === "object"
    && ["zh", "ko", "en"].every(
      (language) => typeof value[language] === "string" && value[language].trim() !== ""
    );
}

// 从题库副本中使用 Fisher-Yates 算法抽题；验证新数据结构并返回 10 道不重复题目。
function getRandomQuestions() {
  const uniqueQuestions = Array.isArray(questionBank)
    ? [...new Map(questionBank.map((question) => [question.id, question])).values()]
    : [];

  if (uniqueQuestions.length < QUESTIONS_PER_ROUND) {
    throw new Error(
      translations[currentLanguage].game.notEnoughQuestions.replace("{count}", uniqueQuestions.length)
    );
  }

  const shuffledQuestions = [...uniqueQuestions];
  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledQuestions[index], shuffledQuestions[randomIndex]] =
      [shuffledQuestions[randomIndex], shuffledQuestions[index]];
  }

  const selectedQuestions = shuffledQuestions.slice(0, QUESTIONS_PER_ROUND);
  const hasInvalidQuestion = selectedQuestions.some((question) =>
    typeof question.term !== "string"
      || typeof question.korean !== "string"
      || typeof question.term_en !== "string"
      || typeof question.description !== "string"
      || !hasAllTranslations(question.question)
      || !Array.isArray(question.options)
      || question.options.length !== 4
      || !question.options.every(hasAllTranslations)
      || !Number.isInteger(question.answer)
      || question.answer < 0
      || question.answer >= question.options.length
  );

  if (hasInvalidQuestion) {
    throw new Error("题库格式有误：每题需要中韩英题干、4 组选项翻译和有效的正确答案下标。");
  }

  return selectedQuestions;
}

// 根据当前题号更新题目、四个选项和进度；无输入，更新答题页面。
function renderQuestion() {
  const question = currentRoundQuestions[currentQuestionIndex];
  if (!question) {
    throw new Error("无法显示当前题目：题目列表中不存在该题。");
  }

  const questionHeading = document.querySelector(".question-card h3");
  const questionLabel = document.querySelector(".question-label");
  const optionsContainer = document.querySelector(".options");
  const progressTrack = document.querySelector(".progress-track");

  questionHeading.textContent = question.question[currentLanguage];
  questionLabel.textContent = translations[currentLanguage].quiz.questionExample;
  optionsContainer.replaceChildren();

  question.options.forEach((option, optionIndex) => {
    const optionText = option[currentLanguage];
    const optionButton = document.createElement("button");
    const optionLetter = document.createElement("span");
    optionButton.className = "btn btn-outline option";
    optionButton.type = "button";
    optionButton.dataset.answerIndex = String(optionIndex);
    optionButton.setAttribute("aria-label", optionText);
    optionLetter.textContent = String.fromCharCode(65 + optionIndex);
    optionButton.append(optionLetter, document.createTextNode(` ${optionText}`));
    optionButton.addEventListener("click", handleAnswerClick);
    optionsContainer.append(optionButton);
  });

  isAnswerLocked = false;
  currentFeedbackKey = "";
  progressTrack.value = ((currentQuestionIndex + 1) / QUESTIONS_PER_ROUND) * 100;
  progressTrack.setAttribute("aria-valuenow", String(currentQuestionIndex + 1));
  updateDynamicLabels();
}

// 仅替换当前题目和选项文字，保留按钮状态、答案锁定和点击事件。
function updateCurrentQuestionLanguage() {
  const question = currentRoundQuestions[currentQuestionIndex];
  if (!question) {
    return;
  }

  document.querySelector(".question-card h3").textContent =
    question.question[currentLanguage];

  document.querySelectorAll(".options .option").forEach((button) => {
    const option = question.options[Number(button.dataset.answerIndex)];
    if (!option) {
      return;
    }

    const optionLetter = button.querySelector("span");
    button.setAttribute("aria-label", option[currentLanguage]);
    button.replaceChildren(
      optionLetter,
      document.createTextNode(` ${option[currentLanguage]}`)
    );
  });
}

// 判断所选选项是否正确；输入选项编号和题目，答对时加分并返回判断结果。
function checkAnswer(selectedAnswer, question) {
  const isCorrect = Number(selectedAnswer) === question.answer;
  if (isCorrect) {
    currentScore += POINTS_PER_QUESTION;
    saveHighScoreIfNeeded(currentScore);
  }
  return isCorrect;
}

// 处理选项点击；输入为点击事件，判断答案、计分并安排下一题，无返回值。
function handleAnswerClick(event) {
  if (isAnswerLocked) {
    return;
  }

  const selectedButton = event.currentTarget;
  const question = currentRoundQuestions[currentQuestionIndex];
  const isCorrect = checkAnswer(selectedButton.dataset.answerIndex, question);
  isAnswerLocked = true;

  document.querySelectorAll(".options .option").forEach((button) => {
    button.disabled = true;
    const isCorrectOption = Number(button.dataset.answerIndex) === question.answer;

    if (isCorrectOption) {
      button.style.backgroundColor = "#e7f8ed";
      button.style.borderColor = "#36a269";
      button.style.color = "#176b3a";
    } else if (button === selectedButton && !isCorrect) {
      button.style.backgroundColor = "#fff0f0";
      button.style.borderColor = "#d94b4b";
      button.style.color = "#a52d2d";
    }
  });

  currentFeedbackKey = isCorrect ? "correct" : "incorrect";
  updateDynamicLabels();
  advanceTimeoutId = window.setTimeout(advanceToNextQuestion, 1500);
}

// 延迟反馈结束后进入下一题，或在本轮结束时显示成绩；无输入与返回值。
function advanceToNextQuestion() {
  advanceTimeoutId = null;
  currentQuestionIndex += 1;

  if (currentQuestionIndex >= QUESTIONS_PER_ROUND) {
    showScore();
    return;
  }

  renderQuestion();
}

// 从 Local Storage 读取有效最高分；未保存或数据无效时返回 0。
function getHighScore() {
  const savedValue = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
  if (savedValue === null) {
    return 0;
  }

  const savedScore = Number(savedValue);
  return Number.isInteger(savedScore) && savedScore >= 0 && savedScore <= MAX_SCORE
    ? savedScore
    : 0;
}

// 将最高分直接渲染到首页和成绩页；可传入已读取的最高分。
function renderHighScore(currentHighScore = getHighScore()) {
  const languageText = translations[currentLanguage];
  const resultNote = document.querySelector(".result-note");
  const resultHighScoreLabel = resultNote && resultNote.querySelector("[data-i18n]");
  const homeHighScore = document.querySelector('[data-i18n="score.highestHome"]');

  if (resultHighScoreLabel) {
    resultHighScoreLabel.textContent = languageText.score.highest;
    resultHighScoreLabel.nextSibling.nodeValue = `: ${currentHighScore}`;
  }

  if (homeHighScore) {
    homeHighScore.textContent = `${languageText.score.highest}: ${currentHighScore}`;
  }
}

// 分数超过历史纪录时立即持久化；返回更新后的最高分。
function saveHighScoreIfNeeded(score) {
  const highScore = getHighScore();
  if (score > highScore) {
    localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(score));
    return score;
  }
  return highScore;
}

// 完成本轮后将新纪录写入 Local Storage 并显示成绩页面；无输入与返回值。
function showScore() {
  saveHighScoreIfNeeded(currentScore);
  document.querySelector(".result-score").firstChild.nodeValue = String(currentScore);
  document.querySelector(".result-note").lastChild.nodeValue = `: ${getHighScore()}`;
  currentRoundQuestions = [];
  showPage("results", true);
  updateDynamicLabels();
}

// 更新分数、题号、反馈和最高分等随语言或进度变化的文字；无输入与返回值。
function updateDynamicLabels() {
  const languageText = translations[currentLanguage];
  const currentHighScore = getHighScore();
  const questionCounter = document.querySelector(".section-heading .eyebrow");
  const progressQuestionCount = document.querySelector(
    ".quiz-progress-header [data-i18n='quiz.questionCount']"
  );
  const scoreChip = document.querySelector(".score-chip");
  const scoreLabel = scoreChip && scoreChip.querySelector("[data-i18n]");
  const progressTrack = document.querySelector(".progress-track");
  const feedback = document.querySelector(".feedback");
  const questionLabel = document.querySelector(".question-label");

  if (questionLabel) {
    questionLabel.textContent = languageText.quiz.questionExample;
  }

  if (questionCounter) {
    const questionNumber = String(currentQuestionIndex + 1).padStart(2, "0");
    const questionCountText = currentLanguage === "zh"
      ? `第 ${questionNumber} 题 / 共 ${QUESTIONS_PER_ROUND} 题`
      : currentLanguage === "ko"
        ? `문제 ${questionNumber} / ${QUESTIONS_PER_ROUND}`
        : `QUESTION ${questionNumber} / ${QUESTIONS_PER_ROUND}`;
    questionCounter.textContent = questionCountText;
    if (progressQuestionCount) {
      progressQuestionCount.textContent = questionCountText;
    }
  }

  if (scoreLabel) {
    scoreLabel.textContent = languageText.quiz.currentScore;
    scoreLabel.nextSibling.nodeValue = `: ${currentScore}`;
  }

  if (feedback && currentFeedbackKey) {
    feedback.textContent = languageText.game[currentFeedbackKey];
  }

  if (progressTrack) {
    const progressText = currentLanguage === "zh"
      ? `答题进度：第 ${currentQuestionIndex + 1} 题，共 ${QUESTIONS_PER_ROUND} 题`
      : currentLanguage === "ko"
        ? `퀴즈 진행 상황: ${QUESTIONS_PER_ROUND}문제 중 ${currentQuestionIndex + 1}번째 문제`
        : `Quiz progress: question ${currentQuestionIndex + 1} of ${QUESTIONS_PER_ROUND}`;
    progressTrack.setAttribute("aria-label", progressText);
  }

  renderHighScore(currentHighScore);
}

// 同步顶部导航的当前页面状态。
function updateActiveNavigation(pageId) {
  document.querySelectorAll("[data-page]").forEach((link) => {
    if (link.tagName !== "A") {
      return;
    }

    if (link.dataset.page === pageId) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// 显示指定页面；可按页面顺序播放对应方向的 3D 翻页动画。
function showPage(pageId, animate = false) {
  const pageIds = ["home", "vocabulary-page", "quiz-page", "results"];
  if (!pageIds.includes(pageId)) {
    console.warn(`找不到页面区域：${pageId}`);
    return;
  }

  if (isPageTransitioning) {
    return;
  }

  const pageElements = pageIds.map((id) => document.getElementById(id));
  const targetPage = document.getElementById(pageId);
  const currentPage = pageElements.find((page) => !page.hidden);

  if (!animate || !currentPage || currentPage === targetPage) {
    pageElements.forEach((page) => {
      page.hidden = page !== targetPage;
      page.setAttribute("aria-hidden", String(page.hidden));
      page.classList.remove("flip-out-left", "flip-out-right", "flip-in-left", "flip-in-right");
    });
    updateActiveNavigation(pageId);
    return;
  }

  const isMovingForward = pageIds.indexOf(pageId) > pageIds.indexOf(currentPage.id);
  const outgoingClass = isMovingForward ? "flip-out-left" : "flip-out-right";
  const incomingClass = isMovingForward ? "flip-in-right" : "flip-in-left";
  let transitionFinished = false;

  isPageTransitioning = true;
  targetPage.hidden = false;
  targetPage.setAttribute("aria-hidden", "false");
  currentPage.setAttribute("aria-hidden", "true");
  currentPage.classList.add(outgoingClass);
  targetPage.classList.add(incomingClass);

  const finishTransition = () => {
    if (transitionFinished) {
      return;
    }

    transitionFinished = true;
    window.clearTimeout(fallbackTimeoutId);
    currentPage.removeEventListener("animationend", handleAnimationEnd);
    currentPage.hidden = true;
    currentPage.classList.remove(outgoingClass);
    targetPage.classList.remove(incomingClass);
    targetPage.setAttribute("aria-hidden", "false");
    isPageTransitioning = false;
    updateActiveNavigation(pageId);
  };

  const handleAnimationEnd = (event) => {
    if (event.target === currentPage && event.animationName.startsWith("flipOut")) {
      finishTransition();
    }
  };

  const fallbackTimeoutId = window.setTimeout(finishTransition, 750);
  currentPage.addEventListener("animationend", handleAnimationEnd);
}

// 处理导航和开始页的页面链接；输入点击事件，切换对应页面或从导航启动新一轮答题。
function handlePageNavigation(event) {
  const pageLink = event.target.closest("[data-page]");
  if (!pageLink) {
    return;
  }

  event.preventDefault();
  if (isPageTransitioning) {
    return;
  }

  const pageId = pageLink.dataset.page;

  if (pageId === "quiz-page" && currentRoundQuestions.length === 0) {
    startGame(true);
    return;
  }

  showPage(pageId, true);
}

// 开始新一轮；清零分数和题号，抽取新题并显示答题页面，无返回值。
function startGame(animate = false) {
  if (isPageTransitioning) {
    return;
  }

  let newRoundQuestions;
  try {
    newRoundQuestions = getRandomQuestions();
  } catch (error) {
    window.alert(error.message);
    return;
  }

  if (advanceTimeoutId !== null) {
    window.clearTimeout(advanceTimeoutId);
    advanceTimeoutId = null;
  }

  currentRoundQuestions = newRoundQuestions;
  currentScore = 0;
  currentQuestionIndex = 0;
  currentFeedbackKey = "";
  isAnswerLocked = false;
  showPage("quiz-page", animate);
  renderQuestion();
}

// 响应语言按钮点击；输入点击事件，切换到按钮标注的语言，无返回值。
function handleLanguageButtonClick(event) {
  switchLanguage(event.currentTarget.dataset.lang);
}

// 响应开始和再玩一次按钮点击；输入点击事件，启动一轮新游戏，无返回值。
function handleStartButtonClick() {
  startGame(true);
}

// 初始化页面状态、最高分显示和按钮事件；无输入与返回值。
function initializeGame() {
  const rawHighScore = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
  console.log("读取到的原始数据：", rawHighScore);

  const currentHighScore = getHighScore();
  console.log("最终渲染用的最高分：", currentHighScore);

  showPage("home");

  document.querySelectorAll(".language-button").forEach((button) => {
    button.addEventListener("click", handleLanguageButtonClick);
  });

  document.addEventListener("click", handlePageNavigation);
  document.querySelector("#vocabulary-search").addEventListener("input", applyVocabularySearch);
  document.querySelector("#vocabulary-list").addEventListener("click", handleVocabularySpeech);
  initializeStudyPlan();
  document.querySelector("#start-quiz-button").addEventListener("click", handleStartButtonClick);
  document.querySelector('[data-i18n="button.replay"]').addEventListener(
    "click",
    handleStartButtonClick
  );

  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  switchLanguage(savedLanguage && translations[savedLanguage] ? savedLanguage : "zh");
  renderHighScore(currentHighScore);
}

initializeGame();
