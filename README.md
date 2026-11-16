# AX Mission Game — AI·IT 术语闯关游戏

## 项目简介

一个使用中文、韩语和英语学习 AI·IT 术语的前端选择题闯关游戏。

## 功能特性

- **中·韩·英三语切换**：切换游戏界面语言、题目和选项语言。
- **随机抽题**：从 50 道题目中随机抽取 10 道组成一轮。
- **答题计分**：答对一题得 10 分，每轮满分 100 分，并提供答题反馈。
- **最高分保存**：将个人最高分保存在浏览器 LocalStorage 中。
- **词语库搜索**：浏览词语库并搜索中文、韩文或英文术语。
- **术语发音**：通过浏览器语音合成朗读韩文和英文术语；是否可用取决于浏览器支持。
- **手机适配**：页面包含 viewport 设置和小屏幕样式。

## 玩法说明

1. 在首页点击“开始答题”，或先打开词语库再点击“开始答题”。
2. 每题从四个选项中选择一个答案；选择后会显示答题反馈并自动进入下一题。
3. 每答对一题得 10 分，答错不得分。完成 10 题后显示本轮成绩。
4. 完成本轮后可以查看成绩并点击“再玩一次”开始新一轮。历史最高分保存在当前浏览器中。

## 技术栈

- HTML
- CSS（使用 Tailwind CSS 和 daisyUI 构建样式）
- JavaScript
- LocalStorage

## 本地运行方法

```bash
git clone https://github.com/Seeyoutomorrow322/ax-quiz-challenge.git
cd ax-quiz-challenge
```

克隆完成后，在浏览器中打开项目根目录的 `index.html` 即可运行游戏。

如果修改了 `app.css`，可安装依赖并重新生成 `style.css`：

```bash
npm install
npm run build:css
```

## GitHub Pages 部署说明

1. 将项目推送到 GitHub 仓库。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**。
4. 选择包含项目文件的分支，并将目录设为根目录（`/`），然后保存。
5. 等待 GitHub Pages 完成发布，再通过 Pages 页面显示的网址访问。

项目入口是根目录中的 `index.html`，所需的 JavaScript 和 CSS 文件也位于根目录。

## 项目结构

| 文件 | 作用 |
| --- | --- |
| `index.html` | 游戏页面结构、导航、词语库、答题区和成绩区。 |
| `questions.js` | 包含 20 道中·韩·英三语题目及其选项和答案。 |
| `script.js` | 游戏逻辑、界面翻译、随机抽题、计分、LocalStorage、词语库搜索和发音；并补充词语库术语以组成 50 道题。 |
| `app.css` | Tailwind CSS 输入文件及项目样式源文件。 |
| `style.css` | 页面加载的样式文件，由 `app.css` 构建生成。 |
| `package.json` | CSS 构建和监听脚本，以及 Tailwind CSS、daisyUI 开发依赖。 |
| `package-lock.json` | npm 依赖版本锁定文件。 |

---

# AX Mission Game — AI·IT 용어 퀴즈 게임

## 프로젝트 소개

중국어, 한국어, 영어로 AI·IT 용어를 학습하는 프런트엔드 객관식 퀴즈 게임입니다.

## 주요 기능

- **중·한·영 언어 전환**: 게임 UI, 질문 및 선택지 언어를 전환합니다.
- **무작위 문제 출제**: 50개 문제 중 10개를 무작위로 뽑아 한 라운드를 구성합니다.
- **점수 계산**: 정답 하나당 10점을 얻고, 라운드 최고 점수는 100점이며 답변 피드백을 제공합니다.
- **최고 점수 저장**: 개인 최고 점수를 브라우저 LocalStorage에 저장합니다.
- **용어집 검색**: 용어집을 살펴보고 중국어, 한국어 또는 영어 용어를 검색할 수 있습니다.
- **용어 발음**: 브라우저 음성 합성으로 한국어와 영어 용어를 읽습니다. 사용 가능 여부는 브라우저 지원에 따라 달라집니다.
- **모바일 대응**: viewport 설정과 작은 화면용 스타일이 포함되어 있습니다.

## 게임 방법

1. 홈 화면에서 “퀴즈 시작”을 누르거나, 용어집을 연 뒤 “퀴즈 시작”을 누릅니다.
2. 각 문제의 네 선택지 중 하나를 고릅니다. 선택 후 피드백이 표시되고 다음 문제로 자동 이동합니다.
3. 정답은 10점, 오답은 0점입니다. 10문제를 모두 풀면 라운드 점수가 표시됩니다.
4. 결과 화면에서 점수를 확인하고 “다시 하기”를 눌러 새 라운드를 시작할 수 있습니다. 최고 점수는 현재 브라우저에 저장됩니다.

## 기술 스택

