// 游戏状态：记录当前分数、题号和本轮抽中的题目。
function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`无法写入 LocalStorage（${key}）。`, error);
  }
}

function getStoredInteger(key) {
  const value = Number(safeGetItem(key));
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function getStoredArray(key) {
  const value = safeGetItem(key);
  if (value === null) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);
    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }
  } catch (error) {
    console.warn(`LocalStorage 中的 ${key} 数据格式无效。`, error);
  }

  return [];
}

let currentScore = 0; // 当前累计分数
let currentQuestionIndex = 0; // 当前题目在本轮中的位置
const TOTAL_QUESTIONS = 50;
const QUESTIONS_PER_ROUND = 10; // 每轮计划抽取的题目数量
const POINTS_PER_QUESTION = 10; // 每题答对可得分数
const MAX_SCORE = QUESTIONS_PER_ROUND * POINTS_PER_QUESTION;
const HIGH_SCORE_STORAGE_KEY = "axQuizHighScore";
const XP_STORAGE_KEY = "xp";
const AVATAR_STORAGE_KEY = "avatarImage";
const AVATAR_FRAME_STORAGE_KEY = "avatarFrame";
const MAX_USER_LEVEL = 10;
const TOTAL_CORRECT_STORAGE_KEY = "totalCorrect";
const BADGES_STORAGE_KEY = "badges";
const HISTORY_STORAGE_KEY = "history";
const DAILY_WORD_COUNT = 10;
const ACHIEVEMENTS = {
  first_round: { icon: "🌱" },
  enthusiastic_learner: { icon: "🔥" },
  master: { icon: "🏆" },
  bronze_scholar: { icon: "🥉" },
  gold_champion: { icon: "🏆" }
};
let currentLanguage = "zh";
let currentLang = "zh";
let currentQuiz = [];
let selectedDifficulty = "normal";
let combo = 0;
let totalXP = 0;
let totalCorrectAnswers = 0;
let userAvatarData = "";
let selectedAvatarFrame = 1;
let draftAvatarData = "";
let draftAvatarFrame = 1;
let userCenterStatusKey = "";
let currentRoundXP = 0;
let currentRoundCorrect = 0;
let isAnswerLocked = false;
let currentFeedbackKey = "";
let advanceTimeoutId = null;
let isPageTransitioning = false;
let currentStudyDay = 1;
let isStudyDayTransitioning = false;
const unlockedBadgesThisSession = new Set();

