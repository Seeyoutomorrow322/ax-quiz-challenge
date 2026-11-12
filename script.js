// 游戏状态：记录当前分数、题号和本轮抽中的题目。
let currentScore = 0; // 当前累计分数
let currentQuestionIndex = 0; // 当前题目在本轮中的位置
const TOTAL_QUESTIONS = 50;
const QUESTIONS_PER_ROUND = 10; // 每轮计划抽取的题目数量
const POINTS_PER_QUESTION = 10; // 每题答对可得分数
const MAX_SCORE = QUESTIONS_PER_ROUND * POINTS_PER_QUESTION;
const HIGH_SCORE_STORAGE_KEY = "axQuizHighScore";
const DAILY_WORD_COUNT = 10;
let currentLanguage = "zh";
let currentLang = "zh";
let currentQuiz = [];
let isAnswerLocked = false;
let currentFeedbackKey = "";
let advanceTimeoutId = null;
let isPageTransitioning = false;
let currentStudyDay = 1;
let isStudyDayTransitioning = false;

const vocabularyList = [
  {
    term: "强化学习", korean: "강화 학습", term_en: "Reinforcement Learning",
    description: "智能体通过与环境交互，并依据奖励或惩罚信号来学习行动策略的方法。",
    explanation: {
      zh: "智能体通过与环境交互，并依据奖励或惩罚信号来学习行动策略的方法。",
      ko: "강화 학습은 에이전트가 환경과 상호작용하며 보상이나 벌점 신호를 바탕으로 행동 전략을 학습하는 방법입니다.",
      en: "A method in which an agent learns a policy by interacting with an environment and using reward or penalty signals."
    }
  },
  {
    term: "监督学习", korean: "지도 학습", term_en: "Supervised Learning",
    description: "使用带有正确答案标签的数据训练模型，使其学习输入与目标输出之间关系的方法。",
    explanation: {
      zh: "使用带有正确答案标签的数据训练模型，使其学习输入与目标输出之间关系的方法。",
      ko: "정답 레이블이 있는 데이터로 모델을 학습시켜 입력과 목표 출력 사이의 관계를 익히게 하는 방법입니다.",
      en: "A method that trains a model on labeled data to learn the relationship between inputs and target outputs."
    }
  },
  {
    term: "无监督学习", korean: "비지도 학습", term_en: "Unsupervised Learning",
    description: "使用没有预先标注结果的数据，发现数据中的结构、类别或规律的方法。",
    explanation: {
      zh: "使用没有预先标注结果的数据，发现数据中的结构、类别或规律的方法。",
      ko: "미리 레이블이 지정되지 않은 데이터에서 구조, 군집 또는 패턴을 찾아내는 방법입니다.",
      en: "A method for discovering structures, clusters, or patterns in data without predefined labels."
    }
  },
  {
    term: "半监督学习", korean: "준지도 학습", term_en: "Semi-supervised Learning",
    description: "结合少量带标签数据和大量未标注数据训练模型的方法。",
    explanation: {
      zh: "结合少量带标签数据和大量未标注数据训练模型的方法。",
      ko: "소량의 레이블 데이터와 다량의 레이블 없는 데이터를 함께 사용해 모델을 학습하는 방법입니다.",
      en: "A method that trains a model using a small amount of labeled data together with a large amount of unlabeled data."
    }
  },
  {
    term: "迁移学习", korean: "전이 학습", term_en: "Transfer Learning",
    description: "将模型在一个任务或数据集上学到的知识迁移到相关新任务中的方法。",
    explanation: {
      zh: "将模型在一个任务或数据集上学到的知识迁移到相关新任务中的方法。",
      ko: "한 작업이나 데이터셋에서 모델이 학습한 지식을 관련된 새로운 작업에 적용하는 방법입니다.",
      en: "A method that transfers knowledge a model learned on one task or dataset to a related new task."
    }
  },
  {
    term: "联邦学习", korean: "연합 학습", term_en: "Federated Learning",
    description: "在数据保留于本地设备或机构的情况下协同训练模型的方法。",
    explanation: {
      zh: "在数据保留于本地设备或机构的情况下协同训练模型的方法。",
      ko: "데이터를 각 기기나 기관에 보관한 채 여러 참여자가 협력해 모델을 학습하는 방법입니다.",
      en: "A method for collaboratively training a model while keeping data on its local devices or institutions."
    }
  },
  {
    term: "特征工程", korean: "특성 공학", term_en: "Feature Engineering",
    description: "从原始数据中选择、转换或构造适合模型使用的特征的过程。",
    explanation: {
      zh: "从原始数据中选择、转换或构造适合模型使用的特征的过程。",
      ko: "원시 데이터에서 모델에 적합한 특성을 선택하거나 변환하고 새로 구성하는 과정입니다.",
      en: "The process of selecting, transforming, or creating features from raw data for use by a model."
    }
  },
  {
    term: "训练集", korean: "훈련 데이터셋", term_en: "Training Set",
    description: "用于训练模型并调整模型参数的数据集合。",
    explanation: {
      zh: "用于训练模型并调整模型参数的数据集合。",
      ko: "모델을 학습시키고 매개변수를 조정하는 데 사용하는 데이터 집합입니다.",
      en: "The dataset used to train a model and adjust its parameters."
    }
  },
  {
    term: "验证集", korean: "검증 데이터셋", term_en: "Validation Set",
    description: "用于评估训练过程、选择模型或调整超参数的数据集合。",
    explanation: {
      zh: "用于评估训练过程、选择模型或调整超参数的数据集合。",
      ko: "학습 과정을 평가하고 모델을 선택하거나 하이퍼파라미터를 조정하는 데 사용하는 데이터 집합입니다.",
      en: "The dataset used to evaluate training, select a model, or tune its hyperparameters."
    }
  },
  {
    term: "测试集", korean: "테스트 데이터셋", term_en: "Test Set",
    description: "用于在训练完成后评估模型对未见数据的泛化表现的数据集合。",
    explanation: {
      zh: "用于在训练完成后评估模型对未见数据的泛化表现的数据集合。",
      ko: "학습이 끝난 뒤 모델이 처음 보는 데이터에 얼마나 잘 일반화되는지 평가하는 데이터 집합입니다.",
      en: "The dataset used after training to evaluate how well a model generalizes to unseen data."
    }
  },
  {
    term: "过拟合", korean: "과적합", term_en: "Overfitting",
    description: "模型过度适应训练数据中的细节或噪声，导致对新数据表现变差的现象。",
    explanation: {
      zh: "模型过度适应训练数据中的细节或噪声，导致对新数据表现变差的现象。",
      ko: "모델이 훈련 데이터의 세부 사항이나 잡음에 지나치게 맞춰져 새로운 데이터에서 성능이 떨어지는 현상입니다.",
      en: "A phenomenon in which a model fits details or noise in the training data too closely and performs poorly on new data."
    }
  },
  {
    term: "欠拟合", korean: "과소적합", term_en: "Underfitting",
    description: "模型复杂度或训练不足以捕捉数据中的主要规律，导致训练和测试表现都较差的现象。",
    explanation: {
      zh: "模型复杂度或训练不足以捕捉数据中的主要规律，导致训练和测试表现都较差的现象。",
      ko: "모델의 복잡도가 낮거나 학습이 부족해 데이터의 주요 패턴을 포착하지 못하고 훈련 및 테스트 성능이 모두 낮은 현상입니다.",
      en: "A phenomenon in which a model is too simple or insufficiently trained to capture key patterns, resulting in poor training and test performance."
    }
  },
  {
    term: "梯度下降", korean: "경사 하강법", term_en: "Gradient Descent",
    description: "通过沿着损失函数梯度的反方向更新参数，以逐步降低模型误差的优化方法。",
    explanation: {
      zh: "通过沿着损失函数梯度的反方向更新参数，以逐步降低模型误差的优化方法。",
      ko: "손실 함수의 기울기와 반대 방향으로 매개변수를 갱신해 모델의 오차를 줄이는 최적화 방법입니다.",
      en: "An optimization method that updates parameters in the direction opposite to the loss gradient to reduce model error."
    }
  },
  {
    term: "反向传播", korean: "역전파", term_en: "Backpropagation",
    description: "在神经网络中将误差信号从输出层向前传递，用于计算各参数梯度的算法。",
    explanation: {
      zh: "在神经网络中将误差信号从输出层向前传递，用于计算各参数梯度的算法。",
      ko: "신경망에서 오차 신호를 출력층에서 이전 층으로 전파해 각 매개변수의 기울기를 계산하는 알고리즘입니다.",
      en: "An algorithm that propagates error signals backward through a neural network to calculate gradients for its parameters."
    }
  },
  {
    term: "损失函数", korean: "손실 함수", term_en: "Loss Function",
    description: "衡量模型预测结果与目标结果之间差异的函数，通常用于指导模型训练。",
    explanation: {
      zh: "衡量模型预测结果与目标结果之间差异的函数，通常用于指导模型训练。",
      ko: "모델의 예측값과 실제 목표값 사이의 차이를 측정하고 학습을 이끄는 함수입니다.",
      en: "A function that measures the difference between a model's predictions and target values, typically guiding training."
    }
  },
  {
    term: "优化器", korean: "최적화 알고리즘", term_en: "Optimizer",
    description: "根据梯度更新模型参数，以减少损失函数值的算法或训练组件。",
    explanation: {
      zh: "根据梯度更新模型参数，以减少损失函数值的算法或训练组件。",
      ko: "기울기를 바탕으로 모델 매개변수를 갱신해 손실 함수 값을 줄이는 알고리즘 또는 학습 구성 요소입니다.",
      en: "An algorithm or training component that updates model parameters based on gradients to reduce the loss."
    }
  },
  {
    term: "卷积神经网络", korean: "합성곱 신경망", term_en: "Convolutional Neural Network (CNN)",
    description: "使用卷积运算提取局部特征，常用于图像识别和视觉任务的神经网络。",
    explanation: {
      zh: "使用卷积运算提取局部特征，常用于图像识别和视觉任务的神经网络。",
      ko: "합성곱 연산으로 지역적 특징을 추출하며 이미지 인식과 컴퓨터 비전 작업에 주로 쓰이는 신경망입니다.",
      en: "A neural network that uses convolutions to extract local features, commonly for image recognition and vision tasks."
    }
  },
  {
    term: "循环神经网络", korean: "순환 신경망", term_en: "Recurrent Neural Network (RNN)",
    description: "通过循环结构处理序列信息，适用于文本、语音等时序数据的神经网络。",
    explanation: {
      zh: "通过循环结构处理序列信息，适用于文本、语音等时序数据的神经网络。",
      ko: "순환 구조로 시퀀스 정보를 처리하며 텍스트나 음성과 같은 순차 데이터에 적합한 신경망입니다.",
      en: "A neural network that processes sequence information through recurrent connections, suited to text, speech, and other sequential data."
    }
  },
  {
    term: "Transformer", korean: "트랜스포머", term_en: "Transformer",
    description: "以注意力机制为核心的神经网络架构，广泛用于自然语言处理和多模态任务。",
    explanation: {
      zh: "以注意力机制为核心的神经网络架构，广泛用于自然语言处理和多模态任务。",
      ko: "어텐션 메커니즘을 핵심으로 하는 신경망 아키텍처로, 자연어 처리와 멀티모달 작업에 널리 사용됩니다.",
      en: "A neural network architecture centered on attention mechanisms and widely used in natural language processing and multimodal tasks."
    }
  },
  {
    term: "注意力机制", korean: "어텐션 메커니즘", term_en: "Attention Mechanism",
    description: "让模型根据当前任务需要，为输入中的不同部分分配不同关注权重的机制。",
    explanation: {
      zh: "让模型根据当前任务需要，为输入中的不同部分分配不同关注权重的机制。",
      ko: "현재 작업의 필요에 따라 입력의 각 부분에 서로 다른 중요도나 가중치를 부여하는 메커니즘입니다.",
      en: "A mechanism that assigns different importance or weights to parts of an input based on the task."
    }
  },
  {
    term: "分词", korean: "토큰화", term_en: "Tokenization",
    description: "将文本拆分为词、子词或其他基本单元，供语言模型处理的过程。",
    explanation: {
      zh: "将文本拆分为词、子词或其他基本单元，供语言模型处理的过程。",
      ko: "언어 모델이 처리할 수 있도록 텍스트를 단어, 하위 단어 또는 다른 기본 단위로 나누는 과정입니다.",
      en: "The process of splitting text into words, subwords, or other basic units for a language model to process."
    }
  },
  {
    term: "词嵌入", korean: "단어 임베딩", term_en: "Word Embedding",
    description: "将词语表示为数值向量，使模型能够处理词语及其语义关系的方法。",
    explanation: {
      zh: "将词语表示为数值向量，使模型能够处理词语及其语义关系的方法。",
      ko: "단어를 수치 벡터로 표현해 모델이 단어와 그 의미적 관계를 처리할 수 있게 하는 방법입니다.",
      en: "A method of representing words as numeric vectors so a model can process them and their semantic relationships."
    }
  },
  {
    term: "向量数据库", korean: "벡터 데이터베이스", term_en: "Vector Database",
    description: "用于存储向量并按相似度进行检索的数据库，常用于语义搜索和检索增强生成。",
    explanation: {
      zh: "用于存储向量并按相似度进行检索的数据库，常用于语义搜索和检索增强生成。",
      ko: "벡터를 저장하고 유사도를 기준으로 검색하는 데이터베이스로, 시맨틱 검색과 검색 증강 생성에 자주 사용됩니다.",
      en: "A database that stores vectors and retrieves them by similarity, often used for semantic search and retrieval-augmented generation."
    }
  },
  {
    term: "微调", korean: "파인 튜닝", term_en: "Fine-tuning",
    description: "在预训练模型基础上使用特定任务或领域的数据继续训练，以适配新用途的过程。",
    explanation: {
      zh: "在预训练模型基础上使用特定任务或领域的数据继续训练，以适配新用途的过程。",
      ko: "사전 학습된 모델을 특정 작업이나 분야의 데이터로 추가 학습해 새로운 용도에 맞추는 과정입니다.",
      en: "The process of further training a pretrained model on task- or domain-specific data to adapt it to a new use."
    }
  },
  {
    term: "量化", korean: "양자화", term_en: "Quantization",
    description: "使用较低精度表示模型参数或计算结果，以减少模型占用空间和推理成本的技术。",
    explanation: {
      zh: "使用较低精度表示模型参数或计算结果，以减少模型占用空间和推理成本的技术。",
      ko: "모델 매개변수나 계산 결과를 낮은 정밀도로 표현해 모델 크기와 추론 비용을 줄이는 기술입니다.",
      en: "A technique that uses lower-precision representations of model parameters or computations to reduce model size and inference cost."
    }
  },
  {
    term: "知识蒸馏", korean: "지식 증류", term_en: "Knowledge Distillation",
    description: "将较大教师模型学到的知识迁移到较小学生模型中的模型压缩方法。",
    explanation: {
      zh: "将较大教师模型学到的知识迁移到较小学生模型中的模型压缩方法。",
      ko: "큰 교사 모델이 학습한 지식을 더 작은 학생 모델로 전달하는 모델 압축 방법입니다.",
      en: "A model compression method that transfers knowledge from a larger teacher model to a smaller student model."
    }
  },
  {
    term: "上下文窗口", korean: "컨텍스트 윈도우", term_en: "Context Window",
    description: "语言模型在一次处理或生成过程中能够参考的输入信息范围。",
    explanation: {
      zh: "语言模型在一次处理或生成过程中能够参考的输入信息范围。",
      ko: "언어 모델이 한 번의 처리나 생성 과정에서 참고할 수 있는 입력 정보의 범위입니다.",
      en: "The range of input information a language model can consider in a single processing or generation step."
    }
  },
  {
    term: "模型推理", korean: "모델 추론", term_en: "Model Inference",
    description: "使用已训练模型对新输入执行预测、分类或内容生成的过程。",
    explanation: {
      zh: "使用已训练模型对新输入执行预测、分类或内容生成的过程。",
      ko: "학습이 완료된 모델에 새로운 입력을 넣어 예측, 분류 또는 콘텐츠 생성을 수행하는 과정입니다.",
      en: "The process of using a trained model to make predictions, classify inputs, or generate content."
    }
  },
  {
    term: "AI 幻觉", korean: "AI 환각", term_en: "AI Hallucination",
    description: "生成式模型产生看似合理、但与事实不符或缺乏依据内容的现象。",
    explanation: {
      zh: "生成式模型产生看似合理、但与事实不符或缺乏依据内容的现象。",
      ko: "생성형 모델이 그럴듯해 보이지만 사실과 다르거나 근거가 부족한 내용을 만들어 내는 현상입니다.",
      en: "A phenomenon in which a generative model produces plausible-sounding content that is false or unsupported."
    }
  },
  {
    term: "系统提示词", korean: "시스템 프롬프트", term_en: "System Prompt",
    description: "用于设定 AI 助手角色、行为规则和回答约束的初始指令。",
    explanation: {
      zh: "用于设定 AI 助手角色、行为规则和回答约束的初始指令。",
      ko: "AI 어시스턴트의 역할과 행동 규칙, 응답 제약을 설정하는 초기 지시문입니다.",
      en: "An initial instruction that defines an AI assistant's role, behavior, and response constraints."
    }
  },
  {
    term: "超文本标记语言", korean: "하이퍼텍스트 마크업 언어", term_en: "HyperText Markup Language (HTML)",
    description: "用于描述网页结构和内容的标记语言。",
    explanation: {
      zh: "用于描述网页结构和内容的标记语言。",
      ko: "웹 페이지의 구조와 콘텐츠를 표현하는 데 사용하는 마크업 언어입니다.",
      en: "A markup language used to describe the structure and content of web pages."
    }
  },
  {
    term: "层叠样式表", korean: "캐스케이딩 스타일 시트", term_en: "Cascading Style Sheets (CSS)",
    description: "用于控制网页布局、颜色、字体和响应式显示效果的样式语言。",
    explanation: {
      zh: "用于控制网页布局、颜色、字体和响应式显示效果的样式语言。",
      ko: "웹 페이지의 레이아웃, 색상, 글꼴 및 반응형 표시를 제어하는 스타일 언어입니다.",
      en: "A style language used to control web page layouts, colors, fonts, and responsive presentation."
    }
  },
  {
    term: "JavaScript", korean: "자바스크립트", term_en: "JavaScript",
    description: "常用于实现网页交互、动态内容和服务端应用的编程语言。",
    explanation: {
      zh: "常用于实现网页交互、动态内容和服务端应用的编程语言。",
      ko: "웹 상호작용과 동적 콘텐츠, 서버 애플리케이션을 구현하는 데 널리 쓰이는 프로그래밍 언어입니다.",
      en: "A programming language commonly used to build web interactions, dynamic content, and server-side applications."
    }
  },
  {
    term: "文档对象模型", korean: "문서 객체 모델", term_en: "Document Object Model (DOM)",
    description: "浏览器将 HTML 文档表示为可由脚本读取和修改的节点树结构。",
    explanation: {
      zh: "浏览器将 HTML 文档表示为可由脚本读取和修改的节点树结构。",
      ko: "브라우저가 HTML 문서를 스크립트로 읽고 수정할 수 있는 노드 트리로 표현한 구조입니다.",
      en: "A tree representation of an HTML document that scripts can read and modify in the browser."
    }
  },
  {
    term: "响应式网页设计", korean: "반응형 웹 디자인", term_en: "Responsive Web Design",
    description: "使网页布局能够根据屏幕尺寸和设备特征自动适配的设计方法。",
    explanation: {
      zh: "使网页布局能够根据屏幕尺寸和设备特征自动适配的设计方法。",
      ko: "화면 크기와 기기 특성에 맞춰 웹 페이지 레이아웃이 자동으로 조정되도록 하는 디자인 방식입니다.",
      en: "A design approach that adapts a web page's layout to screen sizes and device characteristics."
    }
  },
  {
    term: "单页应用", korean: "싱글 페이지 애플리케이션", term_en: "Single-Page Application (SPA)",
    description: "主要通过客户端动态更新页面内容，减少整页重新加载的 Web 应用。",
    explanation: {
      zh: "主要通过客户端动态更新页面内容，减少整页重新加载的 Web 应用。",
      ko: "클라이언트에서 페이지 콘텐츠를 동적으로 갱신해 전체 페이지를 다시 불러오는 일을 줄이는 웹 애플리케이션입니다.",
      en: "A web application that updates content dynamically on the client to minimize full-page reloads."
    }
  },
  {
    term: "服务端渲染", korean: "서버 사이드 렌더링", term_en: "Server-Side Rendering (SSR)",
    description: "由服务器生成网页 HTML 后发送给浏览器的渲染方式。",
    explanation: {
      zh: "由服务器生成网页 HTML 后发送给浏览器的渲染方式。",
      ko: "서버가 웹 페이지의 HTML을 생성한 뒤 브라우저로 전송하는 렌더링 방식입니다.",
      en: "A rendering approach in which the server generates a web page's HTML and sends it to the browser."
    }
  },
  {
    term: "Node.js", korean: "노드.js", term_en: "Node.js",
    description: "基于 V8 引擎的 JavaScript 运行环境，可用于构建服务端和命令行应用。",
    explanation: {
      zh: "基于 V8 引擎的 JavaScript 运行环境，可用于构建服务端和命令行应用。",
      ko: "V8 엔진을 기반으로 하며 서버 및 명령줄 애플리케이션을 구축하는 데 사용할 수 있는 JavaScript 런타임입니다.",
      en: "A JavaScript runtime built on the V8 engine that can be used to build server-side and command-line applications."
    }
  },
  {
    term: "微服务", korean: "마이크로서비스", term_en: "Microservices",
    description: "将应用拆分为多个可独立开发、部署和扩展的小型服务的架构风格。",
    explanation: {
      zh: "将应用拆分为多个可独立开发、部署和扩展的小型服务的架构风格。",
      ko: "애플리케이션을 독립적으로 개발, 배포, 확장할 수 있는 여러 개의 작은 서비스로 나누는 아키텍처 방식입니다.",
      en: "An architectural style that splits an application into small services that can be developed, deployed, and scaled independently."
    }
  },
  {
    term: "REST API", korean: "REST API", term_en: "REST API",
    description: "遵循 REST 架构约束，通常通过 HTTP 资源和方法提供服务接口的设计方式。",
    explanation: {
      zh: "遵循 REST 架构约束，通常通过 HTTP 资源和方法提供服务接口的设计方式。",
      ko: "REST 아키텍처 제약을 따르며 일반적으로 HTTP 리소스와 메서드로 서비스 인터페이스를 제공하는 설계 방식입니다.",
      en: "An API design that follows REST constraints and typically exposes services through HTTP resources and methods."
    }
  },
  {
    term: "GraphQL", korean: "그래프QL", term_en: "GraphQL",
    description: "一种 API 查询语言和运行时，客户端可声明所需的数据字段。",
    explanation: {
      zh: "一种 API 查询语言和运行时，客户端可声明所需的数据字段。",
      ko: "클라이언트가 필요한 데이터 필드를 지정할 수 있는 API 쿼리 언어이자 실행 환경입니다.",
      en: "An API query language and runtime that lets clients specify the data fields they need."
    }
  },
  {
    term: "结构化查询语言", korean: "구조화 질의 언어", term_en: "Structured Query Language (SQL)",
    description: "用于定义、查询和操作关系型数据库中数据的语言。",
    explanation: {
      zh: "用于定义、查询和操作关系型数据库中数据的语言。",
      ko: "관계형 데이터베이스의 데이터를 정의하고 조회하며 조작하는 데 사용하는 언어입니다.",
      en: "A language used to define, query, and manipulate data in relational databases."
    }
  },
  {
    term: "缓存", korean: "캐시", term_en: "Cache",
    description: "将常用数据暂存于更快的存储位置，以减少重复计算或访问延迟的技术。",
    explanation: {
      zh: "将常用数据暂存于更快的存储位置，以减少重复计算或访问延迟的技术。",
      ko: "자주 사용하는 데이터를 더 빠른 저장 공간에 임시 보관해 반복 계산이나 접근 지연을 줄이는 기술입니다.",
      en: "A technique that stores frequently used data in faster storage to reduce repeated computation or access latency."
    }
  },
  {
    term: "超文本传输协议", korean: "하이퍼텍스트 전송 프로토콜", term_en: "HyperText Transfer Protocol (HTTP)",
    description: "浏览器与 Web 服务器之间传输网页及相关资源时常用的应用层协议。",
    explanation: {
      zh: "浏览器与 Web 服务器之间传输网页及相关资源时常用的应用层协议。",
      ko: "브라우저와 웹 서버 간에 웹 페이지와 관련 리소스를 전송할 때 사용하는 애플리케이션 계층 프로토콜입니다.",
      en: "An application-layer protocol commonly used to transfer web pages and related resources between browsers and web servers."
    }
  },
  {
    term: "域名系统", korean: "도메인 네임 시스템", term_en: "Domain Name System (DNS)",
    description: "将域名解析为 IP 地址等网络信息的分布式命名系统。",
    explanation: {
      zh: "将域名解析为 IP 地址等网络信息的分布式命名系统。",
      ko: "도메인 이름을 IP 주소와 같은 네트워크 정보로 변환하는 분산형 이름 시스템입니다.",
      en: "A distributed naming system that resolves domain names to IP addresses and other network information."
    }
  },
  {
    term: "IP 地址", korean: "IP 주소", term_en: "IP Address",
    description: "用于标识 IP 网络中设备或网络接口的逻辑地址。",
    explanation: {
      zh: "用于标识 IP 网络中设备或网络接口的逻辑地址。",
      ko: "IP 네트워크에서 장치나 네트워크 인터페이스를 식별하는 논리적 주소입니다.",
      en: "A logical address used to identify a device or network interface on an IP network."
    }
  },
  {
    term: "传输控制协议", korean: "전송 제어 프로토콜", term_en: "Transmission Control Protocol (TCP)",
    description: "提供可靠、有序数据传输的传输层协议。",
    explanation: {
      zh: "提供可靠、有序数据传输的传输层协议。",
      ko: "신뢰성 있고 순서가 보장된 데이터 전송을 제공하는 전송 계층 프로토콜입니다.",
      en: "A transport-layer protocol that provides reliable, ordered data delivery."
    }
  },
  {
    term: "传输层安全协议", korean: "전송 계층 보안", term_en: "Transport Layer Security (TLS)",
    description: "用于保护网络通信机密性和完整性的加密协议，常用于 HTTPS。",
    explanation: {
      zh: "用于保护网络通信机密性和完整性的加密协议，常用于 HTTPS。",
      ko: "네트워크 통신의 기밀성과 무결성을 보호하는 암호화 프로토콜로, HTTPS에 주로 사용됩니다.",
      en: "A cryptographic protocol that protects the confidentiality and integrity of network communications, commonly used with HTTPS."
    }
  },
  {
    term: "负载均衡", korean: "로드 밸런싱", term_en: "Load Balancing",
    description: "将网络请求分配到多个服务器或资源，以提升可用性和处理能力的技术。",
    explanation: {
      zh: "将网络请求分配到多个服务器或资源，以提升可用性和处理能力的技术。",
      ko: "네트워크 요청을 여러 서버나 리소스에 분산해 가용성과 처리 용량을 높이는 기술입니다.",
      en: "A technique that distributes network requests across multiple servers or resources to improve availability and capacity."
    }
  },
  {
    term: "内容分发网络", korean: "콘텐츠 전송 네트워크", term_en: "Content Delivery Network (CDN)",
    description: "通过分布在多个位置的服务器缓存并交付内容，以降低访问延迟的网络服务。",
    explanation: {
      zh: "通过分布在多个位置的服务器缓存并交付内容，以降低访问延迟的网络服务。",
      ko: "여러 위치에 분산된 서버에 콘텐츠를 캐시하고 전달해 사용자 접근 지연을 줄이는 네트워크 서비스입니다.",
      en: "A network service that caches and delivers content from distributed servers to reduce access latency."
    }
  }
].map((term) => ({
  ...term,
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

  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  renderVocabulary();
  document.querySelector("#speech-status").textContent = "";
  updateCurrentQuestionLanguage();
  updateDynamicLabels();
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

    row.append(chineseCell, koreanCell, englishCell);
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
  const shuffledQuestions = Array.isArray(wordList) ? [...wordList] : [];
  const questionIds = shuffledQuestions.map((word) =>
    Number.isInteger(word.id) ? word.id : wordList.indexOf(word) + 1
  );

  if (
    shuffledQuestions.length !== TOTAL_QUESTIONS
    || new Set(questionIds).size !== TOTAL_QUESTIONS
  ) {
    throw new Error(`题库格式有误：必须包含 ${TOTAL_QUESTIONS} 道 ID 唯一的题目。`);
  }

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledQuestions[index], shuffledQuestions[randomIndex]] =
      [shuffledQuestions[randomIndex], shuffledQuestions[index]];
  }

  const selectedQuestions = shuffledQuestions.slice(0, QUESTIONS_PER_ROUND).map((word) => {
    if (word.question) {
      return word;
    }

    const wordIndex = vocabularyList.indexOf(word);
    const answer = wordIndex % 4;
    const distractors = vocabularyList.filter((candidate) => candidate.term !== word.term);
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
  const question = currentQuiz[currentQuestionIndex];
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

  if (pageId === "quiz-page" && currentQuiz.length === 0) {
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

  currentQuiz = newRoundQuestions;
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
  document.querySelector("#study-day-navigation").addEventListener("click", handleStudyDayNavigation);
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
