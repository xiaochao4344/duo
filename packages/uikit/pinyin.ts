// A small pinyin composition engine for the on-screen keyboard: greedy
// syllable segmentation over the typed letters, phrase candidates for the
// whole string first, then per-syllable character candidates. The data is a
// starter set of common syllables and everyday phrases - enough for the
// lines our productions type - and grows by editing the tables, nowhere else.

/** Valid pinyin syllables (no tone marks), for segmentation. */
const SYLLABLES = new Set(
  (
    'a ai an ang ao ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu ' +
    'ca cai can cang cao ce cen ceng cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ci cong cou cu cuan cui cun cuo ' +
    'da dai dan dang dao de dei den deng di dian diao die ding diu dong dou du duan dui dun duo ' +
    'e ei en eng er fa fan fang fei fen feng fo fou fu ' +
    'ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ' +
    'ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ' +
    'ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun ' +
    'ka kai kan kang kao ke ken keng kong kou ku kua kuai kuan kuang kui kun kuo ' +
    'la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu long lou lu luan lun luo lv lve ' +
    'ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu ' +
    'na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nun nuo nv nve ' +
    'o ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu ' +
    'qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun ' +
    'ran rang rao re ren reng ri rong rou ru ruan rui run ruo ' +
    'sa sai san sang sao se sen seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo si song sou su suan sui sun suo ' +
    'ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo ' +
    'wa wai wan wang wei wen weng wo wu ' +
    'xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun ' +
    'ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun ' +
    'za zai zan zang zao ze zei zen zeng zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo zi zong zou zu zuan zui zun zuo'
  ).split(' ')
)