const vocabularyList = [
  {
    term: "强化学习", korean: "강화 학습", term_en: "Reinforcement Learning", difficulty: "困难",
    description: "智能体通过与环境交互，并依据奖励或惩罚信号来学习行动策略的方法。",
    explanation: {
      zh: "智能体通过与环境交互，并依据奖励或惩罚信号来学习行动策略的方法。",
      ko: "강화 학습은 에이전트가 환경과 상호작용하며 보상이나 벌점 신호를 바탕으로 행동 전략을 학습하는 방법입니다.",
      en: "A method in which an agent learns a policy by interacting with an environment and using reward or penalty signals."
    }
  },
  {
    term: "监督学习", korean: "지도 학습", term_en: "Supervised Learning", difficulty: "普通",
    description: "使用带有正确答案标签的数据训练模型，使其学习输入与目标输出之间关系的方法。",
    explanation: {
      zh: "使用带有正确答案标签的数据训练模型，使其学习输入与目标输出之间关系的方法。",
      ko: "정답 레이블이 있는 데이터로 모델을 학습시켜 입력과 목표 출력 사이의 관계를 익히게 하는 방법입니다.",
      en: "A method that trains a model on labeled data to learn the relationship between inputs and target outputs."
    }
  },
  {
    term: "无监督学习", korean: "비지도 학습", term_en: "Unsupervised Learning", difficulty: "普通",
    description: "使用没有预先标注结果的数据，发现数据中的结构、类别或规律的方法。",
    explanation: {
      zh: "使用没有预先标注结果的数据，发现数据中的结构、类别或规律的方法。",
      ko: "미리 레이블이 지정되지 않은 데이터에서 구조, 군집 또는 패턴을 찾아내는 방법입니다.",
      en: "A method for discovering structures, clusters, or patterns in data without predefined labels."
    }
  },
  {
    term: "半监督学习", korean: "준지도 학습", term_en: "Semi-supervised Learning", difficulty: "普通",
    description: "结合少量带标签数据和大量未标注数据训练模型的方法。",
    explanation: {
      zh: "结合少量带标签数据和大量未标注数据训练模型的方法。",
      ko: "소량의 레이블 데이터와 다량의 레이블 없는 데이터를 함께 사용해 모델을 학습하는 방법입니다.",
      en: "A method that trains a model using a small amount of labeled data together with a large amount of unlabeled data."
    }
  },
  {
    term: "迁移学习", korean: "전이 학습", term_en: "Transfer Learning", difficulty: "普通",
    description: "将模型在一个任务或数据集上学到的知识迁移到相关新任务中的方法。",
    explanation: {
      zh: "将模型在一个任务或数据集上学到的知识迁移到相关新任务中的方法。",
      ko: "한 작업이나 데이터셋에서 모델이 학습한 지식을 관련된 새로운 작업에 적용하는 방법입니다.",
      en: "A method that transfers knowledge a model learned on one task or dataset to a related new task."
    }
  },
  {
    term: "联邦学习", korean: "연합 학습", term_en: "Federated Learning", difficulty: "困难",
    description: "在数据保留于本地设备或机构的情况下协同训练模型的方法。",
    explanation: {
      zh: "在数据保留于本地设备或机构的情况下协同训练模型的方法。",
      ko: "데이터를 각 기기나 기관에 보관한 채 여러 참여자가 협력해 모델을 학습하는 방법입니다.",
      en: "A method for collaboratively training a model while keeping data on its local devices or institutions."
    }
  },
  {
    term: "特征工程", korean: "특성 공학", term_en: "Feature Engineering", difficulty: "普通",
    description: "从原始数据中选择、转换或构造适合模型使用的特征的过程。",
    explanation: {
      zh: "从原始数据中选择、转换或构造适合模型使用的特征的过程。",
      ko: "원시 데이터에서 모델에 적합한 특성을 선택하거나 변환하고 새로 구성하는 과정입니다.",
      en: "The process of selecting, transforming, or creating features from raw data for use by a model."
    }
  },
  {
    term: "训练集", korean: "훈련 데이터셋", term_en: "Training Set", difficulty: "简单",
    description: "用于训练模型并调整模型参数的数据集合。",
    explanation: {
      zh: "用于训练模型并调整模型参数的数据集合。",
      ko: "모델을 학습시키고 매개변수를 조정하는 데 사용하는 데이터 집합입니다.",
      en: "The dataset used to train a model and adjust its parameters."
    }
  },
  {
    term: "验证集", korean: "검증 데이터셋", term_en: "Validation Set", difficulty: "简单",
    description: "用于评估训练过程、选择模型或调整超参数的数据集合。",
    explanation: {
      zh: "用于评估训练过程、选择模型或调整超参数的数据集合。",
      ko: "학습 과정을 평가하고 모델을 선택하거나 하이퍼파라미터를 조정하는 데 사용하는 데이터 집합입니다.",
      en: "The dataset used to evaluate training, select a model, or tune its hyperparameters."
    }
  },
  {
    term: "测试集", korean: "테스트 데이터셋", term_en: "Test Set", difficulty: "简单",
    description: "用于在训练完成后评估模型对未见数据的泛化表现的数据集合。",
    explanation: {
      zh: "用于在训练完成后评估模型对未见数据的泛化表现的数据集合。",
      ko: "학습이 끝난 뒤 모델이 처음 보는 데이터에 얼마나 잘 일반화되는지 평가하는 데이터 집합입니다.",
      en: "The dataset used after training to evaluate how well a model generalizes to unseen data."
    }
  },
  {
    term: "过拟合", korean: "과적합", term_en: "Overfitting", difficulty: "普通",
    description: "模型过度适应训练数据中的细节或噪声，导致对新数据表现变差的现象。",
    explanation: {
      zh: "模型过度适应训练数据中的细节或噪声，导致对新数据表现变差的现象。",
      ko: "모델이 훈련 데이터의 세부 사항이나 잡음에 지나치게 맞춰져 새로운 데이터에서 성능이 떨어지는 현상입니다.",
      en: "A phenomenon in which a model fits details or noise in the training data too closely and performs poorly on new data."
    }
  },
  {
    term: "欠拟合", korean: "과소적합", term_en: "Underfitting", difficulty: "普通",
    description: "模型复杂度或训练不足以捕捉数据中的主要规律，导致训练和测试表现都较差的现象。",
    explanation: {
      zh: "模型复杂度或训练不足以捕捉数据中的主要规律，导致训练和测试表现都较差的现象。",
      ko: "모델의 복잡도가 낮거나 학습이 부족해 데이터의 주요 패턴을 포착하지 못하고 훈련 및 테스트 성능이 모두 낮은 현상입니다.",
      en: "A phenomenon in which a model is too simple or insufficiently trained to capture key patterns, resulting in poor training and test performance."
    }
  },
  {
    term: "梯度下降", korean: "경사 하강법", term_en: "Gradient Descent", difficulty: "困难",
    description: "通过沿着损失函数梯度的反方向更新参数，以逐步降低模型误差的优化方法。",
    explanation: {
      zh: "通过沿着损失函数梯度的反方向更新参数，以逐步降低模型误差的优化方法。",
      ko: "손실 함수의 기울기와 반대 방향으로 매개변수를 갱신해 모델의 오차를 줄이는 최적화 방법입니다.",
      en: "An optimization method that updates parameters in the direction opposite to the loss gradient to reduce model error."
    }
  },
  {
    term: "反向传播", korean: "역전파", term_en: "Backpropagation", difficulty: "困难",
    description: "在神经网络中将误差信号从输出层向前传递，用于计算各参数梯度的算法。",
    explanation: {
      zh: "在神经网络中将误差信号从输出层向前传递，用于计算各参数梯度的算法。",
      ko: "신경망에서 오차 신호를 출력층에서 이전 층으로 전파해 각 매개변수의 기울기를 계산하는 알고리즘입니다.",
      en: "An algorithm that propagates error signals backward through a neural network to calculate gradients for its parameters."
    }
  },
  {
    term: "损失函数", korean: "손실 함수", term_en: "Loss Function", difficulty: "普通",
    description: "衡量模型预测结果与目标结果之间差异的函数，通常用于指导模型训练。",
    explanation: {
      zh: "衡量模型预测结果与目标结果之间差异的函数，通常用于指导模型训练。",
      ko: "모델의 예측값과 실제 목표값 사이의 차이를 측정하고 학습을 이끄는 함수입니다.",
      en: "A function that measures the difference between a model's predictions and target values, typically guiding training."
    }
  },
  {
    term: "优化器", korean: "최적화 알고리즘", term_en: "Optimizer", difficulty: "普通",
    description: "根据梯度更新模型参数，以减少损失函数值的算法或训练组件。",
    explanation: {
      zh: "根据梯度更新模型参数，以减少损失函数值的算法或训练组件。",
      ko: "기울기를 바탕으로 모델 매개변수를 갱신해 손실 함수 값을 줄이는 알고리즘 또는 학습 구성 요소입니다.",
      en: "An algorithm or training component that updates model parameters based on gradients to reduce the loss."
    }
  },
  {
    term: "卷积神经网络", korean: "합성곱 신경망", term_en: "Convolutional Neural Network (CNN)", difficulty: "困难",
    description: "使用卷积运算提取局部特征，常用于图像识别和视觉任务的神经网络。",
    explanation: {
      zh: "使用卷积运算提取局部特征，常用于图像识别和视觉任务的神经网络。",
      ko: "합성곱 연산으로 지역적 특징을 추출하며 이미지 인식과 컴퓨터 비전 작업에 주로 쓰이는 신경망입니다.",
      en: "A neural network that uses convolutions to extract local features, commonly for image recognition and vision tasks."
    }
  },
  {
    term: "循环神经网络", korean: "순환 신경망", term_en: "Recurrent Neural Network (RNN)", difficulty: "困难",
    description: "通过循环结构处理序列信息，适用于文本、语音等时序数据的神经网络。",
    explanation: {
      zh: "通过循环结构处理序列信息，适用于文本、语音等时序数据的神经网络。",
      ko: "순환 구조로 시퀀스 정보를 처리하며 텍스트나 음성과 같은 순차 데이터에 적합한 신경망입니다.",
      en: "A neural network that processes sequence information through recurrent connections, suited to text, speech, and other sequential data."
    }
  },
  {
    term: "Transformer", korean: "트랜스포머", term_en: "Transformer", difficulty: "困难",
    description: "以注意力机制为核心的神经网络架构，广泛用于自然语言处理和多模态任务。",
    explanation: {
      zh: "以注意力机制为核心的神经网络架构，广泛用于自然语言处理和多模态任务。",
      ko: "어텐션 메커니즘을 핵심으로 하는 신경망 아키텍처로, 자연어 처리와 멀티모달 작업에 널리 사용됩니다.",
      en: "A neural network architecture centered on attention mechanisms and widely used in natural language processing and multimodal tasks."
    }
  },
  {
    term: "注意力机制", korean: "어텐션 메커니즘", term_en: "Attention Mechanism", difficulty: "困难",
    description: "让模型根据当前任务需要，为输入中的不同部分分配不同关注权重的机制。",
    explanation: {
      zh: "让模型根据当前任务需要，为输入中的不同部分分配不同关注权重的机制。",
      ko: "현재 작업의 필요에 따라 입력의 각 부분에 서로 다른 중요도나 가중치를 부여하는 메커니즘입니다.",
      en: "A mechanism that assigns different importance or weights to parts of an input based on the task."
    }
  },
  {
    term: "分词", korean: "토큰화", term_en: "Tokenization", difficulty: "普通",
    description: "将文本拆分为词、子词或其他基本单元，供语言模型处理的过程。",
    explanation: {
      zh: "将文本拆分为词、子词或其他基本单元，供语言模型处理的过程。",
      ko: "언어 모델이 처리할 수 있도록 텍스트를 단어, 하위 단어 또는 다른 기본 단위로 나누는 과정입니다.",
      en: "The process of splitting text into words, subwords, or other basic units for a language model to process."
    }
  },
  {
    term: "词嵌入", korean: "단어 임베딩", term_en: "Word Embedding", difficulty: "困难",
    description: "将词语表示为数值向量，使模型能够处理词语及其语义关系的方法。",
    explanation: {
      zh: "将词语表示为数值向量，使模型能够处理词语及其语义关系的方法。",
      ko: "단어를 수치 벡터로 표현해 모델이 단어와 그 의미적 관계를 처리할 수 있게 하는 방법입니다.",
      en: "A method of representing words as numeric vectors so a model can process them and their semantic relationships."
    }
  },
  {
    term: "向量数据库", korean: "벡터 데이터베이스", term_en: "Vector Database", difficulty: "普通",
    description: "用于存储向量并按相似度进行检索的数据库，常用于语义搜索和检索增强生成。",
    explanation: {
      zh: "用于存储向量并按相似度进行检索的数据库，常用于语义搜索和检索增强生成。",
      ko: "벡터를 저장하고 유사도를 기준으로 검색하는 데이터베이스로, 시맨틱 검색과 검색 증강 생성에 자주 사용됩니다.",
      en: "A database that stores vectors and retrieves them by similarity, often used for semantic search and retrieval-augmented generation."
    }
  },
  {
    term: "微调", korean: "파인튜닝", term_en: "Fine-tuning", difficulty: "普通",
    description: "在预训练模型基础上使用特定任务或领域的数据继续训练，以适配新用途的过程。",
    explanation: {
      zh: "在预训练模型基础上使用特定任务或领域的数据继续训练，以适配新用途的过程。",
      ko: "사전 학습된 모델을 특정 작업이나 분야의 데이터로 추가 학습해 새로운 용도에 맞추는 과정입니다.",
      en: "The process of further training a pretrained model on task- or domain-specific data to adapt it to a new use."
    }
  },
  {
    term: "量化", korean: "양자화", term_en: "Quantization", difficulty: "困难",
    description: "使用较低精度表示模型参数或计算结果，以减少模型占用空间和推理成本的技术。",
    explanation: {
      zh: "使用较低精度表示模型参数或计算结果，以减少模型占用空间和推理成本的技术。",
      ko: "모델 매개변수나 계산 결과를 낮은 정밀도로 표현해 모델 크기와 추론 비용을 줄이는 기술입니다.",
      en: "A technique that uses lower-precision representations of model parameters or computations to reduce model size and inference cost."
    }
  },
  {
    term: "知识蒸馏", korean: "지식 증류", term_en: "Knowledge Distillation", difficulty: "困难",
    description: "将较大教师模型学到的知识迁移到较小学生模型中的模型压缩方法。",
    explanation: {
      zh: "将较大教师模型学到的知识迁移到较小学生模型中的模型压缩方法。",
      ko: "큰 교사 모델이 학습한 지식을 더 작은 학생 모델로 전달하는 모델 압축 방법입니다.",
      en: "A model compression method that transfers knowledge from a larger teacher model to a smaller student model."
    }
  },
  {
    term: "上下文窗口", korean: "컨텍스트 윈도우", term_en: "Context Window", difficulty: "普通",
    description: "语言模型在一次处理或生成过程中能够参考的输入信息范围。",
    explanation: {
      zh: "语言模型在一次处理或生成过程中能够参考的输入信息范围。",
      ko: "언어 모델이 한 번의 처리나 생성 과정에서 참고할 수 있는 입력 정보의 범위입니다.",
      en: "The range of input information a language model can consider in a single processing or generation step."
    }
  },
  {
    term: "模型推理", korean: "모델 추론", term_en: "Model Inference", difficulty: "普通",
    description: "使用已训练模型对新输入执行预测、分类或内容生成的过程。",
    explanation: {
      zh: "使用已训练模型对新输入执行预测、分类或内容生成的过程。",
      ko: "학습이 완료된 모델에 새로운 입력을 넣어 예측, 분류 또는 콘텐츠 생성을 수행하는 과정입니다.",
      en: "The process of using a trained model to make predictions, classify inputs, or generate content."
    }
  },
  {
    term: "AI 幻觉", korean: "AI 환각", term_en: "AI Hallucination", difficulty: "普通",
    description: "生成式模型产生看似合理、但与事实不符或缺乏依据内容的现象。",
    explanation: {
      zh: "生成式模型产生看似合理、但与事实不符或缺乏依据内容的现象。",
      ko: "생성형 모델이 그럴듯해 보이지만 사실과 다르거나 근거가 부족한 내용을 만들어 내는 현상입니다.",
      en: "A phenomenon in which a generative model produces plausible-sounding content that is false or unsupported."
    }
  },
  {
    term: "系统提示词", korean: "시스템 프롬프트", term_en: "System Prompt", difficulty: "简单",
    description: "用于设定 AI 助手角色、行为规则和回答约束的初始指令。",
    explanation: {
      zh: "用于设定 AI 助手角色、行为规则和回答约束的初始指令。",
      ko: "AI 어시스턴트의 역할과 행동 규칙, 응답 제약을 설정하는 초기 지시문입니다.",
      en: "An initial instruction that defines an AI assistant's role, behavior, and response constraints."
    }
  },
  {
    term: "超文本标记语言", korean: "하이퍼텍스트 마크업 언어", term_en: "HyperText Markup Language (HTML)", difficulty: "简单",
    description: "用于描述网页结构和内容的标记语言。",
    explanation: {
      zh: "用于描述网页结构和内容的标记语言。",
      ko: "웹 페이지의 구조와 콘텐츠를 표현하는 데 사용하는 마크업 언어입니다.",
      en: "A markup language used to describe the structure and content of web pages."
    }
  },
  {
    term: "层叠样式表", korean: "캐스케이딩 스타일 시트", term_en: "Cascading Style Sheets (CSS)", difficulty: "简单",
    description: "用于控制网页布局、颜色、字体和响应式显示效果的样式语言。",
    explanation: {
      zh: "用于控制网页布局、颜色、字体和响应式显示效果的样式语言。",
      ko: "웹 페이지의 레이아웃, 색상, 글꼴 및 반응형 표시를 제어하는 스타일 언어입니다.",
      en: "A style language used to control web page layouts, colors, fonts, and responsive presentation."
    }
  },
  {
    term: "JavaScript", korean: "자바스크립트", term_en: "JavaScript", difficulty: "简单",
    description: "常用于实现网页交互、动态内容和服务端应用的编程语言。",
    explanation: {
      zh: "常用于实现网页交互、动态内容和服务端应用的编程语言。",
      ko: "웹 상호작용과 동적 콘텐츠, 서버 애플리케이션을 구현하는 데 널리 쓰이는 프로그래밍 언어입니다.",
      en: "A programming language commonly used to build web interactions, dynamic content, and server-side applications."
    }
  },
  {
    term: "文档对象模型", korean: "문서 객체 모델", term_en: "Document Object Model (DOM)", difficulty: "简单",
    description: "浏览器将 HTML 文档表示为可由脚本读取和修改的节点树结构。",
    explanation: {
      zh: "浏览器将 HTML 文档表示为可由脚本读取和修改的节点树结构。",
      ko: "브라우저가 HTML 문서를 스크립트로 읽고 수정할 수 있는 노드 트리로 표현한 구조입니다.",
      en: "A tree representation of an HTML document that scripts can read and modify in the browser."
    }
  },
  {
    term: "响应式网页设计", korean: "반응형 웹 디자인", term_en: "Responsive Web Design", difficulty: "简单",
    description: "使网页布局能够根据屏幕尺寸和设备特征自动适配的设计方法。",
    explanation: {
      zh: "使网页布局能够根据屏幕尺寸和设备特征自动适配的设计方法。",
      ko: "화면 크기와 기기 특성에 맞춰 웹 페이지 레이아웃이 자동으로 조정되도록 하는 디자인 방식입니다.",
      en: "A design approach that adapts a web page's layout to screen sizes and device characteristics."
    }
  },
  {
    term: "单页应用", korean: "싱글 페이지 애플리케이션", term_en: "Single-Page Application (SPA)", difficulty: "普通",
    description: "主要通过客户端动态更新页面内容，减少整页重新加载的 Web 应用。",
    explanation: {
      zh: "主要通过客户端动态更新页面内容，减少整页重新加载的 Web 应用。",
      ko: "클라이언트에서 페이지 콘텐츠를 동적으로 갱신해 전체 페이지를 다시 불러오는 일을 줄이는 웹 애플리케이션입니다.",
      en: "A web application that updates content dynamically on the client to minimize full-page reloads."
    }
  },
  {
    term: "服务端渲染", korean: "서버 사이드 렌더링", term_en: "Server-Side Rendering (SSR)", difficulty: "普通",
    description: "由服务器生成网页 HTML 后发送给浏览器的渲染方式。",
    explanation: {
      zh: "由服务器生成网页 HTML 后发送给浏览器的渲染方式。",
      ko: "서버가 웹 페이지의 HTML을 생성한 뒤 브라우저로 전송하는 렌더링 방식입니다.",
      en: "A rendering approach in which the server generates a web page's HTML and sends it to the browser."
    }
  },
  {
    term: "Node.js", korean: "노드.js", term_en: "Node.js", difficulty: "简单",
    description: "基于 V8 引擎的 JavaScript 运行环境，可用于构建服务端和命令行应用。",
    explanation: {
      zh: "基于 V8 引擎的 JavaScript 运行环境，可用于构建服务端和命令行应用。",
      ko: "V8 엔진을 기반으로 하며 서버 및 명령줄 애플리케이션을 구축하는 데 사용할 수 있는 JavaScript 런타임입니다.",
      en: "A JavaScript runtime built on the V8 engine that can be used to build server-side and command-line applications."
    }
  },
  {
    term: "微服务", korean: "마이크로서비스", term_en: "Microservices", difficulty: "普通",
    description: "将应用拆分为多个可独立开发、部署和扩展的小型服务的架构风格。",
    explanation: {
      zh: "将应用拆分为多个可独立开发、部署和扩展的小型服务的架构风格。",
      ko: "애플리케이션을 독립적으로 개발, 배포, 확장할 수 있는 여러 개의 작은 서비스로 나누는 아키텍처 방식입니다.",
      en: "An architectural style that splits an application into small services that can be developed, deployed, and scaled independently."
    }
  },
  {
    term: "REST API", korean: "REST API", term_en: "REST API", difficulty: "普通",
    description: "遵循 REST 架构约束，通常通过 HTTP 资源和方法提供服务接口的设计方式。",
    explanation: {
      zh: "遵循 REST 架构约束，通常通过 HTTP 资源和方法提供服务接口的设计方式。",
      ko: "REST 아키텍처 제약을 따르며 일반적으로 HTTP 리소스와 메서드로 서비스 인터페이스를 제공하는 설계 방식입니다.",
      en: "An API design that follows REST constraints and typically exposes services through HTTP resources and methods."
    }
  },
  {
    term: "GraphQL", korean: "그래프QL", term_en: "GraphQL", difficulty: "普通",
    description: "一种 API 查询语言和运行时，客户端可声明所需的数据字段。",
    explanation: {
      zh: "一种 API 查询语言和运行时，客户端可声明所需的数据字段。",
      ko: "클라이언트가 필요한 데이터 필드를 지정할 수 있는 API 쿼리 언어이자 실행 환경입니다.",
      en: "An API query language and runtime that lets clients specify the data fields they need."
    }
  },
  {
    term: "结构化查询语言", korean: "구조화 질의 언어", term_en: "Structured Query Language (SQL)", difficulty: "普通",
    description: "用于定义、查询和操作关系型数据库中数据的语言。",
    explanation: {
      zh: "用于定义、查询和操作关系型数据库中数据的语言。",
      ko: "관계형 데이터베이스의 데이터를 정의하고 조회하며 조작하는 데 사용하는 언어입니다.",
      en: "A language used to define, query, and manipulate data in relational databases."
    }
  },
  {
    term: "缓存", korean: "캐시", term_en: "Cache", difficulty: "简单",
    description: "将常用数据暂存于更快的存储位置，以减少重复计算或访问延迟的技术。",
    explanation: {
      zh: "将常用数据暂存于更快的存储位置，以减少重复计算或访问延迟的技术。",
      ko: "자주 사용하는 데이터를 더 빠른 저장 공간에 임시 보관해 반복 계산이나 접근 지연을 줄이는 기술입니다.",
      en: "A technique that stores frequently used data in faster storage to reduce repeated computation or access latency."
    }
  },
  {
    term: "超文本传输协议", korean: "하이퍼텍스트 전송 프로토콜", term_en: "HyperText Transfer Protocol (HTTP)", difficulty: "简单",
    description: "浏览器与 Web 服务器之间传输网页及相关资源时常用的应用层协议。",
    explanation: {
      zh: "浏览器与 Web 服务器之间传输网页及相关资源时常用的应用层协议。",
      ko: "브라우저와 웹 서버 간에 웹 페이지와 관련 리소스를 전송할 때 사용하는 애플리케이션 계층 프로토콜입니다.",
      en: "An application-layer protocol commonly used to transfer web pages and related resources between browsers and web servers."
    }
  },
  {
    term: "域名系统", korean: "도메인 네임 시스템", term_en: "Domain Name System (DNS)", difficulty: "普通",
    description: "将域名解析为 IP 地址等网络信息的分布式命名系统。",
    explanation: {
      zh: "将域名解析为 IP 地址等网络信息的分布式命名系统。",
      ko: "도메인 이름을 IP 주소와 같은 네트워크 정보로 변환하는 분산형 이름 시스템입니다.",
      en: "A distributed naming system that resolves domain names to IP addresses and other network information."
    }
  },
  {
    term: "IP 地址", korean: "IP 주소", term_en: "IP Address", difficulty: "简单",
    description: "用于标识 IP 网络中设备或网络接口的逻辑地址。",
    explanation: {
      zh: "用于标识 IP 网络中设备或网络接口的逻辑地址。",
      ko: "IP 네트워크에서 장치나 네트워크 인터페이스를 식별하는 논리적 주소입니다.",
      en: "A logical address used to identify a device or network interface on an IP network."
    }
  },
  {
    term: "传输控制协议", korean: "전송 제어 프로토콜", term_en: "Transmission Control Protocol (TCP)", difficulty: "普通",
    description: "提供可靠、有序数据传输的传输层协议。",
    explanation: {
      zh: "提供可靠、有序数据传输的传输层协议。",
      ko: "신뢰성 있고 순서가 보장된 데이터 전송을 제공하는 전송 계층 프로토콜입니다.",
      en: "A transport-layer protocol that provides reliable, ordered data delivery."
    }
  },
  {
    term: "传输层安全协议", korean: "전송 계층 보안", term_en: "Transport Layer Security (TLS)", difficulty: "普通",
    description: "用于保护网络通信机密性和完整性的加密协议，常用于 HTTPS。",
    explanation: {
      zh: "用于保护网络通信机密性和完整性的加密协议，常用于 HTTPS。",
      ko: "네트워크 통신의 기밀성과 무결성을 보호하는 암호화 프로토콜로, HTTPS에 주로 사용됩니다.",
      en: "A cryptographic protocol that protects the confidentiality and integrity of network communications, commonly used with HTTPS."
    }
  },
  {
    term: "负载均衡", korean: "로드 밸런싱", term_en: "Load Balancing", difficulty: "普通",
    description: "将网络请求分配到多个服务器或资源，以提升可用性和处理能力的技术。",
    explanation: {
      zh: "将网络请求分配到多个服务器或资源，以提升可用性和处理能力的技术。",
      ko: "네트워크 요청을 여러 서버나 리소스에 분산해 가용성과 처리 용량을 높이는 기술입니다.",
      en: "A technique that distributes network requests across multiple servers or resources to improve availability and capacity."
    }
  },
  {
    term: "内容分发网络", korean: "콘텐츠 전송 네트워크", term_en: "Content Delivery Network (CDN)", difficulty: "普通",
    description: "通过分布在多个位置的服务器缓存并交付内容，以降低访问延迟的网络服务。",
    explanation: {
      zh: "通过分布在多个位置的服务器缓存并交付内容，以降低访问延迟的网络服务。",
      ko: "여러 위치에 분산된 서버에 콘텐츠를 캐시하고 전달해 사용자 접근 지연을 줄이는 네트워크 서비스입니다.",
      en: "A network service that caches and delivers content from distributed servers to reduce access latency."
    }
  },
  {
    term: "人工智能", korean: "인공지능", term_en: "Artificial Intelligence", difficulty: "简单",
    description: "让计算机执行通常需要人类智能才能完成的任务的技术。",
    explanation: {
      zh: "让计算机执行通常需要人类智能才能完成的任务的技术。",
      ko: "일반적으로 인간의 지능이 필요한 작업을 컴퓨터가 수행하도록 하는 기술입니다.",
      en: "Technology that enables computers to perform tasks that typically require human intelligence."
    }
  },
  {
    term: "模型", korean: "모델", term_en: "Model", difficulty: "简单",
    description: "从数据中学习规律，并用于生成内容或完成预测的计算系统。",
    explanation: {
      zh: "从数据中学习规律，并用于生成内容或完成预测的计算系统。",
      ko: "데이터에서 패턴을 학습해 콘텐츠를 생성하거나 예측을 수행하는 컴퓨팅 시스템입니다.",
      en: "A computational system that learns patterns from data to generate content or make predictions."
    }
  },
  {
    term: "上下文", korean: "컨텍스트", term_en: "Context", difficulty: "简单",
    description: "帮助 AI 理解当前问题或指令的相关信息。",
    explanation: {
      zh: "帮助 AI 理解当前问题或指令的相关信息。",
      ko: "AI가 현재 질문이나 지시를 이해하는 데 도움이 되는 관련 정보입니다.",
      en: "Relevant information that helps AI understand the current question or instruction."
    }
  },
  {
    term: "提示词", korean: "프롬프트", term_en: "Prompt", difficulty: "简单",
    description: "用户提供给 AI 的问题、指令或输入内容。",
    explanation: {
      zh: "用户提供给 AI 的问题、指令或输入内容。",
      ko: "사용자가 AI에 제공하는 질문, 지시 또는 입력 내용입니다.",
      en: "A question, instruction, or input provided by a user to an AI system."
    }
  },
  {
    term: "多模态", korean: "멀티모달", term_en: "Multimodal", difficulty: "简单",
    description: "能够处理或生成文本、图像、音频等多种类型信息的能力。",
    explanation: {
      zh: "能够处理或生成文本、图像、音频等多种类型信息的能力。",
      ko: "텍스트, 이미지, 오디오 등 여러 종류의 정보를 처리하거나 생성하는 능력입니다.",
      en: "The ability to process or generate multiple types of information, such as text, images, and audio."
    }
  },
  {
    term: "AI 助手", korean: "AI 어시스턴트", term_en: "AI Assistant", difficulty: "简单",
    description: "根据用户请求提供信息、建议或任务协助的 AI 应用。",
    explanation: {
      zh: "根据用户请求提供信息、建议或任务协助的 AI 应用。",
      ko: "사용자의 요청에 따라 정보와 제안을 제공하거나 작업을 돕는 AI 애플리케이션입니다.",
      en: "An AI application that provides information, suggestions, or task assistance in response to user requests."
    }
  },
  {
    term: "聊天机器人", korean: "챗봇", term_en: "Chatbot", difficulty: "简单",
    description: "通过文字或语音与用户进行对话的程序。",
    explanation: {
      zh: "通过文字或语音与用户进行对话的程序。",
      ko: "텍스트나 음성으로 사용자와 대화하는 프로그램입니다.",
      en: "A program that converses with users through text or speech."
    }
  },
  {
    term: "生成式人工智能", korean: "생성형 인공지능", term_en: "Generative AI", difficulty: "简单",
    description: "能够根据输入生成文本、图像、音频等新内容的人工智能。",
    explanation: {
      zh: "能够根据输入生成文本、图像、音频等新内容的人工智能。",
      ko: "입력을 바탕으로 텍스트, 이미지, 오디오 등의 새로운 콘텐츠를 생성하는 인공지능입니다.",
      en: "Artificial intelligence that generates new content such as text, images, or audio from input."
    }
  },
  {
    term: "基于人类反馈的强化学习", korean: "인간 피드백 기반 강화 학습", term_en: "Reinforcement Learning from Human Feedback (RLHF)", difficulty: "困难",
    description: "利用人类偏好反馈优化模型行为的训练方法。",
    explanation: {
      zh: "利用人类偏好反馈优化模型行为的训练方法。",
      ko: "사람의 선호도 피드백을 활용해 모델의 행동을 최적화하는 학습 방법입니다.",
      en: "A training method that uses human preference feedback to optimize a model's behavior."
    }
  },
  {
    term: "专家混合模型", korean: "전문가 혼합 모델", term_en: "Mixture of Experts (MoE)", difficulty: "困难",
    description: "由多个专家子网络组成，并通过路由机制选择部分专家处理输入的模型架构。",
    explanation: {
      zh: "由多个专家子网络组成，并通过路由机制选择部分专家处理输入的模型架构。",
      ko: "여러 전문가 하위 네트워크로 구성되며 라우팅을 통해 입력을 처리할 일부 전문가를 선택하는 모델 구조입니다.",
      en: "A model architecture with multiple expert subnetworks that routes each input to a selected subset of experts."
    }
  },
  {
    term: "键值缓存", korean: "KV 캐시", term_en: "Key-Value Cache (KV Cache)", difficulty: "困难",
    description: "在自回归生成过程中缓存注意力层的键和值，以减少重复计算。",
    explanation: {
      zh: "在自回归生成过程中缓存注意力层的键和值，以减少重复计算。",
      ko: "자기회귀 생성 중 어텐션 계층의 키와 값을 캐시해 반복 계산을 줄이는 기법입니다.",
      en: "A technique that caches attention keys and values during autoregressive generation to avoid recomputing them."
    }
  },
  {
    term: "位置编码", korean: "위치 인코딩", term_en: "Positional Encoding", difficulty: "困难",
    description: "将序列中各元素的位置信息加入模型输入或表示的方法。",
    explanation: {
      zh: "将序列中各元素的位置信息加入模型输入或表示的方法。",
      ko: "시퀀스 요소의 위치 정보를 모델 입력이나 표현에 추가하는 방법입니다.",
      en: "A method for adding the positional information of sequence elements to model inputs or representations."
    }
  },
  {
    term: "自注意力", korean: "자기 어텐션", term_en: "Self-Attention", difficulty: "困难",
    description: "让序列中的每个位置根据其他位置的信息计算自身表示的注意力机制。",
    explanation: {
      zh: "让序列中的每个位置根据其他位置的信息计算自身表示的注意力机制。",
      ko: "시퀀스의 각 위치가 다른 위치의 정보를 바탕으로 자신의 표현을 계산하는 어텐션 메커니즘입니다.",
      en: "An attention mechanism in which each sequence position computes its representation using information from other positions."
    }
  },
  {
    term: "低秩适配", korean: "저랭크 적응", term_en: "Low-Rank Adaptation (LoRA)", difficulty: "困难",
    description: "通过训练低秩矩阵来高效适配预训练模型的微调方法。",
    explanation: {
      zh: "通过训练低秩矩阵来高效适配预训练模型的微调方法。",
      ko: "저랭크 행렬을 학습해 사전 학습 모델을 효율적으로 적응시키는 파인튜닝 방법입니다.",
      en: "A fine-tuning method that efficiently adapts a pretrained model by training low-rank matrices."
    }
  },
  {
    term: "扩散模型", korean: "확산 모델", term_en: "Diffusion Model", difficulty: "困难",
    description: "通过逐步去噪，从随机噪声中生成数据的生成模型。",
    explanation: {
      zh: "通过逐步去噪，从随机噪声中生成数据的生成模型。",
      ko: "무작위 노이즈에서 단계적으로 노이즈를 제거해 데이터를 생성하는 생성 모델입니다.",
      en: "A generative model that creates data by gradually removing noise from random noise."
    }
  },
  {
    term: "束搜索", korean: "빔 서치", term_en: "Beam Search", difficulty: "困难",
    description: "在序列生成时保留多个高概率候选路径，并逐步扩展以寻找较优结果的搜索算法。",
    explanation: {
      zh: "在序列生成时保留多个高概率候选路径，并逐步扩展以寻找较优结果的搜索算法。",
      ko: "시퀀스 생성 중 확률이 높은 여러 후보 경로를 유지하고 확장해 더 나은 결과를 찾는 탐색 알고리즘입니다.",
      en: "A search algorithm that keeps and expands several high-probability candidate paths during sequence generation."
    }
  },
  {
    term: "困惑度", korean: "퍼플렉서티", term_en: "Perplexity", difficulty: "困难",
    description: "用于衡量语言模型对文本序列预测不确定性的指标。",
    explanation: {
      zh: "用于衡量语言模型对文本序列预测不确定性的指标。",
      ko: "언어 모델이 텍스트 시퀀스를 예측할 때의 불확실성을 측정하는 지표입니다.",
      en: "A metric that measures a language model's uncertainty when predicting a text sequence."
    }
  },
  {
    term: "旋转位置嵌入", korean: "회전 위치 임베딩", term_en: "Rotary Positional Embedding (RoPE)", difficulty: "困难",
    description: "通过旋转变换将位置信息融入注意力计算的相对位置编码方法。",
    explanation: {
      zh: "通过旋转变换将位置信息融入注意力计算的相对位置编码方法。",
      ko: "회전 변환을 통해 위치 정보를 어텐션 계산에 반영하는 상대 위치 인코딩 방법입니다.",
      en: "A relative positional encoding method that incorporates position information into attention computation through rotations."
    }
  }
].map((term, index) => ({
  ...term,
  id: index + 21,
  zh: term.term,
  ko: term.korean,
  en: term.term_en,
  descZh: term.description,
  descKo: term.explanation.ko,
  descEn: term.explanation.en
}));

