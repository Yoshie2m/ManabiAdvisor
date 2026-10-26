import { LearningUnit } from "../../domain/models/LearningUnit";
import { Question } from "../../domain/models/Question";

// 中2英語 教科書 Lesson 2 Scene 2〜Lesson 3 Scene 3（content-workshop/output/eng2-*）。
// 各Sceneに、本文とCheckをまとめた読み物＋会話文の音声（gTTS）を持つ文法単元と、
// Lookの例文を並べ替えで作る練習単元（PassageTranslationToEnglish）を置く。
// 並べ替えの正解は教科書のLookそのまま。問題文の日本語訳はClaudeが付けたもの（第23回ヒアリング）。

type TextbookScene = {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  referenceText: string;
  audioFile: string;
  lookTitle: string;
  look: { prompt: string; answer: string }[];
};

const SCENES: TextbookScene[] = [
  {
    id: "unit-english-l2-s2",
    title: "Lesson 2 Scene 2: 副詞節：理由と時 (because / when / while / before / after)",
    difficulty: 3,
    audioFile: "lesson2-scene2.mp3",
    referenceText: `【場面】
Dr. and Mrs. Green are driving to Washington. They are a little late, so Dr. Green phones Mary.

【会話文】Be careful while you're driving!
Dr. Green: We stopped an hour for lunch, but we'll be there before it gets dark.
Mary: Grandma's worried because it's getting late.
Dr. Green: Don't worry. We'll be all right.
Mary: Grandma says, "Be careful while you're driving!"
Dr. Green: Of course. We don't want to have an accident.
Mary: We'll be waiting for you. Bye now.

【文法（Check）】副詞節：理由と時
・句：2語以上がまとまって一つの働きをする。（at lunch time）
・節：主語と動詞を含む。主節＝文の中心の節／従属節＝主節を修飾する節
・等位接続詞：2つの独立した語や句、節をつなぐ。（and, but, or, so）
・従属接続詞：2つの節を主従の関係でつなぐ。（理由：because／時：when, while, before, after）
  They stopped the game（主節） because it began to rain（従属節）.
・従属接続詞が導く節は、理由や時を表わす副詞の働きをするので従属副詞節（副詞節）という。
・従属接続詞は「〜するので」「〜するときに」「〜する間に」「〜する前に」「〜した後に」を意味するが、日本語と違って節の初めにくる。
・従属副詞節を文頭に置いてもよい。その場合は主節の前にコンマを入れる。
  Before you leave the room, be sure to close the windows.
・時を表わす副詞節が未来を指しても、現在形を使う。
  We'll stop for an hour when it's time for lunch.
  Don't begin the exam before the bell rings.`,
    lookTitle: "Lesson 2 Scene 2 例文練習（副詞節：理由と時）",
    look: [
      { prompt: "雨が降り始めたので、彼らは試合をやめた。", answer: "They stopped the game because it began to rain." },
      { prompt: "昼食の時間になったら、私たちは1時間休憩します。", answer: "We'll stop for an hour when it's time for lunch." },
      {
        prompt: "メアリーが額縁を買いに行っている間に、トムは花屋に行った。",
        answer: "Tom went to a flower shop while Mary shopped for a frame.",
      },
      { prompt: "ベルが鳴る前に試験を始めてはいけません。", answer: "Don't begin the exam before the bell rings." },
      {
        prompt: "あなたが野菜を食べ終えた後で、デザートにしましょう。",
        answer: "We'll have dessert after you finish your vegetables.",
      },
    ],
  },
  {
    id: "unit-english-l2-s3",
    title: "Lesson 2 Scene 3: 副詞節：条件 (if) / be able to",
    difficulty: 3,
    audioFile: "lesson2-scene3.mp3",
    referenceText: `【場面】
The Greens are now celebrating Grandma's birthday at a nice restaurant. They are getting ready to order dessert, but Tom still has a lot of vegetables on his plate.

【会話文】If you don't finish your vegetables, you can't have dessert.
Tom: I'll have chocolate cake and vanilla ice cream for dessert!
Dr. Green: If you don't finish your vegetables, you can't have dessert.
Tom: But we came here because the desserts are so great.
Dr. Green: That's right. But you have to finish your meal first.
Tom: Can I order dessert if I promise to finish my vegetables?
Dr. Green: Yes, Tom, but you'll have to keep your promise!

【文法（Check）】副詞節：条件
・条件を表わす接続詞：if「もし〜ならば」
・時の副詞節と同様に、条件の副詞節が未来を指しても現在形を使う。
・条件を表わす節を先に言うこともある。（If it gets cloudy, we won't be able to see Mt. Fuji.）
・be able to-v「〜できる」：can v とほぼ同じ意味だが、was/wasn't able to-v で過去、will/won't be able to-v で未来を表わすことができる。
・a pair of 〜「一対の〜」：2つで対になっているズボン、履き物、眼鏡、はさみなどを数えるときに使う。
  a pair of jeans / a pair of shoes / a pair of sunglasses`,
    lookTitle: "Lesson 2 Scene 3 例文練習（副詞節：条件）",
    look: [
      { prompt: "雨がやんだら、彼らは試合を再開するでしょう。", answer: "They'll begin the game again if the rain stops." },
      {
        prompt: "野菜を食べ終えると約束するなら、デザートを注文してもいいよ。",
        answer: "You can order dessert if you promise to finish your vegetables.",
      },
      {
        prompt: "毎日使おうとしなければ、英語はあまり身につかないでしょう。",
        answer: "You won't learn much English if you don't try to use it every day.",
      },
      {
        prompt: "サングラスを買わなければ、私は海辺に行けないだろう。",
        answer: "If I don't buy a pair of sunglasses, I won't be able to go to the beach.",
      },
      { prompt: "曇ったら、富士山が見えなくなるだろう。", answer: "If it gets cloudy, we won't be able to see Mt. Fuji." },
    ],
  },
  {
    id: "unit-english-l3-s1",
    title: "Lesson 3 Scene 1: 比較：比較級 (1) (Which / Who ..., A or B?)",
    difficulty: 2,
    audioFile: "lesson3-scene1.mp3",
    referenceText: `【場面】
The Greens are getting ready to return to New York.

【会話文】Which do you like better, Washington or New York?
Tom: Which do you like better, Washington or New York?
Mary: Well, while we're in Washington, we don't have to go to school.
Tom: Right. Whose cooking is better, Mom's or Grandma's?
Mary: I'm not going to answer that.
Tom: Anyway, Mom learned from Grandma.
Mary: I want to learn a few things from Grandma, too.

【文法（Check）】形容詞と副詞の比較級の作り方
1. 1音節と2音節の語の原級に -er をつける。 strong → stronger　quiet → quieter
  ・-e で終わる語には -r のみをつける。 nice → nicer
  ・最後の子音字を重ねる。 big → bigger
  ・-y で終わる語は -ier となる。 early → earlier
2. -ish, -ous, -ful で終わる語の原級の前に more をつける。
  selfish → more selfish　famous → more famous　careful → more careful
3. 3音節以上の語に more をつける。 beautiful → more beautiful　interesting → more interesting
4. 不規則な比較級 good, well → better　bad, ill → worse　many, much → more
  「小さい」という意味の little の比較級は普通 smaller を使う。`,
    lookTitle: "Lesson 3 Scene 1 例文練習（比較級 (1)）",
    look: [
      { prompt: "池と川では、どちらが深いですか。", answer: "Which is deeper, the pond or the river?" },
      { prompt: "5月と10月では、どちらの月が暖かいですか。", answer: "Which month is warmer, May or October?" },
      {
        prompt: "本と映画では、どちらがおもしろかったですか。",
        answer: "Which was more interesting, the book or the movie?",
      },
      { prompt: "トムとケビンでは、どちらが背が高いですか。", answer: "Who is taller, Tom or Kevin?" },
      { prompt: "リンダとジュディでは、どちらが歌が上手ですか。", answer: "Who sings better, Linda or Judy?" },
      {
        prompt: "メアリーはワシントンとニューヨークでは、どちらの都市が好きですか。",
        answer: "Which city does Mary like better, Washington or New York?",
      },
      { prompt: "トムとメアリーでは、どちらが早く起きましたか。", answer: "Who got up earlier, Tom or Mary?" },
    ],
  },
  {
    id: "unit-english-l3-s2",
    title: "Lesson 3 Scene 2: 比較：比較級 (2) (比較級 + than)",
    difficulty: 3,
    audioFile: "lesson3-scene2.mp3",
    referenceText: `【場面】
Tom and Mary are talking in the car on the way home.

【会話文】This book is much more interesting than our history textbook.
Mary: What are you looking at?
Tom: Grandma gave me this book about Pocahontas.
Mary: How is it?
Tom: It's much more interesting than our history textbook.
Mary: I like story books better than textbooks, too.
Tom: I'm going to get the Disney movie and show it to Jiro.

【文法（Check）】比較級 + than
・A is + 比較級 + than B [is].「AはBよりも〜です。」
・I like A better/more than [I like] B.「BよりAのほうが好きです。」
・than の後に続く節の中では語句を省略することが多いので、何が省略してあるか注意する。
  The pond is deeper than the river [is].
  Mary likes Washington better than [she likes] New York.
  Tom got up a lot earlier than Mary [did].
・比較の対象が代名詞で動詞を伴わない場合、than は前置詞のように扱われ、目的格になることが多い。
  Jiro can run a lot faster than I [can]. → Jiro can run a lot faster than me.
・比較級で用いられる修飾語：much / a lot「かなり」（比較級を強調）、a little「少し」`,
    lookTitle: "Lesson 3 Scene 2 例文練習（比較級 + than）",
    look: [
      { prompt: "池は川よりも深い。", answer: "The pond is deeper than the river." },
      { prompt: "5月は10月より暖かい。", answer: "May is warmer than October." },
      { prompt: "その本は映画よりもずっとおもしろかった。", answer: "The book was much more interesting than the movie." },
      { prompt: "トムはケビンより少し背が高い。", answer: "Tom is a little taller than Kevin." },
      { prompt: "リンダはジュディより歌が上手だ。", answer: "Linda sings better than Judy." },
      { prompt: "メアリーはニューヨークよりワシントンのほうが好きだ。", answer: "Mary likes Washington better than New York." },
      { prompt: "トムはメアリーよりずっと早く起きた。", answer: "Tom got up a lot earlier than Mary." },
    ],
  },
  {
    id: "unit-english-l3-s3",
    title: "Lesson 3 Scene 3: 比較：原級 (as ... as)",
    difficulty: 3,
    audioFile: "lesson3-scene3.mp3",
    referenceText: `【場面】
The Greens are in New York again and are getting their extra room ready for Jiro.

【会話文】Jiro's probably just as excited as I am!
Mrs. Green: Tom, you'll have to empty these drawers.
Tom: Sure. Can I leave my skis and skates in the closet?
Mrs. Green: That'll be all right. This closet is a lot bigger than yours.
Tom: Yeah. And Jiro won't have as many things as I do.
Mrs. Green: You really sound excited about Jiro's visit.
Tom: Jiro's probably just as excited as I am.

【文法（Check）】原級（as ... as）
・A is as + 形容詞の原級 + as B [is].「AはBと同じくらい〜です。」
・最初の as の前に almost, just などの修飾語を加えることができる。
・否定文は「AはBほど〜ではありません。」という意味になる。
・副詞の場合《as + 副詞の原級 + as 〜》となる。 Mike swims almost as fast as Paul.
・否定文の場合は、動詞を否定にする。 John does not swim as fast as Paul.
・than と同様に、比較の対象が代名詞で動詞を伴わない場合、目的格になることが多い。
  Kyle can run as fast as I [can]. → Kyle can run as fast as me.`,
    lookTitle: "Lesson 3 Scene 3 例文練習（原級 as ... as）",
    look: [
      { prompt: "マークはお父さんとほとんど同じくらい背が高い。", answer: "Mark is almost as tall as his father." },
      { prompt: "ワシントンはニューヨークとちょうど同じくらい有名だ。", answer: "Washington is just as famous as New York." },
      { prompt: "川は池ほど深くない。", answer: "The river is not as deep as the pond." },
      { prompt: "映画は本ほどおもしろくなかった。", answer: "The movie was not as interesting as the book." },
      { prompt: "ジュディはリンダほど上手に歌えない。", answer: "Judy can't sing as well as Linda." },
      {
        prompt: "メアリーはワシントンほどニューヨークが好きではない。",
        answer: "Mary doesn't like New York as much as Washington.",
      },
      { prompt: "メアリーはトムほど早く起きなかった。", answer: "Mary didn't get up as early as Tom." },
      { prompt: "カイルは私と同じくらい速く走れる。", answer: "Kyle can run as fast as me." },
    ],
  },
];

const practiceUnitId = (sceneId: string) => `${sceneId}-practice`;

export const englishTextbookLearningUnits: LearningUnit[] = SCENES.flatMap((scene) => [
  LearningUnit.create(
    {
      id: scene.id,
      curriculumId: "curriculum-english",
      title: scene.title,
      difficulty: scene.difficulty,
      referenceText: scene.referenceText,
      referenceAudioUrl: `/audio/${scene.audioFile}`,
    },
    "English",
  ),
  LearningUnit.create(
    {
      id: practiceUnitId(scene.id),
      curriculumId: "curriculum-english",
      title: scene.lookTitle,
      difficulty: 3,
      questionType: "PassageTranslationToEnglish",
    },
    "English",
  ),
]);

export const englishTextbookQuestions: Question[] = SCENES.flatMap((scene) =>
  scene.look.map((item, index) =>
    Question.create({
      id: `q-${practiceUnitId(scene.id).replace(/^unit-/, "")}-${String(index + 1).padStart(2, "0")}`,
      learningUnitId: practiceUnitId(scene.id),
      prompt: item.prompt,
      answer: item.answer,
    }),
  ),
);