- HTML
- CSS (Tailwind CSS 및 daisyUI로 스타일 구성)
- JavaScript
- LocalStorage

## 로컬 실행 방법

```bash
git clone https://github.com/Seeyoutomorrow322/ax-quiz-challenge.git
cd ax-quiz-challenge
```

복제한 프로젝트 루트의 `index.html`을 브라우저에서 열면 게임을 실행할 수 있습니다.

`app.css`를 수정한 경우 의존성을 설치하고 `style.css`를 다시 생성할 수 있습니다.

```bash
npm install
npm run build:css
```

## GitHub Pages 배포 방법

1. 프로젝트를 GitHub 저장소에 푸시합니다.
2. 저장소의 **Settings → Pages**를 엽니다.
3. **Build and deployment**에서 **Deploy from a branch**를 선택합니다.
4. 프로젝트 파일이 있는 브랜치와 루트 디렉터리(`/`)를 선택한 뒤 저장합니다.
5. GitHub Pages 배포가 완료될 때까지 기다린 후 Pages 화면에 표시된 주소로 접속합니다.

프로젝트 진입점은 루트 디렉터리의 `index.html`이며, JavaScript와 CSS 파일도 루트에 있습니다.

## 프로젝트 구조

| 파일 | 역할 |
| --- | --- |
| `index.html` | 게임 화면 구조, 내비게이션, 용어집, 퀴즈 및 결과 영역입니다. |
| `questions.js` | 중·한·영으로 작성된 문제 20개와 선택지 및 정답을 포함합니다. |
| `script.js` | 게임 로직, 언어 전환, 무작위 출제, 점수 계산, LocalStorage, 용어집 검색 및 발음을 담당하며, 용어집 용어를 추가해 총 50문제를 구성합니다. |
| `app.css` | Tailwind CSS 입력 파일이자 프로젝트 스타일 소스입니다. |
| `style.css` | `app.css`에서 빌드되어 페이지가 불러오는 스타일 파일입니다. |
| `package.json` | CSS 빌드 및 감시 스크립트와 Tailwind CSS, daisyUI 개발 의존성을 정의합니다. |
| `package-lock.json` | npm 의존성 버전을 고정합니다. |

---

# AX Mission Game — AI·IT Terminology Quiz

## Project Overview

A front-end multiple-choice quiz game for learning AI and IT terminology in Chinese, Korean, and English.

## Features

- **Chinese, Korean, and English switching** for the game interface, questions, and answer choices.
- **Random questions**: selects 10 questions from a pool of 50 for each round.
- **Scoring**: earns 10 points for each correct answer, up to 100 points per round, with answer feedback.
- **High-score persistence**: saves the personal best in the browser's LocalStorage.
- **Vocabulary search**: browse the vocabulary list and search Chinese, Korean, or English terms.
- **Term pronunciation**: uses browser speech synthesis for Korean and English terms, subject to browser support.
- **Mobile support**: includes a viewport setting and small-screen styles.

## How to Play

1. Click “Start Quiz” on the home page, or open the vocabulary page and click “Start Quiz”.
2. Choose one of the four options for each question. Feedback appears after selection, then the game advances automatically.
3. A correct answer earns 10 points; an incorrect answer earns 0. The score is shown after all 10 questions.
4. Review the result and click “Play Again” to start another round. The high score is saved in the current browser.

## Technology Stack

- HTML
- CSS (styled with Tailwind CSS and daisyUI)
- JavaScript
- LocalStorage

## Run Locally

```bash
git clone https://github.com/Seeyoutomorrow322/ax-quiz-challenge.git
cd ax-quiz-challenge
```

Open `index.html` in the project root in a browser to run the game.

If you edit `app.css`, install the dependencies and rebuild `style.css`:

```bash
npm install
npm run build:css
```

## Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the branch containing the project files and the root directory (`/`), then save.
5. Wait for GitHub Pages to finish publishing, then visit the URL shown on the Pages settings screen.

The site entry point is the root-level `index.html`; its JavaScript and CSS files are also in the root.

## Project Structure

| File | Purpose |
| --- | --- |
| `index.html` | Defines the page structure, navigation, vocabulary, quiz, and results sections. |
| `questions.js` | Contains 20 questions, answer choices, and answers in Chinese, Korean, and English. |
| `script.js` | Implements game logic, language switching, random selection, scoring, LocalStorage, vocabulary search, and pronunciation; it adds vocabulary terms to make a 50-question pool. |
| `app.css` | Tailwind CSS input file and source stylesheet. |
| `style.css` | Built stylesheet loaded by the page. |
| `package.json` | Defines CSS build/watch scripts and Tailwind CSS and daisyUI development dependencies. |
| `package-lock.json` | Locks npm dependency versions. |