/** First character candidates per syllable, most common first. */
const CHARS: Record<string, string> = {
  a: '啊阿', ai: '爱哎唉', an: '安按暗', ang: '昂', ao: '奥傲',
  ba: '吧把爸八', bai: '白百摆', ban: '办半班般', bang: '帮棒旁', bao: '包报宝抱', bei: '被北杯背', ben: '本笨', beng: '蹦崩', bi: '比必笔避', bian: '边变便遍', biao: '表标', bie: '别憋', bin: '宾滨', bing: '并病冰饼', bo: '波播博伯', bu: '不步布部补',
  ca: '擦', cai: '才菜彩财', can: '参残灿', cang: '藏仓', cao: '草操曹', ce: '测侧策', cen: '岑', ceng: '曾层', cha: '查茶差插', chai: '拆柴', chan: '产颤缠', chang: '常长场唱', chao: '超朝潮吵', che: '车彻撤', chen: '陈晨沉衬', cheng: '成城程承', chi: '吃迟池持', chong: '冲重虫宠', chou: '抽愁仇丑', chu: '出初除楚', chuan: '传穿船串', chuang: '窗创床闯', chui: '吹垂锤', chun: '春纯唇', chuo: '戳绰',
  ci: '次此词辞', cong: '从聪匆', cou: '凑', cu: '粗促醋', cuan: '窜', cui: '催脆翠', cun: '存村寸', cuo: '错搓',
  da: '大打达答', dai: '带待代袋戴', dan: '但单蛋担', dang: '当党挡荡', dao: '到道倒刀', de: '的得德地', dei: '得', deng: '等灯登邓', di: '地第低底弟', dian: '点电店典垫', diao: '掉调钓吊', die: '跌爹叠', ding: '定顶丁钉', diu: '丢', dong: '动东懂冬', dou: '都斗豆逗', du: '读度独堵', duan: '段断短端', dui: '对队堆兑', dun: '顿蹲敦', duo: '多朵躲夺',
  e: '饿额鹅', ei: '诶', en: '恩嗯', eng: '嗯', er: '而二儿耳',
  fa: '发法罚', fan: '反饭烦翻', fang: '放房方访', fei: '非飞费废', fen: '分份粉纷', feng: '风封丰疯', fo: '佛', fou: '否', fu: '副服富付父',
  ga: '嘎', gai: '改概该盖', gan: '敢干感赶', gang: '刚岗港钢', gao: '高告搞稿', ge: '个各哥歌', gei: '给', gen: '跟根', geng: '更耕耿', gong: '工公共功', gou: '够狗购构', gu: '故古股顾', gua: '挂刮瓜', guai: '怪乖拐', guan: '关管惯观', guang: '光广逛', gui: '贵鬼规柜', gun: '滚棍', guo: '过国果锅',
  ha: '哈蛤', hai: '还海害孩', han: '含喊汉汗', hang: '行航杭', hao: '好号浩耗', he: '和何合河', hei: '黑嘿', hen: '很狠恨', heng: '横衡恒', hong: '红宏轰哄', hou: '后候厚猴', hu: '户护呼胡湖', hua: '话花华画', huai: '坏怀淮', huan: '换还欢缓', huang: '黄慌晃皇', hui: '会回灰汇', hun: '混婚昏魂', huo: '或活火货获',
  ji: '几机记己急', jia: '家加假价甲', jian: '见间件建简', jiang: '将讲江降', jiao: '叫角教交', jie: '接姐街解节', jin: '今近金进紧', jing: '京经精静境', jiong: '窘', jiu: '就九久酒救', ju: '局举据句具', juan: '卷捐倦', jue: '觉决绝', jun: '军君均俊',
  ka: '卡咖喀', kai: '开凯楷', kan: '看砍刊', kang: '康抗扛', kao: '靠考烤', ke: '可课客科', ken: '肯啃恳', keng: '坑', kong: '空孔控恐', kou: '口扣寇', ku: '苦库哭裤', kua: '夸跨垮', kuai: '快块筷', kuan: '宽款', kuang: '况框狂', kui: '亏愧', kun: '困捆昆', kuo: '扩阔',
  la: '啦拉辣腊', lai: '来赖莱', lan: '蓝烂拦懒', lang: '浪朗郎狼', lao: '老劳牢捞', le: '了乐勒', lei: '累类泪雷', leng: '冷棱', li: '里理力立', lia: '俩', lian: '连脸练联', liang: '两亮量良', liao: '了聊料疗', lie: '列烈裂猎', lin: '林临淋邻', ling: '零领令灵', liu: '六留流刘', long: '龙隆笼', lou: '楼漏露娄', lu: '路录陆露', luan: '乱卵', lun: '论轮伦', luo: '落罗洛络',
  ma: '吗妈马骂', mai: '买卖麦迈', man: '满慢漫蛮', mang: '忙茫盲芒', mao: '毛猫冒帽', me: '么', mei: '没每美妹', men: '们门闷', meng: '梦猛蒙盟', mi: '米密秘迷', mian: '面免眠棉', miao: '秒描苗妙', mie: '灭蔑', min: '民敏闽', ming: '明名命鸣', miu: '谬', mo: '莫摸膜末', mou: '某谋眸', mu: '目木幕墓',
  na: '那拿哪纳', nai: '奶乃耐奈', nan: '南难男', nang: '囊', nao: '闹脑恼挠', ne: '呢呐', nei: '内馁', nen: '嫩', neng: '能', ni: '你呢尼逆', nian: '年念黏粘', niang: '娘酿', niao: '鸟尿袅', nie: '捏聂孽', nin: '您', ning: '宁凝拧', niu: '牛扭纽拗', nong: '弄农浓', nou: '耨', nu: '努怒奴', nuan: '暖', nuo: '诺挪懦',
  o: '哦噢', ou: '偶呕殴',
  pa: '怕爬趴啪', pai: '排拍派牌', pan: '盘判盼攀', pang: '旁胖庞', pao: '跑泡炮抛', pei: '配陪赔佩', pen: '盆喷', peng: '碰朋鹏捧', pi: '批皮疲啤', pian: '片篇偏骗', piao: '票飘漂瓢', pie: '撇瞥', pin: '品拼贫频', ping: '平评瓶凭', po: '破坡泼婆', pou: '剖', pu: '普铺朴瀑',
  qi: '起其七期', qia: '恰卡掐', qian: '前钱千签', qiang: '强墙抢腔', qiao: '桥巧悄敲', qie: '切且怯窃', qin: '亲勤琴寝', qing: '请清情青', qiong: '穷琼', qiu: '求球秋丘', qu: '去区取曲', quan: '全权圈劝', que: '却缺确雀', qun: '群裙',
  ran: '然燃染', rang: '让嚷壤', rao: '绕扰饶', re: '热惹', ren: '人认仁忍', reng: '仍扔', ri: '日', rong: '容融荣绒', rou: '肉柔揉', ru: '如入儒辱', ruan: '软阮', rui: '瑞锐睿', run: '润闰', ruo: '若弱',
  sa: '撒洒萨', sai: '赛塞腮', san: '三散伞', sang: '丧桑嗓', sao: '扫嫂骚', se: '色塞瑟', sen: '森', seng: '僧', sha: '啥沙杀傻', shai: '晒筛', shan: '山善删闪', shang: '上商伤尚', shao: '少烧绍勺', she: '社设舍涉', shen: '什深身神', sheng: '生声省剩', shi: '是时十事', shou: '手受收守', shu: '书数树属', shua: '刷耍', shuai: '帅摔甩衰', shuan: '栓拴闩', shuang: '双爽霜', shui: '睡水税谁', shun: '顺瞬舜', shuo: '说硕烁',
  si: '四思死司', song: '送松宋颂', sou: '搜艘馊', su: '苏诉速俗', suan: '算酸蒜', sui: '岁随碎虽', sun: '孙损笋', suo: '所锁缩索',
  ta: '他她它塔', tai: '太台抬态', tan: '谈坦探叹', tang: '躺趟烫汤', tao: '套逃桃讨', te: '特忒', teng: '疼腾藤', ti: '提题替梯', tian: '天田填甜', tiao: '条调跳挑', tie: '贴铁帖', ting: '听停厅挺', tong: '同通痛统', tou: '头透偷投', tu: '土图突途', tuan: '团湍', tui: '退推腿颓', tun: '吞屯臀', tuo: '拖脱妥拓',
  wa: '娃瓦哇袜', wai: '外歪', wan: '晚完玩万', wang: '王往忘网', wei: '为位未味', wen: '问文闻稳', weng: '翁瓮', wo: '我握窝沃', wu: '无五屋物',
  xi: '西希息喜', xia: '下夏吓虾', xian: '先现线县', xiang: '想向像香', xiao: '小笑校消', xie: '些写谢鞋', xin: '新心信辛', xing: '行性星醒', xiong: '兄熊雄胸', xiu: '修秀袖绣', xu: '需须许续', xuan: '选旋悬宣', xue: '学雪血穴', xun: '寻巡询训',
  ya: '呀牙亚压', yan: '眼言严烟', yang: '样阳养羊', yao: '要药摇腰', ye: '也夜叶爷', yi: '一以已亿', yin: '因音银引', ying: '应影英营', yo: '哟', yong: '用永勇拥', you: '有又右游', yu: '于与鱼雨', yuan: '远元员原', yue: '月越约阅', yun: '云运晕允',
  za: '杂砸咋', zai: '在再载灾', zan: '赞咱攒', zang: '脏葬藏', zao: '早造遭燥', ze: '则责择', zei: '贼', zen: '怎谮', zeng: '增曾赠', zha: '扎炸渣眨', zhai: '摘窄债斋', zhan: '站展战占', zhang: '张章长涨', zhao: '找着照招', zhe: '这着折遮', zhen: '真针阵震', zheng: '正整争证', zhi: '只之知至', zhong: '中种重钟', zhou: '周州皱粥', zhu: '住主猪祝', zhuan: '转专赚砖', zhuang: '装状撞庄', zhui: '追坠缀', zhun: '准谆', zhuo: '桌捉卓灼',
  zi: '子自字紫', zong: '总宗纵踪', zou: '走揍邹', zu: '组足租族', zuan: '钻攥', zui: '最嘴醉罪', zun: '尊遵', zuo: '做作坐左'
}

