const subscriptionModel = require('../models/subscriptionModel');

// Danh sách các gói thành viên
const getPlans = async (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Gói Miễn Phí',
      price: 0,
      period: 'Vĩnh viễn',
      features: [
        'Nghe nhạc chất lượng tiêu chuẩn (128kbps)',
        'Tạo playlist cá nhân',
        'Có kèm quảng cáo',
        'Không tải nhạc ngoại tuyến'
      ],
      isPopular: false
    },
    {
      id: 'premium_month',
      plan: 'premium',
      name: 'Gói VIP Tháng',
      price: 49000,
      period: '1 tháng',
      features: [
        'Âm thanh chất lượng cao Lossless 320kbps',
        'Hoàn toàn không quảng cáo',
        'Mở khóa tất cả bài hát độc quyền',
        'Huy hiệu VIP trên trang cá nhân',
        'Hỗ trợ nghe nhạc không giới hạn'
      ],
      isPopular: true
    },
    {
      id: 'premium_year',
      plan: 'premium',
      name: 'Gói VIP Năm (Siêu tiết kiệm)',
      price: 499000,
      period: '1 năm',
      features: [
        'Toàn bộ đặc quyền của gói VIP Tháng',
        'Tiết kiệm hơn 20% chi phí',
        'Ưu tiên trải nghiệm tính năng thử nghiệm',
        'Huy hiệu VIP Kim Cương'
      ],
      isPopular: false
    }
  ];

  res.json(plans);
};

// Lấy thông tin gói cước của người dùng hiện tại
const getMySubscription = async (req, res) => {
  try {
    const sub = await subscriptionModel.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!sub) {
      return res.json({
        plan: 'free',
        status: 'active',
        isPremium: false,
        message: 'Bạn đang sử dụng gói Miễn phí'
      });
    }

    const isExpired = sub.endDate && new Date(sub.endDate) < new Date();
    res.json({
      ...sub.toObject(),
      isPremium: sub.plan === 'premium' && !isExpired
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nâng cấp gói cước
const upgradeSubscription = async (req, res) => {
  try {
    const { plan = 'premium', months = 1, provider = 'demo' } = req.body;
    const userId = req.user._id;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(months));

    const subId = `subscription_${Date.now()}`;

    // Hủy kích hoạt gói cũ nếu có
    await subscriptionModel.updateMany(
      { userId, status: 'active' },
      { $set: { status: 'cancelled' } }
    );

    const newSub = new subscriptionModel({
      _id: subId,
      userId,
      plan,
      status: 'active',
      startDate,
      endDate,
      provider
    });

    const saved = await newSub.save();

    res.status(201).json({
      message: 'Nâng cấp gói thành công!',
      subscription: saved,
      isPremium: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Lấy tất cả subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionModel.find()
      .populate('userId', 'username email avatar')
      .sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlans,
  getMySubscription,
  upgradeSubscription,
  getAllSubscriptions
};

