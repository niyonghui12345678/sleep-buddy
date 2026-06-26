const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'sleepbuddy_data';

function defaults() {
  return {
    names: { A: 'NYH', B: 'SST' },
    targets: {
      A: { sleep: '23:00', wake: '07:00' },
      B: { sleep: '23:00', wake: '07:00' }
    },
    points: { A: 0, B: 0 },
    recs: {},
    shop: [
      { id: 1, e: '🧋', n: '请喝奶茶', d: '对方请你喝一杯奶茶', c: 7 },
      { id: 2, e: '🎬', n: '选电影之夜', d: '今晚你来选电影', c: 5 },
      { id: 3, e: '🏠', n: '免做家务', d: '免做一次家务活', c: 10 },
      { id: 4, e: '💆', n: '按摩15分钟', d: '对方给你按摩放松', c: 8 },
      { id: 5, e: '🍰', n: '请吃甜品', d: '对方请你吃一份甜品', c: 5 },
      { id: 6, e: '💤', n: '赖床券', d: '周末多睡1小时不被叫醒', c: 6 },
      { id: 7, e: '📱', n: '免打扰1小时', d: '1小时不被打扰的自由', c: 3 },
      { id: 8, e: '🍽️', n: '指定晚餐', d: '你来指定今晚吃什么', c: 8 }
    ],
    redeems: [],
    nextShopId: 9,
    eggs: {
      shards: { A: 0, B: 0 },
      freePass: { A: 0, B: 0 },
      backpack: [],
      weeklyEgg: null,
      lastDailyEgg: { A: null, B: null },
      lastWeeklyEgg: null,
      albumMarked: { A: false, B: false },
      voiceMarked: { A: false, B: false },
      unlockMonth: null,
      wallpaperCount: 0
    }
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      let data = await redis.get(KEY);
      if (!data) {
        data = defaults();
        await redis.set(KEY, JSON.stringify(data));
      }
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      await redis.set(KEY, JSON.stringify(req.body));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