const questionCount = wordList.length;
wordList.push(...vocabularyList.slice(0, TOTAL_QUESTIONS - questionCount));

if (
  wordList.length !== TOTAL_QUESTIONS
  || new Set(wordList.map((word) => word.term)).size !== TOTAL_QUESTIONS
) {
  throw new Error(`题库需要包含 ${TOTAL_QUESTIONS} 道题，请检查题目和词语库数据。`);
}

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
    growth: {
      title: "我的成长",
      totalXP: "累计经验",
      nextLevel: "距离下一级还需 {xp} XP",
      progressAria: "当前等级进度：{current} / {next} XP",
      maxLevel: "已达到最高等级"
    },
    userCenter: {
      title: "用户中心",
      open: "打开用户中心",
      close: "关闭",
      profile: "当前状态",
      totalXP: "累计经验",
      progressAria: "当前等级经验进度",
      nextLevel: "距离下一级还需要 {xp} XP",
      maxLevel: "已达到最高等级 Lv.10",
      changeAvatar: "更换头像",
      changeFrame: "更换头像框",
      editorEyebrow: "个人资料",
      avatarPageTitle: "更换头像",
      avatarPageDescription: "选择一张图片作为你的头像。",
      framePageTitle: "更换头像框",
      framePageDescription: "选择已解锁的头像框，预览后保存。",
      avatarPreview: "头像预览",
      framePreview: "头像框预览",
      gallery: "头像框图鉴",
      unlocked: "已解锁",
      locked: "🔒 未解锁",
      selected: "已使用",
      chooseImage: "选择头像图片",
      cancel: "取消",
      save: "保存",
      invalidImage: "请选择有效的图片文件。",
      frameUnavailable: "该头像框尚未解锁。",
      uploadFailed: "图片读取失败，请重试。",
      saveFailed: "保存失败，请检查浏览器存储空间后重试。"
    },
    home: {
      eyebrow: "AI · IT TERMINOLOGY",
      title: "准备好挑战术语了吗？",
      intro: "通过中、韩、英术语练习，让每天学习一点点变得有趣。",
      round: "每轮 10 道题",
      points: "每题 10 分",
      spotlightCaption: "每答一题，进步一点。"
    },
    difficultySelection: {
      eyebrow: "本轮设置",
      title: "选择答题难度",
      description: "选择适合自己的难度，开始本轮练习。",
      simpleDescription: "AI 入门与常用概念",
      normalDescription: "核心技术与常见方法",
      hardDescription: "模型原理与工程细节"
    },
    button: {
      openVocabulary: "查看词语库",
      start: "开始答题",
      startRound: "开始本轮练习",
      chooseDifficulty: "选择答题难度",
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
      difficulty: "难度",
      difficultyLabels: {
        easy: "简单",
        medium: "普通",
        hard: "困难"
      },
      previous: "上一个",
      next: "下一个",
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
      comboLabel: "连击",
      comboActive: "连击 x{count}!",
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
      notEnoughQuestions: "题库目前只有 {count} 道题，至少需要 10 道不重复题目才能开始。",
      notEnoughDifficultyQuestions: "“{difficulty}”难度目前只有 {count} 道题，至少需要 {required} 道才能开始。",
      invalidDifficulty: "无法识别所选难度，请重新选择。"
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
    },
    achievement: {
      button: "成就",
      eyebrow: "成长里程碑",
      unlocked: "成就解锁！",
      shelfTitle: "成就书架",
      shelfDescription: "每一份坚持，都值得被珍藏。",
      locked: "尚未解锁",
      close: "关闭",
      badges: {
        first_round: "第一步",
        enthusiastic_learner: "热情学习者",
        master: "达人",
        bronze_scholar: "青铜学士",
        gold_champion: "黄金冠军"
      },
      badgeLabels: {
        first_round: "初次挑战",
        enthusiastic_learner: "坚持学习",
        master: "等级达人",
        bronze_scholar: "学士",
        gold_champion: "我们是冠军"
      }
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
    growth: {
      title: "나의 성장",
      totalXP: "누적 경험치",
      nextLevel: "다음 레벨까지 {xp} XP 남음",
      progressAria: "현재 레벨 진행도: {current} / {next} XP",
      maxLevel: "최고 레벨에 도달했습니다"
    },
    userCenter: {
      title: "사용자 센터",
      open: "사용자 센터 열기",
      close: "닫기",
      profile: "현재 상태",
      totalXP: "누적 경험치",
      progressAria: "현재 레벨 경험치 진행도",
      nextLevel: "다음 레벨까지 {xp} XP 남음",
      maxLevel: "최고 레벨 Lv.10에 도달했습니다",
      changeAvatar: "프로필 사진 변경",
      changeFrame: "아바타 프레임 변경",
      editorEyebrow: "프로필",
      avatarPageTitle: "프로필 사진 변경",
      avatarPageDescription: "프로필 사진으로 사용할 이미지를 선택하세요.",
      framePageTitle: "아바타 프레임 변경",
      framePageDescription: "잠금 해제된 프레임을 선택하고 미리 본 후 저장하세요.",
      avatarPreview: "프로필 사진 미리보기",
      framePreview: "아바타 프레임 미리보기",
      gallery: "아바타 프레임 도감",
      unlocked: "잠금 해제됨",
      locked: "🔒 잠김",
      selected: "사용 중",
      chooseImage: "프로필 사진 선택",
      cancel: "취소",
      save: "저장",
      invalidImage: "올바른 이미지 파일을 선택해 주세요.",
      frameUnavailable: "아직 잠금 해제되지 않은 프레임입니다.",
      uploadFailed: "이미지를 읽지 못했습니다. 다시 시도해 주세요.",
      saveFailed: "저장하지 못했습니다. 브라우저 저장 공간을 확인한 후 다시 시도해 주세요."
    },
    home: {
      eyebrow: "AI · IT 용어",
      title: "용어 퀴즈를 시작할 준비가 되었나요?",
      intro: "중국어, 한국어, 영어 용어를 연습하며 매일 조금씩 재미있게 배워 보세요.",
      round: "한 라운드 10문제",
      points: "문제당 10점",
      spotlightCaption: "한 문제씩 풀며 꾸준히 성장하세요."
    },
    difficultySelection: {
      eyebrow: "라운드 설정",
      title: "퀴즈 난이도 선택",
      description: "이번 라운드에서 연습할 난이도를 선택하세요.",
      simpleDescription: "AI 입문 및 기초 개념",
      normalDescription: "핵심 기술과 일반적인 방법",
      hardDescription: "모델 원리와 엔지니어링 세부 내용"
    },
    button: {
      openVocabulary: "단어장 보기",
      start: "퀴즈 시작",
      startRound: "이번 라운드 시작",
      chooseDifficulty: "퀴즈 난이도 선택",
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
      difficulty: "난이도",
      difficultyLabels: {
        easy: "쉬움",
        medium: "보통",
        hard: "어려움"
      },
      previous: "이전",
      next: "다음",
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
      comboLabel: "콤보",
      comboActive: "콤보 x{count}!",
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
      notEnoughQuestions: "현재 문제는 {count}개입니다. 시작하려면 중복되지 않는 문제가 10개 이상 필요합니다.",
      notEnoughDifficultyQuestions: "{difficulty} 난이도 문제는 현재 {count}개입니다. 시작하려면 {required}개 이상 필요합니다.",
      invalidDifficulty: "선택한 난이도를 확인할 수 없습니다. 다시 선택해 주세요."
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
    },
    achievement: {
      button: "업적",
      eyebrow: "성장 마일스톤",
      unlocked: "업적 달성！",
      shelfTitle: "업적 책장",
      shelfDescription: "꾸준한 노력의 순간을 모아 보세요.",
      locked: "잠금 해제되지 않음",
      close: "닫기",
      badges: {
        first_round: "첫걸음",
        enthusiastic_learner: "열정 학습자",
        master: "달인",
        bronze_scholar: "브론즈 학자",
        gold_champion: "골드 챔피언"
      },
      badgeLabels: {
        first_round: "첫 도전",
        enthusiastic_learner: "꾸준한 학습",
        master: "레벨 달인",
        bronze_scholar: "학사",
        gold_champion: "우리가 챔피언"
      }
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
    growth: {
      title: "My Growth",
      totalXP: "Total XP",
      nextLevel: "{xp} XP to the next level",
      progressAria: "Current level progress: {current} / {next} XP",
      maxLevel: "Maximum level reached"
    },
    userCenter: {
      title: "User Center",
      open: "Open user center",
      close: "Close",
      profile: "Current status",
      totalXP: "Total XP",
      progressAria: "Current level XP progress",
      nextLevel: "{xp} XP to the next level",
      maxLevel: "Maximum level Lv.10 reached",
      changeAvatar: "Change Avatar",
      changeFrame: "Change Avatar Frame",
      editorEyebrow: "PROFILE",
      avatarPageTitle: "Change Avatar",
      avatarPageDescription: "Choose an image to use as your avatar.",
      framePageTitle: "Change Avatar Frame",
      framePageDescription: "Choose an unlocked frame, preview it, then save.",
      avatarPreview: "Avatar preview",
      framePreview: "Avatar frame preview",
      gallery: "Avatar Frame Collection",
      unlocked: "Unlocked",
      locked: "🔒 Locked",
      selected: "Equipped",
      chooseImage: "Choose an avatar image",
      cancel: "Cancel",
      save: "Save",
      invalidImage: "Choose a valid image file.",
      frameUnavailable: "That frame is still locked.",
      uploadFailed: "Could not read the image. Please try again.",
      saveFailed: "Could not save your changes. Check browser storage and try again."
    },
    home: {
      eyebrow: "AI · IT TERMINOLOGY",
      title: "Ready to take on the terminology challenge?",
      intro: "Practice Chinese, Korean, and English terms and make learning a little fun every day.",
      round: "10 questions per round",
      points: "10 points per question",
      spotlightCaption: "Keep learning, one question at a time."
    },
    difficultySelection: {
      eyebrow: "ROUND SETUP",
      title: "Choose a quiz difficulty",
      description: "Select a difficulty to start this round.",
      simpleDescription: "AI basics and everyday terms",
      normalDescription: "Core technologies and common methods",
      hardDescription: "Model principles and engineering details"
    },
    button: {
      openVocabulary: "View Vocabulary",
      start: "Start Quiz",
      startRound: "Start This Round",
      chooseDifficulty: "Choose a quiz difficulty",
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
      difficulty: "Difficulty",
      difficultyLabels: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard"
      },
      previous: "Previous",
      next: "Next",
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
      comboLabel: "Combo",
      comboActive: "Combo x{count}!",
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
      notEnoughQuestions: "The question bank has {count} questions. Add at least 10 unique questions to start.",
      notEnoughDifficultyQuestions: "There are only {count} {difficulty} questions. At least {required} are needed to start.",
      invalidDifficulty: "The selected difficulty is not recognized. Please choose again."
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
    },
    achievement: {
      button: "Achievements",
      eyebrow: "MILESTONES",
      unlocked: "Achievement Unlocked!",
      shelfTitle: "Achievement Shelf",
      shelfDescription: "Every milestone deserves a place on the shelf.",
      locked: "Locked",
      close: "Close",
      badges: {
        first_round: "First Step",
        enthusiastic_learner: "Enthusiastic Learner",
        master: "Master",
        bronze_scholar: "Bronze Scholar",
        gold_champion: "Gold Champion"
      },
      badgeLabels: {
        first_round: "First Challenge",
        enthusiastic_learner: "Keep Learning",
        master: "Level Master",
        bronze_scholar: "Scholar",
        gold_champion: "We Are the Champions"
      }
    }
  }
};

