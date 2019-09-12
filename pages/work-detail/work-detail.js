const app = getApp();

Page({
  data: {
    textarea_padding: '15rpx',

    id: 0,
    work: {},
    loading: false,

    // 接单
    desc: '',
    desc_count: 0,

    // 接单列表
    bidding_list: [],
    choose_bindex: -1,  // 中标工厂index

    uid: 0,
    role: 0  // 用户身份
  },
  onLoad(options) {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' });
    }

    this.data.id = options.id;
    this.worksDetail();

    this.setData({role: app.user_data.role});
    if (app.user_data.role === 1) {
      this.biddingList();
    }

    this.setData({uid: app.user_data.uid});
  },
  worksDetail() {
    app.ajax('api/worksDetail', { id: this.data.id }, res => {
      app.format_img(res.pics);
      app.avatar_format(res);
      app.time_format(res, 'create_time', 'yyyy-MM-dd');

      res.flex_pad = app.null_arr(res.pics.length, 3);

      this.setData({ work: res })
    });
  },
  // 放大图片
  preview(e) {
    wx.previewImage({
      current: this.data.work.pics[e.currentTarget.dataset.index],
      urls: this.data.work.pics
    });
  },
  // 作品投票
  worksVote() {
    let work = this.data.work;
    if (!work.if_vote) {
      if (!this.data.loading) {
        wx.showModal({
          title: '提示',
          content: '确定投票？',
          success: res => {
            if (res.confirm) {
              this.data.loading = true;
              app.ajax('api/worksVote', { work_id: work.id }, res => {
                if (res) {
                  work.if_vote = true;
                  work.vote++;
                  this.setData({ work });
                }
              }, null, () => {
                this.data.loading = false;
              });
            }
          }
        });
      }
    } else {
      app.toast('您已投票给该作品');
    }
  },
  // 工厂接单
  bidding() {
    if (!this.data.loading) {
      app.confirm('是否接单？', () => {
        this.data.loading = true;

        let post = {
          work_id: this.data.id,
          desc: this.data.desc
        };
        app.ajax('api/bidding', post, res => {
          this.worksDetail();
          console.log(res, '接单成功');
        }, null, () => {
          this.data.loading = false;
        });
      });
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
    if (e.currentTarget.dataset.name === 'desc') {
      this.setData({desc_count: this.data.desc.length});
    }
  },
  // 竞标列表（接单工厂列表）
  biddingList() {
    app.ajax('api/biddingList', {work_id: this.data.id}, res => {
      app.avatar_format(res);
      for (let i = 0; i < res.length; i++) {
        if (res[i].choose === 1) {
          this.setData({choose_bindex: i});
          break;
        }
      }
      this.setData({bidding_list: res});
    });
  },
  // 选择接单工厂
  chooseFactory(e) {
    if (!this.data.loading) {
      app.confirm('确认选择工厂', () => {
        this.data.loading = true;

        let id = e.currentTarget.dataset.id;
        app.ajax('api/chooseFactory', {bidding_id: id}, () => {
          app.modal('已选择工厂', () => {
            this.biddingList();
          });
        });
      });
    }
  }
});