/** Whole-string phrase candidates: full pinyin (no separators) to phrases. */
const PHRASES: Record<string, string[]> = {
  nihao: ['你好'], nihaoma: ['你好吗'], wo: ['我'], women: ['我们'], nimen: ['你们'],
  haode: ['好的'], hao: ['好'], xiexie: ['谢谢'], meishi: ['没事'], zhidao: ['知道'], zhidaole: ['知道了'],
  shoudao: ['收到'], mingbai: ['明白'], keyi: ['可以'], bukeyi: ['不可以'], meiyou: ['没有'], meiguanxi: ['没关系'],
  duibuqi: ['对不起'], buyong: ['不用'], buyongxie: ['不用谢'], zaijian: ['再见'], wanans: ['晚安'], wanan: ['晚安'],
  zaoshanghao: ['早上好'], xiawuhao: ['下午好'], wanshanghao: ['晚上好'],
  mingtianjian: ['明天见'], mingtian: ['明天'], jintian: ['今天'], zuotian: ['昨天'], xianzai: ['现在'],
  dengyixia: ['等一下'], dengxia: ['等下'], mashang: ['马上'], mashangdao: ['马上到'], daole: ['到了'],
  wodaole: ['我到了'], wozaidao: ['我快到了'], kuailaile: ['快来了'], lai: ['来'], qu: ['去'], qunar: ['去哪儿'],
  huiqu: ['回去'], huilaile: ['回来了'], huijia: ['回家'], chumen: ['出门'], zaijia: ['在家'], zaiwaimian: ['在外面'],
  chifan: ['吃饭'], chifanma: ['吃饭吗'], chiguo: ['吃过'], xiaolou: ['下楼'], shanglou: ['上楼'],
  kaihui: ['开会'], shangban: ['上班'], xiaban: ['下班'], jiaban: ['加班'], qingjia: ['请假'],
  shuijiao: ['睡觉'], shuibuzhao: ['睡不着'], zaodianshui: ['早点睡'], zaodianxiu: ['早点休息'],
  men: ['门'], mensuo: ['门锁'], kaiqiaole: ['开门'], jinmen: ['进门'], waimian: ['外面'], limian: ['里面'],
  shouji: ['手机'], diannao: ['电脑'], dianshi: ['电视'], wode: ['我的'], nide: ['你的'], tade: ['他的'],
  shenme: ['什么'], shenmeshihou: ['什么时候'], weishenme: ['为什么'], zenme: ['怎么'], zenmeyang: ['怎么样'],
  nali: ['哪里'], nage: ['那个'], zhege: ['这个'], zhende: ['真的'], zhendejia: [], zhenjia: [],
  kanka: [], kankan: ['看看'], gansha: ['干啥'], ganma: ['干嘛'], youdian: ['有点'], yidian: ['一点'],
  xiaoxin: ['小心'], zhuyi: ['注意'], bangwo: ['帮我'], bangmang: ['帮忙'], mafan: ['麻烦'],
  dianhua: ['电话'], weixin: ['微信'], xiaoxi: ['消息'], huifu: ['回复'], huige: [],
  dakaile: ['打开了'], guanbile: ['关了'], guanmen: ['关门'], denglule: ['登录了'], yichang: ['异常'],
  lubo: [], shangxian: ['上线'], lixian: ['离线'], shuaxin: ['刷新'], tianjia: ['添加'],
  weizhidao: [], buzhidao: ['不知道'], buhui: ['不会'], buneng: ['不能'], buyao: ['不要'],
  yijing: ['已经'], haiyou: ['还有'], haizai: ['还在'], haishi: ['还是'], haixing: ['还行'],
  gongsi: ['公司'], xuexiao: ['学校'], yiyuan: ['医院'], jia: ['家'], luke: [],
  lou: ['楼'], louxi: [], louxia: ['楼下'], loushang: ['楼上'], menkou: ['门口'],
  tianshang: [], dianshang: [], wanshang: ['晚上'], zaoshang: ['早上'], zhongwu: ['中午'],
  shijian: ['时间'], jidian: ['几点'], jidianle: ['几点了'], xiaoshi: ['小时'], fenzhong: ['分钟'],
  xiaoqu: ['小区'], daye: [], wuye: ['物业'], baoan: ['保安'], kuaidi: ['快递'], waimai: ['外卖'],
  deng: ['等'], dengwo: ['等我'], dengni: ['等你'], bieji: ['别急'], biepa: ['别怕'],
  yihuier: ['一会儿'], yihui: ['一会'], mashangjiu: [], sale: [],
  anquan: ['安全'], fangxin: ['放心'], kending: ['肯定'], yiding: ['一定'], dagai: ['大概'],
  taihaole: ['太好了'], taihaola: [], bucai: [], bucuo: ['不错'], zhenshi: ['真是'],
  bieshuole: ['别说了'], biell: [], tingdao: ['听到'], tingjian: ['听见'], kandao: ['看到'], kanjian: ['看见'],
  youshengyin: ['有声音'], meshengyin: [], shengyin: ['声音'], yingzi: ['影子'], beiying: ['背影']
}