const LANGUAGE_STORAGE_KEY = "axQuizLanguage";

function updateAchievementToastLanguage(toast) {
  const achievementText = translations[currentLanguage].achievement;
  const badgeKey = toast.dataset.badgeKey;
  toast.querySelector(".achievement-toast-name").textContent = achievementText.badges[badgeKey];
  toast.querySelector(".achievement-toast-message").textContent =
    achievementText.unlocked;
}

function updateVisibleAchievementToasts() {
  document.querySelectorAll(".achievement-toast").forEach(updateAchievementToastLanguage);
}

function showAchievementToast(badgeKey) {
  const toast = document.createElement("article");
  const icon = document.createElement("span");
  const copy = document.createElement("span");
  const name = document.createElement("strong");
  const message = document.createElement("span");

  toast.className = "achievement-toast";
  toast.dataset.badgeKey = badgeKey;
  toast.setAttribute("role", "status");
  icon.className = "achievement-toast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = ACHIEVEMENTS[badgeKey].icon;
  copy.className = "achievement-toast-copy";
  name.className = "achievement-toast-name";
  message.className = "achievement-toast-message";
  copy.append(name, message);
  toast.append(icon, copy);
  updateAchievementToastLanguage(toast);
  document.querySelector("#achievement-toast-container").append(toast);

  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 400);
  }, 3400);
}

