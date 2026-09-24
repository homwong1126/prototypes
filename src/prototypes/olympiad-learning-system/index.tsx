/**
 * @name 小学奥数学习系统
 *
 * 参考资料：
 * - /src/docs/project-overview.md
 * - /rules/design-guide.md
 * - /rules/development-guide.md
 * - /src/themes/antd-new/DESIGN.md
 */

import './style.css'

import React, { useMemo, useState } from 'react'
import {
  BookOpen,
  Brain,
  ChevronRight,
  CircleHelp,
  Lightbulb,
  Map,
  PencilRuler,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react'

type ViewKey = 'playground' | 'library' | 'solver' | 'growth'

type Stage = {
  id: string
  title: string
  badge: string
  age: string
  mission: string
  colorClass: string
}

type Topic = {
  id: string
  stageId: string
  title: string
  icon: string
  level: string
  goal: string
  stickerClass: string
}

type ComicStep = {
  title: string
  explain: string
  note: string
}

type Question = {
  id: string
  topicId: string
  title: string
  difficulty: string
  prompt: string
  summary: string
  thinking: string
  answer: string
  wrongTip: string
  tryMore: string
  steps: ComicStep[]
}

const VIEWS: Array<{ key: ViewKey; label: string; desc: string; icon: React.ReactNode }> = [
  { key: 'playground', label: '学习乐园', desc: '今天学什么', icon: <Sparkles size={18} /> },
  { key: 'library', label: '专题题库', desc: '按专题练习', icon: <BookOpen size={18} /> },
  { key: 'solver', label: '漫画拆题', desc: '一步步讲答案', icon: <PencilRuler size={18} /> },
  { key: 'growth', label: '成长地图', desc: '看看进步', icon: <Map size={18} /> },
]

const STAGES: Stage[] = [
  {
    id: 'stage-beginner',
    title: '基础启蒙站',
    badge: '启蒙',
    age: '适合一二年级',
    mission: '先学会观察、分类、找规律，让孩子喜欢动脑筋。',
    colorClass: 'is-yellow',
  },
  {
    id: 'stage-core',
    title: '专题进阶站',
    badge: '进阶',
    age: '适合三四年级',
    mission: '进入应用题、行程、枚举与逻辑推理的系统训练。',
    colorClass: 'is-blue',
  },
  {
    id: 'stage-sprint',
    title: '挑战冲刺站',
    badge: '冲刺',
    age: '适合四五六年级',
    mission: '学会拆复杂条件、整理信息，并完成中高难度挑战题。',
    colorClass: 'is-orange',
  },
]

const TOPICS: Topic[] = [
  {
    id: 'topic-pattern',
    stageId: 'stage-beginner',
    title: '找规律',
    icon: '⭐',
    level: 'Lv.1',
    goal: '学会观察数字、图形和顺序变化',
    stickerClass: 'is-yellow',
  },
  {
    id: 'topic-classify',
    stageId: 'stage-beginner',
    title: '分类与比较',
    icon: '🍭',
    level: 'Lv.1',
    goal: '知道怎样按条件分组，再做比较',
    stickerClass: 'is-mint',
  },
  {
    id: 'topic-counting',
    stageId: 'stage-core',
    title: '枚举与计数',
    icon: '🧩',
    level: 'Lv.2',
    goal: '学会不重不漏地列情况',
    stickerClass: 'is-blue',
  },
  {
    id: 'topic-travel',
    stageId: 'stage-core',
    title: '行程问题',
    icon: '🚲',
    level: 'Lv.2',
    goal: '学会画线段图，理清路程关系',
    stickerClass: 'is-purple',
  },
  {
    id: 'topic-logic',
    stageId: 'stage-sprint',
    title: '逻辑推理',
    icon: '🕵️',
    level: 'Lv.3',
    goal: '抓住隐藏条件，排除错误答案',
    stickerClass: 'is-peach',
  },
  {
    id: 'topic-application',
    stageId: 'stage-sprint',
    title: '应用难题',
    icon: '🚀',
    level: 'Lv.3',
    goal: '把长题目拆成小问题一步步解决',
    stickerClass: 'is-orange',
  },
]

const QUESTIONS: Question[] = [
  {
    id: 'q-pattern-01',
    topicId: 'topic-pattern',
    title: '数字找规律',
    difficulty: '基础',
    prompt: '观察数列 2，5，8，11，( )，下一个数应该是多少？',
    summary: '这是最基础的找规律题，要先比较相邻两个数差了多少。',
    thinking: '先看 5 比 2 多几，8 比 5 多几，11 比 8 多几。',
    answer: '括号里应该填 14。',
    wrongTip: '有些同学只看到了数字变大，却没有认真比较每次增加的数量。',
    tryMore: '如果数列变成 3，7，11，15，下一项是多少？',
    steps: [
      {
        title: '第 1 步：观察相邻数字',
        explain: '5 比 2 多 3，8 比 5 多 3，11 比 8 也多 3。',
        note: '连续比较，是找规律最常用的方法。',
      },
      {
        title: '第 2 步：发现相同变化',
        explain: '每次都加 3，所以这是“每次加 3”的规律。',
        note: '看到“每次都一样”，就说明规律找对了。',
      },
      {
        title: '第 3 步：继续往后推',
        explain: '11 后面再加 3，就是 14。',
        note: '找到规律后，继续按同样方法走。',
      },
    ],
  },
  {
    id: 'q-pattern-02',
    topicId: 'topic-pattern',
    title: '图形轮流出现',
    difficulty: '基础',
    prompt: '按照 ○ △ □ ○ △ □ ○ △ 的顺序排下去，第 10 个图形是什么？',
    summary: '遇到循环规律时，先找一个完整的重复小队伍。',
    thinking: '先看看几个图形为一组重复，再数第 10 个落在哪个位置。',
    answer: '第 10 个图形是 ○。',
    wrongTip: '很多同学会一个一个数到 10，容易数乱，最好先找“3 个一组”的规律。',
    tryMore: '如果按 ○ △ □ ☆ 四个一组重复，第 14 个会是什么图形？',
    steps: [
      {
        title: '第 1 步：找出重复一组',
        explain: '图形是按照 ○ △ □ 这样 3 个一组重复出现的。',
        note: '先找到循环小队伍。',
      },
      {
        title: '第 2 步：把第 10 个分到小组里',
        explain: '每组有 3 个图形，前 9 个刚好是 3 组。',
        note: '9 个走完后，第 10 个就是下一组的第 1 个。',
      },
      {
        title: '第 3 步：确定答案',
        explain: '下一组的第 1 个图形是 ○，所以第 10 个图形就是 ○。',
        note: '用“整组 + 剩下几个”的方法最稳。',
      },
    ],
  },
  {
    id: 'q-classify-01',
    topicId: 'topic-classify',
    title: '水果分篮子',
    difficulty: '基础',
    prompt: '有 3 个苹果、2 个梨、4 个橘子。按“水果种类”分成几组？每组各有几个？',
    summary: '分类题要先看题目让你“按什么分”。',
    thinking: '题目说按水果种类分，所以相同种类放在一起。',
    answer: '可以分成 3 组：苹果 3 个，梨 2 个，橘子 4 个。',
    wrongTip: '容易把数量多少当成分类标准，但这题要求按“种类”分。',
    tryMore: '如果改成按“颜色”分，这些水果可以怎样分？',
    steps: [
      {
        title: '第 1 步：先看按什么分',
        explain: '题目不是随便分，而是明确说“按水果种类”分。',
        note: '分类前先看标准。',
      },
      {
        title: '第 2 步：把同类放一起',
        explain: '苹果放一起，梨放一起，橘子放一起。',
        note: '同一类物品归到同一组。',
      },
      {
        title: '第 3 步：数每组个数',
        explain: '苹果 3 个，梨 2 个，橘子 4 个。',
        note: '分完后别忘了数清楚。',
      },
    ],
  },
  {
    id: 'q-classify-02',
    topicId: 'topic-classify',
    title: '比高矮',
    difficulty: '基础',
    prompt: '小明比小红高，小红比小军高。三个人里谁最高？谁最矮？',
    summary: '比较题要把关系一条一条连起来看。',
    thinking: '把“谁比谁高”连成一条顺序。',
    answer: '最高的是小明，最矮的是小军。',
    wrongTip: '有些同学只看第一句，没有把第二句也连起来。',
    tryMore: '如果再加一句“小刚比小明高”，那谁最高？',
    steps: [
      {
        title: '第 1 步：先读第一句',
        explain: '第一句告诉我们：小明比小红高。',
        note: '先得到第一个比较关系。',
      },
      {
        title: '第 2 步：再读第二句',
        explain: '第二句告诉我们：小红比小军高。',
        note: '再补上第二个关系。',
      },
      {
        title: '第 3 步：连成顺序',
        explain: '把两句连起来就是：小明 > 小红 > 小军。',
        note: '连起来后，最高和最矮就清楚了。',
      },
    ],
  },
  {
    id: 'q-count-01',
    topicId: 'topic-counting',
    title: '数字卡片排队',
    difficulty: '中等',
    prompt: '用数字卡片 1、2、3 一共可以排成多少个不同的三位数？',
    summary: '这题不是直接猜答案，而是要按顺序把所有可能写出来。',
    thinking: '先想第一位能放谁，再想第二位、第三位怎么接着排。',
    answer: '一共可以排成 6 个不同的三位数。',
    wrongTip: '最常见的错误是漏掉一种情况，或者把顺序不同的数当成同一个。',
    tryMore: '如果把 1、2、3、4 四张卡片拿来排四位数，一共会有多少种排法？',
    steps: [
      {
        title: '第 1 步：先读懂题目',
        explain: '题目问的是“不同的三位数”有几个，所以只要顺序不一样，就算不同。',
        note: '关键句：顺序不同，也算不同。',
      },
      {
        title: '第 2 步：先固定第一位',
        explain: '第一位可以放 1，也可以放 2，还可以放 3，一共有 3 种选择。',
        note: '先从第一位开始，会更不容易乱。',
      },
      {
        title: '第 3 步：把剩下的两位继续排',
        explain: '如果第一位放 1，后面可以排成 123、132；如果第一位放 2，可以排成 213、231；如果第一位放 3，可以排成 312、321。',
        note: '要按顺序列出来，才能保证不重不漏。',
      },
      {
        title: '第 4 步：数一数一共有几个',
        explain: '我们列出的数有 123、132、213、231、312、321，一共 6 个。',
        note: '把所有情况数完，答案就出来了。',
      },
    ],
  },
  {
    id: 'q-count-02',
    topicId: 'topic-counting',
    title: '握手小题',
    difficulty: '中等',
    prompt: '3 个小朋友每两个人握一次手，一共要握几次手？',
    summary: '这类题要避免重复数，比如甲和乙握手不能数两次。',
    thinking: '可以把每个小朋友依次和后面的人握手。',
    answer: '一共要握 3 次手。',
    wrongTip: '最容易把甲和乙、乙和甲当成两次，其实那是同一次握手。',
    tryMore: '如果有 4 个小朋友每两个人握一次手，一共握几次？',
    steps: [
      {
        title: '第 1 步：先给小朋友取名字',
        explain: '把 3 个小朋友看成甲、乙、丙，会更好数。',
        note: '换成简单名字，关系更清楚。',
      },
      {
        title: '第 2 步：从甲开始数',
        explain: '甲可以和乙握一次，和丙握一次，一共 2 次。',
        note: '先固定一个人。',
      },
      {
        title: '第 3 步：再看乙',
        explain: '乙和丙还要握一次手，所以再加 1 次。',
        note: '乙和甲已经握过了，不要再数。',
      },
      {
        title: '第 4 步：把次数加起来',
        explain: '2 次再加 1 次，一共是 3 次。',
        note: '这就是不重复数的方法。',
      },
    ],
  },
  {
    id: 'q-count-03',
    topicId: 'topic-counting',
    title: '路线选择',
    difficulty: '进阶',
    prompt: '从家到书店有 2 条路，从书店到公园有 3 条路。先去书店再去公园，一共有多少种不同走法？',
    summary: '遇到“先做这个，再做那个”的题，通常要把前后选择配起来。',
    thinking: '家到书店每一种走法，都可以接上书店到公园的 3 种走法。',
    answer: '一共有 6 种不同走法。',
    wrongTip: '很多同学看到 2 和 3 会随手相加，但这里是“每条前路都能配每条后路”。',
    tryMore: '如果家到书店有 3 条路，书店到公园有 4 条路，一共有多少种走法？',
    steps: [
      {
        title: '第 1 步：分成前后两段',
        explain: '第一段是家到书店，第二段是书店到公园。',
        note: '先分段看问题。',
      },
      {
        title: '第 2 步：看第一段有几种',
        explain: '家到书店一共有 2 种走法。',
        note: '前面先有 2 个选择。',
      },
      {
        title: '第 3 步：每一种都能接后面的 3 种',
        explain: '无论前面选哪一条，到书店后都还能再选 3 条路去公园。',
        note: '每个前面选择，都能配上后面选择。',
      },
      {
        title: '第 4 步：算总走法',
        explain: '2 组，每组 3 种，所以一共是 2 × 3 = 6 种。',
        note: '这种题通常用乘法更快。',
      },
    ],
  },
  {
    id: 'q-travel-01',
    topicId: 'topic-travel',
    title: '小猫送信',
    difficulty: '进阶',
    prompt: '小猫从家出发去学校，每分钟走 60 米，5 分钟后离学校还有 120 米。小猫家离学校一共有多少米？',
    summary: '这类行程题先别急着算总路程，先分清“已经走了多少”和“还剩多少”。',
    thinking: '总路程 = 已经走的路程 + 还剩的路程。',
    answer: '小猫家离学校一共有 420 米。',
    wrongTip: '有些同学会把 60 和 120 直接相加，这是没有先想清楚每个数表示什么。',
    tryMore: '如果改成每分钟走 70 米，走 4 分钟后还剩 80 米，总路程是多少？',
    steps: [
      {
        title: '第 1 步：先找出已知条件',
        explain: '题目告诉我们速度是每分钟 60 米，已经走了 5 分钟，还剩 120 米。',
        note: '把条件分成“走了多少”和“还剩多少”两类。',
      },
      {
        title: '第 2 步：先算已经走了多少米',
        explain: '每分钟走 60 米，5 分钟走了 60 × 5 = 300 米。',
        note: '速度乘时间，得到已经走的路程。',
      },
      {
        title: '第 3 步：再把剩下的加上',
        explain: '离学校还有 120 米，所以总路程就是 300 + 120 = 420 米。',
        note: '总路程 = 已走路程 + 剩余路程。',
      },
    ],
  },
  {
    id: 'q-travel-02',
    topicId: 'topic-travel',
    title: '跑步追追追',
    difficulty: '进阶',
    prompt: '小乐每分钟跑 120 米，小安每分钟跑 100 米。两人同时同地出发，5 分钟后小乐比小安多跑多少米？',
    summary: '追及类基础题先求“每分钟多多少”，再乘时间。',
    thinking: '先求速度差，再看一共跑了几分钟。',
    answer: '5 分钟后小乐比小安多跑 100 米。',
    wrongTip: '有些同学会把两个速度加起来，但题目问的是“多跑多少”。',
    tryMore: '如果两人跑了 8 分钟，小乐会多跑多少米？',
    steps: [
      {
        title: '第 1 步：看谁每分钟更快',
        explain: '小乐每分钟 120 米，小安每分钟 100 米。',
        note: '先比较速度。',
      },
      {
        title: '第 2 步：求每分钟多多少',
        explain: '120 - 100 = 20，所以小乐每分钟多跑 20 米。',
        note: '这就是速度差。',
      },
      {
        title: '第 3 步：乘上总时间',
        explain: '5 分钟后，多跑的路程是 20 × 5 = 100 米。',
        note: '速度差乘时间，就是多出来的路程。',
      },
    ],
  },
  {
    id: 'q-logic-01',
    topicId: 'topic-logic',
    title: '谁拿了红旗',
    difficulty: '挑战',
    prompt: '甲、乙、丙三人中只有一个人拿了红旗。甲说：“是乙拿的。”乙说：“不是我。”丙说：“不是乙。”已知只有一个人说了真话，那么是谁拿了红旗？',
    summary: '逻辑题不要着急猜，试着把每种可能代进去检查。',
    thinking: '分别假设甲、乙、丙拿了红旗，再看谁说真话。',
    answer: '乙拿了红旗。',
    wrongTip: '最容易凭感觉选一个答案，但逻辑题一定要验证“只有一个人说真话”这个条件。',
    tryMore: '如果改成“只有两个人说真话”，答案会变吗？',
    steps: [
      {
        title: '第 1 步：先记住关键条件',
        explain: '题目最重要的是“只有一个人说了真话”。',
        note: '这个条件要一直盯住。',
      },
      {
        title: '第 2 步：先假设乙拿了红旗',
        explain: '如果乙拿了红旗，甲说对了，乙说错了，丙说错了，这时正好只有 1 个人说真话。',
        note: '先代进去检验。',
      },
      {
        title: '第 3 步：再看有没有别的可能',
        explain: '如果甲拿红旗，那么甲说错、乙说真、丙说真，会有 2 个人说真话；如果丙拿红旗，也会有 2 个人说真话。',
        note: '不符合条件的都排掉。',
      },
      {
        title: '第 4 步：确定答案',
        explain: '只有“乙拿了红旗”时，正好只有 1 个人说真话。',
        note: '所以答案就是乙拿了红旗。',
      },
    ],
  },
  {
    id: 'q-logic-02',
    topicId: 'topic-logic',
    title: '红盒子还是蓝盒子',
    difficulty: '挑战',
    prompt: '桌上有红盒子和蓝盒子，奖章只藏在其中一个盒子里。甲说：“奖章在红盒子里。”乙说：“奖章不在蓝盒子里。”丙说：“奖章在蓝盒子里。”已知只有一句话是真的，奖章在哪个盒子里？',
    summary: '真假判断题要把每句话都和同一个答案对照起来看。',
    thinking: '先假设奖章在红盒子里，再假设奖章在蓝盒子里，看看哪种情况正好只有一句真话。',
    answer: '奖章在蓝盒子里。',
    wrongTip: '最容易只验证一句话，没有把三个人的话一起检查。',
    tryMore: '如果改成“有两句话是真的”，那奖章又会在哪个盒子里？',
    steps: [
      {
        title: '第 1 步：先假设奖章在红盒子里',
        explain: '如果奖章在红盒子里，那么甲说真话，乙说“奖章不在蓝盒子里”也是真话，丙说假话。',
        note: '这时有两句真话，不符合题目。',
      },
      {
        title: '第 2 步：再假设奖章在蓝盒子里',
        explain: '如果奖章在蓝盒子里，甲说假话，乙说“奖章不在蓝盒子里”也是假话，丙说真话。',
        note: '这时正好只有一句真话。',
      },
      {
        title: '第 3 步：确定答案',
        explain: '只有奖章在蓝盒子里时，题目条件“只有一句话是真的”才成立。',
        note: '所以答案就是蓝盒子。',
      },
    ],
  },
  {
    id: 'q-application-01',
    topicId: 'topic-application',
    title: '分糖果',
    difficulty: '挑战',
    prompt: '老师把 24 颗糖平均分给 6 个小朋友，每个小朋友再拿出 1 颗放进奖励盒里，最后每个小朋友手里还剩几颗糖？',
    summary: '长题目要先拆成“先平均分，再拿出 1 颗”两个动作。',
    thinking: '先算每个人分到多少，再减去拿出去的 1 颗。',
    answer: '每个小朋友最后还剩 3 颗糖。',
    wrongTip: '有些同学会先从 24 里面减 1，这是没有分清“谁拿出 1 颗”。',
    tryMore: '如果是 30 颗糖分给 5 个小朋友，每人再拿出 2 颗，还剩几颗？',
    steps: [
      {
        title: '第 1 步：分清先后顺序',
        explain: '题目先说“平均分”，后说“每个小朋友再拿出 1 颗”。',
        note: '长题先拆动作。',
      },
      {
        title: '第 2 步：先算平均分',
        explain: '24 ÷ 6 = 4，所以每个小朋友先分到 4 颗。',
        note: '先完成第一个动作。',
      },
      {
        title: '第 3 步：再算剩下多少',
        explain: '每个人拿出 1 颗后，还剩 4 - 1 = 3 颗。',
        note: '一个动作做完，再做下一个动作。',
      },
    ],
  },
  {
    id: 'q-application-02',
    topicId: 'topic-application',
    title: '买练习本',
    difficulty: '挑战',
    prompt: '一本练习本 4 元，小雅带了 20 元，买了 3 本练习本后，剩下的钱正好买 2 支同样价格的铅笔。每支铅笔多少元？',
    summary: '应用题要先找出已花的钱，再算剩下的钱。',
    thinking: '先算 3 本练习本多少钱，再用总钱数减掉。',
    answer: '每支铅笔 4 元。',
    wrongTip: '最常见的错误是直接用 20 ÷ 2，没有先减掉买练习本的钱。',
    tryMore: '如果一本练习本 5 元，买 2 本后剩下的钱买 2 支铅笔，每支铅笔多少元？',
    steps: [
      {
        title: '第 1 步：先算练习本花了多少钱',
        explain: '一本 4 元，3 本就是 4 × 3 = 12 元。',
        note: '先算已花的钱。',
      },
      {
        title: '第 2 步：算剩下多少钱',
        explain: '20 - 12 = 8，说明买铅笔一共用了 8 元。',
        note: '总钱数减已花的钱。',
      },
      {
        title: '第 3 步：算每支铅笔多少钱',
        explain: '2 支铅笔一共 8 元，所以每支是 8 ÷ 2 = 4 元。',
        note: '最后再做平均分。',
      },
    ],
  },
]

const DAILY_MISSIONS = [
  { title: '热身 1 题', desc: '先做一道轻松题，进入状态', reward: '贴纸 +1' },
  { title: '专题练习 3 题', desc: '围绕当前专题集中训练', reward: '金币 +3' },
  { title: '漫画复盘 1 题', desc: '把今天的难题拆开看懂', reward: '星星 +2' },
]

function getStageByTopic(topicId: string) {
  const topic = TOPICS.find((item) => item.id === topicId)
  if (!topic) return STAGES[0]
  return STAGES.find((stage) => stage.id === topic.stageId) ?? STAGES[0]
}

function getQuestionCountByTopic(topicId: string) {
  return QUESTIONS.filter((question) => question.topicId === topicId).length
}

const Component: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewKey>('playground')
  const [activeStageId, setActiveStageId] = useState<string>('stage-core')
  const [activeTopicId, setActiveTopicId] = useState<string>('topic-counting')
  const [activeQuestionId, setActiveQuestionId] = useState<string>('q-count-01')
  const [isAnswerVisible, setIsAnswerVisible] = useState<boolean>(false)

  const visibleTopics = useMemo(
    () => TOPICS.filter((topic) => topic.stageId === activeStageId),
    [activeStageId],
  )

  const activeTopic = useMemo(
    () => TOPICS.find((topic) => topic.id === activeTopicId) ?? TOPICS[0],
    [activeTopicId],
  )

  const topicQuestions = useMemo(
    () => QUESTIONS.filter((question) => question.topicId === activeTopicId),
    [activeTopicId],
  )

  const activeQuestion = useMemo(
    () => QUESTIONS.find((question) => question.id === activeQuestionId) ?? QUESTIONS[0],
    [activeQuestionId],
  )

  const activeStage = useMemo(() => getStageByTopic(activeTopic.id), [activeTopic.id])
  const totalQuestionCount = QUESTIONS.length

  const handleStageChange = (stageId: string) => {
    setActiveStageId(stageId)
    setIsAnswerVisible(false)
    const nextTopic = TOPICS.find((topic) => topic.stageId === stageId)
    if (nextTopic) {
      setActiveTopicId(nextTopic.id)
      const nextQuestion = QUESTIONS.find((question) => question.topicId === nextTopic.id)
      if (nextQuestion) {
        setActiveQuestionId(nextQuestion.id)
      }
    }
  }

  const handleTopicChange = (topicId: string) => {
    setActiveTopicId(topicId)
    setIsAnswerVisible(false)
    const nextQuestion = QUESTIONS.find((question) => question.topicId === topicId)
    if (nextQuestion) {
      setActiveQuestionId(nextQuestion.id)
    }
  }

  const renderPlayground = () => (
    <>
      <section className="ols-hero ols-panel">
        <div className="ols-hero-main">
          <div className="ols-pill">今日学习乐园</div>
          <h2>像看漫画一样学奥数，先看懂，再学会自己拆题</h2>
          <p>
            这是一套给小学生用的奥数学习系统。孩子可以从 <strong>{activeStage.badge}</strong> 开始，
            先做题，再看漫画拆题步骤，慢慢学会“先看条件、再选方法、最后算答案”。
          </p>
          <div className="ols-cloud-row">
            <span className="ols-cloud"><Trophy size={14} /> 连学 12 天</span>
            <span className="ols-cloud"><Star size={14} /> 今日已得 6 颗星星</span>
            <span className="ols-cloud"><Rocket size={14} /> 当前专题 {activeTopic.title}</span>
            <span className="ols-cloud"><BookOpen size={14} /> 已内置 {totalQuestionCount} 道示例题</span>
          </div>
        </div>
        <div className="ols-hero-side">
          <div className="ols-mascot-card">
            <div className="ols-mascot-face">🤖</div>
            <div className="ols-speech-bubble">
              <strong>拆题小助手</strong>
              <span>别怕难题，我们先把题目拆成小块，再一块块解决。</span>
            </div>
          </div>
          <div className="ols-mini-stats">
            <div className="ols-mini-stat">
              <span>今日目标</span>
              <strong>完成 3 题</strong>
            </div>
            <div className="ols-mini-stat">
              <span>当前能力</span>
              <strong>专题进阶中</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="ols-panel ols-section">
        <div className="ols-section-head">
          <div>
            <div className="ols-eyebrow">学习路径</div>
            <h3 className="ols-section-title">从启蒙到进阶的奥数路线</h3>
            <p className="ols-section-subtitle">孩子可以按站点学习，不会一下子被太难的题吓到。</p>
          </div>
        </div>
        <div className="ols-stage-row">
          {STAGES.map((stage) => (
            <button
              key={stage.id}
              type="button"
              className={`ols-stage-card ${stage.colorClass} ${stage.id === activeStageId ? 'is-active' : ''}`}
              onClick={() => handleStageChange(stage.id)}
            >
              <span className="ols-stage-badge">{stage.badge}</span>
              <strong>{stage.title}</strong>
              <p>{stage.age}</p>
              <span>{stage.mission}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="ols-grid-two">
        <div className="ols-panel ols-section">
          <div className="ols-section-head">
            <div>
              <div className="ols-eyebrow">今日任务</div>
              <h3 className="ols-section-title">先做这三步</h3>
            </div>
          </div>
          <div className="ols-task-list">
            {DAILY_MISSIONS.map((mission, index) => (
              <div className="ols-task-card" key={mission.title}>
                <div className="ols-task-badge">{index + 1}</div>
                <div>
                  <strong>{mission.title}</strong>
                  <p>{mission.desc}</p>
                </div>
                <span className="ols-reward">{mission.reward}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ols-panel ols-section">
          <div className="ols-section-head">
            <div>
              <div className="ols-eyebrow">推荐专题</div>
              <h3 className="ols-section-title">今天适合练这个</h3>
            </div>
          </div>
          <div className="ols-feature-topic">
            <div className={`ols-topic-sticker ${activeTopic.stickerClass}`}>{activeTopic.icon}</div>
            <div>
              <strong>{activeTopic.title}</strong>
              <p>{activeTopic.goal}</p>
              <div className="ols-chip-row">
                <span className="ols-chip">{activeTopic.level}</span>
                <span className="ols-chip">{getQuestionCountByTopic(activeTopic.id)} 题</span>
                <span className="ols-chip">适合 {activeStage.age}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )

  const renderLibrary = () => (
    <>
      <section className="ols-panel ols-section">
        <div className="ols-section-head">
          <div>
            <div className="ols-eyebrow">专题题库</div>
            <h3 className="ols-section-title">按专题找题练习</h3>
            <p className="ols-section-subtitle">先选学习站点，再选专题，孩子会更容易知道自己在练什么。</p>
          </div>
          <div className="ols-chip-row">
            {STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                className={`ols-chip ${stage.id === activeStageId ? 'is-active' : ''}`}
                onClick={() => handleStageChange(stage.id)}
              >
                {stage.badge}
              </button>
            ))}
          </div>
        </div>
        <div className="ols-topic-grid">
          {visibleTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className={`ols-topic-card ${topic.id === activeTopicId ? 'is-selected' : ''}`}
              onClick={() => handleTopicChange(topic.id)}
            >
              <div className={`ols-topic-sticker ${topic.stickerClass}`}>{topic.icon}</div>
              <strong>{topic.title}</strong>
              <p>{topic.goal}</p>
              <div className="ols-chip-row">
                <span className="ols-chip">{topic.level}</span>
                <span className="ols-chip">{getQuestionCountByTopic(topic.id)} 题</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="ols-panel ols-section">
        <div className="ols-section-head">
          <div>
            <div className="ols-eyebrow">代表题</div>
            <h3 className="ols-section-title">{activeTopic.title} 题目卡</h3>
          </div>
        </div>
        <div className="ols-question-list">
          {topicQuestions.map((question) => (
            <button
              key={question.id}
              type="button"
              className={`ols-question-card ${question.id === activeQuestionId ? 'is-active' : ''}`}
              onClick={() => {
                setActiveQuestionId(question.id)
                setIsAnswerVisible(false)
                setActiveView('solver')
              }}
            >
              <div className="ols-row-between">
                <strong>{question.title}</strong>
                <span className="ols-level-tag">{question.difficulty}</span>
              </div>
              <p>{question.prompt}</p>
              <div className="ols-card-footer">
                <span>{question.summary}</span>
                <ChevronRight size={18} />
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  )

  const renderSolver = () => (
    <>
      <section className="ols-grid-solver">
        <div className="ols-panel ols-section">
          <div className="ols-section-head">
            <div>
              <div className="ols-eyebrow">题目黑板</div>
              <h3 className="ols-section-title">{activeQuestion.title}</h3>
            </div>
          </div>
          <div className="ols-blackboard">
            <div className="ols-blackboard-badge">{activeTopic.title}</div>
            <p>{activeQuestion.prompt}</p>
          </div>
            <div className="ols-help-stack">
              <div className="ols-help-card is-yellow">
                <CircleHelp size={18} />
                <div>
                  <strong>先想一想</strong>
                  <p>{activeQuestion.thinking}</p>
                </div>
              </div>
              <button
                type="button"
                className={`ols-help-card ols-help-card--toggle is-blue ${isAnswerVisible ? 'is-open' : ''}`}
                onClick={() => setIsAnswerVisible((value) => !value)}
              >
                <Lightbulb size={18} />
                <div>
                  <strong>{isAnswerVisible ? '答案提示：点一下收起' : '答案提示：点一下查看'}</strong>
                  {isAnswerVisible ? <p>{activeQuestion.answer}</p> : <p>先自己想一想，准备好了再展开看提示。</p>}
                </div>
              </button>
            </div>
          </div>

        <div className="ols-panel ols-section">
          <div className="ols-section-head">
            <div>
              <div className="ols-eyebrow">漫画拆题</div>
              <h3 className="ols-section-title">一步一步讲给孩子听</h3>
            </div>
          </div>
          <div className="ols-comic-strip">
            {activeQuestion.steps.map((step, index) => (
              <div className="ols-comic-step" key={step.title}>
                <div className="ols-comic-index">{index + 1}</div>
                <div className="ols-comic-bubble">
                  <strong>{step.title}</strong>
                  <p>{step.explain}</p>
                  <span>{step.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ols-grid-two">
        <div className="ols-panel ols-section">
          <div className="ols-section-head">
            <div>
              <div className="ols-eyebrow">易错提醒</div>
              <h3 className="ols-section-title">这道题最容易错在哪</h3>
            </div>
          </div>
          <div className="ols-mistake-card">
            <Brain size={18} />
            <p>{activeQuestion.wrongTip}</p>
          </div>
        </div>

        <div className="ols-panel ols-section">
          <div className="ols-section-head">
            <div>
              <div className="ols-eyebrow">再试一题</div>
              <h3 className="ols-section-title">同类迁移练习</h3>
            </div>
          </div>
          <div className="ols-mistake-card is-green">
            <Target size={18} />
            <p>{activeQuestion.tryMore}</p>
          </div>
        </div>
      </section>
    </>
  )

  const renderGrowth = () => (
    <>
      <section className="ols-panel ols-section">
        <div className="ols-section-head">
          <div>
            <div className="ols-eyebrow">成长地图</div>
            <h3 className="ols-section-title">看看自己已经点亮了什么</h3>
          </div>
        </div>
        <div className="ols-growth-grid">
          <div className="ols-growth-card is-yellow">
            <span>🌟</span>
            <strong>连学 12 天</strong>
            <p>已经养成每天动脑的小习惯</p>
          </div>
          <div className="ols-growth-card is-blue">
            <span>🏅</span>
            <strong>点亮 4 个专题</strong>
            <p>找规律、分类比较、枚举与计数、行程问题</p>
          </div>
          <div className="ols-growth-card is-green">
            <span>🎒</span>
            <strong>今日宝箱</strong>
            <p>完成 3 个任务就能领取“拆题小达人”贴纸</p>
          </div>
        </div>
      </section>

      <section className="ols-panel ols-section">
        <div className="ols-section-head">
          <div>
            <div className="ols-eyebrow">下一站</div>
            <h3 className="ols-section-title">继续前进建议</h3>
          </div>
        </div>
        <div className="ols-next-list">
          <div className="ols-next-item">
            <strong>1. 先把 {activeTopic.title} 做到会自己讲</strong>
            <p>不只是会做题，还要能说清楚“为什么这样做”。</p>
          </div>
          <div className="ols-next-item">
            <strong>2. 每天至少看 1 次漫画拆题</strong>
            <p>遇到卡住的题，先学会拆，再回头自己做。</p>
          </div>
          <div className="ols-next-item">
            <strong>3. 练完后做 1 道同类题</strong>
            <p>能把方法迁移到新题，才是真的学会了。</p>
          </div>
        </div>
      </section>
    </>
  )

  const renderContent = () => {
    switch (activeView) {
      case 'library':
        return renderLibrary()
      case 'solver':
        return renderSolver()
      case 'growth':
        return renderGrowth()
      case 'playground':
      default:
        return renderPlayground()
    }
  }

  return (
    <div className="ols-app">
      <div className="ols-shell">
        <aside className="ols-sidebar ols-panel">
          <div className="ols-brand">
            <div className="ols-brand-top">
              <span className="ols-brand-chip">奥数星球</span>
              <span className="ols-brand-chip">漫画讲题</span>
            </div>
            <h1>小学奥数学习系统</h1>
            <p>从基础启蒙到专题进阶，让孩子边练边学会拆题。</p>
          </div>

          <div className="ols-nav-list">
            {VIEWS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`ols-nav-button ${item.key === activeView ? 'is-active' : ''}`}
                onClick={() => setActiveView(item.key)}
              >
                <span className="ols-nav-icon">{item.icon}</span>
                <span className="ols-nav-copy">
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="ols-doodle-box">
            <span>📌 小朋友提示</span>
            <p>不会做的时候别急，先点开“漫画拆题”，跟着步骤慢慢来。</p>
          </div>
        </aside>

        <main className="ols-main">
          {renderContent()}
        </main>

        <aside className="ols-rail ols-panel">
          <div className="ols-rail-card">
            <div className="ols-eyebrow">当前学习站</div>
            <strong>{activeStage.title}</strong>
            <p>{activeStage.mission}</p>
          </div>

          <div className="ols-rail-card">
            <div className="ols-eyebrow">当前专题</div>
            <div className="ols-rail-topic">
              <div className={`ols-topic-sticker ${activeTopic.stickerClass}`}>{activeTopic.icon}</div>
              <div>
                <strong>{activeTopic.title}</strong>
                <p>{activeTopic.goal}</p>
              </div>
            </div>
          </div>

          <div className="ols-rail-card">
            <div className="ols-eyebrow">今天先做</div>
            <ul className="ols-bullet-list">
              <li>选 1 个专题</li>
              <li>做 1 道代表题</li>
              <li>看 1 次漫画拆题</li>
              <li>再做 1 道同类题</li>
            </ul>
          </div>

          <div className="ols-rail-card">
            <div className="ols-eyebrow">产品骨架已包含</div>
            <ul className="ols-bullet-list">
              <li>阶段式学习路径</li>
              <li>小学奥数题库入口</li>
              <li>卡通漫画风讲题区</li>
              <li>分步拆解答案逻辑</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Component
