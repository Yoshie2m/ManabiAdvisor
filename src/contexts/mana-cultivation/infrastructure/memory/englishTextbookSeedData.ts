import { LearningUnit } from "../../domain/models/LearningUnit";
import { Question } from "../../domain/models/Question";

// 中2英語 教科書 Lesson 1〜5（Lesson 2 Scene 1を除く。content-workshop/output/eng2-*）。
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
    id: "unit-english-l1-s1",
    title: "Lesson 1 Scene 1: SVC文型 (look / smell / feel / taste / sound)",
    difficulty: 2,
    audioFile: "lesson1-scene1.mp3",
    referenceText: `【場面】
Tom and Mary Green are staying with their grandparents in Washington during the spring vacation. Today they went to see the famous cherry blossoms.

【会話文】Don't the cherry blossoms look beautiful?
Mary: Don't the cherry blossoms look beautiful?
Tom: They smell nice, too!
Mary: I feel tired. Can we rest a minute?
Tom: Why not? But dinner's at 6.
Mary: Yeah. Grandma's cooking a big dinner.
Tom: Grandma's cooking always tastes great.

【文法（Check）】SVC文型
・be動詞は SVC の文型をとる。 The blossoms (S) are (V) beautiful (C).
・この文型の補語（C）を主格補語といい、主語の様子や身分を表わす。
・上記の文の are を look に変えると「〜に見える」という意味になる。 The blossoms look beautiful.
・SVC の文型で使われる動詞：be動詞や look のほかに smell「〜のにおいがする」、feel「〜な感じがする」、taste「〜な味がする」、sound「〜に聞こえる」がある。
・口語の場合、名詞のすぐ後に is がくると短縮することが多い。所有格のように見えるので注意が必要である。
  Grandma's cooking a big dinner. = Grandma is cooking a big dinner.`,
    lookTitle: "Lesson 1 Scene 1 例文練習（SVC文型）",
    look: [
      { prompt: "花は美しく見える。", answer: "The blossoms look beautiful." },
      { prompt: "それらはいいにおいもする！", answer: "They smell nice, too!" },
      { prompt: "私は気分がよくない。", answer: "I don't feel well." },
      { prompt: "あのモーターは調子のいい音がしない。", answer: "That motor doesn't sound right." },
    ],
  },
  {
    id: "unit-english-l1-s2",
    title: "Lesson 1 Scene 2: SVOC文型 (make / keep / find / call / name)",
    difficulty: 3,
    audioFile: "lesson1-scene2.mp3",
    referenceText: `【場面】
Kevin White's family in Kobe talked with the Greens. Jiro is going to come to the States and stay with the Greens until next New Year's.

【会話文】Our invitation made Jiro very happy.
Tom: Kevin's friend Jiro is going to come and stay with us.
Grandma: Really? How long is he going to stay?
Tom: Until the beginning of next year!
Grandma: That's going to be a lot of fun.
Tom: It sure is! Our invitation made Jiro very happy.
Grandma: Well, be sure to bring him to Washington!

【文法（Check）】SVOC文型
・「〜(O)を…(C)にする」「〜(O)を…(C)と呼ぶ」などを表わす文型である。
・この文型の補語（C）を目的格補語といい、目的語の様子や身分、呼び名などを補足する。
  The teacher's questions made me nervous. / They named the baby Sarah.
・目的格補語が1人しかいない役職を表わす場合、冠詞をつけない。（The soccer club made Jerry captain.）`,
    lookTitle: "Lesson 1 Scene 2 例文練習（SVOC文型）",
    look: [
      { prompt: "グリーン家の招待は次郎をとても喜ばせた。", answer: "The Greens' invitation made Jiro very happy." },
      { prompt: "部屋をきれいにしておきなさい。", answer: "Keep your room clean." },
      { prompt: "警察は窓が割れているのを見つけた。", answer: "The police found a window broken." },
      { prompt: "サッカー部はジェリーをキャプテンにした。", answer: "The soccer club made Jerry captain." },
      { prompt: "多くの人がアメリカを「the States」と呼ぶ。", answer: 'Many people call America "the States."' },
      { prompt: "シンディは赤ちゃんに何と名前をつけましたか。", answer: "What did Cindy name her baby?" },
      { prompt: "これは英語で何と呼びますか。", answer: "What do you call this in English?" },
    ],
  },
  {
    id: "unit-english-l1-s3",
    title: "Lesson 1 Scene 3: 助動詞 will / won't・未来進行形",
    difficulty: 2,
    audioFile: "lesson1-scene3.mp3",
    referenceText: `【場面】
After lunch Tom and Mary decide to go shopping. Tomorrow is Grandma's birthday.

【会話文】I'll buy her some flowers.
Mary: Let's go shopping in the mall.
Tom: Won't Grandma want to come with us?
Mary: Shh! I'm going to buy her a birthday present.
Tom: Great idea! I'll buy her some flowers.
Mary: That'll make her happy. I'll be waiting for you at the front door.
Tom: Give me a few minutes. I need to get ready.

【文法（Check）】未来を表わす助動詞 will／未来進行形
・will + 動詞の原形「〜するだろう、〜する（つもりだ）」
  → 短縮形は 'll となる。代名詞の後はほとんどの場合短縮形にする。
  → 否定の will not の短縮形は won't となる。
・助動詞 will は次のような場合に使う。
  人の意志に関係なく、時がたてば自然に起こるだろうというとき：Tom will be fourteen years old next month.
  今ここで決めて実践しようとするとき：I'll answer Tom's e-mail tonight.
  必ずこうなるという計算のあるとき：That'll be $9.75, please.
・未来進行形 will be v-ing「〜しているだろう」
  未来のある時点で進行中の動作を表わすとき：We'll be resting at Grandma's this afternoon.
  比較的に近い将来の予定を表わすとき：We'll be going to London this summer, but we won't be staying in a hotel.
  現在進行形が使われない need や want でもこの形になることがよくある。`,
    lookTitle: "Lesson 1 Scene 3 例文練習（will / won't・未来進行形）",
    look: [
      { prompt: "ぼくはおばあちゃんに花を買おう。", answer: "I'll buy her some flowers." },
      { prompt: "それはおばあちゃんを喜ばせるだろう。", answer: "That will make her happy." },
      { prompt: "私たちはおばあちゃんには言わないよ。", answer: "We won't tell Grandma." },
      { prompt: "彼らは来週もまだワシントンにいるでしょうか。", answer: "Will they still be in Washington next week?" },
      { prompt: "おばあちゃんは私たちと一緒に来たがらないかな。", answer: "Won't Grandma want to come with us?" },
      {
        prompt: "人々は私たちの新しいユニフォームをどう思うだろうか。",
        answer: "What will people think about our new uniforms?",
      },
      { prompt: "玄関であなたを待っているね。", answer: "I'll be waiting for you at the front door." },
      { prompt: "この電車は各駅に停車します。", answer: "This train will be stopping at every station." },
      { prompt: "今週はもう卵はいらないだろう。", answer: "We won't be needing any more eggs this week." },
    ],
  },
  {
    id: "unit-english-l4-s1",
    title: "Lesson 4 Scene 1: 比較：最上級 (the + 最上級 / in・of)",
    difficulty: 2,
    audioFile: "lesson4-scene1.mp3",
    referenceText: `【場面】
The Greens met Jiro at the airport and are talking in the car on the way home.

【会話文】Which team do you like best, the Yankees, the Mets or the Mariners?
Mrs. Green: How was your flight, Jiro?
Jiro: Very smooth. I watched two movies and slept for a while.
Mrs. Green: What do you want to do most while you're here?
Jiro: I want to go to a lot of baseball games.
Mrs. Green: Which team do you like best, the Yankees, the Mets or the Mariners?
Jiro: I like the Mets best of the three.

【文法（Check）】最上級
・Who/Which is the + 形容詞の最上級, A, B or C?「（3つ以上の中で）どれが一番〜ですか。」
・A is the + 形容詞の最上級 + in/of ….「Aは…の中で一番〜です。」
・最上級の形は、比較級の -er / more を -est / most に変えたものである。
  late → later, latest　big → bigger, biggest　famous → more famous, most famous
・不規則変化 good, well → better, best　bad, ill → worse, worst　many, much → more, most
・形容詞の最上級には the をつけるが、副詞の場合は通常必要ない。
・「〜の中で」と言うとき、in か of を使う。
  in + 範囲・場所（in his class, in Japan）
  of + 複数（of the three, of all the girls）。文頭に置いてもよい。
  Mary is the most studious girl in her class.`,
    lookTitle: "Lesson 4 Scene 1 例文練習（最上級）",
    look: [
      { prompt: "東京、横浜、大阪の中で、どの都市が一番大きいですか。", answer: "Which city is the largest, Tokyo, Yokohama or Osaka?" },
      { prompt: "マーク、カイル、フィルの中で、誰が一番勉強好きですか。", answer: "Who is the most studious, Mark, Kyle or Phil?" },
      { prompt: "モーリーン、メグ、ケイの中で、誰が一番速く走りますか。", answer: "Who runs fastest, Maureen, Meg or Kay?" },
      {
        prompt: "英語、理科、数学の中で、あなたはどれが一番好きですか。",
        answer: "Which do you like best, English, science or math?",
      },
      { prompt: "東京は日本で一番大きな都市だ。", answer: "Tokyo is the largest city in Japan." },
      { prompt: "マークはクラスで一番勉強好きな男の子だ。", answer: "Mark is the most studious boy in his class." },
      { prompt: "モーリーンは3人の中で一番速く走る。", answer: "Maureen runs fastest of the three." },
      { prompt: "3つの中で、私は理科が一番好きだ。", answer: "Of the three, I like science best." },
    ],
  },
  {
    id: "unit-english-l4-s2",
    title: "Lesson 4 Scene 2: get + 比較級 and 比較級・one of the + 最上級",
    difficulty: 3,
    audioFile: "lesson4-scene2.mp3",
    referenceText: `【場面】
Jiro arrives at school with Tom for the first time.

【会話文】He's getting taller and taller. He's one of the tallest guys in the school.
Jiro: I'm getting more and more worried about my first day at school.
Tom: Relax! Everything'll be OK.
Jiro: Everyone looks a lot bigger than me.
Tom: Hey, there's my good friend, Jack Adams.
Jiro: You mean that tall guy over there?
Tom: Yeah. He's one of the tallest guys in the school.

【文法（Check）】比較級・最上級を使った表現
・get/become -er and -er（または more and more 〜）「ますます〜になる」
・one of the -est（または most 〜）+ 複数名詞 + in …「ある範囲の中で最も〜なものの一つ」
  → 「最も〜なもの」だと断定できない場合に使う。`,
    lookTitle: "Lesson 4 Scene 2 例文練習（比較級 and 比較級・one of the 最上級）",
    look: [
      { prompt: "ジャックはますます背が高くなっている。", answer: "Jack is getting taller and taller." },
      { prompt: "次郎の英語はますます上手になっている。", answer: "Jiro's English is getting better and better." },
      { prompt: "数学の授業はますます難しくなった。", answer: "The math classes became more and more difficult." },
      {
        prompt: "ジャック・アダムズは学校で最も背の高い男子の一人だ。",
        answer: "Jack Adams is one of the tallest guys in the school.",
      },
      { prompt: "宮島は日本で最も人気のある名所の一つだ。", answer: "Miyajima is one of the most popular sights in Japan." },
      { prompt: "スティーブは会社で最も優秀な経営者の一人だ。", answer: "Steve is one of the best managers in the company." },
    ],
  },
  {
    id: "unit-english-l4-s3",
    title: "Lesson 4 Scene 3: 付加疑問 (..., aren't you? / shall we?)",
    difficulty: 3,
    audioFile: "lesson4-scene3.mp3",
    referenceText: `【場面】
Jiro is at the Mets' baseball stadium with the Greens.

【会話文】You're really excited, aren't you?
Mary: You're really excited, aren't you?
Jiro: That's for sure!
Mary: This isn't your first time in a baseball stadium, is it?
Jiro: No, but it's my first major league game.
Mary: Well, come on, let's get some popcorn before the game starts.
Jiro: Great idea!

【文法（Check）】付加疑問
・平叙文の最後にコンマをつけて、「…ね」という意味の付加疑問（tag question）を加えることがある。
・主節の動詞が be動詞の場合 → 付加疑問にも同じ be動詞を使う。
  一般動詞の場合 → do を適当な形に変えて使う。
  助動詞の場合 → 付加疑問にも同じ助動詞を使う。
・主節が肯定文なら、付加疑問は否定になる。主節が否定文なら、付加疑問は肯定になる。
・付加疑問の主語は、主節の主語を受ける代名詞である。
・疑問の気持ちがほとんどなく、同意を求めるときは文末を下げる。相手に確認したり、意見を尋ねる気持ちがあるときは文末を上げる。
・Let's v. の後の付加疑問 → shall we?（文末を上げる。）`,
    lookTitle: "Lesson 4 Scene 3 例文練習（付加疑問）",
    look: [
      { prompt: "あなたは本当にわくわくしているよね。", answer: "You're really excited, aren't you?" },
      { prompt: "それは新しいジーンズだよね。", answer: "That's a new pair of jeans, isn't it?" },
      { prompt: "おばあちゃんは花を育てているよね。", answer: "Grandma raises flowers, doesn't she?" },
      { prompt: "トムは歯をみがいたよね。", answer: "Tom brushed his teeth, didn't he?" },
      { prompt: "パーティーに来るよね。", answer: "You'll come to the party, won't you?" },
      { prompt: "あなたは日本の歌を歌えるよね。", answer: "You can sing Japanese songs, can't you?" },
      { prompt: "あなたは具合が悪いわけじゃないよね。", answer: "You aren't sick, are you?" },
      { prompt: "飛行機は遅れて出発しなかったよね。", answer: "The plane didn't leave late, did it?" },
      { prompt: "トムは明日ここに来ないよね。", answer: "Tom won't be here tomorrow, will he?" },
      { prompt: "ポップコーンを買おうよ。", answer: "Let's get some popcorn, shall we?" },
    ],
  },
  {
    id: "unit-english-l5-s1",
    title: "Lesson 5 Scene 1: with の用法",
    difficulty: 3,
    audioFile: "lesson5-scene1.mp3",
    referenceText: `【場面】
Jiro is going to go to Washington with Tom and Mary and their friend Rosa Lewis. Tom is showing Jiro some old family photos.

【会話文】The boy with the yellow hat on is me.
Tom: Grandpa took this picture of me and Kevin with an old "box" camera.
Jiro: Both of you look so small. Which is you?
Tom: The boy with the yellow hat on is me.
Jiro: So the boy with the bucket is Kevin, right?
Tom: Right. Here we are again, this time with Grandma.
Jiro: She looks nice and cheerful.

【文法（Check）】前置詞 with の用法
1. 「〜と一緒に」（with Grandma）
2. 「〜を持っている」（with the newspaper）
3. 「〜を身につけて」（with the overcoat on）
4. 「〜で、〜を使って」（with a dry rag）`,
    lookTitle: "Lesson 5 Scene 1 例文練習（with の用法）",
    look: [
      { prompt: "メアリーはよく友だちのサリーとテニスをする。", answer: "Mary often plays tennis with her friend Sally." },
      { prompt: "おばあちゃんと一緒にいる男の子たちはケビンとぼくだ。", answer: "The boys with Grandma are Kevin and me." },
      { prompt: "バケツを持っている男の子はケビンだ。", answer: "The boy with the bucket is Kevin." },
      { prompt: "向こうの新聞を持った男の人が見えますか。", answer: "Do you see that man with the newspaper over there?" },
      { prompt: "黒いオーバーを着ている男の人のことですか。", answer: "Do you mean the man with the black overcoat on?" },
      { prompt: "スーツを着ているあの男の人は私のおじだ。", answer: "That man with the suit on is my uncle." },
      { prompt: "私たちはふだんナイフとフォークでパンケーキを食べる。", answer: "We usually eat pancakes with knives and forks." },
      {
        prompt: "窓はぬれたぞうきんでふくべきですか、それとも乾いたぞうきんでですか。",
        answer: "Should I clean the windows with a wet rag or a dry rag?",
      },
    ],
  },
  {
    id: "unit-english-l5-s2",
    title: "Lesson 5 Scene 2: 関係代名詞（主格）who / which / that",
    difficulty: 4,
    audioFile: "lesson5-scene2.mp3",
    referenceText: `【場面】
Mary is talking with Grandma in the backyard.

【会話文】The dog that lives next door was barking all night.
Grandma: You look sleepy this morning, Mary.
Mary: I am sleepy.
Grandma: I can imagine. You and Rosa couldn't sleep because you were talking all night.
Mary: Actually, we were talking all night because we couldn't sleep.
Grandma: What do you mean?
Mary: The dog that lives next door was barking all night.

【文法（Check）】関係代名詞（主格）
・関係代名詞 who / which / that を使って、2文を1文につなぐことができる。
  挟みたい文の代名詞を関係代名詞に変えて主節とつなぐ。このようにしてできた従属形容詞節を関係詞節という。
  関係詞節が修飾する名詞は先行詞と呼ばれる。
  Those girls (they are playing softball) are my classmates.
  → Those girls that (= who) are playing softball are my classmates.
・ここで扱った関係代名詞はいずれも関係詞節の主語の働きをしている。
  先行詞が人 → who / that、人以外（物・動物）→ which / that
・いずれも話し言葉では that がよく使われる。口語では that is を that's に、who is を who's に短縮することが多い。
  The boy that's holding the bucket is Kevin.
・先行詞が固有名詞の場合は that を使わず、who か which を使って関係詞節をコンマで切る。
  Kevin, who lives near Jiro in Kobe, is Tom's cousin.`,
    lookTitle: "Lesson 5 Scene 2 例文練習（関係代名詞：主格）",
    look: [
      {
        prompt: "スカーフを身につけている女性は客室乗務員だ。",
        answer: "The woman that is wearing the scarf is a flight attendant.",
      },
      { prompt: "バケツを持っている男の子はケビンだ。", answer: "The boy that is holding the bucket is Kevin." },
      { prompt: "隣に住んでいる犬が一晩中ほえていた。", answer: "The dog that lives next door was barking all night." },
      { prompt: "ソフトボールをしている女の子たちは私のクラスメートだ。", answer: "Those girls that are playing softball are my classmates." },
      { prompt: "庭に走りこんだ猫が池の魚を2匹食べた。", answer: "The cat that ran into the garden ate two fish in the pond." },
      { prompt: "次郎に英語を教えたブラウン先生はカナダ出身だ。", answer: "Ms. Brown, who taught Jiro English, comes from Canada." },
    ],
  },
  {
    id: "unit-english-l5-s3",
    title: "Lesson 5 Scene 3: 関係代名詞（目的格）whom / which / that",
    difficulty: 4,
    audioFile: "lesson5-scene3.mp3",
    referenceText: `【場面】
Mary is asking Jiro about his visit to the White House.

【会話文】The stories that the guide told us were interesting.
Mary: How was the White House?
Jiro: It was great, and the stories that the guide told us were interesting.
Mary: I want to be the first woman President and live there.
Jiro: Are you sure? The President is always so busy.
Mary: Oh, that's just a dream that I have. What's your dream?
Jiro: I hope to be able to play baseball with the Mets someday.

【文法（Check）】関係代名詞（目的格）
・挟む文の目的語（him, her, it, them）が本文とのつなぎ目になる場合、目的格の関係代名詞 whom / which / that を関係詞節の初めにもってきて、主節にある先行詞のすぐ後に置く。
  The lady (I met her yesterday) knows my father.
  → The lady that (= whom) I met yesterday knows my father.
・関係代名詞 who の目的格は whom である。先行詞が人 → whom / that、人以外（物・動物）→ which / that
・先行詞が固有名詞の場合は that を使わず、関係詞節をコンマで切る。
・疑問詞の場合も目的格は whom になる。ただし、口語では文頭に置かれる疑問詞 Whom は Who にすることが多い。
  Who[m] did the teacher choose? -- She chose some students who can sing well.`,
    lookTitle: "Lesson 5 Scene 3 例文練習（関係代名詞：目的格）",
    look: [
      { prompt: "私が昨日会った女性は私の父を知っている。", answer: "The lady that I met yesterday knows my father." },
      { prompt: "先生の机の上で見た本は私のものに似ていた。", answer: "The book that I saw on the teacher's desk looked like mine." },
      { prompt: "ガイドが話してくれた話はおもしろかった。", answer: "The stories that the guide told us were interesting." },
      { prompt: "あなたが話してくれた映画はわくわくしそうだ。", answer: "The movie that you told me about sounds exciting." },
      {
        prompt: "グリーン家はニューヨークに住んでいて、そこを多くの人はビッグアップルと呼ぶ。",
        answer: "The Greens live in New York, which many call the Big Apple.",
      },
    ],
  },
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