function unlockBadges(badgeKeys) {
  const storedBadges = getStoredArray(BADGES_STORAGE_KEY)
    .filter((badgeKey) => typeof badgeKey === "string");
  const unlockedBadges = new Set(storedBadges);
  const newBadges = badgeKeys.filter(
    (badgeKey) => Object.prototype.hasOwnProperty.call(ACHIEVEMENTS, badgeKey)
      && !unlockedBadges.has(badgeKey)
      && !unlockedBadgesThisSession.has(badgeKey)
  );
  if (newBadges.length === 0) {
    return;
  }

  safeSetItem(BADGES_STORAGE_KEY, JSON.stringify([...unlockedBadges, ...newBadges]));
  const savedBadges = new Set(getStoredArray(BADGES_STORAGE_KEY));
  newBadges.forEach((badgeKey) => {
    if (!savedBadges.has(badgeKey)) {
      return;
    }

    unlockedBadgesThisSession.add(badgeKey);
    showAchievementToast(badgeKey);
  });
  renderAchievementShelf();
}

function renderAchievementShelf() {
  const shelfRows = document.querySelector("#achievement-shelf-rows");
  if (!shelfRows) {
    return;
  }

  const achievementText = translations[currentLanguage].achievement;
  const unlockedBadges = new Set(getStoredArray(BADGES_STORAGE_KEY));
  const achievementKeys = Object.keys(ACHIEVEMENTS);
  shelfRows.replaceChildren();

  for (let index = 0; index < achievementKeys.length; index += 3) {
    const row = document.createElement("div");
    row.className = "achievement-shelf-row";

    achievementKeys.slice(index, index + 3).forEach((badgeKey) => {
      const isUnlocked = unlockedBadges.has(badgeKey);
      const tile = document.createElement("article");
      const name = document.createElement("h3");
      const award = document.createElement("span");
      const trophy = document.createElement("span");
      const lock = document.createElement("span");
      const label = document.createElement("span");

      tile.className = `achievement-shelf-slot achievement-shelf-slot--${badgeKey}`
        + (isUnlocked ? " is-unlocked" : " is-locked");
      name.className = "achievement-shelf-name";
      name.textContent = achievementText.badges[badgeKey];
      award.className = "achievement-shelf-award";
      award.setAttribute("aria-hidden", "true");
      trophy.className = "achievement-shelf-trophy";
      trophy.textContent = ACHIEVEMENTS[badgeKey].icon;
      lock.className = "achievement-shelf-lock";
      lock.textContent = isUnlocked ? "" : "🔒";
      award.append(trophy, lock);
      label.className = "achievement-shelf-label";
      label.textContent = isUnlocked
        ? achievementText.badgeLabels[badgeKey]
        : achievementText.locked;
      tile.append(name, award, label);
      row.append(tile);
    });

    shelfRows.append(row);
  }
}