// Clean the table of accidental non-pinyin keys.
for (const k of Object.keys(PHRASES)) {
  if (!/^[a-z]+$/.test(k) || !PHRASES[k]!.length) delete PHRASES[k]
}

/** Greedy longest-match segmentation of the letter run into syllables. */
export function segment(letters: string): string[] {
  const out: string[] = []
  let rest = letters
  while (rest.length) {
    let hit = ''
    for (let n = Math.min(6, rest.length); n >= 1; n--) {
      const head = rest.slice(0, n)
      if (SYLLABLES.has(head)) {
        hit = head
        break
      }
    }
    if (!hit) {
      // Not a syllable start: keep the remainder as one raw tail.
      out.push(rest)
      break
    }
    out.push(hit)
    rest = rest.slice(hit.length)
  }
  return out
}

export type Candidate = {
  text: string
  /** How many composing letters choosing this candidate consumes. */
  take: number
}

export type Candidates = {
  /** The segmented syllables, for the composing display. */
  parts: string[]
  /** Candidates, best first; the raw letters always come last. */
  list: Candidate[]
}

/** Candidates for a composing letter run. */
export function candidates(letters: string): Candidates {
  const parts = segment(letters)
  const list: Candidate[] = []
  const seen = new Set<string>()
  const push = (text: string, take: number) => {
    if (seen.has(text)) return
    seen.add(text)
    list.push({ text, take })
  }
  const phrase = PHRASES[letters]
  if (phrase) for (const p of phrase) push(p, letters.length)
  if (parts.length > 1) {
    // A multi-syllable run also reads as its first syllable's top characters,
    // so the person can commit piecemeal the way a real IME allows.
    const first = CHARS[parts[0]!]
    if (first) for (const c of first.slice(0, 5).split('')) push(c, parts[0]!.length)
  } else {
    const chars = CHARS[parts[0]!]
    if (chars) for (const c of chars.split('')) push(c, letters.length)
  }
  push(letters, letters.length)
  return { parts, list }
}