function getLevelForXP(xp) {
  return Math.min(MAX_USER_LEVEL, Math.floor(xp / 100) + 1);
}

function renderGrowth() {
  const level = getLevelForXP(totalXP);
  const levelProgressXP = level === MAX_USER_LEVEL ? 100 : totalXP % 100;
  const progressPercent = levelProgressXP;
  const growthText = translations[currentLanguage].growth;

  document.querySelectorAll("[data-growth-panel]").forEach((panel) => {
    panel.querySelector("[data-growth-level]").textContent = `Lv.${level}`;
    panel.querySelector("[data-growth-xp]").textContent = String(totalXP);

    const progressTrack = panel.querySelector("[data-growth-progress]");
    progressTrack.setAttribute("aria-valuenow", String(Math.round(progressPercent)));
    progressTrack.setAttribute(
      "aria-valuetext",
      level === MAX_USER_LEVEL
        ? growthText.maxLevel
        : growthText.progressAria
          .replace("{current}", String(levelProgressXP))
          .replace("{next}", "100")
    );
    panel.querySelector("[data-growth-progress-fill]").style.width = `${progressPercent}%`;
    panel.querySelector("[data-growth-next]").textContent = level === MAX_USER_LEVEL
      ? growthText.maxLevel
      : growthText.nextLevel.replace("{xp}", String(100 - levelProgressXP));
  });

  renderUserCenter();
}

function renderUserCenter() {
  const level = getLevelForXP(totalXP);
  const levelProgressXP = level === MAX_USER_LEVEL ? 100 : totalXP % 100;
  const userCenterText = translations[currentLanguage].userCenter;
  const progressTrack = document.querySelector("[data-user-progress]");

  document.querySelectorAll("[data-user-level]").forEach((element) => {
    element.textContent = `Lv.${level}`;
  });
  document.querySelector("[data-user-xp]").textContent = String(totalXP);
  progressTrack.setAttribute("aria-valuenow", String(levelProgressXP));
  progressTrack.setAttribute(
    "aria-valuetext",
    level === MAX_USER_LEVEL
      ? userCenterText.maxLevel
      : `${levelProgressXP} / 100 XP`
  );
  document.querySelector("[data-user-progress-fill]").style.width = `${levelProgressXP}%`;
  document.querySelector("[data-user-next-level]").textContent =
    level === MAX_USER_LEVEL
      ? userCenterText.maxLevel
      : userCenterText.nextLevel.replace("{xp}", String(100 - levelProgressXP));

  document.querySelectorAll("[data-user-avatar]").forEach((avatarFrame) => {
    Array.from(avatarFrame.classList)
      .filter((className) => className.startsWith("avatar-frame--"))
      .forEach((className) => avatarFrame.classList.remove(className));
    avatarFrame.classList.add(`avatar-frame--${selectedAvatarFrame}`);
    const placeholder = avatarFrame.querySelector("[data-user-avatar-placeholder]");
    const image = avatarFrame.querySelector("[data-user-avatar-image]");
    placeholder.hidden = Boolean(userAvatarData);
    image.hidden = !userAvatarData;
    if (userAvatarData) {
      if (image.getAttribute("src") !== userAvatarData) {
        image.src = userAvatarData;
      }
    } else {
      image.removeAttribute("src");
    }
  });

}

function createAvatarHatSvg(idSuffix) {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNamespace, "svg");
  const definitions = document.createElementNS(svgNamespace, "defs");
  const capGradientId = `avatar-cap-gradient-${idSuffix}`;
  const tasselGradientId = `avatar-tassel-gradient-${idSuffix}`;
  const capGradient = document.createElementNS(svgNamespace, "linearGradient");
  const tasselGradient = document.createElementNS(svgNamespace, "linearGradient");

  svg.classList.add("avatar-hat-svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  capGradient.setAttribute("id", capGradientId);
  capGradient.setAttribute("x1", "0");
  capGradient.setAttribute("y1", "0");
  capGradient.setAttribute("x2", "100");
  capGradient.setAttribute("y2", "100");
  capGradient.setAttribute("gradientUnits", "userSpaceOnUse");
  const capStart = document.createElementNS(svgNamespace, "stop");
  capStart.setAttribute("offset", "0%");
  capStart.setAttribute("style", "stop-color: var(--frame-a)");
  const capEnd = document.createElementNS(svgNamespace, "stop");
  capEnd.setAttribute("offset", "100%");
  capEnd.setAttribute("style", "stop-color: var(--frame-b)");
  capGradient.append(capStart, capEnd);

  tasselGradient.setAttribute("id", tasselGradientId);
  tasselGradient.setAttribute("x1", "0");
  tasselGradient.setAttribute("y1", "0");
  tasselGradient.setAttribute("x2", "0");
  tasselGradient.setAttribute("y2", "100");
  tasselGradient.setAttribute("gradientUnits", "userSpaceOnUse");
  const tasselStart = document.createElementNS(svgNamespace, "stop");
  tasselStart.setAttribute("offset", "0%");
  tasselStart.setAttribute("stop-color", "#fff3bb");
  const tasselEndStop = document.createElementNS(svgNamespace, "stop");
  tasselEndStop.setAttribute("offset", "100%");
  tasselEndStop.setAttribute("stop-color", "#c88a18");
  tasselGradient.append(tasselStart, tasselEndStop);

  definitions.append(capGradient, tasselGradient);
  const board = document.createElementNS(svgNamespace, "path");
  board.classList.add("avatar-hat-board");
  board.setAttribute("d", "M8 28 50 7 92 28 50 50Z");
  board.setAttribute("fill", `url(#${capGradientId})`);
  board.setAttribute("stroke", `url(#${capGradientId})`);

  const crown = document.createElementNS(svgNamespace, "path");
  crown.classList.add("avatar-hat-crown");
  crown.setAttribute("d", "M24 38 50 51 76 38V57Q50 74 24 57Z");
  crown.setAttribute("fill", `url(#${capGradientId})`);
  crown.setAttribute("stroke", `url(#${capGradientId})`);

  const brim = document.createElementNS(svgNamespace, "path");
  brim.classList.add("avatar-hat-brim");
  brim.setAttribute("d", "M15 56Q50 81 85 56");
  brim.setAttribute("fill", "none");
  brim.setAttribute("stroke", `url(#${capGradientId})`);

  const tassel = document.createElementNS(svgNamespace, "g");
  tassel.classList.add("avatar-hat-tassel");
  tassel.setAttribute("fill", `url(#${tasselGradientId})`);
  tassel.setAttribute("stroke", `url(#${tasselGradientId})`);
  const cord = document.createElementNS(svgNamespace, "path");
  cord.setAttribute("d", "M84 29C88 38 88 46 84 54");
  cord.setAttribute("fill", "none");
  const tasselEnd = document.createElementNS(svgNamespace, "path");
  tasselEnd.setAttribute("d", "M81 52 87 54 85 63 81 60 77 65 78 54Z");
  tassel.append(cord, tasselEnd);

  svg.append(definitions, board, crown, brim, tassel);
  return svg;
}

function renderAvatarPreview(preview, avatarData, frameLevel, idSuffix) {
  Array.from(preview.classList)
    .filter((className) => className.startsWith("avatar-frame--"))
    .forEach((className) => preview.classList.remove(className));
  preview.classList.add(`avatar-frame--${frameLevel}`);

  const placeholder = document.createElement("span");
  placeholder.className = "user-avatar-placeholder";
  placeholder.setAttribute("aria-hidden", "true");
  placeholder.textContent = "👤";
  placeholder.hidden = Boolean(avatarData);

  const image = document.createElement("img");
  image.className = "user-avatar-image";
  image.alt = "";
  image.hidden = !avatarData;
  if (avatarData) {
    image.src = avatarData;
  }

  preview.replaceChildren(createAvatarHatSvg(idSuffix), placeholder, image);
}

function renderProfileEditorStatus() {
  const userCenterText = translations[currentLanguage].userCenter;
  const statusText = userCenterStatusKey ? userCenterText[userCenterStatusKey] : "";
  document.querySelector("#avatar-editor-status").textContent = statusText;
  document.querySelector("#avatar-frame-editor-status").textContent = statusText;
}

function renderAvatarEditors() {
  renderAvatarPreview(
    document.querySelector("#avatar-editor-preview"),
    draftAvatarData,
    draftAvatarFrame,
    "avatar-editor"
  );
  renderAvatarPreview(
    document.querySelector("#avatar-frame-editor-preview"),
    draftAvatarData,
    draftAvatarFrame,
    "frame-editor"
  );

  const level = getLevelForXP(totalXP);
  renderAvatarFrameGallery(level, translations[currentLanguage].userCenter, draftAvatarFrame);
  renderProfileEditorStatus();
}

function renderAvatarFrameGallery(level, userCenterText, selectedFrame) {
  const gallery = document.querySelector("#avatar-frame-grid");
  gallery.replaceChildren();

  for (let frameLevel = 1; frameLevel <= MAX_USER_LEVEL; frameLevel += 1) {
    const isUnlocked = frameLevel <= level;
    const isSelected = frameLevel === selectedFrame;
    const status = isUnlocked
      ? isSelected
        ? `${userCenterText.unlocked} · ${userCenterText.selected}`
        : userCenterText.unlocked
      : userCenterText.locked;
    const button = document.createElement("button");
    const preview = document.createElement("span");
    const previewIcon = document.createElement("span");
    const frameName = document.createElement("span");
    const frameStatus = document.createElement("span");

    button.className = "avatar-frame-option";
    button.type = "button";
    button.disabled = !isUnlocked;
    button.dataset.frameLevel = String(frameLevel);
    button.setAttribute("aria-pressed", String(isSelected));
    button.setAttribute("aria-label", `Lv.${frameLevel} · ${status}`);
    button.classList.toggle("is-selected", isSelected);

    preview.className = `avatar-frame-preview avatar-frame--${frameLevel}`;
    previewIcon.className = "avatar-frame-preview-icon";
    previewIcon.setAttribute("aria-hidden", "true");
    previewIcon.textContent = "👤";
    frameName.className = "frame-option-name";
    frameName.textContent = `Lv.${frameLevel}`;
    frameStatus.className = "frame-option-status";
    frameStatus.textContent = status;
    preview.append(createAvatarHatSvg(`frame-${frameLevel}`), previewIcon);
    button.append(preview, frameName, frameStatus);
    gallery.append(button);
  }
}

function initializeUserCenter() {
  const storedAvatar = safeGetItem(AVATAR_STORAGE_KEY);
  if (storedAvatar && storedAvatar.startsWith("data:image/")) {
    userAvatarData = storedAvatar;
  } else if (storedAvatar) {
    console.warn("LocalStorage 中的头像数据格式无效。");
  }

  const storedFrame = Number(safeGetItem(AVATAR_FRAME_STORAGE_KEY));
  const userLevel = getLevelForXP(totalXP);
  selectedAvatarFrame = Number.isInteger(storedFrame) && storedFrame >= 1 && storedFrame <= userLevel
    ? storedFrame
    : userLevel;
  safeSetItem(AVATAR_FRAME_STORAGE_KEY, String(selectedAvatarFrame));
  draftAvatarData = userAvatarData;
  draftAvatarFrame = selectedAvatarFrame;
}

function handleAvatarFrameSelection(event) {
  const frameButton = event.target.closest("[data-frame-level]");
  if (!frameButton || frameButton.disabled) {
    return;
  }

  const frameLevel = Number(frameButton.dataset.frameLevel);
  if (!Number.isInteger(frameLevel) || frameLevel < 1 || frameLevel > getLevelForXP(totalXP)) {
    return;
  }

  draftAvatarFrame = frameLevel;
  userCenterStatusKey = "";
  renderAvatarEditors();
}

function handleAvatarFileChange(event) {
  const fileInput = event.currentTarget;
  const file = fileInput.files[0];
  if (!file) {
    return;
  }
  fileInput.value = "";

  if (!file.type.startsWith("image/")) {
    userCenterStatusKey = "invalidImage";
    renderProfileEditorStatus();
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (typeof reader.result !== "string" || !reader.result.startsWith("data:image/")) {
      userCenterStatusKey = "uploadFailed";
      renderProfileEditorStatus();
      return;
    }

    draftAvatarData = reader.result;
    userCenterStatusKey = "";
    renderAvatarEditors();
  });
  reader.addEventListener("error", () => {
    userCenterStatusKey = "uploadFailed";
    renderProfileEditorStatus();
  });
  reader.readAsDataURL(file);
}

function handleUserCenterOpen() {
  const dialog = document.querySelector("#user-center-dialog");
  renderUserCenter();
  if (!dialog.open) {
    dialog.showModal();
  }
}

function handleUserCenterClose() {
  document.querySelector("#user-center-dialog").close();
}

function openProfileEditor(pageId) {
  document.querySelector("#user-center-dialog").close();
  draftAvatarData = userAvatarData;
  draftAvatarFrame = selectedAvatarFrame;
  userCenterStatusKey = "";
  renderAvatarEditors();
  showPage(pageId, true);
}

function handleProfileEditorCancel() {
  draftAvatarData = userAvatarData;
  draftAvatarFrame = selectedAvatarFrame;
  userCenterStatusKey = "";
  showPage("home", true);
}

function handleAvatarSave() {
  safeSetItem(AVATAR_STORAGE_KEY, draftAvatarData);
  if (safeGetItem(AVATAR_STORAGE_KEY) !== draftAvatarData) {
    userCenterStatusKey = "saveFailed";
    renderProfileEditorStatus();
    return;
  }

  userAvatarData = draftAvatarData;
  userCenterStatusKey = "";
  renderUserCenter();
  showPage("home", true);
}

function handleAvatarFrameSave() {
  if (
    !Number.isInteger(draftAvatarFrame)
    || draftAvatarFrame < 1
    || draftAvatarFrame > getLevelForXP(totalXP)
  ) {
    userCenterStatusKey = "frameUnavailable";
    renderProfileEditorStatus();
    return;
  }

  const savedFrame = String(draftAvatarFrame);
  safeSetItem(AVATAR_FRAME_STORAGE_KEY, savedFrame);
  if (safeGetItem(AVATAR_FRAME_STORAGE_KEY) !== savedFrame) {
    userCenterStatusKey = "saveFailed";
    renderProfileEditorStatus();
    return;
  }

  selectedAvatarFrame = draftAvatarFrame;
  userCenterStatusKey = "";
  renderUserCenter();
  showPage("home", true);
}

function handleAchievementShelfOpen() {
  const dialog = document.querySelector("#achievement-shelf-dialog");
  renderAchievementShelf();
  if (!dialog.open) {
    dialog.showModal();
  }
}

function handleAchievementShelfClose() {
  document.querySelector("#achievement-shelf-dialog").close();
}

function recordLearningProgress(isCorrect) {
  const xpEarned = isCorrect ? 10 : 2;
  totalXP += xpEarned;
  currentRoundXP += xpEarned;
  if (isCorrect) {
    totalCorrectAnswers += 1;
    currentRoundCorrect += 1;
  }
  safeSetItem(XP_STORAGE_KEY, String(totalXP));
  safeSetItem(TOTAL_CORRECT_STORAGE_KEY, String(totalCorrectAnswers));
  renderGrowth();

  const earnedBadges = [];
  if (totalCorrectAnswers >= 20) {
    earnedBadges.push("enthusiastic_learner");
  }
  if (getLevelForXP(totalXP) >= 3) {
    earnedBadges.push("master");
  }
  unlockBadges(earnedBadges);
}

function saveStudyHistory() {
  const history = getStoredArray(HISTORY_STORAGE_KEY);
  history.push({
    score: currentScore,
    correct: currentRoundCorrect,
    xp: currentRoundXP,
    completedAt: new Date().toISOString()
  });
  safeSetItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(-5)));
}

// 切换界面语言并保存选择；输入语言代码，更新页面文字和按钮状态，无返回值。
function switchLanguage(lang) {
  if (!Object.prototype.hasOwnProperty.call(translations, lang)) {
    console.warn(`不支持的界面语言：${lang}`);
    return;
  }

  currentLanguage = lang;
  currentLang = lang;

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

  safeSetItem(LANGUAGE_STORAGE_KEY, lang);
  renderVocabulary();
  document.querySelector("#speech-status").textContent = "";
  updateCurrentQuestionLanguage();
  updateDynamicLabels();
  updateVisibleAchievementToasts();
  renderAchievementShelf();
  renderAvatarEditors();
}

// 按当前学习日渲染词语表。
function renderVocabulary() {
  const vocabularyListElement = document.querySelector("#vocabulary-list");
  if (!vocabularyListElement) {
    return;
  }

  const totalDays = Math.ceil(vocabularyList.length / DAILY_WORD_COUNT);
  currentStudyDay = Math.min(Math.max(currentStudyDay, 1), totalDays);
  renderStudyDayNavigation(totalDays);
  vocabularyListElement.replaceChildren();

  const startIndex = (currentStudyDay - 1) * DAILY_WORD_COUNT;
  const dailyVocabulary = vocabularyList.slice(startIndex, startIndex + DAILY_WORD_COUNT);

  dailyVocabulary.forEach((term) => {
    const row = document.createElement("tr");
    row.dataset.searchText =
      `${term.term} ${term.korean} ${term.term_en} ${term.description}`
        .toLocaleLowerCase();

    const chineseCell = document.createElement("td");
    const koreanCell = document.createElement("td");
    const englishCell = document.createElement("td");
    const difficultyCell = document.createElement("td");
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
    englishDescription.textContent = term.explanation[currentLang];
    englishCell.append(englishTerm, englishDescription);

    const difficultyBadge = createDifficultyBadge(term.difficulty);
    if (difficultyBadge) {
      difficultyCell.append(difficultyBadge);
    }

    row.append(chineseCell, koreanCell, englishCell, difficultyCell);
    vocabularyListElement.append(row);
  });

  applyVocabularySearch();
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

function handleStudyDayNavigation(event) {
  if (isStudyDayTransitioning) {
    return;
  }

  const button = event.target.closest("[data-study-direction]");
  if (!button || button.disabled) {
    return;
  }

  const direction = button.dataset.studyDirection === "next" ? 1 : -1;
  const totalDays = Math.ceil(vocabularyList.length / DAILY_WORD_COUNT);
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
  const totalDays = Math.ceil(vocabularyList.length / DAILY_WORD_COUNT);
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

function getDifficultyLevel(difficulty) {
  const normalizedDifficulty = typeof difficulty === "string"
    ? difficulty.trim().toLocaleLowerCase()
    : "";

  if (
    normalizedDifficulty === "简单"
    || normalizedDifficulty === "simple"
    || normalizedDifficulty === "easy"
  ) {
    return "easy";
  }
  if (
    normalizedDifficulty === "普通"
    || normalizedDifficulty === "normal"
    || normalizedDifficulty === "medium"
  ) {
    return "medium";
  }
  if (normalizedDifficulty === "困难" || normalizedDifficulty === "hard") {
    return "hard";
  }

  return null;
}

function createDifficultyBadge(difficulty) {
  const difficultyLevel = getDifficultyLevel(difficulty);
  if (!difficultyLevel) {
    return null;
  }

  const vocabularyText = translations[currentLanguage].vocabulary;
  const badge = document.createElement("span");
  badge.className = `badge difficulty-badge difficulty-badge--${difficultyLevel}`;
  badge.textContent = vocabularyText.difficultyLabels[difficultyLevel];
  badge.setAttribute(
    "aria-label",
    `${vocabularyText.difficulty}: ${badge.textContent}`
  );
  return badge;
}

function updateQuestionDifficulty(difficulty) {
  const difficultyContainer = document.querySelector("#question-difficulty");
  if (!difficultyContainer) {
    return;
  }

  const badge = createDifficultyBadge(difficulty);
  difficultyContainer.replaceChildren();
  difficultyContainer.hidden = !badge;
  if (badge) {
    difficultyContainer.append(badge);
  }
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

// 按难度过滤题库并抽取一轮题目，同时校验题库结构和题目 ID。
function getRandomQuestions(difficulty) {
  const difficultyLevel = getDifficultyLevel(difficulty);
  if (!difficultyLevel) {
    throw new Error(translations[currentLanguage].game.invalidDifficulty);
  }

  const allQuestions = Array.isArray(wordList) ? [...wordList] : [];
  const questionIds = allQuestions.map((word) =>
    Number.isInteger(word.id) ? word.id : wordList.indexOf(word) + 1
  );

  if (
    allQuestions.length !== TOTAL_QUESTIONS
    || new Set(questionIds).size !== TOTAL_QUESTIONS
  ) {
    throw new Error(`题库格式有误：必须包含 ${TOTAL_QUESTIONS} 道 ID 唯一的题目。`);
  }

  const shuffledQuestions = allQuestions.filter(
    (word) => getDifficultyLevel(word.difficulty) === difficultyLevel
  );
  if (shuffledQuestions.length < QUESTIONS_PER_ROUND) {
    const gameText = translations[currentLanguage].game;
    const difficultyLabel =
      translations[currentLanguage].vocabulary.difficultyLabels[difficultyLevel];
    const errorMessage = gameText.notEnoughDifficultyQuestions
      .replace("{difficulty}", difficultyLabel)
      .replace("{count}", String(shuffledQuestions.length))
      .replace("{required}", String(QUESTIONS_PER_ROUND));
    throw new Error(errorMessage);
  }

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledQuestions[index], shuffledQuestions[randomIndex]] =
      [shuffledQuestions[randomIndex], shuffledQuestions[index]];
  }

  const selectedQuestions = shuffledQuestions.slice(0, QUESTIONS_PER_ROUND).map((word) => {
    if (word.question) {
      if (
        !Array.isArray(word.options)
        || word.options.length !== 4
        || !Number.isInteger(word.answer)
        || word.answer < 0
        || word.answer >= word.options.length
      ) {
        return word;
      }

      const distractors = shuffledQuestions
        .filter((candidate) => candidate.term !== word.term)
        .slice(0, word.options.length - 1)
        .map((candidate) => ({
          zh: candidate.term,
          ko: candidate.korean,
          en: candidate.term_en
        }));
      let distractorIndex = 0;
      return {
        ...word,
        options: word.options.map((option, optionIndex) =>
          optionIndex === word.answer ? option : distractors[distractorIndex++]
        )
      };
    }

    const wordIndex = vocabularyList.indexOf(word);
    const answer = wordIndex % 4;
    const distractors = shuffledQuestions.filter((candidate) => candidate.term !== word.term);
    let distractorIndex = 0;
    const options = Array.from({ length: 4 }, (_, optionIndex) => {
      const optionTerm = optionIndex === answer
        ? word
        : distractors[(wordIndex + distractorIndex++) % distractors.length];

      return {
        zh: optionTerm.term,
        ko: optionTerm.korean,
        en: optionTerm.term_en
      };
    });

    return {
      id: questionCount + wordIndex + 1,
      term: word.term,
      korean: word.korean,
      term_en: word.term_en,
      difficulty: word.difficulty,
      description: word.description,
      explanation: word.explanation,
      question: {
        zh: `以下描述对应哪个术语？${word.description}`,
        ko: `다음 설명에 해당하는 용어는 무엇인가요? ${word.explanation.ko}`,
        en: `Which term matches this description? ${word.explanation.en}`
      },
      options,
      answer
    };
  });
  const hasInvalidQuestion = selectedQuestions.some((question) =>
    typeof question.term !== "string"
      || typeof question.korean !== "string"
      || typeof question.term_en !== "string"
      || typeof question.description !== "string"
      || !hasAllTranslations(question.explanation)
      || !hasAllTranslations(question.question)
      || !Array.isArray(question.options)
      || question.options.length !== 4
      || !question.options.every(hasAllTranslations)
      || !Number.isInteger(question.answer)
      || question.answer < 0
      || question.answer >= question.options.length
  );

  if (hasInvalidQuestion) {
    throw new Error("题库格式有误：每题需要中韩英解释、题干、4 组选项翻译和有效的正确答案下标。");
  }

  return selectedQuestions;
}

// 根据当前题号更新题目、四个选项和进度；无输入，更新答题页面。
function renderQuestion() {
  const question = currentQuiz[currentQuestionIndex];
  if (!question) {
    throw new Error("无法显示当前题目：题目列表中不存在该题。");
  }

  const questionHeading = document.querySelector(".question-card h3");
  const questionLabel = document.querySelector(".question-label");
  const optionsContainer = document.querySelector(".options");
  const progressTrack = document.querySelector(".progress-track");

  questionHeading.textContent = question.question[currentLanguage];
  questionLabel.textContent = translations[currentLanguage].quiz.questionExample;
  updateQuestionDifficulty(question.difficulty);
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
  const question = currentQuiz[currentQuestionIndex];
  if (!question) {
    return;
  }

  document.querySelector(".question-card h3").textContent =
    question.question[currentLanguage];
  updateQuestionDifficulty(question.difficulty);

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
  recordLearningProgress(isCorrect);
  return isCorrect;
}

// 处理选项点击；输入为点击事件，判断答案、计分并安排下一题，无返回值。
function handleAnswerClick(event) {
  if (isAnswerLocked) {
    return;
  }

  const selectedButton = event.currentTarget;
  const question = currentQuiz[currentQuestionIndex];
  const isCorrect = checkAnswer(selectedButton.dataset.answerIndex, question);
  combo = isCorrect ? combo + 1 : 0;
  renderComboDisplay(true);
  if (combo === 3) {
    unlockBadges(["bronze_scholar"]);
  } else if (combo === 10) {
    unlockBadges(["gold_champion"]);
  }
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
  const savedValue = safeGetItem(HIGH_SCORE_STORAGE_KEY);
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
    safeSetItem(HIGH_SCORE_STORAGE_KEY, String(score));
    return score;
  }
  return highScore;
}

// 完成本轮后将新纪录写入 Local Storage 并显示成绩页面；无输入与返回值。
function showScore() {
  saveHighScoreIfNeeded(currentScore);
  saveStudyHistory();
  unlockBadges(["first_round"]);
  document.querySelector(".result-score").firstChild.nodeValue = String(currentScore);
  document.querySelector(".result-note").lastChild.nodeValue = `: ${getHighScore()}`;
  currentQuiz = [];
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

  renderComboDisplay();

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
  renderGrowth();
}

function renderComboDisplay(animate = false) {
  const display = document.querySelector("#combo-display");
  const message = document.querySelector("#combo-message");
  if (!display || !message) {
    return;
  }

  const quizText = translations[currentLanguage].quiz;
  const isComboActive = combo >= 3;
  const template = isComboActive ? quizText.comboActive : `${quizText.comboLabel} ×${combo}`;
  message.textContent = isComboActive
    ? template.replace("{count}", String(combo))
    : template;
  display.setAttribute("aria-label", message.textContent);
  display.classList.toggle("is-active", isComboActive);
  display.classList.remove("is-triggered");

  if (animate && isComboActive) {
    window.requestAnimationFrame(() => {
      if (combo >= 3 && display.isConnected) {
        display.classList.add("is-triggered");
      }
    });
  }
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
  const pageIds = [
    "home",
    "difficulty-select",
    "avatar-page",
    "avatar-frame-page",
    "vocabulary-page",
    "quiz-page",
    "results"
  ];
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

  if (pageId === "quiz-page" && currentQuiz.length === 0) {
    showPage("difficulty-select", true);
    return;
  }

  showPage(pageId, true);
}

// 按选定难度开始新一轮；抽题失败时在难度选择页面显示错误。
function startGame(difficulty, animate = false) {
  if (isPageTransitioning) {
    return false;
  }

  let newRoundQuestions;
  try {
    newRoundQuestions = getRandomQuestions(difficulty);
  } catch (error) {
    document.querySelector("#difficulty-selection-error").textContent = error.message;
    return false;
  }

  if (advanceTimeoutId !== null) {
    window.clearTimeout(advanceTimeoutId);
    advanceTimeoutId = null;
  }

  currentQuiz = newRoundQuestions;
  currentScore = 0;
  currentQuestionIndex = 0;
  currentRoundXP = 0;
  currentRoundCorrect = 0;
  currentFeedbackKey = "";
  isAnswerLocked = false;
  showPage("quiz-page", animate);
  renderQuestion();
  return true;
}

function handleDifficultyOptionClick(event) {
  const option = event.target.closest("[data-quiz-difficulty]");
  if (!option) {
    return;
  }

  const difficultyLevel = getDifficultyLevel(option.dataset.quizDifficulty);
  if (!difficultyLevel) {
    return;
  }

  selectedDifficulty = option.dataset.quizDifficulty;
  document.querySelectorAll("[data-quiz-difficulty]").forEach((difficultyOption) => {
    const isSelected = difficultyOption === option;
    difficultyOption.classList.toggle("is-selected", isSelected);
    difficultyOption.setAttribute("aria-pressed", String(isSelected));
  });
  document.querySelector("#difficulty-selection-error").textContent = "";
}

// 响应语言按钮点击；输入点击事件，切换到按钮标注的语言，无返回值。
function handleLanguageButtonClick(event) {
  switchLanguage(event.currentTarget.dataset.lang);
}

// 使用难度选择页面当前选中的难度启动答题。
function handleStartButtonClick() {
  document.querySelector("#difficulty-selection-error").textContent = "";
  startGame(selectedDifficulty, true);
}

function handleReplayButtonClick() {
  showPage("difficulty-select", true);
}

// 初始化页面状态、最高分显示和按钮事件；无输入与返回值。
function initializeGame() {
  totalXP = getStoredInteger(XP_STORAGE_KEY);
  totalCorrectAnswers = getStoredInteger(TOTAL_CORRECT_STORAGE_KEY);
  initializeUserCenter();
  const rawHighScore = safeGetItem(HIGH_SCORE_STORAGE_KEY);
  console.log("读取到的原始数据：", rawHighScore);

  const currentHighScore = getHighScore();
  console.log("最终渲染用的最高分：", currentHighScore);

  showPage("home");

  document.querySelectorAll(".language-button").forEach((button) => {
    button.addEventListener("click", handleLanguageButtonClick);
  });

  document.querySelector("#user-center-open").addEventListener("click", handleUserCenterOpen);
  document.querySelector("#user-center-close").addEventListener("click", handleUserCenterClose);
  document.querySelector("#achievement-shelf-open").addEventListener(
    "click",
    handleAchievementShelfOpen
  );
  document.querySelector("#achievement-shelf-close").addEventListener(
    "click",
    handleAchievementShelfClose
  );
  document.querySelector("#user-center-dialog").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      handleUserCenterClose();
    }
  });
  document.querySelector("#achievement-shelf-dialog").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      handleAchievementShelfClose();
    }
  });
  document.querySelector("#change-user-avatar").addEventListener("click", () => {
    openProfileEditor("avatar-page");
  });
  document.querySelector("#change-user-frame").addEventListener("click", () => {
    openProfileEditor("avatar-frame-page");
  });
  document.querySelector("#avatar-page-file").addEventListener("change", handleAvatarFileChange);
  document.querySelector("#avatar-frame-grid").addEventListener(
    "click",
    handleAvatarFrameSelection
  );
  document.querySelector("#save-avatar-button").addEventListener("click", handleAvatarSave);
  document.querySelector("#save-avatar-frame-button").addEventListener(
    "click",
    handleAvatarFrameSave
  );
  document.querySelectorAll("[data-profile-editor-cancel]").forEach((button) => {
    button.addEventListener("click", handleProfileEditorCancel);
  });

  document.addEventListener("click", handlePageNavigation);
  document.querySelector("#vocabulary-search").addEventListener("input", applyVocabularySearch);
  document.querySelector("#vocabulary-list").addEventListener("click", handleVocabularySpeech);
  document.querySelector("#study-day-navigation").addEventListener("click", handleStudyDayNavigation);
  document.querySelector("#difficulty-options").addEventListener(
    "click",
    handleDifficultyOptionClick
  );
  document.querySelector("#start-quiz-button").addEventListener("click", handleStartButtonClick);
  document.querySelector('[data-i18n="button.replay"]').addEventListener(
    "click",
    handleReplayButtonClick
  );

  const savedLanguage = safeGetItem(LANGUAGE_STORAGE_KEY);
  switchLanguage(savedLanguage && translations[savedLanguage] ? savedLanguage : "zh");
  renderHighScore(currentHighScore);
}

initializeGame();
